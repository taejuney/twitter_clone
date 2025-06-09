import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../context/AuthContext';

export default function ReplyTweetPage() {
  const { id } = useParams();           // original tweet ID
  const { user, token } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleReply = async () => {
    if (!content.trim()) return alert('Reply cannot be empty');
    const res = await fetch('/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tweet_id: Number(id), content })
    });
    if (res.ok) {
      // go show all replies (including this one)
      navigate(`/replies/${id}`);
    } else {
      const err = await res.json().catch(()=>null);
      alert(`Failed to post reply: ${err?.msg||res.statusText}`);
    }
  };

  return (
    <div>
      <NavBar/>
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
