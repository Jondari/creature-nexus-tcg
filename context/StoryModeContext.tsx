import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { STORY_CHAPTERS, StoryChapter, updateBattleProgress, unlockNextChapter } from '@/data/storyMode';
import StoryDeckGenerator from "@/utils/storyDeckGenerator";
import {Card} from "@/types/game";

const STORY_PROGRESS_KEY = 'creature_nexus_story_progress';
const SCHEMA_VERSION = 1;

interface StoryProgress {
  chapters: StoryChapter[];
  currentChapter: number;
  lastUpdated: Date;
}

interface StoryProgressLight {
  schemaVersion: number;
  currentChapter: number;
  unlockedChapters: number[];
  completedBattles: Record<number, string[]>;
  lastUpdated: Date;
}

// Helper functions
function deepCloneChapters(src: StoryChapter[]): StoryChapter[] {
  return src.map(c => ({ ...c, battles: c.battles.map(b => ({ ...b })) }));
}

function buildChaptersFromLight(light: StoryProgressLight, canon: StoryChapter[]): StoryChapter[] {
  const chapters = deepCloneChapters(canon);
  const unlocked = new Set(light.unlockedChapters);
  for (const ch of chapters) {
    ch.isUnlocked = unlocked.has(ch.id) || ch.id === 1;
    const doneIds = new Set(light.completedBattles[ch.id] || []);
    for (const b of ch.battles) {
      b.isCompleted = doneIds.has(b.id);
      if (ch.isUnlocked && ch.battles[0].id === b.id) b.isAccessible = true;
    }
  }
  return chapters;
}

function reconcileChapters(src: StoryChapter[]): StoryChapter[] {
  const chapters = deepCloneChapters(src);
  if (!chapters.length) return chapters;
  chapters[0].isUnlocked = true;
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const allDone = ch.battles.every(b => b.isCompleted);
    const bossBeaten = ch.battles.some(b => b.isBoss && b.isCompleted);
    ch.isCompleted = allDone;
    if (bossBeaten || allDone) {
      const nxt = i + 1;
      if (nxt < chapters.length) chapters[nxt].isUnlocked = true;
    }
  }
  return chapters;
}

interface StoryModeContextType {
  chapters: StoryChapter[];
  currentChapter: number;
  isLoading: boolean;
  completeBattle: (chapterId: number, battleId: string) => Promise<void>;
  unlockChapter: (chapterId: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  unlockAllChapters: () => Promise<void>;
  getChapterProgress: (chapterId: number) => { completed: number; total: number; percentage: number };
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
}

const StoryModeContext = createContext<StoryModeContextType | undefined>(undefined);

export function StoryModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<StoryChapter[]>([...STORY_CHAPTERS]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [user]);

