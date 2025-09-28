VidyaVichar — Classroom Q&A Sticky Board (MERN)
====================================================

A complete MERN stack implementation of a classroom Q&A “sticky note” board where students post questions during lectures and instructors manage them in real time. The project contains a React (Vite) frontend and an Express + Node.js + MongoDB backend kept in the original directory layout:

.
├─ backend/     # Express API, MongoDB models, auth, Socket.IO server
└─ frontend/    # React + Vite, Tailwind + shadcn, Socket.IO client


1) Highlights
-------------
- Real‑time board with Socket.IO (student questions appear instantly on instructor board)
- Sticky‑note UI with filters: All • Unanswered • Important • Answered
- Instructor actions: mark Answered / Important, Clear board (with confirm), soft‑delete
- Validation: prevents empty/whitespace + duplicate questions per session
- Persistence: MongoDB stores questions, statuses, timestamps, author, and session
- Auth (roles): Student / Instructor (JWT based)
- Clean, responsive UI: Tailwind + shadcn components
- PDF‑aligned behaviors: filters, actions, persistence, and submission packaging


2) Quick Start
--------------
Backend
  cd backend
  npm install
  # create and fill .env (see below)
  npm run dev         # nodemon; or: npm start -> node server.js
  # backend default: http://localhost:5000

Frontend
  cd ../frontend
  npm install         # peer warnings are OK
  npm run dev         # Vite dev server
  # frontend default: http://localhost:5173

Helpers (added at project root)
  run-backend.*   run-frontend.*   run-both.*


3) Environment
--------------
Create backend/.env

  PORT=5000
  MONGO_URI=mongodb://localhost:27017/vidyavichar   # or your Atlas URI
  JWT_SECRET=super_secret_key
  CLIENT_URL=http://localhost:5173
  NODE_ENV=development

If using MongoDB Atlas, whitelist your IP and use the connection string in MONGO_URI.


4) Data Model (MongoDB/Mongoose)
--------------------------------
Files under backend/models/: User.js, Session.js, Question.js, Course.js, Enrollment.js.

User
  { _id, name, email, passwordHash, role: 'student'|'instructor', createdAt }

Session
  { _id, title, courseId?, startTime, endTime?, isActive }

Question
  {
    _id,
    sessionId,
    authorId?, authorName?,    # optional for anonymous posting
    text,                      # validated, deduped per session
    status: 'unanswered'|'answered',
    isImportant: Boolean,
    createdAt, updatedAt
  }

Course (optional)
  { _id, code, title, instructors:[], createdAt }

Enrollment (optional)
  { _id, courseId, userId, role }


5) API Surface (selected)
-------------------------
Base URL: http://localhost:5000/api

Auth
  POST /auth/signup        # create user (optional for demo)
  POST /auth/login         # returns JWT

Sessions
  POST /sessions           # create a new session/board (instructor)
  GET  /sessions/active    # get the active session

Questions
  POST /questions                                # create question { sessionId, text }
  GET  /questions?sessionId=...&filter=...       # list (filter: unanswered|answered|important)
  PATCH /questions/:id/status                    # toggle answered
  PATCH /questions/:id/important                 # toggle important
  DELETE /questions/:id                          # soft delete
  POST /questions/clear                          # clear session board (instructor)

Real‑time (Socket.IO)
  Client emits: question:new, question:update, question:clear
  Server emits: board:changed with updated items


6) Frontend Overview
--------------------
Stack: React 18 + Vite, TypeScript, TailwindCSS, shadcn, React Hook Form, Zod

