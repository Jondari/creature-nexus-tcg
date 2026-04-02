/**
 * QuestContext - Facade that re-exports from Providers.
 *
 * Conditionally loads Firebase or Local implementation
 * based on EXPO_PUBLIC_DEMO_MODE via Providers.tsx.
 */

export { QuestProvider, useQuests } from './Providers';
export type { QuestContextType } from '@/context/QuestContextLocal';
