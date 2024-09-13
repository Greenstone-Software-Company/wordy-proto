import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';
import WaveSurfer from 'wavesurfer.js';

const AudioRecorder = ({ onNewRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerInterval = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    // Cleanup interval and wavesurfer on component unmount
    return () => {
      clearInterval(timerInterval.current);
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4AB586',
        progressColor: '#2C7D59',
        cursorColor: '#2C7D59',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 40,
        barGap: 2,
        responsive: true,
        normalize: true,
      });
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
        if (wavesurfer.current) {
          wavesurfer.current.loadBlob(new Blob(audioChunks.current, { type: 'audio/wav' }));
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const fileName = `recording_${Date.now()}.wav`;

        const newRecording = {
          id: Date.now().toString(),
          url: audioUrl,
          file: new File([audioBlob], fileName, { type: 'audio/wav' }),
          name: `Recording ${new Date().toLocaleString()}`,
          duration: formatTime(recordingTime),
          timestamp: new Date().toISOString(),
        };

        onNewRecording(newRecording);
        audioChunks.current = [];
      };

      mediaRecorder.current.start(250); // Collect data every 250ms
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current && isRecording && isPaused) {
      mediaRecorder.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const startTimer = () => {
    timerInterval.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerInterval.current);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-wordy-accent text-white font-bold py-2 px-4 rounded hover:bg-opacity-80 transition-colors flex items-center"
          >
            <MicrophoneIcon className="h-5 w-5 mr-2" />
            Start Recording
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-opacity-80 transition-colors flex items-center"
              >
                <PauseIcon className="h-5 w-5 mr-2" />
                Pause
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-opacity-80 transition-colors flex items-center"
              >
                <MicrophoneIcon className="h-5 w-5 mr-2" />
                Resume
              </button>
            )}
            <button
              onClick={stopRecording}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-opacity-80 transition-colors flex items-center"
            >
              <StopIcon className="h-5 w-5 mr-2" />
              Stop
            </button>
          </>
        )}
        {isRecording && (
          <span className="font-semibold">{formatTime(recordingTime)}</span>
        )}
      </div>
      {isRecording && (
        <div ref={waveformRef} className="mt-4 bg-wordy-bg p-2 rounded"></div>
      )}
    </div>
  );
};

export default AudioRecorder;
