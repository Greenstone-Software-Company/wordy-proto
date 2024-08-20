import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For confirm password
  const [username, setUsername] = useState(''); // For username
  const [name, setName] = useState(''); // For name
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414]">
      <div className="bg-[#141414] p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Sign Up</h1>
        <p className="text-sm text-white mb-6 text-center">
          Create your account to get started with our services.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#4AB586] bg-[#141414] text-white"
              required
            />
          </div>
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
            <label htmlFor="username" className="block text-sm font-medium text-white">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#4AB586] bg-[#141414] text-white"
              required
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="password" className="block text-sm font-medium text-white">Set your password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#4AB586] bg-[#141414] text-white"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">Confirm your password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-[#4AB586] bg-[#141414] text-white"
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="h-4 w-4 text-[#4AB586] border-gray-300 rounded focus:ring-[#4AB586] bg-[#141414]"
            />
            <label htmlFor="terms" className="text-sm text-white">
              Agree to terms and privacy policy
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-[#4AB586] text-white p-2 rounded-lg font-semibold hover:bg-opacity-80 transition-colors"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-center text-white mt-6">
          Already a member? <a href="/login" className="text-[#4AB586] font-semibold">Log In</a>
        </p>
      </div>
    </div>
  );
}
