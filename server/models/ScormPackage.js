const mongoose = require('mongoose');

const ScormPackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  version: {
    type: String,
    enum: ['1.2', '2004'],
    default: '1.2'
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('ScormPackage', ScormPackageSchema); 