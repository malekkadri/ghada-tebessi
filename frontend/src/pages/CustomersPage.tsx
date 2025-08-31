import React, { useEffect, useState } from 'react';
import { crmService, Customer, Tag } from '../services/crmService';
import { vcardService } from '../services/api';
import { VCard } from '../services/vcard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: '', notes: '', vcardId: '' });
  const [formTags, setFormTags] = useState<string[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: '', notes: '', vcardId: '' });
  const [editFormTags, setEditFormTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [vcards, setVcards] = useState<VCard[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const { user } = useAuth();

  useEffect(() => {
    crmService
      .getTags()
      .then(setTags)
      .catch(err => console.error('Failed to load tags', err));
  }, []);

  useEffect(() => {
    if (!user) return;
    vcardService
      .getAll(String(user.id))
      .then(setVcards)
      .catch(err => console.error('Failed to load vcards', err));
  }, [user]);

  useEffect(() => {
    crmService
      .getCustomers({ search, sortBy, order, tags: filterTags })
      .then(data => setCustomers(data))
      .catch(err => console.error('Failed to load customers', err));
  }, [search, sortBy, order, filterTags]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFormTagsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormTags(Array.from(e.target.selectedOptions, option => option.value));
  };

  const handleEditTagsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditFormTags(Array.from(e.target.selectedOptions, option => option.value));
  };

  const handleFilterTagsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterTags(Array.from(e.target.selectedOptions, option => option.value));
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    try {
      const created = await crmService.createTag({ name: newTag.trim() });
      setTags([...tags, created]);
      setNewTag('');
    } catch (error) {
      console.error('Failed to create tag', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCustomer = await crmService.createCustomer(form);
      if (form.vcardId) {
        await crmService.linkVcardToCustomer(newCustomer.id, form.vcardId);
      }
      for (const tagId of formTags) {
        await crmService.assignTagToCustomer(newCustomer.id, tagId);
      }
      const refreshed = await crmService.getCustomers({ search, sortBy, order, tags: filterTags });
      setCustomers(refreshed);
      setForm({ name: '', email: '', phone: '', status: '', notes: '', vcardId: '' });
      setFormTags([]);
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

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status || '',
      notes: customer.notes || '',
      vcardId: customer.vcardId ? String(customer.vcardId) : '',
    });
    setEditFormTags(customer.Tags?.map(t => t.id.toString()) || []);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await crmService.updateCustomer(editingCustomer.id, editForm);
      if (editForm.vcardId) {
        await crmService.linkVcardToCustomer(editingCustomer.id, editForm.vcardId);
      }
      const prev = editingCustomer.Tags?.map(t => t.id.toString()) || [];
      const toAdd = editFormTags.filter(id => !prev.includes(id));
      const toRemove = prev.filter(id => !editFormTags.includes(id));
      for (const id of toAdd) {
        await crmService.assignTagToCustomer(editingCustomer.id, id);
      }
      for (const id of toRemove) {
        await crmService.unassignTagFromCustomer(editingCustomer.id, id);
      }
      const refreshed = await crmService.getCustomers({ search, sortBy, order, tags: filterTags });
      setCustomers(refreshed);
      setEditingCustomer(null);
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
        <select
          multiple
          value={filterTags}
          onChange={handleFilterTagsChange}
          className="p-2 border rounded"
        >
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <input
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="New tag"
          className="p-2 border rounded"
        />
        <button
          type="button"
          onClick={handleCreateTag}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Tag
        </button>
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
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 border rounded"
        />
        <input
          name="status"
          value={form.status}
          onChange={handleChange}
          placeholder="Status"
          className="w-full p-2 border rounded"
        />
        <select
          multiple
          value={formTags}
          onChange={handleFormTagsChange}
          className="w-full p-2 border rounded"
        >
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        <select
          name="vcardId"
          value={form.vcardId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">No VCard</option>
          {vcards.map(vcard => (
            <option key={vcard.id} value={vcard.id}>
              {vcard.name}
            </option>
          ))}
        </select>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Customer
        </button>
      </form>

      {editingCustomer && (
        <form onSubmit={handleEditSubmit} className="space-y-2 max-w-sm">
          <h2 className="text-xl font-semibold">Edit Customer</h2>
          <input
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            placeholder="Name"
            className="w-full p-2 border rounded"
          />
          <input
            name="email"
            value={editForm.email}
            onChange={handleEditChange}
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          <input
            name="phone"
            value={editForm.phone}
            onChange={handleEditChange}
            placeholder="Phone"
            className="w-full p-2 border rounded"
          />
          <input
            name="status"
            value={editForm.status}
            onChange={handleEditChange}
            placeholder="Status"
            className="w-full p-2 border rounded"
          />
          <select
            multiple
            value={editFormTags}
            onChange={handleEditTagsChange}
          className="w-full p-2 border rounded"
        >
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        <select
          name="vcardId"
          value={editForm.vcardId}
          onChange={handleEditChange}
          className="w-full p-2 border rounded"
        >
          <option value="">No VCard</option>
          {vcards.map(vcard => (
            <option key={vcard.id} value={vcard.id}>
              {vcard.name}
            </option>
          ))}
        </select>
        <textarea
          name="notes"
          value={editForm.notes}
          onChange={handleEditChange}
          placeholder="Notes"
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Save
          </button>
        </form>
      )}
      {customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">VCard</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{customer.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.phone}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.status}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {customer.Tags?.map(t => t.name).join(', ')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {customer.Vcard?.name || ''}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    className="text-blue-600"
                    onClick={() =>
                      navigate(
                        `${basePath}/crm/interactions/${customer.id}?type=customer`
                      )
                    }
                  >
                    Interactions
                  </button>
                  <button
                    className="text-purple-600"
                    onClick={() =>
                      navigate(
                        `${basePath}/crm/tasks/${customer.id}?type=customer`
                      )
                    }
                  >
                    Tasks
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
