import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import WardenDashboard from './pages/WardenDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import MessDashboard from './pages/MessDashboard';

function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute allowedRole="Admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/warden" element={<ProtectedRoute allowedRole="Warden"><WardenDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute allowedRole="Student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute allowedRole="Payment Clerk"><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/mess" element={<ProtectedRoute allowedRole="Mess Staff"><MessDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
