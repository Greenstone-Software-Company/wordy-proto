import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const RecentMeetings = ({ meetings }) => {
  const [expandedMeeting, setExpandedMeeting] = useState(null);

  const toggleMeeting = (id) => {
    setExpandedMeeting(expandedMeeting === id ? null : id);
  };

  return (
    <div className="bg-wordy-secondary-bg rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-wordy-text">Recent Meetings</h2>
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="bg-wordy-bg rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
              onClick={() => toggleMeeting(meeting.id)}
            >
              <div>
                <h3 className="font-semibold text-wordy-text">{meeting.title}</h3>
                <p className="text-sm text-wordy-text opacity-70">{meeting.date}</p>
              </div>
              <button className="text-wordy-accent hover:text-wordy-primary">
                {expandedMeeting === meeting.id ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {expandedMeeting === meeting.id && (
              <div className="p-4 bg-wordy-bg bg-opacity-50 border-t border-wordy-accent">
                <p className="text-wordy-text mb-2">{meeting.summary}</p>
                <h4 className="font-semibold text-wordy-text mt-4 mb-2">Action Items:</h4>
                <ul className="list-disc list-inside text-wordy-text">
                  {meeting.actionItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMeetings;