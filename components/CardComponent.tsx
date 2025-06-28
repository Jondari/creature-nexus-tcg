import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, DamageAnimation } from '../types/game';
import { DamageEffect } from './DamageEffect';
import { t } from '../utils/i18n';
import Colors from '../constants/Colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay,
  Easing,
  withTiming
} from 'react-native-reanimated';

interface CardComponentProps {
  card: Card;
  onPress?: () => void;
  onAttack?: (attackName: string) => void;
  disabled?: boolean;
  showActions?: boolean;
  selected?: boolean;
  damageAnimation?: DamageAnimation;
  viewMode?: 'battle' | 'collection' | 'deck';
  count?: number; // For collection view to show duplicate count
  // Pack opening animation props
  showAnimation?: boolean;
  index?: number;
  // Size control
  size?: 'small' | 'normal';
}

export function CardComponent({ 
  card, 
  onPress, 
  onAttack, 
  disabled = false, 
  showActions = false,
  selected = false,
  damageAnimation,
  viewMode = 'battle',
  count = 1,
  showAnimation = false,
  index = 0,
  size = 'normal'
}: CardComponentProps) {
  const isPremium = card.rarity === 'legendary' || card.rarity === 'mythic';
  const isElementSymbolCard = true; // Always show element symbols
  const elementColor = getElementColor(card.element);
  const colors = getRarityColors(card.rarity);
  const cardImage = getCardImage(card);
  
  // Size-specific styles
  const containerStyle = size === 'small' ? styles.cardContainerSmall : styles.cardContainer;
  const cardStyle = size === 'small' ? styles.cardSmall : styles.card;
  
  // Size-specific style overrides
  const creatureNameStyle = size === 'small' ? styles.creatureNameSmall : styles.creatureName;
  const hpTextStyle = size === 'small' ? styles.hpTextSmall : styles.hpText;
  const attackNameStyle = size === 'small' ? styles.attackNameSmall : styles.attackName;
  const attackDamageStyle = size === 'small' ? styles.attackDamageSmall : styles.attackDamage;
  const contentAreaStyle = size === 'small' ? styles.contentAreaWithHeaderSmall : styles.contentAreaWithHeader;
  const artworkStyle = size === 'small' ? styles.artworkFrameBelowSmall : styles.artworkFrameBelow;
  const elementSymbolStyle = size === 'small' ? styles.elementSymbolIconSmall : styles.elementSymbolIcon;
  const elementIconStyle = size === 'small' ? styles.elementIconSmall : styles.elementIcon;
  const energySymbolStyle = size === 'small' ? styles.energySymbolIconSmall : styles.energySymbolIcon;
  const energyIconStyle = size === 'small' ? styles.energyIconSmall : styles.energyIcon;
  const bottomTextStyle = size === 'small' ? styles.bottomTextSmall : styles.bottomText;
  const cardIdStyle = size === 'small' ? styles.cardIdSmall : styles.cardId;
  const cardFooterStyle = size === 'small' ? styles.cardFooterStandardSmall : styles.cardFooterStandard;

  // Pack opening animations
  const scale = useSharedValue(showAnimation ? 0.8 : 1);
  const opacity = useSharedValue(showAnimation ? 0 : 1);
  const rotate = useSharedValue(showAnimation ? '10deg' : '0deg');
  
  React.useEffect(() => {
    if (showAnimation) {
      // Animation sequence
      opacity.value = withDelay(
        index * 300, 
        withTiming(1, { duration: 500 })
      );
      
      scale.value = withDelay(
        index * 300, 
        withSequence(
          withTiming(1.1, { duration: 400, easing: Easing.out(Easing.exp) }),
          withSpring(1)
        )
      );
      
      rotate.value = withDelay(
        index * 300,
        withTiming('0deg', { duration: 400 })
      );
    }
  }, [showAnimation, index]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: rotate.value }
      ]
    };
  });

  const getPlaceholderStyle = (element: string, rarity: string) => {
    const baseColor = getElementColor(element);
    const rarityOpacity = {
      common: 0.3,
      rare: 0.5,
      epic: 0.7,
      legendary: 0.8,
      mythic: 0.9
    }[rarity] || 0.3;

    return {
      backgroundColor: baseColor,
      opacity: rarityOpacity,
    };
  };

  const placeholderStyle = getPlaceholderStyle(card.element, card.rarity);

  if (isPremium) {
    return (
      <Animated.View style={animatedStyle}>
        <DamageEffect 
          isActive={damageAnimation?.isActive || false}
          duration={damageAnimation?.duration || 1000}
        >
          <TouchableOpacity
            style={[
              containerStyle,
              selected && styles.selected,
              disabled && styles.disabled
            ]}
            onPress={onPress}
            disabled={disabled}
          >
          <View style={[cardStyle, styles.premiumCard]}>
            {/* Animated border for premium cards */}
            <LinearGradient
              colors={(Array.isArray(colors.border) ? colors.border : [colors.border, colors.border]) as any}
              style={styles.premiumBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Full background artwork */}
            {cardImage ? (
              <Image
                source={cardImage}
                style={styles.premiumArtwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.premiumArtwork, styles.placeholderContainer]}>
                <LinearGradient
                  colors={[placeholderStyle.backgroundColor, '#000000']}
                  style={styles.placeholderGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.placeholderContent}>
                  <Text style={styles.placeholderText}>{card.name}</Text>
                  <Text style={styles.placeholderSubtext}>{card.element.toUpperCase()}</Text>
                </View>
              </View>
            )}
            
            {/* Content overlay */}
            <LinearGradient
              colors={colors.background as any}
              style={styles.premiumOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                <Text style={[creatureNameStyle, { color: colors.text, textShadowColor: 'rgba(0,0,0,0.8)' }]}>
                  {card.name}
                </Text>
                <View style={styles.hpSection}>
                  <Text style={[hpTextStyle, { color: colors.text, textShadowColor: 'rgba(0,0,0,0.8)' }]}>
                    HP {card.hp}
                  </Text>
                  {isElementSymbolCard && getElementSymbol(card.element) ? (
                    <Image
                      source={getElementSymbol(card.element)}
                      style={elementSymbolStyle}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[elementIconStyle, { backgroundColor: elementColor }]} />
                  )}
                </View>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                {/* Display all attacks for premium cards */}
                {card.attacks.map((attack, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.energyAttackSection}
                    onPress={() => showActions && onAttack?.(attack.name)}
                    disabled={!showActions}
                  >
                    <View style={styles.energyCost}>
                      {/* Show energy cost or energy icons */}
                      {attack.energy !== undefined ? (
                        // If energy is a number, show that many element icons/symbols
                        Array.from({ length: attack.energy }, (_, i) => (
                          isElementSymbolCard && getElementSymbol(card.element) ? (
                            <Image
                              key={i}
                              source={getElementSymbol(card.element)}
                              style={energySymbolStyle}
                              resizeMode="contain"
                            />
                          ) : (
                            <View 
                              key={i}
                              style={[energyIconStyle, { backgroundColor: getElementColor(card.element) }]} 
                            />
                          )
                        ))
                      ) : attack.energyCost ? (
                        // If energyCost array exists, show those specific elements
                        attack.energyCost.map((energy, energyIndex) => (
                          isElementSymbolCard && getElementSymbol(energy) ? (
                            <Image
                              key={energyIndex}
                              source={getElementSymbol(energy)}
                              style={energySymbolStyle}
                              resizeMode="contain"
                            />
                          ) : (
                            <View 
                              key={energyIndex}
                              style={[energyIconStyle, { backgroundColor: getElementColor(energy) }]} 
                            />
                          )
                        ))
                      ) : null}
                    </View>
                    <View style={styles.attackInfoPremium}>
                      <Text style={[attackNameStyle, { color: colors.text, textShadowColor: 'rgba(0,0,0,0.8)' }]}>
                        {attack.name || 'Basic Attack'}
                      </Text>
                      <Text style={[attackDamageStyle, { color: colors.text, textShadowColor: 'rgba(0,0,0,0.8)' }]}>
                        {attack.damage || '??'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <View style={styles.cardBottomTags}>
                  <View style={styles.retreatTag}>
                    <Text style={bottomTextStyle}>retreat: ⚡</Text>
                  </View>
                  <View style={styles.rarityTag}>
                    <Text style={cardIdStyle}>{card.rarity.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </DamageEffect>
      </Animated.View>
    );
  }

  // Standard card layout
  return (
    <Animated.View style={animatedStyle}>
      <DamageEffect 
      isActive={damageAnimation?.isActive || false}
      duration={damageAnimation?.duration || 1000}
    >
      <TouchableOpacity
        style={[
          containerStyle,
          selected && styles.selected,
          disabled && styles.disabled
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={[cardStyle, styles.standardCard, { borderColor: colors.border as string }]}>
          {/* Content area with header on top */}
          <LinearGradient
            colors={colors.background as any}
            style={contentAreaStyle}
          >
            {/* Header on top */}
            <View style={styles.cardHeaderTop}>
              <Text style={[creatureNameStyle, { color: colors.text }]}>
                {card.name}
              </Text>
              <View style={styles.hpSection}>
                <Text style={[hpTextStyle, { color: colors.text }]}>
                  HP {card.hp}
                </Text>
                {isElementSymbolCard && getElementSymbol(card.element) ? (
                  <Image
                    source={getElementSymbol(card.element)}
                    style={elementSymbolStyle}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[elementIconStyle, { backgroundColor: elementColor }]} />
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Contained artwork */}
          <View style={artworkStyle}>
            {cardImage ? (
              <Image
                source={cardImage}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artwork, styles.placeholderContainer]}>
                <LinearGradient
                  colors={[placeholderStyle.backgroundColor, '#666666']}
                  style={styles.placeholderGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.placeholderContent}>
                  <Text style={styles.placeholderText}>{card.name}</Text>
                  <Text style={styles.placeholderSubtext}>{card.element.toUpperCase()}</Text>
                </View>
              </View>
            )}
          </View>
          
          {/* Content area with attacks */}
          <LinearGradient
            colors={colors.background as any}
            style={styles.contentAreaBottom}
          >
            {/* Attacks */}
            <View style={cardFooterStyle}>
              {/* Display all attacks for standard cards */}
              {card.attacks.map((attack, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.energyAttackSectionStandard}
                  onPress={() => showActions && onAttack?.(attack.name)}
                  disabled={!showActions}
                >
                  <View style={styles.energyCost}>
                    {/* Show energy cost or energy icons */}
                    {attack.energy !== undefined ? (
                      // If energy is a number, show that many element icons/symbols
                      Array.from({ length: attack.energy }, (_, i) => (
                        isElementSymbolCard && getElementSymbol(card.element) ? (
                          <Image
                            key={i}
                            source={getElementSymbol(card.element)}
                            style={energySymbolStyle}
                            resizeMode="contain"
                          />
                        ) : (
                          <View 
                            key={i}
                            style={[energyIconStyle, { backgroundColor: getElementColor(card.element) }]} 
                          />
                        )
                      ))
                    ) : attack.energyCost ? (
                      // If energyCost array exists, show those specific elements
                      attack.energyCost.map((energy, energyIndex) => (
                        isElementSymbolCard && getElementSymbol(energy) ? (
                          <Image
                            key={energyIndex}
                            source={getElementSymbol(energy)}
                            style={energySymbolStyle}
                            resizeMode="contain"
                          />
                        ) : (
                          <View 
                            key={energyIndex}
                            style={[energyIconStyle, { backgroundColor: getElementColor(energy) }]} 
                          />
                        )
                      ))
                    ) : null}
                  </View>
                  <View style={styles.attackInfoStandard}>
                    <Text style={[attackNameStyle, { color: colors.text }]}>
                      {attack.name || 'Basic Attack'}
                    </Text>
                    <Text style={[attackDamageStyle, { color: colors.text }]}>
                      {attack.damage || '??'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              <View style={styles.cardBottomTags}>
                <View style={styles.retreatTag}>
                  <Text style={bottomTextStyle}>retreat: ⚡</Text>
                </View>
                <View style={styles.rarityTag}>
                  <Text style={cardIdStyle}>{card.rarity.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Count badge for collection view */}
        {(viewMode === 'collection' || viewMode === 'deck') && count > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </DamageEffect>
    </Animated.View>
  );
}

function getCardImage(card: Card) {
  // Static image mappings for React Native require
  const cardImages = {
    // Common
    common_generic: require('../assets/images/common/common_generic.png'),
    
    // Rare - no rare images available yet
    
    // Epic  
    Barkys: require('../assets/images/epic/Barkys.png'),
    Caelun: require('../assets/images/epic/Caelun.png'),
    Dralis: require('../assets/images/epic/Dralis.png'),
    Groan: require('../assets/images/epic/Groan.png'),
    Nixeth: require('../assets/images/epic/Nixeth.png'),
    
    // Legendary
    Golrok: require('../assets/images/legendary/Golrok.png'),
    Selel: require('../assets/images/legendary/Selel.png'),
    Solen: require('../assets/images/legendary/Solen.png'),
    Stonelorn: require('../assets/images/legendary/Stonelorn.png'),
    Zephun: require('../assets/images/legendary/Zephun.png'),
    
    // Mythic
    Mythanor: require('../assets/images/mythic/Mythanor.png'),
    Mythelgotn: require('../assets/images/mythic/Mythelgotn.png'),
    Mytholzak: require('../assets/images/mythic/Mytholzak.png'),
    Mythunden: require('../assets/images/mythic/Mythunden.png'),
    Mythévor: require('../assets/images/mythic/Mythévor.png'),
    
    // Element symbols
    fire_symbol: require('../assets/images/element/fire_symbol.svg'),
    water_symbol: require('../assets/images/element/water_symbol.svg'),
    earth_symbol: require('../assets/images/element/earth_symbol.svg'),
    air_symbol: require('../assets/images/element/air_symbol.svg'),
    all: require('../assets/images/element/all.png'),
  };

  // For element symbol cards, don't use element symbols as main artwork
  // They should use regular creature artwork like other cards

  // Try to get specific card image
  const cardName = card.name;
  if (cardImages[cardName as keyof typeof cardImages]) {
    return cardImages[cardName as keyof typeof cardImages];
  }

  // Fallback to generic images based on rarity
  switch (card.rarity) {
    case 'common':
    case 'rare':
      return cardImages.common_generic;
    case 'epic':
    case 'legendary':
    case 'mythic':
    default:
      return cardImages.common_generic;
  }
}

function getElementColor(element: string): string {
  const colors = {
    fire: '#FF6B6B',
    water: '#4ECDC4',
    air: '#95E1D3',
    earth: '#D4A574',
    all: '#9B59B6',
  };
  return colors[element as keyof typeof colors] || '#777';
}

function getRarityColors(rarity: string) {
  switch (rarity) {
    case 'common':
      return {
        border: Colors.common,
        background: ['rgba(142,145,159,0.2)', 'rgba(142,145,159,0.1)'],
        text: Colors.text.primary
      };
    case 'rare':
      return {
        border: Colors.rare,
        background: ['rgba(62,124,201,0.2)', 'rgba(62,124,201,0.1)'],
        text: Colors.text.primary
      };
    case 'epic':
      return {
        border: Colors.epic,
        background: ['rgba(152,85,212,0.2)', 'rgba(152,85,212,0.1)'],
        text: Colors.text.primary
      };
    case 'legendary':
      return {
        border: ['#ff6b35', '#f7931e', '#ffd700', '#ff6b35'],
        background: ['rgba(255,215,0,0.1)', 'rgba(255,140,0,0.2)'],
        text: '#ffffff'
      };
    case 'mythic':
      return {
        border: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0080'],
        background: ['rgba(255,0,128,0.1)', 'rgba(128,0,255,0.1)', 'rgba(0,255,128,0.1)'],
        text: '#ffffff'
      };
    default:
      return {
        border: Colors.neutral[400],
        background: ['rgba(182,184,194,0.2)', 'rgba(182,184,194,0.1)'],
        text: Colors.text.primary
      };
  }
}

function getElementSymbol(element: string) {
  if (!element) return null;
  
  const symbolKey = element === 'all' ? 'all' : `${element}_symbol`;
  
  const cardImages = {
    // Element symbols
    fire_symbol: require('../assets/images/element/fire_symbol.svg'),
    water_symbol: require('../assets/images/element/water_symbol.svg'),
    earth_symbol: require('../assets/images/element/earth_symbol.svg'),
    air_symbol: require('../assets/images/element/air_symbol.svg'),
    all: require('../assets/images/element/all.png'),
  };

  return cardImages[symbolKey as keyof typeof cardImages] || null;
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 280,
    marginBottom: 20,
  },
  card: {
    width: 280,
    height: 390,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardContainerSmall: {
    width: 140, // Half size
    marginBottom: 10,
  },
  cardSmall: {
    width: 140,
    height: 195, // Half height
    borderRadius: 8,
    overflow: 'hidden',
  },
  // Small card text styles
  creatureNameSmall: {
    fontSize: 12, // Half of original 18
    fontWeight: 'bold',
    flex: 1,
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  hpTextSmall: {
    fontSize: 10, // Half of original 16
    fontWeight: 'bold',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  attackNameSmall: {
    fontSize: 8, // Half of original 14
    fontWeight: 'bold',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    marginBottom: 1,
  },
  attackDamageSmall: {
    fontSize: 14, // Half of original 24
    fontWeight: 'bold',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  // Small card layout styles
  contentAreaWithHeaderSmall: {
    height: 30, // Half of original 50
    paddingHorizontal: 8,
    paddingTop: 5,
  },
  cardFooterStandardSmall: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  artworkFrameBelowSmall: {
    width: '100%',
    height: 80, // Half of original 160
    backgroundColor: Colors.neutral[700],
    overflow: 'hidden',
  },
  standardCard: {
    backgroundColor: Colors.background.card,
    borderWidth: 3,
  },
  premiumCard: {
    position: 'relative',
  },
  premiumBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 18,
    zIndex: 1,
  },
  premiumArtwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  premiumOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: 15,
    zIndex: 3,
    justifyContent: 'space-between',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  creatureName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  hpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hpText: {
    fontSize: 16,
    fontWeight: 'bold',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  elementIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  elementIconSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  elementSymbolIcon: {
    width: 32,
    height: 32,
  },
  elementSymbolIconSmall: {
    width: 16,
    height: 16,
  },
  energySymbolIcon: {
    width: 28,
    height: 28,
  },
  energySymbolIconSmall: {
    width: 14,
    height: 14,
  },
  cardFooter: {
    gap: 10,
  },
  energyAttackSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  energyCost: {
    flexDirection: 'row',
    gap: 5,
  },
  energyIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  energyIconSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  attackInfoPremium: {
    alignItems: 'flex-end',
    flex: 1,
  },
  attackInfoStandard: {
    alignItems: 'flex-end',
    flex: 1,
  },
  energyAttackSectionStandard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  attackName: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 2,
  },
  attackDamage: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  placeholderContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 5,
  },
  placeholderSubtext: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    opacity: 0.8,
  },
  contentAreaWithHeader: {
    height: 50,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artworkFrameBelow: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.neutral[700],
    overflow: 'hidden',
  },
  contentAreaBottom: {
    flex: 1,
    padding: 15,
  },
  cardFooterStandard: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 10,
  },
  cardBottomTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  retreatTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rarityTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bottomText: {
    fontSize: 10,
    color: Colors.text.primary,
  },
  bottomTextSmall: {
    fontSize: 6,
    color: Colors.text.primary,
  },
  cardId: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: 'bold',
  },
  cardIdSmall: {
    fontSize: 6,
    color: Colors.text.secondary,
    fontWeight: 'bold',
  },
  selected: {
    borderColor: Colors.accent[400],
    borderWidth: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  countBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.accent[600],
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.text.primary,
  },
  countText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});