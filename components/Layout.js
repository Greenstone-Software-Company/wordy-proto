import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { BellIcon, UserCircleIcon, CogIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-wordy-bg">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-wordy-secondary-bg shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={toggleSidebar}
            className="text-wordy-text hover:text-wordy-accent md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            {/* Add any additional icons or buttons as needed */}
            <button className="text-wordy-text hover:text-wordy-accent">
              <BellIcon className="h-6 w-6" />
            </button>
            <button className="text-wordy-text hover:text-wordy-accent">
              <UserCircleIcon className="h-6 w-6" />
            </button>
            <button className="text-wordy-text hover:text-wordy-accent">
              <CogIcon className="h-6 w-6" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-wordy-bg">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
