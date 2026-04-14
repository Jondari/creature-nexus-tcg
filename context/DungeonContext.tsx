import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DungeonState, DungeonAction, DungeonMap, DungeonEntity } from '../types/dungeon';
import { Player, Card } from '../types/game';

interface DungeonContextType extends DungeonState {
  dispatch: React.Dispatch<DungeonAction>;
}

const DungeonContext = createContext<DungeonContextType | undefined>(undefined);

const initialState: DungeonState = {
  phase: 'exploration',
  map: {
    width: 10,
    height: 10,
    tileSize: 40,
    tiles: [],
  },
  entities: [],
  playerPosition: { x: 0, y: 0 },
  defeatedEnemies: [],
  currentBattle: undefined,
};

function dungeonReducer(state: DungeonState, action: DungeonAction): DungeonState {
  switch (action.type) {
    case 'INIT_DUNGEON':
      return {
        ...state,
        map: action.payload.map,
        entities: action.payload.entities,
        playerPosition: { x: 1, y: 1 }, // Default starting position
      };

    case 'MOVE_PLAYER':
      const tileAtPos = state.map.tiles.find(t => t.x === action.payload.x && t.y === action.payload.y);
      if (tileAtPos && tileAtPos.type === 'wall') return state;

      const enemyAtPos = state.entities.find(e => e.position.x === action.payload.x && e.position.y === action.payload.y);
      if (enemyAtPos && enemyAtPos.type === 'end' || enemyAtPos?.type === 'enemy') {
        // Trigger battle if we hit an enemy
        if (enemyAtPos.type === 'enemy') {
          return {
            ...state,
            phase: 'battle',
            currentBattle: {
              enemyPlayer: enemyAtPos.data as Player,
              enemyDeck: (enemyAtPos.data as Player)?.deck || [],
            },
          };
        }
      }

      return {
        ...state,
        playerPosition: action.payload,
      };

    case 'START_BATTLE':
      const enemy = state.entities.find(e => e.id === action.payload.enemyId);
      if (!enemy || enemy.type !== 'enemy') return state;

      return {
        ...state,
        phase: 'battle',
        currentBattle: {
          enemyPlayer: enemy.data as Player,
          enemyDeck: (enemy.data as Player)?.deck || [],
        },
      };

    case 'END_BATTLE':
      return {
        ...state,
        phase: action.payload.victory ? 'exploration' : 'defeat',
        defeatedEnemies: action.payload.victory 
          ? [...state.defeatedEnemies, ...state.entities.filter(e => e.type === 'enemy' && e.id !== undefined).map(e => e.id)]
          : state.defeatedEnemies,
        currentBattle: undefined,
      };

    case 'COLLECT_CHEST':
      return {
        ...state,
        entities: state.entities.filter(e => e.id !== action.payload.chestId),
      };

    default:
      return state;
  }
}

export function DungeonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dungeonReducer, initialState);

  return (
    <DungeonContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DungeonContext.Provider>
  );
}

export function useDungeon() {
  const context = useContext(DungeonContext);
  if (!context) {
    throw new Error('useDungeon must be used within a DungeonProvider');
  }
  return context;
}
