import express from 'express'
import Institution from '../models/Institution.js'
import User from '../models/User.js'
import JoinRequest from '../models/JoinRequest.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// List institutions (public for now)
router.get('/', async (req, res) => {
  try {
    const institutions = await Institution.find().select('name type')
    res.json({ institutions })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create a join request (user requests to join an institution)
router.post('/:id/request', authenticate, async (req, res) => {
  try {
    const inst = await Institution.findById(req.params.id)
    if (!inst) return res.status(404).json({ message: 'Institution not found' })

    // details supplied by user
    const { enrollmentYear, branch, rollNumber, course, collegeEmail } = req.body

    // create join request
    const existing = await JoinRequest.findOne({ user: req.user._id, institution: inst._id, status: 'pending' })
    if (existing) return res.status(409).json({ message: 'You already have a pending request for this institution' })

    const jr = await JoinRequest.create({
      user: req.user._id,
      institution: inst._id,
      details: { enrollmentYear, branch, rollNumber, course, collegeEmail }
    })

    res.status(201).json({ message: 'Join request created', requestId: jr._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// List current user's join requests
router.get('/requests', authenticate, async (req, res) => {
  try {
    const requests = await JoinRequest.find({ user: req.user._id }).populate('institution', 'name type').sort({ createdAt: -1 })
    res.json({ requests })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
