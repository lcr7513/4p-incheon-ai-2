import { ResearchProject, LabId } from '../types';
import { autoDistributeFourP } from './fourPParser';
import { calculateNeisBytes } from './citationFormatter';

export interface RadarMetric {
  axis: string;
  key: string;
  value: number; // 0 ~ 100
  benchmark: number; // 0 ~ 100 (standard recommendation)
  description: string;
  status: '우수' | '양호' | '보완필요';
}

export interface ReadWalkWriteBalance {
  readScore: number;
  walkScore: number;
  writeScore: number;
  readPct: number;
  walkPct: number;
  writePct: number;
  totalScore: number;
  assessmentTitle: string;
  assessmentDesc: string;
  readCount: number;
  walkCount: number;
  totalSteps: number;
  totalBytes: number;
}

export interface IncheonDistrictDataPoint {
  district: string;
  value: number;
  unit: string;
  isFocusDistrict?: boolean;
  highlightNote?: string;
}

export interface DistrictMetricSet {
  metricId: string;
  labId: LabId;
  title: string;
  subtitle: string;
  unit: string;
  incheonAverage: number;
  source: string;
  insight: string;
  data: IncheonDistrictDataPoint[];
}

/**
 * 1. 4P 탐구 역량 5개 축 평가 산출
 */
export function calculateAcademicRadarMetrics(project: ResearchProject): RadarMetric[] {
  const dist = autoDistributeFourP(project.fourP);
  const p = dist.distributed;

  // 1) P1: 현상 포착력 (관찰 구체성, 수치/통계 인용 여부, 길이)
  const p1Len = (p.phenomenon || '').trim().length;
  const hasNumbers = /\d+[%|명|개|곳|건|원|억|ha|km|m|%|ppm|㎍]/.test(p.phenomenon || '');
  const p1ReadingLink = (project.readingLogs || []).filter((r) => r.linked4PStep === 'P1').length;
  let p1Val = Math.min(95, Math.round((p1Len / 250) * 60) + (hasNumbers ? 20 : 5) + Math.min(15, p1ReadingLink * 8));
  if (p1Val < 35 && p1Len > 20) p1Val = 45;
  if (!p1Len) p1Val = 20;

  // 2) P2: 원인 분석력 (구조적 원인, 메커니즘 키워드)
  const p2Len = (p.problem || '').trim().length;
  const causalityKeywords = ['원인', '구조', '제도', '모순', '배제', '불평등', '메커니즘', '요인', '배경', '취약'];
  const p2MatchCount = causalityKeywords.filter((k) => (p.problem || '').includes(k)).length;
  let p2Val = Math.min(95, Math.round((p2Len / 250) * 55) + Math.min(30, p2MatchCount * 10) + 10);
  if (p2Val < 35 && p2Len > 20) p2Val = 50;
  if (!p2Len) p2Val = 20;

  // 3) P3: 학술 설계력 (전공 방법론, 실험, 설문, 분석 기법)
  const p3Len = (p.project || '').trim().length;
  const methodKeywords = ['분석', '설문', '실험', '측정', '인터뷰', '알고리즘', '모형', '이론', '검정', 'ANOVA', '조사', '데이터'];
  const p3MatchCount = methodKeywords.filter((k) => (p.project || '').includes(k)).length;
  const hasPaperLog = (project.readingLogs || []).some((r) => r.mediaType === 'paper');
  let p3Val = Math.min(95, Math.round((p3Len / 250) * 50) + Math.min(25, p3MatchCount * 8) + (hasPaperLog ? 15 : 5));
  if (p3Val < 35 && p3Len > 20) p3Val = 48;
  if (!p3Len) p3Val = 20;

  // 4) P4: 실천 파급력 (지역사회 제언, 조례, 캠페인, 실행력)
  const p4Len = (p.practice || '').trim().length;
  const actionKeywords = ['실천', '캠페인', '제언', '조례', '인천', '학교', '플랫폼', '정책', '연계', '참여', '해결'];
  const p4MatchCount = actionKeywords.filter((k) => (p.practice || '').includes(k)).length;
  let p4Val = Math.min(95, Math.round((p4Len / 250) * 55) + Math.min(30, p4MatchCount * 8) + 10);
  if (p4Val < 35 && p4Len > 20) p4Val = 46;
  if (!p4Len) p4Val = 20;

  // 5) 인용 및 연구윤리 충실도 (문헌 수, 걷기 현장 증빙, 윤리 서약, 체크리스트)
  const readingCount = (project.readingLogs || []).length;
  const ethicsPledged = project.ethicsPledgeAccepted !== false;
  const checklistCount = Object.values(project.checklistProgress || {}).filter(Boolean).length;
  let citeVal = Math.min(95, Math.min(45, readingCount * 15) + (ethicsPledged ? 25 : 0) + Math.min(25, checklistCount * 5));
  if (citeVal < 30) citeVal = 35;

  const getStatus = (val: number): '우수' | '양호' | '보완필요' => {
    if (val >= 80) return '우수';
    if (val >= 60) return '양호';
    return '보완필요';
  };

  return [
    {
      axis: 'P1 현상 포착력',
      key: 'phenomenon',
      value: p1Val,
      benchmark: 82,
      description: '객관적 사실, 지역 통계 및 관측 데이터의 구체성',
      status: getStatus(p1Val),
    },
    {
      axis: 'P2 원인 분석력',
      key: 'problem',
      value: p2Val,
      benchmark: 80,
      description: '표면적 문제를 넘어선 구조적 모순과 인과 메커니즘 규명도',
      status: getStatus(p2Val),
    },
    {
      axis: 'P3 학술 설계력',
      key: 'project',
      value: p3Val,
      benchmark: 85,
      description: '전공 연구방법론(조사·실험·측정·알고리즘)의 타당성',
      status: getStatus(p3Val),
    },
    {
      axis: 'P4 실천 파급력',
      key: 'practice',
      value: p4Val,
      benchmark: 78,
      description: '인천 지역사회 및 학교 현장에 미치는 긍정적 공공 파급력',
      status: getStatus(p4Val),
    },
    {
      axis: '인용·연구윤리',
      key: 'ethics',
      value: citeVal,
      benchmark: 85,
      description: '다각도 문헌 인용 충실도 및 연구 윤리 자가점검 준수율',
      status: getStatus(citeVal),
    },
  ];
}

