/**
 *  backend/src/index.js
 *  Main Express entry for the AI-Dashboard API
 */

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

/* ────────────────  Route files  ──────────────── */
const authRoutes   = require('./routes/auth');
const eventRoutes  = require('./routes/events');
const todoRoutes   = require('./routes/todos');
const assetRoutes  = require('./routes/assets');   // ← if you have assets.js

/* ────────────────  App setup  ─────────────────── */
const app  = express();
const PORT = process.env.PORT || 5001;   // keep backend on 5001

/* ────────────────  Middleware  ───────────────── */
app.use(helmet());
app.use(cors());
app.use(express.json());

/* ────────────────  Mount routes (all prefixed with /api)  ───── */
app.use('/api/auth',   authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/todos',  todoRoutes);
app.use('/api/assets', assetRoutes);     // ← remove these two lines
                                         //   if you don’t have assets routes

/* ────────────────  Simple health check  ──────── */
app.get('/', (_, res) => res.send('AI Dashboard API is running'));

/* ────────────────  Error handler  ────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error',
  });
});

/* ────────────────  Start server  ─────────────── */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
