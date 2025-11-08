import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import institutionsRouter from './routes/institutions.js';
import linksRouter from './routes/links.js';

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/roleBasedDB';
const PORT = process.env.PORT || 5000;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Mongo connection error:', err));
} else {
  console.log('MONGO_URI not set; skipping DB connection (see .env.example)');
}

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.use('/api/auth', authRouter);
app.use('/api/admins', adminRouter);
app.use('/api/institutions', institutionsRouter);
app.use('/api/links', linksRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
