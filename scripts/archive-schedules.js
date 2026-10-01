/**
 * Schedule Archive Script
 * Archives completed/no-show schedules older than 6 months from the source
 * collection into a dedicated schedule_archive collection.
 *
 * Usage: node scripts/archive-schedules.js [--months=6] [--export-csv]
 *
 * --months=N    Archive schedules older than N months (default: 6)
 * --export-csv  Additionally export archived data to CSV
 * --dry-run     Preview what would be archived without executing
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const defaultMongoUri = 'mongodb://127.0.0.1:27017/PhinmaServeDB';
const mongoUri = process.env.MONGO_URI || defaultMongoUri;

async function run() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const monthsArg = args.find(a => a.startsWith('--months='));
  const months = monthsArg ? parseInt(monthsArg.split('=')[1], 10) : 6;
  const exportCsv = args.includes('--export-csv');
  const dryRun = args.includes('--dry-run');

  if (Number.isNaN(months) || months < 1) {
    console.error('Invalid months value. Usage: --months=N (N >= 1)');
    process.exit(1);
  }

  // Connect to MongoDB
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to MongoDB: ${mongoUri}`);

  const db = mongoose.connection.db;
  const sourceCollectionName = 'schedules';
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  // Generate archive collection name
  const now = new Date();
  const archiveSuffix = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
  const archiveCollectionName = `schedules_archive_${archiveSuffix}`;

  console.log(`\n📅 Schedule Archive Job`);
  console.log(`   Source: ${sourceCollectionName}`);
  console.log(`   Archive target: ${archiveCollectionName}`);
  console.log(`   Cutoff date: ${cutoffDate.toISOString()} (older than ${months} months)`);
  console.log(`   Status filter: Completed, No Show, Cancelled`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Export CSV: ${exportCsv}\n`);

  try {
    // Build filter: archived terminal statuses older than cutoff
    const archiveFilter = {
      $or: [
        { endTime: { $lt: cutoffDate } },
        { startTime: { $lt: cutoffDate } }
      ],
      status: { $in: ['Completed', 'No Show', 'Cancelled'] }
    };

    // Count documents to archive
    const count = await db.collection(sourceCollectionName).countDocuments(archiveFilter);

    if (count === 0) {
      console.log('✅ No schedules to archive.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${count} schedule(s) to archive.`);

    if (dryRun) {
      console.log('🔍 Dry-run mode. No changes made.');
      console.log(`   Would archive ${count} documents to ${archiveCollectionName}`);
      await mongoose.disconnect();
      return;
    }

    // Check if archive collection already exists
    const collections = await db.listCollections({ name: archiveCollectionName }).toArray();
    const archiveExists = collections.length > 0;

    if (archiveExists) {
      console.log(`ℹ️  Archive collection '${archiveCollectionName}' already exists. Appending data.`);
    }

    // Aggregate and insert into archive collection
    const pipeline = [
      { $match: archiveFilter },
      { $out: archiveCollectionName }
    ];

    await db.collection(sourceCollectionName).aggregate(pipeline).toArray();
    console.log(`✅ Archived ${count} schedule(s) to '${archiveCollectionName}'`);

    // Delete archived documents from source
    const deleteResult = await db.collection(sourceCollectionName).deleteMany(archiveFilter);
    console.log(`✅ Removed ${deleteResult.deletedCount} schedule(s) from source collection`);

    // Export to CSV if requested
    if (exportCsv) {
      const exportDir = path.join(__dirname, '..', 'exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const csvPath = path.join(exportDir, `schedules_archive_${archiveSuffix}.csv`);
      const archivedDocs = await db.collection(archiveCollectionName)
        .find({})
        .sort({ startTime: -1 })
        .toArray();

      if (archivedDocs.length > 0) {
        const headers = Object.keys(archivedDocs[0]).join(',');
        const rows = archivedDocs.map(doc =>
          Object.values(doc).map(val =>
            typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${String(val)}"`
          ).join(',')
        );

        const csvContent = [headers, ...rows].join('\n');
        fs.writeFileSync(csvPath, csvContent, 'utf8');
        console.log(`📄 Exported ${archivedDocs.length} records to ${csvPath}`);
      }
    }

    // Create TTL index on archive collection for eventual cleanup (e.g., 2 years)
    await db.collection(archiveCollectionName).createIndex(
      { startTime: 1 },
      { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 }
    );
    console.log(`✅ Added TTL index (2 years) to archive collection`);

    console.log('\n✅ Schedule archival complete!');
  } catch (error) {
    console.error('❌ Schedule archival failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();

