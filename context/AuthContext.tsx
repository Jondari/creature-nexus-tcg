import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  signOut, 
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  linkWithEmail: (email: string, password: string) => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccountWithEmail: (email: string, password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInAnonymously: async () => {},
  signOut: async () => {},
  linkWithEmail: async () => {},
  linkWithGoogle: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  createAccountWithEmail: async () => {},
  deleteAccount: async () => {},
  isAnonymous: false,
});

// Configure WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => useContext(AuthContext);

const ANONYMOUS_USER_KEY = 'anonymousUserId';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored anonymous user ID
        const storedUserId = await AsyncStorage.getItem(ANONYMOUS_USER_KEY);
        
        // If we have a stored ID but no current user, auto sign in
        if (storedUserId && !auth.currentUser) {
          console.log('Restoring anonymous session...');
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setIsAnonymous(user.isAnonymous);
        
        // Store the anonymous user ID for future sessions
        if (user.isAnonymous) {
          await AsyncStorage.setItem(ANONYMOUS_USER_KEY, user.uid);
        }
        
        // Check if user document exists
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // If not, create it
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            createdAt: serverTimestamp(),
            lastPackOpened: null,
            cards: []
          });
        }
      } else {
        setUser(null);
        setIsAnonymous(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const anonymousSignIn = async () => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear stored anonymous user ID
      await AsyncStorage.removeItem(ANONYMOUS_USER_KEY);
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const linkWithEmail = async (email: string, password: string) => {
    if (!user || !user.isAnonymous) {
      throw new Error('No anonymous user to link');
    }

    try {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(user, credential);
      
      // Update user document to mark as non-anonymous
      const userDocRef = doc(db, 'users', result.user.uid);
      await updateDoc(userDocRef, {
        email: email,
        isAnonymous: false,
        linkedAt: serverTimestamp()
      });

      // Clear anonymous flag from storage since user is now permanent
      await AsyncStorage.removeItem(ANONYMOUS_USER_KEY);
      
      // Force update the user state and anonymous flag to trigger re-render
      setUser(result.user);
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error linking with email:', error);
      throw error;
    }
  };

  const performGoogleAuth = async () => {
    try {
      // Configure Google Auth Session using modern API
      const redirectUri = AuthSession.makeRedirectUri({});

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri,
        extraParams: {
          nonce: 'nonce'
        },
      } as any);

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.id_token) {
        const credential = GoogleAuthProvider.credential(result.params.id_token);
        return credential;
      } else {
        throw new Error('Google sign-in was cancelled or failed');
      }
    } catch (error) {
      console.error('Error with Google auth:', error);
      throw error;
    }
  };

  const linkWithGoogle = async () => {
    if (!user || !user.isAnonymous) {
      throw new Error('No anonymous user to link');
    }

    try {
      const credential = await performGoogleAuth();
      const result = await linkWithCredential(user, credential);
      
      // Update user document to mark as non-anonymous
      const userDocRef = doc(db, 'users', result.user.uid);
      await updateDoc(userDocRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isAnonymous: false,
        linkedAt: serverTimestamp()
      });

      // Clear anonymous flag from storage since user is now permanent
      await AsyncStorage.removeItem(ANONYMOUS_USER_KEY);
      
      // Force update the user state and anonymous flag to trigger re-render
      setUser(result.user);
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error linking with Google:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const credential = await performGoogleAuth();
      const result = await signInWithCredential(auth, credential);
      
      // Check if user document exists, create if not
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          lastPackOpened: null,
          cards: [],
          isAnonymous: false
        });
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const createAccountWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        uid: result.user.uid,
        email: email,
        createdAt: serverTimestamp(),
        lastPackOpened: null,
        cards: [],
        isAnonymous: false
      });
    } catch (error) {
      console.error('Error creating account with email:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    console.log('deleteAccount called');
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found');
      throw new Error('No user to delete');
    }

    if (user.isAnonymous) {
      console.log('User is anonymous, cannot delete');
      throw new Error('Cannot delete anonymous accounts');
    }

    try {
      console.log('Deleting user document from Firestore...');
      const userDocRef = doc(db, 'users', user.uid);
      
      // Delete user document from Firestore
      await deleteDoc(userDocRef);
      console.log('User document deleted');
      
      console.log('Deleting user from Firebase Auth...');
      // Delete user from Firebase Auth
      await deleteUser(user);
      console.log('User deleted from Auth');
      
      console.log('Clearing stored data...');
      // Clear any stored data
      await AsyncStorage.removeItem(ANONYMOUS_USER_KEY);
      console.log('Account deletion completed');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInAnonymously: anonymousSignIn,
        signOut: handleSignOut,
        linkWithEmail,
        linkWithGoogle,
        signInWithGoogle,
        signInWithEmail,
        createAccountWithEmail,
        deleteAccount,
        isAnonymous,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};