import React, { createContext, useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import { eventService, todoService } from '../services/apiService';
import { AuthContext } from './AuthContext';

export const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  // Load from API when authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Fetch events and todos in parallel
          const [eventsResponse, todosResponse] = await Promise.all([
            eventService.getEvents(),
            todoService.getTodos()
          ]);
          
          setEvents(eventsResponse.data);
          setTodos(todosResponse.data);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Not authenticated, so not loading
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);

  // Event methods
  const addEvent = async (event) => {
    try {
      const response = await eventService.createEvent(event);
      const newEvent = response.data;
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Error adding event:', err);
      throw err;
    }
  };

  const updateEvent = async (id, updates) => {
    try {
      const response = await eventService.updateEvent(id, updates);
      const updatedEvent = response.data;
      setEvents(prev => 
        prev.map(event => event.id === id ? updatedEvent : event)
      );
      return updatedEvent;
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await eventService.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  };

  const getEventsByDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return events.filter(event => {
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      return eventDate === formattedDate;
    });
  };

  // Todo methods
  const addTodo = async (todo) => {
    try {
      const response = await todoService.createTodo(todo);
      const newTodo = response.data;
      setTodos(prev => [...prev, newTodo]);
      return newTodo;
    } catch (err) {
      console.error('Error adding todo:', err);
      throw err;
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await todoService.updateTodo(id, updates);
      const updatedTodo = response.data;
      setTodos(prev => 
        prev.map(todo => todo.id === id ? updatedTodo : todo)
      );
      return updatedTodo;
    } catch (err) {
      console.error('Error updating todo:', err);
      throw err;
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      throw err;
    }
  };

  const toggleTodoComplete = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      const updates = { 
        completed: !todo.completed,
        status: !todo.completed ? 'completed' : 'not-started'
      };
      
      await updateTodo(id, updates);
    } catch (err) {
      console.error('Error toggling todo completion:', err);
      throw err;
    }
  };

  // Get user color based on username
  const getUserColor = (username) => {
    if (!username) return '#4A5CDB'; // Default color
    
    // If it's the current user, return primary color
    if (currentUser && username === currentUser.username) {
      return '#4A5CDB'; // primary color
    }
    
    // Otherwise, map username to a consistent color using hash
    const hash = Array.from(username).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    
    // List of colors (except primary blue which is reserved for current user)
    const colors = [
      '#FF6B6B', // accent red
      '#8A2BE2', // secondary purple
      '#00C896', // teal
      '#FFB347', // orange
      '#B19CD9'  // lavender
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // FIXED: Always render children and pass loading/error state through the context
  return (
    <CalendarContext.Provider value={{ 
      events, 
      todos,
      isLoading,
      error,
      addEvent,
      updateEvent,
      deleteEvent,
      getEventsByDate,
      addTodo,
      updateTodo,
      deleteTodo,
      toggleTodoComplete,
      getUserColor
    }}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarProvider;
