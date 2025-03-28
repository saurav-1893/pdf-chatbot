require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = process.env.UPLOAD_DIR || './uploads';
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  })
});

// Test route
app.get('/test', (req, res) => {
  res.json({ status: 'Backend working!' });
});

// Upload endpoint
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5001/process-pdf', {
      filePath: req.file.path
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Question endpoint
app.post('/ask', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5001/ask-question', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});