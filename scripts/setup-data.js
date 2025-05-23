// Script for initializing the database

import { prepareData } from '../src/steps/step2-prepare-data.js';
import { setupVectorDB } from '../src/steps/step3-setup-vectordb.js';
import { logger } from '../src/utils/logger.js';
import { config } from '../src/utils/config.js';

const CONTEXT = 'DATABASE_SETUP';

async function setupData() {
  logger.separator();
  logger.info(CONTEXT, 'Starting database setup...');

  try {
    logger.info(CONTEXT, '1: Checking connection to Qdrant');

    // Vector store initialization
    const { vectorStore, qdrantClient } = await setupVectorDB();

    logger.info(CONTEXT, '2: Checking connection to Qdrant');

    // Check if the collection has data
    let shouldLoadData = true;
    try {
      const collectionInfo = await qdrantClient.getCollection(
        config.qdrantCollection
      );
      if (collectionInfo.points_count > 0) {
        logger.info(CONTEXT, 'Collection already exists');

        // Ask user if they want to overwrite existing data
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const answer = await new Promise((resolve) => {
          rl.question('Overwrite data? (y/n): ', resolve);
        });
        rl.close();

        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          shouldLoadData = false;
          logger.info(CONTEXT, 'Skipping data loading - existing data will be used');
        } else {
          // Remove existing collection
          logger.info(CONTEXT, 'Deleting existing collection...');
          await qdrantClient.deleteCollection(config.qdrantCollection);
          logger.success(CONTEXT, 'Collection deleted successfully');
        }
      }
    } catch (error) {
      logger.error(CONTEXT, 'Error fetching collection information:', error.message);
    }

    if (shouldLoadData) {
      logger.info(CONTEXT, '3: Preparing data');

      // Prepare data
      const documents = await prepareData();

      logger.info(CONTEXT, '4: Loading data into the vector store');
      logger.info(CONTEXT,
        'Start embedding documents... This may take a few minutes on the first run'
      );

      // Add documents to the vector store in batches
      const batchSize = 10;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        logger.info(CONTEXT,
          `Processing batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(documents.length / batchSize)} (${batch.length} documents)`
        );

        await vectorStore.addDocuments(batch);

        // Short pause between batches
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      logger.success(CONTEXT,
        'All documents have been embedded and loaded into the vector store'
      );
    }

    logger.info(CONTEXT, '5: Verifying data in the database');

    // Verification
    const finalCollectionInfo = await qdrantClient.getCollection(
      config.qdrantCollection
    );

    logger.success(CONTEXT, 'Data verification completed successfully', {
      collection: config.qdrantCollection,
      documentsCount: finalCollectionInfo.points_count,
      status: 'ready',
    });

    logger.info(CONTEXT, 'You can now run the application: npm start');
    logger.separator();
  } catch (error) {
    logger.error(CONTEXT, 'Error during database setup:', error);
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('fetch failed')
    ) {
      logger.error(CONTEXT,
        '❌ Unable to connect to Qdrant. Please check if the Qdrant server is running and accessible.'
      );
    }
    logger.separator();
    process.exit(1);
  }
}

setupData();
