import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHanlders from './app/middlewares/globalErrorHandlers';
import notFoundHandler from './app/middlewares/notFound';
// import router from './app/routes';
const app: Application = express();
import routes from './app/routes';
import swaggerDocs from '../src/swagger';
import config from './app/config';
import logger from './logger';


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
swaggerDocs(app, config.port);
app.use(logger)
// app.use(errorLogger)
app.use('/api/v1', routes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world!');
});

app.use(globalErrorHanlders);
app.use(notFoundHandler);

export default app;
