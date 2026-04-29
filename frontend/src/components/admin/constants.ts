export const JSON_TEMPLATES: Record<string, Record<string, unknown>> = {
  users: {
    username: "",
    email: "",
    password: "password123",
    role: "USER",
    rank: "BRONZE",
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    weight: 75.0,
    height: 180.0,
    gender: "MALE",
    birthDate: "1995-01-01"
  },
  quests: {
    title: "New Daily Quest",
    description: "Complete exercise routine",
    type: "DAILY",
    rankDifficulty: "C",
    goldReward: 50,
    xpReward: 100,
    steps: [
      {
        exercise: { id: 1 },
        series: 3,
        repetitions: 10
      }
    ]
  },
  exercises: {
    name: "Pushups",
    type: "Strength",
    difficulty: "Beginner",
    baseReps: 10,
    baseDuration: 0,
    baseWeight: 0.0
  },
  achievements: {
    title: "Early Bird",
    description: "Complete a workout before 7 AM",
    iconUrl: "https://example.com/icon.png"
  },
  stats: {
    name: "Strength",
    description: "Physical power and muscle force"
  },
  leagues: {
    rankLevel: 1,
    rank: "BRONZE",
    reward: 500,
    xpReward: 1000
  },
  "quest-start": {
    userId: 1
  },
  tips: {
    title: "Hydration Tip",
    description: "Drink at least 2L of water daily",
    imageUrl: "https://example.com/tip.png"
  },
  titles: {
    name: "Iron Soul",
    description: "Unlocked after 100 workouts"
  },
  social: {
    senderId: 1,
    receiverId: 2
  },
  moderation: {
    userId: 1
  },
  "distribute-stats": {
    "AGI": 2,
    "VIT": 2,
    "INT": 0,
    "LUK": 0,
    "SPD": 0
  }
};

export const ENTITIES = [
  { id: 'users', name: 'Users' },
  { id: 'quests', name: 'Quests' },
  { id: 'exercises', name: 'Exercises' },
  { id: 'achievements', name: 'Achievements' },
  { id: 'stats', name: 'Stats' },
  { id: 'leagues', name: 'Leagues' },
  { id: 'tips', name: 'Tips' },
  { id: 'titles', name: 'Titles' },
  { id: 'social', name: 'Social' },
  { id: 'quest-progress', name: 'Quest Progression' },
  { id: 'competitive', name: 'Competitive Automation' },
  { id: 'moderation', name: 'Security & Moderation' },
  { id: 'shop', name: 'Shop & Inventory' },
];
