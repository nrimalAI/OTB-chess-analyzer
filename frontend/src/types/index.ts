export interface ChessSquare {
  piece: string | null;
  color: 'w' | 'b' | null;
}

export interface BoardPosition {
  [square: string]: ChessSquare;
}

export interface LichessAnalysis {
  fen: string;
  depth: number;
  evaluation: number;
  bestMove: string;
  pv: string[];
  mate?: number;
}

export interface AnalysisResult {
  fen: string;
  evaluation: number | null;
  bestMove: string | null;
  continuation: string[];
  isMate: boolean;
  mateIn: number | null;
}

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Analysis: { imageUri: string; fen?: string };
  ManualFen: undefined;
};
