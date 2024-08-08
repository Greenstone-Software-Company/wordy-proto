import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import AudioRecorder from '../components/AudioRecorder';
import RecordingsList from '../components/VoiceNotes/RecordingsList';
import Transcription from '../components/Transcription';
import AIChat from '../components/VoiceNotes/AIChat';
import { transcribeAudio, getAIResponse } from '../lib/api';
import { Waveform } from '@uiball/loaders';

export default function VoiceNotes() {
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNewRecording = (newRecording) => {
    setRecordings([newRecording, ...recordings]);
  };

  const handleRecordingSelect = (recording) => {
    setSelectedRecording(recording);
    setTranscription('');
  };

  const handleTranscribe = async () => {
    if (selectedRecording) {
      setIsTranscribing(true);
      try {
        const result = await transcribeAudio(selectedRecording.url);
        setTranscription(result);
      } catch (error) {
        console.error('Transcription error:', error);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleSendMessage = async (message) => {
    const userMessage = { text: message, isUser: true };
    setMessages([...messages, userMessage]);

    try {
      const response = await getAIResponse(message, transcription);
      const aiMessage = { text: response, isUser: false };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
    }
  };

  const handleDeleteAll = () => {
    setRecordings([]);
    setSelectedRecording(null);
    setTranscription('');
    setMessages([]);
  };

  const handleTranscriptionUpdate = (newTranscription) => {
    setTranscription((prevTranscription) => prevTranscription + ' ' + newTranscription);
  };

  return (
    <Layout>
      <Head>
        <title>Voice Notes AI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-wordy-gray rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Voice Notes AI</h1>
        <div className="flex justify-between mb-6">
          <button onClick={handleDeleteAll} className="bg-wordy-light text-wordy-text px-4 py-2 rounded hover:bg-wordy-accent transition-colors">Delete All</button>
          <AudioRecorder onNewRecording={handleNewRecording} onTranscriptionUpdate={handleTranscriptionUpdate} />
        </div>
        <input type="text" placeholder="Search recordings..." className="w-full p-2 rounded bg-wordy-light text-wordy-text mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <RecordingsList recordings={recordings} onRecordingSelect={handleRecordingSelect} />
          </div>
          <div>
            {selectedRecording && (
              <>
                <h2 className="text-xl font-semibold mb-4">Recording {selectedRecording.id}</h2>
                <div className="bg-wordy-light p-4 rounded mb-4 h-24 flex items-center justify-center">
                  <Waveform size={40} lineWeight={3.5} speed={1} color="white" />
                </div>
                <div className="flex justify-between mb-4">
                  <button className="bg-wordy-accent text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors">Play</button>
                  <button onClick={handleTranscribe} className="bg-wordy-accent text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors">
                    Transcribe
                  </button>
                </div>
                <Transcription transcription={transcription} isLoading={isTranscribing} />
                <AIChat onSendMessage={handleSendMessage} messages={messages} selectedRecording={selectedRecording} />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
