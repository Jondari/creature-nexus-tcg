import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function TabLayout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-4">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-background-secondary border-t border-background-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around py-4">
            <Link
              to="/"
              className={`text-text-secondary hover:text-accent-500 ${
                location.pathname === '/' ? 'text-accent-500' : ''
              }`}
            >
              Open Pack
            </Link>
            <Link
              to="/collection"
              className={`text-text-secondary hover:text-accent-500 ${
                location.pathname === '/collection' ? 'text-accent-500' : ''
              }`}
            >
              Collection
            </Link>
            <Link
              to="/profile"
              className={`text-text-secondary hover:text-accent-500 ${
                location.pathname === '/profile' ? 'text-accent-500' : ''
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}