import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const WritingContext = createContext();

export const WritingProvider = ({ children }) => {
  const [writings, setWritings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  // Load writings from localStorage on mount
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        setError(null);
        
        try {
          // In a real app, this would fetch from an API
          // For now, we'll use localStorage
          const storedWritings = localStorage.getItem('writings');
          
          if (storedWritings) {
            setWritings(JSON.parse(storedWritings));
          } else {
            // Sample writing for demo
            const sampleWritings = [
              {
                id: uuidv4(),
                title: 'Getting Started with React',
                content: '<h1>Getting Started with React</h1><p>React is a popular JavaScript library for building user interfaces.</p><h2>Prerequisites</h2><p>Before you begin, you should have a basic understanding of HTML, CSS, and JavaScript.</p>',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: currentUser?.username || 'Admin',
                todos: [
                  { id: uuidv4(), text: 'Learn React Hooks', completed: false },
                  { id: uuidv4(), text: 'Build a sample project', completed: false }
                ]
              }
            ];
            
            setWritings(sampleWritings);
            localStorage.setItem('writings', JSON.stringify(sampleWritings));
          }
        } catch (err) {
          console.error('Error fetching writings:', err);
          setError('Failed to load writings. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, currentUser]);

  // Save to localStorage whenever writings change
  useEffect(() => {
    if (writings.length > 0) {
      localStorage.setItem('writings', JSON.stringify(writings));
    }
  }, [writings]);

  // CRUD operations for writings
  const addWriting = (writingData) => {
    const newWriting = {
      id: uuidv4(),
      ...writingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser?.username || 'Admin',
      todos: writingData.todos || []
    };
    
    setWritings(prev => [...prev, newWriting]);
    return newWriting;
  };

  const updateWriting = (id, updates) => {
    const updatedWritings = writings.map(writing => {
      if (writing.id === id) {
        return {
          ...writing,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return writing;
    });
    
    setWritings(updatedWritings);
    return updatedWritings.find(writing => writing.id === id);
  };

  const deleteWriting = (id) => {
    setWritings(prev => prev.filter(writing => writing.id !== id));
  };

  const getWritingById = (id) => {
    return writings.find(writing => writing.id === id) || null;
  };

  // Todo operations within a writing
  const addTodo = (writingId, todoText) => {
    const writing = getWritingById(writingId);
    
    if (!writing) return null;
    
    const newTodo = {
      id: uuidv4(),
      text: todoText,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedTodos = [...(writing.todos || []), newTodo];
    
    updateWriting(writingId, { todos: updatedTodos });
    
    return newTodo;
  };

  const updateTodo = (writingId, todoId, updates) => {
    const writing = getWritingById(writingId);
    
    if (!writing || !writing.todos) return null;
    
    const updatedTodos = writing.todos.map(todo => {
      if (todo.id === todoId) {
        return { ...todo, ...updates };
      }
      return todo;
    });
    
    updateWriting(writingId, { todos: updatedTodos });
  };

  const deleteTodo = (writingId, todoId) => {
    const writing = getWritingById(writingId);
    
    if (!writing || !writing.todos) return;
    
    const updatedTodos = writing.todos.filter(todo => todo.id !== todoId);
    
    updateWriting(writingId, { todos: updatedTodos });
  };

  return (
    <WritingContext.Provider value={{
      writings,
      isLoading,
      error,
      addWriting,
      updateWriting,
      deleteWriting,
      getWritingById,
      addTodo,
      updateTodo,
      deleteTodo
    }}>
      {children}
    </WritingContext.Provider>
  );
};

export default WritingProvider;
