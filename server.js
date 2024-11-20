const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT ERROR 🤖');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App is running on ${port}... `);
});

// Handle Unhandled Rejections:
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🤖');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
