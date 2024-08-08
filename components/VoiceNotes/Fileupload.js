import React, { useRef } from 'react';

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      const newRecording = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        file: file,
        name: file.name,
        duration: '0:00', // You'll need to implement duration calculation
        timestamp: new Date().toISOString()
      };
      onFileUpload(newRecording);
    } else {
      alert('Please upload an audio file.');
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="bg-wordy-accent text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors"
      >
        Upload Audio File
      </button>
    </div>
  );
};

export default FileUpload;