import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardRarity } from '@/models/Card';
import Colors from '@/constants/Colors';
import CardGrid from '@/components/CardGrid';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function CollectionScreen() {
  const { user } = useAuth();
  const { cardSize, setCardSize } = useSettings();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CardRarity | 'all'>('all');
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user]);

  // Refetch cards when screen comes into focus (but not too frequently)
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      // Only refetch if more than 5 seconds have passed since last fetch
      if (user && (now - lastFetchTime > 5000)) {
        fetchUserCards();
      }
    }, [user, lastFetchTime])
  );
  
  const fetchUserCards = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCards(userData.cards || []);
        setLastFetchTime(Date.now());
      }
    } catch (error) {
      console.error('Error fetching user cards:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilter: CardRarity | 'all') => {
    setFilter(newFilter);
  };
  
  if (loading) {
    return <LoadingOverlay message="Loading your collection..." />;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>My Collection</Text>
            <Text style={styles.subtitle}>
              {cards.length} {cards.length === 1 ? 'card' : 'cards'} collected
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.sizeToggle}
            onPress={() => setCardSize(cardSize === 'small' ? 'normal' : 'small')}
          >
            <Text style={styles.sizeToggleText}>
              {cardSize === 'small' ? '⊞' : '⊟'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <CardGrid 
        cards={cards} 
        filter={filter} 
        onFilterChange={handleFilterChange}
        cardSize={cardSize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  sizeToggle: {
    backgroundColor: Colors.background.card,
    borderRadius: 8,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeToggleText: {
    fontSize: 18,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
});