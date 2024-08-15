// pages/register.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wordy-bg">
      <div className="bg-wordy-secondary-bg p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-wordy-text">Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-wordy-text mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-wordy-bg text-wordy-text"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-wordy-text mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-wordy-bg text-wordy-text"
              required
            />
          </div>
          <button type="submit" className="w-full bg-wordy-primary text-white p-2 rounded hover:bg-opacity-80">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}