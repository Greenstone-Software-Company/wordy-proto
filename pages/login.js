import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDevLogin = () => {
    console.log("Dev login clicked");
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414]">
      <div className="bg-[#141414] p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Login to Wordy</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#4AB586] bg-[#141414] text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#4AB586] bg-[#141414] text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#4AB586] text-white p-2 rounded-lg font-semibold hover:bg-opacity-80 transition-colors"
          >
            Login
          </button>
        </form>
        <button 
          onClick={handleDevLogin} 
          className="w-full bg-gray-500 text-white p-2 rounded-lg mt-4 hover:bg-opacity-80 transition-colors"
        >
          Dev Login (Skip Authentication)
        </button>
        <p className="text-sm text-center text-white mt-6">
          Don’t have an account?{' '}
          <Link href="/register">
            <span className="text-[#4AB586] font-semibold cursor-pointer">Sign Up</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
