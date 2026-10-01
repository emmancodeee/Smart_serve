const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('./models/User');
const Admin = require('./models/Admin');
const Registration = require('./models/Registration');
const Schedule = require('./models/Schedule');
const Inventory = require('./models/Inventory');
const Transaction = require('./models/Transaction');
const AuthCode = require('./models/AuthCode');

dotenv.config();

const DEMO_TAG = '[DEMO]';
const DEMO_USER_PASSWORD = String(process.env.DEMO_USER_PASSWORD || 'DemoUser123!').trim();
const DEMO_ADMIN_PASSWORD = String(process.env.DEMO_ADMIN_PASSWORD || '/').trim();

const INVENTORY_SEEDS = [
  { itemName: 'Programming Fundamentals Module Pack', category: 'Modules', quantity: 42, unitPrice: 850, reorderLevel: 20, location: 'Demo Warehouse A1' },
  { itemName: 'Networking Lab Module Set', category: 'Modules', quantity: 8, unitPrice: 980, reorderLevel: 15, location: 'Demo Warehouse A2' },
  { itemName: 'Business Analytics Module Pack', category: 'Modules', quantity: 14, unitPrice: 910, reorderLevel: 12, location: 'Demo Warehouse A3' },
  { itemName: 'Accountancy Workbook Module', category: 'Modules', quantity: 5, unitPrice: 890, reorderLevel: 10, location: 'Demo Warehouse A4' },
  { itemName: 'Tourism Operations Module Set', category: 'Modules', quantity: 18, unitPrice: 930, reorderLevel: 12, location: 'Demo Warehouse A5' },
  { itemName: 'Hospitality Service Operations Kit', category: 'Modules', quantity: 3, unitPrice: 950, reorderLevel: 8, location: 'Demo Warehouse A6' },
  { itemName: 'General Education Reader', category: 'Books', quantity: 25, unitPrice: 420, reorderLevel: 15, location: 'Demo Warehouse B1' },
  { itemName: 'Data Structures Handbook', category: 'Books', quantity: 7, unitPrice: 560, reorderLevel: 12, location: 'Demo Warehouse B2' },
  { itemName: 'Business Math Workbook', category: 'Books', quantity: 9, unitPrice: 390, reorderLevel: 10, location: 'Demo Warehouse B3' },
  { itemName: 'Financial Accounting Volume 1', category: 'Books', quantity: 4, unitPrice: 610, reorderLevel: 8, location: 'Demo Warehouse B4' },
  { itemName: 'Hospitality Service Manual', category: 'Books', quantity: 13, unitPrice: 480, reorderLevel: 10, location: 'Demo Warehouse B5' },
  { itemName: 'Tourism Geography Atlas', category: 'Books', quantity: 6, unitPrice: 500, reorderLevel: 9, location: 'Demo Warehouse B6' },
  { itemName: 'AU PHINMA Shirt - Small', category: 'Uniforms', quantity: 12, unitPrice: 650, reorderLevel: 10, location: 'Demo Warehouse C1' },
  { itemName: 'AU PHINMA Shirt - Medium', category: 'Uniforms', quantity: 6, unitPrice: 650, reorderLevel: 10, location: 'Demo Warehouse C2' },
  { itemName: 'AU PHINMA Shirt - Large', category: 'Uniforms', quantity: 9, unitPrice: 650, reorderLevel: 10, location: 'Demo Warehouse C3' },
  { itemName: 'Corporate Attire - Small', category: 'Uniforms', quantity: 7, unitPrice: 1200, reorderLevel: 8, location: 'Demo Warehouse C4' },
  { itemName: 'Corporate Attire - Medium', category: 'Uniforms', quantity: 4, unitPrice: 1200, reorderLevel: 8, location: 'Demo Warehouse C5' },
  { itemName: 'Corporate Attire - Large', category: 'Uniforms', quantity: 2, unitPrice: 1200, reorderLevel: 8, location: 'Demo Warehouse C6' }
];

