import { ResearchProject, LabId } from '../types';
import { INITIAL_PROJECT } from './labsData';

export const DEMO_PROJECT: ResearchProject = { ...INITIAL_PROJECT, isDemo: true };

export const ARCHIVE_PROJECTS: ResearchProject[] = [
  DEMO_PROJECT,
  {
    id: 'proj-business-1',
    isDemo: true,
    title: '원도심 소상공인 생존율 제고를 위한 ESG 로컬 앵커스토어 연계형 마일리지 순환경제 모델',
    labId: 'business',
    schoolName: '인천비즈니스고등학교',
    studentId: '20215',
    author: '김경제 학생연구원',
    affiliation: '2학년 2반',
    mainQuestion: '대기업 온라인 유통망에 맞서 지역 골목상권의 지속가능한 자생력을 높이는 상생 모델은 무엇인가?',
    fourP: {
      phenomenon:
        '원도심 핵심 상권 점포 10곳 중 4곳이 개업 후 2년 내 폐업하고 있으며, 2030 세대의 소비가 대형 플랫폼 배달 및 이커머스로 85% 이상 집중되는 공동화 현상이 가속화되고 있습니다.',
      problem:
        '개별 소상공인의 마케팅 역량 한계와 단발성 소비 쿠폰 지급 방식의 재정 소모성 정책으로 인해 지속적인 재방문 유인(Lock-in)과 로컬 자본의 역내 재투자 선순환 고리가 결여되어 있습니다.',
      project:
        '행동경제학의 ‘손실 회피성’과 ‘소셜 프루프(Social Proof)’ 이론을 기반으로, 원도심의 유명 앵커스토어(100년 빵집, 로스터리 등)를 중심으로 주변 노포를 묶는 번들형 탄소중립 마일리지 순환 알고리즘을 설계하고 시뮬레이션합니다.',
      practice:
        '1) 인천 신포-개항장 일대 15개 매장 대상 ‘용기내(텀블러/다회용기) 로컬 스탬프 투어’ 시범 운영.\n2) 지역상인회 및 구청 일자리경제과에 학생 연구 결과 보고서 제출 및 원도심 상권 활성화 우수 아이디어 채택 협의.',
    },
    walkingLogs: [
      {
        id: 'walk-b-1',
        date: '2026-09-03',
        steps: 7200,
        durationMinutes: 55,
        courseName: '신포시장 ~ 차이나타운 상권 연계 답사',
        thoughtNote: '관광객들은 닭강정과 화덕만두만 사고 곧바로 빠져나간다. 이들의 발걸음을 안쪽 골목의 서점과 공방으로 잇는 넛지 동선이 필요하다.',
        focusScore: 5,
        linked4PStep: 'P1',
      },
    ],
    readingLogs: [
      {
        id: 'read-b-1',
        title: '도넛 경제학',
        author: '케이트 레이워스',
        category: '경제학',
        readingNotes: '끝없는 성장이 아닌, 지역 공동체의 기초적 필요를 충족하며 자원이 순환하는 경제 생태계의 가능성을 깨달았다.',
        date: '2026-09-02',
      },
    ],
    evaluationResult: {
      totalScore: 92,
      pScores: { phenomenon: 23, problem: 23, project: 23, practice: 23 },
      overallReview: '경영·경제학적 데이터 분석과 행동경제학 넛지를 융합하여 실질적인 골목상권 대안을 제시한 뛰어난 탐구입니다.',
      strengths: ['상권 공동화 통계와 현장 걷기 답사가 일치함', '실제 상인회와 연계 가능한 구체적 마일리지 실천안'],
      improvements: ['포인트 정산 시스템 구축 비용과 소상공인 분담금의 실현 가능성을 추가 보완할 것'],
      questionUpgrades: [
        { level: '기본형', question: '골목상권 손님을 어떻게 늘릴까?', description: '단순 매출 증대에 초점' },
        { level: '심화형', question: '로컬 앵커스토어의 스필오버 효과를 활용한 자생적 순환경제 메커니즘은?', description: '학술 이론 접목' },
        { level: '융합·실천형', question: '현장 상권 답사와 행동 넛지를 통해 소비자를 로컬 지속가능성 파트너로 전환하는 상생 모델은?', description: '읽걷쓰 완성형' },
      ],
      recommendedKeywords: ['앵커스토어', '순환경제', '행동경제학', '넛지', '골목상권'],
      recommendedBooks: [{ title: '골목길 자본론', author: '모종린', reason: '매력적인 로컬 골목상권의 조건과 도시 문화의 가치를 분석합니다.' }],
      practiceActionIdeas: ['학교 축제와 연계한 로컬 상점 팝업 부스 운영', '청소년 로컬 소비 챌린지'],
    },
    createdAt: '2026-09-03',
    updatedAt: '2026-09-08',
  },
  {
    id: 'proj-tech-1',
    isDemo: true,
    title: '보행 약자(휠체어·유아차)를 위한 엣지 컴퓨터 비전 기반 스마트 보행로 단차·장애물 실시간 위험 매핑',
    labId: 'tech',
    schoolName: '인천IT과학고등학교',
    studentId: '30402',
    author: '박소프트 학생연구원',
    affiliation: '3학년 4반',
    mainQuestion: '온디바이스 AI와 엣지 센싱 기술로 교통약자의 안전한 보행권을 어떻게 현실에서 구현할 것인가?',
    fourP: {
      phenomenon:
        '학교 통학로 및 인근 지하철역 반경 1km 구간 내 횡단보도 턱(2cm 초과 규정 위반), 파손된 점자블록, 불법 적치물로 인해 전동휠체어 탑승자가 차도로 위험하게 우회하는 사례가 빈번히 목격됨.',
      problem:
        '기존의 보행로 내비게이션은 도로 단차나 임시 공사 현장, 노면 균열과 같은 미세한 물리적 장애물 정보를 실시간으로 반영하지 못해 이동 약자에게 이동권 격차와 안전사고 위험을 야기함.',
      project:
        '스마트폰 카메라 및 라즈베리파이에 경량화 객체 탐지 모델(YOLOv11-Nano)을 탑재하여 보행로 단차, 경사도, 적치물을 3단계 위험도로 자동 분류하는 온디바이스 컴퓨터 비전 알고리즘을 파이프라인으로 구현.',
      practice:
        '1) 학교 주변 5개 주요 통학로 보행 위험도 현장 실사(도보 15,000보) 데이터셋 오픈 API 구축.\n2) 지역 장애인자립생활센터와 함께 휠체어 사용자 대상 실증 테스트 진행 및 시청 도로안전과에 정비 요청 공문 송부.',
    },
    walkingLogs: [
      {
        id: 'walk-t-1',
        date: '2026-09-04',
        steps: 9400,
        durationMinutes: 70,
        courseName: '송도 센트럴파크 보행로 ~ 인천대입구역',
        thoughtNote: '단 3cm의 턱이 비장애인에게는 아무것도 아니지만, 휠체어 사용자에게는 거대한 절벽과 같다. 걷는 동안 카메라의 각도와 인식률을 계속 테스트했다.',
        focusScore: 5,
        linked4PStep: 'P3',
      },
    ],
    readingLogs: [
      {
        id: 'read-t-1',
        title: '다정한 기술의 시대',
        author: '이민석',
        category: '기술철학',
        readingNotes: '진짜 혁신 기술은 가장 취약한 사람의 발끝에 닿아야 한다는 문장을 가슴에 새겼다.',
        date: '2026-09-03',
      },
    ],
    evaluationResult: {
      totalScore: 96,
      pScores: { phenomenon: 24, problem: 24, project: 25, practice: 23 },
      overallReview: '공학 기술의 따뜻한 시선과 인공지능 엔지니어링 역량, 현장 실증 답사가 완벽하게 어우러진 최고 수준의 탐구 과제입니다.',
      strengths: ['YOLOv11 기반 온디바이스 구현의 기술적 완성도', '지역 장애인 단체와의 긴밀한 파트너십 실천'],
      improvements: ['야간 및 우천 시 컴퓨터 비전 인식 저하에 대응할 수 있는 센서 퓨전 방안을 간략히 기술할 것'],
      questionUpgrades: [
        { level: '기본형', question: '휠체어가 다니기 편한 길을 어떻게 찾을까?', description: '단순 길찾기 질문' },
        { level: '심화형', question: '엣지 AI 컴퓨터 비전을 통한 보행로 물리적 장애물의 정밀 매핑과 안전 지수화 방안은?', description: '기술 공학 접목' },
        { level: '융합·실천형', question: '현장 도보 센싱(걷기)과 포용적 기술(쓰기)로 보행 약자의 실질적 이동 주권을 회복하는 스마트시티 모델은?', description: '읽걷쓰 완성형' },
      ],
      recommendedKeywords: ['온디바이스AI', 'YOLO', '배리어프리', '컴퓨터비전', '보행주권'],
      recommendedBooks: [{ title: '보이지 않는 여자들', author: '캐럴라인 크리아도 페레스', reason: '데이터 편향이 어떻게 여성과 약자를 배제하는지 다룹니다.' }],
      practiceActionIdeas: ['교내 배리어프리 지도 앱 배포', '구글 플레이 오픈베타 등록'],
    },
    createdAt: '2026-09-04',
    updatedAt: '2026-09-09',
  },
  {
    id: 'proj-science-1',
    isDemo: true,
    title: '인천 소래습지 갯벌의 토양 깊이별 총유기탄소(TOC) 저장량 산정과 염생식물의 블루카본 기여도 평가',
    labId: 'science',
    schoolName: '인천과학예술영재학교',
    studentId: '20120',
    author: '이생태 학생연구원',
    affiliation: '2학년 1반',
    mainQuestion: '서해안 연안 습지 갯벌의 생태 복원은 기후변화 탄소 격리에 어느 정도의 과학적 기여를 하는가?',
    fourP: {
      phenomenon:
        '서해안 간척 및 도시 개발로 인해 칠면초, 해홍나물, 갈대 군락이 급감하고 있으며, 갯벌의 면적 축소로 인한 탄소 흡수원 기능 저하 문제가 대두됨.',
      problem:
        '산림 중심의 그린카본(Green Carbon)에 비해 연안 습지의 블루카본(Blue Carbon)에 대한 청소년 및 일반 시민의 과학적 인식이 매우 낮아, 갯벌이 단순 ‘쓸모없는 갯벌/진흙탕’으로 오인되어 보존 정책에서 소외됨.',
      project:
        '소래습지 갯벌 내 자연 염생식물 군락지 vs 인공 복원지 vs 나지(식생 없음) 3개 구역에서 깊이 0~10cm, 10~30cm 토양 시료를 채취하여 강열감량법(LOI) 및 TOC 정량 분석을 수행하고 통계적 차이를 ANOVA 검정.',
      practice:
        '1) 청소년 기후행동 블루카본 인포그래픽 리포트 500부 제작 및 관내 10개 중고교 생물/지구과학 수업 자료로 기증.\n2) 인천 갯벌 세계자연유산 2단계 등재 촉구를 위한 학생 서명 운동 및 갯벌 플로깅(Plogging) 캠페인 주도.',
    },
    walkingLogs: [
      {
        id: 'walk-s-1',
        date: '2026-09-05',
        steps: 8800,
        durationMinutes: 65,
        courseName: '소래습지 갯골 생태 둘레길',
        thoughtNote: '갯벌 흙 속에 발이 푹푹 빠지며 생명의 냄새를 맡았다. 이 질척이는 진흙 1제곱미터가 아마존 열대우림보다 수십 배 오랜 세월 탄소를 가둬둔다는 사실에 전율을 느꼈다.',
        focusScore: 5,
        linked4PStep: 'P1',
      },
    ],
    readingLogs: [
      {
        id: 'read-s-1',
        title: '침묵의 봄',
        author: '레이첼 카슨',
        category: '환경과학',
        readingNotes: '보이지 않는 미세한 생태계의 연결고리를 과학자의 치열한 증거로 밝혀낸 카슨의 정신을 연구에 담고자 했다.',
        date: '2026-09-04',
      },
    ],
    evaluationResult: {
      totalScore: 95,
      pScores: { phenomenon: 24, problem: 23, project: 25, practice: 23 },
      overallReview: '자연과학적 가설 설정, 시료 채취, 정량 실험 분석과 지역사회 환경 캠페인이 유기적으로 결합된 훌륭한 연구입니다.',
      strengths: ['토양 심도별 TOC 정량 분석의 체계성', '인천 갯벌의 지역적 생태 특수성을 훌륭히 살림'],
      improvements: ['실험 오차를 줄이기 위해 계절별(온도/강수량) 시료 채취 한계점을 논의에 서술할 것'],
      questionUpgrades: [
        { level: '기본형', question: '갯벌이 탄소를 얼마나 흡수할까?', description: '단순 호기심' },
        { level: '심화형', question: '염생식물 식생 유형과 토양 심도에 따른 유기탄소 저장 메커니즘의 차이는?', description: '과학적 정량 분석' },
        { level: '융합·실천형', question: '현장 생태 탐구(걷기)와 데이터 실증(읽기)을 통한 연안 블루카본 가치 재조명과 생태 주권 수호 모델은?', description: '읽걷쓰 완성형' },
      ],
      recommendedKeywords: ['블루카본', 'TOC', '염생식물', '소래습지', '탄소격리'],
      recommendedBooks: [{ title: '우리는 지구를 포기하지 않는다', author: '최재천', reason: '생물다양성과 지구 생태 위기의 통섭적 솔루션을 모색합니다.' }],
      practiceActionIdeas: ['인천 연안 갯벌 보호 플로깅 행사 개최', '청소년 생태 학술 포스터 발표'],
    },
    createdAt: '2026-09-05',
    updatedAt: '2026-09-09',
  },
  {
    id: 'proj-bio-1',
    isDemo: true,
    title: '고등학생의 취침 전 스마트폰 블루라이트 노출 시간과 멜라토닌 리듬 및 주간 인지 피로도의 상관성 연구',
    labId: 'bio',
    schoolName: '인천보건고등학교',
    studentId: '20311',
    author: '최생명 학생연구원',
    affiliation: '2학년 3반',
    mainQuestion: '심야 전자기기 스크린 사용이 청소년의 수면 생체시계와 학업 인지 집중력에 미치는 생리학적 기전은 무엇인가?',
    fourP: {
      phenomenon:
        '교내 학생 120명 설문 결과, 84%가 소등 후 침대에서 평균 74분간 스마트폰 SNS 및 영상을 시청하며, 1교시 수업 시간 심한 졸림과 두통, 안구 건조증을 호소함.',
      problem:
        '수면 부족을 개인의 시간관리 실패나 나태함으로 치부하는 교내 분위기로 인해, 청소년 뇌신경계 발달과 일주기 생체리듬(Circadian Rhythm) 교란에 따른 만성 피로와 우울감 증상이 간과됨.',
      project:
        '웨어러블 스마트밴드를 활용한 3주간의 수면 단계(깊은 수면, 렘수면, 깸) 모니터링과 주간 ‘단어 기억력 및 스트룹 검사(Stroop Test)’를 결합한 코호트 추적 관찰 분석.',
      practice:
        '1) 교내 자율동아리 주관 ‘취침 1시간 전 폰 오프(Phone-Off) & 걷기 사색 3주 챌린지’ 운영.\n2) 학교 보건실과 협력하여 청소년 수면위생 10계명 인포그래픽 포스터를 전 학급 게시.',
    },
    walkingLogs: [
      {
        id: 'walk-m-1',
        date: '2026-09-06',
        steps: 6800,
        durationMinutes: 50,
        courseName: '원적산 둘레길 저녁 힐링 산책',
        thoughtNote: '저녁 먹고 40분 산책을 한 날은 확실히 밤에 폰을 덜 보게 되고 잠이 깊이 들었다. 신체의 자연스러운 유산소 운동이 멜라토닌 분비를 돕는다는 생리학 책의 구절이 체감되었다.',
        focusScore: 5,
        linked4PStep: 'P4',
      },
    ],
    readingLogs: [
      {
        id: 'read-m-1',
        title: '우리는 왜 잠을 자야 할까',
        author: '매슈 워커',
        category: '뇌신경의학',
        readingNotes: '잠을 줄이는 것은 뇌의 기억 회로를 파괴하고 감정 브레이크를 고장 내는 행위라는 경고가 큰 울림을 주었다.',
        date: '2026-09-05',
      },
    ],
    evaluationResult: {
      totalScore: 93,
      pScores: { phenomenon: 23, problem: 23, project: 24, practice: 23 },
      overallReview: '학생들의 일상적 문제(수면 부족)를 최신 신경생리학 및 인지심리 도구로 엄밀하게 탐구하고 생활 습관 개선으로 이끈 훌륭한 보고서입니다.',
      strengths: ['웨어러블 기기와 스트룹 검사를 병행한 데이터 수집', '동아리 챌린지를 통한 실천적 행동 유도'],
      improvements: ['카페인 섭취량이나 학원 심야 학습 시간 등 수면을 방해하는 외생 변수를 통제한 분석을 보강할 것'],
      questionUpgrades: [
        { level: '기본형', question: '밤에 스마트폰을 보면 왜 낮에 졸릴까?', description: '단순 인과 질문' },
        { level: '심화형', question: '청소년 일주기 생체리듬과 멜라토닌 분비 교란이 전두엽 인지 조절 기능에 미치는 신경생리학적 영향은?', description: '생명과학 심화' },
        { level: '융합·실천형', question: '규칙적 걷기 사색(신체활동)과 디지털 디톡스를 통한 청소년 수면권 회복 및 교내 보건 정책 모델은?', description: '읽걷쓰 완성형' },
      ],
      recommendedKeywords: ['일주기리듬', '멜라토닌', '스트룹검사', '수면위생', '디지털디톡스'],
      recommendedBooks: [{ title: '아픔이 길이 되려면', author: '김승섭', reason: '사회적 스트레스와 수면권 불평등의 사회역학적 고찰.' }],
      practiceActionIdeas: ['학교 아침 자습 시간 명상 걷기 도입 제안', '가정 연계 디지털 수면 약속'],
    },
    createdAt: '2026-09-06',
    updatedAt: '2026-09-09',
  },
  {
    id: 'proj-education-1',
    isDemo: true,
    title: '다문화 밀집 지역 중학생의 학교 소속감 증진을 위한 픽토그램 유니버설 공간 디자인 넛지 개발',
    labId: 'education',
    schoolName: '인천사범부속고등학교',
    studentId: '20508',
    author: '정교육 학생연구원',
    affiliation: '2학년 5반',
    mainQuestion: '다언어·다문화 환경에서 언어 장벽을 넘어 모든 학생의 심리적 안정과 배움을 보장하는 공간 설계는?',
    fourP: {
      phenomenon:
        '원도심 다문화 학생 비율이 35%에 달하는 중학교에서 특별실 위치, 비상 대피로, 도서관 이용 수칙 등이 한국어 한문 중심 텍스트로만 안내되어 중도입국 학생들이 시설 이용을 기피하고 쉬는 시간 고립되는 현상 관찰.',
      problem:
        '학교 환경이 다문화 학생의 시각적·심리적 눈높이를 배려하지 못해 은연중에 언어적 장벽을 형성하고 학교 소속감(School Belongingness)을 저하시킴.',
      project:
        '교육심리학의 ‘자기결정성 이론’과 유니버설 디자인 7대 원칙을 바탕으로 다문화 및 비다문화 학생 80명 대상 공간 인지도 및 픽토그램 이해도 A/B 테스트 실시.',
      practice:
        '1) 다문화 학생들과 함께 개발한 ‘친절한 학교 픽토그램 12종’ 스티커를 교내 복도와 특별실에 시범 부착.\n2) 인천시교육청 ‘읽걷쓰 다문화 어울림 공모전’에 공간 혁신 제안서 출품 및 우수 정책제안상 수상.',
    },
    walkingLogs: [
      {
        id: 'walk-e-1',
        date: '2026-09-07',
        steps: 6100,
        durationMinutes: 45,
        courseName: '수봉공원 문화산책로 & 골목길',
        thoughtNote: '골목길 벽화 하나가 어둡던 길을 온기로 채우듯, 학교의 차가운 텍스트 안내판을 따뜻한 그림 픽토그램으로 바꾸면 낯선 한국 땅에 온 아이들의 마음도 한결 편안해질 것이다.',
        focusScore: 5,
        linked4PStep: 'P4',
      },
    ],
    readingLogs: [
      {
        id: 'read-e-1',
        title: '디자인의 디자인',
        author: '하라 켄야',
        category: '디자인미학',
        readingNotes: '디자인은 새로운 것을 만드는 것이 아니라, 사람과 사람 사이의 보이지 않는 공백을 메우는 일이라는 문구에 깊이 공감했다.',
        date: '2026-09-06',
      },
    ],
    evaluationResult: {
      totalScore: 94,
      pScores: { phenomenon: 24, problem: 24, project: 23, practice: 23 },
      overallReview: '교육 현장의 실제적 문제를 예술·디자인과 교육심리학으로 풀어내고, 다문화 학생들과 공동 창작한 매우 따뜻하고 감동적인 연구입니다.',
      strengths: ['다문화 학생들과 함께 만든 참여형 유니버설 픽토그램', '실제 학교 공간에 적용하여 만족도를 사전/사후 측정한 실증성'],
      improvements: ['향후 다른 학교로의 확산 가능성을 고려해 픽토그램 가이드라인 템플릿을 표준화할 것'],
      questionUpgrades: [
        { level: '기본형', question: '다문화 친구들이 학교에서 길을 잘 찾게 하려면?', description: '단순 안내 개선' },
        { level: '심화형', question: '유니버설 픽토그램 공간 넛지가 다문화 청소년의 학교 소속감과 심리적 안녕감에 미치는 기전은?', description: '교육심리 접목' },
        { level: '융합·실천형', question: '배려와 환대의 시각 예술(읽기-걷기)을 통해 학교 공간을 포용적 다문화 공론장(쓰기)으로 변모시키는 실천 모델은?', description: '읽걷쓰 완성형' },
      ],
      recommendedKeywords: ['유니버설디자인', '다문화교육', '학교소속감', '공간혁신', '디자인넛지'],
      recommendedBooks: [{ title: '공감의 반경', author: '장대익', reason: '타인의 다름을 이해하고 환대하는 마음의 진화와 교육적 지혜.' }],
      practiceActionIdeas: ['다문화 가족 참여 픽토그램 워크숍 개최', '교육청 공간혁신 사업과 연계'],
    },
    createdAt: '2026-09-07',
    updatedAt: '2026-09-09',
  },
];

export const LAB_MODEL_PROJECTS: Record<LabId, ResearchProject> = {
  humanities: DEMO_PROJECT,
  business: ARCHIVE_PROJECTS.find((p) => p.labId === 'business') || DEMO_PROJECT,
  tech: ARCHIVE_PROJECTS.find((p) => p.labId === 'tech') || DEMO_PROJECT,
  science: ARCHIVE_PROJECTS.find((p) => p.labId === 'science') || DEMO_PROJECT,
  bio: ARCHIVE_PROJECTS.find((p) => p.labId === 'bio') || DEMO_PROJECT,
  education: ARCHIVE_PROJECTS.find((p) => p.labId === 'education') || DEMO_PROJECT,
};

export const getLabModelProject = (labId: LabId): ResearchProject => {
  return LAB_MODEL_PROJECTS[labId] || DEMO_PROJECT;
};

