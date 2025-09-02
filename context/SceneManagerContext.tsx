/**
 * Scene Manager Context
 * 
 * Manages scene execution, triggering, and persistence. Provides the central
 * orchestration for the Scenes Engine across the entire application.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SceneSpec,
  SceneTrigger,
  SceneManagerAPI,
  TutorialProgress,
  SceneState,
  SceneEvent,
} from '@/types/scenes';
import SceneRunner from '@/components/SceneRunner';

// Storage keys
const TUTORIAL_PROGRESS_KEY = 'tutorial_progress';
const SCENE_ANALYTICS_KEY = 'scene_analytics';

// Context
const SceneManagerContext = createContext<SceneManagerAPI | null>(null);

interface SceneManagerProviderProps {
  children: React.ReactNode;
  userId?: string;
  debugMode?: boolean;
}

export const SceneManagerProvider: React.FC<SceneManagerProviderProps> = ({
  children,
  userId,
  debugMode = false,
}) => {
  // State
  const [registeredScenes, setRegisteredScenes] = useState<Map<string, SceneSpec>>(new Map());
  const [currentScene, setCurrentScene] = useState<{ scene: SceneSpec; state: SceneState } | null>(null);
  const [tutorialProgress, setTutorialProgress] = useState<TutorialProgress>({
    flags: {},
    progress: {},
    completedScenes: [],
    lastSeenAt: {},
  });

  // Event listeners
  const eventListeners = useRef<Set<(event: SceneEvent) => void>>(new Set());
  
  // Loading state
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tutorial progress on mount
  useEffect(() => {
    loadTutorialProgress();
  }, [userId]);

  // Persistence functions
  const saveTutorialProgress = useCallback(async (): Promise<void> => {
    try {
      const key = userId ? `${TUTORIAL_PROGRESS_KEY}_${userId}` : TUTORIAL_PROGRESS_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(tutorialProgress));
      
      if (debugMode) {
        console.log('[SceneManager] Saved tutorial progress:', tutorialProgress);
      }
    } catch (error) {
      console.error('[SceneManager] Error saving tutorial progress:', error);
    }
  }, [tutorialProgress, userId, debugMode]);

  const loadTutorialProgress = useCallback(async (): Promise<void> => {
    try {
      const key = userId ? `${TUTORIAL_PROGRESS_KEY}_${userId}` : TUTORIAL_PROGRESS_KEY;
      const stored = await AsyncStorage.getItem(key);
      
      if (stored) {
        const progress = JSON.parse(stored) as TutorialProgress;
        setTutorialProgress(progress);
        
        if (debugMode) {
          console.log('[SceneManager] Loaded tutorial progress:', progress);
        }
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('[SceneManager] Error loading tutorial progress:', error);
      setIsLoaded(true);
    }
  }, [userId, debugMode]);

  // Auto-save progress when it changes
  useEffect(() => {
    if (isLoaded) {
      saveTutorialProgress();
    }
  }, [tutorialProgress, isLoaded, saveTutorialProgress]);

  // Event system
  const emitEvent = useCallback((event: SceneEvent) => {
    eventListeners.current.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[SceneManager] Event listener error:', error);
      }
    });
  }, []);

  const addEventListener = useCallback((listener: (event: SceneEvent) => void) => {
    eventListeners.current.add(listener);
    return () => eventListeners.current.delete(listener);
  }, []);

  // Scene management
  const registerScene = useCallback((scene: SceneSpec) => {
    setRegisteredScenes(prev => new Map(prev).set(scene.id, scene));
    
    if (debugMode) {
      console.log(`[SceneManager] Registered scene: ${scene.id}`);
    }
  }, [debugMode]);

  const unregisterScene = useCallback((sceneId: string) => {
    setRegisteredScenes(prev => {
      const next = new Map(prev);
      next.delete(sceneId);
      return next;
    });
    
    if (debugMode) {
      console.log(`[SceneManager] Unregistered scene: ${sceneId}`);
    }
  }, [debugMode]);

  const getScene = useCallback((sceneId: string): SceneSpec | null => {
    return registeredScenes.get(sceneId) || null;
  }, [registeredScenes]);

  const getAllScenes = useCallback((): SceneSpec[] => {
    return Array.from(registeredScenes.values());
  }, [registeredScenes]);

  // Flag management
  const getFlag = useCallback((key: string): boolean => {
    return tutorialProgress.flags[key] || false;
  }, [tutorialProgress.flags]);

  const setFlag = useCallback((key: string, value: boolean) => {
    setTutorialProgress(prev => {
      const newFlags = { ...prev.flags, [key]: value };
      emitEvent({ 
        type: 'flag_changed', 
        key, 
        oldValue: prev.flags[key] || false, 
        newValue: value 
      });
      
      return {
        ...prev,
        flags: newFlags,
      };
    });
  }, [emitEvent]);

  // Progress management
  const getProgress = useCallback((key: string): number => {
    return tutorialProgress.progress[key] || 0;
  }, [tutorialProgress.progress]);

  const setProgress = useCallback((key: string, value: number) => {
    setTutorialProgress(prev => {
      const newProgress = { ...prev.progress, [key]: value };
      emitEvent({ 
        type: 'progress_changed', 
        key, 
        oldValue: prev.progress[key] || 0, 
        newValue: value 
      });
      
      return {
        ...prev,
        progress: newProgress,
      };
    });
  }, [emitEvent]);

  // Scene completion tracking
  const markSceneCompleted = useCallback((sceneId: string) => {
    setTutorialProgress(prev => ({
      ...prev,
      completedScenes: [...new Set([...prev.completedScenes, sceneId])],
      lastSeenAt: {
        ...prev.lastSeenAt,
        [sceneId]: Date.now(),
      },
    }));
  }, []);

  const isSceneCompleted = useCallback((sceneId: string): boolean => {
    return tutorialProgress.completedScenes.includes(sceneId);
  }, [tutorialProgress.completedScenes]);

  const getCompletedScenes = useCallback((): string[] => {
    return [...tutorialProgress.completedScenes];
  }, [tutorialProgress.completedScenes]);

  // Scene condition evaluation
  const evaluateSceneConditions = useCallback((scene: SceneSpec): boolean => {
    if (!scene.conditions) return true;

    // Check flags
    if (scene.conditions.flags) {
      for (const [flagKey, requiredValue] of Object.entries(scene.conditions.flags)) {
        if (getFlag(flagKey) !== requiredValue) {
          return false;
        }
      }
    }

    // Check progress
    if (scene.conditions.progress) {
      for (const [progressKey, requiredValue] of Object.entries(scene.conditions.progress)) {
        if (getProgress(progressKey) < requiredValue) {
          return false;
        }
      }
    }

    // Additional conditions can be added here
    return true;
  }, [getFlag, getProgress]);

  // Trigger matching
  const matchesTrigger = useCallback((sceneTrigger: SceneTrigger, checkTrigger: SceneTrigger): boolean => {
    if (sceneTrigger.type !== checkTrigger.type) return false;

    switch (sceneTrigger.type) {
      case 'onFirstLaunch':
        return true;

      case 'onEnterScreen':
        return sceneTrigger.screen === (checkTrigger as any).screen;

      case 'onBattleStart':
        return (!sceneTrigger.chapterId || sceneTrigger.chapterId === (checkTrigger as any).chapterId) &&
               (!sceneTrigger.battleId || sceneTrigger.battleId === (checkTrigger as any).battleId);

      case 'onBattleEnd':
        return sceneTrigger.result === 'any' || sceneTrigger.result === (checkTrigger as any).result;

      case 'onBattleAction':
        return sceneTrigger.action === (checkTrigger as any).action;

      case 'onStoryProgress':
        return sceneTrigger.chapterId === (checkTrigger as any).chapterId &&
               (!sceneTrigger.battleId || sceneTrigger.battleId === (checkTrigger as any).battleId);

      case 'onPackOpened':
        return !sceneTrigger.packType || sceneTrigger.packType === (checkTrigger as any).packType;

      case 'onAchievement':
        return sceneTrigger.achievementId === (checkTrigger as any).achievementId;

      case 'manual':
        return sceneTrigger.id === (checkTrigger as any).id;

      default:
        return false;
    }
  }, []);

  // Scene triggering
  const checkTriggers = useCallback(async (trigger: SceneTrigger): Promise<void> => {
    if (!isLoaded) return;

    const eligibleScenes = Array.from(registeredScenes.values())
      .filter(scene => {
        // Check if scene has already been completed
        if (isSceneCompleted(scene.id)) return false;
        
        // Check if any trigger matches
        if (!scene.triggers.some(t => matchesTrigger(t, trigger))) return false;
        
        // Check scene conditions
        if (!evaluateSceneConditions(scene)) return false;
        
        return true;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0)); // Higher priority first

    if (eligibleScenes.length > 0) {
      const sceneToStart = eligibleScenes[0];
      
      if (debugMode) {
        console.log(`[SceneManager] Triggering scene: ${sceneToStart.id} for trigger:`, trigger);
      }
      
      await startScene(sceneToStart.id);
    }
  }, [isLoaded, registeredScenes, isSceneCompleted, matchesTrigger, evaluateSceneConditions, debugMode]);

  // Scene execution
  const startScene = useCallback(async (sceneId: string): Promise<boolean> => {
    const scene = getScene(sceneId);
    if (!scene) {
      console.warn(`[SceneManager] Scene not found: ${sceneId}`);
      return false;
    }

    if (currentScene) {
      console.warn(`[SceneManager] Scene ${currentScene.scene.id} already running, stopping it`);
      stopCurrentScene();
    }

    const initialState: SceneState = {
      sceneId: scene.id,
      stepIndex: 0,
      flags: { ...tutorialProgress.flags },
      progress: { ...tutorialProgress.progress },
      labels: {},
      dialog: null,
      highlight: null,
      visuals: {
        background: scene.backgroundImage,
        portraits: {},
        overlays: [],
      },
      audio: {
        sounds: [],
      },
      maskInput: false,
      isWaitingForInput: false,
    };

    setCurrentScene({ scene, state: initialState });
    
    emitEvent({ type: 'scene_started', sceneId: scene.id });
    
    if (debugMode) {
      console.log(`[SceneManager] Started scene: ${sceneId}`);
    }
    
    return true;
  }, [getScene, currentScene, tutorialProgress, emitEvent, debugMode]);

  const stopCurrentScene = useCallback(() => {
    if (currentScene) {
      emitEvent({ 
        type: 'scene_finished', 
        sceneId: currentScene.scene.id, 
        reason: 'interrupted' 
      });
      
      setCurrentScene(null);
      
      if (debugMode) {
        console.log(`[SceneManager] Stopped scene: ${currentScene.scene.id}`);
      }
    }
  }, [currentScene, emitEvent, debugMode]);

  const getCurrentScene = useCallback((): { scene: SceneSpec; state: SceneState } | null => {
    return currentScene;
  }, [currentScene]);

  // Scene completion handler
  const handleSceneFinish = useCallback(() => {
    if (currentScene) {
      markSceneCompleted(currentScene.scene.id);
      emitEvent({ 
        type: 'scene_finished', 
        sceneId: currentScene.scene.id, 
        reason: 'completed' 
      });
      
      if (debugMode) {
        console.log(`[SceneManager] Completed scene: ${currentScene.scene.id}`);
      }
      
      setCurrentScene(null);
    }
  }, [currentScene, markSceneCompleted, emitEvent, debugMode]);

  // Scene action handler
  const handleSceneAction = useCallback((action: string, data: any) => {
    switch (action) {
      case 'flag_changed':
        setFlag(data.key, data.newValue);
        break;
      
      case 'progress_changed':
        setProgress(data.key, data.newValue);
        break;
      
      case 'scene_action':
        // Handle navigation, battles, etc.
        emitEvent({ type: 'scene_step', sceneId: data.sceneId || '', stepIndex: data.stepIndex || 0, command: data.data });
        break;
      
      default:
        if (debugMode) {
          console.log(`[SceneManager] Scene action: ${action}`, data);
        }
    }
  }, [setFlag, setProgress, emitEvent, debugMode]);

  // API object
  const api: SceneManagerAPI = {
    // Scene execution
    startScene,
    stopCurrentScene,
    getCurrentScene,
    
    // Scene registration
    registerScene,
    unregisterScene,
    getScene,
    getAllScenes,
    
    // Trigger system
    checkTriggers,
    evaluateSceneConditions,
    
    // State management
    getFlag,
    setFlag,
    getProgress,
    setProgress,
    
    // Scene history
    markSceneCompleted,
    isSceneCompleted,
    getCompletedScenes,
    
    // Persistence
    saveTutorialProgress,
    loadTutorialProgress,
  };

  return (
    <SceneManagerContext.Provider value={api}>
      {children}
      
      {/* Scene Runner Overlay */}
      {currentScene && (
        <SceneRunner
          scene={currentScene.scene}
          onFinish={handleSceneFinish}
          onSceneAction={handleSceneAction}
          initialState={{
            flags: tutorialProgress.flags,
            progress: tutorialProgress.progress,
          }}
        />
      )}
    </SceneManagerContext.Provider>
  );
};

