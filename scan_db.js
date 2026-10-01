const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://mongo:xm0B9DbIc2S9SDxhUxBP@45.85.146.21:27017/?authSource=admin&directConnection=true';

async function scanDb() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log('\n=== Collections ===');
    collections.forEach(c => console.log(` - ${c.name}`));

    const authCodes = await db.collection('authcodes').find({}).toArray();
    console.log(`\n=== AuthCodes (OTP) Collection === (${authCodes.length} docs)`);
    authCodes.forEach(a => {
      console.log(`  email: ${a.email}, purpose: ${a.purpose}, code: ${a.code}, expiresAt: ${a.expiresAt}`);
    });

    const users = await db.collection('users').find({}).toArray();
    console.log(`\n=== Users (Students) Collection === (${users.length} docs)`);
    users.forEach(u => {
      console.log(`  name: ${u.name}, email: ${u.email}, studentNumber: ${u.studentNumber}, status: ${u.status}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

scanDb();
