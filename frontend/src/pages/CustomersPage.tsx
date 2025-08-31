import React, { useEffect, useState } from 'react';
import { crmService, Customer } from '../services/crmService';
import CustomerCard from '../components/CustomerCard';
import { useNavigate, useLocation } from 'react-router-dom';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  useEffect(() => {
    crmService
      .getCustomers()
      .then(data => setCustomers(data))
      .catch(err => console.error('Failed to load customers', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCustomer = await crmService.createCustomer(form);
      setCustomers([...customers, newCustomer]);
      setForm({ name: '', email: '' });
    } catch (error) {
      console.error('Failed to create customer', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await crmService.deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete customer', error);
    }
  };

  const handleEdit = async (customer: Customer) => {
    const name = prompt('Name', customer.name);
    if (!name) return;
    try {
      const updated = await crmService.updateCustomer(customer.id, { name });
      setCustomers(customers.map(c => (c.id === customer.id ? updated : c)));
    } catch (error) {
      console.error('Failed to update customer', error);
    }
  };

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <form onSubmit={handleSubmit} className="space-y-2 max-w-sm">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Customer
        </button>
      </form>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onClick={() => navigate(`${basePath}/crm/interactions/${customer.id}`)}
            onEdit={() => handleEdit(customer)}
            onDelete={() => handleDelete(customer.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomersPage;
