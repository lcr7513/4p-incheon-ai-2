import React, { useState } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  Copy,
  Compass,
  MapPin,
  Sparkles,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  Building2,
  Trees,
  History,
} from 'lucide-react';

export interface HotspotPreset {
  id: string;
  name: string;
  shortName: string;
  district: string;
  category: 'heritage' | 'smart_city' | 'ecology';
  lat: number;
  lng: number;
  altitude: number; // in meters
  tilt: number; // in degrees (0 to 80)
  heading: number; // compass heading 0 to 360
  inquiryKeywords: string[];
  description: string;
}

export const INCHEON_HOTSPOTS: HotspotPreset[] = [
  // 역사문화·원도심
  {
    id: 'open_port',
    name: '인천 중구 개항장 문화지구 (차이나타운·일본조계)',
    shortName: '중구 개항장 거리',
    district: '중구',
    category: 'heritage',
    lat: 37.4735,
    lng: 126.6215,
    altitude: 350,
    tilt: 45,
    heading: 35,
    inquiryKeywords: ['근대건축물', '조계지 경계 계단', '차이나타운', '경사지 지형'],
    description: '1883년 개항 이후 형성된 각국 조계지와 근대 서양식·일본식 건축물이 공존하는 역사적 공간입니다.',
  },
  {
    id: 'baedari',
    name: '인천 동구 배다리 헌책방 골목 & 산업유산',
    shortName: '동구 배다리 골목',
    district: '동구',
    category: 'heritage',
    lat: 37.4727,
    lng: 126.638,
    altitude: 400,
    tilt: 40,
    heading: 10,
    inquiryKeywords: ['원도심 헌책방', '양키시장', '산업도로 관통 갈등', '보행로 단절'],
    description: '경인선 철도와 배다리 일대 헌책방 골목으로, 원도심 재생과 도로 개설 갈등의 핵심 현장입니다.',
  },
  {
    id: 'camp_market',
    name: '인천 부평구 캠프마켓 (미군기지 반환부지)',
    shortName: '부평 캠프마켓',
    district: '부평구',
    category: 'heritage',
    lat: 37.4988,
    lng: 126.7118,
    altitude: 600,
    tilt: 50,
    heading: 0,
    inquiryKeywords: ['군사기지 반환', '조병창 병원건물', '토양 정화', '도심 공원화'],
    description: '일제강점기 조병창과 해방 후 주한미군 기지로 단절되었던 도심 공간의 생태공원화 현장입니다.',
  },
  {
    id: 'subong_san',
    name: '인천 미추홀구 수봉산 & 제물포 구도심',
    shortName: '미추홀구 수봉산',
    district: '미추홀구',
    category: 'heritage',
    lat: 37.4604,
    lng: 126.6631,
    altitude: 500,
    tilt: 45,
    heading: 120,
    inquiryKeywords: ['구릉지 주거지', '고도제한', '도시재생 뉴딜', '인구 노령화'],
    description: '수봉공원을 둘러싼 저층 노후 주거지와 제물포역세권의 도시재생 현황을 한눈에 볼 수 있습니다.',
  },

  // 미래도시·스마트 신도심
  {
    id: 'songdo_central',
    name: '송도국제도시 센트럴파크 & 트라이보울',
    shortName: '송도 센트럴파크',
    district: '연수구',
    category: 'smart_city',
    lat: 37.3925,
    lng: 126.6338,
    altitude: 650,
    tilt: 55,
    heading: 40,
    inquiryKeywords: ['해수공원', '초고층 스카이라인', '간척 매립지', '스마트시티 인프라'],
    description: '서해 갯벌을 매립하여 조성한 경제자유구역으로, 바닷물을 끌어들인 인공 해수공원과 초고층 건축군이 특징입니다.',
  },
  {
    id: 'cheongna_canal',
    name: '청라국제도시 커낼웨이 & 청라호수공원',
    shortName: '청라 커낼웨이',
    district: '서구',
    category: 'smart_city',
    lat: 37.5365,
    lng: 126.6534,
    altitude: 700,
    tilt: 50,
    heading: 90,
    inquiryKeywords: ['인공수로(커낼)', '호수공원', '수변 상업지역', '신도시 보행네트워크'],
    description: '도시 중심을 동서로 관통하는 인공 수로와 수변 보행축 중심의 주거·상업 복합 공간입니다.',
  },
  {
    id: 'incheon_port',
    name: '인천 내항 1·8부두 & 상상플랫폼 (친수공간 재생)',
    shortName: '인천 내항 1·8부두',
    district: '중구',
    category: 'smart_city',
    lat: 37.4768,
    lng: 126.6133,
    altitude: 550,
    tilt: 45,
    heading: 260,
    inquiryKeywords: ['항만 재개발', '곡물 사일로 벽화', '워터프런트', '시민 개방'],
    description: '국내 최대 곡물 저장 사일로와 폐곡물창고가 상상플랫폼 문화공간으로 탈바꿈한 항만 재생지입니다.',
  },
  {
    id: 'incheon_airport',
    name: '영종국제도시 인천국제공항 & 씨사이드파크',
    shortName: '영종 씨사이드파크',
    district: '중구',
    category: 'smart_city',
    lat: 37.4602,
    lng: 126.4407,
    altitude: 900,
    tilt: 45,
    heading: 180,
    inquiryKeywords: ['영종·용유도 간척', '해안 방파제', '공항 배후도시', '해안 갯벌 생태'],
    description: '영종도와 용유도 사이 바다를 메워 만든 세계적 공항 허브와 해안선을 따라 조성된 수변 공원입니다.',
  },

  // 생태·해양·환경
  {
    id: 'sorae_pogu',
    name: '남동구 소래포구 & 갯벌생태공원',
    shortName: '남동구 소래포구',
    district: '남동구',
    category: 'ecology',
    lat: 37.4005,
    lng: 126.736,
    altitude: 450,
    tilt: 40,
    heading: 210,
    inquiryKeywords: ['포구 어시장', '염전 유적지', '갯벌 조수간만차', '공단 완충녹지'],
    description: '전통 어항과 일제강점기 소래염전 부지가 수도권 유일의 해양 습지공원으로 보존된 지역입니다.',
  },
  {
    id: 'gyodong_do',
    name: '강화군 교동도 대룡시장 & 민통선 평화마을',
    shortName: '강화 교동도',
    district: '강화군',
    category: 'ecology',
    lat: 37.7788,
    lng: 126.2845,
    altitude: 700,
    tilt: 45,
    heading: 15,
    inquiryKeywords: ['접경지역 섬', '실향민 시장', '교동대교 연결', '간척 농경지'],
    description: '북한 황해도 연백군과 마주한 접경 섬으로, 6·25 전쟁 실향민들이 세운 옛 골목과 광활한 농경지입니다.',
  },
  {
    id: 'sudokwon_landfill',
    name: '서구 수도권매립지 드림파크 야생화단지',
    shortName: '서구 수도권매립지',
    district: '서구',
    category: 'ecology',
    lat: 37.5847,
    lng: 126.6433,
    altitude: 800,
    tilt: 50,
    heading: 330,
    inquiryKeywords: ['폐기물 매립지', '생태복원 공원', '환경 정의', '인접 악취 갈등'],
    description: '수도권 쓰레기를 매립하던 거대 갯벌 간척지가 생태공원으로 변모하며 환경 정의를 묻는 현장입니다.',
  },
  {
    id: 'baengnyeong_do',
    name: '옹진군 백령도 두무진 & 사곶해변',
    shortName: '옹진 백령도 두무진',
    district: '옹진군',
    category: 'ecology',
    lat: 37.9715,
    lng: 124.62,
    altitude: 600,
    tilt: 55,
    heading: 270,
    inquiryKeywords: ['국가지질공원', '해식애·시스택', '천연비행장 사곶', '서해 최북단'],
    description: '서해 최북단 지질 명소로, 기암괴석의 두무진 해식 절벽과 규암 모래로 단단한 천연비행장 해변입니다.',
  },
];

