import { format, transports } from 'winston';
import expressWinston from 'express-winston';
import config from './app/config';
import { MongoDB } from 'winston-mongodb';

const myFormat = format.printf(({ level, timestamp, meta }) => {
  return `${timestamp} ${level.toUpperCase()}: ${meta?.message || ''} `;
});

const logger = expressWinston.logger({
  transports: [
    new transports.Console(),
    new transports.File({
      level: 'warn',
      filename: 'logs/warningLogs.log',
    }),
    new transports.File({
      level: 'error',
      filename: 'logs/errorLogs.log',
    }),
    new MongoDB({
      level: 'info',
      db: config.database_uri || 'mongodb://localhost:27017',
      collection: 'logs',
      options: { useUnifiedTopology: true },
    }),
  ],
  format: format.combine(
    format.timestamp(),
    myFormat, // Include timestamp
    format.errors({ stack: true }), // Capture stack trace in error logs
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }), // Add metadata excluding default fields
    format.printf(({ timestamp, level, message, meta, metadata }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message} - ${
        meta?.ip || 'IP not available'
      } - ${meta?.status || 'Status not available'} - ${
        meta?.url || 'URL not available'
      } ${metadata.stack ? `- ${metadata.stack}` : ''}`;
    }),
  ),
  statusLevels: true,
  meta: true, // to capture meta data like request, response etc
  // Customizing the meta object to include the client's IP address
  requestWhitelist: [...expressWinston.requestWhitelist, 'ip'], // include IP address in logs
  dynamicMeta: (req, res) => {
    return {
      ip: req.ip, // adds the client's IP address to the logs
      user: req.user ? req.user.id : 'anonymous', // Example: If using authentication
    };
  },
});

// export const errorLogger = expressWinston.errorLogger({
//   transports: [
//     new transports.File({
//       filename: 'errorLog.log',
//     }),
//   ],
//   format: format.combine(format.json(), format.timestamp(), myFormat),
// });
export default logger;
