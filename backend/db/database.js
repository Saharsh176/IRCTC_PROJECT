import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'irctc.db');

// Initialize database with a 5000ms busy timeout
const db = new Database(dbPath, { timeout: 5000 });
console.log('Connected to SQLite database at:', dbPath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

export const initializeDatabase = async () => {
  db.exec(`
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
  `);

  db.exec(`
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
  `);

  try { db.exec('ALTER TABLE trains ADD COLUMN journey_date TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE bookings ADD COLUMN travel_date TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE trains ADD COLUMN days_running TEXT'); } catch (e) {}

  const countRow = db.prepare('SELECT COUNT(*) as count FROM trains').get();
  
  if (countRow.count === 0) {
    const sampleTrains = [
      { id: '1', name: 'Rajdhani Express', from_station: 'Delhi', to_station: 'Mumbai', departure_time: '22:00', arrival_time: '08:00', duration: '10h', available_seats: 45, total_seats: 100, price_per_seat: 2500, days_running: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun' },
      { id: '2', name: 'Shatabdi Express', from_station: 'Delhi', to_station: 'Agra', departure_time: '06:30', arrival_time: '10:30', duration: '4h', available_seats: 78, total_seats: 100, price_per_seat: 850, days_running: 'Mon,Tue,Wed,Thu,Fri' },
      { id: '3', name: 'Intercity Express', from_station: 'Mumbai', to_station: 'Pune', departure_time: '14:00', arrival_time: '18:15', duration: '4h 15m', available_seats: 120, total_seats: 150, price_per_seat: 450, days_running: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun' },
      { id: '4', name: 'Express Train', from_station: 'Delhi', to_station: 'Bangalore', departure_time: '20:30', arrival_time: '12:00', duration: '15h 30m', available_seats: 92, total_seats: 150, price_per_seat: 3500, days_running: 'Tue,Wed,Thu,Fri,Sat' },
      { id: '5', name: 'Fast Track Train', from_station: 'Bangalore', to_station: 'Chennai', departure_time: '11:00', arrival_time: '17:30', duration: '6h 30m', available_seats: 85, total_seats: 120, price_per_seat: 1200, days_running: 'Mon,Tue,Wed,Thu,Fri,Sat' }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO trains (id, name, from_station, to_station, departure_time, arrival_time, duration, journey_date, available_seats, total_seats, price_per_seat, days_running)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((trains) => {
      for (const train of trains) {
        insertStmt.run(train.id, train.name, train.from_station, train.to_station, train.departure_time, train.arrival_time, train.duration, '', train.available_seats, train.total_seats, train.price_per_seat, train.days_running);
      }
    });

    insertMany(sampleTrains);
    console.log('Sample trains inserted into database');
  }
};

export default db;