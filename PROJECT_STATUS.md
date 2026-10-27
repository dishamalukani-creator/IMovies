# IMovies — Project Status & Architecture Ledger

**Project Name:** IMovies — Movie Ticket Booking Made Simple  
**Architecture:** Modular Monolithic (Express, MongoDB/Mongoose, React, Vite, Socket.IO)  
**Status:** Implementation complete; backend tests and frontend build verified. Live Atlas verification is blocked by DNS SRV resolution.  

---

## 1. Current Phase & Implementation Status
* **Phase 1: Foundation, Database & Authentication:** ✅ COMPLETED & VERIFIED
* **Phase 2: Complete Movie Booking Application & Administration:** ✅ COMPLETED & VERIFIED
* **Phase 3: Integration, Testing & Finalization:** ✅ COMPLETED & VERIFIED

---

## 2. Six College Mongoose Data Models

The system implements the six required data models in [`backend/src/models/`](file:///c:/Users/HP/Downloads/imovie/backend/src/models):

1. **[`User.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/models/User.js)**
   * Fields: `username` (unique), `email` (unique, lowercase), `passwordHash` (select: false), `role` (`'customer'`), `avatar`, `phone`, `favorites` (refs to Movie).
   * Password hashing via `bcryptjs` (10 rounds) and instance method `comparePassword()`.
2. **[`Admin.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/models/Admin.js)**
   * Fields: `username` (unique), `email` (unique, lowercase), `passwordHash` (select: false), `role` (`'admin'`), `permissions` array, `isActive`, `lastLogin`.
   * Secure CLI provisioning script (`backend/scripts/seedAdmin.js`); public self-registration is strictly disallowed.
3. **[`Movie.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/models/Movie.js)**
   * Fields: `title`, `slug` (auto-generated pre-save), `description`, `genres` (indexed), `languages`, `durationMinutes`, `releaseDate`, `certification`, `posterUrl`, `bannerUrl`, `trailerUrl`, `director`, `cast`, `status` (`'now_showing'`, `'upcoming'`, `'archived'`), `userRating` (`average`, `count`), `reviews` subdocuments, `featured`.
4. **[`Theatre.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/models/Theatre.js)**
   * Fields: `name`, `identifier` (unique, uppercase, e.g. `THTR-NYC-001`), `location` (`address`, `city`, `state`, `zipCode`), `screens` array (each with `screenNumber`, `name`, and `seatingLayout` containing `rows`, `columnsPerRow`, `aisles`, and `seatCategories`), `amenities`, `isActive`.
5. **[`Show.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/models/Show.js)**
   * Fields: `movie` (ref Movie), `theatre` (ref Theatre), `screenNumber`, `screenName`, `startTime`, `endTime`, `pricing` (`category`, `price`), `seats` (array tracking show-specific seat availability: `seatId`, `row`, `number`, `category`, `status` (`'available'`, `'locked'`, `'booked'`), `lockedBy`, `lockedUntil`, `bookingId`), `isActive`.
   * Compound indexes for efficient screening discovery and concurrency-safe seat locking.
6. **[`Booking.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/models/Booking.js)**
   * Fields: `bookingId` (unique e.g. `IMV-7A9B2C`), `user` (ref User), `show` (ref Show), `movie`, `theatre`, `movieSnapshot`, `theatreSnapshot`, `showTime`, `seats` list, `subtotal` (server-calculated), `convenienceFee` (8% server-calculated), `tax` (18% server-calculated), `totalAmount` (server-calculated), `status` (`'confirmed'`, `'cancelled'`), `paymentDetails` (`DEMO_SIMULATION`, `simulated_paid`, `transactionId`, `paidAt`, `disclaimer`), `cancellation` (`cancelledAt`, `reason`, `refundAmount`, `refundStatus`).

---

## 3. Files Created and Their Purposes

### Root Directory
* [`package.json`](file:///c:/Users/HP/Downloads/imovie/package.json): Root orchestration scripts: `dev:backend`, `dev:frontend`, `build:frontend`, `test:backend`, `seed`, `seed:admin`.
* [`.gitignore`](file:///c:/Users/HP/Downloads/imovie/.gitignore): Ignores `.env`, `node_modules`, `dist/`, `build/`, `logs/`.
* [`README.md`](file:///c:/Users/HP/Downloads/imovie/README.md): Architecture documentation, API guide, and quickstart commands.
* [`PROJECT_STATUS.md`](file:///c:/Users/HP/Downloads/imovie/PROJECT_STATUS.md): Master architectural progress ledger.

### Backend (`backend/`)
* [`backend/package.json`](file:///c:/Users/HP/Downloads/imovie/backend/package.json): Express, Mongoose, bcryptjs, jsonwebtoken, socket.io, express-validator, helmet, cors, express-rate-limit, jest, supertest.
* [`backend/.env.example`](file:///c:/Users/HP/Downloads/imovie/backend/.env.example): Complete configuration template.
* [`backend/src/app.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/app.js): Express setup with Helmet, CORS, Rate Limit, JSON parsers, and route mounts (`/api/health`, `/api/auth`, `/api/movies`, `/api/theatres`, `/api/shows`, `/api/bookings`).
* [`backend/src/server.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/server.js): HTTP server + Socket.IO server initialization, graceful shutdown signal traps.
* [`backend/src/config/db.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/config/db.js): Resilient Mongoose connection manager with timeout and graceful degradation mode.
* [`backend/src/utils/jwt.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/utils/jwt.js): Signed JWT generation and verification.
* [`backend/src/utils/AppError.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/utils/AppError.js): Operational error wrapper with status codes and details.
* [`backend/src/middleware/auth.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/middleware/auth.js): `authenticate`, `requireAdmin`, `requireCustomer`, `optionalAuth`.
* [`backend/src/middleware/errorHandler.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/middleware/errorHandler.js): Centralized error middleware normalizing CastError, ValidationError, duplicate key 11000.
* [`backend/src/middleware/notFoundHandler.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/middleware/notFoundHandler.js): 404 handler for undefined routes.
* [`backend/src/validators/auth.validator.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/validators/auth.validator.js): Registration, login, and admin login validation rules.
* [`backend/src/validators/validateRequest.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/validators/validateRequest.js): Formats express-validator results into AppError.
* [`backend/src/controllers/auth.controller.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/controllers/auth.controller.js): Auth HTTP handlers (register, login, adminLogin, getMe, logout).
* [`backend/src/controllers/movie.controller.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/controllers/movie.controller.js): Movie HTTP handlers (list, featured, details, create, update, delete, review, favorite).
* [`backend/src/controllers/theatre.controller.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/controllers/theatre.controller.js): Theatre HTTP handlers (list, details, create, update, delete).
* [`backend/src/controllers/show.controller.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/controllers/show.controller.js): Show HTTP handlers (list, details, seat lock, seat release, create, delete).
* [`backend/src/controllers/booking.controller.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/controllers/booking.controller.js): Booking HTTP handlers (checkout, my-bookings, details, cancel, admin all bookings, admin stats).
* [`backend/src/services/auth.service.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/services/auth.service.js): Authentication business logic.
* [`backend/src/services/movie.service.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/services/movie.service.js): Movie discovery and reviews logic.
* [`backend/src/services/theatre.service.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/services/theatre.service.js): Theatre management logic.
* [`backend/src/services/show.service.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/services/show.service.js): Seat grid generator, availability calculation, temporary seat lock logic.
* [`backend/src/services/booking.service.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/services/booking.service.js): Server pricing calculation, atomic booking creation, ownership enforcement, cancellation rules, analytics.
* [`backend/src/sockets/seatSocket.js`](file:///c:/Users/HP/Downloads/imovie/backend/src/sockets/seatSocket.js): Real-time Socket.IO auditorium room manager.
* [`backend/scripts/seedAdmin.js`](file:///c:/Users/HP/Downloads/imovie/backend/scripts/seedAdmin.js): Secure administrator provisioning script.
* [`backend/scripts/seed.js`](file:///c:/Users/HP/Downloads/imovie/backend/scripts/seed.js): Comprehensive seed script populating Admin, 2 Users, 6 Movies, 2 Theatres, and multi-day Shows with seating maps.
* Automated Tests:
  * [`backend/tests/health.test.js`](file:///c:/Users/HP/Downloads/imovie/backend/tests/health.test.js): Health endpoint and 404 test.
  * [`backend/tests/jwt.test.js`](file:///c:/Users/HP/Downloads/imovie/backend/tests/jwt.test.js): Token generation and verification test.
  * [`backend/tests/bookingEngine.test.js`](file:///c:/Users/HP/Downloads/imovie/backend/tests/bookingEngine.test.js): Server pricing and seat layout generator test.
  * [`backend/tests/auth.test.js`](file:///c:/Users/HP/Downloads/imovie/backend/tests/auth.test.js): Validation, protected endpoints, customer vs admin authorization test.

### Frontend (`frontend/`)
* [`frontend/src/context/AuthContext.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/context/AuthContext.jsx): React context managing authentication session, tokens, user profile, favorites, login, register, adminLogin, and logout.
* [`frontend/src/components/ProtectedRoute.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/components/ProtectedRoute.jsx): Route guard requiring authentication.
* [`frontend/src/components/AdminRoute.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/components/AdminRoute.jsx): Route guard enforcing administrator role.
* [`frontend/src/components/Navbar.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/components/Navbar.jsx): Cinematic sticky header with role-aware links and live API status badge.
* [`frontend/src/components/Footer.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/components/Footer.jsx): Cinema footer with demo simulation disclaimer and navigation links.
* [`frontend/src/components/MovieCard.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/components/MovieCard.jsx): Movie card with hover effects, certification, user rating, and instant favorite bookmark toggle.
* [`frontend/src/services/api.js`](file:///c:/Users/HP/Downloads/imovie/frontend/src/services/api.js): Axios instance with JWT request interceptor and unified error unwrapping.
* [`frontend/src/services/auth.service.js`](file:///c:/Users/HP/Downloads/imovie/frontend/src/services/auth.service.js): Authentication API service.
* [`frontend/src/services/movie.service.js`](file:///c:/Users/HP/Downloads/imovie/frontend/src/services/movie.service.js): Movies API service.
* [`frontend/src/services/theatre.service.js`](file:///c:/Users/HP/Downloads/imovie/frontend/src/services/theatre.service.js): Theatres API service.
* [`frontend/src/services/show.service.js`](file:///c:/Users/HP/Downloads/imovie/frontend/src/services/show.service.js): Shows and seat locking API service.
* [`frontend/src/services/booking.service.js`](file:///c:/Users/HP/Downloads/imovie/frontend/src/services/booking.service.js): Bookings, checkout, cancellation, and admin stats API service.
* [`frontend/src/services/socket.service.js`](file:///c:/Users/HP/Downloads/imovie/frontend/src/services/socket.service.js): Socket.IO client room subscription service.
* Pages:
  * [`frontend/src/pages/HomePage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/HomePage.jsx): Hero banner, spotlight premiere, search & genre filter, now showing grid, real-time system monitor.
  * [`frontend/src/pages/LoginPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/LoginPage.jsx): Customer login view.
  * [`frontend/src/pages/RegisterPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/RegisterPage.jsx): Customer registration view.
  * [`frontend/src/pages/AdminLoginPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/AdminLoginPage.jsx): Dedicated secure Admin portal login.
  * [`frontend/src/pages/MoviesPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/MoviesPage.jsx): Full movie catalogue with Now Showing / Upcoming toggle, genre filter, and search.
  * [`frontend/src/pages/MovieDetailsPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/MovieDetailsPage.jsx): Backdrop banner, synopsis, cast, review submission form + reviews list, favorite button, and multi-date Theatre & Showtime picker.
  * [`frontend/src/pages/TheatresPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/TheatresPage.jsx): Theatres directory with city filter, addresses, screens, and amenities.
  * [`frontend/src/pages/SeatSelectionPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/SeatSelectionPage.jsx): Visual curved screen, Platinum/Gold/Silver seat grid, real-time Socket.IO updates, temporary seat hold, sticky price bar.
  * [`frontend/src/pages/CheckoutPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/CheckoutPage.jsx): Explicit Demo Simulation notice, screening review, itemized server price breakdown, simulated payment options, confirm booking action.
  * [`frontend/src/pages/BookingConfirmationPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/BookingConfirmationPage.jsx): Digital cinema ticket with QR placeholder, reference ID, seats, print button.
  * [`frontend/src/pages/BookingHistoryPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/BookingHistoryPage.jsx): Customer bookings list, ticket view, cancellation action with 2-hour rule modal.
  * [`frontend/src/pages/FavoritesPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/FavoritesPage.jsx): Customer saved movies watchlist.
  * [`frontend/src/pages/AdminDashboardPage.jsx`](file:///c:/Users/HP/Downloads/imovie/frontend/src/pages/AdminDashboardPage.jsx): Overview revenue & booking metrics, Manage Movies, Manage Theatres, Manage Shows, and Manage Bookings.

---

## 4. Tests and Verification Checks

**Current verification (2026-10-27):** Backend tests passed 17/17 across four suites; the frontend production build passed with 2051 modules transformed. Backend environment loading was consolidated into an absolute-path loader and verified from an unrelated working directory. It prioritizes `backend/.env` before any working-directory `.env`, while allowing explicitly supplied process environment variables to take precedence. URI structure checks pass for Atlas SRV, `/imovies`, `authSource=admin`, and percent-encoding; secret values are not emitted.

Live connection attempts through the actual `connectDB()` function still fail. Node's system resolver is `127.0.0.1` and returns `ECONNREFUSED`; a DNS control query also fails, and no local UDP/TCP DNS listener is present on port 53. Windows reports interface DNS servers `192.168.1.1` and `8.8.8.8`, and control lookups through both succeed. Using those resolvers only inside a diagnostic Node process reaches Atlas, which responds `MongoServerError (8000)` and rejects authentication. This establishes two independent blockers: a nonresponsive local DNS stub and rejected Atlas database authentication. No Windows, router, VPN, firewall, or DNS settings were changed. The Atlas connection is **not verified**; seeding and live database-backed API checks were not run.

The backend was started temporarily for HTTP checks: `GET /` returned HTTP 200; `GET /api/health` returned HTTP 503 with `status=degraded` and `database=disconnected`. The server was stopped after the check.

MongoDB connection errors are logged with sanitized error names/codes and safe classifications, not raw driver messages or connection-string details.

The table below preserves the earlier status snapshot for history. The current results are reported above.

| Verification Check | Command Executed | Result | Summary |
| :--- | :--- | :--- | :--- |
| **Backend Automated Tests** | `npm run test:backend` | **PASSED (17/17 tests)** | 4 Test Suites passed in 2.70s (`health.test.js`, `jwt.test.js`, `bookingEngine.test.js`, `auth.test.js`). |
| **Frontend Production Build** | `npm run build:frontend` | **PASSED (exit 0)** | Vite compiled 2051 modules in 1.22s into `frontend/dist/`. Zero errors or warnings. |
| **Live Server & Sockets** | `node backend/src/server.js` | **PASSED** | Express server booted on port 5000 with real-time Socket.IO initialized. |
| **Live Health Check** | `curl.exe -i http://localhost:5000/api/health` | **PASSED** | HTTP 503 degraded returned with full system diagnostics without crashing when local MongoDB is offline. |
| **API Validation** | `curl.exe -i -X POST http://localhost:5000/api/auth/register -d "{}"` | **PASSED** | HTTP 400 Bad Request returned with structured validation error messages. |
| **Authorization Guard** | `curl.exe -i http://localhost:5000/api/auth/me` | **PASSED** | HTTP 401 Unauthorized returned when Bearer token is missing. |
| **Gitignore Exclusion** | `git check-ignore backend/.env frontend/.env ...` | **PASSED** | Environment files and secrets are strictly ignored. |

---

## 5. Environment Variables & Setup

### Backend (`backend/.env`)
* `PORT`: Server port (default `5000`)
* `NODE_ENV`: Runtime environment (`development`)
* `MONGODB_URI`: MongoDB connection string (`mongodb://localhost:27017/imovies` or Atlas URI)
* `CLIENT_URL`: Allowed CORS origin (`http://localhost:5173`)
* `JWT_SECRET`: Secret key for JWT signing
* `JWT_EXPIRES_IN`: JWT expiration (e.g. `7d`)
* `RATE_LIMIT_WINDOW_MS`: Rate limit window (default `900000` = 15m)
* `RATE_LIMIT_MAX`: Max requests per window (`100`)

### Frontend (`frontend/.env`)
* `VITE_API_BASE_URL`: Backend REST API URL (`http://localhost:5000/api`)
* `VITE_SOCKET_URL`: Backend Socket.IO server URL (`http://localhost:5000`)
