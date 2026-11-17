import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  X,
  FileText,
  Footprints,
  BookOpen,
  Award,
  Calendar,
  Compass,
  FileSpreadsheet,
  Sparkles,
  Paperclip,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  CheckSquare,
  Square,
  BarChart3,
  Camera,
  Users,
} from 'lucide-react';
import * as XLSX from '../utils/excelXml';
import { ResearchProject } from '../types';
import { LABS_DATA } from '../data/labsData';
import { APPROACH_A_HEADERS, formatProjectToApproachARow } from '../utils/googleSheets';
import { autoDistributeFourP, extractKeySummary } from '../utils/fourPParser';
import { formatCitationAPA, formatCitationKCI, RESEARCH_ETHICS_ITEMS } from '../utils/citationFormatter';
import { StudentRecordHelperModal } from './StudentRecordHelperModal';
import { AcademicChartsView } from './AcademicInquiryChartsModal';

interface PrintPreviewModalProps {
  project: ResearchProject;
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleSheetsExport?: () => void;
  onUpdateProject?: (updated: Partial<ResearchProject>) => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  project,
  isOpen,
  onClose,
  onOpenGoogleSheetsExport,
  onUpdateProject,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'school-2page' | 'poster' | 'report'>('school-2page');
  const [reportSectionStyle, setReportSectionStyle] = useState<'all' | 'matrix-only' | 'narrative-only'>('all');
  const [posterTheme, setPosterTheme] = useState<'navy' | 'emerald' | 'slate'>('navy');
  const [posterSize, setPosterSize] = useState<'A4' | 'A3'>('A4');
  const [savedDistributedNotice, setSavedDistributedNotice] = useState(false);
  const [citationFormat, setCitationFormat] = useState<'kci' | 'apa'>('kci');
  const [showNeisHelperModal, setShowNeisHelperModal] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [ethicsPledged, setEthicsPledged] = useState(project.ethicsPledgeAccepted ?? true);

  const distResult = autoDistributeFourP(project.fourP);
  const distributedFourP = distResult.distributed;

  const THEME_CONFIG = {
    navy: {
      border: 'border-slate-900',
      badge: 'bg-indigo-100 text-indigo-900',
      questionBg: 'bg-slate-900 text-white',
      questionBadge: 'bg-indigo-500 text-white',
      p1: 'border-indigo-200 bg-indigo-50/30 text-indigo-900',
      p2: 'border-blue-200 bg-blue-50/30 text-blue-900',
      p3: 'border-purple-200 bg-purple-50/30 text-purple-900',
      p4: 'border-emerald-200 bg-emerald-50/30 text-emerald-900',
    },
    emerald: {
      border: 'border-emerald-900',
      badge: 'bg-emerald-100 text-emerald-950',
      questionBg: 'bg-emerald-950 text-white',
      questionBadge: 'bg-teal-500 text-white',
      p1: 'border-teal-300 bg-teal-50/30 text-teal-900',
      p2: 'border-emerald-300 bg-emerald-50/30 text-emerald-900',
      p3: 'border-cyan-300 bg-cyan-50/30 text-cyan-900',
      p4: 'border-green-300 bg-green-50/30 text-green-900',
    },
    slate: {
      border: 'border-zinc-800',
      badge: 'bg-slate-200 text-slate-900',
      questionBg: 'bg-zinc-900 text-white',
      questionBadge: 'bg-slate-600 text-white',
      p1: 'border-slate-300 bg-slate-50/40 text-slate-900',
      p2: 'border-zinc-300 bg-zinc-50/40 text-zinc-900',
      p3: 'border-neutral-300 bg-neutral-50/40 text-neutral-900',
      p4: 'border-stone-300 bg-stone-50/40 text-stone-900',
    },
  };

  if (!isOpen) return null;

