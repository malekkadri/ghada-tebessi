// Load all models with associations initialized
const { Customer, Lead, Interaction, Tag, VCard } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../database/sequelize');

const allowedStatuses = ['active', 'inactive', 'prospect', 'lost'];

// Customer CRUD
const createCustomer = async (req, res) => {
  try {
    // Clean payload to avoid sending invalid data (e.g. empty strings for integers)
    const { vcardId, status, ...payload } = req.body;

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    // Only include vcardId if it is a valid number. An empty string or undefined
    // causes Sequelize/MySQL to throw an error which resulted in a 500 response
    // when creating a customer without selecting a vCard.
    if (vcardId !== undefined && vcardId !== null && vcardId !== '') {
      payload.vcardId = parseInt(vcardId, 10);
    }

    const customer = await Customer.create({
      ...payload,
      status: status || null,
      userId: req.user.id,
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const { search, sortBy = 'created_at', order = 'ASC', tags } = req.query;

    const where = { userId: req.user.id };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const tagIds = tags ? tags.split(',') : null;
    const include = [
      { model: Tag, as: 'Tags', through: { attributes: [] } },
      { model: VCard, as: 'Vcard', attributes: ['id', 'name'] }
    ];
    if (tagIds) {
      include[0].where = { id: tagIds };
      include[0].required = true;
    }

    const allowedSortFields = ['name', 'email', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const customers = await Customer.findAll({
      where,
      order: [[sortField, sortOrder]],
      include,
      distinct: true,
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
      include: [
        { model: Tag, as: 'Tags', through: { attributes: [] } },
        { model: VCard, as: 'Vcard', attributes: ['id', 'name'] }
      ],
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
    const { status, vcardId, ...updateData } = req.body;

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const data = { ...updateData };
    if (status !== undefined) data.status = status;

    // Sanitize vcardId to avoid sending empty strings that cause database errors
    if (vcardId !== undefined) {
      data.vcardId = vcardId === null || vcardId === '' ? null : parseInt(vcardId, 10);
    }

    const [updated] = await Customer.update(data, {
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const updatedCustomer = await Customer.findByPk(req.params.id, {
      include: [
        { model: Tag, as: 'Tags', through: { attributes: [] } },
        { model: VCard, as: 'Vcard', attributes: ['id', 'name'] }
      ],
    });
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

// Stats
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [leadCount, customerCount, weeklyLeads, interactionsByCustomer] = await Promise.all([
      Lead.count({ where: { userId } }),
      Customer.count({ where: { userId } }),
      Lead.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%u'), 'week'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { userId },
        group: ['week'],
        order: [[sequelize.literal('week'), 'ASC']],
      }),
      Interaction.findAll({
        attributes: [
          'customerId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { userId, customerId: { [Op.ne]: null } },
        group: ['customerId', 'Customer.id'],
        include: [{ model: Customer, as: 'Customer', attributes: ['name'] }],
      }),
    ]);

    const totalLeads = leadCount + customerCount;
    const conversionRate = totalLeads ? customerCount / totalLeads : 0;

    const weeklyLeadCreation = weeklyLeads.map((l) => ({
      week: l.get('week'),
      count: Number(l.get('count')),
    }));

    const interactionsPerCustomer = interactionsByCustomer.map((i) => ({
      customerId: i.customerId,
      name: i.Customer ? i.Customer.name : null,
      count: Number(i.get('count')),
    }));

    res.json({
      leadCount,
      customerCount,
      conversionRate,
      weeklyLeadCreation,
      interactionsPerCustomer,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Lead CRUD
const createLead = async (req, res) => {
  try {
    const { vcardId, ...leadData } = req.body;
    const lead = await Lead.create({
      ...leadData,
      userId: req.user.id,
    });
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getLeads = async (req, res) => {
  try {
    const { search, sortBy = 'created_at', order = 'ASC', tags } = req.query;

    const where = { userId: req.user.id };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const tagIds = tags ? tags.split(',') : null;
    const include = [{ model: Tag, as: 'Tags', through: { attributes: [] } }];
    if (tagIds) {
      include[0].where = { id: tagIds };
      include[0].required = true;
    }

    const allowedSortFields = ['name', 'email', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const leads = await Lead.findAll({
      where,
      order: [[sortField, sortOrder]],
      include,
      distinct: true,
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
      include: [{ model: Tag, as: 'Tags', through: { attributes: [] } }],
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
    const { vcardId, ...updateData } = req.body;
    const [updated] = await Lead.update(updateData, {
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const updatedLead = await Lead.findByPk(req.params.id, {
      include: [{ model: Tag, as: 'Tags', through: { attributes: [] } }],
    });
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

// Convert a lead to a customer (preserve tags)
const convertLeadToCustomer = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Tag, as: 'Tags' }],
    });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    let finalStatus = req.body.status || lead.status || null;
    if (finalStatus && !allowedStatuses.includes(finalStatus)) {
      finalStatus = 'active';
    }

    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: finalStatus,
      notes: lead.notes,
      userId: lead.userId,
      vcardId: req.body.vcardId || null,
    });

    if (lead.Tags && lead.Tags.length) {
      await customer.addTags(lead.Tags);
    }

    await lead.destroy();

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Tag CRUD
const createTag = async (req, res) => {
  try {
    const tag = await Tag.create({
      name: req.body.name,
      userId: req.user.id,
    });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({ where: { userId: req.user.id } });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const [updated] = await Tag.update(
      { name: req.body.name },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    const tag = await Tag.findByPk(req.params.id);
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await tag.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Tag assignment
const assignTagToCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const tag = await Tag.findOne({
      where: { id: req.params.tagId, userId: req.user.id },
    });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await customer.addTag(tag);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const unassignTagFromCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const tag = await Tag.findOne({
      where: { id: req.params.tagId, userId: req.user.id },
    });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await customer.removeTag(tag);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const assignTagToLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const tag = await Tag.findOne({
      where: { id: req.params.tagId, userId: req.user.id },
    });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await lead.addTag(tag);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const unassignTagFromLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const tag = await Tag.findOne({
      where: { id: req.params.tagId, userId: req.user.id },
    });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await lead.removeTag(tag);
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
  getStats,
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToCustomer,
  createTag,
  getTags,
  updateTag,
  deleteTag,
  assignTagToCustomer,
  unassignTagFromCustomer,
  assignTagToLead,
  unassignTagFromLead,
  getInteractionsByCustomer,
  createInteractionForCustomer,
  getInteractionsByLead,
  createInteractionForLead,
  createInteraction,
  getInteractions,
  getInteractionById,
  updateInteraction,
  deleteInteraction,
};
