import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Card } from '../models/Card';
import CardItem from './CardItem';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

interface PackOpeningAnimationProps {
  cards: Card[];
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

export default function PackOpeningAnimation({ cards, onComplete }: PackOpeningAnimationProps) {
  const backgroundOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.5);
  
  useEffect(() => {
    // Start animation sequence
    backgroundOpacity.value = withTiming(1, { duration: 800 });
    
    // Animate title
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 500 });
      titleScale.value = withTiming(1, { 
        duration: 800,
        easing: Easing.out(Easing.back(2))
      });
    }, 400);
    
    // Call onComplete after all animations finish
    const animationDuration = 500 + (cards.length * 300) + 1000;
    setTimeout(() => {
      onComplete();
    }, animationDuration);
  }, []);
  
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value
    };
  });
  
  const titleStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ scale: titleScale.value }]
    };
  });
  
  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(18, 22, 38, 0.95)']}
        style={styles.background}
      />
      
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>Pack Opened!</Text>
        <Text style={styles.subtitle}>You received {cards.length} new cards</Text>
      </Animated.View>
      
      <View style={styles.cardsContainer}>
        {cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            showAnimation={true}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.accent[300],
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: width > 600 ? 600 : width,
  },
});