import { DungeonMap, DungeonEntity } from '../types/dungeon';
import { Player, Card } from '../types/game';

export class DungeonGenerator {
  static generateSimpleMap(width: number, height: number, tileSize: number): DungeonMap {
    const tiles: Array<{ x: number; y: number; type: 'floor' | 'wall' }> = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Create a border of walls
        const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
        tiles.push({
          x,
          y,
          type: is
            isBorder ? 'wall' : 'floor',
        });
      }
    }

    return {
      width,
      height,
      tileSize,
      tiles,
    };
  }

  static generateEntities(map: DungeonMap, enemyCount: number): DungeonEntity[] {
    const entities: DungeonEntity[] = [];

    // 1. Add Player (starting position)
    entities.push({
      id: 'player-1',
      type: 'player',
      position: { x: 1, y: 1 },
      data: null, // Will be populated during dungeon initialization
    });

    // 2. Add Enemies randomly on floor tiles
    let count = 0;
    while (count < enemyCount) {
      const rx = Math.floor(Math.random() * (map.width - 2)) + 1;
      const ry = Math.floor(Math.random() * (map.height - 2)) + 1;

      // Check if tile is a floor and not the player position
      const isFloor = map.tiles.find(t => t.x === rx && t.y === ry)?.type === 'floor';
      const isPlayerPos = rx === 1 && ry === 1;

      if (isFloor && !isPlayerPos) {
        entities.push({
          id: `enemy-${count}`,
          type: 'enemy',
          position: { x: rx, y: ry },
          data: null, // Will be populated with an AI Player object later
        });
        count++;
      }
    }

    // 3. Add a random exit
    entities.push({
      id: 'exit-1',
      type: 'exit',
      position: { x: map.width - 2, y: map.height - 2 },
    });

    return entities;
  }
}
