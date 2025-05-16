const mongoose = require('mongoose');

const ScormProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScormPackage',
    required: true
  },
  lessonStatus: {
    type: String,
    enum: ['not attempted', 'incomplete', 'completed', 'passed', 'failed', 'browsed'],
    default: 'not attempted'
  },
  location: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalTime: {
    type: String,
    default: '0000:00:00.00'
  },
  suspendData: {
    type: String,
    default: ''
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for user and package
ScormProgressSchema.index({ userId: 1, packageId: 1 }, { unique: true });

module.exports = mongoose.model('ScormProgress', ScormProgressSchema); 