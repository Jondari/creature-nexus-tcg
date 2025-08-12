import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Linking } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, Github, Globe, Mail, Save, Trash2, TestTube } from 'lucide-react-native';
import { showSuccessAlert, showErrorAlert } from '@/utils/alerts';
import { addNexusCoins } from '@/utils/currencyUtils';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
  const { user, signOut, linkWithEmail, linkWithGoogle, deleteAccount, isAnonymous } = useAuth();
  const { cardSize, setCardSize, showBattleLog, setShowBattleLog } = useSettings();
  const router = useRouter();
  
  // Debug auth state
  console.log('Profile Screen - User:', user);
  console.log('Profile Screen - Is Anonymous:', isAnonymous);
  console.log('Profile Screen - User exists:', !!user);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  

  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error signing out:', error);
      showErrorAlert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const getErrorMessage = (error: any) => {
    if (error.code) {
      switch (error.code) {
        case 'auth/weak-password':
          return 'Password should be at least 6 characters long.';
        case 'auth/email-already-in-use':
          return 'This email is already registered. Please use a different email or sign in instead.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/credential-already-in-use':
          return 'This email is already linked to another account.';
        default:
          return error.message || 'Failed to save account. Please try again.';
      }
    }
    return error.message || 'Failed to save account. Please try again.';
  };

  const handleLinkWithEmail = async () => {
    if (!email || !password) {
      showErrorAlert('Error', 'Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      showErrorAlert('Error', 'Password should be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await linkWithEmail(email, password);
      setShowLinkModal(false);
      setEmail('');
      setPassword('');
      showSuccessAlert('Success', 'Your account has been saved! You can now sign in with this email on any device.');
    } catch (error: any) {
      console.error('Error linking account:', error);
      showErrorAlert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkWithGoogle = async () => {
    try {
      setLoading(true);
      await linkWithGoogle();
      showSuccessAlert('Success', 'Your account has been saved with Google! You can now sign in with Google on any device.');
    } catch (error: any) {
      console.error('Error linking with Google:', error);
      showErrorAlert('Error', 'Failed to link with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    console.log('Delete account button pressed');
    console.log('User:', user);
    console.log('Is anonymous:', isAnonymous);
    
    if (!user) {
      console.log('No user found, showing modal anyway for debugging');
    }
    
    if (isAnonymous) {
      console.log('User is anonymous, showing modal anyway for debugging');
    }
    
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    console.log('User confirmed deletion');
    try {
      setDeleteLoading(true);
      console.log('Calling deleteAccount...');
      await deleteAccount();
      console.log('Account deleted successfully');
      setShowDeleteModal(false);
      router.replace('/(auth)');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      showErrorAlert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary[900], Colors.background.primary]}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your game information</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{user?.uid.substring(0, 8)}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <Text style={styles.infoValue}>{isAnonymous ? 'Anonymous' : 'Registered'}</Text>
          </View>
          {!isAnonymous && user?.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{user?.metadata.creationTime 
              ? new Date(user.metadata.creationTime).toLocaleDateString() 
              : 'Unknown'}</Text>
          </View>
        </View>
        
        {isAnonymous && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚠️ Save Your Progress</Text>
            <Text style={styles.cardText}>
              You're playing as an anonymous user. Create an account to save your progress 
              and access your collection from any device!
            </Text>
            <TouchableOpacity
              style={styles.saveProgressButton}
              onPress={() => setShowLinkModal(true)}
              activeOpacity={0.8}
            >
              <Save size={20} color={Colors.text.primary} />
              <Text style={styles.saveProgressText}>Create Account with Email</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={[styles.saveProgressButton, styles.googleSaveButton]}
              onPress={handleLinkWithGoogle}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleSaveText}>Save with Google</Text>
            </TouchableOpacity> */}
          </View>
        )}
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Game Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Card Size</Text>
              <Text style={styles.settingDescription}>
                Choose how cards are displayed throughout the game
              </Text>
            </View>
            <View style={styles.settingButtons}>
              <TouchableOpacity
                style={[
                  styles.settingButton,
                  cardSize === 'small' && styles.settingButtonActive
                ]}
                onPress={() => setCardSize('small')}
              >
                <Text style={[
                  styles.settingButtonText,
                  cardSize === 'small' && styles.settingButtonTextActive
                ]}>
                  Small
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.settingButton,
                  cardSize === 'normal' && styles.settingButtonActive
                ]}
                onPress={() => setCardSize('normal')}
              >
                <Text style={[
                  styles.settingButtonText,
                  cardSize === 'normal' && styles.settingButtonTextActive
                ]}>
                  Normal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Battle Log</Text>
              <Text style={styles.settingDescription}>
                Show or hide the battle log during gameplay
              </Text>
            </View>
            <View style={styles.settingButtons}>
              <TouchableOpacity
                style={[
                  styles.settingButton,
                  !showBattleLog && styles.settingButtonActive
                ]}
                onPress={() => setShowBattleLog(false)}
              >
                <Text style={[
                  styles.settingButtonText,
                  !showBattleLog && styles.settingButtonTextActive
                ]}>
                  Hidden
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.settingButton,
                  showBattleLog && styles.settingButtonActive
                ]}
                onPress={() => setShowBattleLog(true)}
              >
                <Text style={[
                  styles.settingButtonText,
                  showBattleLog && styles.settingButtonTextActive
                ]}>
                  Visible
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* A supprimer */}
        {__DEV__ && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Development Tools</Text>
          <Text style={styles.cardText}>
            Testing and debugging utilities for the development team.
          </Text>
          
          <View style={styles.links}>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => router.push('/card-test' as any)}
            >
              <TestTube size={20} color={Colors.text.primary} />
              <Text style={styles.linkText}>Card Illustrations Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={async () => {
                if (user) {
                  try {
                    await addNexusCoins(user.uid, 10000);
                    showSuccessAlert('Dev Tools', 'Added 10,000 Nexus Coins to your account!');
                  } catch (error) {
                    showErrorAlert('Dev Tools', 'Failed to add coins. Please try again.');
                  }
                }
              }}
            >
              <TestTube size={20} color={'#ffd700'} />
              <Text style={[styles.linkText, { color: '#ffd700' }]}>Add 10,000 Nexus Coins</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Creature Nexus TCG</Text>
          <Text style={styles.cardText}>
            Creature Nexus is a digital trading card game featuring mythical creatures and 
            legendary beings from various world mythologies. Collect rare cards, build your 
            collection, and discover powerful synergies between creatures.
          </Text>
          
          <View style={styles.links}>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => {
                // Open GitHub repository
                const url = 'https://github.com/Jondari/creature-nexus-tcg';
                Linking.openURL(url);
              }}
            >
              <Github size={20} color={Colors.text.primary} />
              <Text style={styles.linkText}>GitHub Repository</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => {
                // Open official website
                const url = 'https://creature-nexus.netlify.app';
                Linking.openURL(url);
              }}
            >
              <Globe size={20} color={Colors.text.primary} />
              <Text style={styles.linkText}>Official Website</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut size={20} color={Colors.text.primary} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {!isAnonymous && (
          <TouchableOpacity 
            style={styles.deleteAccountButton} 
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Trash2 size={20} color={Colors.error || '#ff4444'} />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.versionText}>Creature Nexus TCG v1.0.0</Text>
      </ScrollView>

      <Modal
        visible={showLinkModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Account</Text>
            <Text style={styles.modalSubtitle}>
              Save your progress and access your collection from any device
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.text.secondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.text.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLinkModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleLinkWithEmail}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to permanently delete your account? This action cannot be undone and you will lose all your cards and progress.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeleteAccount}
                disabled={deleteLoading}
              >
                <Text style={styles.deleteButtonText}>
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  settingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  settingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    minWidth: 70,
    alignItems: 'center',
  },
  settingButtonActive: {
    backgroundColor: Colors.accent[600],
  },
  settingButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  settingButtonTextActive: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  links: {
    marginTop: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error || '#ff4444',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
  },
  deleteAccountText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.error || '#ff4444',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  saveProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent[500],
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  saveProgressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  googleSaveButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    marginTop: 8,
  },
  googleIcon: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#4285f4',
    backgroundColor: 'transparent',
  },
  googleSaveText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3c4043',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background.secondary,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: Colors.accent[500],
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  deleteButton: {
    backgroundColor: Colors.error || '#ff4444',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
});