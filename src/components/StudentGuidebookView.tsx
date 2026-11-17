import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  BookOpen,
  FlaskConical,
  PenTool,
  Beaker,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  Footprints,
  Lock,
  Layers,
  GraduationCap,
  Copy,
  Check,
  Target,
  FileText,
} from 'lucide-react';
import { ActiveTab, LabId } from '../types';
import { LABS_DATA } from '../data/labsData';

interface StudentGuidebookViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onApplyLabExample?: (labId: LabId) => void;
}

export const StudentGuidebookView: React.FC<StudentGuidebookViewProps> = ({
  onNavigateTab,
  onApplyLabExample,
}) => {
  const [activeSection, setActiveSection] = useState<
    'roadmap' | '4p-secret' | 'features' | 'submit-guide' | 'faq'
  >('roadmap');

  const [active4PTab, setActive4PTab] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P1');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [copiedTip, setCopiedTip] = useState(false);

  const roadmapSteps = [
    {
      step: 'STEP 1',
      title: '나의 진로에 맞는 전공 연구실 고르기',
      desc: '경영·경제, 인문·철학, 첨단IT·공학, 기초과학·환경, 바이오·의료, 교육·사회 중 자신의 희망 학과와 관련된 연구실을 선택합니다.',
      targetTab: 'labs' as ActiveTab,
      btnText: '6대 연구실 탐색 바로가기',
      icon: FlaskConical,
      color: 'bg-blue-500',
    },
    {
      step: 'STEP 2',
      title: '완성형 모범 탐구 예시로 감 잡기',
      desc: '선배 연구원들의 완성형 4P 연구계획서를 [원클릭 즉시 불러오기]로 확인해 보세요. 연구 질문이 어떻게 도출되는지 한눈에 배울 수 있습니다.',
      targetTab: 'workspace' as ActiveTab,
      btnText: '모범 예시 확인하기',
      icon: Lightbulb,
      color: 'bg-indigo-500',
    },
    {
      step: 'STEP 3',
      title: '실험용 Lab에서 공공데이터 & 인천 답사지 엮기',
      desc: '인천 10개 군·구 통계(대기질, 인구, 산업)와 21종 공공데이터포털 자료를 조회한 뒤 [계획서에 넣기]를 눌러 객관적 사실 데이터를 확보합니다.',
      targetTab: 'experimental-lab' as ActiveTab,
      btnText: '실험용 Lab 데이터 둘러보기',
      icon: Beaker,
      color: 'bg-violet-500',
    },
    {
      step: 'STEP 4',
      title: '4P 연구계획서 직접 작성 및 다듬기',
      desc: 'P1(현상) → P2(문제원인) → P3(전공과업) → P4(실천방안)의 논리적 사다리를 따라 나의 탐구 질문을 구체적인 글로 완성합니다.',
      targetTab: 'workspace' as ActiveTab,
      btnText: '4P 계획서 작성하기',
      icon: PenTool,
      color: 'bg-emerald-500',
    },
    {
      step: 'STEP 5',
      title: 'AI 질문 평가 & 3인 페르소나의 날카로운 질문에 방어하기',
      desc: 'AI 멘토에게 100점 만점 질문 평가를 받고, 가상 전문가 3인(학자, 정책관, 현장주민)의 반론에 대응하여 계획서 P4를 탄탄하게 보완합니다.',
      targetTab: 'ai-evaluator' as ActiveTab,
      btnText: 'AI 질문 평가받기',
      icon: Sparkles,
      color: 'bg-amber-500',
    },
    {
      step: 'STEP 6',
      title: '선생님 구글 시트로 1초 만에 안전 제출하기',
      desc: '학교명, 학번, 이름을 입력하고 [구글 시트 과제 제출] 클릭! 다른 학생에게는 내 글이 비공개 처리되니 안심하고 제출하세요.',
      targetTab: 'workspace' as ActiveTab,
      btnText: '과제 제출 창 열기',
      icon: FileSpreadsheet,
      color: 'bg-emerald-600',
    },
  ];

  const fourPComparison = {
    P1: {
      name: 'P1. 현상 (Phenomenon)',
      subtitle: '“어떤 사실적 현상이 실제로 일어나고 있는가?”',
      core: '내 주관적인 느낌이 아니라, 통계·뉴스·현장 답사에서 관찰한 객관적 팩트(Fact)를 기술합니다.',
      bad: '“요즘 길거리에 무인 매장이 많이 생겨서 어르신들이 키오스크를 쓰기 매우 힘들어하는 것 같다.” (단순 개인 느낌 서술)',
      good: '“2026년 인천 원도심 무인 매장 40곳 현장 전수조사 결과, 82.5%가 휠체어 및 고령자 높이 조절 불가였으며, 키오스크 이용 포기율이 64%에 달했다. (인천일보 2026.04 보도 및 현장답사 데이터 인용)”',
      tip: '💡 [실험용 Lab]의 인천 지역 통계나 [8대 걷기 탐구]에서 관찰한 실제 수치나 사례를 1개 이상 반드시 인용하세요!',
    },
    P2: {
      name: 'P2. 문제원인 (Problem)',
      subtitle: '“이것이 왜 방치할 수 없는 사회적 모순이며 진짜 원인은 무엇인가?”',
      core: '개인의 탓으로 돌리지 않고, 제도·시스템·기술·경제 구조의 구조적 원인을 파헤칩니다.',
      bad: '“어르신들이 최신 디지털 기기에 익숙하지 않고 배우려고 하지 않는 것이 문제다.” (피해자 개인에게 원인 전가)',
      good: '“기업의 인건비 절감 중심 급진적 무인화 추진과 지자체의 디지털 기본권 보장 조례 미비가 결합하여, 고령층의 생필품 구매와 공공서비스 접근을 원천 차단하는 디지털 소외와 사회적 배제 구조를 고착화하고 있다.”',
      tip: '💡 “이 문제가 지속되면 사회 전체에 어떤 비용이나 불평등이 생기는가?”를 강조하면 점수가 급상승합니다!',
    },
    P3: {
      name: 'P3. 과업 (Project / Task)',
      subtitle: '“내 진로/전공 학문은 이 문제를 어떻게 학술적으로 접근하는가?”',
      core: '단순한 소망이 아니라, 전공 이론(경영학, 컴퓨터공학, 환경학 등)과 구체적인 연구 방법(설문, 실험, 데이터 분석)을 제시합니다.',
      bad: '“노인들을 위한 디지털 교육을 열심히 시키고 캠페인을 벌여보겠다.” (전공 학문성과 연구 방법론 부재)',
      good: '“기술수용모델(TAM)과 유니버설 디자인(Universal Design) 7대 원칙을 프레임워크로 삼아, 인천 중구 노인복지관 이용자 60명을 대상으로 시선 추적(Eye-tracking) 및 간편 모드 UI 프로토타입 사용성(A/B Test)을 실증 분석한다.”',
      tip: '💡 교과서나 전공 서적에서 배운 이론 명칭(예: 엣지 센싱, 공간 기호학, 혐기성 소화, 사회적 자본 등)을 당당하게 언급하세요!',
    },
    P4: {
      name: 'P4. 실천 (Practice)',
      subtitle: '“연구 결과를 바탕으로 우리는 현실에서 무엇을 직접 실천할 것인가?”',
      core: '“정부가 해주세요”로 끝내지 않고, 학교·지역사회·프로토타입 개발 등 학생 수준에서 직접 실행 가능한 액션을 명시합니다.',
      bad: '“정부와 기업이 반성하고 좋은 기계를 많이 만들어주었으면 좋겠다.” (남에게 떠넘기는 수동적 결론)',
      good: '“학생회 주도로 인천 동구청에 ‘디지털 취약계층 포용 키오스크 인증제’ 조례 제정 시민 청원서를 제출하고, 교내 프로그래밍 동아리와 함께 시니어 친화 간편 주문 웹앱 프로토타입을 제작하여 관내 전통시장 10개 점포에 무상 배포한다.”',
      tip: '💡 [3인 페르소나 검증]에서 전문가들이 지적한 예산, 반발, 현실적 한계에 대한 해결책을 P4에 녹여내면 최고의 계획서가 됩니다!',
    },
  };

  const faqs = [
    {
      q: '작성 도중에 컴퓨터가 꺼지거나 창을 닫으면 내용이 날아가나요?',
      a: '걱정하지 마세요! 본 애플리케이션은 학생이 글을 쓸 때마다 웹 브라우저의 안전한 로컬 저장소에 실시간 자동 저장됩니다. 또한 상단의 [저장] 버튼을 누르면 언제든 즉시 저장되며, [백업 다운로드]로 JSON 파일 보관도 가능합니다.',
    },
    {
      q: 'AI 평가 점수가 70점대로 낮게 나왔는데 어떻게 해야 하나요?',
      a: '점수가 낮다고 낙담할 필요가 전혀 없습니다! AI 평가는 채점이 아니라 ‘성장 가이드’입니다. 평가 결과에 나오는 [멘토 총평]과 [추천 심화 질문]을 읽고, P1에 구체적 수치를 더하거나 P3에 연구 방법을 보완한 뒤 [AI 질문 평가받기]를 다시 누르면 90점 이상으로 점수가 쑥쑥 올라갑니다.',
    },
    {
      q: '3인 페르소나가 너무 매섭고 곤란한 질문을 던져요!',
      a: '바로 그 질문이 학생의 생기부를 특별하게 만들어주는 황금 열쇠입니다! 정책 공무원이나 상인 대표의 날카로운 비판 질문을 읽고, “이런 반론이 있을 수 있으므로 P4에서 다음과 같은 보완책을 마련했다”고 계획서에 한 줄 추가해 보세요. 대학 입학사정관이 가장 높게 평가하는 ‘비판적 수용력’과 ‘문제 해결력’이 입증됩니다.',
    },
    {
      q: '선생님 구글 시트로 제출하면 다른 친구들이 내 글을 볼 수 있나요?',
      a: '절대 볼 수 없습니다! 🔒 철저한 보안 모드가 적용되어 있어, 학생이 제출한 내용은 오직 지도교사 선생님의 마스터 구글 시트로만 안전하게 암호화 전송됩니다. 학생 화면에서는 선생님 시트 주소와 다른 학생 데이터가 100% 차단되니 안심하고 제출하세요.',
    },
    {
      q: '선생님께 제출한 뒤 내 개인 구글 드라이브에도 보관하고 싶어요.',
      a: '선생님께 먼저 [과제 제출]을 완료하신 후, 모달 창 상단에서 [내 드라이브에 새 시트] 탭을 선택하고 한 번 더 버튼을 누르면 본인 구글 드라이브에도 16개 열 서식이 깔끔하게 적용된 개인 시트가 생성됩니다. 대입 포트폴리오로 영구 소장하기에 최고입니다.',
    },
    {
      q: '학교명과 학번을 꼭 적어야 하나요?',
      a: '네, 꼭 적어주세요! 선생님 구글 시트에는 여러 학급과 동아리 학생들이 한 줄씩 모이기 때문에, 학교명과 학번, 이름을 정확히 적지 않으면 선생님께서 누구의 훌륭한 탐구 보고서인지 찾기 어렵습니다.',
    },
    {
      q: '종이로 인쇄해서 발표하거나 파일로 제출하고 싶어요.',
      a: '우측 상단의 [연구자료 인쇄/다운로드] 버튼을 누르시면, 깔끔한 보고서 양식의 [브라우저 인쇄 / PDF 저장], 모든 데이터가 정리된 [엑셀 시트(.xls) 저장], [Markdown], [TXT] 등 원하는 파일 형태로 즉시 내려받을 수 있습니다.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-700/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>고등학생을 위한 4P 전공연계 사회문제탐구 공식 가이드</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            처음이어도 10분 만에 끝내는
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
              읽·걷·쓰 심화탐구 완벽 사용설명서
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            무엇을 써야 할지 막막한가요? 연구실 고르기부터 4P 작성 비법, 공공데이터 인용, 3인 페르소나
            검증, 그리고 선생님 구글 시트 원클릭 제출까지 차근차근 따라와 보세요!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('workspace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>바로 탐구 시작하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('4p-secret')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs sm:text-sm backdrop-blur-xs transition-all"
            >
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <span>4P 고득점 작성 비법 보기</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Badges */}
        <div className="absolute -right-8 -bottom-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-12 top-10 hidden md:flex flex-col gap-3 opacity-90">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-500/30 text-blue-200 font-bold">6대</span>
            <div>
              <div className="font-extrabold text-white">전공 연구실 연계</div>
              <div className="text-[11px] text-slate-300">내 진로 맞춤형 모범 예시</div>
            </div>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/30 text-emerald-200 font-bold">16개</span>
            <div>
              <div className="font-extrabold text-white">구글 시트 1행 제출</div>
              <div className="text-[11px] text-slate-300">선생님 마스터 시트 원클릭 연동</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Section Selector */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200">
        {[
          { id: 'roadmap', label: '🚀 6단계 전체 탐구 로드맵', icon: Compass },
          { id: '4p-secret', label: '💡 4P 작성 비법 (좋은 예 vs 나쁜 예)', icon: Target },
          { id: 'features', label: '🔬 핵심 기능 200% 활용법', icon: Sparkles },
          { id: 'submit-guide', label: '📤 선생님 구글 시트 제출 가이드', icon: FileSpreadsheet },
          { id: 'faq', label: '❓ 자주 묻는 질문 (FAQ)', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section Content Display */}

      {/* SECTION 1: ROADMAP */}
      {activeSection === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" />
                <span>Step-by-Step Navigation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                6단계로 끝내는 4P 사회문제탐구 여정
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                처음 탐구를 시작하는 학생은 아래 1단계부터 6단계까지 순서대로 진행하면 완성도 높은 보고서를 만들 수 있습니다.
              </p>
            </div>

            {/* 4P Visual Flowchart Poster Graphic */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-slate-50">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 bg-white">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>4P 읽·걷·쓰 전공연계 탐구 전체 흐름 순서도 (인포그래픽)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    연구실 선정부터 읽기, 걷기, 공공데이터, 4P 작성, AI 검증, 최종 제출까지 7단계 전주기 인포그래픽 포스터입니다.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <a
                    href="/4P_읽걷쓰_탐구_전체흐름_순서도.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <span>웹 순서도 전문 열기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="/images/incheon_4p_flowchart.jpg"
                    download="인천_4P_읽걷쓰_탐구_순서도_포스터.jpg"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <span>포스터 다운로드</span>
                  </a>
                </div>
              </div>
              <div className="p-2 sm:p-4 bg-slate-100/60">
                <img
                  src="/images/incheon_4p_flowchart.jpg"
                  alt="4P 읽걷쓰 전공연계 탐구 전체 흐름 순서도 포스터"
                  className="w-full h-auto rounded-xl shadow-xs border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {roadmapSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-md bg-slate-900 text-white">
                          {step.step}
                        </span>
                        <div className={`p-2 rounded-xl text-white ${step.color} shadow-xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {step.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200/70">
                      <button
                        type="button"
                        onClick={() => onNavigateTab(step.targetTab)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors w-full justify-between"
                      >
                        <span>{step.btnText}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 4P SECRET (COMPARISON) */}
      {activeSection === '4p-secret' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Target className="w-4 h-4" />
                <span>4P High-Score Writing Strategy</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                4P 프레임워크 작성 비법: 좋은 예 vs 나쁜 예
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                P1부터 P4까지 무엇을 써야 할지 막막할 때 아래 비교 카드를 참고해 보세요. 학생부 세특 기록의 깊이가 달라집니다.
              </p>
            </div>

            {/* 4P Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['P1', 'P2', 'P3', 'P4'] as const).map((stage) => {
                const isSelected = active4PTab === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setActive4PTab(stage)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/30 font-black'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <div className="text-xs">{stage} 단계</div>
                    <div className="text-xs truncate">
                      {stage === 'P1'
                        ? '현상(사실)'
                        : stage === 'P2'
                        ? '문제(원인)'
                        : stage === 'P3'
                        ? '과업(방법론)'
                        : '실천(변화)'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Card */}
            {(() => {
              const current = fourPComparison[active4PTab];
              return (
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 sm:p-8 space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white">
                        {active4PTab} 단계 심층 해부
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-slate-900">{current.name}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-indigo-950 font-bold mt-2">{current.subtitle}</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{current.core}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bad Example */}
                    <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-950 space-y-2">
                      <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>❌ 흔한 오해 (낮은 평가를 받는 서술)</span>
                      </div>
                      <p className="text-xs sm:text-[13px] leading-relaxed text-rose-900 bg-white/80 p-3 rounded-xl border border-rose-100">
                        {current.bad}
                      </p>
                    </div>

                    {/* Good Example */}
                    <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-emerald-950 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>⭕ 고득점 세특 비결 (훌륭한 심화 탐구 서술)</span>
                      </div>
                      <p className="text-xs sm:text-[13px] leading-relaxed text-emerald-900 bg-white/90 p-3 rounded-xl border border-emerald-200">
                        {current.good}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{current.tip}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SECTION 3: KEY FEATURES 200% */}
      {activeSection === 'features' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Supercharged Tools for Students</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                앱의 강력한 4대 핵심 기능 200% 활용법
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                글만 쓰는 사이트가 아닙니다! 공공데이터, 가상 전문가 피드백, 걷기 사색 스팟을 적극적으로 활용해 보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  1
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  완성형 모범 탐구 6종 [원클릭 즉시 불러오기]
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  [4P 연구계획서] 탭 상단에서 내 진로 연구실을 클릭하면 완성된 모범 계획서가 워크스페이스에 즉시 로드됩니다.
                  제목, P1~P4, 독서, 걷기 기록이 어떻게 서로 맞물리는지 직접 확인하고 나만의 글로 바꿔보세요.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('workspace')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 pt-1"
                >
                  <span>워크스페이스 가기</span> &rarr;
                </button>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-black">
                  2
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  실험용 Lab의 공공데이터·통계 [계획서에 넣기]
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  [실험용 Lab] 탭에서는 인천 10개 군·구 통계(대기질 미세먼지, 고령화율, 산업체수)와 21종 공공데이터포털 정보를
                  실시간 조회할 수 있습니다. [계획서에 넣기] 버튼을 누르면 P1, P2에 객관적 수치가 자동으로 삽입됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('experimental-lab')}
                  className="text-xs font-bold text-violet-600 hover:text-violet-800 inline-flex items-center gap-1 pt-1"
                >
                  <span>실험용 Lab 바로가기</span> &rarr;
                </button>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  3
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  3인 페르소나의 날카로운 질문 격파하기
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  연구계획서 하단의 [3인 페르소나 다각도 검증]을 실행하면, 학자, 공무원, 주민 당사자가 등장하여 내 연구의 취약점과 반론 질문을 던집니다.
                  이 질문에 대한 해결책을 P4(실천)에 적으면 심사위원이나 선생님께 압도적인 칭찬을 받게 됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('workspace')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1 pt-1"
                >
                  <span>페르소나 검증 체험하기</span> &rarr;
                </button>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
                  4
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  인천 8대 걷기·현장탐구 스팟 연결
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  개항장, 송도 바이오단지, 소래포구 등 전공 연계 현장 스팟을 살펴보고 [사색 노트]를 기록해 보세요.
                  방구석에서 책만 본 연구가 아니라 ‘발로 직접 뛴 현장 탐구’로 인정받아 읽걷쓰 철학에 완벽히 부합합니다.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('walking-mind')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 pt-1"
                >
                  <span>8대 걷기 탐구 둘러보기</span> &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SUBMIT GUIDE */}
      {activeSection === 'submit-guide' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Assignment Submission Walkthrough</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                선생님 구글 시트로 1초 만에 안전 제출하기
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                작성한 탐구 계획서를 선생님의 마스터 구글 시트로 안전하게 전송하는 3단계 방법입니다.
              </p>
            </div>

            {/* Step Cards */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="grow space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    우측 상단 초록색 [구글 시트 과제 제출] 버튼 클릭
                  </h4>
                  <p className="text-xs text-slate-500">
                    화면 상단 네비게이션 바나 [4P 연구계획서] 탭 상단에 위치한 초록색 버튼을 클릭합니다.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="grow space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    학교명, 학번, 이름이 정확히 적혀 있는지 확인
                  </h4>
                  <p className="text-xs text-slate-500">
                    선생님 시트에서 학생 구분을 위해 <strong>학교명</strong>(예: 인천하늘고등학교), <strong>학번</strong>(예: 20415), <strong>이름</strong>을 꼭 확인해 주세요.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div className="grow space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    [선생님 시트로 과제 제출하기] 클릭 & 구글 로그인 1회 승인
                  </h4>
                  <p className="text-xs text-slate-500">
                    선생님이 지정하신 공식 취합 시트가 기본 선택되어 있습니다. 버튼을 누르고 구글 로그인을 거치면 선생님 시트 맨 아래에 1개 행(16개 항목)으로 즉시 저장됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-black text-sm text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>🔒 학생 개인정보 및 연구 데이터 완전 보호 안내</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                제출 후 학생 화면에는 선생님 시트의 URL이나 다른 학생 데이터가 전혀 노출되지 않습니다.
                선생님만 전용 비밀번호로 열람할 수 있는 안전한 보안 시스템이 적용되어 있으니, 안심하고 여러분의 멋진 아이디어를 제출하세요!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: FAQ */}
      {activeSection === 'faq' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                학생들이 가장 자주 묻는 질문 BEST 7
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                탐구 도중 궁금한 점이 생겼을 때 아래 질문을 클릭하여 답변을 확인해 보세요.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isExpanded = expandedFaqIndex === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-slate-200 overflow-hidden transition-all bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                      className="w-full p-4.5 text-left font-extrabold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                          Q
                        </span>
                        <span>{faq.q}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-4.5 pt-0 text-xs sm:text-[13px] text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Call To Action Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-lg font-black tracking-tight">이제 직접 탐구를 시작해 볼까요?</h4>
          <p className="text-xs sm:text-sm text-slate-300">
            6대 전공 연구실의 모범 예시를 둘러보거나 나만의 4P 연구계획서를 작성해 보세요!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onNavigateTab('labs')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all w-full sm:w-auto text-center"
          >
            6대 연구실 탐색
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('workspace')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all w-full sm:w-auto text-center"
          >
            4P 계획서 작성하기 &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
