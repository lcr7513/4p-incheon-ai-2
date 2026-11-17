import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INCHEON_20_GOV_DATASETS } from './src/data/incheonGovDatasets.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = (process.env.GEMINI_MODEL && !process.env.GEMINI_MODEL.includes('2.5'))
  ? process.env.GEMINI_MODEL
  : 'gemini-3.8-flash';

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const aiRequestLog = new Map<string, { count: number; resetAt: number }>();
app.use('/api/gemini', (req, res, next) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const current = aiRequestLog.get(key);
  if (!current || current.resetAt <= now) {
    aiRequestLog.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return next();
  }
  if (current.count >= 20) {
    return res.status(429).json({ success: false, error: 'AI 요청 한도를 초과했습니다. 10분 후 다시 시도하세요.' });
  }
  current.count += 1;
  next();
});

const safeText = (value: unknown, maxLength = 4000) =>
  (typeof value === 'string' ? value : '').trim().slice(0, maxLength);

// Lazy-initialize Gemini SDK
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({ status: 'ok', hasGeminiKey: hasKey, model: hasKey ? GEMINI_MODEL : null });
});

// AirKorea (data.go.kr) Open API Proxy & Educational Simulator
app.post('/api/airkorea-proxy', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const stationName = safeText(req.body?.stationName, 50) || '송도';
  const dataTerm = safeText(req.body?.dataTerm, 20) || 'DAILY';
  const isMock = Boolean(req.body?.isMock);
  const rawKey = typeof req.body?.serviceKey === 'string' ? req.body.serviceKey.trim() : '';

  // Generate realistic Incheon station mock response matching exact AirKorea schema
  const generateMockResponse = (station: string) => {
    const now = new Date();
    const items = [];
    const basePm25 = station === '송도' ? 18 : station === '신흥동' ? 27 : station === '부평' ? 24 : station === '강화' ? 14 : 21;
    const basePm10 = Math.round(basePm25 * 1.8);

    for (let i = 0; i < 10; i++) {
      const itemTime = new Date(now.getTime() - i * 60 * 60 * 1000);
      const year = itemTime.getFullYear();
      const month = String(itemTime.getMonth() + 1).padStart(2, '0');
      const day = String(itemTime.getDate()).padStart(2, '0');
      const hour = String(itemTime.getHours()).padStart(2, '0');
      const timeStr = `${year}-${month}-${day} ${hour}:00`;
      
      const variance = (i % 3 === 0 ? 3 : i % 2 === 0 ? -2 : 1);
      const pm25 = Math.max(8, basePm25 + variance);
      const pm10 = Math.max(15, basePm10 + variance * 2);
      const khaiVal = Math.min(150, Math.round(pm25 * 2.8 + 15));
      const grade = khaiVal <= 50 ? '1' : khaiVal <= 100 ? '2' : khaiVal <= 250 ? '3' : '4';

      items.push({
        dataTime: timeStr,
        stationName: station,
        so2Value: '0.003',
        coValue: '0.5',
        o3Value: '0.027',
        no2Value: '0.019',
        pm10Value: String(pm10),
        pm10Value24: String(pm10 - 2),
        pm25Value: String(pm25),
        pm25Value24: String(pm25 - 1),
        khaiValue: String(khaiVal),
        khaiGrade: grade,
        so2Grade: '1',
        coGrade: '1',
        o3Grade: '1',
        no2Grade: '1',
        pm10Grade: pm10 <= 30 ? '1' : pm10 <= 80 ? '2' : '3',
        pm25Grade: pm25 <= 15 ? '1' : pm25 <= 35 ? '2' : '3',
      });
    }

    return {
      response: {
        header: {
          resultCode: '00',
          resultMsg: 'NORMAL_SERVICE',
        },
        body: {
          items,
          totalCount: 10,
          numOfRows: 10,
          pageNo: 1,
        },
      },
    };
  };

  // If mock mode or no service key provided, return structured educational simulator data
  if (isMock || !rawKey) {
    const mockData = generateMockResponse(stationName);
    const durationMs = Date.now() - startTime;
    return res.json({
      success: true,
      isMock: true,
      statusCode: 200,
      durationMs,
      stationName,
      message: '공공데이터포털 에어코리아 실시간 표준 규격 모의 시뮬레이터 응답입니다.',
      requestUrl: `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=${encodeURIComponent(stationName)}&dataTerm=${dataTerm}&ver=1.0`,
      data: mockData,
    });
  }

  // Real data.go.kr API call with automatic decoding normalization to avoid double-encoding errors
  try {
    let cleanKey = rawKey;
    try {
      cleanKey = decodeURIComponent(rawKey);
    } catch {
      cleanKey = rawKey;
    }

    const apiUrl = new URL('https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty');
    apiUrl.searchParams.set('serviceKey', cleanKey);
    apiUrl.searchParams.set('returnType', 'json');
    apiUrl.searchParams.set('numOfRows', '10');
    apiUrl.searchParams.set('pageNo', '1');
    apiUrl.searchParams.set('stationName', stationName);
    apiUrl.searchParams.set('dataTerm', dataTerm);
    apiUrl.searchParams.set('ver', '1.0');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/xml, */*',
        'User-Agent': 'Incheon-4P-Edu-Applet',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const durationMs = Date.now() - startTime;
    const responseText = await apiResponse.text();

    // Check if response is valid JSON
    let parsedData: any = null;
    let isJson = false;
    try {
      parsedData = JSON.parse(responseText);
      isJson = true;
    } catch {
      isJson = false;
    }

    if (isJson) {
      // Check if government returned an OpenAPI error header
      const openApiError = parsedData?.OpenAPI_ServiceResponse?.cmmMsgHeader;
      if (openApiError) {
        return res.json({
          success: false,
          isMock: false,
          statusCode: apiResponse.status,
          durationMs,
          stationName,
          error: `공공데이터포털 인증 오류: ${openApiError.returnAuthMsg || openApiError.errMsg || '인증키 미등록'} (사유코드: ${openApiError.returnReasonCode || '30'})`,
          hint: '인증키가 공공데이터포털 서버에 동기화 중이거나(신청 후 약 1시간 소요) 잘못 입력되었을 수 있습니다. 키가 승인되기 전에는 [모의 응답 시뮬레이터]로 먼저 실습을 진행하세요!',
          data: parsedData,
        });
      }

      // Check if government returned an internal error message inside response header
      const resultCode = parsedData?.response?.header?.resultCode;
      const resultMsg = parsedData?.response?.header?.resultMsg;

      if (resultCode && resultCode !== '00') {
        return res.json({
          success: false,
          isMock: false,
          statusCode: 200,
          durationMs,
          stationName,
          error: `공공데이터포털 오류 [${resultCode}]: ${resultMsg}`,
          hint: '인증키가 공공데이터포털 서버에 동기화 중이거나(신청 후 1~2시간 소요) 잘못 입력되었을 수 있습니다. [모의 응답 시뮬레이터]로 먼저 수업을 진행할 수 있습니다.',
          data: parsedData,
        });
      }

      return res.json({
        success: true,
        isMock: false,
        statusCode: apiResponse.status,
        durationMs,
        stationName,
        message: '정부 공공데이터포털(data.go.kr) 에어코리아 정식 라이브 응답 수신 성공',
        data: parsedData,
      });
    } else {
      // Response was XML (common for ServiceKey errors)
      let extractedError = '공공데이터포털 인증키 오류 (XML 응답 반환됨)';
      if (responseText.includes('SERVICE_KEY_IS_NOT_REGISTERED')) {
        extractedError = '등록되지 않은 인증키이거나 승인 후 서버 동기화 대기 중(1~2시간 소요)입니다.';
      } else if (responseText.includes('LIMITED_NUMBER_OF_SERVICE_REQUESTS')) {
        extractedError = '해당 인증키의 하루 호출 한도(1,000회)를 초과하였습니다.';
      } else if (responseText.includes('DEADLINE_HAS_EXPIRED')) {
        extractedError = '해당 인증키의 유효기간이 만료되었습니다.';
      }

      return res.json({
        success: false,
        isMock: false,
        statusCode: apiResponse.status,
        durationMs,
        stationName,
        error: extractedError,
        rawXmlSnippet: responseText.slice(0, 500),
        hint: '공공데이터포털에서 [한국환경공단 에어코리아 대기오염정보] 활용신청 승인 후 약 1시간이 지나야 공공데이터 게이트웨이에 등록됩니다. 키가 승인되기 전에는 [모의 응답 시뮬레이터]를 켜서 실습하세요!',
      });
    }
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error('AirKorea proxy fetch error:', err);
    return res.json({
      success: false,
      isMock: false,
      statusCode: 504,
      durationMs,
      stationName,
      error: `정부 API 게이트웨이 통신 시간 초과 또는 네트워크 오류: ${err.message}`,
      hint: '정부 공공데이터포털 서버 점검 중이거나 응답이 지연되고 있습니다. 상단의 [모의 응답 시뮬레이터]를 선택하여 수업을 계속 진행하세요.',
    });
  }
});

// Universal Incheon Public Datasets (20 Recommended Datasets) Proxy & Educational Simulator
app.post('/api/gov-dataset-proxy', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const datasetId = safeText(req.body?.datasetId, 80) || 'kosis-population-age';
  const district = safeText(req.body?.district, 80) || '연수구';
  const detail = safeText(req.body?.detail, 100);
  const isMock = Boolean(req.body?.isMock);
  const rawKey = typeof req.body?.serviceKey === 'string' ? req.body.serviceKey.trim() : '';

  const datasetDef = INCHEON_20_GOV_DATASETS.find((d) => d.id === datasetId) || INCHEON_20_GOV_DATASETS[0];

  // If mock mode or no serviceKey, return the official-structured simulator response
  if (isMock || !rawKey) {
    const mockData = datasetDef.generateMockData({ district, detail });
    const durationMs = Date.now() - startTime;
    return res.json({
      success: true,
      isMock: true,
      statusCode: 200,
      durationMs,
      datasetId: datasetDef.id,
      title: datasetDef.title,
      agency: datasetDef.agency,
      district,
      message: `대한민국 정부 공공데이터(${datasetDef.agency}) 표준 규격 모의 시뮬레이터 응답입니다.`,
      requestUrl: `${datasetDef.apiEndpoint}?district=${encodeURIComponent(district)}&returnType=json`,
      citation: datasetDef.sample4PCitation({ district, detail }),
      data: mockData,
    });
  }

  // Attempt real API call with normalized serviceKey
  try {
    let cleanKey = rawKey;
    try {
      cleanKey = decodeURIComponent(rawKey);
    } catch {
      cleanKey = rawKey;
    }

    const apiUrl = new URL(datasetDef.apiEndpoint);
    apiUrl.searchParams.set('serviceKey', cleanKey);
    apiUrl.searchParams.set('returnType', 'json');
    apiUrl.searchParams.set('numOfRows', '10');
    apiUrl.searchParams.set('pageNo', '1');
    if (district) {
      apiUrl.searchParams.set('district', district);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/xml, */*',
        'User-Agent': 'Incheon-4P-Edu-Applet',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const durationMs = Date.now() - startTime;
    const responseText = await apiResponse.text();

    let parsedData: any = null;
    let isJson = false;
    try {
      parsedData = JSON.parse(responseText);
      isJson = true;
    } catch {
      isJson = false;
    }

    if (isJson) {
      const openApiError = parsedData?.OpenAPI_ServiceResponse?.cmmMsgHeader;
      if (openApiError) {
        return res.json({
          success: false,
          isMock: false,
          statusCode: apiResponse.status,
          durationMs,
          datasetId: datasetDef.id,
          title: datasetDef.title,
          agency: datasetDef.agency,
          district,
          error: `공공데이터포털 인증 오류: ${openApiError.returnAuthMsg || openApiError.errMsg || '인증키 미등록'}`,
          hint: '해당 API에 대한 활용신청이 승인되었는지 확인하세요. 승인 전에는 [모의 응답 시뮬레이터]로 먼저 실습을 진행하세요!',
          data: parsedData,
          citation: datasetDef.sample4PCitation({ district, detail }),
        });
      }

      return res.json({
        success: true,
        isMock: false,
        statusCode: apiResponse.status,
        durationMs,
        datasetId: datasetDef.id,
        title: datasetDef.title,
        agency: datasetDef.agency,
        district,
        message: `정부 공공데이터(${datasetDef.agency}) 라이브 응답 수신 성공`,
        requestUrl: apiUrl.toString().replace(cleanKey, '***KEY_MASKED***'),
        citation: datasetDef.sample4PCitation({ district, detail }),
        data: parsedData,
      });
    } else {
      return res.json({
        success: false,
        isMock: false,
        statusCode: apiResponse.status,
        durationMs,
        datasetId: datasetDef.id,
        title: datasetDef.title,
        agency: datasetDef.agency,
        district,
        error: '공공데이터포털 XML 응답 수신 (인증키 미승인 또는 파라미터 오류)',
        rawXmlSnippet: responseText.slice(0, 500),
        hint: '공공데이터포털에서 해당 데이터셋 활용신청 후 1~2시간 승인 대기가 필요합니다. [모의 응답 시뮬레이터]를 활용해 수업을 계속 진행하세요.',
        citation: datasetDef.sample4PCitation({ district, detail }),
      });
    }
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return res.json({
      success: false,
      isMock: false,
      statusCode: 504,
      durationMs,
      datasetId: datasetDef.id,
      title: datasetDef.title,
      agency: datasetDef.agency,
      district,
      error: `정부 게이트웨이 통신 시간 초과: ${err.message}`,
      hint: '네트워크 상태를 확인하시거나 상단의 [모의 응답 시뮬레이터]를 켜서 실습하세요.',
      citation: datasetDef.sample4PCitation({ district, detail }),
    });
  }
});

