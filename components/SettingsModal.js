import React from 'react';
import { XIcon } from '@heroicons/react/24/outline';

const SettingsModal = ({ isOpen, onClose, settings, setSettings }) => {
  if (!isOpen) return null;

  const handleSettingChange = (setting, value) => {
    setSettings(prevSettings => ({ ...prevSettings, [setting]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-wordy-surface p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-wordy-text">Dashboard Settings</h2>
          <button onClick={onClose} className="text-wordy-text hover:text-wordy-accent">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-wordy-text mb-2">Color Scheme:</label>
            <select
              value={settings.colorScheme}
              onChange={(e) => handleSettingChange('colorScheme', e.target.value)}
              className="w-full bg-wordy-background text-wordy-text rounded p-2"
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="block text-wordy-text mb-2">Text Size:</label>
            <select
              value={settings.textSize}
              onChange={(e) => handleSettingChange('textSize', e.target.value)}
              className="w-full bg-wordy-background text-wordy-text rounded p-2"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-wordy-text mb-2">Layout Template:</label>
            <select
              value={settings.layoutTemplate}
              onChange={(e) => handleSettingChange('layoutTemplate', e.target.value)}
              className="w-full bg-wordy-background text-wordy-text rounded p-2"
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="wide">Wide</option>
            </select>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-wordy-primary text-white py-2 rounded hover:bg-opacity-80 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;