import { canGrantHierarchy } from '../controllers/links.controller.js';

const cases = [
  { admin: 'management', requested: 'hod', expect: true },
  { admin: 'hod', requested: 'faculty', expect: true },
  { admin: 'faculty', requested: 'hod', expect: false },
  { admin: undefined, requested: 'faculty', expect: false },
  { admin: 'principal', requested: 'management', expect: true },
];

for (const c of cases) {
  const res = canGrantHierarchy(c.admin, c.requested);
  console.log(`${c.admin} -> ${c.requested}: ${res} (expected ${c.expect})`);
}
