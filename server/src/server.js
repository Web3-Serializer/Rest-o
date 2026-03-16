import app from './app.js';
import { connectDB } from './config/database.js';
import { config } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(config.port, () => {
      console.log(` (+) Server running on port ${config.port}`);
      console.log(` (i) Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error(' (x) Server startup error:', error);
    process.exit(1);
  }
};

startServer();