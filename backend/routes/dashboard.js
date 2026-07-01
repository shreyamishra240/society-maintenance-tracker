const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/dashboard - admin stats
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [byStatus, byCategory, overdue, recent, total] = await Promise.all([
      pool.query(`SELECT status, COUNT(*) as count FROM complaints GROUP BY status`),
      pool.query(`SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC`),
      pool.query(`SELECT COUNT(*) as count FROM complaints WHERE is_overdue = true AND status != 'Resolved'`),
      pool.query(`SELECT c.*, u.name as resident_name, u.flat_number
                  FROM complaints c JOIN users u ON c.user_id = u.id
                  ORDER BY c.created_at DESC LIMIT 5`),
      pool.query(`SELECT COUNT(*) as count FROM complaints`)
    ]);

    res.json({
      total: parseInt(total.rows[0].count),
      by_status: byStatus.rows,
      by_category: byCategory.rows,
      overdue_count: parseInt(overdue.rows[0].count),
      recent_complaints: recent.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