// AI 4P Question Evaluation Endpoint
app.post('/api/gemini/evaluate', async (req: Request, res: Response) => {
  try {
    const labName = safeText(req.body?.labName, 100);
    const question = safeText(req.body?.question, 1000);
    const phenomenon = safeText(req.body?.phenomenon);
    const problem = safeText(req.body?.problem);
    const project = safeText(req.body?.project);
    const practice = safeText(req.body?.practice);
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback heuristic evaluation when no API key configured
      const fallbackResult = generateHeuristicEvaluation(labName, question, phenomenon, problem, project, practice);
      return res.json({ success: true, isFallback: true, data: fallbackResult });
    }

    const prompt = `
당신은 대한민국 교육청 '읽·걷·쓰(읽기-걷기-쓰기)' 기반 전공연계 사회문제탐구 전문 장학사이자 학술 멘토입니다.
학생이 제안한 4P(현상-문제-과업-실천) 탐구 질문 및 계획을 학술적·교육적 관점에서 정밀 평가하고 업그레이드 방안을 제시해주세요.

[탐구 정보]
- 전공 연구실: ${labName || '일반 연구'}
- 핵심 탐구 질문: ${question || '질문 미입력'}
- P1 현상(Phenomenon): ${phenomenon || '미작성'}
- P2 문제(Problem): ${problem || '미작성'}
- P3 과업(Project/Task - 전공 연구방법): ${project || '미작성'}
- P4 실천(Practice - 지역사회/사회적 적용): ${practice || '미작성'}

다음 JSON 형식으로만 정확히 반환해주세요. 추가 설명 문구 없이 오직 JSON만 출력해야 합니다:
{
  "totalScore": 88,
  "pScores": {
    "phenomenon": 22,
    "problem": 21,
    "project": 23,
    "practice": 22
  },
  "overallReview": "전반적인 탐구 평가 총평 (3~4문장)",
  "strengths": ["강점 1", "강점 2"],
  "improvements": ["개선할 점 1", "개선할 점 2"],
  "questionUpgrades": [
    {
      "level": "기본형 (현재)",
      "question": "${question || '원래 질문'}",
      "description": "현상 중심의 초기 질문"
    },
    {
      "level": "심화형 (전공 연계)",
      "question": "전공 개념 및 학술 분석이 포함된 심화 질문",
      "description": "문제 원인과 전공 학문적 관점이 연결된 질문"
    },
    {
      "level": "융합·실천형 (읽걷쓰 완성형)",
      "question": "현장 탐구(걷기)와 실제적 실천(쓰기)까지 관통하는 완성형 탐구 질문",
      "description": "지역사회 실천과 지속가능한 변화를 이끄는 질문"
    }
  ],
  "recommendedKeywords": ["키워드1", "키워드2", "키워드3", "키워드4"],
  "recommendedBooks": [
    {"title": "추천 도서/논문명", "author": "저자/기관", "reason": "이 책을 추천하는 이유"},
    {"title": "추천 도서/논문명2", "author": "저자/기관", "reason": "이 책을 추천하는 이유"}
  ],
  "practiceActionIdeas": [
    "구체적 실천 아이디어 1",
    "구체적 실천 아이디어 2"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini API returned empty response');
    }

    const parsed = JSON.parse(text);
    return res.json({ success: true, isFallback: false, data: parsed });
  } catch (error: any) {
    console.error('Gemini evaluation error:', error);
    // Graceful fallback if Gemini API call fails
    const labName = safeText(req.body?.labName, 100);
    const question = safeText(req.body?.question, 1000);
    const phenomenon = safeText(req.body?.phenomenon);
    const problem = safeText(req.body?.problem);
    const project = safeText(req.body?.project);
    const practice = safeText(req.body?.practice);
    const fallbackResult = generateHeuristicEvaluation(labName, question, phenomenon, problem, project, practice);
    return res.json({ success: true, isFallback: true, error: error.message, data: fallbackResult });
  }
});

// AI Topic & Question Recommendation Endpoint
app.post('/api/gemini/recommend', async (req: Request, res: Response) => {
  try {
    const labName = safeText(req.body?.labName, 100);
    const interestKeyword = safeText(req.body?.interestKeyword, 200);
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        data: getFallbackRecommendations(labName, interestKeyword),
      });
    }

    const prompt = `
당신은 대한민국 '읽·걷·쓰' 전공연계 사회문제탐구 전문 연구위원입니다.
전공 연구실: "${labName}", 학생 관심 키워드: "${interestKeyword || '지역사회 지속가능성'}"을 바탕으로
학생이 탐구하기 좋은 매력적이고 시의성 있는 4P 사회문제탐구 주제 3가지를 추천해주세요.

다음 JSON 규격으로만 응답해주세요:
{
  "recommendations": [
    {
      "title": "주제명",
      "mainQuestion": "핵심 탐구 질문",
      "phenomenonSummary": "현상 요약",
      "problemSummary": "문제 요약",
      "projectSummary": "전공 탐구 과업",
      "practiceSummary": "실천 방안",
      "keywords": ["키워드1", "키워드2"],
      "recommendedBook": "관련 추천 도서명 (저자)"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const text = response.text;
    const parsed = JSON.parse(text || '{}');
    return res.json({ success: true, isFallback: false, data: parsed.recommendations || [] });
  } catch (error: any) {
    console.error('Gemini recommend error:', error);
    const labName = safeText(req.body?.labName, 100);
    const interestKeyword = safeText(req.body?.interestKeyword, 200);
    return res.json({
      success: true,
      isFallback: true,
      data: getFallbackRecommendations(labName, interestKeyword),
    });
  }
});

// AI Data Literacy & Correlation Interpreter Endpoint
app.post('/api/gemini/data-insight', async (req: Request, res: Response) => {
  try {
    const indicatorA = safeText(req.body?.indicatorA, 200);
    const indicatorB = safeText(req.body?.indicatorB, 200);
    const districtA = safeText(req.body?.districtA, 100);
    const districtB = safeText(req.body?.districtB, 100);
    const labName = safeText(req.body?.labName, 100);
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResult = generateFallbackDataInsight(districtA, districtB, indicatorA, indicatorB, labName);
      return res.json({ success: true, isFallback: true, data: fallbackResult });
    }

    const prompt = `
당신은 대한민국 2022 개정 사회과 교육과정 및 '읽·걷·쓰' 로컬리티 탐구 전문 AI 장학관입니다.
학생이 인천광역시의 두 지역/데이터 지표를 비교 분석하며 데이터 리터러시를 기르고 있습니다:
- 지표 A: ${indicatorA} (${districtA})
- 지표 B: ${indicatorB} (${districtB})
- 탐구 전공실: ${labName || '로컬리티 융합탐구'}

단순한 수치 나열이 아니라, 학생의 사회과적 리터러시(사고력)를 촉진할 수 있도록 다음 관점을 담아 분석해 주세요:
1) 사회과적 형성 배경 및 역사적 맥락 (예: 일제강점기/근대 산업화로 형성된 원도심 vs 갯벌 매립으로 조성된 경제자유구역 계획도시의 도시계획적 차이)
2) 데이터 격차 원인과 사회적 메커니즘 (자본 집중, 인구 이동, 기반시설 불균형)
3) 2022 개정 교육과정 연계 학생 생각 유도 질문 (비판적 사고 질문 2가지)
4) 4P 탐구계획서 연계 제언:
   - P1 현상(Phenomenon) 작성 가이드 문장 (수치 인용 포함)
   - P2 원인(Problem) 작성 가이드 문장 (구조적 원인 규명)

다음 JSON 규격으로만 응답해주세요:
{
  "title": "비교 분석 제목",
  "historicalContext": "역사적·공간적 형성 배경 (2~3문장)",
  "mechanismAnalysis": "데이터 격차의 구조적 원인 및 메커니즘 (3~4문장)",
  "criticalThinkingPrompts": [
    "학생 사고 촉진 질문 1",
    "학생 사고 촉진 질문 2"
  ],
  "p1PhenomenonText": "4P P1 현상에 바로 인용할 수 있는 학술적 서술문",
  "p2ProblemText": "4P P2 문제원인에 바로 인용할 수 있는 학술적 서술문",
  "relatedConcepts": ["개념1", "개념2", "개념3", "개념4"]
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    const parsed = JSON.parse(text || '{}');
    return res.json({ success: true, isFallback: false, data: parsed });
  } catch (error: any) {
    console.error('Gemini data-insight error:', error);
    const indicatorA = safeText(req.body?.indicatorA, 200);
    const indicatorB = safeText(req.body?.indicatorB, 200);
    const districtA = safeText(req.body?.districtA, 100);
    const districtB = safeText(req.body?.districtB, 100);
    const labName = safeText(req.body?.labName, 100);
    const fallbackResult = generateFallbackDataInsight(districtA, districtB, indicatorA, indicatorB, labName);
    return res.json({ success: true, isFallback: true, error: error.message, data: fallbackResult });
  }
});

// Helper to detect LabId from inputs
function detectLabId(labId?: string, labName?: string, text?: string): string {
  const combined = `${labId || ''} ${labName || ''} ${text || ''}`.toLowerCase();
  if (combined.includes('tech') || combined.includes('공학') || combined.includes('yolo') || combined.includes('인공지능') || combined.includes('휠체어') || combined.includes('컴퓨터')) {
    return 'tech';
  }
  if (combined.includes('science') || combined.includes('자연') || combined.includes('생태') || combined.includes('갯벌') || combined.includes('블루카본') || combined.includes('습지')) {
    return 'science';
  }
  if (combined.includes('bio') || combined.includes('보건') || combined.includes('의학') || combined.includes('수면') || combined.includes('블루라이트') || combined.includes('멜라토닌')) {
    return 'bio';
  }
  if (combined.includes('education') || combined.includes('교육') || combined.includes('문화') || combined.includes('예술') || combined.includes('다문화') || combined.includes('픽토그램')) {
    return 'education';
  }
  if (combined.includes('business') || combined.includes('경영') || combined.includes('경제') || combined.includes('소상공인') || combined.includes('상권') || combined.includes('마일리지') || combined.includes('인천e음')) {
    return 'business';
  }
  if (combined.includes('humanities') || combined.includes('인문') || combined.includes('사회') || combined.includes('노인') || combined.includes('키오스크') || combined.includes('공론장')) {
    return 'humanities';
  }
  return 'humanities';
}

interface LabPersonasConfig {
  p1Role: string;
  p1Desc: string;
  p1Icon: string;
  p2Role: string;
  p2Desc: string;
  p2Icon: string;
  p3Role: string;
  p3Desc: string;
  p3Icon: string;
}

const LAB_PERSONA_CONFIGS: Record<string, LabPersonasConfig> = {
  humanities: {
    p1Role: '원도심 어르신 당사자 대표 (박순자 어르신, 76세)',
    p1Desc: '인천 원도심에서 키오스크와 무인화 매장 확산으로 일상적 물품 구매에 곤란을 겪고 소외감을 느끼는 고령층 대표.',
    p1Icon: 'Users',
    p2Role: '인권·디지털포용 시민연대 활동가 (정민우 간사)',
    p2Desc: '헌법상 기본권, 사회적 배제 방지 및 세대 간 디지털 격차 해소를 위해 활동하는 인권 시민사회단체 활동가.',
    p2Icon: 'HeartHandshake',
    p3Role: '인천광역시 스마트도시복지과 주무관 (김태현 주무관)',
    p3Desc: '고령친화도시 조성 조례, 지자체 디지털 교육 예산 집행, 소상공인 무인기기 UI/UX 가이드라인의 행정 타당성을 검토하는 공무원.',
    p3Icon: 'Building2',
  },
  business: {
    p1Role: '원도심 골목 소상공인 상인회장 (박만석 회장)',
    p1Desc: '신포국제시장·개항로에서 30년간 자영업을 이어온 상인회장. 임대료 상승(젠트리피케이션), 조업 주차, 실질 매출 증대에 민감함.',
    p1Icon: 'Store',
    p2Role: '기후소비자연대 협동조합 대표 (이지원 위원장)',
    p2Desc: '친환경 순환경제, 다회용기 재사용 문화 확산, 그린워싱 방지와 로컬 지속가능성을 검증하는 생태경제 활동가.',
    p2Icon: 'TreePine',
    p3Role: '인천광역시 소상공인정책과 주무관 (최형석 주무관)',
    p3Desc: '인천e음 지역화폐 연계 예산, 소상공인 상생 조례 개정, 공공-민간 상생 마일리지 정산 시스템 구축의 행정적 타당성을 검증하는 공무원.',
    p3Icon: 'Building2',
  },
  tech: {
    p1Role: '교통약자 전동휠체어 이용자 대표 (강민호 대표)',
    p1Desc: '보행로 2cm 초과 턱과 파손 점자블록으로 인해 차도로 위험하게 우회해야 하는 휠체어 장애인 당사자이자 이동권 활동가.',
    p1Icon: 'Accessibility',
    p2Role: '온디바이스 AI·소프트웨어 아키텍트 (서진우 팀장)',
    p2Desc: 'YOLOv11 경량화 모델, 모바일 엣지 디바이스 발열·배터리 소모, 야간/우천 시 컴퓨터 비전 인식률의 기술적 엄밀성을 검증하는 AI 엔지니어.',
    p2Icon: 'Cpu',
    p3Role: '인천광역시 도로안전과 스마트인프라관 (윤동주 주무관)',
    p3Desc: '도로시설물 유지관리 지침, 지자체 GIS 연계, 스마트 가로등 관제 연동 및 도로법상 안전사고 법적 책임을 검토하는 도로행정관.',
    p3Icon: 'Building2',
  },
  science: {
    p1Role: '소래포구 어촌계 어민 대표 (오성근 어촌계장)',
    p1Desc: '소래습지와 갯골에서 수십 년간 조업하며 연안 매립과 환경오염으로 어획량 감소와 생계 위협을 겪는 연안 주민 대표.',
    p1Icon: 'Users',
    p2Role: '인천환경운동연합 갯벌생태위원장 (이정은 위원장)',
    p2Desc: '소래습지 갯벌의 블루카본(탄소격리), 멸종위기 저어새 서식지 보존, 인공 구조물 난개발을 경계하고 자연기반해법(NbS)을 고수하는 해양생태 전문가.',
    p2Icon: 'Leaf',
    p3Role: '인천광역시 환경안전기후국 주무관 (한상철 주무관)',
    p3Desc: '람사르 습지 보전 조례, 국가 탄소흡수원 인정 절차, 해양수산부-인천시 간 규제 조율 및 탄소중립 특별예산을 총괄하는 환경 공무원.',
    p3Icon: 'Building2',
  },
  bio: {
    p1Role: '청소년 학생·학부모 대표 (김지현 학부모회장)',
    p1Desc: '자녀의 심야 스마트폰 사용과 아침 만성 수면부족 및 학업 스트레스 사이에서 실질적인 수면권 회복을 바라는 학부모 대표.',
    p1Icon: 'Users',
    p2Role: '수면신경생리학자 / 학교 보건교사 (배소연 전문의)',
    p2Desc: '멜라토닌 분비와 일주기 생체리듬(Circadian Rhythm), 웨어러블 수면 모니터링의 의학적 타당성과 청소년 뇌 발달 기전을 검증하는 보건 전문가.',
    p2Icon: 'Activity',
    p3Role: '인천광역시교육청 학생건강증진과 장학관 (신우철 장학관)',
    p3Desc: '교내 전자기기 자율규정 가이드라인, 학교 보건실 수면위생 예산, 학교 교육과정 연계 보건 프로그램의 교육행정적 실현성을 검토하는 장학관.',
    p3Icon: 'Building2',
  },
  education: {
    p1Role: '다문화 중도입국 학부모 대표 (엘레나 학부모)',
    p1Desc: '인천 원도심 다문화 밀집지역에서 자녀의 한국어 장벽과 학교 안내판 소외감으로 심리적 위축을 겪어본 다문화 가정 대표.',
    p1Icon: 'Users',
    p2Role: '유니버설 공간디자이너 / 교육심리학자 (류성호 교수)',
    p2Desc: '시각 인지 심리, 다문화 감수성 기호학, 픽토그램의 보편적 가독성과 학교 공간 심미성을 연구하는 유니버설 디자인 전문가.',
    p2Icon: 'Palette',
    p3Role: '인천광역시교육청 미래교육공간과 장학관 (장유진 장학관)',
    p3Desc: '학교 공간혁신 사업 예산, 소방법 및 비상대피로 시인성 규정, 관내 초중고 픽토그램 표준화 가이드라인 제정을 총괄하는 교육청 행정관.',
    p3Icon: 'Building2',
  },
};

// AI Multi-Stakeholder Persona Feedback Endpoint
app.post('/api/gemini/persona-feedback', async (req: Request, res: Response) => {
  try {
    const rawLabId = safeText(req.body?.labId, 50);
    const labName = safeText(req.body?.labName, 100);
    const title = safeText(req.body?.title, 200);
    const mainQuestion = safeText(req.body?.mainQuestion, 500);
    const phenomenon = safeText(req.body?.phenomenon, 1000);
    const problem = safeText(req.body?.problem, 1000);
    const project = safeText(req.body?.project, 1000);
    const practice = safeText(req.body?.practice, 1000);

    const resolvedLabId = detectLabId(rawLabId, labName, `${title} ${mainQuestion} ${project}`);
    const personaConfig = LAB_PERSONA_CONFIGS[resolvedLabId] || LAB_PERSONA_CONFIGS.humanities;
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResult = generateFallbackPersonaFeedback(resolvedLabId, labName, title, mainQuestion, project, practice);
      return res.json({ success: true, isFallback: true, data: fallbackResult });
    }

    const prompt = `
당신은 대한민국 인천광역시의 사회문제 해결 4P 계획서를 심사하는 3인의 대표 이해관계자(페르소나)입니다.
현재 학생이 작성한 탐구 전공 분야는 [${labName || resolvedLabId}] 연구실입니다.
이 분야의 특성에 맞추어 다음 3인의 핵심 이해관계자가 되어 학생의 제안을 현실적이고 날카롭게 검증하세요:

1) [이해관계자 1 (당사자/수혜자)]: ${personaConfig.p1Role} - ${personaConfig.p1Desc}
2) [이해관계자 2 (전문가/시민단체)]: ${personaConfig.p2Role} - ${personaConfig.p2Desc}
3) [이해관계자 3 (행정관/정책실무자)]: ${personaConfig.p3Role} - ${personaConfig.p3Desc}

[학생이 실제로 작성한 4P 탐구 계획서]
- 탐구 전공실: ${labName || resolvedLabId}
- 연구 제목: ${title || '미작성'}
- 핵심 질문: ${mainQuestion || '미작성'}
- P1 현상 (관찰 데이터): ${phenomenon || '미작성'}
- P2 문제 (구조적 원인): ${problem || '미작성'}
- P3 과업 (해결 연구방법): ${project || '미작성'}
- P4 실천 (정책/실행방안): ${practice || '미작성'}

[평가 및 피드백 지침 - 중요]
1. 학생이 작성한 내용(P3 과업, P4 실천)을 구체적으로 인용하면서, 학생이 쓴 내용에 맞춤형으로 비평하세요. 천편일률적인 일반론이 아니라 학생의 실제 글에 반응해야 합니다.
2. 각 페르소나는 자신의 직업적·사회적 위치에 맞는 생생한 어투(당사자의 절박함, 전문가의 비판적 엄밀성, 행정관의 예산·조례·법적 절차 검토)를 유지하세요.
3. reaction 필드는 '적극 지지', '조건부 찬성', '우려 및 보완 필요' 중 하나로 판정하세요.
4. "suggestedP4Revision" 필드에는 3인의 비평을 반영하여, 학생이 [P4. 실천] 계획서에 바로 붙여넣어 보완할 수 있는 구체적인 3가지 실천 행동 조항(1, 2, 3)을 마크다운 형식으로 작성해주세요.

다음 JSON 규격으로만 응답해주세요:
{
  "persona1": {
    "name": "${personaConfig.p1Role}",
    "role": "${personaConfig.p1Role}",
    "tone": "현장감 있고 솔직한 당사자 어투",
    "avatarIcon": "${personaConfig.p1Icon}",
    "reaction": "조건부 찬성",
    "strengths": "학생의 글에서 우리 입장에 반갑고 기대되는 점 (2~3문장)",
    "concerns": "현실에서 마주칠 사각지대와 우려점 (2~3문장)",
    "sharpQuestion": "학생에게 던지는 허를 찌르는 질문 1개"
  },
  "persona2": {
    "name": "${personaConfig.p2Role}",
    "role": "${personaConfig.p2Role}",
    "tone": "전문성과 원칙을 지키는 비판적 어투",
    "avatarIcon": "${personaConfig.p2Icon}",
    "reaction": "조건부 찬성",
    "strengths": "학술적·전문적 관점에서 돋보이는 점 (2~3문장)",
    "concerns": "연구방법론이나 실천에서 간과된 맹점 (2~3문장)",
    "sharpQuestion": "학생에게 던지는 날카로운 학술/가치 질문 1개"
  },
  "persona3": {
    "name": "${personaConfig.p3Role}",
    "role": "${personaConfig.p3Role}",
    "tone": "조례·예산·행정 절차의 현실성을 따지는 공무원 어투",
    "avatarIcon": "${personaConfig.p3Icon}",
    "reaction": "조건부 찬성",
    "strengths": "인천시 정책 방향과 부합하는 포인트 (2~3문장)",
    "concerns": "조례 제정, 예산 분담, 주민 설득의 행정적 난관 (2~3문장)",
    "sharpQuestion": "학생에게 던지는 행정 실현 가능성 질문 1개"
  },
  "synthesisAdvice": "세 이해관계자의 충돌을 조율하고 4P 실천(P4)을 완성하기 위한 종합 멘토링 조언 (3~4문장)",
  "suggestedP4Revision": "1) [당사자 상생 보완]: ...\\n2) [전문가 가치 보완]: ...\\n3) [행정 실현성 보완]: ..."
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    const parsed = JSON.parse(text || '{}');

    // Ensure aliases for backward compatibility
    parsed.merchant = parsed.persona1 || parsed.merchant;
    parsed.environmental = parsed.persona2 || parsed.environmental;
    parsed.official = parsed.persona3 || parsed.official;
    parsed.labId = resolvedLabId;

    return res.json({ success: true, isFallback: false, data: parsed });
  } catch (error: any) {
    console.error('Gemini persona-feedback error:', error);
    const rawLabId = safeText(req.body?.labId, 50);
    const labName = safeText(req.body?.labName, 100);
    const title = safeText(req.body?.title, 200);
    const mainQuestion = safeText(req.body?.mainQuestion, 500);
    const project = safeText(req.body?.project, 1000);
    const practice = safeText(req.body?.practice, 1000);
    const resolvedLabId = detectLabId(rawLabId, labName, `${title} ${mainQuestion} ${project}`);
    const fallbackResult = generateFallbackPersonaFeedback(resolvedLabId, labName, title, mainQuestion, project, practice);
    return res.json({ success: true, isFallback: true, error: error.message, data: fallbackResult });
  }
});

