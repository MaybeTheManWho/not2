import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const StopwatchContext = createContext();

export const StopwatchProvider = ({ children }) => {
  // State for stopwatch sessions
  const [sessions, setSessions] = useState([]);
  
  // Load sessions from localStorage on mount
  useEffect(() => {
    const storedSessions = localStorage.getItem('stopwatch_sessions');
    
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);
  
  // Save to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('stopwatch_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);
  
  // Add a new session record
  const addSession = (sessionData) => {
    const newSession = {
      id: uuidv4(),
      date: new Date().toISOString(),
      ...sessionData
    };
    
    setSessions(prevSessions => [newSession, ...prevSessions]);
    return newSession;
  };
  
  // Delete a session
  const deleteSession = (sessionId) => {
    setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
  };
  
  // Clear all sessions
  const clearAllSessions = () => {
    setSessions([]);
    localStorage.removeItem('stopwatch_sessions');
  };
  
  // Get sessions by user
  const getSessionsByUser = (username) => {
    return sessions.filter(session => session.user === username);
  };
  
  // Get sessions by topic
  const getSessionsByTopic = (topic) => {
    return sessions.filter(session => session.topic === topic);
  };
  
  // Calculate statistics
  const getStats = (filterUser = null, filterTopic = null) => {
    let filteredSessions = [...sessions];
    
    if (filterUser) {
      filteredSessions = filteredSessions.filter(session => session.user === filterUser);
    }
    
    if (filterTopic) {
      filteredSessions = filteredSessions.filter(session => session.topic === filterTopic);
    }
    
    if (filteredSessions.length === 0) {
      return {
        totalSessions: 0,
        totalActiveTime: 0,
        totalPausedTime: 0,
        averageActiveTime: 0,
        averagePausedTime: 0
      };
    }
    
    const totalSessions = filteredSessions.length;
    const totalActiveTime = filteredSessions.reduce((sum, session) => sum + session.activeTime, 0);
    const totalPausedTime = filteredSessions.reduce((sum, session) => sum + session.pausedTime, 0);
    
    return {
      totalSessions,
      totalActiveTime,
      totalPausedTime,
      averageActiveTime: totalActiveTime / totalSessions,
      averagePausedTime: totalPausedTime / totalSessions
    };
  };
  
  return (
    <StopwatchContext.Provider value={{
      sessions,
      addSession,
      deleteSession,
      clearAllSessions,
      getSessionsByUser,
      getSessionsByTopic,
      getStats
    }}>
      {children}
    </StopwatchContext.Provider>
  );
};

export default StopwatchProvider;
