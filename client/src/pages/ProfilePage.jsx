import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const { username } = useParams();
  const { user }    = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets]   = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch(`/users/${username}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) {
        console.error('failed to load profile');
        return;
      }
      const data = await res.json();
      setProfile(data.user);
      setTweets(data.tweets);
      setIsFollowing(data.is_following);
    }
    loadProfile();
  }, [username, user]);

  if (!profile) return <div>Loading profile…</div>;

  return (
    <div>
      <NavBar />
      <section className="max-w-xl mx-auto mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold">@{profile.username}</h2>
        <p className="mt-2 text-gray-700">{profile.bio}</p>
        <button
          onClick={async () => {
            const method = isFollowing ? 'DELETE' : 'POST';
            await fetch(`/follow/${profile.id}`, {
              method,
              headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setIsFollowing(!isFollowing);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      </section>

      <main className="max-w-xl mx-auto mt-6 space-y-4">
        {tweets.map(t => (
          <article key={t.id} className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-800">{t.content}</p>
            <small className="text-gray-500">{new Date(t.created_at).toLocaleString()}</small>
          </article>
        ))}
      </main>
    </div>
  );
}
