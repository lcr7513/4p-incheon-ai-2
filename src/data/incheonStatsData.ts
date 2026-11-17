export interface DistrictStat {
  id: string;
  name: string;
  hanja: string;
  regionType: '원도심·항만' | '경제자유구역·신도심' | '산업·주거복합' | '도서·생태지역';
  color: string;
  badgeBg: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  population: number; // 총인구 (명)
  youthRatio: number; // 청소년 인구 비율 (%)
  elderlyRatio: number; // 65세 이상 고령자 비율 (%)
  envStats: {
    airQualityPm25: number; // 초미세먼지 연평균 (㎍/㎥)
    parkAreaPerCapita: number; // 1인당 도시공원 면적 (㎡)
    wasteRecycleRate: number; // 생활폐기물 재활용률 (%)
    carbonEmissionPerCapita: number; // 1인당 온실가스 배출량 (tCO2eq)
    noiseLevel: number; // 평균 소음도 (dB)
  };
  welfareStats: {
    basicLivelihoodRate: number; // 기초생활보장 수급률 (%)
    youthFacilityCount: number; // 청소년 문화·수련시설 (개소)
    welfareBudgetRatio: number; // 구 예산 중 사회복지 비중 (%)
    medicalDoctorCountPerThousand: number; // 인구 천명당 의사 수 (명)
    publicLibraryCount: number; // 공공도서관 수 (개소)
  };
  // NEW: Demographic & Population Indicators
  demographicStats: {
    childRatio0to14: number; // 0~14세 유소년 비율 (%)
    workingAgeRatio15to64: number; // 15~64세 생산가능인구 비율 (%)
    youthRatio19to34: number; // 만 19~34세 청년 인구 비율 (%)
    singleHouseholdRatio: number; // 1인 가구 비율 (%)
    multiculturalResidentCount: number; // 다문화·외국인 주민 수 (명)
    fertilityRate: number; // 합계출산율 (명)
    migrationTrend: string; // 인구 이동 및 세대 특성 요약
  };
  // NEW: Industry, Economy & Job Indicators
  industryStats: {
    primaryIndustry: string; // 대표 특화 산업군
    businessCount: number; // 총 사업체 수 (개)
    workerCount: number; // 총 종사자 수 (명)
    manufacturingRatio: number; // 제조업 종사자 비중 (%)
    serviceRatio: number; // 서비스·유통업 종사자 비중 (%)
    techBioRatio: number; // 첨단 바이오·IT·연구개발 종사자 비중 (%)
    youthEmploymentRate: number; // 청년 고용률 (%)
    keyIndustrialClusters: string[]; // 핵심 산업 클러스터 및 거점
    economicIssue: string; // 산업 경제 현안 요약
  };
  keyIssues: string[];
  fourPInquiryTip: {
    phenomenon: string;
    problem: string;
    project: string;
    practice: string;
  };
  // NEW: Specialized 4P suggestions for demographics and industry
  demographic4PTip: {
    phenomenon: string;
    problem: string;
    project: string;
    practice: string;
  };
  industry4PTip: {
    phenomenon: string;
    problem: string;
    project: string;
    practice: string;
  };
}

export const INCHEON_AVERAGE = {
  youthRatio: 15.2,
  elderlyRatio: 16.8,
  airQualityPm25: 19.5,
  parkAreaPerCapita: 12.4,
  wasteRecycleRate: 59.8,
  carbonEmissionPerCapita: 6.8,
  basicLivelihoodRate: 5.4,
  welfareBudgetRatio: 58.2,
  medicalDoctorCountPerThousand: 2.6,
  // Averages for Demographics & Industry
  youthRatio19to34: 20.4,
  singleHouseholdRatio: 33.2,
  fertilityRate: 0.69,
  youthEmploymentRate: 47.8,
  manufacturingRatio: 22.4,
  serviceRatio: 66.8,
};

export interface GovDataSource {
  id: string;
  title: string;
  agency: string;
  category: '환경·대기' | '인구·복지' | '지역·공간' | '자원순환' | '산업·경제';
  description: string;
  url: string;
  apiDocUrl: string;
  isFree: boolean;
  requiresKey: boolean;
  sampleDatasetCode: string;
  fieldsProvided: string[];
}

