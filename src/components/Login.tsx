import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        await registerUser({ username, password });
        // Auto-login after register
        const data = await loginUser({ username, password });
        login(data.token, data.user);
      } else {
        const data = await loginUser({ username, password });
        login(data.token, data.user);
      }
      navigate('/'); // Go to home page after login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px', background: '#0052cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isRegistering ? 'Create Account' : 'Login'}
        </button>
      </form>
      
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          style={{ background: 'none', border: 'none', color: '#0052cc', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </p>
    </div>
  );
}