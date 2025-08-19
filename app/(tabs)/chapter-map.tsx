import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import StoryMap from '@/components/StoryMap';
import { useStoryMode } from '@/context/StoryModeContext';
import { StoryChapter, StoryBattle } from '@/data/storyMode';
import { showAlert, showErrorAlert } from '@/utils/alerts';
import Colors from '@/constants/Colors';

export default function ChapterMapScreen() {
  const router = useRouter();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const { chapters } = useStoryMode();
  const [chapter, setChapter] = useState<StoryChapter | null>(null);

  useEffect(() => {
    if (chapterId && chapters.length > 0) {
      const foundChapter = chapters.find(c => c.id === parseInt(chapterId));
      if (foundChapter) {
        setChapter(foundChapter);
      } else {
        router.replace('/(tabs)/story-mode');
      }
    }
  }, [chapterId, chapters]);

  const handleBattleSelect = (battle: StoryBattle) => {
    if (!battle.isAccessible) {
      showErrorAlert('Battle Locked', 'Complete previous battles to unlock this one.');
      return;
    }

    if (battle.isCompleted) {
      showAlert(
        'Battle Completed',
        'You have already completed this battle. Do you want to replay it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replay', onPress: () => setTimeout(() => startBattle(battle), 0) }
        ],
        'warning'
      );
      return;
    }

    startBattle(battle);
  };

  const startBattle = (battle: StoryBattle) => {
    if (!chapter) return;

    showAlert(
      `${battle.name}`,
      `${battle.description}\n\nDifficulty: ${battle.isBoss ? 'Boss Battle' : 'Normal Battle'}\nElement: ${chapter.element}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Battle', 
          onPress: () => {
            // Navigate to story battle screen
            router.push({
              pathname: '/(tabs)/story-battle',
              params: { 
                chapterId: chapter.id.toString(),
                battleId: battle.id,
                session: Date.now().toString(), // cache-buster for provider remount
              }
            });
          }
        }
      ],
      'warning'
    );
  };

  const handleBackPress = () => {
    router.push('/(tabs)/story-mode');
  };

  if (!chapter) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary[900], Colors.background.primary]}
          style={styles.background}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chapter...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[chapter.colorTheme.background, Colors.background.primary]}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.chapterNumber}>Chapter {chapter.id}</Text>
          <Text style={styles.chapterTitle}>{chapter.name}</Text>
        </View>
      </View>

      {/* Chapter Map */}
      <View style={styles.mapContainer}>
        <StoryMap 
          chapter={chapter}
          onBattleSelect={handleBattleSelect}
        />
      </View>

      {/* Chapter Info */}
      <View style={styles.infoContainer}>
        <LinearGradient
          colors={[chapter.colorTheme.primary + '20', 'transparent']}
          style={styles.infoGradient}
        >
          <Text style={styles.chapterDescription}>{chapter.description}</Text>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Progress: {chapter.battles.filter(b => b.isCompleted).length}/{chapter.battles.length} battles
            </Text>
            {chapter.isCompleted && (
              <Text style={styles.completedText}>✓ Chapter Completed!</Text>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    //paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.card,
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  chapterNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  chapterTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: 20,
    backgroundColor: Colors.background.card,
  },
  chapterDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  completedText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFD700',
  },
});