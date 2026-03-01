import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react' 
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
  const [showQrForId, setShowQrForId] = useState<string | null>(null)

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
    <div className="booking-list" style={{ position: 'relative' }}>
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
                <p className="booking-id" style={{ fontSize: '0.85rem', color: 'gray' }}>ID: {booking.id}</p>
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

            {/* <-- Centered Action Buttons Row with added bottom padding --> */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', paddingBottom: '15px' ,paddingRight: '15px',paddingLeft: '15px'}}>
              <button 
                style={{ 
                  background: '#0052cc', color: 'white', padding: '10px 20px', 
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                  fontSize: '14px', height: '40px', minWidth: '160px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
                onClick={() => setShowQrForId(booking.id)}
              >
                View QR Ticket
              </button>
              
              <button 
                className="cancel-btn"
                style={{ 
                  margin: 0, padding: '10px 20px', height: '40px', minWidth: '160px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this booking?')) {
                    onCancel(booking.id)
                  }
                }}
              >
                Cancel Booking
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Modal Overlay mapped to Theme Variables */}
      {showQrForId && (
        <div 
          onClick={() => setShowQrForId(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{
              background: 'var(--card-bg, white)', padding: '30px', borderRadius: '12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: '90%'
            }}
          >
            <h3 style={{ marginTop: 0, color: 'var(--text-color, #333)' }}>E-Ticket QR</h3>
            
            {/* The QR code needs a hard white background to remain scannable */}
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
              <QRCodeSVG value={showQrForId} size={220} />
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-color, #666)', marginTop: '15px', textAlign: 'center', wordBreak: 'break-all', maxWidth: '250px' }}>
              {showQrForId}
            </p>
            <button 
              onClick={() => setShowQrForId(null)}
              style={{
                marginTop: '15px', padding: '10px 30px', background: 'var(--bg-color, #e0e0e0)',
                color: 'var(--text-color, #333)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}