import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Chess } from 'chess.js';
import { RootStackParamList } from '../types';
import ChessBoard from '../components/ChessBoard';

type ManualFenScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ManualFen'>;
};

const COMMON_POSITIONS = [
  {
    name: 'Starting Position',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  },
  {
    name: 'Italian Game',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  },
  {
    name: 'Sicilian Defense',
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
  },
  {
    name: "Queen's Gambit",
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
  },
  {
    name: 'Ruy Lopez',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  },
];

export default function ManualFenScreen({ navigation }: ManualFenScreenProps) {
  const [fen, setFen] = useState(COMMON_POSITIONS[0].fen);
  const [isValid, setIsValid] = useState(true);

  const validateAndSetFen = (newFen: string) => {
    setFen(newFen);
    try {
      new Chess(newFen);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };

  const analyzePosition = () => {
    if (!isValid) {
      Alert.alert('Invalid FEN', 'Please enter a valid FEN string.');
      return;
    }
    navigation.navigate('Analysis', { imageUri: '', fen });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Enter Chess Position</Text>

        <View style={styles.boardContainer}>
          <ChessBoard fen={isValid ? fen : COMMON_POSITIONS[0].fen} />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>FEN String</Text>
          <TextInput
            style={[styles.input, !isValid && styles.inputError]}
            value={fen}
            onChangeText={validateAndSetFen}
            placeholder="Enter FEN string"
            placeholderTextColor="#666"
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />
          {!isValid && (
            <Text style={styles.errorText}>Invalid FEN notation</Text>
          )}
        </View>

        <View style={styles.presetsSection}>
          <Text style={styles.label}>Common Positions</Text>
          <View style={styles.presetButtons}>
            {COMMON_POSITIONS.map((position, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetButton,
                  fen === position.fen && styles.presetButtonActive,
                ]}
                onPress={() => validateAndSetFen(position.fen)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    fen === position.fen && styles.presetButtonTextActive,
                  ]}
                >
                  {position.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, !isValid && styles.analyzeButtonDisabled]}
          onPress={analyzePosition}
          disabled={!isValid}
        >
          <Text style={styles.analyzeButtonText}>Analyze Position</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  boardContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 12,
    minHeight: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 6,
  },
  presetsSection: {
    marginBottom: 24,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonActive: {
    backgroundColor: 'rgba(98, 153, 36, 0.2)',
    borderColor: '#629924',
  },
  presetButtonText: {
    color: '#aaa',
    fontSize: 13,
  },
  presetButtonTextActive: {
    color: '#629924',
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#629924',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#444',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
