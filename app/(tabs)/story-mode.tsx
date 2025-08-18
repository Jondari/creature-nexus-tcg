import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import ChapterSelection from '@/components/ChapterSelection';
import { useStoryMode } from '@/context/StoryModeContext';
import LoadingOverlay from '@/components/LoadingOverlay';
import Colors from '@/constants/Colors';

export default function StoryModeScreen() {
  const router = useRouter();
  const { chapters, isLoading } = useStoryMode();

  const handleChapterSelect = (chapter: any) => {
    // Navigate to the specific chapter map
    router.push({
      pathname: '/(tabs)/chapter-map',
      params: { chapterId: chapter.id.toString() }
    });
  };

  const handleBackPress = () => {
    router.push('/(tabs)/battle');
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading story mode..." />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary[900], Colors.background.primary]}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color={Colors.text.primary} />
      </TouchableOpacity>
      
      <ChapterSelection 
        chapters={chapters}
        onChapterSelect={handleChapterSelect}
      />
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 100,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.card,
  },
});