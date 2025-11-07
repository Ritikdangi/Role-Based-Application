# CareerNest — Role Hierarchy & Access Flow

This document explains a clear, maintainable role/hierarchy model for CareerNest so sub-admin promotions (HOD, Faculty, etc.) work predictably and take effect immediately across UI and backend authorization checks.

---

## 🧭 Goal

Currently, all user requests go to the college admin. We want to allow the Admin to promote some users into roles like HOD or Faculty, who can then:

- Manage alumni or student requests.
- Approve/reject connection or post requests.
- Access a limited sub-admin dashboard (with restricted rights).

---

## 🧩 Role Hierarchy Overview

CareerNest defines **4 hierarchy levels**, where lower number = higher privilege:

| Role                                  | Level | Access Summary                                                       |
| ------------------------------------- | ----- | -------------------------------------------------------------------- |
| **Management / Principal / Director** | 1     | Full control: can manage HODs, faculties, and entire system settings |
| **HOD (Head of Department)**          | 2     | Can manage faculty requests, approve/reject posts and user requests  |
| **Faculty**                           | 3     | Can manage alumni, approve basic network requests, make admin posts  |
| **Alumni / Student / General User**   | 4     | Basic user — no admin rights                                         |

Add to `src/utils/accessControl.js`:

```js
export const HIERARCHY_LEVELS = {
  MANAGEMENT: 1,
  HOD: 2,
  FACULTY: 3,
  ALUMNI: 4
};
```

---

## 🧱 Page Permissions

Each sub-admin dashboard route has a **minimum required hierarchy**.

| Page                        | URL                                                | Minimum Required Role |
| --------------------------- | -------------------------------------------------- | --------------------- |
| Dashboard                   | `/subadmin/dashboard`                              | Faculty               |
| Manage Users                | `/subadmin/manage-users`                           | HOD                   |
| Manage Alumni               | `/subadmin/manage-alumni`                          | Faculty               |
| Network Requests            | `/subadmin/network-requests`                       | Faculty               |
| Rejected Requests           | `/subadmin/rejected-requests`                      | HOD                   |
| Create / Admin Posts        | `/subadmin/post-creation`, `/subadmin/admin-posts` | Faculty               |
| Rejected Posts              | `/subadmin/rejected-posts`                         | HOD                   |
| Post Requests               | `/subadmin/post-requests`                          | HOD                   |
| Analytics & System Settings | `/subadmin/analytics`, `/subadmin/system-settings` | Management            |

General rule:

- Faculty (level 3) → can access pages with `requiredLevel <= 3`
- HOD (level 2) → can access pages with `requiredLevel <= 2`
- Management (level 1) → can access everything

---

## ⚙️ Access Control Logic (Client Side)

Create `src/utils/accessControl.js` with functions that normalize strings to numeric levels and check page access.

### Key functions

- `getHierarchyLevel(hierarchy)` — normalize values like `"school_hod"` or `"faculty_team_lead"` to numeric levels.
- `hasPageAccess(userHierarchy, path)` — check if user's level is sufficient.
- `getAccessibleNavItems(userHierarchy)` — filter sidebar items by permission.

Example `hasPageAccess`:

```js
export const hasPageAccess = (userHierarchy, pagePath) => {
  const userLevel = getHierarchyLevel(userHierarchy);
  const requiredLevel = PAGE_PERMISSIONS[pagePath];
  return userLevel <= requiredLevel;
};
```

Use `getAccessibleNavItems` to render the sidebar dynamically.

---

## 🧠 How Hierarchy Promotion Works (Backend)

When an Admin promotes a user (e.g., to HOD or Faculty):

1. User submits or is assigned a hierarchy request
   - `POST /links/request/:userId` → creates a `LinkRequest` with `requestedHierarchy`.
2. Admin reviews hierarchy requests
   - `GET /links/hierarchy/requests` → fetches pending promotions.
3. Admin approves a request
   - `PUT /links/hierarchy/approve/:linkRequestId`
   - Call `canGrantHierarchy(adminType, adminHierarchy, requestedHierarchy)` to verify authority.
4. On approval
   - Request is marked approved.
   - `LinkRequest.adminHierarchy` is updated.
   - A notification/audit entry is created.
   - NOTE: `User.adminHierarchy` might not be updated instantly unless you update it on approval (recommended).

---

## 🔐 Backend Authorization Flow

Middleware like `isAdminOrSubAdmin` allows access if any of these are true:

```js
req.user.role === 'admin' || req.user.role === 'superadmin' ||
req.user.adminHierarchy !== 'alumni' || req.user.isAdmin === true
```

This treats users with `adminHierarchy` other than `alumni` as sub-admins (Faculty+).

Protect sub-admin routes using a `requireHierarchy(minLevel)` middleware which normalizes `req.user.adminHierarchy` and denies access if the user's level is greater than `minLevel`.

---

## ⚡ Implementation Improvement (Recommended)

To make hierarchy upgrades take effect immediately (UI + backend):

### ✅ Option 1 (Recommended)

Update the `User` document when an approval occurs:

```js
await User.findByIdAndUpdate(linkRequest.sender, {
  adminHierarchy: newHierarchy
});
```

Benefits:
- Backend `req.user.adminHierarchy` and checks become immediately consistent.
- Simpler client logic: components and middleware rely on `req.user`.

### ⚙️ Option 2 (Compute-only)

Keep truth in `LinkRequest` and compute effective hierarchy via `GET /links/hierarchy/my-hierarchy` on demand. This avoids mutating `User` docs but requires every check to use the computed hierarchy and adds complexity.

---

## 🧭 Summary: Capabilities by Role

| Feature                    | Faculty | HOD | Management |
| -------------------------- | :-----: | :-: | :--------: |
| Dashboard                  | ✅      | ✅  | ✅         |
| Manage Alumni              | ✅      | ✅  | ✅         |
| Network Requests           | ✅      | ✅  | ✅         |
| Manage Users               | ❌      | ✅  | ✅         |
| Post Creation              | ✅      | ✅  | ✅         |
| Post Requests              | ❌      | ✅  | ✅         |
| Rejected Requests/Posts    | ❌      | ✅  | ✅         |
| Analytics, System Settings | ❌      | ❌  | ✅         |

---

## 🧩 Example Approval Flow (summary)

1. Admin approves a link request via `/links/hierarchy/approve/:linkRequestId`.
2. Backend validates authority via `canGrantHierarchy`.
3. Backend marks the request approved and (recommended) updates `User.adminHierarchy`.
4. User immediately sees updated UI and gains access governed by `requireHierarchy`.

---

## ✅ Minimal Implementation Checklist

- [ ] Add `HIERARCHY_LEVELS` and `PAGE_PERMISSIONS` config.
- [ ] Implement `normalizeHierarchy`, `hasPageAccess`, and `getAccessibleNavItems`.
- [ ] Use `getAccessibleNavItems` in the Sidebar.
- [ ] Implement `LinkRequest` model and REST endpoints.
- [ ] Implement `approveHierarchy` to update `User.adminHierarchy` immediately.
- [ ] Add `requireHierarchy` middleware and protect subadmin routes.
- [ ] Add audit logs and notifications on approve/reject.
- [ ] Add unit tests for `canGrantHierarchy`, `requireHierarchy`, and promotion endpoints.

---

If you want, I can now:

- Create `src/utils/accessControl.js` and `PAGE_PERMISSIONS` with the code above.
- Implement `requireHierarchy` middleware in the backend and protect a sample route.
- Add `LinkRequest` model and the `approveHierarchy` endpoint and tests.

Tell me which of these you'd like me to implement next and I will proceed.