// AI Text-to-Chart (Natural Language Query to Chart) Endpoint
app.post('/api/gemini/text-to-chart', async (req: Request, res: Response) => {
  try {
    const userQuery = safeText(req.body?.userQuery, 500);
    const datasetName = safeText(req.body?.datasetName, 100);
    // For targeted comparative queries like Yeonsu vs Dong youth employment & single person households,
    // return authoritative certified stats immediately to ensure 100% statistical fidelity
    const qLower = (userQuery || '').toLowerCase();
    if (
      qLower.includes('1인가구') ||
      (qLower.includes('청년') && (qLower.includes('동구') || qLower.includes('연수') || qLower.includes('고용') || qLower.includes('일자리')))
    ) {
      const result = generateFallbackTextToChart(userQuery);
      return res.json({ success: true, isAuthoritative: true, data: result });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallbackResult = generateFallbackTextToChart(userQuery);
      return res.json({ success: true, isFallback: true, data: fallbackResult });
    }

    const prompt = `
당신은 대한민국 사회과 교육과정 및 로컬 공공데이터 시각화 전문가입니다.
학생이 인천광역시 통계 데이터에 대해 다음과 같은 자연어 시각화/마이닝 질의를 입력했습니다:
- 학생 질의: "${userQuery || '인천 군·구별 핵심 지표 비교'}"
- 데이터셋: "${datasetName || '인천 10개 군·구 지표 통계'}"

학생의 질의 의도에 가장 적합한 차트 형태(bar, line, radar, scatter)를 결정하고, 실제 인천 10개 군·구의 현실적인 지표 수치를 바탕으로 데이터 시리즈를 구성해 주세요.
반드시 아래 JSON 규격으로만 응답해야 합니다:
{
  "chartType": "bar",
  "title": "차트 명확한 제목",
  "subtitle": "차트 부제 및 단위 안내",
  "xAxisLabel": "지역 / 항목",
  "yAxisLabel": "측정 단위 (%, ㎡, ㎍/㎥ 등)",
  "series": [
    {"label": "연수구", "value": 28.4, "category": "신도심·경제자유구역", "color": "#4F46E5"},
    {"label": "서구", "value": 18.2, "category": "신도심·경제자유구역", "color": "#6366F1"},
    {"label": "중구", "value": 7.4, "category": "원도심·항만", "color": "#E11D48"},
    {"label": "동구", "value": 3.8, "category": "원도심·항만", "color": "#F43F5E"},
    {"label": "미추홀구", "value": 5.1, "category": "원도심·항만", "color": "#FB7185"},
    {"label": "남동구", "value": 12.6, "category": "산업·주거복합", "color": "#0D9488"},
    {"label": "부평구", "value": 8.9, "category": "산업·주거복합", "color": "#14B8A6"},
    {"label": "계양구", "value": 10.3, "category": "산업·주거복합", "color": "#2DD4BF"},
    {"label": "강화군", "value": 24.1, "category": "도서·생태지역", "color": "#16A34A"},
    {"label": "옹진군", "value": 26.5, "category": "도서·생태지역", "color": "#22C55E"}
  ],
  "aiInsight": "사회과적 관점에서 본 데이터 시사점 및 도시 구조 분석 (2~3문장)",
  "p1Citation": "4P P1 현상에 바로 인용할 수 있는 수치 기반 관찰문",
  "p2Citation": "4P P2 원인에 바로 인용할 수 있는 구조적 메커니즘 분석문"
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    const parsed = JSON.parse(text || '{}');
    return res.json({ success: true, isFallback: false, data: parsed });
  } catch (error: any) {
    console.error('Gemini text-to-chart error:', error);
    const userQuery = safeText(req.body?.userQuery, 500);
    const fallbackResult = generateFallbackTextToChart(userQuery);
    return res.json({ success: true, isFallback: true, error: error.message, data: fallbackResult });
  }
});

// AI 4P Step Co-Pilot (Drafting, Polishing, Idea Expansion) Endpoint
app.post('/api/gemini/assist-step', async (req: Request, res: Response) => {
  try {
    const step = safeText(req.body?.step, 20) as 'phenomenon' | 'problem' | 'project' | 'practice';
    const mode = safeText(req.body?.mode, 20) as 'draft' | 'polish' | 'expand';
    const labName = safeText(req.body?.labName, 100);
    const topicTitle = safeText(req.body?.topicTitle, 300);
    const mainQuestion = safeText(req.body?.mainQuestion, 500);
    const currentText = safeText(req.body?.currentText, 2000);
    const ai = getGeminiClient();

    const stepKoreanName = {
      phenomenon: 'P1. 현상 (관찰 데이터 및 지역사회 현실 관측)',
      problem: 'P2. 문제 (표면적 현상 이면의 구조적·학술적 원인 분석)',
      project: 'P3. 과업 (전공 학문 기반 연구방법론 및 해결 프로젝트)',
      practice: 'P4. 실천 (학교·지역사회·정책 연계 실제적 실천 행동)',
    }[step] || '4P 탐구 단계';

    if (!ai) {
      const fallbackResult = generateFallbackStepAssist(step, mode, labName, topicTitle, mainQuestion, currentText);
      return res.json({ success: true, isFallback: true, data: fallbackResult });
    }

    let prompt = '';
    if (mode === 'draft') {
      prompt = `
당신은 대한민국 교육청 '읽·걷·쓰' 기반 4P 전공연계 사회문제탐구 전문 학술 멘토입니다.
학생이 작성 중인 탐구의 [${stepKoreanName}] 단계에 적합한 깊이 있고 완성도 높은 1~2문단(약 250~400자) 학술 초안을 작성해주세요.

[탐구 정보]
- 연구실: ${labName || '일반 사회문제'}
- 연구 제목: ${topicTitle || '인천 지역사회 문제탐구'}
- 핵심 질문: ${mainQuestion || '지역사회의 변화를 위한 과제는 무엇인가?'}
- 기존 메모: ${currentText || '(없음)'}

[작성 지침]
1. 단순 상투적인 문구가 아닌, 구체적인 인천의 공간 맥락(원도심, 신도시, 갯벌, 항만 등)과 해당 전공의 핵심 개념을 자연스럽게 녹여내세요.
2. 학술 보고서에 걸맞은 격식체('~로 분석된다', '~에 기인한다', '~을 실증하고자 한다')를 사용하세요.
3. 다음 JSON 규격으로만 응답하세요:
{
  "resultText": "작성된 학술 초안 본문",
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
  "tip": "학생이 추가로 보완하면 좋을 점 1문장"
}
`;
    } else if (mode === 'polish') {
      prompt = `
당신은 대한민국 고등학교 학술탐구 보고서 전문 첨삭위원입니다.
학생이 작성한 다음 [${stepKoreanName}] 초안 문장을 읽고, 의미를 왜곡하지 않으면서 학술 논문 및 고품질 탐구보고서 수준의 격식 있는 문체로 매끄럽고 명확하게 교정(다듬기)해주세요.

[학생 원문]
${currentText || topicTitle}

[교정 지침]
1. 구어체나 모호한 표현을 정제된 학술 어휘로 치환하세요.
2. 문장 간의 논리적 인과관계를 강화하세요.
3. 다음 JSON 규격으로만 응답하세요:
{
  "resultText": "교정된 완성 문장",
  "polishedPoints": ["개선된 부분 1", "개선된 부분 2"],
  "tip": "문체 교정의 핵심 포인트 1문장"
}
`;
    } else {
      // expand
      prompt = `
당신은 대한민국 '읽·걷·쓰' 4P 탐구 전문 장학사입니다.
학생이 작성 중인 [${stepKoreanName}]에 대해 탐구의 깊이를 더할 수 있는 3가지 구체적인 심화 아이디어(데이터 출처, 전공 이론 접목, 실천 방법 등)를 제안해주세요.

[탐구 정보]
- 연구실: ${labName}
- 연구 제목: ${topicTitle}
- 현재 내용: ${currentText || mainQuestion}

다음 JSON 규격으로만 응답하세요:
{
  "resultText": "아이디어 요약 종합 안내문",
  "suggestions": [
    {"title": "심화 방향 1", "description": "구체적인 실천 또는 분석 방법 안내"},
    {"title": "심화 방향 2", "description": "구체적인 실천 또는 분석 방법 안내"},
    {"title": "심화 방향 3", "description": "구체적인 실천 또는 분석 방법 안내"}
  ],
  "tip": "탐구 심화 조언 1문장"
}
`;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, isFallback: false, data: parsed });
  } catch (error: any) {
    console.error('Gemini assist-step error:', error);
    const step = safeText(req.body?.step, 20) as any;
    const mode = safeText(req.body?.mode, 20) as any;
    const labName = safeText(req.body?.labName, 100);
    const topicTitle = safeText(req.body?.topicTitle, 300);
    const mainQuestion = safeText(req.body?.mainQuestion, 500);
    const currentText = safeText(req.body?.currentText, 2000);
    const fallbackResult = generateFallbackStepAssist(step, mode, labName, topicTitle, mainQuestion, currentText);
    return res.json({ success: true, isFallback: true, error: error.message, data: fallbackResult });
  }
});

// AI Interactive Research Assistant (Chatbot) Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const userMessage = safeText(req.body?.message, 1000);
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];
    const projectContext = req.body?.projectContext || {};
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackReply = generateFallbackChatReply(userMessage, projectContext);
      return res.json({ success: true, isFallback: true, data: fallbackReply });
    }

    const systemPrompt = `
당신은 대한민국 교육청의 '읽·걷·쓰(읽기-걷기-쓰기)' 기반 4P 전공연계 사회문제탐구를 안내하는 다정하고 전문적인 'AI 학술 멘토'입니다.
학생들이 탐구 질문을 다듬고, 인천 지역의 공공데이터나 현장(걷기)을 연계하며, 전공 연구방법론(P3)과 실제적 실천(P4)을 구체화하도록 돕습니다.

[현재 학생의 탐구 프로젝트 상태]
- 전공 연구실: ${projectContext.labName || '미선택'}
- 탐구 제목: ${projectContext.title || '미작성'}
- 핵심 질문: ${projectContext.mainQuestion || '미작성'}
- 4P 현황: P1(${projectContext.fourP?.phenomenon ? '작성됨' : '미작성'}), P2(${projectContext.fourP?.problem ? '작성됨' : '미작성'}), P3(${projectContext.fourP?.project ? '작성됨' : '미작성'}), P4(${projectContext.fourP?.practice ? '작성됨' : '미작성'})

[응답 규칙]
1. 학생의 수준(고등학생)에 맞추어 따뜻하고 격려하는 어조이면서도, 학술적 엄밀성을 갖추어 조언하세요.
2. 답변은 읽기 편하도록 3~5문장의 명확한 문단으로 구성하고 필요시 글머리 기호(•)를 사용하세요.
3. 답변 끝에는 학생이 다음으로 물어볼 만한 추천 후속 질문 2~3개를 제시하세요.
4. JSON 형식으로만 응답하세요:
{
  "reply": "멘토의 친절하고 전문적인 학술 조언",
  "suggestedPrompts": ["추천 후속 질문 1", "추천 후속 질문 2", "추천 후속 질문 3"]
}
`;

    const chatContents = [
      { text: systemPrompt },
      ...history.map((h: any) => ({
        text: `${h.sender === 'user' ? '학생' : 'AI멘토'}: ${h.text}`,
      })),
      { text: `학생: ${userMessage}` },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: chatContents.map((c) => c.text).join('\n\n'),
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      isFallback: false,
      data: {
        reply: parsed.reply || '탐구 과정에서 궁금한 점이 있으시면 언제든 질문해주세요!',
        suggestedPrompts: parsed.suggestedPrompts || ['이 주제에 맞는 추천 도서 알려줘', 'P3 연구방법론 예시 보여줘'],
      },
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    const userMessage = safeText(req.body?.message, 1000);
    const projectContext = req.body?.projectContext || {};
    const fallbackReply = generateFallbackChatReply(userMessage, projectContext);
    return res.json({ success: true, isFallback: true, error: error.message, data: fallbackReply });
  }
});

// AI NEIS Student Record Helper Endpoint
app.post('/api/gemini/student-record-helper', async (req: Request, res: Response) => {
  try {
    const recordType = safeText(req.body?.recordType, 20) as 'subject' | 'club' | 'career';
    const project = req.body?.project || {};
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        data: {
          draft: 'AI 모의 모드로 기본 템플릿이 적용되었습니다.',
          type: recordType,
        },
      });
    }

    const typeDesc = {
      subject: '교과 세부능력 및 특기사항 (교과 지식의 심화 탐구 및 학술적 역량 중심)',
      club: '창의적 체험활동 동아리활동 (가설 검증, 협업, 문제해결 및 실증 데이터 분석 중심)',
      career: '창의적 체험활동 진로활동 (전공 적합성, 지속가능한 사회적 기여 및 진로 성숙도 중심)',
    }[recordType] || '교과 세특';

    const prompt = `
당신은 대한민국 교육부 학교생활기록부(NEIS) 기재요령에 정통한 고등학교 진학지도 전문 교사입니다.
학생의 4P '읽·걷·쓰' 탐구 프로젝트 수행 결과를 바탕으로, [${typeDesc}] 양식에 부합하는 탁월한 세특 기재 문안(공백 포함 400~500자 내외, NEIS 1,500 Byte 이하)을 작성해주세요.

[학생 탐구 활동 데이터]
- 연구 제목: ${project.title || '지역사회 연계 탐구'}
- 전공 연구실: ${project.labId || '인문사회'}
- 4P 현상(P1): ${project.fourP?.phenomenon || '관찰 사실'}
- 4P 문제(P2): ${project.fourP?.problem || '원인 분석'}
- 4P 과업(P3): ${project.fourP?.project || '연구방법 수행'}
- 4P 실천(P4): ${project.fourP?.practice || '실천 행동'}
- 독서 기록 수: ${project.readingLogs?.length || 0}권
- 현장 답사(걷기) 수: ${project.walkingLogs?.length || 0}회

[NEIS 기재 지침 - 엄격 준수]
1. 공인어학성적, 교외상, 구체적 기관명/도서 출판사 등 금지 항목을 배제할 것.
2. 학생의 '자기주도적 탐구 동기 -> 구체적 수행 과정(데이터 분석, 현장 답사) -> 학문적 성장 및 실천적 태도'의 3단계 흐름을 갖출 것.
3. 어미는 '~함', '~를 보임', '~역량을 입증함' 등의 교사 관찰 격식체로 마무리할 것.

다음 JSON 규격으로만 응답하세요:
{
  "draft": "작성된 NEIS 세특 기재 문안",
  "highlightKeywords": ["성장키워드1", "성장키워드2", "성장키워드3"],
  "evaluationPoint": "이 세특 문안에서 입학사정관에게 어필되는 핵심 역량 요약"
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, isFallback: false, data: parsed });
  } catch (error: any) {
    console.error('Gemini student-record-helper error:', error);
    return res.json({
      success: false,
      isFallback: true,
      error: error.message,
    });
  }
});

