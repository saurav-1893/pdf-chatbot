import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a PDF file first!');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setIsLoading(true);
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsUploaded(true);
      alert('PDF uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }
    if (!isUploaded) {
      alert('Please upload a PDF first');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post('http://localhost:5000/ask', {
        question: question.trim()
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error('Question error:', err);
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>PDF Chatbot</h1>
      
      {/* File Upload */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Upload PDF</h2>
        <input 
          type="file" 
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])} 
        />
        <button 
          onClick={handleUpload}
          disabled={!file || isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
        {isUploaded && <p style={{ color: 'green' }}>✓ PDF Ready</p>}
      </div>

      {/* Question Input */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Ask Question</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about the PDF..."
          style={{ width: '100%', minHeight: '100px' }}
          disabled={!isUploaded}
        />
        <button
          onClick={handleAsk}
          disabled={!isUploaded || isLoading}
        >
          {isLoading ? 'Processing...' : 'Ask'}
        </button>
      </div>

      {/* Answer Display */}
      {answer && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3>Answer:</h3>
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default App;