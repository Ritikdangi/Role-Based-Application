import express from 'express';
import { authenticate } from '../middleware/auth.js';
import linksController from '../controllers/links.controller.js';
import { requireAdminRole } from '../middleware/hierarchy.js';

const router = express.Router();

// Hierarchy endpoints
router.post('/request/:userId', authenticate, linksController.sendLinkRequest);
router.get('/hierarchy/requests', authenticate, requireAdminRole, linksController.getHierarchyRequests);
router.put('/hierarchy/approve/:linkRequestId', authenticate, requireAdminRole, linksController.approveHierarchyUpgrade);
router.get('/hierarchy/my-hierarchy', authenticate, linksController.getCurrentUserHierarchy);
router.post('/hierarchy/fix-admin-hierarchies', authenticate, linksController.fixAdminHierarchies);

export default router;
