import React, { useEffect, useState } from 'react';
import { crmService, Customer } from '../services/crmService';
import { useNavigate, useLocation } from 'react-router-dom';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  useEffect(() => {
    crmService
      .getCustomers({ search, sortBy, order })
      .then(data => setCustomers(data))
      .catch(err => console.error('Failed to load customers', err));
  }, [search, sortBy, order]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="Search customers"
          className="p-2 border rounded w-full sm:w-64"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="created_at">Created</option>
        </select>
        <select
          value={order}
          onChange={e => setOrder(e.target.value as 'asc' | 'desc')}
          className="p-2 border rounded"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
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
      {customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{customer.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      className="text-blue-600"
                      onClick={() => navigate(`${basePath}/crm/interactions/${customer.id}`)}
                    >
                      Interactions
                    </button>
                    <button
                      className="text-green-600"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
