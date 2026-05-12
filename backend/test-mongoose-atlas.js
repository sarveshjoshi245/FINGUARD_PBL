/**
 * Direct Mongoose MongoDB Atlas Connection Test
 */

require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://dhruvkatheria2006_db_user:Dhruv%232006@cluster0.u3ladlp.mongodb.net/finguard_db?retryWrites=true&w=majority&appName=Cluster0';

console.log('Attempting MongoDB Atlas connection...');
console.log('URI:', mongoUri.substring(0, 80) + '...\n');

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB Atlas connection successful!');
    console.log('Connected to:', mongoose.connection.name);
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });
