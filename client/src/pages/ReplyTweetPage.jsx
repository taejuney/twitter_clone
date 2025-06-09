import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../context/AuthContext';

export default function ReplyTweetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);        // { user, token, login, logout }
  const [tweet, setTweet] = useState(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // fetch the tweet we’re replying to
    fetch(`/tweets/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(setTweet)
      .catch(() => setError('Failed to load tweet.'));
  }, [id, auth.token]);

  const handleReply = async () => {
    if (!content.trim()) {
      setError('Reply cannot be empty.');
      return;
    }

    const res = await fetch('/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        tweet_id: parseInt(id, 10),
        content: content.trim()
      })
    });

    if (res.ok) {
      navigate(`/replies/${id}`);
    } else {
      const body = await res.json();
      setError(body.msg || 'Failed to post reply.');
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-8 max-w-md mx-auto">
        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        {tweet ? (
          <>
            <div className="mb-4 bg-gray-100 p-4 rounded">
              <p className="font-semibold">@{tweet.author}</p>
              <p className="mt-2">{tweet.content}</p>
            </div>

            <h2 className="text-xl mb-4">Your reply</h2>
            <textarea
              rows={4}
              placeholder="Write your reply..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="border p-2 w-full mb-4"
            />

            <button
              onClick={handleReply}
              className="bg-green-500 hover:bg-green-600 text-white p-2 w-full rounded"
            >
              Post Reply
            </button>
          </>
        ) : (
          !error && <p>Loading tweet…</p>
        )}
      </div>
    </div>
  );
}
