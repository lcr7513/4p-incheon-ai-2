export interface GovDatasetItem {
  id: string;
  category: '대기·환경' | '인구·청년' | '산업·경제' | '항만·물류·항공' | '교통·이동' | '복지·안전·생태';
  categoryBadge: string;
  categoryColor: string;
  title: string;
  subtitle: string;
  agency: string;
  description: string;
  dataGoKrUrl: string;
  apiEndpoint: string;
  sampleDatasetCode: string;
  requiresKey: boolean;
  sampleFields: string[];
  keyMetricLabel: string;
  fourPResearchFocus: string;
  sample4PCitation: (params: { district: string; detail?: string }) => string;
  generateMockData: (params: { district: string; detail?: string }) => any;
}

export const INCHEON_GOV_CATEGORIES: {
  id: GovDatasetItem['category'];
  label: string;
  iconName: string;
  count: number;
  description: string;
}[] = [
  {
    id: '대기·환경',
    label: '대기·환경 (Air & Eco)',
    iconName: 'Wind',
    count: 3,
    description: '한국환경공단 에어코리아, 연안 해양 쓰레기·블루카본, 영흥화력·해상풍력 친환경 전환',
  },
  {
    id: '인구·청년',
    label: '인구·청년 (Demographics)',
    iconName: 'Users',
    count: 5,
    description: '10개 군·구별 연령구조, 청년 순유출입, 1인가구, 다문화, 학교알리미 도서·디지털 인프라',
  },
  {
    id: '산업·경제',
    label: '산업·경제 (Economy & Jobs)',
    iconName: 'Factory',
    count: 5,
    description: '소상공인 상권·인천e음 결제, 제조·서비스업, 바이오 클러스터, 스마트산단 가동률',
  },
  {
    id: '항만·물류·항공',
    label: '항만·물류·항공 (Port & Airport)',
    iconName: 'Anchor',
    count: 4,
    description: '인천항 컨테이너 TEU, 연안여객선 운항, 인천공항 항공물류, 1·8부두 개방',
  },
  {
    id: '교통·이동',
    label: '교통·이동 (Mobility)',
    iconName: 'Train',
    count: 5,
    description: '도로교통공단 TAAS 스쿨존·안심귀갓길 CCTV, 도시철도 혼잡도, 광역버스, 전기차 충전',
  },
  {
    id: '복지·안전·생태',
    label: '복지·안전·생태 (Safety & Bio)',
    iconName: 'ShieldAlert',
    count: 5,
    description: '질병관리청 청소년 건강·응급의료, 스쿨존 교통사고, 강화·송도 갯벌 생태, 공공도서관, 에너지바우처',
  },
];