Key folders
  frontend/src/components/board/*    # sticky notes, filters, empty states
  frontend/src/pages/*               # student/instructor screens
  frontend/src/lib/utils.ts          # helpers, classNames
  frontend/src/utils/storage.js      # lightweight local storage helpers

State & data
  Fetch via REST; push updates over Socket.IO for instant board refresh
  Client‑side validation mirrors server rules (trim, length, duplicates)


7) How this maps to the brief
-----------------------------
- Sticky‑note board with instant updates and color cues
- Instructor tools: mark answered/important; filter to unanswered/important/all; clear board
- Validation: rejects empty/duplicate questions (per session)
- Persistence: questions saved with timestamp & status for later review/analytics


8) Scripts
----------
Backend (backend/package.json)
  "dev": "nodemon server.js"
  "start": "node server.js"

Frontend (frontend/package.json)
  "dev": "vite"
  "build": "vite build"
  "preview": "vite preview"


9) Testing the Flow (manual)
----------------------------
1) Start backend → create/ensure an active session (class/board for the day).
2) Open frontend as Student → submit questions.
3) Open Instructor view → watch new notes appear instantly; mark answered/important.
4) Try filters and clear board flow.
5) Stop servers → restart → submitted questions remain (persistence check).


10) Troubleshooting
-------------------
Peer dependency warnings during npm install (frontend)
  Common with modern React/Tailwind stacks; they’re warnings, not errors.
  If install fails, try: npm ci   OR   npm i --legacy-peer-deps

nodemon: Permission denied (macOS/Linux)
  cd backend
  chmod +x node_modules/.bin/nodemon
  # or:
  rm -rf node_modules package-lock.json && npm install

Mongo connection errors
  Verify MONGO_URI, network access (Atlas), or that local mongod is running.

Port in use
  Change PORT or close the other process.

CORS
  Ensure CLIENT_URL matches your frontend origin.


11) Design Decisions (summary)
------------------------------
- Socket.IO for real‑time (low friction for classrooms; resilient reconnects)
- Session‑scoped board (prevents cross‑lecture collisions; simplifies filtering)
- Duplicate control (case‑insensitive per session)
- Soft delete / clear (avoid accidental loss, keep auditability)
- Role‑based policy (instructor vs student) via JWT
- Tailwind + shadcn for speed and accessible components


12) Assumptions (Project + PDF + Team)
--------------------------------------
A. Authentication & Roles
  1. Faculty login is via Google/Gmail OAuth ONLY.
     - Single sign‑on ensures identity; no separate faculty passwords to manage.
  2. Students login with institution‑issued student credentials (ID + password) on the SAME login page.
     - No separate “student app” or site. A single login screen supports both flows.
  3. JWT is used for session management after successful login.
  4. Instructor‑only actions (mark answered/important, clear board) are protected by role checks.

B. Class/Session Lifecycle
  5. Faculty creates a NEW CLASS (session) EVERY DAY so there is a fresh board per day.
     - The board is always session‑scoped. Old sessions remain read‑only for later review.
  6. Each session has a human‑friendly title (e.g., “CSE201 • 2025‑09‑28 (Morning)”).

C. Scaling & Multi‑Tenancy
  7. System supports many faculties in parallel. Multiple institutions/courses/classes can run concurrently.
  8. Horizontal scale approach (production):
     - Node clustering or PM2 for API; Socket.IO with Redis adapter for scaling websockets.
     - MongoDB Atlas with replica set; consider sharding by institution/course when needed.
     - CDN for static assets; autoscaling on your host (Render/Railway/Heroku/K8s).
  9. Logical isolation by institution → namespaces (institutionId) on users, sessions, and questions.
 10. Target scale assumption: hundreds of concurrent classes and thousands of active students, subject to infra sizing.

D. Posting & Moderation
 11. Questions are TEXT ONLY (max ~200 chars by default). No images/attachments in v1.
 12. Duplicate detection is case‑insensitive on trimmed text within the same session.
 13. Optional anonymity: student names are hidden from other students by default, but visible to instructors and stored server‑side.
 14. Basic profanity/restricted‑term filter can be enabled (configurable list).
 15. Rate limiting: default 1 question / 10s per student (configurable) to reduce spam.

E. Board Behavior & Retention
 16. “Clear Board” performs a soft‑delete for the session questions; records audit metadata (who/when).
 17. Data retention default: 90 days; export to CSV/JSON available to faculty/admins (optional utility).
 18. Time‑windowed posting: students may post only while a session is active; instructors can extend or close a session.
 19. Filters (All/Unanswered/Important/Answered) reflect server‑truth; client cache refreshes on socket events.

F. Non‑Goals / Out of Scope (v1)
 20. Email/SSO for students beyond institutional login is out of scope.
 21. Rich text, images, file uploads for questions are out of scope.
 22. Analytics dashboards (heatmaps, per‑topic grouping) reserved for v2.
 23. LMS deep integrations (Canvas/Moodle) not included in v1.
 24. Mobile apps are not part of this submission (web is responsive).

G. Security & Compliance
 25. CORS is restricted to configured CLIENT_URL; HTTPS is recommended in production.
 26. Passwords (where applicable) stored using salted hash (bcrypt).
 27. Access logs and server error logs maintained; PII minimization by design.


13) Deployment Notes
--------------------
Frontend (Vercel/Netlify)
  cd frontend
  npm run build
  # deploy the dist/ folder

Backend (Render/Railway/Heroku)
  Set env vars from .env
  Use npm start
  Open CORS to your deployed frontend origin

Database
  MongoDB Atlas recommended; set MONGO_URI.


14) Submission Checklist
------------------------
[ ] README present (this file), with setup and design decisions
[ ] Runs locally: backend on 5000, frontend on 5173
[ ] Board UI matches sticky‑note, filters, instructor controls
[ ] Duplicate/empty questions blocked
[ ] Data persists across restarts
[ ] Git history pushed


15) Credits
-----------
Built by the VidyaVichar team. Frontend and backend integrated and refined per the brief; UI polished to match expected flows; assumptions added as agreed (OAuth for faculty, credential login for students, daily fresh board, and scalable multi‑faculty architecture).
