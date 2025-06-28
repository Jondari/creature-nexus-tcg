import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { CardComponent } from './CardComponent';
import { Card, CardRarity, RARITY_COLORS } from '../models/Card';
import { groupCardsByName } from '../utils/cardUtils';
import { CardSize } from '../context/SettingsContext';
import Colors from '../constants/Colors';

interface CardGridProps {
  cards: Card[];
  filter: CardRarity | 'all';
  onFilterChange: (filter: CardRarity | 'all') => void;
  cardSize?: CardSize;
}

export default function CardGrid({ cards, filter, onFilterChange, cardSize = 'small' }: CardGridProps) {
  // Group cards by name to count duplicates
  const groupedCards = groupCardsByName(cards);
  
  // Filter cards if needed
  const filteredGroups = Object.entries(groupedCards).filter(([_, cardGroup]) => {
    if (filter === 'all') return true;
    return cardGroup[0].rarity === filter;
  });
  
  const filterOptions: Array<CardRarity | 'all'> = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic'];
  
  const renderFilterButtons = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterContainer}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              filter === option && styles.filterButtonActive,
              filter === option && option !== 'all' && { backgroundColor: RARITY_COLORS[option as CardRarity] }
            ]}
            onPress={() => onFilterChange(option)}
          >
            <Text 
              style={[
                styles.filterButtonText,
                filter === option && styles.filterButtonTextActive
              ]}
            >
              {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        {renderFilterButtons()}
      </View>
      
      <View style={styles.contentSection}>
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cards found</Text>
            <Text style={styles.emptySubtext}>Open some packs to add cards to your collection</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.gridContainer}>
            {filteredGroups.map(([name, cardGroup]) => (
              <CardComponent 
                key={name} 
                card={cardGroup[0]} 
                viewMode="collection"
                count={cardGroup.length}
                size={cardSize}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: Colors.background.primary,
    zIndex: 1, // Ensure filters stay on top
  },
  contentSection: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 56, // Fixed height to prevent size variation
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
    backgroundColor: Colors.primary[500],
  },
  filterButtonText: {
    color: Colors.text.secondary,
    fontWeight: '500',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: Colors.text.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  }
});