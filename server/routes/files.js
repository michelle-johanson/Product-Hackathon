const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { PDFParse } = require('pdf-parse');
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

// POST /api/files/backfill/content - Re-extract content for all files with empty content
// Must be defined BEFORE /:groupId routes to avoid param collision
router.post('/backfill/content', auth, async (req, res) => {
  try {
    const files = await prisma.file.findMany({ where: { content: '' } });
    let updated = 0;

    for (const file of files) {
      const filePath = path.join(uploadDir, file.url);
      if (!fs.existsSync(filePath)) continue;

      let content = '';
      try {
        if (file.type === 'PDF') {
          const dataBuffer = fs.readFileSync(filePath);
          const parser = new PDFParse({ data: new Uint8Array(dataBuffer), verbosity: 0 });
          const doc = await parser.load();
          const textResult = await parser.getText(doc);
          content = textResult.text || '';
          await parser.destroy();
        } else {
          content = fs.readFileSync(filePath, 'utf-8');
        }
      } catch (err) {
        console.error(`Extraction failed for ${file.name}:`, err.message);
        continue;
      }

      if (content) {
        await prisma.file.update({ where: { id: file.id }, data: { content } });
        updated++;
      }
    }

    res.json({ message: `Backfilled ${updated} of ${files.length} files` });
  } catch (error) {
    console.error('Backfill error:', error);
    res.status(500).json({ error: 'Backfill failed' });
  }
});

// POST /api/files/from-notes/:groupId - Save shared notes as a context file
router.post('/from-notes/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, fileName } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'No content to save' });
    }

    // Generate filename
    let finalFilename;
    if (fileName && fileName.trim()) {
      finalFilename = path.basename(fileName.trim()); // Sanitize
      if (!finalFilename.toLowerCase().endsWith('.md')) finalFilename += '.md';
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      finalFilename = `Notes-Context-${timestamp}.md`;
    }

    const filePath = path.join(uploadDir, finalFilename);

    // Write to disk
    fs.writeFileSync(filePath, content);

    // Save to DB
    const newFile = await prisma.file.create({
      data: {
        name: finalFilename,
        url: finalFilename,
        type: 'MD',
        content,
        groupId: parseInt(groupId),
        uploadedBy: req.user?.id
      }
    });

    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error saving context file:', error);
    res.status(500).json({ error: 'Failed to save context file' });
  }
});

// GET /api/files/:groupId - List files (supports ?search= deep search)
router.get('/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { search } = req.query;

    const where = { groupId: parseInt(groupId) };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const files = await prisma.file.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // Flag which files matched on content (not just name)
    const filesWithMatch = files.map(file => ({
      ...file,
      contentMatch: search
        ? file.content.toLowerCase().includes(search.toLowerCase()) && !file.name.toLowerCase().includes(search.toLowerCase())
        : false
    }));

    res.json(filesWithMatch);
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
    const userId = req.user?.id;

    const isPdf = req.file.mimetype === 'application/pdf';
    const type = isPdf ? 'PDF' : 'MD';

    // Extract text content for deep search
    let content = '';
    const filePath = path.join(uploadDir, req.file.filename);
    try {
      if (isPdf) {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: new Uint8Array(dataBuffer), verbosity: 0 });
        const doc = await parser.load();
        const textResult = await parser.getText(doc);
        content = textResult.text || '';
        await parser.destroy();
      } else {
        content = fs.readFileSync(filePath, 'utf-8');
      }
    } catch (err) {
      console.error('Text extraction failed, saving without content:', err.message);
    }

    const newFile = await prisma.file.create({
      data: {
        name: req.file.originalname,
        url: req.file.filename,
        type,
        content,
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

// DELETE /api/files/:fileId - Delete a file
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await prisma.file.findUnique({ where: { id: parseInt(fileId) } });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Remove from disk
    const filePath = path.join(uploadDir, file.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    await prisma.file.delete({ where: { id: parseInt(fileId) } });

    res.json({ message: 'File deleted' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;