import React, { useState, useEffect } from 'react';
import {
  Beaker,
  Brain,
  Sparkles,
  BarChart3,
  Camera,
  Gamepad2,
  Send,
  Award,
  CheckCircle2,
  XCircle,
  Heart,
  Upload,
  Copy,
  Check,
  MapPin,
  FileText,
  HelpCircle,
  Scale,
  RefreshCw,
  Filter,
  Flame,
  TreePine,
  ExternalLink,
  Radio,
  Key,
  Database,
  Code2,
  Info,
  Clock,
  Layers,
  Users,
  Factory,
  Briefcase,
  TrendingUp,
  Building2,
  GraduationCap,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
  Terminal,
  BookOpen,
  Play,
  AlertTriangle,
  Compass,
  Wind,
  Anchor,
  Train,
  ShieldAlert,
  Bus,
  Zap,
} from 'lucide-react';
import { ResearchProject } from '../types';
import {
  INCHEON_10_DISTRICTS,
  INCHEON_AVERAGE,
  GOV_API_DATA_SOURCES,
  INCHEON_AIR_STATIONS,
  DistrictStat,
  GovDataSource,
} from '../data/incheonStatsData';
import {
  INCHEON_GOV_CATEGORIES,
  INCHEON_20_GOV_DATASETS,
  GovDatasetItem,
} from '../data/incheonGovDatasets';
import { INCHEON_QUIZZES, INCHEON_BALANCE_GAMES } from '../data/quizBalanceData';
import { AiDataCorrelationSection } from './AiDataCorrelationSection';
import { AiDataMiningStudio } from './AiDataMiningStudio';

interface LiveAirData {
  time: string;
  pm10: number;
  pm2_5: number;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  ozone: number;
  uv_index: number;
  european_aqi: number;
}

interface StudentPost {
  id: string;
  studentName: string;
  school: string;
  spotName: string;
  fourPTag: 'P1 현상관찰' | 'P2 원인발견' | 'P3 과업실험' | 'P4 실천소감';
  photoUrl: string;
  comment: string;
  likes: number;
  createdAt: string;
}

const INITIAL_POSTS: StudentPost[] = [
  {
    id: 'post-1',
    studentName: '김서연',
    school: '인천서곶고 2학년',
    spotName: '수도권매립지 드림파크 야생화생태공원',
    fourPTag: 'P1 현상관찰',
    photoUrl: '/images/incheon/dreampark.webp',
    comment: '수도권 쓰레기가 묻혔던 제1매립장 위에 이렇게 화사한 코스모스와 메타세쿼이아 숲이 우거진 것을 보고 깜짝 놀랐습니다. 겉모습은 아름답지만 땅속 메탄가스를 포집해 발전하는 첨단 자원순환 시스템을 직접 확인하니 4P 탐구 동기가 확실해졌어요!',
    likes: 18,
    createdAt: '2026. 10. 25.',
  },
  {
    id: 'post-2',
    studentName: '이준우',
    school: '인천제물포고 1학년',
    spotName: '개항장 홍예문 & 조계지 거리',
    fourPTag: 'P2 원인발견',
    photoUrl: '/images/incheon/gaehangjang-hongyemun.webp',
    comment: '1908년 뚫린 홍예문 무지개 화강암을 손으로 만져보며 걸었습니다. 신포동 원도심과 자유공원 언덕 사이의 물리적 고저차가 오늘날 노약자들의 보행 단절 문제와 어떻게 연결되는지 현장에서 답을 찾았습니다.',
    likes: 14,
    createdAt: '2026. 10. 24.',
  },
  {
    id: 'post-3',
    studentName: '박하은',
    school: '인천송도고 2학년',
    spotName: '송도 센트럴파크 인공수로',
    fourPTag: 'P3 과업실험',
    photoUrl: '/images/incheon/songdo-centralpark.webp',
    comment: '해수를 유입하여 만든 센트럴파크 수로 주변의 수온과 수질 센서 데이터를 학교 과학동아리 친구들과 측정해 보았습니다. 인공 수생태계 유지를 위해 얼마나 많은 에너지가 쓰이는지 계산해 보는 4P 과업을 진행 중입니다.',
    likes: 22,
    createdAt: '2026. 10. 22.',
  },
  {
    id: 'post-4',
    studentName: '최민재',
    school: '인천남동고 2학년',
    spotName: '소래습지생태공원 소래염전',
    fourPTag: 'P4 실천소감',
    photoUrl: '/images/incheon/sorae-saltfield.webp',
    comment: '붉은 칠면초와 소금창고 둘레길을 걸으며 쓰레기 줍기(플로깅) 챌린지를 했습니다. 갯벌이 흡수하는 탄소(블루카본)의 위대함을 알리는 학교 환경 캠페인 포스터를 만들어 게시했습니다!',
    likes: 19,
    createdAt: '2026. 10. 20.',
  },
];

const GALLERY_STORAGE_KEY = 'incheon_student_gallery_posts_v1';
const GOV_API_KEY_STORAGE = 'incheon_gov_data_api_key_v1';

interface ExperimentalLabViewProps {
  project: ResearchProject;
  onUpdateProject?: (updated: Partial<ResearchProject>) => void;
  onNavigateTab: (tab: any) => void;
}

