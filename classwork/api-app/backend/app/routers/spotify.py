from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from dotenv import load_dotenv
from typing import Optional
from pathlib import Path

# Try multiple possible locations for .env file
possible_env_paths = [
    Path(__file__).parent.parent.parent / '.env',  # /backend/.env
    Path(__file__).parent.parent.parent / 'venv' / '.env',  # /backend/venv/.env
    Path.cwd() / '.env'  # current directory
]

env_loaded = False
for env_path in possible_env_paths:
    if env_path.exists():
        print(f"Found .env file at: {env_path}")
        load_dotenv(dotenv_path=env_path)
        env_loaded = True
        break

if not env_loaded:
    print("Warning: No .env file found in any of these locations:")
    for path in possible_env_paths:
        print(f"- {path}")

# Debug print environment variables
client_id = os.getenv('SPOTIFY_CLIENT_ID')
redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

print("Environment variables loaded:")
print(f"Client ID: {client_id[:5]}..." if client_id else "Client ID: Not found")
print(f"Redirect URI: {redirect_uri}" if redirect_uri else "Redirect URI: Not found")
print(f"Client Secret: {'*' * 5}..." if client_secret else "Client Secret: Not found")

router = APIRouter(prefix="/api/spotify", tags=["spotify"])

_spotify_oauth = None
_spotify_client = None

def get_spotify_oauth() -> SpotifyOAuth:
    global _spotify_oauth
    if _spotify_oauth is None:
        _spotify_oauth = SpotifyOAuth(
            client_id=os.getenv("SPOTIFY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
            redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
            scope="user-read-currently-playing user-top-read user-read-recently-played playlist-read-private"
        )
    return _spotify_oauth

def get_spotify() -> spotipy.Spotify:
    global _spotify_client
    if _spotify_client is None:
        _spotify_client = spotipy.Spotify(auth_manager=get_spotify_oauth())
    return _spotify_client

@router.get("/login")
async def login():
    try:
        auth_manager = get_spotify_oauth()
        auth_url = auth_manager.get_authorize_url()
        return {"auth_url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/callback")
async def callback(code: str, state: Optional[str] = None):
    try:
        auth_manager = get_spotify_oauth()
        token_info = auth_manager.get_access_token(code)
        if not token_info or "access_token" not in token_info:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        return {"access_token": token_info["access_token"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/current-track")
async def get_current_track():
    try:
        spotify = get_spotify()
        track = spotify.current_user_playing_track()
        if not track:
            return {"message": "No track currently playing"}
        return {
            "name": track["item"]["name"],
            "artist": track["item"]["artists"][0]["name"],
            "album": track["item"]["album"]["name"],
            "image_url": track["item"]["album"]["images"][0]["url"] if track["item"]["album"]["images"] else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/top-tracks")
async def get_top_tracks():
    try:
        spotify = get_spotify()
        results = spotify.current_user_top_tracks(limit=10, time_range="medium_term")
        return [{
            "name": track["name"],
            "artist": track["artists"][0]["name"],
            "album": track["album"]["name"],
            "image_url": track["album"]["images"][0]["url"] if track["album"]["images"] else None
        } for track in results["items"]]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
