import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { useGameActions } from '../hooks/useGameActions';
import { useDecks } from '../context/DeckContext';
import { useSettings } from '../context/SettingsContext';
import { CardComponent } from './CardComponent';
import { ActionLog } from './ActionLog';
import { Card } from '../types/game';
import { t } from '../utils/i18n';
import { CardLoader } from '../utils/game/cardLoader';
import Colors from '../constants/Colors';

export function GameBoard() {
  const { 
    gameState, 
    gameEngine, 
    actionLog, 
    damageAnimations,
    isLoading, 
    error,
    triggerDamageAnimation,
    clearDamageAnimation,
    resetGame,
    initializeGame
  } = useGame();
  const { activeDeck } = useDecks();
  const { cardSize, setCardSize } = useSettings();
  const { playCard, attack, retireCard, endTurn, processAITurn } = useGameActions();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [attackMode, setAttackMode] = useState<{ cardId: string; attackName: string } | null>(null);
  const [showDeckSelection, setShowDeckSelection] = useState(false);

  // Show deck selection if no game is active
  useEffect(() => {
    if (!gameState && !isLoading && !showDeckSelection) {
      setShowDeckSelection(true);
    }
  }, [gameState, isLoading, showDeckSelection]);

  const startGameWithDeck = (playerDeck: Card[]) => {
    const allCards = CardLoader.loadCards();
    const aiDeck = allCards.slice(20, 40); // AI uses demo deck
    
    initializeGame('Player', playerDeck, aiDeck);
    setShowDeckSelection(false);
  };

  const startWithActiveDeck = () => {
    if (activeDeck && activeDeck.cards.length >= 20) {
      startGameWithDeck(activeDeck.cards);
    } else {
      Alert.alert(
        'Invalid Deck', 
        activeDeck 
          ? 'Your active deck must have at least 20 cards.' 
          : 'No active deck selected. Please create a deck first.'
      );
    }
  };

  const startWithDemoDeck = () => {
    const allCards = CardLoader.loadCards();
    const playerDeck = allCards.slice(0, 20); // Demo deck for player
    startGameWithDeck(playerDeck);
  };

  // Auto-process AI turns
  useEffect(() => {
    if (!gameState || !gameEngine || gameState.isGameOver) return;
    
    const currentPlayer = gameEngine.getCurrentPlayer();
    console.log(`Turn ${gameState.turnNumber}: Current player is ${currentPlayer.name} (AI: ${currentPlayer.isAI}), Phase: ${gameState.phase}`);
    
    if (currentPlayer.isAI && gameState.phase === 'main') {
      console.log('Triggering AI turn...');
      const timeoutId = setTimeout(() => {
        processAITurn();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState?.currentPlayerIndex, gameState?.phase, gameState?.turnNumber, processAITurn, gameEngine, gameState]);

  // Auto-clear damage animations after duration
  useEffect(() => {
    damageAnimations.forEach(animation => {
      if (animation.isActive && animation.duration > 0) {
        const timeoutId = setTimeout(() => {
          clearDamageAnimation(animation.cardId);
        }, animation.duration);
        
        return () => clearTimeout(timeoutId);
      }
    });
  }, [damageAnimations, clearDamageAnimation]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>{t('game.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (showDeckSelection) {
    return (
      <View style={styles.centered}>
        <Text style={styles.deckSelectionTitle}>Choose Your Deck</Text>
        <Text style={styles.deckSelectionSubtitle}>
          Select which deck to use for this battle
        </Text>
        
        <View style={styles.deckOptions}>
          {activeDeck && (
            <TouchableOpacity 
              style={[styles.deckOption, styles.activeDeckOption]}
              onPress={startWithActiveDeck}
            >
              <Text style={styles.deckOptionTitle}>Use Active Deck</Text>
              <Text style={styles.deckOptionName}>"{activeDeck.name}"</Text>
              <Text style={styles.deckOptionStats}>
                {activeDeck.cards.length} cards
              </Text>
              {activeDeck.cards.length < 20 && (
                <Text style={styles.deckOptionWarning}>
                  ⚠️ Needs at least 20 cards
                </Text>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.deckOption, styles.demoDeckOption]}
            onPress={startWithDemoDeck}
          >
            <Text style={styles.deckOptionTitle}>Use Demo Deck</Text>
            <Text style={styles.deckOptionName}>Balanced Starter Deck</Text>
            <Text style={styles.deckOptionStats}>20 balanced cards</Text>
            <Text style={styles.deckOptionDescription}>
              Perfect for learning and new players
            </Text>
          </TouchableOpacity>
        </View>
        
        {!activeDeck && (
          <Text style={styles.noDeckMessage}>
            💡 Create a deck in the Decks tab to use your own cards!
          </Text>
        )}
      </View>
    );
  }

  if (!gameState || !gameEngine) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>{t('game.error')}</Text>
      </View>
    );
  }

  const currentPlayer = gameEngine.getCurrentPlayer();
  const isPlayerTurn = !currentPlayer.isAI;

  const handleCardPress = (card: Card) => {
    if (!isPlayerTurn) return;
    
    if (attackMode) {
      // Attack target selected - trigger damage animation
      if (card.id) {
        triggerDamageAnimation(card.id, 1000);
      }
      
      attack(attackMode.cardId, attackMode.attackName, card.id);
      setAttackMode(null);
      setSelectedCard(null);
    } else {
      setSelectedCard(card.id === selectedCard ? null : card.id!);
    }
  };

  const handlePlayCard = (cardId: string) => {
    playCard(cardId);
    setSelectedCard(null);
  };

  const handleAttack = (cardId: string, attackName: string) => {
    const opponent = gameEngine.getOpponent();
    if (opponent.field.length === 0) {
      // Direct attack
      attack(cardId, attackName);
      setAttackMode(null);
      setSelectedCard(null);
    } else {
      // Select target
      setAttackMode({ cardId, attackName });
      Alert.alert(t('actions.selectTarget'), 'Tap an opponent creature to attack');
    }
  };

  const handleRetire = (cardId: string) => {
    retireCard(cardId);
    setSelectedCard(null);
  };

  const handleEndTurn = () => {
    console.log('Player ending turn manually');
    endTurn();
    setSelectedCard(null);
    setAttackMode(null);
    // AI turn will be automatically triggered by useEffect
  };

  const getDamageAnimationForCard = (cardId: string) => {
    return damageAnimations.find(anim => anim.cardId === cardId);
  };

  // Always show current player at bottom, opponent at top regardless of whose turn it is
  const playerAtBottom = gameEngine.getPlayers()[0]; // Player 1 (human)
  const playerAtTop = gameEngine.getPlayers()[1]; // Player 2 (opponent)

  if (gameState.isGameOver) {
    const handlePlayAgain = () => {
      // Get the current player names and decks to restart with same setup
      const humanPlayer = playerAtBottom;
      const aiPlayer = playerAtTop;
      
      resetGame();
      
      // Wait a moment for reset to complete, then reinitialize
      setTimeout(() => {
        initializeGame(humanPlayer.name, humanPlayer.deck, aiPlayer.deck);
      }, 100);
    };

    const handleReturnToMenu = () => {
      resetGame();
      setShowDeckSelection(true);
    };

    return (
      <View style={styles.centered}>
        <Text style={styles.gameOver}>
          {gameState.winner === playerAtBottom.id ? t('game_over.victory') : t('game_over.defeat')}
        </Text>
        <Text style={styles.winner}>{t('game_over.winner')}: {gameState.winner}</Text>
        
        <View style={styles.gameOverButtons}>
          <TouchableOpacity style={styles.gameOverButton} onPress={handlePlayAgain}>
            <Text style={styles.gameOverButtonText}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.gameOverButton, styles.gameOverButtonSecondary]} 
            onPress={handleReturnToMenu}
          >
            <Text style={[styles.gameOverButtonText, styles.gameOverButtonTextSecondary]}>
              Return to Menu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.gameContainer}>
      {/* Top Player Info */}
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{playerAtTop.name}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>{t('player.energy')}: {playerAtTop.energy}</Text>
          <Text style={styles.stat}>{t('player.points')}: {playerAtTop.points}</Text>
          <Text style={styles.stat}>{t('player.hand')}: {playerAtTop.hand.length}</Text>
        </View>
      </View>

      {/* Top Player Field */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{playerAtTop.name} {t('player.field')}</Text>
        <ScrollView horizontal style={styles.cardRow}>
          {playerAtTop.field.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onPress={() => handleCardPress(card)}
              disabled={!isPlayerTurn || !attackMode}
              damageAnimation={getDamageAnimationForCard(card.id!)}
              size={cardSize}
            />
          ))}
          {playerAtTop.field.length === 0 && (
            <Text style={styles.emptyField}>No creatures on field</Text>
          )}
        </ScrollView>
      </View>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <View style={styles.gameInfoContent}>
          <View>
            <Text style={styles.turnInfo}>
              Turn {gameState.turnNumber} - {isPlayerTurn ? 'Your Turn' : 'AI Turn'}
            </Text>
            <Text style={styles.phaseInfo}>Phase: {t(`phases.${gameState.phase}`)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.sizeToggle}
            onPress={() => setCardSize(cardSize === 'small' ? 'normal' : 'small')}
          >
            <Text style={styles.sizeToggleText}>
              {cardSize === 'small' ? '⊞' : '⊟'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Player Field */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{playerAtBottom.name} {t('player.field')}</Text>
        <ScrollView horizontal style={styles.cardRow}>
          {playerAtBottom.field.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              selected={selectedCard === card.id}
              onPress={() => setSelectedCard(card.id === selectedCard ? null : card.id!)}
              onAttack={(attackName) => handleAttack(card.id!, attackName)}
              showActions={currentPlayer.id === playerAtBottom.id && isPlayerTurn && selectedCard === card.id}
              disabled={currentPlayer.id !== playerAtBottom.id || !isPlayerTurn}
              damageAnimation={getDamageAnimationForCard(card.id!)}
              size={cardSize}
            />
          ))}
          {playerAtBottom.field.length === 0 && (
            <Text style={styles.emptyField}>No creatures on field</Text>
          )}
        </ScrollView>
      </View>

      {/* Bottom Player Info */}
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{playerAtBottom.name}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>{t('player.energy')}: {playerAtBottom.energy}</Text>
          <Text style={styles.stat}>{t('player.points')}: {playerAtBottom.points}</Text>
          <Text style={styles.stat}>{t('player.hand')}: {playerAtBottom.hand.length}</Text>
        </View>
      </View>

      {/* Bottom Player Hand */}
      <View style={styles.hand}>
        <Text style={styles.fieldLabel}>{t('player.hand')}</Text>
        <ScrollView horizontal style={styles.cardRow}>
          {playerAtBottom.hand.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              selected={selectedCard === card.id}
              onPress={() => setSelectedCard(card.id === selectedCard ? null : card.id!)}
              disabled={currentPlayer.id !== playerAtBottom.id || !isPlayerTurn}
              size={cardSize}
            />
          ))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      {currentPlayer.id === playerAtBottom.id && isPlayerTurn && selectedCard && (
        <View style={styles.actions}>
          {playerAtBottom.hand.some(card => card.id === selectedCard) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePlayCard(selectedCard)}
            >
              <Text style={styles.actionText}>{t('actions.play')}</Text>
            </TouchableOpacity>
          )}
          
          {playerAtBottom.field.some(card => card.id === selectedCard) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRetire(selectedCard)}
            >
              <Text style={styles.actionText}>{t('actions.retire')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* End Turn Button */}
      {currentPlayer.id === playerAtBottom.id && isPlayerTurn && (
        <TouchableOpacity style={styles.endTurnButton} onPress={handleEndTurn}>
          <Text style={styles.endTurnText}>{t('actions.endTurn')}</Text>
        </TouchableOpacity>
      )}

      {attackMode && (
        <View style={styles.attackModeIndicator}>
          <Text style={styles.attackModeText}>
            Attack Mode: Select target for {attackMode.attackName}
          </Text>
        </View>
      )}
      </ScrollView>
      
      <View style={styles.actionLogContainer}>
        <ActionLog logs={actionLog} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  actionLogContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  gameOver: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: Colors.text.primary,
  },
  winner: {
    fontSize: 18,
    textAlign: 'center',
    color: Colors.text.secondary,
  },
  playerInfo: {
    backgroundColor: Colors.background.card,
    padding: 12,
    margin: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.text.primary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  field: {
    margin: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.text.primary,
  },
  cardRow: {
    flexDirection: 'row',
  },
  emptyField: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: Colors.text.secondary,
    padding: 20,
  },
  hand: {
    margin: 8,
    marginBottom: 16,
  },
  gameInfo: {
    backgroundColor: Colors.background.card,
    padding: 12,
    margin: 8,
    borderRadius: 8,
  },
  gameInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sizeToggle: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeToggleText: {
    fontSize: 18,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  turnInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  phaseInfo: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  actionButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  endTurnButton: {
    backgroundColor: Colors.accent[600],
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  endTurnText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  attackModeIndicator: {
    backgroundColor: '#FFC107',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.9,
  },
  attackModeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  gameOverButtons: {
    marginTop: 30,
    gap: 15,
  },
  gameOverButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  gameOverButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  gameOverButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameOverButtonTextSecondary: {
    color: Colors.primary[600],
  },
  loadingText: {
    color: Colors.text.primary,
    fontSize: 16,
  },
  deckSelectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  deckSelectionSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  deckOptions: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  deckOption: {
    backgroundColor: Colors.background.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeDeckOption: {
    borderColor: Colors.primary[600],
  },
  demoDeckOption: {
    borderColor: Colors.accent[600],
  },
  deckOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  deckOptionName: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  deckOptionStats: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  deckOptionDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  deckOptionWarning: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  noDeckMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});