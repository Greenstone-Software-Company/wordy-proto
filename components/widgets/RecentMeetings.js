import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const RecentMeetings = ({ meetings, onMeetingExpand }) => {
  const [expandedMeeting, setExpandedMeeting] = useState(null);

  const toggleMeetingExpand = (id) => {
    setExpandedMeeting(expandedMeeting === id ? null : id);
    onMeetingExpand(id);
  };

  return (
    <div className="bg-wordy-secondary-bg rounded-lg p-4 shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-wordy-text">Recent Meetings</h2>
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="bg-wordy-bg rounded-lg p-4">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleMeetingExpand(meeting.id)}
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
              <div className="mt-4 space-y-2">
                <p className="text-wordy-text">{meeting.summary}</p>
                <div>
                  <h4 className="font-semibold text-wordy-text">Action Items:</h4>
                  <ul className="list-disc list-inside">
                    {meeting.actionItems.map((item, index) => (
                      <li key={index} className="text-wordy-text">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMeetings;