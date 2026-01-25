import { AnalysisResult, DetectionResult } from '../types';
import * as FileSystem from 'expo-file-system';

// For local development, use your machine's IP address
// For production, replace with your deployed backend URL
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'
  : 'https://your-production-url.com';

export async function analyzePosition(
  fen: string,
  depth: number = 12
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen: fen,
        depth: depth,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      fen: data.fen,
      evaluation: data.evaluation,
      bestMove: data.best_move,
      bestMoveSan: data.best_move_san,
      continuation: data.continuation || [],
      isMate: data.is_mate,
      mateIn: data.mate_in,
      depth: data.depth,
      winChance: data.win_chance,
    };
  } catch (error) {
    console.error('Error analyzing position:', error);
    throw error;
  }
}

export function generateAnalysisUrl(fen: string): string {
  const encodedFen = encodeURIComponent(fen);
  return `https://lichess.org/analysis?fen=${encodedFen}`;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function detectBoard(
  imageUri: string,
  turn: 'white' | 'black' = 'white'
): Promise<DetectionResult> {
  try {
    // Read the image file and convert to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        turn: turn,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: data.success,
      fen: data.fen,
      boardFen: data.board_fen,
      isValid: data.is_valid,
      error: data.error,
      lichessUrl: data.lichess_url,
    };
  } catch (error) {
    console.error('Error detecting board:', error);
    throw error;
  }
}