const ADMIN_SEEDS = [
  {
    name: 'Demo Super Admin',
    email: 'demo.superadmin@example.com',
    password: DEMO_ADMIN_PASSWORD,
    isSuperAdmin: true,
    lastLoginAt: daysAgo(1, 8)
  },
  {
    name: 'Demo Registrar Admin',
    email: 'demo.registrar@example.com',
    password: DEMO_ADMIN_PASSWORD,
    isSuperAdmin: false,
    lastLoginAt: daysAgo(0, 9)
  },
  {
    name: 'Demo Inventory Admin',
    email: 'demo.inventory@example.com',
    password: DEMO_ADMIN_PASSWORD,
    isSuperAdmin: false,
    lastLoginAt: daysAgo(2, 13)
  }
];

const STUDENT_SEEDS = [
  {
    name: 'Andrea Mae Santos',
    email: 'student01.demo@example.com',
    studentNumber: '2026000001',
    birthday: '2006-01-14',
    course: 'BS Information Technology',
    yearLevel: '1st Year',
    studentType: 'regular',
    moduleItems: ['Programming Fundamentals Module Pack'],
    bookItems: ['General Education Reader', 'Data Structures Handbook'],
    uniformType: 'AU PHINMA Shirt - Small',
    status: 'approved',
    registrationDaysAgo: 55,
    updatedDaysAgo: 50,
    pickupDate: daysFromNow(2, 9),
    schedules: [
      autoPickupPlan(daysFromNow(2, 9), 'Programming Fundamentals Module Pack'),
      personalSchedule('Programming Lab Review', 'Study', daysFromNow(1, 14), daysFromNow(1, 16), 'Innovation Lab', 'Programming Fundamentals Module Pack', 'Medium', '#2563eb'),
      personalSchedule('Capstone Team Check-in', 'Task', daysFromNow(3, 13), daysFromNow(3, 14), 'Online', 'Capstone', 'Medium', '#0f766e')
    ]
  },
  {
    name: 'Brian John Cruz',
    email: 'student02.demo@example.com',
    studentNumber: '2026000002',
    birthday: '2005-08-03',
    course: 'BS Computer Science',
    yearLevel: '2nd Year',
    studentType: 'regular',
    moduleItems: ['Networking Lab Module Set'],
    bookItems: ['Data Structures Handbook'],
    uniformType: 'AU PHINMA Shirt - Medium',
    status: 'approved',
    registrationDaysAgo: 49,
    updatedDaysAgo: 44,
    pickupDate: daysFromNow(1, 11),
    schedules: [
      autoPickupPlan(daysFromNow(1, 11), 'Networking Lab Module Set'),
      personalSchedule('Algorithms Consultation', 'Class', daysFromNow(2, 15), daysFromNow(2, 17), 'CS Room 402', 'Algorithms', 'High', '#dc2626')
    ]
  },
  {
    name: 'Camille Joy Dela Cruz',
    email: 'student03.demo@example.com',
    studentNumber: '2026000003',
    birthday: '2004-05-22',
    course: 'BS Business Administration',
    yearLevel: '3rd Year',
    studentType: 'regular',
    moduleItems: ['Business Analytics Module Pack'],
    bookItems: ['Business Math Workbook', 'General Education Reader'],
    uniformType: 'Corporate Attire - Medium',
    status: 'approved',
    registrationDaysAgo: 45,
    updatedDaysAgo: 39,
    pickupDate: daysFromNow(4, 10),
    schedules: [
      autoPickupPlan(daysFromNow(4, 10), 'Business Analytics Module Pack'),
      personalSchedule('Finance Case Review', 'Study', daysFromNow(2, 9), daysFromNow(2, 11), 'Library Discussion Room', 'Finance', 'Medium', '#7c3aed')
    ]
  },
  {
    name: 'Daniel Paul Reyes',
    email: 'student04.demo@example.com',
    studentNumber: '2026000004',
    birthday: '2003-10-18',
    course: 'BS Accountancy',
    yearLevel: '4th Year',
    studentType: 'irregular',
    moduleItems: ['Accountancy Workbook Module'],
    bookItems: ['Financial Accounting Volume 1'],
    uniformType: 'Corporate Attire - Large',
    status: 'approved',
    registrationDaysAgo: 41,
    updatedDaysAgo: 35,
    pickupDate: daysAgo(3, 10),
    schedules: [
      autoPickupPlan(daysAgo(3, 10), 'Accountancy Workbook Module'),
      personalSchedule('Audit Review Session', 'Study', daysFromNow(1, 18), daysFromNow(1, 20), 'Accountancy Hub', 'Auditing', 'High', '#ea580c')
    ]
  },
  {
    name: 'Erika Faith Garcia',
    email: 'student05.demo@example.com',
    studentNumber: '2026000005',
    birthday: '2005-12-02',
    course: 'BS Tourism Management',
    yearLevel: '2nd Year',
    studentType: 'regular',
    moduleItems: ['Tourism Operations Module Set'],
    bookItems: ['Tourism Geography Atlas'],
    uniformType: 'Corporate Attire - Small',
    status: 'approved',
    registrationDaysAgo: 38,
    updatedDaysAgo: 32,
    pickupDate: daysAgo(1, 13),
    schedules: [
      autoPickupPlan(daysAgo(1, 13), 'Tourism Operations Module Set'),
      personalSchedule('Event Logistics Briefing', 'Task', daysFromNow(3, 8), daysFromNow(3, 9), 'Tourism Office', 'Operations', 'Medium', '#1d4ed8')
    ]
  },
  {
    name: 'Franz Miguel Torres',
    email: 'student06.demo@example.com',
    studentNumber: '2026000006',
    birthday: '2004-07-11',
    course: 'BS Hospitality Management',
    yearLevel: '3rd Year',
    studentType: 'regular',
    moduleItems: ['Hospitality Service Operations Kit'],
    bookItems: ['Hospitality Service Manual'],
    uniformType: 'Corporate Attire - Medium',
    status: 'approved',
    registrationDaysAgo: 34,
    updatedDaysAgo: 28,
    pickupDate: daysFromNow(3, 15),
    schedules: [
      noShowHistory(daysAgo(8, 9), 'Hospitality Service Operations Kit'),
      reschedulePlan(daysFromNow(3, 15), 'Hospitality Service Operations Kit'),
      personalSchedule('Front Office Practicum', 'Class', daysFromNow(2, 7), daysFromNow(2, 9), 'Hotel Lab', 'Hospitality Practicum', 'High', '#0f766e')
    ]
  },
  {
    name: 'Grace Anne Villanueva',
    email: 'student07.demo@example.com',
    studentNumber: '2026000007',
    birthday: '2006-02-26',
    course: 'BS Information Technology',
    yearLevel: '1st Year',
    studentType: 'regular',
    moduleItems: ['Programming Fundamentals Module Pack'],
    bookItems: ['General Education Reader'],
    uniformType: 'AU PHINMA Shirt - Large',
    status: 'approved',
    registrationDaysAgo: 31,
    updatedDaysAgo: 25,
    pickupDate: daysFromNow(5, 9),
    schedules: [
      noShowHistory(daysAgo(12, 11), 'Programming Fundamentals Module Pack'),
      reschedulePlan(daysFromNow(5, 9), 'Programming Fundamentals Module Pack'),
      personalSchedule('UI Prototype Review', 'Task', daysFromNow(4, 16), daysFromNow(4, 17), 'Computer Lab 2', 'UI/UX', 'Low', '#4f46e5')
    ]
  },
  {
    name: 'Henry Louis Mendoza',
    email: 'student08.demo@example.com',
    studentNumber: '2026000008',
    birthday: '2005-04-06',
    course: 'BS Computer Science',
    yearLevel: '2nd Year',
    studentType: 'regular',
    moduleItems: ['Networking Lab Module Set'],
    bookItems: ['Data Structures Handbook'],
    uniformType: 'AU PHINMA Shirt - Medium',
    status: 'pending',
    registrationDaysAgo: 27,
    updatedDaysAgo: 23,
    pickupDate: null,
    schedules: [
      personalSchedule('Machine Learning Consultation', 'Study', daysFromNow(2, 10), daysFromNow(2, 12), 'Research Lab', 'Machine Learning', 'Medium', '#7c2d12')
    ]
  },
  {
    name: 'Isabella Rose Flores',
    email: 'student09.demo@example.com',
    studentNumber: '2026000009',
    birthday: '2004-09-29',
    course: 'BS Business Administration',
    yearLevel: '4th Year',
    studentType: 'irregular',
    moduleItems: ['Business Analytics Module Pack'],
    bookItems: ['Business Math Workbook'],
    uniformType: 'Corporate Attire - Medium',
    status: 'pending',
    registrationDaysAgo: 24,
    updatedDaysAgo: 19,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Joshua Mark Aquino',
    email: 'student10.demo@example.com',
    studentNumber: '2026000010',
    birthday: '2006-03-09',
    course: 'BS Information Technology',
    yearLevel: '1st Year',
    studentType: 'regular',
    moduleItems: ['Programming Fundamentals Module Pack'],
    bookItems: ['General Education Reader'],
    uniformType: 'AU PHINMA Shirt - Small',
    status: 'pending',
    registrationDaysAgo: 20,
    updatedDaysAgo: 17,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Karen Mae Fernandez',
    email: 'student11.demo@example.com',
    studentNumber: '2026000011',
    birthday: '2003-06-21',
    course: 'BS Tourism Management',
    yearLevel: '3rd Year',
    studentType: 'regular',
    moduleItems: ['Tourism Operations Module Set'],
    bookItems: ['Tourism Geography Atlas'],
    uniformType: 'Corporate Attire - Small',
    status: 'pending',
    registrationDaysAgo: 16,
    updatedDaysAgo: 12,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Lester James Navarro',
    email: 'student12.demo@example.com',
    studentNumber: '2026000012',
    birthday: '2005-11-17',
    course: 'BS Accountancy',
    yearLevel: '2nd Year',
    studentType: 'regular',
    moduleItems: ['Accountancy Workbook Module'],
    bookItems: ['Financial Accounting Volume 1', 'General Education Reader'],
    uniformType: 'Corporate Attire - Large',
    status: 'pending',
    registrationDaysAgo: 13,
    updatedDaysAgo: 10,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Marian Louise Bautista',
    email: 'student13.demo@example.com',
    studentNumber: '2026000013',
    birthday: '2004-01-08',
    course: 'BS Hospitality Management',
    yearLevel: '4th Year',
    studentType: 'irregular',
    moduleItems: ['Hospitality Service Operations Kit'],
    bookItems: ['Hospitality Service Manual'],
    uniformType: 'Corporate Attire - Medium',
    status: 'pending',
    registrationDaysAgo: 9,
    updatedDaysAgo: 7,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Nathaniel Ponce',
    email: 'student14.demo@example.com',
    studentNumber: '2026000014',
    birthday: '2004-12-30',
    course: 'BS Computer Science',
    yearLevel: '3rd Year',
    studentType: 'regular',
    moduleItems: ['Networking Lab Module Set'],
    bookItems: ['Data Structures Handbook'],
    uniformType: 'AU PHINMA Shirt - Large',
    status: 'rejected',
    registrationDaysAgo: 7,
    updatedDaysAgo: 6,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Olivia Kate Ramos',
    email: 'student15.demo@example.com',
    studentNumber: '2026000015',
    birthday: '2005-02-12',
    course: 'BS Business Administration',
    yearLevel: '2nd Year',
    studentType: 'regular',
    moduleItems: ['Business Analytics Module Pack'],
    bookItems: ['Business Math Workbook'],
    uniformType: 'Corporate Attire - Small',
    status: 'rejected',
    registrationDaysAgo: 5,
    updatedDaysAgo: 4,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Paolo Martin Herrera',
    email: 'student16.demo@example.com',
    studentNumber: '2026000016',
    birthday: '2003-09-04',
    course: 'BS Information Technology',
    yearLevel: '4th Year',
    studentType: 'irregular',
    moduleItems: ['Programming Fundamentals Module Pack'],
    bookItems: ['Data Structures Handbook'],
    uniformType: 'AU PHINMA Shirt - Medium',
    status: 'rejected',
    registrationDaysAgo: 4,
    updatedDaysAgo: 3,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Queenie Mae Salvador',
    email: 'student17.demo@example.com',
    studentNumber: '2026000017',
    birthday: '2005-07-28',
    course: 'BS Tourism Management',
    yearLevel: '1st Year',
    studentType: 'regular',
    moduleItems: ['Tourism Operations Module Set'],
    bookItems: ['Tourism Geography Atlas', 'General Education Reader'],
    uniformType: 'Corporate Attire - Small',
    status: 'rejected',
    registrationDaysAgo: 3,
    updatedDaysAgo: 2,
    pickupDate: null,
    schedules: []
  },
  {
    name: 'Rafael Dominic Mercado',
    email: 'student18.demo@example.com',
    studentNumber: '2026000018',
    birthday: '2006-04-19',
    course: 'BS Hospitality Management',
    yearLevel: '1st Year',
    studentType: 'regular',
    moduleItems: ['Hospitality Service Operations Kit'],
    bookItems: ['Hospitality Service Manual'],
    uniformType: 'Corporate Attire - Large',
    status: 'rejected',
    registrationDaysAgo: 1,
    updatedDaysAgo: 0,
    pickupDate: null,
    schedules: []
  }
];

