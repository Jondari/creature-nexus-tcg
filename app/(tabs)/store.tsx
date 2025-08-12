import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Platform, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Coins, ShoppingCart, Star, Zap } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import LoadingOverlay from '@/components/LoadingOverlay';
import PackOpeningAnimation from '@/components/PackOpeningAnimation';
import { PACK_CATEGORIES, getAvailablePacks, BoosterPack } from '@/data/boosterPacks';
import { UserCurrency } from '@/models/BoosterPack';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '@/utils/alerts';
import { getUserCurrency, spendNexusCoins, addNexusCoins } from '@/utils/currencyUtils';
import { generatePackCards } from '@/utils/boosterUtils';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/config/firebase';

const { width } = Dimensions.get('window');
const isWideScreen = width >= 768; // Tablet/desktop breakpoint

export default function StoreScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userCurrency, setUserCurrency] = useState<UserCurrency>({ nexusCoins: 0 });
  const [selectedCategory, setSelectedCategory] = useState<'standard' | 'elemental' | 'premium'>('standard');
  const [showPackResults, setShowPackResults] = useState(false);
  const [packResults, setPackResults] = useState<any[]>([]);
  const [currentPackName, setCurrentPackName] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchUserCurrency();
    }
  }, [user]);

  // Refresh currency when the tab comes into focus (e.g., after using dev tools to add coins)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchUserCurrency();
      }
    }, [user])
  );

  const fetchUserCurrency = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const currency = await getUserCurrency(user.uid);
      setUserCurrency(currency);
    } catch (error) {
      console.error('Error fetching user currency:', error);
      showErrorAlert('Error', 'Failed to load your currency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const executePurchase = async (pack: BoosterPack, quantity: number, totalCost: number) => {
    try {
      if (!user) return;
      
      const success = await spendNexusCoins(user.uid, totalCost);
      
      if (success) {
        try {
          // Generate cards but don't show success message yet
          const allCards = [];
          
          // Check if this is a bundle purchase and calculate total packs (including bonus)
          let totalPacksToGenerate = quantity;
          if (pack.bundleDiscount && quantity === pack.bundleDiscount.quantity) {
            // This is a bundle purchase, add the bonus packs
            totalPacksToGenerate = quantity + pack.bundleDiscount.bonus;
            console.log(`Bundle purchase: ${quantity} packs + ${pack.bundleDiscount.bonus} bonus = ${totalPacksToGenerate} total packs`);
          }
          
          for (let i = 0; i < totalPacksToGenerate; i++) {
            const packCards = generatePackCards(pack);
            allCards.push(...packCards);
          }
          
          // Add cards to user collection
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            cards: arrayUnion(...allCards)
          });
          
          // Show pack opening animation
          setCurrentPackName(`${pack.name}${totalPacksToGenerate > 1 ? ` x${totalPacksToGenerate}` : ''}`);
          setPackResults(allCards);
          setShowPackResults(true);
          
          // Refresh currency display
          await fetchUserCurrency();
        } catch (packError) {
          // Something failed after payment - refund the coins
          console.error('Error after payment, refunding coins:', packError);
          try {
            await addNexusCoins(user.uid, totalCost);
            await fetchUserCurrency(); // Refresh to show refund
            showErrorAlert('Purchase Failed', 'Pack opening failed. Your Nexus Coins have been refunded.');
          } catch (refundError) {
            console.error('Error refunding coins:', refundError);
            showErrorAlert('Purchase Failed', 'Pack opening failed and refund failed. Please contact support.');
          }
        }
      } else {
        showErrorAlert('Purchase Failed', 'Transaction failed. Please try again.');
      }
    } catch (error) {
      console.error('Error executing purchase:', error);
      showErrorAlert('Purchase Failed', 'Failed to purchase pack. Please try again.');
    }
  };

  const handlePurchasePack = async (pack: BoosterPack, quantity: number = 1) => {
    try {
      const totalCost = pack.nexusCoinPrice * quantity;
      
      if (userCurrency.nexusCoins < totalCost) {
        showErrorAlert(
          'Insufficient Nexus Coins',
          `You need ${totalCost} Nexus Coins but only have ${userCurrency.nexusCoins}.`
        );
        return;
      }

      showConfirmAlert(
        'Confirm Purchase',
        `Purchase ${quantity} ${pack.name}${quantity > 1 ? 's' : ''} for ${totalCost} Nexus Coins?`,
        () => {
          // Call the async purchase function without making the callback async
          executePurchase(pack, quantity, totalCost);
        }
      );

    } catch (error) {
      console.error('Error purchasing pack:', error);
      showErrorAlert('Purchase Failed', 'Failed to purchase pack. Please try again.');
    }
  };

  const handleRealMoneyPurchase = (pack: BoosterPack) => {
    // TODO: Implement real money payment integration
    showErrorAlert(
      'Coming Soon',
      'Real money purchases will be available in a future update!'
    );
  };

  const renderPackCard = (pack: BoosterPack) => {
    const isFree = pack.nexusCoinPrice === 0;
    
    return (
      <View key={pack.id} style={styles.packCard}>
        <LinearGradient
          colors={[pack.backgroundColor, `${pack.backgroundColor}88`]}
          style={styles.packGradient}
        >

          <View style={styles.packHeader}>
            <Text style={styles.packName}>{pack.name}</Text>
            {pack.isPremium && <Star size={16} color="#ffd700" />}
          </View>
          
          <Text style={styles.packDescription}>{pack.description}</Text>
          
          <View style={styles.packDetails}>
            <Text style={styles.cardCount}>{pack.cardCount} Cards</Text>
            {pack.guaranteedRarity && (
              <Text style={styles.guaranteed}>
                +1 {pack.guaranteedRarity} guaranteed
              </Text>
            )}
          </View>

          {/* Pack Image */}
          {pack.imageUrl && (
              <Image
                  source={pack.imageUrl}
                  style={styles.packImage}
                  resizeMode="contain"
                  onError={(error) => console.log('Pack image failed to load:', pack.imageUrl, error)}
              />
          )}

          {!isFree ? (
            <View style={styles.packPricing}>
              {/* Nexus Coin Purchase */}
              <TouchableOpacity
                style={styles.coinPurchaseButton}
                onPress={() => handlePurchasePack(pack)}
              >
                <View style={styles.priceRow}>
                  <Coins size={16} color="#ffd700" />
                  <Text style={styles.coinPrice}>{pack.nexusCoinPrice}</Text>
                </View>
              </TouchableOpacity>

              {/* Real Money Purchase */}
              {pack.realMoneyPrice && (
                <TouchableOpacity
                  style={styles.moneyPurchaseButton}
                  onPress={() => handleRealMoneyPurchase(pack)}
                >
                  <Text style={styles.moneyPrice}>
                    ${(pack.realMoneyPrice / 100).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Bundle Option */}
              {pack.bundleDiscount && (
                <TouchableOpacity
                  style={styles.bundleButton}
                  onPress={() => handlePurchasePack(pack, pack.bundleDiscount!.quantity)}
                >
                  <Text style={styles.bundleText}>
                    Buy {pack.bundleDiscount.quantity} + {pack.bundleDiscount.bonus} Free
                  </Text>
                  <View style={styles.priceRow}>
                    <Coins size={14} color="#ffd700" />
                    <Text style={styles.bundlePrice}>
                      {pack.nexusCoinPrice * pack.bundleDiscount.quantity}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.freePurchaseButton}
              onPress={() => handlePurchasePack(pack)}
            >
              <Text style={styles.freePurchaseText}>Claim Free Pack</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderCategory = (category: 'standard' | 'elemental' | 'premium', title: string, icon: any) => {
    const isSelected = selectedCategory === category;
    return (
      <TouchableOpacity
        style={[styles.categoryButton, isSelected && styles.categoryButtonActive]}
        onPress={() => setSelectedCategory(category)}
      >
        {icon}
        <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const handlePackOpeningComplete = () => {
    setShowPackResults(false);
    showSuccessAlert(
      'Purchase Successful!',
      `You received ${packResults.length} new cards from ${currentPackName}!`
    );
  };

  if (loading) {
    return <LoadingOverlay message="Loading store..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Booster Pack Store</Text>
        <View style={styles.currencyDisplay}>
          <Coins size={20} color="#ffd700" />
          <Text style={styles.currencyAmount}>{userCurrency.nexusCoins}</Text>
        </View>
      </View>

      {/* Category Selection */}
      <View style={styles.categoryContainer}>
        {renderCategory('standard', 'Standard', <ShoppingCart size={16} color={selectedCategory === 'standard' ? Colors.text.primary : Colors.text.secondary} />)}
        {renderCategory('elemental', 'Elemental', <Zap size={16} color={selectedCategory === 'elemental' ? Colors.text.primary : Colors.text.secondary} />)}
        {renderCategory('premium', 'Premium', <Star size={16} color={selectedCategory === 'premium' ? Colors.text.primary : Colors.text.secondary} />)}
      </View>

      {/* Pack Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.packsGrid}>
          {PACK_CATEGORIES[selectedCategory].map(renderPackCard)}
        </View>
      </ScrollView>

      {/* Pack Opening Animation */}
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
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700],
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  currencyAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.primary,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: Colors.accent[500],
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  categoryTextActive: {
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  packsGrid: {
    padding: 20,
    gap: 16,
    // Apply row layout only on web AND wide screens
    ...(Platform.OS === 'web' && isWideScreen && {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'stretch',
    }),
  },
  packCard: {
    borderRadius: 12,
    // Apply width constraints only on web AND wide screens
    ...(Platform.OS === 'web' && isWideScreen && {
      width: '32%',
      minWidth: 300,
    }),
  },
  packGradient: {
    padding: 16,
    borderRadius: 12,
    flex: 1,
    overflow: 'hidden',
  },
  packImage: {
    width: '100%',
    height: 240,
    marginBottom: 12,
    borderRadius: 8,
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
  },
  packDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  packDetails: {
    marginBottom: 16,
  },
  cardCount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.primary,
  },
  guaranteed: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffd700',
    marginTop: 4,
  },
  packPricing: {
    gap: 8,
  },
  coinPurchaseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  moneyPurchaseButton: {
    backgroundColor: Colors.accent[500],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bundleButton: {
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2dd4bf',
  },
  freePurchaseButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coinPrice: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.primary,
  },
  moneyPrice: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  bundleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2dd4bf',
    textAlign: 'center',
    marginBottom: 4,
  },
  bundlePrice: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.primary,
  },
  freePurchaseText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
});