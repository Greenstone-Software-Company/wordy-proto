// components/Layout.js
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HomeIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  const menuItems = [
    { name: 'Home', icon: HomeIcon, path: '/' },
    { name: 'Voice Notes', icon: MicrophoneIcon, path: '/voice-notes' },
  ];

  return (
    <div className="flex flex-col w-64 bg-wordy-secondary-bg text-wordy-text">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-2xl font-bold">Wordy</h1>
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

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-wordy-bg">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-wordy-bg">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;