/**
 * 2. 읽·걷·쓰 학술 활동 밸런스 산출
 */
export function calculateReadWalkWriteBalance(project: ResearchProject): ReadWalkWriteBalance {
  const dist = autoDistributeFourP(project.fourP);
  const p = dist.distributed;

  // 읽기: 도서, 논문, 기사, 영상 로그 건수 및 내용 충실도
  const readLogs = project.readingLogs || [];
  const readCount = readLogs.length;
  const readNoteLength = readLogs.reduce((acc, r) => acc + (r.readingNotes?.length || 0), 0);
  const readScoreRaw = Math.min(100, readCount * 25 + Math.round(readNoteLength / 10));

  // 걷기: 현장 답사 기록 건수, 걸음수, 몰입도
  const walkLogs = project.walkingLogs || [];
  const walkCount = walkLogs.length;
  const totalSteps = walkLogs.reduce((acc, w) => acc + (w.steps || 0), 0);
  const walkScoreRaw = Math.min(100, walkCount * 28 + Math.min(30, Math.round(totalSteps / 500)));

  // 쓰기: 4P 총 텍스트 바이트 및 노력/성장 성찰 메모
  const totalText = `${p.phenomenon} ${p.problem} ${p.project} ${p.practice} ${project.effortNotes || ''} ${project.growthNotes || ''}`;
  const totalBytes = calculateNeisBytes(totalText);
  const writeScoreRaw = Math.min(100, Math.round((totalBytes / 1200) * 70) + 20);

  const totalSum = (readScoreRaw + walkScoreRaw + writeScoreRaw) || 1;
  const readPct = Math.round((readScoreRaw / totalSum) * 100);
  const walkPct = Math.round((walkScoreRaw / totalSum) * 100);
  const writePct = 100 - readPct - walkPct;

  let assessmentTitle = '조화로운 3대 융합 탐구형';
  let assessmentDesc = '읽기(문헌), 걷기(현장관찰), 쓰기(4P 논리화)가 모범적인 황금 비율을 이루고 있습니다.';

  if (readPct < 20) {
    assessmentTitle = '현장·서술 집중형 (문헌 보완 권장)';
    assessmentDesc = '풍부한 현장 관찰과 서술에 비해 학술 도서 및 논문 인용을 1~2편 추가하면 이론적 깊이가 더욱 강화됩니다.';
  } else if (walkPct < 20) {
    assessmentTitle = '문헌·이론 집중형 (현장 답사 보완 권장)';
    assessmentDesc = '탄탄한 문헌 분석을 뒷받침할 인천 지역 현장 답사(걷기) 및 시민 관찰 실측 데이터를 보강해 보세요.';
  } else if (writePct < 25) {
    assessmentTitle = '자료 축적형 (4P 서술 정교화 권장)';
    assessmentDesc = '수집된 풍부한 읽기·걷기 자료를 4P 단계별 문안으로 더욱 체계적으로 집약해 기술할 것을 권장합니다.';
  }

  return {
    readScore: readScoreRaw,
    walkScore: walkScoreRaw,
    writeScore: writeScoreRaw,
    readPct,
    walkPct,
    writePct,
    totalScore: Math.round((readScoreRaw + walkScoreRaw + writeScoreRaw) / 3),
    assessmentTitle,
    assessmentDesc,
    readCount,
    walkCount,
    totalSteps,
    totalBytes,
  };
}

