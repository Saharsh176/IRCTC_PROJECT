import { useState } from 'react'
import '../styles/TrainSearch.css'

interface TrainSearchProps {
  onSearch: (filters: { from: string; to: string; date: string }) => void
}

export default function TrainSearch({ onSearch }: TrainSearchProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')

  const stations = [
    'Delhi',
    'Mumbai',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Agra',
    'Jaipur',
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!from || !to) {
      alert('Please select both departure and destination stations')
      return
    }
    // date may be empty; that's okay we'll filter if provided
    onSearch({ from, to, date })
  }

  return (
    <div className="train-search">
      <h2>Find Your Train</h2>
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="from">From</label>
          <select
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
          >
            <option value="">Select Station</option>
            {stations.map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="to">To</label>
          <select
            id="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          >
            <option value="">Select Station</option>
            {stations.map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Journey Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button type="submit" className="search-btn">Search Trains</button>
      </form>
    </div>
  )
}
