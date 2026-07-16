# 🍿 GrabAndCorn

A full-stack movie ticket booking web app where users can browse now-showing movies, pick showtimes, select seats, and book tickets — all in one smooth flow.

## Features

- 🎬 Browse movies with details, trailers, and showtimes
- 🪑 Interactive seat selection for booking
- 🔐 Secure authentication and user management (Clerk)
- 🛒 Booking cart and order flow
- 📱 Responsive UI built with React
- ⚡ Fast dev experience powered by Vite
- 🗄️ Persistent data storage with MongoDB
- 🔄 Centralized state management via Redux Toolkit

## Tech Stack

**Frontend**
- React (Vite)
- Redux Toolkit
- Tailwind CSS
- Clerk (authentication)

**Backend**
- Node.js
- Express
- MongoDB (Mongoose)

## Project Structure

```
GrabAndCorn/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server/                 # Node + Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   ├── server.js
│   └── package.json
└── README.md
```


## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local instance or Atlas cluster)
- A Clerk account for authentication keys

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/GrabAndCorn.git
   cd GrabAndCorn
   ```

2. Install backend dependencies
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
```

Create a `.env` file inside `client/`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000
```

### Running the App

Start the backend server:
```bash
cd server
npm run dev
```

Start the frontend dev server:
```bash
cd client
npm run dev
```

The app should now be running at `http://localhost:5173` (frontend) with the API on `http://localhost:5000`.

## Scripts

| Command       | Description                     |
|---------------|----------------------------------|
| `npm run dev` | Runs the app in development mode |
| `npm run build` | Builds the frontend for production |
| `npm start`   | Runs the production backend server |

## Roadmap

- [ ] Payment gateway integration
- [ ] Admin dashboard for managing movies/showtimes
- [ ] Booking history and ticket download
- [ ] Ratings and reviews

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a PR.

