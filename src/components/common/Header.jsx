import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Header = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  
  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/todo') return 'To-Do List';
    if (path === '/calendar') return 'Calendar';
    if (path === '/assets') return 'Asset Library';
    if (path === '/writing') return 'Writing';
    if (path.includes('/writing/new')) return 'New Writing';
    if (path.includes('/writing/edit')) return 'Edit Writing';
    if (path === '/stopwatch') return 'Stopwatch';
    
    return 'Dashboard';
  };

  return (
    <header className="bg-background-light shadow-sm py-3 px-6">
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl font-semibold text-text-primary">{getPageTitle()}</h1>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-background border border-background-light rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm" />
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="small"
              onClick={logout}
              icon={<FaSignOutAlt />}
            >
              Logout
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;
