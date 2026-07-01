require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const pool = require('./db');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Overdue detection - runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  const overdueDays = parseInt(process.env.OVERDUE_DAYS) || 3;
  try {
    const result = await pool.query(
      `UPDATE complaints
       SET is_overdue = true
       WHERE status != 'Resolved'
       AND is_overdue = false
       AND created_at < NOW() - INTERVAL '${overdueDays} days'
       RETURNING id`
    );
    if (result.rows.length > 0) {
      console.log(`⚠️  Marked ${result.rows.length} complaints as overdue`);
    }
  } catch (err) {
    console.error('Cron error:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
