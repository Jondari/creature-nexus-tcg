import React, { useEffect } from 'react';
import { useSceneManager } from '@/context/SceneManagerContext';
import { ALL_TUTORIAL_SCENES } from '@/data/scenes/tutorial-scenes';
import { ALL_STORY_SCENES } from '@/data/scenes';
import sceneImageUtils from '@/utils/sceneImageManager';

// Registers tutorial and story scenes, and preloads critical assets once.
// Mount this under SceneManagerProvider so SceneRunner can run globally.
export const ScenesRegistry: React.FC = () => {
  const sceneManager = useSceneManager();

  // Combine all scenes for registration
  const ALL_SCENES = [...ALL_TUTORIAL_SCENES, ...ALL_STORY_SCENES];

  // Register scenes on mount, unregister on unmount
  useEffect(() => {
    // Register all scenes once on mount
    ALL_SCENES.forEach((scene) => sceneManager.registerScene(scene));

    // Note: do not auto-trigger onFirstLaunch here; screen-level triggers
    // (onEnterScreen) will drive tutorials at the right time.
    // Story scenes are triggered by onStoryProgress and onBattleStart/End.

    // Cleanup on unmount
    return () => {
      ALL_SCENES.forEach((scene) => sceneManager.unregisterScene(scene.id));
    };
    // Intentionally run once; scene manager identity may change per render
    // but we want one-time registration and trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preload tutorial/UI assets for smoother experience
  useEffect(() => {
    sceneImageUtils.preloadCriticalAssets().catch((e) => {
      if (__DEV__) console.warn('[ScenesRegistry] preloadCriticalAssets failed', e);
    });
  }, []);

  return null;
};

export default ScenesRegistry;
