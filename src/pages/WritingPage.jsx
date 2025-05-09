import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUser,
  FaCheck,
  FaTasks
} from 'react-icons/fa';
import { WritingContext } from '../contexts/WritingContext';
import { AuthContext } from '../contexts/AuthContext';
import { CalendarContext } from '../contexts/CalendarContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const WritingPage = () => {
  const { writings, deleteWriting } = useContext(WritingContext);
  const { currentUser } = useContext(AuthContext);
  const { getUserColor } = useContext(CalendarContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [writingToDelete, setWritingToDelete] = useState(null);
  
  const navigate = useNavigate();
  
  // Filter writings based on search query
  const filteredWritings = writings.filter(writing => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      writing.title.toLowerCase().includes(searchLower) ||
      writing.content.toLowerCase().includes(searchLower)
    );
  });
  
  // Sort writings by updatedAt, newest first
  const sortedWritings = [...filteredWritings].sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
  
  // Confirm and handle deletion
  const handleDeleteClick = (writing) => {
    setWritingToDelete(writing);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDelete = () => {
    if (writingToDelete) {
      deleteWriting(writingToDelete.id);
      setDeleteConfirmOpen(false);
      setWritingToDelete(null);
    }
  };
  
  // Get the excerpt of content (first few words)
  const getExcerpt = (content, maxLength = 100) => {
    // Strip HTML tags
    const textOnly = content.replace(/<[^>]*>/g, ' ');
    
    if (textOnly.length <= maxLength) return textOnly;
    
    return textOnly.substring(0, maxLength) + '...';
  };
  
  // Calculate todo stats
  const getTodoStats = (todos) => {
    if (!todos || todos.length === 0) return { total: 0, completed: 0 };
    
    const completed = todos.filter(todo => todo.completed).length;
    return {
      total: todos.length,
      completed
    };
  };
  
  return (
    <div className="container mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-text-primary mb-2 md:mb-0">Writing</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Search writings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          </div>
          
          <Link to="/writing/new">
            <Button 
              icon={<FaPlus />}
            >
              New Writing
            </Button>
          </Link>
        </motion.div>
      </div>
      
      {/* Writing grid */}
      {sortedWritings.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-background-light p-8 rounded-lg inline-block">
            <FaEdit className="text-4xl text-primary mx-auto mb-3 opacity-50" />
            <h3 className="text-xl font-medium text-text-primary mb-2">
              No writings found
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              {searchQuery
                ? "Try a different search term"
                : "Click the 'New Writing' button to create your first writing"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWritings.map(writing => {
            const userColor = getUserColor(writing.author);
            const isCurrentUserWriting = currentUser && writing.author === currentUser.username;
            const todoStats = getTodoStats(writing.todos);
            
            return (
              <motion.div
                key={writing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="bg-background-light rounded-xl shadow-soft overflow-hidden flex flex-col"
                style={{ borderTop: `4px solid ${userColor}` }}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-text-primary">{writing.title}</h2>
                    
                    {isCurrentUserWriting && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/writing/edit/${writing.id}`)}
                          className="p-1.5 text-text-secondary hover:text-primary rounded-full hover:bg-background transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(writing)}
                          className="p-1.5 text-text-secondary hover:text-accent rounded-full hover:bg-background transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-text-secondary text-sm">
                      {getExcerpt(writing.content)}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-xs text-text-muted mt-4">
                    <div 
                      className="flex items-center px-2 py-1 rounded-full mr-3"
                      style={{ 
                        backgroundColor: `${userColor}20`, 
                        color: userColor 
                      }}
                    >
                      <FaUser className="mr-1" size={10} />
                      <span>{writing.author}</span>
                      {isCurrentUserWriting && <span className="ml-1">(me)</span>}
                    </div>
                    
                    <div className="flex items-center">
                      <FaEdit className="mr-1" />
                      <span>{format(new Date(writing.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background-dark px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FaTasks className="text-text-muted mr-2" />
                    <span className="text-text-muted text-sm">
                      {todoStats.completed}/{todoStats.total} Tasks
                    </span>
                  </div>
                  
                  <Link to={`/writing/edit/${writing.id}`}>
                    <Button
                      variant="ghost"
                      size="small"
                    >
                      Open
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Deletion"
        size="small"
      >
        <p className="mb-6 text-text-primary">
          Are you sure you want to delete "{writingToDelete?.title}"? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirmOpen(false)}
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default WritingPage;
