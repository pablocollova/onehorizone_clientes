import { DocumentsWorkspace } from './pages/DocumentsWorkspace';
import { AccountsWorkspace } from './pages/AccountsWorkspace';
import { Overview } from './pages/admin/Overview';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AccountStatement } from './pages/AccountStatement';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Activate } from './pages/Activate';
import { Users } from './pages/admin/Users';
import { Clients } from './pages/admin/Clients';
import { Invite } from './pages/admin/Invite';
import { Invoices } from './pages/admin/Invoices';
import { ServiceRecords } from './pages/admin/ServiceRecords';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { PrivacySettings } from './pages/PrivacySettings';
import { PrivateServices } from './pages/PrivateServices';

function App() {
  return (
    <AuthProvider>
      <Router>
        <CookieConsentBanner />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/private-services" element={<PrivateServices />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/activate" element={<Activate />} />

          {/* Platform Admin Routes — guarded by AdminLayout */}
          <Route path="/app/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="accounts" element={<AccountsWorkspace />} />
            <Route path="documents" element={<DocumentsWorkspace />} />
            <Route path="clients" element={<Clients />} />
            <Route path="users" element={<Users />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="service-records" element={<ServiceRecords />} />
            <Route path="invite" element={<Invite />} />
          </Route>

          {/* Client Protected Routes — guarded by AppLayout */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="statement" element={<AccountStatement />} />
            <Route path="documents" element={<DocumentsWorkspace />} />
            <Route path="locations" element={<PlaceholderPage title="Locations" />} />
            <Route path="files" element={<DocumentsWorkspace />} />
            <Route path="payments" element={<AccountsWorkspace paymentsOnly />} />
            <Route path="privacy-settings" element={<PrivacySettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
