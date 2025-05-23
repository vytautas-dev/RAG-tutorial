import inquirer from 'inquirer';
import { buildRAGChain } from './steps/step5-build-chain.js';
import { logger } from './utils/logger.js';

const CONTEXT = 'RAG_APPLICATION';

class RAGApplication {
  constructor() {
    this.ragChain = null;
    this.isInitialized = false;
  }

  async initialize() {
    logger.separator();
    logger.info(CONTEXT,'RAG APPLICATION - QUESTION & ANSWER SYSTEM');

    try {
      logger.info(CONTEXT,1, 'Initializing RAG system', 'Preparing all components...');

      // Build the complete RAG chain
      this.ragChain = await buildRAGChain();
      this.isInitialized = true;

      logger.success(CONTEXT,'RAG system is ready to use! 🚀');
      logger.separator();
    } catch (error) {
      logger.error(CONTEXT,'Error during application initialization', error);

      if (error.message.includes('ECONNREFUSED')) {
        logger.error(CONTEXT,'❌ Database connection error');
        logger.info(CONTEXT,'Make sure Qdrant is running: docker-compose up -d');
      } else if (error.message.includes('API key')) {
        logger.error(CONTEXT,'❌ API key issue');
        logger.info(CONTEXT,'Check the .env file and ensure GOOGLE_API_KEY is set');
      }

      logger.separator();
      throw error;
    }
  }

  async askQuestion(question) {
    logger.separator();
    if (!this.isInitialized) {
      throw new Error('Application has not been initialized');
    }

    logger.info(CONTEXT,`📋 Question: ${question}`);
    logger.info(CONTEXT,'🔄 Processing question...');

    const startTime = Date.now();

    try {
      const response = await this.ragChain.invoke({ question });
      const processingTime = Date.now() - startTime;

      logger.success(CONTEXT,`💡 Answer (${processingTime}ms):`);
      logger.info(CONTEXT,response);

      logger.separator();
      return response;
    } catch (error) {
      logger.error(CONTEXT,'Error while processing question', error);
      logger.separator();
      throw error;
    }
  }

  async startInteractiveMode() {
    logger.separator();
    logger.info(CONTEXT,'🎯 Interactive mode started');
    logger.info(CONTEXT,'Ask questions about Polysight. Type "exit" to quit.\n');

    while (true) {
      try {
        const { question } = await inquirer.prompt([
          {
            type: 'input',
            name: 'question',
            message: '❓ Ask a question:',
            validate: (input) => {
              if (!input.trim()) {
                return 'Please enter a question';
              }
              return true;
            },
          },
        ]);

        if (
          ['exit', 'quit', 'koniec'].some((cmd) =>
            question.toLowerCase().includes(cmd)
          )
        ) {
          logger.info(CONTEXT,'👋 Thank you for using the RAG application!');
          break;
        }

        await this.askQuestion(question);
        logger.separator();
      } catch (error) {
        logger.error(CONTEXT,'Error during interactive mode', error);
        logger.separator();
      }
    }
  }

  async runSingleQuestion() {
    logger.separator();
    const question = process.argv.slice(2).join(' ');

    if (!question) {
      logger.error(CONTEXT,
        'No question provided. Usage: node src/app.js "your question here"'
      );
      process.exit(1);
    }

    await this.askQuestion(question);
    logger.separator();
  }
}

// Main function to run the app
async function main() {
  logger.separator();
  const app = new RAGApplication();

  try {
    await app.initialize();

    const hasArguments = process.argv.length > 2;

    if (hasArguments) {
      await app.runSingleQuestion();
    } else {
      await app.startInteractiveMode();
    }
  } catch (error) {
    logger.error(CONTEXT,'Critical application error', error);

    logger.info(CONTEXT,'\n🔧 Troubleshooting steps:');
    logger.info(CONTEXT,'1. Check if Qdrant is running: docker-compose ps');
    logger.info(CONTEXT,'2. Check environment variables in the .env file');
    logger.info(CONTEXT,'3. Make sure data has been loaded: npm run setup-data');
    logger.info(CONTEXT,'4. Check Qdrant logs: docker-compose logs qdrant');

    logger.separator();
    process.exit(1);
  }
}

main();
