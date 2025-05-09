import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSave,
  FaArrowLeft,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaHeading,
  FaImage,
  FaLink,
  FaPlus,
  FaCheck,
  FaTrash
} from 'react-icons/fa';
import { WritingContext } from '../contexts/WritingContext';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const WritingEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWritingById, addWriting, updateWriting, addTodo, updateTodo, deleteTodo } = useContext(WritingContext);
  const { currentUser } = useContext(AuthContext);
  
  const isNewWriting = !id;
  
  // State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [todoText, setTodoText] = useState('');
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [writingId, setWritingId] = useState(id);
  const [todos, setTodos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs
  const editorRef = useRef(null);
  const todoInputRef = useRef(null);
  
  // Load writing data if editing existing writing
  useEffect(() => {
    if (!isNewWriting) {
      const writing = getWritingById(id);
      
      if (writing) {
        setTitle(writing.title || '');
        setContent(writing.content || '');
        setTodos(writing.todos || []);
        setWritingId(writing.id);
      } else {
        // Writing not found, redirect to writing list
        navigate('/writing');
      }
    } else {
      // New writing defaults
      setTitle('');
      setContent('<p>Start writing here...</p>');
      setTodos([]);
    }
  }, [id, isNewWriting, getWritingById, navigate]);
  
  // Set up editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      
      // Make editor editable
      editorRef.current.contentEditable = true;
      
      // Listen for changes
      const handleInput = () => {
        setContent(editorRef.current.innerHTML);
        setIsUnsaved(true);
      };
      
      editorRef.current.addEventListener('input', handleInput);
      
      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener('input', handleInput);
        }
      };
    }
  }, [content]);
  
  // Handle save
  const handleSave = () => {
    setIsSaving(true);
    
    try {
      const writingData = {
        title,
        content,
        todos
      };
      
      if (isNewWriting) {
        const newWriting = addWriting(writingData);
        setWritingId(newWriting.id);
        navigate(`/writing/edit/${newWriting.id}`, { replace: true });
      } else {
        updateWriting(writingId, writingData);
      }
      
      setIsUnsaved(false);
    } catch (error) {
      console.error('Error saving writing:', error);
      // Show error notification
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add todo to the writing
  const handleAddTodo = (e) => {
    e.preventDefault();
    
    if (!todoText.trim()) return;
    
    if (isNewWriting) {
      // For a new writing, add to local state first
      const newTodo = {
        id: Date.now().toString(),
        text: todoText,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      setTodos([...todos, newTodo]);
    } else {
      // For an existing writing, use the context method
      const newTodo = addTodo(writingId, todoText);
      
      if (newTodo) {
        setTodos([...todos, newTodo]);
      }
    }
    
    setTodoText('');
    todoInputRef.current?.focus();
    setIsUnsaved(true);
  };
  
  // Toggle todo completion
  const toggleTodoCompleted = (todoId) => {
    const todoToUpdate = todos.find(todo => todo.id === todoId);
    
    if (!todoToUpdate) return;
    
    const newCompletedState = !todoToUpdate.completed;
    
    if (isNewWriting) {
      // Update local state for new writing
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, completed: newCompletedState } : todo
      ));
    } else {
      // Update via context for existing writing
      updateTodo(writingId, todoId, { completed: newCompletedState });
      
      // Also update local state for immediate UI update
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, completed: newCompletedState } : todo
      ));
    }
    
    setIsUnsaved(true);
  };
  
  // Delete todo
  const handleDeleteTodo = (todoId) => {
    if (isNewWriting) {
      // Update local state for new writing
      setTodos(todos.filter(todo => todo.id !== todoId));
    } else {
      // Delete via context for existing writing
      deleteTodo(writingId, todoId);
      
      // Also update local state for immediate UI update
      setTodos(todos.filter(todo => todo.id !== todoId));
    }
    
    setIsUnsaved(true);
  };
  
  // Text formatting functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsUnsaved(true);
      editorRef.current.focus();
    }
  };
  
  // Insert image
  const insertImage = () => {
    const imageUrl = prompt('Enter image URL:');
    
    if (imageUrl) {
      formatText('insertHTML', `<img src="${imageUrl}" alt="Inserted image" style="max-width: 100%; height: auto; margin: 10px 0;" />`);
    }
  };
  
  // Insert link
  const insertLink = () => {
    const linkUrl = prompt('Enter URL:');
    const linkText = prompt('Enter link text:') || linkUrl;
    
    if (linkUrl) {
      formatText('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
    }
  };
  
  // Confirm navigate away if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isUnsaved]);
  
  return (
    <div className="container mx-auto pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate('/writing')}
            icon={<FaArrowLeft />}
            className="mr-4"
          >
            Back
          </Button>
          
          <Input
            type="text"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsUnsaved(true);
            }}
            className="text-xl font-bold"
          />
        </div>
        
        <Button
          onClick={handleSave}
          icon={<FaSave />}
          disabled={isSaving || !title.trim()}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </motion.div>
      
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-background-dark rounded-lg p-2 mb-4 flex items-center flex-wrap"
      >
        <div className="flex items-center">
          <button 
            onClick={() => formatText('bold')}
            className="p-2 rounded hover:bg-background-light text-text-primary"
            title="Bold"
          >
            <FaBold />
          </button>
          
          <button 
            onClick={() => formatText('italic')}
            className="p-2 rounded hover:bg-background-light text-text-primary"
            title="Italic"
          >
            <FaItalic />
          </button>
          
          <button 
            onClick={() => formatText('underline')}
            className="p-2 rounded hover:bg-background-light text-text-primary"
            title="Underline"
          >
            <FaUnderline />
          </button>
          
          <div className="h-6 w-px bg-background-light mx-2"></div>
          
          <button 
            onClick={() => formatText('insertUnorderedList')}
            className="p-2 rounded hover:bg-background-light text-text-primary"
            title="Bullet List"
          >
            <FaListUl />
          </button>
          
          <button 
            onClick={() => formatText('insertOrderedList')}
            className="p-2 rounded hover:bg-background-light text-text-primary"
            title="Numbered List"
          >
            <FaListOl />
          </button>
          
          <div className="h-6 w-px bg-background-light mx-2"></div>
          
          <div className="relative">
            <button 
              onClick={() => formatText('formatBlock', '<h1>')}
              className="p-2 rounded hover:bg-background-light text-text-primary"
              title="Heading"
            >
              <FaHeading />
            </button>
          </div>
          
          <div className="h-6 w-px bg-background-light mx-2"></div>
          
          <button 
            onClick={insertImage}
            className="p-2 rounded hover:bg-background-light text-text-primary"
            title="Insert Image"
          >
            <FaImage />
          </button>
          
          <button 
            onClick={insertLink}
            className="p-2 rounded hover:bg-background-light text-text-primary"
            title="Insert Link"
          >
            <FaLink />
          </button>
        </div>
      </motion.div>
      
      {/* Editor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-background-light rounded-lg p-6 mb-6 min-h-[400px] shadow-soft"
      >
        <div 
          ref={editorRef}
          className="focus:outline-none min-h-[400px] prose prose-invert prose-headings:text-text-primary prose-p:text-text-secondary max-w-none"
        >
          {/* Content will be set via ref */}
        </div>
      </motion.div>
      
      {/* Todo section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-background-light rounded-lg p-6 shadow-soft"
      >
        <h2 className="text-lg font-bold text-text-primary mb-4">Tasks</h2>
        
        {/* Todo form */}
        <form onSubmit={handleAddTodo} className="flex mb-4">
          <Input
            ref={todoInputRef}
            type="text"
            placeholder="Add a new task..."
            value={todoText}
            onChange={(e) => setTodoText(e.target.value)}
            className="flex-1"
          />
          
          <Button
            type="submit"
            icon={<FaPlus />}
            className="ml-2"
            disabled={!todoText.trim()}
          >
            Add
          </Button>
        </form>
        
        {/* Todo list */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <p className="text-text-muted text-center py-4">No tasks yet. Add one above.</p>
          ) : (
            todos.map(todo => (
              <div 
                key={todo.id}
                className={`flex items-center p-3 rounded-lg ${
                  todo.completed ? 'bg-background-dark opacity-70' : 'bg-background'
                }`}
              >
                <button
                  onClick={() => toggleTodoCompleted(todo.id)}
                  className={`w-5 h-5 rounded-full flex-shrink-0 mr-3 flex items-center justify-center ${
                    todo.completed 
                      ? 'bg-primary text-white' 
                      : 'border-2 border-primary'
                  }`}
                >
                  {todo.completed && <FaCheck className="text-xs" />}
                </button>
                
                <p className={`flex-1 ${todo.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                  {todo.text}
                </p>
                
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="p-1.5 text-text-secondary hover:text-accent rounded-full hover:bg-background-dark transition-colors ml-2"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WritingEditor;
