import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function NewTweetPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const handlePost = () => navigate('/');

  return (
    <div>
      <NavBar />
      <div className="p-8 max-w-md mx-auto">
        <h2 className="text-xl mb-4">New Tweet</h2>
        <textarea
          rows={4}
          placeholder="What's happening?"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button onClick={handlePost} className="bg-blue-500 text-white p-2 w-full">
          Post
        </button>
      </div>
    </div>
  );
}