import ReactMarkdown from 'react-markdown';
import React, { useState } from 'react';
import axios from 'react-markdown';

function App() {
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
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
    } catch (err) {
      alert('Upload failed!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    try {
      setIsLoading(true);
      const res = await axios.post('http://localhost:5000/ask', { question });
      setAnswer(res.data.answer);
    } catch (err) {
      alert('Error asking question');
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
        <button onClick={handleUpload} disabled={!file || isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
        {isUploaded && <p>PDF uploaded successfully!</p>}
      </div>

      {/* Question Input */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Ask a Question</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about the PDF..."
          style={{ width: '100%', minHeight: '100px', marginBottom: '10px' }}
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
          borderRadius: '5px' 
        }}>
          <h3>Answer:</h3>
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default App;