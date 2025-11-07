import 'dotenv/config';
import mongoose from 'mongoose';

async function check() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const coll = db.collection('users');
  try {
    const indexes = await coll.indexes();
    console.log('Users collection indexes:');
    console.dir(indexes, { depth: null });
  } catch (err) {
    console.error('Error listing indexes:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check().catch(err => { console.error(err); process.exit(1); });
