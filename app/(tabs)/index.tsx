import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { generateCardPack, canOpenNewPack, getTimeUntilNextPack } from '@/utils/cardUtils';
import { generatePackCards } from '@/utils/boosterUtils';
import { FREE_DAILY_PACK, getPackById } from '@/data/boosterPacks';
import { getInventoryPacks, removePackFromInventory, InventoryPack } from '@/utils/packInventory';
import { Card } from '@/models/Card';
import { PackageOpen } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import CountdownTimer from '@/components/CountdownTimer';
import PackOpeningAnimation from '@/components/PackOpeningAnimation';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useFocusEffect } from '@react-navigation/native';

export default function OpenPackScreen() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showPackResults, setShowPackResults] = useState(false);
  const [packResults, setPackResults] = useState<Card[]>([]);
  const [inventoryPacks, setInventoryPacks] = useState<InventoryPack[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Refresh data when the tab comes into focus (e.g., after purchasing from store)
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      // Only refetch if more than 5 seconds have passed since last fetch
      if (user && (now - lastFetchTime > 5000)) {
        fetchUserData();
      }
    }, [user, lastFetchTime])
  );
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCards(userData.cards || []);
        
        // Check if we can open a new pack
        const lastPackOpenedTimestamp = userData.lastPackOpened?.toMillis();
        if (lastPackOpenedTimestamp) {
          if (!canOpenNewPack(lastPackOpenedTimestamp)) {
            const remaining = getTimeUntilNextPack(lastPackOpenedTimestamp);
            setTimeRemaining(remaining);
          }
        }
      }
      
      // Load inventory packs
      const userInventoryPacks = await getInventoryPacks(user.uid);
      setInventoryPacks(userInventoryPacks);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenPack = async () => {
    try {
      if (!user) return;
      
      setOpening(true);
      
      // Generate a new free daily pack using the booster system
      const newCards = generatePackCards(FREE_DAILY_PACK);
      
      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        cards: arrayUnion(...newCards),
        lastPackOpened: Timestamp.now()
      });
      
      // Update local state
      setCards((prevCards) => [...prevCards, ...newCards]);
      setPackResults(newCards);
      setShowPackResults(true);
      
      // Set the cooldown timer
      setTimeRemaining(12 * 60 * 60 * 1000); // 12 hours in milliseconds
    } catch (error) {
      console.error('Error opening pack:', error);
    } finally {
      setOpening(false);
    }
  };

  const handleOpenInventoryPack = async (inventoryPack: InventoryPack) => {
    try {
      if (!user) return;
      
      setOpening(true);
      
      // Get pack definition
      const packDef = getPackById(inventoryPack.packId);
      if (!packDef) {
        console.error(`Pack ${inventoryPack.packId} not found`);
        return;
      }
      
      // Generate cards using the booster system
      const newCards = generatePackCards(packDef);
      
      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        cards: arrayUnion(...newCards)
      });
      
      // Remove pack from inventory
      await removePackFromInventory(user.uid, inventoryPack);
      
      // Update local state
      setCards((prevCards) => [...prevCards, ...newCards]);
      setPackResults(newCards);
      setShowPackResults(true);
      
      // Refresh inventory
      const updatedInventory = await getInventoryPacks(user.uid);
      setInventoryPacks(updatedInventory);
    } catch (error) {
      console.error('Error opening inventory pack:', error);
    } finally {
      setOpening(false);
    }
  };
  
  const handlePackOpeningComplete = () => {
    setShowPackResults(false);
  };
  
  const handleRefresh = () => {
    fetchUserData();
  };
  
  if (loading) {
    return <LoadingOverlay message="Loading your collection..." />;
  }
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary[900], Colors.background.primary]}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      
      {/* Bolt Hackathon Badge */}
      <TouchableOpacity 
        style={styles.boltBadge}
        onPress={() => Linking.openURL('https://bolt.new/')}
        activeOpacity={0.8}
      >
        <Image 
          source={require('@/assets/images/white_circle_360x360.png')}
          style={styles.boltBadgeImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Creature Nexus</Text>
          <Text style={styles.subtitle}>Open a new pack of cards</Text>
        </View>
        
        {timeRemaining > 0 ? (
          <CountdownTimer 
            timeRemaining={timeRemaining} 
            onComplete={handleRefresh}
          />
        ) : (
          <View style={styles.packContainer}>
            <TouchableOpacity
              style={styles.packButton}
              onPress={handleOpenPack}
              disabled={opening || timeRemaining > 0}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.accent[700], Colors.accent[500]]}
                style={styles.packButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <PackageOpen size={32} color={Colors.text.primary} />
                <Text style={styles.packButtonText}>Open Pack</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.packInfo}>
              Each pack contains 5 random creature cards
            </Text>
          </View>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{cards.length}</Text>
            <Text style={styles.statLabel}>Cards Collected</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.floor(cards.length / 5)}</Text>
            <Text style={styles.statLabel}>Packs Opened</Text>
          </View>
        </View>

        {/* A supprimer */}
        {__DEV__ && (
            <TouchableOpacity onPress={handleOpenPack} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: 'orange', fontWeight: 'bold' }}>
                ⚠ Force open pack (DEV only)
              </Text>
            </TouchableOpacity>
        )}


        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Card Rarities</Text>
          <View style={styles.rarityList}>
            {['common', 'rare', 'epic', 'legendary', 'mythic'].map((rarity) => (
              <View key={rarity} style={styles.rarityItem}>
                <View 
                  style={[
                    styles.rarityDot, 
                    { backgroundColor: Colors[rarity as keyof typeof Colors] as string }
                  ]}
                />
                <Text style={styles.rarityText}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {opening && <LoadingOverlay message="Opening pack..." />}
      
      {showPackResults && (
        <PackOpeningAnimation
          cards={packResults}
          onComplete={handlePackOpeningComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
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
  packContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  packButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    marginBottom: 16,
  },
  packButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packButtonText: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
  },
  packInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '45%',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.accent[500],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  infoContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  rarityList: {
    marginTop: 8,
  },
  rarityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rarityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  rarityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  boltBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 50,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  boltBadgeImage: {
    width: 50,
    height: 50,
  },
});