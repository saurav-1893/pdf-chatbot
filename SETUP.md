# PDF Chatbot Setup Guide

## 1. Environment Setup
- Create `.env` files in both `/backend` and `/ai-service`
- Get OpenAI API key from [platform.openai.com](https://platform.openai.com)

## 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install