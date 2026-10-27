# IMovies — Movie Ticket Booking Made Simple

**IMovies** is a comprehensive, production-ready movie ticket booking platform engineered with Node.js, Express, MongoDB (Mongoose), React 19, Vite, Bootstrap 5, and Socket.IO.

---

## 🏛 System Architecture & Modular Monolith

```text
imovie/
├── backend/
│   ├── src/
│   │   ├── config/           # MongoDB connection & reconnect logic (db.js)
│   │   ├── controllers/      # auth, movie, theatre, show, booking, health controllers
│   │   ├── middleware/       # auth (JWT & roles), errorHandler, notFoundHandler
│   │   ├── models/           # 6 College Mongoose Models: User, Admin, Movie, Theatre, Show, Booking
│   │   ├── routes/           # auth, movie, theatre, show, booking, health routes
│   │   ├── services/         # business logic & server-side calculations
│   │   ├── sockets/          # Socket.IO real-time auditorium room manager (seatSocket.js)
│   │   ├── utils/            # AppError, jwt utilities
│   │   ├── validators/       # express-validator schemas & validation middleware
│   │   ├── app.js            # Express application factory (Helmet, CORS, Rate Limit)
│   │   └── server.js         # HTTP + Socket.IO server entrypoint & graceful shutdown
│   ├── tests/                # Automated Jest integration tests (auth, booking, jwt, health)
│   ├── scripts/              # Seed scripts (seed.js, seedAdmin.js)
│   ├── package.json
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── assets/           # Media assets and logos
│   │   ├── components/       # Navbar, Footer, MovieCard, ProtectedRoute, AdminRoute
│   │   ├── context/          # AuthContext (user session, JWT storage, favorites)
│   │   ├── pages/            # Home, Movies, MovieDetails, Theatres, Seats, Checkout, Confirmation, History, Favorites, AdminDashboard
│   │   ├── services/         # Axios API clients & Socket.IO client service
│   │   ├── styles/           # Cinematic theme (theme.css, index.css)
│   │   ├── App.jsx           # App routing with public, customer, and admin guards
│   │   └── main.jsx          # React DOM entrypoint
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .env
├── PROJECT_STATUS.md         # Living architecture and phase ledger
├── README.md                 # Primary system documentation
└── package.json              # Root workspace management
```

---

## 💎 Features Implemented

### 🎬 Customer Experience
* **Cinematic Homepage**: Spotlight premiere hero with high-res backdrop, genre filtering pills, search bar, and "Now Showing" movie cards with ratings and hover animations.
* **Full Movie Catalogue**: Browse Now Showing and Coming Soon titles, filter by genres and languages, and search by title or director.
* **Movie Details & Showtimes**: High-res poster, synopsis, duration, certification, director, cast, and interactive date picker (Today, Tomorrow, Day +2) displaying theatres and showtime slots.
* **Visual Seat Selection**:
  * Realistic curved auditorium screen indicator.
  * Multi-category seat layout (Platinum, Gold, Silver) with distinct row pricing.
  * Real-time seat statuses: Available, Selected (crimson glow), Reserved/Held (amber), and Booked/Sold (gray).
  * Concurrency protection: Locks seats on the server for 10 minutes during checkout.
  * Live **Socket.IO synchronization**: Seat status updates appear instantly across all users viewing the auditorium.
* **Review & Explicit Demo Checkout**:
  * Prominent **DEMO TRANSACTION SIMULATION** banner.
  * Itemized price breakdown calculated strictly on the server: Subtotal, 8% convenience fee, 18% integrated taxes, and Grand Total.
  * Simulated instant payment methods (Card, Digital UPI).
* **Digital Cinema Ticket**:
  * Generated unique booking reference (e.g. `IMV-7A9B2C`).
  * Ticket card featuring auditorium screen name, screening date/time, booked seat badges, and QR verification mock.
  * Browser print/save functionality.
* **Booking History & Self-Service Cancellation**:
  * Customer can view all past and upcoming tickets.
  * Cancellation allowed up to 2 hours before showtime with simulated 85% refund calculation and automatic seat release.
