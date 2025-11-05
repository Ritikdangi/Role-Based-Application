import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set in .env. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  try {
    const email = process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@example.com';
    const username = process.env.SEED_SUPERADMIN_USERNAME || 'superadmin';
    const password = process.env.SEED_SUPERADMIN_PASSWORD || 'ChangeMe123!';

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      const wasRole = user.role;
      user.role = 'superadmin';
      if (password) user.password = await bcrypt.hash(password, 10);
      user.isVerified = true;
      await user.save();
      console.log(`Updated existing user (${email} / ${username}) role from ${wasRole} -> superadmin`);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      user = await User.create({ name: 'Super Admin', username, email, password: hashed, role: 'superadmin', isVerified: true });
      console.log(`Created superadmin user: ${email} (username: ${username})`);
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Error while seeding superadmin:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
