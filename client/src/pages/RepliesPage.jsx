import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../context/AuthContext';

export default function RepliesPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [original, setOriginal] = useState(null);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    async function load() {
      // 1) fetch the original tweet
      const t = await fetch(`/tweets/${id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (t.ok) setOriginal(await t.json());

      // 2) fetch its comments
      const c = await fetch(`/comments?tweet_id=${id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (c.ok) setReplies(await c.json());
    }
    load();
  }, [id, user]);

  if (!original) return <div>Loading…</div>;

  return (
    <div>
      <NavBar />
      <main className="max-w-xl mx-auto mt-6">
        <article className="bg-white p-4 rounded-lg shadow mb-6">
          <Link
            to={`/profile/${original.author}`}
            className="font-semibold hover:text-blue-500"
          >
            @{original.author}
          </Link>
          <p className="mt-2 text-gray-800">{original.content}</p>
        </article>
        <section className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-xl mb-4">Replies</h2>
          {replies.length ? replies.map(r => (
            <div key={r.comment_id} className="border-b py-2">
              <Link
                to={`/profile/${r.author}`}
                className="font-semibold hover:text-blue-500"
              >
                @{r.author}
              </Link>
              <p className="mt-1">{r.content}</p>
            </div>
          )) : <p className="text-gray-600">No replies yet.</p>}
        </section>
        <button
          onClick={() => window.location = `/post/${id}`}
          className="bg-green-500 text-white p-2 w-full rounded"
        >
          Reply
        </button>
      </main>
    </div>
  );
}
