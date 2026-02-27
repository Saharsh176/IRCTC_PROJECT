import express from 'express';
import db from '../db/database.js';

const router = express.Router();

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

  if (date) {
    // expect date in YYYY-MM-DD format
    query += ' AND journey_date = ?';
    params.push(date);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      data: rows.map(train => ({
        id: train.id,
        name: train.name,
        from: train.from_station,
        to: train.to_station,
        departure: train.departure_time,
        arrival: train.arrival_time,
        duration: train.duration,
        date: train.journey_date,
        seats: train.available_seats,
        totalSeats: train.total_seats,
        price: train.price_per_seat,
        daysRunning: train.days_running
      }))
    });
  });
});

// GET single train
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM trains WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

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
        seats: row.available_seats,
        totalSeats: row.total_seats,
        price: row.price_per_seat,
        daysRunning: row.days_running
      }
    });
  });
});

// CREATE a new train (admin only)
router.post('/', (req, res) => {
  const { name, from, to, departure, arrival, duration, seats, price, daysRunning } = req.body;

  // Validation - remove date requirement since it's based on days_running
  if (!name || !from || !to || !departure || !arrival || !duration || seats === undefined || !price || !daysRunning) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields (name, from, to, departure, arrival, duration, seats, price, daysRunning)' 
    });
  }

  // Validate daysRunning format
  const daysStr = Array.isArray(daysRunning) ? daysRunning.join(',') : daysRunning;
  if (typeof daysStr !== 'string' || daysStr.trim() === '') {
    return res.status(400).json({ 
      success: false, 
      error: 'Days running must be provided' 
    });
  }

  const id = Date.now().toString();
  const today = new Date().toISOString().split('T')[0];
  const query = `
    INSERT INTO trains (id, name, from_station, to_station, departure_time, arrival_time, duration, journey_date, available_seats, total_seats, price_per_seat, days_running)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [id, name, from, to, departure, arrival, duration, today, seats, seats, parseFloat(price), daysStr],
    (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      res.status(201).json({
        success: true,
        message: 'Train created successfully',
        data: { id }
      });
    }
  );
});

// UPDATE train (admin only)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, from, to, departure, arrival, duration, date, seats, price, daysRunning } = req.body;

  // Check if train exists
  db.get('SELECT * FROM trains WHERE id = ?', [id], (err, train) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!train) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    // Update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (from !== undefined) {
      updates.push('from_station = ?');
      params.push(from);
    }
    if (to !== undefined) {
      updates.push('to_station = ?');
      params.push(to);
    }
    if (departure !== undefined) {
      updates.push('departure_time = ?');
      params.push(departure);
    }
    if (arrival !== undefined) {
      updates.push('arrival_time = ?');
      params.push(arrival);
    }
    if (duration !== undefined) {
      updates.push('duration = ?');
      params.push(duration);
    }
    if (seats !== undefined) {
      updates.push('available_seats = ?');
      params.push(seats);
    }
    if (price !== undefined) {
      updates.push('price_per_seat = ?');
      params.push(parseFloat(price));
    }
    if (daysRunning !== undefined) {
      const daysStr = Array.isArray(daysRunning) ? daysRunning.join(',') : daysRunning;
      updates.push('days_running = ?');
      params.push(daysStr);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE trains SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, (err) => {
      if (err) {
        console.error('Database error during update:', err.message);
        return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
      }

      res.json({
        success: true,
        message: 'Train updated successfully'
      });
    });
  });
});

// DELETE train (admin only)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Check if train exists
  db.get('SELECT * FROM trains WHERE id = ?', [id], (err, train) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!train) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    // Delete train
    db.run('DELETE FROM trains WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      res.json({
        success: true,
        message: 'Train deleted successfully'
      });
    });
  });
});

export default router;
