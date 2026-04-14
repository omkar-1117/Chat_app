# ⚡ ChatWave — Real-Time MERN Chat App

A full-stack real-time chat application built with the **MERN stack** (MongoDB, Express, React, Node.js) and **Socket.io**.

---

## Features

- **Real-time messaging** with Socket.io
- **Chat rooms** — create, join, and delete rooms
- **User authentication** — JWT-based register & login
- **Typing indicators** — see who is typing live
- **Online user presence** — track who's in the room
- **Chat history** — stored in MongoDB, loaded on join
- **System messages** — join/leave notifications
- **Dark theme** — sleek modern UI

---

## Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React 18, Socket.io-client    |
| Backend   | Node.js, Express              |
| Realtime  | Socket.io                     |
| Database  | MongoDB + Mongoose            |
| Auth      | JWT + bcryptjs                |

---

## Project Structure

```
chat-app/
├── server/
│   ├── index.js              # Express + Socket.io server
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   └── messages.js
│   └── middleware/
│       └── auth.js
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js / App.css
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── SocketContext.js
│       ├── pages/
│       │   ├── AuthPage.js / .css
│       │   └── ChatPage.js / .css
│       └── components/
│           ├── Sidebar.js / .css
│           ├── ChatWindow.js / .css
│           └── CreateRoomModal.js / .css
├── package.json
└── .env.example
```

---

## Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** running locally OR a MongoDB Atlas connection string

---

### 1. Clone / Open the Project

Open the `chat-app` folder in VS Code.

---

### 2. Set Up Environment Variables

Copy the example env file and fill it in:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

> **MongoDB Atlas:** Replace `MONGODB_URI` with your Atlas connection string, e.g.:
> `mongodb+srv://username:password@cluster.mongodb.net/chatapp`
>
> Before starting the server:
> - create a MongoDB Atlas database user
> - add your machine's IP in Atlas `Network Access`
> - URL-encode special characters in the password

---

### 3. Install Dependencies

**Install everything at once:**
```bash
npm run install-all
```

Or manually:
```bash
# Root (server) dependencies
npm install

# Client dependencies
cd client && npm install && cd ..
```

---

### 4. Start the App (Development)

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000` (with nodemon)
- **Frontend** on `http://localhost:3000` (with React dev server)

---

### 5. Open in Browser

Visit **http://localhost:3000**

- Register a new account
- Create a chat room
- Open a second browser tab/window, register another user
- Join the same room and chat in real-time!

---

## Available Scripts

| Command             | Description                              |
|---------------------|------------------------------------------|
| `npm run dev`       | Start both server and client in dev mode |
| `npm run server`    | Start only the backend (nodemon)         |
| `npm run client`    | Start only the React frontend            |
| `npm run build`     | Build React app for production           |
| `npm start`         | Start production server                  |

---

## API Endpoints

### Auth
| Method | Route               | Description        |
|--------|---------------------|--------------------|
| POST   | `/api/auth/register`| Register new user  |
| POST   | `/api/auth/login`   | Login              |
| GET    | `/api/auth/me`      | Get current user   |

### Rooms
| Method | Route              | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/rooms`       | Get all rooms      |
| POST   | `/api/rooms`       | Create a room      |
| GET    | `/api/rooms/:id`   | Get room by ID     |
| POST   | `/api/rooms/:id/join` | Join a room     |
| DELETE | `/api/rooms/:id`   | Delete a room      |

### Messages
| Method | Route                    | Description              |
|--------|--------------------------|--------------------------|
| GET    | `/api/messages/:roomId`  | Get messages for a room  |
| DELETE | `/api/messages/:id`      | Delete a message         |

---

## Socket.io Events

### Client → Server
| Event          | Payload                                      |
|----------------|----------------------------------------------|
| `join_room`    | `{ roomId, userId, username }`               |
| `send_message` | `{ roomId, userId, content, username }`      |
| `typing`       | `{ roomId, username, isTyping }`             |
| `leave_room`   | `{ roomId, username }`                       |

### Server → Client
| Event             | Description                        |
|-------------------|------------------------------------|
| `message_history` | Last 50 messages on join           |
| `receive_message` | New message broadcast              |
| `room_users`      | Updated list of online users       |
| `user_typing`     | Typing indicator update            |
| `user_joined`     | System notification on join        |
| `user_left`       | System notification on leave       |

---

## Deployment

### Deploy to Render (free)

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard
6. Set `NODE_ENV=production` and use MongoDB Atlas URI

---

## Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running: `mongod` or use Atlas

**Port already in use:**
- Change `PORT` in `.env`

**CORS errors:**
- Make sure `CLIENT_URL` in `.env` matches your frontend URL
