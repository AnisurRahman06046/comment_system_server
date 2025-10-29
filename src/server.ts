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
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
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
