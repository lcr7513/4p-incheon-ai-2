import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Footprints,
  TrendingUp,
  Cpu,
  Leaf,
  Activity,
  Palette,
  Sparkles,
  ArrowRight,
  MapPin,
  Check,
  Compass,
  Clock,
  Quote,
  Eye,
  CheckCircle2,
  FileText,
  Navigation,
  ShieldCheck,
  Info,
  Edit3,
  Send,
  Save,
  RotateCcw,
} from 'lucide-react';
import { LabId, LabInfo, ResearchProject, WalkingSpot, FourPData, WalkingLog, GisNavigationPreset } from '../types';
import { LABS_DATA } from '../data/labsData';
import { LAB_MODEL_PROJECTS } from '../data/archiveData';
import { WalkingSpotDetailModal } from './WalkingSpotDetailModal';

interface LabsExplorerViewProps {
  currentProject: ResearchProject;
  onApplyLabTopic: (labId: LabId, topic: LabInfo['sampleTopics'][0]) => void;
  onSwitchLab: (labId: LabId) => void;
  onInjectWalkingSpotToProject?: (spot: WalkingSpot) => void;
  onNavigateTab?: (tab: string) => void;
  onInjectNoteToFourP?: (step: keyof FourPData, note: string) => void;
  onAddWalkingLog?: (log: WalkingLog) => void;
  onUpdateProject?: (partial: Partial<ResearchProject>) => void;
  onLoadLabModelExample?: (labId: LabId) => void;
  onOpenGisWithPreset?: (preset: GisNavigationPreset) => void;
}

