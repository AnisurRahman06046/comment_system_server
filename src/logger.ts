import { format, transports } from 'winston';
import expressWinston from 'express-winston';

const logger = expressWinston.logger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, meta }: any) => {
          const method = meta?.req?.method || '';
          const url = meta?.req?.url || '';
          const status = meta?.res?.statusCode || '';
          return `${timestamp} [${level}]: ${method} ${url} ${status}`;
        }),
      ),
    }),
    new transports.File({
      level: 'warn',
      filename: 'logs/warningLogs.log',
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      level: 'error',
      filename: 'logs/errorLogs.log',
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
  statusLevels: true,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: false,
  colorize: false,
});

export default logger;
