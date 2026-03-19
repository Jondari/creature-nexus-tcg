import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CardComponent } from '../CardComponent';
import { CardActionButtons } from '../CardActionButtons';
import { Card } from '../../types/game';
import Colors from '../../constants/Colors';
import { HandLayout } from '../../context/SettingsContext';

interface PlayerHandProps {
  label: string;
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (card: Card) => void;
  onPlayCard: (cardId: string) => void;
  disabled?: boolean;
  cardSize?: 'small' | 'normal';
  layout?: HandLayout;
  viewportWidth: number;
  containerRef?: React.Ref<View>;
  aiHighlight?: (cardId: string) => 'selected' | 'target' | null;
  canPlayCard?: (card: Card) => boolean;
}

type HandMetrics = {
  cardSpan: number;
  spacing: number;
  contentWidth: number;
  railWidth: number;
  railHeight: number;
  maxRotation: number;
  arcDepth: number;
  selectedLift: number;
  baseTopOffset: number;
  horizontalPadding: number;
};

function getHandMetrics(count: number, viewportWidth: number, cardSize: 'small' | 'normal'): HandMetrics {
  const isSmall = cardSize === 'small';
  const cardSpan = isSmall ? 148 : 296;
  const availableWidth = Math.max(280, viewportWidth - (isSmall ? 40 : 80));
  const minSpacing = isSmall ? 56 : 112;
  const idealSpacing = isSmall ? 92 : 184;
  const spacing = count > 1
    ? Math.min(idealSpacing, Math.max(minSpacing, (availableWidth - cardSpan) / (count - 1)))
    : 0;
  const contentWidth = cardSpan + spacing * Math.max(0, count - 1);
  const railWidth = Math.max(cardSpan, contentWidth);

  return {
    cardSpan,
    spacing,
    contentWidth,
    railWidth,
    railHeight: isSmall ? 250 : 500,
    maxRotation: isSmall ? 11 : 8,
    arcDepth: isSmall ? 20 : 32,
    selectedLift: isSmall ? 26 : 42,
    baseTopOffset: isSmall ? 24 : 38,
    horizontalPadding: isSmall ? 10 : 18,
  };
}

export function PlayerHand({
  label,
  cards,
  selectedCardId,
  onSelectCard,
  onPlayCard,
  disabled = false,
  cardSize = 'small',
  layout = 'fan',
  viewportWidth,
  containerRef,
  aiHighlight,
  canPlayCard,
}: PlayerHandProps) {
  if (layout === 'classic') {
    return (
      <View style={styles.classicHand} ref={containerRef}>
        <Text style={styles.classicLabel}>{label}</Text>
        <ScrollView horizontal style={styles.classicCardRow}>
          {cards.map((card) => {
            const isSelected = selectedCardId === card.id;
            const canPlay = canPlayCard ? canPlayCard(card) : true;

            return (
              <View key={card.id} style={styles.classicCardWrapper}>
                <CardComponent
                  card={card}
                  selected={isSelected}
                  onPress={() => onSelectCard(card)}
                  disabled={disabled}
                  aiHighlight={card.id ? aiHighlight?.(card.id) : null}
                  size={cardSize}
                />

                <CardActionButtons
                  visible={isSelected && !disabled && canPlay}
                  showPlay={true}
                  onPlay={() => card.id && onPlayCard(card.id)}
                  cardSize={cardSize}
                  card={card}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  const metrics = getHandMetrics(cards.length, viewportWidth, cardSize);
  const centerIndex = (cards.length - 1) / 2;

  return (
    <View style={styles.handSection} ref={containerRef}>
      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.scrollInner,
            {
              minWidth: viewportWidth - 16,
              paddingHorizontal: metrics.horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.fanRail,
              {
                width: metrics.railWidth,
                height: metrics.railHeight,
              },
            ]}
          >
            {cards.map((card, index) => {
              const relativeIndex = centerIndex === 0 ? 0 : (index - centerIndex) / centerIndex;
              const curveFactor = Math.abs(relativeIndex);
              const isSelected = selectedCardId === card.id;
              const canPlay = canPlayCard ? canPlayCard(card) : true;
              const topOffset = metrics.baseTopOffset + curveFactor * metrics.arcDepth - (isSelected ? metrics.selectedLift : 0);
              const rotation = relativeIndex * metrics.maxRotation;

              return (
                <View
                  key={card.id}
                  style={[
                    styles.cardSlot,
                    {
                      left: index * metrics.spacing,
                      top: Math.max(0, topOffset),
                      zIndex: isSelected ? 1000 : index + 1,
                      transform: [{ rotate: `${rotation}deg` }],
                    },
                  ]}
                >
                  <CardComponent
                    card={card}
                    selected={isSelected}
                    onPress={() => onSelectCard(card)}
                    disabled={disabled}
                    aiHighlight={card.id ? aiHighlight?.(card.id) : null}
                    size={cardSize}
                  />

                  <CardActionButtons
                    visible={isSelected && !disabled && canPlay}
                    showPlay={canPlay}
                    onPlay={() => card.id && onPlayCard(card.id)}
                    cardSize={cardSize}
                    card={card}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  classicHand: {
    margin: 8,
    marginBottom: 16,
  },
  classicLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.text.primary,
  },
  classicCardRow: {
    flexDirection: 'row',
  },
  classicCardWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  handSection: {
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollInner: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 14,
  },
  fanRail: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  cardSlot: {
    position: 'absolute',
  },
});
