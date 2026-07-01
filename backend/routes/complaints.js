const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { sendComplaintUpdateEmail } = require('../mailer');

// Multer setup for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// POST /api/complaints - resident raises complaint
router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  const { category, description } = req.body;
  if (!category || !description)
    return res.status(400).json({ error: 'Category and description required' });

  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO complaints (user_id, category, description, photo_url)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, category, description, photo_url]
    );
    const complaint = result.rows[0];

    // Record in history
    await pool.query(
      `INSERT INTO complaint_history (complaint_id, actor_id, actor_name, old_status, new_status, note)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [complaint.id, req.user.id, req.user.name, null, 'Open', 'Complaint raised']
    );

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/complaints/mine - resident sees own complaints
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name as resident_name, u.flat_number
       FROM complaints c JOIN users u ON c.user_id = u.id
       WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/complaints - admin sees all with filters
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const { status, category, date_from, date_to } = req.query;
  let query = `SELECT c.*, u.name as resident_name, u.flat_number, u.email as resident_email
               FROM complaints c JOIN users u ON c.user_id = u.id WHERE 1=1`;
  const params = [];
  let i = 1;

  if (status) { query += ` AND c.status = $${i++}`; params.push(status); }
  if (category) { query += ` AND c.category = $${i++}`; params.push(category); }
  if (date_from) { query += ` AND c.created_at >= $${i++}`; params.push(date_from); }
  if (date_to) { query += ` AND c.created_at <= $${i++}`; params.push(date_to); }

  query += ' ORDER BY c.is_overdue DESC, c.created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/complaints/:id - get single complaint with history
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const complaint = await pool.query(
      `SELECT c.*, u.name as resident_name, u.flat_number, u.email as resident_email
       FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
      [req.params.id]
    );
    if (complaint.rows.length === 0)
      return res.status(404).json({ error: 'Complaint not found' });

    // Only admin or owner can view
    if (req.user.role !== 'admin' && complaint.rows[0].user_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });

    const history = await pool.query(
      `SELECT * FROM complaint_history WHERE complaint_id = $1 ORDER BY changed_at ASC`,
      [req.params.id]
    );

    res.json({ ...complaint.rows[0], history: history.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/complaints/:id - admin updates status/priority
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status, priority, note } = req.body;

  try {
    const current = await pool.query('SELECT * FROM complaints WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0)
      return res.status(404).json({ error: 'Complaint not found' });

    const c = current.rows[0];
    if (c.status === 'Resolved')
      return res.status(400).json({ error: 'Resolved complaints cannot be updated' });

    const newStatus = status || c.status;
    const newPriority = priority || c.priority;

    const updated = await pool.query(
      `UPDATE complaints SET status=$1, priority=$2, is_overdue=false, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [newStatus, newPriority, req.params.id]
    );

    // Record history if status changed
    if (status && status !== c.status) {
      await pool.query(
        `INSERT INTO complaint_history (complaint_id, actor_id, actor_name, old_status, new_status, note)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.params.id, req.user.id, req.user.name, c.status, newStatus, note || null]
      );

      // Get resident info and send email
      const resident = await pool.query('SELECT email, name FROM users WHERE id = $1', [c.user_id]);
      if (resident.rows.length > 0) {
        sendComplaintUpdateEmail(
          resident.rows[0].email,
          resident.rows[0].name,
          req.params.id,
          c.category,
          newStatus,
          note
        );
      }
    }

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
