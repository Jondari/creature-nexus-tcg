import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export type RulesContext = 'battle' | 'deck' | 'general';

interface Props {
  context?: RulesContext;
}

export function RulesContent({ context = 'general' }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator>
      {(context === 'general' || context === 'battle') && (
        <>
          <Text style={styles.h2}>Basics</Text>
          <Bullet>Each player starts with a 5–card hand.</Bullet>
          <Bullet>Field capacity: up to 4 creatures.</Bullet>
          <Bullet>Start of turn energy: +1 by default.</Bullet>

          <Text style={styles.h2}>Turn & Phases</Text>
          <Bullet>Turn begins: draw a card and gain energy.</Bullet>
          <Bullet>Main phase: play creatures (free), cast spells, attack, retire.</Bullet>
          <Bullet>Auto end turn if no more attacks are possible.</Bullet>

          <Text style={styles.h2}>Energy & Spells</Text>
          <Bullet>Attacks consume the attack’s energy cost.</Bullet>
          <Bullet>Retire costs 1 energy and returns the creature to your hand.</Bullet>
          <Bullet>Energy Catalyst (legendary spell): starting next turn, you gain energy equal to the turn number.</Bullet>

          <Text style={styles.h2}>Attacks & Affinity</Text>
          <Bullet>Player 1 cannot attack on global turn 1.</Bullet>
          <Bullet>One attack per creature per turn.</Bullet>
          <Bullet>Mythic creatures can attack only once every 4 turns.</Bullet>
          <Bullet>Affinity modifiers (+20 / −20):</Bullet>
          <SubBullet>Water &gt; Fire (+20), Fire &gt; Air (+20), Air &gt; Earth (+20), Earth &gt; Water (+20)</SubBullet>
          <SubBullet>Reverse matchups: −20. “All” is neutral.</SubBullet>

          <Text style={styles.h2}>Targets & Scoring</Text>
          <Bullet>Versus creature: if target dies, attacker gains +1 point.</Bullet>
          <Bullet>Win at 4 points.</Bullet>
          <Bullet>Lose on deck‑out or if your field is empty after global turn 2.</Bullet>
        </>
      )}

      {(context === 'general' || context === 'deck') && (
        <>
          <Text style={styles.h2}>Deck Building</Text>
          <Bullet>Deck size: 20–60 cards.</Bullet>
          <Bullet>Max 3 copies per card model (by name).</Bullet>
          <Bullet>You can save multiple decks; one active deck is persisted.</Bullet>
        </>
      )}
    </ScrollView>
  );
}

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bulletDot}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const SubBullet = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.subBulletRow}>
    <Text style={styles.subBulletDash}>–</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 200,
  },
  container: {
    padding: 16,
    gap: 8,
  },
  h1: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  h2: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  subBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginLeft: 16,
    marginTop: 2,
  },
  bulletDot: {
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  subBulletDash: {
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  bulletText: {
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
