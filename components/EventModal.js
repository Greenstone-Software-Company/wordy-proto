import React, { useState } from 'react';
import { format } from 'date-fns';
import { XMarkIcon, LinkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const EventModal = ({ isOpen, onClose, onEventCreate, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const newEvent = {
      title,
      start: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${startTime}`),
      end: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${endTime}`),
      meetingLink,
      userId: user.uid,
    };

    try {
      const docRef = await addDoc(collection(db, 'events'), newEvent);
      console.log('Event added with ID: ', docRef.id);
      onEventCreate({ ...newEvent, id: docRef.id });
      onClose();
    } catch (error) {
      console.error('Error adding event: ', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-wordy-secondary-bg p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-wordy-text">Create New Event</h2>
          <button onClick={onClose} className="text-wordy-text hover:text-wordy-accent">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-wordy-text mb-1">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:ring-2 focus:ring-wordy-primary"
              required
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="startTime" className="block text-sm font-medium text-wordy-text mb-1">Start Time</label>
              <div className="relative">
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 pl-8 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:ring-2 focus:ring-wordy-primary"
                  required
                />
                <ClockIcon className="absolute left-2 top-2.5 h-5 w-5 text-wordy-accent" />
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="endTime" className="block text-sm font-medium text-wordy-text mb-1">End Time</label>
              <div className="relative">
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 pl-8 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:ring-2 focus:ring-wordy-primary"
                  required
                />
                <ClockIcon className="absolute left-2 top-2.5 h-5 w-5 text-wordy-accent" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="meetingLink" className="block text-sm font-medium text-wordy-text mb-1">Meeting Link (optional)</label>
            <div className="relative">
              <input
                type="url"
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full p-2 pl-8 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:ring-2 focus:ring-wordy-primary"
                placeholder="https://zoom.us/j/example"
              />
              <LinkIcon className="absolute left-2 top-2.5 h-5 w-5 text-wordy-accent" />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-wordy-bg text-wordy-text rounded hover:bg-opacity-80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-wordy-primary text-white rounded hover:bg-opacity-80 transition-colors"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;