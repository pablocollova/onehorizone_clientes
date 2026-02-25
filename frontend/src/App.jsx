import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AccountStatement } from './pages/AccountStatement';
import { PlaceholderPage } from './pages/PlaceholderPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>

          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="statement" element={<AccountStatement />} />
            <Route path="documents" element={<PlaceholderPage title="Documents" />} />
            <Route path="locations" element={<PlaceholderPage title="Locations" />} />
            <Route path="files" element={<PlaceholderPage title="Files" />} />
            <Route path="payments" element={<PlaceholderPage title="Payments" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
