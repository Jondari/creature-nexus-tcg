import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card } from '../models/Card';

export interface SavedDeck {
  id: string;
  name: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
}

interface DeckContextType {
  savedDecks: SavedDeck[];
  activeDeck: SavedDeck | null;
  saveDeck: (cards: Card[], name: string, deckId?: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  setActiveDeck: (deckId: string) => void;
  loadDecks: () => Promise<void>;
  syncDecks: () => Promise<void>;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

const DECKS_STORAGE_KEY = 'creature_nexus_decks';
const ACTIVE_DECK_STORAGE_KEY = 'creature_nexus_active_deck';

export function DeckProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [activeDeck, setActiveDeckState] = useState<SavedDeck | null>(null);
  const [hasLoadedFromFirebase, setHasLoadedFromFirebase] = useState(false);

  // Load decks when component mounts or user changes
  useEffect(() => {
    loadDecks();
  }, [user]);


  const loadDecks = async () => {
    try {
      if (user && !hasLoadedFromFirebase) {
        // First, try to load from Firebase
        await loadDecksFromFirebase();
      } else {
        // Load from AsyncStorage (cache or offline)
        await loadDecksFromAsyncStorage();
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading decks:', error);
      }
      // Fallback to AsyncStorage if Firebase fails
      await loadDecksFromAsyncStorage();
    }
  };

  const loadDecksFromAsyncStorage = async () => {
    try {
      const decksData = await AsyncStorage.getItem(DECKS_STORAGE_KEY);
      if (decksData) {
        const decks = JSON.parse(decksData);
        const parsedDecks = decks.map((deck: any) => ({
          ...deck,
          createdAt: new Date(deck.createdAt),
          updatedAt: new Date(deck.updatedAt),
        }));
        setSavedDecks(parsedDecks);

        // Load active deck
        const activeDeckId = await AsyncStorage.getItem(ACTIVE_DECK_STORAGE_KEY);
        if (activeDeckId) {
          const activeDeckData = parsedDecks.find((deck: SavedDeck) => deck.id === activeDeckId);
          if (activeDeckData) {
            setActiveDeckState(activeDeckData);
          }
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading decks from AsyncStorage:', error);
      }
    }
  };

  const loadDecksFromFirebase = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firebaseDecks = userData.decks || [];
        
        if (firebaseDecks.length > 0) {
          // Convert Firestore timestamps back to Date objects
          const parsedDecks = firebaseDecks.map((deck: any) => ({
            ...deck,
            createdAt: deck.createdAt?.toDate ? deck.createdAt.toDate() : new Date(deck.createdAt),
            updatedAt: deck.updatedAt?.toDate ? deck.updatedAt.toDate() : new Date(deck.updatedAt),
          }));
          
          setSavedDecks(parsedDecks);
          
          // Find and set active deck
          const activeDeck = parsedDecks.find((deck: SavedDeck) => deck.isActive);
          if (activeDeck) {
            setActiveDeckState(activeDeck);
            await AsyncStorage.setItem(ACTIVE_DECK_STORAGE_KEY, activeDeck.id);
          }
          
          // Cache in AsyncStorage for offline access
          await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(parsedDecks));
          
          setHasLoadedFromFirebase(true);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading decks from Firebase:', error);
      }
    }
  };

  const saveDeck = async (cards: Card[], name: string, deckId?: string) => {
    try {
      const now = new Date();
      let updatedDecks: SavedDeck[];

      if (deckId) {
        // Update existing deck
        updatedDecks = savedDecks.map(deck => 
          deck.id === deckId 
            ? { ...deck, name, cards, updatedAt: now }
            : deck
        );
      } else {
        // Create new deck
        const newDeck: SavedDeck = {
          id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          cards,
          createdAt: now,
          updatedAt: now,
        };
        updatedDecks = [...savedDecks, newDeck];
      }

      // Update local state immediately (fast UI response)
      setSavedDecks(updatedDecks);
      await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(updatedDecks));

      // If this is the first deck and no active deck, make it active FIRST
      if (updatedDecks.length === 1 && !activeDeck) {
        await setActiveDeck(updatedDecks[0].id);
      }

      // THEN sync to Firebase (always, after potential activation)
      if (user) {
        // Use a small delay to ensure state is updated after setActiveDeck
        setTimeout(() => {
          syncDecksToFirebase(savedDecks);
        }, 100);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving deck:', error);
      }
      throw error;
    }
  };

  const syncDecksToFirebase = async (decks: SavedDeck[]) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Convert dates to Firestore timestamps for storage
      const firebaseDecks = decks.map(deck => ({
        ...deck,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
      }));

      await updateDoc(userDocRef, {
        decks: firebaseDecks
      });

      if (__DEV__) {
        console.log('Decks synced to Firebase successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error syncing decks to Firebase:', error);
      }
    }
  };

  const deleteDeck = async (deckId: string) => {
    // Store original state for rollback
    const originalDecks = savedDecks;
    const originalActiveDeck = activeDeck;

    try {
      const updatedDecks = savedDecks.filter(deck => deck.id !== deckId);
      setSavedDecks(updatedDecks);
      await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(updatedDecks));

      // If deleted deck was active, clear active deck
      if (activeDeck?.id === deckId) {
        setActiveDeckState(null);
        await AsyncStorage.removeItem(ACTIVE_DECK_STORAGE_KEY);
      }

      // Sync deletion to Firebase
      if (user) {
        await syncDecksToFirebase(updatedDecks);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error deleting deck:', error);
      }
      
      // Rollback local changes on failure
      setSavedDecks(originalDecks);
      setActiveDeckState(originalActiveDeck);
      
      if (originalActiveDeck) {
        await AsyncStorage.setItem(ACTIVE_DECK_STORAGE_KEY, originalActiveDeck.id);
      }
      await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(originalDecks));
      
      throw error;
    }
  };

  const setActiveDeck = async (deckId: string) => {
    // Store original state for rollback
    const originalDecks = savedDecks;
    const originalActiveDeck = activeDeck;

    try {
      // Update isActive for all decks (only one can be active)
      const updatedDecks = savedDecks.map(deck => ({
        ...deck,
        isActive: deck.id === deckId
      }));

      const newActiveDeck = updatedDecks.find(d => d.id === deckId);
      if (newActiveDeck) {
        // Update local state first
        setSavedDecks(updatedDecks);
        setActiveDeckState(newActiveDeck);
        await AsyncStorage.setItem(ACTIVE_DECK_STORAGE_KEY, deckId);
        await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(updatedDecks));

        // Sync to Firebase with updated isActive status
        if (user) {
          await syncDecksToFirebase(updatedDecks);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error setting active deck:', error);
      }
      
      // Rollback local changes on Firebase sync failure
      setSavedDecks(originalDecks);
      setActiveDeckState(originalActiveDeck);
      
      if (originalActiveDeck) {
        await AsyncStorage.setItem(ACTIVE_DECK_STORAGE_KEY, originalActiveDeck.id);
      } else {
        await AsyncStorage.removeItem(ACTIVE_DECK_STORAGE_KEY);
      }
      await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(originalDecks));
      
      throw error;
    }
  };

  // Manual sync function for users
  const syncDecks = async () => {
    if (user && savedDecks.length > 0) {
      await syncDecksToFirebase(savedDecks);
    }
  };

  return (
    <DeckContext.Provider
      value={{
        savedDecks,
        activeDeck,
        saveDeck,
        deleteDeck,
        setActiveDeck,
        loadDecks,
        syncDecks,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
}

export function useDecks() {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error('useDecks must be used within a DeckProvider');
  }
  return context;
}