  // Firebase real-time sync for story progress
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, { includeMetadataChanges: true }, async (snap) => {
      try {
        if (snap.metadata.hasPendingWrites) return;

        if (snap.exists()) {
          const userData = snap.data();
          if (userData.storyProgress) {
            const progress: StoryProgress = {
              ...userData.storyProgress,
              lastUpdated: userData.storyProgress.lastUpdated?.toDate() || new Date(),
            };
            
            // Update local state with Firebase data
            setChapters(progress.chapters);
            setCurrentChapter(progress.currentChapter);
            
            // Also save to local storage
            await AsyncStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(progress));
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error syncing story progress from Firebase:', error);
        }
      }
    });

    return unsub;
  }, [user]);

  const saveProgressLight = async (userId: string | undefined, light: StoryProgressLight) => {
    await AsyncStorage.setItem('creature_nexus_story_progress_light', JSON.stringify(light));
    if (userId) {
      await setDoc(doc(db, 'users', userId), { storyProgressLight: light }, { merge: true });
    }
  };

  const saveProgress = async () => {
    try {
      const progress: StoryProgress = {
        chapters,
        currentChapter,
        lastUpdated: new Date(),
      };

      // Save to local storage
      await AsyncStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(progress));

      // Save to Firebase if user is authenticated
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          storyProgress: {
            ...progress,
            lastUpdated: new Date(),
          }
        }, { merge: true });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving story progress:', error);
      }
    }
  };

  const loadProgress = async () => {
    try {
      setIsLoading(true);

      let light: StoryProgressLight | null = null;

      // 1. Try to load storyProgressLight from Firebase first if user is authenticated
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().storyProgressLight) {
          const firebaseLight = userDoc.data().storyProgressLight;
          light = {
            ...firebaseLight,
            lastUpdated: firebaseLight.lastUpdated?.toDate() || new Date(),
          };
        }
      }

      // Fallback to local storyProgressLight
      if (!light) {
        const storedLight = await AsyncStorage.getItem('creature_nexus_story_progress_light');
        if (storedLight) {
          light = JSON.parse(storedLight);
          light.lastUpdated = new Date(light.lastUpdated);
        }
      }

      // 2. If storyProgressLight exists, use it
      if (light) {
        const chapters = buildChaptersFromLight(light, STORY_CHAPTERS);
        const reconciledChapters = reconcileChapters(chapters);
        setChapters(reconciledChapters);
        setCurrentChapter(light.currentChapter);
        setIsLoading(false);
        return;
      }

      // 3. Try to load legacy storyProgress and convert it
      let legacyProgress: StoryProgress | null = null;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().storyProgress) {
          const firebaseProgress = userDoc.data().storyProgress;
          legacyProgress = {
            ...firebaseProgress,
            lastUpdated: firebaseProgress.lastUpdated?.toDate() || new Date(),
          };
        }
      }

      if (!legacyProgress) {
        const storedProgress = await AsyncStorage.getItem(STORY_PROGRESS_KEY);
        if (storedProgress) {
          legacyProgress = JSON.parse(storedProgress);
          legacyProgress.lastUpdated = new Date(legacyProgress.lastUpdated);
        }
      }

      if (legacyProgress) {
        // Convert legacy progress to light format
        const unlockedChapters = legacyProgress.chapters
          .filter(ch => ch.isUnlocked)
          .map(ch => ch.id);
        
        const completedBattles: Record<number, string[]> = {};
        legacyProgress.chapters.forEach(ch => {
          const completed = ch.battles.filter(b => b.isCompleted).map(b => b.id);
          if (completed.length > 0) {
            completedBattles[ch.id] = completed;
          }
        });

        const convertedLight: StoryProgressLight = {
          schemaVersion: SCHEMA_VERSION,
          currentChapter: legacyProgress.currentChapter,
          unlockedChapters,
          completedBattles,
          lastUpdated: new Date(),
        };

        // Save the converted light progress
        await saveProgressLight(user?.uid, convertedLight);

        // Load from the converted light progress
        const chapters = buildChaptersFromLight(convertedLight, STORY_CHAPTERS);
        const reconciledChapters = reconcileChapters(chapters);
        setChapters(reconciledChapters);
        setCurrentChapter(convertedLight.currentChapter);
        setIsLoading(false);
        return;
      }

      // 4. Bootstrap with defaults
      const defaultLight: StoryProgressLight = {
        schemaVersion: SCHEMA_VERSION,
        currentChapter: 1,
        unlockedChapters: [1],
        completedBattles: {},
        lastUpdated: new Date(),
      };

      await saveProgressLight(user?.uid, defaultLight);

      const chapters = buildChaptersFromLight(defaultLight, STORY_CHAPTERS);
      const reconciledChapters = reconcileChapters(chapters);
      setChapters(reconciledChapters);
      setCurrentChapter(1);
      
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading story progress:', error);
      }
      // Reset to default if loading fails
      const defaultChapters = [...STORY_CHAPTERS];
      defaultChapters[0].isUnlocked = true;
      setChapters(defaultChapters);
      setCurrentChapter(1);
    } finally {
      setIsLoading(false);
    }
  };

  const completeBattle = async (chapterId: number, battleId: string) => {
    try {
      const updatedChapters = [...chapters];
      const chapterIndex = updatedChapters.findIndex(c => c.id === chapterId);
      
      if (chapterIndex === -1) return;

      const chapter = updatedChapters[chapterIndex];
      const battle = chapter.battles.find(b => b.id === battleId);
      
      if (!battle || battle.isCompleted) return;

      // Mark battle as completed
      battle.isCompleted = true;

      // Update accessibility of connected battles
      battle.connections.forEach(connectionId => {
        const connectedBattle = chapter.battles.find(b => b.id === connectionId);
        if (connectedBattle) {
          connectedBattle.isAccessible = true;
        }
      });

      // Check if this is a boss battle - if so, unlock next chapter immediately
      if (battle.isBoss) {
        chapter.isCompleted = true;
        
        // Unlock next chapter when boss is defeated
        const nextChapterIndex = chapterIndex + 1;
        if (nextChapterIndex < updatedChapters.length) {
          updatedChapters[nextChapterIndex].isUnlocked = true;
          setCurrentChapter(updatedChapters[nextChapterIndex].id);
        }
      } else {
        // Check if chapter is completed (all battles done)
        const allBattlesCompleted = chapter.battles.every(b => b.isCompleted);
        if (allBattlesCompleted) {
          chapter.isCompleted = true;
          
          // Unlock next chapter
          const nextChapterIndex = chapterIndex + 1;
          if (nextChapterIndex < updatedChapters.length) {
            updatedChapters[nextChapterIndex].isUnlocked = true;
            setCurrentChapter(updatedChapters[nextChapterIndex].id);
          }
        }
      }

      // Reconcile chapters to ensure proper state
      const reconciledChapters = reconcileChapters(updatedChapters);
      setChapters(reconciledChapters);

      // Build light progress from reconciled state
      const unlockedChapters = reconciledChapters
        .filter(ch => ch.isUnlocked)
        .map(ch => ch.id);
      
      const completedBattles: Record<number, string[]> = {};
      reconciledChapters.forEach(ch => {
        const completed = ch.battles.filter(b => b.isCompleted).map(b => b.id);
        if (completed.length > 0) {
          completedBattles[ch.id] = completed;
        }
      });

      const lightProgress: StoryProgressLight = {
        schemaVersion: SCHEMA_VERSION,
        currentChapter,
        unlockedChapters,
        completedBattles,
        lastUpdated: new Date(),
      };

      await saveProgressLight(user?.uid, lightProgress);
    } catch (error) {
      if (__DEV__) {
        console.error('Error completing battle:', error);
      }
    }
  };

  const unlockChapter = async (chapterId: number) => {
    try {
      const updatedChapters = [...chapters];
      const chapter = updatedChapters.find(c => c.id === chapterId);
      
      if (chapter && !chapter.isUnlocked) {
        chapter.isUnlocked = true;
        setChapters(updatedChapters);
        await saveProgress();
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error unlocking chapter:', error);
      }
    }
  };

  const resetProgress = async () => {
    try {
      // Clear both heavy and light progress from Firebase
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { 
          storyProgress: null,
          storyProgressLight: null 
        }, { merge: true });
      }

      // Clear local storage
      await AsyncStorage.removeItem(STORY_PROGRESS_KEY);
      await AsyncStorage.removeItem('creature_nexus_story_progress_light');

      // Bootstrap default light progress
      const defaultLight: StoryProgressLight = {
        schemaVersion: SCHEMA_VERSION,
        currentChapter: 1,
        unlockedChapters: [1],
        completedBattles: {},
        lastUpdated: new Date(),
      };

      await saveProgressLight(user?.uid, defaultLight);

      // Load from default light progress
      const chapters = buildChaptersFromLight(defaultLight, STORY_CHAPTERS);
      const reconciledChapters = reconcileChapters(chapters);
      setChapters(reconciledChapters);
      setCurrentChapter(1);
    } catch (error) {
      if (__DEV__) {
        console.error('Error resetting progress:', error);
      }
    }
  };

  const unlockAllChapters = async () => {
    try {
      const allChapterIds = STORY_CHAPTERS.map(ch => ch.id);
      
      const lightProgress: StoryProgressLight = {
        schemaVersion: SCHEMA_VERSION,
        currentChapter,
        unlockedChapters: allChapterIds,
        completedBattles: {},
        lastUpdated: new Date(),
      };

      await saveProgressLight(user?.uid, lightProgress);

      // Load from the new light progress
      const chapters = buildChaptersFromLight(lightProgress, STORY_CHAPTERS);
      const reconciledChapters = reconcileChapters(chapters);
      setChapters(reconciledChapters);
    } catch (error) {
      if (__DEV__) {
        console.error('Error unlocking all chapters:', error);
      }
    }
  };

  const getChapterProgress = (chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = chapter.battles.filter(b => b.isCompleted).length;
    const total = chapter.battles.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  return (
    <StoryModeContext.Provider
      value={{
        chapters,
        currentChapter,
        isLoading,
        completeBattle,
        unlockChapter,
        resetProgress,
        unlockAllChapters,
        getChapterProgress,
        saveProgress,
        loadProgress,
      }}
    >
      {children}
    </StoryModeContext.Provider>
  );
}

export function useStoryMode(): StoryModeContextType {
  const context = useContext(StoryModeContext);
  if (context === undefined) {
    throw new Error('useStoryMode must be used within a StoryModeProvider');
  }
  return context;
}
export function getAIDeckForBattle(chapterId: number, battleIndex: number, isBoss: boolean) {
  if (isBoss) return StoryDeckGenerator.generateBossDeck(chapterId);
  const cfg = StoryDeckGenerator.getChapterDeckConfig(chapterId, battleIndex);
  const gen = new StoryDeckGenerator(cfg.seed);
  return gen.generateDeck(cfg);
}