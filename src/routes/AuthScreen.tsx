import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { user, loading, signInAnonymously } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleLogin = async () => {
    await signInAnonymously();
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <div className="bg-background-card p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Creature Nexus</h1>
        <p className="text-text-secondary mb-8">The Ultimate Trading Card Game</p>
        <button
          onClick={handleLogin}
          className="w-full bg-accent-500 hover:bg-accent-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Start Your Adventure
        </button>
      </div>
    </div>
  );
}