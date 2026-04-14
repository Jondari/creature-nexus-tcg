import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useDungeon } from '../context/DungeonContext';
import Colors from '../constants/Colors';

export function DungeonControls() {
  const { dispatch, playerPosition } = useDungeon();

  const move = (dx: number, dy: number) => {
    const newX = Math.max(0, Math.min(9, playerPosition.x + dx)); // Assuming 10x10 map for now
    const newY = Math.max(0, Math.min(9, playerPosition.y + dy));
    dispatch({ type: 'MOVE_PLAYER', payload: { x: newX, y: newY } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ControlButton icon="⬆️" onPress={() => move(0, -1)} />
      </ID>
      <View style={styles.row}>
        <ControlButton icon="⬅️" onPress={() => move(-1, 0)} />
        <ControlButton icon="⏺️" onPress={() => {}} disabled />
        <ControlButton icon="➡️" onPress={() => move(1, 0)} />
      </View>
      <View style={styles.row}>
        <ControlButton icon="⬇️" onPress={() => move(0, 1)} />
      </View>
    </View>
  );
}

const ControlButton = ({ icon, onPress, disabled }: { icon: string; onPress: () => void; disabled?: boolean }) => (
  <TouchableOpacity 
    style={[styles.button, disabled && styles.disabled]} 
    onPress={onPress} 
    disabled={disabled}
  >
    <Text style={{ fontSize: 30 }}>{icon}</Text>
  </TouchableOpacity>
);

const ID = React.Fragment; // Fix for the typo in my previous thought

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    margin: 5,
    borderRadius: 40,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
});
