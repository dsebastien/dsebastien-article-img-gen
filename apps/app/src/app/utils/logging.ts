import pino from 'pino';
import { IS_PROD } from '../constants';

/**
 * Categories of logs, roughly matching functional areas of the application
 */
export type LoggingCategory = 'none' | '*' | 'api' | 'utils';

/**
 * Configuration of the log levels for each category in DEV
 */
const devLogLevelData: Record<LoggingCategory, pino.Level> = {
  '*': 'debug',
  api: 'debug',
  none: 'debug',
  utils: 'debug',
};

const devLogLevels = new Map<LoggingCategory | string, pino.Level>(Object.entries(devLogLevelData));

/**
 * Configuration of the log levels for each category in PROD
 */
const prodLogLevelData: Record<LoggingCategory, pino.Level> = {
  '*': 'warn',
  api: 'warn',
  none: 'warn',
  utils: 'warn',
};

const prodLogLevels = new Map<LoggingCategory | string, pino.Level>(Object.entries(prodLogLevelData));

/**
 * Return the log level to use for the given category.
 * The levels vary depending on the environment.
 * @param loggingCategory the category to get the level for
 */
export function getLogLevel(loggingCategory: LoggingCategory): pino.Level {
  if (IS_PROD) {
    return prodLogLevels.get(loggingCategory) || prodLogLevels.get('*') || 'warn';
  }

  return devLogLevels.get(loggingCategory) || devLogLevels.get('*') || 'debug';
}

/**
 * Get a configured logger
 * @param loggingCategory the logging category (e.g., communities)
 * @param subCategory the sub-category (context) (e.g., request URL)
 */
export function getLogger(loggingCategory: LoggingCategory, subCategory?: string) {
  const loggerName = `${loggingCategory} ${subCategory ? '- ' + subCategory : ''}`;

  const retVal = pino({
    browser: {},
    base: {
      // Not displaying additional information for now
      env: process.env.NODE_ENV,
    },
    name: loggerName,
    level: getLogLevel(loggingCategory),
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  });

  return retVal;
}
