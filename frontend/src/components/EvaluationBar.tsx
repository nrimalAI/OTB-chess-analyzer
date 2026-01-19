import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EvaluationBarProps {
  evaluation: number | null;
  isMate: boolean;
  mateIn: number | null;
  height?: number;
}

export default function EvaluationBar({
  evaluation,
  isMate,
  mateIn,
  height = 300,
}: EvaluationBarProps) {
  const getWhitePercentage = (): number => {
    if (isMate && mateIn !== null) {
      return mateIn > 0 ? 100 : 0;
    }
    if (evaluation === null) return 50;

    // Clamp evaluation between -10 and 10, then convert to percentage
    const clampedEval = Math.max(-10, Math.min(10, evaluation));
    return 50 + clampedEval * 5;
  };

  const getDisplayText = (): string => {
    if (isMate && mateIn !== null) {
      return `M${Math.abs(mateIn)}`;
    }
    if (evaluation === null) return '?';
    const sign = evaluation > 0 ? '+' : '';
    return `${sign}${evaluation.toFixed(1)}`;
  };

  const whitePercentage = getWhitePercentage();
  const isWhiteAdvantage = whitePercentage >= 50;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.bar}>
        <View
          style={[
            styles.blackSection,
            { height: `${100 - whitePercentage}%` },
          ]}
        />
        <View
          style={[styles.whiteSection, { height: `${whitePercentage}%` }]}
        />
      </View>
      <View
        style={[
          styles.evalTextContainer,
          {
            backgroundColor: isWhiteAdvantage ? '#fff' : '#000',
            top: isWhiteAdvantage ? undefined : 4,
            bottom: isWhiteAdvantage ? 4 : undefined,
          },
        ]}
      >
        <Text
          style={[
            styles.evalText,
            { color: isWhiteAdvantage ? '#000' : '#fff' },
          ]}
        >
          {getDisplayText()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 30,
    position: 'relative',
  },
  bar: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  blackSection: {
    backgroundColor: '#333',
    width: '100%',
  },
  whiteSection: {
    backgroundColor: '#fff',
    width: '100%',
  },
  evalTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  evalText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
