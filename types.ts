
export type Role = 'admin' | 'teacher' | 'student';
export type Theme = 'Cosmic' | 'Cyber-Dystopian' | 'Solstice';

export interface User {
  username: string;
  password?: string;
  role: Role;
  approved: boolean;
  securityQuestion: string;
  securityAnswer: string;
  gradeLevel?: string; // '9', '10', '11', '12'
  assignedStudents?: string[];
  lastLogin?: number;
  loginHistory?: number[]; // Array of timestamps for streak calculation
}

export interface AuthState {
  loggedIn: boolean;
  user: User | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[]; // for MCQ
  correctAnswer: string; // text match
  type: 'MCQ' | 'THEORY';
  difficulty: 'IGCSE' | 'AS' | 'A_LEVEL';
  topic: string;
  modelAnswer?: string; // For AI grading of theory
}

export interface Material {
  id: string;
  title: string;
  type: 'text' | 'file' | 'link';
  content: string; // Text content or Base64/URL
}

export interface Topic {
  id: string; // e.g., 'cell_biology'
  title: string; // e.g., 'Cell Biology'
  gradeLevel: string;
  description: string;
  subtopics: string[]; // List of subtopic names
  materials: Material[];
  subtopicQuestions?: Record<string, Question[]>; // Map subtopic name to list of questions
}

export interface CourseStructure {
  [subject: string]: {
    [topicId: string]: Topic;
  };
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  questions: Question[];
  assignedTo: string[]; // usernames or 'all'
  targetGrade: string; // '9', '10', '11', '12', 'all'
  createdBy: string;
  dueDate?: number;
}

export interface Submission {
  assessmentId: string;
  username: string;
  answers: Record<string, string>; // questionId -> answer
  submittedAt: number;
  graded: boolean;
  score?: number; // percentage
  feedback?: string;
  aiGraded?: boolean;
}

export interface TopicProgress {
  subtopics: { [subtopicName: string]: boolean }; // true if passed
  checkpointScores: { [subtopicName: string]: number };
  mainAssessmentScore?: number;
  mainAssessmentPassed: boolean;
  lastAccessed?: number; // timestamp
}

export interface UserProgress {
  [subject: string]: {
    [topicId: string]: TopicProgress;
  };
}

export interface LeaderboardEntry {
  username: string;
  score: number; // % completion or raw score
  gradeLevel?: string;
}

export interface Notification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: number;
}

export interface StudentStats {
  username: string;
  gradeLevel: string;
  avgScore: number;
  completionRate: number;
  lastActive: string;
  streak: number;
  activeDays: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  author: string;
}

export interface ClassOverview {
  totalStudents: number;
  classAverage: number;
  weakestTopic: string;
}

export interface Leaderboards {
  academic: LeaderboardEntry[];
  challenge: LeaderboardEntry[];
  assessments: LeaderboardEntry[];
}