function generateHeuristicEvaluation(labName: string, question: string, phenomenon: string, problem: string, project: string, practice: string) {
  const p1Len = (phenomenon || '').length;
  const p2Len = (problem || '').length;
  const p3Len = (project || '').length;
  const p4Len = (practice || '').length;
  const qLen = (question || '').length;

  const p1Score = Math.min(25, Math.max(16, Math.floor(18 + (p1Len > 40 ? 5 : p1Len / 10))));
  const p2Score = Math.min(25, Math.max(15, Math.floor(17 + (p2Len > 40 ? 6 : p2Len / 10))));
  const p3Score = Math.min(25, Math.max(16, Math.floor(18 + (p3Len > 40 ? 6 : p3Len / 10))));
  const p4Score = Math.min(25, Math.max(15, Math.floor(17 + (p4Len > 40 ? 5 : p4Len / 10))));
  const totalScore = p1Score + p2Score + p3Score + p4Score;

  const baseQuestion = question && question.trim().length > 0 ? question.trim() : `${labName || '전공'} 기반 사회문제 해결을 위한 탐구`;

  return {
    totalScore,
    pScores: {
      phenomenon: p1Score,
      problem: p2Score,
      project: p3Score,
      practice: p4Score,
    },
    overallReview: `본 탐구는 [${labName || '선택 전공'}]의 학술적 시선으로 현실 문제를 포착하려는 의도가 돋보입니다. 현상과 문제의 인과관계를 더욱 실증적으로 연결하고, 걷기(현장 답사 및 관찰)를 통해 획득한 1차 데이터가 전공 연구 과업에 반영되면 더욱 탁월한 탐구 보고서로 발전할 수 있습니다.`,
    strengths: [
      '우리 주변 일상 및 지역사회에서 직관적으로 체감할 수 있는 현상을 연구 출발점으로 삼음',
      '전공 지식과 현실 문제의 접점을 모색하여 실천으로 확장하려는 4P 기본 프레임워크 준수',
    ],
    improvements: [
      '문제(Problem) 단계에서 단순 현상 나열을 넘어 사회적·구조적 근본 원인(메커니즘)을 더 명확히 기술할 것',
      '과업(Project) 단계에서 전공 특유의 연구 방법론(통계 분석, 문헌 고찰, 실험, 프로토타입 제작 등)을 구체화할 것',
    ],
    questionUpgrades: [
      {
        level: '기본형 (초기 제안)',
        question: baseQuestion,
        description: '관찰 가능한 현상에 주목한 초기 탐구 질문',
      },
      {
        level: '심화형 (전공 개념 접목)',
        question: `${baseQuestion.replace(/[?？]$/, '')}에 대한 ${labName || '전공'} 관점의 인과 구조 분석과 실증적 대안은 무엇인가?`,
        description: '학술적 분석 틀과 상관관계를 규명하는 심층 질문',
      },
      {
        level: '융합·실천형 (읽걷쓰 종합형)',
        question: `현장 사색(걷기)과 데이터 분석을 통해 규명한 ${baseQuestion.replace(/[?？]$/, '')}의 지속가능한 해결책과 지역사회 실천 모델은 어떻게 구현되는가?`,
        description: '인문학적 사색과 실증 연구, 구체적 실천이 통합된 완성형 질문',
      },
    ],
    recommendedKeywords: [
      `${labName || '전공'} 방법론`,
      '지역사회 거버넌스',
      '데이터 기반 실천',
      '사회적 가치 측정',
      '현장 참여형 연구',
    ],
    recommendedBooks: [
      {
        title: '문제 해결의 사회학',
        author: '한국사회학회',
        reason: '사회문제를 개인의 문제가 아닌 구조적 맥락에서 다각도로 조망하는 시각을 제공합니다.',
      },
      {
        title: '탐구하는 인간: 호모 인콰이런스',
        author: '교육과실천연구회',
        reason: '읽기와 걷기를 통해 축적한 생각을 논리적인 쓰기로 완성하는 탐구 방법론을 안내합니다.',
      },
    ],
    practiceActionIdeas: [
      '학교 또는 지역 공공게시판/SNS를 활용한 문제인식 개선 인포그래픽 캠페인 진행',
      '관련 지방자치단체 열린 정책제안 창구(인천시 소통참여 등)에 4P 분석 보고서 요약본 제출',
      '교내 학생회 및 동아리 연계 실천 프로젝트 시범 운영 및 전후 효과 설문조사',
    ],
  };
}

function getFallbackRecommendations(labName: string, keyword?: string) {
  const kw = keyword || '지역사회 발전';
  return [
    {
      title: `${labName || '융합'} 관점에서 본 ${kw} 격차 해소 모델`,
      mainQuestion: `우리 지역에서 체감되는 ${kw}의 불평등 현상을 어떻게 ${labName || '전공'} 기법으로 완화할 수 있을까?`,
      phenomenonSummary: '지역 내 인프라 및 접근성 편차로 인한 계층별·세대별 체감 격차 발생',
      problemSummary: '단순 자원 부족이 아닌 공급자 중심 정책과 주민 피드백 루프의 부재',
      projectSummary: '현장 실태 설문조사 및 해외 모범사례 비교분석을 통한 전공 솔루션 도출',
      practiceSummary: '청소년 주도 정책제안서 작성 및 교내 공론화 원탁회의 개최',
      keywords: [kw, '지역격차', '사회적자본', '실천모델'],
      recommendedBook: '로컬의 진화 (김영준 저)',
    },
    {
      title: `디지털 전환 시대의 ${kw}과 인간 중심 지속가능성`,
      mainQuestion: `${kw} 분야의 급격한 디지털 기술 도입 과정에서 소외되는 주체들을 어떻게 보호할 것인가?`,
      phenomenonSummary: '무인화, 자동화 가속화에 따른 노인·취약계층의 이용 단절 및 심리적 고립',
      problemSummary: '효율성 중심 기술 도입과 포용적 UI/UX 및 사회안전망 설계 미흡',
      projectSummary: '사용자 여정 맵핑(User Journey Mapping) 및 기술 수용도 모델 분석',
      practiceSummary: '디지털 튜터링 봉사활동 기획 및 친화적 가이드라인 매뉴얼 발간',
      keywords: ['디지털포용', '접근성', '인간중심기술', '사용자경험'],
      recommendedBook: '다정한 기술 (이민석 저)',
    },
    {
      title: `생태적 전환을 위한 ${kw} 기반 순환경제 실천`,
      mainQuestion: `일상 폐기물 감축과 탄소발자국 저감을 위해 ${labName || '전공'}에서 제안할 수 있는 시스템 혁신은?`,
      phenomenonSummary: '일회용품 소비 급증 및 재활용 선별 처리 과정의 비용 증가와 비효율',
      problemSummary: '생산-소비-폐기 선형 구조의 한계와 실천 동기 유발 인센티브 결여',
      projectSummary: '물질 흐름 분석(MFA) 및 행동경제학적 넛지(Nudge) 디자인 적용 연구',
      practiceSummary: '교내 보증금제 텀블러 순환 스테이션 구축 및 탄소포인트 챌린지 운영',
      keywords: ['순환경제', '탄소중립', '넛지디자인', '행동변화'],
      recommendedBook: '우리는 지구를 포기하지 않는다 (최재천 저)',
    },
  ];
}

// Heuristic Fallback for AI Data Literacy & Correlation Interpreter
function generateFallbackDataInsight(districtA: string, districtB: string, indicatorA: string, indicatorB: string, labName?: string) {
  const isOldVsNew =
    (districtA.includes('동구') || districtA.includes('미추홀') || districtA.includes('중구')) ||
    (districtB.includes('동구') || districtB.includes('미추홀') || districtB.includes('중구')) ||
    (districtA.includes('연수') || districtA.includes('송도') || districtA.includes('청라')) ||
    (districtB.includes('연수') || districtB.includes('송도') || districtB.includes('청라'));

  const isGreenOrHeat = indicatorA.includes('녹지') || indicatorA.includes('공원') || indicatorA.includes('열섬') ||
    indicatorB.includes('녹지') || indicatorB.includes('공원') || indicatorB.includes('열섬');

  const isDemographic = indicatorA.includes('인구') || indicatorA.includes('고령') || indicatorA.includes('청년') ||
    indicatorB.includes('인구') || indicatorB.includes('고령') || indicatorB.includes('청년');

  let title = `[AI 데이터 리터러시] ${districtA || '지표 A'}와 ${districtB || '지표 B'}의 사회과적 상관관계 분석`;
  let historicalContext = '';
  let mechanismAnalysis = '';
  let criticalThinkingPrompts: string[] = [];
  let p1PhenomenonText = '';
  let p2ProblemText = '';
  let relatedConcepts: string[] = [];

  if (isGreenOrHeat || isOldVsNew) {
    title = `[AI 공간 리터러시] 갯벌 간척 계획도시(${districtA || '송도·연수구'}) vs 근대 개항 원도심(${districtB || '동구·중구'})의 환경·공간 격차`;
    historicalContext =
      '인천 원도심(중구·동구)은 1883년 개항과 1960~70년대 근대 산업화 과정에서 경인선과 공장을 중심으로 자연 발생적 골목과 고밀 주거지가 형성되었습니다. 반면 경제자유구역(송도·청라)은 1990년대 이후 서해 갯벌을 대규모로 매립(간척)하여 처음부터 넓은 도로망, 해수공원(센트럴파크), 호수공원 등 광역 녹지축을 체계적으로 사전 설계한 21세기형 계획도시입니다.';
    mechanismAnalysis =
      '이 두 데이터의 격차는 단순한 행정 편차나 자치구 예산 차이가 아니라, "도시 형성 시기(19C말 근대 vs 21C 스마트시티)"와 "토지 이용 계획의 유연성"에서 기인합니다. 원도심은 높은 콘크리트 및 아스팔트 불투수면 비율과 좁은 골목길로 인해 도심 축열(열섬현상)이 심화되지만, 신도심은 1인당 28㎡가 넘는 공원 녹지와 수변 공간이 바람길 역할을 하여 기후 완충력을 갖추고 있습니다.';
    criticalThinkingPrompts = [
      '원도심 골목길에 대규모 공원을 새로 만들기 어려운 현실에서, 옥상녹화나 쌈지공원(Pocket Park), 바람길 통풍 개선과 같은 "미세 공간 재구조화"는 어떤 효과를 낼 수 있을까?',
      '간척 신도시에 환경 인프라가 집중되는 현상이 구도심 취약계층 노인들의 폭염 노출 위험과 결합될 때, 이를 "환경정의(Environmental Justice)" 관점에서 어떻게 해석해야 할까?',
    ];
    p1PhenomenonText = `[데이터 관찰 현상] ${districtA || '연수구(송도)'}의 1인당 도시공원면적(28.4㎡) 및 녹지율은 ${districtB || '동구'}(3.8㎡) 대비 약 7.5배 높은 반면, 여름철 열섬현상 일수 및 취약 주거지 밀집도는 원도심이 2배 이상 높게 나타나는 공간적 양극화가 확인됨.`;
    p2ProblemText = `[구조적 원인 규명] 이는 개항기 자연발생적 공업도시로 형성된 구도심과 갯벌 매립으로 조성된 경제자유구역 간의 도시계획 시기 격차 및 자본·인프라 집중에서 비롯된 구조적 "기후 불평등 및 공간적 분리" 문제입니다.`;
    relatedConcepts = ['도시형성사', '간척과 계획도시', '환경정의', '열섬현상과 바람길', '공간 불평등'];
  } else if (isDemographic) {
    title = `[AI 인구 리터러시] 신도심 학령인구 과밀 vs 원도심 초고령화·학령인구 절벽의 구조적 메커니즘`;
    historicalContext =
      '인천의 인구 이동은 주거 인프라(대단지 신축 아파트, 신설 학교, 특목고·국제학교)와 첨단 바이오·IT 일자리가 송도·청라·검단 등 신도시로 집중되면서, 30~40대 젊은 학부모 세대가 대거 유출된 반면 원도심에는 오랜 생활 터전을 지킨 노년층 비율이 급격히 증가하는 양상으로 전개되었습니다.';
    mechanismAnalysis =
      '청년층의 신도심 유출은 원도심의 소비 위축과 골목상권 붕괴, 학교 폐교 위기라는 악순환을 낳고 있으며, 반대로 신도심은 과밀학급과 돌봄 교실 부족이라는 상반된 문제를 겪고 있습니다. 이는 단순한 개인의 이사 문제가 아니라 "정주 여건(교육·교통·문화) 격차가 야기한 세대별 공간 분리" 현상입니다.';
    criticalThinkingPrompts = [
      '원도심의 폐교 예정 학교 공간이나 빈집을 청년 창업 스테이션 및 세대 융합 복합돌봄센터로 전환한다면 어떤 시너지 효과가 생길까?',
      '단순히 출산지원금을 주는 정책과, 청년이 살고 싶은 보행 친화적 문화 환경을 만드는 정책 중 어느 쪽이 인구 유출을 막는 데 더 지속가능할까?',
    ];
    p1PhenomenonText = `[데이터 관찰 현상] ${districtA || '원도심'}의 65세 이상 고령자 비율은 24%를 초과하여 초고령사회에 진입한 반면, ${districtB || '신도심'}은 만 19~34세 청년 비율이 28%에 달하고 유소년 인구 비율 역시 인천 평균을 상회하는 세대 편차가 뚜렷함.`;
    p2ProblemText = `[구조적 원인 규명] 주거·교육 인프라와 첨단 일자리가 신도시로 쏠리면서 발생한 원도심 공동화 및 학령인구 절벽 현상으로, 세대 간 생활권 분리와 지방소멸 위험이 인천 내부에서 공간적으로 중첩되고 있습니다.`;
    relatedConcepts = ['인구 절벽', '세대별 공간 분리', '정주 여건 격차', '로컬 거버넌스', '원도심 재생'];
  } else {
    title = `[AI 데이터 리터러시] ${districtA || '지역 A'}와 ${districtB || '지역 B'}의 산업·환경 상호작용 분석`;
    historicalContext =
      '인천은 수도권의 관문 항만이면서 동시에 국가 경제성장을 견인한 중화학·기계 산업 거점(부평·주안공단)과 수도권 폐기물 처리 거점(서구 매립지)을 담당해 온 복합적 산업 역사를 지니고 있습니다.';
    mechanismAnalysis =
      '데이터 지표의 편차는 각 지역이 분담해 온 기능적 역할(물류, 제조, 매립, 첨단 R&D)의 차이를 반영합니다. 한 지역의 경제적 성장이 다른 지역의 환경적 부담(대기오염, 화물차 통행, 폐기물 악취)을 수반하는 "외부효과(Externalities)"의 분배 문제를 드러냅니다.';
    criticalThinkingPrompts = [
      '지역 간 기능 분담으로 발생하는 환경적 비용을 어떻게 시 차원의 상생 기금이나 인프라 보상으로 공정하게 전환할 수 있을까?',
      '첨단 스마트 모니터링 데이터가 주민들의 환경 감시권과 알 권리를 어떻게 실질적으로 강화할 수 있을까?',
    ];
    p1PhenomenonText = `[데이터 관찰 현상] ${districtA || '산업·물류 거점'}의 공업 및 폐기물 배출 지표와 ${districtB || '배후 주거지'}의 대기질 측정값 간에 유의미한 상관관계와 공간적 영향권이 관측됨.`;
    p2ProblemText = `[구조적 원인 규명] 수도권 광역 인프라 기능의 특정 지역 편중과 환경 위험의 불균등한 분배로 인해 발생하는 지역 간 갈등 및 상생 거버넌스 부재 문제입니다.`;
    relatedConcepts = ['외부효과', '환경 불평등', '산업 전환', '정의로운 전환(Just Transition)'];
  }

  return {
    title,
    historicalContext,
    mechanismAnalysis,
    criticalThinkingPrompts,
    p1PhenomenonText,
    p2ProblemText,
    relatedConcepts,
  };
}

