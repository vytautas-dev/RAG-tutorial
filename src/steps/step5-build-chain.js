// Step 5: Building RAG Chain

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { setupLLM } from './step1-setup-llm.js';
import { createRetriever } from './step4-create-retriever.js';
import { combineDocuments } from '../utils/combineDocuments.js';
import { logger } from '../utils/logger.js';

async function buildRAGChain() {
  logger.info('Step 5: Building RAG Chain');

  logger.info('1: Initializing components');

  try {
    // LM and retriever initialization
    const llm = await setupLLM();
    const retriever = await createRetriever();

    logger.info('2: Creating prompt templates');

    // Template for generating standalone questions
    const standaloneQuestionTemplate = `
Transform the given question into a standalone, complete question that can be understood without additional context.
Retain the original language of the question.

Question: {question}
Standalone question:`;

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionTemplate
    );

    logger.info('Prompt for standalone question created');
    // Template for generating answers based on context
    const answerTemplate = `
You are a helpful assistant who answers questions about Polysight based on the provided context.
Instructions:

- Respond only using the information contained in the context.
- If the answer cannot be found in the context, say: "I'm sorry, I don't have any information about this topic. Please contact help@polysight.com"
- Use a friendly, natural tone.
- Provide specific, helpful answers.
- Use English.

Context:
{context}

Question:
{question}

Answer:`;

    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

    logger.success('Prompt for generating answers created');
    logger.info('3: Creating sub-chains');

    // Chain for generating standalone questions
    const standaloneQuestionChain = RunnableSequence.from([
      standaloneQuestionPrompt,
      llm,
      new StringOutputParser(),
    ]);

    logger.success('Standalone question chain created');

    // Chain for retrieving context and preparing for answer generation
    const retrieverChain = RunnableSequence.from([
      (prevResult) => {
        logger.info(
          'Retrieving context for question:',
          prevResult.standalone_question
        );
        return prevResult.standalone_question;
      },
      retriever,
      combineDocuments,
    ]);

    logger.success('Retriever chain created');

    // Chain for generating answers
    const answerChain = RunnableSequence.from([
      answerPrompt,
      llm,
      new StringOutputParser(),
    ]);

    logger.success('Answer chain created');

    logger.info('Step 4: Combining all components into the main RAG chain');

    // Main RAG chain
    const ragChain = RunnableSequence.from([
      // Generate standalone question
      {
        standalone_question: standaloneQuestionChain,
        original_question: new RunnablePassthrough(),
      },
      // Get context for the standalone question
      {
        context: retrieverChain,
        question: ({ original_question }) => original_question,
        standalone_question: ({ standalone_question }) => standalone_question,
      },
      // Generate answer based on context
      answerChain,
    ]);

    logger.success('RAG chain created successfully!');

    logger.info('Step 5: Testing the complete pipeline');

    // Test the RAG chain with a sample question

    const testQuestion =
      'What are the minimum system requirements for Polysight?';
    logger.info('Test question:', testQuestion);

    logger.info('Sending test question to RAG chain...');
    const response = await ragChain.invoke({ question: testQuestion });

    logger.info('Test response received:', response);
    return ragChain;
  } catch (error) {
    logger.error('Error during RAG chain creation:', error);
    throw error;
  }
}

export { buildRAGChain };
