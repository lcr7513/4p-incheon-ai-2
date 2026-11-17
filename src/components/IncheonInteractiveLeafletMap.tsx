import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Compass,
  RotateCcw,
  Footprints,
  Satellite,
  Map as MapIcon,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DistrictStat } from '../data/incheonStatsData';
import { GisMetricKey, MetricConfig } from './IncheonGisMapStudio';

export interface IncheonGeoCentroid {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  regionType: string;
  brief: string;
}

export const INCHEON_GEO_CENTROIDS: IncheonGeoCentroid[] = [
  {
    id: 'ganghwa-gun',
    name: '강화군',
    lat: 37.7465,
    lng: 126.488,
    radiusMeters: 8500,
    regionType: '도서·생태지역',
    brief: '초고령 농어촌 면단위 도서지역 (고령화 36.8%)',
  },
  {
    id: 'ongjin-gun',
    name: '옹진군',
    lat: 37.24,
    lng: 126.15,
    radiusMeters: 9500,
    regionType: '도서·생태지역',
    brief: '서해 5도 및 청정 도서생태지역 (미세먼지 최저)',
  },
  {
    id: 'seo-gu',
    name: '서구',
    lat: 37.5454,
    lng: 126.676,
    radiusMeters: 6000,
    regionType: '산업·주거복합',
    brief: '청라국제도시 & 검단신도시 대단지 복합권역',
  },
  {
    id: 'gyeyang-gu',
    name: '계양구',
    lat: 37.5374,
    lng: 126.7377,
    radiusMeters: 3800,
    regionType: '산업·주거복합',
    brief: '계양산 & 아라뱃길 배후 주거권역',
  },
  {
    id: 'bupyeong-gu',
    name: '부평구',
    lat: 37.507,
    lng: 126.7218,
    radiusMeters: 3600,
    regionType: '산업·주거복합',
    brief: '부평산단 & 전통 상권 밀집 중심지',
  },
  {
    id: 'jung-gu',
    name: '중구',
    lat: 37.4738,
    lng: 126.6214,
    radiusMeters: 4600,
    regionType: '원도심·항만',
    brief: '개항장 역사문화지구 & 인천국제공항',
  },
  {
    id: 'dong-gu',
    name: '동구',
    lat: 37.4739,
    lng: 126.6432,
    radiusMeters: 2500,
    regionType: '원도심·항만',
    brief: '배다리 헌책방 & 중화학 제철공단 배후 원도심',
  },
  {
    id: 'michuhol-gu',
    name: '미추홀구',
    lat: 37.4635,
    lng: 126.6504,
    radiusMeters: 3200,
    regionType: '원도심·항만',
    brief: '수봉산 & 인하대 배후 원도심 주거밀집지',
  },
  {
    id: 'namdong-gu',
    name: '남동구',
    lat: 37.4469,
    lng: 126.7314,
    radiusMeters: 4500,
    regionType: '산업·주거복합',
    brief: '인천시청 & 남동국가산업단지 & 소래포구',
  },
  {
    id: 'yeonsu-gu',
    name: '연수구',
    lat: 37.4098,
    lng: 126.6782,
    radiusMeters: 4800,
    regionType: '경제자유구역·신도심',
    brief: '송도국제도시 바이오클러스터 & 센트럴파크',
  },
];

export interface WalkingTourStop {
  id: string;
  districtId: string;
  name: string;
  lat: number;
  lng: number;
  steps: number;
  finding: string;
  fourPTip: string;
}

