import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import db, { initializeDatabase as initDb } from './db/database.js';
import trainRoutes from './routes/trains.js';
import bookingRoutes from './routes/bookings.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDb().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Routes
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server now...');
  db.close();
  console.log('Database connection closed');
  process.exit(0);
});

export default app;