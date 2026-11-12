export type SkillType = 'DOUBLE_POINTS' | 'FREEZE_TIME' | 'DEDUCT_POINTS' | 'STEAL_POINTS';

export type QuestionType = 'FLAG' | 'MULTIPLE_CHOICE';

export type EventStatus = 'WAITING' | 'RUNNING' | 'PAUSED' | 'STOPPED';

export interface ActiveAirDrop {
  id: string;
  max_claims: number;
  claimed_by: string[];
  remaining_claims: number;
  created_at: string;
  expires_at?: string;
}

export interface EventState {
  status: EventStatus;
  duration_minutes: number;
  seconds_remaining: number;
  started_at?: string | null;
  stopped_at?: string | null;
  updated_at?: string;
  active_air_drop?: ActiveAirDrop | null;
}

export interface User {
  id: string;
  name: string;
  score: number;
  current_level: number;
  current_streak?: number;
  frozen_until?: string | null;
  has_double_points?: boolean;
  created_at: string;
}

export interface Challenge {
  id: number;
  level: number;
  question_text: string;
  question_type?: QuestionType;
  options?: string[]; // e.g. ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]
  category?: string;
  points: number;
  hint?: string;
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
  streak_count?: number;
  streak_multiplier?: number;
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
