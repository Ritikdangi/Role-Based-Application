import { getHierarchyLevel } from '../controllers/links.controller.js';

// Require that the current user has admin role (admin or superadmin)
export const requireAdminRole = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
  // Allow true admins, superadmins, or users who have been granted an adminHierarchy (sub-admins)
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && !req.user.adminHierarchy) return res.status(403).json({ message: 'Admin access required' });
  next();
};

// Require a minimum hierarchy level (numeric). Lower number = higher privilege.
export const requireHierarchyLevel = (minLevel) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
  const current = getHierarchyLevel(req.user.adminHierarchy || 'alumni');
  if (current > minLevel) return res.status(403).json({ message: 'Insufficient hierarchy level' });
  next();
};
