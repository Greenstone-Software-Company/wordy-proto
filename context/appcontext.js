// context/appcontext.js
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [transcription, setTranscription] = useState('');

  const value = {
    recordings,
    setRecordings,
    selectedRecording,
    setSelectedRecording,
    transcription,
    setTranscription,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);