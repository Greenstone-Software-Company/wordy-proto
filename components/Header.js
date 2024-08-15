import React from 'react';
import { Bars3Icon, BellIcon, UserCircleIcon, CogIcon } from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar, openSettings }) => {
  return (
    <header className="bg-wordy-secondary-bg shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      <button
        onClick={toggleSidebar}
        className="text-wordy-text hover:text-wordy-accent mr-4 md:hidden"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className="flex items-center space-x-4">
        <button className="text-wordy-text hover:text-wordy-accent">
          <BellIcon className="h-6 w-6" />
        </button>
        <button className="text-wordy-text hover:text-wordy-accent">
          <UserCircleIcon className="h-6 w-6" />
        </button>
        <button onClick={openSettings} className="text-wordy-text hover:text-wordy-accent">
          <CogIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;