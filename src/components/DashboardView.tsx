import React from 'react';
import {
  BookOpen,
  Footprints,
  PenTool,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Award,
  TrendingUp,
  Compass,
  FileText,
  Cpu,
  Leaf,
  Activity,
  Palette,
  FolderOpen,
  Share2,
} from 'lucide-react';
import { ResearchProject, ActiveTab, LabId } from '../types';
import { LABS_DATA } from '../data/labsData';
import { LAB_MODEL_PROJECTS } from '../data/archiveData';
import { ResearchProgressStepper } from './ResearchProgressStepper';

interface DashboardViewProps {
  project: ResearchProject;
  onNavigate: (tab: ActiveTab) => void;
  onOpenPreview: () => void;
  onLoadLabModelExample?: (labId: LabId) => void;
  onOpenShareModal?: () => void;
  onOpenGoogleSheetsExport?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  onNavigate,
  onOpenPreview,
  onLoadLabModelExample,
  onOpenShareModal,
  onOpenGoogleSheetsExport,
}) => {
  const currentLab = LABS_DATA.find((l) => l.id === project.labId) || LABS_DATA[0];

  // Calculate 4P completions
  const p1Filled = (project.fourP.phenomenon || '').trim().length > 30;
  const p2Filled = (project.fourP.problem || '').trim().length > 30;
  const p3Filled = (project.fourP.project || '').trim().length > 30;
  const p4Filled = (project.fourP.practice || '').trim().length > 30;
  const completedSteps = [p1Filled, p2Filled, p3Filled, p4Filled].filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / 4) * 100);

  // Total reading, walking, writing metrics
  const totalSteps = project.walkingLogs.reduce((acc, cur) => acc + (cur.steps || 0), 0);
  const totalWalkMinutes = project.walkingLogs.reduce((acc, cur) => acc + (cur.durationMinutes || 0), 0);
  const totalReadCount = project.readingLogs.length;
  const totalWords =
    (project.fourP.phenomenon?.length || 0) +
    (project.fourP.problem?.length || 0) +
    (project.fourP.project?.length || 0) +
    (project.fourP.practice?.length || 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner / Project Overview */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <FlaskConical className="w-3.5 h-3.5" />
                {currentLab.name}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {project.affiliation || '학교명 미입력'} · {project.author || '학생연구원'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {project.title || '4P 전공연계 사회문제탐구'}
            </h2>
            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
              <span className="font-semibold text-indigo-300">탐구 질문:</span> {project.mainQuestion || '아직 핵심 질문이 작성되지 않았습니다.'}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t border-slate-800 md:border-t-0">
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 block font-medium">4P 탐구 완성도</span>
              <span className="text-3xl font-extrabold tracking-tight text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onOpenShareModal && (
                <button
                  id="btn-dash-share"
                  onClick={onOpenShareModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  title="학생 공유용 웹 링크 & QR 코드"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>학생 공유 링크·QR</span>
                </button>
              )}
              <button
                id="btn-dash-workspace"
                onClick={() => onNavigate('workspace')}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <span>계획서 작성</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 1: Real-time 7-Step Research Progress Stepper */}
      <ResearchProgressStepper
        project={project}
        onNavigateTab={onNavigate}
        onOpenGoogleSheetsExport={onOpenGoogleSheetsExport}
        onOpenPreview={onOpenPreview}
      />

      {/* Student Guidebook Quick Link Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-slate-900">
                처음 탐구를 시작하는 학생인가요?
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                필독 가이드
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              6단계 로드맵, 4P(현상-문제-과업-실천) 좋은 예 vs 나쁜 예 비교, 선생님 구글 시트 과제 제출법까지 한눈에 확인하세요!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('guide')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <span>학생 탐구 가이드북 보기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Read - Walk - Write Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Read */}
        <div
          onClick={() => onNavigate('labs')}
          className="group cursor-pointer bg-white rounded-xl p-5 border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              읽기 (Read)
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-500">참고 문헌 & 탐독 자료</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{totalReadCount}</span>
              <span className="text-xs text-slate-500">권/편 수록</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 line-clamp-1 group-hover:text-amber-700 transition-colors">
              {currentLab.recommendedReadings[0]?.title} 등 6대 전공 필독서 &rarr;
            </p>
          </div>
        </div>

        {/* Walk */}
        <div
          onClick={() => onNavigate('walking-mind')}
          className="group cursor-pointer bg-white rounded-xl p-5 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Footprints className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              걷기 (Walk)
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-500">사색 걸음 & 몰입 시간</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{totalSteps.toLocaleString()}</span>
              <span className="text-xs text-slate-500">걸음 ({totalWalkMinutes}분)</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {project.walkingLogs.length}건의 현장 사색 기록 &rarr;
            </p>
          </div>
        </div>

        {/* Write */}
        <div
          onClick={() => onNavigate('workspace')}
          className="group cursor-pointer bg-white rounded-xl p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              쓰기 (Write)
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-500">4P 탐구 보고서 분량</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{totalWords.toLocaleString()}</span>
              <span className="text-xs text-slate-500">자 작성됨</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 line-clamp-1 group-hover:text-indigo-700 transition-colors">
              {project.evaluationResult ? `AI 종합 점수: ${project.evaluationResult.totalScore}점` : 'AI 질문 평가 대기중'} &rarr;
            </p>
          </div>
        </div>
      </div>

      {/* 4P Process Pipeline Visualizer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              4P 탐구 프로세스 진행 파이프라인
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              현상(포착)에서 시작해 문제(원인 규명), 과업(전공 연구), 실천(사회적 변화)으로 확장되는 4단계입니다.
            </p>
          </div>
          <button
            onClick={() => onNavigate('workspace')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            단계별 편집하기 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* P1: 현상 */}
          <div
            onClick={() => onNavigate('workspace')}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              p1Filled
                ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                P1. 현상
              </span>
              {p1Filled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900">Phenomenon (현상 포착)</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
              {project.fourP.phenomenon || '일상이나 사회에서 발견한 관찰 가능한 사실과 데이터 이슈를 기록하세요.'}
            </p>
          </div>

          {/* P2: 문제 */}
          <div
            onClick={() => onNavigate('workspace')}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              p2Filled
                ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                P2. 문제
              </span>
              {p2Filled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900">Problem (문제 정의)</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
              {project.fourP.problem || '왜 이것이 해결해야 할 사회적 문제인지 근본 원인과 갈등 구조를 분석하세요.'}
            </p>
          </div>

          {/* P3: 과업 */}
          <div
            onClick={() => onNavigate('workspace')}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              p3Filled
                ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white">
                P3. 과업
              </span>
              {p3Filled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900">Project / Task (전공 연구)</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
              {project.fourP.project || '전공 학문적 이론과 연구방법론(조사, 실험, 모델링)을 적용한 과업을 서술하세요.'}
            </p>
          </div>

          {/* P4: 실천 */}
          <div
            onClick={() => onNavigate('workspace')}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              p4Filled
                ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                P4. 실천
              </span>
              {p4Filled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900">Practice (사회적 실천)</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
              {project.fourP.practice || '학교, 지역사회, 제도, 기술 등 지속가능한 실천과 변화 방안을 제시하세요.'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: AI Feedback & Walking Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Question Evaluation Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI 질문 진단 및 발전 제안</h3>
                  <span className="text-xs text-slate-500">Gemini 연동 · 규칙 기반 안전 모드 지원</span>
                </div>
              </div>
              {project.evaluationResult && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  총점 {project.evaluationResult.totalScore}점
                </span>
              )}
            </div>

            {project.evaluationResult ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">멘토 총평:</p>
                  {project.evaluationResult.overallReview}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-800">추천 심화 질문 (Level 3):</span>
                  <p className="text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 font-medium leading-relaxed">
                    &ldquo;{project.evaluationResult.questionUpgrades[2]?.question || project.evaluationResult.questionUpgrades[1]?.question}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                <p className="text-xs">아직 작성한 탐구 계획서의 AI 평가를 받지 않았습니다.</p>
                <p className="text-[11px] text-slate-400 mt-1">질문과 4P 내용을 AI로 진단받고 학술적 질문으로 발전시켜보세요.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('ai-evaluator')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>AI 평가 및 추천 센터 열기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenPreview}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>보고서 미리보기</span>
            </button>
          </div>
        </div>

        {/* Right: Latest Walking Contemplation Log */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">최근 걷기 사색 메모</h3>
                  <span className="text-xs text-slate-500">발로 뛰며 생각하는 탐구의 힘</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('walking-mind')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                + 새 사색 기록
              </button>
            </div>

            {project.walkingLogs.length > 0 ? (
              <div className="space-y-3">
                {project.walkingLogs.slice(0, 2).map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">{log.courseName}</span>
                      <span>{log.date} · {log.steps.toLocaleString()}보</span>
                    </div>
                    <p className="text-slate-700 italic leading-relaxed line-clamp-2">
                      &ldquo;{log.thoughtNote}&rdquo;
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="px-1.5 py-0.5 bg-emerald-100/80 text-emerald-800 rounded font-medium">
                        {log.linked4PStep === 'general' ? '일반 사색' : `${log.linked4PStep} 단계 연계`}
                      </span>
                      <span>몰입도: {'★'.repeat(log.focusScore)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                <p className="text-xs">아직 기록된 걷기 사색 일지가 없습니다.</p>
                <p className="text-[11px] text-slate-400 mt-1">산책을 하며 떠오른 사색과 아이디어를 기록해보세요.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('walking-mind')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>걷기-연구 몰입도 시각화 차트 보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6-Lab Full Exemplars Showcase Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <FolderOpen className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                6대 전공 연구실별 완성형 모범 탐구 예시 (읽·걷·쓰 통합본)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              인문사회, 경영경제, 공학IT, 자연생태, 바이오보건, 교육문화 6개 연구실의 실제 작성 모범 계획서를 1클릭으로 탐색하고 워크스페이스에 불러올 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => onNavigate('archive')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0 flex items-center gap-1"
          >
            <span>전체 아카이브 보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {LABS_DATA.map((lab) => {
            const model = LAB_MODEL_PROJECTS[lab.id];
            const isCurrent = project.labId === lab.id;

            const iconMap: Record<string, any> = {
              BookOpen: BookOpen,
              TrendingUp: TrendingUp,
              Cpu: Cpu,
              Leaf: Leaf,
              Activity: Activity,
              Palette: Palette,
            };
            const Icon = iconMap[lab.iconName] || BookOpen;

            return (
              <div
                key={lab.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/40 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${lab.badgeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{lab.name}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-2xs">
                        내 연구 적용중
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">{lab.badge}</span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-1 mb-1.5">
                    {model.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    <strong className="text-indigo-600">질문:</strong> {model.mainQuestion}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 bg-white/70 p-2 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">작성: </span>
                      <span>{model.author}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">소속: </span>
                      <span className="truncate">{model.affiliation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    평가 {model.evaluationResult?.totalScore || 94}점 (A등급)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onLoadLabModelExample) {
                        onLoadLabModelExample(lab.id);
                      } else {
                        onNavigate('workspace');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1"
                  >
                    <span>예시 불러오기</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
