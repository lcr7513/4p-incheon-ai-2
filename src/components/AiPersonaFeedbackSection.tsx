import React, { useState } from 'react';
import {
  Users,
  Store,
  TreePine,
  Building2,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ThumbsUp,
  RefreshCw,
  CheckCircle2,
  FileText,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  Scale,
  Compass,
  Accessibility,
  Cpu,
  Leaf,
  Activity,
  Palette,
  HeartHandshake,
  Lightbulb,
} from 'lucide-react';
import { ResearchProject, StakeholderPersonaFeedback, LabId, PersonaReviewItem } from '../types';

interface AiPersonaFeedbackSectionProps {
  project: ResearchProject;
  onChangeProject: (updated: Partial<ResearchProject>) => void;
  onNavigateTab?: (tab: any) => void;
}

const LAB_TITLES: Record<LabId, { name: string; personas: [string, string, string] }> = {
  humanities: {
    name: '인문·사회과학 Lab',
    personas: ['원도심 어르신 당사자 (76세)', '인권·디지털포용 시민활동가', '인천시 스마트도시복지과 주무관'],
  },
  business: {
    name: '경영·경제·빅데이터 Lab',
    personas: ['원도심 골목 상인회장', '기후소비자연대 협동조합 대표', '인천시 소상공인정책과 주무관'],
  },
  tech: {
    name: 'IT·공학·스마트도시 Lab',
    personas: ['교통약자 전동휠체어 이용자 대표', '온디바이스 AI·SW 아키텍트', '인천시 도로안전과 스마트인프라관'],
  },
  science: {
    name: '자연생태·해양환경 Lab',
    personas: ['소래포구 어촌계 어민 대표', '인천환경운동연합 갯벌생태위원장', '인천시 환경안전기후국 주무관'],
  },
  bio: {
    name: '보건·의료·생명과학 Lab',
    personas: ['청소년 학생·학부모 대표', '수면신경생리학자 / 학교 보건교사', '인천시교육청 학생건강증진과 장학관'],
  },
  education: {
    name: '교육·문화·디자인 Lab',
    personas: ['다문화 중도입국 학부모 대표', '유니버설 공간디자이너 / 교수', '인천시교육청 미래교육공간과 장학관'],
  },
};

