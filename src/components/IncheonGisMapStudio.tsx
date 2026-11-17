import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Layers,
  Sparkles,
  Info,
  Compass,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Footprints,
  Calendar,
  Camera,
  BookOpen,
  Filter,
  Check,
  Maximize2,
  RefreshCw,
  Search,
  ExternalLink,
  Globe,
  Satellite,
  Map,
  ArrowUpDown,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { ResearchProject, GisNavigationPreset, GisMetricId } from '../types';
import { INCHEON_10_DISTRICTS, DistrictStat, INCHEON_AVERAGE } from '../data/incheonStatsData';
import { IncheonInteractiveLeafletMap } from './IncheonInteractiveLeafletMap';

interface IncheonGisMapStudioProps {
  project: ResearchProject;
  onUpdateProject?: (updated: Partial<ResearchProject>) => void;
  onNavigateTab?: (tab: any) => void;
  gisPreset?: GisNavigationPreset | null;
  onClearGisPreset?: () => void;
}

// 7 Key Spatial Inequality Indicators
export type GisMetricKey =
  | 'elderlyRatio'
  | 'parkArea'
  | 'airPm25'
  | 'youthEmployment'
  | 'singleHousehold'
  | 'basicLivelihood'
  | 'heatIsland';

export interface MetricConfig {
  key: GisMetricKey;
  label: string;
  unit: string;
  category: '인구·복지' | '환경·녹지' | '일자리·산업';
  description: string;
  badge: string;
  colorScheme: 'red' | 'green' | 'blue' | 'purple' | 'amber';
  avgVal: number;
  isReversePolarity?: boolean;
}

const METRICS_CATALOG: MetricConfig[] = [
  {
    key: 'elderlyRatio',
    label: '65세 이상 고령자 비율',
    unit: '%',
    category: '인구·복지',
    description: '원도심·도서지역 초고령화(강화 36.8%, 동구 24.8%) vs 신도시 청년밀집(연수 11.2%) 인구 양극화',
    badge: '인구소멸위험',
    colorScheme: 'red',
    avgVal: INCHEON_AVERAGE.elderlyRatio,
    isReversePolarity: true,
  },
  {
    key: 'parkArea',
    label: '1인당 도시공원면적',
    unit: '㎡/인',
    category: '환경·녹지',
    description: '송도 신도시(28.4㎡) vs 원도심 동구(3.8㎡) 간 7.5배에 달하는 극심한 녹지 불평등',
    badge: '환경정의',
    colorScheme: 'green',
    avgVal: INCHEON_AVERAGE.parkAreaPerCapita,
    isReversePolarity: false,
  },
  {
    key: 'airPm25',
    label: '초미세먼지(PM2.5) 연평균',
    unit: '㎍/㎥',
    category: '환경·녹지',
    description: '항만 물류 및 중화학 제철소 배후지(중구 23.5, 동구 22.8)와 청정 도서지역(옹진 14.8)의 대기질 격차',
    badge: '대기환경',
    colorScheme: 'amber',
    avgVal: INCHEON_AVERAGE.airQualityPm25,
    isReversePolarity: true,
  },
  {
    key: 'youthEmployment',
    label: '청년 고용률 (만15~29세)',
    unit: '%',
    category: '일자리·산업',
    description: '송도 바이오·R&D 첨단산업(연수 52.4%) vs 전통 중화학제조업 쇠퇴(동구 41.2%) 일자리 양극화',
    badge: '청년일자리',
    colorScheme: 'blue',
    avgVal: INCHEON_AVERAGE.youthEmploymentRate,
    isReversePolarity: false,
  },
  {
    key: 'singleHousehold',
    label: '1인 가구 비율',
    unit: '%',
    category: '인구·복지',
    description: '원도심 독거어르신 중심(동구 39.4%) vs 신도시 아파트 가구(연수 28.5%)의 가구 구조 격차',
    badge: '가구구조',
    colorScheme: 'purple',
    avgVal: INCHEON_AVERAGE.singleHouseholdRatio,
    isReversePolarity: true,
  },
  {
    key: 'basicLivelihood',
    label: '기초생활보장 수급률',
    unit: '%',
    category: '인구·복지',
    description: '취약계층 집중 원도심(동구 7.8%, 미추홀 6.9%) vs 신도심(연수 2.9%)의 사회안전망 수요 격차',
    badge: '사회복지',
    colorScheme: 'red',
    avgVal: INCHEON_AVERAGE.basicLivelihoodRate,
    isReversePolarity: true,
  },
];

interface MetricDisparityHint {
  headline: string;
  pairs: {
    label: string;
    leftId: string;
    rightId: string;
    gapSummary: string;
  }[];
  questionTemplate: string;
  recommendedLabs: string;
}

const METRIC_DISPARITY_HINTS: Record<GisMetricId, MetricDisparityHint> = {
  elderlyRatio: {
    headline: '도서지역(강화·옹진)·원도심(동구)과 신도심(연수·서구)을 대조하면 고령화·돌봄·응급의료 격차가 가장 선명하게 드러납니다.',
    pairs: [
      { label: '강화군(36.4%) vs 연수구(12.1%)', leftId: 'ganghwa-gun', rightId: 'yeonsu-gu', gapSummary: '약 3.0배 초고령화 격차' },
      { label: '동구(25.1%) vs 서구(12.4%)', leftId: 'dong-gu', rightId: 'seo-gu', gapSummary: '원도심·신도심 2.0배 격차' },
      { label: '옹진군(31.8%) vs 연수구(12.1%)', leftId: 'ongjin-gun', rightId: 'yeonsu-gu', gapSummary: '도서 응급의료 취약 대조' },
    ],
    questionTemplate: '강화군·옹진군(또는 동구)과 연수구 간 고령자 비율 및 지리적 접근성 차이는 응급의료·무인화 디지털 기본권 확보에 어떤 영향을 미치는가?',
    recommendedLabs: '의학·보건 / 인문·사회 / 공학·AI(실버존) / 예술·디자인',
  },
  parkArea: {
    headline: '원도심(동구·미추홀·부평)과 신도시·생태권(연수·강화·옹진)을 비교하면 녹지 불평등·도시 열섬·청소년 건강 격차가 뚜렷합니다.',
    pairs: [
      { label: '동구(6.2㎡) vs 연수구(18.9㎡)', leftId: 'dong-gu', rightId: 'yeonsu-gu', gapSummary: '생활권 공원 3.0배 격차' },
      { label: '미추홀구(7.9㎡) vs 서구(16.5㎡)', leftId: 'michuhol-gu', rightId: 'seo-gu', gapSummary: '원도심·청라 2.1배 녹지 격차' },
      { label: '부평구(8.8㎡) vs 남동구(13.2㎡)', leftId: 'bupyeong-gu', rightId: 'namdong-gu', gapSummary: '도심·습지 생태 완충 비교' },
    ],
    questionTemplate: '동구·미추홀구와 연수구 간 1인당 공원면적 격차는 여름철 도시 열섬 현상과 청소년 신체활동·정서 안정에 어떤 차이를 유발하는가?',
    recommendedLabs: '자연과학·생태 / 의학·보건(예방의학) / 공학·스마트방재',
  },
  airPm25: {
    headline: '항만·산업단지 배후지(동구·서구·중구·남동구)와 도서·신도시(옹진·강화·연수)를 대조하면 환경·호흡기 건강 불평등이 보입니다.',
    pairs: [
      { label: '동구(22.8㎍/㎥) vs 옹진군(15.2㎍/㎥)', leftId: 'dong-gu', rightId: 'ongjin-gun', gapSummary: '최대 1.5배 대기질 격차' },
      { label: '서구(21.9㎍/㎥) vs 강화군(16.8㎍/㎥)', leftId: 'seo-gu', rightId: 'ganghwa-gun', gapSummary: '산단 vs 청정지역 대비' },
      { label: '중구(21.2㎍/㎥) vs 연수구(18.2㎍/㎥)', leftId: 'jung-gu', rightId: 'yeonsu-gu', gapSummary: '항만 물류 vs 신도시 대기 비교' },
    ],
    questionTemplate: '항만·산업단지가 인접한 동구·서구와 연수구 간 초미세먼지 농도 차이는 청소년 호흡기 건강과 도심 완충 녹지·ESG 정책 필요성에 어떤 영향을 미치는가?',
    recommendedLabs: '자연과학·생태 / 의학·보건(환경의학) / 공학·AI예측 / 경영·ESG',
  },
  youthEmployment: {
    headline: '첨단 바이오·국제도시(연수·서구)와 원도심·도서지역(동구·강화·옹진)을 비교하면 청년 일자리와 지역 활력 편차가 나타납니다.',
    pairs: [
      { label: '연수구(52.4%) vs 동구(41.2%)', leftId: 'yeonsu-gu', rightId: 'dong-gu', gapSummary: '11.2%p 최대 고용률 격차' },
      { label: '서구(51.2%) vs 강화군(43.5%)', leftId: 'seo-gu', rightId: 'ganghwa-gun', gapSummary: '신산업 vs 도서 7.7%p 격차' },
      { label: '중구(49.8%) vs 미추홀구(46.5%)', leftId: 'jung-gu', rightId: 'michuhol-gu', gapSummary: '공항물류 vs 원도심 비교' },
    ],
    questionTemplate: '연수구·서구와 동구·강화군 간 청년 고용률 격차는 원도심 공실·청년 인구 유출에 어떤 영향을 미치며 로컬 창업 생태계로 어떻게 완화할 수 있는가?',
    recommendedLabs: '경영·경제 / 인문·사회(청년서사) / 교육·문화',
  },
  singleHousehold: {
    headline: '1인가구 밀집 지역(옹진·미추홀·동구·중구)과 가족형 신도시(연수·서구)를 비교하면 고립 돌봄·야간 안전·생활약국 수요가 보입니다.',
    pairs: [
      { label: '옹진군(44.5%) vs 연수구(28.5%)', leftId: 'ongjin-gun', rightId: 'yeonsu-gu', gapSummary: '16.0%p 최대 가구구조 격차' },
      { label: '미추홀구(41.2%) vs 서구(30.2%)', leftId: 'michuhol-gu', rightId: 'seo-gu', gapSummary: '원도심·신도시 11.0%p 격차' },
      { label: '동구(39.4%) vs 연수구(28.5%)', leftId: 'dong-gu', rightId: 'yeonsu-gu', gapSummary: '독거노인·돌봄 수요 대조' },
    ],
    questionTemplate: '미추홀구·동구의 높은 1인가구 비율은 연수구 대비 고독사 예방 돌봄 체계, 공공심야약국 접근성 및 안심 통학로 CPTED 설계에 어떤 차이를 요구하는가?',
    recommendedLabs: '인문·사회(복지법) / 의학·보건(약학) / 예술·디자인(CPTED)',
  },
  basicLivelihood: {
    headline: '원도심·도서지역(동구·강화·미추홀)과 신도시(연수·서구)를 비교하면 복지 안전망·에너지 빈곤·교육문화 격차가 뚜렷해집니다.',
    pairs: [
      { label: '동구(8.9%) vs 연수구(3.6%)', leftId: 'dong-gu', rightId: 'yeonsu-gu', gapSummary: '2.5배 복지수급률 격차' },
      { label: '강화군(7.9%) vs 서구(4.8%)', leftId: 'ganghwa-gun', rightId: 'seo-gu', gapSummary: '도서·신도시 복지 수요 차' },
      { label: '미추홀구(7.2%) vs 연수구(3.6%)', leftId: 'michuhol-gu', rightId: 'yeonsu-gu', gapSummary: '2.0배 원·신도심 격차' },
    ],
    questionTemplate: '동구·미추홀구와 연수구 간 기초생활보장 수급률 격차는 지역화폐 골목상권 활성화, 노후 주택 에너지 빈곤 및 청소년 문화공간 지원 기준에 어떤 시사점을 주는가?',
    recommendedLabs: '경영·경제 / 공학·에너지 / 교육·문화 / 인문·사회',
  },
};

