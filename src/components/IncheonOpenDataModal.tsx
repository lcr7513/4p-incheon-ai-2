import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  ExternalLink,
  Plus,
  Check,
  Building2,
  FileCheck2,
  BarChart3,
  X,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  INCHEON_20_GOV_DATASETS,
  INCHEON_GOV_CATEGORIES,
  GovDatasetItem,
} from '../data/incheonGovDatasets';
import { ResearchProject, ReadingLog } from '../types';

interface IncheonOpenDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ResearchProject;
  onUpdateProject: (updated: Partial<ResearchProject>) => void;
}

export const IncheonOpenDataModal: React.FC<IncheonOpenDataModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<GovDatasetItem>(
    INCHEON_20_GOV_DATASETS[0]
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredDatasets = useMemo(() => {
    return INCHEON_20_GOV_DATASETS.filter((ds) => {
      const matchCategory =
        selectedCategory === 'all' || ds.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        ds.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.fourPResearchFocus.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleInjectToFourP = (targetField: 'phenomenon' | 'problem') => {
    const citation = selectedDataset.sample4PCitation({
      district: '인천광역시',
      detail: selectedDataset.keyMetricLabel,
    });
    const currentText = project.fourP[targetField] || '';
    const newText = currentText
      ? `${currentText.trim()}\n\n[공공데이터 근거] ${citation}`
      : `[공공데이터 근거] ${citation}`;

    onUpdateProject({
      fourP: {
        ...project.fourP,
        [targetField]: newText,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    });

    const fieldLabel = targetField === 'phenomenon' ? 'P1. 현상' : 'P2. 문제';
    showToast(`선택한 공공데이터 근거가 ${fieldLabel}에 자동 추가되었습니다!`);
  };

  const handleAddToReadingLog = () => {
    const today = new Date().toISOString().split('T')[0];
    const newReadingLog: ReadingLog = {
      id: `gov-data-${Date.now()}`,
      title: selectedDataset.title,
      author: selectedDataset.agency,
      category: '공공데이터·정부통계',
      readingNotes: `[데이터 개요] ${selectedDataset.description}\n[4P 탐구 초점] ${selectedDataset.fourPResearchFocus}\n[주요 지표] ${selectedDataset.keyMetricLabel}`,
      date: today,
      mediaType: 'paper',
      sourceOrg: selectedDataset.agency,
      url: selectedDataset.dataGoKrUrl,
      linked4PStep: 'P1',
    };

    onUpdateProject({
      readingLogs: [...(project.readingLogs || []), newReadingLog],
      updatedAt: today,
    });

    showToast('탐독 자료(Reading Log)에 공공데이터 출처가 등록되었습니다!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white/15 backdrop-blur-sm shadow-xs">
              <Database className="w-5 h-5 text-emerald-200" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  인천 공공데이터포털(인천데이터넷) 연계 레퍼런스 허브
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  정부·지자체 공인 데이터
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                인천 10개 군·구의 실측 공공데이터를 탐구 근거로 활용하여 연구의 객관성과 학술적 신뢰도를 극대화합니다.
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

        {/* Filter & Search Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              전체 ({INCHEON_20_GOV_DATASETS.length})
            </button>
            {INCHEON_GOV_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="데이터명, 제공기관, 키워드 검색..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Modal Main Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Dataset List (Left Column) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-4 space-y-2 bg-slate-50/50 max-h-[60vh] md:max-h-none">
            <p className="text-[11px] font-bold text-slate-500 uppercase px-1 pb-1">
              공공데이터 목록 ({filteredDatasets.length}건)
            </p>
            {filteredDatasets.map((ds) => {
              const isSelected = selectedDataset.id === ds.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => setSelectedDataset(ds)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {ds.category}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">{ds.agency}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1 mb-1">
                    {ds.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {ds.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Dataset Details & Citation Actions (Right Column) */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 bg-white">
            {selectedDataset && (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {selectedDataset.category}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {selectedDataset.agency}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">
                    {selectedDataset.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedDataset.description}
                  </p>
                </div>

                {/* Key Metrics & Research Focus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 mb-1">
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                      <span>핵심 데이터 지표</span>
                    </div>
                    <p className="text-xs text-teal-900 font-medium">
                      {selectedDataset.keyMetricLabel}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 mb-1">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>4P 탐구 접목 포인트</span>
                    </div>
                    <p className="text-xs text-indigo-900 font-medium">
                      {selectedDataset.fourPResearchFocus}
                    </p>
                  </div>
                </div>

                {/* Citation Preview Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>학술 보고서용 표준 인용문 예시</span>
                    </span>
                    <a
                      href={selectedDataset.dataGoKrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>공공데이터포털 원문</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs font-mono text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {selectedDataset.sample4PCitation({
                      district: '인천광역시',
                      detail: selectedDataset.keyMetricLabel,
                    })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-bold text-slate-800">
                    이 공공데이터를 내 탐구 프로젝트에 즉시 반영하기:
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleInjectToFourP('phenomenon')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>P1. 현상 데이터로 추가</span>
                    </button>
                    <button
                      onClick={() => handleInjectToFourP('problem')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>P2. 문제 원인 근거로 추가</span>
                    </button>
                    <button
                      onClick={handleAddToReadingLog}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>탐독 자료(Reading Log)에 등록</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {toastMessage && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                {toastMessage}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
