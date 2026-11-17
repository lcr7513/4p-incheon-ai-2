import { ResearchProject } from '../types';
import { LABS_DATA } from '../data/labsData';

export const DEFAULT_TEACHER_SPREADSHEET_ID = '1DPRCyd7MfAWiTw1p0oprm_dy3koKjCwkGMRbCypDeN8';

export const APPROACH_A_HEADERS = [
  '1. 제출일시',
  '2. 학교명',
  '3. 학번',
  '4. 이름(연구자)',
  '5. 소속/학급',
  '6. 전공 연구실',
  '7. 연구 주제',
  '8. 핵심 탐구 질문',
  '9. P1. 현상 (Phenomenon)',
  '10. P2. 문제원인 (Problem)',
  '11. P3. 과업/방법론 (Project)',
  '12. P4. 실천/정책 (Practice)',
  '13. 연계 독서 및 현장 답사지',
  '14. 🌱 탐구과정에서 노력한 점',
  '15. 🌟 탐구를 통해 성장한 점',
  '16. 📎 첨부파일 드라이브 링크',
  '17. AI 종합 평가 점수',
  '18. 3인 페르소나 다각도 검증',
  '19. 생기부 세특 및 교사 메모',
];

/**
 * Extracts a Google Spreadsheet ID from either a direct ID or a full Google Sheets URL.
 */
export const extractSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return trimmed;
};

/**
 * Converts a ResearchProject into a 19-column row array matching Approach A schema.
 */
export const formatProjectToApproachARow = (project: ResearchProject): (string | number)[] => {
  const now = new Date();
  const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
    now.getSeconds()
  ).padStart(2, '0')}`;

  const currentLab = LABS_DATA.find((l) => l.id === project.labId);
  const labName = currentLab ? `${currentLab.name} (${currentLab.badge})` : project.labId;

  // Format Reading (Multi-modal) & Walking Spots
  const readingsText = (project.readingLogs || [])
    .map((r) => {
      const typeLabel =
        r.mediaType === 'paper'
          ? '[논문]'
          : r.mediaType === 'news'
          ? '[기사]'
          : r.mediaType === 'video'
          ? '[유튜브]'
          : '[도서]';
      const detail = r.sourceOrg ? `${r.sourceOrg} ` : '';
      const ref = r.timestampOrPage ? ` (${r.timestampOrPage})` : '';
      return `${typeLabel} ${r.title} - ${detail}${r.author}${ref}`;
    })
    .join(', ');

  const walkingText = (project.walkingLogs || [])
    .map((w) => `${w.courseName} (${w.steps.toLocaleString()}보)`)
    .join(', ');

  const readingWalkingSummary = [
    readingsText ? `[읽기] ${readingsText}` : '',
    walkingText ? `[답사] ${walkingText}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Format AI Score
  let aiScoreText = '미평가';
  if (project.evaluationResult) {
    const ev = project.evaluationResult;
    aiScoreText = `${ev.totalScore}점 (P1: ${ev.pScores.phenomenon}, P2: ${ev.pScores.problem}, P3: ${ev.pScores.project}, P4: ${ev.pScores.practice})`;
  }

  // Format 3-Persona Feedback
  let personaText = '미실행';
  if (project.personaFeedback) {
    const pf = project.personaFeedback;
    const parts: string[] = [];
    const p1 = pf.persona1 || pf.merchant;
    const p2 = pf.persona2 || pf.environmental;
    const p3 = pf.persona3 || pf.official;

    if (p1) parts.push(`[${p1.name}(${p1.role})] ${p1.reaction}: "${p1.sharpQuestion}"`);
    if (p2) parts.push(`[${p2.name}(${p2.role})] ${p2.reaction}: "${p2.sharpQuestion}"`);
    if (p3) parts.push(`[${p3.name}(${p3.role})] ${p3.reaction}: "${p3.sharpQuestion}"`);

    personaText = parts.join('\n');
  }

  // Teacher Memo / Life Record note
  const memoText = project.teacherMemo || project.evaluationResult?.overallReview || '';

  // Format attachment drive link as a clickable HYPERLINK formula if URL exists
  let attachmentDisplay = '(미첨부)';
  if (project.attachmentUrl && project.attachmentUrl.trim().length > 0) {
    const label = project.attachmentName ? `📎 ${project.attachmentName}` : '📎 드라이브 파일 열기';
    attachmentDisplay = `=HYPERLINK("${project.attachmentUrl.trim()}", "${label}")`;
  } else if (project.attachmentName && project.attachmentName.trim().length > 0) {
    attachmentDisplay = `📎 ${project.attachmentName.trim()}`;
  }

  const authorDisplay =
    project.isGroupResearch && project.teamMembers && project.teamMembers.length > 0
      ? `${project.author || '대표'} (공동: ${project.teamMembers
          .map((m) => (m.name ? `${m.name}${m.studentId ? `[${m.studentId}]` : ''}` : ''))
          .filter(Boolean)
          .join(', ')})`
      : project.author || '';

  return [
    formattedTimestamp,
    project.schoolName || '',
    project.studentId || '',
    authorDisplay,
    project.affiliation || '',
    labName,
    project.title || '',
    project.mainQuestion || '',
    project.fourP?.phenomenon || '',
    project.fourP?.problem || '',
    project.fourP?.project || '',
    project.fourP?.practice || '',
    readingWalkingSummary || '(미기록)',
    project.effortNotes || '',
    project.growthNotes || '',
    attachmentDisplay,
    aiScoreText,
    personaText || '(미검증)',
    memoText,
  ];
};

