# AuthX 🔐

AuthX is a secure, full-stack authentication system built with the **MERN** stack (MongoDB, Express, React, Node.js). It supports modern authentication features like OTP-based email verification, password encryption, JWT authentication, CSRF protection, and more.

---

## 🌐 Live Demo

> [https://authx-frontend-uqbq.onrender.com]

---

## 🚀 Features

- ✅ **User Registration with Email OTP Verification**
- 🔐 **Secure Login with JWT & httpOnly Cookies**
- 🔁 **Password Reset with Email OTP**
- 🛡️ **CSRF Protection and Rate Limiting**
- 🔒 **Bcrypt Password Hashing**
- 📬 **Email Notifications using NodeMailer**
- ⚙️ **Environment Variable Configuration**
- 🌍 **Frontend/Backend Deployment Ready**

---

## 🧱 Tech Stack

### Frontend
- React
- React Router
- CSS Modules (customize based on your setup)
- Axios
- Toast Notifications

### Backend
- Node.js
- Express.js
- Mongoose
- JWT
- bcryptjs
- dotenv
- csurf
- helmet
- express-rate-limit
- nodemailer

---

## 📁 Project Structure

```
AuthX/
├── client/              # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
|   |   |__ hooks/
│   │   └── App.jsx
│   └── .env             # FRONTEND_URL
├── server/              # Express Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── .env             # MONGODB_URI, JWT_SECRET, EMAIL creds etc.
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

```env
PORT=3001
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
```

### Frontend (`client/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:3001
```

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Pravin-byte/AuthX.git
cd AuthX
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Run the app locally

```bash
# Backend
cd server
npm run server

# Frontend
cd ../client
npm start
```

---

## 🔐 Security Highlights

- **Password Encryption**: Bcrypt for password hashing.
- **Email OTP Verification**: Time-bound OTPs for signup and password reset.
- **JWT Authentication**: Secure tokens with expiry, stored in httpOnly cookies.
- **CSRF Protection**: Using `csurf` middleware.
- **Rate Limiting**: Prevent brute-force attacks on APIs.
- **Helmet**: Secures HTTP headers.

---

## 📦 Deployment

You can deploy both frontend and backend on platforms like **Render**, **Vercel**, or **Netlify**.

> ✅ Be sure to set environment variables in the deployment settings for both frontend and backend.

---

