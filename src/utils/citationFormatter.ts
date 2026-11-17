import { ReadingLog, ResearchProject } from '../types';
import { LABS_DATA } from '../data/labsData';
import { autoDistributeFourP } from './fourPParser';

/**
 * APA 7th Edition 서식 변환
 * 도서: 저자 (연도). 도서명. 출판사.
 * 논문: 저자 (연도). 논문명. 학술지명, 권(호), 페이지. URL
 * 기사: 작성자/언론사 (연도, 월 일). 기사 제목. 언론사명. URL
 * 영상: 채널명 (연도, 월 일). 영상 제목 [비디오]. 플랫폼. URL
 */
export function formatCitationAPA(log: ReadingLog): string {
  const author = log.author?.trim() || log.sourceOrg?.trim() || '작성자 미상';
  const year = log.date ? log.date.split('-')[0] : 'n.d.';
  const title = log.title?.trim() || '무제';
  const source = log.sourceOrg?.trim() || '';
  const page = log.timestampOrPage ? ` (${log.timestampOrPage})` : '';
  const url = log.url?.trim() ? ` ${log.url.trim()}` : '';

  switch (log.mediaType) {
    case 'paper':
      return `${author} (${year}). ${title}. ${source ? `*${source}*` : ''}${page}.${url}`;
    case 'news':
      return `${author} (${log.date || year}). ${title}. ${source ? `*${source}*` : ''}.${url}`;
    case 'video':
      return `${author} (${log.date || year}). ${title} [동영상 자료]. ${source || 'YouTube'}.${url}`;
    case 'book':
    default:
      return `${author} (${year}). *${title}*${page}. ${source || '출판사'}.${url}`;
  }
}

/**
 * KCI (한국학술지인용색인) 표준 서식 변환
 * 논문: 저자 (연도). 「논문명」, 『학술지명』, 권(호), 쪽수.
 * 도서: 저자 (연도). 『도서명』, 출판사, 쪽수.
 * 기사/영상: 저자 (연도.월.일). 「제목」, 언론사/채널.
 */
export function formatCitationKCI(log: ReadingLog): string {
  const author = log.author?.trim() || log.sourceOrg?.trim() || '저자 미상';
  const year = log.date ? log.date.split('-')[0] : '연도 미상';
  const title = log.title?.trim() || '제목 미상';
  const source = log.sourceOrg?.trim() || '';
  const page = log.timestampOrPage ? `, ${log.timestampOrPage}` : '';
  const url = log.url?.trim() ? ` (접속일: ${log.date || '최근'}, ${log.url.trim()})` : '';

  switch (log.mediaType) {
    case 'paper':
      return `${author} (${year}). 「${title}」, 『${source || '학술논문집'}』${page}.${url}`;
    case 'news':
      return `${author} (${log.date?.replace(/-/g, '.') || year}). 「${title}」, ${source || '언론보도'}.${url}`;
    case 'video':
      return `${author} (${log.date?.replace(/-/g, '.') || year}). 「${title}」 [영상], ${source || '영상매체'}.${url}`;
    case 'book':
    default:
      return `${author} (${year}). 『${title}』, ${source || '출판사'}${page}.${url}`;
  }
}

/**
 * 나이스(NEIS) 바이트 계산기 (한글 3바이트, 영문/공백/줄바꿈 1바이트)
 */
export function calculateNeisBytes(text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode <= 0x007f) {
      bytes += 1;
    } else if (charCode <= 0x07ff) {
      bytes += 2;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * 나이스(NEIS) 생활기록부 3대 유형 문장 생성기
 * 1) 교과 세특형 (과목 성취기준 + 학술적 탐구역량)
 * 2) 창체·동아리형 (가설 검증, 실험/분석, 협업 및 문제해결력)
 * 3) 진로·자율형 (인천 읽·걷·쓰 기반 지역사회 실천 및 전공 적합성)
 */