export const ExperimentalLabView: React.FC<ExperimentalLabViewProps> = ({
  project,
  onUpdateProject,
  onNavigateTab,
}) => {
  // Main Lab Tab State
  const [labSubTab, setLabSubTab] = useState<'stats' | 'live-api' | 'gov-portal' | 'gallery' | 'quiz' | 'policy' | 'ai-correlation' | 'data-mining'>('data-mining');

  // FEATURE 1: Incheon 10 Districts Stats State
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('seo-gu');
  const [districtFilter, setDistrictFilter] = useState<'all' | '원도심·항만' | '경제자유구역·신도심' | '산업·주거복합' | '도서·생태지역'>('all');
  const [statCategory, setStatCategory] = useState<'env' | 'demographic' | 'industry'>('env');
  const [injectedStatus, setInjectedStatus] = useState<string | null>(null);

  // FEATURE 1-B: Live Free API (Open-Meteo Air Quality)
  const [liveAirData, setLiveAirData] = useState<LiveAirData | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [allDistrictsLive, setAllDistrictsLive] = useState<Record<string, LiveAirData>>({});
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // FEATURE 2: Gov Portal (data.go.kr & KOSIS) & 20+ Datasets Practice Lab
  const [govApiKey, setGovApiKey] = useState<string>(() => {
    return localStorage.getItem(GOV_API_KEY_STORAGE) || '';
  });
  const [govKeySaved, setGovKeySaved] = useState(false);
  const [selectedGovSource, setSelectedGovSource] = useState<GovDataSource>(GOV_API_DATA_SOURCES[0]);
  const [govMockResponse, setGovMockResponse] = useState<string | null>(null);
  const [isGovTesting, setIsGovTesting] = useState(false);
  const [govMode, setGovMode] = useState<'real' | 'mock'>(() => {
    return localStorage.getItem(GOV_API_KEY_STORAGE) ? 'real' : 'mock';
  });
  const [selectedGovCategory, setSelectedGovCategory] = useState<string>('전체');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('kosis-population-age');
  const [selectedDistrictParam, setSelectedDistrictParam] = useState<string>('연수구');
  const [selectedAirStation, setSelectedAirStation] = useState<string>('송도');
  const [govApiResponse, setGovApiResponse] = useState<any>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const activeDataset: GovDatasetItem =
    INCHEON_20_GOV_DATASETS.find((d) => d.id === selectedDatasetId) || INCHEON_20_GOV_DATASETS[0];

  // FEATURE 3: Student Photo Gallery State
  const [posts, setPosts] = useState<StudentPost[]>(() => {
    try {
      const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load gallery from storage', e);
    }
    return INITIAL_POSTS;
  });

  const [isUploading, setIsUploading] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newSpotName, setNewSpotName] = useState('수도권매립지 드림파크 야생화생태공원');
  const [newFourPTag, setNewFourPTag] = useState<'P1 현상관찰' | 'P2 원인발견' | 'P3 과업실험' | 'P4 실천소감'>('P1 현상관찰');
  const [newComment, setNewComment] = useState('');
  const [newPhotoPreview, setNewPhotoPreview] = useState<string>('/images/incheon/dreampark.webp');

  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn('Failed to save gallery to storage', e);
    }
  }, [posts]);

  // FEATURE 4: Quiz & Balance Game State
  const [gameSubTab, setGameSubTab] = useState<'quiz' | 'balance'>('quiz');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [activeHint, setActiveHint] = useState<Record<number, boolean>>({});

  // Balance Game State
  const [balanceVotes, setBalanceVotes] = useState<Record<number, 'A' | 'B'>>({});

  // Policy Card Maker State
  const [copied, setCopied] = useState(false);
  const [targetAudience, setTargetAudience] = useState<'incheon-city' | 'school-council' | 'local-community'>('incheon-city');

  const selectedDistrict = INCHEON_10_DISTRICTS.find((d) => d.id === selectedDistrictId) || INCHEON_10_DISTRICTS[0];

  const filteredDistricts = INCHEON_10_DISTRICTS.filter((d) =>
    districtFilter === 'all' ? true : d.regionType === districtFilter
  );

  // Fetch Live Air Quality from Open-Meteo for single district
  const fetchSingleDistrictLiveAir = async (district: DistrictStat) => {
    setIsLiveLoading(true);
    setLiveError(null);
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${district.coordinates.lat}&longitude=${district.coordinates.lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,uv_index,european_aqi`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (data && data.current) {
        setLiveAirData(data.current);
      }
    } catch (err: any) {
      console.error('Failed to fetch live air data', err);
      setLiveError('실시간 대기질 API 응답 지연 (잠시 후 다시 시도해 주세요)');
    } finally {
      setIsLiveLoading(false);
    }
  };

  // Fetch on district change when on live tab
  useEffect(() => {
    if (labSubTab === 'live-api') {
      fetchSingleDistrictLiveAir(selectedDistrict);
    }
  }, [selectedDistrictId, labSubTab]);

  // Fetch all 10 districts in batch
  const fetchAllDistrictsLive = async () => {
    setIsBatchLoading(true);
    const results: Record<string, LiveAirData> = {};
    for (const d of INCHEON_10_DISTRICTS) {
      try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${d.coordinates.lat}&longitude=${d.coordinates.lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,uv_index,european_aqi`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.current) results[d.id] = json.current;
        }
      } catch (e) {
        console.warn(`Failed live fetch for ${d.name}`);
      }
    }
    setAllDistrictsLive(results);
    setIsBatchLoading(false);
  };

  const handleInjectDistrictTo4P = (
    d: DistrictStat,
    category: 'env' | 'demographic' | 'industry' = statCategory,
    targetStage: 'phenomenon' | 'problem' = 'phenomenon'
  ) => {
    if (!onUpdateProject) return;
    let textToAdd = '';
    let categoryName = '';

    if (category === 'env') {
      categoryName = '환경·대기 지표';
      textToAdd = `[${d.name} 환경·생태 현장 데이터] 초미세먼지 ${d.envStats.airQualityPm25}㎍/㎥ (인천평균 ${INCHEON_AVERAGE.airQualityPm25}), 1인당 도시공원면적 ${d.envStats.parkAreaPerCapita}㎡, 생활폐기물 재활용률 ${d.envStats.wasteRecycleRate}%, 1인당 탄소배출량 ${d.envStats.carbonEmissionPerCapita}tCO2eq. 핵심현안: ${d.keyIssues[0]}`;
    } else if (category === 'demographic') {
      categoryName = '인구·청년 통계';
      textToAdd = `[${d.name} 인구·청년·사회 데이터] 총인구 ${d.population.toLocaleString()}명, 만 19~34세 청년 비율 ${d.demographicStats.youthRatio19to34}% (인천평균 ${INCHEON_AVERAGE.youthRatio19to34}%), 1인 가구 비율 ${d.demographicStats.singleHouseholdRatio}%, 65세 이상 고령화율 ${d.elderlyRatio}%, 합계출산율 ${d.demographicStats.fertilityRate}명, 다문화·외국인 주민 ${d.demographicStats.multiculturalResidentCount.toLocaleString()}명. 인구동향: ${d.demographicStats.migrationTrend}`;
    } else {
      categoryName = '산업·일자리 데이터';
      textToAdd = `[${d.name} 산업·경제·일자리 데이터] 대표 특화산업: ${d.industryStats.primaryIndustry}, 사업체 수 ${d.industryStats.businessCount.toLocaleString()}개, 종사자 수 ${d.industryStats.workerCount.toLocaleString()}명, 청년 고용률 ${d.industryStats.youthEmploymentRate}% (제조업 ${d.industryStats.manufacturingRatio}%, 서비스업 ${d.industryStats.serviceRatio}%, 첨단·바이오 ${d.industryStats.techBioRatio}%). 산업현안: ${d.industryStats.economicIssue}`;
    }

    const currentStageContent = project.fourP[targetStage] || '';
    const newStageContent = currentStageContent
      ? `${currentStageContent}\n\n${textToAdd}`
      : textToAdd;

    onUpdateProject({
      fourP: {
        ...project.fourP,
        [targetStage]: newStageContent,
      },
    });
    const stageName = targetStage === 'phenomenon' ? 'P1.현상' : 'P2.원인';
    setInjectedStatus(`${d.name} ${categoryName}가 4P 연구계획서(${stageName})에 주입되었습니다!`);
    setTimeout(() => setInjectedStatus(null), 3500);
  };

  const handleInjectLiveAirTo4P = () => {
    if (!liveAirData || !onUpdateProject) return;
    const timeFormatted = new Date(liveAirData.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const textToAdd = `[${selectedDistrict.name} 실시간 대기환경 API 라이브 측정치 (${timeFormatted})] 초미세먼지(PM2.5): ${liveAirData.pm2_5}㎍/㎥, 미세먼지(PM10): ${liveAirData.pm10}㎍/㎥, 오존: ${liveAirData.ozone}㎍/㎥, 유럽 대기질지수(AQI): ${liveAirData.european_aqi}. 현장 측정 데이터를 바탕으로 대기환경 현상을 포착함.`;
    const newPhenomenon = project.fourP.phenomenon
      ? `${project.fourP.phenomenon}\n\n${textToAdd}`
      : textToAdd;

    onUpdateProject({
      fourP: {
        ...project.fourP,
        phenomenon: newPhenomenon,
      },
    });
    setInjectedStatus(`${selectedDistrict.name} 실시간 API 측정값이 4P 연구계획서(P1.현상)에 주입되었습니다!`);
    setTimeout(() => setInjectedStatus(null), 3500);
  };

  const handleSaveGovKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = govApiKey.trim();
    localStorage.setItem(GOV_API_KEY_STORAGE, trimmed);
    setGovKeySaved(true);
    if (trimmed) {
      setGovMode('real');
    }
    setTimeout(() => setGovKeySaved(false), 2500);
  };

  const handleClearGovKey = () => {
    localStorage.removeItem(GOV_API_KEY_STORAGE);
    setGovApiKey('');
    setGovMode('mock');
    setGovKeySaved(false);
  };

  const handleTestGovApi = async () => {
    setIsGovTesting(true);
    try {
      const isAirKorea = activeDataset.id === 'airkorea-live';
      const endpoint = isAirKorea ? '/api/airkorea-proxy' : '/api/gov-dataset-proxy';
      const body = isAirKorea
        ? {
            serviceKey: govMode === 'mock' ? '' : govApiKey.trim(),
            stationName: selectedAirStation,
            isMock: govMode === 'mock',
          }
        : {
            serviceKey: govMode === 'mock' ? '' : govApiKey.trim(),
            datasetId: activeDataset.id,
            district: selectedDistrictParam,
            isMock: govMode === 'mock',
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setGovApiResponse(data);
      if (data.data) {
        setGovMockResponse(JSON.stringify(data.data, null, 2));
      } else {
        setGovMockResponse(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      console.error('Gov API test error:', err);
      const fallbackError = {
        success: false,
        isMock: govMode === 'mock',
        statusCode: 500,
        datasetId: activeDataset.id,
        title: activeDataset.title,
        error: '프록시 통신 오류가 발생했습니다.',
        hint: '인터넷 연결을 확인하시거나 [모의 응답 시뮬레이터]로 먼저 수업을 진행해 보세요.',
      };
      setGovApiResponse(fallbackError);
      setGovMockResponse(JSON.stringify(fallbackError, null, 2));
    } finally {
      setIsGovTesting(false);
    }
  };

  const handleInjectDatasetTo4P = (targetStage: 'phenomenon' | 'problem' | 'project' = 'phenomenon') => {
    if (!onUpdateProject) return;
    let textToAdd = '';

    if (activeDataset.id === 'airkorea-live') {
      const items = govApiResponse?.data?.response?.body?.items;
      const latest = Array.isArray(items) && items.length > 0 ? items[0] : null;
      if (latest) {
        const gradeMap: Record<string, string> = { '1': '좋음', '2': '보통', '3': '나쁨', '4': '매우 나쁨' };
        const gradeText = gradeMap[latest.khaiGrade] || latest.khaiGrade || '보통';
        textToAdd = `[공공데이터포털 에어코리아 실시간 Open API 검증 데이터]
• 측정소: 인천 ${latest.stationName || selectedAirStation} (측정일시: ${latest.dataTime || new Date().toLocaleString('ko-KR')})
• 초미세먼지(PM2.5): ${latest.pm25Value || '-'} ㎍/㎥ (등급: ${gradeMap[latest.pm25Grade] || '보통'})
• 미세먼지(PM10): ${latest.pm10Value || '-'} ㎍/㎥
• 통합대기환경지수(KHAI): ${latest.khaiValue || '-'} (종합등급: ${gradeText})
• 오존(O₃): ${latest.o3Value || '-'} ppm, 이산화질소(NO₂): ${latest.no2Value || '-'} ppm
※ 데이터 출처: 공공데이터포털(data.go.kr) 한국환경공단_에어코리아_대기오염정보 Open API 규격 실시간 호출`;
      } else {
        textToAdd = activeDataset.sample4PCitation({ district: selectedAirStation });
      }
    } else {
      textToAdd = govApiResponse?.citation || activeDataset.sample4PCitation({ district: selectedDistrictParam });
    }

    if (targetStage === 'project') {
      textToAdd = `[P3 전공 연구방법론 — 공공데이터 분석 과업 설계]
• 활용 데이터셋: ${activeDataset.title} (${activeDataset.agency})
• 분석 대상 지역: 인천 ${selectedDistrictParam || selectedAirStation}
• 데이터 분석 및 인용 내용:
${textToAdd}`;
    }

    const currentContent = project.fourP[targetStage] || '';
    const newContent = currentContent ? `${currentContent}\n\n${textToAdd}` : textToAdd;

    onUpdateProject({
      fourP: {
        ...project.fourP,
        [targetStage]: newContent,
      },
    });
    const stageName = targetStage === 'phenomenon' ? 'P1.현상' : targetStage === 'problem' ? 'P2.원인' : 'P3.과업';
    setInjectedStatus(`[${activeDataset.title}] 공공데이터가 4P 연구계획서(${stageName})에 주입되었습니다!`);
    setTimeout(() => setInjectedStatus(null), 3500);
  };

  const getAqiBadge = (pm25: number) => {
    if (pm25 <= 15) return { label: '좋음 (Clean)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (pm25 <= 35) return { label: '보통 (Moderate)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (pm25 <= 75) return { label: '나쁨 (Unhealthy)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: '매우 나쁨 (Hazardous)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newComment.trim()) {
      alert('이름과 현장 소감문을 입력해 주세요.');
      return;
    }
    const newPost: StudentPost = {
      id: `post-${Date.now()}`,
      studentName: newStudentName.trim(),
      school: newSchool.trim() || '인천 소재 고교',
      spotName: newSpotName,
      fourPTag: newFourPTag,
      photoUrl: newPhotoPreview,
      comment: newComment.trim(),
      likes: 1,
      createdAt: new Date().toLocaleDateString('ko-KR'),
    };
    setPosts([newPost, ...posts]);
    setNewStudentName('');
    setNewComment('');
    setIsUploading(false);
  };

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleSelectQuizOption = (quizId: number, optionIdx: number) => {
    if (quizAnswers[quizId] !== undefined) return;
    setQuizAnswers((prev) => ({ ...prev, [quizId]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [quizId]: true }));
  };

  const totalScore = Object.entries(quizAnswers).reduce((acc, [quizId, answerIdx]) => {
    const quiz = INCHEON_QUIZZES.find((q) => q.id === Number(quizId));
    return quiz && quiz.correctIndex === answerIdx ? acc + 10 : acc;
  }, 0);

  const handleCopyPolicy = () => {
    const text = `[인천 사회문제 4P 정책제안서]
■ 제안 제목: ${project.title || '인천 지역사회 문제해결을 위한 4P 제안'}
■ 연구자: ${project.author || '학생 연구원'} (${project.affiliation || '인천'})
■ 탐구 질문: ${project.mainQuestion || '현장 탐구 기반 질문'}
───────────────────
[P1. 현상 포착]
${project.fourP.phenomenon || '(작성 내용 없음)'}

[P2. 문제 분석]
${project.fourP.problem || '(작성 내용 없음)'}

[P3. 과업 수립]
${project.fourP.project || '(작성 내용 없음)'}

[P4. 실천 대안]
${project.fourP.practice || '(작성 내용 없음)'}
───────────────────
* 인천 4P 읽·걷·쓰 전공연계 사회문제탐구 플랫폼에서 자동 생성되었습니다.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Safe Experiment Zone */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/10">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-purple-100 border border-white/20">
              <Beaker className="w-3.5 h-3.5 text-amber-300" />
              <span>실험용 확장 Lab · 실시간 무료 API & 공공데이터 센터</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              인천 읽·걷·쓰 실시간 데이터 & 인터랙티브 실험실
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              키 발급 없이 1초 만에 인천 10개 군·구 좌표의 <strong className="text-white underline decoration-amber-400 underline-offset-4">실시간 대기질을 호출하는 무료 API</strong>와, 대한민국 <strong className="text-white underline decoration-amber-400 underline-offset-4">공공데이터포털(data.go.kr) & KOSIS 통계청 원본 대조 창</strong>을 모두 구축했습니다!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('workspace')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold transition-colors"
            >
              <span>기존 4P 계획서 확인</span>
            </button>
          </div>
        </div>

        {/* 8 Main Lab Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap gap-2">
          <button
            onClick={() => setLabSubTab('data-mining')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              labSubTab === 'data-mining'
                ? 'bg-purple-600 text-white shadow-lg scale-102 font-black ring-2 ring-purple-300'
                : 'bg-white/20 hover:bg-white/30 text-white font-extrabold border border-purple-300/40'
            }`}
          >
            <Brain className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>🔬 AI 데이터 마이닝 스튜디오</span>
            <span className="text-[10px] bg-purple-400 text-purple-950 px-1.5 py-0.5 rounded-md font-black">4대 분석</span>
          </button>

          <button
            onClick={() => setLabSubTab('ai-correlation')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              labSubTab === 'ai-correlation'
                ? 'bg-amber-300 text-slate-950 shadow-lg scale-102 font-black ring-2 ring-white'
                : 'bg-white/20 hover:bg-white/30 text-white font-extrabold border border-amber-300/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>🌟 AI 데이터 상관관계·패턴 도출</span>
            <span className="text-[10px] bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded-md font-black">AI 핵심</span>
          </button>

          <button
            onClick={() => setLabSubTab('live-api')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              labSubTab === 'live-api'
                ? 'bg-white text-indigo-900 shadow-md scale-102 font-extrabold ring-2 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>1. 실시간 무료 환경 API 라이브</span>
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-md font-black">키 필요없음</span>
          </button>

          <button
            onClick={() => setLabSubTab('gov-portal')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              labSubTab === 'gov-portal'
                ? 'bg-white text-indigo-900 shadow-md scale-102 font-extrabold ring-2 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Database className="w-4 h-4 text-sky-300" />
            <span>2. 공공데이터포털 & KOSIS 대조</span>
            <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded-md font-black">정부공식</span>
          </button>

          <button
            onClick={() => setLabSubTab('stats')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              labSubTab === 'stats'
                ? 'bg-white text-indigo-900 shadow-md scale-102 font-extrabold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-300" />
            <span>3. 10개 군·구 통계 지표 분석</span>
          </button>

          <button
            onClick={() => setLabSubTab('gallery')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              labSubTab === 'gallery'
                ? 'bg-white text-indigo-900 shadow-md scale-102 font-extrabold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Camera className="w-4 h-4 text-rose-300" />
            <span>4. 현장 사진 & 소감문 갤러리</span>
          </button>

          <button
            onClick={() => setLabSubTab('quiz')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              labSubTab === 'quiz'
                ? 'bg-white text-indigo-900 shadow-md scale-102 font-extrabold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-300" />
            <span>5. 퀴즈 & 밸런스 게임</span>
          </button>

          <button
            onClick={() => setLabSubTab('policy')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              labSubTab === 'policy'
                ? 'bg-white text-indigo-900 shadow-md scale-102 font-extrabold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Send className="w-4 h-4 text-purple-300" />
            <span>6. 정책제안 카드 메이커</span>
          </button>
        </div>
      </div>

      {injectedStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {injectedStatus}
          </span>
          <button
            onClick={() => onNavigateTab('workspace')}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold"
          >
            4P 워크스페이스 보기 →
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 0-A. 🔬 AI 데이터 마이닝 & 알고리즘 시각화 스튜디오 (4대 분석) */}
      {/* ======================================================== */}
      {labSubTab === 'data-mining' && (
        <AiDataMiningStudio
          project={project}
          onUpdateProject={onUpdateProject}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* ======================================================== */}
      {/* 0-B. 🌟 AI 데이터 패턴 & 상관관계 도출기 (2022 개정 사회과) */}
      {/* ======================================================== */}
      {labSubTab === 'ai-correlation' && (
        <AiDataCorrelationSection
          project={project}
          onUpdateProject={onUpdateProject}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* ======================================================== */}
      {/* 1. 실시간 무료 환경 API 라이브 창 (Open-Meteo Air Quality) */}
      {/* ======================================================== */}
      {labSubTab === 'live-api' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>글로벌 Open-Meteo Air Quality 실시간 API 통신 중</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                인천 10개 군·구 실시간 대기환경 라이브 모니터링
              </h3>
              <p className="text-xs text-slate-500">
                별도 인증키나 가입 없이, 실제 GPS 좌표(위·경도)를 기준으로 현재 이 시각의 초미세먼지·오존·자외선을 즉시 조회합니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={isLiveLoading}
                onClick={() => fetchSingleDistrictLiveAir(selectedDistrict)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLiveLoading ? 'animate-spin' : ''}`} />
                <span>{isLiveLoading ? '측정 데이터 수신 중...' : '현재 지역 새로고침'}</span>
              </button>

              <button
                disabled={isBatchLoading}
                onClick={fetchAllDistrictsLive}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isBatchLoading ? '10개 지역 일괄 수집 중...' : '10개 군·구 전체 동시 비교'}</span>
              </button>
            </div>
          </div>

          {/* District Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {INCHEON_10_DISTRICTS.map((d) => {
              const isSelected = d.id === selectedDistrictId;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDistrictId(d.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {d.coordinates.lat.toFixed(2)}, {d.coordinates.lng.toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Data Display Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    실시간 GPS: 위도 {selectedDistrict.coordinates.lat}° / 경도 {selectedDistrict.coordinates.lng}°
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    수신 시각: {liveAirData ? new Date(liveAirData.time).toLocaleString('ko-KR') : '확인 중...'}
                  </span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 mt-2">
                  인천광역시 {selectedDistrict.name} 실시간 대기오염물질 농도
                </h4>
              </div>

              {liveAirData && (
                <button
                  onClick={handleInjectLiveAirTo4P}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>이 실시간 측정치를 내 4P 계획서에 넣기</span>
                </button>
              )}
            </div>

            {liveError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                ⚠️ {liveError}
              </div>
            )}

            {isLiveLoading && !liveAirData ? (
              <div className="py-12 text-center text-slate-400 text-sm space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                <p>Open-Meteo 글로벌 대기환경 위성 API와 통신 중입니다...</p>
              </div>
            ) : liveAirData ? (
              <div className="space-y-6">
                {/* 4 Main Sensor Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* PM2.5 */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">초미세먼지 (PM2.5)</span>
                      {(() => {
                        const badge = getAqiBadge(liveAirData.pm2_5);
                        return (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badge.color}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-3xl font-black text-indigo-900">
                      {liveAirData.pm2_5} <span className="text-sm font-medium text-slate-500">㎍/㎥</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      인체 폐포까지 직접 침투하는 지름 2.5㎛ 이하 미세입자
                    </p>
                  </div>

                  {/* PM10 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">미세먼지 (PM10)</span>
                      <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border">
                        실시간
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      {liveAirData.pm10} <span className="text-sm font-medium text-slate-500">㎍/㎥</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      황사 및 도로 비산먼지 등 지름 10㎛ 이하 입자
                    </p>
                  </div>

                  {/* Ozone (O3) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">오존 (O₃)</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        광화학 반응
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      {liveAirData.ozone} <span className="text-sm font-medium text-slate-500">㎍/㎥</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      햇빛과 대기오염물질의 광화학 반응으로 생성되는 산화가스
                    </p>
                  </div>

                  {/* European AQI */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">통합 대기질 (EAQI)</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        유럽 표준
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      {liveAirData.european_aqi} <span className="text-sm font-medium text-slate-500">EAQI</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      수치가 낮을수록 대기가 맑고 쾌적함을 의미 (0~100 기준)
                    </p>
                  </div>
                </div>

                {/* Sub Sensors: NO2, CO, UV */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">이산화질소 (NO₂) 자동차 배기가스</span>
                    <strong className="text-sm text-slate-900">{liveAirData.nitrogen_dioxide} ㎍/㎥</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">일산화탄소 (CO) 불완전 연소물</span>
                    <strong className="text-sm text-slate-900">{liveAirData.carbon_monoxide} ㎍/㎥</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">자외선 지수 (UV Index)</span>
                    <strong className="text-sm text-slate-900">{liveAirData.uv_index} UV</strong>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Batch Table if loaded */}
            {Object.keys(allDistrictsLive).length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    인천 10개 군·구 실시간 대기환경 일괄 비교 테이블
                  </h5>
                  <span className="text-[11px] text-slate-500">Open-Meteo Live API 동시 수집 완료</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3">군·구명</th>
                        <th className="p-3">권역 구분</th>
                        <th className="p-3">초미세먼지 (PM2.5)</th>
                        <th className="p-3">미세먼지 (PM10)</th>
                        <th className="p-3">오존 (O₃)</th>
                        <th className="p-3">대기질 지수 (AQI)</th>
                        <th className="p-3 text-right">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {INCHEON_10_DISTRICTS.map((d) => {
                        const live = allDistrictsLive[d.id];
                        if (!live) return null;
                        const badge = getAqiBadge(live.pm2_5);
                        return (
                          <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-extrabold text-slate-900">{d.name}</td>
                            <td className="p-3 text-slate-500">{d.regionType}</td>
                            <td className="p-3 font-bold text-indigo-700">{live.pm2_5} ㎍/㎥</td>
                            <td className="p-3 text-slate-700">{live.pm10} ㎍/㎥</td>
                            <td className="p-3 text-slate-700">{live.ozone} ㎍/㎥</td>
                            <td className="p-3 text-slate-700">{live.european_aqi}</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                                {badge.label.split(' ')[0]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. 대한민국 공공데이터포털(data.go.kr) & 통계청 KOSIS 대조 센터 */}
      {/* ======================================================== */}
      {labSubTab === 'gov-portal' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">정부 공공데이터 신뢰성 검증</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                공공데이터포털(data.go.kr) & 통계청 KOSIS 원본 대조 창
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                앱에서 사용하는 모든 통계의 대한민국 정부 공식 출처를 대조하고, 공공 API 인증키를 등록하여 직접 통신을 실습할 수 있습니다.
              </p>
            </div>
            <a
              href="https://data.go.kr"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shrink-0"
            >
              <span>공공데이터포털 바로가기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Government Open Data Sources Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOV_API_DATA_SOURCES.map((source) => (
              <div
                key={source.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {source.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">{source.agency}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{source.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{source.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {source.fieldsProvided.map((field, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        {field}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1"
                    >
                      <span>공식 원본 통계표</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <a
                      href={source.apiDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 text-[11px]"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>API 명세서</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* data.go.kr API Key Integration & Full Educational Practice Suite (21 Datasets) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header & Mode Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                    공공데이터 실습실 ({INCHEON_20_GOV_DATASETS.length}종)
                  </span>
                  <span className="text-xs text-slate-500 font-bold">인천 4P 탐구 전용 공공데이터 Open API & 시뮬레이터</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  인천 공공데이터 {INCHEON_20_GOV_DATASETS.length}종 실습 패널 (보건·교통안전·상권·교육·해양생태·에너지 등)
                </h4>
                <p className="text-xs text-slate-600">
                  정부 Open API가 실제로 반환하는 <strong>JSON 응답 전문(데이터 명세)</strong>을 직접 관찰하고, 4P 연구계획서(현상/원인)의 정량적 증빙 자료로 자동 인용합니다.
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setGovMode('real')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    govMode === 'real'
                      ? 'bg-white text-sky-700 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-sky-600" />
                  <span>내 인증키로 실제 API 호출</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGovMode('mock')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    govMode === 'mock'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>키 없이 모의 시뮬레이터</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Real API Key Input Box */}
            {govMode === 'real' ? (
              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-sky-900">
                      공공데이터포털 일반 인증키(Encoding 또는 Decoding Key)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-700 font-bold bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> 브라우저 로컬 안전 보관 ({INCHEON_20_GOV_DATASETS.length}종 데이터 공통 적용)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGuideModal(true)}
                      className="font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" /> 1분 무료 발급 가이드
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveGovKey} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeyInput ? 'text' : 'password'}
                      value={govApiKey}
                      onChange={(e) => setGovApiKey(e.target.value)}
                      placeholder="공공데이터포털에서 발급받은 일반 인증키를 붙여넣으세요 (예: 9aZ... 또는 %2F...)"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-sky-300 bg-white text-xs focus:ring-2 focus:ring-sky-500 outline-none font-mono text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeyInput(!showKeyInput)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showKeyInput ? '키 숨기기' : '키 보기'}
                    >
                      {showKeyInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
                    >
                      {govKeySaved ? '✓ 저장됨' : '인증키 저장'}
                    </button>
                    {govApiKey && (
                      <button
                        type="button"
                        onClick={handleClearGovKey}
                        className="px-3 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold transition-colors"
                        title="저장된 인증키 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </form>

                <p className="text-[11px] text-sky-800 leading-relaxed">
                  💡 <strong>팁:</strong> 공공데이터포털(data.go.kr)에서 발급받은 하나의 인증키로 에어코리아는 물론 질병관리청, 도로교통공단, 소상공인진흥공단, 한국전력 등 {INCHEON_20_GOV_DATASETS.length}개 데이터셋을 모두 호출할 수 있습니다.
                </p>
              </div>
            ) : (
              /* Mode 2: Simulator Notice Box */
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>인증키 없는 학생용 {INCHEON_20_GOV_DATASETS.length}종 모의 응답 시뮬레이터 가동 중</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    인증키를 아직 발급받지 않은 학생도 인천 {INCHEON_20_GOV_DATASETS.length}종 공공데이터 Open API의 공식 JSON 규격과 최신 인천 통계 데이터를 즉시 시뮬레이션하고 수업을 진행할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white text-indigo-700 border border-indigo-200 font-bold text-xs hover:bg-indigo-50 transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1분 무료 발급 가이드 보기</span>
                </button>
              </div>
            )}

            {/* Category Filter Pills (5 Major Domains + All) */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>데이터 카테고리 선택 (총 {INCHEON_20_GOV_DATASETS.length}종 공공데이터)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedGovCategory('전체')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    selectedGovCategory === '전체'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  전체보기 ({INCHEON_20_GOV_DATASETS.length})
                </button>
                {INCHEON_GOV_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedGovCategory(cat.id);
                      const firstInCat = INCHEON_20_GOV_DATASETS.find((d) => d.category === cat.id);
                      if (firstInCat) setSelectedDatasetId(firstInCat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                      selectedGovCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dataset Selector Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>실습할 공공데이터 선택</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  현재 {INCHEON_20_GOV_DATASETS.filter((d) => selectedGovCategory === '전체' || d.category === selectedGovCategory).length}개 데이터셋 표시 중
                </span>
              </label>

              <select
                value={selectedDatasetId}
                onChange={(e) => {
                  setSelectedDatasetId(e.target.value);
                  setGovApiResponse(null);
                  setGovMockResponse(null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-2xs"
              >
                {INCHEON_20_GOV_DATASETS.filter(
                  (d) => selectedGovCategory === '전체' || d.category === selectedGovCategory
                ).map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.category}] {d.title} — {d.agency}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Dataset Detail Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${activeDataset.categoryBadge}`}>
                    {activeDataset.category}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">{activeDataset.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 font-medium">소관: <strong>{activeDataset.agency}</strong></span>
                  <a
                    href={activeDataset.dataGoKrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                  >
                    <span>공식 상세</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">데이터 측정 내용</span>
                  <p className="text-slate-700 leading-relaxed">{activeDataset.description}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 block mb-0.5">💡 4P 탐구 핵심 연계</span>
                  <p className="text-indigo-950 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100 leading-relaxed font-medium">
                    {activeDataset.fourPResearchFocus}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <span className="font-bold text-slate-600">주요 필드:</span>
                  {activeDataset.sampleFields.map((f, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-white rounded border border-slate-200">
                      {f}
                    </span>
                  ))}
                </div>
                <span className="text-slate-400 font-mono text-[10px] truncate max-w-xs">
                  {activeDataset.apiEndpoint}
                </span>
              </div>
            </div>

            {/* Target Parameter Selection (Station or District) & Execution Button */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2 space-y-1.5">
                {activeDataset.id === 'airkorea-live' ? (
                  <>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>인천 에어코리아 공식 대기측정소 선택 (총 21개소)</span>
                    </label>
                    <select
                      value={selectedAirStation}
                      onChange={(e) => setSelectedAirStation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {INCHEON_AIR_STATIONS.map((st) => (
                        <option key={st.station} value={st.station}>
                          [{st.districtName}] {st.station} 측정소 — {st.description}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>탐구 대상 인천 군·구 / 거점 지역 선택 (10개 군·구)</span>
                    </label>
                    <select
                      value={selectedDistrictParam}
                      onChange={(e) => setSelectedDistrictParam(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="연수구(송도)">[경제자유구역] 연수구 (송도국제도시 / 바이오 / 첨단 R&D)</option>
                      <option value="서구(청라·검단)">[신도심·환경] 서구 (청라국제도시 / 검단 / 수도권매립지)</option>
                      <option value="중구(영종·개항장)">[항만·항공] 중구 (영종국제도시 인천공항 / 개항장 / 내항)</option>
                      <option value="남동구(남동공단)">[산업·행정] 남동구 (남동국가산업단지 / 인천시청 / 소래포구)</option>
                      <option value="부평구">[주거·교통] 부평구 (경인선·인천1호선 환승 / 한국GM / 문화도시)</option>
                      <option value="미추홀구">[원도심·대학] 미추홀구 (주안역 / 수봉공원 / 대학로 청년상권)</option>
                      <option value="동구">[원도심·철강] 동구 (배다리 헌책방거리 / 현대제철 / 동인천역)</option>
                      <option value="계양구">[3기신도시] 계양구 (계양테크노밸리 / 계양산 / 경인아라뱃길)</option>
                      <option value="강화군">[도서·역사생태] 강화군 (마니산 / 남단 갯벌 / 고려역사유적)</option>
                      <option value="옹진군(서해5도)">[도서·안보평화] 옹진군 (백령도·연평도 / 덕적군도 100여 개 섬)</option>
                    </select>
                  </>
                )}
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleTestGovApi}
                  disabled={isGovTesting}
                  className={`w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
                    govMode === 'real'
                      ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  {isGovTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>공공데이터 API 통신 중...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>
                        {govMode === 'real'
                          ? `[${activeDataset.agency.slice(0, 6)}] 실제 API 호출 (GET)`
                          : `[${activeDataset.agency.slice(0, 6)}] 시뮬레이터 실행 (GET)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* API Response Status & Result Viewer */}
            {govApiResponse && (
              <div className="space-y-4 pt-3 border-t border-slate-200 animate-in fade-in">
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-900 text-white text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${
                        govApiResponse.success ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {govApiResponse.success ? `HTTP ${govApiResponse.statusCode || 200} OK` : '호출 실패 / 주의'}
                    </span>
                    <span className="font-bold text-slate-300">
                      데이터: <span className="text-white font-black">{govApiResponse.title || activeDataset.title}</span>
                    </span>
                    <span className="font-bold text-slate-400">
                      지역: <span className="text-amber-300 font-bold">{govApiResponse.district || govApiResponse.stationName || selectedDistrictParam}</span>
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      ⏱ {govApiResponse.durationMs}ms 소요
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                      {govApiResponse.isMock ? '🧪 모의 시뮬레이터' : '📡 공공데이터 실시간 연동'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (govMockResponse) {
                          navigator.clipboard.writeText(govMockResponse);
                          setCopiedJson(true);
                          setTimeout(() => setCopiedJson(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedJson ? '복사됨!' : 'JSON 전체 복사'}</span>
                    </button>
                  </div>
                </div>

                {/* Error/Warning Diagnostic Hint Box */}
                {!govApiResponse.success && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 space-y-2 text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-black text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{govApiResponse.error || '공공데이터포털 응답 오류'}</span>
                    </div>
                    {govApiResponse.hint && (
                      <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                        💡 <strong>선생님/학생 안내:</strong> {govApiResponse.hint}
                      </p>
                    )}
                  </div>
                )}

                {/* Dynamic Data Breakdown Cards */}
                {(() => {
                  // AirKorea format check
                  const airItems = govApiResponse.data?.response?.body?.items;
                  if (Array.isArray(airItems) && airItems.length > 0) {
                    const latest = airItems[0];
                    return (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                          <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-indigo-600" />
                            <h5 className="text-xs font-black text-slate-900">
                              한국환경공단 에어코리아 대기오염 측정 명세 분석
                            </h5>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            측정시각: {latest.dataTime || '실시간'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-bold">초미세먼지 (pm25)</div>
                            <div className="text-lg font-black text-indigo-700 mt-1">
                              {latest.pm25Value || '-'} <span className="text-xs font-normal text-slate-500">㎍/㎥</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">WHO 권고: 15 이하</div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-bold">미세먼지 (pm10)</div>
                            <div className="text-lg font-black text-slate-900 mt-1">
                              {latest.pm10Value || '-'} <span className="text-xs font-normal text-slate-500">㎍/㎥</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">국내 기준: 50 이하</div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-bold">통합대기 (KHAI)</div>
                            <div className="text-lg font-black text-emerald-700 mt-1">
                              {latest.khaiValue || '-'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">등급: {latest.khaiGrade === '1' ? '좋음' : latest.khaiGrade === '2' ? '보통' : '나쁨'}</div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-bold">오존 (O₃)</div>
                            <div className="text-lg font-black text-amber-700 mt-1">
                              {latest.o3Value || '-'} <span className="text-xs font-normal text-slate-500">ppm</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">광화학 스모그 지표</div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-bold">이산화질소 (NO₂)</div>
                            <div className="text-lg font-black text-slate-800 mt-1">
                              {latest.no2Value || '-'} <span className="text-xs font-normal text-slate-500">ppm</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">차량 배기가스 지표</div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-bold">아황산가스 (SO₂)</div>
                            <div className="text-lg font-black text-slate-800 mt-1">
                              {latest.so2Value || '-'} <span className="text-xs font-normal text-slate-500">ppm</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">산성비 원인물질</div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Universal 20 Datasets format check (body.items[0])
                  const bodyItems = govApiResponse.data?.body?.items;
                  if (Array.isArray(bodyItems) && bodyItems.length > 0) {
                    const item = bodyItems[0];
                    const entries = Object.entries(item);

                    return (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                          <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-indigo-600" />
                            <h5 className="text-xs font-black text-slate-900">
                              {activeDataset.title} — 핵심 수집 지표 명세 해설
                            </h5>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            소관 기관: {activeDataset.agency}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {entries.map(([k, v], idx) => {
                            if (typeof v === 'object' && v !== null) {
                              return (
                                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 col-span-full">
                                  <div className="text-[11px] text-indigo-700 font-extrabold uppercase mb-1.5">
                                    {k} (상세 통계 분석)
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    {Object.entries(v).map(([subK, subV], sIdx) => (
                                      <div key={sIdx} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <span className="text-[10px] text-slate-500 block">{subK}</span>
                                        <strong className="text-slate-900 text-xs">{String(subV)}</strong>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200">
                                <div className="text-[10px] text-slate-500 font-mono font-bold truncate">
                                  {k}
                                </div>
                                <div className="text-base font-black text-slate-900 mt-1 break-words">
                                  {String(v)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}

                {/* 4P Research Citation Dual Injection Panel */}
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-700" />
                        <span>4P STEAM 탐구보고서 자동 인용 (Academic Citation)</span>
                      </h5>
                      <p className="text-[11px] text-indigo-800">
                        수집한 공공데이터를 4P 단계별 연구계획서에 학술적 근거 자료로 즉시 추가합니다.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleInjectDatasetTo4P('phenomenon')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                        title="P1 현상: 구체적 통계 및 데이터 포착 근거로 주입"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>P1. 현상에 인용</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInjectDatasetTo4P('problem')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                        title="P2 원인: 구조적 문제 및 격차의 정량적 원인 근거로 주입"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>P2. 원인분석에 인용</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInjectDatasetTo4P('project')}
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                        title="P3 과업: 전공 연구방법론의 공공데이터 수집 및 분석 과업으로 주입"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>P3. 과업방법에 인용</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs font-mono text-slate-800 leading-relaxed max-h-32 overflow-y-auto">
                    {govApiResponse.citation || activeDataset.sample4PCitation({ district: selectedDistrictParam })}
                  </div>
                </div>

                {/* Raw JSON Code Viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      JSON 응답 전문 (Raw Response Specification — {activeDataset.agency})
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      포맷: application/json · UTF-8
                    </span>
                  </div>

                  <div className="relative">
                    <pre className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed border border-slate-800 shadow-inner">
                      {govMockResponse}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 1-Minute 3-Step Guide Modal */}
          {showGuideModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-black text-sky-600 uppercase tracking-wider">
                      data.go.kr 가이드
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      공공데이터포털 무료 인증키 발급 3단계 (1분 소요)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(false)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-1.5">
                    <div className="font-extrabold text-sky-950 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[11px]">1</span>
                      <span>공공데이터포털(data.go.kr) 간편 로그인</span>
                    </div>
                    <p className="text-[11px] text-sky-900 pl-7">
                      [data.go.kr]에 접속한 후 카카오/네이버 또는 간편인증으로 로그인합니다. 학생이나 교사 누구나 무료로 이용할 수 있습니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1.5">
                    <div className="font-extrabold text-emerald-950 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">2</span>
                      <span>"에어코리아 대기오염정보" 검색 및 [활용신청]</span>
                    </div>
                    <p className="text-[11px] text-emerald-900 pl-7">
                      통합검색창에 <strong>한국환경공단 에어코리아 대기오염정보</strong>를 검색하고 <strong>[활용신청]</strong> 버튼을 누릅니다. 활용 목적에 '수업 실습 및 4P 탐구'를 입력하면 <strong>즉시 자동 승인</strong>됩니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 space-y-1.5">
                    <div className="font-extrabold text-indigo-950 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">3</span>
                      <span>마이페이지에서 일반 인증키 복사 & 실습 패널에 붙여넣기</span>
                    </div>
                    <p className="text-[11px] text-indigo-900 pl-7">
                      [마이페이지 → 오픈API → 개발계정]에서 <strong>일반 인증키(Encoding 또는 Decoding)</strong>를 복사하여 위 입력창에 넣으시면 끝입니다!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                      <Info className="w-3.5 h-3.5 text-amber-600" />
                      <span>수업 진행 시 꿀팁:</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      공공데이터포털에서 활용신청을 완료한 직후 약 30분~1시간 동안은 정부 게이트웨이 동기화 시간으로 인해 일시적으로 '등록되지 않은 키' 에러가 날 수 있습니다. 이 시간 동안에는 상단의 <strong>[키 없이 모의 시뮬레이터]</strong>를 켜서 끊김 없이 수업을 진행하실 수 있습니다!
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <a
                    href="https://www.data.go.kr"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <span>공공데이터포털 바로가기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowGuideModal(false)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
            {/* ======================================================== */}
      {/* 3. 인천 10개 군·구 통계 지표 분석 (환경 + 인구 + 산업 3대 모드) */}
      {/* ======================================================== */}
      {labSubTab === 'stats' && (
        <div className="space-y-6">
          {/* Quick AI Correlation Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black">
                  💡 두 지표의 격차 원인이 궁금한가요? (예: 송도 녹지율 vs 동구 열섬현상)
                </h4>
                <p className="text-[11px] text-amber-100">
                  AI가 도시형성사(간척 계획도시 vs 근대 구도심)와 공간 불평등 메커니즘을 사회과적 관점에서 해석해 드립니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setLabSubTab('ai-correlation')}
              className="px-4 py-2 bg-white text-slate-950 font-black text-xs rounded-xl shadow-xs hover:bg-amber-100 transition-colors shrink-0"
            >
              AI 상관관계 도출기 열기 →
            </button>
          </div>

          {/* Category Switcher: Environment vs Demographic vs Industry */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                분석 데이터 카테고리:
              </span>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setStatCategory('env')}
                className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  statCategory === 'env'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>🌿 환경·대기·생태 지표</span>
              </button>

              <button
                onClick={() => setStatCategory('demographic')}
                className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  statCategory === 'demographic'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>👥 인구·청년·가구 구조</span>
              </button>

              <button
                onClick={() => setStatCategory('industry')}
                className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  statCategory === 'industry'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Factory className="w-3.5 h-3.5" />
                <span>🏭 산업·일자리·경제</span>
              </button>
            </div>
          </div>

          {/* Region Category Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">권역별 필터:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: '전체 (10개 군·구)' },
                { id: '원도심·항만', label: '원도심·항만 (중·동·미추홀·계양)' },
                { id: '경제자유구역·신도심', label: '신도심·경제자유구역 (연수·서구)' },
                { id: '산업·주거복합', label: '산업·주거복합 (남동·부평)' },
                { id: '도서·생태지역', label: '도서·생태지역 (강화·옹진)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDistrictFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    districtFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* District Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {filteredDistricts.map((d) => {
              const isSelected = d.id === selectedDistrictId;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDistrictId(d.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{d.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{d.regionType.split('·')[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Selected District Detail Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Header with dynamic category title */}
            <div className={`p-6 sm:p-8 bg-gradient-to-r ${selectedDistrict.color} text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
                    {selectedDistrict.regionType}
                  </span>
                  <span className="text-xs text-white/80">{selectedDistrict.hanja}</span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-white/30 text-white">
                    {statCategory === 'env' ? '환경·생태 모드' : statCategory === 'demographic' ? '인구·청년 모드' : '산업·일자리 모드'}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black">
                  {statCategory === 'env' && `인천광역시 ${selectedDistrict.name} 환경·생태 지표 분석`}
                  {statCategory === 'demographic' && `인천광역시 ${selectedDistrict.name} 인구·청년·가구 구조 분석`}
                  {statCategory === 'industry' && `인천광역시 ${selectedDistrict.name} 산업·일자리·경제 클러스터 분석`}
                </h3>
                <p className="text-xs sm:text-sm text-white/90">
                  {statCategory === 'env' && `인구 ${(selectedDistrict.population / 10000).toFixed(1)}만 명 · 초미세먼지 ${selectedDistrict.envStats.airQualityPm25}㎍/㎥ · 공원면적 ${selectedDistrict.envStats.parkAreaPerCapita}㎡`}
                  {statCategory === 'demographic' && `총인구 ${selectedDistrict.population.toLocaleString()}명 · 청년비율 ${selectedDistrict.demographicStats.youthRatio19to34}% · 1인가구 ${selectedDistrict.demographicStats.singleHouseholdRatio}%`}
                  {statCategory === 'industry' && `사업체 ${selectedDistrict.industryStats.businessCount.toLocaleString()}개 · 종사자 ${selectedDistrict.industryStats.workerCount.toLocaleString()}명 · 청년고용률 ${selectedDistrict.industryStats.youthEmploymentRate}%`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => handleInjectDistrictTo4P(selectedDistrict, statCategory, 'phenomenon')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-slate-50 active:scale-95 transition-all"
                  title="P1 현상: 구체적 지역 현장 데이터로 계획서에 주입"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>P1. 현상에 넣기</span>
                </button>
                <button
                  onClick={() => handleInjectDistrictTo4P(selectedDistrict, statCategory, 'problem')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/40 font-extrabold text-xs backdrop-blur-md active:scale-95 transition-all"
                  title="P2 원인: 지역 격차 및 구조적 문제 분석 근거로 계획서에 주입"
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>P2. 원인에 넣기</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* ======================================================== */}
              {/* 3-A. ENVIRONMENT MODE */}
              {/* ======================================================== */}
              {statCategory === 'env' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Environmental Indicators */}
                    <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base">
                          <TreePine className="w-5 h-5 text-emerald-600" />
                          <h4>환경(Environment) 핵심 지표</h4>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium">인천 평균 비교</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>초미세먼지 (PM2.5 연평균)</span>
                            <span className={selectedDistrict.envStats.airQualityPm25 > INCHEON_AVERAGE.airQualityPm25 ? 'text-rose-600 font-black' : 'text-emerald-700 font-black'}>
                              {selectedDistrict.envStats.airQualityPm25} ㎍/㎥ (인천평균 {INCHEON_AVERAGE.airQualityPm25})
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${selectedDistrict.envStats.airQualityPm25 > INCHEON_AVERAGE.airQualityPm25 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (selectedDistrict.envStats.airQualityPm25 / 30) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>1인당 도시공원 면적</span>
                            <span className="text-emerald-700 font-black">
                              {selectedDistrict.envStats.parkAreaPerCapita} ㎡ (인천평균 {INCHEON_AVERAGE.parkAreaPerCapita})
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(100, (selectedDistrict.envStats.parkAreaPerCapita / 40) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                            <span className="text-slate-500 block text-[11px]">생활폐기물 재활용률</span>
                            <strong className="text-sm text-slate-900">{selectedDistrict.envStats.wasteRecycleRate}%</strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                            <span className="text-slate-500 block text-[11px]">1인당 탄소배출량</span>
                            <strong className="text-sm text-slate-900">{selectedDistrict.envStats.carbonEmissionPerCapita} tCO2eq</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Welfare Indicators */}
                    <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-base">
                          <Heart className="w-5 h-5 text-indigo-600" />
                          <h4>복지(Welfare) & 청소년 인프라</h4>
                        </div>
                        <span className="text-[11px] text-indigo-700 font-medium">안전망 지표</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>사회복지 예산 비중</span>
                            <span className="text-indigo-700 font-black">
                              {selectedDistrict.welfareStats.welfareBudgetRatio}% (인천평균 {INCHEON_AVERAGE.welfareBudgetRatio}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-indigo-500"
                              style={{ width: `${selectedDistrict.welfareStats.welfareBudgetRatio}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>기초생활수급률 (취약계층 비율)</span>
                            <span className="text-slate-900 font-black">{selectedDistrict.welfareStats.basicLivelihoodRate}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-amber-500"
                              style={{ width: `${Math.min(100, selectedDistrict.welfareStats.basicLivelihoodRate * 10)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-center">
                            <span className="text-slate-500 block text-[10px]">청소년 수련시설</span>
                            <strong className="text-sm text-indigo-700">{selectedDistrict.welfareStats.youthFacilityCount}곳</strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-center">
                            <span className="text-slate-500 block text-[10px]">공공 도서관</span>
                            <strong className="text-sm text-slate-900">{selectedDistrict.welfareStats.publicLibraryCount}관</strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-center">
                            <span className="text-slate-500 block text-[10px]">천명당 의사수</span>
                            <strong className="text-sm text-slate-900">{selectedDistrict.welfareStats.medicalDoctorCountPerThousand}명</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4P Environment Recommendation Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 space-y-3">
                    <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      {selectedDistrict.name} 환경·생태 4P 연구계획서 추천 모델
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-amber-200">
                        <strong className="text-amber-800 block text-[10px] font-black mb-1">P1. 포착한 현상</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.fourPInquiryTip.phenomenon}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-rose-200">
                        <strong className="text-rose-800 block text-[10px] font-black mb-1">P2. 원인 분석</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.fourPInquiryTip.problem}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-blue-200">
                        <strong className="text-blue-800 block text-[10px] font-black mb-1">P3. 전공 과업</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.fourPInquiryTip.project}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-emerald-200">
                        <strong className="text-emerald-800 block text-[10px] font-black mb-1">P4. 실천 대안</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.fourPInquiryTip.practice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 3-B. DEMOGRAPHIC MODE (인구·청년·가구) */}
              {/* ======================================================== */}
              {statCategory === 'demographic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age Pyramid & Youth Distribution */}
                    <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-base">
                          <Users className="w-5 h-5 text-indigo-600" />
                          <h4>연령별 인구 피라미드 & 청년 세대</h4>
                        </div>
                        <span className="text-[11px] text-indigo-700 font-medium">인천 평균 대비</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>만 19~34세 청년 인구 비중</span>
                            <span className={selectedDistrict.demographicStats.youthRatio19to34 >= INCHEON_AVERAGE.youthRatio19to34 ? 'text-indigo-700 font-black' : 'text-amber-700 font-black'}>
                              {selectedDistrict.demographicStats.youthRatio19to34}% (인천평균 {INCHEON_AVERAGE.youthRatio19to34}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-indigo-600"
                              style={{ width: `${Math.min(100, (selectedDistrict.demographicStats.youthRatio19to34 / 30) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>65세 이상 초고령 인구 비중</span>
                            <span className={selectedDistrict.elderlyRatio >= 20 ? 'text-rose-600 font-black' : 'text-slate-700 font-black'}>
                              {selectedDistrict.elderlyRatio}% (인천평균 {INCHEON_AVERAGE.elderlyRatio}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${selectedDistrict.elderlyRatio >= 20 ? 'bg-rose-500' : 'bg-slate-500'}`}
                              style={{ width: `${Math.min(100, (selectedDistrict.elderlyRatio / 40) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                            <span className="text-slate-500 block text-[11px]">0~14세 유소년 비율</span>
                            <strong className="text-sm text-slate-900">{selectedDistrict.demographicStats.childRatio0to14}%</strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                            <span className="text-slate-500 block text-[11px]">15~64세 생산가능인구</span>
                            <strong className="text-sm text-slate-900">{selectedDistrict.demographicStats.workingAgeRatio15to64}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Households & Multicultural & Fertility */}
                    <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-900 font-extrabold text-base">
                          <Building2 className="w-5 h-5 text-purple-600" />
                          <h4>가구 구조 · 다문화 · 출산율</h4>
                        </div>
                        <span className="text-[11px] text-purple-700 font-medium">가구 다양성</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>1인 가구 비율</span>
                            <span className="text-purple-700 font-black">
                              {selectedDistrict.demographicStats.singleHouseholdRatio}% (인천평균 {INCHEON_AVERAGE.singleHouseholdRatio}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-purple-500"
                              style={{ width: `${Math.min(100, (selectedDistrict.demographicStats.singleHouseholdRatio / 50) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                            <span className="text-slate-500 block text-[11px]">합계출산율</span>
                            <strong className="text-sm text-purple-900">{selectedDistrict.demographicStats.fertilityRate}명</strong>
                            <span className="text-[10px] text-slate-400"> (인천평균 {INCHEON_AVERAGE.fertilityRate})</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                            <span className="text-slate-500 block text-[11px]">다문화·외국인 주민</span>
                            <strong className="text-sm text-slate-900">{selectedDistrict.demographicStats.multiculturalResidentCount.toLocaleString()}명</strong>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-purple-100 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-purple-900 block font-bold mb-0.5">인구 이동 & 정주 특성:</strong>
                          {selectedDistrict.demographicStats.migrationTrend}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4P Demographic Recommendation Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/80 space-y-3">
                    <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      {selectedDistrict.name} 인구·사회복지 4P 연구계획서 추천 모델
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-amber-200">
                        <strong className="text-amber-800 block text-[10px] font-black mb-1">P1. 포착한 현상</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.demographic4PTip.phenomenon}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-rose-200">
                        <strong className="text-rose-800 block text-[10px] font-black mb-1">P2. 원인 분석</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.demographic4PTip.problem}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-blue-200">
                        <strong className="text-blue-800 block text-[10px] font-black mb-1">P3. 전공 과업</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.demographic4PTip.project}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-emerald-200">
                        <strong className="text-emerald-800 block text-[10px] font-black mb-1">P4. 실천 대안</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.demographic4PTip.practice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 3-C. INDUSTRY MODE (산업·경제·일자리) */}
              {/* ======================================================== */}
              {statCategory === 'industry' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Industry & Key Clusters */}
                    <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-900 font-extrabold text-base">
                          <Factory className="w-5 h-5 text-blue-600" />
                          <h4>대표 특화 산업군 & 핵심 거점</h4>
                        </div>
                        <span className="text-[11px] text-blue-700 font-medium">산업 클러스터</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-blue-100 space-y-1">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">주력 산업</span>
                        <h5 className="text-sm font-black text-slate-900">{selectedDistrict.industryStats.primaryIndustry}</h5>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700 block">핵심 산업 거점 및 클러스터 4선</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDistrict.industryStats.keyIndustrialClusters.map((cluster, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-blue-200 text-blue-900 shadow-2xs">
                              📍 {cluster}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                        <strong className="block font-bold mb-0.5">산업·일자리 주요 과제:</strong>
                        {selectedDistrict.industryStats.economicIssue}
                      </div>
                    </div>

                    {/* Jobs & Employment Structure */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                          <Briefcase className="w-5 h-5 text-indigo-600" />
                          <h4>일자리 규모 & 업종별 고용 구조</h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">사업체 조사</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-slate-500 block text-[11px]">총 사업체 수</span>
                          <strong className="text-lg font-black text-slate-900">{selectedDistrict.industryStats.businessCount.toLocaleString()}개</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-slate-500 block text-[11px]">총 종사자 수</span>
                          <strong className="text-lg font-black text-slate-900">{selectedDistrict.industryStats.workerCount.toLocaleString()}명</strong>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>청년(15~29세) 고용률</span>
                          <span className="text-indigo-700 font-black">
                            {selectedDistrict.industryStats.youthEmploymentRate}% (인천평균 {INCHEON_AVERAGE.youthEmploymentRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-indigo-600"
                            style={{ width: `${selectedDistrict.industryStats.youthEmploymentRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                        <span className="text-slate-500 block text-[10px] font-bold uppercase">종사자 산업별 구성비</span>
                        <div className="flex h-3 rounded-full overflow-hidden">
                          <div className="bg-blue-600" style={{ width: `${selectedDistrict.industryStats.manufacturingRatio}%` }} title={`제조업 ${selectedDistrict.industryStats.manufacturingRatio}%`} />
                          <div className="bg-indigo-500" style={{ width: `${selectedDistrict.industryStats.serviceRatio}%` }} title={`서비스업 ${selectedDistrict.industryStats.serviceRatio}%`} />
                          <div className="bg-emerald-500" style={{ width: `${selectedDistrict.industryStats.techBioRatio}%` }} title={`첨단신산업 ${selectedDistrict.industryStats.techBioRatio}%`} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" />제조업 {selectedDistrict.industryStats.manufacturingRatio}%</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />서비스 {selectedDistrict.industryStats.serviceRatio}%</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />첨단·R&D {selectedDistrict.industryStats.techBioRatio}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4P Industry Recommendation Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 border border-blue-200/80 space-y-3">
                    <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      {selectedDistrict.name} 산업·경제·일자리 4P 연구계획서 추천 모델
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-amber-200">
                        <strong className="text-amber-800 block text-[10px] font-black mb-1">P1. 포착한 현상</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.industry4PTip.phenomenon}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-rose-200">
                        <strong className="text-rose-800 block text-[10px] font-black mb-1">P2. 원인 분석</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.industry4PTip.problem}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-blue-200">
                        <strong className="text-blue-800 block text-[10px] font-black mb-1">P3. 전공 과업</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.industry4PTip.project}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-emerald-200">
                        <strong className="text-emerald-800 block text-[10px] font-black mb-1">P4. 실천 대안</strong>
                        <p className="text-slate-700 leading-snug">{selectedDistrict.industry4PTip.practice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic 10-District Comparison Table */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    인천 10개 군·구 {statCategory === 'env' ? '환경·생태' : statCategory === 'demographic' ? '인구·청년·가구' : '산업·경제·일자리'} 비교 일람표
                  </h4>
                  <span className="text-[11px] text-slate-500">2024 인천광역시 통계연보 및 공공데이터 기준</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3">군·구명</th>
                        <th className="p-3">권역</th>
                        {statCategory === 'env' && (
                          <>
                            <th className="p-3">초미세먼지 (PM2.5)</th>
                            <th className="p-3">1인당 공원면적</th>
                            <th className="p-3">폐기물 재활용률</th>
                            <th className="p-3 text-right">탄소배출량</th>
                          </>
                        )}
                        {statCategory === 'demographic' && (
                          <>
                            <th className="p-3">총인구</th>
                            <th className="p-3">만19~34세 청년비율</th>
                            <th className="p-3">1인 가구비율</th>
                            <th className="p-3">65세이상 고령화율</th>
                            <th className="p-3 text-right">합계출산율</th>
                          </>
                        )}
                        {statCategory === 'industry' && (
                          <>
                            <th className="p-3">대표 특화산업</th>
                            <th className="p-3">사업체 수</th>
                            <th className="p-3">종사자 수</th>
                            <th className="p-3">제조업 비중</th>
                            <th className="p-3 text-right">청년고용률</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {INCHEON_10_DISTRICTS.map((d) => (
                        <tr
                          key={d.id}
                          onClick={() => setSelectedDistrictId(d.id)}
                          className={`cursor-pointer transition-colors ${
                            d.id === selectedDistrictId ? 'bg-indigo-50/70 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3 font-extrabold text-slate-900">{d.name}</td>
                          <td className="p-3 text-slate-500">{d.regionType.split('·')[0]}</td>
                          {statCategory === 'env' && (
                            <>
                              <td className="p-3 text-indigo-700 font-bold">{d.envStats.airQualityPm25} ㎍/㎥</td>
                              <td className="p-3">{d.envStats.parkAreaPerCapita} ㎡</td>
                              <td className="p-3">{d.envStats.wasteRecycleRate}%</td>
                              <td className="p-3 text-right text-slate-700">{d.envStats.carbonEmissionPerCapita} tCO2</td>
                            </>
                          )}
                          {statCategory === 'demographic' && (
                            <>
                              <td className="p-3 text-slate-900 font-bold">{d.population.toLocaleString()}명</td>
                              <td className="p-3 text-indigo-700 font-bold">{d.demographicStats.youthRatio19to34}%</td>
                              <td className="p-3">{d.demographicStats.singleHouseholdRatio}%</td>
                              <td className="p-3 text-amber-700 font-bold">{d.elderlyRatio}%</td>
                              <td className="p-3 text-right text-purple-700 font-bold">{d.demographicStats.fertilityRate}명</td>
                            </>
                          )}
                          {statCategory === 'industry' && (
                            <>
                              <td className="p-3 text-slate-900 font-bold truncate max-w-xs">{d.industryStats.primaryIndustry.split('(')[0]}</td>
                              <td className="p-3">{d.industryStats.businessCount.toLocaleString()}개</td>
                              <td className="p-3 font-bold text-slate-900">{d.industryStats.workerCount.toLocaleString()}명</td>
                              <td className="p-3">{d.industryStats.manufacturingRatio}%</td>
                              <td className="p-3 text-right text-indigo-700 font-bold">{d.industryStats.youthEmploymentRate}%</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
{/* 4. 현장 사진 & 소감문 갤러리 */}
      {/* ======================================================== */}
      {labSubTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">현장 답사 아카이빙</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                인천 읽·걷·쓰 현장 탐구 사진 & 소감문 갤러리
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                학생들이 발로 뛴 인천의 장소 사진과 4P 관찰 소감문을 올리고 함께 공유하는 인터랙티브 피드입니다.
              </p>
            </div>

            <button
              onClick={() => setIsUploading(!isUploading)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/20 transition-all shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>{isUploading ? '작성 닫기' : '내 현장 사진·소감 올리기'}</span>
            </button>
          </div>

          {/* Upload Form Modal/Box */}
          {isUploading && (
            <form onSubmit={handleCreatePost} className="p-6 rounded-3xl bg-white border-2 border-rose-200 shadow-lg space-y-5 animate-in fade-in">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-rose-600" />
                새로운 현장 답사 소감문 등록
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">학생 이름 *</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">소속 학교 / 학년</label>
                  <input
                    type="text"
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value)}
                    placeholder="예: 인천OO고 2학년"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">4P 단계 선택</label>
                  <select
                    value={newFourPTag}
                    onChange={(e) => setNewFourPTag(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                  >
                    <option value="P1 현상관찰">P1. 현상 관찰</option>
                    <option value="P2 원인발견">P2. 원인 발견</option>
                    <option value="P3 과업실험">P3. 과업 실험</option>
                    <option value="P4 실천소감">P4. 실천 소감</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">답사 장소</label>
                  <select
                    value={newSpotName}
                    onChange={(e) => setNewSpotName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                  >
                    <option value="수도권매립지 드림파크 야생화생태공원">수도권매립지 드림파크 야생화생태공원</option>
                    <option value="개항장 홍예문 & 조계지 거리">개항장 홍예문 & 조계지 거리</option>
                    <option value="인천 자유공원 & 둘레길">인천 자유공원 & 둘레길</option>
                    <option value="송도 센트럴파크 & 수상수로">송도 센트럴파크 & 수상수로</option>
                    <option value="소래습지생태공원 & 옛 염전">소래습지생태공원 & 옛 염전</option>
                    <option value="부평 캠프마켓 & 부평공원">부평 캠프마켓 & 부평공원</option>
                    <option value="신포국제시장 골목 상권">신포국제시장 골목 상권</option>
                    <option value="강화 초지진 & 갯벌">강화 초지진 & 갯벌</option>
                    <option value="기타 학교 주변 및 마을">기타 학교 주변 및 마을</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">현장 사진 첨부</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">현장 관찰 및 사색 소감문 *</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="현장을 직접 걸으며 눈으로 보고 느낀 점, 혹은 4P 연구로 발전시키고 싶은 생각을 2~3줄로 적어주세요."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                >
                  등록하기
                </button>
              </div>
            </form>
          )}

          {/* Gallery Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo Header */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={post.photoUrl}
                    alt={post.spotName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-white">
                      {post.fourPTag}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white drop-shadow-md">
                    <span className="font-bold truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {post.spotName}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-bold text-slate-900">{post.studentName}</span>
                      <span className="text-[11px]">{post.school}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-4">
                      "{post.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">{post.createdAt}</span>
                    <button
                      onClick={() => handleLike(post.id)}
                      className="inline-flex items-center gap-1 text-rose-600 font-bold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>{post.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. 퀴즈 & 밸런스 게임 */}
      {/* ======================================================== */}
      {labSubTab === 'quiz' && (
        <div className="space-y-6">
          <div className="flex gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-fit">
            <button
              onClick={() => setGameSubTab('quiz')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                gameSubTab === 'quiz'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎯 읽·걷·쓰 인천 퀴즈 (10문항)
            </button>
            <button
              onClick={() => setGameSubTab('balance')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                gameSubTab === 'balance'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚖️ 인천 사회문제 밸런스 게임 (4대 딜레마)
            </button>
          </div>

          {gameSubTab === 'quiz' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-indigo-600 uppercase">인천 사회문제탐구 마스터 도전</span>
                  <h3 className="text-xl font-black text-slate-900">
                    현재 퀴즈 획득 점수: <span className="text-indigo-600 font-extrabold text-2xl">{totalScore}점</span> / 100점
                  </h3>
                  <p className="text-xs text-slate-500">
                    {Object.keys(quizAnswers).length} / 10문항 완료 · 틀린 문제는 해설을 통해 4P 탐구 지식을 쌓을 수 있습니다.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuizAnswers({});
                      setShowExplanation({});
                      setActiveHint({});
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>다시 풀기</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {INCHEON_QUIZZES.map((quiz) => {
                  const userAnswer = quizAnswers[quiz.id];
                  const isAnswered = userAnswer !== undefined;
                  const isCorrect = isAnswered && userAnswer === quiz.correctIndex;

                  return (
                    <div
                      key={quiz.id}
                      className={`p-6 rounded-3xl bg-white border transition-all ${
                        !isAnswered
                          ? 'border-slate-200'
                          : isCorrect
                          ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                          : 'border-rose-300 bg-rose-50/20 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                            Q{quiz.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            {quiz.category}
                          </span>
                        </div>

                        {isAnswered && (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full ${
                              isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{isCorrect ? '정답 (+10점)' : '오답'}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-4">
                        {quiz.question}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {quiz.options.map((option, optIdx) => {
                          const isThisSelected = userAnswer === optIdx;
                          const isThisCorrect = quiz.correctIndex === optIdx;

                          let btnStyle = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800';
                          if (isAnswered) {
                            if (isThisCorrect) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-500';
                            } else if (isThisSelected) {
                              btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                            } else {
                              btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswered}
                              onClick={() => handleSelectQuizOption(quiz.id, optIdx)}
                              className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center gap-3 ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                                {optIdx + 1}
                              </span>
                              <span className="leading-snug">{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {!isAnswered && (
                        <div className="mt-3 text-right">
                          <button
                            onClick={() => setActiveHint((prev) => ({ ...prev, [quiz.id]: !prev[quiz.id] }))}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{activeHint[quiz.id] ? '힌트 닫기' : '힌트 보기'}</span>
                          </button>
                          {activeHint[quiz.id] && (
                            <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 mt-2 text-left animate-in fade-in">
                              💡 <strong>힌트:</strong> {quiz.hint}
                            </p>
                          )}
                        </div>
                      )}

                      {showExplanation[quiz.id] && (
                        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 space-y-1 animate-in fade-in">
                          <strong className="font-extrabold text-indigo-900 block flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            정답 및 탐구 해설:
                          </strong>
                          <p className="leading-relaxed">{quiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {gameSubTab === 'balance' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-amber-600 uppercase">인천 사회문제 딜레마 토론</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  정답이 없는 두 갈래의 가치 충돌: 나의 선택은?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  선택지를 고르고 또래 학생들의 투표율과 핵심 사회적 가치를 비교해 보세요. 이 딜레마는 4P 탐구의 훌륭한 연구 주제가 됩니다.
                </p>
              </div>

              <div className="space-y-6">
                {INCHEON_BALANCE_GAMES.map((item) => {
                  const myVote = balanceVotes[item.id];
                  return (
                    <div key={item.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {item.category}
                        </span>
                        <h4 className="text-base font-black text-slate-900">{item.topic}</h4>
                        <Scale className="w-5 h-5 text-indigo-500" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          onClick={() => setBalanceVotes((prev) => ({ ...prev, [item.id]: 'A' }))}
                          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between select-none ${
                            myVote === 'A'
                              ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-blue-300 bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-blue-600">선택 A</span>
                              {myVote === 'A' && (
                                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                                  내가 선택함
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-extrabold text-slate-900 leading-snug">
                              {item.optionA.title}
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.optionA.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200/80">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.optionA.keyValues.map((val, idx) => (
                                <span key={idx} className="text-[10px] font-semibold bg-white border border-blue-200 text-blue-800 px-1.5 py-0.5 rounded-md">
                                  #{val}
                                </span>
                              ))}
                            </div>
                            {myVote && (
                              <div className="space-y-1 animate-in fade-in">
                                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                                  <span>학생 지지율</span>
                                  <span className="text-blue-600 font-extrabold">{item.optionA.initialVotesPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{ width: `${item.optionA.initialVotesPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          onClick={() => setBalanceVotes((prev) => ({ ...prev, [item.id]: 'B' }))}
                          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between select-none ${
                            myVote === 'B'
                              ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-emerald-300 bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-emerald-600">선택 B</span>
                              {myVote === 'B' && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                  내가 선택함
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-extrabold text-slate-900 leading-snug">
                              {item.optionB.title}
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.optionB.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200/80">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.optionB.keyValues.map((val, idx) => (
                                <span key={idx} className="text-[10px] font-semibold bg-white border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-md">
                                  #{val}
                                </span>
                              ))}
                            </div>
                            {myVote && (
                              <div className="space-y-1 animate-in fade-in">
                                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                                  <span>학생 지지율</span>
                                  <span className="text-emerald-600 font-extrabold">{item.optionB.initialVotesPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-emerald-600"
                                    style={{ width: `${item.optionB.initialVotesPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>4P 연구 확장 팁:</strong> {item.inquiryConnectionTip}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. 정책제안 카드 메이커 */}
      {/* ======================================================== */}
      {labSubTab === 'policy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">실험 프로토타입</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">인천시 청소년 정책제안 카드 변환</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                현재 작성 중인 4P 탐구 보고서를 인천광역시 시민제안, 학교 학생회, 지역 주민참여예산에 바로 제출할 수 있는 공문서·카드 형태로 자동 변환합니다.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700">제안 제출 대상 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'incheon-city', label: '인천광역시청', sub: '열린시장실' },
                  { id: 'school-council', label: '교내 학생회', sub: '학급 자치회의' },
                  { id: 'local-community', label: '군·구 주민자치회', sub: '지역 공청회' },
                ].map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setTargetAudience(target.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      targetAudience === target.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <div className="text-xs">{target.label}</div>
                    <div className="text-[10px] text-slate-500">{target.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyPolicy}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '복사 완료!' : '제안서 텍스트 복사'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-indigo-100 p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[11px] font-black text-indigo-600 tracking-wider">INCHEON SOCIAL INQUIRY PROPOSAL</span>
                  <h4 className="text-xl font-black text-slate-900 mt-0.5">
                    {project.title || '인천 지역사회 문제해결을 위한 4P 제안'}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                    {targetAudience === 'incheon-city' ? '인천광역시청 제출용' : targetAudience === 'school-council' ? '학교 자치회 제출용' : '주민자치회 제출용'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-amber-700 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    P1. 포착한 지역 현상 (Phenomenon)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    {project.fourP.phenomenon || '4P 워크스페이스에서 현상을 작성하면 이곳에 실시간 요약됩니다.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-rose-700 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    P2. 구조적 원인과 문제 (Problem)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    {project.fourP.problem || '원인 분석 내용이 이곳에 반영됩니다.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-blue-700 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    P3. 전공 연계 해결 과업 (Project)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    {project.fourP.project || '전공 연구 방법론과 과업이 반영됩니다.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-emerald-700 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    P4. 기대되는 실천 효과 (Practice)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    {project.fourP.practice || '지역사회 실천 대안이 반영됩니다.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>제안자: <strong className="text-slate-800">{project.author || '학생 연구원'}</strong> ({project.affiliation || '인천'})</span>
                <span className="text-[11px]">인천 4P 읽·걷·쓰 사회문제탐구 플랫폼</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
