import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import AudioRecorder from '../components/AudioRecorder';
import RecordingsList from '../components/VoiceNotes/RecordingsList';
import Transcription from '../components/Transcription';
import AIChat from '../components/VoiceNotes/AIChat';
import FileUpload from '../components/VoiceNotes/FileUpload';
import { transcribeAudio, getAIResponse } from '../lib/transcription';
import { Waveform } from '@uiball/loaders';
import WaveSurfer from 'wavesurfer.js';

export default function VoiceNotes() {
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (waveformRef.current && selectedRecording) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        cursorColor: 'navy',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 100,
        barGap: 3,
      });
      wavesurfer.current.load(selectedRecording.url);
    }
  }, [selectedRecording]);

  const handleNewRecording = (newRecording) => {
    setRecordings([newRecording, ...recordings]);
    setSelectedRecording(newRecording);
  };

  const handleFileUpload = (newRecording) => {
    setRecordings([newRecording, ...recordings]);
    setSelectedRecording(newRecording);
  };

  const handleRecordingSelect = (recording) => {
    setSelectedRecording(recording);
    setTranscription(recording.transcription || '');
  };

  const handleRecordingDelete = (id) => {
    setRecordings((prev) => prev.filter((recording) => recording.id !== id));
    if (selectedRecording && selectedRecording.id === id) {
      setSelectedRecording(null);
      setTranscription('');
    }
  };

  const handleTranscribe = async () => {
    if (!selectedRecording) return;
    setIsTranscribing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', selectedRecording.file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Transcription failed');
      }

      setTranscription(data.transcription);
      // Update recordings state if needed
    } catch (error) {
      console.error('Transcription error:', error);
      setError(`Failed to transcribe audio: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await getAIResponse(chatMessage, transcription);
      setMessages([...messages, { text: chatMessage, isUser: true }, { text: response, isUser: false }]);
      setChatMessage('');
    } catch (error) {
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = () => {
    setRecordings([]);
    setSelectedRecording(null);
    setTranscription('');
    setMessages([]);
  };

  const handlePlayPause = (id) => {
    if (wavesurfer.current) {
      if (currentlyPlaying === id) {
        wavesurfer.current.playPause();
        setCurrentlyPlaying(wavesurfer.current.isPlaying() ? id : null);
      } else {
        wavesurfer.current.stop();
        wavesurfer.current.load(recordings.find(r => r.id === id).url);
        setTimeout(() => {
          wavesurfer.current.play();
          setCurrentlyPlaying(id);
        }, 100);
      }
    }
  };

  return (
    <Layout>
      <Head>
        <title>Voice Notes AI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-wordy-gray rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-wordy-text">Voice Notes AI</h1>
        <div className="flex justify-between mb-6">
          <button onClick={handleDeleteAll} className="bg-wordy-light text-wordy-text px-4 py-2 rounded hover:bg-wordy-accent transition-colors">Delete All</button>
          <AudioRecorder onNewRecording={handleNewRecording} />
        </div>
        <FileUpload onFileUpload={handleFileUpload} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecordingsList
            recordings={recordings}
            onRecordingSelect={handleRecordingSelect}
            onRecordingDelete={handleRecordingDelete}
            onPlayPause={handlePlayPause}
            currentlyPlaying={currentlyPlaying}
          />
          {selectedRecording && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-wordy-text">Recording {selectedRecording.id}</h2>
              <div ref={waveformRef} className="bg-wordy-light p-4 rounded mb-4 h-24"></div>
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => handlePlayPause(selectedRecording.id)}
                  className="bg-wordy-accent text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors"
                >
                  {currentlyPlaying === selectedRecording.id ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleTranscribe}
                  className="bg-wordy-accent text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors"
                  disabled={isTranscribing}
                >
                  {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                </button>
              </div>
              <Transcription transcription={transcription} isLoading={isTranscribing} />
              <AIChat
                messages={messages}
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
                handleChatSubmit={handleChatSubmit}
                isLoading={isLoading}
                transcription={transcription} // Pass the transcription to AIChat component
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