function daysAgo(dayOffset, hour, minute = 0) {
  const value = new Date();
  value.setDate(value.getDate() - Number(dayOffset || 0));
  value.setHours(hour, minute, 0, 0);
  return value;
}

function daysFromNow(dayOffset, hour, minute = 0) {
  const value = new Date();
  value.setDate(value.getDate() + Number(dayOffset || 0));
  value.setHours(hour, minute, 0, 0);
  return value;
}

function autoPickupPlan(startTime, moduleName) {
  return {
    title: `${moduleName} - School Necessities Pickup`,
    type: 'AI Plan',
    description: `Scheduled pickup window for demo dashboard analytics. ${DEMO_TAG}`,
    startTime,
    endTime: oneHourAfter(startTime),
    location: 'School Supplies Office',
    module: moduleName,
    priority: 'High',
    status: 'Planned',
    reminders: [60, 15],
    color: '#8e44ad',
    isAutoGenerated: true,
    source: 'approval_auto_plan',
    rescheduleConfirmationStatus: 'Pending'
  };
}

function noShowHistory(startTime, moduleName) {
  return {
    title: `${moduleName} - Missed Pickup`,
    type: 'AI Plan',
    description: `Missed pickup record kept for demo notifications. ${DEMO_TAG}`,
    startTime,
    endTime: oneHourAfter(startTime),
    location: 'School Supplies Office',
    module: moduleName,
    priority: 'High',
    status: 'No Show',
    reminders: [60, 15],
    color: '#dc2626',
    isAutoGenerated: true,
    source: 'approval_auto_plan',
    rescheduleConfirmationStatus: 'Completed',
    rescheduleCompletedAt: oneHourAfter(startTime)
  };
}

