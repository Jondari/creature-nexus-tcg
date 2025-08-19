import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { showErrorAlert, showWarningAlert } from '@/utils/alerts';
import { useGame } from '../context/GameContext';
import { useGameActions } from '../hooks/useGameActions';
import { useDecks } from '../context/DeckContext';
import { useSettings } from '../context/SettingsContext';
import { CardComponent } from './CardComponent';
import { ActionLog } from './ActionLog';
import { Sidebar } from './Sidebar';
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
    aiVisualState,
    isLoading, 
    error,
    triggerDamageAnimation,
    clearDamageAnimation,
    resetGame,
    initializeGame
  } = useGame();
  const { activeDeck } = useDecks();
  const { cardSize, setCardSize, showBattleLog } = useSettings();
  const { playCard, attack, retireCard, endTurn, processAITurn } = useGameActions();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [attackMode, setAttackMode] = useState<{ cardId: string; attackName: string } | null>(null);
  const [showDeckSelection, setShowDeckSelection] = useState(false);
  
  // Gesture and animation state
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth <= 768;
  const isWeb = Platform.OS === 'web';
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const translateX = React.useRef(new Animated.Value(isMobile ? screenWidth : 0)).current;

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const closeSidebar = () => setSidebarVisible(false);

  // Element cycle used for affinity: water > fire, fire > air, air > earth, earth > water
  const ELEMENT_CYCLE: Record<string, string> = {
    water: 'fire',
    fire: 'air',
    air: 'earth',
    earth: 'water',
  };


  /**
   * Returns the affinity bonus: +20, -20, or 0.
   * If defender is "all" (multi-element in defense), affinity is neutral (0).
   */
  function getAffinityBonus(attackerElement?: string, defenderElement?: string): number {
    if (!attackerElement || !defenderElement) return 0;
    if (defenderElement === 'all') return 0; // multi-element defense → neutral
    if (ELEMENT_CYCLE[attackerElement] === defenderElement) return 20;
    if (ELEMENT_CYCLE[defenderElement] === attackerElement) return -20;
    return 0;
  }


  /**
   * Computes damage preview for the selected attack against a target.
   * total = base + affinity (clamped to >= 0)
   */
  function getPreviewDamage(attacker: Card, attackName: string, target: Card) {
    const atk = attacker.attacks.find((a: any) => a.name === attackName);
    if (!atk) return null;
    const base = Number(atk.damage ?? 0) || 0;
    const affinity = getAffinityBonus(attacker.element as any, target.element as any);
    const total = Math.max(0, base + affinity);
    return { base, affinity, total };
  }

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
      showErrorAlert(
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
    if (!gameState || !gameEngine || gameState.isGameOver || aiVisualState.isActive) return;
    
    const currentPlayer = gameEngine.getCurrentPlayer();
    
    if (currentPlayer.isAI && gameState.phase === 'main') {
      const timeoutId = setTimeout(() => {
        processAITurn();
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState?.currentPlayerIndex, gameState?.phase, gameState?.turnNumber, processAITurn, gameEngine, gameState, aiVisualState.isActive]);

  // Auto-clear damage animations after duration
  useEffect(() => {
    const timeoutIds = damageAnimations
        .filter(anim => anim.isActive && anim.duration > 0)
        .map(anim => setTimeout(() => {
          clearDamageAnimation(anim.cardId);
        }, anim.duration));

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
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
    // Validate field space before playing card
    const currentPlayer = gameEngine.getCurrentPlayer();
    
    if (currentPlayer.field.length >= 4) {
      showWarningAlert('Field Full', 'You cannot have more than 4 creatures on the field at once.');
      return;
    }
    
    playCard(cardId);
    setSelectedCard(null);
  };

  const handleAttack = (cardId: string, attackName: string) => {
    // Validate energy before allowing attack
    const currentPlayer = gameEngine.getCurrentPlayer();
    const attackerCard = currentPlayer.field.find(c => c.id === cardId);
    const attack = attackerCard?.attacks.find(a => a.name === attackName);
    
    if (!attack || currentPlayer.energy < attack.energy) {
      showWarningAlert('Insufficient Energy', `This attack requires ${attack?.energy || 0} energy, but you only have ${currentPlayer.energy}.`);
      return;
    }
    
    const opponent = gameEngine.getOpponent();
    if (opponent.field.length === 0) {
      // No targets available
      showWarningAlert('No Targets', 'There are no enemy creatures to attack');
      return;
    }
    
    // Select target
    setAttackMode({ cardId, attackName });
    showWarningAlert(t('actions.selectTarget'), 'Tap an opponent creature to attack');
  };

  const handleRetire = (cardId: string) => {
    retireCard(cardId);
    setSelectedCard(null);
  };

  const handleEndTurn = () => {
    // Player ending turn manually
    endTurn();
    setSelectedCard(null);
    setAttackMode(null);
    // AI turn will be automatically triggered by useEffect
  };

  const getDamageAnimationForCard = (cardId: string) => {
    return damageAnimations.find(anim => anim.cardId === cardId);
  };

  const isCardHighlighted = (cardId: string) => {
    return aiVisualState.isActive && 
           (aiVisualState.highlightedCardId === cardId || aiVisualState.targetCardId === cardId);
  };

  const getCardHighlightType = (cardId: string) => {
    if (!aiVisualState.isActive) return null;
    if (aiVisualState.highlightedCardId === cardId) return 'selected';
    if (aiVisualState.targetCardId === cardId) return 'target';
    return null;
  };

  const getAIStatusMessage = (status: string) => {
    switch (status) {
      case 'thinking': return 'Thinking...';
      case 'analyzing_hand': return 'Analyzing hand...';
      case 'selecting_card_to_play': return 'Selecting card to play...';
      case 'selecting_attacker': return 'Choosing attacker...';
      case 'selecting_attack': return 'Choosing attack...';
      case 'selecting_target': return 'Selecting target...';
      case 'executing_action': return 'Executing action...';
      case 'ending_turn': return 'Ending turn...';
      default: return 'Processing...';
    }
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
          {playerAtTop.field.map((card) => {
            // Only compute preview when it's the player's turn and an attack is selected
            const preview = (isPlayerTurn && attackMode)
                ? (() => {
                  const attacker = playerAtBottom.field.find(c => c.id === attackMode.cardId);
                  return attacker ? getPreviewDamage(attacker, attackMode.attackName, card) : null;
                })()
                : null;

            return (
                <View key={card.id} style={{ marginRight: 12, position: 'relative' }}>
                  <CardComponent
                      card={card}
                      onPress={() => handleCardPress(card)}
                      disabled={!isPlayerTurn || !attackMode}
                      aiHighlight={getCardHighlightType(card.id!)}
                      damageAnimation={getDamageAnimationForCard(card.id!)}
                      size={cardSize}
                  />

                  {/* Damage + affinity preview badge */}
                  {attackMode && isPlayerTurn && preview && (
                      <View style={styles.previewBadge}>
                        <Text
                            style={[
                              styles.previewText,
                              preview.affinity > 0 && { color: '#4ECDC4' },   // green/blue for positive bonus
                              preview.affinity < 0 && { color: '#FF6B6B' },   // red for negative bonus
                            ]}
                        >
                          {preview.total}
                          {preview.affinity ? ` (${preview.affinity > 0 ? '+' : ''}${preview.affinity})` : ''}
                        </Text>
                      </View>
                  )}
                </View>
            );
          })}
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
            {aiVisualState.isActive && (
              <Text style={styles.aiStatusText}>
                🤖 {aiVisualState.message || getAIStatusMessage(aiVisualState.status)}
              </Text>
            )}
          </View>
          <View style={styles.controlsBar}>
            <TouchableOpacity 
              style={styles.sizeToggle}
              onPress={() => setCardSize(cardSize === 'small' ? 'normal' : 'small')}
            >
              <Text style={styles.sizeToggleText}>
                {cardSize === 'small' ? '⊞' : '⊟'}
              </Text>
            </TouchableOpacity>
            
            {showBattleLog && (
              <TouchableOpacity 
                style={[styles.sizeToggle, styles.logToggle, sidebarVisible && styles.logToggleActive]}
                onPress={toggleSidebar}
              >
                <Text style={[styles.sizeToggleText, sidebarVisible && styles.logToggleTextActive]}>
                  📋
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
              aiHighlight={getCardHighlightType(card.id!)}
              damageAnimation={getDamageAnimationForCard(card.id!)}
              size={cardSize}
              playerEnergy={playerAtBottom.energy}
              currentTurn={gameState.turnNumber}
              isFirstPlayer={playerAtBottom.id === gameState.players[0].id}
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
              aiHighlight={getCardHighlightType(card.id!)}
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
      
      {/* Reusable Sidebar */}
      {showBattleLog && (
        <Sidebar
          visible={sidebarVisible}
          onClose={closeSidebar}
          title="Action Log"
        >
          <ActionLog logs={actionLog} sidebarMode={true} />
        </Sidebar>
      )}
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
    boxShadow: '0px 1px 2.22px 0px rgba(0, 0, 0, 0.22)',
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
  controlsBar: {
    flexDirection: 'row',
    gap: 8,
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
  logToggle: {
    backgroundColor: Colors.background.primary,
  },
  logToggleActive: {
    backgroundColor: Colors.accent[500],
  },
  logToggleTextActive: {
    color: Colors.text.primary,
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
  aiStatusText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
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
  previewBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  previewText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});