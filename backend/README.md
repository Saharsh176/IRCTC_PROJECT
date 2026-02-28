# Rail Connect - Backend API Documentation

## Overview
Express.js backend with SQLite database for the Rail Connect train booking application. Handles all CRUD operations for trains and bookings with real-time seat availability management.

## Architecture

```
Backend Structure:
├── server.js              # Express app & server initialization
├── db/
│   └── database.js       # SQLite database setup & initialization
├── routes/
│   ├── trains.js         # Train CRUD endpoints
│   └── bookings.js       # Booking CRUD endpoints
├── middleware/
│   └── errorHandler.js   # Error handling & middleware
└── package.json          # Dependencies
```

## Technology Stack

- **Framework**: Express.js v4.18.2
- **Database**: SQLite v5.1.6
- **Server Runtime**: Node.js (v16+)
- **Port**: 3001

## Installation

```bash
cd /Users/harshul/Rail_Connect/backend
npm install
```

## Running the Server

### Development Mode
```bash
npm run dev    # Uses --watch flag for auto-restart on file changes
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Trains API

#### 1. Get All Trains
```
GET /api/trains
```

**Query Parameters:**
- `from` (optional): Filter by source station
- `to` (optional): Filter by destination station

**Example:**
```bash
curl http://localhost:3001/api/trains?from=Delhi&to=Mumbai
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Rajdhani Express",
      "from": "Delhi",
      "to": "Mumbai",
      "departure": "22:00",
      "arrival": "08:00",
      "duration": "10h",
      "seats": 45,
      "totalSeats": 100,
      "price": 2500
    }
  ]
}
```

#### 2. Get Single Train
```
GET /api/trains/:id
```

**Example:**
```bash
curl http://localhost:3001/api/trains/1
```

#### 3. Create Train (Admin)
```
POST /api/trains
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Express Train",
  "from": "Delhi",
  "to": "Bangalore",
  "departure": "20:30",
  "arrival": "12:00",
  "duration": "15h 30m",
  "seats": 150,
  "price": 3500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Train created successfully",
  "data": { "id": "123456" }
}
```

#### 4. Update Train (Admin)
```
PUT /api/trains/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "seats": 80,
  "price": 3000
}
```

#### 5. Delete Train (Admin)
```
DELETE /api/trains/:id
```

---

### Bookings API

#### 1. Get All Bookings
```
GET /api/bookings
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890",
      "trainId": "1",
      "trainName": "Rajdhani Express",
      "passengers": 2,
      "totalPrice": 5000,
      "bookingDate": "2/27/2026",
      "from": "Delhi",
      "to": "Mumbai"
    }
  ]
}
```

#### 2. Get Single Booking
```
GET /api/bookings/:id
```

#### 3. Create Booking
```
POST /api/bookings
Content-Type: application/json
```

**Request Body:**
```json
{
  "trainId": "1",
  "passengers": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "1234567890",
    "trainId": "1",
    "trainName": "Rajdhani Express",
    "passengers": 2,
    "totalPrice": 5000,
    "bookingDate": "2/27/2026",
    "from": "Delhi",
    "to": "Mumbai"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Only 45 seats available"
}
```

#### 4. Cancel Booking (Delete)
```
DELETE /api/bookings/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "restoredSeats": 48
  }
}
```

---

## Database Schema

### Trains Table
```sql
CREATE TABLE trains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  duration TEXT NOT NULL,
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  price_per_seat REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  train_id TEXT NOT NULL,
  train_name TEXT NOT NULL,
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  num_passengers INTEGER NOT NULL,
  total_price REAL NOT NULL,
  booking_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (train_id) REFERENCES trains(id)
)
```

## Sample Data

The database is pre-populated with 5 sample trains on first initialization:

1. **Rajdhani Express** - Delhi → Mumbai (₹2,500/person)
2. **Shatabdi Express** - Delhi → Agra (₹850/person)
3. **Intercity Express** - Mumbai → Pune (₹450/person)
4. **Express Train** - Delhi → Bangalore (₹3,500/person)
5. **Fast Track Train** - Bangalore → Chennai (₹1,200/person)

## CRUD Operations Example

### Create a Booking
```bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"trainId": "1", "passengers": 3}'
```

This will:
1. Validate the train exists
2. Check seat availability
3. Create a booking record
4. Automatically update available seats in the train table

### Cancel a Booking
```bash
curl -X DELETE http://localhost:3001/api/bookings/1234567890
```

This will:
1. Find the booking
2. Get the associated train
3. Restore the seats to available count
4. Delete the booking record

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Invalid data
- `404` - Not found
- `500` - Server error

## Database File

SQLite database is stored at:
```
/Users/harshul/Rail_Connect/backend/db/irctc.db
```

The database file is created automatically on first run.

## CORS Configuration

The backend includes CORS middleware to allow requests from the frontend:

```javascript
app.use(cors());
```

This allows requests from any origin. For production, configure to specific domains:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Payment processing integration
- [ ] Email notifications for bookings
- [ ] Advanced seat selection
- [ ] Seat class categorization (AC, Non-AC, Sleeper)
- [ ] Dynamic pricing based on demand
- [ ] Cancellation refund policies
- [ ] Admin dashboard
- [ ] Rate limiting
- [ ] Database migration system
- [ ] API documentation with Swagger/OpenAPI
- [ ] Unit and integration tests
- [ ] Database indexing for performance
- [ ] Caching with Redis

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -i :3001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

### Database Issues
Delete the database file and restart the server to recreate it:
```bash
rm /Users/harshul/Rail_Connect/backend/db/irctc.db
npm start
```

### Connection Errors
Ensure the frontend is pointing to the correct backend URL. Check `src/api/client.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

## Development Tips

- Use `npm run dev` for development with auto-reload
- Test API endpoints with curl or Postman
- Check database with SQLite clients like DB Browser
- Monitor logs in the terminal

## License

This project is open source and available for educational purposes.
