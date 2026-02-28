import { useState } from 'react'
import '../styles/AdminDashboard.css'

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

interface AdminDashboardProps {
  trains: Train[]
  onAddTrain: (train: Omit<Train, 'id'>) => void
  onUpdateTrain: (id: string, train: Partial<Train>) => void
  onDeleteTrain: (id: string) => void
  onLogout: () => void
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Utility function to calculate duration from departure and arrival times
const calculateDuration = (departure: string, arrival: string): string => {
  if (!departure || !arrival) return ''

  // Parse times in HH:MM format
  const [depHour, depMin] = departure.split(':').map(Number)
  const [arrHour, arrMin] = arrival.split(':').map(Number)

  let depMinutes = depHour * 60 + depMin
  let arrMinutes = arrHour * 60 + arrMin

  // Handle overnight journeys (arrival time is on next day)
  if (arrMinutes <= depMinutes) {
    arrMinutes += 24 * 60 // Add 24 hours
  }

  const totalMinutes = arrMinutes - depMinutes
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

export default function AdminDashboard({
  trains,
  onAddTrain,
  onUpdateTrain,
  onDeleteTrain,
  onLogout
}: AdminDashboardProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    from: '',
    to: '',
    departure: '',
    arrival: '',
    duration: '',
    totalSeats: 100,
    price: 1000,
    daysRunning: DAYS_OF_WEEK
  })

  const stations = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Agra', 'Jaipur'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const updatedForm = {
      ...formData,
      [name]: name === 'totalSeats' || name === 'price' ? parseFloat(value) : value
    }

    // Auto-calculate duration when departure or arrival time changes
    if (name === 'departure' || name === 'arrival') {
      updatedForm.duration = calculateDuration(
        name === 'departure' ? value : updatedForm.departure,
        name === 'arrival' ? value : updatedForm.arrival
      )
    }

    setFormData(updatedForm)
  }

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysRunning: prev.daysRunning.includes(day)
        ? prev.daysRunning.filter(d => d !== day)
        : [...prev.daysRunning, day]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.from || !formData.to || !formData.departure || !formData.arrival) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.daysRunning.length === 0) {
      alert('Select at least one day')
      return
    }

    const trainData = {
      name: formData.name,
      from: formData.from,
      to: formData.to,
      departure: formData.departure,
      arrival: formData.arrival,
      duration: formData.duration,
      seats: formData.totalSeats,
      totalSeats: formData.totalSeats,
      price: formData.price,
      daysRunning: formData.daysRunning.join(',')
    }

    if (editingId) {
      onUpdateTrain(editingId, trainData)
      setEditingId(null)
    } else {
      onAddTrain(trainData)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      from: '',
      to: '',
      departure: '',
      arrival: '',
      duration: '',
      totalSeats: 100,
      price: 1000,
      daysRunning: DAYS_OF_WEEK
    })
    setShowForm(false)
  }

  const handleEdit = (train: Train) => {
    const updatedFormData = {
      name: train.name,
      from: train.from,
      to: train.to,
      departure: train.departure,
      arrival: train.arrival,
      duration: train.duration,
      totalSeats: train.totalSeats,
      price: train.price,
      daysRunning: train.daysRunning ? train.daysRunning.split(',') : DAYS_OF_WEEK
    }
    // Recalculate duration from the times
    updatedFormData.duration = calculateDuration(train.departure, train.arrival)
    setFormData(updatedFormData)
    setEditingId(train.id)
    setShowForm(true)
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="admin-content">
        {!showForm ? (
          <>
            <button className="add-train-btn" onClick={() => setShowForm(true)}>
              + Add New Train
            </button>

            <div className="trains-table-container">
              {trains.length === 0 ? (
                <p className="no-trains">No trains added yet.</p>
              ) : (
                <table className="trains-table">
                  <thead>
                    <tr>
                      <th>Train Name</th>
                      <th>Route</th>
                      <th>Times</th>
                      <th>Seats</th>
                      <th>Price</th>
                      <th>Days Running</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trains.map(train => (
                      <tr key={train.id}>
                        <td>{train.name}</td>
                        <td>{train.from} → {train.to}</td>
                        <td>
                          {train.departure} - {train.arrival}
                        </td>
                        <td>{train.seats}/{train.totalSeats}</td>
                        <td>₹{train.price}</td>
                        <td>
                          <div className="days-badge">
                            {train.daysRunning || 'Daily'}
                          </div>
                        </td>
                        <td className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(train)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => {
                              if (window.confirm(`Delete ${train.name}?`)) {
                                onDeleteTrain(train.id)
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="train-form-container">
            <h2>{editingId ? 'Edit Train' : 'Add New Train'}</h2>

            <form onSubmit={handleSubmit} className="train-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Train Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Rajdhani Express"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="from">From Station *</label>
                  <select
                    id="from"
                    name="from"
                    value={formData.from}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Station</option>
                    {stations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="to">To Station *</label>
                  <select
                    id="to"
                    name="to"
                    value={formData.to}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Station</option>
                    {stations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departure">Departure Time *</label>
                  <input
                    id="departure"
                    type="time"
                    name="departure"
                    value={formData.departure}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="arrival">Arrival Time *</label>
                  <input
                    id="arrival"
                    type="time"
                    name="arrival"
                    value={formData.arrival}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (Auto-calculated)</label>
                  <input
                    id="duration"
                    type="text"
                    name="duration"
                    value={formData.duration}
                    disabled
                    placeholder="Auto-calculated from times"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalSeats">Total Seats *</label>
                  <input
                    id="totalSeats"
                    type="number"
                    name="totalSeats"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price per Seat *</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Days Running *</label>
                <div className="days-selector">
                  {DAYS_OF_WEEK.map(day => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.daysRunning.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingId ? 'Update Train' : 'Add Train'}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
