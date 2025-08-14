// Layout.tsx
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import NavBar from './templateBack/NavBar';
import Sidebar from './templateBack/SideBar';
import LoadingSpinner from './Loading/LoadingSpinner';

interface LayoutProps {
  role?: 'admin' | 'superAdmin'; 
}

const Layout: React.FC<LayoutProps> = ({ role = 'admin' }) => { 
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/sign-in" replace />;
  }

  if (role === 'superAdmin' && user.role !== 'superAdmin') {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="layout-container flex bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        role={role} 
        isSideMenuOpen={isSideMenuOpen} 
        setIsSideMenuOpen={setIsSideMenuOpen} 
      />
      
      <div className="flex flex-col flex-1 min-h-0">
        <NavBar 
          toggleSideMenu={() => setIsSideMenuOpen(prev => !prev)} 
          isSideMenuOpen={isSideMenuOpen}
        />
        
        <main className="main-content">
          <div className="container px-6 mx-auto sm:px-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;