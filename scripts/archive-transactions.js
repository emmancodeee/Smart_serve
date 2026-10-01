/**
 * Monthly Transaction Archive Script
 * Archives transactions older than the specified cutoff date into a separate collection
 * and optionally exports them as CSV.
 *
 * Usage: node scripts/archive-transactions.js [--months=12] [--export-csv]
 *
 * --months=N    Archive transactions older than N months (default: 12)
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
  const months = monthsArg ? parseInt(monthsArg.split('=')[1], 10) : 12;
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
  const sourceCollectionName = 'transactions';
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  // Generate archive collection name with year-month suffix
  const now = new Date();
  const archiveSuffix = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
  const archiveCollectionName = `transactions_archive_${archiveSuffix}`;

  console.log(`\n📦 Transaction Archive Job`);
  console.log(`   Source: ${sourceCollectionName}`);
  console.log(`   Archive target: ${archiveCollectionName}`);
  console.log(`   Cutoff date: ${cutoffDate.toISOString()} (older than ${months} months)`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Export CSV: ${exportCsv}\n`);

  try {
    // Count documents to archive
    const count = await db.collection(sourceCollectionName).countDocuments({
      createdAt: { $lt: cutoffDate }
    });

    if (count === 0) {
      console.log('✅ No transactions to archive.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${count} transaction(s) to archive.`);

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
      { $match: { createdAt: { $lt: cutoffDate } } },
      { $out: archiveCollectionName }
    ];

    await db.collection(sourceCollectionName).aggregate(pipeline).toArray();
    console.log(`✅ Archived ${count} transaction(s) to '${archiveCollectionName}'`);

    // Delete archived documents from source
    const deleteResult = await db.collection(sourceCollectionName).deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    console.log(`✅ Removed ${deleteResult.deletedCount} transaction(s) from source collection`);

    // Export to CSV if requested
    if (exportCsv) {
      const exportDir = path.join(__dirname, '..', 'exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const csvPath = path.join(exportDir, `transactions_archive_${archiveSuffix}.csv`);
      const archivedDocs = await db.collection(archiveCollectionName).find({}).sort({ createdAt: -1 }).toArray();

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

    // Create TTL index on archive collection for eventual cleanup (e.g., 3 years)
    await db.collection(archiveCollectionName).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 3 * 365 * 24 * 60 * 60 }
    );
    console.log(`✅ Added TTL index (3 years) to archive collection`);

    console.log('\n✅ Archival complete!');
  } catch (error) {
    console.error('❌ Archival failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();

