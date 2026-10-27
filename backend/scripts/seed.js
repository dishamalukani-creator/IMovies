import User from '../src/models/User.js';
import Admin from '../src/models/Admin.js';
import Movie from '../src/models/Movie.js';
import Theatre from '../src/models/Theatre.js';
import Show from '../src/models/Show.js';
import Booking from '../src/models/Booking.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { loadBackendEnv } from '../src/config/env.js';
import { generateSeatLayout } from '../src/services/show.service.js';
import { demoMovies, demoTheatres } from './seedFixtures.js';

loadBackendEnv();

const seedData = async () => {
  console.log('🌱 Starting IMovies database seed...');
  const conn = await connectDB();
  if (!conn) {
    console.error('❌ Cannot seed: MongoDB is offline.');
    process.exit(1);
  }

  try {
    // 1. Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Admin.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    // 2. Create Admin
    console.log('👤 Seeding administrator...');
    const adminPass = await Admin.hashPassword('Admin@123456');
    const admin = await Admin.create({
      username: 'imovies_admin',
      email: 'admin@imovies.com',
      passwordHash: adminPass,
      role: 'admin',
      permissions: ['manage_movies', 'manage_theatres', 'manage_shows', 'view_bookings', 'manage_stats'],
    });

    // 3. Create Demo Users
    console.log('👥 Seeding demo customer accounts...');
    const userPass = await User.hashPassword('User@123456');
    const user1 = await User.create({
      username: 'john_cinephile',
      email: 'john@example.com',
      passwordHash: userPass,
      role: 'customer',
      phone: '+1-555-0192',
    });

    const user2 = await User.create({
      username: 'sarah_movies',
      email: 'sarah@example.com',
      passwordHash: userPass,
      role: 'customer',
      phone: '+1-555-0193',
    });

    // 4. Create Movies
    console.log('🎬 Seeding blockbuster movies...');
    const createdMovies = await Movie.create(demoMovies);

    // 5. Create Theatres
    console.log('🏛 Seeding premium theatres and screens...');
    const createdTheatres = await Theatre.create(demoTheatres);

    // 6. Create Shows with complete seat matrices
    console.log('🎟 Scheduling shows across multiple dates...');
    const now = new Date();
    const showsToCreate = [];

    // Schedule shows for today, tomorrow, and day after tomorrow
    const dates = [
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0), // Today 1:00 PM
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 30), // Today 4:30 PM
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0), // Today 8:00 PM
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0), // Tomorrow 2:00 PM
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 30), // Tomorrow 6:30 PM
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 21, 30), // Tomorrow 9:30 PM
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0), // Day +2 3:00 PM
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 19, 0), // Day +2 7:00 PM
    ];

    createdTheatres.forEach((theatre) => {
      theatre.screens.forEach((screen) => {
        createdMovies.slice(0, 3).forEach((movie, mIndex) => {
          const dateIndex = (mIndex * 2) % dates.length;
          const startTime = dates[dateIndex];
          const endTime = new Date(startTime.getTime() + (movie.durationMinutes + 30) * 60 * 1000);

          const seats = generateSeatLayout(screen);

          // Simulate a few pre-booked seats for realism
          if (seats.length > 10) {
            seats[3].status = 'booked';
            seats[4].status = 'booked';
            seats[15].status = 'booked';
          }

          showsToCreate.push({
            movie: movie._id,
            theatre: theatre._id,
            screenNumber: screen.screenNumber,
            screenName: screen.name,
            startTime,
            endTime,
            pricing: screen.seatingLayout.seatCategories.map((sc) => ({
              category: sc.category,
              price: sc.basePrice,
            })),
            seats,
          });
        });
      });
    });

    const createdShows = await Show.create(showsToCreate);

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`   - Administrator: ${admin.email} (Password: Admin@123456)`);
    console.log(`   - Demo User 1:   ${user1.email} (Password: User@123456)`);
    console.log(`   - Demo User 2:   ${user2.email} (Password: User@123456)`);
    console.log(`   - Movies:        ${createdMovies.length} seeded`);
    console.log(`   - Theatres:      ${createdTheatres.length} seeded`);
    console.log(`   - Shows:         ${createdShows.length} scheduled with seat layouts`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedData();
