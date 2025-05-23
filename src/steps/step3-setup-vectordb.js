// Step 3: Setup Vector Database with Qdrant

import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

const CONTEXT = 'VECTORDB_SETUP';

async function setupVectorDB() {
  logger.separator()
  logger.info(CONTEXT,'Step 3: Vector database configuration');
  logger.info(CONTEXT,'1: Connecting to Qdrant');

  try {
    const qdrantClient = new QdrantClient({
      url: config.qdrantUrl,
    });

    await qdrantClient.getCollections();
    logger.success(CONTEXT,'Qdrant client connected successfully!', {
      url: config.qdrantUrl,
    });

    logger.info(CONTEXT,'2: Creating vector store');
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: config.googleApiKey,
    });

    logger.success(CONTEXT,'Embeddings instance created successfully!', {});

    const vectorStore = new QdrantVectorStore(embeddings, {
      client: qdrantClient,
      collectionName: config.qdrantCollection,
    });

    logger.success(CONTEXT,'Vector store created successfully!');
    logger.separator()
    return { vectorStore, embeddings, qdrantClient };
  } catch (error) {
    logger.error(CONTEXT,'Error during Qdrant configuration:', error);
    logger.separator()
    throw error;
  }
}

export { setupVectorDB };
