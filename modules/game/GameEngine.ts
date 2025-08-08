import { GameState, Player, Card, Attack, GameAction } from '../../types/game';
import { CardUtils } from '../card';
import { PlayerUtils } from '../player';
import { TurnManager } from '../turn';
import { AffinityCalculator } from '../affinity';
import { Deck } from '../card/Deck';

export class GameEngine {
  private gameState: GameState;
  private playerDecks: [Deck, Deck];

  constructor(player1: Player, player2: Player, deck1: Card[], deck2: Card[]) {
    this.playerDecks = [new Deck(deck1), new Deck(deck2)];
    this.playerDecks[0].shuffle();
    this.playerDecks[1].shuffle();

    this.gameState = {
      players: [player1, player2],
      currentPlayerIndex: 0,
      turnNumber: 0,
      phase: 'draw',
      isGameOver: false,
    };

    this.initializeGame();
  }

  private initializeGame(): void {
    const initialHandSize = 5;
    
    let [player1, player2] = this.gameState.players;
    
    for (let i = 0; i < initialHandSize; i++) {
      player1 = PlayerUtils.drawCard(player1, this.playerDecks[0]);
      player2 = PlayerUtils.drawCard(player2, this.playerDecks[1]);
    }

    this.gameState.players = [player1, player2];
    
    // Start the first turn for player 1
    this.gameState = TurnManager.startTurn(this.gameState, this.playerDecks);
  }

  executeAction(action: GameAction): boolean {
    if (!TurnManager.canPerformAction(this.gameState, action)) {
      return false;
    }

    switch (action.type) {
      case 'PLAY_CARD':
        return this.playCard(action.playerId, action.cardId!);
        
      case 'ATTACK':
        return this.attack(action.playerId, action.cardId!, action.targetCardId, action.attackName!);
        
      case 'RETIRE_CARD':
        return this.retireCard(action.playerId, action.cardId!);
        
      case 'END_TURN':
        return this.endTurn();
        
      default:
        return false;
    }
  }

  private playCard(playerId: string, cardId: string): boolean {
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    const updatedPlayer = PlayerUtils.playCard(this.gameState.players[playerIndex], cardId);
    if (updatedPlayer === this.gameState.players[playerIndex]) return false;

    const newPlayers: [Player, Player] = [...this.gameState.players] as [Player, Player];
    newPlayers[playerIndex] = updatedPlayer;
    this.gameState.players = newPlayers;

    return true;
  }

  private attack(attackerId: string, attackerCardId: string, targetCardId: string | undefined, attackName: string): boolean {
    const attackerPlayerIndex = this.gameState.players.findIndex(p => p.id === attackerId);
    if (attackerPlayerIndex === -1) return false;

    const defenderPlayerIndex = attackerPlayerIndex === 0 ? 1 : 0;
    const attackerPlayer = this.gameState.players[attackerPlayerIndex];
    const defenderPlayer = this.gameState.players[defenderPlayerIndex];

    const attackerCard = attackerPlayer.field.find(c => c.id === attackerCardId);
    if (!attackerCard) return false;

    const isFirstPlayer = attackerPlayerIndex === 0;
    if (!CardUtils.canAttack(attackerCard, this.gameState.turnNumber, isFirstPlayer)) return false;

    const attack = attackerCard.attacks.find(a => a.name === attackName);
    if (!attack) return false;

    if (attackerPlayer.energy < attack.energy) return false;

    let targetCard: Card | undefined;
    if (targetCardId) {
      targetCard = defenderPlayer.field.find(c => c.id === targetCardId);
      if (!targetCard) return false;
    }

    const finalDamage = targetCard 
      ? AffinityCalculator.calculateFinalDamage(attack.damage, attackerCard.element, targetCard.element)
      : attack.damage;

    const newPlayers: [Player, Player] = [...this.gameState.players] as [Player, Player];

    newPlayers[attackerPlayerIndex] = {
      ...attackerPlayer,
      energy: attackerPlayer.energy - attack.energy,
    };

    const updatedAttackerCard = {
      ...attackerCard,
      lastAttackTurn: this.gameState.turnNumber,
    };
    newPlayers[attackerPlayerIndex] = PlayerUtils.updateFieldCard(
      newPlayers[attackerPlayerIndex], 
      attackerCardId, 
      updatedAttackerCard
    );

    if (targetCard) {
      const damagedCard = CardUtils.takeDamage(targetCard, finalDamage);
      newPlayers[defenderPlayerIndex] = PlayerUtils.updateFieldCard(
        defenderPlayer, 
        targetCardId!, 
        damagedCard
      );

      if (!CardUtils.isAlive(damagedCard)) {
        newPlayers[attackerPlayerIndex] = PlayerUtils.addPoints(newPlayers[attackerPlayerIndex], 1);
      }
    } else {
      newPlayers[attackerPlayerIndex] = PlayerUtils.addPoints(newPlayers[attackerPlayerIndex], 1);
    }

    newPlayers[0] = PlayerUtils.removeDeadCards(newPlayers[0]);
    newPlayers[1] = PlayerUtils.removeDeadCards(newPlayers[1]);

    this.gameState.players = newPlayers;
    
    // Check win conditions after scoring points and removing dead cards
    this.gameState = TurnManager.checkWinConditions(this.gameState, this.playerDecks);
    
    // If game is over, don't continue with turn processing
    if (this.gameState.isGameOver) {
      return true;
    }
    
    // Attack automatically ends the turn
    this.gameState = TurnManager.endTurn(this.gameState);
    
    if (this.gameState.phase === 'draw') {
      this.gameState = TurnManager.startTurn(this.gameState, this.playerDecks);
      // If game ended due to deck-out during startTurn, stop processing
      if (this.gameState.isGameOver) {
        return true;
      }
    }

    return true;
  }

  private retireCard(playerId: string, cardId: string): boolean {
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    const updatedPlayer = PlayerUtils.retireCard(this.gameState.players[playerIndex], cardId);
    if (updatedPlayer === this.gameState.players[playerIndex]) return false;

    const newPlayers: [Player, Player] = [...this.gameState.players] as [Player, Player];
    newPlayers[playerIndex] = updatedPlayer;
    this.gameState.players = newPlayers;

    return true;
  }

  private endTurn(): boolean {
    this.gameState = TurnManager.endTurn(this.gameState);
    
    if (this.gameState.phase === 'draw') {
      this.gameState = TurnManager.startTurn(this.gameState, this.playerDecks);
      // If game ended due to deck-out during startTurn, stop processing
      if (this.gameState.isGameOver) {
        return true;
      }
    }

    this.gameState = TurnManager.checkWinConditions(this.gameState, this.playerDecks);

    return true;
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  getCurrentPlayer(): Player {
    return TurnManager.getCurrentPlayer(this.gameState);
  }

  getOpponent(): Player {
    return TurnManager.getOpponent(this.gameState);
  }

  isGameOver(): boolean {
    return this.gameState.isGameOver;
  }

  getWinner(): string | undefined {
    return this.gameState.winner;
  }

  getPlayers(): [Player, Player] {
    return this.gameState.players;
  }
}