const app = require('./app');
const config = require('./config/env');
const db = require('./config/database');

async function startServer() {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✓ Database connection established successfully');

    app.listen(config.PORT, () => {
      console.log(`✓ E-Pres Server running on port ${config.PORT} [${config.NODE_ENV}]`);
      console.log(`✓ API Endpoint: http://localhost:${config.PORT}/api`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
