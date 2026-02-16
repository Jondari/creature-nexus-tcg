import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnergyOrbAnimation } from './EnergyOrbAnimation';
import { EnergyWaveAnimation } from './EnergyWaveAnimation';
import { SpellCastAnimation } from './SpellCastAnimation';
import { DamageEffect } from '../DamageEffect';
import { CardComponent } from '../CardComponent';
import { CardLoader } from '../../utils/game/cardLoader';
import { RewardAnimation } from './RewardAnimation';
import { generateRandomCard } from '@/utils/cardUtils';
import { STANDARD_PACK } from '@/data/boosterPacks';
import Colors from '@/constants/Colors';
import { CARD_ENTRY_DURATION_MS } from '@/constants/animation';
import { t } from '@/utils/i18n';
import type { Element } from '@/types/game';

export const EnergyAnimationDemo: React.FC = () => {
  const router = useRouter();
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  // Get a sample spell for testing
  const spellCards = CardLoader.getSpellCards();
  const energyCatalyst = spellCards.find(card => card.name === 'Energy Catalyst');
  const testSpell = energyCatalyst || spellCards[0]; // Use Energy Catalyst or first spell as fallback

  // State for DamageEffect demos
  const [damageActive, setDamageActive] = useState(false);
  const [damageConfig, setDamageConfig] = useState<{
    damage: number;
    isLethal: boolean;
    attackElement?: Element;
  }>({ damage: 30, isLethal: false });

  // State for card entry animation demo
  const [entryDemoVisible, setEntryDemoVisible] = useState(false);
  const [entryDemoKey, setEntryDemoKey] = useState(0);
  const sampleCard = CardLoader.getMonsterCards()[0];

  const triggerEntryDemo = useCallback(() => {
    setEntryDemoVisible(false);
    // Small delay to remount the component with a fresh key
    setTimeout(() => {
      setEntryDemoKey(k => k + 1);
      setEntryDemoVisible(true);
    }, 50);
    // Auto-dismiss after animation completes
    setTimeout(() => setEntryDemoVisible(false), CARD_ENTRY_DURATION_MS + 800);
  }, []);

  const triggerDamageDemo = (config: typeof damageConfig) => {
    setDamageActive(false);
    setDamageConfig(config);
    // Small delay to reset the component
    setTimeout(() => setDamageActive(true), 50);
    setTimeout(() => setDamageActive(false), 1200);
  };

  const animations = [
    { labelKey: 'demo.animation.buttons.orb', component: EnergyOrbAnimation, key: 'orb' },
    { labelKey: 'demo.animation.buttons.wave', component: EnergyWaveAnimation, key: 'wave' },
    { labelKey: 'demo.animation.buttons.spellHuman', component: SpellCastAnimation, key: 'spell-human' },
    { labelKey: 'demo.animation.buttons.spellAI', component: SpellCastAnimation, key: 'spell-ai' },
    { labelKey: 'demo.animation.buttons.rewardCoins', component: RewardAnimation, key: 'reward-coins' },
    { labelKey: 'demo.animation.buttons.rewardPack', component: RewardAnimation, key: 'reward-pack' },
    { labelKey: 'demo.animation.buttons.rewardCard', component: RewardAnimation, key: 'reward-card' },
  ] as const;

  const damageAnimations = [
    { label: 'Damage (Normal)', key: 'dmg-normal', config: { damage: 30, isLethal: false } },
    { label: 'Damage (Lethal)', key: 'dmg-lethal', config: { damage: 80, isLethal: true } },
    { label: 'Damage (Fire)', key: 'dmg-fire', config: { damage: 45, isLethal: false, attackElement: 'fire' as Element } },
    { label: 'Damage (Water)', key: 'dmg-water', config: { damage: 45, isLethal: false, attackElement: 'water' as Element } },
    { label: 'Damage (Earth)', key: 'dmg-earth', config: { damage: 45, isLethal: false, attackElement: 'earth' as Element } },
    { label: 'Damage (Air)', key: 'dmg-air', config: { damage: 45, isLethal: false, attackElement: 'air' as Element } },
    { label: 'Lethal Fire', key: 'dmg-lethal-fire', config: { damage: 120, isLethal: true, attackElement: 'fire' as Element } },
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
      case 'reward-coins':
        return (
          <RewardAnimation
            type="coins"
            message={t('redeem.reward.coins', { amount: String(100) })}
            coins={100}
            onComplete={onAnimationComplete}
          />
        );
      case 'reward-pack':
        return (
          <RewardAnimation
            type="pack"
            message={t('redeem.reward.pack', { name: STANDARD_PACK.name })}
            pack={STANDARD_PACK as any}
            onComplete={onAnimationComplete}
          />
        );
      case 'reward-card': {
        const demoCard = generateRandomCard();
        return (
          <RewardAnimation
            type="card"
            message={t('redeem.reward.card', { name: demoCard.name })}
            card={demoCard as any}
            onComplete={onAnimationComplete}
          />
        );
      }
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
            <Text style={styles.title}>{t('demo.animation.title')}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.subtitle}>{t('demo.animation.subtitle')}</Text>
        </View>
        
        <ScrollView style={styles.buttonScroll} contentContainerStyle={styles.buttonContainer}>
          <Text style={styles.sectionTitle}>Card Lifecycle</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={triggerEntryDemo}
          >
            <Text style={styles.buttonText}>Card Entry</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Damage Effects</Text>
          {damageAnimations.map((anim) => (
            <TouchableOpacity
              key={anim.key}
              style={styles.button}
              onPress={() => triggerDamageDemo(anim.config)}
            >
              <Text style={styles.buttonText}>{anim.label}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Other Animations</Text>
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
              <Text style={styles.buttonText}>{t(animation.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.gameArea}>
          <Text style={styles.gameText}>{t('game.title')}</Text>
          <Text style={styles.gameSubtext}>{t('demo.animation.gameSubtitle')}</Text>
        </View>

        {renderAnimation()}

        {damageActive && (
          <View style={styles.damageOverlay}>
            <DamageEffect
              isActive={damageActive}
              duration={1000}
              damage={damageConfig.damage}
              isLethal={damageConfig.isLethal}
              attackElement={damageConfig.attackElement}
            >
              <View style={styles.demoCard}>
                <Text style={styles.demoCardTitle}>Demo Creature</Text>
                <Text style={styles.demoCardHp}>HP: 100</Text>
                <Text style={styles.demoCardElement}>
                  {damageConfig.attackElement || 'neutral'}
                </Text>
              </View>
            </DamageEffect>
          </View>
        )}

        {entryDemoVisible && sampleCard && (
          <View style={styles.damageOverlay}>
            <CardComponent
              key={`entry-demo-${entryDemoKey}`}
              card={sampleCard}
              entryAnimation
              size="small"
            />
          </View>
        )}
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
  buttonScroll: {
    maxHeight: '70%',
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
  sectionTitle: {
    color: Colors.accent[400],
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  damageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  demoCard: {
    width: 140,
    height: 180,
    backgroundColor: Colors.primary[600],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary[400],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  demoCardTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  demoCardHp: {
    color: '#FF6B6B',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  demoCardElement: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
});
