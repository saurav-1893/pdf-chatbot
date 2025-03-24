const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    // Here you would send the PDF to your Python service for processing
    const pythonServiceResponse = await axios.post('http://localhost:5001/process-pdf', {
      filePath: req.file.path
    });
    
    res.json({
      success: true,
      message: 'PDF uploaded and processed successfully',
      data: pythonServiceResponse.data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    // Send question to Python service
    const pythonServiceResponse = await axios.post('http://localhost:5001/ask-question', {
      question
    });
    
    res.json({
      success: true,
      answer: pythonServiceResponse.data.answer,
      sources: pythonServiceResponse.data.sources
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});