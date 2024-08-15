import React from 'react';
import { ClockIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const QuickStats = ({ quickStats }) => {
  return (
    <div className="bg-wordy-secondary-bg rounded-lg p-4 md:p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-wordy-text">Quick Stats</h2>
      <div className="space-y-4">
        <div className="flex items-center bg-wordy-bg p-3 rounded-lg">
          <ClockIcon className="h-8 w-8 text-wordy-accent mr-3" />
          <div>
            <p className="text-sm text-wordy-text">Total Recordings</p>
            <p className="text-2xl font-bold text-wordy-text">{quickStats.totalRecordings}</p>
          </div>
        </div>
        <div className="flex items-center bg-wordy-bg p-3 rounded-lg">
          <ChartBarIcon className="h-8 w-8 text-wordy-primary mr-3" />
          <div>
            <p className="text-sm text-wordy-text">Total Duration</p>
            <p className="text-2xl font-bold text-wordy-text">{quickStats.totalDuration}</p>
          </div>
        </div>
        <div className="flex items-center bg-wordy-bg p-3 rounded-lg">
          <DocumentTextIcon className="h-8 w-8 text-wordy-accent mr-3" />
          <div>
            <p className="text-sm text-wordy-text">Recordings Today</p>
            <p className="text-2xl font-bold text-wordy-text">{quickStats.recordingsToday}</p>
          </div>
        </div>
        <div className="flex items-center bg-wordy-bg p-3 rounded-lg">
          <DocumentTextIcon className="h-8 w-8 text-wordy-accent mr-3" />
          <div>
            <p className="text-sm text-wordy-text">Transcriptions</p>
            <p className="text-2xl font-bold text-wordy-text">{quickStats.transcriptions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;