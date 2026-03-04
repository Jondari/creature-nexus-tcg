import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { AlertTriangle, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  buttons?: AlertButton[];
}

const ALERT_COLORS = {
  // Green for success states
  successIcon: 'rgba(34, 197, 94, 0.95)',
  // Green tint for success primary action
  successButton: 'rgba(34, 197, 94, 0.56)',
  // Amber for warning states
  warningIcon: 'rgba(245, 158, 11, 0.95)',
  // Amber tint for warning primary action
  warningButton: 'rgba(245, 158, 11, 0.56)',
  // Red tint for error/destructive actions
  errorButton: 'rgba(232, 75, 85, 0.56)',
  // Stronger red for destructive button emphasis
  destructiveButton: 'rgba(232, 75, 85, 0.6)',
  // Soft white border for tinted actions
  tintedBorder: 'rgba(255, 255, 255, 0.28)',
  // Dark overlay behind the modal
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'error',
  onClose,
  confirmText = 'OK',
  onConfirm,
  showCancel = false,
  buttons
}: CustomAlertProps) {
  const [contentVisible, setContentVisible] = useState(false);

  // Fix for React Native new architecture modal flash issue (mobile only)
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web doesn't need the flash fix, show content immediately
      setContentVisible(visible);
    } else if (visible) {
      // Mobile: Small delay to prevent the top-left corner flash
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setContentVisible(false);
    }
  }, [visible]);
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  // Use custom buttons if provided, otherwise fall back to legacy props
  const alertButtons = buttons || [
    ...(showCancel ? [{ text: 'Cancel', style: 'cancel' as const, onPress: onClose }] : []),
    { text: confirmText, style: 'default' as const, onPress: handleConfirm }
  ];

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={32} color={ALERT_COLORS.successIcon} />;
      case 'warning':
        return <AlertTriangle size={32} color={ALERT_COLORS.warningIcon} />;
      case 'error':
      default:
        return <AlertTriangle size={32} color={Colors.error} />;
    }
  };

  const getTone = () => {
    switch (type) {
      case 'success':
        return {
          button: ALERT_COLORS.successButton,
          border: ALERT_COLORS.tintedBorder,
        };
      case 'warning':
        return {
          button: ALERT_COLORS.warningButton,
          border: ALERT_COLORS.tintedBorder,
        };
      case 'error':
      default:
        return {
          button: ALERT_COLORS.errorButton,
          border: ALERT_COLORS.tintedBorder,
        };
    }
  };

  const tone = getTone();

  // Platform-specific Modal wrapper - only for mobile
  const ModalWrapper = Platform.OS === 'web' 
    ? ({ children }: { children: React.ReactNode }) => <>{children}</>
    : ({ children }: { children: React.ReactNode }) => <View style={styles.modalWrapper}>{children}</View>;

  return (
    <ModalWrapper>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.overlay}>
          <View style={[styles.container, { opacity: contentVisible ? 1 : 0 }]}>
            <View style={styles.header}>
              {getIcon()}
              <Text style={styles.title}>{title}</Text>
            </View>
            
            <Text style={styles.message}>{message}</Text>
            
            <View style={styles.buttons}>
              {alertButtons.map((button, index) => {
                const isCancel = button.style === 'cancel';
                const isDestructive = button.style === 'destructive';
                const isSingle = alertButtons.length === 1;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isCancel ? styles.cancelButton : styles.confirmButton,
                      isDestructive ? styles.destructiveButton :
                      !isCancel ? { backgroundColor: tone.button, borderColor: tone.border } : {},
                      isSingle && styles.singleButton
                    ]}
                    onPress={() => {
                      if (button.onPress) {
                        button.onPress();
                      }
                      // Always close the modal after button press
                      onClose();
                    }}
                  >
                    <Text style={[
                      isCancel ? styles.cancelButtonText : styles.confirmButtonText,
                      !isCancel ? { color: Colors.text.primary } : {}
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  // Mobile-only wrapper to fix React Native new architecture modal positioning issue
  modalWrapper: {
    display: 'contents', // Don't interfere with layout
  },
  overlay: {
    flex: 1,
    backgroundColor: ALERT_COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Platform.OS === 'web' ? Colors.glass.surfaceSoft : Colors.glass.mobileSurfaceFallback,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: Colors.glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 10,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(14px)' } as any) : null),
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
  },
  singleButton: {
    marginHorizontal: 0,
  },
  cancelButton: {
    backgroundColor: Colors.glass.surfaceStrong,
    borderColor: Colors.glass.borderSoft,
  },
  confirmButton: {
    borderColor: Colors.glass.borderStrong,
  },
  destructiveButton: {
    backgroundColor: ALERT_COLORS.destructiveButton,
    borderColor: ALERT_COLORS.tintedBorder,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    // color set dynamically
  },
});
