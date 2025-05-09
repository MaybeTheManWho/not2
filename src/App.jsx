import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { CalendarContext } from './contexts/CalendarContext';

import HomePage from './pages/HomePage';
import TodoPage from './pages/TodoPage';
import CalendarPage from './pages/CalendarPage';
import AssetsPage from './pages/AssetsPage';
import WritingPage from './pages/WritingPage'; 
import WritingEditor from './pages/WritingEditor';
import StopwatchPage from './pages/StopwatchPage';
import Login from './components/auth/Login';

import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ChatBot from './components/common/ChatBot';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const { isLoading: calendarLoading, error } = useContext(CalendarContext);

  const isLoading = authLoading || calendarLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="App min-h-screen flex flex-col">
      {isAuthenticated ? (
        <div className="flex flex-1 h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-6 bg-background">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/todo" element={<TodoPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/writing" element={<WritingPage />} />
                <Route path="/writing/new" element={<WritingEditor />} />
                <Route path="/writing/edit/:id" element={<WritingEditor />} />
                <Route path="/stopwatch" element={<StopwatchPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <ChatBot />
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
