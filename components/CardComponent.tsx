import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, DamageAnimation, Attack } from '../types/game';
import { DamageEffect } from './DamageEffect';
import { t } from '../utils/i18n';
import Colors from '../constants/Colors';
import { CardUtils } from '../modules/card';
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
  aiHighlight?: 'selected' | 'target' | null;
  damageAnimation?: DamageAnimation;
  viewMode?: 'battle' | 'collection' | 'deck';
  count?: number; // For collection view to show duplicate count
  // Pack opening animation props
  showAnimation?: boolean;
  index?: number;
  // Size control
  size?: 'small' | 'normal';
  // Energy for attack availability checking
  playerEnergy?: number;
  // Turn information for first-turn restriction
  currentTurn?: number;
  isFirstPlayer?: boolean;
}

const CardComponent = React.memo(({ 
  card, 
  onPress, 
  onAttack, 
  disabled = false, 
  showActions = false,
  selected = false,
  aiHighlight = null,
  damageAnimation,
  viewMode = 'battle',
  count = 1,
  showAnimation = false,
  index = 0,
  size = 'normal',
  playerEnergy = 0,
  currentTurn = 1,
  isFirstPlayer = false
}: CardComponentProps) => {
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

  // Check if an attack is available based on player's energy and game rules
  const isAttackAvailable = (attack: Attack): boolean => {
    if (!showActions) return false; // No highlighting when actions are disabled
    
    // Check if card can attack based on game rules (first turn restriction, mythic cooldown)
    if (!CardUtils.canAttack(card, currentTurn, isFirstPlayer)) {
      return false;
    }
    
    // Check energy requirements
    if (attack.energy !== undefined) {
      return playerEnergy >= attack.energy;
    } else if (attack.energyCost && attack.energyCost.length > 0) {
      return playerEnergy >= attack.energyCost.length;
    }
    return false; // Default to unavailable if no energy requirements specified
  };

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
              selected && (size === 'small' ? styles.selectedSmall : styles.selected),
              aiHighlight === 'selected' && (size === 'small' ? styles.aiHighlightSelectedSmall : styles.aiHighlightSelected),
              aiHighlight === 'target' && (size === 'small' ? styles.aiHighlightTargetSmall : styles.aiHighlightTarget),
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
                  <Text style={[
                    hpTextStyle, 
                    { 
                      color: card.maxHp && card.hp < card.maxHp ? '#FF4444' : colors.text, 
                      textShadowColor: 'rgba(0,0,0,0.8)' 
                    }
                  ]}>
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
                {card.attacks.map((attack, index) => {
                  const attackAvailable = isAttackAvailable(attack);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.energyAttackSection,
                        attackAvailable && (size === 'small' ? styles.availableAttackSmall : styles.availableAttack),
                        !attackAvailable && showActions && (size === 'small' ? styles.unavailableAttackSmall : styles.unavailableAttack)
                      ]}
                      onPress={() => showActions && attackAvailable && onAttack?.(attack.name)}
                      disabled={!showActions || !attackAvailable}
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
                      <Text style={[
                        attackNameStyle, 
                        { color: colors.text, textShadowColor: 'rgba(0,0,0,0.8)' },
                        attackAvailable && showActions && (size === 'small' ? styles.availableAttackTextSmall : styles.availableAttackText)
                      ]}>
                        {attack.name || 'Basic Attack'}
                      </Text>
                      <Text style={[
                        attackDamageStyle, 
                        { color: colors.text, textShadowColor: 'rgba(0,0,0,0.8)' },
                        attackAvailable && showActions && (size === 'small' ? styles.availableDamageTextSmall : styles.availableDamageText)
                      ]}>
                        {attack.damage || '??'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  );
                })}
                
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
          disabled && styles.disabled
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={[
          cardStyle, 
          styles.standardCard, 
          { borderColor: selected 
              ? Colors.accent[400] 
              : aiHighlight === 'selected' 
                ? '#4CAF50' 
                : aiHighlight === 'target' 
                  ? '#FF5722' 
                  : colors.border as string 
          },
          selected && (size === 'small' ? styles.selectedCardSmall : styles.selectedCard),
          aiHighlight === 'selected' && (size === 'small' ? styles.aiHighlightCardSelectedSmall : styles.aiHighlightCardSelected),
          aiHighlight === 'target' && (size === 'small' ? styles.aiHighlightCardTargetSmall : styles.aiHighlightCardTarget)
        ]}>
          <LinearGradient
            colors={colors.background as any}
            style={styles.cardContentContainer}
          >
            {/* Content area with header on top */}
            <View style={contentAreaStyle}>
              {/* Header on top */}
              <View style={styles.cardHeaderTop}>
                <Text style={[creatureNameStyle, { color: colors.text }]}>
                  {card.name}
                </Text>
                <View style={styles.hpSection}>
                  <Text style={[
                    hpTextStyle, 
                    { 
                      color: card.maxHp && card.hp < card.maxHp ? '#FF4444' : colors.text 
                    }
                  ]}>
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
            </View>

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
            <View style={styles.contentAreaBottom}>
            {/* Attacks */}
            <View style={cardFooterStyle}>
              {/* Display all attacks for standard cards */}
              {card.attacks.map((attack, index) => {
                const attackAvailable = isAttackAvailable(attack);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.energyAttackSectionStandard,
                      attackAvailable && (size === 'small' ? styles.availableAttackSmall : styles.availableAttack),
                      !attackAvailable && showActions && (size === 'small' ? styles.unavailableAttackSmall : styles.unavailableAttack)
                    ]}
                    onPress={() => showActions && attackAvailable && onAttack?.(attack.name)}
                    disabled={!showActions || !attackAvailable}
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
                    <Text style={[
                      attackNameStyle, 
                      { color: colors.text },
                      attackAvailable && showActions && (size === 'small' ? styles.availableAttackTextSmall : styles.availableAttackText)
                    ]}>
                      {attack.name || 'Basic Attack'}
                    </Text>
                    <Text style={[
                      attackDamageStyle, 
                      { color: colors.text },
                      attackAvailable && showActions && (size === 'small' ? styles.availableDamageTextSmall : styles.availableDamageText)
                    ]}>
                      {attack.damage || '??'}
                    </Text>
                  </View>
                </TouchableOpacity>
                );
              })}
              
              <View style={styles.cardBottomTags}>
                <View style={styles.retreatTag}>
                  <Text style={bottomTextStyle}>retreat: ⚡</Text>
                </View>
                <View style={styles.rarityTag}>
                  <Text style={cardIdStyle}>{card.rarity.toUpperCase()}</Text>
                </View>
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
}, (prevProps, nextProps) => {
  // Safe comparison - only skip re-render if ALL relevant props are identical
  // This ensures battle system functionality is never broken
  
  // Card data comparison
  if (prevProps.card.id !== nextProps.card.id) return false;
  if (prevProps.card.hp !== nextProps.card.hp) return false;
  if (prevProps.card.name !== nextProps.card.name) return false;
  if (prevProps.card.element !== nextProps.card.element) return false;
  if (prevProps.card.rarity !== nextProps.card.rarity) return false;
  
  // UI state comparison
  if (prevProps.disabled !== nextProps.disabled) return false;
  if (prevProps.selected !== nextProps.selected) return false;
  if (prevProps.aiHighlight !== nextProps.aiHighlight) return false;
  if (prevProps.viewMode !== nextProps.viewMode) return false;
  if (prevProps.count !== nextProps.count) return false;
  if (prevProps.size !== nextProps.size) return false;
  
  // Battle system comparison
  if (prevProps.showActions !== nextProps.showActions) return false;
  if (prevProps.playerEnergy !== nextProps.playerEnergy) return false;
  if (prevProps.currentTurn !== nextProps.currentTurn) return false;
  if (prevProps.isFirstPlayer !== nextProps.isFirstPlayer) return false;
  
  // Animation comparison
  if (prevProps.showAnimation !== nextProps.showAnimation) return false;
  if (prevProps.index !== nextProps.index) return false;
  
  // Damage animation comparison - be very careful here
  const prevDamage = prevProps.damageAnimation;
  const nextDamage = nextProps.damageAnimation;
  if (!prevDamage && !nextDamage) {
    // Both undefined/null - no change
  } else if (!prevDamage || !nextDamage) {
    // One is defined, other isn't - definitely changed
    return false;
  } else {
    // Both defined - compare properties
    if (prevDamage.isActive !== nextDamage.isActive) return false;
    if (prevDamage.duration !== nextDamage.duration) return false;
  }
  
  // If we get here, all props are identical - safe to skip re-render
  return true;
});

