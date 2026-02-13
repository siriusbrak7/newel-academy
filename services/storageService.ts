
import { DEMO_USERS } from '../constants';
import { User, CourseStructure, UserProgress, Assessment, Topic, TopicProgress, StudentStats, Submission, Announcement, ClassOverview, Leaderboards } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const appStorage = (() => {
  let memoryStorage: Record<string, string> = {};
  let nativeStorage: Storage | null = null;
  try { if (typeof window !== 'undefined') nativeStorage = window.localStorage; } catch (e) { }
  return {
    getItem: (key: string): string | null => { try { return nativeStorage ? nativeStorage.getItem(key) : (memoryStorage[key] || null); } catch (e) { return memoryStorage[key] || null; } },
    setItem: (key: string, value: string) => { try { if (nativeStorage) nativeStorage.setItem(key, value); } catch (e) { } memoryStorage[key] = value; },
    removeItem: (key: string) => { try { if (nativeStorage) nativeStorage.removeItem(key); } catch (e) { } delete memoryStorage[key]; },
    getAll: () => { const data: Record<string, string> = { ...memoryStorage }; if (nativeStorage) { for (let i = 0; i < nativeStorage.length; i++) { const k = nativeStorage.key(i); if (k && k.startsWith('newel_')) { const v = nativeStorage.getItem(k); if (v) data[k] = v; } } } return data; }
  };
})();

const USERS_DB_KEY = 'newel_usersDb';
const COURSES_DB_KEY = 'newel_coursesDb';
const PROGRESS_DB_KEY = 'newel_progressDb';
const ASSESSMENTS_DB_KEY = 'newel_assessmentsDb';
const LEADERBOARD_DB_KEY = 'newel_leaderboardDb';
const SUBMISSIONS_DB_KEY = 'newel_submissionsDb';
const ANNOUNCEMENTS_DB_KEY = 'newel_announcementsDb';

// Safe JSON parse with fallback to prevent crashes from corrupted localStorage
const safeParseJSON = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    // Basic type guard: if fallback is array, parsed must be array; if object, must be object
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'object' && !Array.isArray(fallback) && (typeof parsed !== 'object' || Array.isArray(parsed))) return fallback;
    return parsed as T;
  } catch (err) {
    console.warn('[Storage] Failed to parse JSON, using fallback:', err);
    return fallback;
  }
};

// Atomic Sync Queue
const syncQueue: Record<string, boolean> = {};
const syncToSupabase = async (key: string, data: any) => {
  if (!isSupabaseConfigured() || !supabase || syncQueue[key]) return;
  syncQueue[key] = true;
  try {
    await supabase.from('app_data').upsert({ key, value: data }, { onConflict: 'key' });
  } catch (err) {
    console.warn(`Supabase Sync Failed (${key})`);
  } finally {
    syncQueue[key] = false;
  }
};

const fetchFromSupabase = async (key: string) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data } = await supabase.from('app_data').select('value').eq('key', key).single();
    return data?.value;
  } catch (err) { return null; }
};

export const initStorage = async () => {
  const remoteUsers = await fetchFromSupabase(USERS_DB_KEY);
  if (remoteUsers) appStorage.setItem(USERS_DB_KEY, JSON.stringify(remoteUsers));

  const usersRaw = appStorage.getItem(USERS_DB_KEY);
  let users: Record<string, User> = usersRaw ? JSON.parse(usersRaw) : {};

  // Only seed demo users on the very first initialization
  const seeded = appStorage.getItem('newel_demo_seeded');
  if (!seeded) {
    DEMO_USERS.forEach(demoUser => {
      if (!users[demoUser.username]) {
        users[demoUser.username] = demoUser;
      }
    });
    appStorage.setItem('newel_demo_seeded', 'true');
  }

  appStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  syncToSupabase(USERS_DB_KEY, users);

  const remoteCourses = await fetchFromSupabase(COURSES_DB_KEY);
  if (remoteCourses) appStorage.setItem(COURSES_DB_KEY, JSON.stringify(remoteCourses));

  if (!appStorage.getItem(COURSES_DB_KEY)) {
    const defaultCourses = {
      'Biology': {
        'Cell Structure': {
          id: 'Cell Structure',
          title: 'Cell Structure & Function',
          gradeLevel: '9',
          description: 'The fundamental building blocks of life.',
          subtopics: ['Animal Cells', 'Plant Cells', 'Specialized Cells'],
          materials: []
        }
      },
      'Physics': {},
      'Chemistry': {}
    };
    appStorage.setItem(COURSES_DB_KEY, JSON.stringify(defaultCourses));
    syncToSupabase(COURSES_DB_KEY, defaultCourses);
  }
};

export const getStoredSession = (): User | null => { return safeParseJSON<User | null>(appStorage.getItem('newel_currentUser'), null); };
export const saveSession = (user: User | null) => { if (user) appStorage.setItem('newel_currentUser', JSON.stringify(user)); else appStorage.removeItem('newel_currentUser'); };
export const getUsers = (): Record<string, User> => safeParseJSON<Record<string, User>>(appStorage.getItem(USERS_DB_KEY), {});
export const saveUser = (user: User) => { const users = getUsers(); users[user.username] = user; appStorage.setItem(USERS_DB_KEY, JSON.stringify(users)); syncToSupabase(USERS_DB_KEY, users); };
export const deleteUser = (username: string) => {
  const users = getUsers();
  delete users[username];
  appStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  syncToSupabase(USERS_DB_KEY, users);
};
export const getCourses = (): CourseStructure => safeParseJSON<CourseStructure>(appStorage.getItem(COURSES_DB_KEY), {});
export const saveTopic = (subject: string, topic: Topic) => { const courses = getCourses(); if (!courses[subject]) courses[subject] = {}; courses[subject][topic.id] = topic; appStorage.setItem(COURSES_DB_KEY, JSON.stringify(courses)); syncToSupabase(COURSES_DB_KEY, courses); };
export const getProgress = (username: string): UserProgress => safeParseJSON<Record<string, UserProgress>>(appStorage.getItem(PROGRESS_DB_KEY), {})[username] || {};

