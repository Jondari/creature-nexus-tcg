export type Element = 'fire' | 'water' | 'air' | 'earth' | 'all';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface Attack {
  name: string;
  damage: number;
  energy: number;
  energyCost?: Element[];
}

export interface Card {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  hp: number;
  attacks: Attack[];
  maxHp?: number;
  isMythic?: boolean;
  lastAttackTurn?: number;
}

export interface Player {
  id: string;
  name: string;
  deck: Card[];
  hand: Card[];
  field: Card[];
  energy: number;
  points: number;
  isAI: boolean;
}

export interface GameState {
  players: [Player, Player];
  currentPlayerIndex: number;
  turnNumber: number;
  phase: 'draw' | 'main' | 'combat' | 'end';
  winner?: string;
  isGameOver: boolean;
}

export interface AffinityMatrix {
  [key: string]: {
    [key: string]: number;
  };
}

export interface GameAction {
  type: 'PLAY_CARD' | 'ATTACK' | 'RETIRE_CARD' | 'END_TURN' | 'DRAW_CARD';
  playerId: string;
  cardId?: string;
  targetCardId?: string;
  attackName?: string;
}

export interface AIDecision {
  action: GameAction;
  priority: number;
  reasoning?: string;
  score?: number;
}

export interface ActionLogEntry {
  id: string;
  timestamp: number;
  turn: number;
  playerName: string;
  playerId: string;
  action: GameAction;
  description: string;
  success: boolean;
}

export interface DamageAnimation {
  cardId: string;
  isActive: boolean;
  duration: number;
}

export type AIStatus = 
  | 'idle'
  | 'thinking'
  | 'analyzing_hand'
  | 'selecting_card_to_play'
  | 'selecting_attacker'
  | 'selecting_attack'
  | 'selecting_target'
  | 'executing_action'
  | 'ending_turn';

export interface AIVisualState {
  status: AIStatus;
  highlightedCardId?: string;
  targetCardId?: string;
  message?: string;
  isActive: boolean;
}