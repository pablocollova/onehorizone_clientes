import { WorkspaceLayout } from './layouts/WorkspaceLayout';
import { OperationsOverview } from './pages/workspace/OperationsOverview';
import { ClientOverview } from './pages/workspace/ClientOverview';
import { InvoiceWorkspace } from './pages/workspace/InvoiceWorkspace';
import { ServiceWorkspace } from './pages/workspace/ServiceWorkspace';
import { FinanceWorkspace } from './pages/workspace/FinanceWorkspace';
import { DocumentsWorkspace } from './pages/DocumentsWorkspace';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Activate } from './pages/Activate';
import { Users } from './pages/admin/Users';
import { Clients } from './pages/admin/Clients';
import { Invite } from './pages/admin/Invite';
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
          <Route path="/app/admin" element={<WorkspaceLayout administration />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OperationsOverview />} />
            <Route path="accounts" element={<FinanceWorkspace />} />
            <Route path="documents" element={<DocumentsWorkspace />} />
            <Route path="clients" element={<Clients />} />
            <Route path="users" element={<Users />} />
            <Route path="invoices" element={<InvoiceWorkspace />} />
            <Route path="service-records" element={<ServiceWorkspace />} />
            <Route path="invite" element={<Invite />} />
          </Route>

          {/* Client Protected Routes — guarded by AppLayout */}
          <Route path="/app" element={<WorkspaceLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientOverview />} />
            <Route path="invoices" element={<InvoiceWorkspace />} />
            <Route path="services" element={<ServiceWorkspace />} />
            <Route path="statement" element={<FinanceWorkspace />} />
            <Route path="documents" element={<DocumentsWorkspace />} />
            <Route path="locations" element={<PlaceholderPage title="Locations" />} />
            <Route path="files" element={<DocumentsWorkspace />} />
            <Route path="payments" element={<FinanceWorkspace />} />
            <Route path="privacy-settings" element={<PrivacySettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
