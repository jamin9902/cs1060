# Next.js + FastAPI Web Application

This is a modern web application built with Next.js frontend and FastAPI backend.

## Project Structure
```
api-app/
├── frontend/           # Next.js frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   └── models/
│   └── requirements.txt
└── README.md
```

## Setup Instructions

### Backend Setup
1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup
1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Development
- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:8000
- API documentation: http://localhost:8000/docs

## Technologies Used
- Frontend:
  - Next.js 14
  - React
  - Tailwind CSS
  - TypeScript
- Backend:
  - FastAPI
  - Python 3.9+
  - Pydantic
