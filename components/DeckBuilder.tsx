import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Card, CardRarity } from '../models/Card';
import { CardComponent } from './CardComponent';
import { Sidebar } from './Sidebar';
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
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setSidebarVisible(true)} 
            style={styles.deckButton}
          >
            <Text style={styles.deckButtonText}>
              Deck ({currentDeck.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
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
        {/* Available Cards - Using collection-style layout */}
        <View style={styles.collectionSection}>
          <Text style={styles.sectionTitle}>Your Collection</Text>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
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
        </View>

        {/* Cards Grid - Using collection-style layout */}
        <View style={styles.cardsSection}>
          <ScrollView contentContainerStyle={styles.gridContainer}>
            {filteredGroups.map(([name, cardGroup]) => {
              const inDeck = getCardCountInDeck(name);
              const available = getAvailableCount(name);
              const canAdd = canAddCard(name);

              return (
                <View key={name} style={styles.cardContainer}>
                  <View style={styles.cardWithIndicator}>
                    <CardComponent
                      card={cardGroup[0]}
                      onPress={() => canAdd && addCardToDeck(cardGroup[0])}
                      disabled={!canAdd}
                      size="small"
                    />
                    {inDeck > 0 && (
                      <View style={styles.deckIndicator}>
                        <Text style={styles.deckIndicatorText}>{inDeck}</Text>
                      </View>
                    )}
                  </View>
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
          </ScrollView>
        </View>
      </View>

      {/* Deck Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        title="Current Deck"
        width={400}
      >
        <View style={styles.sidebarContent}>
          {/* Deck Name Input */}
          <View style={styles.deckNameSection}>
            <Text style={styles.deckNameLabel}>Deck Name:</Text>
            <TextInput
              style={styles.deckNameInput}
              value={deckName}
              onChangeText={setDeckName}
              placeholder="Enter deck name..."
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          {/* Deck Stats */}
          <View style={styles.deckStats}>
            <Text style={styles.deckStatsText}>
              Total Cards: {currentDeck.length}/{DECK_SIZE_MAX}
            </Text>
            <Text style={[
              styles.deckStatsText,
              currentDeck.length >= DECK_SIZE_MIN ? styles.validDeck : styles.invalidDeck
            ]}>
              {currentDeck.length < DECK_SIZE_MIN 
                ? `Need ${DECK_SIZE_MIN - currentDeck.length} more cards` 
                : 'Deck is valid'}
            </Text>
          </View>

          {/* Deck Cards */}
          <ScrollView style={styles.sidebarDeckList}>
            {Object.entries(groupedDeck).length === 0 ? (
              <Text style={styles.emptyDeckText}>
                No cards in deck. Start adding cards from your collection!
              </Text>
            ) : (
              Object.entries(groupedDeck).map(([name, cards]) => (
                <View key={name} style={styles.sidebarDeckCard}>
                  <CardComponent
                    card={cards[0]}
                    onPress={() => removeCardFromDeck(cards[0].id)}
                    size="small"
                  />
                  <View style={styles.sidebarCardInfo}>
                    <Text style={styles.sidebarCardName}>{name}</Text>
                    <Text style={styles.sidebarCardCount}>
                      Quantity: {cards.length}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeCardButton}
                      onPress={() => removeCardFromDeck(cards[0].id)}
                    >
                      <Text style={styles.removeCardText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Sidebar>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  deckButton: {
    backgroundColor: Colors.accent[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deckButtonText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontSize: 14,
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
  content: {
    flex: 1,
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  collectionSection: {
    paddingHorizontal: 16,
  },
  // Collection-style layout
  filterSection: {
    backgroundColor: Colors.background.primary,
    zIndex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 56,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.background.card,
    height: 32,
    justifyContent: 'center',
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
  cardsSection: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  cardContainer: {
    marginBottom: 12,
  },
  cardWithIndicator: {
    position: 'relative',
  },
  deckIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary[600],
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  deckIndicatorText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  cardStats: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  // Sidebar styles
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  deckNameSection: {
    marginBottom: 16,
  },
  deckNameLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  deckNameInput: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 8,
    padding: 12,
    color: Colors.text.primary,
    fontSize: 14,
  },
  deckStats: {
    backgroundColor: Colors.background.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  deckStatsText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  validDeck: {
    color: Colors.success,
  },
  invalidDeck: {
    color: Colors.error,
  },
  sidebarDeckList: {
    flex: 1,
  },
  emptyDeckText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
    marginTop: 32,
    fontStyle: 'italic',
  },
  sidebarDeckCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  sidebarCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sidebarCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sidebarCardCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  removeCardButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  removeCardText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});