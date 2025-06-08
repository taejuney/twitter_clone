import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

const dummyTweets = [
  { id: '1', author: 'alice', content: 'Hello world!', replies: ['2'] },
  { id: '3', author: 'bob', content: 'React is great!', replies: [] },
  { id: '4', author: 'dave', content: 'Just setting up my X clone.', replies: [] },
  { id: '5', author: 'eve', content: 'Does anyone know Tailwind CSS?', replies: ['6'] },
  { id: '6', author: 'frank', content: 'Yes! It’s awesome for utility-first styling.', replies: [] },
  { id: '7', author: 'grace', content: 'Can’t wait to see this project finished!', replies: [] },
  { id: '8', author: 'heidi', content: 'This looks great!', replies: [] }
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <NavBar />
      <main className="max-w-xl mx-auto mt-6 space-y-4">
        {dummyTweets.map(tweet => (
          <article
            key={tweet.id}
            className="bg-white p-4 rounded-lg shadow relative"
            onClick={() => navigate(`/replies/${tweet.id}`)}
          >
            {/* Author link */}
            <Link
              to={`/profile/${tweet.author}`}
              className="font-semibold text-gray-900 hover:text-blue-500"
              onClick={e => e.stopPropagation()}
            >
              @{tweet.author}
            </Link>

            {/* Clicking the content navigates to replies */}
            <div
              onClick={() => navigate(`/replies/${tweet.id}`)}
              // className="cursor-pointer mt-2"
            >
              <p className="text-gray-800">{tweet.content}</p>
            </div>

            {/* In-card action buttons */}
            <div className="mt-3 flex space-x-4 text-gray-500">
              <button
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/post/${tweet.id}`);
                }}
                className="hover:text-blue-500"
              >
                Reply
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  alert('Retweeted!');
                }}
                className="hover:text-blue-500"
              >
                Retweet
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  alert('Liked!');
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