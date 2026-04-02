#!/usr/bin/env node
/**
 * push-quests.js — Publish quest templates to Firestore
 *
 * Usage: node scripts/push-quests.js
 * Requires: EXPO_PUBLIC_FIREBASE_* env vars (or a .env file at project root)
 *
 * Each quest in SHARED_QUESTS is upserted to quests/{id} in Firestore.
 * Run this after adding or editing quests in data/quests.shared.js.
 *
 * Important:
 * - only data/quests.shared.js is pushed to Firebase
 * - data/quests.demo.js is demo-only and never pushed
 * - data/quests.sample.js is documentation/example only and never pushed
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { SHARED_QUESTS } = require('../data/quests.shared');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error('Error: EXPO_PUBLIC_FIREBASE_PROJECT_ID is not set. Check your .env file.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function pushQuests() {
  console.log(`Pushing ${SHARED_QUESTS.length} quest(s) to Firestore project "${firebaseConfig.projectId}"...\n`);

  for (const quest of SHARED_QUESTS) {
    const now = new Date().toISOString();
    const payload = { ...quest, updatedAt: now };

    try {
      await setDoc(doc(db, 'quests', quest.id), payload, { merge: true });
      console.log(`  ✓ ${quest.id} — "${quest.title}"`);
    } catch (error) {
      console.error(`  ✗ ${quest.id}: ${error.message}`);
    }
  }

  console.log('\nDone.');
  process.exit(0);
}

pushQuests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
