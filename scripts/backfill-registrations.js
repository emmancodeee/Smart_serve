const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../models/User');
const Registration = require('../models/Registration');

dotenv.config();

function hasRegistrationSignal(user) {
  const status = String(user?.status || '').trim().toLowerCase();
  return Boolean(
    status ||
    user?.fullname ||
    user?.pictureOfId ||
    user?.module ||
    user?.uniformType ||
    user?.books ||
    user?.course ||
    user?.yearLevel ||
    user?.studentType ||
    user?.pickupDate
  );
}

function buildRegistrationPayload(user) {
  return {
    userId: user._id,
    fullname: user.fullname || user.name || '',
    age: Number.isFinite(Number(user.age)) ? Number(user.age) : undefined,
    yearLevel: user.yearLevel || '',
    studentType: user.studentType || '',
    pictureOfId: user.pictureOfId || '',
    module: user.module || '',
    uniformType: user.uniformType || '',
    books: user.books || '',
    course: user.course || '',
    pickupDate: user.pickupDate || undefined
  };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({ isAdmin: { $ne: true } }).lean();
  let created = 0;
  let skipped = 0;

  for (const user of users) {
    const existing = await Registration.findOne({ userId: user._id }).select('_id').lean();
    if (existing) {
      skipped += 1;
      continue;
    }

    if (!hasRegistrationSignal(user)) {
      skipped += 1;
      continue;
    }

    await Registration.create(buildRegistrationPayload(user));
    created += 1;
  }

  console.log(JSON.stringify({ scanned: users.length, created, skipped }));
  await mongoose.disconnect();
}

main().catch(async error => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore disconnect errors during failure path
  }
  process.exit(1);
});
