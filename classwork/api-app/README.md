# Spotify-SoundCloud Music Discovery App

This application allows users to find similar songs on SoundCloud based on their Spotify playlists and tracks.

## Features
- Spotify Authentication and Integration
- Access to user's Spotify playlists and tracks
- SoundCloud song discovery
- Similar song recommendations

## Tech Stack
- Frontend: Next.js
- Backend: FastAPI
- APIs: Spotify Web API, SoundCloud API

## Setup Instructions
1. Install backend dependencies:
```bash
pip install -r requirements.txt
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id
```

4. Run the development servers:
Backend:
```bash
uvicorn main:app --reload
```

Frontend:
```bash
cd frontend
npm run dev
```

## Note
You'll need to register your application with Spotify Developer Dashboard and SoundCloud Developer platform to get the required API credentials.
