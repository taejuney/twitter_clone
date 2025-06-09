import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../context/AuthContext';

export default function ReplyTweetPage() {
  const { user } = useContext(AuthContext);
  const { id }   = useParams();
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleReply = async () => {
    const res = await fetch('/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ tweet_id: parseInt(id), content })
    });
    if (res.ok) {
      navigate(`/replies/${id}`);
    } else {
      alert('Failed to post reply');
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-8 max-w-md mx-auto">
        <h2 className="text-xl mb-4">Reply to Tweet #{id}</h2>
        <textarea
          rows={4}
          placeholder="Your reply"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button
          onClick={handleReply}
          className="bg-green-500 text-white p-2 w-full rounded"
        >
          Reply
        </button>
      </div>
    </div>
  );
}
