# RAG Tutorial – Step-by-Step Guide to Building an LLM-Powered Application

This project is a complete tutorial demonstrating how to build a Retrieval-Augmented Generation (RAG) application using JavaScript, LangChain, and a local vector database (Qdrant).

## What is RAG?

Retrieval-Augmented Generation (RAG) combines information retrieval with language model generation. The application:

- Searches a knowledge base for relevant information
- Uses the retrieved information as context for the LLM
- Generates a response based on that context

## Project Structure

```
rag-tutorial/
├── README.md                 # This file
├── docker-compose.yml        # Qdrant configuration
├── .env.example             # Example environment variables
├── .env                     # Your API keys (do not commit!)
├── package.json             # Dependencies
├── data/                    # Data for indexing
│   └── knowledge-base.txt   # Knowledge base
├── src/
│   ├── app.js              # Main application
│   ├── steps/              # Tutorial steps
│   │   ├── step1-setup-llm.js
│   │   ├── step2-prepare-data.js
│   │   ├── step3-setup-vectordb.js
│   │   ├── step4-create-retriever.js
│   │   └── step5-build-chain.js
│   └── utils/
│       ├── logger.js       # Logging system
│       ├── combineDocuments.js
│       └── config.js       # Configuration
└── scripts/
    └── setup-data.js       # Script for loading data
```

## Requirements

- Node.js 18+
- Docker and Docker Compose
- Google Gemini API key

## Installation and Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd rag-tutorial
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and add your Google Gemini API key
```

### 3. Start the Qdrant vector database

```bash
docker-compose up -d
```

### 4. Prepare the data

```bash
npm run setup-data
```

### 5. Run the application

```bash
npm start
```

## Tutorial – Steps

**Step 1: LLM Setup**  
Learn how to connect to the Google Gemini API and configure a language model.

**Step 2: Data Preparation**  
See how to format your textual data for indexing in a vector database.

**Step 3: Vector Database Configuration**  
Connect to the local Qdrant instance and prepare it for storing embeddings.

**Step 4: Retriever Creation**  
Build the component responsible for searching similar documents.

**Step 5: RAG Chain Assembly**  
Combine all components into a functional RAG pipeline.

## Usage

Once the application starts, it will prompt you for a question in the terminal:

```
? Ask a question: What are the technical requirements to run Polysight?
```

## Architecture

```
User Question
      ↓
Transform into a standalone question
      ↓
Search in vector database (Qdrant)
      ↓
Combine retrieved documents
      ↓
Generate answer using LLM
      ↓
Return response to user
```

## Technologies

- **LangChain**: Framework for building LLM-powered apps
- **Google Gemini**: Language model for generating responses
- **Qdrant**: Local vector database
- **Docker**: Containerized database environment

## Logging & Debugging

The application includes detailed logs that display each step of the process. Logs are color-coded and include timestamps for easier debugging.

## Further Development

After completing the tutorial, you can:

- Add more data sources
- Experiment with different LLMs
- Implement a web interface
- Add response caching
