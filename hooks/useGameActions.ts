import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { GameAction } from '../types/game';

export function useGameActions() {
  const { executeAction, executeAITurn, gameState, gameEngine } = useGame();

  const playCard = useCallback((cardId: string) => {
    if (!gameState || !gameEngine) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const action: GameAction = {
      type: 'PLAY_CARD',
      playerId: currentPlayer.id,
      cardId,
    };

    executeAction(action);
  }, [executeAction, gameState, gameEngine]);

  const attack = useCallback((attackerCardId: string, attackName: string, targetCardId?: string) => {
    if (!gameState || !gameEngine) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const action: GameAction = {
      type: 'ATTACK',
      playerId: currentPlayer.id,
      cardId: attackerCardId,
      attackName,
      targetCardId,
    };

    executeAction(action);
  }, [executeAction, gameState, gameEngine]);

  const retireCard = useCallback((cardId: string) => {
    if (!gameState || !gameEngine) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const action: GameAction = {
      type: 'RETIRE_CARD',
      playerId: currentPlayer.id,
      cardId,
    };

    executeAction(action);
  }, [executeAction, gameState, gameEngine]);

  const endTurn = useCallback(() => {
    if (!gameState || !gameEngine) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const action: GameAction = {
      type: 'END_TURN',
      playerId: currentPlayer.id,
    };

    executeAction(action);
  }, [executeAction, gameState, gameEngine]);

  const processAITurn = useCallback(() => {
    if (!gameState || !gameEngine) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    if (currentPlayer.isAI) {
      executeAITurn();
    }
  }, [executeAITurn, gameState, gameEngine]);

  return {
    playCard,
    attack,
    retireCard,
    endTurn,
    processAITurn,
  };
}