// Heuristic Fallback for AI Multi-Stakeholder Persona Feedback (Supports all 6 inquiry labs dynamically)
function generateFallbackPersonaFeedback(
  labId: string,
  labName: string,
  title: string,
  mainQuestion: string,
  project: string,
  practice: string
) {
  const practiceLen = (practice || '').length;
  const projectLen = (project || '').length;
  const hasMethod = projectLen > 30;
  const hasAction = practiceLen > 30;
  const projectSnippet = project ? `"${project.slice(0, 45)}..."` : '제안된 연구 방법론';
  const practiceSnippet = practice ? `"${practice.slice(0, 45)}..."` : '제시된 실천 방안';

  if (labId === 'tech') {
    return {
      persona1: {
        name: '교통약자 전동휠체어 이용자 대표 (강민호 대표)',
        role: '인천장애인자립생활센터 이동권위원회',
        tone: '일상의 위협을 직접 겪는 당사자의 솔직하고 절박한 어투',
        avatarIcon: 'Accessibility',
        reaction: (hasAction ? '적극 지지' : '조건부 찬성') as '적극 지지' | '조건부 찬성',
        strengths:
          `학생이 ${projectSnippet}처럼 휠체어나 유아차가 체감하는 2cm 단차와 파손 점자블록 위험을 온디바이스 기술로 해결하려 한 점에 깊이 감사드립니다. 비장애인이 무심코 지나치는 사소한 턱이 우리에겐 거대한 절벽인데 이를 기술로 짚어준 시도가 매우 뜻깊습니다.`,
        concerns:
          `다만 ${practiceSnippet} 실행 시 스마트폰 카메라 거치 각도나 야간 조도 부족, 비 오는 날 물웅덩이 반사 등으로 인한 오인식 문제가 발생할 수 있습니다. 휠체어 이용자가 이동 중에 위험 경고를 직관적인 진동이나 음성으로 바로 체감할 수 있는 사용자 인터페이스(UI) 보완이 필요합니다.`,
        sharpQuestion:
          '실제 배터리가 부족하거나 야간 어두운 골목길을 지날 때도 온디바이스 AI 카메라가 오작동 없이 휠체어 탑승자를 안전하게 보호할 수 있습니까?',
      },
      persona2: {
        name: '온디바이스 AI·임베디드 아키텍트 (서진우 팀장)',
        role: '인천스타트업파크 AI 엣지솔루션 랩',
        tone: '알고리즘 경량화와 엣지 하드웨어 실증을 따지는 엔지니어 어투',
        avatarIcon: 'Cpu',
        reaction: '조건부 찬성' as const,
        strengths:
          `YOLOv11 경량화 신경망을 활용해 클라우드 서버 통신 지연 없이 단말기 자체에서 도로 장애물을 실시간 3단계로 추론하겠다는 기술적 접근이 매우 탁월합니다. 스마트시티 공공 API와의 연동 가능성도 높습니다.`,
        concerns:
          `라즈베리파이나 모바일 엣지 디바이스 환경에서 지속적인 실시간 영상 스트리밍은 심각한 발열과 배터리 급방전을 유발합니다. 모델 양자화(INT8 Quantization) 및 엣지 프레임 드롭 최적화 기법이 계획서에 구체적으로 명시되어야 합니다.`,
        sharpQuestion:
          '초당 프레임 수(FPS)와 단말기 배터리 소모량 사이의 트레이드오프를 해결하기 위해 어떤 모델 경량화 및 파이프라인 최적화 기법을 적용할 계획입니까?',
      },
      persona3: {
        name: '인천광역시 도로안전과 스마트인프라관 (윤동주 주무관)',
        role: '인천시청 건설교통국 도로관리과 실무관',
        tone: '도로법 규정과 지자체 시설물 보수 예산의 현실성을 따지는 공무원 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths:
          `학생들이 직접 발로 뛰며 구축할 15,000보 통학로 위험 매핑 데이터는 인천시가 추진 중인 "스마트 도로 유지관리 시스템"에 즉시 기여할 수 있는 훌륭한 시민 참여형 데이터입니다.`,
        concerns:
          `지자체 도로 보수는 연간 도로 정비 예산 계획과 구청-시청 간 도로 등급별 관할에 따라 집행됩니다. 위험 지점 데이터를 수집하는 것에 그치지 않고, 도로법상 즉시 보수 대상 규정과 연계된 행정 민원 포맷(안전신문고)과의 표준 연동 체계가 보완되어야 합니다.`,
        sharpQuestion:
          '탐지된 보행로 위험 지점이 인천시 도로관리 시스템과 연계되어 실제 구청 도로보수과의 긴급 출동 및 보수로 이어지게 만들 행정적 실행 경로는 무엇입니까?',
      },
      merchant: {
        name: '교통약자 전동휠체어 이용자 대표 (강민호 대표)',
        role: '인천장애인자립생활센터 이동권위원회',
        tone: '일상의 위협을 직접 겪는 당사자의 솔직하고 절박한 어투',
        avatarIcon: 'Accessibility',
        reaction: '적극 지지' as const,
        strengths: `학생이 ${projectSnippet}을 통해 교통약자 이동권을 따뜻한 기술로 해결하려 한 점을 높이 평가합니다.`,
        concerns: `야간이나 우천 시 오작동 방지 및 진동/음성 알림 인터페이스 보완이 필요합니다.`,
        sharpQuestion: '어두운 골목길이나 악천후 시에도 휠체어 이용자를 안전하게 보호할 수 있습니까?',
      },
      environmental: {
        name: '온디바이스 AI·임베디드 아키텍트 (서진우 팀장)',
        role: '인천스타트업파크 AI 엣지솔루션 랩',
        tone: '알고리즘 경량화와 엣지 하드웨어 실증을 따지는 엔지니어 어투',
        avatarIcon: 'Cpu',
        reaction: '조건부 찬성' as const,
        strengths: 'YOLOv11 기반 온디바이스 컴퓨터 비전 파이프라인 설계의 기술적 방향성이 우수합니다.',
        concerns: '엣지 기기 발열과 배터리 수명 유지를 위한 양자화 및 프레임 최적화 기법이 보강되어야 합니다.',
        sharpQuestion: '단말기 배터리 소모와 실시간 추론 속도 사이의 균형을 어떻게 맞출 계획입니까?',
      },
      official: {
        name: '인천광역시 도로안전과 스마트인프라관 (윤동주 주무관)',
        role: '인천시청 건설교통국 도로관리과 실무관',
        tone: '도로법 규정과 지자체 시설물 보수 예산의 현실성을 따지는 공무원 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths: '청소년 참여형 도로 위험 데이터 구축은 시정 도로 안전 정책에 큰 보탬이 됩니다.',
        concerns: '단순 데이터 축적을 넘어 안전신문고 및 지자체 도로보수 우선순위 지표와 연계되어야 합니다.',
        sharpQuestion: '수집된 데이터가 실제 도로 정비 예산 집행으로 이어질 행정 연계 경로는 무엇입니까?',
      },
      synthesisAdvice:
        '휠체어 당사자의 "체감 안전성과 알림 직관성", AI 엔지니어의 "경량화 모델 최적화와 저전력성", 도로행정관의 "지자체 긴급 보수 연동"이라는 3대 관점이 균형을 이룰 때 진정한 배리어프리 스마트시티가 완성됩니다. P4 실천 방안에 "인천장애인단체 실증 테스트"와 "안전신문고 표준 연동 조항"을 명시하세요.',
      suggestedP4Revision:
        '1) [교통약자 체감 UI/UX]: 인천장애인자립생활센터와 협력하여 전동휠체어 거치형 진동·음성 다중 알림 인터페이스 사용자 실증 테스트 진행.\n2) [엣지 AI 저전력 최적화]: YOLOv11 모델의 INT8 양자화 적용을 통해 배터리 소모율 40% 감축 및 우천·야간 센서 퓨전 보정 알고리즘 구축.\n3) [지자체 도로정비 행정 연동]: 실사 15,000보 위험 매핑 데이터를 시청 도로안전과 및 안전신문고 API 포맷과 연동하여 2주 내 긴급 보수 청원 체계 가동.',
    };
  }

  if (labId === 'science') {
    return {
      persona1: {
        name: '소래포구 어촌계 어민 대표 (오성근 어촌계장)',
        role: '소래포구 전통어촌계 자율관리어업공동체',
        tone: '바다와 갯벌의 생태 변화를 몸으로 겪는 어민 어투',
        avatarIcon: 'Users',
        reaction: (hasAction ? '조건부 찬성' : '우려 및 보완 필요') as '조건부 찬성' | '우려 및 보완 필요',
        strengths:
          `학생들이 소래습지 갯벌의 흙 속에 발을 담그고 ${projectSnippet}와 같은 과학적 연구를 진행해 준 점이 대견합니다. 우리 어민들도 간척과 매립으로 꽃게와 넙치 어획량이 줄어드는 걸 보며 갯벌의 소중함을 뼈저리게 느끼고 있습니다.`,
        concerns:
          `하지만 갯벌 보존을 명분으로 무조건적인 조업 통제나 어선 출항 제한 구역이 늘어나면 영세 어민들의 생계가 끊깁니다. 갯벌 블루카본의 가치를 높이면서도 어민들의 조업 활동과 상생할 수 있는 '생태 어촌 상생 대책'이 빠져 있습니다.`,
        sharpQuestion:
          '갯벌 보존 구역을 설정할 때, 수십 년간 갯골을 삶의 터전으로 살아온 어민들의 전통 조업권과 어구 세척 공간은 어떻게 조화롭게 배려할 생각입니까?',
      },
      persona2: {
        name: '인천환경운동연합 갯벌생태위원장 (이정은 위원장)',
        role: '인천 기후위기비상행동·서해 갯벌 보전 포럼',
        tone: '생태적 감수성과 원칙을 지키는 비판적 전문가 어투',
        avatarIcon: 'Leaf',
        reaction: '적극 지지' as const,
        strengths:
          `산림 중심 그린카본에 치우친 기후 정책을 비판하고 서해 연안 갯벌 염생식물의 총유기탄소(TOC) 저장 능력을 실증 분석하겠다는 접근은 매우 선구적이고 과학적입니다.`,
        concerns:
          `다만 복원 과정에서 외래 식생 식재나 인공 데크길 과다 설치와 같은 '토목형 생태공원화'는 오히려 저어새와 도요물떼새의 취식지를 교란합니다. 자연 스스로 조류와 파도에 맞춰 회복하는 '자연기반해법(NbS)'의 철학이 더 철저히 지켜져야 합니다.`,
        sharpQuestion:
          '인공적인 탐방 시설물을 추가하는 대신, 갯벌 생태계가 인간의 간섭 없이 자정능력을 발휘할 수 있는 최소 개입 생태축 설정 방안이 포함되어 있습니까?',
      },
      persona3: {
        name: '인천광역시 환경안전기후국 주무관 (한상철 주무관)',
        role: '인천시청 대기보전과 탄소중립정책팀',
        tone: '국제 협약과 국가 탄소감축목표(NDC), 지방재정을 따지는 공무원 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths:
          `인천시가 추진 중인 "2045 탄소중립 비전"과 유네스코 세계자연유산 2단계 등재 로드맵에 청소년의 정량 데이터 분석이 귀중한 시민 과학(Citizen Science) 근거가 됩니다.`,
        concerns:
          `습지의 온실가스 흡수량을 국가 공식 감축 통계로 공인받으려면 해양수산부의 '블루카본 인증 표준 프로토콜' 기준을 충족해야 합니다. 또한 남동구-시청-해수부 간의 관리 권한 중복 문제를 해결할 제도적 근거가 제시되어야 합니다.`,
        sharpQuestion:
          '측정된 TOC 데이터를 국가 블루카본 통계로 승인받기 위한 공인 검증 절차와 소래습지 특별보존조례 제정을 위한 시의회 조율 방안은 무엇입니까?',
      },
      merchant: {
        name: '소래포구 어촌계 어민 대표 (오성근 어촌계장)',
        role: '소래포구 전통어촌계 자율관리어업공동체',
        tone: '어민들의 생계 현실과 갯벌 보존의 조화를 요구하는 어투',
        avatarIcon: 'Users',
        reaction: '조건부 찬성' as const,
        strengths: '소래 갯벌의 가치를 청소년의 과학적 실험으로 증명하려는 의도를 지지합니다.',
        concerns: '어민의 어업권과 생계를 제한하지 않는 상생형 습지 보존 방안이 함께 설계되어야 합니다.',
        sharpQuestion: '어민들의 어로 활동과 갯벌 탄소흡수원 보전을 어떻게 공존시킬 수 있습니까?',
      },
      environmental: {
        name: '인천환경운동연합 갯벌생태위원장 (이정은 위원장)',
        role: '인천 기후위기비상행동·서해 갯벌 보전 포럼',
        tone: '생태적 감수성과 원칙을 지키는 비판적 전문가 어투',
        avatarIcon: 'Leaf',
        reaction: '적극 지지' as const,
        strengths: '갯벌 토양 깊이별 TOC 정량 분석과 블루카본 가치 재조명은 학술적·생태적으로 탁월합니다.',
        concerns: '인공 구조물 확충을 지양하고 자연기반해법(NbS) 중심의 최소 개입 보존 원칙이 확립되어야 합니다.',
        sharpQuestion: '인공 시설물 간섭을 배제한 갯벌 고유의 자연 복원력을 보장할 방안이 있습니까?',
      },
      official: {
        name: '인천광역시 환경안전기후국 주무관 (한상철 주무관)',
        role: '인천시청 대기보전과 탄소중립정책팀',
        tone: '조례와 국가 감축목표(NDC) 연동의 행정성을 따지는 공무원 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths: '2045 탄소중립 마스터플랜 및 세계자연유산 2단계 등재 정책에 부합합니다.',
        concerns: '해수부 공인 프로토콜 검증 절차와 지자체 관리 조례 입법화의 구체성이 더 필요합니다.',
        sharpQuestion: '국가 온실가스 감축 인증을 획득하기 위한 공인 표준 실험 절차를 어떻게 준수할 것입니까?',
      },
      synthesisAdvice:
        '어민의 "생계 어로권 보장", 환경운동가의 "자연기반해법(NbS) 최소 개입", 환경공무원의 "국가 탄소인증 및 조례 입법화"를 융합하는 것이 연안 생태 정책의 핵심입니다. P4 실천 방안에 "어촌계-환경단체 상생 협약"과 "블루카본 시민과학 조례안"을 반영해 보세요.',
      suggestedP4Revision:
        '1) [어촌계 상생형 생태 정화]: 소래포구 어촌계와 함께하는 "폐어구 수거 플로깅 및 친환경 어구 전환 캠페인"을 공동 주최하여 생계와 보존의 공존 도모.\n2) [자연기반해법(NbS) 모니터링]: 인공 시설물 증설을 제한하고 칠면초·퉁퉁마디 자생 복원 구역 3곳을 지정하여 청소년-전문가 합동 분기별 식생 밀도 관측.\n3) [블루카본 인증 및 조례 청원]: 인천 연안 갯벌의 국가 탄소흡수원 지정을 위한 정량 데이터 리포트를 시의회 및 해양수산부에 제출하고 습지보전조례 개정 청원 추진.',
    };
  }

  if (labId === 'bio') {
    return {
      persona1: {
        name: '청소년 학생·학부모 대표 (김지현 학부모회장)',
        role: '인천시 고등학교 학부모연합회 복지위원회',
        tone: '자녀의 학업 고통과 수면 부족을 곁에서 지켜본 학부모 어투',
        avatarIcon: 'Users',
        reaction: (hasAction ? '적극 지지' : '조건부 찬성') as '적극 지지' | '조건부 찬성',
        strengths:
          `학생들이 ${projectSnippet}처럼 늦은 밤 스마트폰 사용을 단순한 게으름이 아니라 수면 생체시계 교란과 만성 피로의 관점에서 진지하게 다뤄준 점이 진심으로 와닿습니다.`,
        concerns:
          `하지만 학원 숙제와 온라인 수행평가 과제 마감 시간이 밤 11시, 12시까지 이어지는 입시 현실에서, 무조건 "스마트폰을 끄라"는 챌린지는 학생들에게 또 다른 스트레스가 될 수 있습니다. 학업 스케줄과 타협 가능한 실질적 휴식 가이드가 필요합니다.`,
        sharpQuestion:
          '밤늦게까지 수행평가와 학원 과제를 해야만 하는 학생들이 자책감 없이 실제로 동참할 수 있는 현실적인 디지털 수면 약속은 어떻게 만들 수 있나요?',
      },
      persona2: {
        name: '수면신경생리학자 / 학교 보건교사 (배소연 전문의)',
        role: '대한수면의학회 청소년수면건강위원회',
        tone: '멜라토닌 분비와 뇌 발달 기전을 따지는 의학 전문가 어투',
        avatarIcon: 'Activity',
        reaction: '조건부 찬성' as const,
        strengths:
          `스마트밴드 수면 단계 분석과 주간 스트룹 인지 검사를 결합하여 수면 질 저하가 전두엽 집중력에 미치는 생리학적 메커니즘을 입증하려는 실험 설계가 매우 뛰어납니다.`,
        concerns:
          `단순 블루라이트 노출 시간 외에도 야간 카페인 음료(에너지 드링크) 섭취, 취침 전 격렬한 운동, 수면 중 소음 등 교란 변수(Confounding Variables)에 대한 통제가 미흡하면 데이터의 인과성이 흔들릴 수 있습니다.`,
        sharpQuestion:
          '블루라이트 차단 기능 외에, 뇌파를 흥분시키는 숏폼 영상의 도파민 자극 효과를 수면 질 저하 변수에서 어떻게 분리하여 통제할 계획입니까?',
      },
      persona3: {
        name: '인천광역시교육청 학생건강증진과 장학관 (신우철 장학관)',
        role: '인천시교육청 미래교육국 보건교육팀',
        tone: '학교 보건 규정과 교육행정 현실성을 따지는 장학관 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths:
          `학생들이 스스로 교내 수면건강 챌린지를 기획하고 보건실과 연계하여 수면위생 포스터를 제작하겠다는 실천안은 '학생 주도형 건강 자치'의 모범 사례입니다.`,
        concerns:
          `학교 현장에서는 자율동아리 챌린지가 단발성 이벤트로 끝나기 쉽습니다. 정규 보건 수업 시간의 필수 단원 연계나 아침 자습 시간 '스크린 프리 명상 걷기'와 같은 학교 공식 학사일정 및 생활 규정으로 정착시키는 제도화 방안이 보강되어야 합니다.`,
        sharpQuestion:
          '이 챌린지를 일회성 동아리 행사에 그치지 않고, 인천 관내 모든 고등학교의 공식 학사 운영 및 생활지도 가이드라인으로 안착시킬 교육청 제도화 방안은 무엇입니까?',
      },
      merchant: {
        name: '청소년 학생·학부모 대표 (김지현 학부모회장)',
        role: '인천시 고등학교 학부모연합회 복지위원회',
        tone: '학부모 입장에서 입시 스트레스와 수면권 보장의 조화를 요구하는 어투',
        avatarIcon: 'Users',
        reaction: '적극 지지' as const,
        strengths: '청소년 수면 부족을 개인의 탓이 아닌 뇌 생체리듬의 건강권 문제로 접근한 점이 훌륭합니다.',
        concerns: '심야 학업 과제 부담을 고려하지 않은 강제적 차단은 실효성이 떨어질 수 있습니다.',
        sharpQuestion: '학생들이 학업 부담 속에서도 스스로 실천할 수 있는 현실적 수면 루틴 방안은 무엇입니까?',
      },
      environmental: {
        name: '수면신경생리학자 / 학교 보건교사 (배소연 전문의)',
        role: '대한수면의학회 청소년수면건강위원회',
        tone: '의학적 기전과 실험 데이터의 엄밀성을 따지는 보건 전문가 어투',
        avatarIcon: 'Activity',
        reaction: '조건부 찬성' as const,
        strengths: '웨어러블 수면 모니터링과 스트룹 인지 기능 검사의 병행 연구방법론이 돋보입니다.',
        concerns: '카페인 섭취와 숏폼 콘텐츠의 도파민 자극 등 외생 변수 통제 설계가 더 엄밀해야 합니다.',
        sharpQuestion: '블루라이트 광학 요인과 콘텐츠 몰입 심리 요인을 어떻게 구분하여 검증할 것입니까?',
      },
      official: {
        name: '인천광역시교육청 학생건강증진과 장학관 (신우철 장학관)',
        role: '인천시교육청 미래교육국 보건교육팀',
        tone: '교육과정 연계와 공공 보건 정책화를 따지는 교육청 장학관 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths: '학생 자치 기반의 수면 개선 프로젝트는 시교육청 건강 정책의 훌륭한 모델입니다.',
        concerns: '단발성 동아리 이벤트를 넘어 학교 교육계획서 및 아침 학사일정으로 제도화되어야 합니다.',
        sharpQuestion: '학교 공식 교육과정 및 보건실 정규 프로그램으로 안착시킬 제도적 실행안은 무엇입니까?',
      },
      synthesisAdvice:
        '학부모의 "학업 스트레스 완충과 자율 실천", 수면의학자의 "도파민·카페인 변수 통제", 교육청 장학관의 "정규 학사일정 및 보건 규정 제도화"를 종합하는 것이 건강 탐구의 완성입니다. P4에 "심야 과제 마감 제한 정책"과 "보건실 연계 수면 클리닉 조항"을 포함해 보세요.',
      suggestedP4Revision:
        '1) [가정-학교 연계 자율 디지털 약속]: "취침 1시간 전 폰 오프 & 저녁 걷기 사색 3주 챌린지"를 운영하며 학부모-학생 간 가족 맞춤형 수면 안심 충전 바구니 보급.\n2) [의학적 수면위생 포스터 및 캠페인]: 카페인 음료 섭취 주의 및 블루라이트/도파민 차단 가이드가 담긴 "청소년 수면위생 10계명"을 보건실과 협력하여 전 학급 게시.\n3) [교육청 수면권 조례 제안]: 시교육청에 "심야 원격 과제 제출 마감 시간(밤 10시) 제한 권고" 및 아침 자습 시간 "15분 힐링 산책 명상제" 도입 정책 건의서 제출.',
    };
  }

  if (labId === 'education') {
    return {
      persona1: {
        name: '다문화 중도입국 학부모 대표 (엘레나 학부모)',
        role: '인천 다문화가족지원센터 원도심 학부모 모임',
        tone: '낯선 한국 학교 환경에서 자녀가 겪은 소외감을 토로하는 진솔한 어투',
        avatarIcon: 'Users',
        reaction: (hasAction ? '적극 지지' : '조건부 찬성') as '적극 지지' | '조건부 찬성',
        strengths:
          `학생들이 ${projectSnippet}처럼 어려운 한글 행정 안내판 때문에 우리 아이들이 교무실이나 보건실 가기를 두려워했던 마음을 알아채고 픽토그램으로 바꿔주려 한 점에 눈물이 날 만큼 고맙습니다.`,
        concerns:
          `하지만 픽토그램 디자인이 특정 국가나 문화권의 편견을 담고 있지는 않은지 조심해야 합니다. 그림 기호 하나에도 문화마다 금기시되거나 오해를 부르는 상징이 있을 수 있으니, 다문화 아이들과 학부모들이 직접 참여해 함께 검수하는 과정이 필수적입니다.`,
        sharpQuestion:
          '디자인을 제작할 때, 한국 학생들의 시각뿐 아니라 러시아, 베트남, 중앙아시아 등 다양한 배경의 학생들이 기호를 오해하지 않도록 어떻게 함께 참여시킬 계획인가요?',
      },
      persona2: {
        name: '유니버설 공간디자이너 / 교육심리학자 (류성호 교수)',
        role: '한국공간디자인학회 포용공간디자인연구소',
        tone: '시각 인지 심리와 유니버설 디자인 원칙을 따지는 학술 전문가 어투',
        avatarIcon: 'Palette',
        reaction: '조건부 찬성' as const,
        strengths:
          `다문화 감수성과 유니버설 디자인 7원칙을 융합하여 교내 공간 인지도와 소속감(School Belongingness) 지표를 사전·사후 A/B 테스트로 검증하겠다는 연구 설계가 매우 독창적입니다.`,
        concerns:
          `단순히 예쁜 일러스트를 그리는 것과 '시각적 유니버설 픽토그램'은 다릅니다. 원거리 시인성, 색각이상(색맹·색약) 학생을 위한 색상 대비비(Contrast Ratio), 소방법상 비상구 유도등 규격과의 시각적 간섭 여부 등 전문적 규격 검토가 뒤따라야 합니다.`,
        sharpQuestion:
          '저시력 및 색각이상 학생도 즉시 식별할 수 있는 국제 표준(ISO 7001) 대비비와 교육심리학적 안정감을 주는 색채 가이드라인을 어떻게 수립할 것입니까?',
      },
      persona3: {
        name: '인천광역시교육청 미래교육공간과 장학관 (장유진 장학관)',
        role: '인천시교육청 학교공간혁신단',
        tone: '학교 안전 규정과 예산 확산 가능성을 검토하는 교육행정관 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths:
          `학생들이 직접 학교 공간의 언어적 장벽을 발굴하고 디자인 넛지(Nudge)로 소속감을 높이겠다는 제안은 인천시교육청의 "다문화 친화 학교공간 혁신 사업"의 이상적인 모델입니다.`,
        concerns:
          `시범 부착 후 학교 시설물 훼손 민원이나 소방 안전 규정 위반 시 즉시 철거될 수 있습니다. 행정적으로 공인받기 위해서는 학교운영위원회 심의를 통과하고, 관내 다문화 중점학교 10곳으로 보급될 수 있는 '표준 시공 매뉴얼' 수준으로 문서화되어야 합니다.`,
        sharpQuestion:
          '학교 소방 안전 규정과 학교운영위원회 승인을 거쳐 다른 다문화 밀집 중고교에도 그대로 복제·적용될 수 있는 표준 픽토그램 제작 가이드를 어떻게 완성할 계획입니까?',
      },
      merchant: {
        name: '다문화 중도입국 학부모 대표 (엘레나 학부모)',
        role: '인천 다문화가족지원센터 원도심 학부모 모임',
        tone: '다문화 학생의 심리적 안정과 차별 없는 공간을 요구하는 어투',
        avatarIcon: 'Users',
        reaction: '적극 지지' as const,
        strengths: '언어 장벽을 허물고 그림 기호로 학교 소속감을 높이려는 따뜻한 시선에 감사합니다.',
        concerns: '다문화 가정 학생과 학부모가 직접 검수하여 문화적 오해가 없도록 공동 제작해야 합니다.',
        sharpQuestion: '다양한 문화권 학생들의 의견이 픽토그램 디자인에 실질적으로 반영될 통로는 무엇입니까?',
      },
      environmental: {
        name: '유니버설 공간디자이너 / 교육심리학자 (류성호 교수)',
        role: '한국공간디자인학회 포용공간디자인연구소',
        tone: '유니버설 디자인 원칙과 인지 심리의 엄밀성을 따지는 전문가 어투',
        avatarIcon: 'Palette',
        reaction: '조건부 찬성' as const,
        strengths: '공간 인지도와 학교 소속감을 A/B 테스트로 실증하겠다는 실험적 가설이 돋보입니다.',
        concerns: '원거리 시인성, 색각이상 학생을 위한 명도 대비, 소방 안전 시각 규격 준수가 필수적입니다.',
        sharpQuestion: '국제 표준(ISO) 가독성 지표와 색각 다양성을 충족할 정량적 기준이 수립되어 있습니까?',
      },
      official: {
        name: '인천광역시교육청 미래교육공간과 장학관 (장유진 장학관)',
        role: '인천시교육청 학교공간혁신단',
        tone: '학교 안전 규정과 조례·매뉴얼 표준화를 따지는 교육청 장학관 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths: '학생 참여형 학교 공간 넛지는 교육청 다문화 공간혁신 정책의 선도적 사례입니다.',
        concerns: '학교운영위원회 심의와 소방법 규정을 통과하는 표준화 매뉴얼로 체계화되어야 확산 가능합니다.',
        sharpQuestion: '인천 관내 다문화 학교로 확산 가능한 표준 디자인 가이드라인을 어떻게 체계화할 것입니까?',
      },
      synthesisAdvice:
        '다문화 학부모의 "문화적 포용과 공동 창작", 공간디자이너의 "국제 표준 시인성과 색채 심리", 교육청 장학관의 "학교운영위 승인 및 표준 매뉴얼화"가 하나로 엮일 때 교내 공간 혁신이 완성됩니다. P4에 "다문화 학생 공동 워크숍"과 "교육청 공모전 연계 확산안"을 명시해 보세요.',
      suggestedP4Revision:
        '1) [다문화 학생-학부모 공동 창작]: 다문화 및 비다문화 학생 80명과 학부모회가 함께하는 "친절한 학교 픽토그램 12종" 기호 디자인 검수 워크숍 진행.\n2) [유니버설 시인성 A/B 실증]: 색각이상 대비비(4.5:1 이상) 및 원거리 시인성 표준을 적용한 시범 스티커를 특별실·복도에 부착하고 사전·사후 학교 소속감 설문 측정.\n3) [교육청 공간혁신 매뉴얼 기증]: 학교운영위원회 심의 승인 및 인천시교육청 다문화 어울림 공모전 출품을 통해 관내 초중고 무상 배포 가이드북 제작.',
    };
  }

  if (labId === 'business') {
    return {
      persona1: {
        name: '원도심 골목 소상공인 상인회장 (박만석 회장)',
        role: '신포국제시장·개항로 상인번영회',
        tone: '수십 년 골목을 지킨 상인의 절박하고 현실적인 어투',
        avatarIcon: 'Store',
        reaction: (practiceLen > 50 ? '조건부 찬성' : '우려 및 보완 필요') as '조건부 찬성' | '우려 및 보완 필요',
        strengths:
          `학생들이 우리 골목 상권의 침체와 대형 온라인 배달 쏠림을 외면하지 않고 ${projectSnippet}처럼 앵커스토어와 마일리지로 상생안을 내준 점이 고맙고 대견합니다.`,
        concerns:
          `하지만 현장에서 장사할 때는 당장 배달 오토바이나 1톤 조업 트럭이 설 자리가 없으면 하루 매출이 뚝 떨어집니다. 또 거리가 예뻐져 외지인이 몰려왔을 때 건물주가 월세를 올려 노포들이 쫓겨나는 "젠트리피케이션" 방지 대책이 계획서에 빠져 있습니다.`,
        sharpQuestion:
          '골목이 유명해졌을 때, 수십 년간 자리를 지킨 영세 상인들이 임대료 상승으로 쫓겨나지 않도록 보호할 실질적인 상생 협약 장치가 계획에 있습니까?',
      },
      persona2: {
        name: '기후소비자연대 협동조합 대표 (이지원 위원장)',
        role: '인천 녹색소비자네트워크·순환경제포럼',
        tone: '생태적 감수성과 자원순환 원칙을 지키는 비판적 전문가 어투',
        avatarIcon: 'TreePine',
        reaction: '조건부 찬성' as const,
        strengths:
          `골목상권 활성화에 '용기내 다회용기 챌린지'와 탄소중립 마일리지 알고리즘을 결합한 것은 단순 소비 진흥책을 넘어선 훌륭한 21세기형 ESG 순환경제 기획입니다.`,
        concerns:
          `일회성 텀블러 스탬프 투어는 이벤트가 끝나면 다회용기 회수율이 급감합니다. 상점가 내 세척·소독 인프라(다회용기 공유 허브)와 같은 실질적 순환 설비가 갖춰지지 않으면 그린워싱에 머물 수 있습니다.`,
        sharpQuestion:
          '상인들에게 설거지 부담을 전가하지 않고 다회용기가 위생적으로 순환될 수 있는 역내 세척·회수 거점 인프라 구축안이 마련되어 있습니까?',
      },
      persona3: {
        name: '인천광역시 소상공인정책과 주무관 (최형석 주무관)',
        role: '인천시청 경제산업본부 소상공인정책과',
        tone: '인천e음 지역화폐 예산과 조례의 행정적 현실성을 따지는 공무원 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths:
          `인천시가 역점 추진 중인 지역화폐(인천e음)의 캐시백 정책을 단순 소비 보조금에서 로컬 자본의 역내 재투자 선순환 고리로 진화시키려는 시도가 매우 창의적입니다.`,
        concerns:
          `새로운 마일리지 시스템을 구축하려면 민간 POS 단말기 소프트웨어 업그레이드 비용과 정산 수수료 분담 문제가 발생합니다. 한정된 소상공인 지원 기금 내에서 민간 플랫폼과의 수수료 협상 및 구청-시청 간의 예산 매칭 근거가 필요합니다.`,
        sharpQuestion:
          '기존 인천e음 플랫폼 API와 학생이 제안한 번들형 마일리지 시스템을 연동할 때 발생하는 시스템 구축 비용과 소상공인 분담금의 행정적 타당성은 어떻게 입증할 것입니까?',
      },
      merchant: {
        name: '원도심 골목 소상공인 상인회장 (박만석 회장)',
        role: '신포국제시장·개항로 상인번영회',
        tone: '상인의 절박하고 현실적인 어투',
        avatarIcon: 'Store',
        reaction: '조건부 찬성' as const,
        strengths: '골목상권 침체를 해결하려는 학생들의 따뜻한 문제의식에 감사드립니다.',
        concerns: '매출 증가 이후 임대료 폭등(젠트리피케이션) 방지 상생협약이 반드시 포함되어야 합니다.',
        sharpQuestion: '골목이 살아났을 때 영세 상인들이 쫓겨나지 않도록 지켜줄 안전장치가 있습니까?',
      },
      environmental: {
        name: '기후소비자연대 협동조합 대표 (이지원 위원장)',
        role: '인천 녹색소비자네트워크·순환경제포럼',
        tone: '순환경제와 자원 절약의 원칙을 따지는 전문가 어투',
        avatarIcon: 'TreePine',
        reaction: '조건부 찬성' as const,
        strengths: '골목상권에 탄소중립 마일리지와 다회용기 순환을 접목한 기획이 훌륭합니다.',
        concerns: '상인에게 부담을 주지 않는 공동 다회용기 세척·회수 허브 인프라가 필수적입니다.',
        sharpQuestion: '이벤트 종료 후에도 다회용기 순환이 자생적으로 유지될 수 있는 경제적 유인이 있습니까?',
      },
      official: {
        name: '인천광역시 소상공인정책과 주무관 (최형석 주무관)',
        role: '인천시청 경제산업본부 소상공인정책과',
        tone: '지역화폐 예산과 조례 개정의 타당성을 따지는 공무원 어투',
        avatarIcon: 'Building2',
        reaction: '조건부 찬성' as const,
        strengths: '인천e음 지역화폐와 연계한 로컬 선순환 경제 모델링이 매우 시의적절합니다.',
        concerns: 'POS 단말기 연동 비용과 상생협력상가 지원 조례 개정의 현실성을 갖추어야 합니다.',
        sharpQuestion: '인천e음 플랫폼과 연동하는 시스템 구축비와 운영 예산을 어떻게 조달할 계획입니까?',
      },
      synthesisAdvice:
        '상인의 "임대료 안정과 생업 유지", 환경전문가의 "다회용기 공유 허브 인프라", 공무원의 "인천e음 API 연동 및 조례 개정"이라는 세 이해관계자의 팽팽한 긴장을 조율할 때 실천이 완성됩니다. P4에 "상생협력상가 5년 협약"과 "공동 세척 허브" 조항을 반영해 보세요.',
      suggestedP4Revision:
        '1) [상생협력상가 5년 임대료 안정 협약]: 상권 활성화 시 원주민 상인 축출(젠트리피케이션)을 방지하기 위해 건물주-상인회-구청 간 "상생협력상가 5년 임대료 동결·상한 협약" 체결.\n2) [친환경 다회용기 세척 거점 구축]: 신포·개항장 일대 15개 매장과 협력하여 상인 설거지 부담 없는 "동네 다회용기 공용 세척·회수 스테이션" 시범 설치.\n3) [인천e음 로컬 순환 조례 청원]: 인천광역시 소상공인 지원 조례에 "로컬 앵커스토어 연계형 마일리지 플랫폼 지원" 조항 신설 및 시의회 정책간담회 개최.',
    };
  }

  // Default: humanities (노인 디지털 기본권 & 포용적 공론장)
  return {
    persona1: {
      name: '원도심 어르신 당사자 대표 (박순자 어르신, 76세)',
      role: '인천 동구·중구 원도심 노인복지관 자치회',
      tone: '일상의 소외와 서러움을 겪은 어르신의 절박하고 솔직한 어투',
      avatarIcon: 'Users',
      reaction: (hasAction ? '적극 지지' : '조건부 찬성') as '적극 지지' | '조건부 찬성',
      strengths:
        `학생들이 우리 같은 늙은이들이 햄버거 하나, 지하철 표 하나 끊기 두려워 가게 앞에서 서성이는 모습을 그냥 지나치지 않고 ${projectSnippet}처럼 깊이 고민해 주어 코끝이 찡합니다.`,
      concerns:
        `하지만 청소년들이 와서 며칠 친절하게 가르쳐주는 자원봉사는 고맙지만 한 달 지나면 금방 끝나버립니다. 우리가 바라는 건 가게 주인이 귀찮아하지 않고 버튼 하나만 누르면 직원이 나와서 따뜻하게 눈을 마주쳐 주는 '영구적인 배려 장치'입니다.`,
      sharpQuestion:
        '청소년 자원봉사가 끝난 뒤에도 어르신들이 눈치 보지 않고 당당하게 매장 문을 열 수 있도록, 가게와 시청이 계속 유지해야 할 제도적 의무는 무엇입니까?',
    },
    persona2: {
      name: '인권·디지털포용 시민연대 활동가 (정민우 간사)',
      role: '인천 평화복지연대 디지털인권위원회',
      tone: '헌법상 기본권과 구조적 배제를 짚어내는 비판적 인권활동가 어투',
      avatarIcon: 'HeartHandshake',
      reaction: '적극 지지' as const,
      strengths:
        `기술 효율성 지상주의가 초래한 노인 소외를 단순한 불편함이 아닌 헌법상 기본권 침해와 하버마스 공론장 배제의 관점에서 학술적으로 규명하려는 문제의식이 매우 탁월합니다.`,
      concerns:
        `다만 '디지털 다정 가게'와 같은 자발적 민간 캠페인은 상인들의 참여 유인이 부족할 경우 형식적인 현판 달기에 그칠 수 있습니다. 대기업 프랜차이즈 본사의 무인기기 조달 기준을 바꾸어낼 수 있는 강력한 사회적 담론 형성이 뒷받침되어야 합니다.`,
      sharpQuestion:
        '민간 자영업자의 인건비 절감 논리와 고령층의 일상적 접근권이 정면으로 충돌할 때, 청소년 연구자가 제시하는 인권 기반의 상생 타협점은 무엇입니까?',
    },
    persona3: {
      name: '인천광역시 스마트도시복지과 주무관 (김태현 주무관)',
      role: '인천시청 미래산업국 정보화담당관 스마트복지팀',
      tone: '조례 입법과 한정된 복지 예산의 배분을 따지는 공무원 어투',
      avatarIcon: 'Building2',
      reaction: '조건부 찬성' as const,
      strengths:
        `인천시가 역점 추진 중인 "디지털 포용도시 인천" 정책 및 고령친화도시 마스터플랜에 청소년 연구팀의 FGI 인터뷰 데이터가 훌륭한 행정 사각지대 지표로 활용될 수 있습니다.`,
      concerns:
        `지자체가 민간 상가에 특정 키오스크 UI를 강제할 법적 권한은 제한적입니다. '디지털 다정 가게' 인증을 유도하려면 종량제봉투 지원이나 소상공인 경영자금 이자 감면과 같은 실질적 재정 인센티브가 결합되어야 하며, 이를 위한 시의회 조례 개정이 필수적입니다.`,
      sharpQuestion:
        '인천시 조례에 고령친화 무인 단말기 도입 지원 조항을 신설할 때, 시의회와 재정 부서를 설득할 비용 대비 편익(B/C) 타당성 논거는 무엇입니까?',
    },
    merchant: {
      name: '원도심 어르신 당사자 대표 (박순자 어르신, 76세)',
      role: '인천 동구·중구 원도심 노인복지관 자치회',
      tone: '어르신 당사자의 절박한 대면 소통 희망 어투',
      avatarIcon: 'Users',
      reaction: '적극 지지' as const,
      strengths: '키오스크 앞에서 소외되는 노인들의 아픔을 따뜻하게 조명해 주어 고맙습니다.',
      concerns: '단기 봉사활동에 그치지 않는 지속적인 매장 대면 배려 시스템이 필요합니다.',
      sharpQuestion: '어르신들이 기계 앞에서 주눅 들지 않도록 보장하는 영구적인 대책이 계획서에 있습니까?',
    },
    environmental: {
      name: '인권·디지털포용 시민연대 활동가 (정민우 간사)',
      role: '인천 평화복지연대 디지털인권위원회',
      tone: '디지털 기본권과 공론장 이론을 강조하는 비판적 인권활동가 어투',
      avatarIcon: 'HeartHandshake',
      reaction: '적극 지지' as const,
      strengths: '무인화 확산 속 노인 디지털 기본권 침해를 하버마스 공론장 관점에서 규명한 점이 뛰어납니다.',
      concerns: '자발적 상인 참여 캠페인을 넘어 제도적·법적 권리 보장으로 격상되어야 합니다.',
      sharpQuestion: '효율성을 추구하는 기술 사회에서 약자의 존엄을 어떻게 법적으로 보장할 수 있습니까?',
    },
    official: {
      name: '인천광역시 스마트도시복지과 주무관 (김태현 주무관)',
      role: '인천시청 미래산업국 정보화담당관 스마트복지팀',
      tone: '고령친화도시 조례와 예산 타당성을 따지는 공무원 어투',
      avatarIcon: 'Building2',
      reaction: '조건부 찬성' as const,
      strengths: '인천시 디지털 포용도시 시정 방향에 부합하는 참신한 청소년 제안입니다.',
      concerns: '민간 자영업자 유인을 위한 쓰레기봉투·세제 혜택 등 조례 개정과 예산 뒷받침이 필수적입니다.',
      sharpQuestion: '시의회 조례 개정과 영세 상인 인센티브 재원을 마련할 행정적 근거는 무엇입니까?',
    },
    synthesisAdvice:
      '어르신 당사자의 "상시적 대면 배려 요구", 인권활동가의 "디지털 기본권 권리화", 복지행정관의 "지자체 인센티브 조례 개정"이라는 세 이해관계자의 목소리를 하나로 엮는 것이 인문사회 정책의 진수입니다. P4에 "노인복지관-상인회 1:1 결연"과 "시의회 조례 청원서 제출"을 명시해 보세요.',
    suggestedP4Revision:
      '1) [청소년-어르신 디지털 동행 지속화]: 동구·중구 노인복지관과 협약하여 정기적인 1:1 키오스크 실습 동행 프로그램 매뉴얼 제작 및 상시 멘토링 운영.\n2) [디지털 다정 가게 인증 캠페인]: 원도심 소상공인 번영회와 협력하여 큰 글씨 모드·호출 벨을 갖춘 점포에 인증 현판을 부착하고 지자체 쓰레기봉투 지원 인센티브 연계.\n3) [인천시 고령친화 디지털 기본권 조례 청원]: 인천광역시의회에 "공공 및 다중이용시설 무인 정보단말기 접근성 보장 조례안" 주민 청원서 공식 제출.',
  };
}

