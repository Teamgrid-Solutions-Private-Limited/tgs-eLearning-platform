const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const scormController = require('../controllers/scormController');

// Make sure the upload directory exists
const uploadDir = path.join(__dirname, '..', 'scorm-packages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
  fileFilter: (req, file, cb) => {
    // Accept only zip files for SCORM packages
    if (file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' ||
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only zip files are allowed for SCORM packages'), false);
    }
  }
});

// SCORM package routes
router.get('/', scormController.getAllPackages);
router.get('/:id', scormController.getPackageById);
router.post('/upload', upload.single('scormPackage'), scormController.uploadPackage);
router.delete('/:id', scormController.deletePackage);

// SCORM progress routes
router.post('/progress', scormController.saveProgress);
router.get('/progress/:userId/:packageId', scormController.getProgress);

module.exports = router; 