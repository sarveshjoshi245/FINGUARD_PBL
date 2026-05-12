/**
 * Database Seed Script
 * Creates initial admin user for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finguard_db';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@finguard.com',
      passwordHash: '', // Will be set by pre-save hook
      role: 'ADMIN',
      status: 'ACTIVE',
      permissions: ['view_applications', 'approve_applications', 'manage_admins'],
    });

    // Set password (pre-save hook will hash it)
    admin.setPassword('Admin@123');
    await admin.save();

    console.log('✅ Default admin created');
    console.log('   Username: admin');
    console.log('   Password: Admin@123');
    console.log('   Role: ADMIN');
    console.log('\n⚠️  Please change this password in production!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
