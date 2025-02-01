import pytest
from fastapi.testclient import TestClient
from app.main import app
import os
from unittest.mock import patch, MagicMock

@pytest.fixture(autouse=True)
def mock_env_vars():
    with patch.dict(os.environ, {
        'SPOTIFY_CLIENT_ID': 'test_client_id',
        'SPOTIFY_CLIENT_SECRET': 'test_client_secret',
        'SPOTIFY_REDIRECT_URI': 'http://localhost:8000/api/callback'
    }):
        yield

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def mock_spotify():
    # Create a mock Spotify instance
    mock_spotify = MagicMock()
    mock_spotify.current_user_playing_track.return_value = {
        "item": {
            "name": "Test Track",
            "artists": [{"name": "Test Artist"}],
            "album": {
                "name": "Test Album",
                "images": [{"url": "https://example.com/image.jpg"}]
            }
        }
    }
    
    mock_spotify.current_user_top_tracks.return_value = {
        "items": [
            {
                "name": f"Top Track {i}",
                "artists": [{"name": f"Artist {i}"}],
                "album": {
                    "name": f"Album {i}",
                    "images": [{"url": f"https://example.com/image{i}.jpg"}]
                }
            }
            for i in range(3)
        ]
    }

    # Create a mock OAuth instance
    mock_auth = MagicMock()
    mock_auth.get_authorize_url.return_value = "https://accounts.spotify.com/authorize/mock"
    mock_auth.get_access_token.return_value = {
        "access_token": "mock_access_token",
        "token_type": "Bearer",
        "expires_in": 3600,
        "refresh_token": "mock_refresh_token"
    }

    with patch('app.routers.spotify._spotify_oauth', mock_auth), \
         patch('app.routers.spotify._spotify_client', mock_spotify):
        yield mock_spotify
