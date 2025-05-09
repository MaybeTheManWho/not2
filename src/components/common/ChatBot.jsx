import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoChevronUp, IoSparkles } from 'react-icons/io5';
import { CalendarContext } from '../../contexts/CalendarContext';
import Button from '../ui/Button';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your AI assistant. I can help you manage your tasks and calendar events. What can I do for you today?", 
      sender: 'ai' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { addTodo, addEvent } = useContext(CalendarContext);
  
  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process the message (in a real app, this would call the AI API)
    const response = await processMessage(input);
    
    // Hide typing indicator and add AI response
    setIsTyping(false);
    
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      text: response.message,
      sender: 'ai',
      action: response.action
    }]);
  };
  
  // Process message and generate AI response
  // In a real app, this would call the deepseek API
  const processMessage = async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMsg = message.toLowerCase();
    
    // Check for adding a todo
    if (lowerMsg.includes('add task') || lowerMsg.includes('add todo') || lowerMsg.includes('create task')) {
      const taskMatch = message.match(/add (?:task|todo):?\s*(.+)/i) || 
                         message.match(/create (?:task|todo):?\s*(.+)/i);
      
      if (taskMatch && taskMatch[1]) {
        const taskTitle = taskMatch[1].trim();
        const newTodo = addTodo({ title: taskTitle });
        
        return {
          message: `I've added "${taskTitle}" to your todo list! Is there anything else you'd like me to do?`,
          action: {
            type: 'ADD_TODO',
            data: newTodo
          }
        };
      }
    }
    
    // Check for adding an event
    if (lowerMsg.includes('add event') || lowerMsg.includes('schedule') || lowerMsg.includes('create event')) {
      // This is a simplified parser - in a real app we would use NLP for better extraction
      const eventMatch = message.match(/(?:add event|schedule|create event):?\s*(.+?)(?:\s+on\s+|\s+for\s+)(.+)/i);
      
      if (eventMatch && eventMatch[1] && eventMatch[2]) {
        const eventTitle = eventMatch[1].trim();
        const eventDateStr = eventMatch[2].trim();
        
        // Simple date parsing - would be more sophisticated in real app
        let eventDate;
        try {
          if (eventDateStr.toLowerCase() === 'today') {
            eventDate = new Date();
          } else if (eventDateStr.toLowerCase() === 'tomorrow') {
            eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + 1);
          } else {
            eventDate = new Date(eventDateStr);
          }
          
          // Check if date is valid
          if (isNaN(eventDate.getTime())) {
            return {
              message: `I'm not sure about that date. Could you try again with a format like "tomorrow" or "May 15, 2025"?`
            };
          }
          
          const newEvent = addEvent({
            title: eventTitle,
            date: eventDate.toISOString(),
            imageIndex: Math.floor(Math.random() * 4) + 1 // Random image 1-4
          });
          
          return {
            message: `Great! I've added "${eventTitle}" to your calendar for ${eventDate.toLocaleDateString()}. Anything else you'd like to add?`,
            action: {
              type: 'ADD_EVENT',
              data: newEvent
            }
          };
        } catch (error) {
          return {
            message: `I had trouble understanding that date format. Could you try again with something like "tomorrow" or "May 15, 2025"?`
          };
        }
      }
    }
    
    // Default responses
    const defaultResponses = [
      "I can help you manage your tasks and calendar. Try saying something like 'Add task: Buy groceries' or 'Schedule meeting with John on tomorrow'.",
      "I'm your personal assistant. I can add tasks to your todo list or events to your calendar. What would you like me to help with?",
      "Not sure what you mean. You can ask me to 'add task: finish report' or 'create event: lunch with Amy on Friday'."
    ];
    
    return {
      message: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
    };
  };

  return (
    <>
      {/* Chat toggle button */}
      <motion.div
        className="fixed right-6 bottom-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      >
        <Button
          onClick={toggleChat}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${isOpen ? 'bg-accent hover:bg-accent-dark' : 'bg-primary hover:bg-primary-dark'}`}
        >
          {isOpen ? (
            <IoClose className="text-white text-xl" />
          ) : (
            <IoSparkles className="text-white text-xl" />
          )}
        </Button>
      </motion.div>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-6 bottom-24 z-30 w-96 max-w-full rounded-xl shadow-xl bg-background-light overflow-hidden"
          >
            {/* Chat header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <IoSparkles className="text-white text-sm" />
                </div>
                <span className="ml-3 font-medium text-white">AI Assistant</span>
              </div>
              <button 
                onClick={toggleChat}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <IoChevronUp className="text-white" />
              </button>
            </div>
            
            {/* Messages container */}
            <div className="h-96 overflow-y-auto p-4 bg-background">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[80%] rounded-lg p-3 
                      ${message.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-background-light text-text-primary'
                      }
                    `}
                  >
                    <p>{message.text}</p>
                    
                    {/* If there's an action confirmation */}
                    {message.action && message.action.type === 'ADD_TODO' && (
                      <div className="mt-2 p-2 bg-background-dark rounded-md text-sm">
                        <span className="font-medium">Added to To-Do List:</span>
                        <div className="mt-1">{message.action.data.title}</div>
                      </div>
                    )}
                    
                    {message.action && message.action.type === 'ADD_EVENT' && (
                      <div className="mt-2 p-2 bg-background-dark rounded-md text-sm">
                        <span className="font-medium">Added to Calendar:</span>
                        <div className="mt-1">{message.action.data.title}</div>
                        <div className="text-text-muted mt-1">
                          {new Date(message.action.data.date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-background-light text-text-primary rounded-lg p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <form onSubmit={handleSubmit} className="border-t border-background p-4 bg-background-light">
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 bg-background border border-background-light rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="submit"
                  className="ml-2 w-10 h-10 flex items-center justify-center"
                  disabled={!input.trim()}
                >
                  <IoSend />
                </Button>
              </div>
              <p className="mt-2 text-xs text-text-muted text-center">
                Try "Add task: complete project" or "Schedule meeting with team on tomorrow"
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;