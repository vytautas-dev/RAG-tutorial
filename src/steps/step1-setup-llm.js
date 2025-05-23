// Step 1: Setup LLM with Google Gemini API

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

async function setupLLM() {
  logger.info('Step 1: LLM configuration');
  logger.info('1: Create LLM instance');
  try {
    // Create LLM instance
    const llm = new ChatGoogleGenerativeAI({
      apiKey: config.googleApiKey,
      model: config.geminiModel,
      maxOutputTokens: config.maxOutputTokens,
      temperature: 0.7, // controls randomness of output
    });

    logger.success('LLM instance created successfully!', {
      model: config.geminiModel,
      maxTokens: config.maxOutputTokens,
    });

    logger.info('2: Testing basic functionality');

    // Test the LLM with a simple question
    const testQuestion =
      'What is the AI language model? Response in 2-3 sentences.';

    logger.info('Sending test question to LLM:', testQuestion);
    const testResponse = await llm.invoke(testQuestion);

    logger.info('Test response received:', testResponse);
    return llm;
  } catch (error) {
    logger.error('Error during LLM configuration:', error);
    throw error;
  }
}

export { setupLLM };
