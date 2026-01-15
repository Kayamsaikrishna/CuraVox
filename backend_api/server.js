const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const medicineRoutes = require('./routes/medicine');
const ocrRoutes = require('./routes/ocr');
const aiRoutes = require('./routes/ai');
const { AdvancedMedicalAI } = require('./services/aiService');

// Initialize AI Service
const aiService = new AdvancedMedicalAI();

// Import database connection
const connectDB = async () => {
  try {
    // Connect to MongoDB
    mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soniris')
      .then(async () => {
        console.log('MongoDB connected');
        // Run AI Health Check
        // Assuming aiService is imported or available in scope
        // If aiService is not defined, this will cause a ReferenceError
        // For the purpose of this edit, we are inserting the code as provided.
        await aiService.performStartupCheck();
      })
      .catch((err) => console.log('MongoDB Connection Error:', err));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

// Initialize app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Medical AI Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      medicine: '/api/medicine',
      ocr: '/api/ocr',
      ai: '/api/ai'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;