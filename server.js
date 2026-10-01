const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
const authRoutes = require('./routes/auth');
const announcementRoutes = require('./routes/announcement');
const healthRoutes = require('./routes/health');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const defaultMongoUri = 'mongodb://127.0.0.1:27017/PhinmaServeDB';
// A configured database must never fall back to a different local database.
// Doing so can make valid production accounts appear missing after a remote
// connection failure. The local default is only for installations with no
// MONGO_URI configuration at all.
const configuredMongoUri = String(process.env.MONGO_URI || '').trim();
const mongoConnectionCandidates = configuredMongoUri ? [configuredMongoUri] : [defaultMongoUri];
const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '1', 10);
const shouldForceHttps = String(process.env.FORCE_HTTPS || (process.env.NODE_ENV === 'production' ? 'true' : 'false')).toLowerCase() === 'true';
const mongoRetryDelayMs = Math.max(1000, Number.parseInt(process.env.MONGO_RETRY_DELAY_MS || '5000', 10) || 5000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const dbState = {
  connectedAt: null,
  connecting: false,
  lastError: '',
  lastErrorAt: null,
  lastRetryAt: null,
  retryTimer: null,
  activeMongoUri: ''
};

app.set('trust proxy', Number.isNaN(trustProxyHops) ? 1 : trustProxyHops);
mongoose.set('bufferCommands', false);

function isLocalRequest(req) {
  const ip = String(req.ip || '');
  return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
}

function requestIsSecure(req) {
  if (req.secure) return true;
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  return forwardedProto === 'https';
}

function isHealthRequest(req) {
  const pathName = String(req.path || req.originalUrl || '').split('?')[0];
  return pathName === '/health' || pathName === '/api/health';
}

function getMongoStateLabel() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

function scheduleMongoReconnect() {
  if (dbState.retryTimer) return;
  dbState.lastRetryAt = new Date();
  dbState.retryTimer = setTimeout(() => {
    dbState.retryTimer = null;
    connectToMongo();
  }, mongoRetryDelayMs);
}

async function connectToMongo() {
  if (dbState.connecting || isDatabaseReady()) {
    return;
  }

  dbState.connecting = true;
  let lastError = null;

  try {
    for (const candidateUri of mongoConnectionCandidates) {
      try {
        await mongoose.connect(candidateUri, {
          serverSelectionTimeoutMS: 10000
        });
        dbState.activeMongoUri = candidateUri;
        dbState.lastError = '';
        return;
      } catch (err) {
        lastError = err;
        logger.warn(`MongoDB connection attempt failed for ${candidateUri}`, { error: err.message });
      }
    }

    throw lastError || new Error('MongoDB connection failed');
  } catch (err) {
    dbState.lastError = err.message;
    dbState.lastErrorAt = new Date();
    logger.error('MongoDB connection error', { error: err.message });
    scheduleMongoReconnect();
  } finally {
    dbState.connecting = false;
  }
}

mongoose.connection.on('connected', () => {
  dbState.connectedAt = new Date();
  dbState.lastError = '';
  logger.info('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  scheduleMongoReconnect();
});

mongoose.connection.on('error', err => {
  dbState.lastError = err.message;
  dbState.lastErrorAt = new Date();
  logger.error('MongoDB connection error', { error: err.message });
});

/* ===============================
   RATE LIMITERS
================================ */

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 5000,
  skip: (req) => process.env.NODE_ENV !== 'production' && isLocalRequest(req),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 200,
  skipSuccessfulRequests: true,
  skip: (req) => process.env.NODE_ENV !== 'production' && isLocalRequest(req),
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

/* ===============================
   GLOBAL MIDDLEWARE
================================ */

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      "script-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      "img-src": ["'self'", "data:", "https:"],
      "default-src": ["'self'"],
      "style-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "'unsafe-inline'"],
      "font-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      "connect-src": ["'self'"]
    }
  }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
}));
app.use((req, res, next) => {
  if (!shouldForceHttps || isLocalRequest(req) || isHealthRequest(req) || requestIsSecure(req)) {
    return next();
  }

  const host = req.headers.host;
  if (!host) {
    return next();
  }

  return res.redirect(308, `https://${host}${req.originalUrl}`);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Add response time tracking
  const startTime = Date.now();
  res.on('finish', () => {
    res.responseTime = Date.now() - startTime;
    if (res.statusCode >= 500) {
      logger.errorResponse(req, res, new Error(`HTTP ${res.statusCode}`));
    } else {
      logger.response(req, res);
    }
  });
  
  logger.request(req);
  next();
});
// redirect: false so a bare /announcement reaches its page route below instead
// of being 301'd to the public/announcement/ folder, whose index.html only
// bounced back to /announcement.html through a CSP-blocked inline script.
app.use(express.static(path.join(__dirname, 'public'), { redirect: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get(['/health', '/api/health'], (req, res) => {
  const healthy = isDatabaseReady();
  return res.status(healthy ? 200 : 503).json({
    ok: healthy,
    uptimeSeconds: Math.round(process.uptime()),
    database: {
      ready: healthy,
      state: getMongoStateLabel(),
      connectedAt: dbState.connectedAt,
      lastError: dbState.lastError || null,
      lastErrorAt: dbState.lastErrorAt,
      nextRetryAt: dbState.lastRetryAt
    }
  });
});

app.use('/api', (req, res, next) => {
  if (isDatabaseReady()) {
    return next();
  }

  return res.status(503).json({
    error: 'Database unavailable. Please try again shortly.',
    databaseState: getMongoStateLabel()
  });
});

app.use('/api', generalLimiter);

/* ===============================
   DATABASE CONNECTION
================================ */

connectToMongo();

/* ===============================
   ROUTES
================================ */

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/send-verification', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/auth/schedule', announcementRoutes);
app.use('/api/schedule', announcementRoutes);
app.use('/api/health', healthRoutes);

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

const adminPageHandler = (req, res) => {
  // This is the role-aware admin interface. It switches its navigation and
  // available management tools based on whether the signed-in account is a
  // super admin.
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
};

app.get(['/admin', '/admin/dashboard'], adminPageHandler);
app.get(['/admin/users', '/admin/accounts', '/admin/announcements', '/admin/transactions', '/admin/registrations', '/admin/pickup-confirmations'], adminPageHandler);
// Inventory is its own document, but is addressed under /admin like every other
// admin module so the sidebar links are consistent across all six pages.
app.get('/admin/inventory', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inventory.html'));
});
app.get('/admin/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-feedback.html'));
});
app.get('/admin/returns', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-returns.html'));
});
app.get('/admin/supply-stock', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-supply-stock.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/request', (req, res) => {
  res.redirect(302, '/dashboard#request');
});

