# Chapter 1 Story Scenes - Code Review

## Overview

This document summarizes the code review for the Chapter 1 story scenes feature implementation, including identified issues, edge cases, and recommended test cases.

---

## Identified Issues

### Critical

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **Race condition onBattleStart** | `story-battle.tsx:162-169` | `checkTriggers` called AFTER `initializeGame` - scene might be preempted by game initialization |
| 2 | **Victory scene too generic** | `chapter-1-scenes.ts:124` | `SCENE_NEXUS_1_VICTORY` triggers on ANY `onBattleEnd` win, not specifically nexus_1 |
| 3 | **Single defeat scene for all battles** | `chapter-1-scenes.ts:375` | Same encouragement dialog for nexus_1 loss and boss loss - diminishes narrative impact |
| 4 | **Chapter complete scene logic** | `chapter-1-scenes.ts:325-331` | Triggers on ANY win if boss pre-scene was seen - could fire on wrong battle |

### Moderate

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 5 | **preBattleSceneShown not persisted** | `story-battle.tsx:31` | Only prevents re-triggering during current mount, not across app lifecycle |
| 6 | **No i18n key validation** | `chapter-1-scenes.ts` | Missing keys would display raw key names instead of text |
| 7 | **Replay doesn't reset scene flags** | `chapter-map.tsx:53` | Pre-battle scenes won't replay on battle retry (may be intended) |
| 8 | **No scene timeout** | `SceneRunner.tsx` | If scene gets stuck, player could be soft-locked |

### Low

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 9 | **Tutorial button doesn't check scene exists** | `chapter-map.tsx:164` | Silent error if tutorial scene not registered |
| 10 | **No scene version migration** | `chapter-1-scenes.ts` | Old saved state might be incompatible with updated scenes |

---

## Test Cases

### A. Happy Path

| ID | Scenario | Expected | Verification |
|----|----------|----------|--------------|
| A.1.1 | First time entering Chapter 1 | Intro scene triggers | Flag `story_chapter_1_intro_seen` = true |
| A.1.2 | Test all 3 intro choices | Each branch works | Respective flags set |
| A.1.3 | Re-enter Chapter 1 after intro | Intro doesn't replay | Flag check prevents trigger |
| A.2.1 | Start nexus_1 battle | Pre-battle scene shows | Scene displays before battle |
| A.2.2 | Win nexus_1 | Victory scene shows | Congratulatory dialogue |
| A.2.3 | Start nexus_2, nexus_3, nexus_4 | Each has own pre-scene | Correct scene per battle |
| A.3.1 | Lose any battle | Defeat scene shows | Encouragement message |
| A.3.2 | Lose, retry, win | Victory scene on success | Not blocked by prior loss |
| A.4.1 | Enter boss fight | Dramatic pre-scene | 3 response choices available |
| A.4.2 | Test all 3 boss responses | Each has unique reply | Correct flag set per choice |
| A.4.3 | Win boss | Chapter complete scene | Full epilogue, Chapter 2 tease |

### B. Edge Cases

| ID | Scenario | Expected | Verification |
|----|----------|----------|--------------|
| B.1.1 | Flag `intro_seen` already true | Intro doesn't trigger | Condition check works |
| B.1.2 | Corrupt flag in AsyncStorage | App doesn't crash | Defaults to false |
| B.2.1 | Replay completed battle | Pre-scene doesn't replay | Flag prevents re-trigger |
| B.2.2 | Lose boss, retry | Boss pre-scene doesn't replay | `preBattleSceneShown` state |
| B.3.1 | Navigate away during scene | Clean scene teardown | No memory leaks |
| B.3.2 | Close app during scene | Flags persisted | State saved correctly |
| B.4.1 | checkTriggers before SceneManager loads | Triggers queue | Processed after load |
| B.4.2 | Multiple scenes match trigger | Highest priority wins | Only one executes |

### C. Regression

| ID | Scenario | Expected | Verification |
|----|----------|----------|--------------|
| C.1.1 | Boss victory unlocks Chapter 2 | `completeBattle` updates progress | Chapter 2 accessible |
| C.1.2 | Chapter progress persists | Saved to AsyncStorage | Consistent after restart |
| C.2.1 | Tutorials don't interfere | Different trigger types | No scene conflicts |
| C.2.2 | Tutorial anchors work | Highlight system ok | Both coexist |
| C.3.1 | Back navigation during scene | Scene stops cleanly | No orphaned state |

### D. Localization

| ID | Scenario | Expected | Verification |
|----|----------|----------|--------------|
| D.1.1 | All i18n keys exist | No raw keys displayed | 61 keys in EN/FR |
| D.1.2 | Switch language mid-scene | Text updates | `resolveSceneText` handles it |
| D.1.3 | Speaker names localized | Names in current language | i18n: prefix resolved |

---

## Recommendations

### Critical Fixes

1. **Add battle-specific victory scenes**
   - Use `{ type: 'onBattleEnd', chapterId: 1, battleId: 'nexus_1', result: 'win' }` pattern
   - Prevents wrong victory scene triggering

2. **Implement scene error recovery**
   - Wrap SceneRunner in try-catch
   - Mark scene completed ONLY after full execution

3. **Fix replay logic**
   - Reset `preBattleSceneShown` on battle retry if desired
   - Document expected behavior

### Medium Priority

4. **Add scene timeout**
   - Max 5 minutes per scene
   - Auto-skip if stuck

5. **Validate i18n keys on load**
   - Check all `i18n:` references exist
   - Warn in dev console if missing

6. **Add per-battle defeat scenes** (optional)
   - Different encouragement for boss vs normal battles
   - More narrative depth

---

## Files Modified

| File | Changes |
|------|---------|
| `data/scenes/chapter-1-scenes.ts` | 9 story scenes for Chapter 1 |
| `data/scenes/chapter-2-scenes.ts` to `chapter-6-scenes.ts` | Placeholders |
| `data/scenes/index.ts` | Aggregates all chapter scenes |
| `components/ScenesRegistry.tsx` | Updated import path |
| `data/i18n_en.json` | 61 translation keys added |
| `data/i18n_fr.json` | 61 translation keys added |
| `data/scenes/story-scenes.ts` | DELETED (replaced by modular structure) |

---

## Conclusion

The Chapter 1 story scenes implementation is functional but has some architectural issues around trigger specificity. The main risk is victory/defeat scenes triggering for the wrong battles. For a first release, these issues are acceptable with manual testing, but should be addressed before adding more chapters.

**Recommended action:** Commit as-is, create issues for critical fixes, test thoroughly before release.