export { CardComponent };

function getCardImage(card: Card) {
  // Static image mappings for React Native require
  const cardImages = {
    // Common
    common_generic: require('../assets/images/common/common_generic.png'),
    Barkyn: require('../assets/images/common/Barkyn.png'),
    Caelel: require('../assets/images/common/Caelel.png'),
    Cryil: require('../assets/images/common/Cryil.png'),
    Draleth: require('../assets/images/common/Draleth.png'),
    Flareen: require('../assets/images/common/Flareen.png'),
    Flareor: require('../assets/images/common/Flareor.png'),
    Glacis: require('../assets/images/common/Glacis.png'),
    Hydys: require('../assets/images/common/Hydys.png'),
    Ignen: require('../assets/images/common/Ignen.png'),
    Ignys: require('../assets/images/common/Ignys.png'),
    Lumel: require('../assets/images/common/Lumel.png'),
    Lumen: require('../assets/images/common/Lumen.png'),
    Lumion: require('../assets/images/common/Lumion.png'),
    Lumoth: require('../assets/images/common/Lumoth.png'),
    Miriion: require('../assets/images/common/Miriion.png'),
    Miriys: require('../assets/images/common/Miriys.png'),
    Mossil: require('../assets/images/common/Mossil.png'),
    Nixor: require('../assets/images/common/Nixor.png'),
    Radeth: require('../assets/images/common/Radeth.png'),
    Venten: require('../assets/images/common/Venten.png'),
    Ventun: require('../assets/images/common/Ventun.png'),
    Ventyn: require('../assets/images/common/Ventyn.png'),
    Whisun: require('../assets/images/common/Whisun.png'),
    Zarel: require('../assets/images/common/Zarel.png'),
    Zephor: require('../assets/images/common/Zephor.png'),
    
    // Rare
    rare_generic: require('../assets/images/rare/rare_generic.png'),
    Ashion: require('../assets/images/rare/Ashion.png'),
    Caeloth: require('../assets/images/rare/Caeloth.png'),
    Cryel: require('../assets/images/rare/Cryel.png'),
    Eileth: require('../assets/images/rare/Eileth.png'),
    Miriis: require('../assets/images/rare/Miriis.png'),
    Mossion: require('../assets/images/rare/Mossion.png'),
    Mossor: require('../assets/images/rare/Mossor.png'),
    Pyrrun: require('../assets/images/rare/Pyrrun.png'),
    Seleth: require('../assets/images/rare/Seleth.png'),
    Silen: require('../assets/images/rare/Silen.png'),
    Solor: require('../assets/images/rare/Solor.png'),
    Verdil: require('../assets/images/rare/Verdil.png'),
    
    // Epic
    epic_generic: require('../assets/images/epic/epic_generic.png'),
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
    Mythelgorn: require('../assets/images/mythic/Mythelgorn.png'),
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
      return cardImages.common_generic;
    case 'rare':
      return cardImages.rare_generic;
    case 'epic':
      return cardImages.epic_generic;
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

// Pre-calculate element images based on platform to avoid repeated Platform.OS checks
const ELEMENT_IMAGES = Platform.OS === 'android' ? {
  // PNG versions for Android
  fire_symbol: require('../assets/images/element/fire_symbol.png'),
  water_symbol: require('../assets/images/element/water_symbol.png'),
  earth_symbol: require('../assets/images/element/earth_symbol.png'),
  air_symbol: require('../assets/images/element/air_symbol.png'),
  all: require('../assets/images/element/all.png'),
} : {
  // SVG versions for other platforms
  fire_symbol: require('../assets/images/element/fire_symbol.svg'),
  water_symbol: require('../assets/images/element/water_symbol.svg'),
  earth_symbol: require('../assets/images/element/earth_symbol.svg'),
  air_symbol: require('../assets/images/element/air_symbol.svg'),
  all: require('../assets/images/element/all.png'),
};

function getElementSymbol(element: string) {
  if (!element) return null;
  
  const symbolKey = element === 'all' ? 'all' : `${element}_symbol`;
  return ELEMENT_IMAGES[symbolKey as keyof typeof ELEMENT_IMAGES] || null;
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 280,
    marginBottom: 20,
    marginHorizontal: 8,
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
    marginHorizontal: 4,
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
    backgroundColor: 'transparent', // Transparent since parent has LinearGradient
  },
  cardFooterStandardSmall: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  artworkFrameBelowSmall: {
    width: '100%',
    height: 80, // Half of original 160
    paddingLeft: 5,
    paddingRight: 5,
    overflow: 'hidden',
  },
  cardContentContainer: {
    flex: 1,
    borderRadius: 15,
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
    backgroundColor: 'transparent', // Transparent since parent has LinearGradient
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artworkFrameBelow: {
    width: '100%',
    height: 190,
    paddingLeft: 10,
    paddingRight: 10,
    overflow: 'hidden',
  },
  contentAreaBottom: {
    flex: 1,
    padding: 15,
    backgroundColor: 'transparent', // Transparent since parent has LinearGradient
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
  // Selection styles for standard cards (applied to inner card, not container)
  selectedCard: {
    borderWidth: 4, // Slightly thicker for better visibility
    shadowColor: Colors.accent[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedCardSmall: {
    borderWidth: 3,
    shadowColor: Colors.accent[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
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
  // AI highlight styles for standard cards (applied to inner card)
  aiHighlightCardSelected: {
    borderWidth: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  aiHighlightCardTarget: {
    borderWidth: 4,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  aiHighlightCardSelectedSmall: {
    borderWidth: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 4,
  },
  aiHighlightCardTargetSmall: {
    borderWidth: 3,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 4,
  },
  // Original selection/highlight styles (container-based) - restored for premium cards
  selected: {
    borderColor: Colors.accent[400],
    borderWidth: 3,
    borderRadius: 15,
  },
  selectedSmall: {
    borderColor: Colors.accent[400],
    borderWidth: 2,
    borderRadius: 8,
  },
  aiHighlightSelected: {
    borderColor: '#4CAF50',
    borderWidth: 4,
    borderRadius: 15,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  aiHighlightTarget: {
    borderColor: '#FF5722',
    borderWidth: 4,
    borderRadius: 15,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  aiHighlightSelectedSmall: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderRadius: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 4,
  },
  aiHighlightTargetSmall: {
    borderColor: '#FF5722',
    borderWidth: 2,
    borderRadius: 8,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 4,
  },
  // Attack availability styles - normal size
  availableAttack: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginVertical: 2,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  unavailableAttack: {
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginVertical: 2,
    opacity: 0.5,
  },
  availableAttackText: {
    color: '#4CAF50',
    fontWeight: '700',
    textShadowColor: 'rgba(76, 175, 80, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  availableDamageText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 26,
    textShadowColor: 'rgba(76, 175, 80, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Attack availability styles - small size
  availableAttackSmall: {
    top: 5,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginVertical: 1,
    borderWidth: 1,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  unavailableAttackSmall: {
    top: 3,
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginVertical: 1,
    opacity: 0.5,
  },
  availableAttackTextSmall: {
    color: '#4CAF50',
    fontWeight: '700',
    textShadowColor: 'rgba(76, 175, 80, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  availableDamageTextSmall: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(76, 175, 80, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1.5,
  },
});