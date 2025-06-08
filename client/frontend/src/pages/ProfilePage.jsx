import React from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function ProfilePage() {
  const { username } = useParams();

  return (
    <div>
      <NavBar />
      <section className="max-w-xl mx-auto mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold">@{username}</h2>
        <p className="mt-2 text-gray-700">This is the bio for @{username}.</p>
        <div className="mt-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
            Follow
          </button>
        </div>
      </section>
    </div>
  );
}