// Step 3: Setup Vector Database with Qdrant

import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { logger } from "../utils/logger.js";
import { config } from "../utils/config.js";

async function setupVectorDB() {
    logger.info('Step 3: Vector database configuration');
    logger.info('1: Connecting to Qdrant');

    try {
        const qdrantClient = new QdrantClient({
            url: config.qdrantUrl,
        });

        await qdrantClient.getCollections();
        logger.success('Qdrant client connected successfully!', {
            url: config.qdrantUrl,
        })

        logger.info('2: Creating vector store');
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: config.googleApiKey,
        });

        logger.success('Embeddings instance created successfully!', {})

        const vectorStore = new QdrantVectorStore(embeddings, {
            client: qdrantClient,
            collectionName: config.qdrantCollection,
        });

        logger.success('Vector store created successfully!')
        return { vectorStore, embeddings, qdrantClient };

    } catch (error) {
        logger.error('Error during Qdrant configuration:', error);
        throw error;
    }
}

export { setupVectorDB };
