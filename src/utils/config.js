import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const requiredVars = ['GOOGLE_API_KEY'];

const missing = requiredVars.filter((name) => !process.env[name]);
if (missing.length > 0) {
  logger.error(`Environment variables are missing: ${missing.join(', ')}`);
  logger.info(
    'Please check the .env file and ensure all required variables are set'
  );
  process.exit(1);
}

export const config = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  qdrantCollection: process.env.QDRANT_COLLECTION_NAME || 'knowledge_base',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  maxOutputTokens: parseInt(process.env.MAX_OUTPUT_TOKENS) || 2048,
  dataPath: './data/knowledge-base.txt',
};
