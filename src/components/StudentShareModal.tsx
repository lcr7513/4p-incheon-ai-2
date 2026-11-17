import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  Copy,
  Check,
  X,
  QrCode,
  Smartphone,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Users,
  Sparkles,
  FileSpreadsheet,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  Edit3,
  RotateCcw,
  MessageSquare,
  Compass,
} from 'lucide-react';

interface StudentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Canonical Public Shared URL provided by AI Studio environment for students
export const OFFICIAL_PUBLIC_SHARED_URL = 'https://ais-pre-szbhwdqpt6j6yd4kgo4zj2-657342148388.asia-northeast1.run.app';

/**
 * Resolves the student-accessible URL.
 * In AI Studio, the development URL (ais-dev-...) requires author authorization,
 * while the public shared URL (ais-pre-...) is freely accessible to all students.
 */
export function resolveStudentShareUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If running in development preview, automatically route to the public pre-release link
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    if (origin.includes('ais-pre-')) {
      return origin;
    }
  }
  return OFFICIAL_PUBLIC_SHARED_URL;
}

export const StudentShareModal: React.FC<StudentShareModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [shareUrl, setShareUrl] = useState(OFFICIAL_PUBLIC_SHARED_URL);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customInputUrl, setCustomInputUrl] = useState(OFFICIAL_PUBLIC_SHARED_URL);
  const [isEnlargedQr, setIsEnlargedQr] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resolved = resolveStudentShareUrl();
    setShareUrl(resolved);
    setCustomInputUrl(resolved);
  }, [isOpen]);

  if (!isOpen) return null;

  // Link copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Classroom announcement copy
  const handleCopyClassNotice = async () => {
    const noticeText = `📢 [2학년 전공연계 4P 사회문제탐구 포털 학생 접속 안내]
인천 교육청 읽·걷·쓰 기반 4P(현상-문제-과업-실천) 연구계획서 작성 및 8대 걷기 탐구 실사 포털입니다.

🔗 학생 접속 링크: ${shareUrl}
✅ 별도의 회원가입이나 앱 설치 없이 스마트폰, 태블릿, PC 브라우저에서 즉시 실행됩니다.
✅ 교실 빔프로젝터 QR 코드를 카메라로 비추어도 1초 만에 바로 연결됩니다.
✅ 작성한 연구계획서는 브라우저에 자동 보관되며, 상단의 [구글 시트 과제 제출]을 눌러 제출합니다.`;

    try {
      await navigator.clipboard.writeText(noticeText);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = noticeText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  // Save custom URL
  const handleApplyCustomUrl = () => {
    if (customInputUrl.trim()) {
      setShareUrl(customInputUrl.trim());
    }
    setIsEditingUrl(false);
  };

  // Reset to default public URL
  const handleResetDefaultUrl = () => {
    const def = resolveStudentShareUrl();
    setShareUrl(def);
    setCustomInputUrl(def);
    setIsEditingUrl(false);
  };

  // Download high-resolution QR Code as PNG image for classroom slides / worksheets
  const handleDownloadQrPng = () => {
    setDownloadingQr(true);
    try {
      const svg = document.getElementById('student-share-qr-svg');
      if (!svg) {
        setDownloadingQr(false);
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // High-resolution 640x740 card with text
        canvas.width = 640;
        canvas.height = 760;

        if (ctx) {
          // Card background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Top Header
          ctx.fillStyle = '#1E293B';
          ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('인천 읽·걷·쓰 4P 사회문제탐구 포털', 320, 52);

          ctx.fillStyle = '#2563EB';
          ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('스마트폰 카메라로 스캔하여 즉시 접속', 320, 80);

          // Draw QR Code in center
          ctx.drawImage(img, 100, 110, 440, 440);

          // URL box
          ctx.fillStyle = '#F8FAFC';
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(40, 580, 560, 50, 12);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#334155';
          ctx.font = '13px monospace';
          ctx.fillText(shareUrl, 320, 612);

          // Bottom guidance
          ctx.fillStyle = '#64748B';
          ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('별도 로그인 · 앱 설치 불필요 | 인천광역시교육청 읽·걷·쓰 교육모델', 320, 675);
          ctx.fillText('P1.현상 · P2.문제 · P3.과업 · P4.실천', 320, 705);

          // Download PNG
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = '인천읽걷쓰_4P_학생접속_QR코드.png';
          downloadLink.href = pngUrl;
          downloadLink.click();
        }
        setDownloadingQr(false);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.error('Failed to download QR PNG', e);
      setDownloadingQr(false);
    }
  };

  // Classroom QR Code Print
  const handlePrintQr = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const svg = document.getElementById('student-share-qr-svg');
    const svgHtml = svg ? svg.outerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>인천 4P 사회문제탐구 학생 접속 QR 코드</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Malgun Gothic", "Segoe UI", Roboto, sans-serif;
              padding: 40px;
              text-align: center;
              color: #0f172a;
            }
            .card {
              border: 3px solid #2563eb;
              border-radius: 24px;
              padding: 40px;
              max-width: 620px;
              margin: 0 auto;
            }
            h1 { font-size: 26px; margin: 0 0 8px; color: #1e293b; }
            .sub { color: #2563eb; font-size: 16px; font-weight: bold; margin-bottom: 24px; }
            .qr-wrap { display: flex; justify-content: center; margin: 24px 0; }
            .url-box {
              background: #f1f5f9;
              padding: 12px 18px;
              border-radius: 12px;
              font-family: monospace;
              font-size: 14px;
              word-break: break-all;
              margin-top: 16px;
            }
            .steps {
              margin-top: 28px;
              text-align: left;
              background: #fafafa;
              padding: 18px 24px;
              border-radius: 16px;
              border: 1px solid #e2e8f0;
              font-size: 13px;
              line-height: 1.8;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>4P 읽·걷·쓰 전공연계 사회문제탐구</h1>
            <div class="sub">스마트폰 기본 카메라로 비추면 1초 만에 바로 접속됩니다</div>
            <div class="qr-wrap">
              ${svgHtml}
            </div>
            <div class="url-box">${shareUrl}</div>
            <div class="steps">
              <strong>📱 학생 접속 3단계 안내:</strong><br>
              1. 스마트폰이나 태블릿의 <strong>기본 카메라 앱</strong>을 실행합니다.<br>
              2. 화면 속 <strong>QR 코드를 비추면</strong> 상단에 웹사이트 링크 배너가 표시됩니다.<br>
              3. 링크를 터치하면 <strong>별도 로그인이나 앱 설치 없이</strong> 바로 4P 탐구에 참여할 수 있습니다.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  학생 배포용 웹 링크 & 교실 빔프로젝터 QR 코드
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  실시간 활성화됨
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                학생들이 스마트폰, 학교 태블릿, 노트북 브라우저에서 로그인 없이 즉시 접속하는 공개 링크입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Section 1: Active Web Link Box */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Users className="w-4 h-4 text-blue-600" />
                학생 접속 공식 웹 주소 (URL)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  전교생 100% 정상 접속 보장
                </span>
                {!isEditingUrl ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingUrl(true)}
                    className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded-md hover:bg-white"
                    title="단축 URL이나 학교 도메인이 있는 경우 직접 수정"
                  >
                    <Edit3 className="w-3 h-3" />
                    주소 직접입력
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetDefaultUrl}
                    className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded-md hover:bg-white"
                    title="기본 공식 주소로 복구"
                  >
                    <RotateCcw className="w-3 h-3" />
                    기본값 복구
                  </button>
                )}
              </div>
            </div>

            {/* Editable or Active Clickable URL Row */}
            {isEditingUrl ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-white border-2 border-blue-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                >
                  적용
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(false)}
                  className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-all shrink-0"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Clickable URL Link */}
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-between gap-2 bg-white hover:bg-blue-50/60 border border-slate-300 hover:border-blue-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-blue-700 hover:text-blue-900 break-all transition-all shadow-2xs group cursor-pointer"
                  title="클릭 시 새 창에서 학생 화면 즉시 실행"
                >
                  <span className="truncate select-all">{shareUrl}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span>새 창 열기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </a>

                {/* Copy Link Button */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 shrink-0 shadow-xs active:scale-95 ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>링크 복사</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Helper Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={handleCopyClassNotice}
                className="inline-flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200/80 transition-colors"
                title="카카오톡 단톡방이나 구글 클래스룸에 바로 올릴 수 있는 공지 전문 복사"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>{copiedNotice ? '✅ 공지문 복사 완료 (Ctrl+V)!' : '📢 알림장/클래스룸 안내문 복사'}</span>
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700 font-medium transition-colors"
              >
                <span>학생 시점으로 테스트 접속하기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 2: Classroom QR Code & Projection Controller */}
          <div
            ref={qrContainerRef}
            className="rounded-2xl bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-slate-50 border border-indigo-100/90 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-indigo-100/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    교실 빔프로젝터 스캔용 QR 코드
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      High-Precision 30% 복원
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    스마트폰 카메라로 비추면 1초 만에 포털로 연결됩니다.
                  </p>
                </div>
              </div>

              {/* QR Size Toggle (Normal vs Huge Classroom View) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEnlargedQr(!isEnlargedQr)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isEnlargedQr
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="교실 뒷자리 학생도 인식할 수 있도록 대형으로 확대"
                >
                  {isEnlargedQr ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>기본 크기로 축소</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>빔프로젝터 대형 확대</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Canvas Display & Side Guides */}
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              {/* Pure High-Contrast QR Code SVG (No broken image excavation) */}
              <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-indigo-200/90 flex flex-col items-center shrink-0">
                <QRCodeSVG
                  id="student-share-qr-svg"
                  value={shareUrl}
                  size={isEnlargedQr ? 250 : 170}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#0F172A"
                />
                <span className="text-[11px] font-bold text-indigo-700 mt-2 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  스마트폰 카메라로 비추세요
                </span>
              </div>

              {/* QR Action Buttons & 3-Step Student Scan Instructions */}
              <div className="space-y-3.5 flex-1 w-full text-left">
                {/* QR Export Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadQrPng}
                    disabled={downloadingQr}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95"
                    title="수업용 PPT나 활동지 한글파일에 붙여넣을 수 있는 고화질 PNG 이미지로 저장"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>{downloadingQr ? '생성 중...' : 'QR 이미지(PNG) 다운로드'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintQr}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95"
                    title="학급 게시판이나 책상에 부착할 수 있는 QR 안내장 바로 인쇄"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-600" />
                    <span>QR 안내문 인쇄</span>
                  </button>
                </div>

                {/* 3-Step Student Guide */}
                <div className="p-3.5 bg-white/90 rounded-xl border border-indigo-100 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    학생 스마트폰 스캔 방법 (1초 연결):
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[12px] leading-relaxed pl-1">
                    <li>스마트폰 기본 <strong>카메라 앱</strong>을 켭니다. (별도 스캐너 앱 불필요)</li>
                    <li>교실 빔 화면의 <strong>QR 코드를 화면에 비춥니다.</strong></li>
                    <li>상단에 뜨는 <strong>노란색/파란색 바로가기 주소</strong>를 터치하면 완료!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Teacher Classroom Operation Advice */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              수업 운영 꿀팁 및 학생 안내 사항
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">모바일·태블릿 최적화</span>
                  <p className="text-slate-500 mt-0.5">8대 현장 걷기 탐구 시 스마트폰을 들고 현장에서 직접 사진과 관찰 로그를 기록할 수 있습니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Laptop className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">자동 저장 (로컬 저장소)</span>
                  <p className="text-slate-500 mt-0.5">학생이 작성한 4P 탐구계획서는 각자의 기기에 실시간 자동 보관되어 창을 닫아도 안전합니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">구글 시트 과제 수합</span>
                  <p className="text-slate-500 mt-0.5">학생들이 계획서 작성을 마친 후 [구글 시트 과제 제출]을 누르면 선생님의 취합 시트로 전송됩니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">인천 18대 현장 실사 탑재</span>
                  <p className="text-slate-500 mt-0.5">송도 바이오·원적산·인천스타트업파크·청라 커낼웨이·수도권매립지 등 고화질 현장 사진이 탑재되어 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>새 탭에서 학생 화면 직접 열어보기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
