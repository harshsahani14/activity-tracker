# Activity Tracker - Smart User Activity Logging System

A real-time activity tracking and analytics platform built with Node.js, Express, MongoDB, React, and Redis. Track user actions, enforce rate limiting with a sliding window token bucket algorithm, and visualize activity metrics in real-time.

## Features

- **User Authentication** - Register and login with JWT-based authentication
- **Activity Logging** - Log user actions (login, logout, view, click, custom) with metadata
- **Rate Limiting** - Custom sliding window log algorithm (5 actions per 10 seconds)
- **Redis Integration** - Atomic rate-limit checks using Lua scripts for multi-instance correctness
- **Real-time Analytics** - Dashboard showing total actions, most common actions, and per-minute breakdown
- **Suspicious Activity Detection** - Identify users with high-frequency actions (>20/min) or multiple IPs (>2 in 5 min)
- **Replay Protection** - Validate action timestamps and prevent duplicate submissions
- **Activity Visualizer** - Real-time sliding window visualization showing action timeline
- **Auto-refreshing Stats** - Dashboard refreshes every 5 seconds

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Cache/Rate Limiting:** Redis
- **Authentication:** JWT
- **Password Hashing:** bcryptjs

### Frontend
- **Library:** React
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Notifications:** react-hot-toast
- **HTTP Client:** Fetch API

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Docker (for Redis)
- Docker Compose (optional, for easier setup)
- MongoDB Compass (optional, for GUI management)

## Required Tools

### MongoDB Compass

A GUI for MongoDB to visually explore your data.

1. **Download:** https://www.mongodb.com/products/compass
2. **Connect:** 
   - Host: `localhost`
   - Port: `27017`
   - Database: `activity-tracker`
3. **Browse Collections:**
   - `users` - View registered users
   - `activitylogs` - View logged activities

This is helpful for debugging but not required — you can use `mongosh` CLI instead.

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd activity-tracker
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

Edit `.env` with your actual values:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**For JWT_SECRET**, generate a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Start Redis with Docker

```bash
# Pull and run Redis container
docker run -d -p 6379:6379 --name redis redis:latest
```

Verify Redis is running:
```bash
docker exec redis redis-cli ping
# Should return: PONG
```

To stop Redis:
```bash
docker stop redis
docker rm redis
```

#### Run Backend Server

```bash
npm run dev
```

Should see:
```
Redis Connected
MongoDB connected
Server running on port 5000
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Start Development Server

```bash
npm run dev
```

Should see:
```
Local: http://localhost:5173/
```

## Running the Application

1. Make sure MongoDB is running
2. Make sure Redis is running
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev` (in a new terminal)
5. Open browser to `http://localhost:5173`

## Usage

### Register/Login

1. Go to `/login` or `/register`
2. Create an account or log in with existing credentials
3. Get redirected to `/dashboard` automatically

### Activity Simulator

1. Click any action button (login, logout, view, click, custom)
2. Watch the sliding window visualization update in real-time
3. See the action count and rate-limit status
4. After 5 actions in 10 seconds, buttons disable temporarily

### Stats Page

Auto-refreshes every 5 seconds showing:
- Total number of actions logged
- Most common action type
- Actions per minute (last 10 minutes)
- Most active user

### Suspicious Users Page

Detects and displays users who:
- Logged >20 actions in 1 minute, OR
- Used >2 different IP addresses in 5 minutes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and receive JWT token

### Activity Logging
- `POST /api/activity/log-activity` - Log a user action (rate-limited)
- `GET /api/activity/stats` - Get analytics and statistics
- `GET /api/activity/suspicious` - Get suspicious users
- `POST /api/activity/replay-check` - Validate action timestamp

## Project Structure

```
activity-tracker/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── ActivityLog.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── activityController.js
│   ├── routes/
│   │   ├── authRouter.js
│   │   └── activityRouter.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── tokenBucket.js
│   ├── lib/
│   │   ├── db.js
│   │   └── redis.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LoginRegister.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ActivitySimulator.jsx
    │   │   ├── StatsPage.jsx
    │   │   └── SuspiciousUsersPage.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json
```


## API Testing

All APIs can be tested using `curl` commands.

### Authentication

#### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Harsh",
    "email":"harsh@example.com",
    "password":"password123"
  }'
```

#### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"harsh@example.com",
    "password":"password123"
  }'
```

Save the returned JWT token.

---

### Activity Logging

#### Log Activity

```bash
curl -X POST http://localhost:5000/api/activity/log-activity \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"click",
    "meta":{"button":"submit"}
  }'
```

---

### Rate Limiting Test

Send more than 5 requests within 10 seconds.

```bash
curl -X POST http://localhost:5000/api/activity/log-activity \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"click"
  }'
```

Expected response after limit exceeded:

```json
{
    "success": false,
    "message": "Rate limit exceeded: max 5 actions per 10 seconds",
    "serverTime": "2026-07-02T12:37:57.559Z",
    "actionsInLast10Sec": 5
}
```

---

### Analytics

#### Get Activity Stats

```bash
curl -X GET http://localhost:5000/api/activity/stats \
  -H "Authorization: Bearer <TOKEN>"
```

Returns:

- Total actions  
- Most common action  
- Actions per minute (last 10 minutes)  
- Most active user  

---

### Suspicious Activity Detection

```bash
curl -X GET http://localhost:5000/api/activity/suspicious \
  -H "Authorization: Bearer <TOKEN>"
```

To add suspicious records in mongodb run

```bash
node  backend/scripts/replayCheck.js                    
```


Detects users who:

- Sent more than 20 actions in 1 minute  
- Used more than 2 IP addresses in 5 minutes  

---

### Replay Protection

```bash
curl -X POST http://localhost:5000/api/activity/replay-check \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"click",
    "clientTime":"2026-07-01T16:00:00.000Z"
  }'
```

Rules:

- Reject if `clientTime` differs from server time by more than 30 seconds  
- Reject duplicate action within 3 seconds per user  

Expected response:

```json
{
  "allowed": true,
  "serverTime": "ISO_DATE"
}
```

---

