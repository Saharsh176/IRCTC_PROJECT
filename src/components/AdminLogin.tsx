import { useState } from 'react'
import '../styles/AdminLogin.css'

interface AdminLoginProps {
  onLogin: (authenticated: boolean) => void
  onCancel: () => void
}

const ADMIN_PASSWORD = 'admin123' // Simple password, can be changed

export default function AdminLogin({ onLogin, onCancel }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      setError('')
      onLogin(true)
    } else {
      setError('Invalid password. Try again.')
      setPassword('')
    }
  }

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-container">
        <div className="login-card">
          <h1>🔐 Admin Login</h1>
          <p className="login-subtitle">Enter admin password to manage trains</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="password">Admin Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button type="submit" className="login-btn">
                Login
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </form>

          <p className="demo-info">Demo Password: admin123</p>
        </div>
      </div>
    </div>
  )
}
