const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Admin = require('./models/Admin');

dotenv.config();

function requireSeedPassword(envKey) {
  const value = String(process.env[envKey] || '').trim();
  if (!value) {
    throw new Error(`${envKey} must be set before running setup-admins.js`);
  }
  return value;
}

async function setupAdmins() {
  try {
    if (process.env.ALLOW_ADMIN_SEED !== 'true') {
      throw new Error('Refusing to seed admin accounts. Set ALLOW_ADMIN_SEED=true to run this script intentionally.');
    }

    const defaultMongoUri = 'mongodb://127.0.0.1:27017/PhinmaServeDB';
    const mongoConnectionCandidates = Array.from(new Set([process.env.MONGO_URI, defaultMongoUri].filter(Boolean)));
    let connected = false;

    for (const candidateUri of mongoConnectionCandidates) {
      try {
        await mongoose.connect(candidateUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`Connected to MongoDB at ${candidateUri}`);
        connected = true;
        break;
      } catch (err) {
        console.warn(`Failed to connect to ${candidateUri}: ${err.message}`);
      }
    }

    if (!connected) {
      throw new Error('Could not connect to any MongoDB instance');
    }

    console.log('Connected to MongoDB');

    const adminSeeds = [
      {
        name: 'Phinma Superadmin',
        email: 'phinmasmartserve@gmail.com',
        passwordEnvKey: 'ADMIN1_PASSWORD',
        isSuperAdmin: true,
      },
      {
        name: 'Admin One',
        email: 'admin1@example.com',
        passwordEnvKey: 'ADMIN2_PASSWORD',
        isSuperAdmin: true,
      },
    ];

    const admins = adminSeeds.map(adminData => ({
      ...adminData,
      password: requireSeedPassword(adminData.passwordEnvKey),
    }));

    const removedLegacyAdmins = await User.deleteMany({ isAdmin: true });
    if (removedLegacyAdmins.deletedCount > 0) {
      console.log(`Removed ${removedLegacyAdmins.deletedCount} legacy admin account(s) from User collection.`);
    }

    for (const adminData of admins) {
      const deletedAdmins = await Admin.deleteMany({ email: adminData.email });
      if (deletedAdmins.deletedCount > 0) {
        console.log(`Removed ${deletedAdmins.deletedCount} existing admin record(s) for ${adminData.email}.`);
      }

      const admin = new Admin(adminData);
      await admin.save();
      console.log(`Admin created: ${adminData.email}`);
      console.log(`  Super Admin: ${Boolean(adminData.isSuperAdmin)}`);
    }

    console.log('\nSetup complete! Admin accounts created:');
    admins.forEach((adminData, index) => {
      console.log(
        `Admin ${index + 1} - Email: ${adminData.email}, Password Env: ${adminData.passwordEnvKey}, Super Admin: ${Boolean(adminData.isSuperAdmin)}`
      );
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error setting up admins:', error);
    process.exit(1);
  }
}

setupAdmins();
