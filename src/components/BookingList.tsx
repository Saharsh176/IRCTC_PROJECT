import '../styles/BookingList.css'

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

interface BookingListProps {
  bookings: Booking[]
  onCancel: (bookingId: string) => void
}

export default function BookingList({ bookings, onCancel }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="booking-list">
        <h2>My Bookings</h2>
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
          <p>Search and book a train to get started!</p>
        </div>
      </div>
    )
  }

  const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <div className="booking-list">
      <h2>My Bookings</h2>
      <div className="bookings-summary">
        <p>Total Bookings: <strong>{bookings.length}</strong></p>
        <p>Total Amount Spent: <strong>₹{totalSpent}</strong></p>
      </div>

      <div className="bookings-container">
        {bookings.map(booking => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <div>
                <h3>{booking.trainName}</h3>
                <p className="booking-id">Booking ID: {booking.id}</p>
              </div>
              <div className="booking-status">
                <span className="status-badge">Confirmed</span>
              </div>
            </div>

            <div className="booking-details">
              <div className="detail-row">
                <span className="label">Route:</span>
                <span className="value">{booking.from} → {booking.to}</span>
              </div>
              <div className="detail-row">
                <span className="label">Passengers:</span>
                <span className="value">{booking.passengers}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Price:</span>
                <span className="value price">₹{booking.totalPrice}</span>
              </div>
              {booking.travelDate && (
                <div className="detail-row">
                  <span className="label">Journey Date:</span>
                  <span className="value">{booking.travelDate}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Booking Date:</span>
                <span className="value">{booking.bookingDate}</span>
              </div>
            </div>

            <button 
              className="cancel-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this booking?')) {
                  onCancel(booking.id)
                }
              }}
            >
              Cancel Booking
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
