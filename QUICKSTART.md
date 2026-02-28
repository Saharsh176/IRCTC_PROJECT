# Rail Connect - Quick Start Guide

## Starting the Application

### 1️⃣ Start Backend Server (Terminal 1)
```bash
cd /Users/harshul/Rail_Connect/backend
npm start
```

Expected output:
```
🚀 Server is running on http://localhost:3001
📚 API Documentation:
   GET  http://localhost:3001/api/trains
   POST http://localhost:3001/api/bookings
   ...
Connected to SQLite database
Database initialized
```

### 2️⃣ Start Frontend Server (Terminal 2)
```bash
cd /Users/harshul/Rail_Connect
npm run dev
```

Expected output:
```
  VITE v5.4.21  ready in 125 ms

  ➜  Local:   http://localhost:5173/
```

### 3️⃣ Open the Application
- Open your browser and go to: **http://localhost:5173**

---

## Using the Application

### 🔍 Searching for Trains

1. The app opens on the **Search Trains** page
2. **From**: Select your departure station (e.g., Delhi)
3. **To**: Select your destination (e.g., Mumbai)
4. **Journey Date**: (Optional) Select a date
5. Click **"Search Trains"** button
6. Available trains matching your criteria will appear below

### 🎫 Booking a Train

1. Find your desired train in the search results
2. Click on the train card to expand it
3. The expanded view shows:
   - Train details
   - Passenger count selector (default: 1)
   - Total price calculation
   - "Book Now" button
4. Enter the number of passengers you want to book for
5. Review the total price
6. Click **"Book Now"**
7. You'll get a confirmation with your **Booking ID**

### 📋 Managing Your Bookings

1. Click **"My Bookings"** tab in the header
2. View all your confirmed bookings
3. Each booking card shows:
   - Train name and route
   - Booking ID (for reference)
   - Number of passengers
   - Total price paid
   - Booking date
4. To cancel a booking:
   - Click the **"Cancel Booking"** button
   - Confirm the cancellation
   - Seats are automatically restored and become available

### 🔄 Refreshing Data

- Click the **"🔄 Refresh"** button in the header to sync with the latest database state
- Useful after cancellations or when another user makes changes

---

## Testing the Application

### Test Scenario 1: Book a Train

```
1. Search for trains: Delhi → Mumbai
2. Click on "Rajdhani Express"
3. Select 2 passengers
4. Total price shows: ₹5,000 (2 × ₹2,500)
5. Click "Book Now"
6. See booking confirmation with ID
7. Go to "My Bookings" to view it
```

### Test Scenario 2: Search & Filter

```
1. Click "Search Trains"
2. Select From: Bangalore, To: Chennai
3. Click "Search Trains"
4. Only "Fast Track Train" appears (matching route)
5. Other trains won't show
```

### Test Scenario 3: Seat Availability

```
1. Search Delhi → Agra trains
2. "Shatabdi Express" shows 78 seats available
3. Book 2 passengers
4. Available seats now show 76
5. Refresh page - still shows 76
6. Cancel the booking
7. Available seats back to 78
```

---

## API Testing

### Using curl to test the backend

```bash
# Get all trains
curl http://localhost:3001/api/trains

# Get trains with filters
curl "http://localhost:3001/api/trains?from=Delhi&to=Mumbai"

# Get a specific train
curl http://localhost:3001/api/trains/1

# Create a booking
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"trainId":"1","passengers":2}'

# Get all bookings
curl http://localhost:3001/api/bookings

# Cancel a booking (replace BOOKING_ID with actual ID)
curl -X DELETE "http://localhost:3001/api/bookings/BOOKING_ID"

# Check API health
curl http://localhost:3001/api/health
```

### Using Postman

1. Import the following requests into Postman:
   - **GET** `http://localhost:3001/api/trains`
   - **POST** `http://localhost:3001/api/bookings` (with JSON body)
   - **GET** `http://localhost:3001/api/bookings`
   - **DELETE** `http://localhost:3001/api/bookings/:id`

---

## Database Files

The database is stored at:
```
/Users/harshul/Rail_Connect/backend/db/irctc.db
```

To reset the database to initial state:
```bash
# Delete the database file
rm /Users/harshul/Rail_Connect/backend/db/irctc.db

# Restart the backend server
# A fresh database with sample trains will be created
```

---

## Troubleshooting

### ❌ "Backend server is running on port 5000" Error
- The API port might be in use. The backend now runs on **port 3001**
- Update `src/api/client.ts` if needed to point to correct URL

### ❌ Frontend can't connect to backend
- Ensure backend is running: `npm start` in the backend directory
- Check that backend shows "Server is running on http://localhost:3001"
- Verify frontend API URL is set to: `http://localhost:3001/api`

### ❌ Port already in use
```bash
# Kill all Node processes
killall node

# Or kill specific port
lsof -i :3001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

### ❌ Seats not updating
- Click the **"🔄 Refresh"** button to sync with server
- Check browser console for API errors (F12)
- Verify backend is still running

---

## Development Server Commands

### Frontend
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Create optimized production build
npm run preview  # Preview production build locally
```

### Backend
```bash
cd backend
npm start        # Start production server
npm run dev      # Start with auto-reload on file changes
```

---

## Sample Train Routes

| Train Name | From | To | Price | Duration |
|-----------|------|-----|-------|----------|
| Rajdhani Express | Delhi | Mumbai | ₹2,500 | 10h |
| Shatabdi Express | Delhi | Agra | ₹850 | 4h |
| Intercity Express | Mumbai | Pune | ₹450 | 4h 15m |
| Express Train | Delhi | Bangalore | ₹3,500 | 15h 30m |
| Fast Track Train | Bangalore | Chennai | ₹1,200 | 6h 30m |

---

## Important Notes

✅ **What's Implemented:**
- Full CRUD operations (Create, Read, Update, Delete)
- Real-time database updates for seat availability
- Secure booking flow with validation
- Responsive design for all devices
- Error handling and user feedback
- API documentation

⚠️ **Not Implemented (For Future):**
- User authentication/login
- Payment processing
- Email notifications
- Seat selection interface
- User profiles/history

---

## Getting Help

For detailed information:
- **Frontend**: See [README.md](README.md)
- **Backend**: See [backend/README.md](backend/README.md)
- **API Documentation**: Check backend/README.md for all endpoints

---

Happy Booking! 🚂✨
