import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../package.json';
import { Application, Express, Request, Response } from 'express';
import config from './app/config';
const opitons: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node-Express-Mongo-RestApi Docs',
      version,
    },
    servers:[
      {
        url: `http://localhost:${config.port}`,
        description:'Local Server'
      },
      {
        url: `http://localhost:${config.port}`,
        description:'Local Server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'APIs related to user authentication',
      },
    ],
    components: {
      securitySchema: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/app/modules/Auth/Auth.routes.ts'],
};

const swaggerSpec = swaggerJSDoc(opitons);

function swaggerDocs(app: Application, port: any) {
  // swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // docs in json format
  app.get('docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Api documentation: http://localhost:${port}/docs/`);
}

export default swaggerDocs;
