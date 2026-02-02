# Chapitre 1 : Central Nexus World - Contenu Narratif

## Vue d'ensemble

Le Chapitre 1 introduit le joueur au Nexus, le carrefour mystérieux où convergent toutes les énergies élémentaires. Le joueur découvre son rôle d'Invocateur et affronte le Gardien du Cœur du Nexus.

---

## Personnages

| Personnage | Rôle | Portrait |
|------------|------|----------|
| **Archiviste Ancien** | Gardien du savoir, guide principal | `archivist_portrait.png` |
| **Guide du Nexus** | Mentor de combat, encourage le joueur | `guide_portrait.png` |
| **Gardien du Temple** | Protecteur des secrets anciens | `chap1/temple_guardian.png` |
| **Gardien du Cœur** | Boss final du chapitre | `chap1/shadow_figure.png` |
| **Narrateur** | Voix off pour descriptions | - |

---

## Structure narrative

### Scène 1 : Introduction (`story_chapter_1_intro`)

**Déclencheur :** Entrée dans le Chapitre 1 (Chapter Map)

**Synopsis :**
L'Archiviste Ancien accueille le joueur au Nexus. Il explique que le Nexus est le point de convergence des quatre royaumes élémentaires et que le joueur a été choisi pour devenir son champion.

**Choix du joueur :**
1. "Quel est cet endroit ?" → Explication du Nexus
2. "Que signifie être un Invocateur ?" → Explication du rôle
3. "Je suis prêt à commencer !" → Passage direct

**Flags définis :**
- `story_chapter_1_intro_seen`
- `learned_about_nexus` (si choix 1)
- `learned_about_summoner` (si choix 2)

---

### Scène 2 : Première Rencontre (`story_nexus_1_pre`)

**Déclencheur :** Avant combat `nexus_1`

**Synopsis :**
Le Guide du Nexus prépare le joueur à son premier combat. Il lui rappelle les bases : équilibrer attaques et défenses, utiliser les avantages élémentaires.

**Dialogues clés :**
- "C'est ton premier vrai défi, Invocateur. Ne sois pas nerveux !"
- "Les créatures ici te testent, elles ne cherchent pas à te détruire."
- "Souviens-toi : équilibre tes attaques et tes défenses."

---

### Scène 3 : Première Victoire (`story_nexus_1_victory`)

**Déclencheur :** Victoire sur `nexus_1`

**Synopsis :**
Le Guide félicite le joueur et lui indique que le chemin vers les profondeurs du Nexus est maintenant ouvert.

---

### Scène 4 : Découverte des Portails (`story_nexus_2_pre`)

**Déclencheur :** Avant combat `nexus_2`

**Synopsis :**
L'Archiviste explique que les portails connectent le Nexus aux mondes élémentaires. Ils sont scellés depuis des âges et doivent être réactivés.

**Choix du joueur :**
1. "Je veux tous les explorer !" → Flag `player_curious`
2. "Cela semble dangereux..." → Flag `player_cautious`

---

### Scène 5 : Gardiens Anciens (`story_nexus_3_pre`)

**Déclencheur :** Avant combat `nexus_3`

**Synopsis :**
Le Gardien du Temple bloque le passage. Il protège les secrets du Temple des Anciens depuis des millénaires et exige une preuve de valeur.

**Ton :** Solennel, défi honorable

---

### Scène 6 : Convergence Élémentaire (`story_nexus_4_pre`)

**Déclencheur :** Avant combat `nexus_4`

**Synopsis :**
L'Archiviste avertit que ce point de convergence est instable. Des créatures nées d'éléments mélangés y apparaissent.

**Ambiance :** Mystérieuse, puissance palpable

---

### Scène 7 : Le Gardien du Cœur (`story_nexus_boss_pre`)

**Déclencheur :** Avant combat `nexus_boss`

**Synopsis :**
Confrontation dramatique avec le boss. Le Gardien du Cœur s'éveille et défie le joueur. Personne ne l'a vaincu depuis dix mille ans.

**Choix du joueur :**
1. "Je n'ai pas peur de toi !" → Réponse sur le courage
2. "Je viens chercher la connaissance, pas le conflit." → Réponse sur la sagesse
3. "Je ferai tout ce qu'il faut pour réussir." → Réponse sur la détermination

