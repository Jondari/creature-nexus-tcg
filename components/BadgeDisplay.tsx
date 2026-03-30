import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getBadgeImage } from '@/utils/badgeUtils';

interface BadgeDisplayProps {
  selectedBadges: string[];
  size?: number;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  selectedBadges,
  size = 70,
}) => {
  if (!selectedBadges || selectedBadges.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {selectedBadges.map((badgeId) => {
        const image = getBadgeImage(badgeId);
        if (!image) return null;
        return (
          <Image
            key={badgeId}
            source={image}
            style={[styles.badge, { width: size, height: size }]}
            resizeMode="contain"
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  badge: {
    borderRadius: 8,
  },
});
