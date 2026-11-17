import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  History,
  HelpCircle,
  FileText,
  CheckCircle2,
  RefreshCw,
  Scale,
  TreePine,
  Flame,
  Users,
  Building2,
  Compass,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { ResearchProject, AiDataCorrelationInsight } from '../types';
import { INCHEON_10_DISTRICTS } from '../data/incheonStatsData';

interface AiDataCorrelationSectionProps {
  project: ResearchProject;
  onUpdateProject?: (updated: Partial<ResearchProject>) => void;
  onNavigateTab?: (tab: any) => void;
}

interface ComparisonPreset {
  id: string;
  badge: string;
  title: string;
  districtA: string;
  indicatorA: string;
  districtB: string;
  indicatorB: string;
  summary: string;
}

const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'preset-green-heat',
    badge: '🌟 심사 추천 / 공간 불평등',
    title: '송도국제도시 1인당 녹지면적 vs 동구 도심 열섬·고령화',
    districtA: '연수구(송도)',
    indicatorA: '1인당 도시공원면적 28.4㎡ (인천 최고), 녹지율 32%',
    districtB: '동구',
    indicatorB: '1인당 공원면적 3.8㎡ (인천 최저), 여름철 열섬일수 14일, 고령화율 24.8%',
    summary: '간척 계획도시(21C)와 근대 개항 자연발생 구도심(19C)의 형성 시기 차이에서 비롯된 기후·공간 불평등',
  },
  {
    id: 'preset-youth-elderly',
    badge: '👥 인구 구조 / 학령인구',
    title: '연수구 청년층 인구 vs 미추홀구 초고령화·인구 소멸 위험',
    districtA: '연수구(송도)',
    indicatorA: '청년 비율 23.8%, 유소년 비율 14.2%, 신설 초·중·고 과밀',
    districtB: '미추홀구',
    indicatorB: '고령화율 24.2%, 원도심 독거노인 1인 가구 36%, 학령인구 절벽',
    summary: '정주 여건(신축 주거·학군·첨단 일자리) 집중이 낳은 세대별 공간 분리와 원도심 공동화 메커니즘',
  },
  {
    id: 'preset-landfill-air',
    badge: '🏭 환경 외부효과 / 정의로운 전환',
    title: '서구 수도권매립지·폐기물 vs 부평구 공업단지 미세먼지',
    districtA: '서구(매립지·청라)',
    indicatorA: '수도권 폐기물 반입 처리, 대규모 자원순환 복합단지, 탄소 배출',
    districtB: '부평구',
    indicatorB: '노후 국가산업단지, 제조업 종사자 24%, 초미세먼지 21.4㎍/㎥',
    summary: '수도권 광역 기반시설 분담에 따른 환경 비용과 배후 주거지의 상생 거버넌스 과제',
  },
  {
    id: 'preset-eco-island',
    badge: '🌊 생태자산 / 탄소중립',
    title: '강화·옹진 서해 갯벌(블루카본) vs 중구 항만·항공 탄소배출',
    districtA: '강화군·옹진군',
    indicatorA: '생태자연도 1등급 갯벌 98점, 저어새 번식지, 탄소 흡수원',
    districtB: '중구(인천항·공항)',
    indicatorB: '국제공항 및 컨테이너 화물 물류, 1인당 온실가스 배출 12.8tCO2eq',
    summary: '탄소 다배출 글로벌 물류 거점과 천혜의 서해 생태 완충 지대 간의 탄소중립 균형 모델',
  },
];

