import { useState, useEffect } from 'react';

interface Track {
  name: string;
  artist: string;
  album: string;
  image_url: string | null;
}

interface ErrorMessage {
  message: string;
  type: 'error' | 'info';
}

export default function SpotifyDashboard() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/spotify/login');
      if (!response.ok) throw new Error('Failed to get login URL');
      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) {
      setError({ message: 'Failed to connect to Spotify', type: 'error' });
      console.error('Error during login:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTrack = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/spotify/current-track');
      if (!response.ok) throw new Error('Failed to fetch current track');
      const data = await response.json();
      if ('message' in data) {
        setCurrentTrack(null);
      } else {
        setCurrentTrack(data);
      }
      return true;
    } catch (error) {
      console.error('Error fetching current track:', error);
      return false;
    }
  };

  const fetchTopTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/spotify/top-tracks');
      if (!response.ok) throw new Error('Failed to fetch top tracks');
      const data = await response.json();
      setTopTracks(data);
    } catch (error) {
      setError({ message: 'Failed to fetch top tracks', type: 'error' });
      console.error('Error fetching top tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check login status and start auto-refresh
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await fetchCurrentTrack();
      setIsLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        fetchTopTracks();
      }
    };

    checkLoginStatus();

    // Auto-refresh current track every 30 seconds if logged in
    const refreshInterval = setInterval(() => {
      if (isLoggedIn) {
        fetchCurrentTrack();
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [isLoggedIn]);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="space-y-8 p-6">
      {error && (
        <div className={`p-4 rounded-md ${error.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {error.message}
          <button onClick={() => setError(null)} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {!isLoggedIn ? (
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Connecting...' : 'Connect to Spotify'}
        </button>
      ) : (
        <div className="space-y-6">
          {/* Current Track */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Now Playing</h2>
              <button
                onClick={fetchCurrentTrack}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Refresh
              </button>
            </div>
            {currentTrack ? (
              <div className="flex items-center space-x-4">
                {currentTrack.image_url && (
                  <img
                    src={currentTrack.image_url}
                    alt={currentTrack.album}
                    className="w-16 h-16 rounded-md shadow-sm"
                  />
                )}
                <div>
                  <p className="font-semibold">{currentTrack.name}</p>
                  <p className="text-gray-600">{currentTrack.artist}</p>
                  <p className="text-gray-500 text-sm">{currentTrack.album}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No track currently playing</p>
            )}
          </div>

          {/* Top Tracks */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Your Top Tracks</h2>
              <button
                onClick={fetchTopTracks}
                disabled={loading}
                className={`text-green-600 hover:text-green-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="grid gap-4">
              {topTracks.map((track, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  {track.image_url && (
                    <img
                      src={track.image_url}
                      alt={track.album}
                      className="w-12 h-12 rounded-md shadow-sm"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{track.name}</p>
                    <p className="text-gray-600">{track.artist}</p>
                    <p className="text-gray-500 text-sm">{track.album}</p>
                  </div>
                </div>
              ))}
              {topTracks.length === 0 && !loading && (
                <p className="text-gray-600 text-center py-4">No top tracks found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
