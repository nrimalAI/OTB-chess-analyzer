import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Chess } from 'chess.js';
import { RootStackParamList, AnalysisResult } from '../types';
import ChessBoard from '../components/ChessBoard';
import EvaluationBar from '../components/EvaluationBar';
import { analyzePosition, generateAnalysisUrl, detectBoard } from '../services/api';

type AnalysisScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Analysis'>;
  route: RouteProp<RootStackParamList, 'Analysis'>;
};

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function AnalysisScreen({
  navigation,
  route,
}: AnalysisScreenProps) {
  const { imageUri, fen: initialFen } = route.params;
  const [fen, setFen] = useState(initialFen || DEFAULT_FEN);
  const [fenInput, setFenInput] = useState(initialFen || DEFAULT_FEN);
  const [isEditing, setIsEditing] = useState(!initialFen);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(true);
  const [detectionAttempted, setDetectionAttempted] = useState(false);

  const validateFen = (fenString: string): boolean => {
    try {
      new Chess(fenString);
      return true;
    } catch {
      return false;
    }
  };

  const runAnalysis = async (fenToAnalyze: string) => {
    setLoading(true);
    setError(null);
    try {
      const analysisResult = await analyzePosition(fenToAnalyze);
      setAnalysis(analysisResult);
    } catch (err) {
      setError('Failed to analyze position. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runDetection = async () => {
    if (!imageUri || detectionAttempted) return;

    setDetecting(true);
    setDetectionAttempted(true);
    setError(null);

    try {
      const result = await detectBoard(imageUri, 'white');

      if (result.success && result.fen) {
        setFen(result.fen);
        setFenInput(result.fen);
        setIsEditing(false);

        if (!result.isValid) {
          Alert.alert(
            'Position Detected',
            'The detected position may not be a legal chess position. You can edit it if needed.',
            [{ text: 'OK' }]
          );
        }

        runAnalysis(result.fen);
      } else {
        setError(result.error || 'Failed to detect board. Please enter FEN manually.');
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Detection error:', err);
      setError('Board detection service unavailable. Please enter FEN manually.');
      setIsEditing(true);
    } finally {
      setDetecting(false);
    }
  };

  const applyFen = () => {
    if (!validateFen(fenInput)) {
      Alert.alert('Invalid FEN', 'Please enter a valid FEN string.');
      return;
    }
    setFen(fenInput);
    setIsEditing(false);
    runAnalysis(fenInput);
  };

  useEffect(() => {
    // If we have an image and no initial FEN, try to detect the board
    if (imageUri && !initialFen) {
      runDetection();
    } else if (!isEditing && fen) {
      // If we have a FEN already, just run analysis
      runAnalysis(fen);
    }
  }, []);

  const openInAnalysis = () => {
    const url = generateAnalysisUrl(fen);
    Linking.openURL(url);
  };

  const getHighlightSquares = (): string[] => {
    if (!analysis?.bestMove) return [];
    const move = analysis.bestMove;
    if (move.length >= 4) {
      return [move.slice(0, 2), move.slice(2, 4)];
    }
    return [];
  };

  const formatMove = (uciMove: string): string => {
    if (!uciMove || uciMove.length < 4) return uciMove;
    const from = uciMove.slice(0, 2);
    const to = uciMove.slice(2, 4);
    const promotion = uciMove.length > 4 ? `=${uciMove[4].toUpperCase()}` : '';
    return `${from}-${to}${promotion}`;
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showImage && imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.capturedImage} />
            <TouchableOpacity
              style={styles.hideImageButton}
              onPress={() => setShowImage(false)}
            >
              <Text style={styles.hideImageText}>Hide Image</Text>
            </TouchableOpacity>
          </View>
        )}

        {!showImage && imageUri && (
          <TouchableOpacity
            style={styles.showImageButton}
            onPress={() => setShowImage(true)}
          >
            <Text style={styles.showImageText}>Show Captured Image</Text>
          </TouchableOpacity>
        )}

        {imageUri && !detecting && (
          <TouchableOpacity
            style={styles.retryDetectionButton}
            onPress={() => {
              setDetectionAttempted(false);
              runDetection();
            }}
          >
            <Text style={styles.retryDetectionText}>
              {detectionAttempted ? 'Retry Board Detection' : 'Detect Board'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.boardSection}>
          <View style={styles.boardWithEval}>
            {analysis && (
              <EvaluationBar
                evaluation={analysis.evaluation}
                isMate={analysis.isMate}
                mateIn={analysis.mateIn}
                height={screenWidth - 80}
              />
            )}
            <ChessBoard
              fen={fen}
              size={screenWidth - 80}
              highlightSquares={getHighlightSquares()}
            />
          </View>
        </View>

        <View style={styles.fenSection}>
          <Text style={styles.sectionTitle}>Position (FEN)</Text>
          {isEditing ? (
            <View style={styles.fenEditContainer}>
              <TextInput
                style={styles.fenInput}
                value={fenInput}
                onChangeText={setFenInput}
                placeholder="Enter FEN string"
                placeholderTextColor="#666"
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.fenActions}>
                <TouchableOpacity
                  style={styles.fenButton}
                  onPress={() => {
                    setFenInput(DEFAULT_FEN);
                  }}
                >
                  <Text style={styles.fenButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fenButton, styles.fenApplyButton]}
                  onPress={applyFen}
                >
                  <Text style={styles.fenApplyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.fenDisplay}>
              <Text style={styles.fenText} numberOfLines={2}>
                {fen}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setFenInput(fen);
                  setIsEditing(true);
                }}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.fenHint}>
            {detecting
              ? 'Detecting board position from image...'
              : detectionAttempted
              ? 'Position detected from image. Edit if needed.'
              : 'Enter the FEN manually or edit the detected position.'}
          </Text>
        </View>

        {detecting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#629924" />
            <Text style={styles.loadingText}>Detecting board position...</Text>
          </View>
        )}

        {loading && !detecting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#629924" />
            <Text style={styles.loadingText}>Analyzing position...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => runAnalysis(fen)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {analysis && !loading && (
          <View style={styles.analysisSection}>
            <View style={styles.engineInfo}>
              <Text style={styles.engineLabel}>Stockfish Analysis</Text>
              {analysis.depth && (
                <Text style={styles.depthText}>Depth: {analysis.depth}</Text>
              )}
            </View>

            <View style={styles.evalContainer}>
              <Text style={styles.evalLabel}>Evaluation</Text>
              <Text style={styles.evalValue}>
                {analysis.isMate
                  ? `Mate in ${Math.abs(analysis.mateIn!)}`
                  : analysis.evaluation !== null
                  ? `${analysis.evaluation > 0 ? '+' : ''}${analysis.evaluation.toFixed(2)}`
                  : 'Unknown'}
              </Text>
            </View>

            {analysis.winChance != null && (
              <View style={styles.winChanceContainer}>
                <Text style={styles.winChanceLabel}>Win Chance</Text>
                <Text style={styles.winChanceValue}>
                  {analysis.winChance.toFixed(1)}%
                </Text>
              </View>
            )}

            {analysis.bestMove && (
              <View style={styles.bestMoveContainer}>
                <Text style={styles.bestMoveLabel}>Best Move</Text>
                <Text style={styles.bestMoveValue}>
                  {analysis.bestMoveSan || formatMove(analysis.bestMove)}
                </Text>
              </View>
            )}

            {analysis.continuation.length > 1 && (
              <View style={styles.continuationContainer}>
                <Text style={styles.continuationLabel}>
                  Principal Variation
                </Text>
                <Text style={styles.continuationValue}>
                  {analysis.continuation.slice(0, 6).join(' ')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.analysisButton}
              onPress={openInAnalysis}
            >
              <Text style={styles.analysisButtonText}>
                Open in Lichess Board
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  capturedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  hideImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  hideImageText: {
    color: '#fff',
    fontSize: 12,
  },
  showImageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  showImageText: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
  },
  boardSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  boardWithEval: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fenSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  fenEditContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  fenInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    padding: 12,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 12,
    minHeight: 60,
  },
  fenActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  fenButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#666',
  },
  fenButtonText: {
    color: '#aaa',
    fontSize: 14,
  },
  fenApplyButton: {
    backgroundColor: '#629924',
    borderColor: '#629924',
  },
  fenApplyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fenDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  fenText: {
    flex: 1,
    color: '#aaa',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    marginLeft: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  fenHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#aaa',
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#629924',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  analysisSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  engineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  engineLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  depthText: {
    fontSize: 12,
    color: '#888',
  },
  evalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  evalLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  evalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  winChanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  winChanceLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  winChanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bestMoveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bestMoveLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  bestMoveValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#629924',
  },
  continuationContainer: {
    marginBottom: 16,
  },
  continuationLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  continuationValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
  },
  analysisButton: {
    backgroundColor: '#629924',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  analysisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryDetectionButton: {
    backgroundColor: 'rgba(98, 153, 36, 0.2)',
    borderWidth: 1,
    borderColor: '#629924',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryDetectionText: {
    color: '#629924',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
