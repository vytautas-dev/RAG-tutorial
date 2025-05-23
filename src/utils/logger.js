import chalk from 'chalk';
import util from 'util';

const timestamp = () => new Date().toISOString().split('T')[1].slice(0, -1);

const formatData = (data) => {
  if (data && Object.keys(data).length > 0) {
    return util.inspect(data, { showHidden: false, depth: null, colors: true });
  }
  return '';
};

export const logger = {
  info: (context, msg, data) => {
    console.log(chalk.blue(`[${timestamp()}] [${context}] ℹ️  ${msg}`), formatData(data));
  },
  success: (context, msg, data) => {
    console.log(chalk.green(`[${timestamp()}] [${context}] ✅ ${msg}`), formatData(data));
  },
  warn: (context, msg, data) => {
    console.log(chalk.yellow(`[${timestamp()}] [${context}] ⚠️  ${msg}`), formatData(data));
  },
  error: (context, msg, err) => {
    console.log(chalk.red(`[${timestamp()}] [${context}] ❌ ${msg}`));
    if (err) {
      console.log(chalk.red(err.message || err));
      if (err.stack) console.log(chalk.red(err.stack));
    }
  },
  separator: (title = '') => {
    const line = '='.repeat(title ? Math.max(40 - title.length / 2, 10) : 50);
    console.log(chalk.magenta(`\n${line} ${title} ${line}\n`));
  },
  debug: (context, msg, data) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(chalk.gray(`[${timestamp()}] [${context}] 🔍 ${msg}`), formatData(data));
    }
  },
};