import mongoose from 'mongoose';
import Movie from '../src/models/Movie.js';
import Show from '../src/models/Show.js';
import Theatre from '../src/models/Theatre.js';
import { loadBackendEnv } from '../src/config/env.js';
import { connectDB } from '../src/config/db.js';
import { generateSeatLayout } from '../src/services/show.service.js';
import { demoMovies, demoTheatres } from './seedFixtures.js';

loadBackendEnv();
mongoose.set('autoIndex', false);
Movie.schema.set('autoIndex', false);
Show.schema.set('autoIndex', false);
Theatre.schema.set('autoIndex', false);

const applyChanges = process.argv.includes('--apply');
const unknownArgs = process.argv.slice(2).filter((arg) => !['--apply', '--dry-run'].includes(arg));

if (unknownArgs.length > 0) {
  console.error(`Unsupported option: ${unknownArgs.join(', ')}`);
  process.exitCode = 1;
} else if (process.argv.includes('--apply') && process.argv.includes('--dry-run')) {
  console.error('Choose either --apply or --dry-run, not both.');
  process.exitCode = 1;
} else {
  await seedDemoData();
}

function findFixtureRecord(records, fixture, key, label) {
  return records.find((record) => record[key] === fixture[key]) ||
    records.find((record) => record[label] === fixture[label]);
}

function createShowPlans(movies, theatres, now = new Date()) {
  const plans = [];
  const times = [
    { hour: 14, minute: 0 },
    { hour: 18, minute: 30 },
    { hour: 20, minute: 0 },
  ];

  theatres.forEach((theatreEntry) => {
    const theatre = theatreEntry.record || theatreEntry.fixture;
    (theatre.screens || []).forEach((screen) => {
      movies.slice(0, 3).forEach((movieEntry, movieIndex) => {
        const movie = movieEntry.record || movieEntry.fixture;
        const startTime = new Date(now);
        startTime.setDate(startTime.getDate() + movieIndex + 1);
        startTime.setHours(times[movieIndex].hour, times[movieIndex].minute, 0, 0);

        const seedKey = `imovies-demo:${movieEntry.fixture.slug}:${theatreEntry.fixture.identifier}:screen-${screen.screenNumber}`;
        const seats = generateSeatLayout(screen);
        const defaultPrices = {
          Platinum: 350,
          Gold: 250,
          Silver: 150,
          Standard: 200,
          VIP: 400,
        };
        const configuredCategories = screen.seatingLayout?.seatCategories || [];
        const pricing = [...new Set(seats.map((seat) => seat.category))].map((category) => ({
          category,
          price: configuredCategories.find((item) => item.category === category)?.basePrice ??
            defaultPrices[category] ??
            200,
        }));

        plans.push({
          seedKey,
          movie: movieEntry.record,
          movieTitle: movie.title,
          theatre: theatreEntry.record,
          theatreName: theatre.name,
          theatreIdentifier: theatre.identifier,
          screen,
          screenNumber: screen.screenNumber,
          screenName: screen.name,
          startTime,
          endTime: new Date(startTime.getTime() + (movie.durationMinutes + 30) * 60 * 1000),
          pricing,
          seats,
        });
      });
    });
  });

  return plans;
}

async function findMissingShows(plans) {
  const existingSeedShows = await Show.find(
    { seedKey: { $in: plans.map((plan) => plan.seedKey) } },
    { seedKey: 1, _id: 0 }
  ).lean();
  const existingSeedKeys = new Set(existingSeedShows.map((show) => show.seedKey));
  const plansWithExistingRecords = plans.filter((plan) => plan.movie && plan.theatre);
  const existingLegacyShows = plansWithExistingRecords.length
    ? await Show.find({
        movie: { $in: plansWithExistingRecords.map((plan) => plan.movie._id) },
        theatre: { $in: plansWithExistingRecords.map((plan) => plan.theatre._id) },
        startTime: { $in: plansWithExistingRecords.map((plan) => plan.startTime) },
      }).select('movie theatre screenNumber startTime')
    : [];

  return plans.filter((plan) => {
    if (existingSeedKeys.has(plan.seedKey)) return false;
    return !existingLegacyShows.some((show) =>
      plan.movie &&
      plan.theatre &&
      show.movie.equals(plan.movie._id) &&
      show.theatre.equals(plan.theatre._id) &&
      show.screenNumber === plan.screenNumber &&
      show.startTime.getTime() === plan.startTime.getTime()
    );
  });
}

