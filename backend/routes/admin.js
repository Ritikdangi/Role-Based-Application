import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Institution from '../models/Institution.js';
import JoinRequest from '../models/JoinRequest.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Superadmin creates a college admin
router.post('/', authenticate, requireRole('superadmin'), async (req, res) => {
  try {
    const { name, username, email, password, adminType, institutionName } = req.body;
    if (!name || !username || !email) return res.status(400).json({ message: 'Missing required fields' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const rawPassword = password || Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(rawPassword, 10);

    // If an institution name is provided, create or find it and associate with admin
    let institution = null;
    if (institutionName && institutionName.trim()) {
      const nameTrim = institutionName.trim()
      const normalized = nameTrim.toLowerCase()
      institution = await Institution.findOne({ normalizedName: normalized })
      if (!institution) {
        institution = await Institution.create({ name: nameTrim, normalizedName: normalized, type: adminType || 'institute', createdBy: req.user._id })
      }
    }

    const adminData = { name, username, email, password: hashed, role: 'admin', adminType };
    if (institution) adminData.institution = institution._id;

    const admin = await User.create(adminData);

    // verify that stored hash validates the raw password (sanity check)
    try {
      const stored = await User.findById(admin._id).select('password')
      const ok = await bcrypt.compare(rawPassword, stored.password || '')
      if (!ok) {
        console.error('Password verification failed after creating admin', admin._id)
        return res.status(500).json({ message: 'Failed to create admin (password hashing error)' })
      }
    } catch (ve) {
      console.error('Error verifying stored admin password', ve)
    }

    // Return created admin and plaintext password so caller can deliver it (in production send email)
    res.status(201).json({ admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, adminType, institution: institution ? { id: institution._id, name: institution.name } : null }, password: rawPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Superadmin can change user role (promote/demote)
router.put('/:id/role', authenticate, requireRole('superadmin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Superadmin: list users (omit password)
router.get('/users', authenticate, requireRole('superadmin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').populate('institution', 'name');
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: list users in the admin's institution
router.get('/institution/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // normalize institution id whether populated or not
    const instId = req.user.institution && req.user.institution._id ? req.user.institution._id : req.user.institution
    if (!instId) return res.status(400).json({ message: 'Admin has no institution assigned' })
    const users = await User.find({ institution: instId }).select('-password')
    res.json({ users })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin: list pending join requests for this institution
router.get('/requests', authenticate, requireRole('admin'), async (req, res) => {
  try {
  // normalize institution id whether populated or not
  const instId = req.user.institution && req.user.institution._id ? req.user.institution._id : req.user.institution
  if (!instId) return res.status(400).json({ message: 'Admin has no institution assigned' })
  const requests = await JoinRequest.find({ institution: instId, status: 'pending' }).populate('user', 'name email username')
    res.json({ requests })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin approve a request
router.post('/requests/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  try {
  const jr = await JoinRequest.findById(req.params.id).populate('institution')
  if (!jr) return res.status(404).json({ message: 'Request not found' })
  // compare institution ids robustly whether populated or not
  const jrInstId = jr.institution && jr.institution._id ? jr.institution._id.toString() : jr.institution.toString()
  const adminInstId = req.user.institution && req.user.institution._id ? req.user.institution._id.toString() : (req.user.institution ? req.user.institution.toString() : null)
  if (!adminInstId || jrInstId !== adminInstId) return res.status(403).json({ message: 'Not allowed' })

    jr.status = 'approved'
    jr.reviewedBy = req.user._id
    jr.reviewedAt = new Date()
    await jr.save()

    // Add institution to user
    const u = await User.findById(jr.user)
    // set to object id
    u.institution = jr.institution && jr.institution._id ? jr.institution._id : jr.institution
    await u.save()

    res.json({ message: 'Request approved' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin reject a request
router.post('/requests/:id/reject', authenticate, requireRole('admin'), async (req, res) => {
  try {
  const jr = await JoinRequest.findById(req.params.id).populate('institution')
  if (!jr) return res.status(404).json({ message: 'Request not found' })
  const jrInstId = jr.institution && jr.institution._id ? jr.institution._id.toString() : jr.institution.toString()
  const adminInstId = req.user.institution && req.user.institution._id ? req.user.institution._id.toString() : (req.user.institution ? req.user.institution.toString() : null)
  if (!adminInstId || jrInstId !== adminInstId) return res.status(403).json({ message: 'Not allowed' })

    jr.status = 'rejected'
    jr.reviewedBy = req.user._id
    jr.reviewedAt = new Date()
    await jr.save()

    res.json({ message: 'Request rejected' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router;

