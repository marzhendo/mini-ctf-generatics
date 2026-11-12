export type SkillType = 'DOUBLE_POINTS' | 'FREEZE_TIME' | 'DEDUCT_POINTS' | 'STEAL_POINTS';

export interface User {
  id: string;
  name: string;
  score: number;
  current_level: number;
  frozen_until?: string | null;
  has_double_points?: boolean;
  created_at: string;
}

export interface Challenge {
  id: number;
  level: number;
  question_text: string;
  points: number;
}

export interface ChallengeWithAnswer extends Challenge {
  flag_answer: string;
}

export interface Submission {
  id: string;
  user_id: string;
  challenge_level: number;
  is_correct: boolean;
  submitted_answer?: string;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_type: SkillType;
  is_used: boolean;
  created_at: string;
}

export interface BattleEvent {
  id: string;
  event_type: 'AIR_DROP' | 'SKILL_EXECUTED';
  actor_id?: string | null;
  target_id?: string | null;
  skill_type?: SkillType | null;
  description: string;
  payload?: Record<string, unknown>;
  created_at: string;
}

export interface SubmitFlagResult {
  success: boolean;
  is_correct?: boolean;
  points_awarded?: number;
  new_score?: number;
  next_level?: number;
  error?: string;
  message?: string;
}

export interface LeaderboardUser extends User {
  rank?: number;
  statusText: string;
  isFinished: boolean;
  isFrozen?: boolean;
  nodeMatrix?: boolean[];
  streak?: number;
}

export interface RivalUser {
  id: string;
  name: string;
  score: number;
  current_level: number;
  rank: number;
  is_frozen: boolean;
}

export interface DeploySkillResult {
  success: boolean;
  message?: string;
  error?: string;
  skill_type?: SkillType;
  new_score?: number;
}
