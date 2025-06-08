import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      <Link to="/">
        {/* X logo placeholder */}
        <span className="text-2xl font-bold text-blue-500">X</span>
      </Link>
      <div className="flex space-x-6">
        <Link to="/" className="text-gray-700 hover:text-blue-500">Home</Link>
        <Link to={`/profile/${user.username}`} className="text-gray-700 hover:text-blue-500">Profile</Link>
      </div>
      <button onClick={logout} className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
        Logout
      </button>
    </nav>
  );
}