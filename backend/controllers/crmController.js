// Load all models with associations initialized
const { Customer, Lead, Interaction, Tag, VCard, Users: User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../database/sequelize');
const fs = require('fs');
const csvParser = require('csv-parser');
const { Parser } = require('json2csv');

const getWeekKey = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${weekNo.toString().padStart(2, '0')}`;
};

const allowedStatuses = ['active', 'inactive', 'prospect', 'lost'];
const allowedStages = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

// Utility to parse CSV files and validate required headers
const parseCsvFile = (filePath, requiredHeaders) =>
  new Promise((resolve, reject) => {
    const rows = [];
    let aborted = false;
    const stream = fs.createReadStream(filePath).pipe(csvParser());

    stream
      .on('headers', (headers) => {
        const missing = requiredHeaders.filter((h) => !headers.includes(h));
        if (missing.length) {
          aborted = true;
          stream.destroy();
          reject(new Error(`Missing headers: ${missing.join(', ')}`));
        }
      })
      .on('data', (data) => {
        if (!aborted) rows.push(data);
      })
      .on('end', () => {
        if (!aborted) resolve(rows);
      })
      .on('error', (err) => {
        if (!aborted) reject(err);
      });
  });

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

// Import customers from CSV
const importCustomers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const rows = await parseCsvFile(req.file.path, ['name']);
    const records = [];
    const invalidRows = [];

    rows.forEach((row, idx) => {
      if (!row.name || !row.name.trim()) {
        invalidRows.push(idx + 1);
        return;
      }
      records.push({
        name: row.name.trim(),
        email: row.email || null,
        phone: row.phone || null,
        status: row.status || null,
        notes: row.notes || null,
        userId: req.user.id,
      });
    });

    if (invalidRows.length) {
      return res.status(400).json({
        error: `Missing required field 'name' in rows: ${invalidRows.join(', ')}`,
      });
    }

    await Customer.bulkCreate(records);
    res.json({ imported: records.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    if (req.file) fs.unlink(req.file.path, () => {});
  }
};

// Export customers to CSV
const exportCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({ where: { userId: req.user.id }, raw: true });
    const fields = ['name', 'email', 'phone', 'status', 'notes'];
    const parser = new Parser({ fields });
    const csv = parser.parse(customers);
    res.header('Content-Type', 'text/csv');
    res.attachment('customers.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Stats
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [leadCount, customerCount, leads, interactions, stageStats] = await Promise.all([
      Lead.count({ where: { userId } }),
      Customer.count({ where: { userId } }),
      Lead.findAll({ where: { userId }, attributes: ['created_at'], order: [['created_at', 'ASC']] }),
      Interaction.findAll({
        where: { userId, customerId: { [Op.ne]: null } },
        include: [{ model: Customer, as: 'Customer', attributes: ['id', 'name'] }],
      }),
      Lead.findAll({
        where: { userId },
        attributes: ['stage', [sequelize.fn('COUNT', sequelize.col('stage')), 'count']],
        group: ['stage'],
        raw: true,
      }),
    ]);

    const totalLeads = leadCount + customerCount;
    const conversionRate = totalLeads ? customerCount / totalLeads : 0;

    const weeklyMap = leads.reduce((acc, lead) => {
      const created = lead.get('created_at') || lead.created_at || lead.createdAt;
      if (!created) return acc;
      const week = getWeekKey(new Date(created));
      acc[week] = (acc[week] || 0) + 1;
      return acc;
    }, {});
    const weeklyLeadCreation = Object.entries(weeklyMap)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => (a.week > b.week ? 1 : -1));

    const interactionMap = interactions.reduce((acc, interaction) => {
      const id = interaction.customerId;
      if (!id) return acc;
      if (!acc[id]) {
        acc[id] = {
          customerId: id,
          name: interaction.Customer ? interaction.Customer.name : null,
          count: 0,
        };
      }
      acc[id].count += 1;
      return acc;
    }, {});
    const interactionsPerCustomer = Object.values(interactionMap);

    const stageCounts = stageStats.reduce((acc, row) => {
      acc[row.stage] = Number(row.count);
      return acc;
    }, {});

    const stageConversionRates = Object.entries(stageCounts).reduce((acc, [stage, count]) => {
      acc[stage] = leadCount ? count / leadCount : 0;
      return acc;
    }, {});

    res.json({
      leadCount,
      customerCount,
      conversionRate,
      weeklyLeadCreation,
      interactionsPerCustomer,
      stageCounts,
      stageConversionRates,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Lead CRUD
const createLead = async (req, res) => {
  try {
    const { vcardId, stage, ...leadData } = req.body;
    if (stage && !allowedStages.includes(stage)) {
      return res.status(400).json({
        error: `Invalid stage. Allowed values: ${allowedStages.join(', ')}`,
      });
    }
    const lead = await Lead.create({
      ...leadData,
      stage: stage || 'new',
      userId: req.user.id,
    });
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getLeads = async (req, res) => {
  try {
    const { search, sortBy = 'created_at', order = 'ASC', tags, stage } = req.query;

    const where = { userId: req.user.id };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (stage) {
      if (!allowedStages.includes(stage)) {
        return res.status(400).json({
          error: `Invalid stage. Allowed values: ${allowedStages.join(', ')}`,
        });
      }
      where.stage = stage;
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
    const { vcardId, stage, ...updateData } = req.body;
    if (stage && !allowedStages.includes(stage)) {
      return res.status(400).json({
        error: `Invalid stage. Allowed values: ${allowedStages.join(', ')}`,
      });
    }
    if (stage !== undefined) updateData.stage = stage;
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

// Import leads from CSV
const importLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const rows = await parseCsvFile(req.file.path, ['name']);
    const records = [];
    const invalidRows = [];

    rows.forEach((row, idx) => {
      if (!row.name || !row.name.trim()) {
        invalidRows.push(idx + 1);
        return;
      }
      let stage = row.stage ? row.stage.toLowerCase() : 'new';
      if (!allowedStages.includes(stage)) stage = 'new';
      records.push({
        name: row.name.trim(),
        email: row.email || null,
        phone: row.phone || null,
        status: row.status || null,
        stage,
        notes: row.notes || null,
        userId: req.user.id,
      });
    });

    if (invalidRows.length) {
      return res.status(400).json({
        error: `Missing required field 'name' in rows: ${invalidRows.join(', ')}`,
      });
    }

    await Lead.bulkCreate(records);
    res.json({ imported: records.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    if (req.file) fs.unlink(req.file.path, () => {});
  }
};

// Export leads to CSV
const exportLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({ where: { userId: req.user.id }, raw: true });
    const fields = ['name', 'email', 'phone', 'status', 'stage', 'notes'];
    const parser = new Parser({ fields });
    const csv = parser.parse(leads);
    res.header('Content-Type', 'text/csv');
    res.attachment('leads.csv');
    return res.send(csv);
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

// Convert a customer to a user account
const convertCustomerToUser = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const name = req.body.name || customer.name;
    const email = req.body.email || customer.email;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const generatePassword = (length = 12) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let pwd = '';
      for (let i = 0; i < length; i += 1) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pwd;
    };

    const plainPassword = generatePassword();

    const user = await User.create({
      name,
      email,
      password: plainPassword,
      role: req.body.role || 'user',
    });

    await customer.destroy();

    res.status(201).json({ user, password: plainPassword });
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
  importCustomers,
  exportCustomers,
  getStats,
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  importLeads,
  exportLeads,
  convertLeadToCustomer,
  convertCustomerToUser,
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
