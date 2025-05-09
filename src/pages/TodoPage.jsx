import React, { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaEdit,
  FaCalendarAlt,
  FaSearch,
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaListUl,
  FaListOl,
  FaTable,
  FaUser // Added for user icon
} from 'react-icons/fa';
import { CalendarContext } from '../contexts/CalendarContext';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

// Fix 3: Add a display function for debugging (near the top of the file)
const displayDueDate = (dateString) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return format(date, 'MMM d, yyyy'); // Corrected format string
  } catch (err) {
    console.error("Error formatting due date for display:", err);
    return "Error";
  }
};

const TodoPage = () => {
  // Get context data
  const calendarContext = useContext(CalendarContext);
  const { currentUser } = useContext(AuthContext);
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    getUserColor
    // toggleTodoComplete, // Make sure this is available from context if used
  } = calendarContext;

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  // Refs
  const titleRef = useRef();
  const descriptionRef = useRef();
  const dateRef = useRef();
  const statusRef = useRef();

  // Open modal to add new todo
  const handleAddTodo = () => {
    setEditMode(false);
    setCurrentTodo(null);
    // Ensure refs are cleared or set to defaults for a new todo
    if (titleRef.current) titleRef.current.value = '';
    if (descriptionRef.current) descriptionRef.current.value = '';
    if (dateRef.current) dateRef.current.value = ''; // Clear date field
    if (statusRef.current) statusRef.current.value = 'not-started';
    setIsModalOpen(true);
  };

  // Fix 2: Enhanced handle edit todo function to properly handle dates
  const handleEditTodo = (todo) => {
    setEditMode(true);
    setCurrentTodo(todo);

    // Values will be set in the Modal's defaultValue props for uncontrolled inputs,
    // or you can set them directly if using controlled inputs after modal opens.
    // The setTimeout approach is for when refs might not be immediately available
    // or to ensure state updates propagate before setting ref values.

    // For the date input, setting its value via ref after modal open:
    setTimeout(() => {
        if (todo.dueDate && dateRef.current) {
            try {
                const dateObj = new Date(todo.dueDate);
                if (!isNaN(dateObj.getTime())) {
                    const formattedDate = format(dateObj, 'yyyy-MM-dd');
                    console.log("Setting date input for edit to:", formattedDate);
                    dateRef.current.value = formattedDate;
                } else {
                    console.warn("Invalid due date for edit:", todo.dueDate);
                    dateRef.current.value = ''; // Clear if invalid
                }
            } catch (err) {
                console.error("Error formatting date for edit input:", err);
                dateRef.current.value = ''; // Clear on error
            }
        } else if (dateRef.current) {
            dateRef.current.value = ''; // No due date, so clear it
        }

        // For other refs if needed, though defaultValue in Input components is preferred
        if (titleRef.current) titleRef.current.value = todo.title || '';
        if (descriptionRef.current) descriptionRef.current.value = todo.description || '';
        if (statusRef.current) statusRef.current.value = todo.status || 'not-started';

    }, 0);
    setIsModalOpen(true);
  };


  // Fix 1: Enhanced handleSaveTodo function
  const handleSaveTodo = (e) => {
    e.preventDefault();

    let dueDateISO = null;
    if (dateRef.current && dateRef.current.value) {
      const dateValue = dateRef.current.value; // This should be 'yyyy-MM-dd'
      console.log("Raw date input value from dateRef:", dateValue);
      try {
        // Construct date as UTC to avoid timezone shifts from local interpretation.
        // Appending T12:00:00Z assumes the date entered is meant for "that day" generally.
        const dateObj = new Date(`${dateValue}T12:00:00Z`);
        if (!isNaN(dateObj.getTime())) {
          dueDateISO = dateObj.toISOString();
          console.log("Processed due date (ISO String):", dueDateISO);
        } else {
          console.warn("Could not parse date input:", dateValue);
        }
      } catch (err) {
        console.error("Error constructing date object from input:", err);
      }
    }

    const todoData = {
      title: titleRef.current.value,
      description: descriptionRef.current.value,
      status: statusRef.current.value,
      dueDate: dueDateISO // Pass the ISO string
    };

    // If you need to associate username (assuming it's not part of todoData yet)
    // const finalTodoData = { ...todoData, username: currentUser?.username };
    // Use finalTodoData below if username needs to be explicitly added here.

    console.log("Saving todo with data:", todoData);

    try {
      if (editMode && currentTodo) {
        updateTodo(currentTodo.id, todoData);
      } else {
        addTodo(todoData); // Or addTodo(finalTodoData) if username is added
      }

      setTimeout(() => {
        // This check might be unreliable due to async nature of state updates
        // and how `todos` list is managed in your context.
        // A better approach for verification is to check the actual data source or
        // rely on optimistic updates + server confirmation.
        const operationType = editMode ? "updated" : "added";
        console.log(`Attempted to ${operationType} todo. Check UI or data source for confirmation.`);
      }, 500);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving todo:", error);
      // It's good practice to provide user feedback, e.g., using a toast notification library
      alert("An error occurred while saving the task. Please check the console and try again.");
    }
  };


  const handleStatusChange = (id, status) => {
    updateTodo(id, { status });
  };

  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'completed') return todo.status === 'completed';
      if (filter === 'active') return todo.status !== 'completed';
      return true;
    })
    .filter(todo => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        todo.title?.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query) ||
        todo.username?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if ((a.status === 'completed') !== (b.status === 'completed')) {
        return (a.status === 'completed') ? 1 : -1;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Newest first
    });

  const getEventsGroupedByDate = () => {
    const { events } = calendarContext; // Assuming events are part of calendarContext
    const groupedEvents = {};
    if (events && Array.isArray(events)) {
      events.forEach(event => {
        if (event && event.date) {
          // Assuming event.date is an ISO string or Date object
          const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
          if (!groupedEvents[dateStr]) {
            groupedEvents[dateStr] = [];
          }
          groupedEvents[dateStr].push(event);
        }
      });
    }
    return groupedEvents;
  };

  const groupedEvents = getEventsGroupedByDate();
  const sortedEventDates = Object.keys(groupedEvents).sort();

  const toggleEventCompletion = (eventId) => {
    const event = calendarContext.events?.find(e => e.id === eventId);
    if (event && calendarContext.updateEvent) {
      calendarContext.updateEvent(eventId, { completed: !event.completed });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-bold text-text-primary mb-2 md:mb-0">To-Do List</h1>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-grow">
            <Input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 w-full" />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          </div>
          <Button onClick={handleAddTodo} icon={<FaPlus />} className="w-full sm:w-auto">Add Task</Button>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="flex flex-col sm:flex-row justify-between mb-6 border-b border-background-light">
        <div className="flex mb-2 sm:mb-0">
          {[{key: 'all', label: 'All'}, {key: 'active', label: 'In Progress'}, {key: 'completed', label: 'Completed'}].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`pb-3 px-4 font-medium text-sm sm:text-base ${filter === f.key ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-primary'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex">
          <button onClick={() => setViewMode('list')} className={`pb-3 px-4 font-medium text-sm sm:text-base ${viewMode === 'list' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-primary'}`}>List</button>
          <button onClick={() => setViewMode('todo-table')} className={`pb-3 px-4 font-medium text-sm sm:text-base ${viewMode === 'todo-table' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-primary'}`}><FaTable className="inline mr-1" />Table</button>
          <button onClick={() => setViewMode('calendar-table')} className={`pb-3 px-4 font-medium text-sm sm:text-base ${viewMode === 'calendar-table' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-primary'}`}><FaCalendarAlt className="inline mr-1" />Events</button>
        </div>
      </motion.div>

      {viewMode === 'list' ? (
        filteredTodos.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="text-center py-12">
            <div className="bg-background-light p-8 rounded-lg inline-block shadow">
              <FaCheck className="text-4xl text-primary mx-auto mb-3 opacity-50" />
              <h3 className="text-xl font-medium text-text-primary mb-2">
                {searchQuery ? "No tasks match your search" : filter === "completed" ? "No completed tasks yet" : filter === "active" ? "No active tasks to show" : "Your to-do list is empty!"}
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                {searchQuery ? "Try different keywords." : "Click 'Add Task' to get started."}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4">
            <AnimatePresence>
              {filteredTodos.map(todo => {
                const userColor = getUserColor && todo.username ? getUserColor(todo.username) : '#A0AEC0'; // Gray fallback
                const isCurrentUserTodo = currentUser && todo.username === currentUser.username;
                return (
                  <motion.div key={todo.id} variants={itemVariants} layout exit="exit" className={`bg-background-light rounded-lg p-4 flex items-start sm:items-center shadow hover:shadow-md transition-shadow ${todo.status === 'completed' ? 'opacity-70' : ''}`} style={{ borderLeft: `5px solid ${userColor}` }}>
                    <div className="flex-shrink-0 mr-3 mt-1 sm:mt-0">
                      <div className="relative inline-block w-32">
                        <select value={todo.status} onChange={(e) => handleStatusChange(todo.id, e.target.value)} disabled={!isCurrentUserTodo} className="appearance-none w-full px-3 py-1.5 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: todo.status === 'not-started' ? '#E2E8F0' : todo.status === 'in-progress' ? '#BEE3F8' : '#C6F6D5', color: todo.status === 'not-started' ? '#4A5568' : todo.status === 'in-progress' ? '#2B6CB0' : '#2F855A', paddingRight: '2rem' }}>
                          <option value="not-started" className="bg-white text-gray-700">Not Started</option>
                          <option value="in-progress" className="bg-white text-gray-700">In Progress</option>
                          <option value="completed" className="bg-white text-gray-700">Completed</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"><svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <h3 className={`font-medium text-text-primary truncate ${todo.status === 'completed' ? 'line-through text-text-muted' : ''}`}>{todo.title}</h3>
                        {todo.username && (
                           <div className="ml-0 sm:ml-2 mt-1 sm:mt-0 text-xs px-2 py-0.5 rounded-full flex items-center self-start" style={{ backgroundColor: `${userColor}30`, color: userColor }}> {/* Increased opacity */}
                             <FaUser className="mr-1" size={10} />
                             <span>{todo.username}</span>
                             {isCurrentUserTodo && <span className="ml-1 font-semibold">(me)</span>}
                           </div>
                        )}
                      </div>
                      {todo.description && (<div className="text-text-secondary text-sm mt-1 bg-background p-2 rounded max-h-24 overflow-y-auto prose prose-sm"><div dangerouslySetInnerHTML={{ __html: todo.description.replace(/\n/g, '<br />') }} /></div>)}
                      <div className="flex items-center mt-2 text-xs space-x-3">
                        {todo.dueDate && (<div className="flex items-center text-text-muted"><FaCalendarAlt className="mr-1 flex-shrink-0" /><span>{displayDueDate(todo.dueDate)}</span></div>)}
                        {todo.status === 'completed' && todo.completedAt && (<div className="flex items-center text-green-600"><FaCheck className="mr-1 flex-shrink-0" /><span>Completed: {displayDueDate(todo.completedAt)}</span></div>)}
                      </div>
                    </div>
                    {isCurrentUserTodo && (
                      <div className="flex flex-col sm:flex-row items-center ml-2 sm:ml-4 gap-1 sm:gap-2 mt-2 sm:mt-0 self-start sm:self-center">
                        <button onClick={() => handleEditTodo(todo)} className="p-2 text-text-secondary hover:text-primary rounded-full hover:bg-background-dark transition-colors" title="Edit"><FaEdit size={16}/></button>
                        <button onClick={() => deleteTodo(todo.id)} className="p-2 text-text-secondary hover:text-accent rounded-full hover:bg-background-dark transition-colors" title="Delete"><FaTrash size={16}/></button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )
      ) : viewMode === 'todo-table' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="overflow-hidden bg-background-light rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-background-dark">
              <thead className="bg-background-dark">
                <tr>
                  {['Task', 'User', 'Status', 'Due Date', 'Completed On', 'Description', 'Actions'].map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background-light divide-y divide-background-dark">
                {filteredTodos.length > 0 ? (
                  filteredTodos.map((todo, index) => {
                    const dueDateObj = todo.dueDate ? new Date(todo.dueDate) : null;
                    let isPastDue = false;
                    let isToday = false;
                    if (dueDateObj) {
                        const today = new Date();
                        today.setHours(0,0,0,0); // Compare date parts only
                        const dueDateComp = new Date(dueDateObj.getUTCFullYear(), dueDateObj.getUTCMonth(), dueDateObj.getUTCDate()); // Use UTC parts for comparison
                        isPastDue = dueDateComp < today && todo.status !== 'completed';
                        isToday = dueDateComp.getTime() === today.getTime();
                    }
                    const userColor = getUserColor && todo.username ? getUserColor(todo.username) : '#A0AEC0';
                    const isCurrentUserTodo = currentUser && todo.username === currentUser.username;

                    return (
                      <tr key={todo.id} className={`${index % 2 === 0 ? 'bg-background-light' : 'bg-background'} hover:bg-background-dark transition-colors`}
                          style={{ borderLeft: `5px solid ${isPastDue ? 'var(--color-accent, #F56565)' : (isToday ? 'var(--color-primary, #4299E1)' : userColor)}`}}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary"><span className={todo.status === 'completed' ? 'line-through opacity-60' : ''}>{todo.title}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {todo.username && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${userColor}30`, color: userColor }}>
                              <FaUser className="mr-1" size={8} />{todo.username}{isCurrentUserTodo && <span className="ml-1 font-semibold">(me)</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select value={todo.status} onChange={(e) => handleStatusChange(todo.id, e.target.value)} disabled={!isCurrentUserTodo} className={`px-2 py-1 rounded text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${todo.status === 'not-started' ? 'bg-gray-200 text-gray-700' : todo.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            <option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {todo.dueDate ? (
                            <span className={isPastDue ? 'text-accent font-semibold' : ''}>
                              {displayDueDate(todo.dueDate)}
                              {isToday && <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Today</span>}
                            </span>
                          ) : ( "-" )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{todo.completedAt ? displayDueDate(todo.completedAt) : "-"}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary max-w-xs md:max-w-md truncate prose prose-sm">{todo.description ? todo.description.replace(/<[^>]*>?/gm, '').substring(0, 70) + (todo.description.length > 70 ? '...' : '') : "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {isCurrentUserTodo && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditTodo(todo)} className="p-1.5 text-text-secondary hover:text-primary rounded-full hover:bg-background-dark transition-colors" title="Edit"><FaEdit /></button>
                              <button onClick={() => deleteTodo(todo.id)} className="p-1.5 text-text-secondary hover:text-accent rounded-full hover:bg-background-dark transition-colors" title="Delete"><FaTrash /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-text-muted">No tasks found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : ( // calendar-table view
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="overflow-hidden bg-background-light rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-background-dark">
              <thead className="bg-background-dark">
                <tr>
                  {['Date', 'Event', 'Time', 'Description', 'Reminder', 'Status'].map(header => (
                     <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background-light divide-y divide-background-dark">
                {sortedEventDates.length > 0 ? (
                  sortedEventDates.flatMap(dateStr => { // dateStr is 'yyyy-MM-dd'
                    const groupDateForDisplay = new Date(dateStr + 'T00:00:00'); // Treat as local date for display formatting
                    const formattedParentDate = format(groupDateForDisplay, 'EEE, MMM d, yyyy');
                    const isParentToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

                    return groupedEvents[dateStr].map((event, index) => {
                      const eventDate = new Date(event.date); // Assuming event.date is a full ISO string or parsable by Date
                      const isEventPast = eventDate < new Date() && !event.completed;
                      return (
                        <tr key={event.id} className={`${index % 2 === 0 ? 'bg-background-light' : 'bg-background'} hover:bg-background-dark transition-colors ${event.completed ? 'opacity-60' : ''} ${isEventPast && !event.completed ? 'border-l-4 border-accent' : (isParentToday && index === 0 ? 'border-l-4 border-primary' : '')}`}>
                          {index === 0 && <td rowSpan={groupedEvents[dateStr].length} className={`px-6 py-4 whitespace-nowrap text-sm font-medium align-top ${isParentToday ? 'text-primary' : 'text-text-secondary'}`}>{formattedParentDate}{isParentToday && <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Today</span>}</td>}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            <div className="flex items-center">
                              {event.imageIndex && <div className="w-6 h-6 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center mr-3 flex-shrink-0"><img src={`/assets/photo${event.imageIndex}.png`} alt="" className="w-4 h-4 object-cover" onError={(e) => { e.target.style.display='none'; }} /></div>}
                              <span className={event.completed ? 'line-through' : ''}>{event.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{format(eventDate, 'h:mm a')}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary max-w-md truncate prose prose-sm">{event.description || "-"}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{event.reminder ? <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-20 text-primary">{event.reminder} min before</span> : "-"}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {calendarContext.updateEvent && // Check if updateEvent function exists
                              <button onClick={() => toggleEventCompletion(event.id)} className={`px-2 py-1 rounded text-xs font-medium ${event.completed ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {event.completed ? <><FaCheck className="inline mr-1" />Completed {event.completedAt ? `on ${format(new Date(event.completedAt), 'MMM d')}` : ''}</> : 'Mark Done'}
                              </button>
                            }
                          </td>
                        </tr>
                      );
                    });
                  })
                ) : (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-text-muted">No calendar events to display.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? "Edit Task" : "Add New Task"}>
        <form onSubmit={handleSaveTodo} className="space-y-4">
          <Input ref={titleRef} label="Title" placeholder="Enter task title" defaultValue={currentTodo?.title || ''} required autoFocus />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description (optional)</label>
            <div className="border rounded-lg border-background-light bg-background-dark overflow-hidden focus-within:ring-2 focus-within:ring-primary">
              <div className="border-b border-background-light p-2 flex space-x-1">
                {/* Dummy Formatting Buttons */}
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Bold"><FaBold className="text-text-secondary" /></button>
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Italic"><FaItalic className="text-text-secondary" /></button>
                <button type="button" className="p-1.5 hover:bg-background rounded" title="Underline"><FaUnderline className="text-text-secondary" /></button>
              </div>
              <textarea ref={descriptionRef} className="w-full p-3 bg-background-dark text-text-primary min-h-[120px] focus:outline-none resize-y" placeholder="Add more details..." defaultValue={currentTodo?.description || ''}></textarea>
            </div>
          </div>
          <Input ref={dateRef} type="date" label="Due Date (optional)" defaultValue={currentTodo?.dueDate ? format(new Date(currentTodo.dueDate), 'yyyy-MM-dd') : ''} />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <div className="relative">
              <select ref={statusRef} className="appearance-none w-full px-3 py-2 bg-background-dark border border-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" defaultValue={currentTodo?.status || 'not-started'} style={{ paddingRight: '2.5rem' }}>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"><svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={editMode && currentTodo && currentUser && currentTodo.username !== currentUser.username && !!currentTodo.username}> {/* Added check for currentTodo.username existence */}
              {editMode ? "Update Task" : "Add Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TodoPage;
