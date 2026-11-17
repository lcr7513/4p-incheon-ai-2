export type LabId =
  | 'humanities'
  | 'business'
  | 'tech'
  | 'science'
  | 'bio'
  | 'education';

export type WalkingDomainId =
  | 'contemplation'       // 사색·성찰형 걷기
  | 'field-observation'  // 현장답사·공간관찰형 걷기
  | 'interview-dialogue'  // 사람·소통·인터뷰형 걷기
  | 'literature-history'  // 역사·문학기행형 걷기
  | 'eco-nature'          // 생태·자연탐사형 걷기
  | 'action-campaign'     // 실천·연대·캠페인형 걷기
  | 'platform-walk'       // 플랫폼 걷기 (배달·모빌리티·알고리즘)
  | 'data-walk';          // 데이터 걷기 (스마트센싱·환경측정·GIS)

export interface WalkingDomainInfo {
  id: WalkingDomainId;
  name: string;
  englishName: string;
  subtitle: string;
  badge: string;
  themeColor: string;
  badgeColor: string;
  bgLight: string;
  borderColor: string;
  iconName: string;
  summary: string;
  philosophy: string;
  methods: string[];
  inquiryKeywords: string[];
  inquiryQuestions: string[];
  sampleActivities: {
    title: string;
    purpose: string;
    target4P: 'P1' | 'P2' | 'P3' | 'P4';
    stepsToTake: string[];
    expectedOutcome: string;
    injectContent: string;
  }[];
  checklists: string[];
  recommendedSpots: {
    name: string;
    location: string;
    features: string;
    contemplationPrompt: string;
  }[];
}

export interface WalkingSpot {
  id: string;
  name: string;
  subName?: string;
  location: string;
  district: string;
  imageUrl: string;
  imageCaption: string;
  incheonFeatures: string; // 인천 고유의 장소적·역사적·지리적 특징 설명
  historicalBackground?: string; // 역사·공간적 배경
  reason: string;
  inquiryConnection: string; // 전공 연구실과의 연계 착안점
  contemplationPrompt: string;
  courseDistance?: string; // 소요거리 및 시간
  keySpots: string[]; // 주요 경유지
  tags: string[];
  photoCredit?: string; // 사진 출처 및 라이선스 (Unsplash License, 공공누리 등)
  isRealIncheonPhoto?: boolean; // 실제 인천 현장 촬영 사진 여부
}

export type GisMetricId =
  | 'elderlyRatio'
  | 'parkArea'
  | 'airPm25'
  | 'youthEmployment'
  | 'singleHousehold'
  | 'basicLivelihood';

export interface GisNavigationPreset {
  metricKey: GisMetricId;
  leftDistrictId: string;
  rightDistrictId?: string;
  viewTab?: 'map' | 'multidimensional' | 'split-compare';
  sourceTitle?: string;
}

export interface LabInfo {
  id: LabId;
  name: string;
  englishName: string;
  badge: string;
  themeColor: string;
  badgeColor: string;
  bgLight: string;
  borderColor: string;
  iconName: string;
  summary: string;
  description: string;
  coreMajors: string[];
  inquiryKeywords: string[];
  inquiryCoreQuestions: string[];
  sampleTopics: {
    title: string;
    mainQuestion: string;
    p1: string;
    p2: string;
    p3: string;
    p4: string;
    keywords: string[];
    gisHint?: {
      metricKey: GisMetricId;
      metricLabel: string;
      leftDistrictId: string;
      leftDistrictName: string;
      rightDistrictId: string;
      rightDistrictName: string;
      disparityTip: string;
    };
  }[];
  recommendedReadings: {
    title: string;
    author: string;
    badge: string;
    description: string;
  }[];
  walkingSpots: WalkingSpot[];
}

export interface WalkingLog {
  id: string;
  date: string;
  steps: number;
  durationMinutes: number;
  courseName: string;
  thoughtNote: string;
  focusScore: number; // 1 ~ 5
  linked4PStep: 'P1' | 'P2' | 'P3' | 'P4' | 'general';
  domainId?: WalkingDomainId;
  activityType?: string;
  findings?: string;
  photos?: { id: string; url: string; caption?: string }[];
}

