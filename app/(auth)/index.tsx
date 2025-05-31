import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function AuthScreen() {
  const { user, loading, signInAnonymously } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);
  
  const handleLogin = async () => {
    await signInAnonymously();
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
            source={{ uri: 'https://images.pexels.com/photos/3270223/pexels-photo-3270223.jpeg' }}
            style={[styles.cardPreview, { transform: [{ rotate: '-10deg' }, { translateX: -20 }] }]}
          />
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1144687/pexels-photo-1144687.jpeg' }}
            style={[styles.cardPreview, { transform: [{ rotate: '5deg' }, { translateX: 20 }] }]}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
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
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
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
  }
});