import React from 'react';
import '../styles/TicketCounter.css';

interface TicketCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function TicketCounter({ value, onChange, min = 1, max = 10 }: TicketCounterProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="ticket-counter">
      <button 
        type="button" 
        className="counter-btn" 
        onClick={handleDecrement} 
        disabled={value <= min}
        aria-label="Decrease tickets"
      >
        −
      </button>
      <span className="counter-value">{value}</span>
      <button 
        type="button" 
        className="counter-btn" 
        onClick={handleIncrement} 
        disabled={value >= max}
        aria-label="Increase tickets"
      >
        +
      </button>
    </div>
  );
}