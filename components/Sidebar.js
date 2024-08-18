import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { HomeIcon, MicrophoneIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { auth } from '../firebase';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/' },
    { name: 'Voice Notes', icon: MicrophoneIcon, path: '/voice-notes' },
    { name: 'Profile', icon: UserIcon, path: '/profile' }, // Update this line
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-full bg-wordy-secondary-bg text-wordy-text transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-wordy-accent">
          <div className="flex items-center">
            <Image 
              src="/wordy-logo.png" 
              alt="Wordy Logo" 
              width={40} 
              height={40} 
              className="rounded-full"
            />
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-wordy-text hover:text-wordy-accent">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link href={item.path} className={`flex items-center px-4 py-2 transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-wordy-primary text-white'
                    : 'text-wordy-text hover:bg-wordy-accent hover:text-white'
                }`}>
                  <item.icon className="h-6 w-6 mr-3" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-wordy-accent text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;