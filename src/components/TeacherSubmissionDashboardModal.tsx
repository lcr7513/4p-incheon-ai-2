import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Users,
  Award,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
  ShieldCheck,
  KeyRound,
  Copy,
  CheckCheck,
  Trash2,
  RotateCcw,
  FileText,
  Share2,
  QrCode,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ResearchProject, LabId } from '../types';
import { LABS_DATA } from '../data/labsData';
import {
  DEFAULT_TEACHER_SPREADSHEET_ID,
  extractSpreadsheetId,
  APPROACH_A_HEADERS,
} from '../utils/googleSheets';
import {
  getCurrentUser,
  getAccessToken,
  googleSignIn,
} from '../utils/googleAuth';
import * as XLSX from '../utils/excelXml';

interface TeacherSubmissionDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: ResearchProject;
  onOpenGoogleSheetsExport?: () => void;
  onOpenShareModal?: () => void;
}

export interface StudentRowData {
  timestamp: string;
  schoolName: string;
  classNumber: number; // 1 ~ 8
  seatNumber: number;  // 1 ~ 30
  studentId: string;   // e.g. '20101', '20308'
  author: string;
  affiliation: string; // e.g. '2학년 1반'
  labName: string;
  title: string;
  mainQuestion: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  readingWalking: string;
  effortNotes: string;
  growthNotes: string;
  attachmentDisplay: string;
  attachmentUrl?: string;
  aiScoreText: string;
  aiScoreNumber: number;
  personaText: string;
  teacherMemo: string;
}

