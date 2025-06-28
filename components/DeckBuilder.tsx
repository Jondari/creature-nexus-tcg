import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card, CardRarity } from '../models/Card';
import { CardComponent } from './CardComponent';
import { groupCardsByName } from '../utils/cardUtils';
import Colors from '../constants/Colors';

interface DeckBuilderProps {
  availableCards: Card[];
  onSaveDeck: (deck: Card[], deckName: string) => void;
  onClose: () => void;
  initialDeck?: Card[];
  deckName?: string;
}

const DECK_SIZE_MIN = 20;
const DECK_SIZE_MAX = 60;
const MAX_COPIES_PER_CARD = 3;

export function DeckBuilder({ 
  availableCards, 
  onSaveDeck, 
  onClose,
  initialDeck = [],
  deckName: initialDeckName = ''
}: DeckBuilderProps) {
  const [currentDeck, setCurrentDeck] = useState<Card[]>(initialDeck);
  const [deckName, setDeckName] = useState(initialDeckName);
  const [filter, setFilter] = useState<CardRarity | 'all'>('all');

  // Group available cards by name
  const groupedAvailable = groupCardsByName(availableCards);
  const groupedDeck = groupCardsByName(currentDeck);

  // Filter available cards
  const filteredGroups = Object.entries(groupedAvailable).filter(([_, cardGroup]) => {
    if (filter === 'all') return true;
    return cardGroup[0].rarity === filter;
  });

  const addCardToDeck = (card: Card) => {
    const cardsOfSameName = currentDeck.filter(c => c.name === card.name);
    
    if (cardsOfSameName.length >= MAX_COPIES_PER_CARD) {
      Alert.alert('Deck Limit', `You can only have ${MAX_COPIES_PER_CARD} copies of ${card.name} in your deck.`);
      return;
    }

    if (currentDeck.length >= DECK_SIZE_MAX) {
      Alert.alert('Deck Full', `Your deck cannot exceed ${DECK_SIZE_MAX} cards.`);
      return;
    }

    // Find an available card of this name from collection
    const availableCard = availableCards.find(c => 
      c.name === card.name && 
      !currentDeck.some(deckCard => deckCard.id === c.id)
    );

    if (availableCard) {
      setCurrentDeck([...currentDeck, availableCard]);
    }
  };

  const removeCardFromDeck = (cardId: string) => {
    setCurrentDeck(currentDeck.filter(card => card.id !== cardId));
  };

  const getCardCountInDeck = (cardName: string): number => {
    return currentDeck.filter(card => card.name === cardName).length;
  };

  const getAvailableCount = (cardName: string): number => {
    const totalOwned = groupedAvailable[cardName]?.length || 0;
    const inDeck = getCardCountInDeck(cardName);
    return totalOwned - inDeck;
  };

  const canAddCard = (cardName: string): boolean => {
    const inDeck = getCardCountInDeck(cardName);
    const available = getAvailableCount(cardName);
    return inDeck < MAX_COPIES_PER_CARD && available > 0 && currentDeck.length < DECK_SIZE_MAX;
  };

  const handleSave = () => {
    if (currentDeck.length < DECK_SIZE_MIN) {
      Alert.alert('Deck Too Small', `Your deck must have at least ${DECK_SIZE_MIN} cards.`);
      return;
    }

    if (!deckName.trim()) {
      Alert.alert('Deck Name Required', 'Please enter a name for your deck.');
      return;
    }

    onSaveDeck(currentDeck, deckName.trim());
  };

  const filterOptions: Array<CardRarity | 'all'> = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Deck Builder</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Deck Info */}
      <View style={styles.deckInfo}>
        <Text style={styles.deckSize}>
          Deck: {currentDeck.length}/{DECK_SIZE_MAX} cards
        </Text>
        <Text style={styles.deckStatus}>
          {currentDeck.length < DECK_SIZE_MIN 
            ? `Need ${DECK_SIZE_MIN - currentDeck.length} more cards` 
            : 'Deck is valid'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Current Deck */}
        <View style={styles.deckSection}>
          <Text style={styles.sectionTitle}>Current Deck</Text>
          <ScrollView horizontal style={styles.deckScroll}>
            {Object.entries(groupedDeck).map(([name, cards]) => (
              <View key={name} style={styles.deckCardContainer}>
                <CardComponent
                  card={cards[0]}
                  onPress={() => removeCardFromDeck(cards[0].id)}
                  size="small"
                />
                <View style={styles.cardCount}>
                  <Text style={styles.cardCountText}>{cards.length}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Available Cards */}
        <View style={styles.collectionSection}>
          <Text style={styles.sectionTitle}>Your Collection</Text>
          
          {/* Filter */}
          <ScrollView horizontal style={styles.filterScroll}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.filterButton, filter === option && styles.filterButtonActive]}
                onPress={() => setFilter(option)}
              >
                <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>
                  {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cards Grid */}
          <ScrollView style={styles.cardsGrid}>
            <View style={styles.cardsRow}>
              {filteredGroups.map(([name, cardGroup]) => {
                const inDeck = getCardCountInDeck(name);
                const available = getAvailableCount(name);
                const canAdd = canAddCard(name);

                return (
                  <View key={name} style={styles.cardContainer}>
                    <CardComponent
                      card={cardGroup[0]}
                      onPress={() => canAdd && addCardToDeck(cardGroup[0])}
                      disabled={!canAdd}
                      size="small"
                    />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardStats}>
                        In Deck: {inDeck}/{MAX_COPIES_PER_CARD}
                      </Text>
                      <Text style={styles.cardStats}>
                        Available: {available}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700],
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  deckInfo: {
    padding: 16,
    backgroundColor: Colors.background.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  deckSize: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  deckStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  deckSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  deckScroll: {
    flexDirection: 'row',
  },
  deckCardContainer: {
    marginRight: 8,
    position: 'relative',
  },
  cardCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCountText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  collectionSection: {
    flex: 1,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 16,
    minHeight: 48, // Fixed height to prevent size variation
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.background.card,
    height: 32, // Fixed height for consistent button size
    justifyContent: 'center', // Center text vertically
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[600],
  },
  filterText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  filterTextActive: {
    color: Colors.text.primary,
  },
  cardsGrid: {
    flex: 1,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  cardStats: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});