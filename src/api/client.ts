const API_BASE_URL = 'http://localhost:3001/api';

// Train API calls
export const getTrain = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trains/${id}`);
    if (!response.ok) throw new Error('Failed to fetch train');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching train:', error);
    throw error;
  }
};

export const getTrains = async (filters?: { from?: string; to?: string; date?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.date) params.append('date', filters.date);

    const url = `${API_BASE_URL}/trains${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch trains');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching trains:', error);
    throw error;
  }
};

export const createTrain = async (trainData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create train');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating train:', error);
    throw error;
  }
};

export const updateTrain = async (id: string, trainData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trains/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update train');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating train:', error);
    throw error;
  }
};

export const deleteTrain = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trains/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete train');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error deleting train:', error);
    throw error;
  }
};

// Booking API calls
export const getBookings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const getBooking = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
    if (!response.ok) throw new Error('Failed to fetch booking');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

export const createBooking = async (bookingData: { trainId: string; passengers: number; travelDate: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const deleteBooking = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete booking');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};
