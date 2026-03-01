import { useState } from 'react'
import TicketCounter from './TicketCounter'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '../styles/TrainList.css'
import '../styles/TrainSearch.css' // We import this to reuse your perfect theme styling

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
  price: number
  daysRunning?: string
}

interface TrainListProps {
  trains: Train[]
  onBook: (trainId: string, passengers: number, travelDate: string) => void
  selectedDate?: string
}

export default function TrainList({ trains, onBook, selectedDate }: TrainListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [passengers, setPassengers] = useState<{ [key: string]: number }>({})
  
  // State for the centered Modal Date Picker
  const [datePickerTrainId, setDatePickerTrainId] = useState<string | null>(null)
  const [manualDate, setManualDate] = useState<Date | null>(null)

  const handlePassengerChange = (trainId: string, count: number) => {
    setPassengers(prev => ({
      ...prev,
      [trainId]: count
    }))
  }

  const handleBook = (trainId: string) => {
    const count = passengers[trainId] || 1
    const train = trains.find(t => t.id === trainId)

    if (train && count > train.seats) {
      alert(`Only ${train.seats} seats available`)
      return
    }

    if (!selectedDate) {
      // Open the modal instead of booking immediately
      setDatePickerTrainId(trainId)
      return
    }

    onBook(trainId, count, selectedDate)
    setPassengers(prev => ({ ...prev, [trainId]: 1 }))
  }

  const confirmManualBooking = () => {
    if (!datePickerTrainId) return;
    
    if (!manualDate) {
      alert('Please select a date')
      return
    }

    const year = manualDate.getFullYear()
    const month = String(manualDate.getMonth() + 1).padStart(2, '0')
    const day = String(manualDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    const todayString = new Date().toISOString().split('T')[0]
    if (dateString < todayString) {
      alert('Cannot book for a past date')
      return
    }

    const count = passengers[datePickerTrainId] || 1
    onBook(datePickerTrainId, count, dateString)
    
    // Reset and close modal
    setDatePickerTrainId(null)
    setManualDate(null)
    setPassengers(prev => ({ ...prev, [datePickerTrainId]: 1 }))
  }

  const minDate = new Date()
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 90)

  if (trains.length === 0) {
    return (
      <div className="train-list">
        <div className="no-trains">
          <p>No trains found. Please modify your search criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="train-list" style={{ position: 'relative' }}>
      <h2>Available Trains</h2>
      {trains.map(train => (
        <div key={train.id} className="train-card">
          <div className="train-header" onClick={() => setExpandedId(expandedId === train.id ? null : train.id)}>
            <div className="train-info">
              <h3>{train.name}</h3>
              <p className="route">{train.from} → {train.to}</p>
              {selectedDate && <p className="journey-date">📅 {selectedDate}</p>}
              {train.daysRunning && (
                <p className="days-running">
                  <span className="days-label">Runs:</span> {train.daysRunning}
                </p>
              )}
            </div>
            <div className="train-times">
              <div>
                <p className="time">{train.departure}</p>
                <p className="station">{train.from}</p>
              </div>
              <div className="duration">
                <p>{train.duration}</p>
              </div>
              <div>
                <p className="time">{train.arrival}</p>
                <p className="station">{train.to}</p>
              </div>
            </div>
            <div className="train-price">
              <p className="price">₹{train.price}</p>
              <p className="seats-available">{train.seats > 0 ? '✓ Available' : 'Sold Out'}</p>
            </div>
            <button className="expand-btn">
              {expandedId === train.id ? '▲' : '▼'}
            </button>
          </div>

          {expandedId === train.id && (
            <div className="train-details">
              <div className="booking-section">
                <div className="passenger-selector">
                  <label>Number of Passengers:</label>
                  <TicketCounter 
                    value={passengers[train.id] || 1}
                    onChange={(val) => handlePassengerChange(train.id, val)}
                    min={1}
                    max={train.seats}
                  />
                </div>
                <div className="price-summary">
                  {selectedDate && <p className="booking-date">📅 Booking for: <strong>{selectedDate}</strong></p>}
                  <p>Total Price: <strong>₹{train.price * (passengers[train.id] || 1)}</strong></p>
                </div>
                
                <button 
                  className="book-btn"
                  onClick={() => handleBook(train.id)}
                  disabled={train.seats === 0}
                >
                  {train.seats === 0 ? 'Sold Out' : 'Book Now'}
                </button>
                
              </div>
              <div className="train-meta">
                <p><strong>Train ID:</strong> {train.id}</p>
                <p><strong>Available Seats:</strong> {train.seats}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Centered Date Selection Modal using proper App Theme variables */}
      {datePickerTrainId && (
        <div 
          onClick={() => { setDatePickerTrainId(null); setManualDate(null); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{
              backgroundColor: 'var(--card-bg)', // Automatically follows dark/light theme
              color: 'var(--text-color)',
              padding: '30px', 
              borderRadius: '12px',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)', 
              width: '90%',
              maxWidth: '380px'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              Select Journey Date
            </h3>
            
            {/* Reusing the EXACT class structure from TrainSearch.tsx to inherit the CSS perfectly */}
            <div className="form-group date-picker-wrapper" style={{ width: '100%', marginBottom: '10px' }}>
              <div 
                className="calendar-popup" 
                style={{ 
                  position: 'relative', // Overrides the absolute positioning from TrainSearch.css
                  top: 0, 
                  left: 0,
                  width: '100%', 
                  boxShadow: 'none', // Remove inner shadow to look cleaner
                  border: '1px solid var(--border-color)',
                  marginTop: 0,
                  padding: 0
                }}
              >
                <Calendar
                  onChange={(val) => {
                    if (val instanceof Date) {
                      setManualDate(val)
                    }
                  }}
                  value={manualDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  view="month"
                  calendarType="gregory"
                  navigationLabel={({ date: navDate }) => 
                    navDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  }
                  tileDisabled={({ date: tileDate }) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return tileDate < today
                  }}
                  firstDayOfWeek={0}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%' }}>
              <button 
                onClick={confirmManualBooking} 
                style={{ flex: 1, background: '#0052cc', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Confirm
              </button>
              <button 
                onClick={() => { setDatePickerTrainId(null); setManualDate(null); }} 
                style={{ flex: 1, backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}