export const GOV_API_DATA_SOURCES: GovDataSource[] = [
  {
    id: 'airkorea',
    title: '한국환경공단 에어코리아 대기오염정보',
    agency: '환경부 / 한국환경공단',
    category: '환경·대기',
    description: '인천 10개 군·구 측정소별 실시간 미세먼지(PM10), 초미세먼지(PM2.5), 오존(O3), 이산화질소 실시간 농도',
    url: 'https://www.airkorea.or.kr',
    apiDocUrl: 'https://www.data.go.kr/data/15073861/openapi.do',
    isFree: true,
    requiresKey: true,
    sampleDatasetCode: 'ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty',
    fieldsProvided: ['pm10Value', 'pm25Value', 'o3Value', 'no2Value', 'khaiValue(통합대기)'],
  },
  {
    id: 'kosis-pop',
    title: '통계청 KOSIS 행정구역별 주민등록인구 및 고령자',
    agency: '통계청 국가통계포털',
    category: '인구·복지',
    description: '인천 10개 군·구별 연령별 주민등록인구, 고령화율(65세 이상), 유소년(0~14세) 비율, 1인가구',
    url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1B040A3',
    apiDocUrl: 'https://kosis.kr/openapi/',
    isFree: true,
    requiresKey: true,
    sampleDatasetCode: 'DT_1B040A3',
    fieldsProvided: ['총인구수', '65세이상고령자비율', '유소년인구비율', '남녀인구비'],
  },
  {
    id: 'industry-kosis',
    title: '통계청 전국사업체조사 및 경제활동인구 (산업·일자리)',
    agency: '통계청 / 산업통상자원부',
    category: '산업·경제',
    description: '군구별 사업체 수, 제조업 및 지식기반 서비스업 종사자 수, 청년 고용률 및 신산업 클러스터 현황',
    url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1K52A01',
    apiDocUrl: 'https://www.data.go.kr/data/15083049/openapi.do',
    isFree: true,
    requiresKey: true,
    sampleDatasetCode: 'KOSIS_INDUSTRY_BIZ_2024',
    fieldsProvided: ['사업체수', '종사자수', '제조업비율', '청년취업률', '산업분류'],
  },
  {
    id: 'e-local',
    title: 'e-지방지표 (지자체별 복지예산 및 공원면적)',
    agency: '행정안전부 / 통계청',
    category: '지역·공간',
    description: '1인당 도시공원 조성 면적, 지자체 총예산 대비 사회복지 예산 비중(%), 기초생활수급률',
    url: 'https://www.index.go.kr',
    apiDocUrl: 'https://www.data.go.kr/data/15002047/openapi.do',
    isFree: true,
    requiresKey: true,
    sampleDatasetCode: 'LOCAL_WELFARE_BUDGET_INDEX',
    fieldsProvided: ['1인당도시공원면적', '사회복지예산비율', '기초수급자비율'],
  },
  {
    id: 'incheon-bigdata',
    title: '인천광역시 공공데이터포털 (인천빅데이터)',
    agency: '인천광역시청',
    category: '자원순환',
    description: '수도권매립지 폐기물 반입 현황, 군구별 자원순환 선별률, 공공도서관·청소년 문화시설 인프라',
    url: 'https://data.incheon.go.kr',
    apiDocUrl: 'https://data.incheon.go.kr/openInfo/openData.do',
    isFree: true,
    requiresKey: false,
    sampleDatasetCode: 'INCHEON_BIGDATA_OPEN',
    fieldsProvided: ['군구별도서관목록', '청소년시설현황', '폐기물발생량', '재활용률'],
  },
  {
    id: 'open-meteo',
    title: 'Open-Meteo Air Quality Open API (즉시 사용)',
    agency: '글로벌 기후대기 오픈리서치',
    category: '환경·대기',
    description: '별도 인증키 없이 즉시 호출 가능한 인천 10개 군·구 좌표별 실시간 PM2.5, PM10, 유럽 대기질지수, UV 지수',
    url: 'https://open-meteo.com/en/docs/air-quality-api',
    apiDocUrl: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    isFree: true,
    requiresKey: false,
    sampleDatasetCode: 'OPEN_METEO_AIR_FREE',
    fieldsProvided: ['pm10', 'pm2_5', 'european_aqi', 'uv_index', 'carbon_monoxide'],
  },
];

