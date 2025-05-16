const fs = require('fs');
const path = require('path');
const ScormPackage = require('../models/ScormPackage');
const ScormProgress = require('../models/ScormProgress');

// Get all SCORM packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await ScormPackage.find().sort({ uploadDate: -1 });
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single SCORM package by ID
exports.getPackageById = async (req, res) => {
  try {
    const scormPackage = await ScormPackage.findById(req.params.id);
    if (!scormPackage) {
      return res.status(404).json({ message: 'SCORM package not found' });
    }
    res.status(200).json(scormPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload a new SCORM package
exports.uploadPackage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create a new SCORM package in the database
    const newPackage = new ScormPackage({
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      version: req.body.version || '1.2',
      fileName: req.file.filename,
      filePath: `/scorm-packages/${req.file.filename}`
    });

    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a SCORM package
exports.deletePackage = async (req, res) => {
  try {
    const scormPackage = await ScormPackage.findById(req.params.id);
    if (!scormPackage) {
      return res.status(404).json({ message: 'SCORM package not found' });
    }

    // Delete the physical file
    const filePath = path.join(__dirname, '..', 'scorm-packages', scormPackage.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete progress data
    await ScormProgress.deleteMany({ packageId: scormPackage._id });

    // Delete the database entry
    await ScormPackage.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'SCORM package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save SCORM progress
exports.saveProgress = async (req, res) => {
  try {
    const { userId, packageId, lessonStatus, location, score, totalTime, suspendData } = req.body;

    if (!userId || !packageId) {
      return res.status(400).json({ message: 'User ID and Package ID are required' });
    }

    // Check if package exists
    const packageExists = await ScormPackage.findById(packageId);
    if (!packageExists) {
      return res.status(404).json({ message: 'SCORM package not found' });
    }

    // Find existing progress or create new
    let progress = await ScormProgress.findOne({ userId, packageId });

    if (progress) {
      // Update existing progress
      progress.lessonStatus = lessonStatus || progress.lessonStatus;
      progress.location = location || progress.location;
      progress.score = score || progress.score;
      progress.totalTime = totalTime || progress.totalTime;
      progress.suspendData = suspendData || progress.suspendData;
      progress.lastAccessed = Date.now();
    } else {
      // Create new progress record
      progress = new ScormProgress({
        userId,
        packageId,
        lessonStatus: lessonStatus || 'incomplete',
        location: location || '',
        score: score || 0,
        totalTime: totalTime || '0000:00:00.00',
        suspendData: suspendData || ''
      });
    }

    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user progress for a specific SCORM package
exports.getProgress = async (req, res) => {
  try {
    const { userId, packageId } = req.params;

    if (!userId || !packageId) {
      return res.status(400).json({ message: 'User ID and Package ID are required' });
    }

    const progress = await ScormProgress.findOne({ userId, packageId });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 