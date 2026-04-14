import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useDungeon } from '../context/DungeonContext';
import Colors from '../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function DungeonView() {
  const { map, entities, playerPosition } = useDungeon();

  // Calculate view scale to fit screen
  const scale = Math.min(SCREEN_WIDTH / (map.width * map.tileSize), SCREEN_HEIGHT / (map.height * map.tileSize));

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { 
        width: map.width * map.tileSize * scale, 
        height: map.height * map.tileSize * scale 
      }]}>
        {/* Render Tiles */}
        {map.tiles.map((tile, index) => (
          <View
            key={`tile-${index}`}
            style={[
              styles.tile,
              {
                width: map.tileSize * scale,
                height: map.tileSize * scale,
                left: tile.x * map.tileSize * scale,
                top: tile.y * map.tileSize * scale,
                backgroundColor: tile.type === 'wall' ? '#333' : '#eee',
              },
            ]}
          />
        ))}

        {/* Render Entities */}
        {entities.map((entity) => {
          const isPlayer = entity.type === 'player';
          const isEnemy = entity.type === 'enemy';
          const isExit = entity.type === 'exit';

          return (
            <View
              key={entity.id}
              style={[
                styles.entity,
                {
                  width: map.tileSize * scale,
                  height: map.tileSize * scale,
                  left: entity.position.x * map.tileSize * scale,
                  top: entity.position.y * map.tileSize * scale,
                  backgroundColor: isPlayer ? Colors.primary[500] : isEnemy ? '#FF4444' : isExit ? '#4CAF50' : 'transparent',
                  borderRadius: isPlayer || isEnemy ? (map.tileSize * scale) / 2 : 0,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: '#eee',
  },
  tile: {
    position: 'absolute',
  },
  entity: {
    position: 'absolute',
    zIndex: 10,
  },
});
