import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TabNavigation, { getTabs } from './TabNavigation';
import MobileTabMenu from './MobileTabMenu';
import { authService } from '../../services/api';
import { User } from '../../services/user';
import AccountProfile from './AccountProfile';

const AccountLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('account');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [userData, setUserData] = useState<User>({
    id: '',
    name: '',
    email: '',
    avatar: '',
    createdAt: '',
    updated_at: '',
    role: 'user' 
  });
  const [loading, setLoading] = useState(true);

  const basePath = userData.role === 'superAdmin' ? '/super-admin' : '/admin';

  const filteredTabs = useMemo(() => {
    if (!userData.role) return [];
    
    const tabs = getTabs(basePath);
    
    if (userData.role === 'superAdmin') {
      return tabs
        .filter(tab => ['account', 'settings', 'logs'].includes(tab.id))
        .map(tab => {
          if (tab.id === 'settings') {
            return { ...tab, label: 'Security' };
          }
          return tab;
        });
    }
    return tabs;
  }, [userData.role, basePath]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await authService.getCurrentUser();
        const user = response.data;
        setUserData(user);
      } catch (error) {
        toast.error('Failed to fetch user data');
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (file: File | null) => {
    setAvatar(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("id", userData.id);
      formData.append("name", userData.name || ''); 
      formData.append("email", userData.email || ''); 
      if (avatar) {
        formData.append("avatar", avatar);
      }
      
      await authService.updateUser(formData);
      toast.success('Profile updated successfully!');
      window.dispatchEvent(new CustomEvent('userUpdated'));
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    }
  };

  useEffect(() => {
    const currentTab = filteredTabs.find(tab => location.pathname === tab.path);
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:px-8 xl:px-28 w-full max-w-[90rem]">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="hidden lg:block mb-8">
        <TabNavigation tabs={filteredTabs} activeTab={activeTab} />
      </div>

      <MobileTabMenu
        tabs={filteredTabs}
        activeTab={activeTab}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />

      <div className="rounded-lg shadow-sm">
        {activeTab === 'account' ? (
          <AccountProfile 
            userData={userData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onAvatarChange={handleAvatarChange}
          />
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AccountLayout;