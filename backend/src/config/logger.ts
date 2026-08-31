import pino from 'pino';

const emDesenvolvimento = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers',
      'req.id',
      'req.query',
      'req.params',
      'req.remoteAddress',
      'req.remotePort',
      'res.headers',
    ],
    remove: true,
  },
  transport: emDesenvolvimento
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      }
    : undefined,
});