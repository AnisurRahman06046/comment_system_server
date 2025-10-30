import express, { Application, Request, Response } from 'express';
import globalErrorHanlders from './app/middlewares/globalErrorHandlers';
import notFoundHandler from './app/middlewares/notFound';
import { rateLimiter } from './app/middlewares/rateLimiter';
import { corsMiddleware } from './app/middlewares/cors.middleware';
import routes from './app/routes';
import logger from './logger';

const app: Application = express();

app.use(corsMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimiter);
app.use(logger);
app.use('/api/v1', routes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world!');
});

app.use(globalErrorHanlders);
app.use(notFoundHandler);

export default app;
