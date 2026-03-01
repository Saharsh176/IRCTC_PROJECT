import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import TrainSearch from './components/TrainSearch'
import TrainList from './components/TrainList'
import BookingList from './components/BookingList'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import Login from './components/Login' // <-- Imported Login
import { getTrains, getBookings, createBooking, deleteBooking, createTrain, updateTrain, deleteTrain } from './api/client'
import { useTheme } from './context/ThemeContext' 
import { AuthProvider, useAuth } from './context/AuthContext' // <-- Imported Auth context
import './styles/App.css'

interface Train {
  id: string
  name: string
  from: string
  to: string
  departure: string
  arrival: string
  duration: string
  date: string
  seats: number
  totalSeats: number
  price: number
  daysRunning?: string
}

interface Booking {
  id: string
  trainId: string
  trainName: string
  passengers: number
  totalPrice: number
  bookingDate: string
  travelDate?: string
  from: string
  to: string
}

// <-- Protected Route Component to block unauthenticated users -->
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const currentYear = new Date().getFullYear();
// <-- Moved Main Logic into AppContent so it can use routing hooks -->
function AppContent() {
  const [trains, setTrains] = useState<Train[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [selectedSearchDate, setSelectedSearchDate] = useState<string>('')

  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth() // Get current logged-in user
  const navigate = useNavigate() // Used instead of 'currentPage' state

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [trainsData, bookingsData] = await Promise.all([
        getTrains(),
        // Only fetch bookings if user is logged in (handled by client.ts interceptor)
        user ? getBookings().catch(() => []) : Promise.resolve([]) 
      ])
      setTrains(trainsData)
      setFilteredTrains(trainsData)
      setBookings(bookingsData)
    } catch (err) {
      setError('Failed to load data. Make sure the backend server is running on port 3001.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Refetch bookings when a user logs in
  useEffect(() => {
    if (user) {
      fetchInitialData()
    } else {
      setBookings([]) // Clear bookings if logged out
    }
  }, [user])

  const handleSearch = async (filters: { from: string; to: string; date: string }) => {
    try {
      setLoading(true)
      setSelectedSearchDate(filters.date)
      const allTrains = await getTrains({ from: filters.from, to: filters.to })
      
      let filtered = allTrains
      if (filters.date) {
        const [year, month, day] = filters.date.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day)
        const dayIndex = dateObj.getDay()
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dayOfWeekName = daysOfWeek[dayIndex]
        
        filtered = allTrains.filter((train: Train) => {
          if (!train.daysRunning) return true
          return train.daysRunning.includes(dayOfWeekName)
        })
        
        filtered = filtered.map(train => {
          const bookingsForThisDate = bookings.filter(b => b.trainId === train.id && b.travelDate === filters.date)
          const bookedSeats = bookingsForThisDate.reduce((sum, b) => sum + b.passengers, 0)
          const availableSeats = train.totalSeats - bookedSeats
          return { ...train, seats: availableSeats }
        })
      }
      setFilteredTrains(filtered)
    } catch (err) {
      setError('Failed to search trains')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (trainId: string, passengers: number, travelDate: string) => {
    if (!user) {
      alert("Please login to book a ticket!")
      navigate('/login')
      return
    }

    try {
      const train = trains.find(t => t.id === trainId)
      if (!train) return

      const bookingsForThisDate = bookings.filter(b => b.trainId === trainId && b.travelDate === travelDate)
      const bookedSeats = bookingsForThisDate.reduce((sum, b) => sum + b.passengers, 0)
      const availableSeats = train.totalSeats - bookedSeats

      if (availableSeats < passengers) {
        alert('Not enough seats available!')
        return
      }

      const todayString = new Date().toISOString().split('T')[0]
      if (travelDate < todayString) {
        alert('Cannot book for a past date')
        return
      }

      const booking = await createBooking({ trainId, passengers, travelDate })
      setBookings([...bookings, booking])
      
      const updatedFilteredTrains = filteredTrains.map(t => {
        if (t.id === trainId) {
          const bookingsForTrain = [...bookings, booking].filter(b => b.trainId === trainId && b.travelDate === travelDate)
          const booked = bookingsForTrain.reduce((sum, b) => sum + b.passengers, 0)
          return { ...t, seats: t.totalSeats - booked }
        }
        return t
      })
      setFilteredTrains(updatedFilteredTrains)

      alert(`Booking confirmed! Booking ID: ${booking.id}`)
      navigate('/bookings') // Auto-redirect to bookings page
    } catch (err: any) {
      alert(err.message || 'Failed to create booking')
      console.error(err)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) return

      await deleteBooking(bookingId)

      const updatedBookings = bookings.filter(b => b.id !== bookingId)
      setBookings(updatedBookings)

      const updatedFilteredTrains = filteredTrains.map(t => {
        if (t.id === booking.trainId) {
          const bookingsForTrain = updatedBookings.filter(b => b.trainId === booking.trainId && b.travelDate === booking.travelDate)
          const booked = bookingsForTrain.reduce((sum, b) => sum + b.passengers, 0)
          return { ...t, seats: t.totalSeats - booked }
        }
        return t
      })
      setFilteredTrains(updatedFilteredTrains)

      alert('Booking cancelled successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking')
      console.error(err)
    }
  }

  const handleAddTrain = async (trainData: any) => {
    try {
      await createTrain(trainData)
      await fetchInitialData()
      alert('Train added successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to add train')
    }
  }

  const handleUpdateTrain = async (id: string, trainData: any) => {
    try {
      await updateTrain(id, trainData)
      await fetchInitialData()
      alert('Train updated successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to update train')
    }
  }

  const handleDeleteTrain = async (id: string) => {
    try {
      await deleteTrain(id)
      await fetchInitialData()
      alert('Train deleted successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to delete train')
    }
  }

  const handleAdminLogin = (authenticated: boolean) => {
    if (authenticated) {
      setAdminAuthenticated(true)
      setShowAdminLogin(false)
      navigate('/admin')
    }
  }

  const handleAdminLogout = () => {
    setAdminAuthenticated(false)
    navigate('/')
  }

  return (
    <div className="app">
      {showAdminLogin && !adminAuthenticated && (
        <AdminLogin 
          onLogin={handleAdminLogin}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}

      <header className="header">
        <h1>Rail Connect - Train Booking System</h1>
        <nav className="nav">
          <button className="nav-btn" onClick={() => navigate('/')}>
            Search Trains
          </button>
          
          {user ? (
            <>
              <button className="nav-btn" onClick={() => navigate('/bookings')}>
                My Bookings ({bookings.length})
              </button>
              <button className="nav-btn logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                Logout ({user.username})
              </button>
            </>
          ) : (
            <button className="nav-btn" onClick={() => navigate('/login')}>
              Login / Register
            </button>
          )}

          <button className="nav-btn refresh-btn" onClick={fetchInitialData} title="Refresh data from server">
            Refresh
          </button>
          
          <button className="nav-btn theme-toggle-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle Theme">
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {!adminAuthenticated ? (
            <button className="nav-btn admin-btn" onClick={() => setShowAdminLogin(true)} title="Admin Panel">
              Admin
            </button>
          ) : (
            <button className="nav-btn" onClick={() => navigate('/admin')}>
              Manage Trains
            </button>
          )}
        </nav>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
            <button onClick={fetchInitialData}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <p>Loading...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <>
                <TrainSearch onSearch={handleSearch} />
                <TrainList trains={filteredTrains} onBook={handleBooking} selectedDate={selectedSearchDate} />
              </>
            } />
            <Route path="/login" element={<Login />} />
            
            <Route path="/bookings" element={
              <ProtectedRoute>
                <BookingList bookings={bookings} onCancel={handleCancelBooking} />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              adminAuthenticated ? (
                <AdminDashboard 
                  trains={trains}
                  onAddTrain={handleAddTrain}
                  onUpdateTrain={handleUpdateTrain}
                  onDeleteTrain={handleDeleteTrain}
                  onLogout={handleAdminLogout}
                />
              ) : <Navigate to="/" replace />
            } />
          </Routes>
        )}
      </main>

      <footer className="footer">
        <p>&copy; {currentYear} Rail Connect - Powered by React + Express + SQLite</p>
      </footer>
    </div>
  )
}

// <-- New Top Level Wrapper to initialize Auth and Routing Contexts -->
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App