import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { RedeemCodeService } from '@/services/redeemCodeService';
import { showSuccessAlert, showErrorAlert } from '@/utils/alerts';
import Colors from '@/constants/Colors';

interface RedeemCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RedeemCodeModal: React.FC<RedeemCodeModalProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { user } = useAuth();

  const handleRedeem = async () => {
    if (!user || !code.trim()) return;

    setIsRedeeming(true);
    
    try {
      const result = await RedeemCodeService.redeemCode(code, user.uid);
      
      if (result.success) {
        showSuccessAlert('Code Redeemed!', result.message || 'Rewards added to your account');
        setCode('');
        onClose();
        onSuccess?.();
      } else {
        showErrorAlert('Redemption Failed', result.error || 'Invalid code');
      }
    } catch (error) {
      showErrorAlert('Error', 'Failed to redeem code. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleClose = () => {
    if (!isRedeeming) {
      setCode('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Redeem Code</Text>
          <Text style={styles.subtitle}>
            Enter a code to claim rewards
          </Text>
          
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Enter code (e.g., WELCOME2024)"
            placeholderTextColor={Colors.text?.secondary || '#666'}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
            editable={!isRedeeming}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              disabled={isRedeeming}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.redeemButton, 
                (!code.trim() || isRedeeming) && styles.disabledButton
              ]}
              onPress={handleRedeem}
              disabled={!code.trim() || isRedeeming}
            >
              {isRedeeming ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.redeemButtonText}>Redeem</Text>
              )}
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
    backgroundColor: Colors.background?.card || '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text?.primary || '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text?.secondary || '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border || '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text?.primary || '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: Colors.background?.input || 'rgba(255, 255, 255, 0.05)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background?.secondary || '#333',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text?.secondary || '#999',
  },
  redeemButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.accent?.[500] || '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    minHeight: 44,
  },
  redeemButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text?.primary || '#ffffff',
  },
  disabledButton: {
    opacity: 0.5,
  },
});