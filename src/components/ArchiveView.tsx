import React, { useState } from 'react';
import {
  Archive,
  BookOpen,
  Footprints,
  Sparkles,
  ArrowRight,
  Download,
  Copy,
  CheckCircle2,
  Search,
  Filter,
  Eye,
} from 'lucide-react';
import { ResearchProject, LabId } from '../types';
import { ARCHIVE_PROJECTS } from '../data/archiveData';
import { LABS_DATA } from '../data/labsData';

interface ArchiveViewProps {
  onSelectArchiveProject: (proj: ResearchProject) => void;
  onPreviewProject: (proj: ResearchProject) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  onSelectArchiveProject,
  onPreviewProject,
}) => {
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  const filteredProjects = ARCHIVE_PROJECTS.filter((p) => {
    const matchesLab = selectedLabFilter === 'all' || p.labId === selectedLabFilter;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mainQuestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLab && matchesSearch;
  });

  const handleImport = (proj: ResearchProject) => {
    onSelectArchiveProject(proj);
    setImportedNotice(`[${proj.title}] 연구가 내 워크스페이스로 복제되었습니다!`);
    setTimeout(() => setImportedNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                우수 연구 아카이브
              </span>
              <span className="text-xs text-slate-500">6개 연구실 대표 4P 완성형 보고서</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">4P 읽걷쓰 우수 사회문제탐구 아카이브</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              수업 설계를 돕기 위해 만든 6대 전공별 가상 완성 보고서 예시입니다. 수치·인터뷰·활동 결과는 실제 조사 결과가 아니므로 형식만 참고하고, 학생이 직접 조사한 자료로 바꾸어 사용하세요.
            </p>
          </div>
        </div>

        {importedNotice && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{importedNotice}</span>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {/* Lab Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedLabFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLabFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 보기 ({ARCHIVE_PROJECTS.length})
            </button>
            {LABS_DATA.map((lab) => (
              <button
                key={lab.id}
                onClick={() => setSelectedLabFilter(lab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedLabFilter === lab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lab.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 질문, 연구자 검색..."
              className="w-full text-xs rounded-xl border border-slate-300 pl-8 pr-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Grid of Archive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((proj) => {
          const lab = LABS_DATA.find((l) => l.id === proj.labId) || LABS_DATA[0];
          return (
            <div
              key={proj.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${lab.badgeColor}`}>
                    {lab.name}
                  </span>
                  {proj.evaluationResult && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      평가 {proj.evaluationResult.totalScore}점
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  <strong className="text-slate-800">핵심 질문:</strong> {proj.mainQuestion}
                </p>

                {/* 4P Mini Overview */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-indigo-600 block mb-0.5">P1. 현상</span>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">{proj.fourP.phenomenon}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-purple-600 block mb-0.5">P3. 전공 과업</span>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">{proj.fourP.project}</p>
                  </div>
                </div>

                {/* Footprints & Readings Tag */}
                <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3 h-3 text-emerald-600" />
                    사색 기록 {proj.walkingLogs?.length || 0}건
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-600" />
                    참고 도서 {proj.readingLogs?.length || 0}권
                  </span>
                  <span>·</span>
                  <span>{proj.affiliation}</span>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onPreviewProject(proj)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>보고서 열람</span>
                </button>

                <button
                  id={`btn-import-archive-${proj.id}`}
                  onClick={() => handleImport(proj)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>내 워크스페이스로 복제</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
