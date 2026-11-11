# ResolveX: Smart Campus Issue Reporting and Resolution Platform

ResolveX is a MERN web app where students report campus problems (broken lights, leaking taps, bad Wi-Fi), follow each complaint until it is fixed, and talk to the administrators handling it. Administrators get one place to search, prioritise, assign and resolve complaints, with analytics on how the campus is doing.

**Live app:** _add your Vercel URL_  
**API:** _add your Render URL_ (`/api/health` should return `{"status":"ok"}`)

## The problem

On most campuses a complaint travels through WhatsApp groups, paper registers and word of mouth. Students never learn whether anyone saw it, and administrators cannot see what is pending or which problems keep coming back. ResolveX gives every complaint a ticket ID, a status, an owner and a visible history.

## Features

**Students**
- Register and sign in (JWT, passwords hashed with bcrypt)
- Report an issue with title, category, campus location, priority, description and an optional photo
- Dashboard with counts and recent complaints
- My complaints list with status filter and search
- Complaint page with the full progress timeline and a comment box to talk to the admin team

**Administrators**
- Search by title, ticket ID, location or description
- Filter by status, category, priority and department, sort, and paginate
- Update status, assign a department and leave remarks (students see them)
- Overview with total, pending, in-progress and resolved counts, resolution rate, average time to resolve, complaints by category, status breakdown and a 14-day trend

**Activity tracking**
- Every complaint gets a unique ticket ID such as `RX-261109-K7Q2`
- Every change (created, status changed, department assigned, comment) is stored as an activity row with who did it, the old value, the new value and a note

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, Recharts, Lucide React, React Router, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT with bcrypt (the `bcryptjs` build, same algorithm, no native compile on Render) |
| Images | Cloudinary (multer keeps the file in memory and streams it up) |
| Hosting | Vercel (frontend), Render (backend) |

## Architecture

```
React (Vercel)  --HTTPS/JSON-->  Express REST API (Render)  --->  MongoDB Atlas
                                       |
                                       +--->  Cloudinary (complaint photos)
```

The React app only talks to the REST API. Express handles authentication (JWT in the `Authorization` header), role checks, validation and business logic. MongoDB stores users, issues and activities. Cloudinary stores images; only the image URL is saved in MongoDB.

## Database design

- **User**: name, email (unique), passwordHash, role (`student` or `admin`), department, createdAt
- **Issue**: ticketId (unique), title, description, category, location, priority, imageUrl, status, createdBy (User), assignedDepartment, resolvedAt, createdAt, updatedAt
- **Activity**: issueId, updatedBy (User), action (`CREATED`, `STATUS_CHANGED`, `DEPARTMENT_ASSIGNED`, `COMMENT`), oldValue, newValue, comment, createdAt

`resolvedAt` is a small addition to the brief so the average resolution time can be calculated.

## Project structure

```
ResolveX/
  client/src/
    components/{common,dashboard,issues,layout}
    pages/{auth,student,admin}
    context/  hooks/  services/  utils/  App.jsx
  server/
    config/  controllers/  middleware/  models/  routes/  utils/  server.js
```

## API reference

All routes are under `/api`. Routes marked 🔒 need `Authorization: Bearer <token>`.

| Method | Route | Who | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | Create a student account (admin with a valid invite code) |
| POST | `/auth/login` | public | Sign in, returns token and user |
| GET | `/auth/me` 🔒 | any | Current user |
| POST | `/issues` 🔒 | any | Create a complaint (multipart, optional `image`) |
| GET | `/issues/mine` 🔒 | any | Own complaints, filter with `status`, `q` |
| GET | `/issues/:id` 🔒 | owner or admin | Complaint and its activity timeline |
| POST | `/issues/:id/comments` 🔒 | owner or admin | Add a comment |
| GET | `/admin/issues` 🔒 | admin | Search, filter, sort and paginate all complaints |
| PATCH | `/admin/issues/:id` 🔒 | admin | Update status, department, remark |
| GET | `/admin/analytics` 🔒 | admin | Counts, rates and chart data |
| GET | `/health` | public | Uptime check |

## Run it locally

You need Node 20+ and a free MongoDB Atlas cluster. Cloudinary is optional while developing (without it, complaints work but photo upload is switched off).

```bash
# 1. Backend
cd server
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET at least
npm install
npm run seed:admin          # creates the first admin from SEED_ADMIN_* in .env
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173  (proxies /api to port 5000)
```

Sign in with the seeded admin, or register a normal student account on the Register page.

### Environment variables

`server/.env`

| Name | Meaning |
| --- | --- |
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | Long random string, generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| `CLIENT_URL` | Frontend origin(s) allowed by CORS, comma separated |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image storage |
| `ADMIN_SIGNUP_CODE` | Optional. Entering this on the Register page creates an admin |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | Used by `npm run seed:admin` |

`client/.env` (production only)

| Name | Meaning |
| --- | --- |
| `VITE_API_URL` | Render backend URL, no trailing slash, no `/api` |

## Deployment

**1. MongoDB Atlas.** Create a free M0 cluster, add a database user, and under Network Access allow `0.0.0.0/0` (Render's IPs change). Copy the connection string into `MONGO_URI` and put `/resolvex` before the `?`.

**2. Cloudinary.** Create a free account and copy the cloud name, API key and API secret from the dashboard.

**3. Backend on Render.** New, Web Service, connect the GitHub repo.
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment: every variable from the table above. Set `CLIENT_URL` to your Vercel URL after step 4 and redeploy.
- After the first deploy, open the Render shell and run `npm run seed:admin` (or add the admin by registering with `ADMIN_SIGNUP_CODE`).
- Render's free plan sleeps after inactivity, so the first request can take about 30 seconds. Open `/api/health` before a demo to wake it.

**4. Frontend on Vercel.** Import the same repo.
- Root directory: `client`
- Framework preset: Vite
- Environment variable: `VITE_API_URL` = your Render URL
- `client/vercel.json` already rewrites every route to `index.html`, so refreshing a deep link works.

**5. Check production.** Register a student, submit a complaint with a photo, sign in as admin, change the status, and confirm the student sees the update.

## Security measures

- Passwords hashed with bcrypt, never returned by the API (`select: false`)
- JWT verified on every protected route; role checks on all admin routes
- Students can only open their own complaints; other IDs return 404 rather than 403
- Admin accounts cannot be created through a role field, only by the seed script or the server-side invite code
- Inputs are type-checked as strings (blocks NoSQL operator injection), validated against allowed lists and length limits, and search text is regex-escaped
- Helmet headers, CORS allow-list, request body size limit and rate limiting on login and register
- Uploads limited to JPG, PNG and WebP up to 5 MB and kept in memory, never written to disk
- The same message is returned for a wrong email and a wrong password

## Key decisions

- **Activity rows instead of embedding history in the issue.** A separate collection keeps the issue document small and makes the timeline a simple sorted query.
- **Random-suffix ticket IDs with a unique index and retry.** Avoids a counter collection and a race condition between simultaneous submissions.
- **`$facet` aggregation for analytics.** One database round trip returns every number the dashboard needs.
- **Route-level code splitting.** The admin pages (which carry the charting library) load only for admins.
- **Shared detail view.** Student and admin complaint pages use one component, and admin controls appear only for admins, so the timeline can never drift between the two.
- **MVP first.** AI classification, Socket.IO chat and notifications were left out on purpose until the core flow was reliable.

## Possible next steps

Email notifications on status change, image upload from the camera on mobile, CSV export for admins, and an audit view of all admin actions.
