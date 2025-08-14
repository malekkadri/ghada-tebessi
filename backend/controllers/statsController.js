const User = require('../models/User');
const Project = require('../models/Project');
const VCard = require('../models/Vcard');

/**
 * Get aggregated statistics for the super admin dashboard.
 */
exports.getStats = async (_req, res) => {
  try {
    const [totalUsers, totalProjects, totalVCards, adminCount, superAdminCount, userCount] = await Promise.all([
      User.count(),
      Project.count(),
      VCard.count(),
      User.count({ where: { role: 'admin' } }),
      User.count({ where: { role: 'superAdmin' } }),
      User.count({ where: { role: 'user' } })
    ]);

    res.json({
      totalUsers,
      totalProjects,
      totalVCards,
      usersByRole: {
        admin: adminCount,
        superAdmin: superAdminCount,
        user: userCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

