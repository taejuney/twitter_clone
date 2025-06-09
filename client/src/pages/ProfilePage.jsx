import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets]   = useState([]);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch(`/users/${username}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setProfile(data.user);
        setTweets(data.tweets);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [username, user]);

  if (error) {
    return (
      <div>
        <NavBar />
        <p className="text-red-500 text-center mt-6">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <NavBar />
        <p className="text-gray-600 text-center mt-6">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <section className="max-w-xl mx-auto mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold">@{profile.username}</h2>
        <p className="mt-2 text-gray-700">{profile.bio}</p>
        <div className="mt-4 space-y-4">
          {tweets.length > 0 ? tweets.map(t => (
            <article key={t.id} className="border-b py-2">
              <p>{t.content}</p>
              <small className="text-gray-500">
                {new Date(t.created_at).toLocaleString()}
              </small>
            </article>
          )) : (
            <p className="text-gray-600">No tweets yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
