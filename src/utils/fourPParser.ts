import { FourPData } from '../types';

/**
 * Intelligent 4P parser and distributor.
 * Detects if a student or user wrote/pasted all 4P steps into phenomenon (or any single field)
 * and distributes them into P1 (Phenomenon), P2 (Problem), P3 (Project), P4 (Practice).
 */
export function autoDistributeFourP(fourP: FourPData): {
  isDistributed: boolean;
  distributed: FourPData;
  originalText?: string;
  distributeType?: 'explicit-tags' | 'paragraphs' | 'numbered';
} {
  if (!fourP) {
    return {
      isDistributed: false,
      distributed: { phenomenon: '', problem: '', project: '', practice: '' },
    };
  }

  const p1 = (fourP.phenomenon || '').trim();
  const p2 = (fourP.problem || '').trim();
  const p3 = (fourP.project || '').trim();
  const p4 = (fourP.practice || '').trim();

  // If all 4 fields already have substantial independent content, do not override
  if (p2.length >= 15 && p3.length >= 15 && p4.length >= 15) {
    return { isDistributed: false, distributed: fourP };
  }

  // If phenomenon is empty or too short to contain multiple steps, return as-is
  if (p1.length < 50) {
    return { isDistributed: false, distributed: fourP };
  }

  // 1. Check for explicit step tags like [P1], [P2], [P3], [P4] or P1., P2., P3., P4.
  const stepPattern = /(?:\[?\s*P([1-4])\s*\]?|\bP([1-4])\s*[:.])[^\n]*/gi;
  const matches: { step: number; index: number; headerLen: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = stepPattern.exec(p1)) !== null) {
    const stepNum = parseInt(m[1] || m[2], 10);
    matches.push({ step: stepNum, index: m.index, headerLen: m[0].length });
  }

  if (matches.length >= 2) {
    const parts: Record<number, string> = { 1: '', 2: '', 3: '', 4: '' };
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i < matches.length - 1 ? matches[i + 1].index : p1.length;
      const text = p1.slice(current.index + current.headerLen, nextIndex).trim();
      parts[current.step] = (parts[current.step] ? parts[current.step] + '\n\n' : '') + text;
    }

    if (parts[1] || parts[2] || parts[3] || parts[4]) {
      return {
        isDistributed: true,
        distributeType: 'explicit-tags',
        distributed: {
          phenomenon: parts[1] || p1,
          problem: p2 || parts[2],
          project: p3 || parts[3],
          practice: p4 || parts[4],
        },
        originalText: p1,
      };
    }
  }

  // 2. Check for double newline separated distinct paragraphs
  const paragraphs = p1.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);

  if (paragraphs.length >= 4 && (!p2 || !p3 || !p4)) {
    return {
      isDistributed: true,
      distributeType: 'paragraphs',
      distributed: {
        phenomenon: paragraphs[0],
        problem: p2 || paragraphs[1],
        project: p3 || paragraphs[2],
        practice: p4 || paragraphs.slice(3).join('\n\n'),
      },
      originalText: p1,
    };
  }

  if (paragraphs.length === 3 && !p2 && !p3) {
    return {
      isDistributed: true,
      distributeType: 'paragraphs',
      distributed: {
        phenomenon: paragraphs[0],
        problem: paragraphs[1],
        project: paragraphs[2],
        practice: p4,
      },
      originalText: p1,
    };
  }

  // 3. Fallback: single newline list pattern starting with (1), (2), (3), (4) or 1., 2., 3., 4.
  const linePattern = /(?:^|\n)\s*(?:[1-4]\)|\[[1-4]\]|[1-4]\.)\s+/g;
  const lineMatches = [...p1.matchAll(linePattern)];
  if (lineMatches.length >= 3 && (!p2 || !p3 || !p4)) {
    const chunks: string[] = [];
    for (let i = 0; i < lineMatches.length; i++) {
      const start = lineMatches[i].index! + lineMatches[i][0].length;
      const end = i < lineMatches.length - 1 ? lineMatches[i + 1].index! : p1.length;
      chunks.push(p1.slice(start, end).trim());
    }

    if (chunks.length >= 3) {
      return {
        isDistributed: true,
        distributeType: 'numbered',
        distributed: {
          phenomenon: chunks[0] || paragraphs[0] || p1,
          problem: p2 || chunks[1] || '',
          project: p3 || chunks[2] || '',
          practice: p4 || chunks.slice(3).join('\n\n') || '',
        },
        originalText: p1,
      };
    }
  }

  return { isDistributed: false, distributed: fourP };
}

/**
 * Creates concise key summary bullets for the 4P executive matrix table
 */
export function extractKeySummary(text: string, maxChars: number = 140): string {
  if (!text) return '-';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxChars) return clean;
  // Try to cut at first sentence
  const sentenceMatch = clean.match(/^.*?[.?!](\s|$)/);
  if (sentenceMatch && sentenceMatch[0].length >= 30 && sentenceMatch[0].length <= maxChars + 30) {
    return sentenceMatch[0].trim();
  }
  return clean.slice(0, maxChars) + '...';
}
