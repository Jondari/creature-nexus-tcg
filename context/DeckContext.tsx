import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../models/Card';

export interface SavedDeck {
  id: string;
  name: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

interface DeckContextType {
  savedDecks: SavedDeck[];
  activeDeck: SavedDeck | null;
  saveDeck: (cards: Card[], name: string, deckId?: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  setActiveDeck: (deckId: string) => void;
  loadDecks: () => Promise<void>;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

const DECKS_STORAGE_KEY = 'creature_nexus_decks';
const ACTIVE_DECK_STORAGE_KEY = 'creature_nexus_active_deck';

export function DeckProvider({ children }: { children: React.ReactNode }) {
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [activeDeck, setActiveDeckState] = useState<SavedDeck | null>(null);

  // Load decks from storage on mount
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      // Load saved decks
      const decksData = await AsyncStorage.getItem(DECKS_STORAGE_KEY);
      if (decksData) {
        const decks = JSON.parse(decksData);
        // Convert date strings back to Date objects
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
        console.error('Error loading decks:', error);
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

      setSavedDecks(updatedDecks);
      await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(updatedDecks));

      // If this is the first deck, make it active
      if (updatedDecks.length === 1 && !activeDeck) {
        setActiveDeck(updatedDecks[0].id);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving deck:', error);
      }
      throw error;
    }
  };

  const deleteDeck = async (deckId: string) => {
    try {
      const updatedDecks = savedDecks.filter(deck => deck.id !== deckId);
      setSavedDecks(updatedDecks);
      await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(updatedDecks));

      // If deleted deck was active, clear active deck
      if (activeDeck?.id === deckId) {
        setActiveDeckState(null);
        await AsyncStorage.removeItem(ACTIVE_DECK_STORAGE_KEY);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error deleting deck:', error);
      }
      throw error;
    }
  };

  const setActiveDeck = async (deckId: string) => {
    const deck = savedDecks.find(d => d.id === deckId);
    if (deck) {
      setActiveDeckState(deck);
      await AsyncStorage.setItem(ACTIVE_DECK_STORAGE_KEY, deckId);
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