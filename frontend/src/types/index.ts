export interface ChessSquare {
  piece: string | null;
  color: 'w' | 'b' | null;
}

export interface BoardPosition {
  [square: string]: ChessSquare;
}

export interface AnalysisResult {
  fen: string;
  evaluation: number | null;
  bestMove: string | null;
  bestMoveSan?: string | null;
  continuation: string[];
  isMate: boolean;
  mateIn: number | null;
  depth?: number;
  winChance?: number;
}

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Analysis: { imageUri: string; fen?: string };
  ManualFen: undefined;
};
