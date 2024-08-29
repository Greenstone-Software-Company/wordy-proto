import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import Card from './Card';

const Transcription = ({ transcription, isLoading }) => {
  return (
    <Card className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-wordy-text flex items-center">
        <DocumentTextIcon className="h-6 w-6 mr-2 text-wordy-accent" />
        Transcription
      </h2>
      <div className="bg-wordy-surface p-4 rounded-lg min-h-[200px] relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-wordy-accent"></div>
          </div>
        ) : transcription ? (
          <p className="text-wordy-text whitespace-pre-wrap">{transcription}</p>
        ) : (
          <p className="text-wordy-text opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            No transcription available
          </p>
        )}
      </div>
    </Card>
  );
};

export default Transcription;
