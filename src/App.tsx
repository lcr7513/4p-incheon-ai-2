import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LabsExplorerView } from './components/LabsExplorerView';
import { FourPWorkspaceView } from './components/FourPWorkspaceView';
import { AiEvaluatorView } from './components/AiEvaluatorView';
import { WalkingImmersionView } from './components/WalkingImmersionView';
import { ArchiveView } from './components/ArchiveView';
import { ExperimentalLabView } from './components/ExperimentalLabView';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { GoogleSheetsExportModal } from './components/GoogleSheetsExportModal';
import { StudentShareModal } from './components/StudentShareModal';
import { TeacherSubmissionDashboardModal } from './components/TeacherSubmissionDashboardModal';
import { StudentGuidebookView } from './components/StudentGuidebookView';
import { AiResearchAssistantChat } from './components/AiResearchAssistantChat';
import { IncheonGisMapStudio } from './components/IncheonGisMapStudio';
import { ActiveTab, ResearchProject, LabId, EvaluationResult, WalkingLog, FourPData, WalkingSpot, GisNavigationPreset } from './types';
import { DEMO_PROJECT, ARCHIVE_PROJECTS, getLabModelProject } from './data/archiveData';
import { autoDistributeFourP } from './utils/fourPParser';
import { LABS_DATA } from './data/labsData';
import { Download, FilePlus2, Info, Upload, Share2, RefreshCw, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'incheon_4p_research_project_v1';

const createEmptyProject = (): ResearchProject => {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: `project-${Date.now()}`,
    title: '',
    labId: 'humanities',
    schoolName: '',
    studentId: '',
    author: '',
    affiliation: '',
    mainQuestion: '',
    fourP: { phenomenon: '', problem: '', project: '', practice: '' },
    walkingLogs: [],
    readingLogs: [],
    evaluationResult: null,
    teacherMemo: '',
    createdAt: today,
    updatedAt: today,
    isDemo: false,
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [gisPreset, setGisPreset] = useState<GisNavigationPreset | null>(null);
  const [project, setProject] = useState<ResearchProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed.walkingLogs)) {
          parsed.walkingLogs = DEMO_PROJECT.walkingLogs;
        }
        if (typeof parsed.isDemo !== 'boolean') {
          parsed.isDemo = parsed.id === DEMO_PROJECT.id;
        }
        if (parsed.fourP) {
          const dist = autoDistributeFourP(parsed.fourP);
          if (dist.isDistributed) {
            parsed.fourP = dist.distributed;
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved project from localStorage', e);
    }
    return DEMO_PROJECT;
  });

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [googleSheetsModalOpen, setGoogleSheetsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [teacherDashboardModalOpen, setTeacherDashboardModalOpen] = useState(false);
  const [previewTargetProject, setPreviewTargetProject] = useState<ResearchProject>(project);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [globalSaveToast, setGlobalSaveToast] = useState(false);

  // Sync project to local storage with real-time status indication
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        console.warn('Failed to save project to localStorage', e);
        setSaveStatus('saved');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [project]);

  // Global Ctrl+S / Cmd+S handler for instant save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
          setSaveStatus('saved');
          setLastSavedTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setGlobalSaveToast(true);
          setTimeout(() => setGlobalSaveToast(false), 2500);
        } catch (err) {
          console.warn('Manual save failed', err);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project]);

  // Feature 4: Prevent accidental browser tab close / reload when user has substantial work
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasWritten =
        Boolean(project.title && project.title.trim().length > 0) ||
        Boolean(project.fourP?.phenomenon && project.fourP.phenomenon.trim().length > 15) ||
        Boolean(project.studentId && project.studentId.trim().length > 0);

      if (hasWritten && !project.isDemo) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [project]);

  // Update project state
  const handleUpdateProject = (updated: Partial<ResearchProject>) => {
    setProject((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  };

  // Switch Lab
  const handleSwitchLab = (labId: LabId) => {
    handleUpdateProject({ labId });
  };

  // Apply Lab sample topic
  const handleApplyLabTopic = (labId: LabId, topic: any) => {
    setProject((prev) => ({
      ...prev,
      labId,
      title: topic.title,
      mainQuestion: topic.mainQuestion,
      fourP: {
        phenomenon: topic.p1 || prev.fourP.phenomenon,
        problem: topic.p2 || prev.fourP.problem || (topic.title + '에 따른 사회적 비용과 구조적 불평등 분석'),
        project: topic.p3 || prev.fourP.project,
        practice: topic.p4 || prev.fourP.practice || '인천 지역사회 연계 실천 프로젝트 및 학교 캠페인 추진',
      },
      updatedAt: new Date().toISOString().split('T')[0],
    }));
    setActiveTab('workspace');
  };

  // Apply AI Evaluation Result
  const handleApplyEvaluation = (evalResult: EvaluationResult) => {
    setProject((prev) => ({
      ...prev,
      evaluationResult: evalResult,
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  };

  // Apply Upgraded Question
  const handleApplyQuestion = (question: string) => {
    handleUpdateProject({ mainQuestion: question });
  };

  // Apply newly recommended topic from AI
  const handleApplyNewTopic = (topic: any) => {
    setProject((prev) => ({
      ...prev,
      title: topic.title,
      mainQuestion: topic.mainQuestion,
      fourP: {
        phenomenon: topic.p1 || prev.fourP.phenomenon,
        problem: topic.p2 || prev.fourP.problem,
        project: topic.p3 || prev.fourP.project,
        practice: topic.p4 || prev.fourP.practice,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    }));
    setActiveTab('workspace');
  };

  // Add walking contemplation log
  const handleAddWalkingLog = (log: WalkingLog) => {
    setProject((prev) => ({
      ...prev,
      walkingLogs: [log, ...prev.walkingLogs],
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  };

  // Delete walking log
  const handleDeleteWalkingLog = (id: string) => {
    setProject((prev) => ({
      ...prev,
      walkingLogs: prev.walkingLogs.filter((w) => w.id !== id),
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  };

  // Restore default walking logs
  const handleRestoreDefaultWalkingLogs = () => {
    setProject((prev) => ({
      ...prev,
      walkingLogs: DEMO_PROJECT.walkingLogs,
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  };

  // Direct injection from Walking Note to 4P workspace
  const handleInjectNoteToFourP = (step: keyof FourPData, note: string) => {
    setProject((prev) => {
      const existing = prev.fourP[step] || '';
      const separator = existing.trim().length > 0 ? '\n\n' : '';
      return {
        ...prev,
        fourP: {
          ...prev.fourP,
          [step]: `${existing}${separator}${note}`,
        },
        updatedAt: new Date().toISOString().split('T')[0],
      };
    });
  };

  // Direct injection from Incheon Walking Spot into 4P Workspace (Phenomenon)
  const handleInjectWalkingSpotToProject = (spot: WalkingSpot) => {
    setProject((prev) => {
      const injectionNote = `[인천 현장 탐구 장소: ${spot.name} (${spot.district})]\n• 인천 장소 특징: ${spot.incheonFeatures}\n• 현장 사색 발문: "${spot.contemplationPrompt}"\n• 주요 경유지: ${spot.keySpots.join(', ')}`;
      const existing = prev.fourP.phenomenon || '';
      const separator = existing.trim().length > 0 ? '\n\n' : '';
      return {
        ...prev,
        fourP: {
          ...prev.fourP,
          phenomenon: `${existing}${separator}${injectionNote}`,
        },
        updatedAt: new Date().toISOString().split('T')[0],
      };
    });
    setActiveTab('workspace');
  };

  // Load model exemplar for a specific lab
  const handleLoadLabModelExample = (labId: LabId) => {
    const modelProj = getLabModelProject(labId);
    if (modelProj) {
      setProject({
        ...modelProj,
        isDemo: true,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      setActiveTab('workspace');
    }
  };

  // Reset to default demo project (or current lab's exemplar)
  const handleResetToDemo = () => {
    const currentModel = getLabModelProject(project.labId || 'humanities');
    if (window.confirm(`[${currentModel.affiliation}]의 모범 예시 템플릿으로 초기화하시겠습니까?`)) {
      setProject({
        ...currentModel,
        isDemo: true,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleCreateEmptyProject = () => {
    if (window.confirm('새 빈 프로젝트를 시작할까요? 현재 내용은 먼저 백업하지 않으면 이 브라우저에서 사라질 수 있습니다.')) {
      setProject(createEmptyProject());
      setActiveTab('workspace');
    }
  };

  const handleExportBackup = () => {
    const relatedNotes: Record<string, unknown> = {};
    const notePrefixes = [
      'edu4p_lab_question_notes_',
      'edu4p_lab_topic_notes_',
      'edu4p_lab_spot_notes_',
      '4p_act_notes_',
      '4p_spot_notes_',
      '4p_prompt_notes_',
      '4p_labspot_notes_',
    ];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && notePrefixes.some((prefix) => key === `${prefix}${project.id}`)) {
        try {
          relatedNotes[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          relatedNotes[key] = localStorage.getItem(key);
        }
      }
    }
    const backup = {
      format: '4p-incheon-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      project,
      relatedNotes,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `4P_연구백업_${(project.title || '새프로젝트').slice(0, 24).replace(/[\\/:*?\"<>|]/g, '_')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const restored = parsed?.format === '4p-incheon-backup' ? parsed.project : parsed;
      if (
        !restored ||
        typeof restored !== 'object' ||
        typeof restored.id !== 'string' ||
        typeof restored.title !== 'string' ||
        !restored.fourP ||
        !Array.isArray(restored.walkingLogs) ||
        !Array.isArray(restored.readingLogs)
      ) {
        throw new Error('지원하지 않는 백업 형식입니다.');
      }
      if (parsed?.relatedNotes && typeof parsed.relatedNotes === 'object') {
        Object.entries(parsed.relatedNotes).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
      }
      setProject(restored as ResearchProject);
      setActiveTab('dashboard');
      window.alert('연구 프로젝트 백업을 복원했습니다.');
    } catch (error) {
      window.alert(`백업 파일을 열 수 없습니다. ${error instanceof Error ? error.message : ''}`);
    }
  };

  // Import from Archive
  const handleSelectArchiveProject = (archivedProj: ResearchProject) => {
    setProject({
      ...archivedProj,
      id: `project-${Date.now()}`,
      author: '학생연구원 (나의 연구)',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isDemo: true,
    });
    setActiveTab('workspace');
  };

  // Open Preview Modal
  const handleOpenCurrentPreview = () => {
    setPreviewTargetProject(project);
    setPreviewModalOpen(true);
  };

  const handleOpenArchivePreview = (proj: ResearchProject) => {
    setPreviewTargetProject(proj);
    setPreviewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentProject={project}
        onOpenPreview={handleOpenCurrentPreview}
        onOpenGoogleSheetsExport={() => setGoogleSheetsModalOpen(true)}
        onOpenShareModal={() => setShareModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <section className={`mb-5 rounded-2xl border p-4 ${project.isDemo ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Info className={`w-4 h-4 mt-0.5 shrink-0 ${project.isDemo ? 'text-amber-700' : 'text-indigo-600'}`} />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {project.isDemo ? '모범 예시 자료를 보고 있습니다' : '나의 연구 프로젝트'}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {project.isDemo
                    ? '화면의 수치·인터뷰·활동 결과는 학습용 가상 예시이며 실제 조사 결과나 공식 통계가 아닙니다.'
                    : '내용은 이 브라우저에 실시간 자동 저장됩니다. 다른 기기에서 사용하려면 JSON 백업을 내려받으세요.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                    {saveStatus === 'saving' ? (
                      <>
                        <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                        <span>실시간 자동 저장 중...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>실시간 자동 저장 켜짐 ({lastSavedTime ? `${lastSavedTime} 저장` : '안전 보관 중'})</span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    • 입력 즉시 자동 보관되며, 단축키 <strong>Ctrl+S</strong>로도 즉시 저장할 수 있습니다.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                title="학생들에게 배포할 웹 링크 및 QR 코드 확인"
              >
                <Share2 className="w-3.5 h-3.5" /> 학생 공유 링크·QR
              </button>
              <button onClick={handleCreateEmptyProject} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold">
                <FilePlus2 className="w-3.5 h-3.5" /> 빈 프로젝트 시작
              </button>
              <button onClick={handleExportBackup} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold">
                <Download className="w-3.5 h-3.5" /> JSON 백업
              </button>
              <button onClick={() => backupInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold">
                <Upload className="w-3.5 h-3.5" /> 백업 복원
              </button>
              <input ref={backupInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportBackup} />
            </div>
          </div>
        </section>
        {activeTab === 'dashboard' && (
          <DashboardView
            project={project}
            onNavigate={setActiveTab}
            onOpenPreview={handleOpenCurrentPreview}
            onLoadLabModelExample={handleLoadLabModelExample}
            onOpenShareModal={() => setShareModalOpen(true)}
            onOpenGoogleSheetsExport={() => setGoogleSheetsModalOpen(true)}
          />
        )}

        {activeTab === 'guide' && (
          <StudentGuidebookView
            onNavigateTab={setActiveTab}
            onApplyLabExample={handleLoadLabModelExample}
          />
        )}

        {activeTab === 'labs' && (
          <LabsExplorerView
            currentProject={project}
            onApplyLabTopic={handleApplyLabTopic}
            onSwitchLab={handleSwitchLab}
            onInjectWalkingSpotToProject={handleInjectWalkingSpotToProject}
            onNavigateTab={setActiveTab}
            onInjectNoteToFourP={handleInjectNoteToFourP}
            onAddWalkingLog={handleAddWalkingLog}
            onUpdateProject={handleUpdateProject}
            onLoadLabModelExample={handleLoadLabModelExample}
            onOpenGisWithPreset={(preset) => {
              setGisPreset(preset);
              setActiveTab('gis-map');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'workspace' && (
          <FourPWorkspaceView
            project={project}
            onChangeProject={handleUpdateProject}
            onRequestAiEvaluation={() => setActiveTab('ai-evaluator')}
            onOpenPreview={handleOpenCurrentPreview}
            onResetToDemo={handleResetToDemo}
            onLoadLabModelExample={handleLoadLabModelExample}
            onNavigateTab={setActiveTab}
            onOpenGoogleSheetsExport={() => setGoogleSheetsModalOpen(true)}
          />
        )}

        {activeTab === 'ai-evaluator' && (
          <AiEvaluatorView
            project={project}
            onApplyEvaluation={handleApplyEvaluation}
            onApplyQuestion={handleApplyQuestion}
            onApplyNewTopic={handleApplyNewTopic}
            onChangeProject={handleUpdateProject}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'walking-mind' && (
          <WalkingImmersionView
            project={project}
            onAddWalkingLog={handleAddWalkingLog}
            onDeleteWalkingLog={handleDeleteWalkingLog}
            onInjectNoteToFourP={handleInjectNoteToFourP}
            onRestoreDefaultLogs={handleRestoreDefaultWalkingLogs}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            onSelectArchiveProject={handleSelectArchiveProject}
            onPreviewProject={handleOpenArchivePreview}
          />
        )}

        {activeTab === 'experimental-lab' && (
          <ExperimentalLabView
            project={project}
            onUpdateProject={handleUpdateProject}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'gis-map' && (
          <IncheonGisMapStudio
            project={project}
            onUpdateProject={handleUpdateProject}
            onNavigateTab={setActiveTab}
            gisPreset={gisPreset}
            onClearGisPreset={() => setGisPreset(null)}
          />
        )}
      </main>

      {/* Footer with Incheon Education Read-Walk-Write Philosophy */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-900 font-bold">
              <span>인천 지역 기반 읽·걷·쓰 수업 참고 모델</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600 font-semibold">4P 사회문제탐구 플랫폼</span>
            </div>
            <p className="text-slate-500">
              깊이 읽고(Read), 발로 뛰며 사색하고(Walk), 실천적 대안을 쓰며(Write) 삶과 배움을 잇는 전공연계 교육과정
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>P1.현상 · P2.문제 · P3.과업 · P4.실천</span>
            <span>•</span>
            <span>Gemini 연동 · 규칙 기반 안전 모드 지원</span>
          </div>
        </div>
      </footer>

      {/* Report Preview & Print Modal */}
      <PrintPreviewModal
        project={previewTargetProject}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onOpenGoogleSheetsExport={() => setGoogleSheetsModalOpen(true)}
        onUpdateProject={handleUpdateProject}
      />

      {/* Google Sheets Real-time Export Modal (Approach A) */}
      <GoogleSheetsExportModal
        project={project}
        isOpen={googleSheetsModalOpen}
        onClose={() => setGoogleSheetsModalOpen(false)}
      />

      {/* Student Share Link & QR Code Modal */}
      <StudentShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Real-time Save Toast Notification */}
      {globalSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/95 text-white rounded-xl shadow-xl border border-slate-700 text-xs font-medium backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>브라우저 로컬 저장소에 실시간 자동 저장 완료 ({lastSavedTime})</span>
        </div>
      )}

      {/* Floating AI Research Assistant Chatbot */}
      <AiResearchAssistantChat
        project={project}
        onNavigateTab={setActiveTab}
        onApplyToStep={(step, text) => {
          handleUpdateProject({
            fourP: { ...project.fourP, [step]: text },
          });
        }}
      />
    </div>
  );
}

