import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GameProvider } from '@/context/GameContext';
import { GameBoard } from '@/components/GameBoard';
import Colors from '@/constants/Colors';

export default function BattleScreen() {
  return (
    <GameProvider>
      <View style={styles.container}>
        <GameBoard />
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});