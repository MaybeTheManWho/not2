import axios from 'axios';
import { API_KEYS } from '../config/env';

// Get the API key from environment variable
const DEEPSEEK_API_KEY = API_KEYS.DEEPSEEK;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Process a user message with the Deepseek AI API
 * @param {string} message - The user's message
 * @param {Array} history - Previous conversation history
 * @returns {Promise<{message: string, action: Object|null}>} - AI response with optional action
 */
export const processMessage = async (message, history = []) => {
  try {
    // Ensure we have an API key
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
      console.warn('No Deepseek API key found. Using mock response.');
      return mockProcessMessage(message);
    }
    
    // Format conversation history for the API
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    // Add the current message
    formattedHistory.push({
      role: 'user',
      content: message
    });
    
    // System prompt to guide the AI in processing calendar and todo items
    const systemPrompt = {
      role: 'system',
      content: `You are an AI assistant that helps manage a calendar and todo list. 
      Extract relevant information from the user's message to perform actions like:
      1. Adding a task to the todo list: Look for phrases like "add task", "add todo", "create task", etc., followed by the task description.
      2. Adding an event to the calendar: Look for phrases like "add event", "schedule", "create event", etc., followed by the event title and date/time.
      
      If you detect such an action, include it in a structured format in your response like this:
      { 
        "action": {"type": "ADD_TODO", "data": {"title": "Task title"}} 
      }
      or
      { 
        "action": {"type": "ADD_EVENT", "data": {"title": "Event title", "date": "ISO date string"}} 
      }
      
      Always be helpful, concise, and friendly in your responses.`
    };
    
    // Make the API request
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [systemPrompt, ...formattedHistory],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );
    
    // Extract the assistant's message
    const aiMessage = response.data.choices[0].message.content;
    
    // Try to extract any action from the message
    let action = null;
    try {
      // Look for JSON pattern in the response
      const actionMatch = aiMessage.match(/\{[\s\S]*"action"[\s\S]*\}/);
      if (actionMatch) {
        const actionJson = JSON.parse(actionMatch[0]);
        action = actionJson.action;
      }
    } catch (error) {
      console.error('Error parsing action from AI response:', error);
    }
    
    // Clean up the message to remove the JSON action if it exists
    const cleanMessage = aiMessage.replace(/\{[\s\S]*"action"[\s\S]*\}/, '').trim();
    
    return {
      message: cleanMessage,
      action
    };
  } catch (error) {
    console.error('Error calling Deepseek API:', error);
    
    // Return a fallback message if the API call fails
    return {
      message: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
      action: null
    };
  }
};

/**
 * Mock function for local development when API key is not available
 * This simulates the AI responses without calling the actual API
 */
export const mockProcessMessage = (message) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const lowerMsg = message.toLowerCase();
      
      // Check for adding a todo
      if (lowerMsg.includes('add task') || lowerMsg.includes('add todo') || lowerMsg.includes('create task')) {
        const taskMatch = message.match(/add (?:task|todo):?\s*(.+)/i) || 
                           message.match(/create (?:task|todo):?\s*(.+)/i);
        
        if (taskMatch && taskMatch[1]) {
          const taskTitle = taskMatch[1].trim();
          
          resolve({
            message: `I've added "${taskTitle}" to your todo list! Is there anything else you'd like me to do?`,
            action: {
              type: 'ADD_TODO',
              data: { 
                title: taskTitle,
                status: 'not-started'
              }
            }
          });
          return;
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
              resolve({
                message: `I'm not sure about that date. Could you try again with a format like "tomorrow" or "May 15, 2025"?`
              });
              return;
            }
            
            resolve({
              message: `Great! I've added "${eventTitle}" to your calendar for ${eventDate.toLocaleDateString()}. Anything else you'd like to add?`,
              action: {
                type: 'ADD_EVENT',
                data: {
                  title: eventTitle,
                  date: eventDate.toISOString(),
                  imageIndex: Math.floor(Math.random() * 4) + 1, // Random image 1-4
                  completed: false
                }
              }
            });
            return;
          } catch (error) {
            resolve({
              message: `I had trouble understanding that date format. Could you try again with something like "tomorrow" or "May 15, 2025"?`
            });
            return;
          }
        }
      }
      
      // Default responses
      const defaultResponses = [
        "I can help you manage your tasks and calendar. Try saying something like 'Add task: Buy groceries' or 'Schedule meeting with John on tomorrow'.",
        "I'm your personal assistant. I can add tasks to your todo list or events to your calendar. What would you like me to help with?",
        "Not sure what you mean. You can ask me to 'add task: finish report' or 'create event: lunch with Amy on Friday'."
      ];
      
      resolve({
        message: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
      });
    }, 1000);
  });
};

// Export the function based on API key availability
export default processMessage;