function reschedulePlan(startTime, moduleName) {
  return {
    title: `${moduleName} - Rescheduled Pickup`,
    type: 'AI Plan',
    description: `Auto-rescheduled after no-show for demo flow. ${DEMO_TAG}`,
    startTime,
    endTime: oneHourAfter(startTime),
    location: 'School Supplies Office',
    module: moduleName,
    priority: 'High',
    status: 'Planned',
    reminders: [60, 15],
    color: '#2563eb',
    isAutoGenerated: true,
    source: 'no_show_reschedule',
    rescheduleConfirmationStatus: 'Adjusted',
    rescheduleAdjustedAt: daysAgo(0, 10)
  };
}

function personalSchedule(title, type, startTime, endTime, location, moduleName, priority, color) {
  return {
    title,
    type,
    description: `${title} scheduled for demo user activity. ${DEMO_TAG}`,
    startTime,
    endTime,
    location,
    module: moduleName,
    priority,
    status: 'Planned',
    reminders: [30, 10],
    color,
    isAutoGenerated: false,
    source: 'demo_seed'
  };
}

function oneHourAfter(date) {
  return new Date(new Date(date).getTime() + (60 * 60 * 1000));
}

function twoHoursAfter(date) {
  return new Date(new Date(date).getTime() + (2 * 60 * 60 * 1000));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map(item => String(item || '').trim()).filter(Boolean) : [];
}