// District SVG Layout Coordinates & Paths (Realistic Topological Layout)
interface DistrictMapShape {
  id: string;
  name: string;
  labelX: number;
  labelY: number;
  path: string;
  // GPS Projected relative coordinates (%) for Real Map Tile overlay
  gpsX: number;
  gpsY: number;
}

const INCHEON_MAP_SHAPES: DistrictMapShape[] = [
  // 1. 강화군 (North Island)
  {
    id: 'ganghwa-gun',
    name: '강화군',
    labelX: 285,
    labelY: 100,
    path: 'M 210,50 L 330,45 L 375,90 L 365,160 L 310,195 L 225,185 L 180,135 L 195,80 Z',
    gpsX: 42,
    gpsY: 16,
  },
  // 2. 옹진군 (West & South Islands Group)
  {
    id: 'ongjin-gun',
    name: '옹진군',
    labelX: 110,
    labelY: 380,
    path: 'M 60,200 L 95,190 L 110,230 L 75,245 Z M 80,310 L 135,300 L 145,350 L 95,365 Z M 130,420 L 185,410 L 195,470 L 140,480 Z M 210,520 L 260,510 L 270,560 L 220,570 Z',
    gpsX: 18,
    gpsY: 62,
  },
  // 3. 서구 (North-Central Mainland with Geomdan & Cheongna)
  {
    id: 'seo-gu',
    name: '서구',
    labelX: 430,
    labelY: 225,
    path: 'M 370,165 L 480,160 L 515,225 L 490,300 L 420,310 L 365,245 Z',
    gpsX: 62,
    gpsY: 36,
  },
  // 4. 계양구 (Northeast Urban boundary)
  {
    id: 'gyeyang-gu',
    name: '계양구',
    labelX: 550,
    labelY: 220,
    path: 'M 480,160 L 595,175 L 610,250 L 515,245 L 515,225 Z',
    gpsX: 79,
    gpsY: 35,
  },
  // 5. 부평구 (East Central Industrial & Residential Hub)
  {
    id: 'bupyeong-gu',
    name: '부평구',
    labelX: 555,
    labelY: 300,
    path: 'M 515,245 L 610,250 L 595,345 L 505,340 Z',
    gpsX: 77,
    gpsY: 48,
  },
  // 6. 중구 (영종국제도시 Island + 원도심 개항장 항만)
  {
    id: 'jung-gu',
    name: '중구',
    labelX: 250,
    labelY: 285,
    path: 'M 175,240 L 295,235 L 340,295 L 295,365 L 185,340 Z M 365,340 L 415,340 L 405,400 L 355,395 Z',
    gpsX: 38,
    gpsY: 46,
  },
  // 7. 동구 (Central Historic Harbor Old Town - Small & Dense)
  {
    id: 'dong-gu',
    name: '동구',
    labelX: 435,
    labelY: 345,
    path: 'M 415,330 L 460,330 L 460,370 L 415,370 Z',
    gpsX: 63,
    gpsY: 55,
  },
  // 8. 미추홀구 (Inner-city Historic Core)
  {
    id: 'michuhol-gu',
    name: '미추홀구',
    labelX: 460,
    labelY: 405,
    path: 'M 415,370 L 505,365 L 495,435 L 405,435 L 405,400 L 415,370 Z',
    gpsX: 66,
    gpsY: 63,
  },
  // 9. 남동구 (Southeast Industrial Complex & City Hall)
  {
    id: 'namdong-gu',
    name: '남동구',
    labelX: 550,
    labelY: 415,
    path: 'M 505,340 L 595,345 L 585,480 L 485,475 L 495,435 L 505,365 Z',
    gpsX: 79,
    gpsY: 66,
  },
  // 10. 연수구 (South Reclaimed Songdo Smart City)
  {
    id: 'yeonsu-gu',
    name: '연수구',
    labelX: 440,
    labelY: 495,
    path: 'M 405,435 L 485,435 L 485,475 L 475,545 L 380,535 L 375,480 Z',
    gpsX: 65,
    gpsY: 79,
  },
];

