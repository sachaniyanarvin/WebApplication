// config/dbConfig.js
module.exports = {
    mongoUri: process.env.MONGO_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  };