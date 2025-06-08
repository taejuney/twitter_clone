import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const handleLogin = () => login(username);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handleLogin}
        className="bg-green-500 text-white p-2 w-full"
      >
        Login
      </button>
      <p className="mt-4 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-500 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}