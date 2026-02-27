import { useState, useEffect } from 'react'
import TrainSearch from './components/TrainSearch'
import TrainList from './components/TrainList'
import BookingList from './components/BookingList'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import { getTrains, getBookings, createBooking, deleteBooking, createTrain, updateTrain, deleteTrain } from './api/client'
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
  totalSeats?: number
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

function App() {
  const [trains, setTrains] = useState<Train[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentPage, setCurrentPage] = useState<'search' | 'bookings' | 'admin'>('search')
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [selectedSearchDate, setSelectedSearchDate] = useState<string>('')

  // Fetch trains and bookings on mount
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [trainsData, bookingsData] = await Promise.all([
        getTrains(),
        getBookings()
      ])
      setTrains(trainsData)
      setFilteredTrains(trainsData)
      setBookings(bookingsData)
    } catch (err) {
      setError('Failed to load data. Make sure the backend server is running on port 5000.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (filters: { from: string; to: string; date: string }) => {
    try {
      setLoading(true)
      setSelectedSearchDate(filters.date)
      // Get all trains matching stations
      const allTrains = await getTrains({ from: filters.from, to: filters.to })
      
      // Filter by day of week if date is provided
      let filtered = allTrains
      if (filters.date) {
        const dayOfWeekName = new Date(filters.date).toLocaleDateString('en-US', { weekday: 'short' })
        filtered = allTrains.filter(train => {
          if (!train.daysRunning) return true
          return train.daysRunning.includes(dayOfWeekName)
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
    try {
      const train = trains.find(t => t.id === trainId)
      if (!train) return

      if (train.seats < passengers) {
        alert('Not enough seats available!')
        return
      }

      // ensure travelDate not in past (should normally be enforced by search)
      const today = new Date()
      const chosen = new Date(travelDate)
      chosen.setHours(0,0,0,0)
      today.setHours(0,0,0,0)
      if (chosen < today) {
        alert('Cannot book for a past date')
        return
      }

      const booking = await createBooking({ trainId, passengers, travelDate })
      
      // Add booking to list
      setBookings([...bookings, booking])
      
      // Update train seats
      const updatedTrain = { ...train, seats: train.seats - passengers }
      setTrains(trains.map(t => t.id === trainId ? updatedTrain : t))
      setFilteredTrains(filteredTrains.map(t => t.id === trainId ? updatedTrain : t))

      alert(`Booking confirmed! Booking ID: ${booking.id}`)
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

      // Remove booking from list
      setBookings(bookings.filter(b => b.id !== bookingId))

      // Restore train seats
      const updatedTrain = trains.find(t => t.id === booking.trainId)
      if (updatedTrain) {
        const restoredTrain = { ...updatedTrain, seats: updatedTrain.seats + booking.passengers }
        setTrains(trains.map(t => t.id === booking.trainId ? restoredTrain : t))
        setFilteredTrains(filteredTrains.map(t => t.id === booking.trainId ? restoredTrain : t))
      }

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
      console.error(err)
    }
  }

  const handleUpdateTrain = async (id: string, trainData: any) => {
    try {
      await updateTrain(id, trainData)
      await fetchInitialData()
      alert('Train updated successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to update train')
      console.error(err)
    }
  }

  const handleDeleteTrain = async (id: string) => {
    try {
      await deleteTrain(id)
      await fetchInitialData()
      alert('Train deleted successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to delete train')
      console.error(err)
    }
  }

  const handleAdminLogin = (authenticated: boolean) => {
    if (authenticated) {
      setAdminAuthenticated(true)
      setShowAdminLogin(false)
      setCurrentPage('admin')
    }
  }

  const handleAdminLogout = () => {
    setAdminAuthenticated(false)
    setCurrentPage('search')
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
        <h1>🚂 IRCTC Clone - Train Booking System</h1>
        <nav className="nav">
          <button 
            className={`nav-btn ${currentPage === 'search' ? 'active' : ''}`}
            onClick={() => setCurrentPage('search')}
          >
            Search Trains
          </button>
          <button 
            className={`nav-btn ${currentPage === 'bookings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('bookings')}
          >
            My Bookings ({bookings.length})
          </button>
          <button 
            className="nav-btn refresh-btn"
            onClick={fetchInitialData}
            title="Refresh data from server"
          >
            🔄 Refresh
          </button>
          {!adminAuthenticated ? (
            <button 
              className="nav-btn admin-btn"
              onClick={() => setShowAdminLogin(true)}
              title="Admin Panel"
            >
              🔐 Admin
            </button>
          ) : (
            <button 
              className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentPage('admin')}
            >
              ⚙️ Manage Trains
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
            <p>Loading trains...</p>
          </div>
        ) : currentPage === 'search' ? (
          <>
            <TrainSearch onSearch={handleSearch} />
            <TrainList trains={filteredTrains} onBook={handleBooking} selectedDate={selectedSearchDate} />
          </>
        ) : currentPage === 'bookings' ? (
          <BookingList bookings={bookings} onCancel={handleCancelBooking} />
        ) : adminAuthenticated ? (
          <AdminDashboard 
            trains={trains}
            onAddTrain={handleAddTrain}
            onUpdateTrain={handleUpdateTrain}
            onDeleteTrain={handleDeleteTrain}
            onLogout={handleAdminLogout}
          />
        ) : null}
      </main>

      <footer className="footer">
        <p>&copy; 2024 IRCTC Clone - Powered by React + Express + SQLite</p>
      </footer>
    </div>
  )
}

export default App
