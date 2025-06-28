import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GameState, Player, Card, GameAction, ActionLogEntry, DamageAnimation } from '../types/game';
import { GameEngine } from '../modules/game';
import { PlayerUtils } from '../modules/player';
import { AIEngine } from '../modules/ai';
import { initializeSounds } from '../utils/game/soundManager';

interface GameContextState {
  gameEngine: GameEngine | null;
  gameState: GameState | null;
  actionLog: ActionLogEntry[];
  damageAnimations: DamageAnimation[];
  isLoading: boolean;
  error: string | null;
}

interface GameContextActions {
  initializeGame: (playerName: string, playerDeck: Card[], aiDeck: Card[]) => void;
  executeAction: (action: GameAction) => void;
  executeAITurn: () => void;
  resetGame: () => void;
  triggerDamageAnimation: (cardId: string, duration?: number) => void;
  clearDamageAnimation: (cardId: string) => void;
}

type GameContextType = GameContextState & GameContextActions;

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction_Context = 
  | { type: 'INITIALIZE_GAME'; payload: { gameEngine: GameEngine; gameState: GameState } }
  | { type: 'UPDATE_GAME_STATE'; payload: GameState }
  | { type: 'ADD_ACTION_LOG'; payload: ActionLogEntry }
  | { type: 'ADD_DAMAGE_ANIMATION'; payload: DamageAnimation }
  | { type: 'CLEAR_DAMAGE_ANIMATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' };

const initialState: GameContextState = {
  gameEngine: null,
  gameState: null,
  actionLog: [],
  damageAnimations: [],
  isLoading: false,
  error: null,
};

