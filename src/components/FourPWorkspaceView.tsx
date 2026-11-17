import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Save,
  BookOpen,
  Footprints,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Beaker,
  Database,
  TrendingUp,
  Cpu,
  Leaf,
  Activity,
  Palette,
  FolderOpen,
  Check,
  FileSpreadsheet,
  Newspaper,
  Video,
  FileText,
  Paperclip,
  Upload,
  ExternalLink,
  Plus,
  Trash2,
  Link2,
  GraduationCap,
  Award,
  Search,
  Globe,
  Users,
  Copy,
  CheckCheck,
  ShieldCheck,
  CheckSquare,
  Square,
  BarChart3,
  ArrowRight,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { ResearchProject, FourPData, LabId, ReadingLog, ReadingMediaType, TeamMember } from '../types';
import { LABS_DATA } from '../data/labsData';
import { LAB_MODEL_PROJECTS } from '../data/archiveData';
import { autoDistributeFourP } from '../utils/fourPParser';
import { FOUR_P_CHECKLISTS } from '../utils/citationFormatter';
import { AiPersonaFeedbackSection } from './AiPersonaFeedbackSection';
import { StudentRecordHelperModal } from './StudentRecordHelperModal';
import { IncheonOpenDataModal } from './IncheonOpenDataModal';
import { AcademicInquiryChartsModal, AcademicChartsView } from './AcademicInquiryChartsModal';
import { AiStepAssistantModal } from './AiStepAssistantModal';

interface FourPWorkspaceViewProps {
  project: ResearchProject;
  onChangeProject: (updated: Partial<ResearchProject>) => void;
  onRequestAiEvaluation: () => void;
  onOpenPreview: () => void;
  onResetToDemo: () => void;
  onLoadLabModelExample?: (labId: LabId) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenGoogleSheetsExport?: () => void;
  onOpenTeacherDashboard?: () => void;
}

const LAB_GUIDE_PRESETS: Record<
  LabId,
  {
    titlePlaceholder: string;
    questionPlaceholder: string;
    p1Placeholder: string;
    p2Placeholder: string;
    p3Placeholder: string;
    p4Placeholder: string;
    icon: any;
    themeBg: string;
    badgeText: string;
  }
> = {
  humanities: {
    titlePlaceholder: '예: 초고령 사회 무인화 매장 확산에 따른 노인 디지털 기본권 침해와 포용적 공론장 설계',
    questionPlaceholder: '예: 무인화 기술 도입 과정에서 노인의 일상적 접근권과 자기결정권은 어떻게 보장될 수 있는가?',
    p1Placeholder: '예: 식음료점 및 공공기관의 키오스크 의무 도입으로 65세 이상 어르신의 이용 포기율이 68%에 달하며 소외가 가속화되는 현상 목격...',
    p2Placeholder: '예: 기술 효율성 지상주의로 인해 사용자 다양성을 고려하지 않은 UI/UX와 사회적 배제 구조가 심화되는 근본 원인 분석...',
    p3Placeholder: '예: 사회학적 배제 이론과 하버마스의 공론장 이론을 적용하여 노인 대상 심층 인터뷰(FGI) 및 이용 경로 질적 분석...',
    p4Placeholder: '예: 1) 청소년-어르신 1:1 디지털 동행 매뉴얼 제작, 2) 인천 원도심 상가 대상 ‘디지털 다정 가게’ 인증 캠페인 추진 및 조례 청원...',
    icon: BookOpen,
    themeBg: 'hover:border-amber-400 bg-amber-50/40',
    badgeText: '인문·사회',
  },
  business: {
    titlePlaceholder: '예: 원도심 소상공인 생존율 제고를 위한 ESG 로컬 앵커스토어 연계형 마일리지 순환경제 모델',
    questionPlaceholder: '예: 대기업 온라인 유통망에 맞서 지역 골목상권의 지속가능한 자생력을 높이는 상생 모델은 무엇인가?',
    p1Placeholder: '예: 원도심 핵심 상권 점포 10곳 중 4곳이 2년 내 폐업하고 2030 세대의 온라인 플랫폼 배달 소비가 85% 이상 집중되는 현상...',
    p2Placeholder: '예: 소상공인 개별 마케팅 역량 한계와 단발성 소비 쿠폰 지급의 재정 소모성으로 인한 자본 역외 유출 구조...',
    p3Placeholder: '예: 행동경제학의 손실 회피성과 소셜 프루프 이론을 기반으로, 앵커스토어 연계 번들형 마일리지 순환 알고리즘 시뮬레이션...',
    p4Placeholder: '예: 1) 신포-개항장 15개 매장 대상 ‘용기내 다회용기 스탬프 투어’ 시범 운영, 2) 구청 및 상인회 정책 간담회 개최...',
    icon: TrendingUp,
    themeBg: 'hover:border-emerald-400 bg-emerald-50/40',
    badgeText: '경영·경제',
  },
  tech: {
    titlePlaceholder: '예: 보행 약자(휠체어·유아차)를 위한 엣지 컴퓨터 비전 기반 스마트 보행로 단차·장애물 실시간 위험 매핑',
    questionPlaceholder: '예: 온디바이스 AI와 엣지 센싱 기술로 교통약자의 안전한 보행권을 어떻게 현실에서 구현할 것인가?',
    p1Placeholder: '예: 통학로 반경 1km 내 횡단보도 단차(2cm 초과), 파손 점자블록 등으로 인해 전동휠체어가 차도로 위험하게 우회하는 현상 관측...',
    p2Placeholder: '예: 기존 보행 내비게이션의 도로 단차/노면 균열 미반영으로 인한 이동 약자의 안전사고 및 이동권 불평등 발생...',
    p3Placeholder: '예: 라즈베리파이와 경량 객체 탐지 모델(YOLOv11-Nano)을 탑재하여 보행 장애물을 3단계 위험도로 실시간 분류하는 알고리즘 구현...',
    p4Placeholder: '예: 1) 주요 통학로 보행 위험도 현장 실사(15,000보) 오픈 API 배포, 2) 장애인자립생활센터 실증 및 시청 도로안전과 공문 송부...',
    icon: Cpu,
    themeBg: 'hover:border-blue-400 bg-blue-50/40',
    badgeText: '공학·AI',
  },
  science: {
    titlePlaceholder: '예: 인천 소래습지 갯벌의 토양 깊이별 총유기탄소(TOC) 저장량 산정과 염생식물의 블루카본 기여도 평가',
    questionPlaceholder: '예: 서해안 연안 습지 갯벌의 생태 복원은 기후변화 탄소 격리에 어느 정도의 과학적 기여를 하는가?',
    p1Placeholder: '예: 연안 간척 및 개발로 칠면초, 갈대 군락이 급감하며 갯벌의 자연 탄소 흡수원 기능이 축소되는 현상 관찰...',
    p2Placeholder: '예: 산림 그린카본 대비 연안 습지 블루카본의 중요성에 대한 시민 인식 부족으로 인한 보존 정책 소외...',
    p3Placeholder: '예: 소래습지 자연 식생지 vs 복원지 vs 나지 토양 시료를 심도별 채취하여 강열감량법(LOI) 및 TOC 정량 분석 ANOVA 검정...',
    p4Placeholder: '예: 1) 청소년 블루카본 인포그래픽 리포트 500부 제작 교내 기증, 2) 인천 갯벌 세계유산 등재 촉구 학생 서명 및 플로깅 전개...',
    icon: Leaf,
    themeBg: 'hover:border-teal-400 bg-teal-50/40',
    badgeText: '자연·생태',
  },
  bio: {
    titlePlaceholder: '예: 고등학생의 취침 전 스마트폰 블루라이트 노출 시간과 멜라토닌 리듬 및 주간 인지 피로도의 상관성 연구',
    questionPlaceholder: '예: 심야 전자기기 스크린 사용이 청소년의 수면 생체시계와 학업 인지 집중력에 미치는 생리학적 기전은 무엇인가?',
    p1Placeholder: '예: 학생 84%가 소등 후 74분간 스마트폰을 사용하며, 1교시 수업 시간 심한 졸림과 두통, 안구건조증을 호소하는 현상...',
    p2Placeholder: '예: 수면 부족을 개인 의지 탓으로만 치부하여 뇌신경계 발달 및 일주기 생체리듬(Circadian Rhythm) 교란의 심각성을 간과...',
    p3Placeholder: '예: 스마트밴드를 통한 3주간 수면 단계 모니터링과 주간 단어 기억력 및 스트룹 검사(Stroop Test) 코호트 추적 관찰...',
    p4Placeholder: '예: 1) 교내 ‘취침 1시간 전 폰 오프 & 걷기 사색 3주 챌린지’ 운영, 2) 학교 보건실 협력 청소년 수면위생 포스터 전 학급 게시...',
    icon: Activity,
    themeBg: 'hover:border-rose-400 bg-rose-50/40',
    badgeText: '바이오·보건',
  },
  education: {
    titlePlaceholder: '예: 다문화 밀집 지역 중학생의 학교 소속감 증진을 위한 픽토그램 유니버설 공간 디자인 넛지 개발',
    questionPlaceholder: '예: 다언어·다문화 환경에서 언어 장벽을 넘어 모든 학생의 심리적 안정과 배움을 보장하는 공간 설계는?',
    p1Placeholder: '예: 다문화 학생 비율 35% 학교에서 텍스트 위주 한국어 안내판으로 인해 중도입국 학생들이 특별실 이용을 기피하고 고립되는 현상...',
    p2Placeholder: '예: 학교 물리적 공간이 다문화 학생의 시각적 눈높이를 배려하지 못해 발생하는 심리적 위축과 소속감 저하...',
    p3Placeholder: '예: 자기결정성 이론과 유니버설 디자인 7원칙 기반, 다문화 및 비다문화 학생 80명 대상 공간 인지도 및 픽토그램 A/B 테스트...',
    p4Placeholder: '예: 1) 다문화 학생과 공동 개발한 ‘친절한 학교 픽토그램 12종’ 스티커 교내 부착, 2) 교육청 공간혁신 공모전 제안서 출품...',
    icon: Palette,
    themeBg: 'hover:border-purple-400 bg-purple-50/40',
    badgeText: '교육·예술',
  },
};

