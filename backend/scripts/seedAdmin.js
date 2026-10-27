import Admin from '../src/models/Admin.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { loadBackendEnv } from '../src/config/env.js';

loadBackendEnv();

const provisionAdmin = async () => {
  const username = process.env.ADMIN_USERNAME || process.argv[2] || 'imovies_admin';
  const email = process.env.ADMIN_EMAIL || process.argv[3] || 'admin@imovies.com';
  const plainPassword = process.env.ADMIN_PASSWORD || process.argv[4] || 'Admin@SecurePass2026!';

  if (!plainPassword || plainPassword.length < 8) {
    console.error('❌ Error: Administrator password must be at least 8 characters long.');
    process.exit(1);
  }

  console.log('🚀 Connecting to database to provision administrator...');
  const conn = await connectDB();
  if (!conn) {
    console.error('❌ Cannot provision administrator: MongoDB is unreachable.');
    process.exit(1);
  }

  try {
    const passwordHash = await Admin.hashPassword(plainPassword);

    const admin = await Admin.findOneAndUpdate(
      { email },
      {
        username,
        email,
        passwordHash,
        role: 'admin',
        isActive: true,
        permissions: ['manage_movies', 'manage_theatres', 'manage_shows', 'view_bookings', 'manage_stats'],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Administrator provisioned successfully!`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Permissions: ${admin.permissions.join(', ')}`);
  } catch (err) {
    console.error('❌ Failed to provision administrator:', err.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

provisionAdmin();
