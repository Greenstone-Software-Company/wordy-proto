import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import AudioRecorder from '../components/AudioRecorder';
import RecordingsList from '../components/VoiceNotes/RecordingsList';
import Transcription from '../components/Transcription';
import AIChat from '../components/VoiceNotes/AIChat';
import FileUpload from '../components/VoiceNotes/FileUpload';
import { FaSearch } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js';

export default function VoiceNotesPage() {
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
        waveColor: '#4AB586',
        progressColor: '#4AB586',
        cursorColor: '#6366F1',
        barWidth: 3,
        barRadius: 3,
        cursorWidth: 1,
        height: 120,
        barGap: 2,
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
        <title>Wordy - Voice Notes</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-[#141414] min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-extrabold mb-8">Voice Notes AI</h1>
        
        <div className="w-[80%] max-w-lg mb-8 relative">
          <input
            type="text"
            placeholder="Search recordings..."
            className="w-full p-4 rounded-lg text-black bg-gray-200 placeholder-gray-500 focus:outline-none"
          />
          <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        <div className="flex justify-center items-center space-x-4 mb-8 w-full max-w-lg">
          <button onClick={handleFileUpload} className="bg-[#4AB586] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#3e9a6e] transition-all w-1/3 text-center">
            Upload
          </button>
          <button onClick={handleNewRecording} className="bg-[#4AB586] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#3e9a6e] transition-all w-1/3 text-center">
            Record
          </button>
          <button onClick={handleDeleteAll} className="bg-[#4AB586] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#3e9a6e] transition-all w-1/3 text-center">
            Delete All
          </button>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <RecordingsList
            recordings={recordings}
            onRecordingSelect={handleRecordingSelect}
            onRecordingDelete={handleRecordingDelete}
            onPlayPause={handlePlayPause}
            currentlyPlaying={currentlyPlaying}
          />
          {selectedRecording && (
            <div className="bg-[#1A202C] rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Recording {selectedRecording.id}</h2>
              <div ref={waveformRef} className="bg-[#2D3748] p-4 rounded mb-6 h-28"></div>
              <div className="flex justify-between mb-6">
                <button
                  onClick={() => handlePlayPause(selectedRecording.id)}
                  className="bg-[#4AB586] text-white px-5 py-3 rounded-lg shadow-lg hover:bg-[#3e9a6e] transition-all w-1/2"
                >
                  {currentlyPlaying === selectedRecording.id ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleTranscribe}
                  className="bg-[#6366F1] text-white px-5 py-3 rounded-lg shadow-lg hover:bg-opacity-80 transition-all w-1/2"
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
                transcription={transcription}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
