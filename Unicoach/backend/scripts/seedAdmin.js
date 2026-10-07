// scripts/seedAdmin.js
// Create an admin user with username and password.
// Usage: node scripts/seedAdmin.js --username "admin" --password "<a strong unique password, min 10 chars>"

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const args = process.argv.slice(2);
const parsedArgs = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const val = args[i + 1];
    if (val && !val.startsWith('--')) {
      parsedArgs[key] = val;
      i++;
    }
  }
}

const username = parsedArgs.username || 'admin';
const password = parsedArgs.password; // no default: a well-known default (admin123) is the first thing attackers try
const name = parsedArgs.name || 'Admin';

if (!username || !password || password.length < 10) {
  console.error('\x1b[31mError: --username and --password are required.\x1b[0m');
  console.log('Example: node scripts/seedAdmin.js --username "admin" --password "<a strong unique password, min 10 chars>"');
  process.exit(1);
}

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leapscholar';

console.log('Connecting to MongoDB...');
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Check if admin user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`Admin "${username}" already exists. Updating password...`);
      existingUser.passwordHash = passwordHash;
      existingUser.role = 'admin';
      existingUser.name = name;
      await existingUser.save();
      console.log('\x1b[32mSuccess: Admin password updated!\x1b[0m');
    } else {
      const admin = new User({
        name,
        username,
        passwordHash,
        role: 'admin',
      });
      await admin.save();
      console.log('\x1b[32mSuccess: Admin user created!\x1b[0m');
    }

    console.log(`\x1b[36mUsername: ${username}\x1b[0m`);
    console.log(`\x1b[36mPassword: ${password}\x1b[0m`);

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
