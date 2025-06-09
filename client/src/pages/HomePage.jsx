import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const [tweets, setTweets] = useState([]);
  const navigate = useNavigate();

  // fetch feed on mount
  useEffect(() => {
    async function load() {
      const res = await fetch('/tweets/feed', {
        headers: { 
          'Authorization': `Bearer ${user.token}` 
        }
      });
      if (!res.ok) {
        console.error('Failed to load feed');
        return;
      }
      setTweets(await res.json());
    }
    load();
  }, [user]);

  if (!Array.isArray(tweets)) {
    return <div>Failed to load feed</div>;
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
                  // reload feed
                  const r2 = await fetch('/tweets/feed', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                  });
                  setTweets(await r2.json());
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
                  // reload feed
                  const r2 = await fetch('/tweets/feed', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                  });
                  setTweets(await r2.json());
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