function listToField(items) {
  return normalizeList(items).join('; ');
}

function demoDocumentLink(slug) {
  return `https://example.com/demo-documents/${slug}.pdf`;
}

function buildInventoryAllocations(seed, inventoryMap) {
  const allocations = [];

  for (const itemName of normalizeList(seed.moduleItems)) {
    const inventory = inventoryMap.get(`Modules::${itemName}`);
    if (!inventory) throw new Error(`Missing inventory for module: ${itemName}`);
    allocations.push({
      inventoryId: inventory._id,
      itemName: inventory.itemName,
      category: inventory.category,
      requestedLabel: itemName,
      quantity: 1
    });
  }

  for (const itemName of normalizeList(seed.bookItems)) {
    const inventory = inventoryMap.get(`Books::${itemName}`);
    if (!inventory) throw new Error(`Missing inventory for book: ${itemName}`);
    allocations.push({
      inventoryId: inventory._id,
      itemName: inventory.itemName,
      category: inventory.category,
      requestedLabel: itemName,
      quantity: 1
    });
  }

  const uniform = String(seed.uniformType || '').trim();
  if (uniform) {
    const inventory = inventoryMap.get(`Uniforms::${uniform}`);
    if (!inventory) throw new Error(`Missing inventory for uniform: ${uniform}`);
    allocations.push({
      inventoryId: inventory._id,
      itemName: inventory.itemName,
      category: inventory.category,
      requestedLabel: uniform,
      quantity: 1
    });
  }

  return allocations;
}

