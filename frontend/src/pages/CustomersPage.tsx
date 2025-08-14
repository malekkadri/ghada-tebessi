import React, { useEffect, useState } from 'react';
import { crmService, Customer } from '../services/crmService';
import CustomerCard from '../components/CustomerCard';
import { useNavigate, useLocation } from 'react-router-dom';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  useEffect(() => {
    crmService
      .getCustomers()
      .then(data => setCustomers(data))
      .catch(err => console.error('Failed to load customers', err));
  }, []);

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onClick={() => navigate(`${basePath}/crm/interactions/${customer.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomersPage;
