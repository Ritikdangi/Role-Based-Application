#!/usr/bin/env node
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import LinkRequest from '../models/LinkRequest.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/roleBasedDB';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  const users = await User.find({}).select('_id email');
  for (const u of users) {
    const lr = await LinkRequest.findOne({ sender: u._id, status: 'approved' }).sort({ reviewedAt: -1 }).lean();
    if (lr && lr.adminHierarchy) {
      if (!u.adminHierarchy || u.adminHierarchy !== lr.adminHierarchy) {
        console.log(`Updating ${u.email || u._id} -> ${lr.adminHierarchy}`);
        await User.findByIdAndUpdate(u._id, { $set: { adminHierarchy: lr.adminHierarchy } }).exec();
      }
    }
  }
  console.log('Done');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