export const IncheonGisMapStudio: React.FC<IncheonGisMapStudioProps> = ({
  project,
  onUpdateProject,
  onNavigateTab,
  gisPreset,
  onClearGisPreset,
}) => {
  const [selectedMetricKey, setSelectedMetricKey] = useState<GisMetricKey>('elderlyRatio');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('yeonsu-gu');
  const [compareDistrictId, setCompareDistrictId] = useState<string>('dong-gu');
  const [mapRenderMode, setMapRenderMode] = useState<'vector' | 'real-street' | 'real-satellite'>('vector');
  const [showWalkPins, setShowWalkPins] = useState<boolean>(true);
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);
  const [injectedNotice, setInjectedNotice] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'map' | 'multidimensional' | 'split-compare'>('map');
  const [barSortOrder, setBarSortOrder] = useState<'desc' | 'asc' | 'regional'>('desc');

  // Apply external GIS preset from Labs Explorer (or other tabs)
  useEffect(() => {
    if (gisPreset) {
      setSelectedMetricKey(gisPreset.metricKey);
      setSelectedDistrictId(gisPreset.leftDistrictId);
      if (gisPreset.rightDistrictId) {
        setCompareDistrictId(gisPreset.rightDistrictId);
      }
      if (gisPreset.viewTab) {
        setActiveViewTab(gisPreset.viewTab);
      }
    }
  }, [gisPreset]);

  const currentMetric = useMemo(() => {
    return METRICS_CATALOG.find((m) => m.key === selectedMetricKey) || METRICS_CATALOG[0];
  }, [selectedMetricKey]);

  const currentHint = useMemo(() => {
    return METRIC_DISPARITY_HINTS[(selectedMetricKey === 'heatIsland' ? 'parkArea' : selectedMetricKey) as GisMetricId] || METRIC_DISPARITY_HINTS.elderlyRatio;
  }, [selectedMetricKey]);

  // Helper to extract numeric value for any district by metric key
  const getDistrictValue = (dist: DistrictStat, metric: GisMetricKey): number => {
    switch (metric) {
      case 'elderlyRatio':
        return dist.elderlyRatio;
      case 'parkArea':
        return dist.envStats.parkAreaPerCapita;
      case 'airPm25':
        return dist.envStats.airQualityPm25;
      case 'youthEmployment':
        return dist.industryStats.youthEmploymentRate;
      case 'singleHousehold':
        return dist.demographicStats.singleHouseholdRatio;
      case 'basicLivelihood':
        return dist.welfareStats.basicLivelihoodRate;
      case 'heatIsland':
        return dist.envStats.noiseLevel;
      default:
        return dist.elderlyRatio;
    }
  };

  // Min and Max values for color scale calculation
  const { minVal, maxVal } = useMemo(() => {
    const values = INCHEON_10_DISTRICTS.map((d) => getDistrictValue(d, selectedMetricKey));
    return {
      minVal: Math.min(...values),
      maxVal: Math.max(...values),
    };
  }, [selectedMetricKey]);

  // Generate color fill for SVG polygon
  const getDistrictFillColor = (distId: string) => {
    const dist = INCHEON_10_DISTRICTS.find((d) => d.id === distId);
    if (!dist) return '#E2E8F0';

    const val = getDistrictValue(dist, selectedMetricKey);
    const range = maxVal - minVal || 1;
    const ratio = (val - minVal) / range; // 0.0 to 1.0

    if (currentMetric.colorScheme === 'green') {
      if (ratio > 0.8) return '#047857';
      if (ratio > 0.6) return '#059669';
      if (ratio > 0.4) return '#10B981';
      if (ratio > 0.2) return '#6EE7B7';
      return '#D1FAE5';
    }

    if (currentMetric.colorScheme === 'blue') {
      if (ratio > 0.8) return '#1E3A8A';
      if (ratio > 0.6) return '#2563EB';
      if (ratio > 0.4) return '#3B82F6';
      if (ratio > 0.2) return '#93C5FD';
      return '#DBEAFE';
    }

    if (currentMetric.colorScheme === 'purple') {
      if (ratio > 0.8) return '#581C87';
      if (ratio > 0.6) return '#7C3AED';
      if (ratio > 0.4) return '#8B5CF6';
      if (ratio > 0.2) return '#C4B5FD';
      return '#EDE9FE';
    }

    if (currentMetric.colorScheme === 'amber') {
      if (ratio > 0.8) return '#9A3412';
      if (ratio > 0.6) return '#EA580C';
      if (ratio > 0.4) return '#F97316';
      if (ratio > 0.2) return '#FDBA74';
      return '#FFEDD5';
    }

    // Default 'red' (Extreme aging / vulnerability)
    if (ratio > 0.8) return '#9F1239';
    if (ratio > 0.6) return '#E11D48';
    if (ratio > 0.4) return '#F43F5E';
    if (ratio > 0.2) return '#FDA4AF';
    return '#FFE4E6';
  };

  const selectedDistrict = useMemo(() => {
    return INCHEON_10_DISTRICTS.find((d) => d.id === selectedDistrictId) || INCHEON_10_DISTRICTS[0];
  }, [selectedDistrictId]);

  const compareDistrict = useMemo(() => {
    return INCHEON_10_DISTRICTS.find((d) => d.id === compareDistrictId) || INCHEON_10_DISTRICTS[1];
  }, [compareDistrictId]);

  // Extract all walking logs for GPS pins
  const studentWalkPins = useMemo(() => {
    return (project.walkingLogs || []).map((w, idx) => {
      let x = 430;
      let y = 350;
      let realX = 63;
      let realY = 55;
      if (w.courseName.includes('송도') || w.courseName.includes('연수')) {
        x = 440;
        y = 490;
        realX = 65;
        realY = 79;
      } else if (w.courseName.includes('개항장') || w.courseName.includes('신포') || w.courseName.includes('중구')) {
        x = 380;
        y = 370;
        realX = 58;
        realY = 58;
      } else if (w.courseName.includes('동구') || w.courseName.includes('배다리') || w.courseName.includes('화도진')) {
        x = 440;
        y = 350;
        realX = 63;
        realY = 55;
      } else if (w.courseName.includes('청라') || w.courseName.includes('서구')) {
        x = 420;
        y = 230;
        realX = 60;
        realY = 38;
      } else if (w.courseName.includes('부평') || w.courseName.includes('굴포천')) {
        x = 550;
        y = 300;
        realX = 77;
        realY = 48;
      } else if (w.courseName.includes('소래') || w.courseName.includes('남동')) {
        x = 540;
        y = 420;
        realX = 79;
        realY = 66;
      } else if (w.courseName.includes('강화')) {
        x = 280;
        y = 110;
        realX = 42;
        realY = 16;
      }

      return {
        id: w.id || `pin-${idx}`,
        title: w.courseName,
        date: w.date,
        steps: w.steps,
        thoughtNote: w.thoughtNote,
        findings: w.findings,
        photos: w.photos || [],
        x: x + (idx % 2 === 0 ? 10 : -10),
        y: y + (idx % 2 === 0 ? -10 : 10),
        realX: realX + (idx % 2 === 0 ? 1.5 : -1.5),
        realY: realY + (idx % 2 === 0 ? -1.5 : 1.5),
      };
    });
  }, [project.walkingLogs]);

  // Sorted 10 Districts for the Full Comparison Bar Chart
  const sortedDistricts = useMemo(() => {
    const list = [...INCHEON_10_DISTRICTS];
    if (barSortOrder === 'desc') {
      return list.sort((a, b) => getDistrictValue(b, selectedMetricKey) - getDistrictValue(a, selectedMetricKey));
    }
    if (barSortOrder === 'asc') {
      return list.sort((a, b) => getDistrictValue(a, selectedMetricKey) - getDistrictValue(b, selectedMetricKey));
    }
    // Regional order: 신도심 -> 원도심 -> 산업복합 -> 도서생태
    const rankOrder = {
      '경제자유구역·신도심': 1,
      '원도심·항만': 2,
      '산업·주거복합': 3,
      '도서·생태지역': 4,
    };
    return list.sort((a, b) => (rankOrder[a.regionType] || 5) - (rankOrder[b.regionType] || 5));
  }, [selectedMetricKey, barSortOrder]);

  // Regional 4 Groups Statistics for Current Metric
  const regionalGroupStats = useMemo(() => {
    const groups: {
      [key: string]: {
        name: string;
        shortName: string;
        color: string;
        districts: DistrictStat[];
        avg: number;
      };
    } = {
      '경제자유구역·신도심': {
        name: '경제자유구역·신도심 (연수구 송도, 서구 청라·검단)',
        shortName: '신도심 권역',
        color: '#2563EB',
        districts: [],
        avg: 0,
      },
      '원도심·항만': {
        name: '원도심·항만벨트 (중구 개항장, 동구, 미추홀구)',
        shortName: '원도심 권역',
        color: '#E11D48',
        districts: [],
        avg: 0,
      },
      '산업·주거복합': {
        name: '산업·주거복합 (남동공단, 부평구, 계양구)',
        shortName: '산업·주거 권역',
        color: '#D97706',
        districts: [],
        avg: 0,
      },
      '도서·생태지역': {
        name: '도서·생태지역 (강화군, 옹진군)',
        shortName: '도서·생태 권역',
        color: '#059669',
        districts: [],
        avg: 0,
      },
    };

    INCHEON_10_DISTRICTS.forEach((d) => {
      if (groups[d.regionType]) {
        groups[d.regionType].districts.push(d);
      }
    });

    Object.keys(groups).forEach((key) => {
      const list = groups[key].districts;
      const sum = list.reduce((acc, d) => acc + getDistrictValue(d, selectedMetricKey), 0);
      groups[key].avg = list.length > 0 ? parseFloat((sum / list.length).toFixed(1)) : 0;
    });

    return Object.values(groups);
  }, [selectedMetricKey]);

  // Spatial Inequality Index summary across all 6 metrics
  const spatialInequalityIndex = useMemo(() => {
    return METRICS_CATALOG.map((m) => {
      const values = INCHEON_10_DISTRICTS.map((d) => ({
        dist: d,
        val: getDistrictValue(d, m.key),
      }));
      values.sort((a, b) => b.val - a.val);
      const top = values[0];
      const bottom = values[values.length - 1];
      const ratio = bottom.val > 0 ? parseFloat((top.val / bottom.val).toFixed(1)) : 1;
      const diff = parseFloat((top.val - bottom.val).toFixed(1));
      let severity: 'critical' | 'warning' | 'normal' = 'normal';
      if (ratio >= 3.0) severity = 'critical';
      else if (ratio >= 1.6) severity = 'warning';

      return {
        metric: m,
        topDistrict: top.dist.name,
        topValue: top.val,
        bottomDistrict: bottom.dist.name,
        bottomValue: bottom.val,
        ratio,
        diff,
        severity,
      };
    });
  }, []);

  // 6-Axis Radar Coordinates for selectedDistrict vs Incheon Average
  const radarChartData = useMemo(() => {
    const center = 150;
    const maxR = 95;
    const numAxes = METRICS_CATALOG.length;

    const axisPoints = METRICS_CATALOG.map((m, idx) => {
      const angle = (idx * (360 / numAxes) - 90) * (Math.PI / 180);
      const values = INCHEON_10_DISTRICTS.map((d) => getDistrictValue(d, m.key));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const distVal = getDistrictValue(selectedDistrict, m.key);
      const avgVal = m.avgVal;

      const range = max - min || 1;
      const distScore = Math.max(12, Math.min(100, ((distVal - min) / range) * 100));
      const avgScore = Math.max(12, Math.min(100, ((avgVal - min) / range) * 100));

      const distR = (distScore / 100) * maxR;
      const avgR = (avgScore / 100) * maxR;

      return {
        metric: m,
        angle,
        labelX: center + (maxR + 26) * Math.cos(angle),
        labelY: center + (maxR + 26) * Math.sin(angle),
        axisEndX: center + maxR * Math.cos(angle),
        axisEndY: center + maxR * Math.sin(angle),
        distX: center + distR * Math.cos(angle),
        distY: center + distR * Math.sin(angle),
        avgX: center + avgR * Math.cos(angle),
        avgY: center + avgR * Math.sin(angle),
        distVal,
        avgVal,
        distScore,
      };
    });

    const distPolygonPoints = axisPoints.map((p) => `${p.distX},${p.distY}`).join(' ');
    const avgPolygonPoints = axisPoints.map((p) => `${p.avgX},${p.avgY}`).join(' ');

    return { axisPoints, distPolygonPoints, avgPolygonPoints, center, maxR };
  }, [selectedDistrict]);

  // Handle Injecting Statistic into 4P Workspace
  const handleInjectTo4P = (target: 'phenomenon' | 'problem', text: string) => {
    if (!onUpdateProject) return;
    const current = project.fourP[target] || '';
    const updated = current ? `${current}\n\n${text}` : text;
    onUpdateProject({
      fourP: {
        ...project.fourP,
        [target]: updated,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    });
    const label = target === 'phenomenon' ? 'P1. 사실 관찰(현상)' : 'P2. 심층 원인(문제)';
    setInjectedNotice(`공간 분석 데이터가 4P 연구계획서 [${label}]에 성공적으로 주입되었습니다!`);
    setTimeout(() => setInjectedNotice(null), 3500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
            <span>GIS 공간 불평등 인터랙티브 지도 (Spatial Inequality Mapping)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            인천 10개 군·구 공간 불평등 & 실사 GIS 지도
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            공공데이터 수치를 <strong className="text-blue-600 font-bold">인천 실제 도로/위성 지도</strong> 및 벡터 지도에 시각화하고, 하단의 <strong className="text-indigo-600 font-bold">10개 군·구 전체 막대 그래프</strong>를 통해 신도심과 원도심의 구조적 격차를 직관적으로 분석합니다.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveViewTab('map')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeViewTab === 'map'
                  ? 'bg-white text-blue-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>🗺️ 공간 지도 & 순위 분석</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('multidimensional')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeViewTab === 'multidimensional'
                  ? 'bg-white text-indigo-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>📊 다차원 종합 분석 & 권역 비교</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('split-compare')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeViewTab === 'split-compare'
                  ? 'bg-white text-rose-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>⚖️ 신도심 vs 원도심 1:1 비교</span>
            </button>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('workspace')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              내 4P 계획서 &rarr;
            </button>
          )}
        </div>
      </div>

      {injectedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {injectedNotice}
          </span>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('workspace')}
              className="text-xs text-emerald-700 underline font-extrabold"
            >
              4P 계획서 확인하기 &rarr;
            </button>
          )}
        </div>
      )}

      {/* Metric Selector Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>지도 및 막대 그래프에 표시할 공간 불평등 지표 선택 (Choropleth Metric):</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">인천시 전체 평균: <strong className="text-slate-800">{currentMetric.avgVal}{currentMetric.unit}</strong></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {METRICS_CATALOG.map((m) => {
            const isSelected = selectedMetricKey === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMetricKey(m.key)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mb-1 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.badge}
                  </span>
                  <div className="text-xs font-black text-slate-900 leading-snug">{m.label}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">단위: {m.unit}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INCHEON GIS 6-METRIC DISPARITY & CORE QUESTION HINT PANEL */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-teal-50/70 border border-amber-200/90 shadow-xs space-y-3">
        {gisPreset?.sourceTitle && (
          <div className="px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-200 shrink-0" />
              <span>연계 탐구 주제 프리셋 적용 중: {gisPreset.sourceTitle}</span>
            </span>
            {onClearGisPreset && (
              <button
                type="button"
                onClick={onClearGisPreset}
                className="text-[11px] bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                알림 닫기
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  인천 GIS 지표 연계 힌트 · 「{currentMetric.label}」 어느 구·군을 비교하면 격차가 보일까?
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  추천 연구실: {currentHint.recommendedLabs}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                {currentHint.headline}
              </p>
            </div>
          </div>
        </div>

        {/* Recommended District Comparison Pair Chips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {currentHint.pairs.map((pair, idx) => {
            const isPairActive =
              (selectedDistrictId === pair.leftId && compareDistrictId === pair.rightId) ||
              (selectedDistrictId === pair.rightId && compareDistrictId === pair.leftId);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedDistrictId(pair.leftId);
                  setCompareDistrictId(pair.rightId);
                  setActiveViewTab('split-compare');
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer group ${
                  isPairActive
                    ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                    : 'bg-white hover:bg-teal-50/70 border-slate-200 hover:border-teal-300 text-slate-800'
                }`}
              >
                <div>
                  <div className={`text-[10px] font-extrabold ${isPairActive ? 'text-teal-100' : 'text-teal-700'}`}>
                    추천 비교 #{idx + 1} · {pair.gapSummary}
                  </div>
                  <div className="text-xs font-black mt-0.5">{pair.label}</div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                  isPairActive ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700 group-hover:bg-teal-100'
                }`}>
                  <span>1:1 비교</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Starter Core Question Hint Bar */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs text-slate-700 leading-snug">
            <span className="inline-block font-black text-indigo-700 mr-1.5">[핵심질문 조립 힌트]</span>
            <span>“{currentHint.questionTemplate}”</span>
          </div>
          {onUpdateProject && (
            <button
              type="button"
              onClick={() => {
                onUpdateProject({ mainQuestion: currentHint.questionTemplate });
                setInjectedNotice(`핵심질문 힌트가 '4P 연구계획서' 최종 탐구질문에 반영되었습니다!`);
                setTimeout(() => setInjectedNotice(null), 4000);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>이 질문 힌트 4P 계획서에 담기</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* USER REQUESTED: DEDICATED MAP MODE SELECTOR (지도 모드 선택기) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                  지도 모드 선택기 (Map Visualization Mode Engine)
                </h4>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  3대 실감 뷰
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                학생 탐구 목적에 맞춰 <strong className="text-slate-200">1. 벡터 영역</strong>, <strong className="text-slate-200">2. 실제 도로망</strong>, <strong className="text-slate-200">3. 실사 항공 위성</strong> 지도를 선택하세요.
              </p>
            </div>
          </div>

          {/* Quick Active Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium hidden md:inline">현재 활성 뷰:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-blue-600 text-white shadow-sm border border-blue-400/40">
              {mapRenderMode === 'vector' && <Layers className="w-3.5 h-3.5" />}
              {mapRenderMode === 'real-street' && <Map className="w-3.5 h-3.5" />}
              {mapRenderMode === 'real-satellite' && <Satellite className="w-3.5 h-3.5" />}
              <span>
                {mapRenderMode === 'vector'
                  ? '벡터 영역 지도 (초로플레스)'
                  : mapRenderMode === 'real-street'
                  ? '실제 도로 지도 (OSM)'
                  : '실사 항공 위성 (Esri)'}
              </span>
            </span>
          </div>
        </div>

        {/* 3 Selectable Interactive Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mode 1: Vector */}
          <button
            type="button"
            onClick={() => setMapRenderMode('vector')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
              mapRenderMode === 'vector'
                ? 'bg-gradient-to-br from-blue-950/90 to-slate-900 border-blue-400 ring-2 ring-blue-500/30 shadow-lg scale-[1.01]'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                  mapRenderMode === 'vector' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-700 text-slate-300'
                }`}>
                  1
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  mapRenderMode === 'vector' ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  보고서·포스터 인쇄용
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>1. 벡터 영역 지도 (SVG)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300/90 leading-snug mt-2">
              10개 군·구 경계선 기준 통계 색상 비교. 배경 간섭 없이 수치 차이 파악 및 학교 제출용 A4/포스터 인쇄용에 최적.
            </p>
          </button>

          {/* Mode 2: Real Street Map */}
          <button
            type="button"
            onClick={() => setMapRenderMode('real-street')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
              mapRenderMode === 'real-street'
                ? 'bg-gradient-to-br from-blue-950/90 to-slate-900 border-blue-400 ring-2 ring-blue-500/30 shadow-lg scale-[1.01]'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                  mapRenderMode === 'real-street' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-700 text-slate-300'
                }`}>
                  2
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  mapRenderMode === 'real-street' ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  도로망 & 대중교통 인프라
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <Map className="w-4 h-4 text-blue-400" />
                <span>2. 실제 도로 지도 (OSM)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300/90 leading-snug mt-2">
              실제 도로, 지하철(1·2호선·수인선), 항만, 골목길 표시. 드래그/줌인하여 원도심 보행 취약성과 신도심 격차 실측.
            </p>
          </button>

          {/* Mode 3: Real Satellite */}
          <button
            type="button"
            onClick={() => setMapRenderMode('real-satellite')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
              mapRenderMode === 'real-satellite'
                ? 'bg-gradient-to-br from-indigo-950/90 to-slate-900 border-indigo-400 ring-2 ring-indigo-500/30 shadow-lg scale-[1.01]'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                  mapRenderMode === 'real-satellite' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-700 text-slate-300'
                }`}>
                  3
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  mapRenderMode === 'real-satellite' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  항공 위성 실사 사진
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <Satellite className="w-4 h-4 text-indigo-400" />
                <span>3. 실제 항공 위성 (Esri)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300/90 leading-snug mt-2">
              송도·청라 매립지, 센트럴파크 해수공원, 강화 갯벌 사진. 원도심 아스팔트 밀집지와 신도심 녹지 면적 차이 육안 확인.
            </p>
          </button>
        </div>
      </div>

      {/* Main Interactive Map & Details Area */}
      {activeViewTab === 'map' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Map Container with Vector / Real Map Tile Toggle (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              {mapRenderMode === 'vector' ? (
                <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-inner flex flex-col justify-between relative overflow-hidden min-h-[520px]">
                  {/* Map Top Bar Controls (Map Mode Switcher: Vector / Real Street / Satellite) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 z-10 mb-3">
                    <div>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">
                        {currentMetric.category} · {currentMetric.label}
                      </span>
                      <h4 className="text-sm font-black text-white mt-0.5 flex items-center gap-2">
                        <span>인천광역시 10개 군·구 공간 분포도</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                          벡터 초로플레스
                        </span>
                      </h4>
                    </div>

                    {/* Map Mode Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center p-1 bg-slate-800/90 rounded-xl text-xs font-bold border border-slate-700">
                        <button
                          type="button"
                          onClick={() => setMapRenderMode('vector')}
                          className="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 bg-blue-600 text-white shadow-xs font-black"
                          title="정밀 SVG 벡터 영역 경계 지도"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>벡터 영역</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapRenderMode('real-street')}
                          className="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-slate-400 hover:text-white"
                          title="실제 오픈스트리트맵 기반 도로 지도"
                        >
                          <Map className="w-3.5 h-3.5" />
                          <span>실제 도로 지도</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapRenderMode('real-satellite')}
                          className="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-slate-400 hover:text-white"
                          title="실사 인공위성 항공 사진 지도"
                        >
                          <Satellite className="w-3.5 h-3.5" />
                          <span>실제 항공 위성</span>
                        </button>
                      </div>

                      {/* Walk Pin Layer Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowWalkPins(!showWalkPins)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          showWalkPins
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                        title="학생이 기록한 15,000보 현장 답사 코스 핀 오버레이"
                      >
                        <Footprints className="w-3.5 h-3.5" />
                        <span>답사 핀 {showWalkPins ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>

                  {/* MAP DISPLAY AREA */}
                  <div className="relative w-full h-[420px] rounded-2xl overflow-hidden flex items-center justify-center my-auto">
                    <svg
                      viewBox="0 0 700 620"
                      className="w-full h-full drop-shadow-xl"
                    >
                      <defs>
                        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Incheon 10 District Shapes */}
                      {INCHEON_MAP_SHAPES.map((shape) => {
                        const dist = INCHEON_10_DISTRICTS.find((d) => d.id === shape.id);
                        const isSelected = selectedDistrictId === shape.id;
                        const isHovered = hoveredDistrictId === shape.id;
                        const val = dist ? getDistrictValue(dist, selectedMetricKey) : 0;
                        const fillColor = getDistrictFillColor(shape.id);

                        return (
                          <g key={shape.id} className="cursor-pointer transition-all duration-200">
                            <path
                              d={shape.path}
                              fill={fillColor}
                              stroke={isSelected ? '#38BDF8' : isHovered ? '#FFFFFF' : '#0F172A'}
                              strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.5'}
                              strokeLinejoin="round"
                              className="transition-all hover:opacity-90"
                              onClick={() => setSelectedDistrictId(shape.id)}
                              onMouseEnter={() => setHoveredDistrictId(shape.id)}
                              onMouseLeave={() => setHoveredDistrictId(null)}
                            />

                            {/* District Label Tag */}
                            <text
                              x={shape.labelX}
                              y={shape.labelY}
                              textAnchor="middle"
                              fill={isSelected ? '#FFFFFF' : '#F1F5F9'}
                              fontSize="12"
                              fontWeight="900"
                              className="pointer-events-none select-none drop-shadow-md"
                            >
                              {shape.name}
                            </text>
                            <text
                              x={shape.labelX}
                              y={shape.labelY + 14}
                              textAnchor="middle"
                              fill={isSelected ? '#38BDF8' : '#CBD5E1'}
                              fontSize="10"
                              fontWeight="700"
                              className="pointer-events-none select-none font-mono drop-shadow-md"
                            >
                              {val.toLocaleString()}{currentMetric.unit}
                            </text>
                          </g>
                        );
                      })}

                      {/* Field Walking GPS Pins Overlay */}
                      {showWalkPins &&
                        studentWalkPins.map((pin) => (
                          <g key={pin.id} className="cursor-pointer group">
                            <circle
                              cx={pin.x}
                              cy={pin.y}
                              r="12"
                              fill="#10B981"
                              opacity="0.3"
                              className="animate-ping"
                            />
                            <circle
                              cx={pin.x}
                              cy={pin.y}
                              r="6"
                              fill="#10B981"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                            <text
                              x={pin.x}
                              y={pin.y - 10}
                              textAnchor="middle"
                              fill="#A7F3D0"
                              fontSize="9"
                              fontWeight="800"
                              className="pointer-events-none drop-shadow"
                            >
                              📍 {pin.title.slice(0, 8)}
                            </text>
                          </g>
                        ))}
                    </svg>
                  </div>

                  {/* Map Bottom Legend (범례) */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">범례 (수치 구간):</span>
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className="text-slate-400">{minVal}{currentMetric.unit} (최저)</span>
                        <div className="flex h-3 w-28 rounded-md overflow-hidden border border-slate-700">
                          <div className="h-full w-1/5 bg-slate-300" />
                          <div className="h-full w-1/5 bg-blue-300" />
                          <div className="h-full w-1/5 bg-blue-500" />
                          <div className="h-full w-1/5 bg-blue-700" />
                          <div className="h-full w-1/5 bg-indigo-900" />
                        </div>
                        <span className="text-blue-300 font-bold">{maxVal}{currentMetric.unit} (최고)</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      * 지도 자치구를 클릭하면 우측에 세부 프로필과 4P 인용문이 표시됩니다.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Top Mode Bar for Real Map */}
                  <div className="bg-slate-900 rounded-2xl px-4 py-3 border border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-md">
                    <div>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">
                        {currentMetric.category} · {currentMetric.label}
                      </span>
                      <h4 className="text-sm font-black text-white mt-0.5 flex items-center gap-2">
                        <span>인천광역시 10개 군·구 실사 공간지도</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                          {mapRenderMode === 'real-street' ? '실제 도로 (OSM)' : '실사 항공 위성 (Esri)'}
                        </span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-xl border border-slate-700 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setMapRenderMode('vector')}
                        className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1"
                        title="정밀 SVG 벡터 영역 경계 지도"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>벡터 영역</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapRenderMode('real-street')}
                        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          mapRenderMode === 'real-street'
                            ? 'bg-blue-600 text-white shadow-xs font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>실제 도로 지도</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapRenderMode('real-satellite')}
                        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          mapRenderMode === 'real-satellite'
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Satellite className="w-3.5 h-3.5" />
                        <span>실제 항공 위성</span>
                      </button>
                    </div>
                  </div>

                  {/* Leaflet Real Interactive Map Component */}
                  <IncheonInteractiveLeafletMap
                    mapRenderMode={mapRenderMode}
                    onChangeMapMode={(m) => setMapRenderMode(m)}
                    selectedMetric={currentMetric}
                    selectedDistrictId={selectedDistrictId}
                    onSelectDistrict={(id) => setSelectedDistrictId(id)}
                    showWalkPins={showWalkPins}
                    onToggleWalkPins={() => setShowWalkPins(!showWalkPins)}
                    districtsData={INCHEON_10_DISTRICTS}
                    getDistrictValue={getDistrictValue}
                    getDistrictFillColor={getDistrictFillColor}
                    onInjectTo4P={handleInjectTo4P}
                  />
                </div>
              )}
            </div>


            {/* RIGHT: Selected District Deep-Dive & 4P Actions (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* District Card Header */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 font-mono">{selectedDistrict.hanja}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${selectedDistrict.badgeBg}`}>
                        {selectedDistrict.regionType}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                      <span>{selectedDistrict.name}</span>
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        (인구 {selectedDistrict.population.toLocaleString()}명)
                      </span>
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">{currentMetric.label}</span>
                    <span className="text-2xl font-black text-blue-700 font-mono">
                      {getDistrictValue(selectedDistrict, selectedMetricKey)}
                      <span className="text-xs font-bold text-slate-500 ml-1">{currentMetric.unit}</span>
                    </span>
                  </div>
                </div>

                {/* Core Indicators Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">고령자 비율 (65세+)</span>
                    <span className="text-sm font-black text-slate-900 font-mono">{selectedDistrict.elderlyRatio}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">1인당 도시공원면적</span>
                    <span className="text-sm font-black text-slate-900 font-mono">{selectedDistrict.envStats.parkAreaPerCapita}㎡</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">초미세먼지(PM2.5)</span>
                    <span className="text-sm font-black text-slate-900 font-mono">{selectedDistrict.envStats.airQualityPm25}㎍/㎥</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">청년 고용률</span>
                    <span className="text-sm font-black text-slate-900 font-mono">{selectedDistrict.industryStats.youthEmploymentRate}%</span>
                  </div>
                </div>

                {/* District Characteristic & Issues */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedDistrict.name} 핵심 사회·공간 현안:</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {selectedDistrict.keyIssues.slice(0, 3).map((issue, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4P One-Click Injection Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-black text-slate-700 block">
                    🎯 이 자치구 통계를 내 4P 연구계획서에 바로 주입하기:
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleInjectTo4P(
                          'phenomenon',
                          `[인천 GIS 공간 데이터 관찰 - ${selectedDistrict.name}] ${selectedDistrict.fourPInquiryTip.phenomenon} (통계: ${currentMetric.label} ${getDistrictValue(selectedDistrict, selectedMetricKey)}${currentMetric.unit})`
                        )
                      }
                      className="p-3 rounded-xl bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-400 text-left transition-all group"
                    >
                      <span className="text-[11px] font-black text-indigo-700 flex items-center justify-between mb-1">
                        <span>P1. 현상(Fact)에 수치 주입 &rarr;</span>
                        <span className="text-[10px] text-slate-400 font-normal">원클릭</span>
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {selectedDistrict.fourPInquiryTip.phenomenon}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleInjectTo4P(
                          'problem',
                          `[인천 GIS 구조적 원인 분석 - ${selectedDistrict.name}] ${selectedDistrict.fourPInquiryTip.problem}`
                        )
                      }
                      className="p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-left transition-all group"
                    >
                      <span className="text-[11px] font-black text-blue-700 flex items-center justify-between mb-1">
                        <span>P2. 문제(Problem)에 원인 주입 &rarr;</span>
                        <span className="text-[10px] text-slate-400 font-normal">원클릭</span>
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {selectedDistrict.fourPInquiryTip.problem}
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Field Walking Connection Card */}
              {project.walkingLogs && project.walkingLogs.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                      <span>내 현장 답사 기록과 공간 연계</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      총 {project.walkingLogs.length}건 등록
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    학생이 걸었던 <strong>{project.walkingLogs[0]?.courseName}</strong> 등 현장 답사 위치가 지도 위 녹색 핀(📍)으로 동기화되어 실제 체감 데이터와 공공 통계의 일치 여부를 대조할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* USER REQUESTED: FULL 10-DISTRICT RANKING BAR CHART (항목별 전체 구 비교 막대 그래프) */}
          {/* ========================================================================= */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-5">
            {/* Bar Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                    COMPREHENSIVE RANKING BAR CHART
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                    인천 10개 군·구 전수 비교
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <span>[{currentMetric.label}] 10개 군·구 전체 순위 비교 분석</span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    (단위: {currentMetric.unit})
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  각 막대를 클릭하면 상단 지도와 우측 프로필이 해당 자치구로 즉시 전환됩니다.
                </p>
              </div>

              {/* Bar Sort Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBarSortOrder('desc')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    barSortOrder === 'desc'
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  높은 순 (내림차순)
                </button>
                <button
                  type="button"
                  onClick={() => setBarSortOrder('asc')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    barSortOrder === 'asc'
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  낮은 순 (오름차순)
                </button>
                <button
                  type="button"
                  onClick={() => setBarSortOrder('regional')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    barSortOrder === 'regional'
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  권역별 (신도심·원도심)
                </button>
              </div>
            </div>

            {/* Incheon Average Indicator Banner */}
            <div className="px-4 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between text-xs text-indigo-950 font-bold">
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-indigo-600" />
                <span>인천광역시 전체 공식 평균: <strong>{currentMetric.avgVal}{currentMetric.unit}</strong></span>
              </span>
              <span className="text-[11px] text-indigo-700 font-normal">
                점선 표시 기준선으로 각 자치구의 초과·미달 상태를 직관적으로 비교할 수 있습니다.
              </span>
            </div>

            {/* 10-District Horizontal Bars List */}
            <div className="space-y-3 pt-1">
              {sortedDistricts.map((dist, idx) => {
                const val = getDistrictValue(dist, selectedMetricKey);
                const isSelected = selectedDistrictId === dist.id;
                const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                const diffFromAvg = val - currentMetric.avgVal;
                const barColor = getDistrictFillColor(dist.id);

                return (
                  <div
                    key={dist.id}
                    onClick={() => setSelectedDistrictId(dist.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-slate-400 font-mono font-bold text-center">
                          {idx + 1}.
                        </span>
                        <span className="font-black text-slate-900 text-sm">{dist.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${dist.badgeBg}`}>
                          {dist.regionType}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200">
                            ✓ 현재 선택됨
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-500 font-mono">
                          인천평균 대비{' '}
                          <strong className={diffFromAvg >= 0 ? 'text-blue-700' : 'text-rose-600'}>
                            {diffFromAvg >= 0 ? `+${diffFromAvg.toFixed(1)}` : diffFromAvg.toFixed(1)}{currentMetric.unit}
                          </strong>
                        </span>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {val.toLocaleString()} {currentMetric.unit}
                        </span>
                      </div>
                    </div>

                    {/* Bar visualization */}
                    <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                      {/* Average Reference Line on the Bar */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                        style={{
                          left: `${(currentMetric.avgVal / maxVal) * 100}%`,
                        }}
                        title={`인천 평균: ${currentMetric.avgVal}${currentMetric.unit}`}
                      />
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 1-Click Action to Inject Entire 10-District Ranking into 4P */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>10개 군·구 전수 비교 통계 4P 계획서 원클릭 인용:</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  최고 자치구({sortedDistricts[0]?.name} {getDistrictValue(sortedDistricts[0], selectedMetricKey)}{currentMetric.unit})와 최저 자치구({sortedDistricts[sortedDistricts.length - 1]?.name} {getDistrictValue(sortedDistricts[sortedDistricts.length - 1], selectedMetricKey)}{currentMetric.unit})의 전수 순위 데이터를 4P에 주입합니다.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleInjectTo4P(
                      'phenomenon',
                      `[인천 10개 군·구 ${currentMetric.label} 전수 비교 통계] 최고 지역은 ${sortedDistricts[0]?.name}(${getDistrictValue(sortedDistricts[0], selectedMetricKey)}${currentMetric.unit})이고, 최저 지역은 ${sortedDistricts[sortedDistricts.length - 1]?.name}(${getDistrictValue(sortedDistricts[sortedDistricts.length - 1], selectedMetricKey)}${currentMetric.unit})로 자치구 간 격차가 ${(getDistrictValue(sortedDistricts[0], selectedMetricKey) / (getDistrictValue(sortedDistricts[sortedDistricts.length - 1], selectedMetricKey) || 1)).toFixed(1)}배에 달함 (인천시 평균: ${currentMetric.avgVal}${currentMetric.unit}).`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-all"
                >
                  P1. 현상에 전체 순위 주입 &rarr;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInjectTo4P(
                      'problem',
                      `[인천 공간 불평등 구조적 원인 - ${currentMetric.label}] ${sortedDistricts[0]?.regionType} 지역과 ${sortedDistricts[sortedDistricts.length - 1]?.regionType} 지역 간의 현저한 순위 편차는 단순한 입지 선호가 아닌 지자체 예산 배분, 산업 클러스터 배치, 노후 주거지의 물리적 한계가 중첩된 구조적 불평등임.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-all"
                >
                  P2. 원인 분석 주입 &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeViewTab === 'multidimensional' ? (
        /* ========================================================= */
        /* MULTIDIMENSIONAL ANALYTICS: INEQUALITY INDEX & REGIONAL GROUPS & RADAR */
        /* ========================================================= */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-indigo-900 border border-indigo-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-black border border-indigo-700">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
                <span>MULTIDIMENSIONAL INCHEON GIS VISUAL ANALYTICS</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                인천 6대 공간 불평등 지수 & 4대 권역 구조적 격차 시각화
              </h3>
              <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
                단일 지표 관찰을 넘어, 6개 핵심 지표의 불평등 배율, 4대 권역(신도심 vs 원도심 vs 산업벨트 vs 도서) 그룹 평균, 그리고 자치구 다차원 방사형 레이더 프로필을 종합 분석합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveViewTab('map')}
                className="px-3.5 py-2 rounded-xl bg-white text-indigo-950 font-black text-xs hover:bg-indigo-50 transition-colors shadow-xs"
              >
                🗺️ 지도 뷰로 돌아가기
              </button>
            </div>
          </div>

          {/* 1. Spatial Inequality Index (공간 불평등 지수) 6-Card Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>인천 6대 지표 공간 불평등 지수 요약 (Inequality Severity Index):</span>
              </span>
              <span className="text-[11px] text-slate-500">카드를 클릭하면 해당 지표로 권역 차트가 즉시 연동됩니다.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {spatialInequalityIndex.map((item) => {
                const isSelected = selectedMetricKey === item.metric.key;
                return (
                  <button
                    key={item.metric.key}
                    type="button"
                    onClick={() => setSelectedMetricKey(item.metric.key)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/30 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.metric.category}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            item.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : item.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {item.severity === 'critical' ? '🔴 심각 격차' : item.severity === 'warning' ? '🟡 주의 격차' : '🟢 비교적 균등'}
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-slate-900 leading-snug">{item.metric.label}</h5>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">최고 자치구</span>
                        <span className="font-bold text-slate-900">{item.topDistrict} ({item.topValue}{item.metric.unit})</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">최저 자치구</span>
                        <span className="font-bold text-slate-900">{item.bottomDistrict} ({item.bottomValue}{item.metric.unit})</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-slate-200 font-bold">
                        <span className="text-indigo-700">양극화 배율</span>
                        <span className="font-black font-mono text-sm text-indigo-700">{item.ratio}배 격차 ({item.diff}{item.metric.unit})</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Main Two-Column Analytics: Regional Group Bar Chart vs 6-Axis Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT (7 cols): Regional Group Comparison Bar Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      인천 4대 권역 그룹 비교
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">단위: {currentMetric.unit}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mt-1">
                    [{currentMetric.label}] 신도심 vs 원도심 4대 권역 구조적 격차
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    개별 자치구 편차를 넘어, 신도심·원도심·산업복합·도서지역 간 집단 격차를 분석합니다.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">인천 공식 평균</span>
                  <span className="text-base font-black text-blue-700 font-mono">{currentMetric.avgVal}{currentMetric.unit}</span>
                </div>
              </div>

              {/* Regional Bars */}
              <div className="space-y-4">
                {regionalGroupStats.map((group) => {
                  const pct = maxVal > 0 ? (group.avg / maxVal) * 100 : 0;
                  const diff = group.avg - currentMetric.avgVal;
                  return (
                    <div key={group.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="font-black text-slate-900 text-sm">{group.shortName}</span>
                          <span className="text-[11px] text-slate-500">
                            ({group.districts.map((d) => d.name).join(', ')})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono">
                            인천평균 대비{' '}
                            <strong className={diff >= 0 ? 'text-blue-700 font-bold' : 'text-rose-600 font-bold'}>
                              {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}{currentMetric.unit}
                            </strong>
                          </span>
                          <span className="font-black font-mono text-slate-900 text-sm">
                            {group.avg} {currentMetric.unit}
                          </span>
                        </div>
                      </div>

                      {/* Bar Track */}
                      <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden">
                        {/* Incheon Average Indicator Line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                          style={{ left: `${(currentMetric.avgVal / maxVal) * 100}%` }}
                          title={`인천 전체 평균: ${currentMetric.avgVal}${currentMetric.unit}`}
                        />
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: group.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Structural Analysis Summary */}
              <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs text-slate-700 space-y-2">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>권역별 구조적 불평등 분석 통찰:</span>
                </span>
                <p className="leading-relaxed text-slate-600">
                  {regionalGroupStats[0].name}의 평균 수치({regionalGroupStats[0].avg}{currentMetric.unit})와 {regionalGroupStats[1].name}의 평균 수치({regionalGroupStats[1].avg}{currentMetric.unit}) 간의 격차는 개별 주민의 선호가 아닌, <strong>산업 자본 배치, 지자체 재정력, 도시계획 연한의 차이가 누적된 공간 불평등</strong>임을 입증합니다.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    handleInjectTo4P(
                      'problem',
                      `[인천 4대 권역 구조적 격차 분석 - ${currentMetric.label}] ${regionalGroupStats[0].shortName}(평균 ${regionalGroupStats[0].avg}${currentMetric.unit})과 ${regionalGroupStats[1].shortName}(평균 ${regionalGroupStats[1].avg}${currentMetric.unit}) 간의 권역별 집단 편차는 지자체 예산과 도시 인프라 배분의 역사적 불균형에 기인함.`
                    )
                  }
                  className="mt-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  권역별 구조적 격차 분석 4P 문제에 주입하기 &rarr;
                </button>
              </div>
            </div>

            {/* RIGHT (5 cols): 6-Axis Radar Hexagon Diagram */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      다차원 방사형 레이더
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mt-1">
                    {selectedDistrict.name} 6대 지표 밸런스 프로필
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    6개 핵심 지표(100점 환산)로 자치구의 상대적 균형 상태를 평가합니다.
                  </p>
                </div>

                {/* District Selector for Radar */}
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 outline-none"
                >
                  {INCHEON_10_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.regionType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Radar Chart SVG Graphic */}
              <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center">
                <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-sm select-none">
                  {/* Concentric Hexagon Grid Lines (20%, 40%, 60%, 80%, 100%) */}
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => {
                    const r = radarChartData.maxR * level;
                    const pts = [0, 1, 2, 3, 4, 5]
                      .map((idx) => {
                        const a = (idx * 60 - 90) * (Math.PI / 180);
                        return `${radarChartData.center + r * Math.cos(a)},${radarChartData.center + r * Math.sin(a)}`;
                      })
                      .join(' ');
                    return (
                      <polygon
                        key={i}
                        points={pts}
                        fill={level === 1.0 ? '#F8FAFC' : 'none'}
                        stroke="#E2E8F0"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* 6 Axis Radial Spoke Lines */}
                  {radarChartData.axisPoints.map((p, idx) => (
                    <line
                      key={idx}
                      x1={radarChartData.center}
                      y1={radarChartData.center}
                      x2={p.axisEndX}
                      y2={p.axisEndY}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Incheon City Average Polygon (Dashed Grey) */}
                  <polygon
                    points={radarChartData.avgPolygonPoints}
                    fill="rgba(148, 163, 184, 0.15)"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Selected District Polygon (Bold Blue Glow) */}
                  <polygon
                    points={radarChartData.distPolygonPoints}
                    fill="rgba(37, 99, 235, 0.25)"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                  />

                  {/* Data Points */}
                  {radarChartData.axisPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.distX}
                      cy={p.distY}
                      r="4"
                      fill="#2563EB"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Axis Text Labels */}
                  {radarChartData.axisPoints.map((p, idx) => (
                    <text
                      key={idx}
                      x={p.labelX}
                      y={p.labelY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9.5"
                      fontWeight="800"
                      fill="#334155"
                      className="select-none"
                    >
                      {p.metric.label.split(' ')[0]}
                    </text>
                  ))}
                </svg>
              </div>

              {/* Legend for Radar */}
              <div className="flex items-center justify-center gap-5 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-3.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                  <span className="text-slate-900">{selectedDistrict.name}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-3.5 h-0.5 border-b border-dashed border-slate-500 inline-block" />
                  <span className="text-slate-500">인천 전체 평균</span>
                </div>
              </div>

              {/* District 6-Metric Mini List */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                {radarChartData.axisPoints.map((p) => (
                  <div key={p.metric.key} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="text-slate-500 font-bold truncate">{p.metric.label.slice(0, 7)}:</span>
                    <span className="font-black text-slate-900 font-mono">{p.distVal}{p.metric.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. AI Spatial Inquiry Hypothesis Generator (4P 탐구 가설 추천 카드) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">
                    [{selectedDistrict.name}] 공간 데이터 기반 4P 탐구 가설 제언
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    공간 분석 결과를 고등학생 수준의 학술적 연구계획서(4P)로 발전시킬 수 있는 구조화된 가설입니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleInjectTo4P(
                    'phenomenon',
                    `[공간 통계 관찰 - ${selectedDistrict.name}] ${currentMetric.label} 수치는 ${getDistrictValue(selectedDistrict, selectedMetricKey)}${currentMetric.unit}로 인천 평균(${currentMetric.avgVal}${currentMetric.unit}) 대비 뚜렷한 편차를 보임.`
                  );
                  handleInjectTo4P(
                    'problem',
                    `[구조적 원인 가설 - ${selectedDistrict.name}] ${selectedDistrict.regionType} 특성상 지자체 재정 및 도시 인프라 노후화가 복합 작용함: ${selectedDistrict.fourPInquiryTip.problem}`
                  );
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                4P 계획서에 가설 일괄 주입 &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* P1 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 inline-block">
                  P1. 사실 관찰 (Fact)
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  {selectedDistrict.name}의 {currentMetric.label}은(는) <strong>{getDistrictValue(selectedDistrict, selectedMetricKey)}{currentMetric.unit}</strong>로 관측됨.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  인천시 전체 평균: {currentMetric.avgVal}{currentMetric.unit}
                </div>
              </div>

              {/* P2 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 inline-block">
                  P2. 심층 원인 (Cause)
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  {selectedDistrict.fourPInquiryTip.problem}
                </p>
                <div className="text-[10px] text-slate-400">
                  권역 특성: {selectedDistrict.regionType}
                </div>
              </div>

              {/* P3 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 inline-block">
                  P3. 탐구 과업 (Project)
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  {selectedDistrict.fourPInquiryTip.project}
                </p>
                <div className="text-[10px] text-purple-300 font-semibold">
                  추천 연구 질문 도출 완료
                </div>
              </div>

              {/* P4 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-block">
                  P4. 실천 방안 (Practice)
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  {selectedDistrict.fourPInquiryTip.practice}
                </p>
                <div className="text-[10px] text-emerald-300 font-semibold">
                  청소년 조례·캠페인 제안
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>신도심(송도·청라)과 원도심(동구·미추홀구) 2개 자치구를 직접 선택해 공간 불평등 지표를 나란히 비교합니다.</span>
            </span>
            <span className="text-[11px] font-mono text-blue-700 font-bold">Dual District Comparator</span>
          </div>

          {/* Selectors for 2 districts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
              <label className="text-xs font-bold text-indigo-950 block">비교 자치구 A (주로 신도심):</label>
              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {INCHEON_10_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.regionType})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
              <label className="text-xs font-bold text-rose-950 block">비교 자치구 B (주로 원도심):</label>
              <select
                value={compareDistrictId}
                onChange={(e) => setCompareDistrictId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
              >
                {INCHEON_10_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.regionType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Cards & Gap Analysis */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3 w-1/3">사회·공간 분석 지표</th>
                  <th className="p-3 w-1/4 text-indigo-900 bg-indigo-50/80 font-black">
                    {selectedDistrict.name} ({selectedDistrict.regionType})
                  </th>
                  <th className="p-3 w-1/4 text-rose-900 bg-rose-50/80 font-black">
                    {compareDistrict.name} ({compareDistrict.regionType})
                  </th>
                  <th className="p-3 w-1/6 text-slate-600 font-bold">격차 (불평등 비율)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {METRICS_CATALOG.map((m) => {
                  const valA = getDistrictValue(selectedDistrict, m.key);
                  const valB = getDistrictValue(compareDistrict, m.key);
                  const diff = Math.abs(valA - valB);

                  return (
                    <tr key={m.key} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        <span>{m.label}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{m.unit}</span>
                      </td>
                      <td className="p-3 font-mono font-black text-indigo-700 text-sm bg-indigo-50/30">
                        {valA.toLocaleString()} {m.unit}
                      </td>
                      <td className="p-3 font-mono font-black text-rose-700 text-sm bg-rose-50/30">
                        {valB.toLocaleString()} {m.unit}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">
                        차이: {diff.toFixed(1)}{m.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* One-click inject comparison insight to 4P */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-blue-900 block">
                💡 {selectedDistrict.name} vs {compareDistrict.name} 격차 분석 종합 제언:
              </span>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                두 자치구 간 고령화율 편차와 공원면적 결핍은 단순한 주거 선호의 차이가 아니라, 신산업 자본 배치와 원도심 인프라 노후화가 빚어낸 공간적 환경정의의 문제입니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handleInjectTo4P(
                  'phenomenon',
                  `[${selectedDistrict.name} vs ${compareDistrict.name} 공간 불평등 비교] ${selectedDistrict.name}(${selectedDistrict.regionType})과 ${compareDistrict.name}(${compareDistrict.regionType}) 간 고령화율(${selectedDistrict.elderlyRatio}% vs ${compareDistrict.elderlyRatio}%), 1인당 공원면적(${selectedDistrict.envStats.parkAreaPerCapita}㎡ vs ${compareDistrict.envStats.parkAreaPerCapita}㎡), 청년고용률(${selectedDistrict.industryStats.youthEmploymentRate}% vs ${compareDistrict.industryStats.youthEmploymentRate}%)의 공간적 양극화가 뚜렷하게 관측됨.`
                )
              }
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shrink-0 shadow-xs transition-all"
            >
              비교 데이터 4P 현상에 주입 &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
