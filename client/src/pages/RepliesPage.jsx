import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function RepliesPage() {
  const { id } = useParams();
  const [original, setOriginal] = useState(null);
  const [replies, setReplies]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // or however you store it
    if (!token) return setError('Not authenticated');

    async function fetchData() {
      try {
        // 1) fetch the original tweet
        const tweetRes = await fetch(`/tweets/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!tweetRes.ok) throw new Error('Failed to load tweet');
        const tweetData = await tweetRes.json();
        setOriginal(tweetData);

        // 2) fetch comments on that tweet
        const commentsRes = await fetch(`/comments?tweet_id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!commentsRes.ok) throw new Error('Failed to load comments');
        const commentsData = await commentsRes.json();
        setReplies(commentsData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error)   return <div className="p-8 text-red-500 text-center">{error}</div>;

  return (
    <div>
      <NavBar />
      <main className="max-w-xl mx-auto mt-6 space-y-6">
        {original && (
          <article className="bg-white p-4 rounded-lg shadow">
            <Link
              to={`/profile/${original.author}`}
              className="font-semibold text-gray-900 hover:text-blue-500"
            >
              @{original.author}
            </Link>
            <p className="mt-2 text-gray-800">{original.content}</p>
          </article>
        )}

        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl mb-4">Replies to Tweet #{id}</h2>
          {replies.length > 0 ? (
            replies.map(r => (
              <div key={r.comment_id} className="border-b py-2">
                <Link
                  to={`/profile/${r.profile_id}`}
                  className="font-semibold text-gray-900 hover:text-blue-500"
                >
                  @{r.author} {/* or r.username, depending on what your API returns */}
                </Link>
                <p className="mt-1 text-gray-800">{r.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No replies yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
