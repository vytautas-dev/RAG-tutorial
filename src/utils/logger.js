import chalk from 'chalk';

const timestamp = () => new Date().toISOString().split('T')[1].slice(0, -1);

export const logger = {
    info: (msg, data) => {
        console.log(chalk.blue(`[${timestamp()}] ℹ️  ${msg}`));
        if (data) console.log(data);
    },
    success: (msg, data) => {
        console.log(chalk.green(`[${timestamp()}] ✅ ${msg}`));
        if (data) console.log(data);
    },
    warn: (msg, data) => {
        console.log(chalk.yellow(`[${timestamp()}] ⚠️  ${msg}`));
        if (data) console.log(data);
    },
    error: (msg, err) => {
        console.log(chalk.red(`[${timestamp()}] ❌ ${msg}`));
        if (err) {
            console.log(chalk.red(err.message || err));
            if (err.stack) console.log(chalk.red(err.stack));
        }
    },
    debug: (msg, data) => {
        if (process.env.LOG_LEVEL === 'debug') {
            console.log(chalk.gray(`[${timestamp()}] 🔍 ${msg}`));
            if (data) console.log(data);
        }
    }
};
