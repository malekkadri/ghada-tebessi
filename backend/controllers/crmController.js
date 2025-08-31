const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');
const { Op } = require('sequelize');

// Customer CRUD
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const { search, sortBy = 'created_at', order = 'ASC' } = req.query;

    const where = { userId: req.user.id };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const allowedSortFields = ['name', 'email', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const customers = await Customer.findAll({
      where,
      order: [[sortField, sortOrder]],
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, {
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const updatedCustomer = await Customer.findByPk(req.params.id);
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    await customer.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Lead CRUD
const createLead = async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getLeads = async (req, res) => {
  try {
    const { search, sortBy = 'created_at', order = 'ASC' } = req.query;

    const where = { userId: req.user.id };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const allowedSortFields = ['name', 'email', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const leads = await Lead.findAll({
      where,
      order: [[sortField, sortOrder]],
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateLead = async (req, res) => {
  try {
    const [updated] = await Lead.update(req.body, {
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const updatedLead = await Lead.findByPk(req.params.id);
    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    await lead.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Interaction CRUD
const getInteractionsByCustomer = async (req, res) => {
  try {
    const interactions = await Interaction.findAll({
      where: { customerId: req.params.id, userId: req.user.id },
    });
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const createInteractionForCustomer = async (req, res) => {
  try {
    const interaction = await Interaction.create({
      ...req.body,
      customerId: req.params.id,
      userId: req.user.id,
    });
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getInteractionsByLead = async (req, res) => {
  try {
    const interactions = await Interaction.findAll({
      where: { leadId: req.params.id, userId: req.user.id },
    });
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const createInteractionForLead = async (req, res) => {
  try {
    const interaction = await Interaction.create({
      ...req.body,
      leadId: req.params.id,
      userId: req.user.id,
    });
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const createInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.findAll({
      where: { userId: req.user.id },
    });
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getInteractionById = async (req, res) => {
  try {
    const interaction = await Interaction.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateInteraction = async (req, res) => {
  try {
    const [updated] = await Interaction.update(req.body, {
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!updated) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    const updatedInteraction = await Interaction.findByPk(req.params.id);
    res.json(updatedInteraction);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    await interaction.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getInteractionsByCustomer,
  createInteractionForCustomer,
  getInteractionsByLead,
  createInteractionForLead,
  createInteraction,
  getInteractions,
  getInteractionById,
  updateInteraction,
  deleteInteraction
};
