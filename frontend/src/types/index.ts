export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  profilePic?: string;
  registrationDate?: string;
  streak: number;
  totalPoints: number;
  seasonPoints: number;
  level: number;
  xp: number;
  coins: number;
  rank?: string;
  seasonRank?: string;
  role?: UserRole;
  weight?: number;
  height?: number;
  birthDate?: string;
  gender?: string;
  energy?: number;
  fatigue?: number;
  completedWorkouts?: number;
  totalTrainingTime?: number;
  achievedChallenges?: number;
  imc?: number;
  statPoints?: number;
  isGuest?: boolean;
}

export interface SurveyData {
  pushUps: string;
  runTime: string;
  goal: string;
  frequency: string;
  weight: string;
  height: string;
  gender?: string;
  age?: string;
}

export interface Stat {
  id: number;
  name: string;
  description: string;
}

export interface Quest {
  id: number;
  title?: string;
  description?: string;
  type?: 'DAILY' | 'CHALLENGE' | 'BOSS' | 'CUSTOM';
  rankDifficulty?: string;
  goldReward?: number;
  xpReward?: number;
  steps?: QuestStep[];
  completed?: boolean;
  completedRepetitions?: number;
  totalRepetitions?: number;
}

export interface QuestStep {
  id: number;
  exercise?: Exercise;
  series?: number;
  repetitions?: number;
  duration?: number;
  weight?: number;
}

export interface Exercise {
  id: number;
  name?: string;
  type?: string;
  difficulty?: string;
  baseReps?: number;
  baseDuration?: number;
  baseWeight?: number;
}

export interface RankingUserDTO {
  id: number;
  username: string;
  profilePic?: string;
  title?: string;
  level: number;
  rank?: string;
  seasonRank?: string;
  totalPoints: number;
  seasonPoints: number;
}

export interface LoginResponse {
  token?: string;
  username?: string;
  email?: string;
  role?: UserRole;
  id: number;
}

// --- Shared component types ---

export interface PlayerStats {
  [key: string]: number;
}

export interface PlayerProfile {
  userId?: number;
  rank?: string;
  level: number;
  xp: number;
  coins: number;
  stats?: PlayerStats;
  username?: string;
  biometria?: Record<string, unknown>;
  profilePic?: string;
  seasonRank?: string;
  statPoints?: number;
}

export interface AppUser {
  id: number;
  username: string;
  email?: string;
  rank?: string;
  isGuest?: boolean;
  role?: UserRole;
}

export interface PageProps {
  user?: AppUser | null;
  profile?: PlayerProfile | null;
  onNavigate?: (tab: string, params?: any) => void;
  onLogout?: () => void;
  targetId?: number;
}

export interface DailyQuestDTO {
  questId: number;
  title?: string;
  rank?: string;
  xpReward?: number;
  goldReward?: number;
  completed?: boolean;
  completedRepetitions?: number;
  totalRepetitions?: number;
  exercises?: DailyQuestExercise[];
}

export interface DailyQuestExercise {
  exerciseName: string;
  series: number;
  repetitionsPerSeries: number;
}

export interface SystemStatusResponse {
  status: string;
  message: string;
}
