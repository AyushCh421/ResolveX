import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { Spinner } from './components/common/Feedback';
import { useAuth, homeFor } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/Dashboard';
import NewComplaint from './pages/student/NewComplaint';
import MyComplaints from './pages/student/MyComplaints';
import ComplaintDetail from './pages/student/ComplaintDetail';
import NotFound from './pages/NotFound';

// The admin side carries the charting library, so students never download it.
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminComplaints = lazy(() => import('./pages/admin/AdminComplaints'));
const ManageComplaint = lazy(() => import('./pages/admin/ManageComplaint'));

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return <Navigate to={user ? homeFor(user) : '/login'} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute role="student" />}>
        <Route element={<AppLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/new" element={<NewComplaint />} />
          <Route path="/student/complaints" element={<MyComplaints />} />
          <Route path="/student/complaints/:id" element={<ComplaintDetail />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/complaints/:id" element={<ManageComplaint />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}
