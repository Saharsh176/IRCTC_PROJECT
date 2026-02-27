# IRCTC Clone - Train Booking Web Application

A full-stack, modern web application for searching and booking train tickets. This project demonstrates complete CRUD operations with a responsive React frontend, Express.js backend, and SQLite database.

## 🎯 Features

### Frontend Features
- **Search Trains**: Filter trains by source and destination stations
- **Browse Available Trains**: View detailed train information with real-time seat availability
- **Book Tickets**: Reserve seats with passenger count selection
- **Manage Bookings**: View all bookings with booking IDs and fare details
- **Cancel Bookings**: Remove reservations with automatic seat restoration
- **Error Handling**: User-friendly error messages and loading states
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Backend Features
- **RESTful API**: Complete CRUD endpoints for trains and bookings
- **SQLite Database**: Persistent data storage with automatic initialization
- **Real-time Updates**: Seat availability updates immediately on booking/cancellation
- **Data Validation**: Input validation and error handling
- **CORS Support**: Secure cross-origin requests from frontend
- **Health Checks**: API health endpoint for monitoring

## 📊 Project Structure

```
IRCTC_Clone/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── TrainSearch.tsx
│   │   │   ├── TrainList.tsx
│   │   │   └── BookingList.tsx
│   │   ├── api/
│   │   │   └── client.ts    # API client functions
│   │   ├── styles/          # CSS files
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                  # Express.js REST API
│   ├── server.js            # Express app setup
│   ├── db/
│   │   └── database.js      # SQLite database & initialization
│   ├── routes/
│   │   ├── trains.js        # Train endpoints
│   │   └── bookings.js      # Booking endpoints
│   ├── middleware/
│   │   └── errorHandler.js  # Error handling
│   ├── package.json
│   └── README.md            # Backend documentation
│
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- Modern web browser

### Installation & Setup

1. **Clone/Open the project**
   ```bash
   cd /Users/harshul/IRCTC_Clone
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:3001
   ```

5. **Start Frontend Development Server** (Terminal 2)
   ```bash
   npm run dev
   # App opens at http://localhost:5173
   ```

The application uses these ports:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`

## 💻 Technology Stack

### Frontend
- **React 18.3** - UI framework with TypeScript
- **Vite** - Fast build tool and dev server
- **CSS3** - Responsive design with Grid and Flexbox

### Backend
- **Express.js 4.18** - REST API framework
- **SQLite 5.1** - Lightweight SQL database
- **Node.js** - JavaScript runtime
- **CORS** - Cross-Origin Resource Sharing

## 📝 CRUD Operations

The application fully implements all CRUD operations:

### **CREATE**
- Book new train tickets via `/api/bookings` POST endpoint
- Create admin trains via `/api/trains` POST endpoint
- Data is saved to SQLite database

### **READ (Retrieve)**
- Fetch all trains with filters: `GET /api/trains?from=Delhi&to=Mumbai`
- Get single train details: `GET /api/trains/:id`
- Fetch all bookings: `GET /api/bookings`
- View single booking: `GET /api/bookings/:id`

### **UPDATE**
- Modify train details: `PUT /api/trains/:id`
- Automatic seat count updates when:
  - Passenger books → seats decrease
  - Booking cancelled → seats restored
- Real-time updates reflected in database

### **DELETE**
- Cancel bookings: `DELETE /api/bookings/:id`
- Delete trains: `DELETE /api/trains/:id`
- Associated seat counts automatically adjusted

## 🗄️ Database

### SQLite Tables

**Trains Table:**
- id, name, from_station, to_station
- departure_time, arrival_time, duration
- available_seats, total_seats, price_per_seat
- created_at timestamp

**Bookings Table:**
- id, train_id, train_name
- from_station, to_station, num_passengers
- total_price, booking_date
- created_at timestamp

### Sample Data
The database is automatically initialized with 5 sample trains:
1. Rajdhani Express (Delhi → Mumbai) - ₹2,500
2. Shatabdi Express (Delhi → Agra) - ₹850
3. Intercity Express (Mumbai → Pune) - ₹450
4. Express Train (Delhi → Bangalore) - ₹3,500
5. Fast Track Train (Bangalore → Chennai) - ₹1,200

## 🔌 API Endpoints Reference

