import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      setIsLoading(true);
      const res = await axios.post('http://localhost:5000/upload', formData);
      if (res.data.success) setIsUploaded(true);
    } catch (err) {
      alert('Upload failed!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    try {
      setIsLoading(true);
      const res = await axios.post('http://localhost:5000/ask', { question });
      setAnswer(res.data.answer);
      setSources(res.data.sources || []);
    } catch (err) {
      alert('Error asking question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>PDF Chatbot</h1>
      <div style={{ marginBottom: '20px' }}>
        <h2>Upload PDF</h2>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file || isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
        {isUploaded && <p>PDF uploaded!</p>}
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Ask a Question</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something about the PDF..."
          style={{ width: '100%', minHeight: '100px' }}
        />
        <button onClick={handleAskQuestion} disabled={!isUploaded || isLoading}>
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </div>
      {answer && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Answer</h2>
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      )}
      {sources.length > 0 && (
        <div>
          <h2>Sources</h2>
          <ul>
            {sources.map((source, i) => (
              <li key={i}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title || source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;