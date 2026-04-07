import React, { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useQuests } from '@/context/QuestContext';
import Colors from '@/constants/Colors';
import { t } from '@/utils/i18n';
import { getQuestTitle } from '@/utils/questText';

const APP_BACKGROUND = require('@/assets/images/background/cosmic_nebula.png');
const HOME_ZOOM_SCALE = parseFloat(process.env.EXPO_PUBLIC_ZOOM_SCALE || '1');

export default function QuestsDebugScreen() {
  const router = useRouter();
  const { templates, playerQuests, isLoading, claimQuest } = useQuests();
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
        <View style={styles.debugHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{t('quests.title')}</Text>
        <Text style={styles.subtitle}>
          {isLoading
            ? 'Loading quest state...'
            : `${templates.length} template(s) • ${playerQuests.length} player quest doc(s)`}
        </Text>

        {templates.map((template) => {
          const playerQuest = playerQuestMap.get(template.id);
          const questTitle = getQuestTitle(template);

          return (
            <View key={template.id} style={styles.card}>
              <Text style={styles.questTitle}>{questTitle}</Text>
              <Text style={styles.questId}>{template.id}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaPill}>{template.type}</Text>
                <Text style={styles.metaPill}>{template.rewardMode ?? 'manual_claim'}</Text>
                {template.hidden ? <Text style={styles.metaPill}>hidden</Text> : null}
                {template.repeatable ? <Text style={styles.metaPill}>repeatable</Text> : null}
              </View>

              <Text style={styles.sectionTitle}>Player state</Text>
              <Text style={styles.line}>
                state: <Text style={styles.value}>{playerQuest?.state ?? 'missing'}</Text>
              </Text>
              <Text style={styles.line}>
                completedAt: <Text style={styles.value}>{playerQuest?.completedAt ?? '-'}</Text>
              </Text>
              <Text style={styles.line}>
                claimedAt: <Text style={styles.value}>{playerQuest?.claimedAt ?? '-'}</Text>
              </Text>
              <Text style={styles.line}>
                lastResetAt: <Text style={styles.value}>{playerQuest?.lastResetAt ?? '-'}</Text>
              </Text>

              {playerQuest?.state === 'completed' ? (
                <TouchableOpacity
                  style={[
                    styles.claimButton,
                    claimingQuestId === template.id && styles.claimButtonDisabled,
                  ]}
                  onPress={() => handleClaimQuest(template.id)}
                  disabled={claimingQuestId === template.id}
                >
                  <Text style={styles.claimButtonText}>
                    {claimingQuestId === template.id ? 'Claiming...' : t('quests.claim')}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <Text style={styles.sectionTitle}>Conditions</Text>
              {template.conditions.map((condition) => {
                const current = playerQuest?.progressByCondition?.[condition.id] ?? 0;
                return (
                  <Text key={condition.id} style={styles.line}>
                    {condition.event} [{condition.id}]:{' '}
                    <Text style={styles.value}>
                      {current}/{condition.count}
                    </Text>
                  </Text>
                );
              })}

              <Text style={styles.sectionTitle}>Rewards</Text>
              <Text style={styles.line}>
                coins: <Text style={styles.value}>{template.rewards.nexusCoins ?? 0}</Text>
              </Text>
              <Text style={styles.line}>
                packs: <Text style={styles.value}>{(template.rewards.packs ?? []).join(', ') || '-'}</Text>
              </Text>
              <Text style={styles.line}>
                badges: <Text style={styles.value}>{(template.rewards.badges ?? []).join(', ') || '-'}</Text>
              </Text>
              <Text style={styles.line}>
                frames: <Text style={styles.value}>{(template.rewards.avatarFrames ?? []).join(', ') || '-'}</Text>
              </Text>
              <Text style={styles.line}>
                cards: <Text style={styles.value}>{(template.rewards.cards ?? []).join(', ') || '-'}</Text>
              </Text>
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  debugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.card,
  },
  title: {
    color: Colors.text.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.glass.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  questTitle: {
    color: Colors.text.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  questId: {
    color: Colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metaPill: {
    color: Colors.accent[300],
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 6,
  },
  line: {
    color: Colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: Colors.text.primary,
    fontFamily: 'Inter-Medium',
  },
  claimButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.accent[500],
  },
  claimButtonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: Colors.text.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 13,
  },
});
