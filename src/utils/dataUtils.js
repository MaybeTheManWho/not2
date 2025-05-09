import {
    format,
    parseISO,
    isToday,
    isTomorrow,
    isThisWeek,
    isThisMonth,
    differenceInDays,
    differenceInMinutes,
    addDays
  } from 'date-fns';
  
  /**
   * Format a date string to a human-readable format
   * @param {string} dateString - ISO date string
   * @param {string} formatStr - date-fns format string
   * @returns {string} - Formatted date string
   */
  export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
    try {
      const date = parseISO(dateString);
      return format(date, formatStr);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  /**
   * Get a human-readable relative date string
   * @param {string} dateString - ISO date string
   * @returns {string} - Relative date string (e.g., "Today", "Tomorrow", "3 days ago")
   */
  export const getRelativeDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      
      if (isToday(date)) {
        return 'Today';
      }
      
      if (isTomorrow(date)) {
        return 'Tomorrow';
      }
      
      const diffDays = differenceInDays(date, now);
      
      if (diffDays < 0) {
        return Math.abs(diffDays) === 1 
          ? 'Yesterday' 
          : `${Math.abs(diffDays)} days ago`;
      }
      
      if (diffDays < 7) {
        return `In ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
      }
      
      if (isThisWeek(date)) {
        return `This week - ${format(date, 'EEE')}`;
      }
      
      if (isThisMonth(date)) {
        return `This month - ${format(date, 'MMM d')}`;
      }
      
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error getting relative date:', error);
      return 'Invalid date';
    }
  };
  
  /**
   * Get time remaining until a date
   * @param {string} dateString - ISO date string
   * @returns {string} - Time remaining (e.g., "2 hours", "30 minutes")
   */
  export const getTimeRemaining = (dateString) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      
      if (date < now) {
        return 'Past due';
      }
      
      const diffMinutes = differenceInMinutes(date, now);
      
      if (diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`;
      }
      
      const hours = Math.floor(diffMinutes / 60);
      if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      }
      
      const days = Math.floor(hours / 24);
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    } catch (error) {
      console.error('Error getting time remaining:', error);
      return 'Invalid date';
    }
  };
  
  /**
   * Check if a date is overdue
   * @param {string} dateString - ISO date string
   * @returns {boolean} - True if date is in the past
   */
  export const isOverdue = (dateString) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      return date < now;
    } catch (error) {
      console.error('Error checking if date is overdue:', error);
      return false;
    }
  };
  
  /**
   * Get dates for the next 7 days
   * @returns {Array} - Array of date objects for the next 7 days
   */
  export const getNextSevenDays = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(today, i));
    }
    
    return dates;
  };
  
  /**
   * Parse a natural language date string
   * This is a simple implementation - a real app would use a more sophisticated library
   * @param {string} dateStr - Natural language date string (e.g., "tomorrow", "next week")
   * @returns {Date|null} - Date object or null if parsing failed
   */
  export const parseNaturalDate = (dateStr) => {
    const lowercaseStr = dateStr.toLowerCase().trim();
    const today = new Date();
    
    // Handle common phrases
    if (lowercaseStr === 'today') {
      return today;
    }
    
    if (lowercaseStr === 'tomorrow') {
      return addDays(today, 1);
    }
    
    if (lowercaseStr === 'next week') {
      return addDays(today, 7);
    }
    
    // Try standard date parsing for other formats
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing natural date:', error);
    }
    
    return null;
  };