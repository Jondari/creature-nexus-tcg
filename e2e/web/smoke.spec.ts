import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const userId = 'demo_e2e_user';

    window.localStorage.setItem('@locale', 'en');
    window.localStorage.setItem(
      '@creature_nexus_settings',
      JSON.stringify({
        cardSize: 'small',
        handLayout: 'fan',
        showBattleLog: false,
        screenShake: true,
        turnBanner: true,
        locale: 'en',
      })
    );
    window.localStorage.setItem(
      '@demo_user',
      JSON.stringify({
        uid: userId,
        pseudo: 'E2E Tester',
        pseudoChangeUsed: false,
        avatarCreature: null,
        unlockedBadges: [],
        selectedBadges: [],
        unlockedFrames: [],
        selectedFrame: null,
        isAnonymous: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      })
    );
    window.localStorage.setItem('@demo_coins', '100');
    window.localStorage.setItem('@demo_cards', JSON.stringify([]));
    window.localStorage.setItem('@demo_packs', JSON.stringify([]));
    window.localStorage.setItem('@demo_decks', JSON.stringify([]));
    window.localStorage.setItem(
      `tutorial_progress_${userId}`,
      JSON.stringify({
        flags: {
          tutorial_first_launch_completed: true,
          tutorial_home_completed: true,
          tutorial_collection_completed: true,
          tutorial_store_completed: true,
        },
        progress: {},
        completedScenes: [
          'tutorial_first_launch',
          'tutorial_home_intro',
          'tutorial_collection_intro',
          'tutorial_store_intro',
        ],
        lastSeenAt: {},
      })
    );
  });

  await page.goto('/');
  await expect(page.getByTestId('home-screen-background')).toBeAttached({
    timeout: 60_000,
  });
});

test('loads the demo home screen', async ({ page }) => {
  await expect(page.getByText('Creature Nexus', { exact: true })).toBeVisible();
  await expect(page.getByText('Open a new pack of cards')).toBeVisible();
});

test('navigates between the collection and store tabs', async ({ page }) => {
  await page.getByRole('tab', { name: 'Collection' }).click();
  await expect(page).toHaveURL(/collection/);
  await expect(page.getByText('My Collection', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Store' }).click();
  await expect(page).toHaveURL(/store/);
  await expect(page.getByText('Store', { exact: true }).last()).toBeVisible();
});
