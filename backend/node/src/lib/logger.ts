import winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

function sanitize(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    const clone = { ...(value as Record<string, unknown>) };
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization'];

    for (const key of Object.keys(clone)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        clone[key] = '***';
      }
    }
    return JSON.stringify(clone);
  }
  return String(value);
}

export const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export const log = {
  info: (...args: unknown[]) => logger.info(args.map(sanitize).join(' ')),
  warn: (...args: unknown[]) => logger.warn(args.map(sanitize).join(' ')),
  error: (...args: unknown[]) => logger.error(args.map(sanitize).join(' ')),
  debug: (...args: unknown[]) => logger.debug(args.map(sanitize).join(' ')),
};