export function generateNeisDraft(
  project: ResearchProject,
  type: 'subject' | 'club' | 'career'
): { title: string; draft: string; charCount: number; byteCount: number; limitBytes: number } {
  const lab = LABS_DATA.find((l) => l.id === project.labId) || LABS_DATA[0];
  const dist = autoDistributeFourP(project.fourP);
  const fourP = dist.distributed;

  // 핵심 키워드 및 근거 추출
  const p1Snippet = fourP.phenomenon?.slice(0, 85).replace(/\n/g, ' ') || '현상 데이터 관찰';
  const p2Snippet = fourP.problem?.slice(0, 85).replace(/\n/g, ' ') || '구조적 문제 원인 규명';
  const p3Snippet = fourP.project?.slice(0, 95).replace(/\n/g, ' ') || '전공 연구방법론 적용';
  const p4Snippet = fourP.practice?.slice(0, 85).replace(/\n/g, ' ') || '지역사회 실천 과업';

  const readCount = project.readingLogs?.length || 0;
  const walkCount = project.walkingLogs?.length || 0;
  const topBook = project.readingLogs?.[0]?.title ? `'${project.readingLogs[0].title}'` : '관련 전공 학술 문헌';
  const topWalk = project.walkingLogs?.[0]?.courseName ? `'${project.walkingLogs[0].courseName}'` : '인천 현장 탐사지';

  let draft = '';
  let typeTitle = '';
  const limitBytes = 1500; // 500자 / 1,500 Byte 기준

  if (type === 'subject') {
    typeTitle = '교과 세부능력 및 특기사항 (교과 세특)';
    draft = `[${lab.name} 연계 심층 탐구] '${project.title}'을(를) 주제로 인천 '읽·걷·쓰' 4P 탐구 프레임워크를 주도적으로 기획하여 수행함. ` +
      `교과 학습 중 ${topBook}을(를) 탐독하며 이론적 배경을 탐색하고, ${p1Snippet}에서 나타난 현상적 문제점을 학술적으로 분석함. ` +
      `특히 ${p2Snippet}에 주목하여 교과 개념을 확장 적용하였으며, ${p3Snippet}을(를) 바탕으로 정량적·정성적 분석을 체계적으로 설계하고 수행함. ` +
      `단순한 지식 습득에 머물지 않고 교과 성취기준을 지역사회 실제 문제에 접목하여 논리적인 결론을 도출하는 탁월한 학문적 비판력과 문제해결 역량을 보임.`;
  } else if (type === 'club') {
    typeTitle = '창의적 체험활동 - 동아리활동';
    draft = `[${lab.name} 학술동아리 탐구활동] '${project.title}' 프로젝트를 주도하며 실증적 연구 역량을 발휘함. ` +
      `${walkCount > 0 ? `${topWalk} 일대 현장답사를 통해 실측 데이터와 관찰 사실을 수집하고, ` : ''}` +
      `${readCount > 0 ? `${readCount}편의 문헌을 비교 분석하여 ` : ''}${p2Snippet}라는 연구 가설을 구체화함. ` +
      `동아리원들과 함께 ${p3Snippet}의 방법론을 엄밀하게 적용하며 오차를 보정하고 데이터를 정밀하게 검증함. ` +
      `탐구 과정에서 ${project.effortNotes ? `"${project.effortNotes.slice(0, 60)}..."와 같이 ` : ''}마주한 기술적 난관을 주도적으로 극복하였으며, ` +
      `연구 결과를 바탕으로 ${p4Snippet}을(를) 실천하는 등 동아리 내 연구 윤리와 협업 문화를 선도함.`;
  } else {
    typeTitle = '창의적 체험활동 - 진로활동';
    draft = `[전공 진로 심화 탐구] 자신의 진로 희망인 ${lab.name} 분야와 관련하여 '${project.title}' 탐구 프로젝트를 독립적으로 완수함. ` +
      `인천 지역의 특수성을 고려하여 ${p1Snippet}을(를) 면밀히 관찰한 후, ${p2Snippet}을(를) 전공 시각에서 새롭게 재해석함. ` +
      `${p3Snippet}을(를) 통해 진로 분야의 핵심 전공 연구방법론을 선제적으로 경험하고 학문적 지평을 넓힘. ` +
      `나아가 ${p4Snippet}과(와) 같이 탐구 성과를 공공의 가치로 승화시키기 위한 실천적 제언을 마련함. ` +
      `${project.growthNotes ? `탐구 후 "${project.growthNotes.slice(0, 60)}..."라는 ` : ''}성찰을 남기며 지속가능한 사회 혁신에 기여하는 전공인으로서의 뚜렷한 진로 성숙도와 사명감을 입증함.`;
  }

  // 줄바꿈 정돈
  draft = draft.replace(/\s+/g, ' ').trim();
  const charCount = draft.length;
  const byteCount = calculateNeisBytes(draft);

  return { title: typeTitle, draft, charCount, byteCount, limitBytes };
}

