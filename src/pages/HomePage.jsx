import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FaCalendarAlt, 
  FaListUl, 
  FaClock,
  FaChartLine,
  FaLightbulb
} from 'react-icons/fa';
import { CalendarContext } from '../contexts/CalendarContext';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { events, todos } = useContext(CalendarContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get today's date
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM do, yyyy');
  
  // Filter events for today
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });
  
  // Get incomplete todos
  const incompleteTodos = todos.filter(todo => !todo.completed);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="container mx-auto">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
        <div className="flex items-center mt-2">
          <FaCalendarAlt className="text-primary mr-2" />
          <p className="text-text-secondary">{formattedDate}</p>
          <div className="mx-3 w-1 h-1 bg-text-muted rounded-full"></div>
          <FaClock className="text-primary mr-2" />
          <p className="text-text-secondary">{format(currentTime, 'h:mm a')}</p>
        </div>
      </motion.div>
      
      {/* Dashboard grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Today's events */}
        <motion.div variants={itemVariants} className="card col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Today's Events</h2>
            <FaCalendarAlt className="text-primary" />
          </div>
          
          <div className="space-y-3">
            {todayEvents.length > 0 ? (
              todayEvents.map(event => (
                <div key={event.id} className="flex items-center p-3 bg-background rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                    <img 
                      src={`/assets/photo${event.imageIndex || 1}.png`}
                      alt={event.title}
                      className="w-6 h-6 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/assets/photo1.png`;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{event.title}</h3>
                    <p className="text-sm text-text-muted">
                      {format(new Date(event.date), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-text-muted">
                <p>No events scheduled for today</p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <Link to="/calendar">
              <Button variant="outline" className="w-full">
                View Calendar
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Todo list */}
        <motion.div variants={itemVariants} className="card col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
            <FaListUl className="text-primary" />
          </div>
          
          <div className="space-y-3">
            {incompleteTodos.length > 0 ? (
              incompleteTodos.slice(0, 5).map(todo => (
                <div key={todo.id} className="flex items-center p-3 bg-background rounded-lg">
                  <div className="w-5 h-5 border-2 border-primary rounded-full mr-3 flex-shrink-0"></div>
                  <p className="text-text-primary">{todo.title}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-text-muted">
                <p>No pending tasks</p>
              </div>
            )}
            
            {incompleteTodos.length > 5 && (
              <div className="text-center text-sm text-text-muted">
                <p>+{incompleteTodos.length - 5} more tasks</p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <Link to="/todo">
              <Button variant="outline" className="w-full">
                View All Tasks
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Stats and tips */}
        <motion.div variants={itemVariants} className="card col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Stats</h2>
            <FaChartLine className="text-primary" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background p-4 rounded-lg">
              <p className="text-text-muted text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{todos.length}</p>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-text-muted text-sm">Completed</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {todos.filter(t => t.completed).length}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Tips</h2>
              <FaLightbulb className="text-primary" />
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-text-secondary">
                Use the AI assistant by clicking the icon in the bottom right to manage your tasks and events with natural language.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;