// Heuristic Fallback for AI Text-to-Chart Generator
function generateFallbackTextToChart(query: string) {
  const q = (query || '').toLowerCase();

  // 1. 청년 고용률 & 1인가구 비교 (연수구 vs 동구 및 자치구 비교)
  if (
    q.includes('고용') ||
    q.includes('1인가구') ||
    q.includes('일자리') ||
    (q.includes('청년') && (q.includes('동구') || q.includes('연수') || q.includes('비교') || q.includes('고용')))
  ) {
    return {
      chartType: 'bar',
      title: '연수구 vs 동구 청년 고용률 및 1인가구 비교 분석',
      subtitle: '통계청 KOSIS 및 인천 경제통계 기준 신도심과 원도심의 청년 고용 및 가구 구조 (단위: %)',
      xAxisLabel: '비교 자치구 및 항목',
      yAxisLabel: '비율 (%)',
      series: [
        { label: '연수구 청년고용률', value: 52.4, category: '청년 고용률 (송도 바이오·R&D)', color: '#4F46E5' },
        { label: '동구 청년고용률', value: 41.2, category: '청년 고용률 (전통 철강·제조업)', color: '#F43F5E' },
        { label: '인천평균 청년고용률', value: 47.8, category: '청년 고용률 (시 평균)', color: '#64748B' },
        { label: '연수구 1인가구', value: 28.5, category: '1인가구 비율 (아파트 중심 정주)', color: '#6366F1' },
        { label: '동구 1인가구', value: 39.4, category: '1인가구 비율 (원도심 고령·취약 단독가구)', color: '#E11D48' },
        { label: '인천평균 1인가구', value: 33.2, category: '1인가구 비율 (시 평균)', color: '#94A3B8' },
      ],
      aiInsight:
        '송도 바이오 클러스터와 첨단 R&D 일자리가 집중된 연수구는 청년 고용률(52.4%)이 높고 1인가구 비율(28.5%)이 낮은 반면, 전통 철강·제조업 기반의 원도심 동구는 양질의 청년 일자리 부족으로 청년 고용률이 41.2%로 낮고 독거노인 중심의 1인가구 비율이 39.4%에 달해 극명한 사회경제적 격차를 드러냅니다.',
      p1Citation:
        '[통계 관찰 현상] 신도심 연수구의 청년 고용률은 52.4%로 원도심 동구(41.2%)보다 11.2%p 높았으며, 1인가구 비율은 동구(39.4%)가 연수구(28.5%)보다 10.9%p 높아 원도심의 청년 일자리 결핍과 취약 1인가구 밀집이 확인됨.',
      p2Citation:
        '[구조적 원인 규명] 첨단 지식기반 산업 인프라가 송도 경제자유구역으로 집중된 반면 원도심은 전통 중화학 제조업 쇠퇴와 청년 선호 신산업 유치 실패로 청년인구 유출 및 고령 1인가구 고착화라는 이중의 공간적 불평등 구조를 형성함.',
    };
  }

  // 2. 초미세먼지 농도와 공업지역 / 산업단지 상관관계
  if (q.includes('미세먼지') || q.includes('공업') || q.includes('대기') || q.includes('오염')) {
    return {
      chartType: 'bar',
      title: '인천 10개 군·구 초미세먼지(PM2.5) 및 산업단지 배후 영향 비교',
      subtitle: '에어코리아 및 산업통계 기준 연평균 대기질 (단위: ㎍/㎥)',
      xAxisLabel: '자치구',
      yAxisLabel: '초미세먼지 농도 (㎍/㎥)',
      series: [
        { label: '옹진군', value: 14.8, category: '청정 도서지역', color: '#16A34A' },
        { label: '강화군', value: 16.5, category: '청정 도서지역', color: '#15803D' },
        { label: '연수구(송도)', value: 18.2, category: '해안 신도심', color: '#4F46E5' },
        { label: '계양구', value: 19.4, category: '산업·주거복합', color: '#0EA5E9' },
        { label: '남동구(공단)', value: 20.8, category: '제조산단 집중', color: '#F59E0B' },
        { label: '부평구(공단)', value: 21.2, category: '제조산단 집중', color: '#D97706' },
        { label: '서구(공단·발전)', value: 21.9, category: '에너지·화학산단', color: '#EA580C' },
        { label: '미추홀구', value: 22.4, category: '원도심 도심열섬', color: '#E11D48' },
        { label: '동구(제철·산업)', value: 22.8, category: '중화학공업 밀집', color: '#BE123C' },
        { label: '중구(항만·물류)', value: 23.5, category: '항만·대형디젤물류', color: '#991B1B' },
      ],
      aiInsight:
        '대형 항만 화물트럭과 중화학 제철공장이 밀집한 중구(23.5㎍/㎥)와 동구(22.8㎍/㎥), 남동산단을 낀 남동·부평 등 공업·물류 지역이 도서 생태지역(14~16㎍/㎥)이나 송도 신도심(18.2㎍/㎥)보다 연평균 초미세먼지 농도가 최대 1.6배 높게 나타나 환경 불평등의 뚜렷한 공간적 상관관계를 보여줍니다.',
      p1Citation:
        '[통계 관찰 현상] 항만 물류 거점인 중구(23.5㎍/㎥)와 제철소 밀집 동구(22.8㎍/㎥)의 초미세먼지 농도는 도서지역 및 송도(18.2㎍/㎥)에 비해 현저히 높아 공업·항만 배후지의 환경 위해도가 확인됨.',
      p2Citation:
        '[구조적 원인 규명] 디젤 대형 화물차 이동 경로와 대형 산업단지가 원도심 주거지역과 인접해 형성된 환경정의(Environmental Justice)의 결핍과 완충 녹지 부족에 기인함.',
    };
  }

  // 3. 고령자 / 노인 / 인구 구조 고령화율
  if (q.includes('고령') || q.includes('노인') || q.includes('고령화') || q.includes('실버')) {
    return {
      chartType: 'bar',
      title: '인천 10개 군·구 65세 이상 고령화율 비교',
      subtitle: '통계청 KOSIS 기준 자치구별 초고령화 진행 현황 (단위: %)',
      xAxisLabel: '자치구',
      yAxisLabel: '고령자 비율 (%)',
      series: [
        { label: '연수구(송도)', value: 11.2, category: '신도심·경제자유구역', color: '#4F46E5' },
        { label: '서구(청라)', value: 13.5, category: '신도심·경제자유구역', color: '#6366F1' },
        { label: '계양구', value: 16.2, category: '산업·주거복합', color: '#0EA5E9' },
        { label: '남동구', value: 16.8, category: '산업·주거복합', color: '#06B6D4' },
        { label: '부평구', value: 18.4, category: '산업·주거복합', color: '#14B8A6' },
        { label: '중구', value: 20.1, category: '원도심·항만', color: '#F59E0B' },
        { label: '미추홀구', value: 24.2, category: '원도심·항만', color: '#E11D48' },
        { label: '동구', value: 24.8, category: '원도심·항만', color: '#BE123C' },
        { label: '옹진군', value: 29.5, category: '도서·생태지역', color: '#16A34A' },
        { label: '강화군', value: 36.8, category: '도서·생태지역', color: '#15803D' },
      ],
      aiInsight:
        '원도심(동구 24.8%, 미추홀구 24.2%)과 농어촌 도서지역(강화군 36.8%)은 이미 초고령사회에 깊숙이 진입한 반면, 신도시(연수구 11.2%)는 전국 평균보다 젊은 세대가 밀집해 공간적 인구 양극화가 뚜렷합니다.',
      p1Citation:
        '[통계 관찰 현상] 동구와 미추홀구의 65세 이상 고령인구 비율은 24%를 초과하는 반면 연수구는 11.2%로 자치구 간 고령화율 편차가 2.2배에 달함.',
      p2Citation:
        '[구조적 원인 규명] 신도시로의 주거·교육 인프라 및 신규 일자리 쏠림으로 인한 청년층 유출과 원도심 주거 노후화가 결합된 구조적 인구 절벽 현상임.',
    };
  }

  // 4. 도시공원 / 녹지 / 열섬
  if (q.includes('공원') || q.includes('녹지') || q.includes('열섬') || q.includes('산책')) {
    return {
      chartType: 'bar',
      title: '인천 10개 군·구 1인당 도시공원면적 현황',
      subtitle: '도시계획 시설 통계 기준 (단위: ㎡/인)',
      xAxisLabel: '자치구',
      yAxisLabel: '공원면적 (㎡)',
      series: [
        { label: '동구', value: 3.8, category: '원도심·항만', color: '#BE123C' },
        { label: '미추홀구', value: 5.1, category: '원도심·항만', color: '#E11D48' },
        { label: '중구', value: 7.4, category: '원도심·항만', color: '#F43F5E' },
        { label: '부평구', value: 8.9, category: '산업·주거복합', color: '#F59E0B' },
        { label: '계양구', value: 10.3, category: '산업·주거복합', color: '#0EA5E9' },
        { label: '남동구', value: 12.6, category: '산업·주거복합', color: '#06B6D4' },
        { label: '서구', value: 18.2, category: '신도심·경제자유구역', color: '#6366F1' },
        { label: '강화군', value: 24.1, category: '도서·생태지역', color: '#16A34A' },
        { label: '옹진군', value: 26.5, category: '도서·생태지역', color: '#15803D' },
        { label: '연수구(송도)', value: 28.4, category: '신도심·경제자유구역', color: '#4F46E5' },
      ],
      aiInsight:
        '송도국제도시가 속한 연수구는 1인당 28.4㎡의 압도적인 공원 녹지를 갖춘 반면, 원도심 동구는 3.8㎡에 불과해 약 7.5배의 녹지 격차가 발생하고 있으며, 이는 여름철 도심 열섬현상 일수의 격차로 직결됩니다.',
      p1Citation:
        '[통계 관찰 현상] 연수구 1인당 도시공원면적은 28.4㎡인 반면 동구는 3.8㎡에 그쳐 녹지 복지 인프라의 7.5배 격차가 실측됨.',
      p2Citation:
        '[구조적 원인 규명] 개항기 이후 공장과 주거가 자연발생적으로 뒤섞여 형성된 원도심과 갯벌 매립 단계부터 광역 녹지축을 설계한 계획도시 간의 토지계획 격차임.',
    };
  }

  // Default comparison
  return {
    chartType: 'bar',
    title: '인천 권역별 대표 사회·환경 지표 비교',
    subtitle: '권역별 핵심 지표 복합 분석 (단위: 상대지수 100점 환산)',
    xAxisLabel: '권역',
    yAxisLabel: '종합 지수',
    series: [
      { label: '경제자유구역(연수·서구)', value: 88, category: '신도심', color: '#4F46E5' },
      { label: '산업·주거복합(남동·부평)', value: 72, category: '산업도시', color: '#0EA5E9' },
      { label: '원도심·항만(중·동·미추홀)', value: 58, category: '원도심', color: '#E11D48' },
      { label: '도서·생태(강화·옹진)', value: 81, category: '생태거점', color: '#16A34A' },
    ],
    aiInsight:
      '인천은 신도심의 경제·환경 인프라 우위와 원도심의 노후화 및 인구 감소, 그리고 도서지역의 천혜의 생태 자산이 공존하는 다층적 공간 구조를 지니고 있습니다.',
    p1Citation:
      '[통계 관찰 현상] 권역별 정주 만족도 및 인프라 지수에서 신도심(88점)과 원도심(58점) 간 30점의 격차가 확인됨.',
    p2Citation:
      '[구조적 원인 규명] 거점 개발 위주의 도시계획과 자본 집중이 낳은 내부 공간 불균형 및 포용적 재생 정책의 지연 문제임.',
  };
}

