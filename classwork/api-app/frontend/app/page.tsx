'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSpotifyLogin = () => {
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirect_uri = 'http://localhost:3000/callback';
    const scope = 'playlist-read-private user-library-read';
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Spotify to SoundCloud Discovery
        </h1>
        
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8 shadow-lg">
          <p className="text-lg text-center mb-8">
            Discover similar tracks on SoundCloud based on your Spotify music taste
          </p>
          
          {!isAuthenticated ? (
            <button
              onClick={handleSpotifyLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-200"
            >
              Connect with Spotify
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-200"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