// Hook to access the scene manager
export const useSceneManager = (): SceneManagerAPI => {
  const context = useContext(SceneManagerContext);
  if (!context) {
    throw new Error('useSceneManager must be used within a SceneManagerProvider');
  }
  return context;
};

// Hook to register a scene (typically used in scene definition files)
export const useSceneRegistration = (scene: SceneSpec) => {
  const sceneManager = useSceneManager();
  
  useEffect(() => {
    sceneManager.registerScene(scene);
    return () => sceneManager.unregisterScene(scene.id);
  }, [sceneManager, scene]);
};

// Hook to trigger scenes from components
export const useSceneTrigger = () => {
  const sceneManager = useSceneManager();
  
  return useCallback((trigger: SceneTrigger) => {
    sceneManager.checkTriggers(trigger);
  }, [sceneManager]);
};

// Hook for debugging scenes in development
export const useSceneDebug = () => {
  const sceneManager = useSceneManager();
  
  return {
    listScenes: () => {
      const scenes = sceneManager.getAllScenes();
      console.log('[SceneDebug] Registered scenes:', scenes.map(s => s.id));
      return scenes;
    },
    
    startScene: (sceneId: string) => {
      console.log(`[SceneDebug] Starting scene: ${sceneId}`);
      return sceneManager.startScene(sceneId);
    },
    
    getCurrentScene: () => {
      const current = sceneManager.getCurrentScene();
      console.log('[SceneDebug] Current scene:', current?.scene.id || 'none');
      return current;
    },
    
    getFlags: () => {
      const flags = Object.keys({ ...sceneManager.getFlag as any }).reduce((acc, key) => {
        acc[key] = sceneManager.getFlag(key);
        return acc;
      }, {} as Record<string, boolean>);
      console.log('[SceneDebug] Flags:', flags);
      return flags;
    },
    
    setFlag: (key: string, value: boolean) => {
      console.log(`[SceneDebug] Setting flag: ${key} = ${value}`);
      sceneManager.setFlag(key, value);
    },
    
    getProgress: () => {
      console.log('[SceneDebug] Progress values available via getProgress(key)');
    },
    
    getCompletedScenes: () => {
      const completed = sceneManager.getCompletedScenes();
      console.log('[SceneDebug] Completed scenes:', completed);
      return completed;
    },
  };
};

export default SceneManagerContext;