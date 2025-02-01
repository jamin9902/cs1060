from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import spotify

app = FastAPI(title="Next.js + FastAPI App")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(spotify.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI Backend"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
