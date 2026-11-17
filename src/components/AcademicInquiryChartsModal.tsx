import React, { useState } from 'react';
import {
  X,
  Compass,
  BarChart3,
  PieChart,
  Copy,
  Check,
  Sparkles,
  Printer,
  ChevronRight,
  Database,
  ArrowRight,
  Info,
  Maximize2,
  BookOpen,
  Footprints,
  PenTool,
  Award,
} from 'lucide-react';
import { ResearchProject, LabId } from '../types';
import { LABS_DATA } from '../data/labsData';
import {
  calculateAcademicRadarMetrics,
  calculateReadWalkWriteBalance,
  INCHEON_DISTRICT_METRICS,
  RadarMetric,
} from '../utils/academicChartMetrics';

interface AcademicChartsViewProps {
  project: ResearchProject;
  onInjectToProject?: (step: 'phenomenon' | 'problem' | 'project' | 'practice', text: string) => void;
  compact?: boolean;
}

export const AcademicChartsView: React.FC<AcademicChartsViewProps> = ({
  project,
  onInjectToProject,
  compact = false,
}) => {
  const [selectedLabId, setSelectedLabId] = useState<LabId>(project.labId || 'science');
  const [activeTab, setActiveTab] = useState<'radar' | 'district' | 'balance' | 'all'>('radar');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hoveredRadarAxis, setHoveredRadarAxis] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const radarMetrics = calculateAcademicRadarMetrics(project);
  const balance = calculateReadWalkWriteBalance(project);
  const districtMetricSet = INCHEON_DISTRICT_METRICS[selectedLabId] || INCHEON_DISTRICT_METRICS.science;

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  /* =========================================================
   * 1. 5-Axis Radar Chart SVG Coordinates & Calculations
   * ========================================================= */
  const cx = 150;
  const cy = 150;
  const radius = 105;
  const totalAxes = radarMetrics.length; // 5

  const getCoordinates = (index: number, val: number) => {
    // Top axis starts at -90 degrees (-PI/2)
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const r = (val / 100) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Student Polygon points
  const studentPoints = radarMetrics
    .map((m, i) => {
      const { x, y } = getCoordinates(i, m.value);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Benchmark Polygon points (recommendation standard)
  const benchmarkPoints = radarMetrics
    .map((m, i) => {
      const { x, y } = getCoordinates(i, m.benchmark);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  /* =========================================================
   * 2. Read-Walk-Write Donut Chart SVG Calculations
   * ========================================================= */
  const donutCx = 120;
  const donutCy = 120;
  const donutR = 75;
  const strokeWidth = 32;
  const circumference = 2 * Math.PI * donutR;

  // Segments: Read (Amber), Walk (Emerald), Write (Indigo)
  const readStroke = (balance.readPct / 100) * circumference;
  const walkStroke = (balance.walkPct / 100) * circumference;
  const writeStroke = (balance.writePct / 100) * circumference;

  const readOffset = 0;
  const walkOffset = -readStroke;
  const writeOffset = -(readStroke + walkStroke);

  return (
    <div className="space-y-6">
      {/* Chart Navigation Tabs */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'radar'
                  ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>4P 역량 거미줄 차트</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('district')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'district'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>인천 10개 군·구 비교 차트</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('balance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'balance'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-emerald-600" />
              <span>읽·걷·쓰 밸런스 도넛</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>3대 차트 종합 비교</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">비교 전공:</span>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value as LabId)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {LABS_DATA.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 1: 4P 역량 방사형 거미줄 차트 (Radar Chart)
       * ========================================================================= */}
      {(activeTab === 'radar' || activeTab === 'all') && (
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                  RADAR ANALYTICS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                  학술 5각형 역량 다이어그램
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-1">
                4P 탐구 프레임워크 역량 방사형 거미줄 차트
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                현상(P1) · 원인(P2) · 과업(P3) · 실천(P4) 서술 완성도 및 인용·연구윤리 충실도를 정량화하여 권장 기준과 비교합니다.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-500/80 border border-indigo-700"></span>
                <span className="font-bold text-slate-800">현재 탐구 점수</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500"></span>
                <span className="text-slate-600 font-medium">권장 학술 기준선 (80점+)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Radar Chart Visual */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
              <svg
                viewBox="0 0 300 300"
                className="w-full max-w-[280px] sm:max-w-[320px] h-auto drop-shadow-xs"
              >
                {/* Concentric Background Grid Pentagons */}
                {[20, 40, 60, 80, 100].map((level) => {
                  const pts = radarMetrics
                    .map((_, i) => {
                      const { x, y } = getCoordinates(i, level);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={level}
                      points={pts}
                      fill="none"
                      stroke={level === 80 ? '#10B981' : '#E2E8F0'}
                      strokeWidth={level === 80 ? '1.5' : '1'}
                      strokeDasharray={level === 80 ? '3 3' : undefined}
                    />
                  );
                })}

                {/* Concentric grid labels */}
                {[40, 80, 100].map((level) => (
                  <text
                    key={level}
                    x={cx + 4}
                    y={cy - (level / 100) * radius + 3}
                    fontSize="8"
                    fill={level === 80 ? '#10B981' : '#94A3B8'}
                    fontWeight={level === 80 ? 'bold' : 'normal'}
                  >
                    {level}
                  </text>
                ))}

                {/* Spoke lines from center */}
                {radarMetrics.map((_, i) => {
                  const { x, y } = getCoordinates(i, 100);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Benchmark Polygon (Green outline) */}
                <polygon
                  points={benchmarkPoints}
                  fill="#10B981"
                  fillOpacity="0.08"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* Student Score Polygon (Indigo filled) */}
                <polygon
                  points={studentPoints}
                  fill="#6366F1"
                  fillOpacity="0.35"
                  stroke="#4F46E5"
                  strokeWidth="2.5"
                />

                {/* Student Data Points & Hover Targets */}
                {radarMetrics.map((m, i) => {
                  const { x, y } = getCoordinates(i, m.value);
                  const isHovered = hoveredRadarAxis === m.axis;
                  return (
                    <g key={i} className="cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 4.5}
                        fill="#4F46E5"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all duration-200"
                        onMouseEnter={() => setHoveredRadarAxis(m.axis)}
                        onMouseLeave={() => setHoveredRadarAxis(null)}
                      />
                      {/* Score Value on Node */}
                      <text
                        x={x}
                        y={y - 8}
                        fontSize="9"
                        fontWeight="bold"
                        fill="#1E1B4B"
                        textAnchor="middle"
                        className="drop-shadow-xs"
                      >
                        {m.value}
                      </text>
                    </g>
                  );
                })}

                {/* Axis Labels */}
                {radarMetrics.map((m, i) => {
                  const { x, y, angle } = getCoordinates(i, 118);
                  const textAnchor =
                    Math.abs(Math.cos(angle)) < 0.2
                      ? 'middle'
                      : Math.cos(angle) > 0
                      ? 'start'
                      : 'end';

                  return (
                    <text
                      key={i}
                      x={x}
                      y={y + 3}
                      fontSize="9"
                      fontWeight="bold"
                      fill={hoveredRadarAxis === m.axis ? '#4338CA' : '#334155'}
                      textAnchor={textAnchor}
                      className="cursor-pointer select-none transition-colors"
                      onMouseEnter={() => setHoveredRadarAxis(m.axis)}
                      onMouseLeave={() => setHoveredRadarAxis(null)}
                    >
                      {m.axis}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Diagnostic Score Cards */}
            <div className="md:col-span-6 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between pb-1 border-b border-slate-100">
                <span>5대 축별 세부 진단 결과</span>
                <span className="text-[11px] font-normal text-slate-500">
                  종합 평균: <strong>{Math.round(radarMetrics.reduce((a, b) => a + b.value, 0) / 5)}점</strong> / 100점
                </span>
              </h4>

              {radarMetrics.map((m) => {
                const isHovered = hoveredRadarAxis === m.axis;
                const statusBadge =
                  m.status === '우수'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : m.status === '양호'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200';

                return (
                  <div
                    key={m.axis}
                    onMouseEnter={() => setHoveredRadarAxis(m.axis)}
                    onMouseLeave={() => setHoveredRadarAxis(null)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isHovered
                        ? 'border-indigo-400 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{m.axis}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${statusBadge}`}>
                          {m.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 font-mono text-[10px]">기준 {m.benchmark}점</span>
                        <span className="font-black text-indigo-700 font-mono text-sm">{m.value}점</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      {/* Benchmark marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-10"
                        style={{ left: `${m.benchmark}%` }}
                        title={`권장 기준 ${m.benchmark}점`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          m.value >= m.benchmark ? 'bg-indigo-600' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${m.value}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {m.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 2: 인천 10개 군·구 공공통계 비교 차트 (Bar Chart)
       * ========================================================================= */}
      {(activeTab === 'district' || activeTab === 'all') && (
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                  INCHEON DISTRICT COMPARISON
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                  인천 공공데이터넷 연계
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-1">
                {districtMetricSet.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {districtMetricSet.subtitle} (단위: {districtMetricSet.unit})
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs bg-blue-50/70 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200 shrink-0">
              <Database className="w-3.5 h-3.5 text-blue-700" />
              <span>
                인천시 전체 평균: <strong>{districtMetricSet.incheonAverage}{districtMetricSet.unit}</strong>
              </span>
            </div>
          </div>

          {/* SVG Bar Chart for 10 Districts */}
          <div className="space-y-2 pt-1">
            {(() => {
              const maxValue = Math.max(...districtMetricSet.data.map((d) => d.value), districtMetricSet.incheonAverage * 1.15);

              return districtMetricSet.data.map((item, idx) => {
                const pct = (item.value / maxValue) * 100;
                const avgPct = (districtMetricSet.incheonAverage / maxValue) * 100;
                const isHovered = hoveredDistrict === item.district;
                const isFocus = item.isFocusDistrict;

                return (
                  <div
                    key={item.district}
                    onMouseEnter={() => setHoveredDistrict(item.district)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    className={`p-2 rounded-xl transition-all ${
                      isFocus
                        ? 'bg-indigo-50/80 border border-indigo-300 shadow-2xs'
                        : isHovered
                        ? 'bg-slate-50 border border-slate-300'
                        : 'border border-transparent hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-mono text-slate-400 text-[11px]">{idx + 1}.</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.district}</span>
                          {isFocus && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-600 text-white shadow-2xs">
                              탐구 중점 지역
                            </span>
                          )}
                        </span>
                        {item.highlightNote && (
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            — {item.highlightNote}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-black text-slate-900 text-sm">
                          {item.value} {item.unit}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({item.value >= districtMetricSet.incheonAverage ? '+' : ''}
                          {(item.value - districtMetricSet.incheonAverage).toFixed(1)})
                        </span>
                      </div>
                    </div>

                    {/* Bar visualization */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      {/* Incheon Average guideline */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-10"
                        style={{ left: `${avgPct}%` }}
                        title={`인천 전체 평균: ${districtMetricSet.incheonAverage}${item.unit}`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isFocus
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-xs'
                            : item.value >= districtMetricSet.incheonAverage
                            ? 'bg-blue-600'
                            : 'bg-blue-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Academic Insight & 1-Click Action to 4P Project */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-950 block">
                  학술 통계 분석 및 탐구 시사점
                </span>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  {districtMetricSet.insight}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  출처: {districtMetricSet.source}
                </span>
              </div>
            </div>

            {onInjectToProject && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200/60">
                <span className="text-xs font-semibold text-slate-600">이 통계를 내 4P에 인용:</span>
                <button
                  type="button"
                  onClick={() => {
                    const citation = `[인천 10개 군·구 공공통계] ${districtMetricSet.title}: 인천 전체 평균은 ${districtMetricSet.incheonAverage}${districtMetricSet.unit}이며, ${districtMetricSet.insight}`;
                    onInjectToProject('phenomenon', citation);
                    handleCopyText('p1-incheon-stat', citation);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                >
                  {copiedKey === 'p1-incheon-stat' ? <Check className="w-3 h-3 text-emerald-600" /> : <ChevronRight className="w-3 h-3 text-blue-600" />}
                  <span>P1(현상)에 넣기</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const citation = `[인천 군·구 비교 분석 과업] ${districtMetricSet.title} 데이터를 기반으로 군·구별 편차(${districtMetricSet.data[0].district} vs ${districtMetricSet.data[1].district})의 원인을 전공 방법론으로 검증함.`;
                    onInjectToProject('project', citation);
                    handleCopyText('p3-incheon-stat', citation);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                >
                  {copiedKey === 'p3-incheon-stat' ? <Check className="w-3 h-3 text-emerald-600" /> : <ChevronRight className="w-3 h-3 text-purple-600" />}
                  <span>P3(과업)에 넣기</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 3: 읽·걷·쓰 학술 활동 밸런스 도넛 차트 (Donut Chart)
       * ========================================================================= */}
      {(activeTab === 'balance' || activeTab === 'all') && (
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                  READ · WALK · WRITE BALANCE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  인천 교육청 고유 교육철학
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-1">
                읽·걷·쓰 3대 학술 탐구 활동 균형 도넛 차트
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                도서·논문 탐독(읽기), 현장 답사·사색(걷기), 4P 논리화 및 성찰(쓰기)의 유기적 비율을 분석합니다.
              </p>
            </div>

            <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold shrink-0">
              {balance.assessmentTitle}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Donut Visual */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="relative w-[200px] h-[200px]">
                <svg
                  viewBox="0 0 240 240"
                  className="w-full h-full -rotate-90 transform drop-shadow-xs"
                >
                  {/* Background Circle */}
                  <circle
                    cx={donutCx}
                    cy={donutCy}
                    r={donutR}
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth={strokeWidth}
                  />

                  {/* 1. Read Segment (Amber) */}
                  <circle
                    cx={donutCx}
                    cy={donutCy}
                    r={donutR}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${readStroke} ${circumference}`}
                    strokeDashoffset={readOffset}
                    className="transition-all duration-700"
                  />

                  {/* 2. Walk Segment (Emerald) */}
                  <circle
                    cx={donutCx}
                    cy={donutCy}
                    r={donutR}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${walkStroke} ${circumference}`}
                    strokeDashoffset={walkOffset}
                    className="transition-all duration-700"
                  />

                  {/* 3. Write Segment (Indigo) */}
                  <circle
                    cx={donutCx}
                    cy={donutCy}
                    r={donutR}
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${writeStroke} ${circumference}`}
                    strokeDashoffset={writeOffset}
                    className="transition-all duration-700"
                  />
                </svg>

                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">융합 지수</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {balance.totalScore}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold">100점 만점</span>
                </div>
              </div>
            </div>

            {/* 3 Breakdown Cards */}
            <div className="md:col-span-7 space-y-3">
              {/* 1. Read (Amber) */}
              <div className="p-3 rounded-xl border border-amber-200/90 bg-amber-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-amber-950">다각도 읽기 (Read)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900 font-bold">
                        {balance.readPct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      도서·논문·기사·영상 기록 <strong>{balance.readCount}건</strong> 등록
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-900 font-mono">
                  {balance.readScore}점
                </span>
              </div>

              {/* 2. Walk (Emerald) */}
              <div className="p-3 rounded-xl border border-emerald-200/90 bg-emerald-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Footprints className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-emerald-950">현장 사색 (Walk)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200/70 text-emerald-900 font-bold">
                        {balance.walkPct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      답사 <strong>{balance.walkCount}회</strong> · 누적 <strong>{balance.totalSteps.toLocaleString()}보</strong>
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-900 font-mono">
                  {balance.walkScore}점
                </span>
              </div>

              {/* 3. Write (Indigo) */}
              <div className="p-3 rounded-xl border border-indigo-200/90 bg-indigo-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                    <PenTool className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-indigo-950">학술 논리화 (Write)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200/70 text-indigo-900 font-bold">
                        {balance.writePct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      4P 서술 총 <strong>{balance.totalBytes.toLocaleString()} Byte</strong> (생기부 최적 규격)
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-indigo-900 font-mono">
                  {balance.writeScore}점
                </span>
              </div>

              {/* Balance Evaluation Advice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                💡 <strong>교사용 탐구 지도 조언:</strong> {balance.assessmentDesc}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AcademicInquiryChartsModalProps {
  project: ResearchProject;
  isOpen: boolean;
  onClose: () => void;
  onInjectToProject?: (step: 'phenomenon' | 'problem' | 'project' | 'practice', text: string) => void;
}

export const AcademicInquiryChartsModal: React.FC<AcademicInquiryChartsModalProps> = ({
  project,
  isOpen,
  onClose,
  onInjectToProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-indigo-300 uppercase">
                  ACADEMIC VISUAL ANALYTICS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  인천 읽·걷·쓰 시각화 스튜디오
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                4P 학술 탐구 시각화 분석 그래프
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="차트 인쇄"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto grow bg-slate-50/50">
          <AcademicChartsView project={project} onInjectToProject={onInjectToProject} />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 rounded-b-3xl">
          <span>
            연구자: <strong>{project.author || '학생연구자'}</strong> ({project.schoolName || '인천'}) · 전공: {project.labId}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
