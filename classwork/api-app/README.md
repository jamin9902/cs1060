# Spotify-SoundCloud Music Discovery App

This application allows users to discover SoundCloud music based on their Spotify preferences. Users can select songs or playlists from their Spotify account and find similar tracks on SoundCloud.

## Features

- Spotify Authentication and Integration
- Song/Playlist selection from Spotify
- SoundCloud track discovery
- Similar music recommendations
- Modern, responsive UI

## Tech Stack

- Frontend: Next.js 14 with TypeScript
- Backend: FastAPI
- Authentication: OAuth 2.0
- APIs: Spotify Web API, SoundCloud API

## Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
Create `.env.local` in the frontend directory and `.env` in the backend directory with your API keys:

```env
# Frontend (.env.local)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id
SOUNDCLOUD_CLIENT_SECRET=your_soundcloud_client_secret
```

4. Run the development servers:

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
uvicorn main:app --reload
```

Visit `http://localhost:3000` to use the application.