function generateFallbackStepAssist(
  step: 'phenomenon' | 'problem' | 'project' | 'practice',
  mode: 'draft' | 'polish' | 'expand',
  labName?: string,
  topicTitle?: string,
  mainQuestion?: string,
  currentText?: string
) {
  const lab = labName || '로컬리티 전공연계';
  const title = topicTitle || '인천 지역사회 4P 탐구';

  if (mode === 'draft') {
    const templates: Record<string, string> = {
      phenomenon: `최근 인천 지역사회에서 ${title}와(과) 관련하여 일상적 불편과 사회적 비용이 가중되는 현상이 두드러지고 있다. 특히 현장 관찰과 공공데이터 지표 분석에 따르면 원도심과 신도심 간의 인프라 접근성 격차 및 세대·계층별 불평등이 실질적인 지표 수치로 확인되며, 이는 단순한 개인의 불편을 넘어 지역사회 차원의 구조적 과제로 대두되고 있다.`,
      problem: `이러한 현상이 지속되는 근본적 원인은 ${lab} 관점에서 볼 때, 단기적 효율성 위주의 정책 집행과 사회적 약자의 이용 접근성을 배제한 제도적 한계에 기인한다. 공간적 거점 개발에 편중된 자본 집중과 다원적 의견 수렴 구조의 부재로 인해 사회적 배제 메커니즘이 고착화되고 있다.`,
      project: `본 연구에서는 ${lab}의 핵심 학술 방법론을 적용하여 실증적 데이터를 수집하고 분석하고자 한다. 인천 관내 현장 답사(걷기)를 통한 1차 정성 데이터 수집과 공공데이터포털의 2차 통계 분석을 결합한 혼합 연구방법(Mixed Methods)을 설계하여, 문제의 심각성을 정량적으로 규명하고 이해관계자 인터뷰를 통해 개선 방안을 도출한다.`,
      practice: `연구 결과를 바탕으로 1) 청소년-지역 주민이 함께하는 현장 실천 캠페인 전개, 2) 지자체 및 유관기관 대상 정책 제안서 전달 및 조례 개정 청원, 3) 학교 교육과정과 연계한 실천 매뉴얼 배포의 3단계 실행 과업을 추진하여 지속가능한 사회적 변화를 도모한다.`,
    };

    return {
      resultText: templates[step] || templates.phenomenon,
      keywords: ['사회적 배제', '혼합연구방법', '지역사회 상생', '지속가능성'],
      tip: '작성된 초안에 본인이 직접 조사한 인천 지역(군·구)의 실제 수치나 관찰 기록을 추가하면 더욱 설득력 있는 글이 됩니다.',
    };
  }

  if (mode === 'polish') {
    const text = (currentText || '').trim();
    const polished = text.length > 10
      ? text
          .replace(/것 같아요|생각해요|것 같다/g, '것으로 분석된다')
          .replace(/너무 많아서|많다/g, '지속적으로 누적되고 있으며')
          .replace(/해결해야 한다|고쳐야 한다/g, '실효성 있는 정책적 보완이 시급하다')
          .replace(/인천에서/g, '인천광역시 지역 현장에서')
      : `본 탐구는 ${lab} 분야의 학술적 시각을 바탕으로, ${title}의 구조적 원인을 실증하고 지속가능한 실천 대안을 도출하는 데 연구의 목적을 둔다.`;

    return {
      resultText: polished,
      polishedPoints: [
        '구어체 표현을 학술 보고서에 적합한 격식체 종결어미(~로 분석된다, ~가 시급하다)로 전환',
        '원인과 결과 사이의 논리적 결속성과 학술적 어휘 수준 강화',
      ],
      tip: '탐구 보고서에서는 주관적인 감정 표현보다 구체적인 근거와 객관적 진술을 유지하는 것이 좋습니다.',
    };
  }

  // mode === 'expand'
  const expandSuggestions: Record<string, any[]> = {
    phenomenon: [
      { title: '인천 공공데이터 수치 인용', description: '인천시 10개 군·구별 관련 통계(대기질, 고령화율, 상권 공실률 등)를 수치(%, 건수)로 직접 인용하여 신뢰성을 높이세요.' },
      { title: '현장 답사(걷기) 사진 및 관찰 일지', description: '신포시장, 송도 센트럴파크, 배다리 등 현장에서 촬영한 사진과 1차 관찰 메모를 현상 근거로 제시하세요.' },
      { title: '비교 대조군 설정', description: '원도심과 신도심, 혹은 국내 타 지자체의 유사 사례와 비교하여 문제의 시급성을 부각하세요.' },
    ],
    problem: [
      { title: '전공 이론 접목', description: `${lab}의 대표 이론(사회학적 공론장 이론, 행동경제학의 넛지, 환경생태학의 생태복원력 등)을 원인 분석의 틀로 활용하세요.` },
      { title: '다층적 원인 분석 (개인-제도-공간)', description: '단순한 개인의 부주의가 아니라 제도적 법규 미비, 도시 공간 구조의 비효율성 등 3차원 원인을 규명하세요.' },
      { title: '이해관계자 간 이해충돌 분석', description: '정책 당국, 소상공인, 이용 시민 간의 상충되는 요구(Trade-off)를 짚어보세요.' },
    ],
    project: [
      { title: '정량+정성 혼합 연구 설계', description: '설문조사(정량)와 3~4명의 핵심 관계자 심층 인터뷰(FGI, 정성)를 병행하여 연구의 입체성을 확보하세요.' },
      { title: '프로토타입 제작 및 실증', description: '아이디어를 시제품(웹앱, 픽토그램 안내판, 알고리즘 모델 등)으로 제작해 소규모 A/B 테스트를 시도하세요.' },
      { title: '연구 윤리 및 표본 타당성', description: '조사 대상자 선정 기준과 익명성 보장 등 연구 윤리 항목을 명시하세요.' },
    ],
    practice: [
      { title: '학교 내 실천 캠페인', description: '동아리 및 학생회와 연계하여 교내 인식 개선 캠페인과 서명 운동을 진행하세요.' },
      { title: '지자체 조례 및 정책 청원', description: '인천시의회 "시민청원"이나 구청 담당 부서에 제출할 수 있는 공문 형식의 제안서를 완성하세요.' },
      { title: '오픈소스/가이드북 배포', description: '타 학교나 다른 지역 청소년들도 복제·적용할 수 있는 실천 매뉴얼(PDF/리플릿)을 제작해 공유하세요.' },
    ],
  };

  return {
    resultText: `${lab} 관점에서 탐구의 완성도를 한 단계 끌어올릴 수 있는 3가지 심화 방향입니다.`,
    suggestions: expandSuggestions[step] || expandSuggestions.phenomenon,
    tip: '3가지 제안 중 본인이 이번 학기에 가장 실현 가능한 1~2가지를 선택하여 4P 본문에 반영해보세요.',
  };
}

