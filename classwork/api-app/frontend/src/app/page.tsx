'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((res) => res.json())
      .then((data) => setMessage(data.status));
  }, []);

  return (
    <main className="min-h-screen p-24">
      <div className="max-w-5xl w-full mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Welcome to Next.js + FastAPI App
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700">
            Backend Status: <span className="font-semibold">{message}</span>
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Next.js 14 with App Router</li>
              <li>FastAPI Backend</li>
              <li>TypeScript Support</li>
              <li>Tailwind CSS Styling</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
