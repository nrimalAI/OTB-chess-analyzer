import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Chess } from 'chess.js';

interface ChessBoardProps {
  fen: string;
  size?: number;
  showCoordinates?: boolean;
  highlightSquares?: string[];
}

const PIECE_SYMBOLS: Record<string, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({
  fen,
  size,
  showCoordinates = true,
  highlightSquares = [],
}: ChessBoardProps) {
  const screenWidth = Dimensions.get('window').width;
  const boardSize = size || screenWidth - 40;
  const squareSize = boardSize / 8;

  let board: (string | null)[][] = [];

  try {
    const chess = new Chess(fen);
    board = chess.board().map((row) =>
      row.map((square) => {
        if (!square) return null;
        const piece = square.type;
        return square.color === 'w' ? piece.toUpperCase() : piece.toLowerCase();
      })
    );
  } catch (e) {
    // Invalid FEN, show empty board
    board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
  }

  const isHighlighted = (file: number, rank: number): boolean => {
    const square = FILES[file] + RANKS[rank];
    return highlightSquares.includes(square);
  };

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      {board.map((row, rankIndex) => (
        <View key={rankIndex} style={styles.row}>
          {row.map((piece, fileIndex) => {
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const highlighted = isHighlighted(fileIndex, rankIndex);

            return (
              <View
                key={fileIndex}
                style={[
                  styles.square,
                  {
                    width: squareSize,
                    height: squareSize,
                    backgroundColor: highlighted
                      ? '#f7f769'
                      : isLight
                      ? '#f0d9b5'
                      : '#b58863',
                  },
                ]}
              >
                {piece && (
                  <Text
                    style={[
                      styles.piece,
                      {
                        fontSize: squareSize * 0.8,
                        color: piece === piece.toUpperCase() ? '#fff' : '#000',
                        textShadowColor:
                          piece === piece.toUpperCase() ? '#000' : '#fff',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 2,
                      },
                    ]}
                  >
                    {PIECE_SYMBOLS[piece]}
                  </Text>
                )}
                {showCoordinates && fileIndex === 0 && (
                  <Text
                    style={[
                      styles.rankLabel,
                      { color: isLight ? '#b58863' : '#f0d9b5' },
                    ]}
                  >
                    {RANKS[rankIndex]}
                  </Text>
                )}
                {showCoordinates && rankIndex === 7 && (
                  <Text
                    style={[
                      styles.fileLabel,
                      { color: isLight ? '#b58863' : '#f0d9b5' },
                    ]}
                  >
                    {FILES[fileIndex]}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  piece: {
    fontWeight: 'bold',
  },
  rankLabel: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 10,
    fontWeight: 'bold',
  },
  fileLabel: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
