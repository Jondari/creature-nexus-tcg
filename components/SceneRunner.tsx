/**
 * SceneRunner Component
 * 
 * Core component that executes scene scripts and renders the visual novel overlay.
 * Handles dialog display, UI highlighting, input masking, and visual effects.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  BackHandler,
} from 'react-native';
import type {
  SceneSpec,
  SceneCommand,
  SceneState,
  HighlightStyle,
  AnchorRect,
  SceneRunnerProps,
} from '@/types/scenes';
import { useAnchors } from '@/context/AnchorsContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Default highlight style
const DEFAULT_HIGHLIGHT_STYLE: HighlightStyle = {
  borderColor: '#6C63FF',
  borderWidth: 3,
  borderRadius: 12,
  shadowColor: '#6C63FF',
  shadowOpacity: 0.6,
  pulsate: true,
  glow: true,
};

export const SceneRunner: React.FC<SceneRunnerProps> = ({
  scene,
  onFinish,
  onSceneAction,
  initialState,
}) => {
  const anchors = useAnchors();
  
  // Scene execution state
  const [pc, setPc] = useState(0); // program counter
  const [labels, setLabels] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>(initialState?.flags || {});
  const [progress, setProgress] = useState<Record<string, number>>(initialState?.progress || {});
  
  // UI state
  const [dialog, setDialog] = useState<SceneState['dialog']>(null);
  const [highlight, setHighlight] = useState<SceneState['highlight']>(null);
  const [maskInput, setMaskInput] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  
  // Visual state
  const [background, setBackground] = useState<string | undefined>(scene.backgroundImage);
  const [portraits, setPortraits] = useState<{ left?: string; right?: string }>({});
  const [overlays, setOverlays] = useState<Array<{
    id: string;
    uri: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  }>>([]);
  
  // Animation values
  const dialogOpacity = useRef(new Animated.Value(0)).current;
  const highlightPulse = useRef(new Animated.Value(1)).current;
  const portraitLeft = useRef(new Animated.Value(-200)).current;
  const portraitRight = useRef(new Animated.Value(200)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;
  
  // Build labels map on scene load
  useEffect(() => {
    const labelsMap: Record<string, number> = {};
    scene.steps.forEach((step, index) => {
      if (step.type === 'label') {
        labelsMap[step.name] = index;
      }
    });
    setLabels(labelsMap);
  }, [scene]);

  // Navigation helpers
  const gotoLabel = useCallback((name: string) => {
    const labelIndex = labels[name];
    if (labelIndex !== undefined) {
      setPc(labelIndex + 1); // Skip the label itself
    } else {
      console.warn(`[SceneRunner] Label not found: ${name}`);
    }
  }, [labels]);

  const gotoStep = useCallback((stepIndex: number) => {
    setPc(Math.max(0, Math.min(stepIndex, scene.steps.length)));
  }, [scene.steps.length]);

  // Flag management
  const getFlag = useCallback((key: string): boolean => {
    return flags[key] || false;
  }, [flags]);

  const setFlagValue = useCallback((key: string, value: boolean) => {
    setFlags(prev => {
      if (prev[key] !== value) {
        onSceneAction?.('flag_changed', { key, oldValue: prev[key] || false, newValue: value });
      }
      return { ...prev, [key]: value };
    });
  }, [onSceneAction]);

  // Progress management
  const getProgressValue = useCallback((key: string): number => {
    return progress[key] || 0;
  }, [progress]);

  const setProgressValue = useCallback((key: string, value: number) => {
    setProgress(prev => {
      if (prev[key] !== value) {
        onSceneAction?.('progress_changed', { key, oldValue: prev[key] || 0, newValue: value });
      }
      return { ...prev, [key]: value };
    });
  }, [onSceneAction]);

  // Animation helpers
  const showDialog = useCallback(() => {
    Animated.timing(dialogOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [dialogOpacity]);

  const hideDialog = useCallback(() => {
    Animated.timing(dialogOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [dialogOpacity]);

  const animatePortrait = useCallback((side: 'left' | 'right', show: boolean) => {
    const animValue = side === 'left' ? portraitLeft : portraitRight;
    const toValue = show ? 0 : (side === 'left' ? -200 : 200);
    
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [portraitLeft, portraitRight]);

  const startHighlightPulse = useCallback(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(highlightPulse, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(highlightPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start(() => {
        if (highlight?.style?.pulsate) {
          pulse();
        }
      });
    };
    pulse();
  }, [highlightPulse, highlight]);

  // Main command execution
  const executeCommand = useCallback(async (cmd: SceneCommand) => {
    onSceneAction?.('scene_step', { sceneId: scene.id, stepIndex: pc, command: cmd });

    switch (cmd.type) {
      case 'label':
        // Labels are no-op, advance immediately
        setPc(pc + 1);
        break;

      case 'say': {
        setDialog({
          speaker: cmd.speaker,
          text: cmd.text,
          portrait: cmd.portrait,
          choices: null,
        });
        setIsWaitingForInput(true);
        showDialog();
        break;
      }

      case 'choice': {
        setDialog(prev => ({
          ...prev,
          choices: cmd.choices,
        }));
        setIsWaitingForInput(true);
        break;
      }

      case 'wait': {
        setTimeout(() => {
          setPc(pc + 1);
        }, cmd.ms);
        break;
      }

      case 'setFlag': {
        setFlagValue(cmd.key, cmd.value);
        setPc(pc + 1);
        break;
      }

      case 'setProgress': {
        setProgressValue(cmd.key, cmd.value);
        setPc(pc + 1);
        break;
      }

      case 'if': {
        const condition = getFlag(cmd.flag);
        if (condition && cmd.then) {
          gotoLabel(cmd.then);
        } else if (!condition && cmd.else) {
          gotoLabel(cmd.else);
        } else {
          setPc(pc + 1);
        }
        break;
      }

      case 'checkProgress': {
        const value = getProgressValue(cmd.key);
        const meetsCondition = 
          (cmd.min === undefined || value >= cmd.min) &&
          (cmd.max === undefined || value <= cmd.max);
        
        if (meetsCondition && cmd.then) {
          gotoLabel(cmd.then);
        } else if (!meetsCondition && cmd.else) {
          gotoLabel(cmd.else);
        } else {
          setPc(pc + 1);
        }
        break;
      }

      case 'goto': {
        gotoLabel(cmd.label);
        break;
      }

      case 'highlight': {
        try {
          const rect = await anchors.getRect(cmd.anchorId);
          const style = { ...DEFAULT_HIGHLIGHT_STYLE, ...cmd.style };
          
          setHighlight({
            rect,
            text: cmd.text,
            style,
            maskInput: cmd.maskInput,
          });
          
          if (cmd.maskInput) {
            setMaskInput(true);
          }
          
          if (style.pulsate) {
            startHighlightPulse();
          }
          
          setIsWaitingForInput(true);
          onSceneAction?.('anchor_highlighted', { anchorId: cmd.anchorId, sceneId: scene.id });
        } catch (error) {
          console.warn(`[SceneRunner] Failed to highlight anchor ${cmd.anchorId}:`, error);
          setPc(pc + 1);
        }
        break;
      }

      case 'maskInput': {
        setMaskInput(cmd.enabled);
        setPc(pc + 1);
        break;
      }

      case 'showHint': {
        // Simple hint implementation - could be enhanced
        let rect: AnchorRect | null = null;
        if (cmd.anchorId) {
          rect = await anchors.getRect(cmd.anchorId);
        }
        
        setHighlight({
          rect,
          text: cmd.text,
          style: { ...DEFAULT_HIGHLIGHT_STYLE, backgroundColor: 'rgba(0,0,0,0.8)' },
          maskInput: false,
        });
        
        // Auto-dismiss after duration
        setTimeout(() => {
          setHighlight(null);
          setPc(pc + 1);
        }, cmd.duration || 3000);
        break;
      }

      case 'setBackground': {
        if (cmd.transition === 'fade') {
          Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setBackground(cmd.uri);
            Animated.timing(backgroundOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
          });
        } else {
          setBackground(cmd.uri);
        }
        setPc(pc + 1);
        break;
      }

      case 'showPortrait': {
        setPortraits(prev => ({ ...prev, [cmd.side]: cmd.uri }));
        animatePortrait(cmd.side, true);
        setPc(pc + 1);
        break;
      }

      case 'hidePortrait': {
        animatePortrait(cmd.side, false);
        setTimeout(() => {
          setPortraits(prev => ({ ...prev, [cmd.side]: undefined }));
        }, 300);
        setPc(pc + 1);
        break;
      }

      case 'imageOverlay': {
        const overlayId = `overlay_${Date.now()}`;
        setOverlays(prev => [...prev, {
          id: overlayId,
          uri: cmd.uri,
          x: cmd.x,
          y: cmd.y,
          width: cmd.width,
          height: cmd.height,
        }]);
        
        if (cmd.duration) {
          setTimeout(() => {
            setOverlays(prev => prev.filter(o => o.id !== overlayId));
          }, cmd.duration);
        }
        
        setPc(pc + 1);
        break;
      }

      case 'triggerBattle':
      case 'navigateTo': {
        onSceneAction?.('scene_action', { type: cmd.type, data: cmd });
        onFinish();
        break;
      }

      case 'end': {
        onFinish();
        break;
      }

      default: {
        console.warn(`[SceneRunner] Unknown command type:`, cmd);
        setPc(pc + 1);
        break;
      }
    }
  }, [
    scene, pc, anchors, getFlag, setFlagValue, getProgressValue, setProgressValue,
    gotoLabel, showDialog, animatePortrait, startHighlightPulse, onSceneAction, onFinish
  ]);

  // Execute current command
  useEffect(() => {
    if (pc >= scene.steps.length) {
      onFinish();
      return;
    }

    const cmd = scene.steps[pc];
    if (cmd) {
      executeCommand(cmd);
    }
  }, [pc, scene.steps, executeCommand, onFinish]);

  // Handle user interactions
  const onDialogTap = useCallback(() => {
    if (dialog && !dialog.choices) {
      hideDialog();
      setDialog(null);
      setIsWaitingForInput(false);
      setPc(pc + 1);
      onSceneAction?.('user_input', { inputType: 'tap' });
    }
  }, [dialog, hideDialog, pc, onSceneAction]);

  const onChoiceSelect = useCallback((choiceId: string, choice: any) => {
    hideDialog();
    setDialog(null);
    setIsWaitingForInput(false);
    
    // Apply choice flags
    if (choice.setFlags) {
      Object.entries(choice.setFlags).forEach(([key, value]) => {
        setFlagValue(key, value as boolean);
      });
    }
    
    // Navigate
    if (choice.goto) {
      gotoLabel(choice.goto);
    } else {
      setPc(pc + 1);
    }
    
    onSceneAction?.('choice_selected', { choiceId, sceneId: scene.id });
  }, [hideDialog, setFlagValue, gotoLabel, pc, onSceneAction, scene.id]);

  const onHighlightTap = useCallback(() => {
    if (highlight) {
      setHighlight(null);
      setMaskInput(false);
      setIsWaitingForInput(false);
      setPc(pc + 1);
      onSceneAction?.('user_input', { inputType: 'tap' });
    }
  }, [highlight, pc, onSceneAction]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isWaitingForInput) {
        // Allow skipping current step
        if (dialog) {
          onDialogTap();
        } else if (highlight) {
          onHighlightTap();
        }
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isWaitingForInput, dialog, highlight, onDialogTap, onHighlightTap]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Background */}
      {background && (
        <Animated.Image
          source={{ uri: background }}
          style={[
            StyleSheet.absoluteFill,
            { opacity: backgroundOpacity }
          ]}
          resizeMode="cover"
        />
      )}

      {/* Input mask */}
      {maskInput && (
        <View 
          style={StyleSheet.absoluteFillObject} 
          pointerEvents="auto"
        />
      )}

      {/* Portraits */}
      {portraits.left && (
        <Animated.Image
          source={{ uri: portraits.left }}
          style={[
            styles.portraitLeft,
            { transform: [{ translateX: portraitLeft }] }
          ]}
          resizeMode="contain"
        />
      )}
      
      {portraits.right && (
        <Animated.Image
          source={{ uri: portraits.right }}
          style={[
            styles.portraitRight,
            { transform: [{ translateX: portraitRight }] }
          ]}
          resizeMode="contain"
        />
      )}

      {/* Image overlays */}
      {overlays.map((overlay) => (
        <Image
          key={overlay.id}
          source={{ uri: overlay.uri }}
          style={{
            position: 'absolute',
            left: overlay.x,
            top: overlay.y,
            width: overlay.width || 100,
            height: overlay.height || 100,
          }}
          resizeMode="contain"
        />
      ))}

      {/* Highlight overlay */}
      {highlight?.rect && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onHighlightTap}
          style={StyleSheet.absoluteFill}
          pointerEvents="auto"
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: highlight.rect.x,
                top: highlight.rect.y,
                width: highlight.rect.width,
                height: highlight.rect.height,
                borderWidth: highlight.style?.borderWidth || DEFAULT_HIGHLIGHT_STYLE.borderWidth,
                borderColor: highlight.style?.borderColor || DEFAULT_HIGHLIGHT_STYLE.borderColor,
                borderRadius: highlight.style?.borderRadius || DEFAULT_HIGHLIGHT_STYLE.borderRadius,
                backgroundColor: highlight.style?.backgroundColor,
              },
              highlight.style?.glow && {
                shadowColor: highlight.style?.shadowColor || DEFAULT_HIGHLIGHT_STYLE.shadowColor,
                shadowOpacity: highlight.style?.shadowOpacity || DEFAULT_HIGHLIGHT_STYLE.shadowOpacity,
                shadowRadius: 10,
                elevation: 10,
              }
            ].filter(Boolean),
            highlight.style?.pulsate && {
              transform: [{ scale: highlightPulse }]
            }
          ]}
          pointerEvents="none"
        />
        
        {highlight.text && (
          <View style={[
            styles.highlightText,
            {
              top: highlight.rect.y + highlight.rect.height + 12,
              left: Math.max(12, Math.min(highlight.rect.x, screenWidth - 200)),
            }
          ]}>
            <Text style={styles.highlightTextContent}>
              {highlight.text}
            </Text>
          </View>
        )}
      )}

      {/* Dialog overlay */}
      {dialog && (
        <Animated.View
          style={[styles.dialogOverlay, { opacity: dialogOpacity }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={dialog.choices ? undefined : onDialogTap}
            style={styles.dialogTouchArea}
          >
            <View style={styles.dialogBox}>
              {dialog.speaker && (
                <Text style={styles.speakerName}>{dialog.speaker}</Text>
              )}
              
              {dialog.text && (
                <Text style={styles.dialogText}>{dialog.text}</Text>
              )}
              
              {dialog.choices && (
                <View style={styles.choicesContainer}>
                  {dialog.choices.map((choice) => (
                    <TouchableOpacity
                      key={choice.id}
                      style={styles.choiceButton}
                      onPress={() => onChoiceSelect(choice.id, choice)}
                    >
                      <Text style={styles.choiceText}>{choice.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  portraitLeft: {
    position: 'absolute',
    left: 20,
    bottom: 100,
    width: 180,
    height: 240,
  },
  
  portraitRight: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 180,
    height: 240,
  },
  
  highlightText: {
    position: 'absolute',
    maxWidth: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    padding: 12,
  },
  
  highlightTextContent: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  
  dialogOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: screenHeight * 0.4,
  },
  
  dialogTouchArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  dialogBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    margin: 12,
    borderRadius: 12,
    padding: 20,
    minHeight: 80,
  },
  
  speakerName: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  dialogText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  
  choicesContainer: {
    gap: 12,
  },
  
  choiceButton: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 8,
    padding: 12,
  },
  
  choiceText: {
    color: '#6C63FF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SceneRunner;