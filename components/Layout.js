import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Image from 'next/image';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-wordy-bg">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-wordy-bg p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <Image src="/wordy-logo.svg" alt="Wordy Logo" width={120} height={40} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;