import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'irctc.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys and set mode
db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA synchronous = NORMAL');
db.configure('busyTimeout', 5000);

// Initialize database tables
export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create trains table (include date of journey and days when train runs)
      db.run(`
        CREATE TABLE IF NOT EXISTS trains (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          from_station TEXT NOT NULL,
          to_station TEXT NOT NULL,
          departure_time TEXT NOT NULL,
          arrival_time TEXT NOT NULL,
          duration TEXT NOT NULL,
          journey_date TEXT NOT NULL,
          available_seats INTEGER NOT NULL,
          total_seats INTEGER NOT NULL,
          price_per_seat REAL NOT NULL,
          days_running TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Create bookings table (booking_date will record when reservation was made,
      // travel_date will capture the journey date chosen by the user)
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          train_id TEXT NOT NULL,
          train_name TEXT NOT NULL,
          from_station TEXT NOT NULL,
          to_station TEXT NOT NULL,
          num_passengers INTEGER NOT NULL,
          total_price REAL NOT NULL,
          booking_date TEXT NOT NULL,
          travel_date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (train_id) REFERENCES trains(id)
        )
      `, (err) => {
        if (err) reject(err);
      });

      // After creating tables, make sure older databases have the new columns
      // Add journey_date to trains if it doesn't already exist
      db.run("PRAGMA table_info(trains)", (err, info) => {
        // iterate through table info rows to see if journey_date exists
      });

      // For simplicity, run ALTER TABLEs; if column already exists SQLite will error, but
      // errors are caught and ignored below.
      db.run('ALTER TABLE trains ADD COLUMN journey_date TEXT', (err) => {
        if (err && !/duplicate column name/.test(err.message)) {
          console.error('Error adding journey_date column to trains:', err.message);
        }
      });
      db.run('ALTER TABLE bookings ADD COLUMN travel_date TEXT', (err) => {
        if (err && !/duplicate column name/.test(err.message)) {
          console.error('Error adding travel_date column to bookings:', err.message);
        }
      });      db.run('ALTER TABLE trains ADD COLUMN days_running TEXT', (err) => {
        if (err && !/duplicate column name/.test(err.message)) {
          console.error('Error adding days_running column to trains:', err.message);
        }
      });
      // Check if trains table is empty and populate with sample data
      db.get('SELECT COUNT(*) as count FROM trains', (err, row) => {
        if (row && row.count === 0) {
          const today = new Date().toISOString().split('T')[0];
          const sampleTrains = [
            { id: '1', name: 'Rajdhani Express', from_station: 'Delhi', to_station: 'Mumbai', departure_time: '22:00', arrival_time: '08:00', duration: '10h', journey_date: today, available_seats: 45, total_seats: 100, price_per_seat: 2500, days_running: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun' },
            { id: '2', name: 'Shatabdi Express', from_station: 'Delhi', to_station: 'Agra', departure_time: '06:30', arrival_time: '10:30', duration: '4h', journey_date: today, available_seats: 78, total_seats: 100, price_per_seat: 850, days_running: 'Mon,Tue,Wed,Thu,Fri' },
            { id: '3', name: 'Intercity Express', from_station: 'Mumbai', to_station: 'Pune', departure_time: '14:00', arrival_time: '18:15', duration: '4h 15m', journey_date: today, available_seats: 120, total_seats: 150, price_per_seat: 450, days_running: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun' },
            { id: '4', name: 'Express Train', from_station: 'Delhi', to_station: 'Bangalore', departure_time: '20:30', arrival_time: '12:00', duration: '15h 30m', journey_date: today, available_seats: 92, total_seats: 150, price_per_seat: 3500, days_running: 'Tue,Wed,Thu,Fri,Sat' },
            { id: '5', name: 'Fast Track Train', from_station: 'Bangalore', to_station: 'Chennai', departure_time: '11:00', arrival_time: '17:30', duration: '6h 30m', journey_date: today, available_seats: 85, total_seats: 120, price_per_seat: 1200, days_running: 'Mon,Tue,Wed,Thu,Fri,Sat' }
          ];

          const stmt = db.prepare(`
            INSERT INTO trains (id, name, from_station, to_station, departure_time, arrival_time, duration, journey_date, available_seats, total_seats, price_per_seat, days_running)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          sampleTrains.forEach(train => {
            stmt.run(train.id, train.name, train.from_station, train.to_station, train.departure_time, train.arrival_time, train.duration, train.journey_date, train.available_seats, train.total_seats, train.price_per_seat, train.days_running);
          });

          stmt.finalize((err) => {
            if (err) {
              console.error('Error inserting sample trains:', err);
              reject(err);
            } else {
              console.log('Sample trains inserted into database');
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  });
};

export default db;
