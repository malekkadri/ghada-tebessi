import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaPlus, FaFileExport } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService, subscriptionService, planService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { User } from '../../services/user';
import StatsCards from '../../cards/StatsCard';
import FilterMenu from '../../cards/FilterCardUsers';
import ExportMenu from '../../cards/ExportMenu';
import UserTable from '../../atoms/Tables/UsersTable';
import Pagination from '../../atoms/Pagination/Pagination';
import ActiveFilters from '../../cards/ActiveFilters';
import UserCharts from '../../atoms/Charts/UserCharts';
import AddUserModal from '../../modals/AddUserModal';
import AssignPlanModal from '../../modals/AssignPlanModal';

export interface ActiveFilters {
  status: string;
  role: string;
  verified: string;
  search: string;
}

const ListUsers: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAssignPlanModal, setShowAssignPlanModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'all',
    role: 'all',
    verified: 'all',
    search: ''
  });
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    admins: 0,
    superAdmins: 0
  });
  
  const itemsPerPage = 10;
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allUsers.length > 0) {
      const total = allUsers.length;
      const active = allUsers.filter(user => user.isActive).length;
      const verified = allUsers.filter(user => user.isVerified).length;
      const admins = allUsers.filter(user => user.role === 'admin').length;
      const superAdmins = allUsers.filter(user => user.role === 'superAdmin').length;
      
      setStats({ total, active, verified, admins, superAdmins });
    } else {
      setStats({ total: 0, active: 0, verified: 0, admins: 0, superAdmins: 0 });
    }
  }, [allUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && exportMenuRef.current && 
          !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }

      if (showFilterMenu && 
          filterMenuRef.current && 
          !filterMenuRef.current.contains(event.target as Node) &&
          filterButtonRef.current && 
          !filterButtonRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu, showExportMenu]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await authService.getAllUsers();
        
        if (response.data) {
          const userData = response.data;
          if (Array.isArray(userData)) {
            // Convertir tous les IDs en string pour la cohérence
            const usersWithStringIds = userData.map(user => ({
              ...user,
              id: user.id.toString()
            }));
            setAllUsers(usersWithStringIds);
          } else {
            setAllUsers([]);
            console.error('Invalid user data format:', userData);
            toast.error('Received invalid user data format');
          }
        } else {
          setAllUsers([]);
          toast.error('No user data received from server');
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
        toast.error('Failed to load users. Please try again.');
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];

    let result = [...allUsers];
    
    if (activeFilters.search) {
      result = result.filter(user => 
        (user.name?.toLowerCase().includes(activeFilters.search.toLowerCase())) ||
        (user.email?.toLowerCase().includes(activeFilters.search.toLowerCase()))
      );
    }
    
    if (activeFilters.status !== 'all') {
      result = result.filter(user => 
        activeFilters.status === 'active' ? user.isActive : !user.isActive
      );
    }
    
    if (activeFilters.role !== 'all') {
      result = result.filter(user => user.role === activeFilters.role);
    }
    
    if (activeFilters.verified !== 'all') {
      result = result.filter(user => 
        activeFilters.verified === 'verified' ? user.isVerified : !user.isVerified
      );
    }
    
    result.sort((a, b) => {
      const roleOrder: Record<string, number> = {
        'superAdmin': 0,
        'admin': 1,
        'user': 2
      };

      const aRole = a.role || 'user';
      const bRole = b.role || 'user';

      const roleComparison = (roleOrder[aRole] || 2) - (roleOrder[bRole] || 2);

      if (roleComparison === 0) {
        const aName = a.name || '';
        const bName = b.name || '';
        return aName.localeCompare(bName);
      }

      return roleComparison;
    });
    
    return result;
  }, [activeFilters, allUsers]);

  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const currentPageUsers = useMemo(() => {
    if (!filteredUsers || filteredUsers.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleFilterChange = (filterType: keyof ActiveFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      role: 'all',
      verified: 'all',
      search: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.status !== 'all' ||
      activeFilters.role !== 'all' ||
      activeFilters.verified !== 'all' ||
      activeFilters.search !== ''
    );
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isActive } : user
        )
      );

      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID');
      }

      await authService.toggleUserStatus(numericUserId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to toggle user status', error);
      toast.error('Failed to update user status');

      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isActive: !isActive } : user
        )
      );
    }
  };

  const handleChangePlan = async (userId: string, planName: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    // Si c'est le plan free, assigner directement sans ouvrir le modal
    if (planName.toLowerCase() === 'free') {
      await assignPlanDirectly(userId, planName);
    } else {
      setSelectedUser(user);
      setSelectedPlan(planName);
      setShowAssignPlanModal(true);
    }
  };

  const assignPlanDirectly = async (userId: string, planName: string) => {
    try {
      const plansResponse = await planService.getAllPlans();
      const plans = Array.isArray(plansResponse.data) ? plansResponse.data : [];
      
      if (plans.length === 0) {
        toast.error('No plans found');
        return;
      }
      
      const plan = plans.find(p => p.name.toLowerCase() === planName.toLowerCase());
      
      if (!plan) {
        toast.error(`Plan ${planName} not found`);
        return;
      }
      
      await subscriptionService.assignPlan(
        parseInt(userId),
        plan.id,
        'unlimited'
      );
      
      // Recharger les utilisateurs après assignation
      setLoading(true);
      const response = await authService.getAllUsers();
      
      if (response.data && Array.isArray(response.data)) {
        const usersWithStringIds = response.data.map(user => ({
          ...user,
          id: user.id.toString()
        }));
        setAllUsers(usersWithStringIds);
      }
      
      toast.success(`Plan ${planName} assigned successfully`);
    } catch (error) {
      console.error('Failed to assign plan', error);
      toast.error('Failed to assign plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = async (duration: string, unit?: 'days' | 'months' | 'years') => {
    if (!selectedUser) return;
    
    try {
      const plansResponse = await planService.getAllPlans();
      const plans = Array.isArray(plansResponse.data) ? plansResponse.data : [];
      
      if (plans.length === 0) {
        toast.error('No plans found');
        return;
      }
      
      const plan = plans.find(p => 
        p.name.toLowerCase() === selectedPlan.toLowerCase()
      );
      
      if (!plan) {
        toast.error(`Plan ${selectedPlan} not found`);
        return;
      }
      
      await subscriptionService.assignPlan(
        parseInt(selectedUser.id),
        plan.id,
        duration,
        unit
      );
      
      // Recharger les utilisateurs après assignation
      setLoading(true);
      const response = await authService.getAllUsers();
      
      if (response.data && Array.isArray(response.data)) {
        const usersWithStringIds = response.data.map(user => ({
          ...user,
          id: user.id.toString()
        }));
        setAllUsers(usersWithStringIds);
      }
      
      toast.success(`Plan ${selectedPlan} assigned successfully to ${selectedUser.name}`);
      setShowAssignPlanModal(false);
    } catch (error) {
      console.error('Failed to assign plan', error);
      toast.error('Failed to assign plan');
    } finally {
      setLoading(false);
    }
  };

  const formatUserData = (user: User) => ({
    ID: user.id,
    Name: user.name,
    Email: user.email,
    Role: user.role,
    Status: user.isActive ? 'Active' : 'Inactive',
    'Plan Name': user.activeSubscription?.plan?.name || 'No plan',
    'Plan Price': user.activeSubscription?.plan?.price ? `$${user.activeSubscription.plan.price}` : 'N/A',
    Verified: user.isVerified ? 'Yes' : 'No',
    'Created At': user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting || !filteredUsers || filteredUsers.length === 0) return;
    
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const date = new Date().toISOString().slice(0, 10);
      const filename = `users_export_${date}`;
      
      if (format === 'csv') {
        exportToCsv(filteredUsers.map(formatUserData), filename);
      } else {
        exportToJson(filteredUsers.map(formatUserData), filename);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportToCsv = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        ).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV export completed successfully');
  };

  const exportToJson = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('JSON export completed successfully');
  };

  const handleCreateUser = async (newUser: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    try {
      const createdUser = await authService.createUser(newUser);
      
      // Convertir l'ID en string pour la cohérence
      const userWithStringId = {
        ...createdUser,
        id: createdUser.id.toString()
      };
      
      setAllUsers(prev => [userWithStringId, ...prev]);
      
      toast.success('User created successfully!');
      setShowAddUserModal(false);
      
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1,
        ...(createdUser.role === 'admin' && { admins: prev.admins + 1 }),
        ...(createdUser.role === 'superAdmin' && { superAdmins: prev.superAdmins + 1 }),
        ...(createdUser.isVerified && { verified: prev.verified + 1 })
      }));
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="lg:p-2 xl:p-2 sm:p-6 sm:py-2 lg:px-8 xl:px-14 lg:py-4 xl:py-4 w-full max-w-[90rem] mx-auto">
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl pt-4 font-bold text-gray-800 dark:text-white">User Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            View and manage all system users
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[160px] sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 sm:pl-10 pr-4 py-1.5 sm:py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base h-12 sm:h-auto"
              value={activeFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            <div className="relative">
              <button
                ref={filterButtonRef}
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border ${
                  hasActiveFilters()
                    ? 'border-red-500'
                    : 'border-purple-500'
                } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FaFilter className={
                  hasActiveFilters()
                    ? 'text-red-500'
                    : 'text-purple-500'
                } />
              </button>

              {showFilterMenu && (
                <FilterMenu 
                  ref={filterMenuRef}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onReset={resetFilters}
                  onClose={() => setShowFilterMenu(false)}
                />
              )}
            </div>

            <div className="relative" ref={exportMenuRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || !filteredUsers || filteredUsers.length === 0}
              >
                <FaFileExport className={`text-purple-500 text-sm sm:text-base ${exporting ? 'opacity-50' : ''}`} />
              </button>

              {showExportMenu && (
                <ExportMenu 
                  onExport={handleExport}
                  exporting={exporting}
                />
              )}
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base relative"
            >
              <FaPlus className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none sm:mr-2 w-10" />
              <span className="hidden xs:inline sm:ml-0">Add User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mobile-stats-reduce">
        <StatsCards stats={stats} />
      </div>
      
      {hasActiveFilters() && (
        <ActiveFilters 
          activeFilters={activeFilters} 
          resetFilters={resetFilters} 
        />
      )}

      <UserTable
        filteredUsers={currentPageUsers}
        hasActiveFilters={hasActiveFilters()}
        onToggleStatus={toggleUserStatus}
        onChangePlan={handleChangePlan}
      />

      {filteredUsers && filteredUsers.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        </div>
      )}

      <div className="mt-6 sm:mt-8 mobile-charts-reduce">
        <UserCharts users={allUsers} />
      </div>

      <AddUserModal 
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onCreateUser={handleCreateUser}
      />

      <AssignPlanModal
        isOpen={showAssignPlanModal}
        onClose={() => setShowAssignPlanModal(false)}
        onAssignPlan={handleAssignPlan}
        planName={selectedPlan}
      /> </div>
  );
};

export default ListUsers;