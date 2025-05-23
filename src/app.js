import inquirer from 'inquirer';
import { buildRAGChain } from './steps/step5-build-chain.js';
import { logger } from './utils/logger.js';

class RAGApplication {
    constructor() {
        this.ragChain = null;
        this.isInitialized = false;
    }

    async initialize() {
        logger.info('RAG APPLICATION - QUESTION & ANSWER SYSTEM');

        try {
            logger.info(1, 'Initializing RAG system', 'Preparing all components...');

            // Build the complete RAG chain
            this.ragChain = await buildRAGChain();
            this.isInitialized = true;

            logger.success('RAG system is ready to use! 🚀');

        } catch (error) {
            logger.error('Error during application initialization', error);

            if (error.message.includes('ECONNREFUSED')) {
                logger.error('❌ Database connection error');
                logger.info('Make sure Qdrant is running: docker-compose up -d');
            } else if (error.message.includes('API key')) {
                logger.error('❌ API key issue');
                logger.info('Check the .env file and ensure GOOGLE_API_KEY is set');
            }

            throw error;
        }
    }

    async askQuestion(question) {
        if (!this.isInitialized) {
            throw new Error('Application has not been initialized');
        }

        logger.info(`📋 Question: ${question}`);
        logger.info('🔄 Processing question...');

        const startTime = Date.now();

        try {
            const response = await this.ragChain.invoke({ question });
            const processingTime = Date.now() - startTime;

            logger.success(`💡 Answer (${processingTime}ms):`);
            logger.info(response);

            return response;

        } catch (error) {
            logger.error('Error while processing question', error);
            throw error;
        }
    }

    async startInteractiveMode() {
        logger.info('🎯 Interactive mode started');
        logger.info('Ask questions about Polysight. Type "exit" to quit.\n');

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
                        }
                    }
                ]);

                if (['exit', 'quit', 'koniec'].some(cmd => question.toLowerCase().includes(cmd))) {
                    logger.info('👋 Thank you for using the RAG application!');
                    break;
                }

                await this.askQuestion(question);

            } catch (error) {
                logger.error('Error during interactive mode', error);
            }
        }
    }

    async runSingleQuestion() {
        const question = process.argv.slice(2).join(' ');

        if (!question) {
            logger.error('No question provided. Usage: node src/app.js "your question here"');
            process.exit(1);
        }

        await this.askQuestion(question);
    }
}

// Main function to run the app
async function main() {
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
        logger.error('Critical application error', error);

        logger.info('\n🔧 Troubleshooting steps:');
        logger.info('1. Check if Qdrant is running: docker-compose ps');
        logger.info('2. Check environment variables in the .env file');
        logger.info('3. Make sure data has been loaded: npm run setup-data');
        logger.info('4. Check Qdrant logs: docker-compose logs qdrant');

        process.exit(1);
    }
}

main();
