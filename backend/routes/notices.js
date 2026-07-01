const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { sendNoticeEmail } = require('../mailer');

// GET /api/notices - all users can see
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.name as admin_name FROM notices n
       JOIN users u ON n.admin_id = u.id
       ORDER BY n.is_important DESC, n.posted_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notices - admin only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { title, content, is_important } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: 'Title and content required' });

  try {
    const result = await pool.query(
      `INSERT INTO notices (admin_id, title, content, is_important)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, title, content, is_important || false]
    );

    // If important, send email to all residents
    if (is_important) {
      const residents = await pool.query(
        `SELECT email FROM users WHERE role = 'resident'`
      );
      const emails = residents.rows.map(r => r.email);
      if (emails.length > 0) {
        sendNoticeEmail(emails, title, content);
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notices/:id - admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM notices WHERE id = $1', [req.params.id]);
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