async function cleanupExistingDemoData() {
  const demoUserEmails = STUDENT_SEEDS.map(item => item.email);
  const demoStudentNumbers = STUDENT_SEEDS.map(item => item.studentNumber);
  const demoAdminEmails = ADMIN_SEEDS.map(item => item.email);
  const demoInventoryNames = INVENTORY_SEEDS.map(item => item.itemName);

  const existingUsers = await User.find({
    $or: [
      { email: { $in: demoUserEmails } },
      { studentNumber: { $in: demoStudentNumbers } }
    ]
  }).select('_id');
  const existingAdmins = await Admin.find({ email: { $in: demoAdminEmails } }).select('_id');

  const userIds = existingUsers.map(item => item._id);
  const adminIds = existingAdmins.map(item => item._id);

  if (userIds.length > 0) {
    await Registration.deleteMany({ userId: { $in: userIds } });
    await Schedule.deleteMany({ userId: { $in: userIds } });
  }

  await Transaction.deleteMany({
    $or: [
      { details: /\[DEMO\]/i },
      ...(adminIds.length > 0 ? [{ adminId: { $in: adminIds } }] : [])
    ]
  });

  await AuthCode.deleteMany({
    email: { $in: [...demoUserEmails, ...demoAdminEmails] }
  });

  await Inventory.deleteMany({
    description: /\[DEMO\]/i
  });

  if (adminIds.length > 0) {
    await Admin.deleteMany({ _id: { $in: adminIds } });
  }

  if (userIds.length > 0) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
}

async function seedInventory() {
  const created = [];

  for (const seed of INVENTORY_SEEDS) {
    const item = new Inventory({
      ...seed,
      description: `${DEMO_TAG} Seeded for dashboard analytics demo`,
      createdAt: daysAgo(21, 9),
      updatedAt: daysAgo(1, 11)
    });
    await item.save();
    created.push(item);
  }

  return created;
}

async function seedAdmins() {
  const created = [];

  for (const seed of ADMIN_SEEDS) {
    const admin = new Admin({
      name: seed.name,
      email: seed.email,
      password: seed.password,
      isAdmin: true,
      isSuperAdmin: Boolean(seed.isSuperAdmin),
      lastLoginAt: seed.lastLoginAt,
      lastLoginIp: '127.0.0.1'
    });
    await admin.save();
    created.push(admin);
  }

  return created;
}

