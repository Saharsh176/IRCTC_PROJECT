import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all bookings
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
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
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
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
router.post('/', (req, res) => {
  const { trainId, passengers, travelDate } = req.body;

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

    if (train.available_seats < passengers) {
      return res.status(400).json({ success: false, error: `Only ${train.available_seats} seats available` });
    }

    const bookingId = Date.now().toString();
    const totalPrice = train.price_per_seat * passengers;
    const bookingDate = new Date().toLocaleDateString();
    const newAvailableSeats = train.available_seats - passengers;

    const insertBooking = db.prepare(
      `INSERT INTO bookings (id, train_id, train_name, from_station, to_station, num_passengers, total_price, booking_date, travel_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateTrain = db.prepare('UPDATE trains SET available_seats = ? WHERE id = ?');

    // Run atomically within a transaction
    const performBooking = db.transaction(() => {
      insertBooking.run(bookingId, trainId, train.name, train.from_station, train.to_station, passengers, totalPrice, bookingDate, travelDate);
      updateTrain.run(newAvailableSeats, trainId);
    });

    performBooking();

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
        to: train.to_station
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE a booking (cancel booking)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const train = db.prepare('SELECT * FROM trains WHERE id = ?').get(booking.train_id);
    if (!train) {
      return res.status(500).json({ success: false, error: 'Associated train data missing' });
    }

    const restoredSeats = train.available_seats + booking.num_passengers;

    const deleteBooking = db.prepare('DELETE FROM bookings WHERE id = ?');
    const updateTrain = db.prepare('UPDATE trains SET available_seats = ? WHERE id = ?');

    // Run atomically within a transaction
    const cancelBooking = db.transaction(() => {
      updateTrain.run(restoredSeats, booking.train_id);
      deleteBooking.run(id);
    });

    cancelBooking();

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