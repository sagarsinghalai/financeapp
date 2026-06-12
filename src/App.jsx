import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadsList from './pages/Leads/LeadsList';
import LeadDetail from './pages/Leads/LeadDetail';
import NewLead from './pages/Leads/NewLead';
import ApplicationsList from './pages/Applications/ApplicationsList';
import ApplicationDetail from './pages/Applications/ApplicationDetail';
import ProductsList from './pages/Products/ProductsList';
import Users from './pages/Admin/Users';
import Teams from './pages/Admin/Teams';
import Reports from './pages/Admin/Reports';
import MyPerformance from './pages/Agent/MyPerformance';
import Commissions from './pages/Agent/Commissions';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<LeadsList />} />
        <Route path="leads/new" element={<NewLead />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="applications" element={<ApplicationsList />} />
        <Route path="applications/:id" element={<ApplicationDetail />} />
        <Route path="products" element={<ProductsList />} />
        <Route path="admin/users" element={<Users />} />
        <Route path="admin/teams" element={<Teams />} />
        <Route path="admin/reports" element={<Reports />} />
        <Route path="my-performance" element={<MyPerformance />} />
        <Route path="commissions" element={<Commissions />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
