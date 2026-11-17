import React from 'react';
import {
  FlaskConical,
  BookOpen,
  Footprints,
  BarChart3,
  PenTool,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ResearchProject, ActiveTab } from '../types';

interface ResearchProgressStepperProps {
  project: ResearchProject;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenGoogleSheetsExport?: () => void;
  onOpenPreview?: () => void;
  compact?: boolean;
}

export const ResearchProgressStepper: React.FC<ResearchProgressStepperProps> = ({
  project,
  onNavigateTab,
  onOpenGoogleSheetsExport,
  onOpenPreview,
  compact = false,
}) => {
  // Step 1: Lab chosen
  const isStep1Done = Boolean(project.labId);

  // Step 2: Reading logs
  const isStep2Done = Boolean(project.readingLogs && project.readingLogs.length > 0);

  // Step 3: Walking logs
  const isStep3Done = Boolean(project.walkingLogs && project.walkingLogs.length > 0);

  // Step 4: Data statistics
  const dataRegex = /(\d+(\.\d+)?%|\d+명|\d+건|\d+개소|\d+원|통계|공공데이터|kosis|대기질|고령화)/i;
  const isStep4Done = Boolean(
    dataRegex.test(project.fourP?.phenomenon || '') ||
    dataRegex.test(project.fourP?.problem || '') ||
    project.checklistProgress?.dataLinked
  );

  // Step 5: 4P written (each >= 30 chars)
  const p1Ok = (project.fourP?.phenomenon || '').trim().length >= 30;
  const p2Ok = (project.fourP?.problem || '').trim().length >= 30;
  const p3Ok = (project.fourP?.project || '').trim().length >= 30;
  const p4Ok = (project.fourP?.practice || '').trim().length >= 30;
  const isStep5Done = p1Ok && p2Ok && p3Ok && p4Ok;

  // Step 6: AI evaluation or persona feedback
  const isStep6Done = Boolean(project.evaluationResult || project.personaFeedback);

  // Step 7: Final report & Google Sheets submission
  const isStep7Done = Boolean(project.submittedToTeacher);

  const steps = [
    {
      stepNum: 1,
      title: '6대 전공 연구실 선정',
      sub: '진로 맞춤형 탐구 주제 수립',
      isCompleted: isStep1Done,
      targetTab: 'labs' as ActiveTab,
      icon: FlaskConical,
      color: 'blue',
    },
    {
      stepNum: 2,
      title: '전공 도서·논문 읽기',
      sub: `${project.readingLogs?.length || 0}건 문헌 탐독 & 출처 규격화`,
      isCompleted: isStep2Done,
      targetTab: 'workspace' as ActiveTab,
      icon: BookOpen,
      color: 'indigo',
    },
    {
      stepNum: 3,
      title: '인천 현장 답사 걷기',
      sub: `${project.walkingLogs?.length || 0}건 답사 사색 노트 기록`,
      isCompleted: isStep3Done,
      targetTab: 'walking-mind' as ActiveTab,
      icon: Footprints,
      color: 'emerald',
    },
    {
      stepNum: 4,
      title: '인천 공공데이터 통계 분석',
      sub: isStep4Done ? '통계 및 실증 수치 인용 완료' : '인천 10개 군·구 통계 연계 필요',
      isCompleted: isStep4Done,
      targetTab: 'experimental-lab' as ActiveTab,
      icon: BarChart3,
      color: 'violet',
    },
    {
      stepNum: 5,
      title: '4P 탐구계획서 쓰기',
      sub: `P1~P4 ${[p1Ok, p2Ok, p3Ok, p4Ok].filter(Boolean).length}/4개 항목 충실 작성`,
      isCompleted: isStep5Done,
      targetTab: 'workspace' as ActiveTab,
      icon: PenTool,
      color: 'amber',
    },
    {
      stepNum: 6,
      title: 'AI 질문 평가 & 3인 피드백',
      sub: project.evaluationResult ? `AI 종합 점수 ${project.evaluationResult.totalScore}점 달성` : 'AI 멘토 채점 및 페르소나 검증',
      isCompleted: isStep6Done,
      targetTab: 'ai-evaluator' as ActiveTab,
      icon: Sparkles,
      color: 'purple',
    },
    {
      stepNum: 7,
      title: '최종 보고서 & 구글 시트 제출',
      sub: isStep7Done ? '선생님 마스터 시트 제출 완료' : 'A4/포스터 출력 및 과제 제출',
      isCompleted: isStep7Done,
      targetTab: 'workspace' as ActiveTab,
      icon: FileSpreadsheet,
      color: 'teal',
      onClickCustom: onOpenGoogleSheetsExport,
    },
  ];

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Find first incomplete step
  const nextStep = steps.find((s) => !s.isCompleted);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
              읽·걷·쓰 7단계 탐구 프로세스
            </span>
            <span className="text-xs font-bold text-slate-500">
              {completedCount} / {steps.length} 단계 달성
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
            실시간 7단계 탐구 진행도 & 완료 로드맵
          </h3>
        </div>

        {/* Progress Bar & Percent */}
        <div className="flex items-center gap-3">
          <div className="w-32 sm:w-44 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 p-0.5">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-sm sm:text-base font-black text-blue-700 min-w-[3rem] text-right">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Recommended Next Step Callout */}
      {nextStep && (
        <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white rounded-xl border border-blue-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-blue-900 mr-1.5">💡 지금 추천하는 다음 작업:</span>
              <span className="font-extrabold text-slate-900">
                STEP {nextStep.stepNum}. {nextStep.title}
              </span>
              <span className="text-slate-500 ml-1.5 hidden md:inline">({nextStep.sub})</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (nextStep.onClickCustom) {
                nextStep.onClickCustom();
              } else {
                onNavigateTab(nextStep.targetTab);
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shrink-0 shadow-2xs"
          >
            <span>이어서 진행하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stepper Grid (7 Steps) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <button
              key={st.stepNum}
              type="button"
              onClick={() => {
                if (st.onClickCustom) {
                  st.onClickCustom();
                } else {
                  onNavigateTab(st.targetTab);
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                st.isCompleted
                  ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      st.isCompleted
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    STEP {st.stepNum}
                  </span>
                  {st.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-1 text-slate-900 group-hover:text-blue-700 transition-colors">
                  <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-blue-600" />
                  <span className="font-extrabold text-xs line-clamp-1">{st.title}</span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {st.sub}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-blue-600">
                <span>{st.isCompleted ? '완료 (보기)' : '진행하기'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
