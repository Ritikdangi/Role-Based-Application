import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function list() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const users = await User.find({}).select('username email role').lean();
  console.log('Users:');
  users.forEach(u => console.log(`${u._id} | ${u.username} | ${u.email} | ${u.role}`));
  await mongoose.disconnect();
  process.exit(0);
}

list().catch(err => { console.error(err); process.exit(1); });
