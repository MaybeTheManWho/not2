import React, { useState, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  addDays
} from 'date-fns';
import { 
  FaPlus, 
  FaChevronLeft, 
  FaChevronRight,
  FaClock,
  FaUser
} from 'react-icons/fa';
import { CalendarContext } from '../contexts/CalendarContext';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const CalendarPage = () => {
  const { events, addEvent, updateEvent, deleteEvent, getEventsByDate, getUserColor } = useContext(CalendarContext);
  const { currentUser } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const titleRef = useRef();
  const descriptionRef = useRef();
  const timeRef = useRef();
  const imageIndexRef = useRef();
  
  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Calculate start day offset (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  
  // Get events for selected date
  const selectedDateEvents = getEventsByDate(selectedDate);
  
  // Navigation functions
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Event handling functions
  const handleAddEvent = () => {
    setEditMode(false);
    setCurrentEvent(null);
    setIsModalOpen(true);
  };
  
  const handleEditEvent = (event) => {
    setEditMode(true);
    setCurrentEvent(event);
    setIsModalOpen(true);
  };
  
  // Save event (add or update)
  const handleSaveEvent = (e) => {
    e.preventDefault();
    
    const eventData = {
      title: titleRef.current.value,
      description: descriptionRef.current.value,
      date: new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        timeRef.current.value ? Number(timeRef.current.value.split(':')[0]) : 0,
        timeRef.current.value ? Number(timeRef.current.value.split(':')[1]) : 0
      ).toISOString(),
      imageIndex: imageIndexRef.current.value
    };
    
    if (editMode && currentEvent) {
      updateEvent(currentEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    
    setIsModalOpen(false);
  };
  
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 card"
        >
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="small"
                onClick={prevMonth}
                icon={<FaChevronLeft />}
              />
              <Button
                variant="ghost"
                size="small"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={nextMonth}
                icon={<FaChevronRight />}
              />
            </div>
          </div>
          
          {/* Day names */}
          <div className="grid grid-cols-7 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-text-muted font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month start */}
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-start-${index}`} className="h-20 sm:h-28 md:h-32"></div>
            ))}
            
            {/* Calendar days */}
            {days.map((day) => {
              const dateEvents = getEventsByDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    h-20 sm:h-28 md:h-32 p-1 rounded-lg border 
                    ${isSelected ? 'border-primary' : 'border-transparent'}
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isToday ? 'bg-background-light border-2 border-accent' : ''}
                    cursor-pointer transition-colors hover:bg-background-light
                  `}
                >
                  <div className="h-full flex flex-col">
                    <div className={`
                      text-right px-1 py-0.5 font-medium 
                      ${isToday ? 'text-primary' : 'text-text-secondary'}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                      {dateEvents.slice(0, 3).map((event, idx) => {
                        // Get the color for the event creator
                        const userColor = getUserColor(event.username);
                        
                        return (
                          <div
                            key={event.id}
                            className="rounded px-1.5 py-0.5 mb-1 text-xs truncate flex items-center"
                            style={{ 
                              backgroundColor: `${userColor}20`,
                              color: userColor
                            }}
                          >
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}
                      
                      {dateEvents.length > 3 && (
                        <div className="text-xs text-text-secondary px-1">
                          +{dateEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Empty cells for days after month end */}
            {Array.from({ length: (7 - ((days.length + startDay) % 7)) % 7 }).map((_, index) => (
              <div key={`empty-end-${index}`} className="h-20 sm:h-28 md:h-32"></div>
            ))}
          </div>
        </motion.div>
        
        {/* Day details column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">{format(selectedDate, 'EEEE')}</h2>
              <p className="text-text-muted">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            
            <Button
              onClick={handleAddEvent}
              icon={<FaPlus />}
              size="small"
            >
              Add Event
            </Button>
          </div>
          
          {/* Event list */}
          <div className="space-y-4">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p>No events scheduled for this day</p>
              </div>
            ) : (
              selectedDateEvents
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(event => {
                  // Get the color for the event creator
                  const userColor = getUserColor(event.username);
                  const isCurrentUserEvent = currentUser && event.username === currentUser.username;
                  
                  return (
                    <div
                      key={event.id}
                      className="bg-background rounded-lg p-3 hover:bg-background-dark transition-colors cursor-pointer"
                      onClick={() => handleEditEvent(event)}
                      style={{ borderLeft: `4px solid ${userColor}` }}
                    >
                      <div className="flex items-start">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center mr-3"
                          style={{ backgroundColor: `${userColor}20` }}
                        >
                          <img 
                            src={`/assets/photo${event.imageIndex || 1}.png`}
                            alt={event.title}
                            className="w-8 h-8 object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `/assets/photo1.png`;
                            }}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-text-primary">{event.title}</h3>
                          
                          <div className="flex items-center mt-1 text-sm">
                            <div className="flex items-center mr-3 text-text-muted">
                              <FaClock className="mr-1" />
                              <span>{format(new Date(event.date), 'h:mm a')}</span>
                            </div>
                            
                            <div 
                              className="flex items-center text-sm px-2 py-0.5 rounded-full"
                              style={{ 
                                backgroundColor: `${userColor}20`, 
                                color: userColor 
                              }}
                            >
                              <FaUser className="mr-1" size={10} />
                              <span>{event.username}</span>
                              {isCurrentUserEvent && <span className="ml-1">(me)</span>}
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="mt-2 text-sm text-text-secondary">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Add/Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Event" : "Add New Event"}
      >
        <form onSubmit={handleSaveEvent}>
          <Input
            ref={titleRef}
            label="Event Title"
            placeholder="Enter event title"
            defaultValue={currentEvent?.title || ''}
            required
            autoFocus
          />
          
          <Input
            ref={descriptionRef}
            label="Description (optional)"
            placeholder="Add event details..."
            defaultValue={currentEvent?.description || ''}
          />
          
          <Input
            ref={timeRef}
            type="time"
            label="Time"
            defaultValue={currentEvent?.date 
              ? format(new Date(currentEvent.date), 'HH:mm')
              : format(new Date(), 'HH:mm')
            }
          />
          
          <div className="mb-4">
            <label className="block text-text-primary mb-2 font-medium">
              Reminder (optional)
            </label>
            <select
              className="block w-full px-4 py-2 bg-background-dark border border-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={currentEvent?.reminder || ""}
            >
              <option value="">No reminder</option>
              <option value="5">5 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>
          
          {editMode && (
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="completed"
                  className="h-4 w-4 border-gray-300 rounded text-primary focus:ring-primary"
                  defaultChecked={currentEvent?.completed || false}
                  onChange={(e) => {
                    const isCompleted = e.target.checked;
                    updateEvent(currentEvent.id, { 
                      completed: isCompleted,
                      completedAt: isCompleted ? new Date().toISOString() : null
                    });
                  }}
                />
                <label htmlFor="completed" className="ml-2 block text-sm text-text-primary">
                  Mark as completed
                </label>
              </div>
              {currentEvent?.completed && currentEvent?.completedAt && (
                <p className="mt-1 text-xs text-green-500">
                  Completed on {format(new Date(currentEvent.completedAt), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-text-primary mb-2 font-medium">
              Icon
            </label>
            <select
              ref={imageIndexRef}
              className="block w-full px-4 py-2 bg-background-dark border border-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={currentEvent?.imageIndex || '1'}
            >
              <option value="1">Image 1</option>
              <option value="2">Image 2</option>
              <option value="3">Image 3</option>
              <option value="4">Image 4</option>
            </select>
          </div>
          
          <div className="flex justify-between gap-3 mt-6">
            {editMode && currentEvent && currentUser && currentEvent.username === currentUser.username && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  deleteEvent(currentEvent.id);
                  setIsModalOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            
            <div className="flex ml-auto gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit"
                disabled={editMode && currentEvent && currentUser && currentEvent.username !== currentUser.username}
              >
                {editMode ? "Update Event" : "Add Event"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarPage;
