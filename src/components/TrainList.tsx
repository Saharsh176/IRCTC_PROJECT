import { useState } from 'react'
import '../styles/TrainList.css'

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

    const travelDate = train ? train.date : ''
    onBook(trainId, count, travelDate)
    setPassengers(prev => ({
      ...prev,
      [trainId]: 1
    }))
  }

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
    <div className="train-list">
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
              <p className="seats-available">{train.seats} seats</p>
            </div>
            <button className="expand-btn">
              {expandedId === train.id ? '▲' : '▼'}
            </button>
          </div>

          {expandedId === train.id && (
            <div className="train-details">
              <div className="booking-section">
                <div className="passenger-selector">
                  <label htmlFor={`passengers-${train.id}`}>Number of Passengers:</label>
                  <input
                    id={`passengers-${train.id}`}
                    type="number"
                    min="1"
                    max={train.seats}
                    value={passengers[train.id] || 1}
                    onChange={(e) => handlePassengerChange(train.id, parseInt(e.target.value))}
                  />
                </div>
                <div className="price-summary">
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
    </div>
  )
}
