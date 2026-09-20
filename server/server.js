require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const port = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set to a random value of at least 32 characters.');
  process.exit(1);
}

async function start() {
  try {
    await testConnection();
    const server = app.listen(port, () => console.log(`NutriTrack API listening on http://localhost:${port}`));
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Stop the existing server or set a different PORT in server/.env.`);
        process.exit(1);
      }
      console.error('Could not start the server.', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Database connection failed. Start MySQL from XAMPP Control Panel and check server/.env.');
    console.error(error.message);
    process.exit(1);
  }
}

start();

