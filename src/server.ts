import app from './app';
import mongoose from 'mongoose';
import config from './app/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from './app/socket';

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    console.log(`Database is connected 🔥🔥🔥`);

    // Create HTTP server from Express app
    const httpServer = createServer(app);

    // Initialize Socket.io
    const corsOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : '*';

    const io = new Server(httpServer, {
      cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize socket handlers
    initializeSocket(io);

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port} ✅✅✅`);
      console.log(`Socket.io ready for real-time connections 🔌`);
    });
  } catch (error) {
    console.log(`😭😭😭😭\n ${error}`);
  }
}
main();
