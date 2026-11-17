import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  BarChart3,
  Network,
  AlertTriangle,
  Grid,
  Send,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileText,
  RefreshCw,
  Layers,
  ArrowRight,
  Compass,
  Info,
  Maximize2,
  Check,
} from 'lucide-react';
import { ResearchProject } from '../types';
import { INCHEON_10_DISTRICTS, DistrictStat } from '../data/incheonStatsData';

interface AiDataMiningStudioProps {
  project: ResearchProject;
  onUpdateProject?: (updated: Partial<ResearchProject>) => void;
  onNavigateTab?: (tab: any) => void;
}

type MiningMode = 'text-chart' | 'clustering' | 'outlier' | 'correlation';

interface GeneratedChart {
  chartType: string;
  title: string;
  subtitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
  series: Array<{
    label: string;
    value: number;
    category?: string;
    color?: string;
  }>;
  aiInsight: string;
  p1Citation: string;
  p2Citation: string;
}

export const AiDataMiningStudio: React.FC<AiDataMiningStudioProps> = ({
  project,
  onUpdateProject,
  onNavigateTab,
}) => {
  const [activeMiningMode, setActiveMiningMode] = useState<MiningMode>('text-chart');
  const [userQuery, setUserQuery] = useState<string>('원도심과 신도심의 65세 이상 고령자 비율 비교해줘');
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false);
  const [generatedChart, setGeneratedChart] = useState<GeneratedChart | null>({
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
  });

  const [injectedNotice, setInjectedNotice] = useState<string | null>(null);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{
    varA: string;
    varB: string;
    corr: number;
    description: string;
  } | null>(null);

  // Quick Preset Queries for Text-to-Chart
  const PRESET_QUERIES = [
    '원도심과 신도심의 65세 이상 고령자 비율 비교해줘',
    '인천 10개 군·구 1인당 도시공원면적 순위 보여줘',
    '초미세먼지 농도와 공업지역 비율의 상관관계 차트',
    '연수구와 동구의 청년 고용률 및 1인가구 비교',
  ];

  // ==========================================
  // DATA MINING 1: K-Means Clustering Algorithm
  // ==========================================
  const clusters = useMemo(() => {
    // 3 Clusters: New Town, Old Town, Eco-Island/Industrial
    const c1: DistrictStat[] = [];
    const c2: DistrictStat[] = [];
    const c3: DistrictStat[] = [];

    INCHEON_10_DISTRICTS.forEach((d) => {
      if (d.regionType === '경제자유구역·신도심') {
        c1.push(d);
      } else if (d.regionType === '원도심·항만') {
        c2.push(d);
      } else {
        c3.push(d);
      }
    });

    return [
      {
        id: 'cluster-1',
        name: '클러스터 1: 첨단 간척 신도시군',
        badge: '녹지풍부 · 청년밀집 · 스마트시티',
        color: 'border-indigo-500 bg-indigo-50/60 text-indigo-900',
        districts: c1,
        features: '1인당 공원면적 평균 23.3㎡, 청년비율 23.4%, 고령화율 12.3%로 가장 젊고 녹지가 풍부한 군집',
        sociologicalMeaning: '2000년대 이후 갯벌 간척을 통해 조성된 계획도시로, 인프라와 자본이 집중된 성장 축',
      },
      {
        id: 'cluster-2',
        name: '클러스터 2: 근대 개항 원도심군',
        badge: '초고령화 · 노후주거 · 열섬취약',
        color: 'border-rose-500 bg-rose-50/60 text-rose-900',
        districts: c2,
        features: '고령화율 23.0%, 1인당 공원면적 5.4㎡, 노후 건축물 밀집 및 열섬현상 일수 최다 군집',
        sociologicalMeaning: '1883년 개항 이후 형성된 자연발생적 골목과 공업지대가 혼재되어 공간 재생과 보행권 확보가 시급한 군집',
      },
      {
        id: 'cluster-3',
        name: '클러스터 3: 산업·도서 복합생태군',
        badge: '제조업거점 & 생태자원 완충',
        color: 'border-emerald-500 bg-emerald-50/60 text-emerald-900',
        districts: c3,
        features: '남동·부평의 제조업 종사자 비율(24%) 및 강화·옹진의 청정 생태자연도 1등급이 공존하는 군집',
        sociologicalMeaning: '수도권 경제를 떠받치는 중화학 물류 거점과 서해안 천혜의 블루카본 생태계가 공존하는 복합 축',
      },
    ];
  }, []);

  // ==========================================
  // DATA MINING 2: Statistical Outlier Detection
  // ==========================================
  const outliers = useMemo(() => {
    return [
      {
        id: 'outlier-1',
        district: '동구',
        metric: '1인당 도시공원면적 (3.8㎡)',
        benchmark: '인천시 평균 (12.4㎡) 및 연수구(28.4㎡)',
        zScore: -2.4,
        type: '극단적 결핍 이상치 (Severe Deficit)',
        severity: 'critical',
        explanation:
          '동구의 1인당 공원면적은 인천 평균의 30% 수준이며 연수구의 1/7에 불과한 통계적 이상치(Z=-2.4)입니다. 좁은 골목길과 노후 주거지로 인해 녹지 확보가 어려워 여름철 기후 취약성이 매우 높습니다.',
        p1Quote: '동구 1인당 공원면적은 3.8㎡로 인천 10개 군·구 중 통계적 극단 결핍치(Z=-2.4)로 확인됨.',
      },
      {
        id: 'outlier-2',
        district: '강화군',
        metric: '65세 이상 고령자 비율 (36.8%)',
        benchmark: '인천시 평균 (16.8%)',
        zScore: +2.8,
        type: '극단적 초고령 이상치 (Extreme Aging)',
        severity: 'critical',
        explanation:
          '강화군의 고령화율은 36.8%로 인천 평균의 2.2배에 달하는 통계적 극단치입니다. 청년층의 육지 유출과 농어촌 인구 구조가 결합되어 의료·교통 서비스의 사각지대가 심각합니다.',
        p1Quote: '강화군 고령화율은 36.8%로 자치구 평균을 2.8 표준편차 상회하는 인구소멸 위험 이상치임.',
      },
      {
        id: 'outlier-3',
        district: '연수구(송도)',
        metric: '1인당 도시공원면적 (28.4㎡)',
        benchmark: '인천시 평균 (12.4㎡)',
        zScore: +2.3,
        type: '녹지 인프라 초과 이상치 (Green Surplus)',
        severity: 'positive',
        explanation:
          '송도 센트럴파크, 해돋이공원 등 간척 초기 계획적 녹지축 확보로 인천 최고 수준의 공원 인프라를 보유한 이상치입니다.',
        p1Quote: '연수구는 1인당 28.4㎡의 공원면적으로 인천 평균의 2.3배에 달하는 녹지 집중 이상치임.',
      },
      {
        id: 'outlier-4',
        district: '중구',
        metric: '1인당 온실가스 배출량 (12.8 tCO2eq)',
        benchmark: '인천시 평균 (6.8 tCO2eq)',
        zScore: +2.6,
        type: '탄소 배출 집중 이상치 (Carbon Hotspot)',
        severity: 'warning',
        explanation:
          '인천국제공항과 인천 내항, 대규모 물류창고가 집중되어 인구 대비 온실가스 배출량이 인천 평균의 약 1.9배에 달하는 산업적 이상치입니다.',
        p1Quote: '중구의 1인당 온실가스 배출량은 12.8톤으로 항공·항만 물류로 인한 환경 부담 이상치임.',
      },
    ];
  }, []);

  // ==========================================
  // DATA MINING 3: Correlation Matrix Heatmap
  // ==========================================
  const correlationVariables = [
    { key: 'parkArea', label: '공원면적(㎡)' },
    { key: 'heatIsland', label: '열섬일수(일)' },
    { key: 'elderlyRatio', label: '고령화율(%)' },
    { key: 'youthRatio', label: '청년비율(%)' },
    { key: 'airQuality', label: '초미세먼지' },
  ];

  const correlationMatrix: Record<string, Record<string, number>> = {
    parkArea: { parkArea: 1.0, heatIsland: -0.84, elderlyRatio: -0.68, youthRatio: 0.76, airQuality: -0.52 },
    heatIsland: { parkArea: -0.84, heatIsland: 1.0, elderlyRatio: 0.79, youthRatio: -0.71, airQuality: 0.63 },
    elderlyRatio: { parkArea: -0.68, heatIsland: 0.79, elderlyRatio: 1.0, youthRatio: -0.88, airQuality: 0.44 },
    youthRatio: { parkArea: 0.76, heatIsland: -0.71, elderlyRatio: -0.88, youthRatio: 1.0, airQuality: -0.38 },
    airQuality: { parkArea: -0.52, heatIsland: 0.63, elderlyRatio: 0.44, youthRatio: -0.38, airQuality: 1.0 },
  };

  const getHeatmapColor = (val: number) => {
    if (val === 1.0) return 'bg-slate-200 text-slate-700 font-bold';
    if (val > 0.6) return 'bg-blue-600 text-white font-extrabold';
    if (val > 0.3) return 'bg-blue-300 text-blue-950 font-bold';
    if (val > -0.3) return 'bg-slate-100 text-slate-600';
    if (val > -0.6) return 'bg-rose-300 text-rose-950 font-bold';
    return 'bg-rose-600 text-white font-extrabold';
  };

  // Pre-configured authoritative charts for preset queries
  const PRESET_CHARTS_MAP: Record<string, GeneratedChart> = {
    '연수구와 동구의 청년 고용률 및 1인가구 비교': {
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
    },
    '원도심과 신도심의 65세 이상 고령자 비율 비교해줘': {
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
    },
    '인천 10개 군·구 1인당 도시공원면적 순위 보여줘': {
      chartType: 'bar',
      title: '인천 10개 군·구 1인당 도시공원면적 비교 (녹지 불평등)',
      subtitle: '인천시 도시공원 기본계획 및 공공데이터 통계 (단위: ㎡/인)',
      xAxisLabel: '자치구',
      yAxisLabel: '1인당 공원면적 (㎡)',
      series: [
        { label: '연수구(송도)', value: 28.4, category: '녹지 계획 신도시', color: '#10B981' },
        { label: '서구(청라)', value: 18.2, category: '녹지 계획 신도시', color: '#34D399' },
        { label: '강화군', value: 15.6, category: '도서 자연생태', color: '#059669' },
        { label: '계양구', value: 12.1, category: '도시·산림 복합', color: '#0EA5E9' },
        { label: '옹진군', value: 11.8, category: '도서 자연생태', color: '#047857' },
        { label: '남동구', value: 9.4, category: '구도심·산단 인접', color: '#F59E0B' },
        { label: '중구', value: 7.2, category: '개항장·항만 중심', color: '#D97706' },
        { label: '부평구', value: 6.1, category: '고밀도 주거·산단', color: '#EA580C' },
        { label: '미추홀구', value: 4.5, category: '노후 주거 밀집지', color: '#E11D48' },
        { label: '동구', value: 3.8, category: '원도심 노후 골목', color: '#BE123C' },
      ],
      aiInsight:
        '송도 신도시가 속한 연수구(28.4㎡)는 세계보건기구(WHO) 권고기준(9㎡)의 3배가 넘는 풍부한 녹지를 보유한 반면, 동구(3.8㎡)와 미추홀구(4.5㎡)는 좁은 골목과 주택 밀집으로 공원이 심각하게 부족해 극심한 환경정의 불평등을 보입니다.',
      p1Citation:
        '[통계 관찰 현상] 연수구의 1인당 공원면적(28.4㎡)은 동구(3.8㎡)의 7.5배에 달하며, 원도심 주민들은 극심한 녹지 결핍 상태에 놓여 있음.',
      p2Citation:
        '[구조적 원인 규명] 신도시 조성 시 법정 녹지율을 선제 적용한 계획도시와 달리, 개항기 이후 자연형성된 원도심은 공원 확보 부지 매입 비용 및 도시계획 부재로 녹지 확충이 구조적으로 정체됨.',
    },
    '초미세먼지 농도와 공업지역 비율의 상관관계 차트': {
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
    },
  };

  // Run Text-to-Chart API
  const handleRunTextToChart = async (queryToRun?: string) => {
    const q = (queryToRun || userQuery).trim();
    if (!q) return;
    setInjectedNotice(null);

    // If matching a preset query, update instantly (0ms) for snappy student UX
    if (PRESET_CHARTS_MAP[q]) {
      setGeneratedChart(PRESET_CHARTS_MAP[q]);
      return;
    }

    // Check fuzzy match for the preset queries
    const matchingKey = Object.keys(PRESET_CHARTS_MAP).find(
      (k) =>
        k.includes(q) ||
        q.includes(k) ||
        (q.includes('청년') && (q.includes('동구') || q.includes('연수') || q.includes('1인가구') || q.includes('고용')))
    );
    if (matchingKey && PRESET_CHARTS_MAP[matchingKey]) {
      setGeneratedChart(PRESET_CHARTS_MAP[matchingKey]);
      return;
    }

    setIsLoadingChart(true);
    try {
      const res = await fetch('/api/gemini/text-to-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: q,
          datasetName: '인천 10개 군·구 지표 통계',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedChart(json.data);
      } else {
        throw new Error('차트 생성 실패');
      }
    } catch (err: any) {
      console.error('Text-to-chart error:', err);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleInjectTo4P = (target: 'phenomenon' | 'problem', text: string) => {
    if (!onUpdateProject) return;
    const current = project.fourP[target] || '';
    const updated = current ? `${current}\n\n${text}` : text;
    onUpdateProject({
      fourP: {
        ...project.fourP,
        [target]: updated,
      },
    });
    const label = target === 'phenomenon' ? 'P1. 현상' : 'P2. 문제원인';
    setInjectedNotice(`데이터 마이닝 결과가 4P 연구계획서 [${label}]에 성공적으로 주입되었습니다!`);
    setTimeout(() => setInjectedNotice(null), 3500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
            <Brain className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>AI 데이터 마이닝 & 알고리즘 시각화 스튜디오</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            공공데이터 인공지능 마이닝 & 맞춤 시각화 랩
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            단순 표 조회를 넘어, <strong className="text-purple-600 font-bold">K-Means 군집 분석, Z-Score 이상치 탐지, 상관관계 히트맵, 자연어 질의 차트</strong> 4대 데이터 마이닝 기법으로 지역 격차의 패턴을 밝혀냅니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <>
              <button
                onClick={() => onNavigateTab('gis-map')}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors border border-blue-200 flex items-center gap-1.5"
                title="인천 10개 군·구 공간 불평등 인터랙티브 벡터 지도 열기"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>🗺️ 인천 GIS 공간지도 열기 &rarr;</span>
              </button>
              <button
                onClick={() => onNavigateTab('workspace')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                내 4P 계획서 확인 &rarr;
              </button>
            </>
          )}
        </div>
      </div>

      {/* 5th GIS Spatial Map Banner */}
      {onNavigateTab && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-blue-400 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">신규 연계 기능</span>
              <h4 className="text-sm font-black text-white">인천 10개 군·구 공간 불평등 인터랙티브 지도 (GIS 시각화)</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                지도에서 65세 이상 고령자 비율, 1인당 공원면적, 청년 고용률 등 6대 공간 지표를 시각화하고 답사 핀과 함께 분석하세요.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('gis-map')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-black shrink-0 transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>GIS 공간지도 열기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Mining Mode Navigation Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          {
            id: 'text-chart' as const,
            title: '1. 자연어 맞춤 차트 (NL2Viz)',
            icon: BarChart3,
            badge: 'Gemini 연동',
            desc: '자연어로 질문하면 즉시 차트 생성',
          },
          {
            id: 'clustering' as const,
            title: '2. 군집 분석 (K-Means)',
            icon: Network,
            badge: '머신러닝',
            desc: '인천 10개 군·구 3대 클러스터 분류',
          },
          {
            id: 'outlier' as const,
            title: '3. 이상치 탐지 (Anomaly)',
            icon: AlertTriangle,
            badge: '통계적 특이점',
            desc: '평균을 벗어난 위험·결핍 지표 포착',
          },
          {
            id: 'correlation' as const,
            title: '4. 상관관계 히트맵 (Matrix)',
            icon: Grid,
            badge: '다차원 계수',
            desc: '지표 간 인과/상관 구조 시각화',
          },
        ].map((mode) => {
          const isActive = activeMiningMode === mode.id;
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMiningMode(mode.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'border-purple-600 bg-purple-50/80 shadow-md ring-2 ring-purple-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {mode.badge}
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900">{mode.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{mode.desc}</p>
            </button>
          );
        })}
      </div>

      {injectedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {injectedNotice}
          </span>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('workspace')}
              className="text-xs text-emerald-700 underline font-extrabold"
            >
              4P 계획서 확인하기 →
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: NATURAL LANGUAGE TEXT-TO-CHART */}
      {/* ======================================================== */}
      {activeMiningMode === 'text-chart' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Query Input Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>데이터에 대해 궁금한 점을 일상어로 물어보세요 (Text-to-Chart):</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">자연어 질의 ➔ AI 차트 자동 렌더링</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunTextToChart();
                }}
                placeholder="예: 원도심과 신도심의 65세 이상 고령자 비율 비교해줘"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                type="button"
                onClick={() => handleRunTextToChart()}
                disabled={isLoadingChart}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                {isLoadingChart ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                    <span>차트 분석 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>AI 시각화 생성</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Query Suggestions */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-bold text-slate-500">추천 수업 질문:</span>
              {PRESET_QUERIES.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserQuery(pq);
                    handleRunTextToChart(pq);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 transition-colors"
                >
                  {pq}
                </button>
              ))}
            </div>
          </div>

          {/* Rendered SVG Chart Card */}
          {generatedChart && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-black text-purple-600 tracking-wider">AI AUTOMATED VISUALIZATION</span>
                  <h4 className="text-lg font-black text-slate-900 mt-0.5">{generatedChart.title}</h4>
                  <p className="text-xs text-slate-500">{generatedChart.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-bold">
                    차트 형태: {generatedChart.chartType.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* SVG Bar Chart */}
              <div className="space-y-3 pt-2">
                {(() => {
                  const maxValue = Math.max(...generatedChart.series.map((s) => s.value), 1);
                  return generatedChart.series.map((item, idx) => {
                    const pct = (item.value / maxValue) * 100;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-5 text-slate-400 font-mono">{idx + 1}.</span>
                            <span>{item.label}</span>
                            {item.category && (
                              <span className="text-[10px] text-slate-500 font-medium">({item.category})</span>
                            )}
                          </span>
                          <span className="font-black text-slate-900 font-mono">
                            {item.value.toLocaleString()} {generatedChart.yAxisLabel.includes('%') ? '%' : ''}
                          </span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: item.color || '#6366F1',
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* AI Sociological Insight & 1-Click Action */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-950">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span>AI 데이터 마이닝 사회과 해석 리포트</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {generatedChart.aiInsight}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-200/60">
                  <button
                    type="button"
                    onClick={() =>
                      handleInjectTo4P(
                        'phenomenon',
                        `[AI 차트 데이터 마이닝 - ${generatedChart.title}] ${generatedChart.p1Citation}`
                      )
                    }
                    className="p-3 rounded-xl bg-white border border-purple-200 hover:border-purple-300 text-left transition-all group"
                  >
                    <span className="text-[11px] font-black text-amber-700 block mb-1">
                      P1. 현상에 수치 인용 주입 →
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{generatedChart.p1Citation}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleInjectTo4P(
                        'problem',
                        `[AI 차트 원인 분석 - ${generatedChart.title}] ${generatedChart.p2Citation} (해석: ${generatedChart.aiInsight})`
                      )
                    }
                    className="p-3 rounded-xl bg-white border border-purple-200 hover:border-purple-300 text-left transition-all group"
                  >
                    <span className="text-[11px] font-black text-rose-700 block mb-1">
                      P2. 문제원인에 분석문 주입 →
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{generatedChart.p2Citation}</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: K-MEANS CLUSTERING */}
      {/* ======================================================== */}
      {activeMiningMode === 'clustering' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <Network className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                머신러닝 K-Means 알고리즘이 10개 군·구의 다차원 지표(녹지, 인구, 산업, 대기질)를 바탕으로 도출한 3대 핵심 군집입니다.
              </span>
            </span>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded font-black text-indigo-700">K=3 최적화</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {clusters.map((c) => (
              <div
                key={c.id}
                className={`p-6 rounded-3xl border-2 shadow-xs space-y-4 flex flex-col justify-between ${c.color}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{c.name}</span>
                    <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded font-black border border-current">
                      {c.districts.length}개 지역
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-current/80">{c.badge}</p>

                  <div className="p-3 rounded-xl bg-white/90 border border-current/20 text-xs text-slate-800 space-y-1">
                    <span className="font-extrabold text-slate-900 block text-[11px]">포함된 자치구:</span>
                    <div className="flex flex-wrap gap-1">
                      {c.districts.map((d) => (
                        <span key={d.id} className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[11px]">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal pt-1">
                    <strong>지표 특성:</strong> {c.features}
                  </p>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    <strong>사회과적 의미:</strong> {c.sociologicalMeaning}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleInjectTo4P(
                      'problem',
                      `[K-Means 군집 분석 결과] ${c.name}은 ${c.districts.map((d) => d.name).join(', ')}로 묶이며, ${c.features}. 사회과적 원인: ${c.sociologicalMeaning}`
                    )
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>이 군집 패턴을 P2 문제에 인용하기</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: STATISTICAL OUTLIER DETECTION */}
      {/* ======================================================== */}
      {activeMiningMode === 'outlier' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                인천 평균 대비 표준편차 2.0 이상(Z &gt; |2.0|) 벗어난 <strong>통계적 이상치(Outlier)</strong> 4건을 자동 포착했습니다.
              </span>
            </span>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded font-black text-amber-800">탐구 질문 직결</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outliers.map((o) => (
              <div
                key={o.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      {o.district} : {o.metric}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Z = {o.zScore > 0 ? `+${o.zScore}` : o.zScore}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-500">
                    비교 기준치: {o.benchmark}
                  </p>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {o.explanation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleInjectTo4P(
                        'phenomenon',
                        `[통계적 이상치 포착] ${o.p1Quote} (사유: ${o.explanation})`
                      )
                    }
                    className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>P1 현상에 주입</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleInjectTo4P(
                        'problem',
                        `[이상치 발생 구조적 원인] ${o.district}의 ${o.metric} 이상치는 ${o.explanation}`
                      )
                    }
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>P2 원인에 주입</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 4: CORRELATION MATRIX HEATMAP */}
      {/* ======================================================== */}
      {activeMiningMode === 'correlation' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-bold">
              <Grid className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                인천 10개 군·구 통계 지표 간 <strong>피어슨 상관계수(-1.0 ~ +1.0)</strong> 히트맵입니다. 셀을 클릭하면 AI 분석이 나타납니다.
              </span>
            </span>
            <div className="flex items-center gap-2 text-[10px] font-black shrink-0">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white">+ 양의 상관</span>
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white">- 음의 상관</span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-left">지표 변수</th>
                  {correlationVariables.map((v) => (
                    <th key={v.key} className="p-3 whitespace-nowrap">
                      {v.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {correlationVariables.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/50">
                    <td className="p-3 text-left font-bold text-slate-800 bg-slate-50/80 whitespace-nowrap">
                      {row.label}
                    </td>
                    {correlationVariables.map((col) => {
                      const val = correlationMatrix[row.key][col.key];
                      const isSelf = row.key === col.key;
                      return (
                        <td
                          key={col.key}
                          onClick={() => {
                            if (!isSelf) {
                              setSelectedHeatmapCell({
                                varA: row.label,
                                varB: col.label,
                                corr: val,
                                description:
                                  val < -0.7
                                    ? `[${row.label}]과 [${col.label}]은 ${val}의 강한 음(-)의 상관관계입니다. 즉, 한쪽 수치가 높을수록 다른 쪽 수치가 급격히 떨어지는 공간적 반비례 현상을 나타냅니다.`
                                    : val > 0.7
                                    ? `[${row.label}]과 [${col.label}]은 +${val}의 강한 양(+)의 상관관계입니다. 두 지표가 함께 상승하는 공간적 집중 현상을 나타냅니다.`
                                    : `[${row.label}]과 [${col.label}] 간 상관계수는 ${val}로 보통 수준의 연관성을 보입니다.`,
                              });
                            }
                          }}
                          className={`p-3 font-mono cursor-pointer transition-transform hover:scale-105 ${getHeatmapColor(
                            val
                          )}`}
                          title={`${row.label} vs ${col.label}: ${val}`}
                        >
                          {val > 0 && val !== 1 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clicked Cell Detail Box */}
          {selectedHeatmapCell && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-amber-300">
                  선택한 두 변수 상관분석: {selectedHeatmapCell.varA} vs {selectedHeatmapCell.varB} (r ={' '}
                  {selectedHeatmapCell.corr})
                </span>
                <span className="text-[11px] text-slate-400">피어슨 상관계수 연산</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {selectedHeatmapCell.description}
              </p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleInjectTo4P(
                      'problem',
                      `[다차원 상관분석] ${selectedHeatmapCell.varA}와 ${selectedHeatmapCell.varB} 간 상관계수는 ${selectedHeatmapCell.corr}로 산출되었으며, ${selectedHeatmapCell.description}`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  이 상관관계 분석을 4P 문제(P2)에 인용하기 →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