async function seedDemoData() {
  if (!process.env.MONGODB_URI) {
    console.error('Cannot preview or seed demo data: MongoDB URI is not configured.');
    process.exitCode = 1;
    return;
  }

  try {
    const conn = await connectDB();
if (!conn) {
  throw new Error('Database connection failed');
}
    const [existingMovies, existingTheatres] = await Promise.all([
      Movie.find({
        $or: [
          { slug: { $in: demoMovies.map((movie) => movie.slug) } },
          { title: { $in: demoMovies.map((movie) => movie.title) } },
        ],
      }),
      Theatre.find({
        $or: [
          { identifier: { $in: demoTheatres.map((theatre) => theatre.identifier) } },
          { name: { $in: demoTheatres.map((theatre) => theatre.name) } },
        ],
      }),
    ]);

    const movieEntries = demoMovies.map((fixture) => ({
      fixture,
      record: findFixtureRecord(existingMovies, fixture, 'slug', 'title'),
    }));
    const theatreEntries = demoTheatres.map((fixture) => ({
      fixture,
      record: findFixtureRecord(existingTheatres, fixture, 'identifier', 'name'),
    }));
    const showPlans = createShowPlans(movieEntries, theatreEntries);
    const missingShows = await findMissingShows(showPlans);

    const summary = {
      mode: applyChanges ? 'apply' : 'dry-run (no database writes)',
      existingMovies: movieEntries.filter((entry) => entry.record).map((entry) => entry.fixture.title),
      missingMovies: movieEntries.filter((entry) => !entry.record).map((entry) => entry.fixture.title),
      existingTheatres: theatreEntries.filter((entry) => entry.record).map((entry) => entry.fixture.name),
      missingTheatres: theatreEntries.filter((entry) => !entry.record).map((entry) => ({
        name: entry.fixture.name,
        identifier: entry.fixture.identifier,
      })),
      plannedShows: missingShows.map((plan) => ({
        movie: plan.movieTitle,
        theatre: plan.theatreName,
        screen: plan.screenName,
        startsAt: plan.startTime.toISOString(),
        seats: plan.seats.length,
        prices: plan.pricing,
      })),
    };

    console.log(JSON.stringify(summary, null, 2));
    if (!applyChanges) {
      console.log('\nPreview only. No documents were inserted or modified. Pass --apply only after reviewing this plan.');
      return;
    }

    const missingMovieFixtures = movieEntries.filter((entry) => !entry.record).map((entry) => entry.fixture);
    if (missingMovieFixtures.length) await Movie.create(missingMovieFixtures);

    const missingTheatreFixtures = theatreEntries.filter((entry) => !entry.record).map((entry) => entry.fixture);
    if (missingTheatreFixtures.length) await Theatre.create(missingTheatreFixtures);

    const [allMovies, allTheatres] = await Promise.all([
      Movie.find({
        $or: [
          { slug: { $in: demoMovies.map((movie) => movie.slug) } },
          { title: { $in: demoMovies.map((movie) => movie.title) } },
        ],
      }),
      Theatre.find({
        $or: [
          { identifier: { $in: demoTheatres.map((theatre) => theatre.identifier) } },
          { name: { $in: demoTheatres.map((theatre) => theatre.name) } },
        ],
      }),
    ]);
    const resolvedMovieEntries = demoMovies.map((fixture) => ({
      fixture,
      record: findFixtureRecord(allMovies, fixture, 'slug', 'title'),
    }));
    const resolvedTheatreEntries = demoTheatres.map((fixture) => ({
      fixture,
      record: findFixtureRecord(allTheatres, fixture, 'identifier', 'name'),
    }));
    const resolvedShowPlans = createShowPlans(resolvedMovieEntries, resolvedTheatreEntries);
    const showsToInsert = (await findMissingShows(resolvedShowPlans))
      .map((plan) => ({
        seedKey: plan.seedKey,
        movie: plan.movie._id,
        theatre: plan.theatre._id,
        screenNumber: plan.screenNumber,
        screenName: plan.screenName,
        startTime: plan.startTime,
        endTime: plan.endTime,
        pricing: plan.pricing,
        seats: plan.seats,
      }));

    if (showsToInsert.length) await Show.create(showsToInsert);
    console.log(`\nInserted ${missingMovieFixtures.length} movies, ${missingTheatreFixtures.length} theatres, and ${showsToInsert.length} shows.`);
  } catch (error) {
    console.error(`Demo data operation failed: ${error.name}${error.code ? ` (${error.code})` : ''}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
