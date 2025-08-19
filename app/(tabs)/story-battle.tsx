import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { GameProvider, useGame } from '@/context/GameContext';
import { useDecks } from '@/context/DeckContext';
import { GameBoard } from '@/components/GameBoard';
import {getAIDeckForBattle, useStoryMode} from '@/context/StoryModeContext';
import { StoryChapter, StoryBattle } from '@/data/storyMode';
import { showAlert, showErrorAlert, showSuccessAlert, showConfirmAlert } from '@/utils/alerts';
import Colors from '@/constants/Colors';
import LoadingOverlay from '@/components/LoadingOverlay';

interface StoryBattleParams {
  chapterId: string;
  battleId: string;
  session?: string; // cache-buster to remount provider on Android
}

function StoryBattleContent() {
  const router = useRouter();
  const { chapterId, battleId } = useLocalSearchParams<StoryBattleParams>();
  const { gameState, gameEngine, initializeGame, resetGame } = useGame();
  const { activeDeck, savedDecks } = useDecks();
  const { chapters, completeBattle } = useStoryMode();
  const [loading, setLoading] = useState(true);
  const [battle, setBattle] = useState<StoryBattle | null>(null);
  const [chapter, setChapter] = useState<StoryChapter | null>(null);

  // Main initialization effect
  useEffect(() => {
    if (__DEV__) {
      console.log('Story battle effect triggered:', { 
        chapterId, 
        battleId, 
        savedDecksLength: savedDecks.length,
        loading 
      });
    }

    if (chapterId && battleId) {
      if (savedDecks.length === 0) {
        // Stop loading and show alert immediately
        setLoading(false);
        showAlert(
          'No Decks Available',
          'You need to build at least one deck before entering battle. Go to the Decks tab to build your first deck.',
          [
            { text: 'Go to Decks', onPress: () => router.push('/(tabs)/decks') },
            { 
              text: 'Cancel', 
              onPress: () => {
                // Return to chapter map if we have chapterId, otherwise story mode
                if (chapterId) {
                  router.push({
                    pathname: '/(tabs)/chapter-map',
                    params: { chapterId }
                  });
                } else {
                  router.push('/(tabs)/story-mode');
                }
              }
            }
          ],
          'warning'
        );
      } else {
        initializeBattle();
      }
    }
  }, [chapterId, battleId, savedDecks.length]);

  // Handle screen focus to re-check deck availability
  useFocusEffect(
    React.useCallback(() => {
      if (__DEV__) {
        console.log('Story battle screen focused:', { 
          savedDecksLength: savedDecks.length,
          loading,
          chapterId,
          battleId
        });
      }
      
      // If no decks available, show alert regardless of loading state
      if (savedDecks.length === 0 && chapterId && battleId) {
        setLoading(false);
        showAlert(
          'No Decks Available',
          'You need to build at least one deck before entering battle. Go to the Decks tab to build your first deck.',
          [
            { text: 'Go to Decks', onPress: () => router.push('/(tabs)/decks') },
            { 
              text: 'Cancel', 
              onPress: () => {
                // Return to chapter map if we have chapterId, otherwise story mode
                if (chapterId) {
                  router.push({
                    pathname: '/(tabs)/chapter-map',
                    params: { chapterId }
                  });
                } else {
                  router.push('/(tabs)/story-mode');
                }
              }
            }
          ],
          'warning'
        );
      }
    }, [savedDecks.length, chapterId, battleId, router])
  );

  // Monitor game state for completion
  useEffect(() => {
    if (gameState?.isGameOver && gameState.winner && battle && chapter) {
      handleBattleComplete(gameState.winner);
    }
  }, [gameState?.isGameOver, gameState?.winner]);

  const initializeBattle = async () => {
    try {
      setLoading(true);
      
      if (!chapterId || !battleId) {
        router.back();
        return;
      }


      const foundChapter = chapters.find(c => c.id === parseInt(chapterId));
      if (!foundChapter) {
        showErrorAlert('Error', 'Chapter not found', () => router.replace('/(tabs)/story-mode'));
        return;
      }

      const foundBattle = foundChapter.battles.find(b => b.id === battleId);
      if (!foundBattle) {
        showErrorAlert('Error', 'Battle not found', () => router.replace('/(tabs)/chapter-map?chapterId=' + foundChapter.id));
        return;
      }


      setChapter(foundChapter);
      setBattle(foundBattle);

      // Generate AI deck for this battle
      const aiDeck = getAIDeckForBattle(
          foundChapter.id,
          foundChapter.battles.findIndex(b => b.id === foundBattle.id),
          foundBattle.isBoss
      );

      // Always clear any previous engine before starting a new battle (important on replay)
      resetGame(); // ensure a clean engine/context
      // Initialize the game with player deck vs AI deck
      initializeGame('Player', activeDeck.cards, aiDeck);
      
    } catch (error) {
      console.error('Error initializing story battle:', error);
      showErrorAlert('Error', 'Failed to initialize battle', () => router.back());
    } finally {
      setLoading(false);
    }
  };

  const handleBattleComplete = (winnerId: string) => {
    if (!battle || !chapter) return;

    const isPlayerWin = winnerId === 'player1';

    if (isPlayerWin) {
      // Update battle progress using context
      completeBattle(chapter.id, battle.id);
      
      showSuccessAlert(
        'Victory!',
        `You have defeated ${battle.name}! ${battle.isBoss ? 'Boss conquered!' : 'Well fought!'}`,
        () => {
          resetGame();
          // Navigate back to the specific chapter map
          router.push({
            pathname: '/(tabs)/chapter-map',
            params: { chapterId: chapter.id.toString() }
          });
        }
      );
    } else {
      showAlert(
        'Defeat',
        `You were defeated by ${battle.name}. Train harder and try again!`,
        [
          {
            text: 'Retry',
            onPress: () => {
              resetGame();
              initializeBattle(); // Restart the battle
            }
          },
          {
            text: 'Return to Map',
            onPress: () => {
              resetGame();
              // Navigate back to the specific chapter map
              router.push({
                pathname: '/(tabs)/chapter-map',
                params: { chapterId: chapter.id.toString() }
              });
            }
          }
        ],
        'error'
      );
    }
  };

  const handleBackPress = () => {
    showConfirmAlert(
      'Leave Battle',
      'Are you sure you want to leave this battle? Your progress will be lost.',
      () => {
        resetGame();
        // Navigate back to story mode instead of using router.back()
        router.push('/(tabs)/story-mode');
      },
      undefined,
      'Leave',
      'Stay'
    );
  };

  if (loading) {
    return <LoadingOverlay message="Preparing battle..." />;
  }

  if (!gameState || !gameEngine) {
    return <LoadingOverlay message="Loading game..." />;
  }

  return (
    <View style={styles.container}>
      <GameBoard onBackPress={handleBackPress} />
    </View>
  );
}

export default function StoryBattleScreen() {
  const { chapterId, battleId, session } = useLocalSearchParams<{
    chapterId: string; battleId: string; session?: string;
  }>();

  // Ensure a fresh GameContext per battle
  return (
    <GameProvider key={`${chapterId}:${battleId}:${session ?? ''}`}>
      <StoryBattleContent />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});