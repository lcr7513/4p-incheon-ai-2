import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  Save,
  X,
  FileText,
  Users,
  Compass,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { ResearchProject } from '../types';
import { generateNeisDraft, calculateNeisBytes } from '../utils/citationFormatter';

interface StudentRecordHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ResearchProject;
  onUpdateProject: (updated: Partial<ResearchProject>) => void;
}

export const StudentRecordHelperModal: React.FC<StudentRecordHelperModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [selectedType, setSelectedType] = useState<'subject' | 'club' | 'career'>('subject');
  const [editedDrafts, setEditedDrafts] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ keywords: string[]; evalPoint: string } | null>(null);

  // Generate drafts for all 3 types
  const drafts = useMemo(() => {
    return {
      subject: generateNeisDraft(project, 'subject'),
      club: generateNeisDraft(project, 'club'),
      career: generateNeisDraft(project, 'career'),
    };
  }, [project]);

  const handleRunAiGeneration = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/student-record-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordType: selectedType,
          project: project,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.draft) {
        setEditedDrafts((prev) => ({
          ...prev,
          [selectedType]: json.data.draft,
        }));
        if (json.data.highlightKeywords || json.data.evaluationPoint) {
          setAiAnalysis({
            keywords: json.data.highlightKeywords || [],
            evalPoint: json.data.evaluationPoint || '',
          });
        }
      }
    } catch (err) {
      console.error('AI student record generation error:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  if (!isOpen) return null;

  const currentGenerated = drafts[selectedType];
  const currentText = editedDrafts[selectedType] !== undefined ? editedDrafts[selectedType] : currentGenerated.draft;
  const currentCharCount = currentText.length;
  const currentByteCount = calculateNeisBytes(currentText);
  const maxBytes = 1500; // 500자 / 1500바이트 기준
  const bytePercentage = Math.min(100, Math.round((currentByteCount / maxBytes) * 100));

  const handleTextChange = (val: string) => {
    setEditedDrafts((prev) => ({
      ...prev,
      [selectedType]: val,
    }));
  };

  const handleResetToGenerated = () => {
    setEditedDrafts((prev) => ({
      ...prev,
      [selectedType]: currentGenerated.draft,
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToProjectMemo = () => {
    onUpdateProject({
      teacherMemo: currentText,
      targetNeisType: selectedType,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white/15 backdrop-blur-sm shadow-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  교사용 생활기록부(NEIS) 기재 도우미
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  교육부 500자/1,500Byte 표준
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                4P 탐구와 읽·걷·쓰 실천 기록을 종합 분석하여 학교생활기록부 맞춤형 문장을 생성합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setSelectedType('subject')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'subject'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. 교과 세특형</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-normal">
                학업역량
              </span>
            </button>
            <button
              onClick={() => setSelectedType('club')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'club'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. 창체·동아리형</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 font-normal">
                협업·탐구
              </span>
            </button>
            <button
              onClick={() => setSelectedType('career')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'career'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3. 진로·자율형</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-normal">
                전공적합성
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Byte indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">나이스 용량:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-md ${
                  currentByteCount > maxBytes
                    ? 'bg-rose-100 text-rose-700 font-mono'
                    : 'bg-indigo-50 text-indigo-700 font-mono'
                }`}
              >
                {currentByteCount.toLocaleString()} / {maxBytes.toLocaleString()} Byte
              </span>
              <span className="text-slate-400 font-mono">({currentCharCount}자)</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Byte Gauge Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                currentByteCount > maxBytes
                  ? 'bg-rose-500'
                  : bytePercentage > 85
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, bytePercentage)}%` }}
            />
          </div>

          {/* Description banner */}
          <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <span className="font-bold text-indigo-950 mr-1">
                [{currentGenerated.title}] 기재 포인트:
              </span>
              {selectedType === 'subject' &&
                '교과 교육과정 성취기준을 바탕으로, 이론적 배경(독서)과 현상 데이터 분석(4P), 가설 검증 과정에서 발휘된 학생의 비판적 사고력과 학업 성취도를 강조합니다.'}
              {selectedType === 'club' &&
                '동아리 활동 내에서 가설 검증, 실험/조사 수행, 현장 답사(걷기) 및 팀원 간의 협업, 난관 극복 과정(자기주도성)을 입증하는 데 초점을 둡니다.'}
              {selectedType === 'career' &&
                '희망 전공 분야와 지역사회(인천) 문제 해결(실천)을 유기적으로 연결하여, 전공에 대한 깊은 호기심과 성찰적 진로 성숙도를 부각합니다.'}
            </div>
          </div>

          {/* AI Analysis Result if available */}
          {aiAnalysis && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/80 text-xs space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Gemini AI 분석 평가 포인트:
                </span>
                <span className="text-[10px] bg-purple-200/60 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                  AI 맞춤 반영 완료
                </span>
              </div>
              <p className="text-purple-950 font-medium leading-relaxed">{aiAnalysis.evalPoint}</p>
              {aiAnalysis.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {aiAnalysis.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-white text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-semibold">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Textarea Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>기재 문안 편집</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (필요에 따라 직접 수정 후 나이스에 복사하거나 저장할 수 있습니다)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunAiGeneration}
                  disabled={loadingAi}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xs hover:shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Gemini AI가 학생의 4P 전체 탐구와 읽걷쓰 기록을 종합 분석하여 맞춤형 세특을 작성합니다"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin text-white' : 'text-amber-300'}`} />
                  <span>{loadingAi ? 'Gemini AI 정밀 생성 중...' : 'Gemini AI 맞춤 세특 생성'}</span>
                </button>
                <button
                  onClick={handleResetToGenerated}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 underline font-medium"
                >
                  표준 문안으로 되돌리기
                </button>
              </div>
            </div>
            <textarea
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className={`w-full p-4 rounded-xl border text-sm leading-relaxed font-sans transition-all focus:outline-none focus:ring-2 ${
                currentByteCount > maxBytes
                  ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20 text-slate-900'
                  : 'border-slate-300 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-slate-900'
              }`}
              placeholder="생활기록부 문안을 생성 중입니다..."
            />
          </div>

          {/* Education Ministry Guideline Notice */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>교육부 학교생활기록부 작성 유의사항 & 작성 팁</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc marker:text-slate-400 leading-relaxed">
              <li>
                공인어학성적, 교외 수상실적, 사교육 유발 논문명 및 저자명 등은 기재 불가하므로 본 문안에서는 전공 개념과 학생의 탐구 과정 중심으로 서술되었습니다.
              </li>
              <li>
                단순 활동 사실(Fact) 나열에 그치지 않고, <strong>'탐구 동기(P1) → 학술적 원인 규명(P2) → 방법론적 해결(P3) → 사회적 실천 및 성장(P4)'</strong>의 인과 구조를 유지했습니다.
              </li>
              <li>
                학생의 실제 개별 특성(독서 1편, 걷기 탐사지 1곳)이 구체적으로 문장에 반영되어 차별화된 세특을 완성할 수 있습니다.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {savedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                프로젝트 교사 메모에 성공적으로 저장되었습니다!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveToProjectMemo}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>프로젝트 교사 메모로 저장</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>나이스(NEIS)용 클립보드 복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>나이스(NEIS) 형식으로 원클릭 복사</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