export const AiPersonaFeedbackSection: React.FC<AiPersonaFeedbackSectionProps> = ({
  project,
  onChangeProject,
  onNavigateTab,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<StakeholderPersonaFeedback | null>(
    project.personaFeedback || null
  );
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const currentLabMeta = LAB_TITLES[project.labId] || LAB_TITLES.humanities;

  const handleRunPersonaFeedback = async () => {
    setIsLoading(true);
    setAppliedNotice(null);
    try {
      const res = await fetch('/api/gemini/persona-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labId: project.labId,
          labName: currentLabMeta.name,
          title: project.title,
          mainQuestion: project.mainQuestion,
          phenomenon: project.fourP.phenomenon,
          problem: project.fourP.problem,
          project: project.fourP.project,
          practice: project.fourP.practice,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const result: StakeholderPersonaFeedback = {
          ...json.data,
          labId: project.labId,
          isFallback: Boolean(json.isFallback),
        };
        setFeedback(result);
        onChangeProject({ personaFeedback: result });
      } else {
        throw new Error('이해관계자 피드백을 수신하지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Persona feedback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const p1: PersonaReviewItem | undefined = feedback?.persona1 || feedback?.merchant;
  const p2: PersonaReviewItem | undefined = feedback?.persona2 || feedback?.environmental;
  const p3: PersonaReviewItem | undefined = feedback?.persona3 || feedback?.official;

  const handleApplyAdviceToP4 = () => {
    if (!feedback || !p1 || !p2 || !p3) return;
    const currentP4 = project.fourP.practice || '';

    // Dynamic tailored revision based on what was suggested or field-specific synthesis
    const revisionSnippet = feedback.suggestedP4Revision
      ? `\n\n[AI 3자 이해관계자 피드백 반영 및 실천 고도화]\n${feedback.suggestedP4Revision}`
      : `\n\n[AI 3자 이해관계자 피드백 반영 및 실천 고도화]\n1) ${p1.name} 제언 반영: 현장 당사자 접근성 및 체감 실효성을 강화하는 보완 조치 마련.\n2) ${p2.name} 제언 반영: 학술적·생태적·윤리적 맹점을 방지하는 모니터링 기준 수립.\n3) ${p3.name} 제언 반영: 인천시/교육청 조례 개정 청원 및 민·관·학 협력 거버넌스 협의체 구성 추진.`;

    const updatedP4 = currentP4 ? `${currentP4}${revisionSnippet}` : revisionSnippet.trim();
    onChangeProject({
      fourP: {
        ...project.fourP,
        practice: updatedP4,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    });

    setAppliedNotice('세 이해관계자의 보완 제언이 [P4. 실천] 계획에 성공적으로 덧붙여졌습니다!');
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  const getReactionBadge = (reaction: string) => {
    switch (reaction) {
      case '적극 지지':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case '조건부 찬성':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const renderPersonaIcon = (iconName?: string, defaultFallback: React.ReactNode = <Users className="w-5 h-5" />) => {
    switch (iconName) {
      case 'Store':
        return <Store className="w-5 h-5" />;
      case 'TreePine':
        return <TreePine className="w-5 h-5" />;
      case 'Accessibility':
        return <Accessibility className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5" />;
      case 'Building2':
        return <Building2 className="w-5 h-5" />;
      case 'Users':
      default:
        return defaultFallback;
    }
  };

  const hasStudentWritten4P = Boolean(
    (project.fourP.project && project.fourP.project.trim().length > 10) ||
    (project.fourP.practice && project.fourP.practice.trim().length > 10)
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl border border-indigo-900/60">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-amber-300 border border-white/20 backdrop-blur-md">
              <Users className="w-3.5 h-3.5" />
              <span>AI 다각적 이해관계자(페르소나) 검증 시뮬레이터</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              {currentLabMeta.name} 맞춤형
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            학생 해결책(P3 과업 · P4 실천) 3자 현장 검증
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            학생이 수립한 연구과업과 실천안을 <strong className="text-amber-300">[{currentLabMeta.personas[0]}]</strong>, <strong className="text-emerald-300">[{currentLabMeta.personas[1]}]</strong>, <strong className="text-sky-300">[{currentLabMeta.personas[2]}]</strong>의 시선에서 다각도로 검증하여 맹점과 정책 딜레마를 짚어냅니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunPersonaFeedback}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>3인 페르소나 심사 시뮬레이션 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>3인 페르소나 다각도 검증 실행</span>
            </>
          )}
        </button>
      </div>

      {/* Input Guidance Banner */}
      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
        hasStudentWritten4P
          ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-center gap-2">
          {hasStudentWritten4P ? (
            <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>
            {hasStudentWritten4P ? (
              <>
                <strong>학생 맞춤형 피드백 활성화:</strong> 작성하신 P3 과업과 P4 실천 문장을 직접 분석하여 세 페르소나가 구체적인 찬반 논거와 송곳 질문을 제기합니다.
              </>
            ) : (
              <>
                <strong>안내:</strong> 현재 P3(과업) 또는 P4(실천) 작성이 초기 상태입니다. 학생 본인의 아이디어를 구체적으로 적을수록 더 정밀한 1:1 맞춤 피드백을 받으실 수 있습니다.
              </>
            )}
          </span>
        </div>
        {feedback && (
          <span className="text-[11px] font-bold text-slate-400 shrink-0">
            {feedback.isFallback ? '⚡ 스마트 휴리스틱 모드' : '🤖 Gemini 정밀 분석'}
          </span>
        )}
      </div>

      {appliedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {appliedNotice}
          </span>
          <span className="text-[11px] text-emerald-300 font-normal">P4 실천란 실시간 업데이트됨</span>
        </div>
      )}

      {/* When feedback exists */}
      {feedback && p1 && p2 && p3 ? (
        <div className="space-y-6 animate-in fade-in">
          {/* 3 Persona Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Persona 1: Direct Stakeholder / Beneficiary */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-amber-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                      {renderPersonaIcon(p1.avatarIcon, <Users className="w-5 h-5" />)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-300">{p1.name}</h4>
                      <p className="text-[10px] text-slate-400">{p1.role}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getReactionBadge(p1.reaction)}`}>
                    {p1.reaction}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      당사자 입장에서 반가운 점:
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed font-normal">
                      {p1.strengths}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      현장 체감 우려 및 맹점:
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed font-normal">
                      {p1.concerns}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sharp Question Box */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs">
                <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  당사자의 날카로운 질문:
                </span>
                <p className="text-amber-100 mt-1 font-semibold leading-relaxed">
                  "{p1.sharpQuestion}"
                </p>
              </div>
            </div>

            {/* Persona 2: Expert / Civic Organization */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-emerald-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                      {renderPersonaIcon(p2.avatarIcon, <TreePine className="w-5 h-5" />)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-300">{p2.name}</h4>
                      <p className="text-[10px] text-slate-400">{p2.role}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getReactionBadge(p2.reaction)}`}>
                    {p2.reaction}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      전문·가치 관점에서 지지하는 점:
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed font-normal">
                      {p2.strengths}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      전문가 관점의 맹점 및 간과된 위험:
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed font-normal">
                      {p2.concerns}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sharp Question Box */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                <span className="text-[10px] font-black text-emerald-300 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  전문가의 날카로운 질문:
                </span>
                <p className="text-emerald-100 mt-1 font-semibold leading-relaxed">
                  "{p2.sharpQuestion}"
                </p>
              </div>
            </div>

            {/* Persona 3: City / Education Office Public Official */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-sky-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                      {renderPersonaIcon(p3.avatarIcon, <Building2 className="w-5 h-5" />)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-sky-300">{p3.name}</h4>
                      <p className="text-[10px] text-slate-400">{p3.role}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getReactionBadge(p3.reaction)}`}>
                    {p3.reaction}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      정책·행정 방향과 부합하는 포인트:
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed font-normal">
                      {p3.strengths}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      조례·예산·집행의 행정 난관:
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed font-normal">
                      {p3.concerns}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sharp Question Box */}
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs">
                <span className="text-[10px] font-black text-sky-300 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  행정 실무관의 날카로운 질문:
                </span>
                <p className="text-sky-100 mt-1 font-semibold leading-relaxed">
                  "{p3.sharpQuestion}"
                </p>
              </div>
            </div>
          </div>

          {/* Synthesis Advice & 1-Click Action Footer */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 border border-indigo-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-300" />
                <h5 className="text-xs sm:text-sm font-black text-white">
                  종합 처방: 3대 이해충돌 조율 및 정책 업그레이드 방향
                </h5>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed font-normal">
                {feedback.synthesisAdvice}
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyAdviceToP4}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 font-black text-xs shadow-md transition-all shrink-0 active:scale-95"
            >
              <FileText className="w-4 h-4 text-indigo-700" />
              <span>보완 제언을 P4 실천란에 반영하기</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Prompt State */
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
          <p className="text-xs sm:text-sm text-slate-300">
            현재 선택된 <strong>[{currentLabMeta.name}]</strong>의 현장 당사자, 전문 연구자/시민단체, 지자체·교육청 공무원 3인의 시뮬레이션을 실행하여 학생의 4P 계획서를 다각도로 검증해 보세요.
          </p>
          <button
            type="button"
            onClick={handleRunPersonaFeedback}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>지금 3자 이해관계자 검증 시작</span>
          </button>
        </div>
      )}
    </div>
  );
};

