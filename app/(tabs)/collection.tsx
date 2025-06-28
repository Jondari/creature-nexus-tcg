import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardRarity } from '@/models/Card';
import Colors from '@/constants/Colors';
import CardGrid from '@/components/CardGrid';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function CollectionScreen() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CardRarity | 'all'>('all');
  
  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user]);

  // Refetch cards when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchUserCards();
      }
    }, [user])
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
        <Text style={styles.title}>My Collection</Text>
        <Text style={styles.subtitle}>
          {cards.length} {cards.length === 1 ? 'card' : 'cards'} collected
        </Text>
      </View>
      
      <CardGrid 
        cards={cards} 
        filter={filter} 
        onFilterChange={handleFilterChange} 
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
});