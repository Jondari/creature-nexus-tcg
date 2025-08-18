import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { GameProvider } from '@/context/GameContext';
import { GameBoard } from '@/components/GameBoard';
import Colors from '@/constants/Colors';

export default function QuickBattleScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.push('/(tabs)/battle');
  };

  return (
    <GameProvider>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <GameBoard onBackPress={handleBackPress} />
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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