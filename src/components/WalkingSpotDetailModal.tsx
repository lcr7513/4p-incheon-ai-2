import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Compass,
  Sparkles,
  Quote,
  CheckCircle2,
  Share2,
  ExternalLink,
  Footprints,
  FileText,
  ShieldCheck,
  Info,
  Edit3,
} from 'lucide-react';
import { WalkingSpot } from '../types';

interface WalkingSpotDetailModalProps {
  spot: WalkingSpot | null;
  labName: string;
  onClose: () => void;
  onApplyToProject?: (spot: WalkingSpot, studentReflection?: string) => void;
}

export const WalkingSpotDetailModal: React.FC<WalkingSpotDetailModalProps> = ({
  spot,
  labName,
  onClose,
  onApplyToProject,
}) => {
  const [studentNote, setStudentNote] = useState('');

  if (!spot) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image Section */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
          <img
            src={spot.imageUrl}
            alt={spot.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback image if network fails
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {spot.district}
            </span>
            {spot.courseDistance && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-xs border border-white/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {spot.courseDistance}
              </span>
            )}
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-xs text-indigo-300 font-semibold block mb-0.5">
              {labName} 연계 인천 현장 걷기 코스
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug drop-shadow-sm">
              {spot.name}
            </h3>
            {spot.subName && (
              <p className="text-xs text-slate-200 mt-1 font-medium drop-shadow-xs line-clamp-1">
                {spot.subName}
              </p>
            )}
          </div>
        </div>

        {/* Image Caption Bar with Copyright Info */}
        <div className="px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${spot.isRealIncheonPhoto ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            <span className="font-semibold text-slate-800">사진 설명:</span>
            {spot.imageCaption}
          </span>
          <div className="flex items-center gap-2 shrink-0 text-[11px]">
            <span className="text-slate-500">{spot.location}</span>
            {spot.isRealIncheonPhoto ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{spot.photoCredit || '인천 현장 실사 (위키미디어 오픈 라이선스)'}</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-medium flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>{spot.photoCredit || '현장 탐구 안내 (학생·교사 현장 실사 등록 지원)'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-5 max-h-[58vh] overflow-y-auto">
          {/* Section 1: Incheon Regional Characteristics */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 인천의 장소적·역사적 특징
              </span>
              <span className="text-xs font-bold text-indigo-900">지역 고유성 및 공간적 맥락</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal">
              {spot.incheonFeatures}
            </p>
            {spot.historicalBackground && (
              <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-indigo-100/80 leading-relaxed">
                <span className="font-semibold text-slate-700">역사·공간적 배경:</span>{' '}
                {spot.historicalBackground}
              </p>
            )}
          </div>

          {/* Section 2: Academic Connection to Lab */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              전공 연구실 연계 탐구 착안점 ({labName})
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed mb-2">{spot.inquiryConnection}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-600">추천 사색 이유:</span> {spot.reason}
            </p>
          </div>

          {/* Section 3: Contemplation Prompt */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 relative">
            <Quote className="w-6 h-6 text-amber-300 absolute top-3 right-3 opacity-60" />
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
              현장 사색 발문 (Walking Contemplation)
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-amber-950 italic leading-relaxed">
              {spot.contemplationPrompt}
            </p>
          </div>

          {/* Section 4: Key Waypoints & Tags */}
          <div className="space-y-2.5">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">주요 현장 탐구 경유지</span>
              <div className="flex flex-wrap gap-1.5">
                {spot.keySpots.map((kSpot, idx) => (
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

            <div>
              <div className="flex flex-wrap gap-1 mt-2">
                {spot.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Student Field Contemplation & Observation Workspace */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border-2 border-indigo-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>[학생 작성란] 현장 사색 답변 및 실측·인터뷰 관찰 기록 (P1 현상)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setStudentNote(
                    `[${spot.name} 현장 관찰 기록]\n- 사색 발문 성찰: ${spot.contemplationPrompt}에 대해 탐구하며, `
                  )
                }
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
              >
                발문 초안 불러오기
              </button>
            </div>
            <textarea
              rows={3}
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder={`위 장소에서 직접 관찰한 구체적 사실, 현장 사진 촬영 착안점, 인터뷰 증언이나 사색 발문에 대한 나의 성찰을 적어보세요...\n(작성 후 아래 버튼을 누르면 4P 연구계획서 현상(P1) 단계에 바로 반영됩니다)`}
              className="w-full text-xs text-slate-800 placeholder-slate-400 bg-white border border-indigo-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>본 앱의 이미지는 상업·비상업 무료 이용(Unsplash Free License) 및 교육 목적 저작물 가이드라인을 준수합니다.</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium transition-colors"
            >
              닫기
            </button>
            {onApplyToProject && (
              <button
                onClick={() => {
                  onApplyToProject(spot, studentNote);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>내 작성 메모와 함께 4P(P1)에 인용하기</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
