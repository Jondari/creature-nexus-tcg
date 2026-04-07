import React, { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useQuests } from '@/context/QuestContext';
import Colors from '@/constants/Colors';
import { t } from '@/utils/i18n';
import { getQuestDescription, getQuestTitle } from '@/utils/questText';
import type { QuestTemplate } from '@/types/quest';

const APP_BACKGROUND = require('@/assets/images/background/cosmic_nebula.png');
const HOME_ZOOM_SCALE = parseFloat(process.env.EXPO_PUBLIC_ZOOM_SCALE || '1');

const formatTimeRemaining = (expiresAt: string): string => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return '';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const d = t('time.dayShort');
  const h = t('time.hourShort');
  const m = t('time.minuteShort');
  if (days > 0) return `${days}${d} ${hours}${h}`;
  if (hours > 0) return `${hours}${h} ${minutes}${m}`;
  return `${minutes}${m}`;
};

const isTimeLimited = (template: QuestTemplate): boolean =>
  template.type === 'event' || !!template.expiresAt;

export default function QuestsScreen() {
  const router = useRouter();
  const { templates, playerQuests, claimQuest } = useQuests();
  const { width } = useWindowDimensions();
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);

  const playerQuestMap = useMemo(
    () => new Map(playerQuests.map((q) => [q.questId, q])),
    [playerQuests]
  );

  const isWebZoomMode = Platform.OS === 'web' && width < 768 && HOME_ZOOM_SCALE !== 1;
  const backgroundViewportStyle = Platform.OS === 'web' && !isWebZoomMode
    ? ({ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, width: '100vw', height: '100vh' } as any)
    : null;

  const handleClaimQuest = async (questId: string) => {
    try {
      setClaimingQuestId(questId);
      await claimQuest(questId);
    } finally {
      setClaimingQuestId(null);
    }
  };

  const visibleTemplates = useMemo(() => {
    const questPriority = (state: string) => {
      if (state === 'completed') return 0;
      if (state === 'available') return 1;
      return 2;
    };
    return templates
      .filter((tpl) => !tpl.hidden && tpl.enabled !== false)
      .sort((a, b) => {
        const stateA = playerQuestMap.get(a.id)?.state ?? 'available';
        const stateB = playerQuestMap.get(b.id)?.state ?? 'available';
        const diff = questPriority(stateA) - questPriority(stateB);
        if (diff !== 0) return diff;
        return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
      });
  }, [templates, playerQuestMap]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={APP_BACKGROUND}
        style={[styles.background, backgroundViewportStyle]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[Colors.background.overlayPrimaryStrong, Colors.background.overlayPrimarySoft]}
        style={[styles.background, backgroundViewportStyle]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('quests.title')}</Text>
        </View>

        {visibleTemplates.map((template) => {
          const playerQuest = playerQuestMap.get(template.id);
          const state = playerQuest?.state ?? 'available';
          const isDisabled = state === 'claimed' || state === 'expired';
          const isCompleted = state === 'completed';
          const isClaiming = claimingQuestId === template.id;
          const questTitle = getQuestTitle(template);
          const questDescription = getQuestDescription(template);
          const timeLimited = isTimeLimited(template);
          const timeStr = timeLimited && template.expiresAt ? formatTimeRemaining(template.expiresAt) : null;

          return (
            <View key={template.id} style={[styles.card, isDisabled && styles.cardDisabled]}>
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <Text style={[styles.questTitle, isDisabled && styles.textDisabled]} numberOfLines={1}>
                    {questTitle}
                  </Text>
                  {template.conditions.slice(0, 1).map((cond) => {
                    const current = playerQuest?.progressByCondition?.[cond.id] ?? 0;
                    return (
                      <Text key={cond.id} style={styles.conditionText} numberOfLines={2}>
                        {questDescription || cond.event.replace(/_/g, ' ')}{' '}
                        <Text style={styles.progressText}>{current}/{cond.count}</Text>
                      </Text>
                    );
                  })}
                  {timeLimited && timeStr ? (
                    <Text style={styles.expiryText}>
                      {t('quests.expiresIn', { time: timeStr })}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.cardRight}>
                  {isCompleted ? (
                    <TouchableOpacity
                      style={[styles.claimButton, isClaiming && styles.claimButtonDisabled]}
                      onPress={() => handleClaimQuest(template.id)}
                      disabled={isClaiming}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.claimButtonText}>
                        {isClaiming ? '…' : t('quests.claim')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.statePill, isDisabled && styles.statePillDisabled]}>
                      {t(`quests.${state}` as any)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.glass.surfaceStrong,
    borderWidth: 1,
    borderColor: Colors.glass.borderStrong,
    shadowColor: Colors.glass.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(14px)' } as any) : null),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.text.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
  },
  card: {
    backgroundColor: Colors.glass.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    shadowColor: Colors.glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 9,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(16px)' } as any) : null),
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardDisabled: {
    opacity: 0.45,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  questTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
  },
  textDisabled: {
    color: Colors.text.secondary,
  },
  conditionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  expiryText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: Colors.accent[300],
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  claimButton: {
    backgroundColor: Colors.accent[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  claimButtonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: Colors.text.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  statePill: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    color: Colors.accent[300],
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statePillDisabled: {
    color: Colors.text.secondary,
  },
});
