import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
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

  // Firebase real-time sync
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, { includeMetadataChanges: true }, async (snap) => {
      try {
        if (snap.metadata.hasPendingWrites) return; // ← ignore pending local writes
        const data = snap.data();

        // If the 'decks' field is missing, assume an empty deck list
        if (!data || !Array.isArray(data.decks)) {
          setSavedDecks([]);
          setActiveDeckState(null);
          await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify([]));
          await AsyncStorage.removeItem(ACTIVE_DECK_STORAGE_KEY);
          return;
        }

        const parsed = data.decks.map((d: any) => ({
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
        }));

        // 1) Local state
        setSavedDecks(parsed);

        // 2) Offline local cache
        await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(parsed));

        // 3) Local active deck (no cloud write here)
        const act = parsed.find((d: any) => d.isActive);
        if (act) {
          setActiveDeckState(act); // ⬅ avoid calling setActiveDeck (it will re-sync Firebase)
          await AsyncStorage.setItem(ACTIVE_DECK_STORAGE_KEY, act.id);
        } else if (parsed.length === 0) {
          setActiveDeckState(null);
          await AsyncStorage.removeItem(ACTIVE_DECK_STORAGE_KEY);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error during snapshot :', error);
        }
      }
    });

    return () => unsub();
  }, [user?.uid]); // re-subscribe on user change

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

      const firebaseDecks = userDoc.exists() ? (userDoc.data().decks || []) : [];

      // Convert Firestore timestamps back to Date objects
      const parsedDecks = firebaseDecks.map((deck: any) => ({
        ...deck,
        createdAt: deck.createdAt?.toDate ? deck.createdAt.toDate() : new Date(deck.createdAt),
        updatedAt: deck.updatedAt?.toDate ? deck.updatedAt.toDate() : new Date(deck.updatedAt),
      }));
          
      setSavedDecks(parsedDecks);

      if (parsedDecks.length) {
        // Find and set active deck
        const activeDeck = parsedDecks.find((deck: SavedDeck) => deck.isActive);
        if (activeDeck) {
          setActiveDeckState(activeDeck);
          await AsyncStorage.setItem(ACTIVE_DECK_STORAGE_KEY, activeDeck.id);
        }
      } else {
        setActiveDeckState(null);
        await AsyncStorage.removeItem(ACTIVE_DECK_STORAGE_KEY);
      }
      // Cache in AsyncStorage for offline access
      await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(parsedDecks));
      setHasLoadedFromFirebase(true);
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
        await setActiveDeck(updatedDecks[0].id); // <- do a sync already
      } else if (user) {
        // Push the ACTUAL updated state (avoid stale closure)
        await syncDecksToFirebase(updatedDecks);
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

      // setDoc with merge: true creates-or-updates (updateDoc fails if doc doesn't exist)
      await setDoc(userDocRef, { decks: firebaseDecks }, { merge: true });

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
    // Original state for rollback
    const originalDecks = savedDecks;
    const originalActiveDeck = activeDeck;

    // Copies computed from the most up-to-date state
    let updatedDecksLocal: SavedDeck[] = [];
    let newActiveLocal: SavedDeck | null = null;

    try {
      // 1) Update savedDecks using the most up-to-date "prev"
      setSavedDecks((prev) => {
        updatedDecksLocal = prev.map(d => ({ ...d, isActive: d.id === deckId }));
        newActiveLocal = updatedDecksLocal.find(d => d.id === deckId) ?? null;
        return updatedDecksLocal;
      });

      // If the ID doesn't exist (deck deleted / invalid ID), clear the active deck and exit cleanly
      if (!newActiveLocal) {
        setActiveDeckState(null);
        await Promise.all([
          AsyncStorage.removeItem(ACTIVE_DECK_STORAGE_KEY),
          AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(updatedDecksLocal)),
        ]);
        return;
      }

      // 2) Update the local active deck and cache
      setActiveDeckState(newActiveLocal);
      await Promise.all([
        AsyncStorage.setItem(ACTIVE_DECK_STORAGE_KEY, deckId),
        AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(updatedDecksLocal)),
      ]);

      // 3) Sync Firebase
      if (user) {
        await syncDecksToFirebase(updatedDecksLocal);
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