import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getAvatarImage, getElementColor, AVAILABLE_AVATARS } from '@/utils/avatarUtils';
import { getFrameImage } from '@/utils/avatarFrameUtils';
import Colors from '@/constants/Colors';

interface PlayerAvatarProps {
  creatureName: string | null;
  size?: 'small' | 'medium' | 'large';
  showBorder?: boolean;
  frame?: string | null;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  creatureName,
  size = 'medium',
  showBorder = true,
  frame,
}) => {
  const avatarImage = getAvatarImage(creatureName);

  // Find creature's element for border color
  const creature = AVAILABLE_AVATARS.find(a => a.name === creatureName);
  const borderColor = creature
    ? getElementColor(creature.element)
    : Colors.neutral[400];

  // Size dimensions in pixels
  const dimensions = {
    small: 60,
    medium: 100,
    large: 140
  };

  const avatarSize = dimensions[size];
  const borderWidth = size === 'small' ? 2 : 3;
  const frameImage = frame ? getFrameImage(frame) : null;

  return (
    <View style={[styles.wrapper, { width: avatarSize, height: avatarSize }]}>
      <View style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          borderWidth: showBorder && !frameImage ? borderWidth : 0,
          borderColor: showBorder && !frameImage ? borderColor : 'transparent',
        }
      ]}>
        <Image
          source={avatarImage}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }
          ]}
          resizeMode="cover"
        />
      </View>
      {frameImage && (
        <Image
          source={frameImage}
          style={{
            position: 'absolute',
            width: avatarSize * 1.4,
            height: avatarSize * 1.4,
            top: -(avatarSize * 0.2),
            left: -(avatarSize * 0.2),
          }}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    backgroundColor: Colors.background.secondary,
  },
});
