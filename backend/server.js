require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jobsRouter = require('./routes/jobs');
const resumesRouter = require('./routes/resumes');
const contactRouter = require('./routes/contact');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsConfig = {
  origin: corsOrigin,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};
app.use(cors(corsConfig));
// Handle CORS preflight for all routes
app.options('*', cors(corsConfig));
app.use(helmet());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authLimiter, authRouter);

// Default route
app.get('/', (req, res) => {
  res.send('Parshv Consultancy API is running');
});
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