export const LabsExplorerView: React.FC<LabsExplorerViewProps> = ({
  currentProject,
  onApplyLabTopic,
  onSwitchLab,
  onInjectWalkingSpotToProject,
  onNavigateTab,
  onInjectNoteToFourP,
  onAddWalkingLog,
  onUpdateProject,
  onLoadLabModelExample,
  onOpenGisWithPreset,
}) => {
  const [selectedLabId, setSelectedLabId] = useState<LabId>(currentProject.labId || 'humanities');
  const selectedLab = LABS_DATA.find((l) => l.id === selectedLabId) || LABS_DATA[0];

  // Active walking course tab index
  const [activeSpotIndex, setActiveSpotIndex] = useState<number>(0);

  // Modal state for viewing expanded image & Incheon details
  const [modalSpot, setModalSpot] = useState<WalkingSpot | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Student writing notes for Lab Core Inquiry Questions
  const [questionNotes, setQuestionNotes] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = localStorage.getItem(`edu4p_lab_question_notes_${currentProject.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Student writing notes for Lab Sample Topics
  const [topicNotes, setTopicNotes] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = localStorage.getItem(`edu4p_lab_topic_notes_${currentProject.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Student writing notes for Walking Spots
  const [spotNotes, setSpotNotes] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = localStorage.getItem(`edu4p_lab_spot_notes_${currentProject.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keep notes synchronized if project changes
  useEffect(() => {
    try {
      const qSaved = localStorage.getItem(`edu4p_lab_question_notes_${currentProject.id}`);
      if (qSaved) setQuestionNotes(JSON.parse(qSaved));
      const tSaved = localStorage.getItem(`edu4p_lab_topic_notes_${currentProject.id}`);
      if (tSaved) setTopicNotes(JSON.parse(tSaved));
      const sSaved = localStorage.getItem(`edu4p_lab_spot_notes_${currentProject.id}`);
      if (sSaved) setSpotNotes(JSON.parse(sSaved));
    } catch (e) {
      console.error(e);
    }
  }, [currentProject.id]);

  // Handlers for Question notes
  const handleQuestionNoteChange = (key: string, value: string) => {
    setQuestionNotes((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(`edu4p_lab_question_notes_${currentProject.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleAdoptAsMainQuestion = (q: string, userNote?: string) => {
    const finalQuestion = userNote && userNote.trim() ? userNote.trim() : q;
    if (onUpdateProject) {
      onUpdateProject({ mainQuestion: finalQuestion });
    }
    showToast(`연구실 핵심 발문이 연구계획서의 '핵심 질문'으로 설정되었습니다!`);
  };

  const handleSendQuestionTo4P = (
    q: string,
    idx: number,
    note: string,
    step: keyof FourPData
  ) => {
    if (!onInjectNoteToFourP) {
      showToast('4P 연구계획서 전송 기능이 준비 중입니다.');
      return;
    }
    const stepLabel = step === 'phenomenon' ? 'P1(현상)' : step === 'problem' ? 'P2(문제)' : step === 'project' ? 'P3(과업)' : 'P4(실천)';
    const textToInject = `[${selectedLab.name} 사회문제 발문 Q${idx + 1} 성찰]\n- 발문: ${q}\n- 학생 관찰 및 문제의식: ${note.trim() || '인천 지역 현장에서 마주하는 사회적 맥락과 탐구 착안점 도출'}`;
    onInjectNoteToFourP(step, textToInject);
    showToast(`성찰 내용이 4P 연구계획서 ${stepLabel}에 성공적으로 반영되었습니다.`);
  };

  const handleSaveQuestionToJournal = (
    lab: LabInfo,
    q: string,
    idx: number,
    note: string
  ) => {
    if (!onAddWalkingLog) {
      showToast('일지 등록 기능이 준비 중입니다.');
      return;
    }
    const newLog: WalkingLog = {
      id: `lab-q-${Date.now()}-${idx}`,
      date: new Date().toISOString().split('T')[0],
      steps: 3800,
      durationMinutes: 40,
      courseName: `${lab.name} 학문 발문 탐구 (Q${idx + 1})`,
      thoughtNote: `[${lab.name} 사회문제 핵심 발문 Q${idx + 1}]\n질문: ${q}\n\n[학생 성찰 기록]\n${note.trim() || '사회문제 발문을 중심으로 인천 지역사회의 공간과 사람을 성찰함.'}`,
      focusScore: 5,
      linked4PStep: idx === 1 ? 'P2' : 'P1',
      domainId: 'contemplation',
      activityType: '연구실 핵심 발문 성찰',
      findings: note.trim() || q,
    };
    onAddWalkingLog(newLog);
    showToast(`사색·현장탐사 일지로 안전하게 등록되었습니다!`);
  };

  // Handlers for Topic notes
  const handleTopicNoteChange = (key: string, value: string) => {
    setTopicNotes((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(`edu4p_lab_topic_notes_${currentProject.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleLoadTopicDraft = (topicKey: string, topic: LabInfo['sampleTopics'][0]) => {
    const draft = `[${topic.title} - 인천 현장 맞춤 구상]\n• 현장 관찰 착안점(P1): ${topic.p1}\n• 탐구 과업 아이디어(P3): ${topic.p3}\n• 나의 인천 현장 계획 및 보완점: `;
    handleTopicNoteChange(topicKey, draft);
    showToast('예시 초안을 작성란에 불러왔습니다. 자유롭게 수정해보세요.');
  };

  const handleStartResearchWithStudentNote = (
    labId: LabId,
    topic: LabInfo['sampleTopics'][0],
    customNote?: string
  ) => {
    const enhancedTopic = {
      ...topic,
      p1: customNote && customNote.trim()
        ? `${topic.p1}\n\n[학생 인천 현장 맞춤 구상]\n${customNote.trim()}`
        : topic.p1,
    };
    onApplyLabTopic(labId, enhancedTopic);
    if (onNavigateTab) {
      onNavigateTab('workspace');
    }
  };

  const handleApplyFullModelExample = (labId: LabId) => {
    const target = LAB_MODEL_PROJECTS[labId];
    if (!target) return;
    if (onLoadLabModelExample) {
      onLoadLabModelExample(labId);
    } else if (onUpdateProject) {
      onUpdateProject({
        ...target,
        isDemo: true,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
    showToast(`[${selectedLab.name}] 완성형 모범 탐구 계획서가 워크스페이스에 적용되었습니다!`);
    if (onNavigateTab) {
      onNavigateTab('workspace');
    }
  };

  const handleSendTopicNoteTo4P = (
    topic: LabInfo['sampleTopics'][0],
    note: string,
    step: keyof FourPData
  ) => {
    if (!onInjectNoteToFourP) {
      showToast('4P 연구계획서 전송 기능이 준비 중입니다.');
      return;
    }
    const stepLabel = step === 'phenomenon' ? 'P1(현상)' : 'P3(과업)';
    const textToInject = `[${topic.title} - 학생 현장 구상]\n- 핵심 질문: ${topic.mainQuestion}\n- 학생 구상 내용: ${note.trim() || (step === 'phenomenon' ? topic.p1 : topic.p3)}`;
    onInjectNoteToFourP(step, textToInject);
    showToast(`내용이 4P 연구계획서 ${stepLabel}에 추가되었습니다.`);
  };

  const handleSaveTopicToJournal = (
    lab: LabInfo,
    topic: LabInfo['sampleTopics'][0],
    index: number,
    note: string
  ) => {
    if (!onAddWalkingLog) {
      showToast('일지 등록 기능이 준비 중입니다.');
      return;
    }
    const newLog: WalkingLog = {
      id: `lab-topic-${Date.now()}-${index}`,
      date: new Date().toISOString().split('T')[0],
      steps: 4200,
      durationMinutes: 45,
      courseName: `${lab.name} 탐구 주제 기획 (${topic.title.slice(0, 22)}...)`,
      thoughtNote: `[${topic.title}]\n질문: ${topic.mainQuestion}\n\n[학생 탐구 구상]\n${note.trim() || topic.p1}`,
      focusScore: 5,
      linked4PStep: 'P1',
      domainId: 'field-observation',
      activityType: '4P 탐구 주제 설계 및 현장 기획',
      findings: note.trim() || topic.p3,
    };
    onAddWalkingLog(newLog);
    showToast(`사색·현장탐사 일지로 안전하게 등록되었습니다!`);
  };

  // Handlers for Walking Spot notes
  const handleSpotNoteChange = (key: string, value: string) => {
    setSpotNotes((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(`edu4p_lab_spot_notes_${currentProject.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleSendSpotNoteTo4P = (spot: WalkingSpot, note: string) => {
    if (!onInjectNoteToFourP) {
      showToast('4P 연구계획서 전송 기능이 준비 중입니다.');
      return;
    }
    const textToInject = `[${spot.name} (${spot.district}) 현장 답사 성찰]\n- 장소 특성: ${spot.incheonFeatures}\n- 사색 발문: ${spot.contemplationPrompt}\n- 학생 관찰 및 사색 기록: ${note.trim() || '현장 방문을 통한 도시 공간 및 지역사회 맥락 관찰'}`;
    onInjectNoteToFourP('phenomenon', textToInject);
    showToast(`현장 관찰 기록이 4P 연구계획서 P1(현상)에 반영되었습니다.`);
  };

  const handleSaveSpotNoteToJournal = (lab: LabInfo, spot: WalkingSpot, note: string) => {
    if (!onAddWalkingLog) {
      showToast('일지 등록 기능이 준비 중입니다.');
      return;
    }
    const newLog: WalkingLog = {
      id: `lab-spot-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      steps: 4500,
      durationMinutes: 45,
      courseName: `${spot.name} (${spot.district})`,
      thoughtNote: `[${spot.name} 사색 발문]\n${spot.contemplationPrompt}\n\n[학생 현장 기록]\n${note.trim() || spot.incheonFeatures}`,
      focusScore: 5,
      linked4PStep: 'P1',
      domainId: 'field-observation',
      activityType: '인천 현장 답사 및 공간 관찰',
      findings: note.trim() || spot.inquiryConnection,
    };
    onAddWalkingLog(newLog);
    showToast(`인천 현장 탐사 사색일지로 안전하게 등록되었습니다!`);
  };

  // Safely get active spot
  const activeSpot =
    selectedLab.walkingSpots[activeSpotIndex] || selectedLab.walkingSpots[0];

  const getLabIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Concept */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              6개 전공 연구실 큐레이션
            </span>
            <span className="text-xs text-slate-500">전공 학문과 인천 지역사회의 융합 탐구</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            6대 전공 연구실(Laboratories) 상세 탐색
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            나의 진로 및 관심 학문에 부합하는 연구실을 선택하여 학문적 방법론, 핵심 탐구 질문, 전공 필독서, 그리고 인천의 장소성과 역사적 맥락이 살아 숨 쉬는 현장 걷기 코스를 탐색해보세요.
          </p>
        </div>

        {/* 6 Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6">
          {LABS_DATA.map((lab) => {
            const isSelected = selectedLabId === lab.id;
            const isCurrentProject = currentProject.labId === lab.id;

            return (
              <button
                key={lab.id}
                id={`tab-lab-${lab.id}`}
                onClick={() => {
                  setSelectedLabId(lab.id);
                  setActiveSpotIndex(0); // Reset walking spot index on lab change
                }}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 relative ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-slate-50/70 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      isSelected ? 'bg-white/10 text-indigo-300' : 'bg-white text-slate-700 shadow-xs'
                    }`}
                  >
                    {getLabIcon(lab.iconName)}
                  </div>
                  <h3 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {lab.name}
                  </h3>
                  <span
                    className={`text-[10px] block mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {lab.englishName.split(' ')[0]}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[10px]">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    {lab.coreMajors[0]}
                  </span>
                  {isCurrentProject && (
                    <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 내 연구
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Lab Detail Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Lab Top Info Bar */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${selectedLab.badgeColor}`}>
                {selectedLab.badge}
              </span>
              <span className="text-xs text-slate-500">{selectedLab.englishName}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{selectedLab.name}</h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{selectedLab.description}</p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {currentProject.labId !== selectedLab.id ? (
              <button
                id="btn-select-lab"
                onClick={() => onSwitchLab(selectedLab.id)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>이 연구실로 지정하기</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 현재 선택된 연구실
              </span>
            )}
          </div>
        </div>

        {/* Lab Exemplar Highlight Card */}
        {(() => {
          const modelProj = LAB_MODEL_PROJECTS[selectedLab.id];
          if (!modelProj) return null;
          return (
            <div className="mx-6 mt-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-indigo-50/90 border border-indigo-200/90 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-2xs">
                      🏆 4P 완성형 모범 탐구 예시
                    </span>
                    <span className="text-xs text-indigo-900 font-semibold">
                      {modelProj.affiliation} · {modelProj.author}
                    </span>
                    {modelProj.evaluationResult && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                        AI 정밀평가 {modelProj.evaluationResult.totalScore}점
                      </span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {modelProj.title}
                  </h4>
                  <p className="text-xs text-indigo-950 font-medium">
                    <strong className="text-indigo-700">핵심 탐구 질문:</strong> {modelProj.mainQuestion}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyFullModelExample(selectedLab.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>이 모범 예시로 탐구 시작 (1클릭 불러오기)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4P Summary Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-indigo-100">
                  <div className="font-bold text-indigo-700 text-[11px] mb-1">P1. 현상 (Fact)</div>
                  <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">
                    {modelProj.fourP.phenomenon}
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-blue-100">
                  <div className="font-bold text-blue-700 text-[11px] mb-1">P2. 문제 (Cause)</div>
                  <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">
                    {modelProj.fourP.problem}
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-purple-100">
                  <div className="font-bold text-purple-700 text-[11px] mb-1">P3. 과업 (Method)</div>
                  <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">
                    {modelProj.fourP.project}
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-emerald-100">
                  <div className="font-bold text-emerald-700 text-[11px] mb-1">P4. 실천 (Action)</div>
                  <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">
                    {modelProj.fourP.practice}
                  </p>
                </div>
              </div>

              {/* Read & Walk Footer info */}
              <div className="mt-3 pt-2.5 border-t border-indigo-100/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  {modelProj.walkingLogs[0] && (
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                      연계 걷기 답사: <strong>{modelProj.walkingLogs[0].courseName}</strong> ({modelProj.walkingLogs[0].steps.toLocaleString()}보)
                    </span>
                  )}
                  {modelProj.readingLogs[0] && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      연계 독서: <strong>{modelProj.readingLogs[0].title}</strong> ({modelProj.readingLogs[0].author})
                    </span>
                  )}
                </div>
                <span className="text-indigo-600 font-medium">
                  * 학생들은 위 모범 구조를 참고하여 본인의 학교/지역 데이터로 발전시킬 수 있습니다.
                </span>
              </div>
            </div>
          );
        })()}

        {/* Content Body: 3 Columns Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Core Majors & Core Inquiry Questions */}
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                연계 전공 및 핵심 키워드
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedLab.coreMajors.map((major, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/60"
                  >
                    {major}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedLab.inquiryKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  연구실 핵심 사회문제 발문
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">{selectedLab.inquiryCoreQuestions.length}문항 수록</span>
              </h4>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                전공 연구실의 대표 사회문제 발문을 읽고, 아래 학생 작성란에 나의 탐구 시각과 인천 현장의 문제의식을 직접 작성해보세요.
              </p>
              <div className="space-y-3">
                {selectedLab.inquiryCoreQuestions.map((q, idx) => {
                  const qKey = `${selectedLabId}-q-${idx}`;
                  const currentNote = questionNotes[qKey] || '';
                  const hasWritten = currentNote.trim().length > 0;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all text-xs space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="font-extrabold text-indigo-600 shrink-0 text-[13px]">
                          Q{idx + 1}.
                        </span>
                        <p className="font-bold text-slate-800 leading-snug">
                          {q}
                        </p>
                      </div>

                      {/* Student Writing Space for Lab Inquiry Question */}
                      <div className="pt-2 border-t border-slate-200/70 bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                            <Edit3 className="w-3 h-3 text-indigo-600" />
                            <span>[학생 작성] 나의 탐구 시각 & 인천 현장 문제의식 성찰</span>
                          </label>
                          {hasWritten && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              저장됨
                            </span>
                          )}
                        </div>

                        <textarea
                          rows={2}
                          value={currentNote}
                          onChange={(e) => handleQuestionNoteChange(qKey, e.target.value)}
                          placeholder={`Q${idx + 1} 발문을 마주하며 떠오른 생각, 인천 현장에서 마주할 수 있는 실태나 나의 탐구 시각을 작성해보세요...`}
                          className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y transition-all leading-relaxed"
                        />

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleAdoptAsMainQuestion(q, currentNote)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="이 질문을 내 4P 연구의 핵심 질문으로 채택합니다"
                            >
                              <Compass className="w-3 h-3 text-indigo-600" />
                              <span>핵심 질문으로 채택</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveQuestionToJournal(selectedLab, q, idx, currentNote)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              title="사색 일지로 등록합니다"
                            >
                              <Footprints className="w-3 h-3 text-emerald-600" />
                              <span>사색일지 등록</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSendQuestionTo4P(q, idx, currentNote, 'phenomenon')}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="4P 연구계획서 현상(P1) 항목에 추가합니다"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>P1(현상) 반영</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendQuestionTo4P(q, idx, currentNote, 'problem')}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="4P 연구계획서 문제(P2) 항목에 추가합니다"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>P2(문제) 반영</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Recommended 4P Sample Topics */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>추천 4P 탐구 주제 및 설계안</span>
              <span className="text-[10px] text-indigo-600 font-semibold">{selectedLab.sampleTopics.length}종 수록</span>
            </h4>

            <div className="space-y-3.5">
              {selectedLab.sampleTopics.map((topic, index) => {
                const topicKey = `${selectedLabId}-topic-${index}`;
                const currentTopicNote = topicNotes[topicKey] || '';
                const hasWrittenTopic = currentTopicNote.trim().length > 0;

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all group shadow-2xs"
                  >
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 leading-snug">
                      {topic.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      <span className="font-semibold text-slate-700">핵심 질문:</span> {topic.mainQuestion}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="font-bold text-indigo-600 block mb-0.5">P1 현상:</span>
                        <p className="line-clamp-2 text-slate-600 leading-relaxed">{topic.p1}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="font-bold text-purple-600 block mb-0.5">P3 과업:</span>
                        <p className="line-clamp-2 text-slate-600 leading-relaxed">{topic.p3}</p>
                      </div>
                    </div>

                    {topic.gisHint && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-teal-50/75 border border-teal-200/80 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-teal-800">
                            <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                            <span>인천 GIS 지표 연계 힌트 · {topic.gisHint.metricLabel}</span>
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-teal-700 border border-teal-200">
                            {topic.gisHint.leftDistrictName} vs {topic.gisHint.rightDistrictName}
                          </span>
                        </div>
                        <p className="text-[11px] text-teal-900/90 leading-snug">
                          {topic.gisHint.disparityTip}
                        </p>
                        {onOpenGisWithPreset && (
                          <div className="pt-0.5 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenGisWithPreset({
                                  metricKey: topic.gisHint!.metricKey,
                                  leftDistrictId: topic.gisHint!.leftDistrictId,
                                  rightDistrictId: topic.gisHint!.rightDistrictId,
                                  viewTab: 'split-compare',
                                  sourceTitle: topic.title,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold transition-colors shadow-2xs cursor-pointer"
                            >
                              <span>GIS 1:1 격차 비교 바로 열기</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Student Writing Space for this Topic */}
                    <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/80 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-indigo-600" />
                          <span>[학생 작성] 나의 맞춤 탐구 구상 & 인천 현장 계획</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          {hasWrittenTopic && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              작성됨
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleLoadTopicDraft(topicKey, topic)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
                            title="이 추천 주제의 기본 현상(P1)과 과업(P3)을 편집창에 불러옵니다"
                          >
                            예시 초안 불러오기
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={currentTopicNote}
                        onChange={(e) => handleTopicNoteChange(topicKey, e.target.value)}
                        placeholder="이 추천 주제를 바탕으로 인천 지역에서 직접 조사하고 싶은 구체적 현상(P1), 개선 아이디어(P3), 또는 학생 본인의 문제의식을 작성하세요..."
                        className="w-full text-xs text-slate-800 placeholder-slate-400 bg-white border border-indigo-200/80 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y transition-all leading-relaxed"
                      />

                      <div className="pt-2 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveTopicToJournal(selectedLab, topic, index, currentTopicNote)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Footprints className="w-2.5 h-2.5 text-emerald-600" />
                          <span>사색일지 등록</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendTopicNoteTo4P(topic, currentTopicNote, 'phenomenon')}
                            className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>P1(현상)에 추가</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendTopicNoteTo4P(topic, currentTopicNote, 'project')}
                            className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>P3(과업)에 추가</span>
                          </button>
                          <button
                            type="button"
                            id={`btn-apply-topic-${index}`}
                            onClick={() => handleStartResearchWithStudentNote(selectedLab.id, topic, currentTopicNote)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <span>내 작성안으로 연구 시작</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                      <div className="flex gap-1">
                        {topic.keywords.slice(0, 3).map((k, i) => (
                          <span key={i} className="text-[10px] text-slate-400">
                            #{k}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onApplyLabTopic(selectedLab.id, topic)}
                        className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
                        title="기본 샘플 주제 그대로 연구계획서에 적용합니다"
                      >
                        <span>원안 그대로 적용</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Read & Walk Quick View */}
          <div className="space-y-5">
            {/* Reading List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                읽기 (Read) · 추천 필독서 ({selectedLab.recommendedReadings.length}권)
              </h4>
              <div className="space-y-2">
                {selectedLab.recommendedReadings.map((book, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{book.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                        {book.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mb-1">저자: {book.author}</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{book.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Walking Spot List (Links to Detail Below) */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                  걷기 (Walk) · 인천 현장 코스 바로가기
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {selectedLab.walkingSpots.length}개 코스
                </span>
              </h4>
              <div className="space-y-2">
                {selectedLab.walkingSpots.map((spot, idx) => {
                  const isActive = activeSpotIndex === idx;
                  return (
                    <button
                      key={spot.id || idx}
                      onClick={() => {
                        setActiveSpotIndex(idx);
                        // Smooth scroll down to detailed showcase
                        const el = document.getElementById('incheon-walking-showcase');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center gap-2.5 ${
                        isActive
                          ? 'bg-emerald-50 text-slate-900 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/60 hover:bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 relative">
                        <img
                          src={spot.imageUrl}
                          alt={spot.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                      </div>
                      <div className="min-w-0 grow">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 truncate block">
                            {idx + 1}. {spot.name.split('&')[0]}
                          </span>
                          {spot.isRealIncheonPhoto ? (
                            <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                              실사
                            </span>
                          ) : (
                            <span className="px-1 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600 shrink-0">
                              안내
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {spot.district}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 shrink-0">
                        선택
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Section: Incheon Field Walking Exploration Showcase */}
        <div id="incheon-walking-showcase" className="border-t border-slate-200 bg-slate-50/50 p-6 sm:p-8">
          {/* Section Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5" /> 인천 현장 걷기 코스
                </span>
                <span className="text-xs text-slate-500">
                  {selectedLab.name} 연계 탐구 코스 ({selectedLab.walkingSpots.length}선)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                인천의 역사·공간·생태를 발로 걸으며 발견하는 4P 탐구 현장
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                아래 탭을 누르면 각 코스의 실제 고화질 현장 사진과 인천 고유의 장소적 특징, 전공 탐구 착안점이 나타납니다.
              </p>
            </div>

            {/* Quick Action to Walking Domains Tab */}
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('walking-mind')}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>8대 걷기 탐구 일지로 이동</span>
              </button>
            )}
          </div>

          {/* Interactive Course Selection Tabs */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            {selectedLab.walkingSpots.map((spot, idx) => {
              const isActive = activeSpotIndex === idx;
              return (
                <button
                  key={spot.id || idx}
                  id={`tab-walking-spot-${idx}`}
                  onClick={() => setActiveSpotIndex(idx)}
                  className={`px-4 py-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 relative cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    0{idx + 1}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold tracking-tight">
                        {spot.name.split('&')[0].trim()}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] block mt-0.5 ${
                        isActive ? 'text-emerald-300 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {spot.district}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-1 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Spot Rich Showcase Card */}
          {activeSpot && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Left Column: Image & Visual Presentation (5 Cols) */}
                <div className="lg:col-span-5 bg-slate-900 relative flex flex-col justify-between overflow-hidden min-h-[320px] lg:min-h-full">
                  <img
                    src={activeSpot.imageUrl}
                    alt={activeSpot.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  {/* Subtle Dark Vignette & Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                  {/* Top Floating Badges */}
                  <div className="relative z-10 p-5 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {activeSpot.district}
                    </span>
                    {activeSpot.courseDistance && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activeSpot.courseDistance}
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Caption & Expand Trigger */}
                  <div className="relative z-10 p-5 text-white">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 shadow-lg">
                      <p className="text-xs text-slate-200 font-medium leading-relaxed mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>{activeSpot.imageCaption}</span>
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                        {activeSpot.isRealIncheonPhoto ? (
                          <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{activeSpot.photoCredit || '인천 현장 실사 (위키미디어 오픈 라이선스)'}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-300 font-medium">
                            <Info className="w-3.5 h-3.5 text-amber-400" />
                            <span>{activeSpot.photoCredit || '현장 탐구 안내 (학생·교사 현장 실사 등록 지원)'}</span>
                          </span>
                        )}
                        <button
                          onClick={() => setModalSpot(activeSpot)}
                          className="text-white hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>사진 크게보기</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Incheon Characteristics & Field Inquiry Details (7 Cols) */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Course Title Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          코스 0{activeSpotIndex + 1}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {activeSpot.district}
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                        {activeSpot.name}
                      </h4>
                      {activeSpot.subName && (
                        <p className="text-xs sm:text-sm text-indigo-700 font-medium mt-1">
                          {activeSpot.subName}
                        </p>
                      )}
                    </div>

                    {/* Prominent Feature Box: Incheon's Regional Characteristics */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-indigo-50/40 to-slate-50 border border-indigo-100/90 shadow-2xs">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-indigo-600 text-white flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> 인천의 고유한 지역적·역사적 특징
                        </span>
                        <span className="text-xs font-bold text-indigo-950">
                          인천 지역 정체성과 공간적 맥락
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal">
                        {activeSpot.incheonFeatures}
                      </p>
                      {activeSpot.historicalBackground && (
                        <div className="mt-3 pt-2.5 border-t border-indigo-100 text-xs text-slate-600 leading-relaxed">
                          <span className="font-bold text-slate-800">역사·공간적 배경:</span>{' '}
                          {activeSpot.historicalBackground}
                        </div>
                      )}
                    </div>

                    {/* Academic Relevance to this Lab */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <h5 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        전공 연구실 연계 착안점 ({selectedLab.name})
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed mb-1.5">
                        {activeSpot.inquiryConnection}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        <span className="font-semibold text-slate-600">추천 사색 이유:</span> {activeSpot.reason}
                      </p>
                    </div>

                    {/* Contemplation Prompt */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 relative">
                      <Quote className="w-5 h-5 text-amber-400 absolute top-3 right-3 opacity-60" />
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                        현장 사색 발문 (Walking Contemplation Prompt)
                      </span>
                      <p className="text-xs sm:text-[13px] font-bold text-amber-950 italic leading-relaxed">
                        {activeSpot.contemplationPrompt}
                      </p>
                    </div>

                    {/* Student Writing Space for Walking Spot */}
                    <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>[학생 작성] 현장 답사 사색 & 관찰 기록 ({activeSpot.name.split('&')[0].trim()})</span>
                        </label>
                        {spotNotes[`${selectedLabId}-spot-${activeSpotIndex}`]?.trim() && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            기록 저장됨
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={spotNotes[`${selectedLabId}-spot-${activeSpotIndex}`] || ''}
                        onChange={(e) =>
                          handleSpotNoteChange(`${selectedLabId}-spot-${activeSpotIndex}`, e.target.value)
                        }
                        placeholder="이 장소를 직접 걷거나 관찰하며 떠오른 사색, 인천의 고유한 공간적 특징에 대한 발견을 기록해보세요..."
                        className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50/50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-y transition-all leading-relaxed"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-slate-400">
                          작성한 관찰 기록은 4P 계획서(P1) 또는 사색 일지로 즉시 연동됩니다.
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveSpotNoteToJournal(
                                selectedLab,
                                activeSpot,
                                spotNotes[`${selectedLabId}-spot-${activeSpotIndex}`] || ''
                              )
                            }
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Footprints className="w-3 h-3 text-emerald-600" />
                            <span>사색일지 등록</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSendSpotNoteTo4P(
                                activeSpot,
                                spotNotes[`${selectedLabId}-spot-${activeSpotIndex}`] || ''
                              )
                            }
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>P1(현상)에 반영</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Key Waypoint Tags */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-2">
                        주요 현장 탐구 경유지 (Key Waypoints)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeSpot.keySpots.map((kSpot, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {kSpot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Action Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1">
                      {activeSpot.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalSpot(activeSpot)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>사진·상세 전체보기</span>
                      </button>

                      {onInjectWalkingSpotToProject && (
                        <button
                          onClick={() => onInjectWalkingSpotToProject(activeSpot)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>내 4P 계획서에 반영</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Modal for Photo & Detailed Incheon Features */}
      {modalSpot && (
        <WalkingSpotDetailModal
          spot={modalSpot}
          labName={selectedLab.name}
          onClose={() => setModalSpot(null)}
          onApplyToProject={onInjectWalkingSpotToProject}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
