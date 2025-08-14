import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './templateBack/NavBar';
import SidebarSuperAdmin from './templateBack/SideBarSuperAdmin';

const Layout: React.FC = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarSuperAdmin isSideMenuOpen={isSideMenuOpen} setIsSideMenuOpen={setIsSideMenuOpen} />
      
      <div className="flex flex-col flex-1">
        <NavBar 
          toggleSideMenu={() => setIsSideMenuOpen(prev => !prev)} 
          isSideMenuOpen={isSideMenuOpen}
        />
        
        <main className="h-full overflow-y-auto">
          <div className="container px-6 mx-auto grid sm:px-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;