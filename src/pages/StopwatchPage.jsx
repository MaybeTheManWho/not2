import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaTrash, 
  FaUserAlt,
  FaClock,
  FaFilter,
  FaDownload
} from 'react-icons/fa';
import { StopwatchContext } from '../contexts/StopwatchContext';
import { CalendarContext } from '../contexts/CalendarContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

// Users for the stopwatch
const USERS = [
  { id: 'khalid', name: 'Khalid', color: '#4A5CDB' }, // Primary color
  { id: 'rio', name: 'Rio', color: '#8A2BE2' }       // Secondary color
];

// Topics for the stopwatch
const TOPICS = [
  { id: 'studying', name: 'Studying' },
  { id: 'coding', name: 'Coding' }
];

const StopwatchPage = () => {
  const { addSession, sessions, deleteSession, clearAllSessions } = useContext(StopwatchContext);
  const { getUserColor } = useContext(CalendarContext);
  
  // State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [filterUser, setFilterUser] = useState(null);
  const [filterTopic, setFilterTopic] = useState(null);
  
  // Refs
  const timerRef = useRef(null);
  
  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const userMatch = !filterUser || session.user === filterUser;
    const topicMatch = !filterTopic || session.topic === filterTopic;
    return userMatch && topicMatch;
  });
  
  // Format time (ms to HH:MM:SS format)
  const formatTime = (timeInMs) => {
    if (!timeInMs) return '00:00:00';
    
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Handle user selection
  const handleUserSelect = (user) => {
    if (isRunning) return; // Can't change user while timer is running
    
    setSelectedUser(user);
    
    // Auto-select first topic if none selected
    if (!selectedTopic && TOPICS.length > 0) {
      setSelectedTopic(TOPICS[0].id);
    }
  };
  
  // Handle topic selection
  const handleTopicSelect = (topic) => {
    if (isRunning) return; // Can't change topic while timer is running
    
    setSelectedTopic(topic);
  };
  
  // Start the stopwatch
  const startStopwatch = () => {
    if (!selectedUser || !selectedTopic) return;
    
    if (!isRunning) {
      // Starting the timer
      const now = Date.now();
      
      if (!startTime) {
        // First start
        setStartTime(now);
      } else if (pauseStartTime) {
        // Resuming from pause
        // Add the paused time to the total
        const additionalPausedTime = now - pauseStartTime;
        setPausedTime(prev => prev + additionalPausedTime);
        setPauseStartTime(null);
      }
      
      setIsRunning(true);
    } else {
      // Pausing the timer
      setPauseStartTime(Date.now());
      setIsRunning(false);
    }
  };
  
  // Stop the stopwatch and record the session
  const stopStopwatch = () => {
    if (!selectedUser || !selectedTopic || !startTime) return;
    
    // Calculate final times
    const activeTime = Date.now() - startTime - pausedTime;
    
    // Save the session
    addSession({
      user: selectedUser,
      topic: selectedTopic,
      activeTime,
      pausedTime,
      username: USERS.find(u => u.id === selectedUser)?.name || selectedUser
    });
    
    // Reset the stopwatch
    resetStopwatch();
  };
  
  // Reset the stopwatch without saving
  const resetStopwatch = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setPausedTime(0);
    setStartTime(null);
    setPauseStartTime(null);
  };
  
  // Handle delete session
  const handleDeleteSession = (session) => {
    setSessionToDelete(session);
    setDeleteModalOpen(true);
  };
  
  // Confirm delete session
  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };
  
  // Confirm clear all sessions
  const confirmClearAllSessions = () => {
    clearAllSessions();
    setClearModalOpen(false);
  };
  
  // Export sessions as CSV
  const exportSessionsCSV = () => {
    const csvRows = [];
    
    // Header row
    csvRows.push(['Date', 'User', 'Topic', 'Active Time (ms)', 'Paused Time (ms)', 'Active Time', 'Paused Time'].join(','));
    
    // Data rows
    filteredSessions.forEach(session => {
      const row = [
        format(new Date(session.date), 'yyyy-MM-dd HH:mm:ss'),
        session.username,
        session.topic,
        session.activeTime,
        session.pausedTime,
        formatTime(session.activeTime),
        formatTime(session.pausedTime)
      ];
      
      csvRows.push(row.join(','));
    });
    
    // Create CSV content
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    
    // Download the CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stopwatch-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Update the timer display
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        const currentElapsed = Date.now() - startTime - pausedTime;
        setElapsedTime(currentElapsed);
      }, 100); // Update every 100ms for smoother display
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, startTime, pausedTime]);
  
  // Get user's color
  const getUserStyleColor = (userId) => {
    const user = USERS.find(u => u.id === userId);
    return user ? user.color : '#cccccc';
  };
  
  return (
    <div className="container mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-bold text-text-primary">Stopwatch</h1>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => setClearModalOpen(true)}
            icon={<FaTrash />}
            disabled={sessions.length === 0}
          >
            Clear All
          </Button>
          
          <Button
            variant="outline"
            size="small"
            onClick={exportSessionsCSV}
            icon={<FaDownload />}
            disabled={filteredSessions.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </motion.div>
      
      {/* User Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6 grid grid-cols-2 gap-4"
      >
        {USERS.map(user => (
          <motion.div
            key={user.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ 
              scale: selectedUser === user.id ? 1.05 : 1, 
              opacity: 1,
              borderColor: selectedUser === user.id ? user.color : 'transparent'
            }}
            transition={{ duration: 0.2 }}
            onClick={() => handleUserSelect(user.id)}
            className={`
              bg-background-light rounded-xl p-6 cursor-pointer
              text-center shadow-soft border-4 hover:border-opacity-50
              ${selectedUser === user.id ? 'border-opacity-100' : 'border-opacity-0'}
            `}
            style={{ borderColor: user.color }}
          >
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${user.color}30` }}
            >
              <FaUserAlt style={{ color: user.color }} size={30} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{user.name}</h2>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Topic selection and Stopwatch */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6 grid md:grid-cols-2 gap-6"
        >
          {/* Topic selection */}
          <div className="bg-background-light rounded-xl p-6 shadow-soft">
            <h2 className="text-lg font-bold text-text-primary mb-4">Select Topic</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className={`
                    py-3 px-4 rounded-lg text-text-primary
                    ${selectedTopic === topic.id 
                      ? 'bg-primary bg-opacity-20 border-2 border-primary' 
                      : 'bg-background border-2 border-transparent hover:border-background-dark'}
                  `}
                  disabled={isRunning}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Stopwatch display */}
          <div 
            className="bg-background-light rounded-xl p-6 shadow-soft flex flex-col items-center"
            style={{ 
              borderLeft: `4px solid ${getUserStyleColor(selectedUser)}` 
            }}
          >
            <div className="flex items-center mb-4">
              <FaClock className="mr-2" style={{ color: getUserStyleColor(selectedUser) }} />
              <h2 className="text-lg font-bold text-text-primary">
                {USERS.find(u => u.id === selectedUser)?.name}'s Stopwatch
              </h2>
            </div>
            
            <div 
              className="text-4xl font-bold mb-4"
              style={{ color: getUserStyleColor(selectedUser) }}
            >
              {formatTime(elapsedTime)}
            </div>
            
            <div className="text-sm text-text-muted mb-6">
              Paused time: {formatTime(pausedTime)}
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={startStopwatch}
                variant="primary"
                icon={isRunning ? <FaPause /> : <FaPlay />}
                disabled={!selectedTopic}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              
              <Button
                onClick={stopStopwatch}
                variant="danger"
                icon={<FaStop />}
                disabled={!startTime}
              >
                Stop & Save
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Session history */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-background-light rounded-xl p-6 shadow-soft"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text-primary">Session History</h2>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={filterUser || ''}
                onChange={(e) => setFilterUser(e.target.value || null)}
                className="bg-background border border-background-light rounded-lg py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">All Users</option>
                {USERS.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            </div>
            
            <div className="relative">
              <select
                value={filterTopic || ''}
                onChange={(e) => setFilterTopic(e.target.value || null)}
                className="bg-background border border-background-light rounded-lg py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">All Topics</option>
                {TOPICS.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-background">
            <thead className="bg-background-dark">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Topic
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Active Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Paused Time
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background-light divide-y divide-background">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-text-muted">
                    No sessions found. Start the timer to record a session.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, index) => {
                  const userColor = getUserStyleColor(session.user);
                  
                  return (
                    <tr 
                      key={session.id}
                      className={`${index % 2 === 0 ? 'bg-background-light' : 'bg-background'} 
                        hover:bg-background-dark transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {format(new Date(session.date), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm px-2 py-1 rounded-full inline-flex items-center"
                          style={{ 
                            backgroundColor: `${userColor}20`, 
                            color: userColor 
                          }}
                        >
                          <FaUserAlt className="mr-1" size={10} />
                          {session.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {session.topic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {formatTime(session.activeTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {formatTime(session.pausedTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDeleteSession(session)}
                          className="p-1.5 text-text-secondary hover:text-accent rounded-full hover:bg-background transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="small"
      >
        <p className="mb-6 text-text-primary">
          Are you sure you want to delete this session? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            onClick={confirmDeleteSession}
          >
            Delete
          </Button>
        </div>
      </Modal>
      
      {/* Clear all confirmation modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear All Sessions"
        size="small"
      >
        <p className="mb-6 text-text-primary">
          Are you sure you want to delete all sessions? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setClearModalOpen(false)}
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            onClick={confirmClearAllSessions}
          >
            Clear All
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StopwatchPage;
