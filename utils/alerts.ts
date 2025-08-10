import { Platform, Alert } from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning';
}

// Global state for web alerts using CustomAlert
let webAlertManager: {
  showAlert: (options: AlertOptions) => void;
} | null = null;

export const setWebAlertManager = (manager: { showAlert: (options: AlertOptions) => void }) => {
  webAlertManager = manager;
};

export const showAlert = (title: string, message: string, buttons?: AlertButton[], type: 'success' | 'error' | 'warning' = 'error') => {
  if (Platform.OS === 'web') {
    // Use CustomAlert for web
    if (webAlertManager) {
      webAlertManager.showAlert({ title, message, buttons, type });
    } else {
      // Fallback to browser alert if manager not set
      console.warn('WebAlertManager not initialized. Using browser alert fallback.');
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    // Use native Alert for mobile platforms
    const alertButtons = buttons?.map(button => ({
      text: button.text,
      onPress: button.onPress,
      style: button.style
    })) || [{ text: 'OK' }];
    
    Alert.alert(title, message, alertButtons);
  }
};

// Convenience methods for common alert types
export const showSuccessAlert = (title: string, message: string, onPress?: () => void) => {
  showAlert(title, message, [{ text: 'OK', onPress }], 'success');
};

export const showErrorAlert = (title: string, message: string, onPress?: () => void) => {
  showAlert(title, message, [{ text: 'OK', onPress }], 'error');
};

export const showWarningAlert = (title: string, message: string, onPress?: () => void) => {
  showAlert(title, message, [{ text: 'OK', onPress }], 'warning');
};

export const showConfirmAlert = (
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel?: () => void,
  confirmText: string = 'OK',
  cancelText: string = 'Cancel'
) => {
  showAlert(title, message, [
    { text: cancelText, style: 'cancel', onPress: onCancel },
    { text: confirmText, style: 'destructive', onPress: onConfirm }
  ], 'warning');
};