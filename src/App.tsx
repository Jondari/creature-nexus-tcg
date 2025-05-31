import { Routes, Route, Navigate } from 'react-router-dom';
import AuthScreen from './routes/AuthScreen';
import TabLayout from './routes/TabLayout';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={!user ? <AuthScreen /> : <Navigate to="/\" replace />} 
      />
      <Route 
        path="/*" 
        element={user ? <TabLayout /> : <Navigate to="/auth\" replace />} 
      />
    </Routes>
  );
}