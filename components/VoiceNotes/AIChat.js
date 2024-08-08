import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const AIChat = ({ transcription }) => {
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isLoading) return;

    const userMessage = { text: chatMessage, isUser: true, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setChatMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatMessage, transcription }),
      });

      if (!response.ok) {
        throw new Error('AI response failed');
      }

      const data = await response.json();
      const aiMessage = { text: data.response, isUser: false, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [...prev, { text: "Sorry, I couldn't process that request.", isUser: false, timestamp: new Date() }]);
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-wordy-secondary-bg rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-wordy-text">AI Chat</h2>
      <div className="bg-wordy-bg p-4 rounded">
        <div className="h-60 overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-xs md:max-w-md p-2 rounded-lg ${message.isUser ? 'bg-wordy-primary text-white' : 'bg-wordy-accent text-wordy-bg'}`}
              >
                <p>{message.text}</p>
                <p className="text-xs mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block bg-wordy-accent text-wordy-bg p-2 rounded-lg">
                <p>AI is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleChatSubmit} className="flex">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 rounded-l bg-wordy-bg text-wordy-text border border-wordy-accent focus:outline-none focus:ring-2 focus:ring-wordy-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-wordy-primary text-white px-4 py-2 rounded-r hover:bg-opacity-80 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : <PaperAirplaneIcon className="h-5 w-5" />}
          </button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default AIChat;
