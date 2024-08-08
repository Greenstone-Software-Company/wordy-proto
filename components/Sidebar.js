import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HomeIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  const menuItems = [
    { name: 'Home', icon: HomeIcon, path: '/' },
    { name: 'Voice Notes', icon: MicrophoneIcon, path: '/voice-notes' },
  ];

  return (
    <div className="flex flex-col w-64 bg-wordy-gray text-wordy-text">
      <div className="flex items-center justify-center h-20 shadow-md">
        <Image 
          src="/wordy-logo.png" 
          alt="Wordy Logo" 
          width={120} 
          height={40} 
          priority
        />
      </div>
      <ul className="flex flex-col py-4">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link href={item.path} legacyBehavior>
              <a className={`flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 ${isActive(item.path) ? 'text-wordy-primary' : 'text-wordy-text hover:text-wordy-accent'}`}>
                <span className="inline-flex items-center justify-center h-12 w-12 text-lg">
                  <item.icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
