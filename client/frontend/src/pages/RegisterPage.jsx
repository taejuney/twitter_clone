import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const handleRegister = () => navigate('/login');

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2>Create Account</h2>
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
        onClick={handleRegister}
        className="bg-blue-500 text-white p-2 w-full"
      >
        Register
      </button>
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}