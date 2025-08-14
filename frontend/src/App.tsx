import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import SignUp from './authentification/SignUp';
import SignIn from './authentification/SignIn';
import Spinner from './Loading/Spinner';
import ForgotPassword from './authentification/ForgotPassword';
import CheckEmail from './authentification/CheckEmail';
import NewPassword from './authentification/NewPassword';
import TermsAndConditions from './termsAndPolicy/TermsAndConditions';
import PrivatePolicy from './termsAndPolicy/PrivatePolicy';
import Dashboard from './pages/Dashboard';
import Layout from './Layout';
import VCardPage from './pages/Vcards/VCardPage';
import CreateVCard from './pages/Vcards/CreateVcard';
import EditVCard from './pages/Vcards/EditVcard';
import BlocksPage from './pages/Blocks/BlocksPage';
import AddBlocksPage from './pages/Blocks/AddBlocksPage';
import VCardViewPage from './pages/Vcards/VCardViewPage';
import ProtectedRoute from './context/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AccountLayout from './pages/Account/AccountLayout';
import Settings from './pages/Account/Settings';
import ActivityLogs from './pages/Account/ActivityLogs';
import ApiKeyManager from './pages/Account/ApiKeyManager';
import AccountPlans from './pages/Account/AccountPlan';
import NotificationsPage from './pages/Notification/NotificationPage';
import ProjectPage from './pages/Projects/ProjectPage';
import ProjectForm from './pages/Projects/ProjectForm';
import ProjectVCardsPage from './pages/Projects/ProjectVCardsPage';
import PixelPage from './pages/Pixels/PixelPage';
import PixelForm from './pages/Pixels/PixelForm';
import CustomDomainsPage from './pages/CustomDomain/CustomDomainsPage';
import CustomDomainForm from './pages/CustomDomain/CustomDomainForm';
import DashboardAdmin from './pagesSuperAdmin/DashboardAdmin';
import ListUsers from './pagesSuperAdmin/Users/ListUsers';
import ListPlans from './pagesSuperAdmin/Plans/ListPlans';
import ListVCards from './pagesSuperAdmin/VCards/ListVcards';
import ListBlocks from './pagesSuperAdmin/VCards/ListBlocks';
import ListProjects from './pagesSuperAdmin/Project/ListProjects';
import ProjectVCardsList from './pagesSuperAdmin/Project/ProjectVCardsList';
import ListPixels from './pagesSuperAdmin/Pixels/ListPixels';
import ListCustomDomains from './pagesSuperAdmin/CustomDomains/ListCustomDomains';
import ListSubscriptions from './pagesSuperAdmin/Subscriptions/ListSubscriptions';
import ListApiKeys from './pagesSuperAdmin/ApiKeys/ListApiKeys';
import ListQuotes from './pagesSuperAdmin/Quote/ListQuotes';
import AuthHandler from './authentification/AuthHandler';

function App() {
  const { isLoading, user } = useAuth(); 

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/reset-password" element={<NewPassword />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivatePolicy />} />
        <Route path="/auth/handler" element={<AuthHandler />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={
            user?.role === 'superAdmin' 
              ? <Navigate to="/super-admin/dashboard" replace /> 
              : <Navigate to="/admin/dashboard" replace />
          } />
          
          <Route path="/admin" element={<Layout role="admin" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard">
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Navigate to="/admin/account" replace />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
            <Route path="vcard" element={<VCardPage />} />
            <Route path="vcard/create-vcard" element={<CreateVCard />} />
            <Route path="vcard/edit-vcard/:id" element={<EditVCard />} />
            <Route path="vcard/edit-vcard/:id/blocks" element={<BlocksPage />} />
            <Route path="vcard/edit-vcard/:id/blocks/add-blocks" element={<AddBlocksPage />} />
            
            <Route path="account" element={<AccountLayout />}>
              <Route path="settings" element={<Settings />} />
              <Route path="activityLogs" element={<ActivityLogs />} />
              <Route path="plan" element={<AccountPlans />} />
              <Route path="api" element={<ApiKeyManager />} />
            </Route>
            
            <Route path="project">
              <Route index element={<ProjectPage />} />
              <Route path="create" element={<ProjectForm />} />
              <Route path="edit/:id" element={<ProjectForm />} />
              <Route path=":id/vcards" element={<ProjectVCardsPage />} />
            </Route>
            <Route path="pixel">
              <Route index element={<PixelPage />} />
              <Route path="create" element={<PixelForm />} />
              <Route path="edit/:id" element={<PixelForm />} />
            </Route>
            <Route path="custom-domains">
              <Route index element={<CustomDomainsPage />} />
              <Route path="create" element={<CustomDomainForm />} />
              <Route path="edit/:id" element={<CustomDomainForm />} />
            </Route>
          </Route>

          <Route path="/super-admin" element={<Layout role="superAdmin" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard">
              <Route index element={<DashboardAdmin />} />
              <Route path="profile" element={<Navigate to="/super-admin/account" replace />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
            
            <Route path="account" element={<AccountLayout />}>
              <Route path="settings" element={<Settings />} />
              <Route path="activityLogs" element={<ActivityLogs />} />
            </Route>
            <Route path="users">
              <Route index element={<ListUsers />} />
            </Route>
            <Route path="plan">
              <Route index element={<ListPlans />} />
            </Route>
            <Route path="vcard">
              <Route index element={<ListVCards />} />
              <Route path=":vcardId/blocks" element={<ListBlocks />} />
            </Route>
            <Route path="project">
              <Route index element={<ListProjects />} />
              <Route path=":projectId/vcards" element={<ProjectVCardsList />} />
            </Route>
            <Route path="pixel">
              <Route index element={<ListPixels />} />
            </Route>
            <Route path="custom-domains">
              <Route index element={<ListCustomDomains />} />
            </Route>
            <Route path="subscriptions">
              <Route index element={<ListSubscriptions />} />
            </Route>
            <Route path="apikeys">
              <Route index element={<ListApiKeys />} />
            </Route>
            <Route path="quote">
              <Route index element={<ListQuotes />} />
            </Route>
          </Route>
        </Route>
        
        <Route path="/vcard/:url" element={<VCardViewPage />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;