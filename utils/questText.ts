import type { QuestTemplate } from '@/types/quest';
import { t } from '@/utils/i18n';

function resolveI18nWithFallback(key: string | undefined, fallback?: string): string {
  if (!key) return fallback ?? '';
  const translated = t(key);
  return translated === key ? (fallback ?? '') : translated;
}

export function getQuestTitle(template: QuestTemplate): string {
  const key = template.titleKey ?? `quests.${template.id}.title`;
  return resolveI18nWithFallback(key, template.title);
}

export function getQuestDescription(template: QuestTemplate): string {
  const key = template.descriptionKey ?? `quests.${template.id}.description`;
  return resolveI18nWithFallback(key, template.description);
}
