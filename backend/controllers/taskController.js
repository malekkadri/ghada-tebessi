const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.customerId) {
      where.customerId = req.query.customerId;
    }
    if (req.query.leadId) {
      where.leadId = req.query.leadId;
    }
    if (req.query.status) {
      where.status = req.query.status;
    }
    const tasks = await Task.findAll({ where });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const [updated] = await Task.update(req.body, {
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const updatedTask = await Task.findByPk(req.params.id);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await task.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const toggleReminder = async (req, res) => {
  try {
    const [updated] = await Task.update(
      { reminderEnabled: req.body.reminderEnabled },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const updatedTask = await Task.findByPk(req.params.id);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleReminder,
};
