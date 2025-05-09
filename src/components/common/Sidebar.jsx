import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaListUl,
  FaCog,
  FaLayerGroup,
  FaEdit,
  FaStopwatch
} from 'react-icons/fa';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome /> },
    { path: '/todo', label: 'To-Do List', icon: <FaListUl /> },
    { path: '/calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
    { path: '/assets', label: 'Assets', icon: <FaLayerGroup /> },
    { path: '/writing', label: 'Writing', icon: <FaEdit /> },
    { path: '/stopwatch', label: 'Stopwatch', icon: <FaStopwatch /> },
  ];
  
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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <aside className="w-64 bg-background-light flex-shrink-0 hidden md:block">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="ml-3 text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Dashboard
            </span>
          </motion.div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-3 py-4">
          <motion.nav
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <ul className="space-y-2">
              {navItems.map((item) => (
                <motion.li key={item.path} variants={itemVariants}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        </div>
        
        {/* Bottom section */}
        <div className="p-4 border-t border-background">
          <NavLink to="/settings" className="sidebar-link">
            <FaCog />
            <span>Settings</span>
          </NavLink>
          
          <div className="mt-6 px-4">
            <div className="bg-background rounded-lg p-3 shadow-inner-soft">
              <h4 className="text-sm font-medium text-text-primary mb-2">Storage</h4>
              <div className="w-full bg-background-dark rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-xs text-text-muted mt-2">25% of free storage used</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
