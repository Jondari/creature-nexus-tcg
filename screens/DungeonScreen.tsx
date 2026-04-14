import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDungeon } from '../context/DungeonContext';
import { GameBoard } from '../components/GameBoard';
import { DungeonView } from './DungeonView';
import { DungeonControls } from './DungeonControls';
import { DungeonGenerator } from '../utils/dungeonGenerator';

export function DungeonScreen() {
  const { phase, dispatch } = useDungeon();

  useEffect(() => {
    // Initialize the dungeon on mount
    const width = 10;
    const height = 10;
    const tileSize = 40;
    const map = DungeonGenerator.generateSimpleMap(width, height, tileSize);
    const entities = DungeonGenerator.generateEntities(map, 2);

    dispatch({
      type: 'INIT_DUNGEON',
      payload: { map, entities }
    });
  }, [dispatch]);

  return (
    <View style={styles.container}>
      {phase === 'exploration' ? (
        <>
          <DungeonView />
          <DungeonControls />
        </>
      ) : (
        <GameBoard />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

