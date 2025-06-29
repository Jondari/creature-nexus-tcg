import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, LogIn } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import LoadingOverlay from '@/components/LoadingOverlay';
import CustomAlert from '@/components/CustomAlert';

// Premium monster showcase images
const PREMIUM_MONSTERS = {
  // Mythic monsters
  Mythanor: require('../../assets/images/mythic/Mythanor.png'),
  Mythelgotn: require('../../assets/images/mythic/Mythelgotn.png'),
  Mytholzak: require('../../assets/images/mythic/Mytholzak.png'),
  Mythunden: require('../../assets/images/mythic/Mythunden.png'),
  Mythévor: require('../../assets/images/mythic/Mythévor.png'),
  // Legendary monsters
  Golrok: require('../../assets/images/legendary/Golrok.png'),
  Selel: require('../../assets/images/legendary/Selel.png'),
  Solen: require('../../assets/images/legendary/Solen.png'),
  Stonelorn: require('../../assets/images/legendary/Stonelorn.png'),
  Zephun: require('../../assets/images/legendary/Zephun.png'),
};

// Get 2 random different monsters for showcase
const getRandomShowcaseMonsters = () => {
  const monsterNames = Object.keys(PREMIUM_MONSTERS);
  const shuffled = [...monsterNames].sort(() => Math.random() - 0.5);
  return [
    PREMIUM_MONSTERS[shuffled[0] as keyof typeof PREMIUM_MONSTERS],
    PREMIUM_MONSTERS[shuffled[1] as keyof typeof PREMIUM_MONSTERS]
  ];
};

export default function AuthScreen() {
  const { user, loading, signInAnonymously, signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Random showcase monsters (2 different ones)
  const [showcaseMonsters] = useState(() => getRandomShowcaseMonsters());
  
  // Alert state
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setAlert({
      visible: true,
      title,
      message,
      type
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };
  
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);
  
  const handleAnonymousLogin = async () => {
    await signInAnonymously();
  };

  const getSignInErrorMessage = (error: any) => {
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'No account found with this email. Please check your email or create a new account.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        default:
          return error.message || 'Failed to sign in. Please check your credentials.';
      }
    }
    return error.message || 'Failed to sign in. Please check your credentials.';
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      setLoginLoading(true);
      await signInWithEmail(email, password);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Error signing in:', error);
      showAlert('Error', getSignInErrorMessage(error));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      showAlert('Error', 'Failed to sign in with Google. Please try again.');
    }
  };
  
  if (loading) {
    return <LoadingOverlay message="Getting things ready..." />;
  }
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background.primary, Colors.primary[900], Colors.background.primary]}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Creature</Text>
          <Text style={styles.logoAccent}>Nexus</Text>
        </View>
        
        <Text style={styles.subtitle}>The Ultimate Trading Card Game</Text>
        
        <View style={styles.cardsPreviewContainer}>
          <Image
            source={showcaseMonsters[0]}
            style={[styles.cardPreview, { transform: [{ rotate: '-10deg' }, { translateX: -20 }] }]}
          />
          <Image
            source={showcaseMonsters[1]}
            style={[styles.cardPreview, { transform: [{ rotate: '5deg' }, { translateX: 20 }] }]}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAnonymousLogin}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.accent[700], Colors.accent[500]]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>Start Your Adventure</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => setShowLoginModal(true)}
          activeOpacity={0.8}
        >
          <Mail size={20} color={Colors.accent[500]} />
          <Text style={styles.loginButtonText}>Sign In with Email</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity 
          style={[styles.loginButton, styles.googleButton]} 
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity> */}
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

      <Modal
        visible={showLoginModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign In</Text>
            <Text style={styles.modalSubtitle}>
              Welcome back! Sign in to access your collection.
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
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.signInButton]}
                onPress={handleEmailLogin}
                disabled={loginLoading}
              >
                <Text style={styles.signInButtonText}>
                  {loginLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  logoAccent: {
    fontSize: 42,
    fontFamily: 'Poppins-Bold',
    color: Colors.accent[500],
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    marginBottom: 40,
  },
  cardsPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  cardPreview: {
    width: 150,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.accent[500],
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.accent[500],
    borderRadius: 28,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.accent[500],
    marginLeft: 8,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#dadce0',
    marginBottom: 16,
  },
  googleIcon: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#4285f4',
    backgroundColor: 'transparent',
  },
  googleButtonText: {
    fontSize: 16,
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
  signInButton: {
    backgroundColor: Colors.accent[500],
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  signInButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
});