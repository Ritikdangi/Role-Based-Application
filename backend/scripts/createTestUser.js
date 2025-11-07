import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function create() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const username = process.env.TEST_USERNAME || 'tester';
  const email = process.env.TEST_EMAIL || 'tester@example.com';
  const password = process.env.TEST_PASSWORD || 'testerpass';

  let user = await User.findOne({ $or: [{ email }, { username }] });
  if (user) {
    console.log('User already exists, updating password and role to user');
    user.password = await bcrypt.hash(password, 10);
    user.role = 'user';
    await user.save();
    console.log(`Updated user: ${username} / ${email}`);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({ name: 'Tester User', username, email, password: hashed, role: 'user', isVerified: true });
    console.log(`Created user: ${username} / ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

create().catch(err => { console.error(err); process.exit(1); });