* **Favorites & Watchlist**: One-click heart toggle on movies persisted in user account.
* **Ratings & Reviews**: Submit 1 to 5-star ratings and written reviews with instant aggregate score updates.

### 🛡️ Administration Operations
* **Secure Administrator Authentication**: Restricted portal (`/admin/login`); public registration is disabled; provisioned via CLI (`npm run seed:admin`).
* **Admin Dashboard Overview**: Live metrics for Total Revenue, Confirmed Bookings, Cancelled Bookings, Active Movies, Theatres, and Upcoming Shows.
* **Catalogue Management**: View, add, and remove movies with poster/banner URLs, certification, duration, and genres.
* **Theatre Management**: Configure theatres, locations, screens, amenities, and seating layouts.
* **Show Scheduling**: Schedule movie screenings in specific auditoriums with date/time pickers and automatic seat matrix initialization.
* **Global Booking Audit**: View all customer reservations across the platform with search by booking reference ID.

---

## 🗄️ Database Models (Mongoose)

1. **User**: `username`, `email`, `passwordHash` (bcryptjs), `role` (`'customer'`), `avatar`, `phone`, `favorites` (refs to Movie).
2. **Admin**: `username`, `email`, `passwordHash` (bcryptjs), `role` (`'admin'`), `permissions`, `isActive`, `lastLogin`.
3. **Movie**: `title`, `slug`, `description`, `genres`, `languages`, `durationMinutes`, `releaseDate`, `certification`, `posterUrl`, `bannerUrl`, `director`, `cast`, `status`, `userRating`, `reviews`.
4. **Theatre**: `name`, `identifier` (e.g. `THTR-NYC-001`), `location` (`address`, `city`, `state`), `screens` array with `seatingLayout` (rows, columns, categories, aisles), `amenities`.
5. **Show**: `movie` (ref), `theatre` (ref), `screenNumber`, `screenName`, `startTime`, `endTime`, `pricing`, `seats` (array tracking status, lock expiration, and booking ref).
6. **Booking**: `bookingId`, `user` (ref), `show` (ref), `movieSnapshot`, `theatreSnapshot`, `showTime`, `seats`, `subtotal`, `convenienceFee`, `tax`, `totalAmount`, `status`, `paymentDetails` (demo simulated), `cancellation`.

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | System status, uptime, environment, and DB connection diagnostics |
| **POST** | `/api/auth/register` | Public | Register new customer account |
| **POST** | `/api/auth/login` | Public | Customer login (returns JWT token) |
| **POST** | `/api/auth/admin/login`| Public | Administrator portal login |
| **GET** | `/api/auth/me` | Authenticated | Current user/admin profile |
| **POST** | `/api/auth/logout` | Authenticated | Logout session |
| **GET** | `/api/movies` | Public | List movies (filter by genre, status, search) |
| **GET** | `/api/movies/featured`| Public | Featured premiere movies |
| **GET** | `/api/movies/:id` | Public | Movie details and upcoming showtimes |
| **POST** | `/api/movies/:id/reviews`| Authenticated | Submit movie review and star rating |
| **POST** | `/api/movies/:id/favorite`| Authenticated | Toggle movie favorite status |
| **POST** | `/api/movies` | Admin | Create new movie listing |
| **DELETE**| `/api/movies/:id` | Admin | Delete movie listing |
| **GET** | `/api/theatres` | Public | List theatres and cinemas |
| **GET** | `/api/theatres/:id` | Public | Theatre details and screens |
| **POST** | `/api/theatres` | Admin | Create theatre with seating layout |
| **DELETE**| `/api/theatres/:id` | Admin | Delete theatre |
| **GET** | `/api/shows` | Public | Search showtimes by movie, theatre, date |
| **GET** | `/api/shows/:id` | Public | Show details and real-time seat availability grid |
| **POST** | `/api/shows/:id/lock-seats`| Authenticated | Temporarily hold seats for checkout (10 min hold) |
| **POST** | `/api/shows/:id/release-seats`| Authenticated | Release held seats |
| **POST** | `/api/shows` | Admin | Schedule new show (initializes seat map) |
| **DELETE**| `/api/shows/:id` | Admin | Delete show schedule |
| **POST** | `/api/bookings/checkout` | Customer | Concurrency-safe atomic booking & simulated payment |
| **GET** | `/api/bookings/my-bookings`| Customer | Retrieve customer's own booking history |
| **GET** | `/api/bookings/:id` | Customer/Admin| Get booking receipt (ownership enforced) |
| **POST** | `/api/bookings/:id/cancel`| Customer/Admin| Cancel booking (valid up to 2 hours before show) |
| **GET** | `/api/bookings/admin/stats`| Admin | Dashboard metrics (revenue, total bookings, counts) |
| **GET** | `/api/bookings/admin/all` | Admin | Global customer bookings audit |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20+
- **npm**: v10+
- **MongoDB**: Local MongoDB daemon or MongoDB Atlas URI

