import React, { useRef } from 'react';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      try {
        const fileName = `${uuidv4()}_${file.name}`;
        const storageRef = ref(storage, `recordings/${fileName}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const newRecording = {
          id: uuidv4(),
          url: url,
          name: file.name,
          duration: '0:00', // You'll need to implement duration calculation
          timestamp: new Date().toISOString(),
          file: file, // Add this line to include the file object
        };
        onFileUpload(newRecording);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
      }
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