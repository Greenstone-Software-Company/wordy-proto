import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Calendar = ({ events, isLoading, handleDateClick }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = day === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear();
      const hasEvent = events.some(event => new Date(event.start).toDateString() === date.toDateString());
      
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
            <button className="text-wordy-accent hover:text-wordy-primary">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-semibold text-wordy-text">{monthNames[currentMonth]} {currentYear}</h3>
            <button className="text-wordy-accent hover:text-wordy-primary">
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
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
            {renderCalendarDays()}
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button className="px-3 py-1 text-sm bg-wordy-accent text-white rounded hover:bg-opacity-80 transition-colors">Month</button>
            <button className="px-3 py-1 text-sm bg-wordy-primary text-white rounded hover:bg-opacity-80 transition-colors">Week</button>
            <button className="px-3 py-1 text-sm bg-wordy-primary text-white rounded hover:bg-opacity-80 transition-colors">Day</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;