import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { AVAILABLE_BADGES, MAX_DISPLAYED_BADGES, getBadgeImage } from '@/utils/badgeUtils';
import Colors from '@/constants/Colors';
import { t } from '@/utils/i18n';

interface BadgeSelectorProps {
  visible: boolean;
  unlockedBadges: string[];
  currentSelected: string[];
  onClose: () => void;
  onSelect: (badgeIds: string[]) => Promise<void>;
}

export const BadgeSelector: React.FC<BadgeSelectorProps> = ({
  visible,
  unlockedBadges,
  currentSelected,
  onClose,
  onSelect,
}) => {
  const [selected, setSelected] = useState<string[]>(currentSelected);

  // Resync when modal opens or currentSelected changes externally
  useEffect(() => {
    if (visible) {
      setSelected(currentSelected);
    }
  }, [visible, currentSelected]);

  const handleToggle = (badgeId: string) => {
    setSelected((prev) => {
      if (prev.includes(badgeId)) {
        return prev.filter((id) => id !== badgeId);
      }
      if (prev.length >= MAX_DISPLAYED_BADGES) {
        return prev;
      }
      return [...prev, badgeId];
    });
  };

  const handleConfirm = async () => {
    await onSelect(selected);
    onClose();
  };

  const handleCancel = () => {
    setSelected(currentSelected);
    onClose();
  };

  const availableBadges = AVAILABLE_BADGES.filter((b) => unlockedBadges.includes(b.id));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{t('badge.selectBadges')}</Text>
          <Text style={styles.subtitle}>
            {t('badge.selectBadgesDesc', { max: String(MAX_DISPLAYED_BADGES) })}
          </Text>

          <ScrollView
            contentContainerStyle={styles.badgeGrid}
            showsVerticalScrollIndicator={false}
          >
            {availableBadges.map((badge) => {
              const image = getBadgeImage(badge.id);
              const isSelected = selected.includes(badge.id);
              const isDisabled = !isSelected && selected.length >= MAX_DISPLAYED_BADGES;
              return (
                <TouchableOpacity
                  key={badge.id}
                  style={[
                    styles.badgeOption,
                    isSelected && styles.badgeOptionSelected,
                    isDisabled && styles.badgeOptionDisabled,
                  ]}
                  onPress={() => handleToggle(badge.id)}
                  activeOpacity={0.7}
                  disabled={isDisabled}
                >
                  {image && (
                    <Image
                      source={image}
                      style={styles.badgeImage}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={[styles.badgeName, isDisabled && styles.badgeNameDisabled]}>
                    {t(`badge.name.${badge.id}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor:
      Platform.OS === 'web'
        ? Colors.glass.surfaceSoft
        : Colors.glass.mobileSurfaceFallback,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: Colors.glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 10,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(14px)' } as any) : null),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
  },
  badgeOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.glass.surfaceStrong,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    width: 130,
  },
  badgeOptionSelected: {
    backgroundColor: Colors.glass.accentGradientSoft,
    borderColor: Colors.glass.borderStrong,
  },
  badgeOptionDisabled: {
    opacity: 0.4,
  },
  badgeImage: {
    width: 72,
    height: 72,
  },
  badgeName: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  badgeNameDisabled: {
    color: Colors.text.secondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.glass.surfaceStrong,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.glass.accentGradientSoft,
    borderWidth: 1,
    borderColor: Colors.glass.borderStrong,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
});
