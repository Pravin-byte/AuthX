import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// ====== Middleware ======
// Secure HTTP headers
app.use(helmet());

app.set('trust proxy', 1);


// Parse cookies and JSON
app.use(cookieParser());
app.use(express.json());

// Environment-based CORS
app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : 'http://localhost:3000',
  credentials: true
}));

// Connect to MongoDB
connectDB();

// Enforce HTTPS in production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

// CSRF Protection Middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'None'
  }
});

// Apply CSRF protection globally except for safe GET endpoints (like login page CSRF token fetch)
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  csrfProtection(req, res, next);
});

// Send CSRF token to frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/send-otp', authLimiter);

// ====== Routes ======
app.get('/', (req, res) => {
  res.send("API working");
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// ====== Error Handler for CSRF ======
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF Token'
    });
  }
  next(err);
});

// ====== Start Server ======
app.listen(port, () => {
  console.log(`Server listening on PORT ${port}`);
});