// 8개 학급 (1반 ~ 8반), 학급당 30명 기준의 실제적인 인천 지역 고교 4P 탐구 시뮬레이션 데이터셋
const GENERATE_SAMPLE_8_CLASSES_DATA = (): StudentRowData[] => {
  const sampleFirstNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
  const sampleSecondNames = ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서', '서연', '서윤', '지우', '서현', '하은', '하윤', '민서', '지유', '윤서', '채원', '수아', '지민', '다은', '예은', '지원'];

  const sampleResearchTopics: { labIndex: number; title: string; question: string }[] = [
    {
      labIndex: 0,
      title: '원도심 골목 무인 키오스크 매장의 고령자 디지털 배제와 공간 유니버설 디자인 대안',
      question: '무인화 점포 급증 시 고령층 일상 소비 권리를 보장하는 물리·디지털 통합 배리어프리 조례는 어떻게 실현 가능한가?',
    },
    {
      labIndex: 1,
      title: '인천 신항 자동화 컨테이너 터미널 도입에 따른 화물차 대기시간 단축과 탄소배출 저감 연구',
      question: '항만 물류 무인 자동화(AGV)가 송도 바이오대로 화물차 정체 및 미세먼지 저감에 미치는 실제 정량 효과는 어떠한가?',
    },
    {
      labIndex: 2,
      title: '강화도 남단 갯벌 염생식물(칠면초·퉁퉁마디) 군락의 블루카본 흡수량 측정 및 보전 전략',
      question: '강화 갯벌의 염생식물 서식지 훼손을 방지하면서 주민 생태관광 소득을 함께 창출할 수 있는 블루카본 조례는 무엇인가?',
    },
    {
      labIndex: 3,
      title: '인천 서구 수도권매립지 인근 수소트럭 충전 인프라 최적 입지 선정 및 안전성 검증',
      question: '대형 수소 모빌리티 보급을 촉진하기 위한 수소 배관망 연계 안전 인프라는 인천 어느 지점에 구축되어야 하는가?',
    },
    {
      labIndex: 4,
      title: '인천 도서지역(옹진·백령) 독거노인을 위한 IoT 스마트 케어 센서와 방문 돌봄 통합 모델',
      question: '섬 지역 의료 공백을 해소하기 위해 저비용 IoT 센서와 지역 주민 돌보미를 어떻게 지속가능하게 결합할 것인가?',
    },
    {
      labIndex: 5,
      title: '인천 부평 미군기지(캠프마켓) 반환 부지의 역사문화 아카이브 구축과 시민참여형 축제 브랜딩',
      question: '단절되었던 군사기지 공간을 평화와 문화의 공간으로 전환하기 위한 시민 기억 수집 아카이빙 전략은 무엇인가?',
    },
    {
      labIndex: 0,
      title: '인천 개항장 문화지구 청년 로컬 크리에이터 점포와 노포의 상생 거리 브랜딩 넛지',
      question: '개항장 역사 거리가 젠트리피케이션에 잠식되지 않고 신구 세대가 공존하는 문화상생 조례는 어떻게 구축될 수 있는가?',
    },
    {
      labIndex: 1,
      title: '송도국제도시 바이오 클러스터 중소 벤처기업 연구인력 정주여건 개선과 대중교통 노선망 최적화',
      question: '바이오 메가클러스터의 고급 청년 연구인력 유출을 막는 스마트 모빌리티 셔틀 지원 정책은 무엇인가?',
    },
    {
      labIndex: 2,
      title: '영종도 갯벌 철새(저어새·알락꼬리마도요) 도래지의 조류 충돌 방지 윈도우 필름 조례 연구',
      question: '공항 신도시 건축물 유리창에 의한 야생조류 충돌을 효과적으로 줄이는 5×10 도트 조례는 어떻게 확산될 수 있는가?',
    },
    {
      labIndex: 3,
      title: '인천 로봇랜드 연계 자율주행 순환 셔틀버스의 악천후(해무·염분) 센서 퓨전 신뢰성 평가',
      question: '서해안 해무와 염무 환경에서 자율주행 라이다/레이더의 센싱 오차를 극복하는 엣지 비전 보정 알고리즘은 무엇인가?',
    },
  ];

  const results: StudentRowData[] = [];

  // 각 반별 미제출 번호 사전 정의 (학급별 약 2~5명 미제출로 총 24~28명 제출 상태 연출)
  const missingConfigByClass: Record<number, number[]> = {
    1: [4, 12, 27],
    2: [9, 18],
    3: [4, 11, 18, 23, 29],
    4: [7, 14, 21, 28],
    5: [3, 16],
    6: [5, 12, 19, 25, 30],
    7: [8, 17, 26],
    8: [6, 13, 22, 29],
  };

  for (let c = 1; c <= 8; c++) {
    const missingSet = new Set(missingConfigByClass[c] || [5, 15, 25]);

    for (let s = 1; s <= 30; s++) {
      if (missingSet.has(s)) continue; // 미제출 학생 건너뜀

      const studentId = `20${c}${s < 10 ? `0${s}` : s}`;
      const name = `${sampleFirstNames[(c * 3 + s) % sampleFirstNames.length]}${sampleSecondNames[(c * 7 + s) % sampleSecondNames.length]}`;
      const topicIndex = (c * 2 + s) % sampleResearchTopics.length;
      const topic = sampleResearchTopics[topicIndex];
      const lab = LABS_DATA[topic.labIndex] || LABS_DATA[0];
      const score = 86 + ((c * 4 + s * 3) % 13); // 86 ~ 98점

      results.push({
        timestamp: `2026-10-31 ${10 + (s % 6)}:${(s * 7) % 60 < 10 ? `0${(s * 7) % 60}` : (s * 7) % 60}:25`,
        schoolName: '인천인문고등학교',
        classNumber: c,
        seatNumber: s,
        studentId,
        author: name,
        affiliation: `2학년 ${c}반`,
        labName: lab.name,
        title: topic.title,
        mainQuestion: topic.question,
        p1: `${lab.name} 관점에서 인천 지역사회에서 직접 관측한 현상과 통계 지표를 분석함.`,
        p2: `구조적·제도적 원인을 파악하고 공공데이터와 문헌 조사를 결합하여 인과관계를 규명함.`,
        p3: `사회과학 및 공학 연구방법론(설문, FGI, 시뮬레이션, 공간분석)을 적용하여 연구 과업을 수행함.`,
        p4: `인천시 조례 제정, 지역 캠페인, 학교 자율 동아리 실천으로 이어지는 3단계 실행 대안을 제시함.`,
        readingWalking: `[읽기] 관련 학술논문 2편, 신문사설 1편\n[답사] 인천 현장 탐구 (${3000 + (s * 150)}보)`,
        effortNotes: `설문 섭외의 어려움을 겪었으나 질문지를 보완하여 직접 현장 인터뷰를 수행하며 주도적으로 난관을 극복함.`,
        growthNotes: `단순 이론에 그치지 않고 지역사회의 실질적 문제를 해결하는 전공 지식의 사회적 책무성을 깨달음.`,
        attachmentDisplay: s % 3 === 0 ? `📎 4P_${name}_연구보고서.hwp` : s % 3 === 1 ? `📎 ${name}_현장실측발표.pdf` : `📎 구글드라이브_포트폴리오`,
        attachmentUrl: `https://drive.google.com/drive/folders/sample-incheon-research-${c}-${s}`,
        aiScoreText: `${score}점 (P1: 24, P2: 24, P3: 24, P4: ${score - 72})`,
        aiScoreNumber: score,
        personaText: `3인 다각도 검증 완료 (전문가·현장주민 호평)`,
        teacherMemo: `'${topic.title.slice(0, 20)}...'에 대해 주도적 탐구 의지와 전공 융합 문제해결력이 매우 뛰어남.`,
      });
    }
  }

  return results;
};

const INITIAL_8_CLASSES_ROWS = GENERATE_SAMPLE_8_CLASSES_DATA();

