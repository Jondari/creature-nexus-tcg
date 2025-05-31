import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RARITY_COLORS } from '../models/Card';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay,
  Easing,
  withTiming
} from 'react-native-reanimated';
import Colors from '../constants/Colors';

interface CardItemProps {
  card: Card;
  index?: number;
  showAnimation?: boolean;
  count?: number;
}

const getGlowColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return ['rgba(92, 150, 104, 0.7)', 'rgba(92, 150, 104, 0.1)'];
    case 'rare': return ['rgba(62, 124, 201, 0.7)', 'rgba(62, 124, 201, 0.1)'];
    case 'epic': return ['rgba(152, 85, 212, 0.7)', 'rgba(152, 85, 212, 0.1)'];
    case 'legendary': return ['rgba(223, 140, 43, 0.8)', 'rgba(223, 140, 43, 0.1)'];
    case 'mythic': return ['rgba(232, 75, 85, 0.9)', 'rgba(232, 75, 85, 0.1)'];
    default: return ['rgba(92, 150, 104, 0.7)', 'rgba(92, 150, 104, 0.1)'];
  }
};

const getRarityLabel = (rarity: string) => {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
};

export default function CardItem({ card, index = 0, showAnimation = false, count = 1 }: CardItemProps) {
  const scale = useSharedValue(showAnimation ? 0.8 : 1);
  const opacity = useSharedValue(showAnimation ? 0 : 1);
  const rotate = useSharedValue(showAnimation ? '10deg' : '0deg');
  
  React.useEffect(() => {
    if (showAnimation) {
      // Animation sequence
      opacity.value = withDelay(
        index * 300, 
        withTiming(1, { duration: 500 })
      );
      
      scale.value = withDelay(
        index * 300, 
        withSequence(
          withTiming(1.1, { duration: 400, easing: Easing.out(Easing.exp) }),
          withSpring(1)
        )
      );
      
      rotate.value = withDelay(
        index * 300,
        withTiming('0deg', { duration: 400 })
      );
    }
  }, [showAnimation, index]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: rotate.value }
      ]
    };
  });
  
  const borderColor = RARITY_COLORS[card.rarity];
  const glowColors = getGlowColor(card.rarity);
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={glowColors}
        style={styles.glow}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.card, { borderColor }]}>
        <Image source={{ uri: card.imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.description}>{card.description}</Text>
          <View style={[styles.rarityBadge, { backgroundColor: borderColor }]}>
            <Text style={styles.rarityText}>{getRarityLabel(card.rarity)}</Text>
          </View>
        </View>
        {count > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>x{count}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    width: 160,
    height: 240,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 16,
    zIndex: -1,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: Colors.background.card,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 8,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  rarityText: {
    fontSize: 10,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  countBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
  }
});