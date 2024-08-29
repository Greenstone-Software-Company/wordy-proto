import React, { useState } from 'react';
import { PlayIcon, PauseIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import Button from '../Button';
import Input from '../Input';
import Card from '../Card';

const RecordingsList = ({ recordings, onRecordingSelect, onRecordingDelete, onPlayPause, currentlyPlaying }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleRenameClick = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName || '');
  };

  const handleRenameSubmit = (id) => {
    if (!editName || editName.trim() === '') {
      toast.error('Recording name cannot be empty');
      return;
    }
    onRecordingSelect({ ...recordings.find(r => r.id === id), name: editName });
    setEditingId(null);
    toast.success('Recording renamed successfully');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      onRecordingDelete(id);
      toast.info('Recording deleted');
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4 text-wordy-text">Recordings</h2>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search recordings..."
          className="w-full"
        />
      </div>
      {recordings.length === 0 ? (
        <p className="text-wordy-text text-center italic">No recordings found</p>
      ) : (
        <ul className="space-y-3">
          {recordings.map((recording) => (
            <li
              key={recording.id}
              className="bg-wordy-background p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow" onClick={() => onRecordingSelect(recording)}>
                  {editingId === recording.id ? (
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRenameSubmit(recording.id)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit(recording.id)}
                      className="w-full px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-semibold text-wordy-text text-lg mb-1">{recording.name}</h3>
                  )}
                  <p className="text-sm text-wordy-text opacity-70">
                    {recording.duration} • {new Date(recording.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => onPlayPause(recording.id)}
                    variant="primary"
                    className="p-2 rounded-full"
                    title={currentlyPlaying === recording.id ? "Pause" : "Play"}
                  >
                    {currentlyPlaying === recording.id ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                  </Button>
                  <Button 
                    onClick={() => handleRenameClick(recording.id, recording.name)}
                    variant="secondary"
                    className="p-2 rounded-full"
                    title="Rename"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(recording.id)}
                    variant="accent"
                    className="p-2 rounded-full"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default RecordingsList;