export const INCHEON_WALKING_TOUR_STOPS: WalkingTourStop[] = [
  {
    id: 'walk-jung-gu',
    districtId: 'jung-gu',
    name: '제1코스: 인천 개항장 문화지구 & 신포시장',
    lat: 37.4727,
    lng: 126.6225,
    steps: 15400,
    finding: '차이나타운-대화조계지 계단과 근대건축전시관을 걸으며 원도심 보존과 관광 젠트리피케이션의 명암을 체감함.',
    fourPTip: 'P1 사실 관찰: 역사문화지구 주변 골목길의 빈 점포와 관광형 상권 간의 극심한 양극화 현상 확인',
  },
  {
    id: 'walk-dong-gu',
    districtId: 'dong-gu',
    name: '제2코스: 배다리 헌책방 골목 & 송현동 달동네',
    lat: 37.4718,
    lng: 126.6375,
    steps: 14800,
    finding: '송현동 고지대 골목길을 직접 걸으며 계단 난간 부재와 70대 이상 어르신들의 보행 단절을 실측함.',
    fourPTip: 'P2 원인 분석: 고지대 노후 단독주택 밀집지와 도로 폭 협소로 인한 공공 보행약자 이동 인프라 부재',
  },
  {
    id: 'walk-yeonsu-gu',
    districtId: 'yeonsu-gu',
    name: '제3코스: 송도 센트럴파크 & 바이오 연구단지',
    lat: 37.3917,
    lng: 126.6392,
    steps: 16200,
    finding: '스마트시티 해수공원과 첨단 바이오 연구소 단지를 탐방하며 1인당 공원면적 28.4㎡의 녹지 혜택과 청년 고용 밀집을 체감함.',
    fourPTip: 'P1 사실 관찰: 송도 신도시와 원도심 동구 간 7.5배에 달하는 1인당 도시공원 면적의 공간적 불평등',
  },
  {
    id: 'walk-namdong-gu',
    districtId: 'namdong-gu',
    name: '제4코스: 소래포구 생태공원 & 남동국가산단',
    lat: 37.4089,
    lng: 126.7485,
    steps: 15100,
    finding: '염전 갯벌 생태지와 남동공단 제조공장 배후지를 걸으며 미세먼지 차단숲의 필요성과 해양 블루카본 보존 가치를 확인.',
    fourPTip: 'P3 탐구 과업: 노후 국가산단 완충녹지 조성 및 염생식물 서식지 복원을 통한 대기질 개선 방안 연구',
  },
  {
    id: 'walk-bupyeong-gu',
    districtId: 'bupyeong-gu',
    name: '제5코스: 부평 문화의거리 & 캠프마켓 반환부지',
    lat: 37.4912,
    lng: 126.7233,
    steps: 14500,
    finding: '전국 최대 규모 지하상가의 공실률과 미군기지 반환부지의 시민 개방 공간을 탐방하며 도심 공간 재구조화 목격.',
    fourPTip: 'P2 원인 분석: 온라인 소비 전환에 따른 구도심 상권 침체와 대규모 군사부지 공공 재생 필요성',
  },
  {
    id: 'walk-seo-gu',
    districtId: 'seo-gu',
    name: '제6코스: 청라 커낼웨이 & 환경자원시설',
    lat: 37.5342,
    lng: 126.6517,
    steps: 15800,
    finding: '청라 호수공원 수변공간과 수도권 매립지 방면을 걸으며 환경 혐오시설과 신도시 쾌적 주거의 공존 과제 분석.',
    fourPTip: 'P4 실천 방안: 자원순환 폐기물 감축 정책 및 주민 참여형 친환경 재생 에너지 전환 로드맵',
  },
  {
    id: 'walk-ganghwa-gun',
    districtId: 'ganghwa-gun',
    name: '제7코스: 강화 고려궁지 & 대한성공회 강화성당',
    lat: 37.7495,
    lng: 126.485,
    steps: 13900,
    finding: '조선시대 한옥 양식 성당과 읍내 거리를 탐방하며 65세 이상 고령비율 36.8%에 달하는 농어촌 지방소멸 위기를 체감.',
    fourPTip: 'P1 사실 관찰: 강화군 초고령화와 의료·대중교통 접근성 취약으로 인한 의료 공백 및 인구 유출 현상',
  },
  {
    id: 'walk-gyeyang-gu',
    districtId: 'gyeyang-gu',
    name: '제8코스: 계양산성 & 경인아라뱃길 수향원',
    lat: 37.5583,
    lng: 126.721,
    steps: 15300,
    finding: '해발 395m 계양산 둘레길과 인공 수로 아라뱃길을 걸으며 생태 녹지축 단절과 친수공간 레저 활용의 개선점 파악.',
    fourPTip: 'P3 탐구 과업: 계양산 생태축 연결 녹지 복원 및 아라뱃길 대중교통 환승 편의 개선',
  },
];

interface IncheonInteractiveLeafletMapProps {
  mapRenderMode: 'vector' | 'real-street' | 'real-satellite';
  onChangeMapMode: (mode: 'vector' | 'real-street' | 'real-satellite') => void;
  selectedMetric: MetricConfig;
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  showWalkPins: boolean;
  onToggleWalkPins: () => void;
  districtsData: DistrictStat[];
  getDistrictValue: (dist: DistrictStat, metric: GisMetricKey) => number;
  getDistrictFillColor: (distId: string) => string;
  onInjectTo4P?: (target: 'phenomenon' | 'problem', text: string) => void;
}

export const IncheonInteractiveLeafletMap: React.FC<IncheonInteractiveLeafletMapProps> = ({
  mapRenderMode,
  onChangeMapMode,
  selectedMetric,
  selectedDistrictId,
  onSelectDistrict,
  showWalkPins,
  onToggleWalkPins,
  districtsData,
  getDistrictValue,
  getDistrictFillColor,
  onInjectTo4P,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const districtLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const walkLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(10);
  const [showSatelliteLabels, setShowSatelliteLabels] = useState<boolean>(true);
  const [showChoroplethCircles, setShowChoroplethCircles] = useState<boolean>(true);

  // Incheon default center
  const INCHEON_CENTER: [number, number] = [37.475, 126.65];

  // 1. Initialize Map on mount
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center: INCHEON_CENTER,
        zoom: 10,
        minZoom: 8,
        maxZoom: 18,
        zoomControl: false, // Custom placed controls
        attributionControl: true,
      });

      // Layer groups for clean management
      tileLayersGroupRef.current = L.layerGroup().addTo(map);
      districtLayersGroupRef.current = L.layerGroup().addTo(map);
      walkLayersGroupRef.current = L.layerGroup().addTo(map);

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstanceRef.current = map;

      // Force recalculation after render
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayersGroupRef.current = null;
        districtLayersGroupRef.current = null;
        walkLayersGroupRef.current = null;
      }
    };
  }, []);

  // 2. Handle Tile Layer Switch (Real Street vs Real Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const tileGroup = tileLayersGroupRef.current;
    if (!map || !tileGroup) return;

    tileGroup.clearLayers();

    if (mapRenderMode === 'real-satellite') {
      // High-resolution Esri World Imagery (Satellite)
      const satelliteBase = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution:
            '항공위성: &copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS',
        }
      );

      tileGroup.addLayer(satelliteBase);

      // Boundaries and Road Labels Overlay (Optional toggle)
      if (showSatelliteLabels) {
        const satelliteLabels = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            opacity: 0.9,
          }
        );
        tileGroup.addLayer(satelliteLabels);
      }
    } else {
      // High-fidelity OpenStreetMap Standard Tiles (Roads, subways, district names)
      const streetLayer = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution:
            '도로지도: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        }
      );
      tileGroup.addLayer(streetLayer);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [mapRenderMode, showSatelliteLabels]);

  // 3. Render District Choropleth Circles & Interactive Badges
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = districtLayersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    INCHEON_GEO_CENTROIDS.forEach((geo) => {
      const distData = districtsData.find((d) => d.id === geo.id);
      const val = distData ? getDistrictValue(distData, selectedMetric.key) : 0;
      const isSelected = selectedDistrictId === geo.id;
      const fillColor = getDistrictFillColor(geo.id);

      // A. Choropleth Intensity Circle (Conditional)
      if (showChoroplethCircles) {
        const circle = L.circle([geo.lat, geo.lng], {
          radius: isSelected ? geo.radiusMeters * 1.05 : geo.radiusMeters,
          color: isSelected ? '#38BDF8' : fillColor,
          weight: isSelected ? 3.5 : 1.5,
          fillColor: fillColor,
          fillOpacity: isSelected ? 0.45 : mapRenderMode === 'real-satellite' ? 0.35 : 0.28,
          interactive: true,
        });

        circle.on('click', () => {
          onSelectDistrict(geo.id);
        });

        circle.bindTooltip(
          `<div style="font-weight:bold; font-size:12px;">${geo.name}</div><div style="font-size:11px; color:#2563EB;">${selectedMetric.label}: <strong>${val}${selectedMetric.unit}</strong></div>`,
          { direction: 'top', offset: [0, -10] }
        );

        group.addLayer(circle);
      }

      // B. Custom Rich DivIcon Badge
      const isSat = mapRenderMode === 'real-satellite';
      const badgeHtml = `
        <div class="cursor-pointer select-none transition-transform duration-200 hover:scale-110 active:scale-95 ${
          isSelected ? 'scale-110 z-50' : 'z-20'
        }" style="display:inline-block;">
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: ${isSelected ? '6px 12px' : '4px 9px'};
            border-radius: 9999px;
            background: ${isSelected ? '#0F172A' : isSat ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)'};
            color: ${isSelected ? '#FFFFFF' : isSat ? '#F8FAFC' : '#0F172A'};
            border: ${isSelected ? '2px solid #38BDF8' : isSat ? '1.5px solid rgba(255,255,255,0.4)' : '1px solid #CBD5E1'};
            box-shadow: ${isSelected ? '0 0 16px rgba(56, 189, 248, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 8px -2px rgba(0, 0, 0, 0.25)'};
            backdrop-filter: blur(8px);
          ">
            <span style="
              width: 9px;
              height: 9px;
              border-radius: 50%;
              background-color: ${fillColor};
              box-shadow: 0 0 6px ${fillColor};
              flex-shrink: 0;
            "></span>
            <span style="
              font-size: ${isSelected ? '12px' : '11px'};
              font-weight: 800;
              letter-spacing: -0.02em;
            ">${geo.name}</span>
            <span style="
              font-size: ${isSelected ? '11px' : '10px'};
              font-weight: 700;
              font-family: monospace;
              color: ${isSelected ? '#7DD3FC' : isSat ? '#93C5FD' : '#2563EB'};
            ">${val}${selectedMetric.unit}</span>
          </div>
        </div>
      `;

      const badgeIcon = L.divIcon({
        className: 'incheon-district-div-icon',
        html: badgeHtml,
        iconSize: [120, 32],
        iconAnchor: [60, 16],
      });

      const marker = L.marker([geo.lat, geo.lng], { icon: badgeIcon, interactive: true });
      marker.on('click', () => {
        onSelectDistrict(geo.id);
      });

      group.addLayer(marker);
    });
  }, [selectedMetric, selectedDistrictId, mapRenderMode, districtsData, showChoroplethCircles]);

  // 4. Render Student Walking Tour Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const walkGroup = walkLayersGroupRef.current;
    if (!map || !walkGroup) return;

    walkGroup.clearLayers();

    if (!showWalkPins) return;

    INCHEON_WALKING_TOUR_STOPS.forEach((stop) => {
      const walkIconHtml = `
        <div class="cursor-pointer group select-none transition-transform duration-200 hover:scale-125" style="display:flex; flex-direction:column; align-items:center;">
          <div style="
            background: #10B981;
            color: #FFFFFF;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          ">
            👣
          </div>
          <div style="
            margin-top: 2px;
            padding: 2px 6px;
            border-radius: 6px;
            background: rgba(15, 23, 42, 0.95);
            color: #A7F3D0;
            font-size: 9px;
            font-weight: 800;
            white-space: nowrap;
            border: 1px solid rgba(52, 211, 153, 0.6);
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${stop.name.split(':')[0]} (${(stop.steps / 1000).toFixed(1)}k보)
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'student-walk-div-icon',
        html: walkIconHtml,
        iconSize: [80, 50],
        iconAnchor: [40, 25],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 space-y-2 text-slate-800';
      popupContent.innerHTML = `
        <div style="border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase;">8대 현장탐구 실사 코스</span>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px;">${stop.name}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #059669; font-weight: 700;">
          <span>👣 15,000보 완보 실측: ${stop.steps.toLocaleString()}보</span>
        </div>
        <p style="font-size: 11px; color: #475569; line-height: 1.4; margin: 0;">${stop.finding}</p>
        <div style="padding-top: 6px; border-top: 1px solid #E2E8F0;">
          <div style="font-size: 10px; font-weight: 800; color: #4F46E5; margin-bottom: 4px;">🎯 4P 연계 착안점</div>
          <p style="font-size: 11px; color: #374151; line-height: 1.35; margin: 0;">${stop.fourPTip}</p>
        </div>
      `;

      if (onInjectTo4P) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = '이 현장 답사 기록을 4P 현상에 주입하기 →';
        btn.style.cssText =
          'width:100%; margin-top:8px; padding:6px 10px; background:#4F46E5; color:white; border-radius:8px; font-size:11px; font-weight:700; border:none; cursor:pointer; text-align:center;';
        btn.onclick = () => {
          onInjectTo4P(
            'phenomenon',
            `[8대 걷기 현장탐구 데이터 - ${stop.name}] ${stop.finding} (${stop.fourPTip})`
          );
          marker.closePopup();
        };
        popupContent.appendChild(btn);
      }

      marker.bindPopup(popupContent, { maxWidth: 280 });
      walkGroup.addLayer(marker);
    });
  }, [showWalkPins, onInjectTo4P]);

  // 5. Pan smoothly when selectedDistrictId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const target = INCHEON_GEO_CENTROIDS.find((d) => d.id === selectedDistrictId);
    if (target) {
      map.flyTo([target.lat, target.lng], 12, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [selectedDistrictId]);

  // Controls Handlers
  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INCHEON_CENTER, 10, { duration: 0.7 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const selectedCentroid = useMemo(() => {
    return (
      INCHEON_GEO_CENTROIDS.find((d) => d.id === selectedDistrictId) ||
      INCHEON_GEO_CENTROIDS[0]
    );
  }, [selectedDistrictId]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 flex flex-col justify-between select-none">
      {/* Real Leaflet Map Render Canvas */}
      <div
        ref={containerRef}
        id="real-incheon-leaflet-map"
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Floating Top Controls Bar (Layer Switcher, Walk Toggle, Status) */}
      <div className="relative z-20 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Indicator & Active District Badge */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <div className="text-xs font-bold leading-none">
              <span className="text-slate-400 font-normal">포커스: </span>
              <span className="text-sky-300 font-black">{selectedCentroid.name}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
              {mapRenderMode === 'real-street' ? '실제 도로 (OSM)' : '실사 항공 위성 (Esri)'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetCenter}
            className="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 shadow-md backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold"
            title="인천시 전체 중심 화면으로 리셋"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">인천 전역 보기</span>
          </button>
        </div>

        {/* Right: Map Type Switcher & Walking Pins Toggle */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
          {/* 3-Mode Switcher: Vector / Street / Satellite */}
          <div className="flex items-center p-1 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => onChangeMapMode('vector')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                mapRenderMode === 'vector'
                  ? 'bg-blue-600 text-white shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="정밀 SVG 행정구역 경계 벡터 지도"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>벡터 영역</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMapMode('real-street')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                mapRenderMode === 'real-street'
                  ? 'bg-blue-600 text-white shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="오픈스트리트맵 기반 실시간 도로 지도"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>실제 도로</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMapMode('real-satellite')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                mapRenderMode === 'real-satellite'
                  ? 'bg-indigo-600 text-white shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="실사 고해상도 인공위성 사진 지도"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>실제 위성</span>
            </button>
          </div>

          {/* Sub Options in Leaflet */}
          {mapRenderMode === 'real-satellite' && (
            <button
              type="button"
              onClick={() => setShowSatelliteLabels(!showSatelliteLabels)}
              className={`px-2.5 py-1.5 rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1 shadow-xl border ${
                showSatelliteLabels
                  ? 'bg-sky-600/90 text-white border-sky-400'
                  : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="위성 사진 위 도로 및 지명 라벨 표시 여부"
            >
              <span>라벨 {showSatelliteLabels ? 'ON' : 'OFF'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowChoroplethCircles(!showChoroplethCircles)}
            className={`px-2.5 py-1.5 rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1 shadow-xl border ${
              showChoroplethCircles
                ? 'bg-indigo-600/90 text-white border-indigo-400'
                : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="자치구별 지표 통계 영향 반경 서클 표시 여부"
          >
            <span>서클 {showChoroplethCircles ? 'ON' : 'OFF'}</span>
          </button>

          {/* Walking Pins Toggle */}
          <button
            type="button"
            onClick={onToggleWalkPins}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xl border ${
              showWalkPins
                ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-500/20'
                : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>답사 핀 {showWalkPins ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Navigation & Controls */}
      <div className="relative z-20 p-3 sm:p-4 flex items-end justify-between gap-3 pointer-events-none">
        {/* Left: Metric Legend & Information Pill */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700 text-white shadow-2xl max-w-sm space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              {selectedMetric.category} · {selectedMetric.label}
            </span>
            <span className="text-[10px] font-mono text-slate-300">
              인천 평균: <strong className="text-white">{selectedMetric.avgVal}{selectedMetric.unit}</strong>
            </span>
          </div>

          {/* Color Scale Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-800 border border-slate-700">
              <div className="h-full w-1/5 bg-slate-300" />
              <div className="h-full w-1/5 bg-blue-300" />
              <div className="h-full w-1/5 bg-blue-500" />
              <div className="h-full w-1/5 bg-blue-700" />
              <div className="h-full w-1/5 bg-indigo-900" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>낮음</span>
              <span className="text-sky-300 font-bold">지도 위 원(Circle) & 뱃지 클릭 시 선택</span>
              <span>높음</span>
            </div>
          </div>
        </div>

        {/* Right: Zoom In / Zoom Out Controls */}
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className="flex flex-col bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="지도 확대 (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-px bg-slate-800 my-0.5" />
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="지도 축소 (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
