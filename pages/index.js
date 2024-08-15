import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Dashboard from '../components/Dashboard';
import VoiceNotes from '../components/VoiceNotes';
import Sidebar from '../components/Sidebar';
import { transcribeAudio, getAIResponse } from '../lib/api';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { getGoogleAuthUrl } from '../lib/googleCalendar';

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Uncomment this line to enforce authentication
        // router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleNewRecording = (newRecording) => {
    setRecordings([newRecording, ...recordings]);
  };

  const handleRecordingSelect = (recording) => {
    setSelectedRecording(recording);
    setTranscription('');
  };

  const handleTranscribe = async () => {
    if (selectedRecording) {
      setIsTranscribing(true);
      try {
        const result = await transcribeAudio(selectedRecording.url);
        setTranscription(result);
      } catch (error) {
        console.error('Transcription error:', error);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleSendMessage = async (message) => {
    const userMessage = { text: message, isUser: true };
    setMessages([...messages, userMessage]);

    try {
      const response = await getAIResponse(message, transcription);
      const aiMessage = { text: response, isUser: false };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
    }
  };

  const handleDeleteAll = () => {
    setRecordings([]);
    setSelectedRecording(null);
    setTranscription('');
  };

  const handleGoogleCalendarSync = async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to start Google Calendar sync', error);
      setError('Failed to start Google Calendar sync. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Head>
        <title>Wordy - Dashboard & Voice Notes</title>
        <meta name="description" content="Wordy Dashboard & Voice Notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex h-screen bg-wordy-background">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-wordy-secondary-bg p-4 flex justify-between items-center">
            <button onClick={toggleSidebar} className="md:hidden text-wordy-text">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-wordy-primary">Wordy</h1>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-wordy-background">
            <div className="container mx-auto px-6 py-8">
              <div className="mb-6">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`mr-4 px-4 py-2 rounded ${activeView === 'dashboard' ? 'bg-wordy-primary text-white' : 'bg-wordy-secondary-bg text-wordy-text'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('voiceNotes')}
                  className={`px-4 py-2 rounded ${activeView === 'voiceNotes' ? 'bg-wordy-primary text-white' : 'bg-wordy-secondary-bg text-wordy-text'}`}
                >
                  Voice Notes
                </button>
              </div>
              
              {activeView === 'dashboard' ? (
                <Dashboard
                  handleGoogleCalendarSync={handleGoogleCalendarSync}
                />
              ) : (
                <VoiceNotes
                  recordings={recordings}
                  selectedRecording={selectedRecording}
                  transcription={transcription}
                  isTranscribing={isTranscribing}
                  messages={messages}
                  handleNewRecording={handleNewRecording}
                  handleRecordingSelect={handleRecordingSelect}
                  handleTranscribe={handleTranscribe}
                  handleSendMessage={handleSendMessage}
                  handleDeleteAll={handleDeleteAll}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}