function generateFallbackChatReply(userMessage: string, projectContext: any) {
  const msg = (userMessage || '').toLowerCase();
  const lab = projectContext.labName || '선택한 전공';
  const title = projectContext.title || '4P 탐구 프로젝트';

  if (msg.includes('질문') || msg.includes('주제') || msg.includes('업그레이드')) {
    return {
      reply: `현재 '${title}' 탐구는 [${lab}]의 학술적 시선이 잘 담겨 있습니다!\n\n더 날카롭고 학술적인 질문으로 업그레이드하려면 다음 공식을 적용해보세요:\n• **[원인-결과 연계형]**: 단순 "어떻게 해결할까?" 대신 "XX라는 구조적 원인이 지역사회 YY 불평등에 미치는 영향은 무엇인가?"\n• **[실천 지향형]**: "${lab} 방법론을 접목하여 인천 원도심의 지속가능한 상생 모델을 어떻게 설계·검증할 것인가?"\n\n상단의 [AI 평가] 탭을 누르시면 수준별 3단계 질문을 바로 적용하실 수 있습니다.`,
      suggestedPrompts: ['P1 현상 작성 예시 보여줘', '인천 공공데이터 어떻게 인용해?', 'P4 실천 방안 추천해줘'],
    };
  }

  if (msg.includes('데이터') || msg.includes('통계') || msg.includes('공공데이터')) {
    return {
      reply: `인천광역시 탐구에 인용하기 좋은 핵심 공공데이터는 다음과 같습니다:\n\n1. **인천 10개 군·구 대기오염 및 미세먼지 실시간 지표 (에어코리아)**\n2. **KOSIS 군·구별 연령별 주민등록인구 및 고령화 지수**\n3. **소상공인 상권 정보 및 공실률 통계**\n4. **교통약자 이동편의시설 보행환경 조사 데이터**\n\n상단 메뉴의 [공공데이터 포털 20종] 버튼을 누르시면 원클릭으로 모의 시뮬레이터와 정식 규격 데이터를 확인하고 4P에 바로 인용하실 수 있습니다.`,
      suggestedPrompts: ['송도와 원도심 데이터 격차 분석해줘', 'P2 문제 원인 문장 다듬어줘', '보고서 인쇄 어떻게 해?'],
    };
  }

  if (msg.includes('걷기') || msg.includes('답사') || msg.includes('현장')) {
    return {
      reply: `'읽·걷·쓰'에서 걷기(현장 답사)는 단순한 산책이 아니라 **1차 관찰 데이터의 보고**입니다!\n\n• **인문사회/경영**: 배다리 헌책방 골목, 신포국제시장, 개항장 거리에서 노인 보행권과 소상공인 간판 관찰\n• **첨단공학/AI**: 부평역 환승센터, 송도 스마트시티에서 도로 단차와 교통약자 이동 동선 실사\n• **자연생태/바이오**: 소래습지생태공원, 강화도 갯벌에서 염생식물과 블루카본 토양 관찰\n\n답사 후 [걷기 몰입] 탭에서 관찰 기록을 남기시면 자동으로 보고서와 연동됩니다!`,
      suggestedPrompts: ['P3 연구방법 추천해줘', '세특 작성 도우미 어떻게 써?', '내 탐구 4P 피드백 해줘'],
    };
  }

  return {
    reply: `반갑습니다! 인천 '읽·걷·쓰' 4P 전공연계 사회문제탐구 AI 멘토입니다.\n\n현재 진행 중이신 [${lab}] 분야의 '${title}' 탐구와 관련하여 어떤 점이 궁금하신가요?\n• 4P(현상-문제-과업-실천) 각 단계별 글 작성 조언\n• 인천 지역 공공데이터 연계 및 인용법\n• 걷기(현장 답사) 체크리스트 및 추천 장소\n• 학생부 세특 작성 및 보고서 완성 팁\n\n무엇이든 편하게 물어보세요!`,
    suggestedPrompts: ['내 질문을 학술형으로 바꿔줘', 'P3 연구방법론 예시 알려줘', '인천 공공데이터 추천해줘'],
  };
}

// Vite middleware configuration
async function startServer() {


  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`4P 읽걷쓰 전공연계 사회문제탐구 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