/**
 * 3. 6대 연구실별 인천 10개 군·구 공공통계 비교 데이터셋
 */
export const INCHEON_DISTRICT_METRICS: Record<LabId, DistrictMetricSet> = {
  science: {
    metricId: 'blue_carbon_green_coverage',
    labId: 'science',
    title: '인천 10개 군·구 연안 블루카본 및 녹지 생태면적률 (%)',
    subtitle: '해안 갯벌 염생식물(칠면초, 갈대) 군락 및 생태 녹지 분포 현황',
    unit: '%',
    incheonAverage: 48.2,
    source: '인천광역시 스마트도시데이터 및 국립해양생물자원관 연안생태통계',
    insight: '강화군·옹진군·남동구(소래습지)의 블루카본 잠재력이 가장 높으며, 원도심(동구, 미추홀구)은 인공 복원지 확충이 시급합니다.',
    data: [
      { district: '중구', value: 52.4, unit: '%', highlightNote: '영종도 갯벌 생태계' },
      { district: '동구', value: 14.2, unit: '%', highlightNote: '원도심 공업지역 녹지 취약' },
      { district: '미추홀구', value: 18.6, unit: '%', highlightNote: '도심 녹지 회복 프로젝트 구역' },
      { district: '연수구', value: 43.8, unit: '%', highlightNote: '송도 갯벌 람사르습지 인접' },
      { district: '남동구', value: 64.5, unit: '%', isFocusDistrict: true, highlightNote: '★ 소래습지생태공원 대규모 염생식물군' },
      { district: '부평구', value: 29.1, unit: '%', highlightNote: '굴포천 생태하천 복원 구역' },
      { district: '계양구', value: 42.7, unit: '%', highlightNote: '계양산 자연녹지 권역' },
      { district: '서구', value: 51.3, unit: '%', highlightNote: '청라 호수 및 수도권매립지 야생화단지' },
      { district: '강화군', value: 78.4, unit: '%', highlightNote: '세계적 규모의 자연 갯벌' },
      { district: '옹진군', value: 86.9, unit: '%', highlightNote: '도서 해양생태계 보전 권역' },
    ],
  },
  tech: {
    metricId: 'barrier_free_safety_index',
    labId: 'tech',
    title: '인천 10개 군·구 보행 약자 스마트 안전·무장애 보행로 지수 (100점 만점)',
    subtitle: '도로 단차 2cm 이하 준수율, 음향신호기 보급 및 엣지 센싱 스마트 횡단보도 설치 현황',
    unit: '점',
    incheonAverage: 67.4,
    source: '인천시 스마트 교통도시과 및 도로교통공단 보행교통 실측 조사',
    insight: '송도·청라 등 신도시는 80점 이상의 높은 무장애 지수를 보이나, 미추홀구·동구 등 원도심 보행로는 단차로 인한 위험도가 높습니다.',
    data: [
      { district: '중구', value: 61.2, unit: '점', highlightNote: '개항장 역사지구 보행로 개보수' },
      { district: '동구', value: 52.8, unit: '점', highlightNote: '골목길 고령자 낙상 취약 구역' },
      { district: '미추홀구', value: 56.4, unit: '점', isFocusDistrict: true, highlightNote: '★ 전동휠체어 우회 위험 빈발 구역' },
      { district: '연수구', value: 87.5, unit: '점', highlightNote: '송도 국제도시 스마트 보행 안전망' },
      { district: '남동구', value: 71.3, unit: '점', highlightNote: '구월 아시아드 안전보행로' },
      { district: '부평구', value: 65.8, unit: '점', highlightNote: '부평역 지하상가 연계 보행 밀집' },
      { district: '계양구', value: 68.2, unit: '점', highlightNote: '작전동 일대 스마트 횡단보도 시범' },
      { district: '서구', value: 83.1, unit: '점', highlightNote: '청라·루원시티 평탄화 보행로' },
      { district: '강화군', value: 58.7, unit: '점', highlightNote: '지방도 구간 보차도 미분리 취약' },
      { district: '옹진군', value: 51.0, unit: '점', highlightNote: '도서지역 경사로 및 계단 다수' },
    ],
  },
  humanities: {
    metricId: 'elderly_population_digital_divide',
    labId: 'humanities',
    title: '인천 10개 군·구 65세 이상 고령인구 비율 및 무인 키오스크 디지털 소외 위험도',
    subtitle: '주민등록 통계 기준 65세 이상 인구 비율 (%)',
    unit: '%',
    incheonAverage: 17.8,
    source: '행정안전부 주민등록 인구통계 및 인천연구원 공공데이터넷 리포트',
    insight: '강화·옹진·동구는 이미 초고령 사회(20% 초과)에 진입하여 무인화 매장 확산 시 디지털 포용 정책과 휴먼 지원망이 최우선입니다.',
    data: [
      { district: '중구', value: 17.2, unit: '%', highlightNote: '원도심과 영종 신도시간 편차 큼' },
      { district: '동구', value: 25.8, unit: '%', isFocusDistrict: true, highlightNote: '★ 어르신 디지털 키오스크 도움창구 절실' },
      { district: '미추홀구', value: 20.4, unit: '%', highlightNote: '초고령 사회 진입 기준 충족' },
      { district: '연수구', value: 12.6, unit: '%', highlightNote: '젊은 생산인구 비중 높음' },
      { district: '남동구', value: 16.9, unit: '%', highlightNote: '다양한 세대 복합 거주' },
      { district: '부평구', value: 18.2, unit: '%', highlightNote: '전통시장 밀집 고령층 다수' },
      { district: '계양구', value: 17.1, unit: '%', highlightNote: '계양산 인근 실버 인프라 수요' },
      { district: '서구', value: 12.1, unit: '%', highlightNote: '검단 신도시 입주로 최저 고령비율' },
      { district: '강화군', value: 36.4, unit: '%', highlightNote: '초고령화 최고 심화 지역' },
      { district: '옹진군', value: 31.2, unit: '%', highlightNote: '원격 의료 및 복지 접근성 시급' },
    ],
  },
  business: {
    metricId: 'small_business_survival_rate',
    labId: 'business',
    title: '인천 10개 군·구 골목상권 소상공인 3년 생존율 (%)',
    subtitle: '음식점 및 로컬 도소매업 대상 창업 후 3년 이상 영업 유지 비율',
    unit: '%',
    incheonAverage: 42.1,
    source: '중소벤처기업부 상권정보시스템 및 인천신용보증재단 통계',
    insight: '원도심 상권은 대형 온라인 플랫폼 경쟁으로 3년 생존율이 35% 미만인 곳이 많아, 앵커스토어와 로컬 마일리지 순환 모델이 필요합니다.',
    data: [
      { district: '중구', value: 38.4, unit: '%', isFocusDistrict: true, highlightNote: '★ 신포·개항장 로컬 브랜딩 육성 권역' },
      { district: '동구', value: 33.1, unit: '%', highlightNote: '유동인구 감소로 인한 생존율 최저' },
      { district: '미추홀구', value: 39.5, unit: '%', highlightNote: '대학가 상권 계절성 변동 심함' },
      { district: '연수구', value: 47.8, unit: '%', highlightNote: '트리플스트리트 및 역세권 상권' },
      { district: '남동구', value: 44.2, unit: '%', highlightNote: '구월 로데오 중심 소비 순환' },
      { district: '부평구', value: 41.6, unit: '%', highlightNote: '부평 문화의거리 소상공인 밀집' },
      { district: '계양구', value: 40.8, unit: '%', highlightNote: '베드타운형 근린상권 위주' },
      { district: '서구', value: 48.9, unit: '%', highlightNote: '신규 아파트 상권 유입 활발' },
      { district: '강화군', value: 43.5, unit: '%', highlightNote: '주말 관광객 특수 의존형' },
      { district: '옹진군', value: 45.2, unit: '%', highlightNote: '해양 레저 및 펜션업 중심' },
    ],
  },
  bio: {
    metricId: 'adolescent_sleep_wellness_index',
    labId: 'bio',
    title: '인천 10개 군·구 청소년 주간 수면 충족률 및 신체 피로 회복 지수 (100점 만점)',
    subtitle: '중·고등학생 대상 평일 7시간 이상 수면 및 아침 피로도 체감 평가 점수',
    unit: '점',
    incheonAverage: 58.6,
    source: '질병관리청 청소년건강행태조사 및 인천시교육청 학생건강증진과 통계',
    insight: '학원가 밀집 지역(연수구 송도, 부평구 삼산)의 수면 충족률이 상대적으로 낮으며, 심야 스마트폰 사용 억제 캠페인이 효과적입니다.',
    data: [
      { district: '중구', value: 62.1, unit: '점', highlightNote: '야간 학습부담 상대적 보통' },
      { district: '동구', value: 60.5, unit: '점', highlightNote: '생활체육 시설 확충 필요' },
      { district: '미추홀구', value: 57.8, unit: '점', highlightNote: '청소년 힐링 걷기 코스 추천' },
      { district: '연수구', value: 51.4, unit: '점', isFocusDistrict: true, highlightNote: '★ 학원 밀집 및 심야 스크린 노출 취약' },
      { district: '남동구', value: 58.2, unit: '점', highlightNote: '수면위생 개선 캠페인 시범' },
      { district: '부평구', value: 53.9, unit: '점', highlightNote: '학습 스트레스 지수 집중 관리' },
      { district: '계양구', value: 61.3, unit: '점', highlightNote: '자연 친화적 여가 공간 보유' },
      { district: '서구', value: 59.4, unit: '점', highlightNote: '신규 학교 체육 인프라 조성' },
      { district: '강화군', value: 68.7, unit: '점', highlightNote: '규칙적 일주기 생체리듬 유지' },
      { district: '옹진군', value: 67.2, unit: '점', highlightNote: '자연 채광 및 야외 활동 비중 높음' },
    ],
  },
  education: {
    metricId: 'multicultural_inclusive_space_ratio',
    labId: 'education',
    title: '인천 10개 군·구 다문화 학생 비율 및 유니버설 안내 공간 지수',
    subtitle: '관내 초·중·고 다문화 학생 등록 비율 (%)',
    unit: '%',
    incheonAverage: 4.8,
    source: '인천시교육청 다문화교육지원센터 및 교육통계연보',
    insight: '연수구(함박마을 등), 중구, 서구는 다문화 학생 비율이 7~11%에 달해 다국어 픽토그램과 유니버설 공간 디자인 도입 효과가 가장 큽니다.',
    data: [
      { district: '중구', value: 7.8, unit: '%', highlightNote: '원도심 다문화 밀집 학군' },
      { district: '동구', value: 3.5, unit: '%', highlightNote: '소규모 포용 교실 운영' },
      { district: '미추홀구', value: 5.2, unit: '%', highlightNote: '한국어 예비학교 운영 구역' },
      { district: '연수구', value: 11.4, unit: '%', isFocusDistrict: true, highlightNote: '★ 함박마을 중심 다문화 학생 최대 밀집' },
      { district: '남동구', value: 5.6, unit: '%', highlightNote: '남동공단 인근 다문화 가정 다수' },
      { district: '부평구', value: 4.9, unit: '%', highlightNote: '이중언어 동아리 우수 운영' },
      { district: '계양구', value: 3.8, unit: '%', highlightNote: '상호문화 감수성 교육 지원' },
      { district: '서구', value: 6.2, unit: '%', highlightNote: '공단 및 외국인 근로자 주거 권역' },
      { district: '강화군', value: 2.1, unit: '%', highlightNote: '농어촌 다문화 멘토링 결연' },
      { district: '옹진군', value: 1.8, unit: '%', highlightNote: '원격 맞춤형 화상 언어 지원' },
    ],
  },
};