**Flags définis :**
- `story_nexus_boss_pre_seen`
- `boss_response_brave` / `boss_response_diplomatic` / `boss_response_determined`

---

### Scène 8 : Victoire du Chapitre (`story_chapter_1_complete`)

**Déclencheur :** Victoire sur `nexus_boss`

**Synopsis :**
Le Gardien du Cœur reconnaît la valeur du joueur. Le Nexus s'éveille pleinement et reconnaît le joueur comme son champion. L'Archiviste félicite le joueur et annonce que le Monde de l'Eau est maintenant accessible.

**Moments clés :**
- Lumière inonde la chambre
- Le boss reconnaît sa défaite avec honneur
- L'Archiviste célèbre la victoire
- Tease du Chapitre 2 (Water World)

**Flags définis :**
- `story_chapter_1_complete_seen`
- `chapter_1_completed`

**Progression :**
- `chapters_completed` = 1

---

### Scène 9 : Défaite (`story_chapter_1_defeat`)

**Déclencheur :** Défaite dans n'importe quel combat du Chapitre 1

**Synopsis :**
Le Guide encourage le joueur à ne pas se décourager. Il conseille de revoir le deck et la stratégie.

**Ton :** Encourageant, bienveillant

---

## Dialogues complets

### Introduction (EN)

```
Archivist: "Ah, a new Summoner approaches! Welcome to the Nexus,
            the crossroads of all elemental worlds."

Archivist: "I am the Archivist, keeper of ancient knowledge.
            I have waited ages for one with your potential."

Archivist: "The Nexus has been dormant for centuries, but your
            arrival has stirred something within its core."
```

### Boss Fight (EN)

```
Narrator: "At the heart of the Nexus, a massive figure awakens
           from its ancient slumber..."

Core Guardian: "So... a new Summoner dares to approach the Core.
                How amusing."

Core Guardian: "I am the guardian of this place. For ten thousand
                years, none have defeated me."

[Player Choice: Brave]
Core Guardian: "Brave words! Let us see if your actions match
                your courage."

[Player Choice: Diplomatic]
Core Guardian: "Knowledge? Very well. Defeat me, and you shall
                have all the knowledge you seek."

[Player Choice: Determined]
Core Guardian: "Determination alone is not enough. Show me your
                true power!"

Core Guardian: "PREPARE YOURSELF, SUMMONER! THE CORE GUARDIAN AWAKENS!"
```

### Victory (EN)

```
Narrator: "The Core Guardian falls! Light floods the ancient chamber
           as the Nexus fully awakens."

Core Guardian: "Impressive... You are the first to defeat me in
                countless ages."

Core Guardian: "The Nexus recognizes you as its champion. Go forth
                and restore balance to the realms."

Archivist: "Magnificent! You have done what I dared to hope but
            never expected!"

Archivist: "The Nexus Core has bonded with you. Its power flows
            through your very being."

Archivist: "With this victory, the elemental portals have begun
            to stabilize."

Narrator: "You have unlocked access to the Water World! New creatures
           await your discovery."

Archivist: "The Water World calls to you first. Seek out its guardian
            and restore the aquatic realm."
```

---

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| `data/scenes/story-scenes.ts` | 9 scènes définies avec triggers et conditions |
| `data/i18n_en.json` | Clés `story.characters.*` et `story.scenes.chapter_1.*` |
| `data/i18n_fr.json` | Traductions françaises complètes |
| `components/ScenesRegistry.tsx` | Import et enregistrement `ALL_STORY_SCENES` |
| `app/(tabs)/chapter-map.tsx` | Trigger `onStoryProgress` à l'entrée |
| `app/(tabs)/story-battle.tsx` | Triggers `onBattleStart` et `onBattleEnd` |

---

## Assets utilisés

### Portraits

| Asset | Chemin | Utilisé dans |
|-------|--------|--------------|
| Archiviste | `scene/archivist_portrait.png` | Intro, nexus_2, nexus_4, complete |
| Guide | `scene/guide_portrait.png` | nexus_1, defeat |
| Gardien Temple | `scene/chap1/temple_guardian.png` | nexus_3 |
| Gardien Cœur | `scene/chap1/shadow_figure.png` | boss, complete |

