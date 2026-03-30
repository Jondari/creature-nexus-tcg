export interface BadgeDefinition {
  id: string;
  name: string; // i18n key suffix (used as badge.name.{id})
}

export type SelectedBadges = string[]; // Array of badge IDs, max 3
