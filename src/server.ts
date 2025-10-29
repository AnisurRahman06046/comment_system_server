import app from './app';
import mongoose from 'mongoose';
import config from './app/config';
import swaggerDocs from './swagger';

async function main() {
  try {
    await mongoose.connect(config.database_uri as string);
    app.listen(config.port, () => {
      console.log(`Database is connected 🔥🔥🔥`);
      console.log(`server is running from ${config.port} ✅✅✅`);
      
    });
  } catch (error) {
    console.log(`😭😭😭😭\n ${error}`);
  }
}
main();
