import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import taskService, { Task } from '../services/taskService';

const TasksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const entityType =
    (searchParams.get('type') === 'lead' ? 'leads' : 'customers') as 'customers' | 'leads';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({ title: '', dueDate: '', status: 'pending' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({ title: '', dueDate: '', status: 'pending' });

  const loadTasks = () => {
    if (!id) return;
    const params: any = {
      [entityType === 'customers' ? 'customerId' : 'leadId']: id,
    };
    taskService
      .getTasks(params)
      .then(data => setTasks(data))
      .catch(err => console.error('Failed to load tasks', err));
  };

  useEffect(() => {
    loadTasks();
  }, [id, entityType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const data = {
        ...form,
        [entityType === 'customers' ? 'customerId' : 'leadId']: id,
      };
      const newTask = await taskService.createTask(data);
      setTasks([...tasks, newTask]);
      setForm({ title: '', dueDate: '', status: 'pending' });
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
      status: task.status || 'pending',
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const updated = await taskService.updateTask(editingTask.id, editForm);
      setTasks(tasks.map(t => (t.id === editingTask.id ? updated : t)));
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  if (!id) {
    return <div>No target selected</div>;
  }

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <form onSubmit={handleSubmit} className="space-y-2 max-w-sm">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Task
        </button>
      </form>

      {editingTask && (
        <form onSubmit={handleEditSubmit} className="space-y-2 max-w-sm">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <input
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            placeholder="Title"
            className="w-full p-2 border rounded"
          />
          <input
            type="datetime-local"
            name="dueDate"
            value={editForm.dueDate}
            onChange={handleEditChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="status"
            value={editForm.status}
            onChange={handleEditChange}
            className="w-full p-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Save
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {task.title}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {task.status}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    className="text-green-600"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksPage;
