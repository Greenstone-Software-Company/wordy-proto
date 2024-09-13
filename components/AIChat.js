import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const AIChat = ({ messages, chatMessage, setChatMessage, handleChatSubmit, isLoading, transcription }) => {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-wordy-secondary-bg rounded-lg p-4 shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-wordy-text">Wordy AI</h3>
      <div
        ref={chatContainerRef}
        className="bg-wordy-bg p-4 rounded-lg mb-4 h-64 overflow-y-auto custom-scrollbar"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.isUser ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.isUser
                  ? 'bg-wordy-primary text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-center">
            <div className="inline-block animate-bounce bg-wordy-accent rounded-full w-2 h-2 mr-1"></div>
            <div className="inline-block animate-bounce bg-wordy-accent rounded-full w-2 h-2 mr-1" style={{animationDelay: '0.2s'}}></div>
            <div className="inline-block animate-bounce bg-wordy-accent rounded-full w-2 h-2" style={{animationDelay: '0.4s'}}></div>
          </div>
        )}
      </div>
      <form onSubmit={handleChatSubmit} className="flex items-center">
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Ask about the transcription..."
          className="flex-grow p-2 rounded-l bg-white text-gray-800 border border-wordy-accent focus:outline-none focus:ring-2 focus:ring-wordy-primary"
          disabled={isLoading || !transcription}
        />
        <button
          type="submit"
          className="bg-wordy-primary text-white p-2 rounded-r hover:bg-opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center"
          disabled={isLoading || !transcription || !chatMessage.trim()}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
      {!transcription && (
        <p className="text-wordy-text opacity-50 mt-2 text-sm">
          Transcribe audio to start chatting with Wordy AI
        </p>
      )}
    </div>
  );
};

export default AIChat;