from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_openai import OpenAI
import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)

# Load environment variables
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# Global variables to store the processed PDF data
text_chunks = None
knowledge_base = None

def extract_text_from_pdf(pdf_path):
    text = ""
    pdf_reader = PdfReader(pdf_path)
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def split_text_into_chunks(text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks

def create_knowledge_base(chunks):
    embeddings = OpenAIEmbeddings()
    knowledge_base = FAISS.from_texts(chunks, embeddings)
    return knowledge_base

def search_internet(query):
    try:
        # Use a search API or scrape (note: scraping may violate terms of service)
        # This is a simplified example using a search API
        search_url = f"https://api.example.com/search?q={query}"
        response = requests.get(search_url)
        results = response.json()
        
        # Extract snippets and URLs
        sources = []
        for result in results.get('items', [])[:3]:  # Get top 3 results
            sources.append({
                'title': result.get('title'),
                'url': result.get('link'),
                'snippet': result.get('snippet')
            })
        return sources
    except Exception as e:
        print(f"Error searching internet: {e}")
        return []

@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    global text_chunks, knowledge_base
    
    data = request.get_json()
    pdf_path = data['filePath']
    
    # Extract text from PDF
    raw_text = extract_text_from_pdf(pdf_path)
    
    # Split text into chunks
    text_chunks = split_text_into_chunks(raw_text)
    
    # Create knowledge base
    knowledge_base = create_knowledge_base(text_chunks)
    
    return jsonify({"status": "success", "pages": len(text_chunks)})

@app.route('/ask-question', methods=['POST'])
def ask_question():
    global knowledge_base
    
    data = request.get_json()
    question = data['question']
    
    if not knowledge_base:
        return jsonify({"error": "No PDF processed yet"}), 400
    
    # Search the PDF knowledge base
    docs = knowledge_base.similarity_search(question)
    
    # Use LangChain to answer the question
    llm = OpenAI()
    chain = load_qa_chain(llm, chain_type="stuff")
    response = chain.run(input_documents=docs, question=question)
    
    # Verify with internet sources
    verification_sources = search_internet(question)
    
    return jsonify({
        "answer": response,
        "sources": verification_sources
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)