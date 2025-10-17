import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

interface StatusBarProps {
  turnLabel: string;
  phaseLabel: string;
  aiStatus?: string | null;
  cardSize: 'small' | 'normal';
  onToggleCardSize: () => void;
  onShowRules: () => void;
  showBattleLog?: boolean;
  isBattleLogOpen?: boolean;
  onToggleBattleLog?: () => void;
  containerRef?: React.Ref<View>;
  rulesAccessibilityLabel?: string;
}

export function StatusBar({
  turnLabel,
  phaseLabel,
  aiStatus,
  cardSize,
  onToggleCardSize,
  onShowRules,
  showBattleLog = false,
  isBattleLogOpen = false,
  onToggleBattleLog,
  containerRef,
  rulesAccessibilityLabel,
}: StatusBarProps) {
  return (
    <View ref={containerRef} style={styles.container}>
      <View style={styles.infoColumn}>
        <Text style={styles.turnInfo}>{turnLabel}</Text>
        <Text style={styles.phaseInfo}>{phaseLabel}</Text>
        {aiStatus ? <Text style={styles.aiStatusText}>{aiStatus}</Text> : null}
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={onToggleCardSize}>
          <Text style={styles.iconButtonText}>{cardSize === 'small' ? '⊞' : '⊟'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.rulesButton]}
          onPress={onShowRules}
          accessibilityLabel={rulesAccessibilityLabel}
        >
          <Text style={styles.iconButtonText}>ℹ️</Text>
        </TouchableOpacity>

        {showBattleLog && onToggleBattleLog && (
          <TouchableOpacity
            style={[styles.iconButton, styles.logButton, isBattleLogOpen && styles.logButtonActive]}
            onPress={onToggleBattleLog}
          >
            <Text style={[styles.iconButtonText, isBattleLogOpen && styles.logButtonTextActive]}>📋</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    padding: 12,
    margin: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoColumn: {
    flexShrink: 1,
  },
  turnInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  phaseInfo: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  aiStatusText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    padding: 8,
  },
  rulesButton: {
    marginLeft: 8,
  },
  iconButtonText: {
    fontSize: 18,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  logButton: {
    backgroundColor: Colors.background.primary,
  },
  logButtonActive: {
    backgroundColor: Colors.accent[500],
  },
  logButtonTextActive: {
    color: Colors.text.primary,
  },
});
