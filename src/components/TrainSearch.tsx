import { useState, useRef, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '../styles/TrainSearch.css'

interface TrainSearchProps {
  onSearch: (filters: { from: string; to: string; date: string }) => void
}

export default function TrainSearch({ onSearch }: TrainSearchProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

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

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateChange = (value: Date) => {
    if (value instanceof Date) {
      setDate(value)
      setShowCalendar(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!from || !to || !date) {
      alert('Please select departure station, destination station, and date')
      return
    }
    // Format date as YYYY-MM-DD using local date values (not UTC conversion)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    onSearch({ from, to, date: dateString })
  }

  const minDate = new Date()
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 90)

  const formatDate = (d: Date | null) => {
    if (!d) return ''
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    return d.toLocaleDateString('en-US', options)
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

        <div className="form-group date-picker-wrapper" ref={calendarRef}>
          <label htmlFor="date">Journey Date</label>
          <div className="date-input-container" onClick={() => setShowCalendar(!showCalendar)}>
            <input
              id="date"
              type="text"
              value={formatDate(date)}
              readOnly
              placeholder="Select date"
              className="date-input"
            />
            <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          {showCalendar && (
            <div className="calendar-popup">
              <Calendar
                onChange={handleDateChange}
                value={date}
                minDate={minDate}
                maxDate={maxDate}
                view="month"
                calendarType="gregory"
                navigationLabel={({ date: navDate }) => 
                  navDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
                tileDisabled={({ date: tileDate }) => {
                  // Disable past dates - compare dates properly
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return tileDate < today
                }}
                firstDayOfWeek={0}
              />
            </div>
          )}
        </div>

        <button type="submit" className="search-btn">Search Trains</button>
      </form>
    </div>
  )
}
