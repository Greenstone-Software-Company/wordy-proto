import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import AudioRecorder from '../components/AudioRecorder';
import RecordingsList from '../components/VoiceNotes/RecordingsList';
import Transcription from '../components/Transcription';
import AIChat from '../components/AIChat';
import FileUpload from '../components/VoiceNotes/FileUpload';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

// Dynamically import WaveSurfer with ssr option set to false
const WaveSurfer = dynamic(() => import('wavesurfer.js'), { ssr: false });

// ... (rest of the code remains the same)

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
  const audioRef = useRef(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && waveformRef.current && selectedRecording) {
      initWaveSurfer();
    }
    if (selectedRecording && audioRef.current) {
      audioRef.current.src = selectedRecording.url;
      audioRef.current.load();
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

  const initWaveSurfer = async () => {
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4AB586',
      progressColor: '#2C7D59',
      cursorColor: '#2C7D59',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 80,
      barGap: 2,
      responsive: true,
      normalize: true,
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
      toast.success('New recording added successfully!');
    } catch (error) {
      console.error('Error saving new recording:', error);
      setError('Failed to save new recording');
      toast.error('Failed to save new recording');
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
    toast.info('Recording deleted');
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
        throw new Error('Error transcribing audio');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      
      // Update the recording in Firestore with the new transcription
      const recordingRef = doc(db, 'recordings', selectedRecording.id);
      await updateDoc(recordingRef, { transcription: data.transcription });
      
      setSelectedRecording({ ...selectedRecording, transcription: data.transcription });
      toast.success('Transcription completed successfully!');
    } catch (error) {
      console.error('Transcription error:', error);
      setError(`Failed to transcribe audio: ${error.message}`);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setIsLoading(true);
    setMessages(prevMessages => [...prevMessages, { text: chatMessage, isUser: true }]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatMessage, transcription }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get AI response. Please try again.');
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
      setChatMessage('');
    }
  };

  const handleDeleteAll = () => {
    setRecordings([]);
    setSelectedRecording(null);
    setTranscription('');
    setMessages([]);
    toast.info('All recordings deleted');
  };

  const handlePlayPause = (id) => {
    if (audioRef.current) {
      if (currentlyPlaying === id) {
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
        setCurrentlyPlaying(audioRef.current.paused ? null : id);
      } else {
        audioRef.current.pause();
        const recordingToPlay = recordings.find(r => r.id === id);
        if (recordingToPlay && recordingToPlay.url) {
          audioRef.current.src = recordingToPlay.url;
          audioRef.current.load();
          audioRef.current.play();
          setCurrentlyPlaying(id);
        }
      }
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
              <audio ref={audioRef} className="w-full mb-4" controls />
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
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
                handleChatSubmit={handleChatSubmit}
                isLoading={isLoading}
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
