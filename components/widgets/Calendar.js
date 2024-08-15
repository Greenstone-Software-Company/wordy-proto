import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';

const Calendar = ({ events, isLoading, handleDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderMonthView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = isSameDay(date, new Date());
      const hasEvent = events.some(event => isSameDay(new Date(event.start), date));
      
      days.push(
        <div
          key={day}
          className={`text-center py-2 cursor-pointer ${isToday ? 'bg-wordy-accent text-white' : ''} ${hasEvent ? 'font-bold' : ''}`}
          onClick={() => handleDateClick({ date })}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day, index) => {
      const hasEvent = events.some(event => isSameDay(new Date(event.start), day));
      const isToday = isSameDay(day, new Date());

      return (
        <div key={index} className="border p-2">
          <div className={`text-center ${isToday ? 'bg-wordy-accent text-white' : ''}`}>
            {format(day, 'EEE d')}
          </div>
          {hasEvent && <div className="text-wordy-primary text-xs">Event</div>}
        </div>
      );
    });
  };

  const renderDayView = () => {
    const hasEvent = events.some(event => isSameDay(new Date(event.start), currentDate));
    return (
      <div className="border p-4">
        <div className="text-center text-lg font-bold mb-2">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
        {hasEvent ? (
          <div className="text-wordy-primary">Events scheduled for today</div>
        ) : (
          <div className="text-wordy-text">No events scheduled</div>
        )}
      </div>
    );
  };

  const changeDate = (amount) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + amount);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (7 * amount));
    } else {
      newDate.setDate(newDate.getDate() + amount);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-wordy-secondary-bg rounded-lg p-4 shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-wordy-text">Calendar</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-wordy-text">Loading calendar...</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeDate(-1)} className="text-wordy-accent hover:text-wordy-primary">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-semibold text-wordy-text">
              {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {view === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
              {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
            </h3>
            <button onClick={() => changeDate(1)} className="text-wordy-accent hover:text-wordy-primary">
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
          {view === 'month' && (
            <>
              <div className="grid grid-cols-7 gap-1 text-sm font-medium text-wordy-text mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {renderMonthView()}
              </div>
            </>
          )}
          {view === 'week' && (
            <div className="grid grid-cols-7 gap-1">
              {renderWeekView()}
            </div>
          )}
          {view === 'day' && renderDayView()}
          <div className="flex justify-end mt-4 space-x-2">
            <button 
              onClick={() => setView('month')} 
              className={`px-3 py-1 text-sm ${view === 'month' ? 'bg-wordy-accent' : 'bg-wordy-primary'} text-white rounded hover:bg-opacity-80 transition-colors`}
            >
              Month
            </button>
            <button 
              onClick={() => setView('week')} 
              className={`px-3 py-1 text-sm ${view === 'week' ? 'bg-wordy-accent' : 'bg-wordy-primary'} text-white rounded hover:bg-opacity-80 transition-colors`}
            >
              Week
            </button>
            <button 
              onClick={() => setView('day')} 
              className={`px-3 py-1 text-sm ${view === 'day' ? 'bg-wordy-accent' : 'bg-wordy-primary'} text-white rounded hover:bg-opacity-80 transition-colors`}
            >
              Day
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;