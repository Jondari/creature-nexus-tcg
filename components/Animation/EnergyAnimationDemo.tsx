import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnergyOrbAnimation } from './EnergyOrbAnimation';
import { EnergyWaveAnimation } from './EnergyWaveAnimation';
import { SpellCastAnimation } from './SpellCastAnimation';
import { CardLoader } from '../../utils/game/cardLoader';
import Colors from '@/constants/Colors';

export const EnergyAnimationDemo: React.FC = () => {
  const router = useRouter();
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  // Get a sample spell for testing
  const spellCards = CardLoader.getSpellCards();
  const energyCatalyst = spellCards.find(card => card.name === 'Energy Catalyst');
  const testSpell = energyCatalyst || spellCards[0]; // Use Energy Catalyst or first spell as fallback

  const animations = [
    { name: 'Orb Animation', component: EnergyOrbAnimation, key: 'orb' },
    { name: 'Wave Animation', component: EnergyWaveAnimation, key: 'wave' },
    { name: 'Spell Cast (Human)', component: SpellCastAnimation, key: 'spell-human' },
    { name: 'Spell Cast (AI)', component: SpellCastAnimation, key: 'spell-ai' },
  ];

  const triggerAnimation = (key: string) => {
    setActiveAnimation(key);
  };

  const onAnimationComplete = () => {
    setActiveAnimation(null);
  };

  const renderAnimation = () => {
    const energyAmount = Math.floor(Math.random() * 5) + 1;
    
    switch (activeAnimation) {
      case 'orb':
        return <EnergyOrbAnimation energyAmount={energyAmount} onComplete={onAnimationComplete} />;
      case 'wave':
        return <EnergyWaveAnimation energyAmount={energyAmount} onComplete={onAnimationComplete} />;
      case 'spell-human':
        return testSpell ? (
          <SpellCastAnimation 
            spell={testSpell as any}
            startPosition={{ x: 50, y: 600 }}
            onComplete={onAnimationComplete}
          />
        ) : null;
      case 'spell-ai':
        return testSpell ? (
          <SpellCastAnimation 
            spell={testSpell as any}
            startPosition={{ x: 50, y: 100 }}
            onComplete={onAnimationComplete}
          />
        ) : null;
      default:
        return null;
    }
  };

  const handleBackPress = () => {
    router.push('/(tabs)/profile');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary[900], Colors.background.primary]}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Animation Demo</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.subtitle}>Tap buttons to see different energy and spell animations</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.buttonContainer}>
          {animations.map((animation) => (
            <TouchableOpacity
              key={animation.key}
              style={[
                styles.button,
                activeAnimation === animation.key && styles.buttonActive
              ]}
              onPress={() => triggerAnimation(animation.key)}
              disabled={activeAnimation !== null}
            >
              <Text style={styles.buttonText}>{animation.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.gameArea}>
          <Text style={styles.gameText}>Creature Nexus TCG</Text>
          <Text style={styles.gameSubtext}>Animations appear over gameplay without disruption</Text>
        </View>

        {renderAnimation()}
      </SafeAreaView>
    </View>
  );
};

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
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary[800],
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40, // Same width as back button to center title
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary[800],
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
  buttonActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.accent[500],
  },
  buttonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  gameArea: {
    flex: 1,
    backgroundColor: Colors.primary[700],
    margin: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  gameText: {
    color: Colors.text.primary,
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
  },
  gameSubtext: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});