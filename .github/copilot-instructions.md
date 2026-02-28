<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Rail Connect - Full Stack Application (Complete)

### 🎯 Project Status: PRODUCTION READY

A complete full-stack train booking web application with React frontend, Express.js backend, and SQLite database.

### ✅ Architecture

**Frontend (React + TypeScript)**
- Location: `/src`
- Components: TrainSearch, TrainList, BookingList
- API Client: TypeScript fetch-based client
- Styling: Responsive CSS with Grid/Flexbox
- State Management: React Hooks (useState, useEffect)
- Port: 5173

**Backend (Express.js)**
- Location: `/backend`
- API Framework: Express.js with CORS
- Database: SQLite3 with automatic initialization
- RESTful Endpoints: Trains & Bookings CRUD
- Error Handling: Comprehensive middleware
- Port: 3001

**Database (SQLite)**
- File: `/backend/db/irctc.db`
- Tables: trains, bookings
- Relationships: Foreign key constraints
- Sample Data: 5 pre-loaded trains

### 📊 CRUD Operations Fully Implemented

| Operation | Endpoint | Status |
|-----------|----------|--------|
| **Create** | POST /api/trains, /api/bookings | ✅ Complete |
| **Read** | GET /api/trains, /api/bookings | ✅ Complete |
| **Update** | PUT /api/trains | ✅ Complete |
| **Delete** | DELETE /api/bookings, /api/trains | ✅ Complete |

### 🚀 Quick Start

```bash
# Terminal 1: Start Backend
cd /Users/harshul/Rail_Connect/backend
npm start

# Terminal 2: Start Frontend
cd /Users/harshul/Rail_Connect
npm run dev

# Open http://localhost:5173
```

### 📁 Key Files

**Frontend:**
- `src/App.tsx` - Main component with API integration
- `src/api/client.ts` - API client functions
- `src/components/*.tsx` - React components
- `src/styles/*.css` - Responsive styling

**Backend:**
- `backend/server.js` - Express server setup
- `backend/db/database.js` - SQLite setup
- `backend/routes/trains.js` - Train endpoints
- `backend/routes/bookings.js` - Booking endpoints
- `backend/middleware/errorHandler.js` - Error handling

### 🔌 API Endpoints

```
GET    /api/trains              - Get all trains (with filters)
GET    /api/trains/:id          - Get single train
POST   /api/trains              - Create train
PUT    /api/trains/:id          - Update train
DELETE /api/trains/:id          - Delete train

GET    /api/bookings            - Get all bookings
GET    /api/bookings/:id        - Get single booking
POST   /api/bookings            - Create booking (seat update automatic)
DELETE /api/bookings/:id        - Cancel booking (seat restoration automatic)

GET    /api/health              - Server health check
```

### 💾 Database Schema

**Trains Table:**
- id, name, from_station, to_station
- departure_time, arrival_time, duration
- available_seats, total_seats, price_per_seat

**Bookings Table:**
- id, train_id (FK), train_name
- from_station, to_station, num_passengers
- total_price, booking_date

### 🔄 Key Feature: Automatic Seat Management

When booking:
1. Validate seats available
2. Create booking in database
3. Automatically decrease available_seats
4. Return booking confirmation

When cancelling:
1. Find booking record
2. Get train reference
3. Automatically restore seats
4. Delete booking record

### 📄 Documentation

- **README.md** - Comprehensive project documentation
- **backend/README.md** - Backend API documentation
- **QUICKSTART.md** - Quick start guide with examples
- **start-servers.sh** - Automated startup script

### 🎨 UI Features

- Responsive search interface
- Expandable train cards
- Real-time seat availability
- Booking management dashboard
- Error handling with loading states
- Mobile-optimized layout

### 📦 Dependencies

**Frontend:**
- react@18.3.1
- react-dom@18.3.1
- vite@5.0.8
- typescript@5.2.2

**Backend:**
- express@4.18.2
- sqlite3@5.1.6
- cors@2.8.5
- body-parser@1.20.2

### 🔧 Development Notes

- Both servers run simultaneously on ports 5173 (frontend) and 3001 (backend)
- API URL hardcoded in `src/api/client.ts` to localhost:3001
- Database auto-initializes with sample trains on first run
- All data persists in SQLite file
- CORS enabled for development (restrict in production)

### 🚀 Deployment Ready

- Build: `npm run build` creates `/dist` folder
- Backend: Production-ready Node.js application
- Database: Portable SQLite file
- No external service dependencies

### 📋 Testing Checklist

✅ Search trains by station
✅ Book trains with seat validation
✅ Cancel bookings with seat restoration
✅ Real-time database updates
✅ Error handling and validation
✅ Responsive design on all devices
✅ API endpoints functioning correctly
✅ Database persistence working

### 🔐 Security Considerations

- Input validation on all endpoints
- SQL prepared statements (SQLite)
- CORS configured (enable for specific domains in production)
- No sensitive data in frontend code
- Error messages sanitized

### 🎓 Educational Value

This project demonstrates:
- Full-stack JavaScript/TypeScript development
- State management with React Hooks
- RESTful API design with Express.js
- Database design and CRUD operations
- Real-time data synchronization
- Error handling and validation
- Responsive web design
- Frontend-backend integration

### 📞 Support Resources

- Use QUICKSTART.md for step-by-step guide
- Check backend/README.md for API details
- Test with curl commands provided in docs
- Browser DevTools Console to debug
- Check server logs in terminal

