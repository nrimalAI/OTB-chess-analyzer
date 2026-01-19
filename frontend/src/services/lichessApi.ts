import { AnalysisResult } from '../types';

const LICHESS_API_BASE = 'https://lichess.org/api';

export async function analyzePosition(fen: string): Promise<AnalysisResult> {
  try {
    // Use Lichess cloud evaluation API
    const encodedFen = encodeURIComponent(fen);
    const response = await fetch(
      `${LICHESS_API_BASE}/cloud-eval?fen=${encodedFen}&multiPv=1`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      // If cloud eval not available, return basic result
      if (response.status === 404) {
        return {
          fen,
          evaluation: null,
          bestMove: null,
          continuation: [],
          isMate: false,
          mateIn: null,
        };
      }
      throw new Error(`Lichess API error: ${response.status}`);
    }

    const data = await response.json();
    const pv = data.pvs?.[0];

    if (!pv) {
      return {
        fen,
        evaluation: null,
        bestMove: null,
        continuation: [],
        isMate: false,
        mateIn: null,
      };
    }

    const isMate = pv.mate !== undefined;
    const evaluation = isMate ? null : pv.cp / 100; // Convert centipawns to pawns

    return {
      fen,
      evaluation,
      bestMove: pv.moves?.split(' ')[0] || null,
      continuation: pv.moves?.split(' ') || [],
      isMate,
      mateIn: pv.mate || null,
    };
  } catch (error) {
    console.error('Error analyzing position:', error);
    throw error;
  }
}

export async function getOpeningName(fen: string): Promise<string | null> {
  try {
    const encodedFen = encodeURIComponent(fen);
    const response = await fetch(
      `https://explorer.lichess.ovh/masters?fen=${encodedFen}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.opening?.name || null;
  } catch (error) {
    console.error('Error getting opening name:', error);
    return null;
  }
}

export function generateLichessAnalysisUrl(fen: string): string {
  const encodedFen = encodeURIComponent(fen);
  return `https://lichess.org/analysis?fen=${encodedFen}`;
}