async function seedStudents(inventoryItems) {
  const inventoryMap = new Map(
    inventoryItems.map(item => [`${item.category}::${item.itemName}`, item])
  );
  const createdUsers = [];
  const createdRegistrations = [];
  const createdSchedules = [];

  for (const [index, seed] of STUDENT_SEEDS.entries()) {
    const user = new User({
      name: seed.name,
      fullname: seed.name,
      birthday: new Date(seed.birthday),
      studentNumber: seed.studentNumber,
      email: seed.email,
      password: DEMO_USER_PASSWORD,
      pictureOfId: demoDocumentLink(`student-${index + 1}`),
      module: listToField(seed.moduleItems),
      uniformType: seed.uniformType,
      books: listToField(seed.bookItems),
      course: seed.course,
      status: seed.status,
      lastLoginAt: daysAgo(Math.max(0, seed.updatedDaysAgo - 1), 8 + (index % 5)),
      lastLoginIp: `192.168.1.${20 + index}`
    });
    await user.save();
    createdUsers.push(user);

    const registration = new Registration({
      userId: user._id,
      fullname: seed.name,
      age: user.age,
      yearLevel: seed.yearLevel,
      studentType: seed.studentType,
      pictureOfId: demoDocumentLink(`student-${index + 1}`),
      module: listToField(seed.moduleItems),
      uniformType: seed.uniformType,
      books: listToField(seed.bookItems),
      course: seed.course,
      pickupDate: seed.pickupDate,
      inventoryAllocations: seed.status === 'approved'
        ? buildInventoryAllocations(seed, inventoryMap)
        : []
    });
    await registration.save();
    await Registration.collection.updateOne(
      { _id: registration._id },
      {
        $set: {
          createdAt: daysAgo(seed.registrationDaysAgo, 9),
          updatedAt: daysAgo(seed.updatedDaysAgo, 14)
        }
      }
    );
    createdRegistrations.push(registration);

    for (const scheduleSeed of seed.schedules) {
      const schedule = new Schedule({
        userId: user._id,
        ...scheduleSeed
      });
      await schedule.save();
      await Schedule.collection.updateOne(
        { _id: schedule._id },
        {
          $set: {
            createdAt: new Date(new Date(schedule.startTime).getTime() - (2 * 60 * 60 * 1000)),
            updatedAt: new Date(new Date(schedule.startTime).getTime() - (60 * 60 * 1000))
          }
        }
      );
      createdSchedules.push(schedule);
    }
  }

  return {
    users: createdUsers,
    registrations: createdRegistrations,
    schedules: createdSchedules
  };
}

async function seedAuthCodes() {
  const demoCodes = [
    {
      email: 'student09.demo@example.com',
      purpose: 'verification',
      code: '123456',
      expiresAt: daysFromNow(1, 23)
    },
    {
      email: 'student11.demo@example.com',
      purpose: 'verification',
      code: '222333',
      expiresAt: daysFromNow(1, 22)
    },
    {
      email: 'student14.demo@example.com',
      purpose: 'password_reset',
      code: '654321',
      expiresAt: daysFromNow(1, 23, 30)
    },
    {
      email: 'demo.registrar@example.com',
      purpose: 'password_reset',
      code: '777888',
      expiresAt: daysFromNow(1, 23, 45)
    }
  ];

  await AuthCode.insertMany(demoCodes.map(item => ({
    ...item,
    createdAt: daysAgo(0, 10),
    updatedAt: daysAgo(0, 10)
  })));

  return demoCodes.length;
}