type ViewMode = 'bird' | 'topdown' | 'wide';

interface GoogleEarthFieldExplorerProps {
  onInjectNoteToFourP?: (step: 'phenomenon' | 'problem' | 'project' | 'practice', note: string) => void;
  onOpenAddModalWithSpot?: (spotName: string, inquiryTip: string) => void;
}

export const GoogleEarthFieldExplorer: React.FC<GoogleEarthFieldExplorerProps> = ({
  onInjectNoteToFourP,
  onOpenAddModalWithSpot,
}) => {
  const [searchQuery, setSearchQuery] = useState('인천 중구 개항장 문화지구');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotPreset>(INCHEON_HOTSPOTS[0]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'heritage' | 'smart_city' | 'ecology'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('bird');
  const [copied, setCopied] = useState(false);
  const [showInquiryGuide, setShowInquiryGuide] = useState(true);

  // Compute view mode parameters
  const getViewParameters = () => {
    switch (viewMode) {
      case 'topdown':
        return {
          alt: Math.round(selectedHotspot.altitude * 2),
          dist: Math.round(selectedHotspot.altitude * 2.5),
          tilt: 0,
          label: '🗺️ 0° 수직 정사뷰 (토지 구획·블록망 관찰)',
        };
      case 'wide':
        return {
          alt: Math.round(selectedHotspot.altitude * 4.5),
          dist: Math.round(selectedHotspot.altitude * 6),
          tilt: 60,
          label: '🌊 60° 광역 해안선뷰 (간척선·지형 윤곽 파악)',
        };
      case 'bird':
      default:
        return {
          alt: selectedHotspot.altitude,
          dist: Math.round(selectedHotspot.altitude * 1.4),
          tilt: selectedHotspot.tilt,
          label: '🦅 45° 입체 조감도 (건물 높낮이·스카이라인 관찰)',
        };
    }
  };

  const currentView = getViewParameters();

  // Generate Google Earth URL
  // If user searched for custom text not in hotspot, use search query; otherwise use exact 3D coordinates
  const isCustomQuery = searchQuery.trim() !== selectedHotspot.name && searchQuery.trim() !== selectedHotspot.shortName;

  const googleEarthUrl = isCustomQuery
    ? `https://earth.google.com/web/search/${encodeURIComponent(searchQuery.trim())}`
    : `https://earth.google.com/web/@${selectedHotspot.lat.toFixed(5)},${selectedHotspot.lng.toFixed(5)},${currentView.alt}a,${currentView.dist}d,${currentView.tilt}y,${selectedHotspot.heading}h,0t,0r`;

  const handleSelectHotspot = (spot: HotspotPreset) => {
    setSelectedHotspot(spot);
    setSearchQuery(spot.name);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(googleEarthUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleOpenGoogleEarth = () => {
    window.open(googleEarthUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRegisterAs4PPhenomenon = () => {
    const inquiryNote = `[3D 공간 관찰 현장: ${selectedHotspot.name}]\n- 위치 좌표: 위도 ${selectedHotspot.lat}, 경도 ${selectedHotspot.lng}\n- 관찰 키워드: ${selectedHotspot.inquiryKeywords.join(', ')}\n- 공간 특징: ${selectedHotspot.description}\n- 3D 탐구 시점: ${currentView.label}\n- 구글 어스 3D 링크: ${googleEarthUrl}`;
    
    if (onInjectNoteToFourP) {
      onInjectNoteToFourP('phenomenon', inquiryNote);
    }
    if (onOpenAddModalWithSpot) {
      onOpenAddModalWithSpot(selectedHotspot.name, selectedHotspot.description);
    }
  };

  const filteredHotspots =
    categoryFilter === 'all'
      ? INCHEON_HOTSPOTS
      : INCHEON_HOTSPOTS.filter((spot) => spot.category === categoryFilter);

  return (
    <section className="mb-8 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-indigo-800/40 relative overflow-hidden">
      {/* Decorative background grid and glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                인천 전역 3D 공간 탐구
              </span>
              <span className="text-xs text-slate-400">구글 어스(Google Earth) 실시간 연동</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
              인천 입체 공간 탐험기 <span className="text-emerald-400">3D Field Explorer</span>
            </h3>
          </div>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInquiryGuide(!showInquiryGuide)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            사회과 공간관찰 팁
            {showInquiryGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Control Panel: Search Bar & Hotspot Quick Select */}
      <div className="mt-5 space-y-4 relative z-10">
        {/* Search input with live trigger */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              탐구 지역/장소 검색 (또는 아래 추천 핫스팟 선택)
            </span>
            <span className="text-[11px] text-slate-400">
              입력 후 '3D 위성으로 열기'를 누르면 구글 어스 좌표로 즉시 이동합니다
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenGoogleEarth()}
                placeholder="예: 인천 중구 개항장, 송도 센트럴파크, 강화 교동도, 부평 미군기지..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition"
              />
              <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
            </div>

            <a
              href={googleEarthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              구글 어스 3D 위성으로 열기
            </a>

            <button
              onClick={handleCopyLink}
              title="구글 어스 URL 복사"
              className={`px-3.5 py-2.5 rounded-xl border text-sm flex items-center justify-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">링크 복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-xs">링크 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hotspot Category Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            인천 탐구 주제:
          </span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              categoryFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            전체 (12곳)
          </button>
          <button
            onClick={() => setCategoryFilter('heritage')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              categoryFilter === 'heritage'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <History className="w-3 h-3" />
            원도심·근대문화 (4곳)
          </button>
          <button
            onClick={() => setCategoryFilter('smart_city')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              categoryFilter === 'smart_city'
                ? 'bg-blue-400 text-slate-950 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <Building2 className="w-3 h-3" />
            미래도시·항만 (4곳)
          </button>
          <button
            onClick={() => setCategoryFilter('ecology')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              categoryFilter === 'ecology'
                ? 'bg-teal-400 text-slate-950 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <Trees className="w-3 h-3" />
            해양·도서·생태 (4곳)
          </button>
        </div>

        {/* Hotspots Grid / Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {filteredHotspots.map((spot) => {
            const isSelected = selectedHotspot.id === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => handleSelectHotspot(spot)}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-900 to-indigo-950 border-emerald-400 shadow-md ring-2 ring-emerald-400/40 text-white'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                    {spot.district}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <div className="text-xs font-bold truncate w-full text-slate-100">{spot.shortName}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {spot.inquiryKeywords[0]} · {spot.inquiryKeywords[1]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Hotspot Detail Card & 3D Perspective Controls */}
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                선택된 탐구지
              </span>
              <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                {selectedHotspot.name}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedHotspot.description}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">핵심 관찰 키워드:</span>
              {selectedHotspot.inquiryKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Perspective & 4P Link buttons */}
          <div className="flex flex-col gap-2 shrink-0 md:min-w-[240px]">
            {/* View perspective selector */}
            <div className="bg-slate-900/60 p-1 rounded-lg border border-white/10 flex items-center">
              <button
                onClick={() => setViewMode('bird')}
                className={`flex-1 py-1 rounded text-[11px] font-semibold transition ${
                  viewMode === 'bird'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="45도 경사 조감도"
              >
                🦅 45° 입체
              </button>
              <button
                onClick={() => setViewMode('topdown')}
                className={`flex-1 py-1 rounded text-[11px] font-semibold transition ${
                  viewMode === 'topdown'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="수직 정사항공뷰"
              >
                🗺️ 0° 평면
              </button>
              <button
                onClick={() => setViewMode('wide')}
                className={`flex-1 py-1 rounded text-[11px] font-semibold transition ${
                  viewMode === 'wide'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="광역 해안선뷰"
              >
                🌊 광역뷰
              </button>
            </div>

            {/* Link to 4P Phenomenon Button */}
            <button
              onClick={handleRegisterAs4PPhenomenon}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition active:scale-95 border border-indigo-400/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              4P 현상(P1) 관찰지로 등록
            </button>
          </div>
        </div>

        {/* Collapsible Inquiry Guide (사회과 탐구 가이드) */}
        {showInquiryGuide && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Compass className="w-4 h-4" />
              <span>사회과 3D 위성 공간 탐구 팁 (Observation Checkpoints)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-300">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                  🏙️ 스카이라인과 고도차
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  원도심(동구·미추홀구)의 1~4층 노후 밀집 주택과 송도·청라의 40~60층 초고층 타워를 비교하며 도시 개발 격차를 체감합니다.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                  🧭 토지 구획과 가로망
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  개항장의 좁고 굽은 골목길·계단 지형과 신도시의 바둑판식 슈퍼블록(Superblock) 및 보행로 분리 체계를 관찰합니다.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                  🌊 해안선 변화와 간척
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  직선으로 잘려나간 송도·영종·청라 해안선과 소래포구 등 자연 갯벌 곡선을 대조하여 100년간 인천 간척 역사를 확인합니다.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                  🎮 3D 조작 단축키
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  구글 어스 화면에서 <kbd className="px-1 py-0.5 bg-black/40 rounded text-emerald-300">Shift</kbd> 키를 누른 채 마우스를 드래그하면 360° 회전 및 틸트(기울기) 조절이 가능합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
