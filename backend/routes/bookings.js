import express from 'express';
import db from '../db/database.js';
import { requireAuth } from '../middleware/authMiddleware.js'; 
import crypto from 'crypto';

const router = express.Router();

// Helper function to calculate available seats for a specific date
const getAvailableSeatsForDate = (trainId, date) => {
  const train = db.prepare('SELECT total_seats FROM trains WHERE id = ?').get(trainId);
  if (!train) return 0;

  const bookedResult = db.prepare(
    'SELECT COALESCE(SUM(num_passengers), 0) as booked FROM bookings WHERE train_id = ? AND travel_date = ?'
  ).get(trainId, date);

  return train.total_seats - (bookedResult?.booked || 0);
};

// GET all bookings (Filtered by user_id)
router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user.id; // Get ID from token
    // Filter by user_id
    const rows = db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const bookings = rows.map(booking => ({
      id: booking.id,
      trainId: booking.train_id,
      trainName: booking.train_name,
      passengers: booking.num_passengers,
      totalPrice: booking.total_price,
      bookingDate: booking.booking_date,
      travelDate: booking.travel_date,
      from: booking.from_station,
      to: booking.to_station
    }));

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single booking
router.get('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Ensure the booking belongs to this specific user
    const row = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(id, userId);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Booking not found or unauthorized' });
    }

    res.json({
      success: true,
      data: {
        id: row.id,
        trainId: row.train_id,
        trainName: row.train_name,
        passengers: row.num_passengers,
        totalPrice: row.total_price,
        bookingDate: row.booking_date,
        travelDate: row.travel_date,
        from: row.from_station,
        to: row.to_station
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE a new booking
router.post('/', requireAuth, (req, res) => {
  const { trainId, passengers, travelDate } = req.body;
  const userId = req.user.id; // Get ID from token

  if (!trainId || !passengers || passengers < 1 || !travelDate) {
    return res.status(400).json({ success: false, error: 'Invalid train ID, passengers, or date' });
  }

  const todayString = new Date().toISOString().split('T')[0];
  if (travelDate < todayString) {
    return res.status(400).json({ success: false, error: 'Journey date must be today or future' });
  }

  try {
    const train = db.prepare('SELECT * FROM trains WHERE id = ?').get(trainId);
    if (!train) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    // Calculate available seats for THIS SPECIFIC DATE only
    const availableSeatsForDate = getAvailableSeatsForDate(trainId, travelDate);
    if (availableSeatsForDate < passengers) {
      return res.status(400).json({ success: false, error: `Only ${availableSeatsForDate} seats available on ${travelDate}` });
    }

    const bookingId = crypto.randomUUID();
    const totalPrice = train.price_per_seat * passengers;
    const bookingDate = new Date().toLocaleDateString();

    const insertBooking = db.prepare(
      `INSERT INTO bookings (id, user_id, train_id, train_name, from_station, to_station, num_passengers, total_price, booking_date, travel_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` // Added user_id parameter
    );

    // Run atomically within a transaction
    const performBooking = db.transaction(() => {
      insertBooking.run(bookingId, userId, trainId, train.name, train.from_station, train.to_station, passengers, totalPrice, bookingDate, travelDate);
    });

    performBooking();

    // Calculate remaining seats for this date
    const remainingSeats = availableSeatsForDate - passengers;

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        id: bookingId,
        trainId,
        trainName: train.name,
        passengers,
        totalPrice,
        bookingDate,
        travelDate,
        from: train.from_station,
        to: train.to_station,
        remainingSeats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE a booking (cancel booking)
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Validate that the user actually owns this booking before deleting
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(id, userId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found or unauthorized' });
    }

    const deleteBooking = db.prepare('DELETE FROM bookings WHERE id = ? AND user_id = ?');

    // Run atomically within a transaction
    const cancelBooking = db.transaction(() => {
      deleteBooking.run(id, userId);
    });

    cancelBooking();

    // Calculate remaining seats after cancellation
    const restoredSeats = getAvailableSeatsForDate(booking.train_id, booking.travel_date);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { restoredSeats }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;