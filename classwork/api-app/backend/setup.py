from setuptools import setup, find_packages

setup(
    name="spotify-app",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "spotipy",
        "python-dotenv",
    ],
)
