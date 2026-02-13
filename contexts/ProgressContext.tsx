
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CourseStructure, UserProgress, Assessment, StudentStats, User } from '../types';
import {
  getCourses,
  getProgress,
  getAssessments,
  getAllStudentStats,
  getClassOverview,
  updateTopicProgress as storageUpdateProgress,
  saveTopic as storageSaveTopic
} from '../services/storageService';
import { useAuth } from './AuthContext';

interface ProgressContextType {
  courses: CourseStructure;
  assessments: Assessment[];
  studentStats: StudentStats[];
  classOverview: { totalStudents: number; classAverage: number; weakestTopic: string };
  userProgress: UserProgress;
  refreshAll: () => void;
  updateProgress: (subject: string, topicId: string, updates: Partial<import('../types').TopicProgress>) => void;
  saveTopic: (subject: string, topic: import('../types').Topic) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseStructure>({});
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [classOverview, setClassOverview] = useState<{ totalStudents: number; classAverage: number; weakestTopic: string }>({ totalStudents: 0, classAverage: 0, weakestTopic: '' });
  const [userProgress, setUserProgress] = useState<UserProgress>({});

  const refreshAll = useCallback(() => {
    setCourses(getCourses());
    setAssessments(getAssessments());
    setClassOverview(getClassOverview());
    if (user) {
      setUserProgress(getProgress(user.username));
      if (user.role !== 'student') {
        setStudentStats(getAllStudentStats());
      }
    }
  }, [user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const updateProgress = (subject: string, topicId: string, updates: any) => {
    if (!user) return;
    storageUpdateProgress(user.username, subject, topicId, updates);
    refreshAll();
  };

  const saveTopic = (subject: string, topic: any) => {
    storageSaveTopic(subject, topic);
    refreshAll();
  };

  return (
    <ProgressContext.Provider value={{
      courses, assessments, studentStats, classOverview, userProgress,
      refreshAll, updateProgress, saveTopic
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
};