function gameReducer(state: GameContextState, action: GameAction_Context): GameContextState {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return {
        ...state,
        gameEngine: action.payload.gameEngine,
        gameState: action.payload.gameState,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        gameState: action.payload,
      };
    case 'ADD_ACTION_LOG':
      return {
        ...state,
        actionLog: [...state.actionLog, action.payload],
      };
    case 'ADD_DAMAGE_ANIMATION':
      return {
        ...state,
        damageAnimations: [...state.damageAnimations, action.payload],
      };
    case 'CLEAR_DAMAGE_ANIMATION':
      return {
        ...state,
        damageAnimations: state.damageAnimations.filter(anim => anim.cardId !== action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        actionLog: [],
        damageAnimations: [],
      };
    default:
      return state;
  }
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Initialize sounds when provider mounts
  useEffect(() => {
    initializeSounds();
  }, []);

  const createActionLogEntry = (
    action: GameAction, 
    success: boolean, 
    playerName: string,
    turnNumber: number,
    description?: string
  ): ActionLogEntry => {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      turn: turnNumber,
      playerName,
      playerId: action.playerId,
      action,
      description: description || '',
      success,
    };
  };

  const getActionDescription = (action: GameAction, gameEngine: GameEngine): string => {
    const players = gameEngine.getPlayers();
    const player = players.find(p => p.id === action.playerId);
    
    switch (action.type) {
      case 'PLAY_CARD':
        const card = player?.hand.find(c => c.id === action.cardId);
        return card ? `Played ${card.name}` : 'Played a card';
      case 'ATTACK':
        const attackerCard = player?.field.find(c => c.id === action.cardId);
        if (action.targetCardId) {
          const opponent = players.find(p => p.id !== action.playerId);
          const targetCard = opponent?.field.find(c => c.id === action.targetCardId);
          return `${attackerCard?.name || 'Card'} attacked ${targetCard?.name || 'target'} with ${action.attackName}`;
        } else {
          return `${attackerCard?.name || 'Card'} attacked directly with ${action.attackName}`;
        }
      case 'RETIRE_CARD':
        const retiredCard = player?.field.find(c => c.id === action.cardId);
        return `Retired ${retiredCard?.name || 'card'}`;
      case 'END_TURN':
        return 'Ended turn';
      default:
        return 'Unknown action';
    }
  };

  const initializeGame = (playerName: string, playerDeck: Card[], aiDeck: Card[]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const player1 = PlayerUtils.createPlayer('player1', playerName, playerDeck, false);
      const player2 = PlayerUtils.createPlayer('player2', 'AI Opponent', aiDeck, true);
      
      const gameEngine = new GameEngine(player1, player2, playerDeck, aiDeck);
      const gameState = gameEngine.getGameState();
      
      dispatch({ 
        type: 'INITIALIZE_GAME', 
        payload: { gameEngine, gameState } 
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to initialize game' 
      });
    }
  };

  const executeAction = (action: GameAction) => {
    if (!state.gameEngine || !state.gameState) return;
    
    try {
      const players = state.gameEngine.getPlayers();
      const player = players.find(p => p.id === action.playerId);
      const description = getActionDescription(action, state.gameEngine);
      
      const success = state.gameEngine.executeAction(action);
      
      // Log the action
      const logEntry = createActionLogEntry(
        action,
        success,
        player?.name || 'Unknown Player',
        state.gameState.turnNumber,
        description
      );
      
      dispatch({ type: 'ADD_ACTION_LOG', payload: logEntry });
      
      if (success) {
        const newGameState = state.gameEngine.getGameState();
        dispatch({ type: 'UPDATE_GAME_STATE', payload: newGameState });
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to execute action' 
      });
    }
  };

  const executeAITurn = () => {
    console.log('=== executeAITurn called ===');
    if (!state.gameEngine || !state.gameState) {
      console.log('No game engine or game state');
      return;
    }
    
    const currentPlayer = state.gameEngine.getCurrentPlayer();
    console.log(`Current player: ${currentPlayer.name} (AI: ${currentPlayer.isAI})`);
    if (!currentPlayer.isAI) {
      console.log('Current player is not AI, exiting');
      return;
    }
    
    try {
      // AI should continue making actions until it ends its turn
      let actionsPerformed = 0;
      const maxActions = 10; // Prevent infinite loops
      
      console.log(`Starting AI turn loop, max actions: ${maxActions}`);
      
      while (actionsPerformed < maxActions) {
        console.log(`--- AI Action ${actionsPerformed + 1} ---`);
        const currentState = state.gameEngine.getGameState();
        const currentPlayerInLoop = state.gameEngine.getCurrentPlayer();
        
        // If it's no longer the AI's turn, break
        if (!currentPlayerInLoop.isAI) {
          break;
        }
        
        const aiDecision = AIEngine.makeDecision(currentState);
        console.log(`AI Decision: ${aiDecision.action.type} - ${aiDecision.reasoning}`);
        
        const players = state.gameEngine.getPlayers();
        const aiPlayer = players.find(p => p.id === currentPlayerInLoop.id);
        const description = aiDecision.reasoning || getActionDescription(aiDecision.action, state.gameEngine);
        
        const success = state.gameEngine.executeAction(aiDecision.action);
        
        // Log the AI action
        const logEntry = createActionLogEntry(
          aiDecision.action,
          success,
          aiPlayer?.name || 'AI',
          currentState.turnNumber,
          description
        );
        
        dispatch({ type: 'ADD_ACTION_LOG', payload: logEntry });
        
        if (success) {
          actionsPerformed++;
          
          // If AI ended turn or attacked (which auto-ends turn), break the loop
          if (aiDecision.action.type === 'END_TURN' || aiDecision.action.type === 'ATTACK') {
            break;
          }
        } else {
          console.log(`AI action failed: ${aiDecision.action.type}, forcing end turn`);
          // If action failed, force end turn
          const endTurnSuccess = state.gameEngine.executeAction({
            type: 'END_TURN',
            playerId: currentPlayerInLoop.id,
          });
          if (!endTurnSuccess) {
            console.error('Failed to end AI turn - breaking loop');
          }
          break;
        }
      }
      
      // Safety check - if we hit max actions, force end turn
      if (actionsPerformed >= maxActions) {
        console.warn('AI hit max actions limit, forcing end turn');
        const currentPlayerAfterLoop = state.gameEngine.getCurrentPlayer();
        if (currentPlayerAfterLoop.isAI) {
          state.gameEngine.executeAction({
            type: 'END_TURN',
            playerId: currentPlayerAfterLoop.id,
          });
        }
      }
      
      const newGameState = state.gameEngine.getGameState();
      dispatch({ type: 'UPDATE_GAME_STATE', payload: newGameState });
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'AI turn failed' 
      });
    }
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const triggerDamageAnimation = (cardId: string, duration: number = 1000) => {
    const animation: DamageAnimation = {
      cardId,
      isActive: true,
      duration,
    };
    
    dispatch({ type: 'ADD_DAMAGE_ANIMATION', payload: animation });
  };

  const clearDamageAnimation = (cardId: string) => {
    dispatch({ type: 'CLEAR_DAMAGE_ANIMATION', payload: cardId });
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
        initializeGame,
        executeAction,
        executeAITurn,
        resetGame,
        triggerDamageAnimation,
        clearDamageAnimation,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}