export const INCHEON_10_DISTRICTS: DistrictStat[] = [
  {
    id: 'jung-gu',
    name: '중구',
    hanja: '中區',
    regionType: '원도심·항만',
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    coordinates: { lat: 37.4738, lng: 126.6215 },
    population: 158200,
    youthRatio: 16.1,
    elderlyRatio: 16.2,
    envStats: {
      airQualityPm25: 21.2,
      parkAreaPerCapita: 14.8,
      wasteRecycleRate: 57.4,
      carbonEmissionPerCapita: 8.9,
      noiseLevel: 58,
    },
    welfareStats: {
      basicLivelihoodRate: 5.8,
      youthFacilityCount: 6,
      welfareBudgetRatio: 52.4,
      medicalDoctorCountPerThousand: 2.3,
      publicLibraryCount: 7,
    },
    demographicStats: {
      childRatio0to14: 13.9,
      workingAgeRatio15to64: 69.9,
      youthRatio19to34: 22.4,
      singleHouseholdRatio: 37.8,
      multiculturalResidentCount: 8400,
      fertilityRate: 0.78,
      migrationTrend: '영종하늘도시 청년·신혼가구 대규모 유입 vs 원도심(신포·북성동) 초고령화 양극화',
    },
    industryStats: {
      primaryIndustry: '항공운송·공항물류 및 복합해양관광 (인천공항·인천항)',
      businessCount: 16200,
      workerCount: 94500,
      manufacturingRatio: 8.4,
      serviceRatio: 84.2,
      techBioRatio: 7.4,
      youthEmploymentRate: 49.8,
      keyIndustrialClusters: ['인천국제공항 항공정비(MRO) 단지', '인천항 내항·남항 배후물류단지', '파라다이스시티·인스파이어 복합리조트', '개항장 역사문화상권'],
      economicIssue: '원도심 소상공인 매출 감소 및 영종도 지역 대중교통(공항철도 환승) 비용 부담',
    },
    keyIssues: [
      '원도심(개항장)과 신도시(영종국제도시) 간 의료·교육 인프라 체감 격차',
      '인천항 항만 물류 트럭 통행에 따른 도로 비산먼지 및 소음',
      '영종 갯벌 생태 보존과 항공 MRO 산업단지 개발 간의 상생 과제',
    ],
    fourPInquiryTip: {
      phenomenon: '영종 신도시와 신포·북성동 원도심 간 청소년 문화복지 시설 접근성 편차',
      problem: '지리적 분리로 인한 공공 순환교통 부족 및 원도심 노후화에 따른 인구 유출',
      project: '원도심 역사문화 유산을 활용한 청소년 야간 도보학습 및 공공 셔틀 노선 시뮬레이션',
      practice: '중구 주민참여예산 청소년 분과에 문화 배차 간격 개선 정책 제안서 제출',
    },
    demographic4PTip: {
      phenomenon: '중구 원도심 골목의 독거노인 1인가구 급증과 영종 신혼부부 보육시설 대기열의 공존',
      problem: '바다로 격리된 동일 자치구 내 세대별 인구 분포의 극단적 불균형',
      project: '영종 청년 학부모와 원도심 은퇴 어르신을 잇는 세대 통합 돌봄 품앗이 플랫폼 기획',
      practice: '중구청에 원도심-신도시 간 온누리 돌봄 버스 운영 시범 제안',
    },
    industry4PTip: {
      phenomenon: '인천국제공항 종사자의 영종도 외지 출퇴근 비율 증가와 지역 상권 유인력 부족',
      problem: '공항 배후도시와 정주 상권 간의 연계성 미흡 및 높은 상가 공실률',
      project: '항공 MRO 전문 청년 인재 양성을 위한 관내 고교-항공기업 채용연계 교육과정 모델링',
      practice: '인천공항공사 상생협력팀에 지역 청소년 항공실습 바우처 도입 제안',
    },
  },
  {
    id: 'dong-gu',
    name: '동구',
    hanja: '東區',
    regionType: '원도심·항만',
    color: 'from-orange-500 to-red-600',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    coordinates: { lat: 37.4739, lng: 126.6433 },
    population: 59300,
    youthRatio: 11.8,
    elderlyRatio: 25.1,
    envStats: {
      airQualityPm25: 22.8,
      parkAreaPerCapita: 6.2,
      wasteRecycleRate: 54.1,
      carbonEmissionPerCapita: 9.4,
      noiseLevel: 61,
    },
    welfareStats: {
      basicLivelihoodRate: 8.9,
      youthFacilityCount: 3,
      welfareBudgetRatio: 64.7,
      medicalDoctorCountPerThousand: 1.8,
      publicLibraryCount: 4,
    },
    demographicStats: {
      childRatio0to14: 9.2,
      workingAgeRatio15to64: 65.7,
      youthRatio19to34: 16.8,
      singleHouseholdRatio: 39.4,
      multiculturalResidentCount: 2900,
      fertilityRate: 0.58,
      migrationTrend: '청년층 일자리 부족으로 인한 순유출 지속 및 인천 최고령 도시화',
    },
    industryStats: {
      primaryIndustry: '기초 금속·철강 및 기계 부품 제조업 (현대제철·동국제강)',
      businessCount: 5800,
      workerCount: 29800,
      manufacturingRatio: 46.8,
      serviceRatio: 49.2,
      techBioRatio: 4.0,
      youthEmploymentRate: 41.2,
      keyIndustrialClusters: ['송현동 철강·기계 산업단지', '동인천역 북광장 상권', '배다리 문화예술 창작거리'],
      economicIssue: '노후 철강공장 주변 환경 민원과 공업단지 청년 취업 기피 현상',
    },
    keyIssues: [
      '인천 내 최고 수준의 초고령화율(25%)과 독거노인 돌봄 인프라 확충',
      '제조업·제철공장 밀집 지대의 대기질 개선 및 공원 녹지 확충 필요성',
      '배다리 헌책방거리 등 근대 인문 자산의 청년 창업 재생 모델 모색',
    ],
    fourPInquiryTip: {
      phenomenon: '동구 원도심 골목길의 빈집 증가와 1인 고령가구 고립 현상',
      problem: '청년층 일자리 및 정주 여건 미비로 인한 세대 간 공동화',
      project: '배다리 유휴공간을 활용한 세대 통합형 리빙랩(노인 말벗 & 청년 창작소) 설계',
      practice: '배다리 커뮤니티와 연계한 독거노인 방문 안부 확인 및 스토리 아카이빙',
    },
    demographic4PTip: {
      phenomenon: '원도심 초등학교 학급 수 감소와 노인복지관 이용자 수 역전 현상',
      problem: '아동 인구 비율(9%) 전국 최저 수준 진입으로 인한 교육 인프라 축소 악순환',
      project: '폐교 위기 학교 유휴교실을 노인·청소년 세대공감 방과후 사랑방으로 개조하는 공간 혁신안',
      practice: '동구 교육혁신지구 협의회에 세대 통합 방과후 프로그램 시범 제안서 제출',
    },
    industry4PTip: {
      phenomenon: '기계·금속 제조업 사업장의 청년 기술자 구인난과 은퇴 장인의 숙련기술 단절',
      problem: '제조업 3D 기피 인식과 원도심 뿌리산업 청년 유입 인센티브 부족',
      project: '동구 철강·장인 기술을 현대 메이커 스페이스와 결합한 청년 하드웨어 스타트업 인큐베이팅 계획',
      practice: '배다리 메이커 창작 페스티벌 개최 및 청년 장인 멘토링 프로그램 운영',
    },
  },
  {
    id: 'michuhol-gu',
    name: '미추홀구',
    hanja: '彌鄒忽區',
    regionType: '원도심·항만',
    color: 'from-blue-600 to-indigo-700',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    coordinates: { lat: 37.4636, lng: 126.6503 },
    population: 407500,
    youthRatio: 13.5,
    elderlyRatio: 19.4,
    envStats: {
      airQualityPm25: 20.1,
      parkAreaPerCapita: 7.9,
      wasteRecycleRate: 58.6,
      carbonEmissionPerCapita: 5.7,
      noiseLevel: 56,
    },
    welfareStats: {
      basicLivelihoodRate: 7.2,
      youthFacilityCount: 8,
      welfareBudgetRatio: 66.8,
      medicalDoctorCountPerThousand: 2.4,
      publicLibraryCount: 12,
    },
    demographicStats: {
      childRatio0to14: 10.8,
      workingAgeRatio15to64: 69.8,
      youthRatio19to34: 21.6,
      singleHouseholdRatio: 41.2,
      multiculturalResidentCount: 14200,
      fertilityRate: 0.63,
      migrationTrend: '재개발 정비구역 이주와 대학가(인하대) 주변 청년 1인 가구 밀집',
    },
    industryStats: {
      primaryIndustry: '대학 연계 R&D, 지식서비스 및 소상공인 골목상권 (인하대·수봉로)',
      businessCount: 31200,
      workerCount: 118400,
      manufacturingRatio: 17.5,
      serviceRatio: 78.1,
      techBioRatio: 4.4,
      youthEmploymentRate: 46.5,
      keyIndustrialClusters: ['인하대학교 산학협력단지', '주안국가산업단지(스마트제조)', '제물포역 스마트 모빌리티 혁신지구'],
      economicIssue: '원도심 전통시장(용현·신기시장) 온라인 경쟁력 약화 및 주거침체',
    },
    keyIssues: [
      '재개발·재건축 이주에 따른 주거 안정성 및 다세대·다가구 주거복지',
      '수봉산, 문학산 일원의 도시숲 생태축 연결과 생활권 쌈지공원 확충',
      '원도심 골목길 보행 안전(안심귀갓길) 및 스마트 가로등 정비',
    ],
    fourPInquiryTip: {
      phenomenon: '수봉공원 하부 주택가 노후 계단길의 보행 약자(노약자·장애인) 이동 단절',
      problem: '지형적 고저차와 경사로 리프트 및 벤치 쉼터 설치 공간 부족',
      project: 'GIS 경사도 분석을 접목한 유니버설 보행 쉼터 및 경사형 모빌리티 설치 경로 도출',
      practice: '미추홀구청 스마트도시과에 보행 약자 우선 배려 스마트쉼터 디자인 건의',
    },
    demographic4PTip: {
      phenomenon: '용현·학익동 원룸촌 청년 1인 가구의 쓰레기 분리배출 갈등과 고립감',
      problem: '1인 가구 맞춤형 공공 수거 체계 부재 및 이웃 간 커뮤니티 부재',
      project: '골목 공유 냉장고 및 모바일 동네 품앗이 앱을 통한 청년 1인가구 사회적 안전망 구축',
      practice: '인하대 대학로 상가번영회와 연계한 청년 안심밥상 나눔 프로젝트 운영',
    },
    industry4PTip: {
      phenomenon: '주안산단 노후 제조공장의 청년 기피와 청년 창업자의 저렴한 사무공간 수요',
      problem: '산업단지 업종 고착화와 도심형 지식산업센터 전환 속도 지체',
      project: '주안산단 유휴 공장을 청년 콘텐츠 제작 스튜디오 및 공유 오피스로 업사이클링하는 계획안',
      practice: '미추홀구 일자리창출위원회에 청년 창업 공간 지원 조례 제정 건의',
    },
  },
  {
    id: 'yeonsu-gu',
    name: '연수구',
    hanja: '延壽區',
    regionType: '경제자유구역·신도심',
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    coordinates: { lat: 37.4098, lng: 126.6783 },
    population: 395000,
    youthRatio: 17.8,
    elderlyRatio: 12.1,
    envStats: {
      airQualityPm25: 18.2,
      parkAreaPerCapita: 18.9,
      wasteRecycleRate: 64.2,
      carbonEmissionPerCapita: 5.4,
      noiseLevel: 51,
    },
    welfareStats: {
      basicLivelihoodRate: 3.6,
      youthFacilityCount: 11,
      welfareBudgetRatio: 51.9,
      medicalDoctorCountPerThousand: 3.8,
      publicLibraryCount: 16,
    },
    demographicStats: {
      childRatio0to14: 15.4,
      workingAgeRatio15to64: 72.5,
      youthRatio19to34: 21.9,
      singleHouseholdRatio: 28.5,
      multiculturalResidentCount: 16800,
      fertilityRate: 0.79,
      migrationTrend: '송도국제도시로의 고학력 연구원·다국적 가족 유입 및 함박마을 고려인 밀집',
    },
    industryStats: {
      primaryIndustry: '글로벌 바이오의약품 CDMO, AI 융합 및 첨단 신산업 (송도 바이오클러스터)',
      businessCount: 28400,
      workerCount: 142000,
      manufacturingRatio: 19.8,
      serviceRatio: 64.8,
      techBioRatio: 15.4,
      youthEmploymentRate: 52.4,
      keyIndustrialClusters: ['송도 바이오 밸리(삼성바이오·셀트리온·SK바이오)', '인천스타트업파크', '송도 글로벌캠퍼스 연구단지', '스마트시티 실증단지'],
      economicIssue: '바이오 대기업 중심 고용과 원도심(연수·청학동) 소상공인 간의 성장 온기 단절',
    },
    keyIssues: [
      '송도국제도시와 연수 원도심(청학·옥련동) 간 교육·정주 인프라 균형발전',
      '바이오클러스터 신재생에너지 자립률 제고 및 송도 갯벌 습지보호지역 보전',
      '스마트시티 사물인터넷(IoT) 센서 데이터를 활용한 기후위기 대응',
    ],
    fourPInquiryTip: {
      phenomenon: '송도 센트럴파크 인공수로의 수질 유지 비용과 미세조류 발생 관리',
      problem: '해수 유입 순환 시스템의 에너지 소비 및 기후변화에 따른 수온 상승 영향',
      project: '미생물 정화 및 태양광 수질 정화정(Eco-boat) 도입을 통한 수생태 순환 모델',
      practice: 'IFEZ에 친환경 수질관리 넛지 안내판 및 청소년 수질 모니터링단 활동 제안',
    },
    demographic4PTip: {
      phenomenon: '연수동 함박마을 내 고려인·외국인 청소년의 한국어 학업 적응 격차',
      problem: '다문화 밀집 지역 내 다국어 맞춤 공교육 프로그램 및 진로 멘토링 부족',
      project: '송도 국제학교 및 연수고 청소년이 함께하는 이중언어 멘토링 스쿨 플랫폼 구축',
      practice: '연수구 다문화가족지원센터에 청소년 주도 언어교환 동아리 개설',
    },
    industry4PTip: {
      phenomenon: '세계 1위 송도 바이오클러스터의 고도 성장 대비 인천 지역 청년 채용 체감도 부족',
      problem: '바이오 전문 연구직의 수도권 외지 인재 의존과 로컬 대학 바이오 실무 커리큘럼 미스매치',
      project: '인천 특화 바이오공정 인력양성센터와 연계한 고교-대학-기업 3단계 인턴십 트랙 연구',
      practice: '인천경제자유구역청에 지역 청소년 바이오 캠프 및 취업 멘토링 의무화 제안',
    },
  },
  {
    id: 'namdong-gu',
    name: '남동구',
    hanja: '南洞區',
    regionType: '산업·주거복합',
    color: 'from-cyan-600 to-blue-700',
    badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    coordinates: { lat: 37.4470, lng: 126.7314 },
    population: 508000,
    youthRatio: 14.6,
    elderlyRatio: 16.5,
    envStats: {
      airQualityPm25: 20.8,
      parkAreaPerCapita: 13.2,
      wasteRecycleRate: 61.5,
      carbonEmissionPerCapita: 7.2,
      noiseLevel: 57,
    },
    welfareStats: {
      basicLivelihoodRate: 5.9,
      youthFacilityCount: 9,
      welfareBudgetRatio: 61.2,
      medicalDoctorCountPerThousand: 2.9,
      publicLibraryCount: 14,
    },
    demographicStats: {
      childRatio0to14: 12.1,
      workingAgeRatio15to64: 71.4,
      youthRatio19to34: 21.2,
      singleHouseholdRatio: 33.8,
      multiculturalResidentCount: 13900,
      fertilityRate: 0.68,
      migrationTrend: '논현 신도시 안정적 정주와 구월·만수동 노후 아파트 베이비부머 은퇴층 집중',
    },
    industryStats: {
      primaryIndustry: '스마트제조·소재부품장비(소부장) 및 수산물 유통 (남동국가산단·소래포구)',
      businessCount: 42100,
      workerCount: 198000,
      manufacturingRatio: 38.6,
      serviceRatio: 57.2,
      techBioRatio: 4.2,
      youthEmploymentRate: 48.1,
      keyIndustrialClusters: ['남동국가산업단지(스마트그린산단)', '소래포구 국가어항 관광특구', '구월 행정·상업 복합타운'],
      economicIssue: '남동공단 제조업 디지털 전환(스마트팩토리) 비용 부담 및 근로자 고령화',
    },
    keyIssues: [
      '남동국가산업단지의 친환경 스마트그린산단 전환 및 미세먼지 차단숲 조성',
      '소래습지생태공원 국가도시공원 지정 추진과 멸종위기종 서식지 보존',
      '인천시청 주변 행정 중심지와 구월·만수동 노후 아파트단지 재생',
    ],
    fourPInquiryTip: {
      phenomenon: '소래습지생태공원의 해수 유입구 축소로 인한 염생식물 군락지 변화',
      problem: '주변 개발 압력과 갯골 육상화 진행으로 고유 염습지 생태계 교란',
      project: '염도 및 조석 주기 데이터 분석을 통한 친환경 갯골 통수 복원 시나리오',
      practice: '소래습지 걷기 생태 캠페인 카드뉴스 제작 및 교내 생물다양성 전시회 개최',
    },
    demographic4PTip: {
      phenomenon: '만수·구월동 대규모 아파트단지의 노인 회관 포화와 청소년 전용 공간 부족',
      problem: '고령자 복지 인프라 확충에 집중되어 청소년 문화·스터디 공간 공급 정체',
      project: '주민센터 유휴 옥상을 활용한 세대 공유형 스마트 도서관 및 옥상정원 설계',
      practice: '남동구 청소년참여위원회에 방과후 청소년 복합문화 쉼터 신설 조례안 제안',
    },
    industry4PTip: {
      phenomenon: '남동국가산단 내 입주기업의 자동화(로봇 도입)로 인한 단순 생산직 감소',
      problem: '전통 제조 공정의 디지털 스마트팩토리 전환 과정에서 청년 전문 기술 인력 부족',
      project: '남동산단 맞춤형 스마트팩토리 오퍼레이터 양성 마이스터 고교 교육과정 혁신안',
      practice: '한국산업단지공단 인천지역본부에 청년 스마트제조 인턴십 박람회 개최 건의',
    },
  },
  {
    id: 'bupyeong-gu',
    name: '부평구',
    hanja: '富平區',
    regionType: '산업·주거복합',
    color: 'from-violet-600 to-purple-700',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-200',
    coordinates: { lat: 37.5070, lng: 126.7219 },
    population: 489000,
    youthRatio: 14.2,
    elderlyRatio: 17.6,
    envStats: {
      airQualityPm25: 21.0,
      parkAreaPerCapita: 8.8,
      wasteRecycleRate: 59.1,
      carbonEmissionPerCapita: 5.9,
      noiseLevel: 59,
    },
    welfareStats: {
      basicLivelihoodRate: 6.4,
      youthFacilityCount: 10,
      welfareBudgetRatio: 67.5,
      medicalDoctorCountPerThousand: 2.5,
      publicLibraryCount: 15,
    },
    demographicStats: {
      childRatio0to14: 11.2,
      workingAgeRatio15to64: 71.2,
      youthRatio19to34: 22.8,
      singleHouseholdRatio: 35.4,
      multiculturalResidentCount: 15100,
      fertilityRate: 0.65,
      migrationTrend: '서울 1호선·7호선 출퇴근 청년 1인 가구 급증 및 재개발 신규 아파트 입주',
    },
    industryStats: {
      primaryIndustry: '자동차·기계제조 및 대규모 지하상가 유통·소상공인 (한국GM·부평모두몰)',
      businessCount: 39800,
      workerCount: 145000,
      manufacturingRatio: 26.4,
      serviceRatio: 70.8,
      techBioRatio: 2.8,
      youthEmploymentRate: 47.9,
      keyIndustrialClusters: ['한국GM 부평공장(전기차 전환)', '부평역 지하도상가(세계 최대 규모 기네스 등재)', '부평 문화의거리·테마거리', '청천·산곡 도시정비지구'],
      economicIssue: '한국GM 생산 라인 변동에 따른 협력업체 위기와 온라인 쇼핑 확산으로 인한 지하상가 공실',
    },
    keyIssues: [
      '캠프마켓 반환부지 오염정화 완료 및 시민 참여형 평화생태공원 조성',
      '부평역 지하상가(기네스북 등재)와 지상 상권 간의 보행 동선 및 쿨링존 구축',
      '굴포천 생태하천 복원과 도심 열섬 완화 효과 극대화',
    ],
    fourPInquiryTip: {
      phenomenon: '부평역 주변 고밀도 상업지역의 여름철 극한 폭염 및 도심 열섬 현상',
      problem: '아스팔트 피복률 과다와 바람길 차단으로 야간 열대야 체감도 심화',
      project: '캠프마켓 도시숲과 굴포천을 잇는 녹지 바람길 및 옥상 녹화 쿨링 모델링',
      practice: '부평구 쿨루프(Cool Roof) 시범 지원 조례 제정을 위한 학생 서명 운동',
    },
    demographic4PTip: {
      phenomenon: '부평역 북광장 및 문화의거리 청소년 흡연·음주 일탈과 안전 쉼터 부재',
      problem: '청소년 유동인구는 인천 최대이지만 야간 안전 귀가 및 건전 여가 거점 시설 부족',
      project: '부평 지하상가 유휴 점포를 활용한 24시 청소년 안전 충전소 및 진로 멘토링 라운지 모델',
      practice: '부평경찰서 청소년안전과와 협력하여 청소년 거리 안전 패트롤 활동 전개',
    },
    industry4PTip: {
      phenomenon: '부평역 지하상가(1,400개 점포)의 공실률 증가와 청년 방문객의 오프라인 이탈',
      problem: '온라인 e커머스 소비 트렌드 변화에 적응하지 못한 단편적 의류 매장 구성',
      project: '지하상가 공실을 청년 라이브커머스 스튜디오 및 로컬 크리에이터 팝업 스토어로 전환하는 상생 계획',
      practice: '부평모두몰 상인회와 협력하여 청년 로컬 크리에이터 페스타 기획',
    },
  },
  {
    id: 'gyeyang-gu',
    name: '계양구',
    hanja: '桂陽區',
    regionType: '원도심·항만',
    color: 'from-lime-600 to-green-700',
    badgeBg: 'bg-lime-100 text-lime-800 border-lime-200',
    coordinates: { lat: 37.5374, lng: 126.7378 },
    population: 291000,
    youthRatio: 14.9,
    elderlyRatio: 17.1,
    envStats: {
      airQualityPm25: 19.9,
      parkAreaPerCapita: 11.5,
      wasteRecycleRate: 60.3,
      carbonEmissionPerCapita: 5.1,
      noiseLevel: 53,
    },
    welfareStats: {
      basicLivelihoodRate: 5.7,
      youthFacilityCount: 6,
      welfareBudgetRatio: 63.4,
      medicalDoctorCountPerThousand: 2.1,
      publicLibraryCount: 9,
    },
    demographicStats: {
      childRatio0to14: 11.9,
      workingAgeRatio15to64: 71.0,
      youthRatio19to34: 21.8,
      singleHouseholdRatio: 31.9,
      multiculturalResidentCount: 7800,
      fertilityRate: 0.67,
      migrationTrend: '계양테크노밸리(3기 신도시) 보상 및 개발에 따른 인구 재편 기대',
    },
    industryStats: {
      primaryIndustry: '첨단 ICT·스마트 모빌리티(계양테크노밸리) 및 베드타운 소비상권',
      businessCount: 21500,
      workerCount: 74000,
      manufacturingRatio: 21.2,
      serviceRatio: 74.5,
      techBioRatio: 4.3,
      youthEmploymentRate: 46.8,
      keyIndustrialClusters: ['계양테크노밸리(3기 신도시 첨단산단)', '서운일반산업단지', '작전역·계산역 도심 상권', '아라뱃길 계양아라온'],
      economicIssue: '서울 출퇴근 베드타운형 도시 구조와 자체 양질의 청년 첨단 일자리 부족',
    },
    keyIssues: [
      '계양산(인천 최고봉) 산림 생태계 보전과 탐방로 훼손 방지 대책',
      '계양테크노밸리(3기 신도시) 첨단산업 유치와 탄소중립 스마트 인프라',
      '원도심(작전·효성동)의 청년 문화 거점 부족 해소',
    ],
    fourPInquiryTip: {
      phenomenon: '주말 계양산 등산객 급증에 따른 주 탐방로 토양 유실과 샛길 훼손',
      problem: '생태 수용력을 초과한 탐방객 집중과 복원 휴식년제 안내 체계 미흡',
      project: '등산로 센싱 데이터를 바탕으로 한 탐방객 분산 유도 스마트 에코 앱 설계',
      practice: '계양산 둘레길 생태지도 리플릿 제작 및 배낭 쓰레기 수거 챌린지 운영',
    },
    demographic4PTip: {
      phenomenon: '계양구 청년층의 서울·경기 일자리 통근에 따른 극심한 출퇴근 피로와 정주 의식 약화',
      problem: '관내 양질의 고임금 지식산업 일자리 결여로 자족도시 기능 미흡',
      project: '계양테크노밸리 청년 창업 주택과 스마트워크센터를 결합한 직주근접 모델링',
      practice: '계양구 청년정책네트워크에 청년 주거-일자리 원스톱 지원 조례 제안',
    },
    industry4PTip: {
      phenomenon: '계양테크노밸리 산업단지의 대기업 유치 경쟁과 기존 중소 제조단지의 소외 우려',
      problem: '단순 조립 제조단지와 3기 신도시 첨단 R&D 산업 간의 기술 연계 고리 부재',
      project: '서운산단 제조업체와 계양테크노밸리 AI 스타트업 간의 스마트 제조 혁신 연계 플랫폼 설계',
      practice: '계양구 산업지원과에 로컬 산학관 혁신 협의체 구성 건의서 제출',
    },
  },
  {
    id: 'seo-gu',
    name: '서구',
    hanja: '西區',
    regionType: '경제자유구역·신도심',
    color: 'from-teal-600 to-emerald-700',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
    coordinates: { lat: 37.5454, lng: 126.6760 },
    population: 624000,
    youthRatio: 18.5,
    elderlyRatio: 12.4,
    envStats: {
      airQualityPm25: 21.9,
      parkAreaPerCapita: 16.5,
      wasteRecycleRate: 62.8,
      carbonEmissionPerCapita: 9.8,
      noiseLevel: 55,
    },
    welfareStats: {
      basicLivelihoodRate: 4.8,
      youthFacilityCount: 14,
      welfareBudgetRatio: 56.7,
      medicalDoctorCountPerThousand: 2.7,
      publicLibraryCount: 18,
    },
    demographicStats: {
      childRatio0to14: 16.2,
      workingAgeRatio15to64: 71.4,
      youthRatio19to34: 22.5,
      singleHouseholdRatio: 30.2,
      multiculturalResidentCount: 18900,
      fertilityRate: 0.84,
      migrationTrend: '청라국제도시·검단신도시 입주로 인천 10개 군·구 중 인구 1위(62만) 돌파 및 출산율 최고',
    },
    industryStats: {
      primaryIndustry: '금융·디지털, 로봇·수소 신에너지 및 친환경 자원순환 (청라·드림파크)',
      businessCount: 46200,
      workerCount: 185000,
      manufacturingRatio: 28.5,
      serviceRatio: 64.2,
      techBioRatio: 7.3,
      youthEmploymentRate: 51.2,
      keyIndustrialClusters: ['하나금융글로벌캠퍼스(금융)', '청라 로봇랜드·스마트모빌리티', '수도권매립지 환경산업연구단지', '인천서부일반산업단지'],
      economicIssue: '급격한 인구 증가에 따른 교통망(서울7호선 청라연장·공항철도 직결) 확충 및 자족기능 강화',
    },
    keyIssues: [
      '수도권매립지 사용 종료 및 자원순환 복합 클러스터(드림파크) 전환 과제',
      '청라·검단 신도시 급증 인구에 따른 과밀학급 해소 및 아동·청소년 복지관 확충',
      '공촌천·심곡천 등 도심 하천의 생태 복원과 수변 커뮤니티 활성화',
    ],
    fourPInquiryTip: {
      phenomenon: '수도권매립지 드림파크 야생화단지의 생태적 복원 성공과 일회용 폐기물 증가의 역설',
      problem: '도시민의 폐기물 발생 억제 유인 부족과 매립 후 토양 메탄가스 관리 과제',
      project: '드림파크 자원순환 견학과 연계한 학교 급식 음식물 쓰레기 제로 챌린지 평가',
      practice: '서구 자원순환센터와 협력하여 교내 플라스틱 분리배출 벤치마킹 보고서 발간',
    },
    demographic4PTip: {
      phenomenon: '검단·청라 신도시 신설 초·중학교의 과밀학급과 원도심(가좌·석남동) 폐교 우려 격차',
      problem: '도시 확장에 따른 동서 간 인구 불균형 및 학군 배정 불만 고조',
      project: '원도심 특성화 방과후 거점센터와 신도시 학교 간의 순환 교육버스 협력 네트워크 설계',
      practice: '인천서부교육지원청에 과밀학급 해소를 위한 모듈러 교실 및 공동학구제 확대 건의',
    },
    industry4PTip: {
      phenomenon: '청라 로봇랜드 및 하나금융타운 입주에 따른 첨단 지식서비스 직군 유입',
      problem: '금융·로봇 첨단 지식산업과 서구 관내 일반 청소년 취업 역량 간의 진입장벽',
      project: '서구 특화 로봇 코딩 및 핀테크 청소년 아카데미를 연계한 고교 진로 맞춤 트랙 모델링',
      practice: '청라 로봇랜드 입주기업협의회에 지역 학생 대상 연간 오픈랩 멘토링 프로그램 제안',
    },
  },
  {
    id: 'ganghwa-gun',
    name: '강화군',
    hanja: '江華郡',
    regionType: '도서·생태지역',
    color: 'from-amber-600 to-stone-700',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    coordinates: { lat: 37.7462, lng: 126.4878 },
    population: 69800,
    youthRatio: 8.9,
    elderlyRatio: 36.4,
    envStats: {
      airQualityPm25: 16.8,
      parkAreaPerCapita: 28.5,
      wasteRecycleRate: 51.2,
      carbonEmissionPerCapita: 6.2,
      noiseLevel: 42,
    },
    welfareStats: {
      basicLivelihoodRate: 7.9,
      youthFacilityCount: 2,
      welfareBudgetRatio: 48.3,
      medicalDoctorCountPerThousand: 1.4,
      publicLibraryCount: 3,
    },
    demographicStats: {
      childRatio0to14: 6.8,
      workingAgeRatio15to64: 56.8,
      youthRatio19to34: 12.4,
      singleHouseholdRatio: 38.2,
      multiculturalResidentCount: 2400,
      fertilityRate: 0.91,
      migrationTrend: '초고령사회(고령화율 36.4%) 심화 및 은퇴자 귀농·귀촌 인구 소폭 유입',
    },
    industryStats: {
      primaryIndustry: '친환경 농어업(강화섬쌀·인삼·순무) 및 역사생태 관광·에코투어',
      businessCount: 7400,
      workerCount: 24500,
      manufacturingRatio: 9.2,
      serviceRatio: 68.4,
      techBioRatio: 1.2,
      youthEmploymentRate: 43.5,
      keyIndustrialClusters: ['강화일반산업단지', '강화 풍물시장 전통상권', '초지진·광성보 역사문화벨트', '강화남단 갯벌 생태어촌'],
      economicIssue: '농어촌 고령화에 따른 일손 부족, 1차 농수산물의 단순 유통 한계 및 관광 비수기 침체',
    },
    keyIssues: [
      '초고령사회(고령화율 36.4%) 심화에 따른 농어촌 방문 돌봄 및 원격의료 수요',
      '세계 5대 갯벌(여차리·초지진 등)과 철새 도래지 생태계의 절대 보존',
      '지붕 없는 박물관이라 불리는 호국 역사문화재의 디지털 헤리티지 구축',
    ],
    fourPInquiryTip: {
      phenomenon: '강화 남단 갯벌의 저어새 번식지 위협과 해안 쓰레기 플라스틱 침적',
      problem: '해류를 타고 유입되는 해양 폐기물과 인근 어선 폐어구 수거 인력 부족',
      project: '드론 영상 분석 기반 해안선 해양쓰레기 집적 지도 구축 및 수거 우선순위 산출',
      practice: '강화도 생태 지킴이 청소년 원정대 비치코밍(Beachcombing) 및 업사이클 전시',
    },
    demographic4PTip: {
      phenomenon: '강화군 면 단위 마을의 만 65세 이상 주민 비율 45% 초과 및 병의원 이동 곤란',
      problem: '농어촌 공공 대중교통 배차 간격(1~2시간) 과다 및 필수 진료과 전문의 부족',
      project: '수요응답형(DRT) 행복택시와 IoT 스마트 복약안내기를 결합한 농어촌 맞춤 원격돌봄 시나리오',
      practice: '강화군 보건소에 청소년 봉사단과 함께하는 찾아가는 스마트 건강검진 셔틀 제안',
    },
    industry4PTip: {
      phenomenon: '강화섬쌀 및 순무 등 명품 농산물의 헐값 수매와 청년 청년농업인 유입 정체',
      problem: '농업의 1차 생산 편중과 MZ세대 소비 트렌드를 겨냥한 6차 산업 융복합 브랜드 부재',
      project: '강화 로컬 농산물을 활용한 웰니스 비건 베이커리 및 농촌 체류형 워케이션 패키지 기획',
      practice: '강화군 농업기술센터에 청년 로컬 크리에이터 6차산업 창업 펀드 조성 건의',
    },
  },
  {
    id: 'ongjin-gun',
    name: '옹진군',
    hanja: '甕津郡',
    regionType: '도서·생태지역',
    color: 'from-sky-600 to-indigo-800',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    coordinates: { lat: 37.4665, lng: 126.6366 },
    population: 20600,
    youthRatio: 7.4,
    elderlyRatio: 31.8,
    envStats: {
      airQualityPm25: 15.2,
      parkAreaPerCapita: 35.2,
      wasteRecycleRate: 46.5,
      carbonEmissionPerCapita: 7.8,
      noiseLevel: 39,
    },
    welfareStats: {
      basicLivelihoodRate: 6.9,
      youthFacilityCount: 1,
      welfareBudgetRatio: 44.5,
      medicalDoctorCountPerThousand: 1.1,
      publicLibraryCount: 2,
    },
    demographicStats: {
      childRatio0to14: 6.2,
      workingAgeRatio15to64: 62.0,
      youthRatio19to34: 14.8,
      singleHouseholdRatio: 44.5,
      multiculturalResidentCount: 950,
      fertilityRate: 0.98,
      migrationTrend: '서해5도 안보·도서 특수성으로 군인·어업 종사자 중심 정주 및 학생층 극소',
    },
    industryStats: {
      primaryIndustry: '연안 어업(꽃게·까나리·다시마) 및 해양 평화·안보 관광',
      businessCount: 2600,
      workerCount: 8900,
      manufacturingRatio: 3.5,
      serviceRatio: 72.8,
      techBioRatio: 0.8,
      youthEmploymentRate: 45.0,
      keyIndustrialClusters: ['연평·대청 꽃게 산지 유통 거점', '백령도 두무진 국가해양지질공원', '덕적·자월 도서 힐링 관광지'],
      economicIssue: '해상 여객선 결항 시 수산물 출하 지연 및 도서 해상 물류비용 부담',
    },
    keyIssues: [
      '백령·대청·연평 등 서해 5도 도서지역의 해상 교통 단절과 응급의료 골든타임',
      '육지에서 떠내려오는 해양 부유 쓰레기 처리 비용과 섬 쓰레기 자체 소각 한계',
      '청정 섬 생태계와 옹진 평화안보 관광의 지속가능한 상생 전략',
    ],
    fourPInquiryTip: {
      phenomenon: '기상 악화 시 도서 주민들의 약품·식료품 공급 지연과 만성질환 관리 곤란',
      problem: '해상 여객선 결항 시 대체 운송 수단 부재 및 섬 보건지소 전문의 부족',
      project: '도서지역 긴급 응급구호 드론 배송 시스템의 기상 조건별 운용 시뮬레이션',
      practice: '옹진군 도서 응급의료체계 개선을 위한 인천시 청소년 모의의회 조례안 발의',
    },
    demographic4PTip: {
      phenomenon: '섬 지역 분교의 지속적 폐교와 도서 학생들의 중·고교 진학 시 육지 강제 유학',
      problem: '도서 지역 거주 가정의 교육비 이중 부담 및 부모-자녀 분리로 인한 가족 해체 위험',
      project: '메타버스 가상 교실과 AI 1:1 튜터를 접목한 서해5도 도서 디지털 스마트스쿨 모델링',
      practice: '인천광역시교육청에 섬마을 디지털 교육 바우처 및 육지 기숙사비 전액 지원 청원',
    },
    industry4PTip: {
      phenomenon: '서해5도 어획물(꽃게 등)의 해상 운송 제한에 따른 산지 가격 폭락과 유통 손실',
      problem: '섬 내 저온 저장 및 가공 시설 부족으로 단순 원물 급매 처분에 의존',
      project: '도서 태양광 신재생에너지를 활용한 친환경 수산물 콜드체인 동결 건조 가공 클러스터 타당성 분석',
      practice: '인천시 해양항공국에 옹진 섬 수산물 공공 직거래 밀키트 브랜드 육성안 건의',
    },
  },
];