  const lab = LABS_DATA.find((l) => l.id === project.labId) || LABS_DATA[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const md = `
# [4P 읽걷쓰 전공연계 사회문제탐구 보고서]
## ${project.title}

- **전공 연구실**: ${lab.name} (${lab.englishName})
- **연구자**: ${project.author || '학생연구원'} (${project.affiliation || '학교명 미입력'})
- **작성일자**: ${project.updatedAt || project.createdAt}
- **핵심 질문**: ${project.mainQuestion}

---

### [4P 탐구 프레임워크]

#### P1. 현상 (Phenomenon)
${distributedFourP.phenomenon || '(미작성)'}

#### P2. 문제 (Problem)
${distributedFourP.problem || '(미작성)'}

#### P3. 과업 (Project / Task - 전공 연구방법론)
${distributedFourP.project || '(미작성)'}

#### P4. 실천 (Practice - 사회적 적용)
${distributedFourP.practice || '(미작성)'}

---

### [현장 걷기(Walk) 사색 기록]
${
  project.walkingLogs?.length > 0
    ? project.walkingLogs
        .map(
          (w) =>
            `- [${w.date}] ${w.courseName} (${w.activityType ? `${w.activityType} / ` : ''}${w.steps.toLocaleString()}보 / ${w.durationMinutes}분 / 몰입도 ${w.focusScore}점)\n  > 사색 메모: "${w.thoughtNote}"${
              w.findings ? `\n  > 현장 실측/인터뷰: "${w.findings}"` : ''
            }`
        )
        .join('\n\n')
    : '기록 없음'
}

---

### [탐독 자료(Read - 도서·논문·기사·영상) 목록]
${
  project.readingLogs?.length > 0
    ? project.readingLogs
        .map((r) => {
          const typeLabel =
            r.mediaType === 'paper'
              ? '[학술논문]'
              : r.mediaType === 'news'
              ? '[신문기사]'
              : r.mediaType === 'video'
              ? '[유튜브영상]'
              : '[도서]';
          const meta = [
            r.author ? `저자: ${r.author}` : '',
            r.sourceOrg ? `출처: ${r.sourceOrg}` : '',
            r.timestampOrPage ? `인용: ${r.timestampOrPage}` : '',
            r.linked4PStep ? `연계: ${r.linked4PStep.toUpperCase()}` : '',
            r.url ? `URL: ${r.url}` : '',
          ]
            .filter(Boolean)
            .join(' | ');
          return `- ${typeLabel} 《${r.title}》 (${meta || r.category})\n  > "${r.readingNotes}"`;
        })
        .join('\n\n')
    : '기록 없음'
}

---

### [학생 탐구 성찰 및 나의 성장]

#### 🌱 탐구과정에서 노력한 점
${project.effortNotes || '(미작성)'}

#### 🌟 탐구를 통해 성장한 점
${project.growthNotes || '(미작성)'}

#### 📎 과제 첨부파일 및 연구 포트폴리오
- 파일명: ${project.attachmentName || '(미첨부)'}
- 링크: ${project.attachmentUrl || '(링크 없음)'}

---

### [표준 참고문헌 (References - KCI/APA 서식)]
${
  project.readingLogs?.length > 0
    ? project.readingLogs
        .map((r, i) => `${i + 1}. ${formatCitationKCI(r)}`)
        .join('\n')
    : '등록된 참고문헌 없음'
}

---

### [연구 윤리 및 생성형 AI 윤리적 활용 준수 서약]
- 데이터 진실성 준수: 모든 관찰·실험 데이터는 조작 및 위변조 없이 정직하게 작성됨
- 표절 방지: 타인의 저작물 및 공공데이터의 공식 출처를 명확히 밝힘
- AI 윤리적 활용: AI의 제안을 비판적으로 수용하고 연구자 고유의 사고와 결론으로 완성함
- 서약 상태: 연구 윤리 준수 서약 완료 (${project.author || '학생연구원'})
${
  project.evaluationResult
    ? `
---

### [AI 학술 멘토링 진단 결과]
- 종합 점수: ${project.evaluationResult.totalScore}점 / 100점
- 멘토 총평: ${project.evaluationResult.overallReview}
- 추천 심화 질문: ${project.evaluationResult.questionUpgrades[2]?.question || ''}
`
    : ''
}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4P_연구보고서_${project.title.slice(0, 20)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const txt = `
[4P 읽걷쓰 전공연계 사회문제탐구 계획서]
제목: ${project.title}
전공연구실: ${lab.name}
연구자: ${project.author} (${project.affiliation})
핵심질문: ${project.mainQuestion}

[P1 현상]
${distributedFourP.phenomenon}

[P2 문제]
${distributedFourP.problem}

[P3 과업]
${distributedFourP.project}

[P4 실천]
${distributedFourP.practice}

[탐구과정에서 노력한 점]
${project.effortNotes || '(미작성)'}

[탐구를 통해 성장한 점]
${project.growthNotes || '(미작성)'}

[첨부파일]
${project.attachmentName || ''} (${project.attachmentUrl || '링크 없음'})

[참고문헌 (References)]
${project.readingLogs?.map((r, i) => `${i + 1}. ${formatCitationKCI(r)}`).join('\n') || '등록된 문헌 없음'}

[연구 윤리 서약]
데이터 진실성 준수, 출처 표기, 생성형 AI 윤리적 활용 서약 완료 (${project.author || '학생연구자'})
`;
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4P_연구보고서_${project.title.slice(0, 20)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: 방식 A 단일 행 가로 요약형 (구글 시트 연동 양식과 동일)
    const approachAData = [
      APPROACH_A_HEADERS,
      formatProjectToApproachARow({ ...project, fourP: distributedFourP }),
    ];
    const wsApproachA = XLSX.utils.aoa_to_sheet(approachAData);
    XLSX.utils.book_append_sheet(wb, wsApproachA, '방식A_학생요약_1행');

    // Sheet 2: 4P 연구 프레임워크 및 종합 진단
    const overviewData = [
      ['4P 읽걷쓰 전공연계 사회문제탐구 연구보고서'],
      [''],
      ['구분', '내용'],
      ['학교명', project.schoolName || '학교명 미입력'],
      ['학번', project.studentId || '-'],
      ['연구자(학생)', project.author || '학생연구원'],
      ['소속 학급', project.affiliation || '학급 미입력'],
      ['연구 제목', project.title],
      ['전공 연구실', `${lab.name} (${lab.englishName})`],
      ['작성/수정일', project.updatedAt || project.createdAt || new Date().toISOString().slice(0, 10)],
      ['핵심 연구 질문', project.mainQuestion],
      [''],
      ['[4P 탐구 프레임워크]', ''],
      ['P1. 현상 (Phenomenon)', distributedFourP.phenomenon || '(미작성)'],
      ['P2. 문제 (Problem)', distributedFourP.problem || '(미작성)'],
      ['P3. 과업 (Project/Task - 전공 연구방법론)', distributedFourP.project || '(미작성)'],
      ['P4. 실천 (Practice - 사회적 적용)', distributedFourP.practice || '(미작성)'],
      [''],
      ['[학생 탐구 성찰 및 나의 성장]', ''],
      ['🌱 탐구과정에서 노력한 점', project.effortNotes || '(미작성)'],
      ['🌟 탐구를 통해 성장한 점', project.growthNotes || '(미작성)'],
      ['📎 과제 첨부파일 및 링크', project.attachmentName ? `${project.attachmentName} (${project.attachmentUrl || '링크 없음'})` : (project.attachmentUrl || '(미첨부)')],
      [''],
      ['[AI 학술 멘토링 진단 결과]', ''],
      ['진단 종합점수', project.evaluationResult ? `${project.evaluationResult.totalScore}점 / 100점` : '평가 대기'],
      ['멘토 총평', project.evaluationResult ? project.evaluationResult.overallReview : '-'],
      ['심화 발전 질문', project.evaluationResult?.questionUpgrades?.[2]?.question || '-'],
      [''],
      ['[교사 관찰 메모 / 세특]', project.teacherMemo || '-'],
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    wsOverview['!cols'] = [{ wch: 28 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsOverview, '4P_연구프레임워크');

    // Sheet 3: 현장 걷기(Walk) 사색 및 실측 기록
    const walkingHeaders = [
      ['현장 걷기(Walk) 및 사색 활동 기록'],
      [''],
      ['순번', '탐구 일자', '인천 탐구 코스명', '활동 유형', '걸음수(보)', '소요시간(분)', '몰입도(1~5점)', '현장 사색 메모', '현장 실측 및 인터뷰 내용'],
    ];
    const walkingRows = (project.walkingLogs || []).map((w, idx) => [
      idx + 1,
      w.date,
      w.courseName,
      w.activityType || '관찰/사색',
      w.steps,
      w.durationMinutes,
      w.focusScore,
      w.thoughtNote,
      w.findings || '',
    ]);
    const wsWalking = XLSX.utils.aoa_to_sheet([...walkingHeaders, ...walkingRows]);
    wsWalking['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 30 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 45 },
      { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(wb, wsWalking, '현장걷기_사색기록');

    // Sheet 4: 다각도 읽기(Read - 도서, 논문, 기사, 영상) 탐독 목록
    const readingHeaders = [
      ['다각도 읽기(Read) 문헌·논문·기사·영상 탐독 노트 목록'],
      [''],
      ['순번', '자료 유형', '자료 제목', '저자/제작자', '출처/기관/언론사', '인용 페이지/타임스탬프', '연계 4P 단계', '참고 URL', '핵심 발췌 및 사색 메모'],
    ];
    const readingRows = (project.readingLogs || []).map((r, idx) => {
      const typeLabel =
        r.mediaType === 'paper'
          ? '학술논문/보고서'
          : r.mediaType === 'news'
          ? '신문기사/사설'
          : r.mediaType === 'video'
          ? '유튜브/영상다큐'
          : '단행본 도서';
      return [
        idx + 1,
        typeLabel,
        r.title,
        r.author,
        r.sourceOrg || r.category || '',
        r.timestampOrPage || '',
        r.linked4PStep ? r.linked4PStep.toUpperCase() : '전체',
        r.url || '',
        r.readingNotes,
      ];
    });
    const wsReading = XLSX.utils.aoa_to_sheet([...readingHeaders, ...readingRows]);
    wsReading['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 32 },
      { wch: 18 },
      { wch: 20 },
      { wch: 16 },
      { wch: 12 },
      { wch: 30 },
      { wch: 60 },
    ];
    XLSX.utils.book_append_sheet(wb, wsReading, '다각도읽기_탐독노트');

    // Sheet 4: 전공 연구실 추천 인천 탐구 스팟
    const spotHeaders = [
      [`${lab.name} 전공연계 인천 핵심 현장탐구 스팟`],
      [''],
      ['순번', '장소명', '부제/성격', '위치/주소', '거리 및 소요시간', '추천 이유 및 탐구 연계점', '핵심 경유지'],
    ];
    const spotRows = (lab.walkingSpots || []).map((s, idx) => [
      idx + 1,
      s.name,
      s.subName,
      s.location,
      s.courseDistance || '-',
      s.reason || s.inquiryConnection || '',
      Array.isArray(s.keySpots) ? s.keySpots.join(', ') : '',
    ]);
    const wsSpots = XLSX.utils.aoa_to_sheet([...spotHeaders, ...spotRows]);
    wsSpots['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 35 },
      { wch: 30 },
      { wch: 18 },
      { wch: 50 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsSpots, '인천_추천탐구스팟');

    const sanitizedTitle = (project.title || '4P_연구보고서')
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 20);
    XLSX.writeFile(wb, `4P_연구자료_${sanitizedTitle}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Modal Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-slate-900">4P 연구 인쇄 미리보기</span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-200/90 rounded-xl text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('school-2page')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'school-2page'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="학교 및 교육청 공식 수행평가 제출용 A4 2페이지 완결 규격"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>🏫 학교 제출용 (A4 2장 완결)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('poster')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'poster'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="교내 학술제 및 복도 전시용 A4/A3 1장 학술 포스터"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎨 1장 학술 포스터 (A3/A4)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('report')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'report'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="전공 연구방법론 및 단계별 심층 서술 본문 전체 출력"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📄 전공 심층 보고서 (전체)</span>
              </button>
            </div>

            {/* Report Section Filter Toggle (Report Mode) */}
            {viewMode === 'report' && (
              <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-bold shadow-2xs">
                <span className="text-[11px] text-slate-500 px-1 hidden sm:inline">보고서 구성:</span>
                <button
                  type="button"
                  onClick={() => setReportSectionStyle('all')}
                  className={`px-2 py-0.5 rounded-lg transition-all text-xs ${
                    reportSectionStyle === 'all'
                      ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="1번 요약 매트릭스 표와 2번 세부 학술분석 본문을 모두 출력"
                >
                  통합 심층형 (1+2번)
                </button>
                <button
                  type="button"
                  onClick={() => setReportSectionStyle('matrix-only')}
                  className={`px-2 py-0.5 rounded-lg transition-all text-xs ${
                    reportSectionStyle === 'matrix-only'
                      ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="중복 없이 1번 요약 매트릭스 표만 1페이지로 깔끔하게 출력"
                >
                  요약 매트릭스형 (1번만)
                </button>
                <button
                  type="button"
                  onClick={() => setReportSectionStyle('narrative-only')}
                  className={`px-2 py-0.5 rounded-lg transition-all text-xs ${
                    reportSectionStyle === 'narrative-only'
                      ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="표 없이 2번 단계별 세부 학술 분석 본문 위주로 출력"
                >
                  세부 분석형 (2번만)
                </button>

                <div className="w-px h-3.5 bg-slate-300 mx-1"></div>

                <button
                  type="button"
                  onClick={() => setIncludeCharts(!includeCharts)}
                  className={`px-2 py-0.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                    includeCharts
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                  title="보고서에 4P 역량 거미줄 차트 및 인천 군·구 통계 시각화 섹션 포함 여부 토글"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>학술 차트 {includeCharts ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            )}

            {/* Feature 3: Poster 3-Color Theme Selector */}
            {viewMode === 'poster' && (
              <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs font-bold shadow-2xs">
                <span className="text-[11px] text-slate-500 px-1">테마:</span>
                <button
                  type="button"
                  onClick={() => setPosterTheme('navy')}
                  className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 ${
                    posterTheme === 'navy'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="클래식 네이비 학술 테마"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  <span>네이비</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPosterTheme('emerald')}
                  className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 ${
                    posterTheme === 'emerald'
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="에코 에메랄드 환경·도시 테마"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>에메랄드</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPosterTheme('slate')}
                  className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 ${
                    posterTheme === 'slate'
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="모던 슬레이트 미니멀 테마"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                  <span>슬레이트</span>
                </button>

                <div className="w-px h-3.5 bg-slate-300 mx-1"></div>
                <span className="text-[11px] text-slate-500 px-1">규격:</span>
                <button
                  type="button"
                  onClick={() => setPosterSize('A4')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    posterSize === 'A4'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="일반 A4 1페이지 포스터"
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => setPosterSize('A3')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    posterSize === 'A3'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                  title="학교 축제 및 복도 전시용 대형 A3 규격"
                >
                  A3·전지
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-preview-neis-helper"
              type="button"
              onClick={() => setShowNeisHelperModal(true)}
              className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ring-1 ring-white/20"
              title="교육부 500자/1,500Byte 표준 맞춤형 생활기록부(세특·동아리·진로) 생성 도우미 열기"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-200" />
              <span>🎓 생기부 세특 도우미</span>
            </button>

            {onOpenGoogleSheetsExport && (
              <button
                id="btn-preview-google-sheets"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoogleSheetsExport();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                title="선생님 지정 취합 시트 또는 내 드라이브로 과제 제출 (방식 A)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                <span>구글 시트 과제 제출 (방식 A)</span>
              </button>
            )}

            <button
              id="btn-download-excel"
              onClick={handleDownloadExcel}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="방식 A 1행 요약 및 세부 탭이 포함된 엑셀 호환(.xls) 파일로 저장"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>엑셀 시트(.xls) 저장</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Markdown 다운로드</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT 다운로드</span>
            </button>

            <a
              href="/전체_대화_녹취록_전문.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="지금까지 나눈 모든 질문과 답변 전체 녹취록 열람 및 다운로드"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>전체 대화 녹취록 전문</span>
            </a>

            <a
              href="/인천_읽걷쓰_4P_심화탐구_개발대화록_및_운영가이드.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="지금까지의 모든 개발 대화록 및 교사용 전체 운영 가이드 열람 및 다운로드"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>개발대화록·운영가이드</span>
            </a>

            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>원클릭 A4 인쇄 / PDF 저장</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Tips Information Bar */}
        <div className="px-5 py-2.5 bg-indigo-50/90 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950 font-medium print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[10px] tracking-wide">A4 인쇄 꿀팁</span>
            <span>브라우저 인쇄 창(Ctrl+P) 설정에서 <strong>[배경 그래픽(Background graphics)]</strong>을 체크하시면 표 배경색과 차트 색상이 원본 그대로 선명하게 인쇄됩니다.</span>
          </div>
          <span className="text-[11px] text-indigo-700 font-bold bg-white px-2.5 py-0.5 rounded-md border border-indigo-200">
            권장 규격: A4 세로 (Portrait)
          </span>
        </div>

        {/* Printable Paper Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto grow bg-slate-100/50 flex justify-center items-start">
          {viewMode === 'poster' ? (
            /* 1-Page Academic Poster Template (교내 학술제 및 복도 전시용 요약 포스터) */
            <div
              ref={printRef}
              id="printable-poster"
              className={`bg-white w-full ${
                posterSize === 'A3' ? 'max-w-5xl p-8 sm:p-10 space-y-5 text-sm' : 'max-w-4xl p-6 sm:p-8 space-y-4 text-xs'
              } rounded-2xl shadow-xs border-2 ${THEME_CONFIG[posterTheme].border} text-slate-900 font-sans h-auto min-h-fit self-start shrink-0 print:p-6 print:border-2 print:shadow-none print:max-h-none print:break-inside-avoid`}
            >
              {/* Poster Header */}
              <div className={`border-b-2 ${THEME_CONFIG[posterTheme].border} pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
                    <span>인천 지역 기반 읽·걷·쓰 전공연계 사회문제탐구</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-md font-extrabold ${THEME_CONFIG[posterTheme].badge}`}>{lab.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold border border-slate-300">
                      {posterSize} 학술 포스터
                    </span>
                  </div>
                  <h1 className={`${posterSize === 'A3' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 leading-tight mt-1.5 tracking-tight`}>
                    {project.title || '4P 사회문제탐구 학술 포스터'}
                  </h1>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-700 shrink-0 font-medium space-y-0.5">
                  <div><strong>{project.schoolName || '인천고등학교'}</strong> · {project.affiliation || '소속 학급'}</div>
                  <div className="text-slate-900 font-black text-sm mt-0.5">
                    {project.studentId ? `[${project.studentId}] ` : ''}{project.author || '학생연구자'}
                    {project.isGroupResearch ? ' (대표)' : ''}
                  </div>
                  {project.isGroupResearch && project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="text-[10px] text-slate-600 font-semibold pt-0.5 max-w-xs sm:ml-auto">
                      <span className="text-indigo-700 font-bold mr-1">공동 연구원:</span>
                      {project.teamMembers.map((m, idx) => (
                        <span key={m.id} className="inline-block mr-1">
                          {m.name || '팀원'}{m.studentId ? `(${m.studentId})` : ''}{idx < (project.teamMembers?.length || 0) - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Research Question Callout Banner */}
              <div className={`px-4 py-3 rounded-xl ${THEME_CONFIG[posterTheme].questionBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs`}>
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${THEME_CONFIG[posterTheme].questionBadge} shrink-0`}>
                    핵심 연구 질문
                  </span>
                  <span className="text-xs sm:text-sm font-bold italic leading-snug">
                    &ldquo;{project.mainQuestion || '핵심 연구 질문이 아직 작성되지 않았습니다.'}&rdquo;
                  </span>
                </div>
                {project.evaluationResult && (
                  <div className="text-right shrink-0 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-200 block">AI 멘토링 평점</span>
                    <span className="text-xs font-black text-amber-300">{project.evaluationResult.totalScore}점 / 100점</span>
                  </div>
                )}
              </div>

              {/* 4P 4-Quadrant Main Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* P1 */}
                <div className={`p-3.5 rounded-xl border-2 ${THEME_CONFIG[posterTheme].p1} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>[P1] 현상 포착 (Phenomenon)</span>
                      </span>
                      <span className="text-[10px] font-bold bg-white/80 border border-slate-200 px-1.5 py-0.2 rounded">Fact & Data</span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-line line-clamp-6">
                      {distributedFourP.phenomenon || '현상 내용 없음'}
                    </p>
                  </div>
                </div>

                {/* P2 */}
                <div className={`p-3.5 rounded-xl border-2 ${THEME_CONFIG[posterTheme].p2} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        <span>[P2] 문제원인 분석 (Problem)</span>
                      </span>
                      <span className="text-[10px] font-bold bg-white/80 border border-slate-200 px-1.5 py-0.2 rounded">Causality & Structure</span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-line line-clamp-6">
                      {distributedFourP.problem || '문제원인 내용 없음'}
                    </p>
                  </div>
                </div>

                {/* P3 */}
                <div className={`p-3.5 rounded-xl border-2 ${THEME_CONFIG[posterTheme].p3} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                        <span>[P3] 전공 과업 및 방법론 (Project)</span>
                      </span>
                      <span className="text-[10px] font-bold bg-white/80 border border-slate-200 px-1.5 py-0.2 rounded">Methodology & Task</span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-line line-clamp-6">
                      {distributedFourP.project || '과업 방법론 내용 없음'}
                    </p>
                  </div>
                </div>

                {/* P4 */}
                <div className={`p-3.5 rounded-xl border-2 ${THEME_CONFIG[posterTheme].p4} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>[P4] 사회적 실천 및 정책제언 (Practice)</span>
                      </span>
                      <span className="text-[10px] font-bold bg-white/80 border border-slate-200 px-1.5 py-0.2 rounded">Action & Policy</span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-line line-clamp-6">
                      {distributedFourP.practice || '실천 제언 내용 없음'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom 3-Column Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                {/* 1. Walk & Read Evidence */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                    <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                    <span>현장 걷기 & 다각도 읽기</span>
                  </div>
                  <div className="text-slate-700 space-y-1 text-[11px]">
                    {project.walkingLogs?.[0] ? (
                      <p className="truncate">
                        <strong>답사:</strong> {project.walkingLogs[0].courseName} ({project.walkingLogs[0].steps.toLocaleString()}보)
                      </p>
                    ) : (
                      <p className="text-slate-400">답사 기록 없음</p>
                    )}
                    {project.readingLogs?.[0] ? (
                      <p className="truncate">
                        <strong>자료:</strong> 《{project.readingLogs[0].title}》 ({project.readingLogs[0].author})
                      </p>
                    ) : (
                      <p className="text-slate-400">읽기 기록 없음</p>
                    )}
                    {project.readingLogs?.[1] && (
                      <p className="truncate">
                        <strong>자료:</strong> 《{project.readingLogs[1].title}》 ({project.readingLogs[1].author})
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Effort & Growth Reflection */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>학생 성찰 & 과제 링크</span>
                  </div>
                  <div className="text-slate-700 space-y-1 text-[11px]">
                    <p className="truncate">🌱 <strong>노력:</strong> {project.effortNotes || '(미작성)'}</p>
                    <p className="truncate">🌟 <strong>성장:</strong> {project.growthNotes || '(미작성)'}</p>
                    {project.attachmentName && (
                      <p className="truncate text-indigo-700 font-semibold">📎 {project.attachmentName}</p>
                    )}
                  </div>
                </div>

                {/* 3. AI Mentor & Teacher Memo */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI 멘토링 & 교사 메모</span>
                  </div>
                  <div className="text-slate-700 space-y-0.5 text-[11px]">
                    {project.evaluationResult ? (
                      <p className="truncate text-indigo-900 font-medium">
                        총평: {project.evaluationResult.overallReview}
                      </p>
                    ) : (
                      <p className="text-slate-400">AI 평가 대기</p>
                    )}
                    {project.teacherMemo && (
                      <p className="truncate text-emerald-800">
                        <strong>세특:</strong> {project.teacherMemo}
                      </p>
                    )}
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      인천 읽·걷·쓰 교내 학술제 1장 요약 포스터
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Observation Photos Gallery on Poster if present */}
              {(() => {
                const allPhotos = (project.walkingLogs || []).flatMap((w) => w.photos || []);
                if (allPhotos.length === 0) return null;
                return (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>인천 현장 답사 인증 사진 (Field Observation Evidence)</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{allPhotos.length}장 첨부됨</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {allPhotos.slice(0, 4).map((ph, idx) => (
                        <div key={ph.id || idx} className="rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
                          <img src={ph.url} alt={ph.caption || '답사 사진'} className="w-full h-20 object-cover" />
                          {ph.caption && (
                            <div className="p-1 text-[10px] text-slate-700 truncate font-medium bg-slate-50">
                              {ph.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : viewMode === 'school-2page' ? (
            /* ========================================================================= */
            /* School 2-Page Official Submission Form (학교·교육청 공식 수행평가 제출용 서식) */
            /* ========================================================================= */
            <div
              ref={printRef}
              id="printable-report"
              className="bg-white w-full max-w-4xl p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 text-slate-900 font-sans space-y-5 print:p-0 print:border-none print:shadow-none"
            >
              {/* ========================================== */}
              {/* PAGE 1: 연구 개요 및 4P 핵심 매트릭스 설계 */}
              {/* ========================================== */}
              <div className="space-y-4">
                {/* Official School Submission Document Header with Approval Stamp Boxes */}
                <div className="border-2 border-slate-900 rounded-xl p-3 sm:p-4 bg-white">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-black text-indigo-700 tracking-wider">
                        <span>인천광역시교육청 읽·걷·쓰 전공연계 미래형 사회문제탐구</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 font-bold">{lab.name}</span>
                      </div>
                      <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1 leading-snug">
                        2026학년도 학생 자율 사회문제탐구 [4P 최종 보고서]
                      </h1>
                    </div>

                    {/* Official Sign-off Stamp Table (결재란) */}
                    <table className="border-collapse border border-slate-700 text-center text-[10px] shrink-0 bg-slate-50">
                      <tbody>
                        <tr>
                          <th className="border border-slate-700 px-2 py-0.5 font-bold bg-slate-100 text-slate-700" rowSpan={2}>
                            확<br />인
                          </th>
                          <th className="border border-slate-700 px-3 py-0.5 font-bold bg-slate-100 text-slate-700">제출 학생</th>
                          <th className="border border-slate-700 px-3 py-0.5 font-bold bg-slate-100 text-slate-700">지도 교사</th>
                        </tr>
                        <tr>
                          <td className="border border-slate-700 w-16 h-10 align-middle font-bold text-slate-900">
                            {project.author || '학생'}
                            <div className="text-[9px] text-slate-400 font-normal">(서명)</div>
                          </td>
                          <td className="border border-slate-700 w-16 h-10 align-middle text-slate-400 font-medium">
                            (인)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Student Metadata Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">소속 학교</span>
                      <span className="font-black text-slate-900">{project.schoolName || '인천고등학교'}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">학년 / 반 / 번호</span>
                      <span className="font-bold text-slate-900">{project.affiliation || '2학년 3반 15번'}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">연구자 성명</span>
                      <span className="font-black text-slate-900">
                        {project.studentId ? `[${project.studentId}] ` : ''}{project.author || '학생연구원'}
                        {project.isGroupResearch ? ' (대표)' : ''}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">제출 및 최종 갱신일</span>
                      <span className="font-bold text-slate-700">{project.updatedAt || project.createdAt}</span>
                    </div>
                  </div>

                  {project.isGroupResearch && project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-700 shrink-0">공동 연구원:</span>
                      <span className="text-slate-700 font-medium">
                        {project.teamMembers.map(m => `${m.name || '팀원'}${m.studentId ? `(${m.studentId})` : ''} [${m.role || '역할'}]`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Research Title & Question Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>연구 주제명</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {project.title || '4P 전공연계 사회문제탐구 계획서'}
                  </h2>
                  <div className="pt-1.5 border-t border-white/20 flex items-start gap-2 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-400/40 shrink-0 mt-0.5">
                      핵심 질문
                    </span>
                    <p className="font-bold text-indigo-100 leading-snug">
                      &ldquo;{project.mainQuestion || '핵심 연구 질문이 아직 작성되지 않았습니다.'}&rdquo;
                    </p>
                  </div>
                </div>

                {/* 4P Core Executive Summary Matrix Table */}
                <div className="border border-slate-300 rounded-xl overflow-hidden text-xs shadow-2xs">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center justify-between">
                    <span className="font-black text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-indigo-600" />
                      <span>[1] 4P 탐구 핵심 매트릭스 (현상 ➔ 원인 ➔ 과업 ➔ 실천)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">사회과 문제해결 4단계 논리 체계</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 font-bold text-slate-800 text-[11px]">
                        <th className="p-2.5 w-1/4 border-r border-slate-300">
                          <span className="text-indigo-950 font-black block">P1. 현상 (Phenomenon)</span>
                          <span className="text-[9px] text-indigo-600 font-normal">포착된 통계 관측치 & 사실</span>
                        </th>
                        <th className="p-2.5 w-1/4 border-r border-slate-300">
                          <span className="text-blue-950 font-black block">P2. 문제 (Problem)</span>
                          <span className="text-[9px] text-blue-600 font-normal">심층 원인 & 도시 불평등</span>
                        </th>
                        <th className="p-2.5 w-1/4 border-r border-slate-300">
                          <span className="text-purple-950 font-black block">P3. 과업 (Project)</span>
                          <span className="text-[9px] text-purple-600 font-normal">연구실 이론 기반 방법론</span>
                        </th>
                        <th className="p-2.5 w-1/4">
                          <span className="text-emerald-950 font-black block">P4. 실천 (Practice)</span>
                          <span className="text-[9px] text-emerald-600 font-normal">지역사회 적용 & 조례 대안</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="divide-x divide-slate-300 align-top text-slate-700 leading-relaxed bg-white">
                        <td className="p-2.5 text-[11px] whitespace-pre-line text-slate-800">
                          {distributedFourP.phenomenon || '(미작성)'}
                        </td>
                        <td className="p-2.5 text-[11px] whitespace-pre-line text-slate-800">
                          {distributedFourP.problem || '(미작성)'}
                        </td>
                        <td className="p-2.5 text-[11px] whitespace-pre-line text-slate-800">
                          {distributedFourP.project || '(미작성)'}
                        </td>
                        <td className="p-2.5 text-[11px] whitespace-pre-line text-slate-800">
                          {distributedFourP.practice || '(미작성)'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Official Data Mining & Statistical Evidence Box */}
                <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>[2] 인천 공공데이터 통계 증빙 및 실증 지표 분석</span>
                    </span>
                    <span className="text-[10px] text-indigo-700 font-bold px-2 py-0.5 rounded bg-indigo-100/70 border border-indigo-200">
                      통계청 KOSIS & 인천 공공데이터 포털 공식 근거
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="font-black text-amber-800 block mb-1">📊 P1 현상 통계 인용문:</span>
                      <p className="text-slate-700 leading-relaxed font-mono text-[10.5px]">
                        {distributedFourP.phenomenon ? extractKeySummary(distributedFourP.phenomenon, 130) : '신도심(연수구) 청년고용률 52.4% vs 원도심(동구) 청년고용률 41.2%로 11.2%p 격차 확인됨.'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="font-black text-blue-800 block mb-1">🔍 P2 구조적 원인 메커니즘:</span>
                      <p className="text-slate-700 leading-relaxed font-mono text-[10.5px]">
                        {distributedFourP.problem ? extractKeySummary(distributedFourP.problem, 130) : '송도 첨단 R&D 산업 집중과 원도심 중화학 제조업 쇠퇴에 따른 청년 유출 및 고령 1인가구 고착화 불평등.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAGE BREAK MARKER (Visible on Screen, Triggers Page Break on Print) */}
              <div className="print-page-break my-6 pt-2.5 pb-2.5 border-y-2 border-dashed border-indigo-300 print:border-none print:m-0 print:p-0 flex items-center justify-between text-xs text-indigo-800 font-bold bg-indigo-50/70 print:hidden px-4 rounded-xl">
                <span className="flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>인쇄 시 여기서 자동으로 [제 2 페이지]로 넘어갑니다 (A4 2장 규격 완결)</span>
                </span>
                <span className="text-[11px] font-mono text-indigo-600">Page 1 / Page 2 Divider</span>
              </div>

              {/* ========================================================= */}
              {/* PAGE 2: 현장 실증 답사, 탐독 문헌, 성찰 및 연구 윤리 서약 */}
              {/* ========================================================= */}
              <div className="space-y-4 pt-2">
                {/* Page 2 Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <span>제 2 페이지: 현장 실증 답사, 탐독 문헌, 성찰 및 연구 윤리 서약</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {project.schoolName || '인천고'} | {project.author || '학생'}
                  </span>
                </div>

                {/* 3. Field Walking 15,000 Steps & Photo Evidence */}
                <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                      <span>[3] 현장 걷기(Walk) 15,000보 실측 사색 일지 & 사진 증빙</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      총 {project.walkingLogs?.reduce((acc, w) => acc + (w.steps || 0), 0).toLocaleString()}보 완주
                    </span>
                  </div>

                  {project.walkingLogs && project.walkingLogs.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {project.walkingLogs.slice(0, 2).map((w, idx) => (
                        <div key={w.id || idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900">
                              📍 {w.courseName} <span className="text-slate-500 font-normal">({w.date} · {w.steps.toLocaleString()}보 · {w.durationMinutes}분)</span>
                            </span>
                            <span className="text-emerald-700 font-bold">몰입도 {w.focusScore}/5점</span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-snug italic">&ldquo;{w.thoughtNote}&rdquo;</p>
                          {w.findings && (
                            <p className="text-indigo-900 text-[10.5px] leading-snug font-medium bg-white p-1 rounded border border-slate-200">
                              실측/인터뷰: {w.findings}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">등록된 현장 답사 기록이 없습니다.</p>
                  )}

                  {/* Photo Evidence Thumbnails */}
                  {(() => {
                    const allPhotos = (project.walkingLogs || []).flatMap((w) => w.photos || []);
                    if (allPhotos.length === 0) return null;
                    return (
                      <div className="pt-1 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-slate-600 block mb-1">📸 현장 답사 인증 사진:</span>
                        <div className="grid grid-cols-4 gap-2">
                          {allPhotos.slice(0, 4).map((p, i) => (
                            <div key={p.id || i} className="rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
                              <img src={p.url} alt={p.caption || '답사 사진'} className="w-full h-16 object-cover" />
                              {p.caption && <div className="p-0.5 text-[9px] text-slate-700 truncate text-center">{p.caption}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 4. Reading References (KCI Citation) */}
                <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>[4] 다각도 읽기(Read) 문헌 탐독 및 표준 참고문헌</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">KCI 표준 학술 서식</span>
                  </div>
                  {project.readingLogs && project.readingLogs.length > 0 ? (
                    <div className="space-y-1 text-[11px] font-serif leading-relaxed text-slate-800">
                      {project.readingLogs.slice(0, 3).map((r, i) => (
                        <div key={r.id || i} className="pl-4 -indent-4">
                          <span className="font-mono text-slate-400 font-bold mr-1">[{i + 1}]</span>
                          <span>{citationFormat === 'kci' ? formatCitationKCI(r) : formatCitationAPA(r)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">등록된 독서 문헌 기록이 없습니다.</p>
                  )}
                </div>

                {/* 5. Student Reflection & Growth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <h4 className="font-bold text-emerald-950 flex items-center gap-1 mb-1 text-[11px]">
                      <span>🌱</span>
                      <span>[5-1] 탐구 과정에서 노력한 점</span>
                    </h4>
                    <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-line">
                      {project.effortNotes || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                    <h4 className="font-bold text-amber-950 flex items-center gap-1 mb-1 text-[11px]">
                      <span>🌟</span>
                      <span>[5-2] 탐구를 통해 성장하고 배운 점</span>
                    </h4>
                    <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-line">
                      {project.growthNotes || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                </div>

                {/* 6. Research Ethics & AI Utilization Pledge */}
                <div className="p-3.5 rounded-xl border-2 border-indigo-200 bg-indigo-50/30 space-y-2">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" />
                      <h4 className="text-xs font-bold text-indigo-950">[6] 연구 윤리 준수 및 생성형 AI 활용 서약서</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ 서약 인증 완료
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-snug">
                    본 연구자는 데이터 위변조 없는 진실성 준수, 타 저작물 및 공공데이터의 공식 출처 표기, 생성형 AI 제안에 대한 비판적 수용 수칙을 성실히 준수하였음을 엄숙히 서약합니다.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-800 font-medium">
                    <div>
                      학생 연구자: <strong>{project.author || '학생연구원'}</strong> <span className="border-b border-slate-400 px-2">(서명)</span>
                    </div>
                    <div>
                      지도교사 확인: <span className="border-b border-slate-400 px-3">확인</span> <span className="border-b border-slate-400 px-2">(인)</span>
                    </div>
                  </div>
                </div>

                {/* Footer Official Submission Note */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <span>인천광역시교육청 읽·걷·쓰 전공연계 사회문제탐구 플랫폼 공인 제출 양식</span>
                  <span>{project.isDemo ? '학습용 모범 예시 자료' : '학생 자율 과제물 · 학교 보관용'}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Detailed Academic Report (기존 줄글형 보고서) */
            <div
              ref={printRef}
              id="printable-report"
              className="bg-white w-full max-w-3xl p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 text-slate-900 font-sans space-y-8 h-auto min-h-fit self-start shrink-0 print:p-0 print:border-none print:shadow-none"
            >
            {/* Academic Header */}
            <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider">
                <span>인천 지역 기반 읽·걷·쓰 전공연계 사회문제탐구</span>
                <span>•</span>
                <span>4P Inquiry Report</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                {project.title || '4P 전공연계 사회문제탐구 보고서'}
              </h1>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 font-medium">
                {project.schoolName && (
                  <>
                    <span>
                      <strong>학교:</strong> {project.schoolName}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>
                  <strong>전공 연구실:</strong> {lab.name}
                </span>
                <span>•</span>
                <span>
                  <strong>연구자:</strong> {project.studentId ? `[${project.studentId}] ` : ''}{project.author || '학생연구원'} ({project.affiliation || '소속 미기재'})
                  {project.isGroupResearch ? ' (대표)' : ''}
                </span>
                {project.isGroupResearch && project.teamMembers && project.teamMembers.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-800">
                      <strong>공동 연구원:</strong>{' '}
                      {project.teamMembers.map((m) => `${m.name || '팀원'}${m.studentId ? `(${m.studentId})` : ''} [${m.role || '역할'}]`).join(', ')}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>
                  <strong>최종 갱신일:</strong> {project.updatedAt || project.createdAt}
                </span>
              </div>
            </div>

            {/* Core Research Question Callout */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                핵심 탐구 질문 (Research Question)
              </span>
              <p className="text-sm font-bold text-indigo-950 leading-relaxed">
                &ldquo;{project.mainQuestion || '핵심 질문이 입력되지 않았습니다.'}&rdquo;
              </p>
            </div>

            {/* Auto-distributed notice banner */}
            {distResult.isDistributed && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:hidden">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    P1에 집중되어 있던 4개 단계 내용이 <strong>P1(현상) · P2(원인) · P3(과업) · P4(실천)</strong> 각 열로 자동 분산되어 출력물에 반영되었습니다.
                  </span>
                </div>
                {onUpdateProject && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateProject({ fourP: distributedFourP });
                      setSavedDistributedNotice(true);
                      setTimeout(() => setSavedDistributedNotice(false), 3000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-all shadow-xs cursor-pointer"
                  >
                    {savedDistributedNotice ? '✓ 연구계획서에 저장됨!' : '이 분산 상태를 연구계획서에 저장'}
                  </button>
                )}
              </div>
            )}

            {/* 1. 4P 탐구 프레임워크 핵심 요약 매트릭스 (Executive Summary Matrix) */}
            {reportSectionStyle !== 'narrative-only' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>1. 4P 탐구 프레임워크 핵심 요약 매트릭스</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                      전체 탐구 구조 개요 (Executive Matrix)
                    </span>
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">
                    현상 ➔ 원인 ➔ 과업 ➔ 실천의 단계별 핵심 논리 요약
                  </span>
                </div>

                <div className="border border-slate-300 rounded-xl overflow-hidden text-xs shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                        <th className="p-3 w-1/4 border-r border-slate-300">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-indigo-950 font-black">P1. 현상 (Phenomenon)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">Fact·데이터</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal block">포착된 사회적 사실 및 관측치</span>
                        </th>
                        <th className="p-3 w-1/4 border-r border-slate-300">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-blue-950 font-black">P2. 문제 (Problem)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">구조적 원인</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal block">심층 원인 및 구조적 모순</span>
                        </th>
                        <th className="p-3 w-1/4 border-r border-slate-300">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-purple-950 font-black">P3. 과업 (Project)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">연구방법론</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal block">전공 이론 기반 탐구 계획</span>
                        </th>
                        <th className="p-3 w-1/4">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-emerald-950 font-black">P4. 실천 (Practice)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">사회적 변화</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal block">지역사회 적용 및 정책 대안</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="divide-x divide-slate-300 align-top text-slate-700 leading-relaxed bg-white">
                        <td className="p-3 text-[11px] leading-relaxed">
                          <p className="whitespace-pre-line text-slate-800">{distributedFourP.phenomenon || '-'}</p>
                        </td>
                        <td className="p-3 text-[11px] leading-relaxed">
                          <p className="whitespace-pre-line text-slate-800">{distributedFourP.problem || '-'}</p>
                        </td>
                        <td className="p-3 text-[11px] leading-relaxed">
                          <p className="whitespace-pre-line text-slate-800">{distributedFourP.project || '-'}</p>
                        </td>
                        <td className="p-3 text-[11px] leading-relaxed">
                          <p className="whitespace-pre-line text-slate-800">{distributedFourP.practice || '-'}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4P Logic Flow Chain */}
                <div className="flex flex-wrap items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
                  <span className="text-indigo-800 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>P1 사실·데이터 포착</span>
                  </span>
                  <span className="text-slate-400 font-bold">&rarr;</span>
                  <span className="text-blue-800 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>P2 심층 모순·원인 규명</span>
                  </span>
                  <span className="text-slate-400 font-bold">&rarr;</span>
                  <span className="text-purple-800 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span>P3 {lab.name} 연구방법 설계</span>
                  </span>
                  <span className="text-slate-400 font-bold">&rarr;</span>
                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>P4 지속가능한 사회적 실천</span>
                  </span>
                </div>
              </div>
            )}

            {/* 1.5. 4P 학술 탐구 시각화 분석 차트 (Visual Academic Analytics) */}
            {includeCharts && (
              <div className="space-y-4 pt-1 break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>1.5. 4P 학술 탐구 시각화 분석 차트</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      정량 데이터 시각화 (Visual Analytics)
                    </span>
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">
                    5각 거미줄 역량 · 인천 10개 군구 지표 · 읽·걷·쓰 밸런스
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30">
                  <AcademicChartsView
                    project={{ ...project, fourP: distributedFourP }}
                    compact={true}
                  />
                </div>
              </div>
            )}

            {/* 2. 단계별 세부 탐구 및 학술 분석 (In-Depth Academic Narrative) */}
            {reportSectionStyle !== 'matrix-only' && (
              <div className="space-y-5 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>2. 단계별 세부 탐구 및 학술 분석</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      심층 서술 본문 (Detailed Academic Body)
                    </span>
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    인천 현장 관찰, 전공 연구방법론 및 실천 상세 기술
                  </span>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  {/* P1 Section */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-indigo-800">
                        <span className="w-2.5 h-2.5 rounded-md bg-indigo-600"></span>
                        <span>[P1] 현상 포착 (Phenomenon) — 사실적 관찰 및 정량 데이터</span>
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 border border-indigo-200 px-2 py-0.5 rounded-md">
                        Fact & Observation
                      </span>
                    </div>
                    <div className="text-slate-800 whitespace-pre-line leading-relaxed text-[11px] pl-2 border-l-2 border-indigo-400">
                      {distributedFourP.phenomenon || '내용 없음'}
                    </div>
                    {project.walkingLogs?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center gap-2 text-[10px] text-slate-500">
                        <Footprints className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>연계 현장 걷기 답사:</strong> {project.walkingLogs[0].courseName} ({project.walkingLogs[0].steps.toLocaleString()}보) — &ldquo;{project.walkingLogs[0].thoughtNote}&rdquo;</span>
                      </div>
                    )}
                  </div>

                  {/* P2 Section */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-blue-800">
                        <span className="w-2.5 h-2.5 rounded-md bg-blue-600"></span>
                        <span>[P2] 문제 정의 및 원인 분석 (Problem) — 구조적 모순과 인과 메커니즘</span>
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/60 border border-blue-200 px-2 py-0.5 rounded-md">
                        Causality & Structure
                      </span>
                    </div>
                    <div className="text-slate-800 whitespace-pre-line leading-relaxed text-[11px] pl-2 border-l-2 border-blue-400">
                      {distributedFourP.problem || '내용 없음'}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      💡 <strong>심층 진단:</strong> 단순 개인의 불편을 넘어 제도적·문화적·환경적 구조의 취약성과 해결의 사회적 당위성을 분석함.
                    </div>
                  </div>

                  {/* P3 Section */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-purple-800">
                        <span className="w-2.5 h-2.5 rounded-md bg-purple-600"></span>
                        <span>[P3] 전공 연계 연구 과업 (Project / Task) — {lab.name} 학술 이론 및 방법론</span>
                      </h3>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100/60 border border-purple-200 px-2 py-0.5 rounded-md">
                        Academic Methodology
                      </span>
                    </div>
                    <div className="text-slate-800 whitespace-pre-line leading-relaxed text-[11px] pl-2 border-l-2 border-purple-400">
                      {distributedFourP.project || '내용 없음'}
                    </div>
                    {project.readingLogs?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center gap-2 text-[10px] text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>이론적 배경 및 탐독 도서:</strong> 《{project.readingLogs[0].title}》 ({project.readingLogs[0].author}) — &ldquo;{project.readingLogs[0].readingNotes}&rdquo;</span>
                      </div>
                    )}
                  </div>

                  {/* P4 Section */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-emerald-800">
                        <span className="w-2.5 h-2.5 rounded-md bg-emerald-600"></span>
                        <span>[P4] 사회적 실천 및 지속가능한 변화 (Practice) — 학교·지역사회 적용 및 정책 제언</span>
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Action & Impact
                      </span>
                    </div>
                    <div className="text-slate-800 whitespace-pre-line leading-relaxed text-[11px] pl-2 border-l-2 border-emerald-400">
                      {distributedFourP.practice || '내용 없음'}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      💡 <strong>실천 및 파급 효과:</strong> 연구 결과를 지역사회(인천) 학교 캠페인, 지자체 조례 청원, 공공 포털 데이터 기증 등 지속가능한 변화로 연결함.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Walking Records */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5 border-b pb-2">
                <Footprints className="w-4 h-4 text-emerald-600" />
                3. 현장 사색(걷기·Walk) 일지 및 관찰 데이터
              </h2>
              {project.walkingLogs?.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {project.walkingLogs.map((w, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          {w.activityType && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                              {w.activityType}
                            </span>
                          )}
                          <span>{w.date} · {w.courseName}</span>
                        </div>
                        <span>
                          {w.steps.toLocaleString()}보 ({w.durationMinutes}분) | 몰입도: {w.focusScore}/5점
                        </span>
                      </div>
                      <p className="italic text-slate-700 leading-relaxed">&ldquo;{w.thoughtNote}&rdquo;</p>
                      {w.findings && (
                        <p className="text-[11px] text-indigo-900 bg-indigo-50/50 p-2 rounded mt-1.5 border border-indigo-100/60">
                          <strong className="text-indigo-700">현장 실측 / 육성 인용:</strong> {w.findings}
                        </p>
                      )}
                      {w.photos && w.photos.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-500 mb-1 block">
                            📷 첨부된 현장 답사 인증 사진 ({w.photos.length}장):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {w.photos.map((ph, pIdx) => (
                              <div key={ph.id || pIdx} className="rounded-lg overflow-hidden border border-slate-300 bg-white">
                                <img src={ph.url} alt={ph.caption || '답사 사진'} className="w-28 h-20 object-cover" />
                                {ph.caption && (
                                  <div className="p-1 text-[9px] text-slate-700 truncate max-w-[7rem] bg-slate-50 font-medium">
                                    {ph.caption}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">기록된 걷기 사색 일지가 없습니다.</p>
              )}
            </div>

            {/* Reading References (Multi-modal) */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5 border-b pb-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                4. 다각도 읽기(Read - 도서·논문·기사·영상) 탐독 일지
              </h2>
              {project.readingLogs?.length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {project.readingLogs.map((r, idx) => {
                    const badgeConfig =
                      r.mediaType === 'paper'
                        ? { label: '학술논문/보고서', bg: 'bg-blue-100 text-blue-800 border-blue-200' }
                        : r.mediaType === 'news'
                        ? { label: '신문기사/사설', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
                        : r.mediaType === 'video'
                        ? { label: '유튜브/영상다큐', bg: 'bg-rose-100 text-rose-800 border-rose-200' }
                        : { label: '단행본 도서', bg: 'bg-amber-100 text-amber-800 border-amber-200' };

                    return (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeConfig.bg}`}>
                              {badgeConfig.label}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              《{r.title}》
                            </span>
                            {r.linked4PStep && (
                              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                {r.linked4PStep.toUpperCase()} 연계
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {r.author}{r.sourceOrg ? ` (${r.sourceOrg})` : ''}{r.timestampOrPage ? ` · ${r.timestampOrPage}` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed italic bg-white p-2 rounded border border-slate-200/80">
                          &ldquo;{r.readingNotes}&rdquo;
                        </p>
                        {r.url && (
                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                            <span>출처 URL:</span>
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 underline truncate max-w-sm"
                            >
                              {r.url}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">등록된 독서 탐구 기록이 없습니다.</p>
              )}
            </div>

            {/* Student Reflection & Growth Section */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5 border-b pb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                5. 학생 탐구 성찰 및 나의 성장 (Reflection & Growth)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Effort Notes */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                      <span>🌱</span>
                      <span>탐구과정에서 노력한 점</span>
                    </h3>
                    <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      {project.effortNotes || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                </div>

                {/* Growth Notes */}
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                      <span>🌟</span>
                      <span>탐구를 통해 성장한 점</span>
                    </h3>
                    <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      {project.growthNotes || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attachment File Box if present */}
              {(project.attachmentName || project.attachmentUrl) && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">과제 첨부파일: </span>
                      <span className="text-slate-700">{project.attachmentName || '첨부 문서'}</span>
                    </div>
                  </div>
                  {project.attachmentUrl && (
                    <a
                      href={project.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 underline font-semibold flex items-center gap-1 shrink-0"
                    >
                      <span>드라이브 링크 열기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Section 6: Standard Academic References */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>6. 표준 참고문헌 목록 (References)</span>
                </h2>
                <div className="flex items-center gap-1.5 print:hidden">
                  <span className="text-[11px] text-slate-500 font-medium">서식:</span>
                  <div className="flex rounded-md p-0.5 bg-slate-100 border border-slate-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCitationFormat('kci')}
                      className={`px-2 py-0.5 rounded transition-all ${
                        citationFormat === 'kci'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      KCI (한국학술지)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCitationFormat('apa')}
                      className={`px-2 py-0.5 rounded transition-all ${
                        citationFormat === 'apa'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      APA 7th (국제표준)
                    </button>
                  </div>
                </div>
              </div>

              {project.readingLogs && project.readingLogs.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs font-serif leading-relaxed text-slate-800">
                  {project.readingLogs.map((r, i) => (
                    <div key={r.id || i} className="pl-6 -indent-6">
                      <span className="font-mono text-slate-400 font-bold mr-1.5">[{i + 1}]</span>
                      <span>
                        {citationFormat === 'kci' ? formatCitationKCI(r) : formatCitationAPA(r)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">등록된 참고문헌 자료가 없습니다.</p>
              )}
            </div>

            {/* Section 7: Research Ethics & AI Utilization Pledge */}
            <div className="p-4.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  <h2 className="text-sm font-bold text-indigo-950">
                    7. 연구 윤리 준수 및 생성형 AI 활용 서약서
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ 서약 인증 완료
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {RESEARCH_ETHICS_ITEMS.map((item, idx) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900 mb-1">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pledge Acceptance Check & Signatures */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer print:text-slate-900">
                  <input
                    type="checkbox"
                    checked={ethicsPledged}
                    onChange={(e) => {
                      setEthicsPledged(e.target.checked);
                      if (onUpdateProject) {
                        onUpdateProject({ ethicsPledgeAccepted: e.target.checked });
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-800">
                    본 연구자는 위의 연구 윤리 및 생성형 AI 윤리적 활용 수칙을 엄격히 준수하였음을 서약합니다.
                  </span>
                </label>

                {/* Sign-off Boxes */}
                <div className="flex items-center gap-4 text-[11px] text-slate-700 font-medium">
                  <div>
                    연구자: <strong>{project.author || '학생연구원'}</strong> <span className="border-b border-slate-400 px-2">(서명/인)</span>
                  </div>
                  <div>
                    지도교사: <span className="border-b border-slate-400 px-3">확인</span> <span className="border-b border-slate-400 px-2">(인)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Mentoring Result Stamp */}
            {project.evaluationResult && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 flex items-center gap-1">
                    <Award className="w-4 h-4 text-indigo-600" />
                    AI 학술 멘토 진단 종합 총평
                  </span>
                  <span className="font-black text-indigo-700">
                    종합 평점: {project.evaluationResult.totalScore}점 / 100점
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{project.evaluationResult.overallReview}</p>
                <div className="pt-2 border-t border-indigo-200/60 flex items-center gap-2 text-[11px] text-slate-600">
                  <strong>추천 심화 질문:</strong>
                  <span>{project.evaluationResult.questionUpgrades[2]?.question}</span>
                </div>
              </div>
            )}

            {/* Footer Sign-off */}
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>인천 지역 기반 읽·걷·쓰 전공연계 사회문제탐구 플랫폼</span>
              <span>{project.isDemo ? '학습용 가상 예시 · 실제 조사 결과가 아님' : '학생 작성 자료 · 학교 확인란 별도'}</span>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Student Record (NEIS) Helper Modal */}
      {showNeisHelperModal && (
        <StudentRecordHelperModal
          isOpen={showNeisHelperModal}
          onClose={() => setShowNeisHelperModal(false)}
          project={project}
          onUpdateProject={(updated) => {
            if (onUpdateProject) onUpdateProject(updated);
          }}
        />
      )}
    </div>
  );
};