export const FourPWorkspaceView: React.FC<FourPWorkspaceViewProps> = ({
  project,
  onChangeProject,
  onRequestAiEvaluation,
  onOpenPreview,
  onResetToDemo,
  onLoadLabModelExample,
  onNavigateTab,
  onOpenGoogleSheetsExport,
  onOpenTeacherDashboard,
}) => {
  const [activeStep, setActiveStep] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P1');
  const [savedToast, setSavedToast] = useState(false);
  const [exemplarToast, setExemplarToast] = useState<string | null>(null);
  const [copiedNeis, setCopiedNeis] = useState(false);
  const [showNeisModal, setShowNeisModal] = useState(false);
  const [showOpenDataModal, setShowOpenDataModal] = useState(false);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [showInlineCharts, setShowInlineCharts] = useState(false);
  const [showAiStepModal, setShowAiStepModal] = useState(false);
  const [aiStepTarget, setAiStepTarget] = useState<'phenomenon' | 'problem' | 'project' | 'practice'>('phenomenon');
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Watch project changes to reflect real-time auto-saving
  React.useEffect(() => {
    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      setAutoSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 350);
    return () => clearTimeout(timer);
  }, [project]);

  // Keyboard shortcut Ctrl+S / Cmd+S handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [openChecklists, setOpenChecklists] = useState<Record<string, boolean>>({
    P1: true,
    P2: false,
    P3: false,
    P4: false,
  });

  const handleToggleChecklistItem = (itemId: string) => {
    const currentProgress = project.checklistProgress || {};
    const newProgress = {
      ...currentProgress,
      [itemId]: !currentProgress[itemId],
    };
    onChangeProject({
      checklistProgress: newProgress,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  // NEIS Byte Length Calculator (한글 3B, 영문/숫자/공백 1B, 줄바꿈 2B)
  const getNeisByteLength = (text: string = '') => {
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code === 10) {
        bytes += 2; // NEIS newline
      } else if (code > 127) {
        bytes += 3; // Korean/CJK
      } else {
        bytes += 1; // ASCII / space
      }
    }
    return bytes;
  };

  const handleCopyNeisMemo = () => {
    const textToCopy = project.teacherMemo?.trim() || generateSynthesizedMemo();
    navigator.clipboard.writeText(textToCopy);
    setCopiedNeis(true);
    setTimeout(() => setCopiedNeis(false), 2200);
  };

  const generateSynthesizedMemo = () => {
    const labName = LABS_DATA.find((l) => l.id === project.labId)?.name || '전공';
    const topic = project.title || '사회문제 탐구';
    const question = project.mainQuestion ? ` "${project.mainQuestion}"라는 핵심 질문을 탐구함.` : '';
    const effort = project.effortNotes
      ? ` 특히 탐구 과정에서 "${project.effortNotes.slice(0, 70)}..."와 같이 난관을 주도적으로 극복하는 과업 수행력이 돋보임.`
      : '';
    const growth = project.growthNotes
      ? ` 탐구 후 "${project.growthNotes.slice(0, 70)}..."라는 통찰과 성장을 기록함.`
      : '';
    return `[${labName}] '${topic}'을 주제로 4P 탐구 프레임워크를 적용하여 심층 탐구를 수행함.${question}${effort}${growth}`;
  };

  const handleApplySynthesizedMemo = () => {
    const draft = generateSynthesizedMemo();
    onChangeProject({ teacherMemo: draft, updatedAt: new Date().toISOString().split('T')[0] });
  };

  // Active reading portal tab: 'all' | 'news' | 'video' | 'paper' | 'book'
  const [activeReadingTab, setActiveReadingTab] = useState<'all' | 'news' | 'video' | 'paper' | 'book'>('all');
  const [readingSearchQuery, setReadingSearchQuery] = useState<string>('');

  const currentLab = LABS_DATA.find((l) => l.id === project.labId) || LABS_DATA[0];
  const activeGuide = LAB_GUIDE_PRESETS[project.labId] || LAB_GUIDE_PRESETS.humanities;

  const handleFourPChange = (field: keyof FourPData, value: string) => {
    onChangeProject({
      fourP: {
        ...project.fourP,
        [field]: value,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleSave = () => {
    setAutoSaveStatus('saved');
    setLastSavedTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleLoadLabExemplar = (labId: LabId) => {
    const targetModel = LAB_MODEL_PROJECTS[labId];
    if (!targetModel) return;

    if (onLoadLabModelExample) {
      onLoadLabModelExample(labId);
    } else {
      onChangeProject({
        ...targetModel,
        isDemo: true,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }

    const labName = LABS_DATA.find((l) => l.id === labId)?.name || labId;
    setExemplarToast(`[${labName}] 완성형 모범 탐구 예시를 워크스페이스에 불러왔습니다!`);
    setTimeout(() => setExemplarToast(null), 3000);
  };

  const handleAddReadingLog = (mediaType: ReadingMediaType = 'book') => {
    const today = new Date().toISOString().split('T')[0];
    const defaultCategories: Record<ReadingMediaType, string> = {
      book: '도서·단행본',
      paper: '학술논문·연구보고서',
      news: '신문기사·시사보도',
      video: '유튜브·영상다큐',
    };
    const newLog: ReadingLog = {
      id: `read-${Date.now()}`,
      title: '',
      author: '',
      category: defaultCategories[mediaType],
      readingNotes: '',
      date: today,
      mediaType,
      sourceOrg: '',
      timestampOrPage: '',
      url: '',
      linked4PStep: 'P1',
    };
    onChangeProject({
      readingLogs: [...(project.readingLogs || []), newLog],
      updatedAt: today,
    });
  };

  const handleUpdateReadingLog = (id: string, field: keyof ReadingLog, value: any) => {
    const updated = (project.readingLogs || []).map((r) => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    });
    onChangeProject({ readingLogs: updated, updatedAt: new Date().toISOString().split('T')[0] });
  };

  const handleRemoveReadingLog = (id: string) => {
    const updated = (project.readingLogs || []).filter((r) => r.id !== id);
    onChangeProject({ readingLogs: updated, updatedAt: new Date().toISOString().split('T')[0] });
  };

  const handleAttachmentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
          : `${Math.round(file.size / 1024)}KB`;
      onChangeProject({
        attachmentName: `${file.name} (${sizeStr})`,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  };

  const stepsConfig = [
    {
      id: 'P1' as const,
      field: 'phenomenon' as const,
      title: 'P1. 현상 (Phenomenon)',
      subtitle: '일상과 사회에서 포착한 사실적 데이터 및 관찰 현상',
      guide: [
        '“어떤 현상이 일어나고 있는가?” 구체적인 사실(Fact)을 기술하세요.',
        '신문 기사, 지역 통계, 학교 일상에서 직접 목격하거나 조사한 수치를 인용하면 좋습니다.',
        '걷기(현장 답사)를 통해 직접 관찰한 구체적 공간과 사람들의 모습을 기록하세요.',
      ],
      placeholder: activeGuide.p1Placeholder,
      color: 'border-indigo-500 text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'P2' as const,
      field: 'problem' as const,
      title: 'P2. 문제 (Problem)',
      subtitle: '현상 이면의 구조적 모순, 원인 분석 및 해결의 당위성',
      guide: [
        '“이것이 왜 방치할 수 없는 사회적 문제인가?” 근본 원인을 분석하세요.',
        '개인의 부주의나 우연이 아니라, 제도, 문화, 기술, 자본 등 구조적 메커니즘을 밝히세요.',
        '이 문제가 지속될 경우 발생할 사회적 비용이나 인권, 불평등 문제를 짚어보세요.',
      ],
      placeholder: activeGuide.p2Placeholder,
      color: 'border-blue-500 text-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'P3' as const,
      field: 'project' as const,
      title: 'P3. 과업 (Project / Task)',
      subtitle: '전공 학문적 이론과 연구방법론을 적용한 해결 탐구 과제',
      guide: [
        '“선택한 전공 학문에서는 이 문제를 어떻게 접근하고 규명할 수 있는가?”',
        '전공 관련 이론(예: 사회학의 배제 이론, 공학의 엣지 센싱, 환경학의 탄소 분석 등)을 명시하세요.',
        '구체적인 연구 방법(설문조사, 심층 인터뷰, 실험, A/B 테스트, 데이터 분석)을 계획하세요.',
      ],
      placeholder: activeGuide.p3Placeholder,
      color: 'border-purple-500 text-purple-600',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'P4' as const,
      field: 'practice' as const,
      title: 'P4. 실천 (Practice)',
      subtitle: '학교, 지역사회, 제도, 기술 등 구체적인 실천과 지속가능한 변화',
      guide: [
        '“우리는 연구 결과를 바탕으로 무엇을 직접 실천할 것인가?”',
        '단순 제언에 그치지 않고, 학교 내 캠페인, 조례 청원, 앱 프로토타입 배포, 봉사활동 등 실행 가능한 액션을 적으세요.',
        '지역사회 유관기관(지자체, 상인회, 학교 등)과의 연계 방안을 포함하세요.',
      ],
      placeholder: activeGuide.p4Placeholder,
      color: 'border-emerald-500 text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 6-Lab Exemplars 1-Click Selector Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <FolderOpen className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>6대 전공 연구실별 완성형 모범 탐구 예시</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  원클릭 즉시 불러오기
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                학생의 전공 분야 버튼을 클릭하면 해당 연구실의 실제 작성 모범 계획서(4P, 질문, 걷기·도서 일지)가 자동 적용됩니다.
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('archive')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold shrink-0"
            >
              아카이브에서 6종 전체 비교 &rarr;
            </button>
          )}
        </div>

        {/* 6 Lab Quick Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {LABS_DATA.map((lab) => {
            const isCurrent = project.labId === lab.id;
            const modelProj = LAB_MODEL_PROJECTS[lab.id];
            const preset = LAB_GUIDE_PRESETS[lab.id];
            const IconComp = preset.icon;

            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => handleLoadLabExemplar(lab.id)}
                className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                }`}
                title={`[${lab.name}] 모범 예시 불러오기:\n${modelProj.title}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <IconComp className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-700' : 'text-slate-600'}`} />
                    <span className="text-xs font-bold text-slate-900">{preset.badgeText}</span>
                  </div>
                  {isCurrent && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                      <Check className="w-2.5 h-2.5" /> 적용중
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                  {modelProj.title}
                </p>
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{modelProj.author.split(' ')[0]}</span>
                  <span className="text-indigo-600 font-bold hover:underline">예시 적용 &rarr;</span>
                </div>
              </button>
            );
          })}
        </div>

        {exemplarToast && (
          <div className="mt-3 p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{exemplarToast}</span>
          </div>
        )}
      </div>

      {/* Top Header & Project Metadata Input */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                4P 탐구 워크스페이스
              </span>
              <span className="text-xs text-slate-500">
                현재 전공: <strong className="text-slate-800">{currentLab.name}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">4P 연구 계획서 작성 및 정교화</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Real-time Auto-Save Live Status Indicator */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/90 text-emerald-800 rounded-lg text-xs font-medium shadow-2xs select-none"
              title="학생이 입력하는 글자 하나하나가 브라우저 로컬 저장소에 실시간으로 안전하게 자동 저장됩니다."
            >
              {autoSaveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span className="font-semibold">실시간 자동 저장 중...</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold">실시간 자동 저장</span>
                  <span className="text-emerald-700 text-[11px] font-mono">({lastSavedTime})</span>
                </>
              )}
            </div>

            <button
              id="btn-save-project"
              type="button"
              onClick={handleSave}
              title="단축키 Ctrl + S 로 언제든 즉시 수동 저장할 수 있습니다."
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-xs font-medium transition-all"
            >
              <Save className="w-3.5 h-3.5 text-slate-600" />
              <span>즉시 저장 (Ctrl+S)</span>
            </button>

            {/* Feature 1: 교사용 생기부 세특 도우미 Button */}
            <button
              id="btn-workspace-neis-helper"
              type="button"
              onClick={() => setShowNeisModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all"
              title="나이스(NEIS) 500자/1,500Byte 표준 맞춤형 생활기록부(세특·동아리·진로) 생성 도우미 열기"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-200" />
              <span>🎓 생기부 세특 도우미</span>
            </button>

            {/* Feature 2: 학술 탐구 분석 그래프 Button */}
            <button
              id="btn-workspace-charts"
              type="button"
              onClick={() => setShowChartsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all"
              title="4P 역량 거미줄 차트, 인천 10개 군·구 지표 비교, 읽·걷·쓰 밸런스 도넛 차트 열기"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-200" />
              <span>📊 학술 탐구 분석 그래프</span>
            </button>

            {/* Feature 3: 인천 공공데이터 연계 허브 Button */}
            <button
              id="btn-workspace-opendata"
              type="button"
              onClick={() => setShowOpenDataModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all"
              title="인천 10개 군·구 공공데이터포털 실측 데이터 검색 및 4P 원클릭 인용"
            >
              <Database className="w-3.5 h-3.5 text-emerald-200" />
              <span>🏛️ 인천 공공데이터 연계</span>
            </button>

            {/* Feature 4: 학교 제출용 A4 보고서/포스터 인쇄 Button */}
            <button
              id="btn-workspace-print-preview"
              type="button"
              onClick={onOpenPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-slate-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all"
              title="학교 수행평가 제출용 A4 2페이지 공식 보고서 및 학술 포스터 인쇄 / PDF 저장"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-300" />
              <span>🏫 학교 제출용 A4 인쇄/포스터</span>
            </button>
          </div>
        </div>

        {onNavigateTab && (
          <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-900">
              <Database className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>공공데이터 연동 안내:</strong> [실험용 랩]에서 인천 10개 군·구 통계(환경·인구·산업), 실시간 대기환경 API, 21종 공공데이터포털 자료를 조회한 뒤 <strong>[계획서에 넣기]</strong>를 누르면 P1(현상)·P2(원인)·P3(과업)에 자동 인용됩니다.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('experimental-lab')}
              className="text-xs font-black text-indigo-700 hover:text-indigo-900 underline shrink-0"
            >
              실험용 랩 바로가기 &rarr;
            </button>
          </div>
        )}

        {savedToast && (
          <div className="mt-3 p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between gap-2 shadow-xs animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>저장 완료:</strong> 4P 연구 계획서와 모든 입력 내용이 브라우저 로컬 저장소에 안전하게 저장되었습니다. ({lastSavedTime})
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono hidden sm:inline">단축키 Ctrl+S 지원</span>
          </div>
        )}

        {/* Form Fields: Lab & Title */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">참여 연구실 (전공)</label>
            <select
              id="select-project-lab"
              value={project.labId}
              onChange={(e) => {
                const newLab = e.target.value as LabId;
                onChangeProject({ labId: newLab });
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {LABS_DATA.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.badge})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>연구 주제 (프로젝트 제목)</span>
              <span className="text-[11px] text-slate-400 font-normal">
                선택 연구실 기준 가이드 표시
              </span>
            </label>
            <input
              id="input-project-title"
              type="text"
              value={project.title}
              onChange={(e) => onChangeProject({ title: e.target.value })}
              placeholder={activeGuide.titlePlaceholder}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Student Metadata Fields: School Name, Student ID, Author, Affiliation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <span>학교명</span>
              <span className="text-[10px] text-emerald-600 font-bold">(구글 시트 연동)</span>
            </label>
            <input
              id="input-project-school"
              type="text"
              value={project.schoolName || ''}
              onChange={(e) => onChangeProject({ schoolName: e.target.value })}
              placeholder="예: 인천인문고등학교"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">학번 (번호)</label>
            <input
              id="input-project-studentid"
              type="text"
              value={project.studentId || ''}
              onChange={(e) => onChangeProject({ studentId: e.target.value })}
              placeholder="예: 20108"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">연구자 성명</label>
            <input
              id="input-project-author"
              type="text"
              value={project.author}
              onChange={(e) => onChangeProject({ author: e.target.value })}
              placeholder="연구자 성명"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">소속 / 학급</label>
            <input
              id="input-project-affiliation"
              type="text"
              value={project.affiliation}
              onChange={(e) => onChangeProject({ affiliation: e.target.value })}
              placeholder="예: 2학년 3반"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Feature 2: 연구 형태 선택 (1인 개인 연구 vs 2~4인 모둠 연구) & 공동 연구원 관리 */}
        <div className="mt-3.5 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">탐구 진행 형태:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => onChangeProject({ isGroupResearch: false })}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    !project.isGroupResearch
                      ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1인 개인 연구
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentMembers = project.teamMembers && project.teamMembers.length > 0
                      ? project.teamMembers
                      : [{ id: `member-${Date.now()}-1`, studentId: '', name: '', role: '자료 조사 및 현장 답사' }];
                    onChangeProject({ isGroupResearch: true, teamMembers: currentMembers });
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    project.isGroupResearch
                      ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>2~4인 모둠(팀) 연구</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/40 text-white">협업</span>
                </button>
              </div>
            </div>

            {project.isGroupResearch && (
              <button
                type="button"
                onClick={() => {
                  const currentMembers = project.teamMembers || [];
                  if (currentMembers.length >= 4) return;
                  const newMember: TeamMember = {
                    id: `member-${Date.now()}-${currentMembers.length + 1}`,
                    studentId: '',
                    name: '',
                    role: '공공데이터 통계 분석 및 계획서 집필',
                  };
                  onChangeProject({ teamMembers: [...currentMembers, newMember] });
                }}
                disabled={(project.teamMembers?.length || 0) >= 4}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ 공동 연구원 추가 (최대 4인)</span>
              </button>
            )}
          </div>

          {project.isGroupResearch && (
            <div className="space-y-2 pt-1 border-t border-slate-200/60">
              <p className="text-[11px] text-slate-500">
                💡 모둠 연구원의 학번, 성명과 구체적 역할 분담(자료수집, 답사, 통계분석, 집필 등)을 입력하면 <strong>학술 포스터 및 보고서</strong>에 함께 표기됩니다.
              </p>
              <div className="space-y-2">
                {(project.teamMembers || []).map((member, idx) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs"
                  >
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-black shrink-0 self-start sm:self-center">
                      공동 {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={member.studentId}
                      onChange={(e) => {
                        const updated = (project.teamMembers || []).map((m) =>
                          m.id === member.id ? { ...m, studentId: e.target.value } : m
                        );
                        onChangeProject({ teamMembers: updated });
                      }}
                      placeholder="학번 (예: 20115)"
                      className="w-28 text-xs rounded border border-slate-300 p-1.5 focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const updated = (project.teamMembers || []).map((m) =>
                          m.id === member.id ? { ...m, name: e.target.value } : m
                        );
                        onChangeProject({ teamMembers: updated });
                      }}
                      placeholder="연구원 성명"
                      className="w-32 text-xs rounded border border-slate-300 p-1.5 focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => {
                        const updated = (project.teamMembers || []).map((m) =>
                          m.id === member.id ? { ...m, role: e.target.value } : m
                        );
                        onChangeProject({ teamMembers: updated });
                      }}
                      placeholder="담당 역할 (예: 인천 공공데이터 통계 및 설문 조사)"
                      className="grow text-xs rounded border border-slate-300 p-1.5 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (project.teamMembers || []).filter((m) => m.id !== member.id);
                        onChangeProject({ teamMembers: updated });
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0 self-end sm:self-center"
                      title="연구원 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Research Question Input */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>핵심 탐구 질문 (Research Question)</span>
            <span className="text-[11px] text-indigo-600 font-normal">
              * 4P 전체를 관통하는 학술적·실천적 질문을 작성하세요
            </span>
          </label>
          <input
            id="input-project-question"
            type="text"
            value={project.mainQuestion}
            onChange={(e) => onChangeProject({ mainQuestion: e.target.value })}
            placeholder={activeGuide.questionPlaceholder}
            className="w-full text-xs font-medium text-slate-900 rounded-lg border border-indigo-200 bg-indigo-50/20 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Teacher Observation Memo & Life Record with NEIS Byte Counter */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
          {(() => {
            const memoText = project.teacherMemo || '';
            const neisBytes = getNeisByteLength(memoText);
            const isOverLimit = neisBytes > 1500;
            const approxChars = memoText.length;

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>생기부 세특 및 지도교사 관찰 메모 (구글 시트 16번째 열 전송)</span>
                  </label>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* NEIS Byte Counter Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                        isOverLimit
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : neisBytes >= 1200
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                      title="나이스(NEIS) 기준: 한글 3바이트, 영문/숫자/공백 1바이트, 줄바꿈 2바이트 (과세특 한도 1,500 Byte)"
                    >
                      <span>나이스(NEIS) 세특:</span>
                      <span className="font-mono">{neisBytes.toLocaleString()}</span>
                      <span className="text-slate-400 font-normal">/ 1,500 B</span>
                      <span className="text-[10px] text-slate-500 font-normal">({approxChars}자)</span>
                    </div>

                    {/* Auto Synthesize Suggestion Button */}
                    <button
                      type="button"
                      onClick={handleApplySynthesizedMemo}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-all"
                      title="연구주제, 질문, 노력·성장 내용을 조합하여 나이스 기재용 모범 문장을 생성합니다"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>✨ 세특 초안 자동 추천</span>
                    </button>

                    {/* Copy to Clipboard Button */}
                    <button
                      type="button"
                      onClick={handleCopyNeisMemo}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                        copiedNeis
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                      title="나이스(NEIS) 생활기록부 프로그램에 바로 붙여넣기 할 수 있도록 복사합니다"
                    >
                      {copiedNeis ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-200" />
                          <span>복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-300" />
                          <span>📋 나이스 세특 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <textarea
                  id="input-teacher-memo"
                  rows={2}
                  value={project.teacherMemo || ''}
                  onChange={(e) => onChangeProject({ teacherMemo: e.target.value })}
                  placeholder="예: '주도적인 현장 답사와 행동경제학 넛지를 융합하여 상권 활성화 조례안을 구체화한 탐구 열정이 돋보임.' (교사 평가 및 세특 기재용 관찰 기록, 상단의 [세특 초안 자동 추천]을 누르면 즉시 초안이 채워집니다)"
                  className={`w-full text-xs text-slate-800 rounded-lg border p-2.5 bg-slate-50/60 focus:bg-white focus:outline-hidden resize-y leading-relaxed ${
                    isOverLimit
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />

                {isOverLimit && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>나이스 기준 1,500 Byte를 초과했습니다. 글자 수를 조금 줄여주세요.</span>
                  </p>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Smart Auto-Distribute Banner when P1 has lumped content */}
      {(() => {
        const distCandidate = autoDistributeFourP(project.fourP);
        if (!distCandidate.isDistributed) return null;

        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-indigo-50 to-purple-50 border-2 border-indigo-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
                <span>[스마트 감지] P1(현상)에 4개 단계(P1~P4) 내용이 모두 포함되어 있습니다!</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                작성된 문단을 분석하여 <strong>P1(현상) · P2(문제원인) · P3(전공과업) · P4(사회적실천)</strong> 각 단계별 입력창으로 깔끔하게 자동 분산·재배치할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChangeProject({ fourP: distCandidate.distributed });
                setSavedToast(true);
                setTimeout(() => setSavedToast(false), 3000);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>P1~P4 단계별로 즉시 자동 분산</span>
            </button>
          </div>
        );
      })()}

      {/* 4P Step-by-Step Interactive Cards */}
      <div className="space-y-4">
        {stepsConfig.map((step) => {
          const content = project.fourP[step.field] || '';
          const charCount = content.length;
          const isComplete = charCount >= 40;
          const isOpened = activeStep === step.id;

          return (
            <div
              key={step.id}
              className={`bg-white rounded-2xl border transition-all duration-150 overflow-hidden shadow-xs ${
                isOpened ? 'ring-2 ring-indigo-500/20 border-indigo-300' : 'border-slate-200/80'
              }`}
            >
              {/* Header Toggle */}
              <div
                id={`step-header-${step.id}`}
                onClick={() => setActiveStep(isOpened ? (step.id === 'P1' ? 'P2' : 'P1') : step.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${step.badge}`}>
                    {step.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 hidden sm:block">{step.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    {charCount}자 {isComplete ? '(작성 완료)' : '(내용 보강 권장)'}
                  </span>
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  {isOpened ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Step Editor Body */}
              {isOpened && (
                <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/30">
                  {/* Feature 2: Step Scaffolding & Self-Assessment Checklist */}
                  {(() => {
                    const checklistItems = FOUR_P_CHECKLISTS[step.id] || [];
                    const checkedCount = checklistItems.filter(
                      (item) => project.checklistProgress?.[item.id]
                    ).length;
                    const isAllChecked = checklistItems.length > 0 && checkedCount === checklistItems.length;
                    const isChecklistOpen = openChecklists[step.id] ?? true;

                    return (
                      <div className="my-3 rounded-xl border border-indigo-200/90 bg-indigo-50/50 overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenChecklists((prev) => ({
                              ...prev,
                              [step.id]: !prev[step.id],
                            }))
                          }
                          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-indigo-100/60 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-1 rounded-md bg-indigo-600 text-white">
                              <CheckSquare className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-bold text-indigo-950">
                              {step.id} 탐구 비계(Scaffolding) & 자가점검 체크리스트
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isAllChecked
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : checkedCount > 0
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {checkedCount} / {checklistItems.length} 점검 완료
                              {isAllChecked && ' ✓'}
                            </span>
                          </div>
                          {isChecklistOpen ? (
                            <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </button>

                        {isChecklistOpen && (
                          <div className="p-3.5 pt-2 space-y-2 border-t border-indigo-100/90 bg-white/80">
                            <p className="text-[11px] text-indigo-900 font-medium">
                              연구의 타당성을 위해 아래 핵심 기준을 충족했는지 점검하세요:
                            </p>
                            <div className="space-y-1.5">
                              {checklistItems.map((item) => {
                                const isItemChecked = !!project.checklistProgress?.[item.id];
                                return (
                                  <label
                                    key={item.id}
                                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                                      isItemChecked
                                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isItemChecked}
                                      onChange={() => handleToggleChecklistItem(item.id)}
                                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs leading-snug">
                                      {item.text}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Step Pedagogical Guide Box */}
                  <div className="my-3 p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      작성 나침반 (가이드 질문):
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                      {step.guide.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Textarea Header with AI Co-Pilot Button */}
                  <div className="flex items-center justify-between mt-2 mb-1.5 flex-wrap gap-2">
                    <span className="text-[11px] font-bold text-slate-700">본문 작성</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiStepTarget(step.field);
                        setShowAiStepModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[11px] font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                      title="Gemini AI가 이 단계의 초안 작성, 문장 다듬기, 심화 아이디어를 제안합니다"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>AI {step.id} 코파일럿 (초안/다듬기)</span>
                    </button>
                  </div>

                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      id={`textarea-${step.field}`}
                      rows={5}
                      value={content}
                      onChange={(e) => handleFourPChange(step.field, e.target.value)}
                      placeholder={step.placeholder}
                      className="w-full text-xs text-slate-800 leading-relaxed rounded-xl border border-slate-300 p-3.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y font-normal"
                    />
                  </div>

                  {/* Footer hint */}
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span>
                      {step.id === 'P3' || step.id === 'P4'
                        ? '💡 해결책(과업·실천)을 작성한 후 아래의 [AI 3자 이해관계자 검증]을 실행하면 소상공인·환경운동가·공무원의 피드백을 바로 받을 수 있습니다.'
                        : '최소 40자 이상 구체적으로 작성할 때 AI 질문 평가의 정밀도가 극대화됩니다.'}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const nextSteps: Record<string, 'P1' | 'P2' | 'P3' | 'P4'> = {
                            P1: 'P2',
                            P2: 'P3',
                            P3: 'P4',
                            P4: 'P1',
                          };
                          setActiveStep(nextSteps[step.id]);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        다음 단계로 &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Multi-modal Reading Section (Read: 빅카인즈·유튜브·DBpia·스콜라 학술포털 연계) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  다각도 읽기(Read) 학술·언론 연계 아카이브
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  총 {(project.readingLogs || []).length}건 기록
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                빅카인즈(신문사설), 유튜브(영상다큐), DBpia·스콜라(학술논문), 전문도서를 탐색하고 4P의 객관적 근거로 기록하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Multi-modal Reading 5-Tabs Navigation */}
        {(() => {
          const logs = project.readingLogs || [];
          const newsCount = logs.filter((r) => r.mediaType === 'news').length;
          const videoCount = logs.filter((r) => r.mediaType === 'video').length;
          const paperCount = logs.filter((r) => r.mediaType === 'paper').length;
          const bookCount = logs.filter((r) => r.mediaType === 'book').length;

          const tabs: {
            id: 'all' | 'news' | 'video' | 'paper' | 'book';
            label: string;
            subLabel: string;
            icon: any;
            count: number;
            color: string;
            activeClass: string;
          }[] = [
            {
              id: 'news',
              label: '신문·사설',
              subLabel: '빅카인즈 (BigKinds)',
              icon: Newspaper,
              count: newsCount,
              color: 'text-emerald-700',
              activeClass: 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20',
            },
            {
              id: 'video',
              label: '영상·다큐',
              subLabel: '유튜브 (YouTube)',
              icon: Video,
              count: videoCount,
              color: 'text-rose-700',
              activeClass: 'border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-500/20',
            },
            {
              id: 'paper',
              label: '학술논문',
              subLabel: 'DBpia · 스콜라',
              icon: FileText,
              count: paperCount,
              color: 'text-blue-700',
              activeClass: 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20',
            },
            {
              id: 'book',
              label: '단행본·도서',
              subLabel: '도서관 소장자료',
              icon: BookOpen,
              count: bookCount,
              color: 'text-amber-700',
              activeClass: 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/20',
            },
            {
              id: 'all',
              label: '전체 모아보기',
              subLabel: '전체 4P 읽기자료',
              icon: FolderOpen,
              count: logs.length,
              color: 'text-slate-700',
              activeClass: 'border-slate-800 bg-slate-100 text-slate-900 ring-2 ring-slate-800/20',
            },
          ];

          return (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {tabs.map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeReadingTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveReadingTab(tab.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      isActive
                        ? tab.activeClass
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <IconComp className={`w-3.5 h-3.5 ${tab.color}`} />
                        <span>{tab.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/80 border border-slate-200">
                        {tab.count}건
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {tab.subLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* 2. Interactive Academic / Media Search Gateway Bar */}
        {(() => {
          const currentKeyword =
            readingSearchQuery.trim() ||
            project.title?.replace(/[\[\]]/g, '').trim() ||
            '인천 사회문제';

          return (
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">
                    {activeReadingTab === 'news'
                      ? '📰 빅카인즈(BigKinds) & 언론사 사설 스마트 검색'
                      : activeReadingTab === 'video'
                      ? '🎥 유튜브(YouTube) 영상다큐 & 심층보도 스마트 검색'
                      : activeReadingTab === 'paper'
                      ? '📄 DBpia(디비피아) · 스콜라(Scholar) 학술논문 스마트 검색'
                      : activeReadingTab === 'book'
                      ? '📚 국립중앙도서관 & 서점 단행본 소장도서 스마트 검색'
                      : '🔍 학술·언론 포털 통합 스마트 검색'}
                  </span>
                </div>

                {/* Search input with autofill */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <div className="relative grow sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={readingSearchQuery}
                      onChange={(e) => setReadingSearchQuery(e.target.value)}
                      placeholder={project.title ? `예: ${project.title.slice(0, 18)}...` : '검색 키워드 입력'}
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  {project.title && (
                    <button
                      type="button"
                      onClick={() => setReadingSearchQuery(project.title)}
                      className="px-2 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[11px] text-slate-700 font-medium shrink-0"
                      title="내 연구 프로젝트 제목을 검색어로 넣기"
                    >
                      내 주제어
                    </button>
                  )}
                  {readingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setReadingSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1 shrink-0"
                      title="검색어 지우기"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* External Portal Links depending on active tab */}
              {activeReadingTab === 'news' ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://www.bigkinds.or.kr/v2/news/search.do?keywords=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                      title="한국언론진흥재단 빅카인즈 뉴스 빅데이터 검색 (새 창)"
                    >
                      <span>빅카인즈 (BigKinds) 검색</span>
                      <ExternalLink className="w-3 h-3 text-emerald-200" />
                    </a>
                    <a
                      href={`https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(currentKeyword + ' 사설')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all"
                    >
                      <span>네이버 사설·칼럼</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={`https://www.incheonilbo.com/news/articleList.html?sc_word=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-all"
                    >
                      <span>인천일보 기사</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={`http://www.kyeongin.com/main/search.php?kwd=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-all"
                    >
                      <span>경인일보 기사</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    <div className="grow flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddReadingLog('news')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-xs font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> + 새 신문기사·사설 기록 추가
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/70">
                    💡 <strong>빅카인즈 활용 팁:</strong> 신문 기사 속 사실 데이터(현상 P1)와 논설위원의 사설·칼럼에 나타난 구조적 원인(문제 P2)을 탐구 근거로 삼으세요.
                  </p>
                </div>
              ) : activeReadingTab === 'video' ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentKeyword + ' 다큐멘터리')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
                      title="유튜브 다큐멘터리 영상 검색 (새 창)"
                    >
                      <span>유튜브 다큐멘터리 검색</span>
                      <ExternalLink className="w-3 h-3 text-rose-200" />
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent('EBS 다큐 ' + currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all"
                    >
                      <span>EBS 다큐프라임</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent('KBS 다큐 ' + currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-700 border border-slate-300 text-xs font-medium transition-all"
                    >
                      <span>KBS 다큐인사이트</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentKeyword + ' 기획보도')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-all"
                    >
                      <span>심층 탐사보도</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    <div className="grow flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddReadingLog('video')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-xs font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> + 새 유튜브 영상 기록 추가
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-rose-800 bg-rose-50/60 p-2 rounded-lg border border-rose-200/70">
                    💡 <strong>유튜브 영상 활용 팁:</strong> 전문가 인터뷰나 현장 실태가 드러나는 타임스탬프(예: `14:20 ~ 18:35`)와 발언 내용을 정확히 기록하세요.
                  </p>
                </div>
              ) : activeReadingTab === 'paper' ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://www.dbpia.co.kr/search/topSearch?searchDir=all&Search=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                      title="누리미디어 DBpia 학술논문 검색 (새 창)"
                    >
                      <span>DBpia (디비피아) 논문</span>
                      <ExternalLink className="w-3 h-3 text-blue-200" />
                    </a>
                    <a
                      href={`https://scholar.google.co.kr/scholar?q=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 border border-slate-300 text-xs font-bold transition-all"
                      title="구글 스칼라(Google Scholar) 학술검색 (새 창)"
                    >
                      <span>구글 스칼라 (Scholar)</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={`https://scholar.kyobobook.co.kr/search?keyword=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all"
                      title="교보문고 스콜라(Scholar) 학술 데이터베이스 (새 창)"
                    >
                      <span>교보 스콜라 (Scholar)</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={`https://www.riss.kr/search/Search.do?queryText=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-all"
                    >
                      <span>RISS 학술포털</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    <div className="grow flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddReadingLog('paper')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 text-xs font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> + 새 학술논문 기록 추가
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-800 bg-blue-50/60 p-2 rounded-lg border border-blue-200/70">
                    💡 <strong>DBpia·스콜라 활용 팁:</strong> KCI 등재 학술논문의 [연구방법(과업 P3)]과 [결론 및 제언(실천 P4)]을 발췌하여 내 탐구 설계에 적용하세요.
                  </p>
                </div>
              ) : activeReadingTab === 'book' ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://www.nl.go.kr/NL/contents/search.do?srchTarget=total&kwd=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all"
                      title="국립중앙도서관 소장 도서 검색 (새 창)"
                    >
                      <span>국립중앙도서관</span>
                      <ExternalLink className="w-3 h-3 text-amber-200" />
                    </a>
                    <a
                      href={`https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all"
                    >
                      <span>알라딘 도서</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={`https://search.kyobobook.co.kr/search?keyword=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-700 border border-slate-300 text-xs font-medium transition-all"
                    >
                      <span>교보문고 도서</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={`https://lib.ice.go.kr/search/tot/result?st=KWRD&si=TOTAL&q=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-all"
                    >
                      <span>인천시교육청 도서관</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    <div className="grow flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddReadingLog('book')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> + 새 도서·단행본 기록 추가
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800 bg-amber-50/60 p-2 rounded-lg border border-amber-200/70">
                    💡 <strong>도서 활용 팁:</strong> 문제의 인문·사회적 배경이나 과학기술 원리를 다룬 단행본의 핵심 쪽수(예: `p.42~p.58`)를 명확히 남기세요.
                  </p>
                </div>
              ) : (
                /* All Mode */
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">포털 바로가기:</span>
                    <a
                      href={`https://www.bigkinds.or.kr/v2/news/search.do?keywords=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
                    >
                      <Newspaper className="w-3 h-3" /> 빅카인즈
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentKeyword + ' 다큐멘터리')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors"
                    >
                      <Video className="w-3 h-3" /> 유튜브 다큐
                    </a>
                    <a
                      href={`https://www.dbpia.co.kr/search/topSearch?searchDir=all&Search=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors"
                    >
                      <FileText className="w-3 h-3" /> DBpia 논문
                    </a>
                    <a
                      href={`https://scholar.google.co.kr/scholar?q=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors"
                    >
                      <GraduationCap className="w-3 h-3" /> 구글 스칼라
                    </a>
                    <a
                      href={`https://www.nl.go.kr/NL/contents/search.do?srchTarget=total&kwd=${encodeURIComponent(currentKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
                    >
                      <BookOpen className="w-3 h-3" /> 국립도서관
                    </a>

                    <div className="grow flex justify-end gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAddReadingLog('news')}
                        className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                      >
                        + 신문
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddReadingLog('video')}
                        className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold"
                      >
                        + 유튜브
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddReadingLog('paper')}
                        className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold"
                      >
                        + 논문
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddReadingLog('book')}
                        className="px-2 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold"
                      >
                        + 도서
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 3. Filtered Reading Log Cards List */}
        {(() => {
          const allLogs = project.readingLogs || [];
          const filteredLogs =
            activeReadingTab === 'all'
              ? allLogs
              : allLogs.filter((r) => r.mediaType === activeReadingTab);

          if (filteredLogs.length === 0) {
            return (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  {activeReadingTab === 'news'
                    ? '등록된 신문기사·사설(빅카인즈) 기록이 없습니다.'
                    : activeReadingTab === 'video'
                    ? '등록된 유튜브 영상다큐 기록이 없습니다.'
                    : activeReadingTab === 'paper'
                    ? '등록된 학술논문(DBpia·스콜라) 기록이 없습니다.'
                    : activeReadingTab === 'book'
                    ? '등록된 단행본·도서 기록이 없습니다.'
                    : '등록된 읽기 탐구 기록이 없습니다.'}
                </p>
                <p className="text-[11px] text-slate-500">
                  상단의 스마트 검색 버튼으로 자료를 찾은 뒤 기록을 추가하세요.
                </p>
                <button
                  type="button"
                  onClick={() => handleAddReadingLog(activeReadingTab === 'all' ? 'paper' : activeReadingTab)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 읽기 기록 추가하기</span>
                </button>
              </div>
            );
          }

          const mediaConfig: Record<
            ReadingMediaType,
            { badge: string; label: string; icon: any; titlePh: string; authorPh: string; orgPh: string }
          > = {
            book: {
              badge: 'bg-amber-100 text-amber-800 border-amber-200',
              label: '📚 도서·단행본',
              icon: BookOpen,
              titlePh: '도서명 (예: 소외의 경제와 사회)',
              authorPh: '저자 (예: 리처드 세넷)',
              orgPh: '출판사 (예: 열린책들)',
            },
            paper: {
              badge: 'bg-blue-100 text-blue-800 border-blue-200',
              label: '📄 학술논문·DBpia·스콜라',
              icon: FileText,
              titlePh: '논문 제목 (예: 키오스크 확산에 따른 고령층의 정보격차 연구)',
              authorPh: '연구자 (예: 최정은)',
              orgPh: '학술지/기관 (예: 한국사회학보, KCI 등재지)',
            },
            news: {
              badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              label: '📰 신문사설·빅카인즈',
              icon: Newspaper,
              titlePh: '기사/사설 제목 (예: [사설] 키오스크 무인화, 배려 없는 질주 멈춰야)',
              authorPh: '기자/논설위원 (예: 강동완 기자)',
              orgPh: '언론사명 (예: 경인일보, 한겨레, 조선일보)',
            },
            video: {
              badge: 'bg-rose-100 text-rose-800 border-rose-200',
              label: '🎥 유튜브·영상다큐',
              icon: Video,
              titlePh: '영상 제목 (예: [EBS 다큐 시선] 멈춰선 노인들)',
              authorPh: '채널/제작팀 (예: EBS 다큐프라임)',
              orgPh: '방송사/플랫폼 (예: 유튜브, EBS, KBS)',
            },
          };

          return (
            <div className="space-y-3">
              {filteredLogs.map((r, idx) => {
                const currentType = r.mediaType || 'book';
                const cfg = mediaConfig[currentType];
                const IconComp = cfg.icon;

                return (
                  <div
                    key={r.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1 ${cfg.badge}`}>
                          <IconComp className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                        <select
                          value={currentType}
                          onChange={(e) => handleUpdateReadingLog(r.id, 'mediaType', e.target.value as ReadingMediaType)}
                          className="text-xs rounded-md border border-slate-300 bg-white px-2 py-1"
                        >
                          <option value="news">📰 신문·사설 (빅카인즈)</option>
                          <option value="video">🎥 영상·다큐 (유튜브)</option>
                          <option value="paper">📄 학술논문 (DBpia·스콜라)</option>
                          <option value="book">📚 단행본·도서</option>
                        </select>
                        <span className="text-xs text-slate-400">|</span>
                        <select
                          value={r.linked4PStep || 'P1'}
                          onChange={(e) => handleUpdateReadingLog(r.id, 'linked4PStep', e.target.value)}
                          className="text-xs rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 font-medium"
                          title="이 자료가 4P 중 어느 단계의 근거가 되는지 지정하세요"
                        >
                          <option value="P1">4P 연계: P1. 현상 근거</option>
                          <option value="P2">4P 연계: P2. 문제 원인 분석</option>
                          <option value="P3">4P 연계: P3. 과업 및 연구방법론</option>
                          <option value="P4">4P 연계: P4. 실천 및 사회적 대안</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline font-semibold flex items-center gap-1"
                            title="출처 웹페이지 바로 열기"
                          >
                            <span>원문 링크</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveReadingLog(r.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 text-xs flex items-center gap-1 transition-colors"
                          title="이 읽기 기록 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <input
                          type="text"
                          value={r.title}
                          onChange={(e) => handleUpdateReadingLog(r.id, 'title', e.target.value)}
                          placeholder={cfg.titlePh}
                          className="w-full rounded-lg border border-slate-300 p-2 bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={r.author}
                          onChange={(e) => handleUpdateReadingLog(r.id, 'author', e.target.value)}
                          placeholder={cfg.authorPh}
                          className="w-full rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <input
                          type="text"
                          value={r.sourceOrg || ''}
                          onChange={(e) => handleUpdateReadingLog(r.id, 'sourceOrg', e.target.value)}
                          placeholder={cfg.orgPh}
                          className="w-full rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={r.timestampOrPage || ''}
                          onChange={(e) => handleUpdateReadingLog(r.id, 'timestampOrPage', e.target.value)}
                          placeholder={
                            currentType === 'video'
                              ? '인용 시간대 (예: 14:20 ~ 18:35)'
                              : currentType === 'paper' || currentType === 'book'
                              ? '인용 페이지 (예: p.45 ~ p.58)'
                              : '신문 기사 발행일/면 (예: 2026.04.12 12면)'
                          }
                          className="w-full rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={r.url || ''}
                          onChange={(e) => handleUpdateReadingLog(r.id, 'url', e.target.value)}
                          placeholder="원문 웹 주소 URL (예: https://...)"
                          className="w-full rounded-lg border border-slate-300 p-2 bg-white font-mono text-[11px] focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={r.readingNotes}
                        onChange={(e) => handleUpdateReadingLog(r.id, 'readingNotes', e.target.value)}
                        placeholder="핵심 요약, 인상 깊은 통계 수치나 문장, 또는 이 텍스트가 내 탐구(4P)에 제공하는 학술적·실천적 근거를 기록하세요."
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-y leading-relaxed"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Student Self-Reflection & Growth Section (생기부 세특 평가 핵심 2가지) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xs shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                학생 탐구 성찰 및 나의 성장 (생활기록부 세특 연계)
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                교사 평가 핵심 자료
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              탐구 과정에서 주도적으로 애쓴 노력과, 탐구를 마친 후 전공 의식 및 가치관의 성장을 분리하여 기록하세요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Effort Notes */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="text-sm">🌱</span>
                <span>탐구과정에서 노력한 점 (난관 극복 및 실천 과정)</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded-md bg-emerald-100/70">
                과정 중심 평가
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              자료 수집, 현장 답사, 인터뷰 섭외, 데이터 분석 중 마주했던 어려움을 어떻게 스스로 해결하려 애썼는지 구체적인 행동을 적으세요.
            </p>
            <textarea
              id="textarea-effort-notes"
              rows={4}
              value={project.effortNotes || ''}
              onChange={(e) => onChangeProject({ effortNotes: e.target.value, updatedAt: new Date().toISOString().split('T')[0] })}
              placeholder="예: 단순히 인터넷 검색에 머물지 않고 인천 원도심 무인 매장 12곳을 직접 찾아가 어르신들을 심층 인터뷰했습니다. 처음에는 거절을 당하기도 했지만 질문지를 보기 쉽게 큰 글씨로 수정해 다가갔고, 관련 학술 논문과 신문 기사를 교차 검증하며 감정적 주장이 아닌 객관적 근거로 논리를 다듬었습니다."
              className="w-full text-xs text-slate-800 rounded-xl border border-emerald-300 p-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed resize-y"
            />
          </div>

          {/* 2. Growth Notes */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <span className="text-sm">🌟</span>
                <span>탐구를 통해 성장한 점 (전공 인식 및 배운 점)</span>
              </label>
              <span className="text-[10px] text-purple-700 font-semibold px-2 py-0.5 rounded-md bg-purple-100/70">
                인식 및 가치관 변화
              </span>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              이 탐구를 마친 후 나의 전공·진로에 대한 시각이 어떻게 깊어졌는지, 사회문제를 바라보는 가치관이 어떻게 달라졌는지 적으세요.
            </p>
            <textarea
              id="textarea-growth-notes"
              rows={4}
              value={project.growthNotes || ''}
              onChange={(e) => onChangeProject({ growthNotes: e.target.value, updatedAt: new Date().toISOString().split('T')[0] })}
              placeholder="예: 기술 발전이 무조건 사회에 유익할 것이라는 기술지상주의적 편견을 깨뜨리는 계기가 되었습니다. 행정학·사회복지학을 전공하고자 하는 학생으로서, 첨단 기술의 도입 속도보다 중요한 것은 '누구도 배제되지 않는 포용적 공공 인프라'라는 점을 체득했고, 교과서 속 기본권 개념이 지역 현장에서 어떻게 지켜져야 하는지 깊이 있게 깨달았습니다."
              className="w-full text-xs text-slate-800 rounded-xl border border-purple-300 p-3 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>

      {/* Assignment Attachment Section (과제 첨부파일 및 구글 드라이브 링크) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-white shadow-xs shrink-0">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  과제 첨부파일 및 구글 드라이브 링크
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  HWP · PDF · PPT · 사진
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                현장 답사 사진, 한글 보고서(HWP), 발표 PPT 등을 내 컴퓨터에서 선택하거나 구글 드라이브 링크를 입력하세요.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* File Picker */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="font-semibold text-slate-700 block">내 기기에서 파일 선택</span>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>파일 찾기</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleAttachmentFile}
                />
              </label>
              <div className="truncate text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 grow">
                {project.attachmentName ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {project.attachmentName}
                  </span>
                ) : (
                  <span className="text-slate-400">선택된 파일 없음</span>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              선택한 파일명은 구글 시트 및 A4 인쇄 보고서의 첨부 서류란에 공식 기록됩니다.
            </p>
          </div>

          {/* Drive Link Input */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="font-semibold text-slate-700 block">구글 드라이브 / 클라우드 공유 링크 (URL)</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={project.attachmentUrl || ''}
                onChange={(e) => onChangeProject({ attachmentUrl: e.target.value, updatedAt: new Date().toISOString().split('T')[0] })}
                placeholder="예: https://drive.google.com/file/d/..."
                className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              {project.attachmentUrl && (
                <a
                  href={project.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-blue-600 transition-colors shrink-0"
                  title="링크 열기 테스트"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              구글 시트에 =HYPERLINK()로 자동 등록되어 선생님이 클릭 한 번으로 열어볼 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Feature 2: Academic Inquiry Visual Analytics Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/20 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900">
                  4P 학술 탐구 시각화 분석 그래프
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800 font-bold">
                  실시간 인터랙티브
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                내 연구 계획서의 5대 역량 레이더, 인천 10개 군·구 지표 비교, 읽·걷·쓰 밸런스를 확인하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowChartsModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>전체화면 스튜디오 열기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowInlineCharts(!showInlineCharts)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              {showInlineCharts ? '차트 접기 ▲' : '차트 펼쳐보기 ▼'}
            </button>
          </div>
        </div>

        {showInlineCharts && (
          <div className="p-5 sm:p-6 bg-slate-50/40">
            <AcademicChartsView
              project={project}
              onInjectToProject={(step, text) => {
                const currentText = project.fourP[step] || '';
                const updatedText = currentText ? `${currentText}\n\n${text}` : text;
                onChangeProject({
                  fourP: { ...project.fourP, [step]: updatedText },
                  updatedAt: new Date().toISOString().split('T')[0],
                });
              }}
            />
          </div>
        )}
      </div>

      {/* AI Multi-Stakeholder Persona Feedback Section */}
      <AiPersonaFeedbackSection
        project={project}
        onChangeProject={onChangeProject}
        onNavigateTab={onNavigateTab}
      />

      {/* Action Footer */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            4P 계획서가 완성되었나요?
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Gemini 연동 AI 또는 규칙 기반 안전 모드가 질문의 학술적 깊이와 4P 정합성을 점검하고 심화 질문을 제안합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleLoadLabExemplar(project.labId)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            title="현재 연구실의 완성형 모범 탐구 예시로 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>[{currentLab.name.split(' ')[0]}] 모범 예시 복원</span>
          </button>

          <button
            id="btn-footer-eval"
            onClick={onRequestAiEvaluation}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-900/40 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 정밀 평가 실행</span>
          </button>
        </div>
      </div>

      {/* Feature 1: Student Record (NEIS) Helper Modal */}
      {showNeisModal && (
        <StudentRecordHelperModal
          isOpen={showNeisModal}
          onClose={() => setShowNeisModal(false)}
          project={project}
          onUpdateProject={onChangeProject}
        />
      )}

      {/* Feature 3: Incheon Open Data Reference Modal */}
      {showOpenDataModal && (
        <IncheonOpenDataModal
          isOpen={showOpenDataModal}
          onClose={() => setShowOpenDataModal(false)}
          project={project}
          onUpdateProject={onChangeProject}
        />
      )}

      {/* Feature 2: Academic Inquiry Charts Modal */}
      {showChartsModal && (
        <AcademicInquiryChartsModal
          isOpen={showChartsModal}
          onClose={() => setShowChartsModal(false)}
          project={project}
          onInjectToProject={(step, text) => {
            const currentText = project.fourP[step] || '';
            const updatedText = currentText ? `${currentText}\n\n${text}` : text;
            onChangeProject({
              fourP: { ...project.fourP, [step]: updatedText },
              updatedAt: new Date().toISOString().split('T')[0],
            });
          }}
        />
      )}

      {/* AI Step Co-Pilot Modal */}
      {showAiStepModal && (
        <AiStepAssistantModal
          isOpen={showAiStepModal}
          onClose={() => setShowAiStepModal(false)}
          project={project}
          initialStep={aiStepTarget}
          onApplyText={(step, text) => {
            onChangeProject({
              fourP: { ...project.fourP, [step]: text },
              updatedAt: new Date().toISOString().split('T')[0],
            });
          }}
        />
      )}
    </div>
  );
};

