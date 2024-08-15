import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const Transcription = ({ transcription, isLoading }) => {
  return (
    <div className="bg-wordy-bg rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-wordy-text flex items-center">
        <DocumentTextIcon className="h-6 w-6 mr-2 text-wordy-accent" />
        Transcription
      </h2>
      <div className="bg-wordy-secondary-bg p-4 rounded min-h-[100px] relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-wordy-accent"></div>
          </div>
        ) : transcription ? (
          <p className="text-wordy-text whitespace-pre-wrap">{transcription}</p>
        ) : (
          <p className="text-wordy-text opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">No transcription available</p>
        )}
      </div>
    </div>
  );
};

export default Transcription;