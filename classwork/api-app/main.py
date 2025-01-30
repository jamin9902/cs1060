from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from dotenv import load_dotenv
from typing import Optional
import base64
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spotify API configuration
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"

# SoundCloud API configuration
SOUNDCLOUD_CLIENT_ID = os.getenv("SOUNDCLOUD_CLIENT_ID")
SOUNDCLOUD_API_BASE_URL = "https://api.soundcloud.com"

class SpotifyToken(BaseModel):
    access_token: str

async def get_spotify_token(code: str):
    auth_header = base64.b64encode(
        f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPOTIFY_AUTH_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": "http://localhost:3000/callback",
            },
            headers={"Authorization": f"Basic {auth_header}"},
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Spotify token")
        
        return response.json()

@app.post("/api/spotify/auth")
async def spotify_auth(code: str):
    token_data = await get_spotify_token(code)
    return JSONResponse(content=token_data)

@app.get("/api/spotify/playlists")
async def get_playlists(token: SpotifyToken):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE_URL}/me/playlists",
            headers={"Authorization": f"Bearer {token.access_token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch playlists")
        
        return response.json()

@app.get("/api/spotify/tracks/{playlist_id}")
async def get_playlist_tracks(playlist_id: str, token: SpotifyToken):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE_URL}/playlists/{playlist_id}/tracks",
            headers={"Authorization": f"Bearer {token.access_token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch tracks")
        
        return response.json()

@app.get("/api/soundcloud/search")
async def search_soundcloud(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SOUNDCLOUD_API_BASE_URL}/tracks",
            params={
                "q": query,
                "client_id": SOUNDCLOUD_CLIENT_ID,
                "limit": 10
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to search SoundCloud")
        
        return response.json()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