### Backgrounds

| Asset | Chemin | Utilisé dans |
|-------|--------|--------------|
| Nexus | `scene/nexus_bg.png` | Toutes les scènes |
| Nexus Welcome | `scene/nexus_welcome_bg.png` | Intro |
| Victory | `scene/victory_bg.png` | Complete |
| Defeat | `scene/defeat_bg.png` | Defeat |

---

## Système de flags

### Flags de progression

| Flag | Défini par | Vérifié par |
|------|------------|-------------|
| `story_chapter_1_intro_seen` | Intro | Toutes les scènes (condition) |
| `story_nexus_1_pre_seen` | nexus_1_pre | nexus_1_victory |
| `story_nexus_1_victory_seen` | nexus_1_victory | - |
| `story_nexus_2_pre_seen` | nexus_2_pre | - |
| `story_nexus_3_pre_seen` | nexus_3_pre | - |
| `story_nexus_4_pre_seen` | nexus_4_pre | - |
| `story_nexus_boss_pre_seen` | boss_pre | chapter_1_complete |
| `story_chapter_1_complete_seen` | complete | - |
| `chapter_1_completed` | complete | Chapitres suivants |

### Flags de personnalité

| Flag | Défini par | Effet potentiel |
|------|------------|-----------------|
| `learned_about_nexus` | Intro choix 1 | Dialogues futurs |
| `learned_about_summoner` | Intro choix 2 | Dialogues futurs |
| `player_curious` | nexus_2 choix 1 | Dialogues futurs |
| `player_cautious` | nexus_2 choix 2 | Dialogues futurs |
| `boss_response_brave` | Boss choix 1 | Dialogues chapitre 2 |
| `boss_response_diplomatic` | Boss choix 2 | Dialogues chapitre 2 |
| `boss_response_determined` | Boss choix 3 | Dialogues chapitre 2 |

---

## Flux de déclenchement

```
┌─────────────────────────────────────────────────────────────────┐
│                         CHAPTER MAP                              │
│                                                                  │
│  useEffect → checkTriggers({ type: 'onStoryProgress', chapterId })│
│                              ↓                                   │
│                   SCENE_CHAPTER_1_INTRO                          │
│                   (si pas encore vu)                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                        STORY BATTLE                              │
│                                                                  │
│  initializeBattle → checkTriggers({ type: 'onBattleStart',      │
│                                     chapterId, battleId })       │
│                              ↓                                   │
│                   SCENE_NEXUS_X_PRE                              │
│                   (selon battleId)                               │
│                              ↓                                   │
│                        COMBAT                                    │
│                              ↓                                   │
│  handleBattleComplete → checkTriggers({ type: 'onBattleEnd',    │
│                                         result: 'win'/'lose' })  │
│                              ↓                                   │
│           SCENE_NEXUS_X_VICTORY ou SCENE_CHAPTER_1_DEFEAT        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tests recommandés

1. **Test intro** : Entrer dans le Chapitre 1 pour la première fois
   - Vérifier que l'intro s'affiche
   - Tester les 3 choix

2. **Test pre-battle** : Lancer chaque combat
   - Vérifier que la scène pre-battle s'affiche
   - Vérifier qu'elle ne s'affiche pas en replay

3. **Test victory** : Gagner un combat
   - Vérifier que la scène de victoire s'affiche

4. **Test defeat** : Perdre un combat
   - Vérifier que la scène de défaite s'affiche
   - Vérifier le ton encourageant

5. **Test boss** : Affronter le boss
   - Vérifier les 3 options de réponse
   - Vérifier la scène de complétion après victoire

6. **Test progression** : Rejouer un combat
   - Vérifier que les scènes ne se répètent pas

---

## Prochaines étapes

- [ ] Tester l'intégration complète
- [ ] Créer le contenu narratif du Chapitre 2 (Water World)
- [ ] Ajouter des références aux choix du Chapitre 1 dans le Chapitre 2
- [ ] Intégrer l'audio (musique et sons)