async function seedTransactions(admins, inventoryItems, registrations, schedules) {
  const superAdmin = admins.find(item => item.isSuperAdmin) || admins[0];
  const registrarAdmin = admins.find(item => item.email === 'demo.registrar@example.com') || admins[0];
  const inventoryAdmin = admins.find(item => item.email === 'demo.inventory@example.com') || admins[0];

  const transactions = [];

  transactions.push(buildTransaction(
    superAdmin,
    'admin_created',
    'admin',
    registrarAdmin._id,
    `${DEMO_TAG} Created demo registrar admin account`
  ));
  transactions.push(buildTransaction(
    superAdmin,
    'admin_created',
    'admin',
    inventoryAdmin._id,
    `${DEMO_TAG} Created demo inventory admin account`
  ));

  inventoryItems.forEach((item, index) => {
    transactions.push(buildTransaction(
      inventoryAdmin,
      index % 2 === 0 ? 'inventory_added' : 'inventory_updated',
      'inventory',
      item._id,
      `${DEMO_TAG} ${item.itemName} (${item.category}) qty=${item.quantity}`
    ));
  });

  registrations.forEach((registration, index) => {
    const studentSeed = STUDENT_SEEDS[index];
    const admin = studentSeed.status === 'approved'
      ? registrarAdmin
      : (studentSeed.status === 'rejected' ? registrarAdmin : superAdmin);
    transactions.push(buildTransaction(
      admin,
      `registration_${studentSeed.status}`,
      'registration',
      registration._id,
      `${DEMO_TAG} ${studentSeed.name} marked as ${studentSeed.status}`
    ));
  });

  schedules
    .filter(item => item.source === 'approval_auto_plan' && item.status === 'No Show')
    .forEach(item => {
      transactions.push(buildTransaction(
        registrarAdmin,
        'pickup_confirmation_reject',
        'schedule',
        item._id,
        `${DEMO_TAG} No-show pickup recorded for ${item.module}`
      ));
    });

  schedules
    .filter(item => item.source === 'no_show_reschedule')
    .forEach(item => {
      transactions.push(buildTransaction(
        registrarAdmin,
        'pickup_rescheduled',
        'schedule',
        item._id,
        `${DEMO_TAG} Rescheduled pickup for ${item.module}`
      ));
    });

  const datedTransactions = transactions.map((item, index) => ({
    ...item,
    createdAt: daysAgo(Math.max(0, 26 - index), 9 + (index % 7))
  }));

  await Transaction.insertMany(datedTransactions);
  return datedTransactions.length;
}

function buildTransaction(admin, action, entityType, entityId, details) {
  return {
    adminId: admin._id,
    adminModel: 'Admin',
    adminName: admin.name,
    action,
    entityType,
    entityId: String(entityId || ''),
    details
  };
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be set before running seeder.js');
  }

  await mongoose.connect(process.env.MONGO_URI);

  await cleanupExistingDemoData();

  const inventoryItems = await seedInventory();
  const admins = await seedAdmins();
  const studentData = await seedStudents(inventoryItems);
  const authCodeCount = await seedAuthCodes();
  const transactionCount = await seedTransactions(
    admins,
    inventoryItems,
    studentData.registrations,
    studentData.schedules
  );

  const approvalPlans = studentData.schedules.filter(item => item.source === 'approval_auto_plan' && item.status === 'Planned').length;
  const noShowPlans = studentData.schedules.filter(item => item.status === 'No Show').length;
  const rescheduledPlans = studentData.schedules.filter(item => item.source === 'no_show_reschedule').length;

  console.log(JSON.stringify({
    message: 'Demo analytics seed completed.',
    runCommand: 'npm run seed',
    loginCredentials: {
      adminPassword: DEMO_ADMIN_PASSWORD,
      userPassword: DEMO_USER_PASSWORD,
      admins: ADMIN_SEEDS.map(item => ({ email: item.email, role: item.isSuperAdmin ? 'super-admin' : 'admin' })),
      sampleUsers: STUDENT_SEEDS.slice(0, 5).map(item => ({ email: item.email, status: item.status }))
    },
    counts: {
      admins: admins.length,
      users: studentData.users.length,
      registrations: studentData.registrations.length,
      schedules: studentData.schedules.length,
      inventoryItems: inventoryItems.length,
      transactions: transactionCount,
      authCodes: authCodeCount,
      plannedApprovalPickups: approvalPlans,
      noShowHistory: noShowPlans,
      rescheduledPickups: rescheduledPlans
    }
  }, null, 2));
}

main()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async error => {
    console.error(error);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // ignore disconnect failure during error handling
    }
    process.exit(1);
  });
