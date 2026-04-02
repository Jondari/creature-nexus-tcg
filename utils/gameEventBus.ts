import type { QuestEventName } from '@/types/quest';

export interface BusPayload {
  amount?: number;
  metadata?: Record<string, unknown>;
}

type BusListener = (payload?: BusPayload) => void;

const _listeners = new Map<QuestEventName, Set<BusListener>>();

export const gameEventBus = {
  emit(name: QuestEventName, payload?: BusPayload): void {
    _listeners.get(name)?.forEach(fn => fn(payload));
  },
  on(name: QuestEventName, fn: BusListener): () => void {
    if (!_listeners.has(name)) _listeners.set(name, new Set());
    _listeners.get(name)!.add(fn);
    return () => _listeners.get(name)?.delete(fn);
  },
};
