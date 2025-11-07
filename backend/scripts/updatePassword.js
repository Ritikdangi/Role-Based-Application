import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function update() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const username = process.env.UPD_USERNAME;
  const password = process.env.UPD_PASSWORD;
  if (!username || !password) {
    console.error('Provide UPD_USERNAME and UPD_PASSWORD env vars');
    process.exit(1);
  }
  const user = await User.findOne({ username });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }
  user.password = await bcrypt.hash(password, 10);
  // optionally set role admin
  if (process.env.FORCE_ADMIN === '1') user.role = 'admin';
  await user.save();
  console.log(`Updated password for ${username}`);
  await mongoose.disconnect();
  process.exit(0);
}

update().catch(err => { console.error(err); process.exit(1); });
