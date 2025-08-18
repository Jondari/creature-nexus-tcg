import { Element } from '@/utils/storyDeckGenerator';

export interface StoryBattle {
  id: string;
  name: string;
  description: string;
  x: number; // Position on the map (0-100)
  y: number; // Position on the map (0-100)
  connections: string[]; // IDs of connected battles
  isCompleted: boolean;
  isAccessible: boolean;
  isBoss: boolean;
}

export interface StoryChapter {
  id: number;
  name: string;
  description: string;
  element: Element;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  battles: StoryBattle[];
  isUnlocked: boolean;
  isCompleted: boolean;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    name: "Central Nexus World",
    description: "The mysterious hub where all elemental energies converge. Discover the origins of the Nexus portals.",
    element: "all",
    colorTheme: {
      primary: "#8B5CF6", // Purple
      secondary: "#A78BFA",
      accent: "#C4B5FD",
      background: "#1E1B4B",
    },
    battles: [
      {
        id: "nexus_1",
        name: "First Encounter",
        description: "Your first battle in the mysterious Nexus",
        x: 20,
        y: 80,
        connections: ["nexus_2"],
        isCompleted: false,
        isAccessible: true,
        isBoss: false,
      },
      {
        id: "nexus_2",
        name: "Portal Discovery",
        description: "Uncover the secrets of the elemental portals",
        x: 40,
        y: 60,
        connections: ["nexus_3", "nexus_4"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "nexus_3",
        name: "Ancient Guardians",
        description: "Face the ancient protectors of the Nexus",
        x: 60,
        y: 40,
        connections: ["nexus_boss"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "nexus_4",
        name: "Elemental Convergence",
        description: "Witness the power of converging elements",
        x: 60,
        y: 80,
        connections: ["nexus_boss"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "nexus_boss",
        name: "Nexus Core Guardian",
        description: "Confront the powerful entity at the heart of the Nexus",
        x: 80,
        y: 60,
        connections: [],
        isCompleted: false,
        isAccessible: false,
        isBoss: true,
      },
    ],
    isUnlocked: true,
    isCompleted: false,
  },
  {
    id: 2,
    name: "Water World",
    description: "Dive into the depths of aquatic realms filled with marine creatures and ice crystals.",
    element: "water",
    colorTheme: {
      primary: "#0EA5E9", // Blue
      secondary: "#38BDF8",
      accent: "#7DD3FC",
      background: "#0C4A6E",
    },
    battles: [
      {
        id: "water_1",
        name: "Tidal Pools",
        description: "Explore the shallow waters and their inhabitants",
        x: 15,
        y: 85,
        connections: ["water_2"],
        isCompleted: false,
        isAccessible: true,
        isBoss: false,
      },
      {
        id: "water_2",
        name: "Coral Gardens",
        description: "Navigate through vibrant underwater gardens",
        x: 35,
        y: 70,
        connections: ["water_3", "water_4"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "water_3",
        name: "Frozen Caverns",
        description: "Venture into the icy depths of the frozen caves",
        x: 25,
        y: 45,
        connections: ["water_5"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "water_4",
        name: "Deep Currents",
        description: "Battle against the creatures of the deep ocean",
        x: 55,
        y: 55,
        connections: ["water_5"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "water_5",
        name: "Maelstrom's Edge",
        description: "Face the challenges at the edge of the great whirlpool",
        x: 65,
        y: 30,
        connections: ["water_boss"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "water_boss",
        name: "Leviathan Portal",
        description: "Confront the massive guardian of the Water Portal",
        x: 85,
        y: 50,
        connections: [],
        isCompleted: false,
        isAccessible: false,
        isBoss: true,
      },
    ],
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 3,
    name: "Fire World",
    description: "Brave the scorching landscapes of volcanoes, magma flows, and burning ash.",
    element: "fire",
    colorTheme: {
      primary: "#F97316", // Orange
      secondary: "#FB923C",
      accent: "#FDBA74",
      background: "#7C2D12",
    },
    battles: [
      {
        id: "fire_1",
        name: "Ember Plains",
        description: "Cross the smoldering grasslands",
        x: 20,
        y: 75,
        connections: ["fire_2"],
        isCompleted: false,
        isAccessible: true,
        isBoss: false,
      },
      {
        id: "fire_2",
        name: "Lava Flows",
        description: "Navigate the dangerous rivers of molten rock",
        x: 40,
        y: 60,
        connections: ["fire_3", "fire_4"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "fire_3",
        name: "Ash Storms",
        description: "Survive the blinding volcanic ash tempests",
        x: 30,
        y: 35,
        connections: ["fire_5"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "fire_4",
        name: "Magma Chambers",
        description: "Explore the heart of the volcanic chambers",
        x: 60,
        y: 45,
        connections: ["fire_5"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "fire_5",
        name: "Crater's Edge",
        description: "Stand at the edge of the great volcanic crater",
        x: 70,
        y: 25,
        connections: ["fire_boss"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "fire_boss",
        name: "Inferno Portal",
        description: "Face the blazing guardian of the Fire Portal",
        x: 85,
        y: 40,
        connections: [],
        isCompleted: false,
        isAccessible: false,
        isBoss: true,
      },
    ],
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 4,
    name: "Earth World",
    description: "Journey through dense forests, towering mountains, and living stone formations.",
    element: "earth",
    colorTheme: {
      primary: "#65A30D", // Green
      secondary: "#84CC16",
      accent: "#A3E635",
      background: "#365314",
    },
    battles: [
      {
        id: "earth_1",
        name: "Ancient Grove",
        description: "Walk among the oldest trees in existence",
        x: 25,
        y: 80,
        connections: ["earth_2"],
        isCompleted: false,
        isAccessible: true,
        isBoss: false,
      },
      {
        id: "earth_2",
        name: "Stone Gardens",
        description: "Navigate through the living rock formations",
        x: 45,
        y: 65,
        connections: ["earth_3", "earth_4"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "earth_3",
        name: "Root Networks",
        description: "Discover the underground root highways",
        x: 30,
        y: 40,
        connections: ["earth_5"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "earth_4",
        name: "Mountain Peaks",
        description: "Climb to the highest mountain summits",
        x: 65,
        y: 50,
        connections: ["earth_5"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "earth_5",
        name: "Crystal Caverns",
        description: "Explore caves filled with earth crystals",
        x: 75,
        y: 30,
        connections: ["earth_boss"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "earth_boss",
        name: "Terra Portal",
        description: "Challenge the mountain-sized guardian of Earth",
        x: 90,
        y: 45,
        connections: [],
        isCompleted: false,
        isAccessible: false,
        isBoss: true,
      },
    ],
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 5,
    name: "Air World",
    description: "Soar through floating islands, wind currents, and lightning storms.",
    element: "air",
    colorTheme: {
      primary: "#E5E7EB", // Silver/White
      secondary: "#F3F4F6",
      accent: "#FFFFFF",
      background: "#374151",
    },
    battles: [
      {
        id: "air_1",
        name: "Wind Valleys",
        description: "Glide through the valleys of eternal wind",
        x: 20,
        y: 70,
        connections: ["air_2"],
        isCompleted: false,
        isAccessible: true,
        isBoss: false,
      },
      {
        id: "air_2",
        name: "Floating Islands",
        description: "Hop between the levitating landmasses",
        x: 40,
        y: 55,
        connections: ["air_3", "air_4"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "air_3",
        name: "Storm Clouds",
        description: "Battle within the heart of thunderstorms",
        x: 35,
        y: 30,
        connections: ["air_5"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "air_4",
        name: "Sky Bridges",
        description: "Cross the ethereal bridges in the sky",
        x: 60,
        y: 40,
        connections: ["air_5"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "air_5",
        name: "Lightning Spires",
        description: "Ascend the towers of pure electrical energy",
        x: 70,
        y: 20,
        connections: ["air_boss"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "air_boss",
        name: "Tempest Portal",
        description: "Face the storm-wreathed guardian of Air",
        x: 85,
        y: 35,
        connections: [],
        isCompleted: false,
        isAccessible: false,
        isBoss: true,
      },
    ],
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 6,
    name: "The Return to the Final Nexus",
    description: "Return to a transformed Nexus where all elemental energies clash in chaotic harmony.",
    element: "all",
    colorTheme: {
      primary: "#7C3AED", // Deep Purple
      secondary: "#8B5CF6",
      accent: "#A78BFA",
      background: "#2D1B69",
    },
    battles: [
      {
        id: "final_1",
        name: "Unstable Convergence",
        description: "Navigate the chaotic elemental storms",
        x: 15,
        y: 85,
        connections: ["final_2", "final_3"],
        isCompleted: false,
        isAccessible: true,
        isBoss: false,
      },
      {
        id: "final_2",
        name: "Elemental Chaos",
        description: "Battle through the merging elemental forces",
        x: 30,
        y: 60,
        connections: ["final_4"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "final_3",
        name: "Mythical Awakening",
        description: "Witness the awakening of ancient mythical creatures",
        x: 50,
        y: 70,
        connections: ["final_4"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "final_4",
        name: "Nexus Heart",
        description: "Reach the very core of the destabilized Nexus",
        x: 65,
        y: 45,
        connections: ["final_boss"],
        isCompleted: false,
        isAccessible: false,
        isBoss: false,
      },
      {
        id: "final_boss",
        name: "Ultimate Nexus Entity",
        description: "Face the ultimate entity threatening all worlds",
        x: 85,
        y: 50,
        connections: [],
        isCompleted: false,
        isAccessible: false,
        isBoss: true,
      },
    ],
    isUnlocked: false,
    isCompleted: false,
  },
];

export function getChapterById(id: number): StoryChapter | undefined {
  return STORY_CHAPTERS.find(chapter => chapter.id === id);
}

export function getNextChapter(currentChapterId: number): StoryChapter | undefined {
  return STORY_CHAPTERS.find(chapter => chapter.id === currentChapterId + 1);
}

export function unlockNextChapter(completedChapterId: number): void {
  const nextChapter = getNextChapter(completedChapterId);
  if (nextChapter) {
    nextChapter.isUnlocked = true;
  }
}

export function updateBattleProgress(chapterId: number, battleId: string, completed: boolean): void {
  const chapter = getChapterById(chapterId);
  if (!chapter) return;

  const battle = chapter.battles.find(b => b.id === battleId);
  if (!battle) return;

  battle.isCompleted = completed;

  // Update accessibility of connected battles
  if (completed) {
    battle.connections.forEach(connectionId => {
      const connectedBattle = chapter.battles.find(b => b.id === connectionId);
      if (connectedBattle) {
        connectedBattle.isAccessible = true;
      }
    });

    // Check if chapter is completed (all battles completed)
    const allBattlesCompleted = chapter.battles.every(b => b.isCompleted);
    if (allBattlesCompleted) {
      chapter.isCompleted = true;
      unlockNextChapter(chapterId);
    }
  }
}