const express = require('express');
const cors = require('cors');
const path = require('path');
const jobsRouter = require('./routes/jobs');
const resumesRouter = require('./routes/resumes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/resumes', resumesRouter);

// Default route
app.get('/', (req, res) => {
  res.send('Parshv Consultancy API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});