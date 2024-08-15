import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Dashboard from '../components/Dashboard';
import Sidebar from '../components/Sidebar';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { getGoogleAuthUrl } from '../lib/googleCalendar';

export default function Home() {
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGoogleCalendarSync = async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to start Google Calendar sync', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <>
      <Head>
        <title>Wordy - Dashboard</title>
        <meta name="description" content="Wordy Dashboard" />
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
              <Dashboard
                handleGoogleCalendarSync={handleGoogleCalendarSync}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}