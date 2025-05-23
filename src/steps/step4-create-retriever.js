// Step 4: Create Retriever

import { setupVectorDB } from './step3-setup-vectordb.js';
import { prepareData } from './step2-prepare-data.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

const CONTEXT = 'RETRIEVER_CREATION';

async function createRetriever() {
  logger.separator()
  logger.info(CONTEXT,'Step 4: Retriever creation');

  try {
    // Vector store initialization
    const { vectorStore, qdrantClient } = await setupVectorDB();

    logger.info(CONTEXT,'1: Checking data in the database');

    // Check if the collection exists and has data
    let collectionInfo;
    try {
      collectionInfo = await qdrantClient.getCollection(
        config.qdrantCollection
      );
      logger.info(CONTEXT,'Collection information:', {
        name: collectionInfo.name,
        pointsCount: collectionInfo.points_count,
        vectorsCount: collectionInfo.vectors_count || 'N/A',
      });
    } catch (error) {
      logger.error(CONTEXT,'Error fetching collection information:', error.message);
    }

    // If the collection has no data, prepare and load data
    if (!collectionInfo || collectionInfo.points_count === 0) {
      logger.info(CONTEXT,'No data in the collection - preparing and loading data');

      const documents = await prepareData();
      logger.info(CONTEXT,'2: Loading data into the vector store');

      // Add documents to the vector store
      await vectorStore.addDocuments(documents);

      logger.success(CONTEXT,'Data loaded successfully into the vector store');
    } else {
      logger.warn(CONTEXT,'Data already exists in the collection - skipping loading');
    }

    logger.info(CONTEXT,'3: Creating retriever');

    // Create retriever
    const retriever = vectorStore.asRetriever({
      k: 3, // Number of similar documents to retrieve
      searchType: 'similarity', // Search type
      searchKwargs: {
        scoreThreshold: 0.7, // Minimum score threshold for similarity
      },
    });

    logger.success(CONTEXT,'Retriever created successfully!', {
      maxResults: 3,
      searchType: 'similarity',
      scoreThreshold: 0.7,
    });

    logger.info(CONTEXT,'4: Testing retriever');

    // Test retriever'a
    const testQuery = "What's the technical requirements?";
    logger.info(CONTEXT,'testQuery', testQuery);

    const relevantDocs = await retriever.invoke(testQuery);
    logger.info(CONTEXT,`Found ${relevantDocs.length} similar documents`);

    // Show a preview of the first few relevant documents
    relevantDocs.forEach((doc, index) => {
      logger.info(CONTEXT,'Relevant document', index + 1, {
        length: doc.pageContent.length,
        preview: doc.pageContent.substring(0, 200) + '...',
        metadata: doc.metadata,
      });
    });

    logger.separator()
    return retriever;
  } catch (error) {
    logger.error(CONTEXT, 'Error during retriever creation:', error);
    logger.separator()
    throw error;
  }
}

export { createRetriever };
