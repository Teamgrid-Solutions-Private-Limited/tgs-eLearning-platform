const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const scormRoutes = require('./routes/scormRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static SCORM packages
app.use('/scorm-packages', express.static(path.join(__dirname, 'scorm-packages')));

// API routes
app.use('/api/scorm', scormRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/scormDB')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
  }); 