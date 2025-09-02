const cron = require('node-cron');
const { Op } = require('sequelize');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendCustomEmail } = require('../services/emailService');

const WINDOW_MINUTES = parseInt(process.env.REMINDER_WINDOW_MINUTES || '60', 10);

async function checkDueTasks() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + WINDOW_MINUTES * 60000);
  try {
    const tasks = await Task.findAll({
      where: {
        reminderEnabled: true,
        reminderSent: false,
        status: 'pending',
        dueDate: { [Op.between]: [now, windowEnd] },
      },
      include: [{ model: User, as: 'Users', attributes: ['email', 'name'] }],
    });

    for (const task of tasks) {
      const message = `Task "${task.title}" is due at ${task.dueDate.toLocaleString()}`;
      if (task.Users && task.Users.email) {
        try {
          await sendCustomEmail(task.Users.email, task.Users.name || '', {
            subject: 'Task Reminder',
            text: message,
          });
        } catch (err) {
          await Notification.create({ userId: task.userId, title: 'Task Reminder', message });
        }
      } else {
        await Notification.create({ userId: task.userId, title: 'Task Reminder', message });
      }
      task.reminderSent = true;
      await task.save();
    }
  } catch (err) {
    console.error('Error in task reminder job:', err);
  }
}

if (process.env.NODE_ENV !== 'test') {
  cron.schedule('*/30 * * * *', checkDueTasks);
}

module.exports = { checkDueTasks };