### Trains
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trains` | Get all trains (with optional filters) |
| GET | `/api/trains/:id` | Get single train |
| POST | `/api/trains` | Create new train |
| PUT | `/api/trains/:id` | Update train details |
| DELETE | `/api/trains/:id` | Delete train |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get single booking |
| POST | `/api/bookings` | Create new booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

For detailed API documentation, see [backend/README.md](backend/README.md)

## 🎨 User Interface

### Header Navigation
- Application title with icon
- Switch between "Search Trains" and "My Bookings" views
- Display total number of bookings
- Refresh button to sync with server

### Search Page
- Station selection dropdowns
- Optional journey date picker
- Search button with validation
- Dynamic train results

### Train Listing
- Expandable train cards
- Display departure, arrival, duration, price
- Available seat count
- Passenger count selector
- Book Now button with validation

### Bookings Page
- Summary statistics (total bookings, total amount spent)
- Individual booking cards with details
- Cancel button for each booking
- Empty state when no bookings exist

## 🔄 How Booking Works

1. **User searches trains** → API filters and returns matching trains
2. **User selects train** → Card expands to show booking options
3. **User enters passenger count** → Price calculated dynamically
4. **User clicks Book** → Request sent to backend
5. **Backend processes** → Validates seats, creates booking, updates seats
6. **Database updated** → Booking saved, available_seats decreased
7. **UI refreshes** → Bookings list updated, train availability refreshed
8. **User cancels** → DELETE request to `/api/bookings/:id`
9. **Backend cancels** → Deletes booking, restores seats
10. **Database updated** → available_seats increased

## 🚦 Running Examples

### Test API with curl

```bash
# Get all trains
curl http://localhost:3001/api/trains

# Get trains filtered
curl "http://localhost:3001/api/trains?from=Delhi&to=Mumbai"

# Create a booking
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"trainId":"1","passengers":2}'

# Get all bookings
curl http://localhost:3001/api/bookings

# Cancel a booking
curl -X DELETE http://localhost:3001/api/bookings/BOOKING_ID
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Desktop** (1024px+): Full grid layout with side-by-side elements
- **Tablet** (768px-1024px): Adjusted grid, optimized spacing
- **Mobile** (below 768px): Single column layout, touch-friendly buttons

## ⚙️ Build & Deployment

### Development
```bash
npm run dev         # Frontend dev server with hot reload
cd backend && npm run dev  # Backend with file watching
```

### Production Build
```bash
npm run build       # Creates optimized dist/ folder
npm run preview     # Preview production build locally
```

### Build Output
- Frontend: Optimized JavaScript and CSS in `dist/`
- Backend: Ready to deploy as Node.js application

## 🐛 Troubleshooting

### Frontend can't reach backend
- Check backend is running on `http://localhost:3001`
- Verify API URL in `src/api/client.ts`
- Check browser console for CORS errors

### Port already in use
```bash
# Kill process on specific port
lsof -i :5173  # Frontend
lsof -i :3001  # Backend
```

### Database issues
```bash
# Delete and recreate database
rm backend/db/irctc.db
cd backend && npm start
```

## 🔐 Security Notes

- No authentication required (as specified)
- CORS enabled for all origins (development only)
- Input validation on backend
- SQL prepared statements to prevent injection
- For production: 
  - Add authentication/authorization
  - Restrict CORS origins
  - Use environment variables for config
  - Add rate limiting

## 🚀 Future Enhancements

- User authentication and profiles
- Payment gateway integration
- Email/SMS notifications
- Advanced seat selection interface
- Multiple train classes (AC, Non-AC, Sleeper)
- Dynamic pricing based on demand
- Admin dashboard for train management
- Booking history and analytics
- API documentation (Swagger/OpenAPI)
- Unit and integration tests
- Performance optimization with caching
- Mobile app (React Native)

## 📞 Support & Documentation

- **Frontend**: See component source code in `src/components/`
- **Backend**: See [backend/README.md](backend/README.md)
- **Database**: SQLite file at `backend/db/irctc.db`
- **API Testing**: Use curl, Postman, or browser DevTools

## 📄 License

This project is open source and available for educational purposes.

---

**Happy Train Booking! 🚂**

Built with ❤️ using React, Express, and SQLite
