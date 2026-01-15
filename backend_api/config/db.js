const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove duplicate index warnings by using a single connection approach
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medical_assistant', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;