import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const [tweets, setTweets] = useState([]); 
  const [error, setError]   = useState('');
  const navigate             = useNavigate();

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/tweets/feed', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.msg || res.statusText);
        }
        setTweets(await res.json());
      } catch (err) {
        console.error(err);
        setError('Failed to load feed.');
      }
    })();
  }, [user]);

  if (error) {
    return (
      <div>
        <NavBar />
        <p className="text-red-500 text-center mt-6">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <main className="max-w-xl mx-auto mt-6 space-y-4">
        {tweets.map(t => (
          <article
            key={t.id}
            className="bg-white p-4 rounded-lg shadow relative cursor-pointer"
            onClick={() => navigate(`/replies/${t.id}`)}
          >
            <Link
              to={`/profile/${t.author}`}
              className="font-semibold text-gray-900 hover:text-blue-500"
              onClick={e => e.stopPropagation()}
            >
              @{t.author}
            </Link>
            <p className="mt-2 text-gray-800">{t.content}</p>
            <div className="mt-3 flex space-x-4 text-gray-500">
              <button
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/post/${t.id}`);
                }}
                className="hover:text-blue-500"
              >
                Reply
              </button>
              <button
                onClick={async e => {
                  e.stopPropagation();
                  await fetch(`/retweet/${t.id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${user.token}` }
                  });
                }}
                className="hover:text-blue-500"
              >
                Retweet
              </button>
              <button
                onClick={async e => {
                  e.stopPropagation();
                  await fetch(`/like/${t.id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${user.token}` }
                  });
                }}
                className="hover:text-red-500"
              >
                Like
              </button>
            </div>
          </article>
        ))}
        <button
          onClick={() => navigate('/post')}
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
        >
          +
        </button>
      </main>
    </div>
  );
}
