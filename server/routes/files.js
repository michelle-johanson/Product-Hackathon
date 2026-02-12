const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp-originalName
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow PDF and Markdown types
    if (
      file.mimetype === 'application/pdf' || 
      file.mimetype === 'text/markdown' || 
      file.mimetype === 'text/plain' || 
      file.originalname.toLowerCase().endsWith('.md')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Markdown files are allowed.'));
    }
  }
});

// GET /api/files/:groupId - List files
router.get('/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const files = await prisma.file.findMany({
      where: { groupId: parseInt(groupId) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// POST /api/files/:groupId - Upload file
router.post('/:groupId', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { groupId } = req.params;
    const userId = req.user?.id; // Assumes auth middleware populates req.user

    // Determine type based on mimetype
    const isPdf = req.file.mimetype === 'application/pdf';
    const type = isPdf ? 'PDF' : 'MD';

    const newFile = await prisma.file.create({
      data: {
        name: req.file.originalname,
        url: req.file.filename,
        type: type,
        groupId: parseInt(groupId),
        uploadedBy: userId,
      }
    });

    res.json(newFile);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;