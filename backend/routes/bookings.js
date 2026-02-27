import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all bookings
router.get('/', (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    const bookings = rows.map(booking => ({
      id: booking.id,
      trainId: booking.train_id,
      trainName: booking.train_name,
      passengers: booking.num_passengers,
      totalPrice: booking.total_price,
      bookingDate: booking.booking_date, // creation date
      travelDate: booking.travel_date,    // journey date
      from: booking.from_station,
      to: booking.to_station
    }));

    res.json({ success: true, data: bookings });
  });
});

// GET single booking
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
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
        from: row.from_station,
        to: row.to_station
      }
    });
  });
});

// CREATE a new booking
router.post('/', (req, res) => {
  const { trainId, passengers, travelDate } = req.body;

  // Validation
  if (!trainId || !passengers || passengers < 1 || !travelDate) {
    return res.status(400).json({
      success: false,
      error: 'Invalid train ID, number of passengers, or journey date'
    });
  }

  // ensure travelDate is not in the past
  const today = new Date();
  const chosen = new Date(travelDate);
  chosen.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  if (chosen < today) {
    return res.status(400).json({
      success: false,
      error: 'Journey date must be today or in the future'
    });
  }

  // Get train details
  db.get('SELECT * FROM trains WHERE id = ?', [trainId], (err, train) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!train) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    // Check if enough seats available
    if (train.available_seats < passengers) {
      return res.status(400).json({
        success: false,
        error: `Only ${train.available_seats} seats available`
      });
    }

    // Create booking
    const bookingId = Date.now().toString();
    const totalPrice = train.price_per_seat * passengers;
    const bookingDate = new Date().toLocaleDateString();

    db.run(
      `INSERT INTO bookings (id, train_id, train_name, from_station, to_station, num_passengers, total_price, booking_date, travel_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        trainId,
        train.name,
        train.from_station,
        train.to_station,
        passengers,
        totalPrice,
        bookingDate,
        travelDate
      ],
      (err) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }

        // Update available seats in train
        const newAvailableSeats = train.available_seats - passengers;
        db.run(
          'UPDATE trains SET available_seats = ? WHERE id = ?',
          [newAvailableSeats, trainId],
          (err) => {
            if (err) {
              return res.status(500).json({ success: false, error: err.message });
            }

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
          }
        );
      }
    );
  });
});

// DELETE a booking (cancel booking)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Get booking details
  db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, booking) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Get train details to update seats
    db.get('SELECT * FROM trains WHERE id = ?', [booking.train_id], (err, train) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      // Restore seats
      const restoredSeats = train.available_seats + booking.num_passengers;
      db.run(
        'UPDATE trains SET available_seats = ? WHERE id = ?',
        [restoredSeats, booking.train_id],
        (err) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }

          // Delete booking
          db.run('DELETE FROM bookings WHERE id = ?', [id], (err) => {
            if (err) {
              return res.status(500).json({ success: false, error: err.message });
            }

            res.json({
              success: true,
              message: 'Booking cancelled successfully',
              data: {
                restoredSeats
              }
            });
          });
        }
      );
    });
  });
});

export default router;
