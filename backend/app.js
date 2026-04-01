const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
require('express-async-errors');

const routes       = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const notFound     = require('./middlewares/notFound');
const { NODE_ENV } = require('./config/env');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server or same-origin requests (no origin header)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body / Logging ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (NODE_ENV === 'development') app.use(morgan('dev'));

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── Error Handling ─────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
