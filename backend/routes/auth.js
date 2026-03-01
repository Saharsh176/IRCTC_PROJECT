// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import 'dotenv/config';
    
const router = express.Router();

// Secret key for JWT 
const JWT_SECRET = process.env.JWT_SECRET;

// Register Route
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate a unique ID (you can also use the 'uuid' package)
    const userId = Date.now().toString();

    // Insert the new user into the database
    const insertUser = db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)');
    insertUser.run(userId, username, hashedPassword);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
});

// Login Route
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Fetch user from the database
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password in the DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    next(error);
  }
});

export default router;