export const updateTopicProgress = (username: string, subject: string, topicId: string, updates: Partial<TopicProgress>) => {
  const allProgress = safeParseJSON<Record<string, Record<string, Record<string, TopicProgress>>>>(appStorage.getItem(PROGRESS_DB_KEY), {});
  if (!allProgress[username]) allProgress[username] = {};
  if (!allProgress[username][subject]) allProgress[username][subject] = {};
  const current = allProgress[username][subject][topicId] || { subtopics: {}, checkpointScores: {}, mainAssessmentPassed: false };
  allProgress[username][subject][topicId] = { ...current, ...updates, subtopics: { ...current.subtopics, ...(updates.subtopics || {}) }, checkpointScores: { ...current.checkpointScores, ...(updates.checkpointScores || {}) }, lastAccessed: Date.now() };
  appStorage.setItem(PROGRESS_DB_KEY, JSON.stringify(allProgress)); syncToSupabase(PROGRESS_DB_KEY, allProgress);
};

export const getAssessments = (): Assessment[] => safeParseJSON<Assessment[]>(appStorage.getItem(ASSESSMENTS_DB_KEY), []);
export const saveAssessment = (assessment: Assessment) => { const list = getAssessments(); const idx = list.findIndex(a => a.id === assessment.id); if (idx >= 0) list[idx] = assessment; else list.push(assessment); appStorage.setItem(ASSESSMENTS_DB_KEY, JSON.stringify(list)); syncToSupabase(ASSESSMENTS_DB_KEY, list); };
export const getSubmissions = (): Submission[] => safeParseJSON<Submission[]>(appStorage.getItem(SUBMISSIONS_DB_KEY), []);
export const saveSubmission = (sub: Submission) => { const list = getSubmissions(); const idx = list.findIndex(s => s.assessmentId === sub.assessmentId && s.username === sub.username); if (idx >= 0) list[idx] = sub; else list.push(sub); appStorage.setItem(SUBMISSIONS_DB_KEY, JSON.stringify(list)); syncToSupabase(SUBMISSIONS_DB_KEY, list); };
export const getAnnouncements = (): Announcement[] => safeParseJSON<Announcement[]>(appStorage.getItem(ANNOUNCEMENTS_DB_KEY), []);
export const saveAnnouncement = (ann: Announcement) => { const list = getAnnouncements(); list.unshift(ann); appStorage.setItem(ANNOUNCEMENTS_DB_KEY, JSON.stringify(list)); syncToSupabase(ANNOUNCEMENTS_DB_KEY, list); };

export const calculateUserStats = (user: User) => {
  const history = user.loginHistory || [];
  if (history.length === 0) return { activeDays: 0, streak: 0 };
  const dates = Array.from(new Set(history.map(ts => new Date(ts).toISOString().split('T')[0]))).sort();
  return { activeDays: dates.length, streak: dates.length > 0 ? 1 : 0 }; // Simplified streak logic
};

export const getAllStudentStats = (): StudentStats[] => {
  const users = getUsers(); const subs = getSubmissions();
  return Object.values(users).filter(u => u.role === 'student').map(user => {
    const userSubs = subs.filter(s => s.username === user.username && s.graded);
    const avg = userSubs.length > 0 ? userSubs.reduce((acc, s) => acc + (s.score || 0), 0) / userSubs.length : 0;
    const { activeDays, streak } = calculateUserStats(user);
    return { username: user.username, gradeLevel: user.gradeLevel || '9', avgScore: avg, completionRate: 0, lastActive: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never', streak, activeDays };
  });
};

export const getClassOverview = (): ClassOverview => {
  const users = getUsers(); const subs = getSubmissions();
  const students = Object.values(users).filter(u => u.role === 'student');
  const graded = subs.filter(s => s.graded);
  const avg = graded.length > 0 ? graded.reduce((acc, s) => acc + (s.score || 0), 0) / graded.length : 0;
  return { totalStudents: students.length, classAverage: Math.round(avg), weakestTopic: 'Biology' };
};

export const getLeaderboards = (): Leaderboards => safeParseJSON<Leaderboards>(appStorage.getItem(LEADERBOARD_DB_KEY), { academic: [], challenge: [], assessments: [] });
export const saveSprintScore = (username: string, score: number) => {
  const boards = getLeaderboards();
  boards.challenge.push({ username, score });
  boards.challenge.sort((a: any, b: any) => b.score - a.score);
  boards.challenge = boards.challenge.slice(0, 10);
  appStorage.setItem(LEADERBOARD_DB_KEY, JSON.stringify(boards)); syncToSupabase(LEADERBOARD_DB_KEY, boards);
};

export const uploadFileToSupabase = async (file: File): Promise<string | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const name = `${Date.now()}_${file.name}`;
    await supabase.storage.from('materials').upload(name, file);
    return supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
  } catch { return null; }
};
export const exportAllData = () => JSON.stringify(appStorage.getAll());
export const importAllData = (json: string) => { try { const data = JSON.parse(json); Object.keys(data).forEach(k => appStorage.setItem(k, data[k])); return true; } catch { return false; } };
