'use client';

import { useState, useEffect } from 'react';
import SpotifyDashboard from '../components/SpotifyDashboard';

export default function Home() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((res) => res.json())
      .then((data) => setMessage(data.status));
  }, []);

  return (
    <main className="min-h-screen p-24">
      <div className="max-w-5xl w-full mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Spotify Integration with Next.js + FastAPI
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-700">
            Backend Status: <span className="font-semibold">{message}</span>
          </p>
        </div>

        {/* Spotify Dashboard */}
        <SpotifyDashboard />
      </div>
    </main>
  );
}
