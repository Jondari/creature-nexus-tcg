import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CardComponent } from '../components/CardComponent';
import { CARDS_DATABASE } from '../models/Card';
import Colors from '../constants/Colors';

export default function CardTestScreen() {
  // Group cards by rarity for organized display
  const cardsByRarity = {
    common: CARDS_DATABASE.filter(card => card.rarity === 'common'),
    rare: CARDS_DATABASE.filter(card => card.rarity === 'rare'),
    epic: CARDS_DATABASE.filter(card => card.rarity === 'epic'),
    legendary: CARDS_DATABASE.filter(card => card.rarity === 'legendary'),
    mythic: CARDS_DATABASE.filter(card => card.rarity === 'mythic'),
  };

  const renderRaritySection = (rarity: string, cards: any[]) => (
    <View key={rarity} style={styles.raritySection}>
      <Text style={styles.rarityTitle}>
        {rarity.toUpperCase()} ({cards.length} cards)
      </Text>
      <View style={styles.cardsGrid}>
        {cards.map((card, index) => (
          <View key={`${card.name}-${index}`} style={styles.cardWrapper}>
            <CardComponent
              card={card}
              size="small"
              viewMode="collection"
            />
            <Text style={styles.cardName}>{card.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Monster Cards Illustration Test</Text>
      <Text style={styles.subtitle}>
        Total: {CARDS_DATABASE.length} cards
      </Text>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(cardsByRarity).map(([rarity, cards]) => 
          renderRaritySection(rarity, cards)
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Check each card for missing or incorrect illustrations
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  raritySection: {
    marginBottom: 32,
  },
  rarityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent[400],
    paddingBottom: 8,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardName: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 140,
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});