### 2. Environment Configuration
Copy the environment template files:
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

### 3. Database Seeding (Optional but Recommended)
Populates realistic movies, theatres, upcoming showtimes, an administrator, and demo users:
```bash
# Provision Administrator only
npm run seed:admin

# Preview only missing sample movies, theatres, and shows (does not write)
npm run seed:demo

# After reviewing the preview and explicitly approving the inserts
npm --prefix backend run seed:demo -- --apply

# Populate complete demo dataset (Admin, 2 Users, 6 Movies, 2 Theatres, 9 Shows)
npm run seed
```
The safe `seed:demo` command defaults to preview mode, inserts only missing demo records when run with `--apply`, and can be repeated without duplicating its seeded shows. It does not create or modify users, admins, or bookings.
**Important:** `npm run seed` clears all existing User, Admin, Movie, Theatre, Show, and Booking records before inserting demo data. Use it only with a disposable development database or after confirming that deleting those records is acceptable.
**Demo Credentials seeded:**
* **Administrator:** `admin@imovies.com` / `Admin@123456`
* **Customer User 1:** `john@example.com` / `User@123456`
* **Customer User 2:** `sarah@example.com` / `User@123456`

### 4. Running the Applications
```bash
# Start backend API (http://localhost:5000)
npm run dev:backend

# Start frontend application (http://localhost:5173)
npm run dev:frontend
```

### 5. Running Automated Tests & Production Builds
```bash
# Run all backend automated tests (Jest + Supertest)
npm run test:backend

# Run frontend production build (Vite)
npm run build:frontend
```

## Current Verification Snapshot

**Verified:** `npm run test:backend` passes all 17 tests across 4 suites, and `npm run build:frontend` completes successfully (2051 modules transformed).

**MongoDB Atlas remains unconnected.** Backend environment loading was fixed to resolve `backend/.env` by absolute path from any working directory. Its URI structure was checked without displaying credentials: Atlas SRV format, `/imovies`, `authSource=admin`, and credential percent-encoding are present. The actual backend `connectDB()` call through Node's system resolver fails with `ECONNREFUSED`. Node uses `127.0.0.1`, but no local DNS listener is present on port 53; Windows interface DNS servers `192.168.1.1` and `8.8.8.8` successfully resolve control queries. A diagnostic-only connection using those DNS servers reached Atlas and received authentication rejection (`MongoServerError 8000`). These are independent blockers: local DNS stub resolution and Atlas Database Access authentication. No system DNS settings were changed. Verify/restore the local DNS forwarder through an authorized administrator, and confirm the database user/password in Atlas **Database Access** (not the Atlas website login); update only the secret value in `backend/.env` if it must be reset.

The backend test suite passes (17/17 across 4 suites), and the frontend production build passes (2051 modules transformed). A temporary live backend check returned HTTP 200 for `/` and HTTP 503/degraded for `/api/health`, accurately reflecting the disconnected database. **Live database-backed API checks and seeding were not run** because Atlas authentication failed. Do not run `npm run seed` against data you need: it clears the User, Admin, Movie, Theatre, Show, and Booking collections. MongoDB errors are logged with sanitized classifications rather than raw driver messages.
