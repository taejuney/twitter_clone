import React from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

// Dummy original tweets data
const dummyTweets = {
    '1': { id: '1', author: 'alice', content: 'Hello world!' },
    '3': { id: '3', author: 'bob', content: 'React is great!' },
    '4': { id: '4', author: 'dave', content: 'Just setting up my X clone.' },
    '5': { id: '5', author: 'eve', content: 'Does anyone know Tailwind CSS?' },
    '6': { id: '6', author: 'frank', content: 'Yes! It’s awesome for utility-first styling.' },
    '7': { id: '7', author: 'grace', content: 'Can’t wait to see this project finished!' },
    '8': { id: '8', author: 'heidi', content: 'This looks great!' }
  };

// Dummy replies data
const dummyReplies = {
  '1': [{ id: '2', author: 'charlie', content: 'Agreed!' }]
};

export default function RepliesPage() {
  const { id } = useParams();
  const original = dummyTweets[id];
  const replies = dummyReplies[id] || [];

  return (
    <div>
      <NavBar />
      <main className="max-w-xl mx-auto mt-6">
        {original && (
          <article className="bg-white p-4 rounded-lg shadow mb-6">
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
              <div key={r.id} className="border-b py-2">
                <Link
                  to={`/profile/${r.author}`}
                  className="font-semibold text-gray-900 hover:text-blue-500"
                >
                  @{r.author}
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