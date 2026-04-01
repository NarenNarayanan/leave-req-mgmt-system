import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar           from './components/Navbar';
import ProtectedRoute   from './components/ProtectedRoute';
import Spinner          from './components/Spinner';
import useSessionRestore from './hooks/useSessionRestore';
import Login            from './pages/Login';
import Register         from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard   from './pages/AdminDashboard';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
}

function AppRoutes() {
  const ready = useSessionRestore();
  if (!ready) return <Spinner text="Verifying session..." />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<RootRedirect />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/employee" element={
          <ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
