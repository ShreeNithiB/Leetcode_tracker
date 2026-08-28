export type FetchStatus = 
  | 'SUCCESS'
  | 'USERNAME_NOT_FOUND'
  | 'NO_PUBLIC_DATA'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'API_ERROR'
  | 'FETCH_ERROR'
  | 'USERNAME_MISSING'
  | 'PENDING';

export type PerformanceTier = 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';

export type ActivityStatus = 'Active' | 'Inactive' | 'No Data';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Unknown';

export interface Student {
  id: string;
  register_no: string;
  student_name: string;
  section: string;
  year: string; // 'I' | 'II' | 'III' | 'IV'
  batch: string; // e.g. '2023-2027'
  username: string;
  email?: string;
  mentor?: string;
  academic_year?: string;
  active: boolean;
  created_at: string;
  notes?: string;
}

export type UserRole = 'student' | 'faculty';

export interface AuthUser {
  id: string;
  role: UserRole;
  username: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LanguageStat {
  languageName: string;
  problemsSolved: number;
}

export interface SkillStat {
  tagName: string;
  problemsSolved: number;
  category?: 'fundamental' | 'intermediate' | 'advanced';
}

export interface RecentSubmission {
  id: string;
  student_id: string;
  title: string;
  titleSlug: string;
  timestamp: string; // epoch or ISO
  language?: string;
  statusDisplay?: string;
}

export interface Snapshot {
  id: string;
  student_id: string;
  captured_at: string; // ISO string
  total_solved: number;
  easy: number;
  medium: number;
  hard: number;
  acceptance_rate: number;
  ranking: number;
  reputation: number;
  contest_rating: number;
  contest_rank: number;
  contests_attended: number;
  top_percentage: number;
  streak: number;
  active_days: number;
  last_active?: string; // YYYY-MM-DD
  languages: LanguageStat[];
  skills: SkillStat[];
  badges: { name: string; icon?: string }[];
  submission_calendar?: Record<string, number>; // timestamp -> count
  engagement_score: number;
  performance_tier: PerformanceTier;
  activity_status: ActivityStatus;
  status: FetchStatus;
  error?: string;
}

export interface StudentWithLatest extends Student {
  latest_snapshot?: Snapshot;
  previous_snapshot?: Snapshot;
  problems_added_week?: number;
  problems_added_month?: number;
  problems_added_semester?: number;
  improvement_pct_month?: number;
  days_inactive?: number;
  risk_level?: RiskLevel;
}

export interface SystemSettings {
  inactivity_threshold_days: number; // default 14
  academic_year: string; // default "2024-2025"
  fetch_delay_ms: number; // default 1500
  api_timeout_seconds: number; // default 25
  tier_beginner_max: number; // default 49
  tier_developing_max: number; // default 99
  tier_proficient_max: number; // default 199
  weights: {
    total_solved: number; // default 25
    medium_solved: number; // default 20
    hard_solved: number; // default 15
    recent_activity: number; // default 15
    streak: number; // default 10
    contest_participation: number; // default 10
    improvement_rate: number; // default 5
  };
  auto_sync_enabled?: boolean; // default false
  auto_sync_interval_hours?: number; // default 12 (6, 12, 24)
}

export interface POTDItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  acceptanceRate?: number;
  leetcodeUrl: string;
  hint?: string;
  solvedCount?: number;
  solvedStudents?: {
    studentId: string;
    studentName: string;
    registerNo: string;
    section: string;
    username: string;
    solvedAt?: string;
  }[];
}

export interface CuratedProblem {
  id: string;
  trackId: string;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  orderIndex: number;
  leetcodeUrl: string;
  solvedCount?: number;
  isSolvedBySelectedStudent?: boolean;
}

export interface CuratedTrack {
  id: string;
  title: string;
  description: string;
  totalProblems: number;
  icon?: string;
  category: 'blind75' | 'top150' | 'csbs_core' | 'custom';
  problems?: CuratedProblem[];
  departmentCompletionRate?: number;
}

export interface SchedulerStatus {
  isEnabled: boolean;
  intervalHours: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  isRunning: boolean;
}

export interface DashboardSummary {
  total_students: number;
  active_students: number;
  inactive_students: number;
  no_data_students: number;
  total_problems_solved: number;
  avg_problems_per_student: number;
  avg_contest_rating: number;
  avg_engagement_score: number;
  most_improved_student?: {
    id: string;
    name: string;
    register_no: string;
    section: string;
    problems_added: number;
    improvement_pct: number;
  };
  highest_problem_solver?: {
    id: string;
    name: string;
    register_no: string;
    section: string;
    total_solved: number;
    username: string;
  };
  difficulty_distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  tier_distribution: {
    Beginner: number;
    Developing: number;
    Proficient: number;
    Advanced: number;
  };
  insights: string[];
}

export interface SectionStat {
  section: string;
  total_students: number;
  active_students: number;
  inactive_students: number;
  avg_problems: number;
  total_problems: number;
  avg_rating: number;
  avg_engagement: number;
  top_performer?: string;
  top_performer_problems?: number;
}

export interface BatchStat {
  year: string;
  batch: string;
  total_students: number;
  active_students: number;
  avg_problems: number;
  avg_engagement: number;
  avg_rating: number;
}

export interface BatchFetchProgress {
  is_running: boolean;
  total: number;
  processed: number;
  successful: number;
  failed: number;
  current_student?: string;
  started_at?: string;
  completed_at?: string;
  logs: {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warn' | 'error';
  }[];
}

