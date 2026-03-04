import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native';
import { PlayerAvatar } from './PlayerAvatar';
import { AVAILABLE_AVATARS } from '@/utils/avatarUtils';
import Colors from '@/constants/Colors';
import { t } from '@/utils/i18n';

interface AvatarSelectorProps {
  visible: boolean;
  currentAvatar: string | null;
  onClose: () => void;
  onSelect: (creatureName: string | null) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  visible,
  currentAvatar,
  onClose,
  onSelect
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);

  const handleConfirm = () => {
    onSelect(selectedAvatar);
    onClose();
  };

  const handleCancel = () => {
    setSelectedAvatar(currentAvatar); // Reset to initial value
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{t('avatar.selectAvatar')}</Text>
          <Text style={styles.subtitle}>{t('avatar.selectAvatarDesc')}</Text>

          {/* Avatar grid */}
          <ScrollView
            contentContainerStyle={styles.avatarGrid}
            showsVerticalScrollIndicator={false}
          >
            {/* Default avatar */}
            <TouchableOpacity
              style={[
                styles.avatarOption,
                selectedAvatar === null && styles.avatarOptionSelected
              ]}
              onPress={() => setSelectedAvatar(null)}
              activeOpacity={0.7}
            >
              <PlayerAvatar
                creatureName={null}
                size="medium"
                showBorder={selectedAvatar === null}
              />
              <Text style={styles.avatarName}>{t('avatar.defaultAvatar')}</Text>
            </TouchableOpacity>

            {/* Creature avatars */}
            {AVAILABLE_AVATARS.map((avatar) => (
              <TouchableOpacity
                key={avatar.name}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatar.name && styles.avatarOptionSelected
                ]}
                onPress={() => setSelectedAvatar(avatar.name)}
                activeOpacity={0.7}
              >
                <PlayerAvatar
                  creatureName={avatar.name}
                  size="medium"
                  showBorder={selectedAvatar === avatar.name}
                />
                <Text style={styles.avatarName}>{avatar.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
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
    backgroundColor: Platform.OS === 'web' ? Colors.glass.surfaceSoft : Colors.glass.mobileSurfaceFallback,
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
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
  },
  avatarOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.glass.surfaceStrong,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    width: 130,
  },
  avatarOptionSelected: {
    backgroundColor: Colors.glass.accentGradientSoft,
    borderColor: Colors.glass.borderStrong,
  },
  avatarName: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
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
