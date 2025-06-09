import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.msg || 'Login failed');
      }
      const { access_token } = await res.json();
      login(username, access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2>Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handleLogin}
        className="bg-green-500 text-white p-2 w-full mb-4"
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
