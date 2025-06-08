import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function ReplyTweetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const handleReply = () => navigate(`/replies/${id}`);

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
        <button onClick={handleReply} className="bg-green-500 text-white p-2 w-full">
          Reply
        </button>
      </div>
    </div>
  );
}