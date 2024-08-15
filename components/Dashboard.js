import React, { useState, useEffect, useCallback } from 'react';
import { ChartBarIcon, ClockIcon, CogIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Calendar from './widgets/Calendar';
import QuickStats from './widgets/QuickStats';
import RecentMeetings from './widgets/RecentMeetings';
import SettingsModal from './SettingsModal';
import EventModal from './EventModal';
import { getGoogleAuthUrl, getGoogleEvents } from '../lib/googleCalendar';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from '../styles/Dashboard.module.css';

const Dashboard = ({ handleGoogleCalendarSync }) => {
  const [events, setEvents] = useState([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    colorScheme: 'dark',
    textSize: 'medium',
    layoutTemplate: 'default'
  });
  const [quickStats, setQuickStats] = useState({
    totalRecordings: 24,
    totalDuration: '3h 45m',
    recordingsToday: 3,
    transcriptions: 18
  });
  const [recentMeetings, setRecentMeetings] = useState([
    { id: 1, title: 'Project Kickoff', summary: 'Discussed project goals and timeline', date: '2024-08-10', transcription: 'Lorem ipsum...', actionItems: ['Create project charter', 'Schedule follow-up meeting'] },
    { id: 2, title: 'Team Sync', summary: 'Weekly progress update and blockers', date: '2024-08-12', transcription: 'Lorem ipsum...', actionItems: ['Review sprint backlog', 'Update project timeline'] },
    { id: 3, title: 'Client Presentation', summary: 'Presented project milestones to the client', date: '2024-08-14', transcription: 'Lorem ipsum...', actionItems: ['Send follow-up email', 'Update project status report'] },
  ]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user logged in');
        return;
      }

      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        start: doc.data().start.toDate(),
        end: doc.data().end.toDate(),
      }));
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
      toast.error('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuickStats = useCallback(async () => {
    // Simulating an API call with setTimeout
    setTimeout(() => {
      setQuickStats({
        totalRecordings: 24,
        totalDuration: '3h 45m',
        recordingsToday: 3,
        transcriptions: 18
      });
    }, 1000);
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchQuickStats();
  }, [fetchEvents, fetchQuickStats]);

  const handleRefresh = () => {
    fetchEvents();
    fetchQuickStats();
    toast.info('Refreshing dashboard data...');
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
    setIsEventModalOpen(true);
  };

  const handleEventCreate = (newEvent) => {
    setEvents([...events, newEvent]);
    setIsEventModalOpen(false);
    toast.success('Event created successfully!');
  };

  const handleMeetingExpand = (meetingId) => {
    // Implement the logic to expand meeting details
    console.log(`Expanding meeting ${meetingId}`);
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prevSettings => ({ ...prevSettings, [setting]: value }));
  };

  return (
    <div className={`p-4 bg-wordy-bg text-wordy-text ${styles.dashboardContainer}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <button onClick={handleRefresh} className="btn btn-primary flex items-center px-4 py-2 bg-wordy-primary text-white rounded hover:bg-opacity-80 transition-colors">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button onClick={handleGoogleCalendarSync} className="btn btn-secondary flex items-center px-4 py-2 bg-wordy-accent text-white rounded hover:bg-opacity-80 transition-colors">
            <ClockIcon className="h-5 w-5 mr-2" />
            Sync Google Calendar
          </button>
          <button onClick={() => setIsEventModalOpen(true)} className="btn btn-accent flex items-center px-4 py-2 bg-wordy-secondary text-white rounded hover:bg-opacity-80 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Event
          </button>
          <button onClick={() => setIsSettingsModalOpen(true)} className="btn btn-outline flex items-center px-4 py-2 border border-wordy-accent text-wordy-accent rounded hover:bg-wordy-accent hover:text-white transition-colors">
            <CogIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RecentMeetings meetings={recentMeetings} onMeetingExpand={handleMeetingExpand} />
        </div>
        <div className="col-span-1">
          <Calendar events={events} isLoading={isLoading} handleDateClick={handleDateClick} />
          <QuickStats quickStats={quickStats} />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onEventCreate={handleEventCreate}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Dashboard;