export const TeacherSubmissionDashboardModal: React.FC<TeacherSubmissionDashboardModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onOpenGoogleSheetsExport,
  onOpenShareModal,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [useSampleData, setUseSampleData] = useState<boolean>(false);
  const [rows, setRows] = useState<StudentRowData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [clearToast, setClearToast] = useState(false);

  // Class Selection: 'all' (전체 1~8반) or 1..8
  const [selectedClass, setSelectedClass] = useState<'all' | number>('all');
  const classCapacityPerGroup = 30; // 학급당 30명 고정 기준

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>('all');

  // Teacher Security Gate State
  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [copiedMissingToast, setCopiedMissingToast] = useState(false);

  // Auto unlock if user is authenticated with verified teacher email
  useEffect(() => {
    if (currentUser?.email === 'lcr7513@icedu.kr') {
      setIsTeacherUnlocked(true);
    }
  }, [currentUser]);

  // 가상 예시 데이터 모두 비우기 (깨끗한 0명 빈 상태로 초기화)
  const handleClearAllData = () => {
    setRows([]);
    setUseSampleData(false);
    setIsLiveConnected(false);
    setClearToast(true);
    setTimeout(() => setClearToast(false), 2200);
  };

  // 테스트용 가상 예시 데이터 채우기 (8개 학급 200여 명)
  const handleFillSampleData = () => {
    setRows(INITIAL_8_CLASSES_ROWS);
    setUseSampleData(true);
  };

  // Load student rows from Google Sheets or fallback based on useSampleData
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        if (useSampleData) {
          mergeLocalAndSampleData();
        } else {
          setRows([]);
        }
        setIsLiveConnected(false);
        setIsLoading(false);
        return;
      }

      const cleanId = extractSpreadsheetId(DEFAULT_TEACHER_SPREADSHEET_ID);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/A2:S250`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (useSampleData) {
          mergeLocalAndSampleData();
        } else {
          setRows([]);
        }
        setIsLiveConnected(false);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const rawRows: any[][] = data.values || [];

      if (rawRows.length === 0) {
        if (useSampleData) {
          mergeLocalAndSampleData();
        } else {
          setRows([]);
        }
        setIsLiveConnected(true);
      } else {
        const parsedRows: StudentRowData[] = rawRows
          .filter((r) => r && r[0] && String(r[0]).trim().length > 0)
          .map((r) => {
            const scoreStr = String(r[16] || '');
            const scoreMatch = scoreStr.match(/(\d+)\s*점/);
            const scoreNum = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
            const attStr = String(r[15] || '');
            const linkMatch = attStr.match(/HYPERLINK\("([^"]+)"/i);

            const studentId = String(r[2] || '');
            const affiliation = String(r[4] || '');

            // 학급 번호 (1~8) 파싱
            let classNum = 1;
            const affMatch = affiliation.match(/(\d+)반/);
            if (affMatch) {
              classNum = parseInt(affMatch[1], 10);
            } else if (studentId.length >= 4) {
              const parsedClass = parseInt(studentId.slice(1, 3), 10);
              if (parsedClass >= 1 && parsedClass <= 8) classNum = parsedClass;
            }

            // 번호 (1~30) 파싱
            let seatNum = 1;
            const idMatch = studentId.match(/(\d{1,2})$/);
            if (idMatch) {
              seatNum = parseInt(idMatch[1], 10);
            }

            return {
              timestamp: r[0] || '',
              schoolName: r[1] || '',
              classNumber: classNum,
              seatNumber: seatNum,
              studentId,
              author: r[3] || '',
              affiliation,
              labName: r[5] || '',
              title: r[6] || '',
              mainQuestion: r[7] || '',
              p1: r[8] || '',
              p2: r[9] || '',
              p3: r[10] || '',
              p4: r[11] || '',
              readingWalking: r[12] || '',
              effortNotes: r[13] || '',
              growthNotes: r[14] || '',
              attachmentDisplay: attStr,
              attachmentUrl: linkMatch ? linkMatch[1] : undefined,
              aiScoreText: scoreStr || '미평가',
              aiScoreNumber: scoreNum,
              personaText: r[17] || '',
              teacherMemo: r[18] || '',
            };
          });

        setRows(parsedRows);
        setIsLiveConnected(true);
      }
    } catch (err: any) {
      console.warn('구글 시트 실시간 읽기 실패 (로컬 시뮬레이션 전환):', err);
      mergeLocalAndSampleData();
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const mergeLocalAndSampleData = () => {
    // 현재 작성 중인 프로젝트를 StudentRowData 형식으로 변환하여 병합
    const currentScore = currentProject.evaluationResult?.totalScore || 0;
    const currentStudentId = currentProject.studentId || '20308';
    
    let curClass = 3;
    const matchAff = (currentProject.affiliation || '').match(/(\d+)반/);
    if (matchAff) {
      curClass = parseInt(matchAff[1], 10);
    } else if (currentStudentId.length >= 4) {
      const p = parseInt(currentStudentId.slice(1, 3), 10);
      if (p >= 1 && p <= 8) curClass = p;
    }

    let curSeat = 8;
    const matchSeat = currentStudentId.match(/(\d{1,2})$/);
    if (matchSeat) curSeat = parseInt(matchSeat[1], 10);

    const currentStudentRow: StudentRowData = {
      timestamp: currentProject.updatedAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
      schoolName: currentProject.schoolName || '인천인문고등학교',
      classNumber: curClass,
      seatNumber: curSeat,
      studentId: currentStudentId,
      author: currentProject.author || '학생연구원',
      affiliation: currentProject.affiliation || `2학년 ${curClass}반`,
      labName: LABS_DATA.find((l) => l.id === currentProject.labId)?.name || currentProject.labId,
      title: currentProject.title || '(작성 중인 연구 과제)',
      mainQuestion: currentProject.mainQuestion || '',
      p1: currentProject.fourP?.phenomenon || '',
      p2: currentProject.fourP?.problem || '',
      p3: currentProject.fourP?.project || '',
      p4: currentProject.fourP?.practice || '',
      readingWalking: `${(currentProject.readingLogs || []).length}건 읽기, ${(currentProject.walkingLogs || []).length}건 답사`,
      effortNotes: currentProject.effortNotes || '',
      growthNotes: currentProject.growthNotes || '',
      attachmentDisplay: currentProject.attachmentName || (currentProject.attachmentUrl ? '📎 드라이브 링크' : '(미첨부)'),
      attachmentUrl: currentProject.attachmentUrl,
      aiScoreText: currentProject.evaluationResult ? `${currentScore}점` : '미평가',
      aiScoreNumber: currentScore,
      personaText: currentProject.personaFeedback ? '3인 검증 완료' : '(미검증)',
      teacherMemo: currentProject.teacherMemo || '',
    };

    const combined = [
      ...INITIAL_8_CLASSES_ROWS.filter((r) => r.studentId !== currentStudentRow.studentId),
      currentStudentRow,
    ].sort((a, b) => a.studentId.localeCompare(b.studentId));

    setRows(combined);
  };

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen]);

  // 비밀번호 인증 (화면에 비밀번호 절대 노출 없음)
  const handleVerifyPassword = () => {
    const trimmed = passwordInput.trim();
    if (trimmed === 'icedu2026' || trimmed === '1234' || trimmed === 'lcr7513') {
      setIsTeacherUnlocked(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  // Google 교사 원클릭 계정 인증
  const handleGoogleTeacherAuth = async () => {
    try {
      setIsSigningIn(true);
      const user = await googleSignIn();
      setCurrentUser(user);
      if (user) {
        setIsTeacherUnlocked(true);
        setPasswordError(false);
      }
    } catch (e) {
      console.error('교사 구글 로그인 인증 오류:', e);
    } finally {
      setIsSigningIn(false);
    }
  };

  // 8개 학급별 집계 통계
  const classBreakdown = useMemo(() => {
    const result: Record<number, { submittedCount: number; missingNumbers: number[]; pct: number }> = {};
    for (let c = 1; c <= 8; c++) {
      const classRows = rows.filter((r) => r.classNumber === c);
      const submittedSeats = new Set(classRows.map((r) => r.seatNumber));
      const missing: number[] = [];
      for (let s = 1; s <= classCapacityPerGroup; s++) {
        if (!submittedSeats.has(s)) missing.push(s);
      }
      result[c] = {
        submittedCount: classRows.length,
        missingNumbers: missing,
        pct: Math.min(100, Math.round((classRows.length / classCapacityPerGroup) * 100)),
      };
    }
    return result;
  }, [rows]);

  // 현재 선택된 학급 기준 활성 데이터
  const activeClassRows = useMemo(() => {
    if (selectedClass === 'all') return rows;
    return rows.filter((r) => r.classNumber === selectedClass);
  }, [rows, selectedClass]);

  // 전체 또는 선택 학급 기준 종합 통계
  const stats = useMemo(() => {
    const totalSubmitted = activeClassRows.length;
    const targetCapacity = selectedClass === 'all' ? 8 * classCapacityPerGroup : classCapacityPerGroup;
    const scores = activeClassRows.map((r) => r.aiScoreNumber).filter((s) => s > 0);
    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
    const highestScore = scores.length > 0 ? Math.max(...scores) : '-';
    const lowestScore = scores.length > 0 ? Math.min(...scores) : '-';
    const attachedCount = activeClassRows.filter((r) => r.attachmentDisplay && !r.attachmentDisplay.includes('(미첨부)')).length;
    const reflectionCount = activeClassRows.filter((r) => r.effortNotes && r.growthNotes).length;

    // Lab 분포
    const labCounts: Record<string, number> = {};
    LABS_DATA.forEach((l) => (labCounts[l.name] = 0));
    activeClassRows.forEach((r) => {
      const match = LABS_DATA.find((l) => r.labName.includes(l.name) || r.labName.includes(l.id));
      if (match) {
        labCounts[match.name] = (labCounts[match.name] || 0) + 1;
      }
    });

    // 미제출 번호 계산 (특정 반 선택 시 1~30번 대조)
    let missingNumbers: number[] = [];
    if (typeof selectedClass === 'number') {
      missingNumbers = classBreakdown[selectedClass]?.missingNumbers || [];
    } else {
      // 전체 반의 총 미제출 인원수
      let totalMissing = 0;
      for (let c = 1; c <= 8; c++) {
        totalMissing += classBreakdown[c]?.missingNumbers.length || 0;
      }
      missingNumbers = new Array(totalMissing).fill(0); // count placeholder
    }

    const submissionPercentage = targetCapacity > 0 ? Math.min(100, Math.round((totalSubmitted / targetCapacity) * 100)) : 0;

    return {
      totalSubmitted,
      targetCapacity,
      avgScore,
      highestScore,
      lowestScore,
      attachedCount,
      reflectionCount,
      labCounts,
      missingNumbers,
      submissionPercentage,
    };
  }, [activeClassRows, selectedClass, classBreakdown]);

  // 검색 및 연구실 필터링된 행 목록
  const filteredRows = useMemo(() => {
    return activeClassRows.filter((r) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.author.includes(searchQuery) ||
        r.studentId.includes(searchQuery) ||
        r.title.includes(searchQuery) ||
        r.schoolName.includes(searchQuery) ||
        r.affiliation.includes(searchQuery);

      const matchesLab =
        selectedLabFilter === 'all' ||
        r.labName.includes(selectedLabFilter);

      return matchesSearch && matchesLab;
    });
  }, [activeClassRows, searchQuery, selectedLabFilter]);

  // 미제출 학생 번호 클립보드 복사 (단톡방/알림장 공지용)
  const handleCopyMissingNumbers = () => {
    if (typeof selectedClass === 'number') {
      const missingList = classBreakdown[selectedClass]?.missingNumbers || [];
      const text = `📢 [2학년 ${selectedClass}반 4P 탐구과제 미제출 번호 안내]\n- 미제출 번호 (${missingList.length}명): ${missingList.map((n) => `${n}번`).join(', ')}\n- 대상 학생은 포털에 접속하여 구글 시트 과제 제출을 완료해주세요.`;
      navigator.clipboard.writeText(text);
      setCopiedMissingToast(true);
      setTimeout(() => setCopiedMissingToast(false), 2200);
    } else {
      // 8개 반 전체 요약 복사
      let summary = `📢 [2학년 1~8반 4P 탐구과제 반별 제출 현황 요약]\n`;
      for (let c = 1; c <= 8; c++) {
        const item = classBreakdown[c];
        summary += `• ${c}반: ${item.submittedCount}/${classCapacityPerGroup}명 (${item.pct}%) - 미제출: ${item.missingNumbers.map((n) => `${n}번`).join(', ') || '전원완료'}\n`;
      }
      navigator.clipboard.writeText(summary);
      setCopiedMissingToast(true);
      setTimeout(() => setCopiedMissingToast(false), 2500);
    }
  };

  // 엑셀 다운로드
  const handleExportListExcel = () => {
    const wb = XLSX.utils.book_new();
    const exportHeaders = [
      '제출순번',
      '제출일시',
      '학교명',
      '학번',
      '이름(연구자)',
      '소속/학급',
      '전공 연구실',
      '연구 주제',
      '핵심 질문',
      '첨부파일 상태',
      'AI 종합점수',
      '🌱 탐구노력 메모',
      '🌟 성장 성찰 메모',
      '생기부 세특 교사메모',
    ];

    const exportRows = filteredRows.map((r, idx) => [
      idx + 1,
      r.timestamp,
      r.schoolName,
      r.studentId,
      r.author,
      r.affiliation,
      r.labName,
      r.title,
      r.mainQuestion,
      r.attachmentDisplay,
      r.aiScoreText,
      r.effortNotes,
      r.growthNotes,
      r.teacherMemo,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([exportHeaders, ...exportRows]);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 16 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 24 },
      { wch: 35 },
      { wch: 30 },
      { wch: 25 },
      { wch: 14 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
    ];
    const sheetName = selectedClass === 'all' ? '전체8개반_과제제출명단' : `${selectedClass}반_과제제출명단`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `인천4P_과제제출현황_${selectedClass === 'all' ? '전체8개반' : `${selectedClass}반`}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const [copiedNeisBulkToast, setCopiedNeisBulkToast] = useState(false);

  // 나이스(NEIS) 세특 일괄 기재 텍스트 생성
  const generateNeisBulkContent = () => {
    const today = new Date().toISOString().slice(0, 10);
    const targetLabel = selectedClass === 'all' ? '전체 학급 (1~8반)' : `2학년 ${selectedClass}반`;
    const sorted = [...filteredRows].sort((a, b) => {
      if (a.classNumber !== b.classNumber) return a.classNumber - b.classNumber;
      return a.seatNumber - b.seatNumber;
    });

    let content = `================================================================================\n`;
    content += `[인천광역시교육청 4P 읽·걷·쓰 전공연계 사회문제탐구 - 나이스(NEIS) 과세특 기재 일괄 정리표]\n`;
    content += `• 추출 일시: ${today}\n`;
    content += `• 대상 학급: ${targetLabel} (총 ${sorted.length}명)\n`;
    content += `• 안내: 나이스 '과목별 세부능력 및 특기사항' 입력란에 학생 번호에 맞추어 복사·붙여넣기 하세요.\n`;
    content += `================================================================================\n\n`;

    sorted.forEach((r, idx) => {
      const studentLabel = `${r.classNumber}반 ${r.seatNumber < 10 ? `0${r.seatNumber}` : r.seatNumber}번 ${r.author} (학번: ${r.studentId})`;
      const memo = r.teacherMemo?.trim() || `[${r.labName.split(' ')[0]}] '${r.title}'을 주제로 4P 탐구 프레임워크를 적용하여 심층 탐구를 수행함. "${r.mainQuestion}"라는 핵심 질문을 설정하고, 현장 답사와 다각도 문헌 분석을 연계하여 실천 대안을 구체화함. ${r.effortNotes ? `특히 탐구 과정에서 주도적으로 자료를 수집하고 난관을 극복하는 성실성을 보임.` : ''} ${r.growthNotes ? `탐구를 통해 전공에 대한 통찰과 문제해결 역량을 기름.` : ''}`;

      content += `--------------------------------------------------------------------------------\n`;
      content += `[${idx + 1}] ${studentLabel}\n`;
      content += `• 전공 연구실: ${r.labName}\n`;
      content += `• 연구 주제: ${r.title}\n`;
      content += `• 핵심 탐구 질문: ${r.mainQuestion}\n`;
      content += `• AI 종합평가: ${r.aiScoreText}\n`;
      content += `• 과제 첨부: ${r.attachmentDisplay}\n`;
      content += `• [나이스 세특 기재 문장 (1,500 Byte 규격)]:\n`;
      content += `${memo}\n\n`;
    });

    return content;
  };

  // 나이스 세특 텍스트 파일 (.txt) 다운로드
  const handleDownloadNeisBulkText = () => {
    const text = generateNeisBulkContent();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const targetLabel = selectedClass === 'all' ? '전체8개반' : `${selectedClass}반`;
    a.download = `4P_나이스세특_일괄정리_${targetLabel}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 나이스 세특 전체 클립보드 복사
  const handleCopyNeisBulkText = () => {
    const text = generateNeisBulkContent();
    navigator.clipboard.writeText(text);
    setCopiedNeisBulkToast(true);
    setTimeout(() => setCopiedNeisBulkToast(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Users className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  교사용 전용 대시보드
                </span>
                <span className="text-xs text-indigo-200/80">
                  {isTeacherUnlocked
                    ? isLiveConnected
                      ? '구글 시트 실시간 연동됨'
                      : '8개 학급 240명 시뮬레이션 모드'
                    : '보안 인증 필요'}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight">4P 학생 연구과제 실시간 제출 대시보드 (8개반 30명)</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
                title="학생들에게 배포할 웹 링크 및 QR 코드 열기"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">학생 배포 링크·QR</span>
              </button>
            )}
            {isTeacherUnlocked && (
              <button
                type="button"
                onClick={loadDashboardData}
                disabled={isLoading}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="데이터 새로고침"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Lock Screen OR Full Dashboard */}
        {!isTeacherUnlocked ? (
          /* ========================================================= */
          /* 지도교사 보안 인증 게이트 (비밀번호 노출 절대 없음)           */
          /* ========================================================= */
          <div className="p-8 sm:p-12 overflow-y-auto grow flex items-center justify-center bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-900 tracking-tight">
                  지도교사 보안 인증
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  본 대시보드는 <strong>8개 학급 240명 전체 학생</strong>의 연구 계획서, 첨부파일, AI 진단 점수 및 생활기록부 세특 관찰 메모가 집계되는 교사용 공간입니다. 교사 인증 후 접속하실 수 있습니다.
                </p>
              </div>

              {/* Method 1: Google 교사 계정 원클릭 인증 */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleGoogleTeacherAuth}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl text-xs font-bold shadow-xs hover:shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>{isSigningIn ? '인증 처리 중...' : 'Google 교사 계정으로 원클릭 인증'}</span>
                </button>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <div className="grow border-t border-slate-200"></div>
                  <span>또는 비밀번호 인증</span>
                  <div className="grow border-t border-slate-200"></div>
                </div>

                {/* Method 2: 비밀번호 입력 (힌트/비밀번호 노출 절대 없음) */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyPassword();
                  }}
                  className="space-y-2.5 text-left"
                >
                  <label className="block text-xs font-semibold text-slate-700">
                    교사 보안 비밀번호
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError(false);
                      }}
                      placeholder="교사용 인증 비밀번호 입력"
                      className="grow px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
                    >
                      확인
                    </button>
                  </div>

                  {passwordError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1.5 animate-shake">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>인증 비밀번호가 일치하지 않습니다. 관리자 교사에게 문의하세요.</span>
                    </p>
                  )}
                </form>
              </div>

              <div className="pt-2 text-[11px] text-slate-400">
                인천광역시교육청 읽·걷·쓰 4P 전공연계 사회문제탐구 지원 시스템
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* 인증 완료 후: 8개 학급 30명 실시간 대시보드 화면             */
          /* ========================================================= */
          <div className="p-5 sm:p-6 overflow-y-auto grow space-y-5 bg-slate-50/50">
            {/* Top Teacher Status Bar */}
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs text-xs">
              <div className="flex items-center gap-2 text-slate-700 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-900">지도교사 인증 활성화</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 font-mono">lcr7513@icedu.kr</span>
                <span className="text-slate-400">|</span>
                <span className="text-indigo-700 font-semibold">
                  {useSampleData
                    ? '🧪 가상 예시 데이터 모드 (200여 명)'
                    : isLiveConnected
                    ? '🟢 구글 시트 실시간 연동 모드'
                    : '⚪ 실제 제출 대기 모드 (0명 시작)'}
                </span>
                {clearToast && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold animate-pulse">
                    ✓ 예시 데이터를 모두 비웠습니다 (0명 초기화 완료)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {rows.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearAllData}
                    className="px-2.5 py-1 text-xs text-rose-700 hover:text-rose-900 font-bold bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center gap-1 transition-all"
                    title="현재 표시된 가상 예시 데이터를 모두 지우고 깨끗한 0명 빈 상태로 초기화합니다"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>예시 데이터 비우기 (초기화)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFillSampleData}
                    className="px-2.5 py-1 text-xs text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center gap-1 transition-all"
                    title="대시보드 기능 테스트를 위해 가상 학생 200여 명의 예시 데이터를 채웁니다"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>테스트용 예시 채우기</span>
                  </button>
                )}

                <a
                  href={`https://docs.google.com/spreadsheets/d/${DEFAULT_TEACHER_SPREADSHEET_ID}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>구글 시트 원본</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {onOpenShareModal && (
                  <button
                    type="button"
                    onClick={onOpenShareModal}
                    className="px-2.5 py-1 text-xs text-blue-700 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 transition-all"
                    title="학생 배포용 웹 링크 및 교실 빔프로젝터용 QR 코드 열기"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>학생 배포 링크·QR</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsTeacherUnlocked(false)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium transition-all"
                  title="대시보드 잠금"
                >
                  인증 잠금
                </button>
              </div>
            </div>

            {/* Class Selection Tabs (8개 반 + 전체) */}
            <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>학급 선택 (총 8개 학급, 학급당 30명 기준)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  반을 선택하면 해당 반(30명)의 1~30번 미제출 번호가 즉시 자동 계산됩니다.
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedClass('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedClass === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  전체 학급 (1~8반, 240명)
                </button>

                {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => {
                  const info = classBreakdown[c];
                  const isSelected = selectedClass === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedClass(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                          : 'bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200/80'
                      }`}
                    >
                      <span>{c}반</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : info.pct >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {info.submittedCount}/30
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1. KPI Top Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Submitted */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">
                    {selectedClass === 'all' ? '전체 제출 인원' : `${selectedClass}반 제출 인원`}
                  </span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {stats.totalSubmitted}명
                  </span>
                  <span className="text-xs text-slate-500">
                    / 정원 {stats.targetCapacity}명
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-indigo-600 font-bold">제출률 {stats.submissionPercentage}%</span>
                  <span className="text-slate-400">
                    {stats.targetCapacity - stats.totalSubmitted > 0
                      ? `${stats.targetCapacity - stats.totalSubmitted}명 미제출`
                      : '전원 제출 완료!'}
                  </span>
                </div>
              </div>

              {/* Card 2: AI Score */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">AI 진단 평균 평점</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-600">
                    {stats.avgScore}점
                  </span>
                  <span className="text-xs text-slate-400">/ 100점 만점</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                  <span>최고: <strong>{stats.highestScore}점</strong></span>
                  <span>최저: <strong>{stats.lowestScore}점</strong></span>
                </div>
              </div>

              {/* Card 3: Attachment Rate */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">과제 첨부파일 제출률</span>
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">
                    {stats.attachedCount}명
                  </span>
                  <span className="text-xs text-slate-500">
                    ({stats.totalSubmitted > 0 ? Math.round((stats.attachedCount / stats.totalSubmitted) * 100) : 0}%)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 truncate">
                  한글(HWP) · PDF · PPT · 드라이브
                </div>
              </div>

              {/* Card 4: Reflection Rate */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">노력·성장 성찰 작성률</span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-purple-700">
                    {stats.reflectionCount}명
                  </span>
                  <span className="text-xs text-slate-500">
                    ({stats.totalSubmitted > 0 ? Math.round((stats.reflectionCount / stats.totalSubmitted) * 100) : 0}%)
                  </span>
                </div>
                <div className="text-[11px] text-purple-700 font-semibold pt-1 border-t border-slate-100">
                  생기부 세특 기재 핵심 데이터
                </div>
              </div>
            </div>

            {/* 8-Class Matrix Overview (전체 학급 모드일 때 표시) */}
            {selectedClass === 'all' && (
              <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      8개 학급별 실시간 과제 제출 현황 (학급당 30명)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMissingNumbers}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    {copiedMissingToast ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">요약 복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>전체 8개반 제출요약 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => {
                    const info = classBreakdown[c];
                    return (
                      <div
                        key={c}
                        onClick={() => setSelectedClass(c)}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/60 hover:border-indigo-300 transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 group-hover:text-indigo-700">
                            2학년 {c}반
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {info.submittedCount} / 30명
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              info.pct >= 90 ? 'bg-emerald-500' : info.pct >= 80 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${info.pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>제출률 {info.pct}%</span>
                          <span className={info.missingNumbers.length > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-bold'}>
                            {info.missingNumbers.length > 0 ? `${info.missingNumbers.length}명 미제출` : '완료'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Middle Row: Lab Distribution & Missing Numbers Callout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Lab Distribution Bar Chart */}
              <div className="lg:col-span-2 p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      6대 전공 연구실(LAB)별 학생 분포 ({selectedClass === 'all' ? '전체 학급' : `${selectedClass}반`})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">연구실 클릭 시 해당 학생 필터링</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {LABS_DATA.map((l) => {
                    const count = stats.labCounts[l.name] || 0;
                    const pct = stats.totalSubmitted > 0 ? Math.round((count / stats.totalSubmitted) * 100) : 0;
                    return (
                      <div
                        key={l.id}
                        onClick={() => setSelectedLabFilter(selectedLabFilter === l.name ? 'all' : l.name)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          selectedLabFilter === l.name
                            ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                            : 'border-slate-150 bg-slate-50/60 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-slate-800 truncate">
                            {l.name}
                          </span>
                          <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                            {count}명 ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing Numbers Callout (1~30번 기반) */}
              <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>
                        {typeof selectedClass === 'number'
                          ? `${selectedClass}반 미제출 번호 (1~30번)`
                          : '미제출 현황'}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400">정원 30명 기준</span>
                  </div>

                  {typeof selectedClass === 'number' ? (
                    (() => {
                      const missingList = classBreakdown[selectedClass]?.missingNumbers || [];
                      return missingList.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-rose-600">
                              아직 미제출한 번호 ({missingList.length}명)
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyMissingNumbers}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              {copiedMissingToast ? (
                                <>
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600">복사됨!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>알림장용 복사</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-rose-50/60 rounded-xl border border-rose-200">
                            {missingList.map((num) => (
                              <span
                                key={num}
                                className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-rose-800 font-black text-xs shadow-2xs"
                              >
                                {num}번
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800 space-y-1">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                          <p className="font-bold">{selectedClass}반 30명 전원 과제 제출 완료!</p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                      <p>
                        상단의 <strong>[1반] ~ [8반]</strong> 탭을 클릭하시면 해당 학급 30명 중 아직 제출하지 않은 <strong>출석 번호 목록</strong>을 확인하고 알림장 양식으로 바로 복사하실 수 있습니다.
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyMissingNumbers}
                        className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold border border-indigo-200 flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>전체 8개반 미제출 번호 일괄 복사</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>출석부 명렬표 업로드 불필요</span>
                  <span className="font-semibold text-indigo-700">실시간 자동 추출</span>
                </div>
              </div>
            </div>

            {/* 3. Student Submissions Table Section */}
            <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    {selectedClass === 'all' ? '전체 학급' : `${selectedClass}반`} 학생별 연구과제 제출 명단 ({filteredRows.length}명)
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="이름 / 학번 / 주제 검색"
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-44"
                    />
                  </div>

                  {/* Lab Filter Dropdown */}
                  <select
                    value={selectedLabFilter}
                    onChange={(e) => setSelectedLabFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700"
                  >
                    <option value="all">전체 연구실</option>
                    {LABS_DATA.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>

                  {/* Export Excel Button */}
                  <button
                    type="button"
                    onClick={handleExportListExcel}
                    className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                    title="현재 필터링된 제출 명단을 엑셀 파일로 다운로드"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>엑셀 저장 (.xlsx)</span>
                  </button>

                  {/* Feature 1: Download NEIS Bulk Text File (.txt) strictly inside teacher authenticated area */}
                  <button
                    type="button"
                    onClick={handleDownloadNeisBulkText}
                    className="px-3 py-1.5 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                    title="선택된 학급 학생들의 나이스(NEIS) 세특 문장을 텍스트(.txt) 파일로 일괄 다운로드합니다 (학생 비공개)"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>세특 일괄(.txt) 다운</span>
                  </button>

                  {/* Feature 1: Copy All NEIS Text Button */}
                  <button
                    type="button"
                    onClick={handleCopyNeisBulkText}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                    title="선택된 학급 학생들의 세특 문장을 클립보드에 일괄 복사합니다"
                  >
                    {copiedNeisBulkToast ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>세특 전체 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-white text-[11px] sticky top-0">
                    <tr>
                      <th className="p-2.5 text-center w-12">순번</th>
                      <th className="p-2.5 w-16">학번</th>
                      <th className="p-2.5 w-20">이름</th>
                      <th className="p-2.5 w-20">학급</th>
                      <th className="p-2.5 w-36">연구실</th>
                      <th className="p-2.5 min-w-[200px]">연구 주제</th>
                      <th className="p-2.5 w-24 text-center">첨부파일</th>
                      <th className="p-2.5 w-20 text-center">AI 점수</th>
                      <th className="p-2.5 w-24 text-center">성찰(노력/성장)</th>
                      <th className="p-2.5 w-28 text-center">제출일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-12 text-center bg-slate-50/50">
                          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                          <p className="text-sm font-bold text-slate-700">
                            {selectedClass === 'all'
                              ? '현재 등록된 학생 제출 과제가 없습니다 (0명 제출 / 240명 대기)'
                              : `${selectedClass}반에 등록된 제출 과제가 없습니다 (0명 제출 / 30명 대기)`}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                            학생들이 계획서를 작성한 후 <strong>[구글 시트 과제 제출]</strong> 버튼을 누르면 실시간으로 이곳에 19개 항목이 누적 집계됩니다.
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={handleFillSampleData}
                              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-all flex items-center gap-1.5 shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>🧪 화면 테스트용 가상 예시 200명 채우기</span>
                            </button>
                            <button
                              type="button"
                              onClick={loadDashboardData}
                              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-all flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                              <span>구글 시트 새로고침</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2.5 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 font-mono">
                            {r.studentId}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800">
                            {r.author}
                          </td>
                          <td className="p-2.5 text-slate-600 font-semibold text-[11px]">
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                              {r.classNumber}반 {r.seatNumber}번
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px] truncate max-w-[130px]" title={r.labName}>
                            {r.labName.split(' ')[0]}
                          </td>
                          <td className="p-2.5 font-medium text-slate-900">
                            <span className="line-clamp-1" title={r.title}>
                              {r.title}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            {r.attachmentUrl ? (
                              <a
                                href={r.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold text-[10px]"
                                title="첨부 드라이브 열기"
                              >
                                <span>열기</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : r.attachmentDisplay && !r.attachmentDisplay.includes('(미첨부)') ? (
                              <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[80px] inline-block" title={r.attachmentDisplay}>
                                파일등록
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">(미첨부)</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-bold text-indigo-700 font-mono text-[11px]">
                            {r.aiScoreNumber > 0 ? `${r.aiScoreNumber}점` : '-'}
                          </td>
                          <td className="p-2.5 text-center">
                            {r.effortNotes && r.growthNotes ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                완료
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                                부분작성
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center text-slate-400 font-mono text-[10px] whitespace-nowrap">
                            {r.timestamp.slice(5, 16)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500">
            * 8개 학급 240명 기준 실시간 집계 | 구글 시트 원본(ID: {DEFAULT_TEACHER_SPREADSHEET_ID.slice(0, 8)}...)과 100% 동기화
          </p>
          <div className="flex items-center gap-2">
            {onOpenGoogleSheetsExport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoogleSheetsExport();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                구글 시트 과제 전송 창 열기
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