export interface AirStationInfo {
  station: string;
  district: string;
  districtName: string;
  description: string;
}

export const INCHEON_AIR_STATIONS: AirStationInfo[] = [
  { station: '송도', district: 'yeonsu-gu', districtName: '연수구', description: '송도국제도시 경제자유구역 바이오밸리 연접' },
  { station: '동춘', district: 'yeonsu-gu', districtName: '연수구', description: '연수구 동춘동 주거밀집지 및 승기천 인접' },
  { station: '신흥동', district: 'jung-gu', districtName: '중구', description: '인천내항 및 서해안 물류 트럭 항만 통행로' },
  { station: '영종', district: 'jung-gu', districtName: '중구', description: '영종하늘도시 및 인천국제공항 인근 대기질' },
  { station: '숭의동', district: 'michuhol-gu', districtName: '미추홀구', description: '수봉공원 및 미추홀 원도심 주거 중심' },
  { station: '주안', district: 'michuhol-gu', districtName: '미추홀구', description: '경인선 주안역 상업지구 및 주안국가산단 인근' },
  { station: '송림동', district: 'dong-gu', districtName: '동구', description: '현대제철, 두산인프라코어 등 철강·기계 중공업 인접' },
  { station: '구월동', district: 'namdong-gu', districtName: '남동구', description: '인천시청 및 로데오 상업 중심지구' },
  { station: '논현', district: 'namdong-gu', districtName: '남동구', description: '소래포구 해안 연접 논현 신주거단지' },
  { station: '고잔', district: 'namdong-gu', districtName: '남동구', description: '남동국가산업단지 정밀화학·금속제조 복합구역' },
  { station: '부평', district: 'bupyeong-gu', districtName: '부평구', description: '부평역 지하상가 및 한국GM 부평공장 인근' },
  { station: '삼산', district: 'bupyeong-gu', districtName: '부평구', description: '부평 삼산동 대규모 주거단지 및 굴포천 인접' },
  { station: '계산동', district: 'gyeyang-gu', districtName: '계양구', description: '계양산 남단 및 계양구청 행정타운' },
  { station: '작전동', district: 'gyeyang-gu', districtName: '계양구', description: '경인고속도로 부평IC 및 서운일반산단 연접' },
  { station: '청라', district: 'seo-gu', districtName: '서구', description: '청라국제도시 커낼웨이 및 호수공원 인접' },
  { station: '석남', district: 'seo-gu', districtName: '서구', description: '경인고속도로 및 석남동 목재·화학 공업지역' },
  { station: '원당', district: 'seo-gu', districtName: '서구', description: '검단신도시 중앙 주거단지 및 아라뱃길 북단' },
  { station: '강화', district: 'ganghwa-gun', districtName: '강화군', description: '강화읍 역사문화지구 및 남산대공원' },
  { station: '길상', district: 'ganghwa-gun', districtName: '강화군', description: '강화도 남단 마니산 및 동검도 연안 생태지대' },
  { station: '백령도', district: 'ongjin-gun', districtName: '옹진군', description: '서해 최북단 청정 도서 및 국가해양지질공원' },
  { station: '영흥도', district: 'ongjin-gun', districtName: '옹진군', description: '영흥화력발전소 인접 해양 도서 측정망' },
];

