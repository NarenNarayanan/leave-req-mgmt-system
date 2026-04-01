const mongoose = require('mongoose');

const connectTestDB = async () => {
  const uri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/leave_mgmt_test';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const closeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

module.exports = { connectTestDB, clearDB, closeDB };
