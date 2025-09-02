const sequelize = require('../database/sequelize');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Interaction = require('../models/Interaction');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    const user = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password'
    });

    const lead = await Lead.create({
      name: 'Acme Corp',
      email: 'lead@acme.test',
      phone: '123-456-7890',
      status: 'contacted',
      stage: 'contacted',
      userId: user.id,
      notes: 'Met at conference'
    });

    const customer = await Customer.create({
      name: 'Beta Industries',
      email: 'contact@beta.test',
      phone: '555-555-5555',
      status: 'active',
      userId: user.id,
      notes: 'Converted from lead',
      convertedAt: new Date(),
      leadCreatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    await Task.bulkCreate([
      {
        title: 'Follow up with Acme',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        userId: user.id,
        leadId: lead.id
      },
      {
        title: 'Send invoice to Beta Industries',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        userId: user.id,
        customerId: customer.id
      }
    ]);

    await Interaction.bulkCreate([
      {
        type: 'email',
        date: new Date(),
        notes: 'Introduction email sent',
        userId: user.id,
        leadId: lead.id
      },
      {
        type: 'call',
        date: new Date(),
        notes: 'Discussed pricing',
        userId: user.id,
        customerId: customer.id
      }
    ]);

    console.log('CRM data seeded successfully');
  } catch (error) {
    console.error('Failed to seed CRM data:', error);
  } finally {
    await sequelize.close();
  }
}

seed();
