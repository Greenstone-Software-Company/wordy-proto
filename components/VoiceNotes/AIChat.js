import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, UserIcon, BoltIcon } from '@heroicons/react/24/solid';

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
      <h2 className="text-xl font-semibold mb-4 text-wordy-text flex items-center">
        <BoltIcon className="h-6 w-6 mr-2 text-wordy-accent" />
        AI Chat
      </h2>
      <div className="bg-wordy-bg p-4 rounded">
        <div className="h-60 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-wordy-primary text-white'
                    : 'bg-wordy-accent text-wordy-bg'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.isUser ? (
                    <UserIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <BoltIcon className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-semibold">
                    {message.isUser ? 'You' : 'AI'}
                  </span>
                </div>
                <p>{message.text}</p>
                <p className="text-xs mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-wordy-accent text-wordy-bg p-3 rounded-lg">
                <div className="flex items-center">
                  <BoltIcon className="h-4 w-4 mr-2" />
                  <span className="font-semibold">AI is thinking...</span>
                </div>
                <div className="mt-2 flex space-x-1">
                  <div className="w-2 h-2 bg-wordy-bg rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-wordy-bg rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-wordy-bg rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleChatSubmit} className="flex items-center">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 rounded-l bg-wordy-bg text-wordy-text border border-wordy-accent focus:outline-none focus:ring-2 focus:ring-wordy-primary"
            disabled={isLoading || !transcription}
          />
          <button
            type="submit"
            className="bg-wordy-primary text-white p-2 rounded-r hover:bg-opacity-80 transition-colors disabled:opacity-50"
            disabled={isLoading || !transcription || !chatMessage.trim()}
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {!transcription && (
          <p className="text-wordy-text opacity-50 mt-2 text-sm">
            Transcribe audio to start chatting with AI
          </p>
        )}
      </div>
    </div>
  );
};

export default AIChat;