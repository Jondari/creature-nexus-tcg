import { Player, Card } from './game';

export type DungeonEntityType = 'player' | 'enemy' | 'chest' | 'exit' | 'obstacle';

export interface DungeonEntity {
  id: string;
  type: DungeonEntityType;
  position: { x: number; y: number };
  data?: any; // Pour stocker des infos spécifiques (ex: deck de l'ennemi, contenu du coffre)
}

export interface DungeonMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: Array<{ x: number; y: number; type: 'floor' | 'wall' }>;
}

export type DungeonPhase = 'exploration' | 'battle' | 'victory' | 'defeat';

export interface DungeonState {
  phase: DungeonPhase;
  map: DungeonMap;
  entities: DungeonEntity[];
  playerPosition: { x: number; y: number };
  defeatedEnemies: string[];
  currentBattle?: {
    enemyPlayer: Player;
    enemyDeck: Card[];
    playerDeckOverride?: Card[];
  };
}

export interface DungeonAction
  | { type: 'MOVE_PLAYER'; payload: { x: number; y: number } }
  | { type: 'START_BATTLE'; payload: { enemyId: string } }
  | { type: 'END_BATTLE'; payload: { victory: boolean; loot?: Card[] } }
  | { type: 'COLLECT_CHEST'; payload: { chestId: string; items: Card[] } }
  | { type: 'EXIT_DUNGEON' };
