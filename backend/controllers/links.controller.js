import LinkRequest from '../models/LinkRequest.js';
import User from '../models/User.js';

// Hierarchy level helpers (lower number = higher privilege)
export const HIERARCHY_LEVELS = {
  MANAGEMENT: 1,
  HOD: 2,
  FACULTY: 3,
  ALUMNI: 4,
};

export const getHierarchyLevel = (hierarchy) => {
  if (!hierarchy) return HIERARCHY_LEVELS.ALUMNI;
  const s = hierarchy.toString().toLowerCase();
  if (s.includes('management') || s.includes('principal') || s.includes('director')) return HIERARCHY_LEVELS.MANAGEMENT;
  if (s.includes('hod') || s.includes('head') || s.includes('manager')) return HIERARCHY_LEVELS.HOD;
  if (s.includes('faculty') || s.includes('teacher') || s.includes('professor') || s.includes('instructor') || s.includes('team')) return HIERARCHY_LEVELS.FACULTY;
  return HIERARCHY_LEVELS.ALUMNI;
};

// Determine if an admin (with adminHierarchy string) can grant requestedHierarchy
export const canGrantHierarchy = (adminHierarchyString, requestedHierarchy) => {
  const adminLevel = getHierarchyLevel(adminHierarchyString);
  const requestedLevel = getHierarchyLevel(requestedHierarchy);
  // Admin can grant only levels equal or below their level number (i.e., higher or equal privilege)
  // For example MANAGEMENT (1) can grant anything (requestedLevel >=1), HOD (2) can grant HOD/FACULTY/ALUMNI (>=2)
  return adminLevel <= requestedLevel;
};

// Create a new link/hierarchy request
export const sendLinkRequest = async (req, res) => {
  try {
    const senderId = req.params.userId;
    const { requestedHierarchy } = req.body;
    if (!requestedHierarchy) return res.status(400).json({ message: 'requestedHierarchy required' });

    const lr = await LinkRequest.create({ sender: senderId, requestedHierarchy });
    res.status(201).json({ message: 'LinkRequest created', linkRequest: lr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List pending hierarchy requests (admins/superadmins)
export const getHierarchyRequests = async (req, res) => {
  try {
    const requests = await LinkRequest.find({ status: 'pending' }).populate('sender', 'name email username');
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve or reject a link/hierarchy request
export const approveHierarchyUpgrade = async (req, res) => {
  try {
    const admin = req.user; // populated by authenticate
    const { linkRequestId } = req.params;
    const { approved, newHierarchy } = req.body;

    const lr = await LinkRequest.findById(linkRequestId);
    if (!lr) return res.status(404).json({ message: 'LinkRequest not found' });

    // only admins/superadmins (and sub-admins with adminHierarchy) should be here
    // route protection guarantees role or adminHierarchy presence; authorization below
    // Superadmin and institution-level admin (role === 'admin') have blanket permission
    if (admin.role === 'superadmin' || admin.role === 'admin') {
      // allowed to grant within their scope
    } else {
      // For sub-admins, enforce hierarchy-based granting rules
      if (!canGrantHierarchy(admin.adminHierarchy, newHierarchy)) {
        return res.status(403).json({ message: 'Not authorized to grant this hierarchy' });
      }
    }

    lr.status = approved ? 'approved' : 'rejected';
    lr.adminHierarchy = newHierarchy;
    lr.reviewedBy = admin._id;
    lr.reviewedAt = new Date();
    await lr.save();

    // Persist to User so server-side middlewares that read req.user.adminHierarchy will reflect immediately on next requests
    if (approved) {
      await User.findByIdAndUpdate(lr.sender, {
        $set: { adminHierarchy: newHierarchy },
        $push: { adminHierarchyHistory: { level: newHierarchy, grantedBy: admin._id, grantedAt: new Date() } }
      }).exec();
    }

    res.json({ message: 'LinkRequest reviewed', linkRequest: lr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Return the effective hierarchy for the current user (prefers latest approved LinkRequest)
export const getCurrentUserHierarchy = async (req, res) => {
  try {
    const userId = req.user._id;
    const lr = await LinkRequest.findOne({ sender: userId, status: 'approved' }).sort({ reviewedAt: -1 }).lean();
    if (lr && lr.adminHierarchy) {
      return res.json({ adminHierarchy: lr.adminHierarchy, source: 'linkRequest' });
    }
    // fallback to stored user field
    return res.json({ adminHierarchy: req.user.adminHierarchy || null, source: 'user' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility: sync latest approved LinkRequests into User.adminHierarchy for all users
export const fixAdminHierarchies = async (req, res) => {
  try {
    // simple implementation: iterate over all users and copy latest approved LR
    const users = await User.find({}).select('_id');
    for (const u of users) {
      const lr = await LinkRequest.findOne({ sender: u._id, status: 'approved' }).sort({ reviewedAt: -1 }).lean();
      if (lr && lr.adminHierarchy) {
        await User.findByIdAndUpdate(u._id, { $set: { adminHierarchy: lr.adminHierarchy } }).exec();
      }
    }
    res.json({ message: 'Done syncing admin hierarchies' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  sendLinkRequest,
  getHierarchyRequests,
  approveHierarchyUpgrade,
  getCurrentUserHierarchy,
  fixAdminHierarchies,
  canGrantHierarchy,
  getHierarchyLevel,
};
