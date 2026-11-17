import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  FileText,
  Copy,
  Check,
  RotateCcw,
  LogIn,
  LogOut,
  HelpCircle,
  ChevronRight,
  School,
  User as UserIcon,
  Layers,
  GraduationCap,
  Send,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ResearchProject } from '../types';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  getCurrentUser,
} from '../utils/googleAuth';
import {
  APPROACH_A_HEADERS,
  formatProjectToApproachARow,
  createNewApproachASpreadsheet,
  appendProjectToSpreadsheet,
  extractSpreadsheetId,
  getSpreadsheetInfo,
  DEFAULT_TEACHER_SPREADSHEET_ID,
  ensureSheetHeaders,
} from '../utils/googleSheets';

interface GoogleSheetsExportModalProps {
  project: ResearchProject;
  isOpen: boolean;
  onClose: () => void;
}

const LAST_SHEET_STORAGE_KEY = 'incheon_4p_last_google_sheet_info';

export const GoogleSheetsExportModal: React.FC<GoogleSheetsExportModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Export modes: 'teacher-submit' (default) | 'create-new' | 'append-existing'
  const [mode, setMode] = useState<'teacher-submit' | 'create-new' | 'append-existing'>('teacher-submit');
  const [newSheetTitle, setNewSheetTitle] = useState(
    `[인천 4P 사회문제탐구] ${project.schoolName || '고등학교'} 학생 연구 취합 시트`
  );
  const [existingSheetInput, setExistingSheetInput] = useState(DEFAULT_TEACHER_SPREADSHEET_ID);
  const [existingSheetInfo, setExistingSheetInfo] = useState<{
    title: string;
    sheetNames: string[];
  } | null>(null);
  const [isCheckingSheet, setIsCheckingSheet] = useState(false);

  // Transmission status
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [transmitSuccess, setTransmitSuccess] = useState<{
    spreadsheetUrl: string;
    spreadsheetId: string;
    sheetName: string;
    isNew: boolean;
    isTeacherSheet?: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Feature 2: 5-Point Self-Diagnostic Rubric State
  const [rubricChecks, setRubricChecks] = useState<Record<string, boolean>>({
    question: false,
    walk: false,
    read: false,
    reflection: false,
    attachment: false,
  });

  useEffect(() => {
    if (showConfirmDialog) {
      setRubricChecks({
        question: (project.mainQuestion || '').trim().length >= 10,
        walk: (project.walkingLogs || []).length > 0 || (project.fourP?.phenomenon || '').length >= 30,
        read: (project.readingLogs || []).length > 0,
        reflection: (project.effortNotes || '').trim().length >= 20 && (project.growthNotes || '').trim().length >= 20,
        attachment: Boolean(project.attachmentName || project.attachmentUrl),
      });
    }
  }, [showConfirmDialog, project]);

  // Teacher security & privacy lock state
  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [teacherPasswordInput, setTeacherPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Manual header synchronization status
  const [isSyncingHeaders, setIsSyncingHeaders] = useState(false);
  const [headerSyncMsg, setHeaderSyncMsg] = useState<string | null>(null);

  // Load last used sheet info from storage only if user had manually entered a custom sheet
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_SHEET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.id !== DEFAULT_TEACHER_SPREADSHEET_ID) {
          setExistingSheetInput(parsed.id);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen for auth state (automatically unlock if logged in as teacher)
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setAuthError(null);
        if (user?.email === 'lcr7513@icedu.kr') {
          setIsTeacherUnlocked(true);
        }
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleVerifyTeacherPassword = () => {
    const trimmed = teacherPasswordInput.trim();
    // Accept teacher password (icedu2026, 1234, or teacher email prefix lcr7513)
    if (trimmed === 'icedu2026' || trimmed === '1234' || trimmed === 'lcr7513') {
      setIsTeacherUnlocked(true);
      setShowPasswordPrompt(false);
      setPasswordError(false);
      setTeacherPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  // Explicitly sync 1-19 headers onto any Google Sheet
  const handleSyncHeaders = async (targetId: string = DEFAULT_TEACHER_SPREADSHEET_ID) => {
    setIsSyncingHeaders(true);
    setHeaderSyncMsg(null);
    setErrorMessage(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signResult = await googleSignIn();
        token = signResult?.accessToken || null;
      }
      if (!token) throw new Error('Google 로그인이 필요합니다.');

      const cleanId = extractSpreadsheetId(targetId);
      const res = await ensureSheetHeaders(token, cleanId);
      setHeaderSyncMsg(
        `1번~19번 제목(헤더) 행이 "${res.sheetName}" 시트 1행에 성공적으로 반영되었습니다! (고정 다크네이비 서식 적용 완료)`
      );
    } catch (err: any) {
      console.error('Header sync error:', err);
      setErrorMessage(`제목행 반영 실패: ${err.message}`);
    } finally {
      setIsSyncingHeaders(false);
    }
  };

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setAuthError(err.message || 'Google 로그인에 실패했습니다.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setTransmitSuccess(null);
    } catch (err: any) {
      console.error('Google logout error:', err);
    }
  };

  // Inspect existing sheet
  const handleCheckExistingSheet = async () => {
    if (!existingSheetInput.trim()) return;
    setIsCheckingSheet(true);
    setErrorMessage(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signResult = await googleSignIn();
        token = signResult?.accessToken || null;
      }
      if (!token) throw new Error('Google 로그인이 필요합니다.');

      const cleanId = extractSpreadsheetId(existingSheetInput);
      const info = await getSpreadsheetInfo(token, cleanId);
      setExistingSheetInfo(info);
    } catch (err: any) {
      setErrorMessage(`시트 확인 실패: ${err.message}`);
      setExistingSheetInfo(null);
    } finally {
      setIsCheckingSheet(false);
    }
  };

  // Prepare and open confirmation dialog
  const handleTriggerExport = () => {
    setErrorMessage(null);
    if (mode === 'append-existing' && !existingSheetInput.trim()) {
      setErrorMessage('추가할 기존 구글 시트의 링크나 ID를 입력해주세요.');
      return;
    }
    setShowConfirmDialog(true);
  };

  // Execute transmission (User confirmed)
  const handleConfirmExecute = async () => {
    setShowConfirmDialog(false);
    setIsTransmitting(true);
    setErrorMessage(null);
    setTransmitSuccess(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        const signResult = await googleSignIn();
        token = signResult?.accessToken || null;
      }
      if (!token) throw new Error('구글 시트에 접근하기 위한 로그인 토큰을 얻지 못했습니다.');

      if (mode === 'teacher-submit') {
        const targetId = DEFAULT_TEACHER_SPREADSHEET_ID;
        const result = await appendProjectToSpreadsheet(token, targetId, project);
        setTransmitSuccess({
          spreadsheetUrl: result.spreadsheetUrl,
          spreadsheetId: targetId,
          sheetName: result.sheetName,
          isNew: false,
          isTeacherSheet: true,
        });
      } else if (mode === 'create-new') {
        const result = await createNewApproachASpreadsheet(token, project, newSheetTitle);
        // Save last used sheet info
        localStorage.setItem(
          LAST_SHEET_STORAGE_KEY,
          JSON.stringify({
            id: result.spreadsheetId,
            url: result.spreadsheetUrl,
            title: newSheetTitle,
          })
        );
        setTransmitSuccess({
          spreadsheetUrl: result.spreadsheetUrl,
          spreadsheetId: result.spreadsheetId,
          sheetName: result.sheetName,
          isNew: true,
          isTeacherSheet: false,
        });
      } else {
        const cleanId = extractSpreadsheetId(existingSheetInput);
        const result = await appendProjectToSpreadsheet(token, cleanId, project);
        localStorage.setItem(
          LAST_SHEET_STORAGE_KEY,
          JSON.stringify({
            id: cleanId,
            url: result.spreadsheetUrl,
            title: existingSheetInfo?.title || '기존 구글 시트',
          })
        );
        setTransmitSuccess({
          spreadsheetUrl: result.spreadsheetUrl,
          spreadsheetId: cleanId,
          sheetName: result.sheetName,
          isNew: false,
          isTeacherSheet: false,
        });
      }
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMessage(err.message || '구글 시트 전송 중 오류가 발생했습니다.');
    } finally {
      setIsTransmitting(false);
    }
  };

  const rowPreview = formatProjectToApproachARow(project);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                  방식 A: 단일 시트 가로 요약형
                </span>
                <span className="text-xs text-emerald-100/80">Google Sheets 실시간 연동</span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">학생 연구 보고서 구글 시트 전송</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Google Account Connection Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border border-slate-300 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {currentUser.displayName || '구글 로그인 완료'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" /> 연동됨
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Google 계정 연결 필요</p>
                    <p className="text-xs text-slate-500">
                      선생님/연구자의 구글 계정에 스프레드시트를 생성하거나 행을 기록합니다.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0">
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-xs hover:shadow-sm transition-all"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isAuthenticating ? '인증 진행 중...' : 'Google 계정으로 로그인'}</span>
                </button>
              )}
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* 2. Success Banner if transmission succeeded */}
          {transmitSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-3 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-full bg-emerald-600 text-white shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-900">
                      {transmitSuccess.isTeacherSheet
                        ? '선생님 지정 취합 시트에 과제가 성공적으로 제출되었습니다!'
                        : transmitSuccess.isNew
                        ? '새 구글 스프레드시트가 성공적으로 생성 및 기록되었습니다!'
                        : '기존 구글 시트에 1개 행이 성공적으로 추가되었습니다!'}
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {transmitSuccess.isTeacherSheet
                        ? '선생님 시트에 학생의 19개 핵심 연구 데이터(방식 A)가 안전하게 누적되었습니다.'
                        : '방식 A(단일 시트 가로 요약형) 19개 항목이 완벽하게 전송되었습니다.'}
                    </p>
                  </div>
                </div>

                {/* Open button: For teacher sheet, ONLY visible if teacher unlocked; For personal sheet, always visible */}
                {transmitSuccess.isTeacherSheet ? (
                  isTeacherUnlocked ? (
                    <a
                      href={transmitSuccess.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
                    >
                      <span>[교사용] 시트 바로 열기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordPrompt(true);
                        setPasswordError(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl transition-all shrink-0"
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>교사 인증 후 열기</span>
                    </button>
                  )
                ) : (
                  <a
                    href={transmitSuccess.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
                  >
                    <span>내 구글 시트 바로 열기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Submission Receipt Note */}
              <div className="p-3 bg-white/90 rounded-xl border border-emerald-200/90 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>제출 접수 완료:</strong> {project.schoolName || '학교'} | {project.studentId || '학번'} | {project.author || '연구자'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-semibold">
                  방식 A (16개 항목) 정상 기록
                </span>
              </div>

              {/* Show link copy bar ONLY for personal student sheet OR when teacher unlocked */}
              {(!transmitSuccess.isTeacherSheet || isTeacherUnlocked) && (
                <div className="flex items-center gap-2 p-2.5 bg-white/80 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-900 overflow-x-auto">
                  <span className="font-bold text-slate-500 shrink-0">
                    {transmitSuccess.isTeacherSheet ? '[교사용] 시트 링크:' : '내 시트 링크:'}
                  </span>
                  <span className="truncate">{transmitSuccess.spreadsheetUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(transmitSuccess.spreadsheetUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 shrink-0 px-2 py-0.5 rounded-md hover:bg-emerald-100"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? '복사됨' : '복사'}</span>
                  </button>
                </div>
              )}

              {/* Privacy protection notice for students */}
              {transmitSuccess.isTeacherSheet && !isTeacherUnlocked && (
                <p className="text-[11px] text-emerald-800/80 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>학생 개인정보 및 다른 학생의 제출 데이터 보호를 위해 시트 열람 권한은 지도교사에게만 제공됩니다.</span>
                </p>
              )}
            </div>
          )}

          {/* 3. Export Mode Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              전송 방식 선택
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Teacher Sheet Submit (Default) */}
              <button
                type="button"
                onClick={() => setMode('teacher-submit')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                  mode === 'teacher-submit'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      mode === 'teacher-submit' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    추천 · 기본
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">선생님 시트로 과제 제출</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    지정된 선생님 시트에 1개 행으로 자동 누적 제출됩니다.
                  </p>
                </div>
              </button>

              {/* Option 2: Create New Personal Sheet */}
              <button
                type="button"
                onClick={() => setMode('create-new')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                  mode === 'create-new'
                    ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      mode === 'create-new' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    개인 소장용
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">내 드라이브에 새 시트</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    학생 본인의 구글 드라이브에 독립 시트를 새로 만듭니다.
                  </p>
                </div>
              </button>

              {/* Option 3: Other Custom Sheet */}
              <button
                type="button"
                onClick={() => setMode('append-existing')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                  mode === 'append-existing'
                    ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      mode === 'append-existing' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    직접 입력
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">다른 기존 시트에 추가</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    별도 지정한 다른 구글 시트 URL이나 ID를 입력합니다.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Mode Configuration Form */}
          {mode === 'teacher-submit' ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-300 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-emerald-950">
                        지도교사 지정 마스터 제출함 (보안 제출)
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                        자동 연결
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> 학생 열람 비공개
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      학생이 [과제 제출하기]를 누르면 선생님 시트의 다음 행에 19개 핵심 연구 항목(4P 본문, 다각도 읽기, 노력·성장 성찰, 첨부파일 드라이브 링크 등)이 즉시 저장됩니다.
                    </p>
                  </div>
                </div>

                {/* Right action: Teacher unlock or open sheet */}
                <div className="shrink-0 flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSyncHeaders(DEFAULT_TEACHER_SPREADSHEET_ID)}
                    disabled={isSyncingHeaders}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                    title="선생님 구글 시트 1행에 1번부터 19번까지의 제목 헤더를 즉시 생성 및 서식 적용합니다"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{isSyncingHeaders ? '제목행 반영 중...' : '1~19번 제목행 시트에 반영'}</span>
                  </button>

                  {isTeacherUnlocked ? (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${DEFAULT_TEACHER_SPREADSHEET_ID}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
                      >
                        <span>시트 열기</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsTeacherUnlocked(false)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 text-xs flex items-center gap-1 shrink-0"
                        title="교사 모드 다시 잠그기"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>잠금</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordPrompt(!showPasswordPrompt);
                        setPasswordError(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl shadow-2xs transition-all shrink-0"
                      title="교사 비밀번호 인증으로 관리 및 시트 열기"
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>교사 인증 (시트 관리)</span>
                    </button>
                  )}
                </div>
              </div>

              {headerSyncMsg && (
                <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold">{headerSyncMsg}</span>
                </div>
              )}

              {/* Secure Bottom Info Box */}
              {isTeacherUnlocked ? (
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/90 rounded-xl border border-emerald-300 text-xs font-mono text-emerald-950 overflow-x-auto">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700 shrink-0">등록된 시트 ID:</span>
                    <span className="truncate select-all">{DEFAULT_TEACHER_SPREADSHEET_ID}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                    교사 인증됨
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-xl border border-emerald-200/80 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>보안 제출 모드:</strong> 다른 학생의 연구 데이터와 시트 주소는 학생 화면에서 비공개로 안전하게 보호됩니다.
                  </span>
                </div>
              )}

              {/* Teacher Password Prompt Box */}
              {showPasswordPrompt && !isTeacherUnlocked && (
                <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      지도교사 비밀번호 인증
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasswordPrompt(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-medium"
                    >
                      닫기
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={teacherPasswordInput}
                      onChange={(e) => {
                        setTeacherPasswordInput(e.target.value);
                        setPasswordError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerifyTeacherPassword();
                      }}
                      placeholder="교사 비밀번호 입력"
                      className="grow text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleVerifyTeacherPassword}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shrink-0"
                    >
                      인증
                    </button>
                  </div>
                  {passwordError ? (
                    <p className="text-[11px] text-rose-600 font-medium">비밀번호가 일치하지 않습니다. 다시 입력해 주세요.</p>
                  ) : (
                    <p className="text-[10px] text-slate-500">지도교사 인증 시 마스터 시트 열람 및 관리 기능이 활성화됩니다.</p>
                  )}
                </div>
              )}
            </div>
          ) : mode === 'create-new' ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">생성할 새 구글 시트 파일명</label>
              <input
                type="text"
                value={newSheetTitle}
                onChange={(e) => setNewSheetTitle(e.target.value)}
                placeholder="스프레드시트 이름"
                className="w-full text-xs font-medium rounded-xl border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500">
                💡 Google Drive 내 루트 폴더에 생성되며, 상단 1행은 19개 열의 짙은 네이비 고정 헤더로 자동 디자인됩니다.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                기존 구글 시트 URL 또는 스프레드시트 ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={existingSheetInput}
                  onChange={(e) => {
                    setExistingSheetInput(e.target.value);
                    setExistingSheetInfo(null);
                  }}
                  placeholder="예: https://docs.google.com/spreadsheets/d/1BxiMVs0X... 또는 ID"
                  className="grow text-xs font-mono rounded-xl border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCheckExistingSheet}
                  disabled={isCheckingSheet || !existingSheetInput.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold shrink-0"
                >
                  {isCheckingSheet ? '조회 중...' : '시트 확인'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSyncHeaders(existingSheetInput)}
                  disabled={isSyncingHeaders || !existingSheetInput.trim()}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shrink-0 flex items-center gap-1"
                  title="이 구글 시트 1행에 1~19번 제목 헤더를 생성/동기화합니다"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1~19번 제목행 반영</span>
                </button>
              </div>

              {existingSheetInfo && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                  <span className="font-semibold">
                    연결 확인: <strong>{existingSheetInfo.title}</strong> ({existingSheetInfo.sheetNames[0]} 탭)
                  </span>
                  <span className="text-[11px] text-indigo-600 font-bold">정상 접근 가능</span>
                </div>
              )}
            </div>
          )}

          {/* Missing basic student information reminder */}
          {(!project.schoolName || !project.studentId || !project.author) && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                선생님께서 제출 학생을 정확히 확인하실 수 있도록 <strong>학교명</strong>, <strong>학번</strong>, <strong>이름</strong>을 입력하신 후 제출해 주세요.
              </span>
            </div>
          )}

          {/* 4. Student Metadata Preview & Data Row Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                전송될 19개 컬럼 데이터 미리보기 (방식 A)
              </label>
              <span className="text-[11px] text-slate-500">1명 학생 = 1행(Row) 압축</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              {/* Quick Summary Badges */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">학교명</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {project.schoolName || <span className="text-amber-600 font-normal">(미입력)</span>}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">학번 / 연구자</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {project.studentId || '-'} / {project.author || '(미입력)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">소속 / 연구실</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {project.affiliation || '-'} / {project.labId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AI 점수</span>
                  <span className="font-bold text-indigo-600 block">
                    {project.evaluationResult ? `${project.evaluationResult.totalScore}점` : '미평가'}
                  </span>
                </div>

                {/* Second row of badges: Effort, Growth, Attachment, Readings */}
                <div>
                  <span className="text-slate-400 block text-[10px]">🌱 노력한 점</span>
                  <span className={`text-[11px] font-semibold truncate block ${project.effortNotes ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {project.effortNotes ? '작성 완료' : '미작성'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">🌟 성장한 점</span>
                  <span className={`text-[11px] font-semibold truncate block ${project.growthNotes ? 'text-amber-700' : 'text-slate-400'}`}>
                    {project.growthNotes ? '작성 완료' : '미작성'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">📎 첨부파일 / 드라이브</span>
                  <span className={`text-[11px] font-semibold truncate block ${project.attachmentUrl || project.attachmentName ? 'text-indigo-700' : 'text-slate-400'}`}>
                    {project.attachmentName ? `${project.attachmentName}${project.attachmentUrl ? ' (링크 포함)' : ''}` : project.attachmentUrl ? '드라이브 링크 등록' : '미첨부'}
                  </span>
                </div>
              </div>

              {/* Scrollable Table Preview */}
              <div className="max-h-48 overflow-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-800 text-white text-[11px] sticky top-0">
                    <tr>
                      <th className="p-2 border-r border-slate-700 w-10 text-center">#</th>
                      <th className="p-2 border-r border-slate-700 w-36">항목 (열 헤더)</th>
                      <th className="p-2">전송 데이터 내용</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                    {APPROACH_A_HEADERS.map((header, idx) => (
                      <tr key={header} className="hover:bg-slate-50/80">
                        <td className="p-2 text-center text-slate-400 font-mono text-[10px] border-r border-slate-100">
                          {idx + 1}
                        </td>
                        <td className="p-2 font-semibold text-slate-800 border-r border-slate-100 text-[11px] whitespace-nowrap">
                          {header}
                        </td>
                        <td className="p-2 text-[11px] text-slate-600 max-w-md truncate">
                          {String(rowPreview[idx] || '(빈 값)')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500">
            * 전송 전 사용자 명시적 확인 대화상자가 표시되며, 구글 계정 토큰으로 안전하게 암호화 전송됩니다.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold w-full sm:w-auto"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleTriggerExport}
              disabled={isTransmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {mode === 'teacher-submit' ? (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>{isTransmitting ? '선생님 시트로 제출 중...' : '선생님 시트로 과제 제출하기'}</span>
                </>
              ) : mode === 'create-new' ? (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>{isTransmitting ? '새 시트 생성 중...' : '새 구글 시트 생성 및 저장'}</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>{isTransmitting ? '구글 시트 전송 중...' : '지정 구글 시트에 행 추가'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature 2: Student 5-Point Self-Diagnostic Rubric Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4 my-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-emerald-600 text-white shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 tracking-tight">제출 전 학생 5대 자가진단 루브릭</h4>
                    <p className="text-[11px] text-slate-500">
                      최종 제출 전 자신의 탐구 과제를 스스로 점검하세요.
                    </p>
                  </div>
                </div>

                {(() => {
                  const checkCount = Object.values(rubricChecks).filter(Boolean).length;
                  return (
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                        checkCount === 5
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {checkCount} / 5개 충족
                    </span>
                  );
                })()}
              </div>

              {/* 5 Rubric Checklist Items */}
              <div className="space-y-2 text-xs">
                {/* Rubric Item 1: Question Depth */}
                <label
                  onClick={() => setRubricChecks((prev) => ({ ...prev, question: !prev.question }))}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    rubricChecks.question
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rubricChecks.question}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">1. 핵심 탐구 질문의 학술성</span>
                      {rubricChecks.question && <span className="text-[10px] text-emerald-700 font-bold">확인됨</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      단순 단답형이 아닌 원인 규명 및 대안을 묻는 심층 질문인가?
                    </p>
                  </div>
                </label>

                {/* Rubric Item 2: Walk & Field Investigation */}
                <label
                  onClick={() => setRubricChecks((prev) => ({ ...prev, walk: !prev.walk }))}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    rubricChecks.walk
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rubricChecks.walk}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">2. 인천 현장 답사 및 실측의 구체성</span>
                      {rubricChecks.walk && <span className="text-[10px] text-emerald-700 font-bold">확인됨</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      인천 8대 코스 답사 또는 현장 관측·인터뷰 육성 기록을 담았는가?
                    </p>
                  </div>
                </label>

                {/* Rubric Item 3: Multi-modal Read */}
                <label
                  onClick={() => setRubricChecks((prev) => ({ ...prev, read: !prev.read }))}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    rubricChecks.read
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rubricChecks.read}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">3. 다각도 문헌 인용 출처 명시</span>
                      {rubricChecks.read && <span className="text-[10px] text-emerald-700 font-bold">확인됨</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      신문사설(빅카인즈)·영상(유튜브)·논문(DBpia)·도서 중 출처를 기록했는가?
                    </p>
                  </div>
                </label>

                {/* Rubric Item 4: Effort & Growth Reflection */}
                <label
                  onClick={() => setRubricChecks((prev) => ({ ...prev, reflection: !prev.reflection }))}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    rubricChecks.reflection
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rubricChecks.reflection}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">4. 주도적 노력 및 성장 성찰 작성</span>
                      {rubricChecks.reflection && <span className="text-[10px] text-emerald-700 font-bold">확인됨</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      난관 극복 과정(노력)과 가치관 변화(성장)를 각 20자 이상 작성했는가?
                    </p>
                  </div>
                </label>

                {/* Rubric Item 5: Attachment / Drive Link */}
                <label
                  onClick={() => setRubricChecks((prev) => ({ ...prev, attachment: !prev.attachment }))}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    rubricChecks.attachment
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rubricChecks.attachment}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">5. 과제 첨부파일 및 드라이브 링크 확인</span>
                      {rubricChecks.attachment && <span className="text-[10px] text-emerald-700 font-bold">확인됨</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      한글(HWP), PDF 보고서, 발표 PPT 또는 구글 드라이브 링크를 확인했는가?
                    </p>
                  </div>
                </label>
              </div>

              {/* Submission Destination Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
                <div>
                  <strong>제출 대상: </strong>
                  {mode === 'teacher-submit'
                    ? `선생님 지정 취합 시트 (ID: ${DEFAULT_TEACHER_SPREADSHEET_ID.slice(0, 10)}...)`
                    : mode === 'create-new'
                    ? `내 드라이브 새 시트`
                    : `지정 구글 시트`}
                </div>
                <div>
                  <strong>연구자: </strong>
                  {project.schoolName || '학교명 미입력'} | {project.studentId || '학번 미입력'} |{' '}
                  {project.author || '연구자 미입력'} ({project.affiliation || '소속 미입력'})
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                >
                  수정하러 가기
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExecute}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>5대 자가진단 확인 후 최종 제출</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