export const INCHEON_20_GOV_DATASETS: GovDatasetItem[] = [
  // -------------------------------------------------------------
  // [대기·환경] - 기존 에어코리아 실습 연동
  // -------------------------------------------------------------
  {
    id: 'airkorea-live',
    category: '대기·환경',
    categoryBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    categoryColor: 'emerald',
    title: '한국환경공단 에어코리아 실시간 대기오염정보',
    subtitle: '인천 21개 측정소별 초미세먼지(PM2.5)·통합대기(KHAI) 실시간 수치',
    agency: '환경부 / 한국환경공단',
    description: '인천 10개 군·구 21개 국가/지자체 측정소에서 1시간마다 자동 전송되는 미세먼지, 초미세먼지, 오존, 이산화질소 등 대기질 실시간 관측값입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15073861/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty',
    sampleDatasetCode: 'ArpltnInforInqireSvc',
    requiresKey: true,
    sampleFields: ['pm25Value', 'pm10Value', 'khaiValue', 'khaiGrade', 'o3Value', 'no2Value'],
    keyMetricLabel: '초미세먼지(PM2.5) 농도 & 통합대기등급',
    fourPResearchFocus: '산업단지·항만 인접 주거지역의 대기질 편차 원인 분석 및 스마트 미세먼지 차단숲·통학로 개선 과업',
    sample4PCitation: ({ district }) =>
      `[공공데이터포털 한국환경공단 에어코리아 실시간 관측 검증] 인천 ${district} 권역 측정소 기준 초미세먼지(PM2.5) 및 통합대기환경지수(KHAI) 정부 공인 데이터를 4P 연구 현상(P1)과 환경 취약성(P2)의 객관적 증빙 근거로 인용함.`,
    generateMockData: ({ district }) => {
      const pm25 = district.includes('중구') ? 27 : district.includes('연수') ? 16 : district.includes('서구') ? 25 : 21;
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              dataTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
              stationName: `${district} 대표측정소`,
              pm25Value: String(pm25),
              pm10Value: String(Math.round(pm25 * 1.8)),
              khaiValue: String(pm25 * 3),
              khaiGrade: pm25 <= 15 ? '1' : pm25 <= 35 ? '2' : '3',
              o3Value: '0.028',
              no2Value: '0.021',
              so2Value: '0.003',
            },
          ],
          totalCount: 1,
        },
      };
    },
  },

  // -------------------------------------------------------------
  // [인구·청년] 4종
  // -------------------------------------------------------------
  {
    id: 'kosis-population-age',
    category: '인구·청년',
    categoryBadge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    categoryColor: 'indigo',
    title: '1. 인천 군·구별 주민등록인구 및 5세별 연령구조',
    subtitle: '유소년(0~14세) 및 초고령층(65세 이상) 인구 피라미드 변화',
    agency: '통계청 KOSIS / 행정안전부',
    description: '인천 10개 군·구의 행정동별 주민등록인구수, 남녀 성비, 유소년(0~14세)과 65세 이상 고령자 인구 비율을 통해 도시 고령화 속도와 학령인구 감소를 진단합니다.',
    dataGoKrUrl: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1B040A3',
    apiEndpoint: 'https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&tblId=DT_1B040A3',
    sampleDatasetCode: 'DT_1B040A3_POP_AGE',
    requiresKey: true,
    sampleFields: ['district', 'totalPop', 'youth0to14', 'workingAge15to64', 'elderly65Plus', 'agingIndex'],
    keyMetricLabel: '고령화 지수 & 학령 유소년 비율',
    fourPResearchFocus: '원도심(동구·미추홀구)의 급격한 고령화와 신도심(송도·청라·검단)의 과밀학급 현상 간 교육·돌봄 격차 규명',
    sample4PCitation: ({ district }) =>
      `[통계청 KOSIS 인구통계 검증] 인천 ${district} 주민등록인구 및 연령별 인구구조 지표를 바탕으로, 고령인구 대비 유소년 학령인구 급감 현상(고령화지수 상승)을 4P 연구(P1 현상 관찰)의 공식 통계적 근거로 명시함.`,
    generateMockData: ({ district }) => {
      const isNewTown = district.includes('연수') || district.includes('서구');
      const total = isNewTown ? 418000 : 210000;
      const elderly = isNewTown ? 12.4 : 23.8;
      const youth = isNewTown ? 17.6 : 8.9;
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              totalPopulation: total,
              youthRatio0to14: `${youth}%`,
              workingRatio15to64: `${(100 - youth - elderly).toFixed(1)}%`,
              elderlyRatio65Plus: `${elderly}%`,
              agingIndex: ((elderly / youth) * 100).toFixed(1),
              medianAge: isNewTown ? 40.2 : 49.8,
              surveyYear: '2024-2025',
            },
          ],
        },
      };
    },
  },
  {
    id: 'youth-migration',
    category: '인구·청년',
    categoryBadge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    categoryColor: 'indigo',
    title: '2. 인천 군·구별 청년(만 19~34세) 순이동 및 전입·전출 사유',
    subtitle: '일자리·주거·교육 목적의 수도권 내 청년 인구 이동 흐름',
    agency: '통계청 국내인구이동통계',
    description: '인천 10개 군·구와 서울·경기 간 만 19~34세 청년층의 순유입 및 순유출 규모와 주요 사유(직업 43%, 주택 32%, 교육 12%)를 분석하는 공식 데이터입니다.',
    dataGoKrUrl: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1B26001_A01',
    apiEndpoint: 'https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&tblId=DT_1B26001_A01',
    sampleDatasetCode: 'KOSIS_YOUTH_MIGRATION',
    requiresKey: true,
    sampleFields: ['district', 'netMigration', 'jobReasonRate', 'housingReasonRate', 'eduReasonRate', 'majorDestination'],
    keyMetricLabel: '청년 순이동(Net Migration) 및 전출 사유 1위',
    fourPResearchFocus: '인천 청년 인재의 서울·판교 유출 원인 분석 및 지역 첨단산업(바이오·항공) 연계형 청년 로컬 정주 지원 프로젝트',
    sample4PCitation: ({ district }) =>
      `[통계청 국내인구이동통계] 인천 ${district} 청년(19~34세) 순이동 및 사유별 전출입 통계에 따르면 일자리 및 주거 인프라 격차로 인한 유출입 편차가 뚜렷하여, 이를 4P 문제(P2 원인)의 실증 데이터로 활용함.`,
    generateMockData: ({ district }) => {
      const isSongdo = district.includes('연수');
      const isSeogu = district.includes('서구');
      const net = isSongdo ? 3420 : isSeogu ? 4890 : -1420;
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              ageGroup: '만 19~34세 청년',
              netYouthMigration: net,
              status: net > 0 ? '청년 순유입 권역' : '청년 순유출 권역',
              reasonBreakdown: {
                job: '42.8% (직업/취업)',
                housing: '33.1% (주택/임대료)',
                family: '14.2% (가족 동거)',
                education: '7.9% (진학/학업)',
              },
              topOutflowCity: '서울특별시 강남·영등포구 / 경기도 성남 판교',
            },
          ],
        },
      };
    },
  },
  {
    id: 'single-household',
    category: '인구·청년',
    categoryBadge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    categoryColor: 'indigo',
    title: '3. 인천시 1인 가구 및 청년·독거노인 단독가구 비율',
    subtitle: '군·구별 1인가구 밀집도 및 고립·안독사 예방 취약지표',
    agency: '인천광역시 / 통계청 인구총조사',
    description: '인천 전체 가구의 33%를 넘어선 1인 가구의 연령별 분포(청년 1인가구 vs 고령 1인가구) 및 주거 형태(원룸, 다세대, 오피스텔) 통계입니다.',
    dataGoKrUrl: 'https://data.incheon.go.kr/openInfo/openData.do',
    apiEndpoint: 'https://data.incheon.go.kr/openInfo/openDataApi.do?act=apiDetail&datasetSeq=INCH_SINGLE_2024',
    sampleDatasetCode: 'INCHEON_SINGLE_HOUSEHOLD',
    requiresKey: true,
    sampleFields: ['district', 'singleHouseholdRatio', 'youthSingleRate', 'elderlySingleRate', 'safetyNeedIndex'],
    keyMetricLabel: '1인 가구 비율 & 고립 예방 복지 지표',
    fourPResearchFocus: '부평·남동 원도심 청년 1인가구의 식생활·마음건강 문제와 도서·원도심 독거노인의 사회적 돌봄망 안전 시스템 설계',
    sample4PCitation: ({ district }) =>
      `[인천광역시 가구구조 통계] 인천 ${district} 1인 가구 비율과 세대별 단독가구 분포 실태를 4P 탐구(P1 현상 관찰 / P3 과업 기획)의 직접 근거로 제시함.`,
    generateMockData: ({ district }) => {
      const ratio = district.includes('부평') || district.includes('미추홀') ? 39.4 : 31.8;
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              singleHouseholdRatio: `${ratio}%`,
              totalSingleHouseholds: Math.round(ratio * 820),
              dominantAgeCategory: district.includes('미추홀') ? '20대 대학생 및 청년 1인가구 다수' : '65세 이상 독거노인 단독가구 비중 높음',
              housingTypeDistribution: '다가구·다세대(48.2%), 오피스텔(29.1%), 아파트(22.7%)',
              socialIsolationRiskScore: ratio > 35 ? '주의(High Risk)' : '보통(Medium)',
            },
          ],
        },
      };
    },
  },
  {
    id: 'multicultural-incheon',
    category: '인구·청년',
    categoryBadge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    categoryColor: 'indigo',
    title: '4. 인천 다문화가정 및 외국인 주민 현황',
    subtitle: '중구·연수구(함박마을)·부평구 외국인 근로자 및 다문화 학생 분포',
    agency: '행정안전부 / 인천시교육청',
    description: '인천에 거주하는 외국인 주민(고려인, 유학생, 산업단지 근로자)과 관내 초·중·고 다문화 학생 현황 및 한국어학급(KSL) 수요 통계입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15082490/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/1741000/ForeignResidentStatus/getForeignResidentList',
    sampleDatasetCode: 'MULTICULTURAL_INCHEON_KSL',
    requiresKey: true,
    sampleFields: ['district', 'foreignResidents', 'kslStudents', 'primaryNationalities', 'multiculturalRatio'],
    keyMetricLabel: '외국인 주민 수 & 다문화 학생 비중',
    fourPResearchFocus: '연수구 함박마을 고려인 밀집지 및 중구 개항장 외국인 주민을 위한 상호문화 이해 및 다국어 AI 교육 키오스크 개발',
    sample4PCitation: ({ district }) =>
      `[행정안전부 외국인주민현황] 인천 ${district} 관내 다문화가정 및 외국인 주민 등록 데이터에 근거하여, 글로벌 다문화 융합 사회의 현상(P1)과 언어·문화 소통 과업(P3)을 도출함.`,
    generateMockData: ({ district }) => {
      const isYeonsu = district.includes('연수');
      const isJunggu = district.includes('중구');
      const count = isYeonsu ? 28500 : isJunggu ? 8900 : 12400;
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              foreignResidentsCount: count,
              ratioToTotalPop: isYeonsu ? '7.1%' : '4.8%',
              studentCountInKSL: isYeonsu ? 1420 : 380,
              majorHeritage: isYeonsu ? '중앙아시아(고려인 등), 중국, 베트남' : '중국, 베트남, 우즈베키스탄',
              specialZone: isYeonsu ? '연수1동 함박마을 고려인 집단거주지역' : '차이나타운 및 영종국제도시 복합',
            },
          ],
        },
      };
    },
  },

  // -------------------------------------------------------------
  // [산업·경제] 4종
  // -------------------------------------------------------------
  {
    id: 'industry-jobs-biz',
    category: '산업·경제',
    categoryBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    categoryColor: 'emerald',
    title: '5. 통계청 전국사업체조사: 제조업 vs 서비스업 종사자',
    subtitle: '군·구별 1·2·3차 산업구조 및 청년 고용률 비교',
    agency: '통계청 / 산업통상자원부',
    description: '남동구·부평구의 전통 제조 뿌리산업과 연수구 송도의 바이오·IT 지식기반 서비스업 종사자 비율, 사업체 규모별 고용 현황을 정밀 대조합니다.',
    dataGoKrUrl: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1K52A01',
    apiEndpoint: 'https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&tblId=DT_1K52A01',
    sampleDatasetCode: 'DT_1K52A01_INCHEON_BIZ',
    requiresKey: true,
    sampleFields: ['district', 'bizCount', 'workerCount', 'manufacturingRatio', 'serviceRatio', 'rndRatio'],
    keyMetricLabel: '제조업 vs 서비스업 종사자 비중',
    fourPResearchFocus: '인천 제조업 노후화와 지식서비스 산업 간의 고용 미스매치 문제 원인(P2) 규명 및 지역 맞춤형 직업교육 프로젝트',
    sample4PCitation: ({ district }) =>
      `[통계청 전국사업체조사] 인천 ${district} 산업별 사업체수 및 제조업·서비스업 종사자 통계를 바탕으로 산업구조 전환 과정의 일자리 현상(P1)을 학술적으로 증빙함.`,
    generateMockData: ({ district }) => {
      const isNamdong = district.includes('남동');
      const isSongdo = district.includes('연수');
      const mfg = isNamdong ? 39.8 : isSongdo ? 8.4 : 21.2;
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              totalBusinesses: isNamdong ? 61200 : 34800,
              totalWorkers: isNamdong ? 258000 : 162000,
              manufacturingWorkerRatio: `${mfg}%`,
              serviceWorkerRatio: `${(85 - mfg).toFixed(1)}%`,
              highTechBioRatio: isSongdo ? '28.4%' : '3.1%',
              youthEmploymentRate: '48.2%',
            },
          ],
        },
      };
    },
  },
  {
    id: 'incheon-eeum-sales',
    category: '산업·경제',
    categoryBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    categoryColor: 'emerald',
    title: '6. 인천e음(인천사랑상품권) 군·구별 결제액 및 골목상권',
    subtitle: '소상공인 가맹점 업종별 소비 트렌드 및 역외소비 차단 효과',
    agency: '인천광역시 소상공인정책과',
    description: '전국 최대 규모 지역화폐인 인천e음 카드의 10개 군·구별 결제액, 요식업·학원·동네마트 등 골목상권 캐시백 소비 순환 데이터입니다.',
    dataGoKrUrl: 'https://data.incheon.go.kr/openInfo/openData.do',
    apiEndpoint: 'https://data.incheon.go.kr/openInfo/openDataApi.do?dataset=INCHEON_EEUM_MONTHLY_2025',
    sampleDatasetCode: 'INCHEON_EEUM_SALES_OPEN',
    requiresKey: true,
    sampleFields: ['district', 'monthlyPaymentKRW', 'topCategory', 'localShopRetentionRate', 'cashbackIssued'],
    keyMetricLabel: '월간 결제액(억원) & 골목상권 소비비중',
    fourPResearchFocus: '대형 복합쇼핑몰 입점과 전통시장·원도심 골목상권 간 상생 협력 및 인천e음 청소년·학생 특화 소비 활성화 4P 실천',
    sample4PCitation: ({ district }) =>
      `[인천광역시 인천e음 지역화폐 통계] 인천 ${district} 월간 소상공인 결제 데이터 및 업종별 소비 흐름을 지역 순환경제 탐구의 4P 원인(P2) 및 대안(P3) 근거로 활용함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            district,
            monthlyPaymentVolumeKRW: '842억원',
            cashbackReinvestmentKRW: '58억원',
            topSpendingCategory: '일반음식점(38.2%), 슈퍼마켓/편의점(21.4%), 병의원/약국(14.8%), 학원/독서실(11.2%)',
            inRegionRetentionEffect: '역외소비 유출 방지율 약 72.4%',
            activeMerchantCount: 18450,
          },
        ],
      },
    }),
  },
  {
    id: 'bio-healthcare-cluster',
    category: '산업·경제',
    categoryBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    categoryColor: 'emerald',
    title: '7. 송도·청라 첨단 바이오·헬스케어 및 R&D 집적도',
    subtitle: '바이오의약품 글로벌 생산 용량(L) 및 연구개발 특허 출원',
    agency: '인천경제자유구역청(IFEZ) / 특허청',
    description: '송도 바이오클러스터(삼성바이오로직스, 셀트리온, SK바이오사이언스 등)의 세계 1위 바이오의약품 생산 규모와 관련 스타트업·연구기관 집적 지표입니다.',
    dataGoKrUrl: 'https://www.ifez.go.kr/openData',
    apiEndpoint: 'https://apis.data.go.kr/IFEZ/BioClusterStats/getCapacitySummary',
    sampleDatasetCode: 'IFEZ_SONGDO_BIO_2025',
    requiresKey: true,
    sampleFields: ['clusterName', 'bioreactorCapacityLiters', 'enterpriseCount', 'foreignInvestmentUSD', 'employment'],
    keyMetricLabel: '바이오 리액터 생산 용량(L) & R&D 인력',
    fourPResearchFocus: '세계 1위 송도 바이오 생산기지와 지역 이공계 고교·대학 인재 매칭 및 그린바이오·의료 격차 해소 프로젝트',
    sample4PCitation: ({ district }) =>
      `[IFEZ 인천경제자유구역 바이오 지표] ${district} 권역 중심 글로벌 바이오의약품 생산용량 및 첨단 R&D 연구지표를 4P 미래 신성장 동력 과업(P3)의 실증 통계로 채택함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            district: district.includes('연수') ? '연수구 송도 4·5·11공구' : district,
            bioreactorCapacityLiters: '880,000L (단일 도시 기준 세계 최대)',
            tenantBioEnterprises: 142,
            rdResearchersCount: 6850,
            globalFdiAttractionKRW: '1조 8,500억원',
            futureExpansionPlan: '송도 11공구 바이오공정인력양성센터 및 K-바이오 랩허브 가동',
          },
        ],
      },
    }),
  },
  {
    id: 'namdong-smart-industry',
    category: '산업·경제',
    categoryBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    categoryColor: 'emerald',
    title: '8. 남동국가산업단지·부평스마트산단 가동률 및 스마트화',
    subtitle: '뿌리공정 디지털 전환율, 에너지 자급자족 및 수출 실적',
    agency: '한국산업단지공단(KICOX)',
    description: '인천의 대표 제조 거점인 남동국가산단, 부평산단, 주안산단의 분기별 공장 가동률(%), 수출액(백만 달러), 스마트팩토리 도입률 현황입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15077189/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B551206/KicoxIndustrialComplexInfo/getComplexSummary',
    sampleDatasetCode: 'KICOX_NAMDONG_SMART_INDEX',
    requiresKey: true,
    sampleFields: ['complexName', 'operatingRate', 'exportUSD', 'smartFactoryAdoptionRate', 'carbonNeutralGoal'],
    keyMetricLabel: '산단 공장 가동률(%) & 스마트팩토리 도입률',
    fourPResearchFocus: '노후화된 전통 제조업 공정의 스마트 친환경 그린 팩토리 전환 및 산단 주변 주거지역의 악취·소음 저감 솔루션',
    sample4PCitation: ({ district }) =>
      `[한국산업단지공단 KICOX 산단동향] 인천 ${district} 인접 국가·일반산업단지 가동률 및 디지털 전환 데이터를 4P 환경·경제 융합 과업(P2, P3)의 기초 근거로 제시함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            industrialComplex: district.includes('남동') ? '남동국가산업단지' : `${district} 권역 산업단지`,
            operatingCapacityRate: '81.4%',
            quarterlyExportMillionUSD: '1,120백만$',
            smartFactoryAdoptionRatio: '46.8% (디지털 트윈 및 AI 품질검사)',
            greenIndustrialTransition: '산단 내 지붕형 태양광 및 스마트 에너지 플랫폼 구축 진행 중',
          },
        ],
      },
    }),
  },

  // -------------------------------------------------------------
  // [항만·물류·항공] 4종
  // -------------------------------------------------------------
  {
    id: 'port-mis-cargo-teu',
    category: '항만·물류·항공',
    categoryBadge: 'bg-sky-100 text-sky-800 border-sky-300',
    categoryColor: 'sky',
    title: '9. 해양수산부 PORT-MIS 인천항 컨테이너 물동량(TEU)',
    subtitle: '신항·남항·북항 화물 처리량 및 대중국/동남아 해상 교역 추이',
    agency: '해양수산부 / 인천항만공사(IPA)',
    description: '인천항(신항 컨테이너 전용부두, 내항, 남항, 북항)의 연간/월간 컨테이너 처리 실적(TEU 단위)과 자동차·모래·원자재 벌크 화물 물동량 데이터입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15077224/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/1192000/IncheonPortCargoStats/getContainerVolume',
    sampleDatasetCode: 'PORT_MIS_INCHEON_TEU',
    requiresKey: true,
    sampleFields: ['portZone', 'totalTeu', 'importTeu', 'exportTeu', 'transshipmentTeu', 'yoyGrowthRate'],
    keyMetricLabel: '월간 컨테이너 처리 실적(TEU) & 전년비 증감률',
    fourPResearchFocus: '수도권 최대 수출입 관문인 인천 신항의 스마트 항만 크레인 자동화와 디젤 화물차 배출가스(PM·NOx) 저감 친환경 4P 탐구',
    sample4PCitation: ({ district }) =>
      `[해양수산부 PORT-MIS 해운항만물류정보] 인천항(연수구 신항 및 중구 내·남항) 월간 컨테이너 물동량(TEU) 공인 데이터를 4P 해양물류 현상(P1)과 배후도로 교통영향(P2)의 증빙 자료로 인용함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            portFacility: '인천신항 컨테이너 전용부두 (선광/한진)',
            annualThroughputTEU: '3,450,000 TEU',
            monthlyExportTEU: '142,500 TEU',
            monthlyImportTEU: '151,200 TEU',
            topTradingCountry: '중국(61.2%), 베트남(14.5%), 태국(5.8%)',
            coldChainLogisticsVolume: '축·수산물 콜드체인 특화 물동량 18% 증가',
          },
        ],
      },
    }),
  },
  {
    id: 'incheon-ferry-ops',
    category: '항만·물류·항공',
    categoryBadge: 'bg-sky-100 text-sky-800 border-sky-300',
    categoryColor: 'sky',
    title: '10. 인천항 연안여객선(백령·연평·덕적도) 운항 및 결항률',
    subtitle: '서해 도서지역 14개 항로 기상악화(농무·풍랑) 결항 통계',
    agency: '한국해양교통안전공단(KOMSA) / 인천항연안여객터미널',
    description: '인천 연안여객터미널에서 백령도, 대청도, 연평도, 덕적도, 이작도 등 서해 5도 및 덕적군도로 출항하는 여객선의 일일 운항 여부, 기상 결항률, 수송 인원 현황입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15077759/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/1192000/FerryOperationStatus/getIncheonFerryRealtime',
    sampleDatasetCode: 'INCHEON_FERRY_OPS_KOMSA',
    requiresKey: true,
    sampleFields: ['route', 'shipName', 'departureStatus', 'cancellationRate', 'foggyDays', 'passengerCount'],
    keyMetricLabel: '도서 항로 기상 결항률(%) 및 승객 수',
    fourPResearchFocus: '서해 5도 섬 주민들의 육지 이동권(교통기본권) 보장과 농무·해무 시 운항 안전을 돕는 AI 해상 관측 및 위그선 대안 프로젝트',
    sample4PCitation: ({ district }) =>
      `[한국해양교통안전공단 KOMSA 연안여객 통계] 인천 연안여객터미널 서해 도서 항로 운항률 및 결항 데이터에 기반하여, 옹진군·강화군 도서 주민 교통 격차 문제(P1, P2)를 실증함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            terminalName: '인천항 연안여객터미널 (중구 연안부두)',
            activeRoutesCount: '14개 도서 항로',
            sampleRoute: '인천 - 백령도 (옹진훼미리 / 코리아프라이드호)',
            annualWeatherCancellationRate: '21.4% (봄철 짙은 농무 및 겨울 풍랑주의보)',
            annualPassengersTransported: '920,000명 (주민 42%, 관광객 58%)',
            incheonCitizenFerryDiscountApplied: '인천시민 시내버스 수준(1,500원) 운임 지원 정책 시행 중',
          },
        ],
      },
    }),
  },
  {
    id: 'iiac-air-logistics',
    category: '항만·물류·항공',
    categoryBadge: 'bg-sky-100 text-sky-800 border-sky-300',
    categoryColor: 'sky',
    title: '11. 인천국제공항공사 실시간 항공화물 및 여객 수송 통계',
    subtitle: '세계 2위 국제 항공화물(톤) 및 제2여객터미널 환승 여객 현황',
    agency: '인천국제공항공사(IIAC)',
    description: '영종도 인천국제공항의 일일 출도착 항공편 수, 여객 터미널 이용객 수, 반도체·전자부품 등 고부가가치 항공 화물 처리 톤수 실시간 집계입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15095074/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B551177/AviationStats/getDailyCargoTraffic',
    sampleDatasetCode: 'IIAC_AIR_LOGISTICS_2025',
    requiresKey: true,
    sampleFields: ['terminal', 'passengerDaily', 'cargoTonsDaily', 'flightOperations', 'onTimePerformance'],
    keyMetricLabel: '일일 항공화물 처리량(톤) & 여객 이용객',
    fourPResearchFocus: '인천국제공항 항공 MRO(정비·수리) 클러스터 조성과 심야 항공 소음 영향 지역(영종·신도) 주민 피해 저감 4P 과업',
    sample4PCitation: ({ district }) =>
      `[인천국제공항공사 항공운송 통계] 영종국제도시 인천공항 일일 화물 및 여객 처리 지표를 공항경제권 활성화 및 항공소음 저감 과업(P3)의 공인 통계로 인용함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            airportCode: 'ICN (인천국제공항 제1·제2터미널)',
            dailyPassengersCount: '184,200명',
            dailyAirCargoTons: '7,890톤 (반도체, 바이오의약품, 특송화물)',
            internationalFlightsDaily: '1,040편',
            cargoRanking: '국제 항공화물 세계 2위 (ACI 공인)',
            mroDevelopmentCluster: '영종 첨단 복합항공단지 조성 진행 중',
          },
        ],
      },
    }),
  },
  {
    id: 'port-waterfront-regen',
    category: '항만·물류·항공',
    categoryBadge: 'bg-sky-100 text-sky-800 border-sky-300',
    categoryColor: 'sky',
    title: '12. 인천 내항 재개발(1·8부두 상상플랫폼) 친수공간 지표',
    subtitle: '140년 만에 시민 개방된 내항 친수보행로 및 해양문화시설 면적',
    agency: '인천항만공사 / 인천광역시 제물포르네상스기획단',
    description: '인천 원도심 부흥 프로젝트인 제물포르네상스의 핵심 구역, 내항 1·8부두 개방 면적, 아시아 최대 곡물사일로 미디어파사드, 상상플랫폼 방문객 지표입니다.',
    dataGoKrUrl: 'https://data.incheon.go.kr/openInfo/openData.do',
    apiEndpoint: 'https://data.incheon.go.kr/openInfo/openDataApi.do?dataset=JEMULPO_REGEN_WATERFRONT_2025',
    sampleDatasetCode: 'PORT_WATERFRONT_REGEN',
    requiresKey: true,
    sampleFields: ['zoneName', 'openedWaterfrontAreaM2', 'monthlyVisitors', 'heritageRepurposedCount', 'citizenSatisfaction'],
    keyMetricLabel: '개방 친수공간 면적(㎡) & 월간 방문객',
    fourPResearchFocus: '닫혀 있던 내항 부두의 친수공원화 과정에서 항만 보안과 시민 보행권 조화, 원도심 개항장과의 보행 데크 연결 프로젝트',
    sample4PCitation: ({ district }) =>
      `[제물포르네상스 내항 재개발 통계] 인천 중구 내항 1·8부두 개방 면적 및 시민 해양친수공간 지표를 4P 해양도시 공간 혁신 과업(P1, P4)의 근거 자료로 활용함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            regenerationZone: '인천 내항 1·8부두 및 상상플랫폼 (중구 북성동·해안동)',
            openedWaterfrontAreaM2: '429,000㎡ (약 13만평)',
            keyAttractions: '상상플랫폼(폐곡물창고 복합문화공간), 사일로 슈퍼그래픽, 해안 보행데크',
            monthlyCitizenVisitors: '128,000명',
            connectivityToOldTown: '인천역 및 개항장 차이나타운 직결 보행가교 계획 수립 중',
          },
        ],
      },
    }),
  },

  // -------------------------------------------------------------
  // [교통·이동] 4종
  // -------------------------------------------------------------
  {
    id: 'metro-subway-congestion',
    category: '교통·이동',
    categoryBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    categoryColor: 'amber',
    title: '13. 인천 도시철도 1·2호선 역별 시간대별 승하차 및 혼잡도',
    subtitle: '출퇴근 피크시간대 부평·주안·검암 환승역 혼잡률(%)',
    agency: '인천교통공사(ITC)',
    description: '인천 1호선(계양~송도달빛축제공원)과 인천 2호선(검단오류~운연) 56개 전철역의 시간대별(07~09시, 18~20시) 승하차 인원과 열차 칸별 혼잡률 데이터입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15077223/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B551220/IncheonMetroPassenger/getStationHourlyVolume',
    sampleDatasetCode: 'IC_METRO_PASSENGER_HOURLY',
    requiresKey: true,
    sampleFields: ['stationName', 'line', 'rushHourCongestionRate', 'dailyBoardingTotal', 'transferRatio'],
    keyMetricLabel: '출근 첨두시간 혼잡도(%) & 일일 승하차량',
    fourPResearchFocus: '인천 2호선 2량 미니전동차의 출근시간 극심한 과밀 혼잡 원인 규명 및 증차·혼잡도 분산 스마트 승강장 안내 과업',
    sample4PCitation: ({ district }) =>
      `[인천교통공사 도시철도 이용 통계] 인천도시철도 1·2호선 역별 출퇴근 시간대 혼잡률 및 승하차 데이터를 4P 도시교통 인프라 불균형 문제(P1, P2)의 실측 근거로 인용함.`,
    generateMockData: ({ district }) => {
      const isSeogu = district.includes('서구');
      const isBupyeong = district.includes('부평');
      const congestion = isSeogu ? 152 : isBupyeong ? 148 : 115;
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              focusLine: isSeogu ? '인천 도시철도 2호선' : '인천 도시철도 1호선',
              rushHourCongestionPeak: `${congestion}% (정원 초과)`,
              busiestTransferStation: isSeogu ? '검암역(공항철도 환승) / 주안역(1호선 환승)' : '부평역(경인선 국철 환승)',
              dailyAverageBoarding: 48500,
              crowdingLevelNotice: congestion >= 150 ? '심각(Safety Alert 필요)' : '주의(Moderate)',
            },
          ],
        },
      };
    },
  },
  {
    id: 'metro-bus-commute',
    category: '교통·이동',
    categoryBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    categoryColor: 'amber',
    title: '14. 국토교통부 인천 광역급행버스(M버스/빨간버스) 운행 통계',
    subtitle: '인천~서울 간 입석 금지 노선 만차 통과율 및 대기 시간',
    agency: '국토교통부 대도시권광역교통위원회(대광위) / 인천광역시',
    description: '송도·청라·검단에서 서울역·강남역으로 운행하는 광역버스(9100번, 9200번, M6405번 등)의 출근 시간대 잔여 좌석 수, 만차 통과 횟수, 배차 간격 데이터입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15098522/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/1613000/ExpBusInfoService/getIncheonSeoulBusLive',
    sampleDatasetCode: 'INCHEON_METRO_BUS_CONGESTION',
    requiresKey: true,
    sampleFields: ['busRouteNo', 'startDistrict', 'endPoint', 'averageWaitTimeMin', 'fullBusPassingCount', 'seatAvailableRate'],
    keyMetricLabel: '만차 통과율(%) & 출근 정류소 대기시간(분)',
    fourPResearchFocus: '경인고속도로 지하화 및 GTX-B 개통 이전까지 인천 시민의 서울 출퇴근 광역교통난 해소를 위한 중간 정류소 예약제 및 맞춤형 전세버스 투입 과업',
    sample4PCitation: ({ district }) =>
      `[국토부 대도시권광역교통위원회 광역버스 운행 통계] 인천 ${district} 출발 서울 직행 광역버스의 출근시간대 만차 무정차 통과 통계를 4P 광역교통 개선 과업(P2, P3)의 공인 근거로 제시함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            departureDistrict: district,
            sampleMajorRoutes: 'M6405(송도~강남), 9500(부평~양재), 1100(청라~서울역), 9802(검단~양재)',
            morningPeakWaitTime: '24.5분',
            fullBusPassingAverage: '2.8대 연속 만차 통과',
            seatReservationAdoption: '모바일 좌석예약제(Miri앱) 시행 노선 12개',
            commuteStressIndex: '높음(High)',
          },
        ],
      },
    }),
  },
  {
    id: 'ev-hydrogen-chargers',
    category: '교통·이동',
    categoryBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    categoryColor: 'amber',
    title: '15. 환경부 무공해차 통합누리집: 인천 전기·수소차 충전소',
    subtitle: '급속 vs 완속 충전기 보급 대수 및 고장 방치율 모니터링',
    agency: '환경부 / 한국환경공단',
    description: '인천 10개 군·구 공영주차장, 아파트, 고속도로 휴게소에 설치된 급속·완속 전기차 충전기 및 서구 오류동·송도 수소충전소의 실시간 가동 상태 정보입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15076352/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B552584/EvChargerStatus/getChargerInfo',
    sampleDatasetCode: 'EV_CHARGER_INCHEON_LIVE',
    requiresKey: true,
    sampleFields: ['district', 'fastChargerCount', 'slowChargerCount', 'hydrogenStationCount', 'utilizationRate'],
    keyMetricLabel: '급속 충전기 수 & 친환경차 100대당 충전기 비율',
    fourPResearchFocus: '빌라·다세대 밀집 원도심의 전기차 완속 충전 인프라 부족과 아파트 지하주차장 전기차 화재 안전 예방 스프링클러·질식소화포 구비 프로젝트',
    sample4PCitation: ({ district }) =>
      `[환경부 무공해차 통합데이터] 인천 ${district} 전기차 및 수소차 충전 인프라 보급 현황 데이터를 4P 친환경 모빌리티 전환 과업(P1, P3)의 실증 수치로 채택함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            district,
            totalEvChargers: 4120,
            fastChargersRatio: '18.4% (50kW~200kW 초급속)',
            slowChargersRatio: '81.6% (7kW 완속)',
            chargersPerHundredEvs: '34.2기 (전국 평균 31.8기 대비 양호)',
            hydrogenRefuelingStations: district.includes('서구') ? '2개소 가동 중 (국내 최대 수소액화플랜트 인접)' : '1개소 또는 인접 구 이용',
          },
        ],
      },
    }),
  },
  {
    id: 'bike-track-shared',
    category: '교통·이동',
    categoryBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    categoryColor: 'amber',
    title: '16. 인천 자전거 전용도로 연장 및 공유 PM(전동킥보드) 밀집도',
    subtitle: '아라뱃길·원도심 자전거 분리율 및 개인형 이동장치 방치 건수',
    agency: '인천광역시 도로과 / 도로교통공단',
    description: '경인아라뱃길, 송도국제도시, 부평 굴포천의 보행자 분리 자전거 도로 연장(km)과 공유 전동킥보드·카카오T바이크의 반납 구역 준수 및 수거 견인 통계입니다.',
    dataGoKrUrl: 'https://data.incheon.go.kr/openInfo/openData.do',
    apiEndpoint: 'https://data.incheon.go.kr/openInfo/openDataApi.do?dataset=INCHEON_BIKE_TRACK_2025',
    sampleDatasetCode: 'INCHEON_BIKE_TRACK_OPEN',
    requiresKey: true,
    sampleFields: ['district', 'totalBikeTrackKm', 'segregatedTrackRate', 'pmTowCount', 'bikeAccidentCount'],
    keyMetricLabel: '자전거 도로 분리율(%) & 도로 연장(km)',
    fourPResearchFocus: '초·중·고 통학로 주변 무단 방치 전동킥보드로 인한 보행 사고 원인 규명 및 청소년 전용 안전 자전거 고속도로(Cycle Highway) 네트워크 구축',
    sample4PCitation: ({ district }) =>
      `[인천광역시 자전거·PM 도로망 지표] 인천 ${district} 보행자-자전거 분리율 및 공유 이동장치 통계를 4P 친환경 녹색교통 실천(P3, P4)의 근거로 인용함.`,
    generateMockData: ({ district }) => {
      const isSongdo = district.includes('연수');
      const km = isSongdo ? 184.2 : 62.4;
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              totalBikeLaneLengthKm: `${km}km`,
              segregatedFromPedestriansRatio: isSongdo ? '74.2% (녹지축 완전 분리)' : '28.1% (보도 위 페인트 겸용도로 위주)',
              monthlyPmIllegalParkingReports: 420,
              commuteBicycleModalShare: isSongdo ? '4.8%' : '1.9%',
            },
          ],
        },
      };
    },
  },

  // -------------------------------------------------------------
  // [복지·안전·생태] 4종
  // -------------------------------------------------------------
  {
    id: 'school-zone-accidents',
    category: '복지·안전·생태',
    categoryBadge: 'bg-rose-100 text-rose-800 border-rose-300',
    categoryColor: 'rose',
    title: '17. 도로교통공단 인천 어린이보호구역(스쿨존) 교통사고 분석',
    subtitle: '초등학교 정문 반경 300m 내 과속·불법주정차 단속 및 사고 건수',
    agency: '경찰청 / 도로교통공단 교통사고분석시스템(TAAS)',
    description: '인천 10개 군·구 300여 개 초등학교 및 유치원 스쿨존의 연도별 어린이 보행자 교통사고 건수, 사상자 수, 방호울타리(옐로우카펫) 설치율 통계입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15070282/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B552070/SchoolZoneAccident/getSchoolZoneData',
    sampleDatasetCode: 'TAAS_SCHOOL_ZONE_INCHEON',
    requiresKey: true,
    sampleFields: ['district', 'accidentCount', 'casualtyChildCount', 'yellowCarpetRate', 'safetyFenceRate'],
    keyMetricLabel: '스쿨존 사고 건수 & 방호울타리 설치율(%)',
    fourPResearchFocus: '초등학교 주변 좁은 이면도로와 화물차 통행로가 교차하는 위험 구간의 스마트 횡단보도(바닥신호등·AI 보행감지음성안내) 설치 프로젝트',
    sample4PCitation: ({ district }) =>
      `[도로교통공단 TAAS 어린이보호구역 통계] 인천 ${district} 스쿨존 교통사고 발생 이력 및 방호울타리 미설치 구역 데이터를 4P 학교 안전 과업(P1, P3)의 객관적 증빙 자료로 제시함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            district,
            elementarySchoolCount: 28,
            annualSchoolZoneAccidents: 3,
            childCasualtiesTotal: 3,
            yellowCarpetInstallationRatio: '89.2%',
            pedestrianSafetyFenceRatio: '76.4%',
            primaryRiskFactor: '이면도로 불법주정차로 인한 운전자 시야 사각지대 발생',
          },
        ],
      },
    }),
  },
  {
    id: 'tidal-flat-biodiversity',
    category: '복지·안전·생태',
    categoryBadge: 'bg-rose-100 text-rose-800 border-rose-300',
    categoryColor: 'rose',
    title: '18. 국립생태원 인천 갯벌(강화·송도·영종) 생물다양성 및 철새',
    subtitle: '저서생물(게·조개류) 서식 밀도 및 멸종위기 저어새 번식지 지표',
    agency: '국립생태원 / 해양환경공단(KOEM)',
    description: '유네스코 세계자연유산 등재를 추진 중인 강화도 남단, 송도 갯벌(람사르습지), 영종도 갯벌의 대형 저서동물 생체량과 저어새·도요물떼새 개체수 관측 데이터입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15075489/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B551265/TidalFlatEcological/getBenthosDensity',
    sampleDatasetCode: 'INCHEON_TIDAL_FLAT_BIO',
    requiresKey: true,
    sampleFields: ['tidalZone', 'benthosSpeciesCount', 'spoonbillNestingCount', 'carbonAbsorptionTons', 'microplasticScore'],
    keyMetricLabel: '저서생물 종 다양성(종) & 저어새 번식 쌍',
    fourPResearchFocus: '인천 갯벌의 막대한 탄소 흡수력(블루카본) 측정과 해안 매립·해양 쓰레기 침적에 맞선 청소년 생태 모니터링단 4P 실천',
    sample4PCitation: ({ district }) =>
      `[국립생태원 갯벌생태평가 통계] 인천 갯벌(송도 람사르습지·강화 갯벌) 저서생물 다양성 및 멸종위기 철새 서식 데이터를 4P 생태환경 보호 과업(P1, P4)의 근거로 채택함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            targetEcosystem: district.includes('강화') ? '강화도 남단 갯벌 및 천연기념물 번식지' : '송도 갯벌 습지보호지역 (람사르 등록 습지)',
            macroBenthosSpeciesCount: '138종 (칠게, 밤게, 가무락조개, 동죽 등)',
            blackFacedSpoonbillBreedingPairs: '세계 번식 개체군의 약 80%가 인천 연안 서식',
            blueCarbonAbsorptionTonYear: '14,200톤 CO2/년',
            threatFactors: '해안 표착 플라스틱 폐기물 및 갯벌 육지화 현상',
          },
        ],
      },
    }),
  },
  {
    id: 'public-library-culture',
    category: '복지·안전·생태',
    categoryBadge: 'bg-rose-100 text-rose-800 border-rose-300',
    categoryColor: 'rose',
    title: '19. 인천시 공공도서관·청소년문화의집 및 문화기반시설',
    subtitle: '1인당 장서 수, 청소년 문화수련시설 접근성 및 대출 권수',
    agency: '인천광역시 / 국가도서관통계시스템',
    description: '인천 10개 군·구 관할 시립·구립 공공도서관 65개소와 작은도서관의 인구 천명당 장서 수, 청소년 독서·문화 프로그램 참여 인원, 접근 소요시간 통계입니다.',
    dataGoKrUrl: 'https://data.incheon.go.kr/openInfo/openData.do',
    apiEndpoint: 'https://data.incheon.go.kr/openInfo/openDataApi.do?dataset=INCHEON_LIBRARY_CULTURE_2025',
    sampleDatasetCode: 'INCHEON_LIBRARY_CULTURE',
    requiresKey: true,
    sampleFields: ['district', 'libraryCount', 'booksPerCapita', 'youthCenterCount', 'annualCirculation'],
    keyMetricLabel: '1인당 장서 수(권) & 청소년 문화시설 수',
    fourPResearchFocus: '인천시교육청 역점 사업인 읽·걷·쓰(읽기, 걷기, 쓰기)와 연계하여 도서관 사각지대 도서·원도심 마을에 이동형 팝업 북카페 조성 프로젝트',
    sample4PCitation: ({ district }) =>
      `[국가도서관통계시스템 문화인프라 통계] 인천 ${district} 공공도서관 및 청소년 문화시설 지표를 4P 인문학·교육 복지 증진 과업(P3, P4)의 공인 데이터로 인용함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            district,
            publicLibrariesCount: 6,
            smallLibrariesCount: 24,
            booksPerResident: '2.4권 (전국 특광역시 평균 2.1권 대비 상회)',
            youthCulturalCenters: 4,
            readWalkWriteAnnualParticipation: '18,500명 (인천교육청 읽걷쓰 프로젝트 연계)',
            digitalArchiveAccessRate: '78.5%',
          },
        ],
      },
    }),
  },
  {
    id: 'energy-voucher-welfare',
    category: '복지·안전·생태',
    categoryBadge: 'bg-rose-100 text-rose-800 border-rose-300',
    categoryColor: 'rose',
    title: '20. 인천시 취약계층 에너지바우처 및 복지안전망 지원 현황',
    subtitle: '혹서기(폭염) 냉방비·혹한기(한파) 난방비 수급 가구 비율',
    agency: '한국에너지공단 / 보건복지부',
    description: '기후위기로 심화되는 폭염과 한파에 취약한 노인, 장애인, 한부모가구의 에너지바우처 지급 건수 및 쪽방촌·노후 단독주택 단열 에너지 복지 통계입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15077209/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B553701/EnergyVoucherStatus/getIncheonBeneficiaryData',
    sampleDatasetCode: 'ENERGY_WELFARE_VOUCHER_2025',
    requiresKey: true,
    sampleFields: ['district', 'voucherRecipients', 'coolingVoucherWon', 'heatingVoucherWon', 'housingEnergyGradeF'],
    keyMetricLabel: '에너지바우처 지원 가구 수 & 주거단열 취약률',
    fourPResearchFocus: '기후 취약계층의 여름철 열사병 및 겨울철 저체온증 예방을 위한 스마트 무더위쉼터 IOT 모니터링 및 노후주택 그린 리모델링 4P 탐구',
    sample4PCitation: ({ district }) =>
      `[한국에너지공단 에너지바우처 통계] 인천 ${district} 기후취약계층 에너지 복지 수급 현황을 4P 기후정의 및 사회복지 안전망 과업(P1, P2, P3)의 공인 근거로 명시함.`,
    generateMockData: ({ district }) => ({
      header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
      body: {
        items: [
          {
            district,
            eligibleVoucherHouseholds: 8450,
            winterHeatingSupportPerHousehold: '314,000원',
            summerCoolingSupportPerHousehold: '43,000원',
            lowEnergyEfficiencyHousingRatio: district.includes('동구') || district.includes('미추홀') ? '42.8%' : '14.2%',
            climateShelterAccessibilityMin: '도보 8분 이내',
          },
        ],
      },
    }),
  },

  // -------------------------------------------------------------
  // [선생님 추천 연동 1~6] 신규 실시간·빅데이터 공공데이터 6종
  // -------------------------------------------------------------
  {
    id: 'kdca-youth-health-emergency',
    category: '복지·안전·생태',
    categoryBadge: 'bg-rose-100 text-rose-800 border-rose-300',
    categoryColor: 'rose',
    title: '21. 질병관리청 청소년 건강행태 & 응급의료 인프라 골든타임',
    subtitle: '[선생님 추천 1] 지역사회건강조사 청소년 비만·스트레스율 및 응급의료 취약지 분석',
    agency: '질병관리청 / 국립중앙의료원(중앙응급의료센터)',
    description: '인천 10개 군·구 중·고등학생의 스트레스 인지율, 주3일 이상 신체활동 실천율, 비만율 및 권역응급의료센터(인하대병원, 가천대길병원 등) 소아·청소년 응급실 골든타임(30분 이내) 접근성 통계입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15000569/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B551182/youthHealthSurvey/getYouthHealthIndicators',
    sampleDatasetCode: 'KDCA_YOUTH_HEALTH_2025',
    requiresKey: true,
    sampleFields: ['district', 'youthStressRate', 'physicalActivityDays', 'obesityRate', 'erGoldenTimeAccessibilityMin', 'pediatricErCount'],
    keyMetricLabel: '청소년 스트레스 인지율(%) & 응급의료 골든타임 도달시간',
    fourPResearchFocus: '군·구별 청소년 신체활동 부족 및 학업 스트레스 실태와 원도심·도서지역 소아·청소년 응급실(골든타임 30분 이내) 접근성 격차 원인 규명 및 스마트 건강캠페인 4P 탐구',
    sample4PCitation: ({ district }) =>
      `[질병관리청 지역사회건강조사 및 중앙응급의료센터 통계] 인천 ${district} 청소년 스트레스 인지율 및 소아·응급의료센터 골든타임 도달 지표를 4P 보건복지 안전망 탐구(P1 현상 포착, P2 원인 규명)의 학술적 근거 자료로 공식 인용함.`,
    generateMockData: ({ district }) => {
      const isIsland = district.includes('강화') || district.includes('옹진');
      const isOldCity = district.includes('동구') || district.includes('미추홀') || district.includes('중구');
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              youthStressAwarenessRate: isOldCity ? '41.2% (학업 및 가정환경 복합)' : isIsland ? '37.8% (문화·여가시설 부족)' : '35.4% (입시경쟁 집중)',
              vigorousPhysicalActivityRate: isIsland ? '24.1%' : isOldCity ? '19.8%' : '26.5%',
              youthObesityRate: isIsland ? '16.2%' : isOldCity ? '14.8%' : '11.2%',
              emergencyMedicalReachMinutes: isIsland ? '58분 (도서 닥터헬기·경비정 이송 의존)' : isOldCity ? '14분 (대학병원 인접)' : '18분 (도심 거점병원 연계)',
              pediatricSpecializedErCount: isIsland ? '0개소 (야간 진료 공백)' : isOldCity ? '2개소' : '1개소',
              goldenTimeUnder30MinRate: isIsland ? '28.4% (의료 취약)' : '93.7% (골든타임 확보 양호)',
            },
          ],
          totalCount: 1,
        },
      };
    },
  },
  {
    id: 'taas-schoolzone-cctv-gis',
    category: '교통·이동',
    categoryBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    categoryColor: 'amber',
    title: '22. 도로교통공단 TAAS 스쿨존 교통사고 & 안심귀갓길 CCTV GIS',
    subtitle: '[선생님 추천 2] 스쿨존 어린이 보행사고 다발지역 & 귀갓길 방범 CCTV 사각지대 GIS',
    agency: '도로교통공단(TAAS) / 경찰청 / 인천광역시',
    description: '인천 관내 초등학교 어린이보호구역(스쿨존) 내 보행자 교통사고 발생 건수, 사상자 통계 및 범죄예방 여성안심귀갓길 CCTV 설치 좌표, 불법 주정차 단속 건수 공간 빅데이터입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15003517/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B552070/schoolZoneAccident/getSchoolZoneAccidentData',
    sampleDatasetCode: 'TAAS_SCHOOLZONE_CCTV_GIS',
    requiresKey: true,
    sampleFields: ['district', 'schoolZoneAccidentCount', 'childPedestrianInjuries', 'safetyCctvDensityPerKm2', 'illegalParkingFineCases', 'speedViolationZone'],
    keyMetricLabel: '스쿨존 보행사고 건수 & 방범 CCTV 밀집도(대/㎢)',
    fourPResearchFocus: '초등학교 통학로 주변 불법 주정차 사각지대, 과속단속 카메라 및 고화질 안심귀갓길 CCTV 위치를 GIS로 교차 분석하여 어린이·청소년 보행안전 스마트 옐로카펫·통학로 개선 4P 과업 수립',
    sample4PCitation: ({ district }) =>
      `[도로교통공단 교통사고분석시스템(TAAS) & 인천시 안전GIS 통계] 인천 ${district} 관내 어린이보호구역(스쿨존) 보행 교통사고 발생 이력 및 방범 CCTV 사각지대 정량 데이터를 4P 보행환경 개선 과업(P1, P3)의 안전 지표로 인용함.`,
    generateMockData: ({ district }) => {
      const isOldCity = district.includes('부평') || district.includes('미추홀') || district.includes('동구');
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              schoolZoneAnnualAccidents: isOldCity ? '14건 (이면도로 협소 및 보차혼용 다수)' : '4건 (보행로 분리 양호)',
              childPedestrianInjuries: isOldCity ? '17명' : '4명',
              safetyCctvDensityPerKm2: isOldCity ? '48.6대/㎢' : '28.2대/㎢',
              illegalParkingFineCases: isOldCity ? '12,480건/년' : '5,120건/년',
              nightTimeLightingLux: isOldCity ? '8.4 lux (골목길 조도 보완 필요)' : '24.6 lux (스마트 가로등 완비)',
              highRiskSchoolZoneCount: isOldCity ? '3개 통학로 (집중 단속 구역)' : '1개 교차로',
            },
          ],
          totalCount: 1,
        },
      };
    },
  },
  {
    id: 'incheon-card-semas-commercial',
    category: '산업·경제',
    categoryBadge: 'bg-purple-100 text-purple-800 border-purple-300',
    categoryColor: 'purple',
    title: '23. 소상공인 상권정보 & 인천e음 지역화폐 결제 빅데이터',
    subtitle: '[선생님 추천 3] 골목상권 점포 생존율, 청년 창업 업종 및 인천e음 캐시백 소비 흐름',
    agency: '소상공인시장진흥공단 / 인천광역시(인천e음)',
    description: '인천 10개 군·구 주요 상권별 일반음식점, 카페, 학원, 서비스업 등 소상공인 점포 수와 개·폐업률, 그리고 인천e음 지역사랑상품권 월별 결제액 및 캐시백 유입 빅데이터입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15012005/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong',
    sampleDatasetCode: 'INCHEON_EUM_SEMAS_COMMERCIAL',
    requiresKey: true,
    sampleFields: ['district', 'activeStoreCount', 'annualStoreOpenRate', 'annualStoreCloseRate', 'incheonEumSalesWon', 'topCashbackCategory', 'youthStartupRatio'],
    keyMetricLabel: '소상공인 폐업률(%) & 인천e음 연간 결제액(억원)',
    fourPResearchFocus: '원도심 전통시장 및 대학로 골목상권의 생존율과 인천e음 캐시백 소비 유입 흐름을 분석하여 청년 로컬 크리에이터 창업 및 지역경제 선순환 4P 정책 제안',
    sample4PCitation: ({ district }) =>
      `[소상공인시장진흥공단 상권 빅데이터 & 인천e음 결제 통계] 인천 ${district} 골목상권 점포 폐업률 및 지역화폐 결제 소비 유입 데이터를 4P 경제 생태계 분석 과업(P2 원인, P3 과업)의 공인 근거로 인용함.`,
    generateMockData: ({ district }) => {
      const isDowntown = district.includes('부평') || district.includes('남동') || district.includes('미추홀');
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              registeredSmallBusinessStores: isDowntown ? 28400 : 13800,
              annualStoreOpenRate: '14.8%',
              annualStoreCloseRate: isDowntown ? '13.9% (고정임대료 부담)' : '10.2%',
              incheonEumAnnualPaymentWon: isDowntown ? '3,840억원' : '1,620억원',
              topCashbackConsumptionSector: '음식점(38.2%) > 학원·교육(22.4%) > 슈퍼마켓(18.1%)',
              youthStartupSurvival3YearRate: '41.5% (전국 평균 38.6% 상회)',
              localCurrencyMultiplierEffect: '1.74배 (역외 소비 유출 방지 효과)',
            },
          ],
          totalCount: 1,
        },
      };
    },
  },
  {
    id: 'school-info-digital-library',
    category: '인구·청년',
    categoryBadge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    categoryColor: 'indigo',
    title: '24. 학교알리미 학교별 도서·디지털 인프라 & 교육복지 모니터링',
    subtitle: '[선생님 추천 4] 초·중·고 1인당 장서 수, 스마트패드 보급률 및 교육복지우선지원 대상',
    agency: '한국교육학술정보원(KERIS) / 교육부 학교알리미',
    description: '인천 관내 초·중·고등학교 학교별 도서관 장서 수, 학생 1인당 연간 도서 대출 권수, 디지털 교육용 스마트패드/전자칠판 보급률, 교육복지우선지원 학생 비율 공식 공시정보입니다.',
    dataGoKrUrl: 'https://www.schoolinfo.go.kr/openApi.do',
    apiEndpoint: 'https://www.schoolinfo.go.kr/openApi/api/schoolInfoService/getSchoolInfrastructure',
    sampleDatasetCode: 'KERIS_SCHOOL_INFO_2025',
    requiresKey: true,
    sampleFields: ['district', 'studentCount', 'booksPerStudent', 'smartPadPerStudent', 'eduWelfarePriorityStudents', 'digitalClassroomRatio', 'readWalkWriteBooksReadYear'],
    keyMetricLabel: '학생 1인당 장서 수(권) & 스마트패드 보급률',
    fourPResearchFocus: '인천시교육청 역점 과제인 읽·걷·쓰(읽기·걷기·쓰기) 교육 실천을 위해 학교별 도서관 장서 격차 및 AI 디지털 디바이스 보급률, 교육복지우선지원 학생 비율을 비교 분석하는 4P 실천 탐구',
    sample4PCitation: ({ district }) =>
      `[교육부 학교알리미 & 한국교육학술정보원 공시정보] 인천 ${district} 소재 초·중·고교 1인당 도서 장서 수 및 디지털 학습 기기 보급 지표를 4P 인천형 읽·걷·쓰 교육복지 과업(P1, P3, P4)의 객관적 증빙으로 인용함.`,
    generateMockData: ({ district }) => {
      const isSongdoOrCheongna = district.includes('연수') || district.includes('서구');
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              totalSchoolsInDistrict: isSongdoOrCheongna ? 68 : 42,
              booksPerStudent: isSongdoOrCheongna ? '28.4권 (신설교 장서 확충 진행)' : '38.6권 (전통 명문교 다수 장서 보유)',
              annualCirculationPerStudent: '14.2권 (인천교육청 읽·걷·쓰 독서마라톤 연계)',
              smartDeviceSpreadRate: '100% (인천형 1인 1노트북/스마트패드 보급 완료)',
              aiDigitalClassroomRatio: isSongdoOrCheongna ? '88.5%' : '72.4%',
              eduWelfareSupportRatio: isSongdoOrCheongna ? '6.8%' : '18.4% (맞춤형 방과후 돌봄 지원 필요)',
            },
          ],
          totalCount: 1,
        },
      };
    },
  },
  {
    id: 'koem-marine-debris-bluecarbon',
    category: '대기·환경',
    categoryBadge: 'bg-teal-100 text-teal-800 border-teal-300',
    categoryColor: 'teal',
    title: '25. 해양환경공단(KOEM) 국가 해안쓰레기 & 연안 갯벌 블루카본',
    subtitle: '[선생님 추천 5] 연안 표착 플라스틱·어구 수거량 및 강화·송도 갯벌 온실가스 흡수량',
    agency: '해양환경공단(KOEM) / 해양수산부',
    description: '인천 연안 168개 섬과 강화·영종·송도 갯벌 모니터링 정점에서 수거된 해안 표착 쓰레기(폐플라스틱, 스티로폼 부표, 폐어망)의 무게와 갯벌 퇴적층의 유기탄소 격리량(블루카본) 측정 데이터입니다.',
    dataGoKrUrl: 'https://www.data.go.kr/data/15039572/openapi.do',
    apiEndpoint: 'https://apis.data.go.kr/B551265/coastalDebris/getIncheonCoastalDebrisMonitor',
    sampleDatasetCode: 'KOEM_COASTAL_DEBRIS_BLUECARBON',
    requiresKey: true,
    sampleFields: ['district', 'coastalSurveyPoint', 'plasticDebrisKgPerKm', 'styrofoamBuoyCount', 'blueCarbonSedimentTons', 'microplasticPpm', 'seaCleanUpFrequency'],
    keyMetricLabel: '해안 표착 쓰레기 수거량(kg/km) & 블루카본 탄소격리량',
    fourPResearchFocus: '서해안 및 강화·영종·연평 연안 갯벌의 플라스틱·폐어구 침적 실태와 세계자연유산급 갯벌의 이산화탄소 흡수 능력(블루카본)을 측정하여 연안 정화 캠페인 및 해양생태계 복원 4P 과업 설계',
    sample4PCitation: ({ district }) =>
      `[해양환경공단(KOEM) 국가 해안쓰레기 모니터링 통계] 인천 ${district} 해안선 단위거리당 플라스틱 폐기물 침적량 및 연안 갯벌 블루카본(CO2 흡수원) 지표를 4P 해양생태 보호 과업(P1, P4)의 공식 과학 데이터로 채택함.`,
    generateMockData: ({ district }) => {
      const isCoast = district.includes('강화') || district.includes('옹진') || district.includes('중구') || district.includes('연수');
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              monitoringCoastLocation: isCoast ? `${district} 연안 및 람사르 습지 보호구역` : '경인아라뱃길 및 한강 하구 수계',
              plasticDebrisDensityKgPerKm: isCoast ? '384.5 kg/km (조류 및 계절풍 영향 외해 유입)' : '98.2 kg/km',
              majorDebrisTypes: '폐스티로폼 부표(46.2%), 일회용 음료 플라스틱 용기(28.4%), 폐그물·통발(18.1%)',
              blueCarbonSedimentAbsorption: isCoast ? '연간 28,400톤 CO2eq 격리 (육상 산림 대비 2.2배 효율)' : '자연정화 수변구역',
              annualVolunteerCleanUpCount: isCoast ? '48회 (인천 시민·청소년 해양지킴이 활동)' : '16회',
              microplasticConcentrationPpm: '0.42 particles/㎥',
            },
          ],
          totalCount: 1,
        },
      };
    },
  },
  {
    id: 'kepco-power-green-transition',
    category: '대기·환경',
    categoryBadge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    categoryColor: 'cyan',
    title: '26. 한국전력 전력소비 패턴 & 영흥화력·해상풍력 친환경 에너지 전환',
    subtitle: '[선생님 추천 6] 군·구별 주택·일반·산업용 전력 사용량 및 영흥화력 탈석탄·해상풍력',
    agency: '한국전력공사(KEPCO) / 전력거래소(KPX)',
    description: '인천 10개 군·구별 주택용·일반용·산업용 전력 소비량 빅데이터와 옹진군 영흥석탄화력발전소(수도권 전력의 약 20% 공급)의 석탄 발전 감축 및 굴업도·초지도 해상풍력(3.0GW) 신재생에너지 전환 통계입니다.',
    dataGoKrUrl: 'https://bigdata.kepco.co.kr/openapi/v1/powerUsage.do',
    apiEndpoint: 'https://bigdata.kepco.co.kr/openapi/v1/incheonDistrictPowerUsage',
    sampleDatasetCode: 'KEPCO_POWER_ENERGY_TRANSITION',
    requiresKey: true,
    sampleFields: ['district', 'residentialUsageMwh', 'industrialUsageMwh', 'commercialUsageMwh', 'solarWindRenewableMwh', 'coalGenerationSharePct', 'co2EmissionTon'],
    keyMetricLabel: '산업·일반용 전력소비량(MWh) & 신재생에너지 발전비중(%)',
    fourPResearchFocus: '인천 전체 전력 생산의 축인 옹진군 영흥화력발전소의 탈석탄 전환 로드맵과 굴업도·초지도 인근 해상풍력 발전단지 조성에 따른 에너지 소비 패턴 변화 및 탄소중립 4P 탐구',
    sample4PCitation: ({ district }) =>
      `[한국전력공사 빅데이터센터 & 전력거래소 전력계통통계] 인천 ${district} 부문별(산업·가정·상업) 전력 소비량 및 영흥화력-해상풍력 탄소중립 전환 지표를 4P 기후에너지 탐구(P1 현상관찰, P2 원인분석, P3 과업기획)의 과학적 근거로 인용함.`,
    generateMockData: ({ district }) => {
      const isIndustrial = district.includes('남동') || district.includes('서구');
      const isIsland = district.includes('옹진');
      return {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: {
          items: [
            {
              district,
              monthlyPowerUsageMwh: isIndustrial ? '184,200 MWh (산업단지 전력 소모 집중)' : isIsland ? '42,800 MWh' : '98,600 MWh',
              sectorRatio: isIndustrial
                ? '제조업 산업용(68.4%), 일반상업용(20.1%), 가정용(11.5%)'
                : '가정주택용(42.1%), 일반상업용(45.6%), 산업용(12.3%)',
              powerGenerationRole: isIsland ? '영흥화력 1~6호기 (수도권 최대 기저부하 기지)' : '전력 소비 중심 권역',
              yeongheungCoalPhaseOutGoal: '2030년 1·2호기 LNG 조기 폐쇄 및 해상풍력 대체',
              offshoreWindCapacityPlan: '인천 연안 3.0GW 해상풍력 클러스터 (연간 820만MWh 친환경 전력 생산)',
              renewableSelfSufficiencyRatio: '14.2% (2030년 30% 목표 달성 추진)',
              co2EmissionsPerMwhTon: '0.459 tCO2/MWh',
            },
          ],
          totalCount: 1,
        },
      };
    },
  },
];