export const AiDataCorrelationSection: React.FC<AiDataCorrelationSectionProps> = ({
  project,
  onUpdateProject,
  onNavigateTab,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-green-heat');
  const [districtA, setDistrictA] = useState<string>('연수구(송도)');
  const [indicatorA, setIndicatorA] = useState<string>('1인당 도시공원면적 28.4㎡ (인천 최고), 녹지율 32%');
  const [districtB, setDistrictB] = useState<string>('동구');
  const [indicatorB, setIndicatorB] = useState<string>('1인당 공원면적 3.8㎡ (인천 최저), 여름철 열섬일수 14일, 고령화율 24.8%');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [insight, setInsight] = useState<AiDataCorrelationInsight | null>(null);
  const [injectedMessage, setInjectedMessage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const handleSelectPreset = (preset: ComparisonPreset) => {
    setSelectedPresetId(preset.id);
    setIsCustomMode(false);
    setDistrictA(preset.districtA);
    setIndicatorA(preset.indicatorA);
    setDistrictB(preset.districtB);
    setIndicatorB(preset.indicatorB);
  };

  const handleRunAiAnalysis = async () => {
    setIsLoading(true);
    setInjectedMessage(null);
    try {
      const res = await fetch('/api/gemini/data-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicatorA,
          indicatorB,
          districtA,
          districtB,
          labName: project.title || '사회과 지역탐구',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setInsight({ ...json.data, isFallback: Boolean(json.isFallback) });
      } else {
        throw new Error('AI 데이터 분석 응답을 수신하지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Data insight fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInjectP1 = () => {
    if (!insight || !onUpdateProject) return;
    const current = project.fourP.phenomenon || '';
    const textToInject = `[AI 데이터 리터러시 지표 인용] ${insight.p1PhenomenonText}`;
    const updated = current ? `${current}\n\n${textToInject}` : textToInject;
    onUpdateProject({
      fourP: {
        ...project.fourP,
        phenomenon: updated,
      },
    });
    setInjectedMessage('4P 연구계획서 [P1. 현상]에 데이터 관찰 내용이 주입되었습니다!');
    setTimeout(() => setInjectedMessage(null), 3000);
  };

  const handleInjectP2 = () => {
    if (!insight || !onUpdateProject) return;
    const current = project.fourP.problem || '';
    const textToInject = `[AI 데이터 상관관계 분석 인용] ${insight.p2ProblemText}\n(역사·공간적 맥락: ${insight.historicalContext})`;
    const updated = current ? `${current}\n\n${textToInject}` : textToInject;
    onUpdateProject({
      fourP: {
        ...project.fourP,
        problem: updated,
      },
    });
    setInjectedMessage('4P 연구계획서 [P2. 문제원인]에 구조적 원인 분석이 주입되었습니다!');
    setTimeout(() => setInjectedMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-md overflow-hidden space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>2022 개정 사회과 공간 리터러시 & AI 융합</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            AI 데이터 패턴 & 상관관계 도출기
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            두 데이터 지표 간의 단순 수치 차이를 넘어, <strong className="text-indigo-600 font-bold">도시 형성사, 공간적 불평등, 사회적 메커니즘</strong>의 관점에서 AI가 심층 해석을 돕습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunAiAnalysis}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>AI 상관관계 분석 추론 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI 데이터 상관관계 분석 실행</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>사회과 수업용 추천 비교 데이터 세트 (클릭 시 자동 설정)</span>
          </span>
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
          >
            {isCustomMode ? '← 추천 프리셋 보기' : '직접 지역·지표 선택하기 →'}
          </button>
        </div>

        {!isCustomMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMPARISON_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-black text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      {preset.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1">{preset.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {preset.summary}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span className="text-blue-700">{preset.districtA}</span>
                    <span className="text-slate-400">vs</span>
                    <span className="text-rose-700">{preset.districtB}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom District Selector */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {/* Left: District A */}
            <div className="space-y-2">
              <label className="text-xs font-black text-blue-900 flex items-center gap-1">
                <span>비교 대상 지역 A</span>
              </label>
              <select
                value={districtA}
                onChange={(e) => setDistrictA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {INCHEON_10_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.regionType})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={indicatorA}
                onChange={(e) => setIndicatorA(e.target.value)}
                placeholder="지표 A 설명 (예: 1인당 공원면적 28.4㎡)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              />
            </div>

            {/* Right: District B */}
            <div className="space-y-2">
              <label className="text-xs font-black text-rose-900 flex items-center gap-1">
                <span>비교 대상 지역 B</span>
              </label>
              <select
                value={districtB}
                onChange={(e) => setDistrictB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {INCHEON_10_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.regionType})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={indicatorB}
                onChange={(e) => setIndicatorB(e.target.value)}
                placeholder="지표 B 설명 (예: 여름철 열섬현상 일수 14일, 고령화율 24%)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected Comparison Summary Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-bold text-slate-700">현재 비교 설정:</span>
          <span className="font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
            {districtA} ({indicatorA.slice(0, 30)}...)
          </span>
          <span className="font-bold text-slate-400">대조</span>
          <span className="font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
            {districtB} ({indicatorB.slice(0, 30)}...)
          </span>
        </div>

        <button
          onClick={handleRunAiAnalysis}
          disabled={isLoading}
          className="text-xs font-extrabold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 shrink-0"
        >
          <span>{isLoading ? '분석 중...' : '이 데이터로 AI 분석 →'}</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {injectedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {injectedMessage}
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

      {/* AI Output Card */}
      {insight && (
        <div className="space-y-5 pt-4 border-t border-slate-100 animate-in fade-in">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-base sm:text-lg font-black text-slate-900">{insight.title}</h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {insight.isFallback ? '규칙 기반 안전 모드 해석' : 'Gemini AI 사회과 추론'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Historical & Spatial Context */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                <History className="w-4 h-4 text-amber-700" />
                <span>1. 사회과적 형성 배경 및 도시사(歷史) 맥락</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {insight.historicalContext}
              </p>
            </div>

            {/* Card 2: Structural Mechanism Analysis */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-xs text-blue-900">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span>2. 데이터 격차 원인 및 사회적 메커니즘</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {insight.mechanismAnalysis}
              </p>
            </div>
          </div>

          {/* Card 3: 2022 Critical Thinking Prompts */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs text-indigo-950">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>3. 2022 개정 사회과 비판적 사고 촉진 질문 (수업 발문)</span>
              </div>
              <span className="text-[11px] text-indigo-700 font-bold">학생 토론 및 탐구 유도</span>
            </div>
            <div className="space-y-2">
              {insight.criticalThinkingPrompts.map((prompt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-indigo-100 text-xs font-semibold text-slate-800 flex items-start gap-2 shadow-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <span className="leading-relaxed">{prompt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: 1-Click Injection to 4P Inquiry */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h5 className="text-xs sm:text-sm font-black flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>4P 연구계획서에 AI 분석 내용 즉시 주입 (1-Click)</span>
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  단순 수합에 그치지 않고, AI가 도출한 해석을 학생의 계획서 P1과 P2에 바로 반영합니다.
                </p>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('workspace')}
                  className="text-xs text-indigo-300 hover:text-white underline font-bold shrink-0"
                >
                  4P 워크스페이스 가기 →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inject P1 */}
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-black text-amber-300">P1. 현상(Phenomenon) 주입용 문장:</span>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {insight.p1PhenomenonText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleInjectP1}
                  className="mt-3 w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>[P1 현상]에 1클릭 주입하기</span>
                </button>
              </div>

              {/* Inject P2 */}
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-black text-sky-300">P2. 문제원인(Problem) 주입용 문장:</span>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {insight.p2ProblemText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleInjectP2}
                  className="mt-3 w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>[P2 원인]에 1클릭 주입하기</span>
                </button>
              </div>
            </div>

            {/* Related Concepts Tags */}
            {insight.relatedConcepts && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-bold">사회과 핵심 개념어:</span>
                {insight.relatedConcepts.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-md bg-white/15 text-slate-300 text-[11px] font-semibold"
                  >
                    #{c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
