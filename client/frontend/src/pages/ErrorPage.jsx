import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl text-red-600">404 - Page Not Found</h2>
      <Link to="/" className="text-blue-500">Go Home</Link>
    </div>
  );
}