app.get('/announcement', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'announcement.html'));
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feedback.html'));
});

app.get('/returns', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'returns.html'));
});

// The bare /inventory path is the pre-consolidation address. It now issues a real
// 301 so the canonical /admin/inventory URL replaces it in history instead of the
// two addresses remaining distinct and separately bookmarkable.
app.get('/inventory', (req, res) => {
  res.redirect(301, '/admin/inventory');
});

app.get('/schedule', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'schedule.html'));
});

app.get('/logout', (req, res) => {
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  res.redirect('/');
});

/* ===============================
   404 HANDLER
================================ */

app.use(notFound);

/* ===============================
   GLOBAL ERROR HANDLER
================================ */

app.use(errorHandler);

/* ===============================
   START SERVER
================================ */

// Only start server if this file is run directly
let server;
if (require.main === module) {
  server = http.createServer({ maxHeaderSize: 65536 }, app).listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`, { forceHttps: shouldForceHttps, nodeEnv: process.env.NODE_ENV });
  });
}

// Export app for testing
module.exports = app;

/* ===============================
   PROCESS SAFETY HANDLERS
================================ */

process.on('uncaughtException', err => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  mongoose.connection.close(false).then(() => {
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  }).catch(() => {
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  });
});

process.on('unhandledRejection', reason => {
  logger.error('Unhandled Rejection', { error: reason });
  mongoose.connection.close(false).then(() => {
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  }).catch(() => {
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  });
});
