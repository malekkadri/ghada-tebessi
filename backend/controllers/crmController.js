const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');

// Customer CRUD
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getCustomers = async (_req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
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
      where: { id: req.params.id }
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
    const customer = await Customer.findByPk(req.params.id);
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
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getLeads = async (_req, res) => {
  try {
    const leads = await Lead.findAll();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
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
      where: { id: req.params.id }
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
    const lead = await Lead.findByPk(req.params.id);
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
      where: { customerId: req.params.id }
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
      customerId: req.params.id
    });
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const createInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.create(req.body);
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getInteractions = async (_req, res) => {
  try {
    const interactions = await Interaction.findAll();
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getInteractionById = async (req, res) => {
  try {
    const interaction = await Interaction.findByPk(req.params.id);
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
      where: { id: req.params.id }
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
    const interaction = await Interaction.findByPk(req.params.id);
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
  createInteraction,
  getInteractions,
  getInteractionById,
  updateInteraction,
  deleteInteraction
};