export type ReadingMediaType = 'book' | 'paper' | 'news' | 'video';

export interface ReadingLog {
  id: string;
  title: string;
  author: string;
  category: string;
  readingNotes: string;
  date: string;
  mediaType?: ReadingMediaType; // 'book' | 'paper' | 'news' | 'video'
  url?: string;                 // 기사 / 논문 / 유튜브 웹 링크
  sourceOrg?: string;           // 언론사, 학술지명, 유튜브 채널명, 출판사
  timestampOrPage?: string;     // 인상 깊은 구간(타임스탬프: 04:25) 또는 인용 페이지(p.45)
  linked4PStep?: 'P1' | 'P2' | 'P3' | 'P4' | 'general'; // 4P 연계 단계
}

export interface FourPData {
  phenomenon: string; // P1 현상
  problem: string;    // P2 문제
  project: string;    // P3 과업
  practice: string;   // P4 실천
}

export interface QuestionUpgrade {
  level: string;
  question: string;
  description: string;
}

export interface EvaluationResult {
  totalScore: number;
  pScores: {
    phenomenon: number;
    problem: number;
    project: number;
    practice: number;
  };
  overallReview: string;
  strengths: string[];
  improvements: string[];
  questionUpgrades: QuestionUpgrade[];
  recommendedKeywords: string[];
  recommendedBooks: {
    title: string;
    author: string;
    reason: string;
  }[];
  practiceActionIdeas: string[];
  isFallback?: boolean;
}

export interface AiDataCorrelationInsight {
  title: string;
  historicalContext: string;
  mechanismAnalysis: string;
  criticalThinkingPrompts: string[];
  p1PhenomenonText: string;
  p2ProblemText: string;
  relatedConcepts: string[];
  isFallback?: boolean;
}

export interface PersonaReviewItem {
  name: string;
  role: string;
  tone: string;
  avatarIcon: string;
  reaction: '적극 지지' | '조건부 찬성' | '우려 및 보완 필요';
  strengths: string;
  concerns: string;
  sharpQuestion: string;
}

export interface StakeholderPersonaFeedback {
  persona1?: PersonaReviewItem;
  persona2?: PersonaReviewItem;
  persona3?: PersonaReviewItem;
  merchant: PersonaReviewItem;
  environmental: PersonaReviewItem;
  official: PersonaReviewItem;
  synthesisAdvice: string;
  suggestedP4Revision?: string;
  isFallback?: boolean;
  labId?: LabId;
}

export interface TeamMember {
  id: string;
  studentId: string;
  name: string;
  role: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  labId: LabId;
  schoolName?: string;
  studentId?: string;
  author: string;
  affiliation: string;
  isGroupResearch?: boolean;
  teamMembers?: TeamMember[];
  mainQuestion: string;
  fourP: FourPData;
  walkingLogs: WalkingLog[];
  readingLogs: ReadingLog[];
  effortNotes?: string;        // 🌱 탐구과정에서 노력한 점 (자료수집, 답사, 난관 극복)
  growthNotes?: string;        // 🌟 탐구를 통해 성장한 점 (전공 이해 확장, 가치관 변화, 배운 점)
  attachmentUrl?: string;      // 📎 첨부파일 구글 드라이브 링크
  attachmentName?: string;     // 첨부파일 명 (예: 10301_김인천_보고서.hwp)
  evaluationResult?: EvaluationResult | null;
  personaFeedback?: StakeholderPersonaFeedback | null;
  teacherMemo?: string;
  checklistProgress?: Record<string, boolean>; // 4P 단계별 자가점검 체크리스트 상태
  ethicsPledgeAccepted?: boolean;             // 연구 윤리 및 생성형 AI 윤리적 활용 서약 여부
  targetNeisType?: 'subject' | 'club' | 'career'; // 생기부 세특 목표 유형
  submittedToTeacher?: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  /** 모범 예시/아카이브 자료인지 사용자가 작성하는 실제 프로젝트인지 구분 */
  isDemo?: boolean;
}

export type ActiveTab =
  | 'dashboard'
  | 'labs'
  | 'workspace'
  | 'ai-evaluator'
  | 'walking-mind'
  | 'archive'
  | 'experimental-lab'
  | 'gis-map'
  | 'guide';

