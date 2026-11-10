# EventHub | College Event Management System

EventHub is a full-stack, responsive, dark-themed College Event Management System built on the MERN stack (MongoDB, Express, React, Node.js). It provides a unified ecosystem for students, event organizers, and system administrators to discover, host, register, and audit campus events, technical hackathons, sports tournaments, and seminars.

---

## 📸 Preview & Live Walkthrough

![EventHub Screenshot](./docs/screenshot.png)

![EventHub Demo](./docs/demo.gif)

> 🎬 **[Watch Full Demo Video (WebM)](./docs/demo.webm)**

---

## Technical Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT) for secure authentication, and BcryptJS for password hashing.
- **Frontend**: React (Vite), React Router DOM, React Context API, and a custom responsive styling system using vanilla CSS with glowing dark-theme elements and glassmorphic designs.

---

## Directory Structure

```
college-event-system/
├── backend/                 # Node.js & Express server
│   ├── config/              # Database connection logic
│   ├── controllers/         # Authentication and Event controllers
│   ├── middleware/          # Security protection gates
│   ├── models/              # MongoDB Mongoose schemas (User, Event)
│   ├── routes/              # Express endpoint routing
│   ├── .env                 # Backend environment secrets
│   ├── package.json         # Backend dependencies
│   └── server.js            # Express server initialization
│
├── frontend/                # React (Vite) client app
│   ├── public/              # Static SVG and HTML assets
│   ├── src/
│   │   ├── api/             # Fetch REST wrapper
│   │   ├── assets/          # Custom global CSS (index.css)
│   │   ├── components/      # Reusable Navbar and EventCard
│   │   ├── context/         # AuthContext state distributor
│   │   ├── pages/           # Pages (Home, Login, Register, Dashboards)
│   │   ├── App.jsx          # Route gates and components mapping
│   │   └── main.jsx         # DOM entry mount point
│   ├── vite.config.js       # Vite build configurations with proxy setup
│   └── package.json         # Frontend dependencies
│
├── .gitignore               # Main Git version ignore files
└── README.md                # System documentation
```

---

## Features

1. **User Authentication**: Secure signup and login profiles. Supports dynamic toggle between Student and Organizer roles.
2. **Explore events**: Public grid to browse, search (case-insensitive regex on titles), and filter upcoming events by category tabs.
3. **Personalized Dashboards**:
   - **Students**: Displays registered events, upcoming schedules count, and attendance tallies.
   - **Organizers**: Displays events hosted, active bookings count, sold-out events, and registration action shortcuts (Create, Edit, Delete).
4. **Interactive Capacity Controls**: Real-time progress slots updates, checking date validations, checking capacity limits, preventing duplicates, and displaying sold-out blocks.
5. **Coordinator Rosters**: Organizers and Admins can view precise registration lists (participant names and email addresses) inside the event details panel.
6. **Auditing Control Board (Admin)**: Separate panel allowing system administrators to modify user permission roles, delete users, or audit and delete any event system-wide.

---

## Local Installation

Ensure you have a local MongoDB instance running on your system (`mongodb://127.0.0.1:27017`).

### 1. Launch the Backend Server
```bash
cd backend
npm install
npm run dev
```

### 2. Launch the Frontend Client
```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## License

This project is open-source and available under the MIT License.
