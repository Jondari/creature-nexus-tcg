import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { AlertTriangle, CheckCircle, X } from 'lucide-react-native';
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
        return <CheckCircle size={32} color="#22c55e" />;
      case 'warning':
        return <AlertTriangle size={32} color="#f59e0b" />;
      case 'error':
      default:
        return <AlertTriangle size={32} color="#ef4444" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          button: '#22c55e',
          text: Colors.text.primary
        };
      case 'warning':
        return {
          button: '#f59e0b',
          text: Colors.text.primary
        };
      case 'error':
      default:
        return {
          button: '#ef4444',
          text: Colors.text.primary
        };
    }
  };

  const colors = getColors();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
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
                    isDestructive ? { backgroundColor: '#ef4444' } : 
                    !isCancel ? { backgroundColor: colors.button } : {},
                    isSingle && styles.singleButton
                  ]}
                  onPress={() => {
                    if (button.onPress) {
                      button.onPress();
                    } else {
                      onClose();
                    }
                  }}
                >
                  <Text style={[
                    isCancel ? styles.cancelButtonText : styles.confirmButtonText,
                    !isCancel ? { color: colors.text } : {}
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
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
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
  },
  singleButton: {
    marginHorizontal: 0,
  },
  cancelButton: {
    backgroundColor: Colors.background.secondary,
  },
  confirmButton: {
    // backgroundColor set dynamically
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