from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SOUNDCLOUD_CLIENT_ID = os.getenv("SOUNDCLOUD_CLIENT_ID")
SOUNDCLOUD_CLIENT_SECRET = os.getenv("SOUNDCLOUD_CLIENT_SECRET")

class SpotifyToken(BaseModel):
    access_token: str

class Track(BaseModel):
    id: str
    name: str
    artist: str
    preview_url: Optional[str]

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Spotify-SoundCloud Discovery API"}

@app.post("/spotify/exchange-token")
async def exchange_spotify_token(code: str):
    token_url = "https://accounts.spotify.com/api/token"
    
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": "http://localhost:3000/callback",
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET,
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange token")
        
    return response.json()

@app.get("/spotify/tracks/{track_id}")
async def get_spotify_track(track_id: str, token: SpotifyToken):
    url = f"https://api.spotify.com/v1/tracks/{track_id}"
    headers = {"Authorization": f"Bearer {token.access_token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch track")
        
    track_data = response.json()
    return Track(
        id=track_data["id"],
        name=track_data["name"],
        artist=track_data["artists"][0]["name"],
        preview_url=track_data.get("preview_url")
    )

@app.get("/soundcloud/search")
async def search_soundcloud(query: str):
    # Note: This is a placeholder. You'll need to implement the actual SoundCloud API integration
    # once you have the API credentials
    url = "https://api.soundcloud.com/tracks"
    params = {
        "q": query,
        "client_id": SOUNDCLOUD_CLIENT_ID,
        "limit": 10
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to search SoundCloud")
        
    return response.json()
