// Step 2: Data Preparation

import fs from 'fs/promises';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

const CONTEXT = 'DATA_PREPARATION';

async function prepareData() {
  logger.separator();
  logger.info(CONTEXT, 'Step 2: Data Preparation');
  logger.info(CONTEXT, '1: Loading data from text file...');

  try {
    const rawData = await fs.readFile(config.dataPath, 'utf-8');

    logger.success(CONTEXT, ' Data loaded successfully', {
      filePath: config.dataPath,
      fileSize: `${rawData.length} characters`,
      preview: rawData.substring(0, 100) + '...',
    });

    logger.info(CONTEXT,'2: Splitting text into chunks');

    // Text splitter configuration
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Max size of each chunk
      chunkOverlap: 200, // Characters to overlap between chunks
      separators: ['\n\n', '\n', ' ', ''], // Preferred separators
    });

    logger.info(CONTEXT, 'Text splitter configuration:', {
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', ' ', ''],
    });

    // Chunking the text
    const documents = await textSplitter.createDocuments([rawData]);

    logger.info(CONTEXT, `Text split into ${documents.length} chunks`);

    // Show a preview of the first few chunks
    documents.forEach((doc, index) => {
      logger.info(CONTEXT,`Fragment ${index + 1}:`, {
        length: doc.pageContent.length,
        preview: doc.pageContent.substring(0, 150) + '...',
      });
    });

    logger.info(CONTEXT,'3: Analyzing chunk quality');

    const stats = {
      totalDocuments: documents.length,
      averageLength: Math.round(
        documents.reduce((sum, doc) => sum + doc.pageContent.length, 0) /
          documents.length
      ),
      minLength: Math.min(...documents.map((doc) => doc.pageContent.length)),
      maxLength: Math.max(...documents.map((doc) => doc.pageContent.length)),
    };

    logger.info(CONTEXT,'Chunk statistics:', stats);
    logger.separator();
    return documents;
  } catch (error) {
    logger.error(CONTEXT,'Error during data preparation:', error);
    logger.separator();
    throw error;
  }
}

export { prepareData };
