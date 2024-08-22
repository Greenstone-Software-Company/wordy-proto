import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import AudioRecorder from '../components/AudioRecorder';
import RecordingsList from '../components/VoiceNotes/RecordingsList';
import Transcription from '../components/Transcription';
import AIChat from '../components/VoiceNotes/AIChat';
import FileUpload from '../components/VoiceNotes/FileUpload';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import dynamic from 'next/dynamic';

const WaveSurfer = dynamic(() => import('wavesurfer.js').then(module => module.default), { ssr: false });

export default function VoiceNotesPage() {
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');

  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && waveformRef.current && selectedRecording) {
      const initWaveSurfer = async () => {
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

        if (selectedRecording.url) {
          try {
            await wavesurfer.current.load(selectedRecording.url);
          } catch (error) {
            console.error('Error loading audio:', error);
            setError('Failed to load audio. Please try again.');
          }
        }
      };

      initWaveSurfer();
    }
  }, [selectedRecording]);

  const fetchRecordings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const recordingsRef = collection(db, 'recordings');
    const q = query(
      recordingsRef,
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    try {
      const querySnapshot = await getDocs(q);
      const fetchedRecordings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecordings(fetchedRecordings);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError('Failed to fetch recordings');
    }
  };

  const handleNewRecording = async (newRecording) => {
    const user = auth.currentUser;
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const storageRef = ref(storage, `recordings/${user.uid}/${newRecording.name}`);
      await uploadBytes(storageRef, newRecording.file);
      const url = await getDownloadURL(storageRef);

      const recordingData = {
        userId: user.uid,
        name: newRecording.name,
        url: url,
        duration: newRecording.duration,
        timestamp: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'recordings'), recordingData);
      const recordingWithId = { id: docRef.id, ...recordingData };
      setRecordings(prevRecordings => [recordingWithId, ...prevRecordings]);
      setSelectedRecording(recordingWithId);
    } catch (error) {
      console.error('Error saving new recording:', error);
      setError('Failed to save new recording');
    }
  };

  const handleFileUpload = async (newRecording) => {
    await handleNewRecording(newRecording);
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
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ recordingUrl: selectedRecording.url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      setSelectedRecording({ ...selectedRecording, transcription: data.transcription });
    } catch (error) {
      console.error('Transcription error:', error);
      setError(`Failed to transcribe audio: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handlePlayPause = (id) => {
    if (wavesurfer.current) {
      if (currentlyPlaying === id) {
        wavesurfer.current.playPause();
        setCurrentlyPlaying(wavesurfer.current.isPlaying() ? id : null);
      } else {
        wavesurfer.current.stop();
        const recordingToPlay = recordings.find(r => r.id === id);
        if (recordingToPlay && recordingToPlay.url) {
          wavesurfer.current.load(recordingToPlay.url);
          setTimeout(() => {
            wavesurfer.current.play();
            setCurrentlyPlaying(id);
          }, 100);
        }
      }
    }
  };

  const handleDeleteAll = () => {
    setRecordings([]);
    setSelectedRecording(null);
    setTranscription('');
    setMessages([]);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // Add user message to chat
    setMessages([...messages, { text: chatMessage, isUser: true }]);
    setChatMessage(''); // Clear the input

    try {
      // Simulate AI response
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatMessage }),
      });

      const responseData = await aiResponse.json();
      setMessages((prevMessages) => [...prevMessages, { text: responseData.response, isUser: false }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setError('Failed to get AI response.');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Wordy - Voice Notes</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-wordy-bg rounded-lg p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6 text-wordy-text">Voice Notes AI</h1>
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <button 
            onClick={handleDeleteAll} 
            className="bg-wordy-accent text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors mb-4 md:mb-0"
          >
            Delete All
          </button>
          <div className="flex space-x-4">
            <AudioRecorder onNewRecording={handleNewRecording} />
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecordingsList
            recordings={recordings}
            onRecordingSelect={handleRecordingSelect}
            onRecordingDelete={handleRecordingDelete}
            onPlayPause={handlePlayPause}
            currentlyPlaying={currentlyPlaying}
          />
          {selectedRecording && (
            <div className="bg-wordy-secondary-bg rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4 text-wordy-text">Recording {selectedRecording.name}</h2>
              <div ref={waveformRef} className="bg-wordy-bg p-4 rounded mb-4 h-24"></div>
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => handlePlayPause(selectedRecording.id)}
                  className="bg-wordy-accent text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors"
                >
                  {currentlyPlaying === selectedRecording.id ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleTranscribe}
                  className="bg-wordy-primary text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors"
                  disabled={isTranscribing}
                >
                  {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                </button>
              </div>
              <Transcription transcription={transcription} isLoading={isTranscribing} />
              <AIChat
                messages={messages}
                chatMessage={chatMessage} // Pass chatMessage state
                setChatMessage={setChatMessage} // Pass setChatMessage function
                handleChatSubmit={handleChatSubmit} // Pass handleChatSubmit function
                isLoading={isTranscribing}
                transcription={transcription}
              />
            </div>
          )}
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </Layout>
  );
}
