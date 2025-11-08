// Access control helpers for SubAdmin hierarchy
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

export const PAGE_PERMISSIONS = {
  '/subadmin/dashboard': HIERARCHY_LEVELS.FACULTY,
  '/subadmin/manage-users': HIERARCHY_LEVELS.HOD,
  '/subadmin/manage-alumni': HIERARCHY_LEVELS.FACULTY,
  '/subadmin/network-requests': HIERARCHY_LEVELS.FACULTY,
  '/subadmin/rejected-requests': HIERARCHY_LEVELS.HOD,
  '/subadmin/post-creation': HIERARCHY_LEVELS.FACULTY,
  '/subadmin/admin-posts': HIERARCHY_LEVELS.FACULTY,
  '/subadmin/rejected-posts': HIERARCHY_LEVELS.HOD,
  '/subadmin/post-requests': HIERARCHY_LEVELS.HOD,
  '/subadmin/analytics': HIERARCHY_LEVELS.MANAGEMENT,
  '/subadmin/system-settings': HIERARCHY_LEVELS.MANAGEMENT,
};

export const hasPageAccess = (hierarchyString, pagePath) => {
  const userLevel = getHierarchyLevel(hierarchyString);
  const required = PAGE_PERMISSIONS[pagePath];
  if (required == null) return true;
  return userLevel <= required;
};

export const getAccessibleNavItems = (hierarchyString) => {
  const userLevel = getHierarchyLevel(hierarchyString);
  const allNavItems = [
    { title: 'Dashboard', url: '/subadmin/dashboard', icon: 'Home', requiredLevel: HIERARCHY_LEVELS.FACULTY },
      // Manage User Requests should be limited to HOD+ (not all faculty)
      { title: 'Manage User Requests', url: '/subadmin/network-requests', icon: 'Users', requiredLevel: HIERARCHY_LEVELS.HOD },
    { title: 'Manage Alumni', url: '/subadmin/manage-alumni', icon: 'GraduationCap', requiredLevel: HIERARCHY_LEVELS.FACULTY },
    { title: 'Rejected Requests', url: '/subadmin/rejected-requests', icon: 'UserX', requiredLevel: HIERARCHY_LEVELS.HOD },
    { title: 'Make Post', url: '/subadmin/post-creation', icon: 'PlusCircle', requiredLevel: HIERARCHY_LEVELS.FACULTY },
    { title: 'Admin Posts', url: '/subadmin/admin-posts', icon: 'FileText', requiredLevel: HIERARCHY_LEVELS.FACULTY },
    { title: 'Rejected Posts', url: '/subadmin/rejected-posts', icon: 'FileX', requiredLevel: HIERARCHY_LEVELS.HOD },
    { title: 'Post Request', url: '/subadmin/post-requests', icon: 'MessageSquare', requiredLevel: HIERARCHY_LEVELS.HOD },
    { title: 'Analytics', url: '/subadmin/analytics', icon: 'BarChart3', requiredLevel: HIERARCHY_LEVELS.MANAGEMENT },
    { title: 'System Settings', url: '/subadmin/system-settings', icon: 'Settings', requiredLevel: HIERARCHY_LEVELS.MANAGEMENT },
  ];

  return allNavItems.filter(item => userLevel <= item.requiredLevel);
};
