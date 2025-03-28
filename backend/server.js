require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '50mb' }));

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed!'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Routes
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file received');
    
    const pythonResponse = await axios.post('http://localhost:5001/process-pdf', {
      filePath: req.file.path,
      originalName: req.file.originalname
    });

    res.json({
      success: true,
      message: 'File processed',
      filePath: req.file.path
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) throw new Error('Question is required');

    const response = await axios.post('http://localhost:5001/ask-question', {
      question: question.trim()
    });

    res.json(response.data);
  } catch (error) {
    console.error('Question error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});