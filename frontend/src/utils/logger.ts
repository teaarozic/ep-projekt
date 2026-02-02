const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log('%c[INFO]', 'color: #34d399;', ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('%c[WARN]', 'color: #fbbf24;', ...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error('%c[ERROR]', 'color: #ef4444;', ...args);
    } else {
      console.error('[ERROR]', ...args.map((a) => String(a)));
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('%c[DEBUG]', 'color: #60a5fa;', ...args);
  },
};
