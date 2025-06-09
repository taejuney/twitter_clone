import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function NewTweetPage() {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handlePost = async () => {
    const res = await fetch('/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ content })
    });
    if (res.ok) {
      navigate('/');
    } else {
      alert('Failed to post');
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-8 max-w-md mx-auto">
        <h2 className="text-xl mb-4">Compose new Tweet</h2>
        <textarea
          rows={4}
          placeholder="What's happening?"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button
          onClick={handlePost}
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Tweet
        </button>
      </div>
    </div>
  );
}
