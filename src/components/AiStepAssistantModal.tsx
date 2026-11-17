import React, { useState } from 'react';
import {
  Sparkles,
  PenTool,
  Check,
  Copy,
  X,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ResearchProject, LabId } from '../types';
import { LABS_DATA } from '../data/labsData';

interface AiStepAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ResearchProject;
  initialStep?: 'phenomenon' | 'problem' | 'project' | 'practice';
  onApplyText: (step: 'phenomenon' | 'problem' | 'project' | 'practice', text: string) => void;
}

export const AiStepAssistantModal: React.FC<AiStepAssistantModalProps> = ({
  isOpen,
  onClose,
  project,
  initialStep = 'phenomenon',
  onApplyText,
}) => {
  const [selectedStep, setSelectedStep] = useState<'phenomenon' | 'problem' | 'project' | 'practice'>(initialStep);
  const [actionMode, setActionMode] = useState<'draft' | 'polish' | 'expand'>('draft');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const currentLab = LABS_DATA.find((l) => l.id === project.labId) || LABS_DATA[0];

  const stepMeta = {
    phenomenon: { label: 'P1. 현상 (관찰 데이터)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    problem: { label: 'P2. 문제 (구조적 원인)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    project: { label: 'P3. 과업 (전공 연구방법)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    practice: { label: 'P4. 실천 (지역사회 적용)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  };

  const getCurrentStepText = () => {
    return project.fourP[selectedStep] || '';
  };

  const handleRunAiAssist = async (mode = actionMode) => {
    setLoading(true);
    setResultData(null);
    setAppliedToast(false);

    try {
      const res = await fetch('/api/gemini/assist-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: selectedStep,
          mode: mode,
          labName: currentLab.name,
          topicTitle: project.title,
          mainQuestion: project.mainQuestion,
          currentText: getCurrentStepText(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResultData({
          ...json.data,
          isFallback: Boolean(json.isFallback),
          mode,
        });
      } else {
        throw new Error('생성 실패');
      }
    } catch (err) {
      console.error('AI step assist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!resultData?.resultText) return;
    onApplyText(selectedStep, resultData.resultText);
    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
      onClose();
    }, 1200);
  };

  const handleCopy = () => {
    if (!resultData?.resultText) return;
    navigator.clipboard.writeText(resultData.resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>AI 4P 글쓰기 코파일럿</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                  {currentLab.name}
                </span>
              </h2>
              <p className="text-xs text-indigo-100 truncate max-w-md">
                {project.title || '인천 4P 탐구 프로젝트'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Step Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              작성할 4P 단계 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['phenomenon', 'problem', 'project', 'practice'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedStep(s);
                    setResultData(null);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                    selectedStep === s
                      ? `${stepMeta[s].color} ring-2 ring-indigo-500/20 shadow-sm font-bold`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{stepMeta[s].label}</span>
                  {project.fourP[s]?.trim() ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="작성된 내용 있음" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" title="비어있음" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Mode Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              AI 지원 모드 선택
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActionMode('draft');
                  handleRunAiAssist('draft');
                }}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition-all ${
                  actionMode === 'draft'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 초안 생성</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  주제와 전공 관점을 반영한 문단 자동 완성
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionMode('polish');
                  handleRunAiAssist('polish');
                }}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition-all ${
                  actionMode === 'polish'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-purple-700">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>학술체 다듬기</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  작성한 글을 보고서 격식체로 교정
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionMode('expand');
                  handleRunAiAssist('expand');
                }}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition-all ${
                  actionMode === 'expand'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-amber-700">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>심화 아이디어 3종</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  데이터 출처, 이론, 실천 방향 제안
                </p>
              </button>
            </div>
          </div>

          {/* Current Text View */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-600 mb-1 block">현재 학생이 작성한 내용:</span>
            <p className="text-slate-700 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-line italic">
              {getCurrentStepText() || '(아직 작성된 내용이 없습니다. [AI 초안 생성]을 눌러보세요!)'}
            </p>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center bg-indigo-50/40 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center space-y-2.5">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-sm font-semibold text-indigo-900">
                Gemini AI가 {stepMeta[selectedStep].label} 내용을 작성하는 중입니다...
              </p>
              <p className="text-xs text-slate-500">
                인천 지역 맥락과 {currentLab.name} 학술 어휘를 조합하고 있습니다.
              </p>
            </div>
          )}

          {/* AI Result Box */}
          {!loading && resultData && (
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-xs text-indigo-900">
                    AI 추천 결과 ({resultData.mode === 'draft' ? '초안' : resultData.mode === 'polish' ? '교정문' : '아이디어'})
                  </span>
                  {resultData.isFallback && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                      표준 모델
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사됨' : '복사'}</span>
                  </button>
                </div>
              </div>

              {/* Text Output */}
              <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line border border-slate-200 font-medium">
                {resultData.resultText}
              </div>

              {/* Suggestions / Keywords */}
              {resultData.suggestions && (
                <div className="space-y-2 pt-1">
                  {resultData.suggestions.map((sug: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs">
                      <strong className="text-amber-900 block mb-0.5">📌 {sug.title}</strong>
                      <span className="text-amber-800/90">{sug.description}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tip */}
              {resultData.tip && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-indigo-50/50 p-2 rounded-lg">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{resultData.tip}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            닫기
          </button>

          <div className="flex items-center gap-2">
            {resultData?.resultText && (
              <button
                onClick={handleApply}
                disabled={appliedToast}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                {appliedToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>본문에 적용되었습니다!</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>{stepMeta[selectedStep].label}에 바로 적용</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
