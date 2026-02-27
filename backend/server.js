import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import db, { initializeDatabase as initDb } from './db/database.js';
import trainRoutes from './routes/trains.js';
import bookingRoutes from './routes/bookings.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
initDb().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Routes
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   GET  http://localhost:${PORT}/api/trains`);
  console.log(`   GET  http://localhost:${PORT}/api/trains/:id`);
  console.log(`   POST http://localhost:${PORT}/api/trains`);
  console.log(`   PUT  http://localhost:${PORT}/api/trains/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/trains/:id`);
  console.log(`   GET  http://localhost:${PORT}/api/bookings`);
  console.log(`   POST http://localhost:${PORT}/api/bookings`);
  console.log(`   DELETE http://localhost:${PORT}/api/bookings/:id`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

export default app;
