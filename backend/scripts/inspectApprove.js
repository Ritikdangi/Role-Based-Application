import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
// ensure Institution model is registered so populate('institution') works
import Institution from '../models/Institution.js';

async function inspect() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);

  // adjust these identifiers if needed
  const adminUsername = process.env.INSPECT_ADMIN || 'dcrustadmin';
  const jrId = process.env.INSPECT_JR_ID; // optional

  const admin = await User.findOne({ username: adminUsername }).populate('institution');
  console.log('Admin:', admin ? { id: admin._id.toString(), username: admin.username, institution: admin.institution ? (admin.institution._id ? admin.institution._id.toString() : admin.institution.toString()) : null } : null);

  if (jrId) {
    const jr = await JoinRequest.findById(jrId);
    console.log('JoinRequest:', jr ? { id: jr._id.toString(), institution: jr.institution ? jr.institution.toString() : null, status: jr.status } : null);
  } else {
    const jrs = await JoinRequest.find({}).limit(5);
    console.log('Recent JoinRequests:');
    jrs.forEach(j => console.log({ id: j._id.toString(), institution: j.institution ? j.institution.toString() : null, status: j.status }));
  }

  await mongoose.disconnect();
  process.exit(0);
}

inspect().catch(err => { console.error(err); process.exit(1); });
