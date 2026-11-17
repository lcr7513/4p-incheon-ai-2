import React, { useState } from 'react';
import {
  Footprints,
  Plus,
  Compass,
  MapPin,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Brain,
  Users,
  BookOpen,
  Leaf,
  Flag,
  ArrowRight,
  Check,
  Filter,
  CheckSquare,
  MessageSquare,
  Activity,
  Award,
  Smartphone,
  ShieldCheck,
  Info,
  Edit3,
  ListChecks,
  Layers,
  Save,
  RotateCw,
  FileText,
  Globe,
  Camera,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { WalkingLog, ResearchProject, FourPData, WalkingDomainId, WalkingDomainInfo, WalkingSpot } from '../types';
import { WALKING_DOMAINS_DATA } from '../data/walkingData';
import { LABS_DATA } from '../data/labsData';
import { WalkingSpotDetailModal } from './WalkingSpotDetailModal';
import { GoogleEarthFieldExplorer } from './GoogleEarthFieldExplorer';

interface WalkingImmersionViewProps {
  project: ResearchProject;
  onAddWalkingLog: (log: WalkingLog) => void;
  onDeleteWalkingLog: (id: string) => void;
  onInjectNoteToFourP: (step: keyof FourPData, note: string) => void;
  onRestoreDefaultLogs?: () => void;
}

export const WalkingImmersionView: React.FC<WalkingImmersionViewProps> = ({
  project,
  onAddWalkingLog,
  onDeleteWalkingLog,
  onInjectNoteToFourP,
  onRestoreDefaultLogs,
}) => {
  // Domain selection state (like 6 major research labs)
  const [selectedDomainId, setSelectedDomainId] = useState<WalkingDomainId>('contemplation');
  const selectedDomain =
    WALKING_DOMAINS_DATA.find((d) => d.id === selectedDomainId) || WALKING_DOMAINS_DATA[0];

  // Sub-Navigation Tabs: 'earth' | 'domains' | 'logs' | 'labSpots' | 'all'
  const [activeSubTab, setActiveSubTab] = useState<'earth' | 'domains' | 'logs' | 'labSpots' | 'all'>('earth');

  // Modals & Timers
  const [showAddModal, setShowAddModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInterval, setTimerIntervalState] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state for logs timeline
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [filterStep, setFilterStep] = useState<string>('all');
  const [spotDetailModal, setSpotDetailModal] = useState<WalkingSpot | null>(null);

  // Interactive checklist toggle state per domain
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Student Writing Spaces (persisted to localStorage)
  const [activityNotes, setActivityNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`4p_act_notes_${project.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [spotNotes, setSpotNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`4p_spot_notes_${project.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [promptNotes, setPromptNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`4p_prompt_notes_${project.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [labSpotNotes, setLabSpotNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`4p_labspot_notes_${project.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Inline New Log Form State
  const [inlineDomainId, setInlineDomainId] = useState<WalkingDomainId>('contemplation');
  const [inlineDate, setInlineDate] = useState(new Date().toISOString().split('T')[0]);
  const [inlineSteps, setInlineSteps] = useState(6000);
  const [inlineDuration, setInlineDuration] = useState(40);
  const [inlineCourse, setInlineCourse] = useState('인천 개항장 문화지구 ~ 자유공원');
  const [inlineThought, setInlineThought] = useState('');
  const [inlineFindings, setInlineFindings] = useState('');
  const [inlineFocus, setInlineFocus] = useState(5);
  const [inlineLinkedStep, setInlineLinkedStep] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'general'>('P1');
  const [inlineSyncToFourP, setInlineSyncToFourP] = useState(true);

  // Modal Log Form State
  const [newDomainId, setNewDomainId] = useState<WalkingDomainId>('contemplation');
  const [newActivityType, setNewActivityType] = useState('사색·성찰 걷기');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSteps, setNewSteps] = useState(6500);
  const [newDuration, setNewDuration] = useState(45);
  const [newCourse, setNewCourse] = useState('인천 개항장 문화거리 ~ 자유공원');
  const [newThought, setNewThought] = useState('');
  const [newFindings, setNewFindings] = useState('');
  const [newLinkedStep, setNewLinkedStep] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'general'>('P1');
  const [newPhotos, setNewPhotos] = useState<{ id: string; url: string; caption?: string }[]>([]);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; caption?: string } | null>(null);

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일(JPG, PNG, WebP)만 첨부할 수 있습니다.');
      return;
    }

    setIsCompressingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewPhotos((prev) => [
            ...prev,
            {
              id: `photo-${Date.now()}`,
              url: dataUrl,
              caption: file.name.replace(/\.[^/.]+$/, ''),
            },
          ]);
          showToast('현장 사진이 첨부되었습니다.');
        }
        setIsCompressingPhoto(false);
      };
      img.onerror = () => {
        setIsCompressingPhoto(false);
        showToast('이미지를 불러오는데 실패했습니다.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [newFocus, setNewFocus] = useState(5);
  const currentLab = LABS_DATA.find((l) => l.id === project.labId) || LABS_DATA[0];

  // Note updates and localStorage synchronization
  const handleActivityNoteChange = (key: string, val: string) => {
    setActivityNotes((prev) => {
      const updated = { ...prev, [key]: val };
      try {
        localStorage.setItem(`4p_act_notes_${project.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSpotNoteChange = (key: string, val: string) => {
    setSpotNotes((prev) => {
      const updated = { ...prev, [key]: val };
      try {
        localStorage.setItem(`4p_spot_notes_${project.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handlePromptNoteChange = (key: string, val: string) => {
    setPromptNotes((prev) => {
      const updated = { ...prev, [key]: val };
      try {
        localStorage.setItem(`4p_prompt_notes_${project.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleLabSpotNoteChange = (key: string, val: string) => {
    setLabSpotNotes((prev) => {
      const updated = { ...prev, [key]: val };
      try {
        localStorage.setItem(`4p_labspot_notes_${project.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Helper for domain icon
  const getDomainIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Brain':
        return <Brain className={className} />;
      case 'MapPin':
        return <MapPin className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Leaf':
        return <Leaf className={className} />;
      case 'Flag':
        return <Flag className={className} />;
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      default:
        return <Footprints className={className} />;
    }
  };

  // Timer handlers
  const handleToggleTimer = () => {
    if (timerRunning) {
      if (timerInterval) clearInterval(timerInterval);
      setTimerRunning(false);
    } else {
      setTimerRunning(true);
      const interval = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
      setTimerIntervalState(interval);
    }
  };

  const handleResetTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  // Open modal prefilled with current selected domain
  const handleOpenAddModalWithDomain = (domainId: WalkingDomainId) => {
    setNewDomainId(domainId);
    const targetDomain = WALKING_DOMAINS_DATA.find((d) => d.id === domainId);
    if (targetDomain) {
      setNewActivityType(targetDomain.name);
      setNewCourse(targetDomain.recommendedSpots[0]?.name || '인천 탐구 코스');
    }
    setShowAddModal(true);
  };

  // Open modal prefilled from Google Earth Hotspot
  const handleOpenAddModalWithSpot = (spotName: string, inquiryTip: string) => {
    setNewDomainId('field-observation');
    setNewActivityType('3D 구글 어스 위성 공간 탐색');
    setNewCourse(spotName);
    setNewFindings(inquiryTip);
    setNewThought(`[구글 어스 3D 현장 탐구: ${spotName}]\n위성 고도·경사각에서 관찰한 도시 공간 구조: `);
    setShowAddModal(true);
  };

  // Submit Modal Log
  const handleSubmitNewLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) return;

    const log: WalkingLog = {
      id: `walk-${Date.now()}`,
      date: newDate,
      steps: Number(newSteps) || 5000,
      durationMinutes: Number(newDuration) || 30,
      courseName: newCourse || '사색 탐구길',
      thoughtNote: newThought.trim(),
      findings: newFindings.trim() || undefined,
      focusScore: newFocus,
      linked4PStep: newLinkedStep,
      domainId: newDomainId,
      activityType: newActivityType,
      photos: newPhotos.length > 0 ? newPhotos : undefined,
    };

    onAddWalkingLog(log);
    setNewThought('');
    setNewFindings('');
    setNewPhotos([]);
    setShowAddModal(false);
    showToast('새로운 현장 걷기·사색 일지가 등록되었습니다.');
  };

  // Submit Inline Log
  const handleSubmitInlineLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineThought.trim()) {
      showToast('사색 및 현장 메모를 입력해주세요.');
      return;
    }

    const domainObj = WALKING_DOMAINS_DATA.find((d) => d.id === inlineDomainId);
    const log: WalkingLog = {
      id: `walk-${Date.now()}`,
      date: inlineDate,
      steps: Number(inlineSteps) || 5000,
      durationMinutes: Number(inlineDuration) || 30,
      courseName: inlineCourse.trim() || '인천 사색 탐구길',
      thoughtNote: inlineThought.trim(),
      findings: inlineFindings.trim() || undefined,
      focusScore: inlineFocus,
      linked4PStep: inlineLinkedStep,
      domainId: inlineDomainId,
      activityType: domainObj?.name || '사색·성찰 걷기',
    };

    onAddWalkingLog(log);

    if (inlineSyncToFourP && inlineLinkedStep !== 'general') {
      const stepMapping: Record<string, keyof FourPData> = {
        P1: 'phenomenon',
        P2: 'problem',
        P3: 'project',
        P4: 'practice',
      };
      const noteToSync = `[현장 걷기·사색 일지 연계: ${log.courseName} (${log.date})]\n${log.thoughtNote}${
        log.findings ? `\n(현장 실측/증언: ${log.findings})` : ''
      }`;
      onInjectNoteToFourP(stepMapping[inlineLinkedStep], noteToSync);
    }

    setInlineThought('');
    setInlineFindings('');
    showToast(
      inlineSyncToFourP && inlineLinkedStep !== 'general'
        ? `사색·현장탐사 일지가 저장되었으며, 4P [${inlineLinkedStep}] 단계에도 동시 반영되었습니다.`
        : '새로운 현장 걷기·사색 일지가 성공적으로 등록되었습니다.'
    );
  };

  // 1-Click Inject into 4P
  const handleInject = (step: 'P1' | 'P2' | 'P3' | 'P4', content: string) => {
    const mapping: Record<string, keyof FourPData> = {
      P1: 'phenomenon',
      P2: 'problem',
      P3: 'project',
      P4: 'practice',
    };
    onInjectNoteToFourP(mapping[step], content);
    showToast(`현장 기록이 4P 연구 계획서 [${step}] 단계에 성공적으로 반영되었습니다.`);
  };

  // Activity note actions
  const handleApplyActivityTo4P = (domain: WalkingDomainInfo, act: any, index: number) => {
    const key = `${domain.id}-${index}`;
    const userText = activityNotes[key]?.trim();
    const content = userText
      ? `[${domain.name} 현장 실천 기록 - ${act.title}]\n${userText}\n(실행 목적: ${act.purpose})`
      : act.injectContent;
    handleInject(act.target4P, content);
  };

  const handleSaveActivityToJournal = (domain: WalkingDomainInfo, act: any, index: number) => {
    const key = `${domain.id}-${index}`;
    const userText = activityNotes[key]?.trim() || act.injectContent;
    const newLog: WalkingLog = {
      id: `walk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      steps: 5000,
      durationMinutes: 40,
      courseName: `[${domain.name}] ${act.title}`,
      thoughtNote: userText,
      findings: `실행 활동: ${act.purpose} | 기대 산출물: ${act.expectedOutcome}`,
      focusScore: 5,
      linked4PStep: act.target4P,
      domainId: domain.id,
      activityType: domain.name,
    };
    onAddWalkingLog(newLog);
    showToast(`'${act.title}' 실천 기록이 사색·현장탐사 일지에 추가되었습니다.`);
  };

  // Incheon Spot note actions
  const handleApplySpotTo4P = (domain: WalkingDomainInfo, spot: any, index: number) => {
    const key = `${domain.id}-${index}`;
    const userText = spotNotes[key]?.trim();
    const content = userText
      ? `[인천 답사 스팟: ${spot.name} (${spot.location})]\n${userText}\n(장소 특징: ${spot.features})\n(사색 발문: ${spot.contemplationPrompt})`
      : `[인천 답사 스팟: ${spot.name} (${spot.location})]\n${spot.features}\n(사색 발문 성찰: ${spot.contemplationPrompt})`;
    onInjectNoteToFourP('phenomenon', content);
    showToast(`'${spot.name}' 현장 사색 메모가 4P 현상(P1) 단계에 반영되었습니다.`);
  };

  const handleSaveSpotToJournal = (domain: WalkingDomainInfo, spot: any, index: number) => {
    const key = `${domain.id}-${index}`;
    const userText = spotNotes[key]?.trim() || `[${spot.name} 현장 사색]: ${spot.contemplationPrompt}`;
    const newLog: WalkingLog = {
      id: `walk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      steps: 5500,
      durationMinutes: 45,
      courseName: spot.name,
      thoughtNote: userText,
      findings: `장소 특징: ${spot.features}`,
      focusScore: 5,
      linked4PStep: 'P1',
      domainId: domain.id,
      activityType: `${domain.name} - 현장 답사`,
    };
    onAddWalkingLog(newLog);
    showToast(`'${spot.name}' 답사 사색이 사색·현장탐사 일지에 등록되었습니다.`);
  };

  // Inquiry Prompt note actions
  const handleApplyPromptTo4P = (domain: WalkingDomainInfo, q: string, idx: number, step: 'P1' | 'P2' = 'P1') => {
    const key = `${domain.id}-${idx}`;
    const userText = promptNotes[key]?.trim();
    const content = userText
      ? `[현장 사색 발문 성찰 - ${domain.name} Q${idx + 1}]\n- 핵심 발문: ${q}\n- 학생 사색 성찰: ${userText}`
      : `[현장 사색 발문 성찰 - ${domain.name} Q${idx + 1}]\n- 핵심 발문: ${q}`;
    handleInject(step, content);
  };

  const handleSavePromptToJournal = (domain: WalkingDomainInfo, q: string, idx: number) => {
    const key = `${domain.id}-${idx}`;
    const userText = promptNotes[key]?.trim() || `발문 사색: ${q}`;
    const newLog: WalkingLog = {
      id: `walk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      steps: 4200,
      durationMinutes: 35,
      courseName: `${domain.name} 사색 보행길`,
      thoughtNote: `[핵심 발문 Q${idx + 1}. ${q}]\n${userText}`,
      findings: `영역: ${domain.name} (#${domain.inquiryKeywords.slice(0, 3).join(', #')})`,
      focusScore: 5,
      linked4PStep: 'P1',
      domainId: domain.id,
      activityType: `${domain.name} - 발문 사색`,
    };
    onAddWalkingLog(newLog);
    showToast(`Q${idx + 1} 발문 사색 기록이 사색 일지에 등록되었습니다.`);
  };

  // Lab Walking Spot actions
  const handleApplyLabSpotTo4P = (spot: WalkingSpot, index: number) => {
    const key = spot.id || `labspot-${index}`;
    const userText = labSpotNotes[key]?.trim();
    const content = userText
      ? `[인천 전공 연계 현장 탐구: ${spot.name} (${spot.district})]\n${userText}\n(특징: ${spot.incheonFeatures})\n(사색 발문: ${spot.contemplationPrompt})`
      : `[인천 전공 연계 현장 탐구: ${spot.name} (${spot.district})]\n${spot.incheonFeatures}\n(사색 발문: ${spot.contemplationPrompt})`;
    onInjectNoteToFourP('phenomenon', content);
    showToast(`'${spot.name}' 답사 메모가 4P 현상(P1)에 전송되었습니다.`);
  };

  const handleSaveLabSpotToJournal = (spot: WalkingSpot, index: number) => {
    const key = spot.id || `labspot-${index}`;
    const userText = labSpotNotes[key]?.trim() || `[${spot.name} 현장 답사]: ${spot.contemplationPrompt}`;
    const newLog: WalkingLog = {
      id: `walk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      steps: 6200,
      durationMinutes: 50,
      courseName: spot.name,
      thoughtNote: userText,
      findings: `경유지: ${spot.keySpots.join(', ')} | 장소 특징: ${spot.incheonFeatures}`,
      focusScore: 5,
      linked4PStep: 'P1',
      domainId: 'field-observation',
      activityType: `${currentLab.name} 전공 현장탐구`,
    };
    onAddWalkingLog(newLog);
    showToast(`'${spot.name}' 탐사 기록이 사색·현장탐사 일지에 등록되었습니다.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleChecklist = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Stats calculation
  const logs = project.walkingLogs || [];
  const totalSteps = logs.reduce((acc, cur) => acc + cur.steps, 0);
  const avgFocus = logs.length > 0 ? (logs.reduce((acc, cur) => acc + cur.focusScore, 0) / logs.length).toFixed(1) : '0';
  const totalMinutes = logs.reduce((acc, cur) => acc + cur.durationMinutes, 0);

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchDomain = filterDomain === 'all' || (log.domainId || 'contemplation') === filterDomain;
    const matchStep = filterStep === 'all' || log.linked4PStep === filterStep;
    return matchDomain && matchStep;
  });

  // SVG Chart calculation for Steps & Focus correlation
  const maxSteps = Math.max(...logs.map((l) => l.steps), 10000);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5" />
                인천 읽·걷·쓰 핵심 엔진
              </span>
              <span className="text-xs text-slate-500 font-medium">
                8대 걷기·사색·현장·플랫폼·데이터 다차원 연구소
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              8대 걷기 탐구 영역 & 사색·현장·데이터 실천 플랫폼
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              걷기는 단순한 보행 운동이 아닙니다. 철학적 사색, 도시 공간 실측, 인터뷰 경청, 역사·문학 기행, 생태계 관찰, 그리고 <strong className="text-slate-900 font-semibold">플랫폼 모빌리티 노동과 스마트 도시 환경 데이터 센싱</strong>에 이르는 <strong className="text-slate-900 font-semibold">‘몸으로 사유하는 탐구(Embodied Cognition)’</strong>입니다. 8대 걷기 영역의 방법론을 활성화하고 4P 연구 계획서와 실시간으로 연계하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveSubTab('logs')}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <Footprints className="w-4 h-4 text-emerald-600" />
              <span>사색·현장탐사 일지 ({logs.length}건)</span>
            </button>
            <button
              id="btn-open-add-walk"
              onClick={() => handleOpenAddModalWithDomain(selectedDomainId)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>새 현장 걷기·사색 일지 기록</span>
            </button>
            {onRestoreDefaultLogs && (
              <button
                onClick={onRestoreDefaultLogs}
                title="기본 샘플 사색 일지 복원하기"
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
              >
                <RotateCw className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">일지 복원</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Toast Message */}
        {toastMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Major Sub-Navigation Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('earth')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'earth'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/40'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-300" />
              <span>1순위 메인. 3D 구글 어스 현장 탐색</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-extrabold">
                12개소 3D
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('domains')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'domains'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>2. 8대 걷기 탐구 & 학생 실천 가이드</span>
            </button>
            <button
              onClick={() => setActiveSubTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'logs'
                  ? 'bg-white text-emerald-900 shadow-sm ring-2 ring-emerald-500/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Footprints className="w-4 h-4 text-emerald-600" />
              <span>3. 사색·현장탐사 일지 & 4P 연계</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                {logs.length}건
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('labSpots')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'labSpots'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>4. 우리 연구실 둘레길 스팟</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-semibold">
                {currentLab.walkingSpots.length}곳
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 펼쳐보기
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">현재 활성 연구실:</span>
            <span className="px-2.5 py-1 bg-slate-100 font-bold text-slate-700 rounded-lg border border-slate-200">
              {currentLab.name}
            </span>
          </div>
        </div>

        {/* Priority 1 Main Explorer: 3D Google Earth Spatial & Field Exploration Panel */}
        {(activeSubTab === 'earth' || activeSubTab === 'all') && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <GoogleEarthFieldExplorer
              onInjectNoteToFourP={onInjectNoteToFourP}
              onOpenAddModalWithSpot={handleOpenAddModalWithSpot}
            />
          </div>
        )}

        {/* 8 Walking Inquiry Domains Navigation Cards (Shown in 'domains' or 'all') */}
        {(activeSubTab === 'domains' || activeSubTab === 'all') && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                8대 걷기 탐구 영역 선택 (클릭하여 상세 활성화)
              </span>
              <span className="text-[11px] text-slate-400">
                현재 선택: <strong className="text-slate-700">{selectedDomain.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2.5">
              {WALKING_DOMAINS_DATA.map((domain) => {
                const isSelected = selectedDomainId === domain.id;
                const logCount = logs.filter((l) => (l.domainId || 'contemplation') === domain.id).length;

                return (
                  <button
                    key={domain.id}
                    id={`tab-walking-domain-${domain.id}`}
                    onClick={() => setSelectedDomainId(domain.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                        : 'bg-slate-50/80 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                          isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white text-slate-700 shadow-xs'
                        }`}
                      >
                        {getDomainIcon(domain.iconName, 'w-4 h-4')}
                      </div>
                      <h3 className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {domain.name}
                      </h3>
                      <span
                        className={`text-[10px] block mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {domain.badge}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        {logCount > 0 ? `${logCount}건 기록됨` : '미기록'}
                      </span>
                      {isSelected && (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> 활성
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: Selected Walking Domain Detail Panel (Shown in 'domains' or 'all') */}
      {(activeSubTab === 'domains' || activeSubTab === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Domain Top Info Bar */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${selectedDomain.badgeColor}`}>
                  {selectedDomain.badge}
                </span>
                <span className="text-xs text-slate-500 font-mono">{selectedDomain.englishName}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{selectedDomain.name}</span>
              </h3>
              <p className="text-xs text-emerald-700 font-medium">{selectedDomain.subtitle}</p>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed pt-1">
                {selectedDomain.summary}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                id="btn-record-this-domain"
                onClick={() => handleOpenAddModalWithDomain(selectedDomain.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>이 영역으로 현장 기록하기</span>
              </button>
            </div>
          </div>

          {/* 3 Columns Educational Content Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1: Methodologies & Core Inquiry Questions with Student Writing Space */}
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  핵심 탐구 방법론 & 키워드
                </h4>
                <div className="space-y-1.5 mb-4">
                  {selectedDomain.methods.map((method, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-800 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{method}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {selectedDomain.inquiryKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  현장 사색 및 핵심 발문 (학생 사색 작성란)
                </h4>
                <div className="space-y-3">
                  {selectedDomain.inquiryQuestions.map((q, idx) => {
                    const promptKey = `${selectedDomain.id}-${idx}`;
                    const currentNote = promptNotes[promptKey] ?? '';
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-indigo-950 space-y-2"
                      >
                        <div className="flex items-start gap-2 leading-relaxed">
                          <span className="font-black text-indigo-600">Q{idx + 1}.</span>
                          <span className="font-semibold">{q}</span>
                        </div>

                        {/* Student Writing Space for this prompt */}
                        <div className="pt-1.5 border-t border-indigo-100/70">
                          <label className="text-[11px] font-bold text-indigo-900 block mb-1 flex items-center gap-1">
                            <Edit3 className="w-3 h-3 text-indigo-600" />
                            <span>나의 현장 사색 성찰 작성</span>
                          </label>
                          <textarea
                            rows={2}
                            value={currentNote}
                            onChange={(e) => handlePromptNoteChange(promptKey, e.target.value)}
                            placeholder="이 발문을 마주하며 떠오른 생각, 현장에서 느낀 점을 적어보세요..."
                            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-white border border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y"
                          />
                          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSavePromptToJournal(selectedDomain, q, idx)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-medium flex items-center gap-1"
                            >
                              <Footprints className="w-2.5 h-2.5 text-emerald-600" />
                              <span>일지로 저장</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyPromptTo4P(selectedDomain, q, idx, idx === 1 ? 'P2' : 'P1')}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>4P {idx === 1 ? '문제(P2)' : '현상(P1)'}에 전송</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Col 2: Sample 4P Field Activities with Execution Guide & Student Writing Space */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  추천 4P 연계 현장 활동 & 실행단계 가이드
                </h4>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  {selectedDomain.sampleActivities.length}종 수록
                </span>
              </div>

              <div className="space-y-3.5">
                {selectedDomain.sampleActivities.map((act, index) => {
                  const actKey = `${selectedDomain.id}-${index}`;
                  const currentNote = activityNotes[actKey] ?? '';

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 hover:bg-white transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.target4P === 'P1'
                              ? 'bg-indigo-100 text-indigo-800'
                              : act.target4P === 'P2'
                              ? 'bg-blue-100 text-blue-800'
                              : act.target4P === 'P3'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {act.target4P} 단계 연계
                        </span>
                        <span className="text-[10px] text-slate-500">{act.expectedOutcome}</span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 leading-snug">
                        {act.title}
                      </h5>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{act.purpose}</p>

                      {/* Execution Steps Guide */}
                      <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                          실행 단계 가이드:
                        </span>
                        {act.stepsToTake.map((step, sIdx) => (
                          <div key={sIdx} className="text-slate-700 flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>

                      {/* Student Writing Space for Activity Execution */}
                      <div className="mt-3 p-3 bg-emerald-50/40 rounded-xl border-2 border-emerald-200/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>[학생 작성] 현장 관찰 및 실천 기록 ({act.target4P} 단계)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              handleActivityNoteChange(
                                actKey,
                                act.injectContent
                              )
                            }
                            className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-medium"
                          >
                            예시 초안 불러오기
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={currentNote}
                          onChange={(e) => handleActivityNoteChange(actKey, e.target.value)}
                          placeholder={`위 실행 단계 가이드를 실천하며 현장에서 직접 수집한 사실, 인터뷰, 수치나 실천 기록을 작성하세요...\n(작성 후 아래 버튼을 누르면 4P ${act.target4P} 단계에 직접 반영됩니다)`}
                          className="w-full text-xs text-slate-800 placeholder-slate-400 bg-white border border-emerald-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-y"
                        />
                        <div className="mt-2 pt-2 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveActivityToJournal(selectedDomain, act, index)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Footprints className="w-3 h-3 text-emerald-600" />
                            <span>사색 일지로 자동 등록</span>
                          </button>
                          <button
                            type="button"
                            id={`btn-apply-activity-${selectedDomain.id}-${index}`}
                            onClick={() => handleApplyActivityTo4P(selectedDomain, act, index)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>내 기록 4P {act.target4P}에 전송</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Col 3: Checklist & Incheon Custom Spots with Student Writing Space */}
            <div className="space-y-5">
              {/* Field Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  현장 출발 전 체크리스트
                </h4>
                <div className="space-y-1.5">
                  {selectedDomain.checklists.map((chk, idx) => {
                    const checkKey = `${selectedDomain.id}-${idx}`;
                    const isChecked = !!checkedItems[checkKey];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleChecklist(checkKey)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2.5 transition-all ${
                          isChecked
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-medium'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="leading-snug">{chk}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Incheon Field Recommendation Spots with Student Writing Space */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  인천 맞춤형 추천 답사·사색 스팟
                </h4>
                <div className="space-y-3">
                  {selectedDomain.recommendedSpots.map((spot, idx) => {
                    const spotKey = `${selectedDomain.id}-${idx}`;
                    const currentSpotNote = spotNotes[spotKey] ?? '';

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 text-xs space-y-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-0.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{spot.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mb-1.5">{spot.location}</span>
                          <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">{spot.features}</p>
                          <div className="p-2.5 bg-white rounded-lg border border-emerald-100 text-[11px] text-emerald-950 font-medium italic leading-relaxed">
                            {spot.contemplationPrompt}
                          </div>
                        </div>

                        {/* Student Writing Space for Incheon Spot */}
                        <div className="pt-2 border-t border-emerald-200/60">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                              <Edit3 className="w-3 h-3 text-emerald-600" />
                              <span>[학생 작성] 현장 사색 답변 & P1 관찰 메모</span>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                handleSpotNoteChange(
                                  spotKey,
                                  `[${spot.name} 현장 사색]: ${spot.contemplationPrompt}에 대해 탐구하며, `
                                )
                              }
                              className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-medium"
                            >
                              발문 초안 채우기
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={currentSpotNote}
                            onChange={(e) => handleSpotNoteChange(spotKey, e.target.value)}
                            placeholder="이 장소에서 사색 발문을 마주하며 떠오른 생각이나 구체적 현장 관찰 사실을 작성하세요..."
                            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-white border border-emerald-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-y"
                          />
                          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveSpotToJournal(selectedDomain, spot, idx)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-medium flex items-center gap-1"
                            >
                              <Footprints className="w-2.5 h-2.5 text-emerald-600" />
                              <span>일지에 저장</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplySpotTo4P(selectedDomain, spot, idx)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>4P 현상(P1)에 반영</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Walking Contemplation & Field Exploration Logs Timeline & 4P Integration (Shown in 'logs' or 'all') */}
      {(activeSubTab === 'logs' || activeSubTab === 'all') && (
        <div className="space-y-6">
          {/* Direct Inline Writing Card for Students */}
          <div className="bg-white rounded-2xl p-6 border-2 border-emerald-300 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    새 사색·현장탐사 일지 직접 작성 및 4P 즉시 연계
                  </h3>
                  <p className="text-xs text-slate-500">
                    현장에서 걷고 관찰한 기록을 작성하고, 원하는 4P 단계 연구계획서에 동시 반영할 수 있습니다.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                실시간 4P 자동 동기화 지원
              </span>
            </div>

            <form onSubmit={handleSubmitInlineLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">탐구 영역</label>
                  <select
                    value={inlineDomainId}
                    onChange={(e) => setInlineDomainId(e.target.value as WalkingDomainId)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {WALKING_DOMAINS_DATA.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">답사 일자</label>
                  <input
                    type="date"
                    value={inlineDate}
                    onChange={(e) => setInlineDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">걸음 수 / 시간</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step={500}
                      min={0}
                      value={inlineSteps}
                      onChange={(e) => setInlineSteps(Number(e.target.value))}
                      placeholder="걸음 수"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <input
                      type="number"
                      step={5}
                      min={0}
                      value={inlineDuration}
                      onChange={(e) => setInlineDuration(Number(e.target.value))}
                      placeholder="분"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">연계할 4P 단계</label>
                  <select
                    value={inlineLinkedStep}
                    onChange={(e) => setInlineLinkedStep(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold text-emerald-800 bg-emerald-50/50"
                  >
                    <option value="P1">P1 현상 (공간 관찰, 실태, 문제 제기)</option>
                    <option value="P2">P2 문제 (본질 분석, 원인 규명)</option>
                    <option value="P3">P3 과업 (해결 과업 및 방법론)</option>
                    <option value="P4">P4 실천 (체인지메이커 현장 액션)</option>
                    <option value="general">자유 사색 (일지만 저장)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">답사 장소 및 코스명</label>
                <input
                  type="text"
                  value={inlineCourse}
                  onChange={(e) => setInlineCourse(e.target.value)}
                  placeholder="예: 부평 캠프마켓 ~ 부평역 광장 모빌리티 관찰길"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  사색 및 영감 메모 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={inlineThought}
                  onChange={(e) => setInlineThought(e.target.value)}
                  placeholder="걸으며 관찰한 도시의 모습, 사람들의 표정, 머릿속을 스쳐 지나간 철학적 질문이나 탐구 아이디어를 적어보세요..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-y"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  현장 실측치 / 시민 인터뷰 육성 인용 (선택)
                </label>
                <textarea
                  rows={2}
                  value={inlineFindings}
                  onChange={(e) => setInlineFindings(e.target.value)}
                  placeholder="예: 70대 어르신 구술: “키오스크 앞에만 서면 가슴이 두근거려...” / 횡단보도 신호 대기시간 22초 측정 등"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-y"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inlineSyncToFourP}
                    onChange={(e) => setInlineSyncToFourP(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <span>4P 연구계획서 [{inlineLinkedStep}] 단계 본문에도 즉시 동시 반영</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>사색·현장탐사 일지 저장하기</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Top 4 Metrics & Real-time Contemplation Timer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">누적 사색 걸음수</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-900">{totalSteps.toLocaleString()}</span>
                <span className="text-xs text-slate-500">보</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                목표 7,000보 달성률 {Math.min(100, Math.round((totalSteps / 14000) * 100))}%
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">총 사색·답사 시간</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-900">{totalMinutes}</span>
                <span className="text-xs text-slate-500">분 ({Math.round((totalMinutes / 60) * 10) / 10}시간)</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                평균 산책 시간: {logs.length ? Math.round(totalMinutes / logs.length) : 0}분
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">평균 연구 몰입 지수</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-900">{avgFocus}</span>
                <span className="text-xs text-slate-500">/ 5.0 점</span>
              </div>
              <span className="text-[11px] text-amber-600 font-medium mt-1 block">
                {'★'.repeat(Math.round(Number(avgFocus)))} 최상위 몰입 상태
              </span>
            </div>

            {/* Real-time Walking Stopwatch Timer */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-xl p-4 border border-slate-700 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-400">사색·답사 스톱워치</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="my-1 font-mono text-2xl font-bold text-white tracking-wider text-center">
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleToggleTimer}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 transition-all"
                >
                  {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{timerRunning ? '일시정지' : '산책 시작'}</span>
                </button>
                <button
                  onClick={handleResetTimer}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                  title="리셋"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Visualization Chart: Steps vs Focus Level */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                  일자별 사색 걸음수 & 연구 몰입도 상관관계 그래프
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  걸음 수(막대 바)가 증가할수록 아이디어 발화 및 몰입 지수(라인 포인트)가 상승하는 양의 상관관계를 시각화합니다.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-emerald-200 border border-emerald-400 inline-block"></span>
                  <span>걸음수 (Steps)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  <span>몰입 지수 (Focus 1~5)</span>
                </span>
              </div>
            </div>

            {/* SVG Visualization */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px] h-64 relative pt-6 pb-6 px-4 bg-slate-50/70 rounded-xl border border-slate-200/60 flex items-end justify-between gap-4">
                {logs.map((log) => {
                  const barHeightPercent = Math.max(15, Math.round((log.steps / maxSteps) * 80));
                  const focusHeightPercent = Math.round((log.focusScore / 5) * 85);

                  return (
                    <div key={log.id} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                        <span className="font-bold">{log.date}</span>: {log.steps.toLocaleString()}보 ({log.durationMinutes}분)
                        <br />
                        몰입도: {log.focusScore}점 / 5점
                      </div>

                      {/* Focus Point Indicator */}
                      <div
                        className="absolute w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white shadow-sm z-10 transition-all group-hover:scale-125"
                        style={{ bottom: `${focusHeightPercent}%` }}
                      ></div>

                      {/* Step Bar */}
                      <div
                        className="w-full max-w-[48px] rounded-t-lg bg-emerald-200 group-hover:bg-emerald-300 border border-emerald-300 transition-all relative"
                        style={{ height: `${barHeightPercent}%` }}
                      >
                        <span className="text-[10px] font-bold text-emerald-800 absolute -top-5 left-1/2 -translate-x-1/2">
                          {(log.steps / 1000).toFixed(1)}k
                        </span>
                      </div>

                      {/* X Axis Label */}
                      <div className="mt-2 text-center">
                        <span className="text-[11px] font-medium text-slate-600 block">
                          {log.date.split('-').slice(1).join('/')}
                        </span>
                        <span className="text-[9px] text-slate-400 block truncate max-w-[80px]">
                          {log.courseName.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Walking Contemplation & Field Exploration Logs Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  사색·현장탐사 일지 타임라인 & 4P 연구계획서 전송
                  <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-black">
                    {logs.length}건
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  걸으며 수집한 관찰 기록과 인터뷰 구술을 클릭 한 번으로 연구 계획서(P1~P4) 본문으로 반영하세요.
                </p>
              </div>

              {/* Filters & Restore button */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {onRestoreDefaultLogs && (
                  <button
                    onClick={onRestoreDefaultLogs}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>기본 일지 복원</span>
                  </button>
                )}

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <Filter className="w-3 h-3 text-slate-400 ml-1" />
                  <select
                    value={filterDomain}
                    onChange={(e) => setFilterDomain(e.target.value)}
                    className="bg-transparent text-slate-700 text-xs font-medium focus:outline-hidden pr-2"
                  >
                    <option value="all">모든 탐구 영역</option>
                    <option value="contemplation">사색·성찰</option>
                    <option value="field-observation">현장답사·공간관찰</option>
                    <option value="interview-dialogue">사람·인터뷰</option>
                    <option value="literature-history">역사·문학기행</option>
                    <option value="eco-nature">생태·자연탐사</option>
                    <option value="action-campaign">실천·캠페인</option>
                    <option value="platform-walk">플랫폼 걷기</option>
                    <option value="data-walk">데이터 걷기</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <select
                    value={filterStep}
                    onChange={(e) => setFilterStep(e.target.value)}
                    className="bg-transparent text-slate-700 text-xs font-medium focus:outline-hidden pr-2"
                  >
                    <option value="all">모든 4P 단계</option>
                    <option value="P1">P1 현상</option>
                    <option value="P2">P2 문제</option>
                    <option value="P3">P3 과업</option>
                    <option value="P4">P4 실천</option>
                    <option value="general">자유 사색</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredLogs.length > 0 ? (
              <div className="space-y-3.5">
                {filteredLogs.map((log) => {
                  const matchedDomain = WALKING_DOMAINS_DATA.find((d) => d.id === log.domainId) || WALKING_DOMAINS_DATA[0];

                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 hover:bg-white transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/50">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${matchedDomain.badgeColor}`}>
                            {matchedDomain.name}
                          </span>
                          <span className="font-bold text-slate-900">{log.courseName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {log.date}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {log.durationMinutes}분
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {log.steps.toLocaleString()} 걸음
                          </span>
                          <span className="text-amber-500 text-xs font-bold">
                            {'★'.repeat(log.focusScore)}
                          </span>
                          <button
                            onClick={() => onDeleteWalkingLog(log.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="기록 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Thought note */}
                      <div className="my-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          사색 및 영감 메모:
                        </span>
                        <p className="text-xs text-slate-800 italic leading-relaxed">
                          &ldquo;{log.thoughtNote}&rdquo;
                        </p>
                      </div>

                      {/* Findings or Quote if exists */}
                      {log.findings && (
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed my-2">
                          <span className="font-bold text-indigo-700 mr-1.5 flex items-center gap-1 inline-flex">
                            <MessageSquare className="w-3 h-3" /> 현장 실측 / 육성 인용:
                          </span>
                          {log.findings}
                        </div>
                      )}

                      {/* Photo attachments */}
                      {log.photos && log.photos.length > 0 && (
                        <div className="my-2.5 p-2 rounded-lg bg-emerald-50/40 border border-emerald-200/60">
                          <span className="text-[10px] font-bold text-emerald-900 flex items-center gap-1 mb-1.5">
                            <Camera className="w-3 h-3 text-emerald-600" />
                            <span>현장 답사 인증 사진 ({log.photos.length}장)</span>
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {log.photos.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => setViewingPhoto(p)}
                                className="group relative rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs cursor-pointer hover:border-emerald-400 transition-all"
                              >
                                <img
                                  src={p.url}
                                  alt={p.caption || '현장 사진'}
                                  className="w-24 h-16 sm:w-32 sm:h-20 object-cover group-hover:scale-105 transition-transform"
                                />
                                {p.caption && (
                                  <div className="p-1 bg-slate-900/80 text-white text-[9px] truncate max-w-[6rem] sm:max-w-[8rem]">
                                    {p.caption}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Direct Inject to 4P Step */}
                      <div className="pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] border-t border-slate-100">
                        <span className="text-slate-400 text-[10px]">
                          연계 추천: <strong className="text-slate-700">{log.linked4PStep === 'general' ? '자유 사색' : log.linked4PStep}</strong>
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 mr-1 text-[10px]">계획서로 전송:</span>
                          {(['P1', 'P2', 'P3', 'P4'] as const).map((step) => (
                            <button
                              key={step}
                              id={`btn-inject-${log.id}-${step}`}
                              onClick={() =>
                                handleInject(
                                  step,
                                  `[${matchedDomain.name} 현장 기록]: ${log.thoughtNote}${
                                    log.findings ? `\n(구체적 실측/증언: ${log.findings})` : ''
                                  }`
                                )
                              }
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all flex items-center gap-0.5"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>{step}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <p className="text-xs">현재 등록된 현장 걷기 사색 일지가 없습니다.</p>
                {onRestoreDefaultLogs && (
                  <button
                    onClick={onRestoreDefaultLogs}
                    className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>기본 예시 사색 일지 5건 복원하기</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: Recommended Hotspots from Current Project's Lab (Shown in 'labSpots' or 'all') */}
      {(activeSubTab === 'labSpots' || activeSubTab === 'all') && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                현재 전공 연구실({currentLab.name}) 연계 인천 현장 걷기 코스
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                각 코스에서 학생 관찰 메모를 작성해 4P 현상(P1)에 바로 인용하거나, 상세 보기를 통해 고화질 사진을 확인하세요.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              총 {currentLab.walkingSpots.length}개 코스
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentLab.walkingSpots.map((spot, idx) => {
              const labKey = spot.id || `labspot-${idx}`;
              const currentLabNote = labSpotNotes[labKey] ?? '';

              return (
                <div
                  key={spot.id || idx}
                  className="p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-xs flex flex-col justify-between group"
                >
                  <div>
                    <div
                      onClick={() => setSpotDetailModal(spot)}
                      className="w-full h-36 rounded-xl overflow-hidden bg-slate-200 mb-3 relative cursor-pointer"
                    >
                      <img
                        src={spot.imageUrl}
                        alt={spot.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {spot.district}
                      </span>
                      {spot.isRealIncheonPhoto ? (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-700/90 text-white backdrop-blur-xs flex items-center gap-0.5 border border-emerald-400/40">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-200" />
                          인천 실사
                        </span>
                      ) : (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-slate-800/90 text-amber-200 backdrop-blur-xs flex items-center gap-0.5 border border-amber-500/30">
                          <Info className="w-2.5 h-2.5 text-amber-300" />
                          탐구 안내
                        </span>
                      )}
                      {spot.courseDistance && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                          {spot.courseDistance.split('(')[0]}
                        </span>
                      )}
                      <div className="absolute bottom-2 left-2 right-24 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-slate-200 truncate">
                        {spot.imageCaption}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{spot.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mb-2 truncate">
                      {spot.location}
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
                      {spot.incheonFeatures}
                    </p>

                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-950 font-medium italic leading-relaxed mb-3">
                      {spot.contemplationPrompt}
                    </div>

                    {/* Student Writing Space for Lab Spot */}
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-emerald-600" />
                          <span>[학생 작성] 현장 답사 사색 & 관찰 기록</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleLabSpotNoteChange(
                              labKey,
                              `[${spot.name} 답사]: ${spot.contemplationPrompt}에 대한 현장 사색과 실측 결과, `
                            )
                          }
                          className="text-[9px] text-emerald-700 hover:text-emerald-900 underline font-medium"
                        >
                          초안 채우기
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={currentLabNote}
                        onChange={(e) => handleLabSpotNoteChange(labKey, e.target.value)}
                        placeholder="이 장소에서 직접 관찰하거나 느낀 점, 수집한 사실을 적으세요..."
                        className="w-full text-xs text-slate-800 placeholder-slate-400 bg-emerald-50/30 border border-emerald-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-y"
                      />
                      <div className="mt-1.5 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveLabSpotToJournal(spot, idx)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-medium flex items-center gap-1"
                        >
                          <Footprints className="w-2.5 h-2.5 text-emerald-600" />
                          <span>일지 저장</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyLabSpotTo4P(spot, idx)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>4P 현상(P1) 전송</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSpotDetailModal(spot)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span>사진 & 인천 특징 상세 모달 보기</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spot Detail Modal */}
      {spotDetailModal && (
        <WalkingSpotDetailModal
          spot={spotDetailModal}
          labName={currentLab.name}
          onClose={() => setSpotDetailModal(null)}
          onApplyToProject={(spot, studentReflection) => {
            const textToInject =
              studentReflection && studentReflection.trim()
                ? `[인천 현장 탐구 장소: ${spot.name} (${spot.district})]\n${studentReflection}\n(장소 특징: ${spot.incheonFeatures})\n(현장 사색 발문: ${spot.contemplationPrompt})`
                : `[인천 현장 탐구 장소: ${spot.name} (${spot.district})]\n${spot.incheonFeatures}\n(현장 사색 발문: ${spot.contemplationPrompt})`;
            onInjectNoteToFourP('phenomenon', textToInject);
            showToast(`'${spot.name}' 현장 사색 메모를 4P 현상(P1)에 반영했습니다.`);
          }}
        />
      )}

      {/* Modal: Add Walking & Field Exploration Log */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-emerald-600" />
                새 걷기·사색·현장탐사 일지 기록
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewLog} className="space-y-4 mt-4 text-xs">
              {/* Walking Domain Selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">걷기 탐구 영역</label>
                <select
                  value={newDomainId}
                  onChange={(e) => {
                    const domId = e.target.value as WalkingDomainId;
                    setNewDomainId(domId);
                    const target = WALKING_DOMAINS_DATA.find((d) => d.id === domId);
                    if (target) {
                      setNewActivityType(target.name);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {WALKING_DOMAINS_DATA.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">날짜</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">걸음 수 (Steps)</label>
                  <input
                    type="number"
                    value={newSteps}
                    onChange={(e) => setNewSteps(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">소요 시간 (분)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">몰입 집중도 (1~5점)</label>
                  <select
                    value={newFocus}
                    onChange={(e) => setNewFocus(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value={5}>★★★★★ (5점 - 최고의 영감과 몰입)</option>
                    <option value={4}>★★★★☆ (4점 - 깊은 생각 정리)</option>
                    <option value={3}>★★★☆☆ (3점 - 가벼운 환기)</option>
                    <option value={2}>★★☆☆☆ (2점 - 단순 보행)</option>
                    <option value={1}>★☆☆☆☆ (1점 - 산만함)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">산책 / 답사 장소</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="예: 배다리 헌책방 골목, 신포국제시장, 소래습지생태공원"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  사색 및 영감 메모 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newThought}
                  onChange={(e) => setNewThought(e.target.value)}
                  placeholder="걸으면서 떠오른 생각, 질문, 혹은 연구 주제와 관련해 갑자기 번뜩인 아이디어를 적어보세요..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  현장 구체적 실측 / 육성 인터뷰 증언 (선택)
                </label>
                <textarea
                  rows={2}
                  value={newFindings}
                  onChange={(e) => setNewFindings(e.target.value)}
                  placeholder="단차 몇 cm 발견, 상인 어르신과의 대화 인용구, 수질 측정 결과 등 구체적 데이터를 적어보세요."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">연계할 4P 단계</label>
                <select
                  value={newLinkedStep}
                  onChange={(e) => setNewLinkedStep(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="P1">P1 현상 (관찰한 사실·실측 데이터와 연계)</option>
                  <option value="P2">P2 문제 (사회적 불평등과 원인 분석과 연계)</option>
                  <option value="P3">P3 과업 (전공 해결 아이디어 구상과 연계)</option>
                  <option value="P4">P4 실천 (구체적인 캠페인·행동 제안과 연계)</option>
                  <option value="general">일반 사색 (전체적인 마음가짐)</option>
                </select>
              </div>

              {/* Feature 3: 현장 답사 사진·인증 스케치 첨부 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>현장 답사 인증 사진 첨부 (선택, 최대 3장)</span>
                  </label>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3 h-3" />
                    <span>{isCompressingPhoto ? '압축 중...' : '사진 선택/촬영'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      disabled={isCompressingPhoto || newPhotos.length >= 3}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-[10px] text-slate-500">
                  현장 키오스크, 보행로 단차, 갯벌 생태 등 관찰 대상을 스마트폰으로 촬영하거나 스크린샷을 첨부하세요.
                </p>

                {newPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {newPhotos.map((photo) => (
                      <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-300 bg-white">
                        <img src={photo.url} alt={photo.caption || '답사 사진'} className="w-full h-16 object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={photo.caption || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewPhotos((prev) =>
                              prev.map((p) => (p.id === photo.id ? { ...p, caption: val } : p))
                            );
                          }}
                          placeholder="사진 설명 입력"
                          className="w-full text-[10px] p-1 border-t border-slate-200 focus:outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  사색·답사 일지 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Fullsize Photo View */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{viewingPhoto.caption || '현장 답사 인증 사진'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center">
              <img
                src={viewingPhoto.url}
                alt={viewingPhoto.caption || '답사 사진 원본'}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            {viewingPhoto.caption && (
              <p className="text-xs text-slate-600 text-center font-medium">
                {viewingPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