/**
 * Creates a brand new Google Spreadsheet in the user's Google Drive,
 * sets up the 16 headers for Approach A, applies frozen rows & column widths,
 * and appends the initial student project.
 */
export const createNewApproachASpreadsheet = async (
  accessToken: string,
  project?: ResearchProject,
  customTitle?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string }> => {
  const title =
    customTitle?.trim() ||
    `[인천 읽걷쓰 4P 사회문제탐구] 학생 연구 데이터 취합 시트 (${new Date().toISOString().split('T')[0]})`;

  const sheetName = '학생_탐구_취합';

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: sheetName,
            gridProperties: {
              frozenRowCount: 1,
              columnCount: APPROACH_A_HEADERS.length + 2,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorBody = await createRes.text();
    throw new Error(`새 구글 시트 생성 실패 (${createRes.status}): ${errorBody}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Insert Header row + optional first row
  const rowsToInsert: (string | number)[][] = [APPROACH_A_HEADERS];
  if (project) {
    rowsToInsert.push(formatProjectToApproachARow(project));
  }

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetName
    )}!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rowsToInsert,
      }),
    }
  );

  if (!appendRes.ok) {
    const errorBody = await appendRes.text();
    console.warn('초기 데이터 추가 중 경고:', errorBody);
  }

  // 3. Format header styling (Dark slate background, white bold text, auto-wrap)
  try {
    const sheetId = createdData.sheets?.[0]?.properties?.sheetId ?? 0;
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Format header row
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: APPROACH_A_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.15, green: 0.23, blue: 0.36 }, // #27374D slate
                  horizontalAlignment: 'CENTER',
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 10,
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Set column widths
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 6, // Timestamp, School, ID, Name, Affiliation, Lab
              },
              properties: { pixelSize: 130 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 6,
                endIndex: 12, // Title, Question, P1, P2, P3, P4
              },
              properties: { pixelSize: 240 },
              fields: 'pixelSize',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('헤더 서식 적용 건너뜀 (기본 양식 정상 작동):', styleErr);
  }

  return { spreadsheetId, spreadsheetUrl, sheetName };
};

/**
 * Validates and retrieves metadata from an existing Google Spreadsheet.
 */
export const getSpreadsheetInfo = async (
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheetNames: string[] }> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title,sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`스프레드시트 정보를 읽을 수 없습니다 (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const title = data.properties?.title || '이름 없는 스프레드시트';
  const sheetNames = (data.sheets || []).map((s: any) => s.properties?.title || 'Sheet1');

  return { title, sheetNames };
};

/**
 * Guarantees that Row 1 of the Google Spreadsheet contains the 19 Approach A headers,
 * formatted with dark navy background, white bold text, freeze row 1, and optimized column widths.
 * Handles:
 * - Completely empty sheets (writes headers into A1:S1)
 * - Sheets with existing student data but missing header row (inserts a new row at top and writes headers)
 * - Sheets with old/fewer headers (updates A1:S1 with full 19 numbered headers)
 */
export const ensureSheetHeaders = async (
  accessToken: string,
  spreadsheetId: string,
  targetSheetName?: string
): Promise<{ success: boolean; sheetName: string; action: 'created' | 'inserted' | 'updated' | 'already-valid' }> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  let sheetName = targetSheetName;
  let targetSheetId = 0;

  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets.properties`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (metaRes.ok) {
      const metaData = await metaRes.json();
      const firstSheet = metaData.sheets?.[0]?.properties;
      if (firstSheet) {
        if (!sheetName) sheetName = firstSheet.title || 'Sheet1';
        targetSheetId = firstSheet.sheetId ?? 0;
      }
    }
  } catch {
    if (!sheetName) sheetName = 'Sheet1';
  }

  if (!sheetName) sheetName = 'Sheet1';

  // Read existing row 1
  let row1Values: string[] = [];
  try {
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
        sheetName
      )}!1:1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (readRes.ok) {
      const readData = await readRes.json();
      if (readData.values && readData.values.length > 0 && Array.isArray(readData.values[0])) {
        row1Values = readData.values[0].map((v: any) => String(v || '').trim());
      }
    }
  } catch (readErr) {
    console.warn('1행 확인 중 경고:', readErr);
  }

  let action: 'created' | 'inserted' | 'updated' | 'already-valid' = 'already-valid';

  const firstCell = row1Values[0] || '';
  const isHeaderRow = firstCell.includes('제출일시');

  if (row1Values.length === 0 || (row1Values.length === 1 && !row1Values[0])) {
    // Sheet is blank -> write headers directly to row 1
    action = 'created';
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
        sheetName
      )}!A1:S1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [APPROACH_A_HEADERS],
        }),
      }
    );
  } else if (!isHeaderRow) {
    // Row 1 contains student data or other non-header text -> insert a new row at top (index 0)
    action = 'inserted';
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertDimension: {
                range: {
                  sheetId: targetSheetId,
                  dimension: 'ROWS',
                  startIndex: 0,
                  endIndex: 1,
                },
                inheritFromBefore: false,
              },
            },
          ],
        }),
      });
    } catch (insertErr) {
      console.warn('1행 상단 삽입 실패, 덮어쓰기 시도:', insertErr);
    }

    // Now write the 19 headers into row 1
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
        sheetName
      )}!A1:S1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [APPROACH_A_HEADERS],
        }),
      }
    );
  } else if (
    row1Values.length < APPROACH_A_HEADERS.length ||
    row1Values[row1Values.length - 1] !== APPROACH_A_HEADERS[APPROACH_A_HEADERS.length - 1]
  ) {
    // Row 1 is a header row, but needs sync (missing new columns or updated numbering)
    action = 'updated';
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
        sheetName
      )}!A1:S1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [APPROACH_A_HEADERS],
        }),
      }
    );
  }

  // Apply styling (Dark navy background, white text, bold, freeze row 1, column widths)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Freeze row 1
          {
            updateSheetProperties: {
              properties: {
                sheetId: targetSheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Header formatting (Dark navy background, white bold centered text, auto-wrap)
          {
            repeatCell: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: APPROACH_A_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.09, green: 0.15, blue: 0.24 }, // #172554 dark navy
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  wrapStrategy: 'WRAP',
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 10,
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
            },
          },
          // Set row height for row 1
          {
            updateDimensionProperties: {
              range: {
                sheetId: targetSheetId,
                dimension: 'ROWS',
                startIndex: 0,
                endIndex: 1,
              },
              properties: { pixelSize: 44 },
              fields: 'pixelSize',
            },
          },
          // Set column widths
          {
            updateDimensionProperties: {
              range: {
                sheetId: targetSheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 6, // 1~6: 제출일시, 학교명, 학번, 이름, 소속, 연구실
              },
              properties: { pixelSize: 135 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: targetSheetId,
                dimension: 'COLUMNS',
                startIndex: 6,
                endIndex: 12, // 7~12: 연구주제, 핵심질문, P1, P2, P3, P4
              },
              properties: { pixelSize: 240 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: targetSheetId,
                dimension: 'COLUMNS',
                startIndex: 12,
                endIndex: 16, // 13~16: 읽기답사, 노력한점, 성장한점, 첨부파일링크
              },
              properties: { pixelSize: 260 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: targetSheetId,
                dimension: 'COLUMNS',
                startIndex: 16,
                endIndex: 19, // 17~19: AI점수, 3인검증, 세특메모
              },
              properties: { pixelSize: 220 },
              fields: 'pixelSize',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('헤더 서식 일괄 적용 건너뜀:', styleErr);
  }

  return { success: true, sheetName, action };
};

/**
 * Appends a student project row to an existing Google Spreadsheet.
 * Automatically verifies and initializes the 19 headers at row 1 if missing.
 */
export const appendProjectToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  project: ResearchProject,
  targetSheetName?: string
): Promise<{ spreadsheetUrl: string; sheetName: string; updatedRange: string }> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);

  // If sheet name is not provided, fetch first sheet name
  let sheetName = targetSheetName;
  if (!sheetName) {
    try {
      const info = await getSpreadsheetInfo(accessToken, cleanId);
      sheetName = info.sheetNames[0] || 'Sheet1';
    } catch {
      sheetName = 'Sheet1';
    }
  }

  // 1. Ensure row 1 always has the 19 Approach A headers with navy styling
  try {
    await ensureSheetHeaders(accessToken, cleanId, sheetName);
  } catch (headerErr) {
    console.warn('헤더 동기화 건너뜀 (직접 추가 진행):', headerErr);
  }

  // 2. Append student submission row
  const rowData = formatProjectToApproachARow(project);

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
      sheetName
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    }
  );

  if (!appendRes.ok) {
    const errorBody = await appendRes.text();
    throw new Error(`구글 시트 행 추가 실패 (${appendRes.status}): ${errorBody}`);
  }

  const resData = await appendRes.json();
  return {
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`,
    sheetName,
    updatedRange: resData.updates?.updatedRange || `${sheetName}!A:S`,
  };
};
