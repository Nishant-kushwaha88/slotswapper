# SlotSwapper

A web app where people can swap their busy time slots with each other. Built for the ServiceHive internship assignment.

## What does it do?

Let's say you have a meeting on Tuesday at 10 AM, but you'd rather have it on Wednesday afternoon. If someone else has a slot on Wednesday afternoon and wants Tuesday morning instead, you can swap with them!

## Tech I Used

**Frontend:**
- React with TypeScript
- React Router for moving between pages
- Axios to talk to the backend
- Vite for fast development

**Backend:**
- Node.js and Express
- MongoDB to store data
- JWT tokens for login security
- bcrypt to keep passwords safe

## Getting Started

You'll need Node.js and MongoDB installed on your computer.

### Step 1: Download the code
```bash
git clone <your-repo-link>
cd slotswapper
```

### Step 2: Set up the backend
```bash
cd backend
npm install
```

Create a file called `.env` in the backend folder and add this:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/slotswapper
JWT_SECRET=change_this_to_something_random
NODE_ENV=development
```

Make sure MongoDB is running on your computer, then:
```bash
npm run dev
```

The backend should start on http://localhost:5000

### Step 3: Set up the frontend

Open a new terminal window:
```bash
cd frontend
npm install
```

Create a file called `.env` in the frontend folder:
```
VITE_API_URL=http://localhost:5000/api
```

Then start the frontend:
```bash
npm run dev
```

Open your browser and go to http://localhost:5173

## How to use it

1. **Sign up** - Create an account with your name, email, and password
2. **Add events** - Create your schedule by adding time slots (like "Team Meeting" or "Lunch Break")
3. **Make slots swappable** - Click "Make Swappable" on any event you want to swap
4. **Find swaps** - Go to "Marketplace" to see what others are offering
5. **Request a swap** - Pick a slot you want and offer one of yours in return
6. **Wait for response** - The other person gets a notification in their "Requests" page
7. **Done!** - If they accept, your calendars update automatically

## API Endpoints

Here's what the backend can do:

**Authentication:**
- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Log in

**Your Events:**
- `GET /api/events` - See all your events
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

**Swapping:**
- `GET /api/swappable-slots` - See everyone's available slots
- `GET /api/my-swappable-slots` - See your own swappable slots
- `POST /api/swap-request` - Ask someone to swap
- `GET /api/incoming` - See who wants to swap with you
- `GET /api/outgoing` - See swap requests you sent
- `POST /api/swap-response/:requestId` - Accept or reject a swap

(All swap endpoints need you to be logged in)

## Project Structure
```
slotswapper/
├── backend/               # Server code
│   ├── src/
│   │   ├── config/       # Database setup
│   │   ├── models/       # Data structure (Users, Events, Swaps)
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Authentication check
│   │   └── server.ts     # Main server file
│   └── package.json
│
└── frontend/              # React app
    ├── src/
    │   ├── components/   # UI components (Login, Dashboard, etc.)
    │   ├── context/      # Global state for login
    │   ├── services/     # API calls
    │   └── App.tsx       # Main app
    └── package.json
```

## Challenges I Faced

1. **MongoDB Transactions:** Initially used database transactions for data consistency, but they only work with MongoDB replica sets. For this demo, I removed them since it's running locally. In production, I'd use a proper replica set or switch to PostgreSQL.

2. **React Version Compatibility:** Had to downgrade from React 19 to React 18 because react-router-dom doesn't fully support React 19 yet.

3. **State Management:** Making sure the UI updates immediately after accepting a swap without needing to refresh the page took some careful planning.

## Things I'd Add With More Time

- **Real-time notifications** using WebSockets instead of having to refresh
- **Calendar view** instead of just a list of events
- **Email alerts** when someone requests a swap
- **Better UI design** with a proper design system
- **Tests** for the backend logic (especially the swap logic)
- **Docker setup** to make it easier to run anywhere
- **Deploy it** so you can try it online

## Known Issues

- No transactions means there's a tiny chance of data inconsistency if the server crashes mid-swap (extremely rare)
- Currently only shows dates/times in your local timezone

## Common Problems

**"Can't connect to MongoDB"**
Make sure MongoDB is installed and running. On Windows, check if the MongoDB service is started.

**"Port 5000 already in use"**
Change the PORT in backend/.env to something else like 5001

**"White screen on frontend"**
Check the browser console (F12) for errors. Make sure the backend is running first.

## Author

Made by Nishant for the ServiceHive Full Stack Intern assignment.

Thanks for checking it out! 😊