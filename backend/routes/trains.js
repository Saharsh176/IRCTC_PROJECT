import express from 'express';
import db from '../db/database.js';

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

// GET all trains
router.get('/', (req, res) => {
  const { from, to, date } = req.query;

  let query = 'SELECT * FROM trains WHERE 1=1';
  const params = [];

  if (from) {
    query += ' AND from_station LIKE ?';
    params.push(`%${from}%`);
  }
  if (to) {
    query += ' AND to_station LIKE ?';
    params.push(`%${to}%`);
  }

  try {
    const rows = db.prepare(query).all(params);
    res.json({
      success: true,
      data: rows.map(train => {
        // Calculate available seats for the requested date
        const availableSeats = date ? getAvailableSeatsForDate(train.id, date) : train.total_seats;
        return {
          id: train.id,
          name: train.name,
          from: train.from_station,
          to: train.to_station,
          departure: train.departure_time,
          arrival: train.arrival_time,
          duration: train.duration,
          date: date || train.journey_date,
          seats: availableSeats,
          totalSeats: train.total_seats,
          price: train.price_per_seat,
          daysRunning: train.days_running
        };
      })
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single train
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const row = db.prepare('SELECT * FROM trains WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    // For single train, return current total_seats as available (not date-specific from this endpoint)
    res.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        from: row.from_station,
        to: row.to_station,
        departure: row.departure_time,
        arrival: row.arrival_time,
        duration: row.duration,
        date: row.journey_date,
        seats: row.total_seats,
        totalSeats: row.total_seats,
        price: row.price_per_seat,
        daysRunning: row.days_running
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE a new train (admin only)
router.post('/', (req, res) => {
  const { name, from, to, departure, arrival, duration, seats, price, daysRunning } = req.body;

  if (!name || !from || !to || !departure || !arrival || !duration || seats === undefined || !price || !daysRunning) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const daysStr = Array.isArray(daysRunning) ? daysRunning.join(',') : daysRunning;
  if (typeof daysStr !== 'string' || daysStr.trim() === '') {
    return res.status(400).json({ success: false, error: 'Days running must be provided' });
  }

  const id = Date.now().toString();
  const today = new Date().toISOString().split('T')[0];
  const query = `
    INSERT INTO trains (id, name, from_station, to_station, departure_time, arrival_time, duration, journey_date, available_seats, total_seats, price_per_seat, days_running)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    db.prepare(query).run(id, name, from, to, departure, arrival, duration, today, seats, seats, parseFloat(price), daysStr);
    res.status(201).json({ success: true, message: 'Train created successfully', data: { id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE train (admin only)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, from, to, departure, arrival, duration, seats, price, daysRunning } = req.body;

  try {
    const train = db.prepare('SELECT * FROM trains WHERE id = ?').get(id);
    if (!train) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (from !== undefined) { updates.push('from_station = ?'); params.push(from); }
    if (to !== undefined) { updates.push('to_station = ?'); params.push(to); }
    if (departure !== undefined) { updates.push('departure_time = ?'); params.push(departure); }
    if (arrival !== undefined) { updates.push('arrival_time = ?'); params.push(arrival); }
    if (duration !== undefined) { updates.push('duration = ?'); params.push(duration); }
    if (seats !== undefined) { updates.push('available_seats = ?'); params.push(seats); }
    if (price !== undefined) { updates.push('price_per_seat = ?'); params.push(parseFloat(price)); }
    if (daysRunning !== undefined) {
      const daysStr = Array.isArray(daysRunning) ? daysRunning.join(',') : daysRunning;
      updates.push('days_running = ?'); params.push(daysStr);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE trains SET ${updates.join(', ')} WHERE id = ?`;

    db.prepare(query).run(params);
    res.json({ success: true, message: 'Train updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// DELETE train (admin only)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const train = db.prepare('SELECT * FROM trains WHERE id = ?').get(id);
    if (!train) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    db.prepare('DELETE FROM trains WHERE id = ?').run(id);
    res.json({ success: true, message: 'Train deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;