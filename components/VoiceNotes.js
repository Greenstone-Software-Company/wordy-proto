import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
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
import WaveSurfer from 'wavesurfer.js';
import Button from '../../Button';  // Corrected path
import Card from '../../Card';      // Corrected path


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
    fetchRecordings();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && waveformRef.current && selectedRecording) {
      initWaveSurfer();
    }
  }, [selectedRecording]);

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

  return (
    <Layout>
      <Head>
        <title>Wordy - Voice Notes</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-wordy-bg min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-wordy-text">Voice Notes AI</h1>
          <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            <div className="w-full lg:w-1/3">
              <Card className="mb-6"> {/* Changed this part */}
                <div className="flex justify-between items-center mb-4">
                  <AudioRecorder onNewRecording={handleNewRecording} />
                  <FileUpload onFileUpload={handleFileUpload} />
                </div>
                <Button 
                  onClick={handleDeleteAll} 
                  variant="accent"
                  className="w-full"
                >
                  Delete All
                </Button>
              </Card>
              <RecordingsList
                recordings={recordings}
                onRecordingSelect={handleRecordingSelect}
                onRecordingDelete={handleRecordingDelete}
                onPlayPause={handlePlayPause}
                currentlyPlaying={currentlyPlaying}
              />
            </div>
            <div className="w-full lg:w-2/3">
              {selectedRecording ? (
                <Card> {/* Changed this part */}
                  <h2 className="text-2xl font-semibold mb-4 text-wordy-text">{selectedRecording.name}</h2>
                  <div ref={waveformRef} className="bg-wordy-bg p-4 rounded mb-4"></div>
                  <div className="flex justify-between mb-4">
                    <Button
                      onClick={() => handlePlayPause(selectedRecording.id)}
                      variant="primary"
                    >
                      {currentlyPlaying === selectedRecording.id ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      onClick={handleTranscribe}
                      variant="secondary"
                      disabled={isTranscribing}
                    >
                      {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                    </Button>
                  </div>
                  <Transcription transcription={transcription} isLoading={isTranscribing} />
                </Card>
              ) : (
                <Card className="flex items-center justify-center h-64"> {/* Changed this part */}
                  <p className="text-wordy-text text-lg">Select a recording to view details</p>
                </Card>
              )}
            </div>
          </div>
        </div>
        <div className="fixed bottom-6 right-6 w-80">
          <AIChat
            messages={messages}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            handleChatSubmit={handleChatSubmit}
            isLoading={isLoading}
            transcription={transcription}
          />
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </Layout>
  );
}
