import React, { useState } from 'react';
import { PlayIcon, PauseIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid';

const RecordingsList = ({ recordings, onRecordingSelect, onRecordingDelete, onPlayPause, currentlyPlaying }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleRenameClick = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleRenameSubmit = (id) => {
    onRecordingSelect({ ...recordings.find(r => r.id === id), name: editName });
    setEditingId(null);
  };

  return (
    <div className="bg-wordy-secondary-bg rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4 text-wordy-text">Recordings</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search recordings..."
          className="w-full p-2 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:outline-none focus:ring-2 focus:ring-wordy-primary"
        />
      </div>
      <ul className="space-y-2">
        {recordings.map((recording) => (
          <li
            key={recording.id}
            className="bg-wordy-bg p-3 rounded shadow cursor-pointer hover:bg-opacity-80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div onClick={() => onRecordingSelect(recording)}>
                {editingId === recording.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRenameSubmit(recording.id)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit(recording.id)}
                    className="bg-wordy-bg text-wordy-text border-b border-wordy-accent focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <p className="font-semibold text-wordy-text">{recording.name}</p>
                )}
                <p className="text-sm text-wordy-text opacity-70">
                  {recording.duration} • {new Date(recording.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="p-1 rounded-full bg-wordy-primary text-wordy-text hover:bg-opacity-80"
                  onClick={() => onPlayPause(recording.id)}
                >
                  {currentlyPlaying === recording.id ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                </button>
                <button 
                  className="p-1 rounded-full bg-wordy-accent text-wordy-text hover:bg-opacity-80"
                  onClick={() => handleRenameClick(recording.id, recording.name)}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button 
                  className="p-1 rounded-full bg-wordy-accent text-wordy-text hover:bg-opacity-80"
                  onClick={() => onRecordingDelete(recording.id)}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecordingsList;