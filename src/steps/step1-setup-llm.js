// Step 1: Setup LLM with Google Gemini API

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

const CONTEXT = 'LLM_SETUP';

async function setupLLM() {
  logger.separator()
  logger.info(CONTEXT, 'Step 1: LLM configuration');
  logger.info(CONTEXT, '1: Create LLM instance');
  try {
    // Create LLM instance
    const llm = new ChatGoogleGenerativeAI({
      apiKey: config.googleApiKey,
      model: config.geminiModel,
      maxOutputTokens: config.maxOutputTokens,
      temperature: 0.7, // controls randomness of output
    });

    logger.success(CONTEXT, 'LLM instance created successfully!', {
      model: config.geminiModel,
      maxTokens: config.maxOutputTokens,
    });

    logger.info(CONTEXT, '2: Testing basic functionality');

    // Test the LLM with a simple question
    const testQuestion =
      'What is the AI language model? Response in 2-3 sentences.';

    logger.info(CONTEXT, 'Sending test question to LLM:', testQuestion);
    const testResponse = await llm.invoke(testQuestion);

    logger.info(CONTEXT, 'Test response received:', testResponse);
    logger.separator()
    return llm;
  } catch (error) {
    logger.error(CONTEXT, 'Error during LLM configuration:', error);
    logger.separator()
    throw error;
  }

}

export { setupLLM };
