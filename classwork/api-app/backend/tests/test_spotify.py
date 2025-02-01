import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

def test_spotify_login(client):
    response = client.get("/api/spotify/login")
    assert response.status_code == 200
    assert response.json() == {"auth_url": "https://accounts.spotify.com/authorize/mock"}

def test_spotify_callback_success(client):
    response = client.get("/api/spotify/callback?code=test_code&state=test_state")
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["access_token"] == "mock_access_token"

def test_spotify_callback_failure(client):
    with patch('app.routers.spotify._spotify_oauth') as mock_oauth:
        mock_oauth.get_access_token.side_effect = Exception("OAuth Error")
        response = client.get("/api/spotify/callback?code=invalid_code&state=test_state")
        assert response.status_code == 400
        assert "detail" in response.json()

def test_current_track_success(client):
    response = client.get("/api/spotify/current-track")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Track"
    assert data["artist"] == "Test Artist"
    assert data["album"] == "Test Album"
    assert data["image_url"] == "https://example.com/image.jpg"

def test_current_track_no_playing(client):
    with patch('app.routers.spotify._spotify_client') as mock_client:
        mock_client.current_user_playing_track.return_value = None
        response = client.get("/api/spotify/current-track")
        assert response.status_code == 200
        assert response.json() == {"message": "No track currently playing"}

def test_top_tracks_success(client):
    response = client.get("/api/spotify/top-tracks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    for i, track in enumerate(data):
        assert track["name"] == f"Top Track {i}"
        assert track["artist"] == f"Artist {i}"
        assert track["album"] == f"Album {i}"
        assert track["image_url"] == f"https://example.com/image{i}.jpg"

def test_top_tracks_failure(client):
    with patch('app.routers.spotify._spotify_client') as mock_client:
        mock_client.current_user_top_tracks.side_effect = Exception("API Error")
        response = client.get("/api/spotify/top-tracks")
        assert response.status_code == 400
        assert "detail" in response.json()
