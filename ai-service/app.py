import os
from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# Global variables
text_chunks = None
knowledge_base = None

def process_pdf(pdf_path):
    global text_chunks, knowledge_base
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PdfReader(file)
        text = "\n".join([page.extract_text() for page in pdf_reader.pages])
    
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    text_chunks = text_splitter.split_text(text)
    
    embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
    knowledge_base = FAISS.from_texts(text_chunks, embeddings)

@app.route('/process-pdf', methods=['POST'])
def handle_pdf():
    try:
        data = request.get_json()
        process_pdf(data['filePath'])
        return jsonify({"status": "PDF processed", "pages": len(text_chunks)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ask-question', methods=['POST'])
def ask_question():
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({"error": "Empty question"}), 400
        if not knowledge_base:
            return jsonify({"error": "No PDF processed"}), 400
            
        docs = knowledge_base.similarity_search(question, k=3)
        llm = OpenAI(
            temperature=0.3,
            model="gpt-3.5-turbo-instruct",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        chain = load_qa_chain(llm, chain_type="stuff")
        answer = chain.run(input_documents=docs, question=question)
        
        return jsonify({
            "answer": answer,
            "sources": [{"title": "PDF Context", "url": ""}]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)