import React from 'react';
import {
  LayoutGrid,
  FlaskConical,
  PenTool,
  Sparkles,
  Footprints,
  Archive,
  Printer,
  Beaker,
  FileSpreadsheet,
  BookOpen,
  Share2,
  Users,
  MapPin,
} from 'lucide-react';
import { ActiveTab, ResearchProject } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentProject: ResearchProject;
  onOpenPreview: () => void;
  onOpenGoogleSheetsExport?: () => void;
  onOpenShareModal?: () => void;
  onOpenTeacherDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentProject,
  onOpenPreview,
  onOpenGoogleSheetsExport,
  onOpenShareModal,
  onOpenTeacherDashboard,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: '통합 대시보드', icon: LayoutGrid },
    { id: 'guide', label: '학생 탐구 가이드북', icon: BookOpen, badge: '필독' },
    { id: 'labs', label: '6대 연구실 탐색', icon: FlaskConical },
    { id: 'workspace', label: '4P 연구계획서', icon: PenTool },
    { id: 'ai-evaluator', label: 'AI 질문 평가·추천', icon: Sparkles },
    { id: 'walking-mind', label: '8대 걷기·현장탐구', icon: Footprints },
    { id: 'gis-map', label: '인천 공간지도 (GIS)', icon: MapPin, badge: '공간격차' },
    { id: 'archive', label: '우수 아카이브', icon: Archive },
    { id: 'experimental-lab', label: '실험용 Lab', icon: Beaker, badge: 'NEW' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tier 1: Brand Header & Global Action */}
        <div className="py-3 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none min-w-0"
            onClick={() => onSelectTab('dashboard')}
            id="brand-home-link"
          >
            {/* 4P Rounded Icon Badge */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-[1.02] transition-transform">
              <span className="font-black text-base sm:text-lg tracking-tight">4P</span>
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
                  4P 읽걷쓰 전공연계 사회문제탐구
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  읽·걷·쓰 교육혁신
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium tracking-normal mt-0.5 truncate">
                현상(Phenomenon) · 문제(Problem) · 과업(Project) · 실천(Practice)
              </p>
            </div>
          </div>

          {/* Right Actions: Share Link, Google Sheets Export & Print / Preview Report */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenShareModal && (
              <button
                id="btn-navbar-share"
                type="button"
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 shadow-xs hover:shadow-sm active:scale-[0.98]"
                title="학생들에게 배포할 웹 주소(URL) 및 교실 빔프로젝터용 QR 코드 열기"
              >
                <Share2 className="w-4 h-4 text-blue-100 shrink-0" />
                <span className="whitespace-nowrap">학생 공유 링크·QR</span>
              </button>
            )}

            {onOpenGoogleSheetsExport && (
              <button
                id="btn-navbar-google-sheets"
                type="button"
                onClick={onOpenGoogleSheetsExport}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 shadow-xs hover:shadow-sm active:scale-[0.98]"
                title="선생님 지정 취합 시트 또는 내 드라이브로 과제 제출 (방식 A)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-100 shrink-0" />
                <span className="whitespace-nowrap">구글 시트 과제 제출</span>
              </button>
            )}

            <button
              id="btn-print-preview"
              onClick={onOpenPreview}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 shadow-xs hover:shadow-sm active:scale-[0.98] border border-slate-700"
              title="학교 수행평가 제출용 A4 2페이지 공식 보고서 및 학술 포스터 인쇄 / PDF 저장"
            >
              <Printer className="w-4 h-4 text-indigo-300 shrink-0" />
              <span className="whitespace-nowrap">🏫 학교 제출용 A4 인쇄/포스터</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Navigation Tabs Bar (Fully Responsive & All Tabs Visible) */}
        <div className="border-t border-slate-100 py-1.5 sm:py-2 -mx-2 px-2 sm:mx-0 sm:px-0">
          <nav className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-[13px] whitespace-nowrap transition-all duration-150 font-medium ${
                    isActive
                      ? 'bg-indigo-50/90 text-indigo-700 border border-indigo-200 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

