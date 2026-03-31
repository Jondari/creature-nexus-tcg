import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { AVAILABLE_FRAMES } from '@/utils/avatarFrameUtils';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import Colors from '@/constants/Colors';
import { t } from '@/utils/i18n';

interface AvatarFrameSelectorProps {
  visible: boolean;
  unlockedFrames: string[];
  currentFrame: string | null;
  currentAvatar: string | null;
  onClose: () => void;
  onSelect: (frameId: string | null) => Promise<void>;
}

export const AvatarFrameSelector: React.FC<AvatarFrameSelectorProps> = ({
  visible,
  unlockedFrames,
  currentFrame,
  currentAvatar,
  onClose,
  onSelect,
}) => {
  const [selected, setSelected] = useState<string | null>(currentFrame);

  useEffect(() => {
    if (visible) {
      setSelected(currentFrame);
    }
  }, [visible, currentFrame]);

  const handleConfirm = async () => {
    await onSelect(selected);
    onClose();
  };

  const handleCancel = () => {
    setSelected(currentFrame);
    onClose();
  };

  const availableFrames = AVAILABLE_FRAMES.filter(f => unlockedFrames.includes(f.id));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{t('avatarFrame.selectFrame')}</Text>
          <Text style={styles.subtitle}>{t('avatarFrame.selectFrameDesc')}</Text>

          <ScrollView
            contentContainerStyle={styles.frameGrid}
            showsVerticalScrollIndicator={false}
          >
            {/* Option "Aucun cadre" */}
            <TouchableOpacity
              style={[styles.frameOption, selected === null && styles.frameOptionSelected]}
              onPress={() => setSelected(null)}
              activeOpacity={0.7}
            >
              <PlayerAvatar creatureName={currentAvatar} size="medium" frame={null} />
              <Text style={styles.frameName}>{t('avatarFrame.noFrame')}</Text>
            </TouchableOpacity>

            {availableFrames.map((frame) => {
              const isSelected = selected === frame.id;
              return (
                <TouchableOpacity
                  key={frame.id}
                  style={[styles.frameOption, isSelected && styles.frameOptionSelected]}
                  onPress={() => setSelected(frame.id)}
                  activeOpacity={0.7}
                >
                  <PlayerAvatar creatureName={currentAvatar} size="medium" frame={frame.id} />
                  <Text style={styles.frameName}>{t(`avatarFrame.name.${frame.id}`)}</Text>
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
  frameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
  },
  frameOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.glass.surfaceStrong,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    width: 160,
    paddingVertical: 24,
  },
  frameOptionSelected: {
    backgroundColor: Colors.glass.accentGradientSoft,
    borderColor: Colors.glass.borderStrong,
  },
  frameName: {
    marginTop: 20,
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
