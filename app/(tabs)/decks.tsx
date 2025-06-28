import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useDecks } from '@/context/DeckContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card } from '@/models/Card';
import { DeckBuilder } from '@/components/DeckBuilder';
import Colors from '@/constants/Colors';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function DecksScreen() {
  const { user } = useAuth();
  const { savedDecks, activeDeck, saveDeck, deleteDeck, setActiveDeck } = useDecks();
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [editingDeck, setEditingDeck] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user]);

  const fetchUserCards = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserCards(userData.cards || []);
      }
    } catch (error) {
      console.error('Error fetching user cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = () => {
    setEditingDeck(null);
    setShowDeckBuilder(true);
  };

  const handleEditDeck = (deck: any) => {
    setEditingDeck(deck);
    setShowDeckBuilder(true);
  };

  const handleSaveDeck = async (cards: Card[], deckName: string) => {
    try {
      await saveDeck(cards, deckName, editingDeck?.id);
      setShowDeckBuilder(false);
      setEditingDeck(null);
      Alert.alert('Success', 'Deck saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save deck. Please try again.');
    }
  };

  const handleDeleteDeck = (deck: any) => {
    Alert.alert(
      'Delete Deck',
      `Are you sure you want to delete "${deck.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeck(deck.id);
              Alert.alert('Success', 'Deck deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete deck. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSetActiveDeck = async (deck: any) => {
    try {
      await setActiveDeck(deck.id);
      Alert.alert('Success', `"${deck.name}" is now your active deck!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to set active deck. Please try again.');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading your collection..." />;
  }

  if (showDeckBuilder) {
    return (
      <DeckBuilder
        availableCards={userCards}
        onSaveDeck={handleSaveDeck}
        onClose={() => {
          setShowDeckBuilder(false);
          setEditingDeck(null);
        }}
        initialDeck={editingDeck?.cards || []}
        deckName={editingDeck?.name || ''}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Decks</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateDeck}>
          <Text style={styles.createButtonText}>+ New Deck</Text>
        </TouchableOpacity>
      </View>

      {activeDeck && (
        <View style={styles.activeDeckSection}>
          <Text style={styles.sectionTitle}>Active Deck</Text>
          <View style={[styles.deckCard, styles.activeDeckCard]}>
            <View style={styles.deckInfo}>
              <Text style={styles.deckName}>{activeDeck.name}</Text>
              <Text style={styles.deckStats}>
                {activeDeck.cards.length} cards
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditDeck(activeDeck)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.allDecksSection}>
        <Text style={styles.sectionTitle}>All Decks ({savedDecks.length})</Text>
        
        {savedDecks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No decks created yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first deck to start battling!
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.decksList}>
            {savedDecks.map((deck) => (
              <View key={deck.id} style={styles.deckCard}>
                <View style={styles.deckInfo}>
                  <Text style={styles.deckName}>{deck.name}</Text>
                  <Text style={styles.deckStats}>
                    {deck.cards.length} cards
                  </Text>
                  <Text style={styles.deckDate}>
                    Updated: {deck.updatedAt.toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.deckActions}>
                  {activeDeck?.id !== deck.id && (
                    <TouchableOpacity
                      style={styles.setActiveButton}
                      onPress={() => handleSetActiveDeck(deck)}
                    >
                      <Text style={styles.setActiveButtonText}>Set Active</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditDeck(deck)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDeck(deck)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  createButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  activeDeckSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  allDecksSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  deckCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeDeckCard: {
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  deckStats: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  deckDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  deckActions: {
    flexDirection: 'row',
    gap: 8,
  },
  setActiveButton: {
    backgroundColor: Colors.accent[600],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  setActiveButtonText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  decksList: {
    flex: 1,
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
  },
});