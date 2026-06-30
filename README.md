# Maharashtra Adventures

A full-stack adventure booking platform for discovering, comparing, and booking trekking, camping, water sports, cycling, wildlife, and heritage experiences across Maharashtra.

## Highlights

- Next.js App Router frontend and backend in one codebase
- Prisma + PostgreSQL data layer
- Auth.js / NextAuth authentication with roles
- User, operator, and admin dashboards
- Compare tool for up to 3 listings
- Booking flow with Razorpay-ready checkout
- AI adventure concierge chatbot with live listing and booking data
- Customer reviews, operator replies, and in-app notifications
- Responsive UI with premium cards, imagery, and global navigation

## Demo accounts

Use these seeded credentials for local testing:

- User: `user@maharashtra-adventures.test`
- Operator: `operator1@maharashtra-adventures.test`
- Admin: `admin@maharashtra-adventures.test`
- Password: `Password@123`

## Local development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## Validation commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Main product areas

### Public experience
- Home page
- Explore destinations
- Activity categories
- Search and filters
- Compare tool
- Destination and listing detail pages
- AI chatbot concierge
- About and Contact pages

### User dashboard
- View upcoming, past, and cancelled bookings
- Cancel eligible bookings
- Leave reviews for completed trips

### Operator dashboard
- View operator stats and bookings
- Review customer feedback
- Post public replies to reviews

### Admin dashboard
- Platform overview
- Operators, listings, users, and bookings management

## Key environment variables

Typical variables used by the app include:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `OPENWEATHER_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `CLOUDINARY_URL`

## Deployment notes

This app is ready to build for production with:

```bash
npm run build
```

Recommended deployment stack:

- App: Vercel
- Database: Supabase Postgres
- Payments: Razorpay
- Email: Resend

Before deployment:

1. Set production environment variables in Vercel.
2. Ensure the production database is reachable.
3. Run Prisma generate/migrations as needed.
4. Verify Auth.js callback URLs and Razorpay webhook URL.

## Current status

The project has been validated with:

- typecheck passing
- lint passing
- tests passing
- production build passing

The app also includes runtime-verified routes for the main public pages, dashboards, and chatbot flows.