/**
 * 4P 단계별 자가점검 체크리스트 문항
 */
export const FOUR_P_CHECKLISTS = {
  P1: [
    { id: 'p1_1', text: '단순한 의견이 아닌 객관적인 통계 수치나 관찰 사실(Fact)이 포함되어 있는가?' },
    { id: 'p1_2', text: '인천 현장 답사(걷기), 뉴스 기사, 또는 공공데이터 출처가 명시되어 있는가?' },
    { id: 'p1_3', text: '주관적 선입견이나 감정적 표현을 배제하고 중립적으로 현상을 기술했는가?' },
  ],
  P2: [
    { id: 'p2_1', text: '단순한 개인의 부주의가 아닌 구조적·제도적·기술적 근본 원인(Why)을 짚었는가?' },
    { id: 'p2_2', text: '선행 연구나 학술 문헌(읽기 자료)을 인용하여 기존의 한계점/공백을 분석했는가?' },
    { id: 'p2_3', text: '이 문제가 방치될 경우 초래될 사회적 비용이나 위험성의 시급성을 논증했는가?' },
  ],
  P3: [
    { id: 'p3_1', text: '선택한 전공 학문의 핵심 이론(개념)과 연구방법론이 명확하게 제시되었는가?' },
    { id: 'p3_2', text: '변인 통제, 표본 선정, 데이터 수집 또는 실험 절차가 구체적으로 설계되었는가?' },
    { id: 'p3_3', text: '결과 검증을 위한 정량적/정성적 분석 기준이나 통계적 타당성이 확보되었는가?' },
  ],
  P4: [
    { id: 'p4_1', text: '단순한 정책 건의를 넘어 학생과 시민이 직접 실행할 수 있는 액션 플랜인가?' },
    { id: 'p4_2', text: '학교, 지자체, 공공기관, 시민사회 등 지역사회 유관 주체와의 연계가 포함되었는가?' },
    { id: 'p4_3', text: '일회성 행사에 그치지 않고 지속가능한 실천과 교육적 환원 방안이 마련되었는가?' },
  ],
};

/**
 * 연구 윤리 및 생성형 AI 활용 서약 항목
 */
export const RESEARCH_ETHICS_ITEMS = [
  {
    id: 'ethics_1',
    title: '데이터 진실성 및 위·변조 금지',
    desc: '현장 관찰 기록, 측정 수치, 설문 결과 등 모든 연구 데이터를 인위적으로 조작하거나 왜곡하지 않았음을 서약합니다.',
  },
  {
    id: 'ethics_2',
    title: '표절 예방 및 정확한 학술 출처 표기',
    desc: '선행 연구, 기사, 단행본, 공공데이터 등 타인의 아이디어와 저작물을 인용할 때 표준 인용 서식에 맞추어 명확히 출처를 밝혔음을 확인합니다.',
  },
  {
    id: 'ethics_3',
    title: '생성형 AI 윤리적 활용 및 비판적 검증',
    desc: 'AI가 생성한 텍스트나 통계를 무비판적으로 수용하지 않고, 연구자 자신의 지적 사고와 실증적 검증 과정을 거쳐 최종 작성하였음을 서약합니다.',
  },
];
