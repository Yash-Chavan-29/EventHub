const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-events';
const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const email = 'admin@kletech.ac.in';
    const password = 'admin123';

    let admin = await User.findOne({ email });
    if (admin) {
      console.log(`Admin account with email ${email} already exists.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = await User.create({
      name: 'System Administrator',
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('--------------------------------------------------');
    console.log('Admin account created successfully!');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
