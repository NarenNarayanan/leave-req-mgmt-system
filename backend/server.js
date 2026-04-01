const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
