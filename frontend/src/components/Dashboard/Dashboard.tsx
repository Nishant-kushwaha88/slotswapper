import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types';

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<'BUSY' | 'SWAPPABLE'>('BUSY');
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getMyEvents();
      setEvents(response.data.events);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await eventAPI.createEvent(title, startTime, endTime, status);
      setTitle('');
      setStartTime('');
      setEndTime('');
      setStatus('BUSY');
      setShowForm(false);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleToggleSwappable = async (event: Event) => {
    try {
      const newStatus = event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
      await eventAPI.updateEvent(event._id, { status: newStatus });
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventAPI.deleteEvent(id);
        fetchEvents();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Welcome, {user?.name}!</h2>
        <div>
          <button onClick={() => navigate('/marketplace')} style={{ marginRight: '10px', padding: '8px 15px' }}>
            Marketplace
          </button>
          <button onClick={() => navigate('/requests')} style={{ marginRight: '10px', padding: '8px 15px' }}>
            Requests
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <h3>My Events</h3>
      
      <button 
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : '+ Create New Event'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateEvent} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h4>Create New Event</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Start Time:</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>End Time:</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as 'BUSY' | 'SWAPPABLE')}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="BUSY">Busy</option>
              <option value="SWAPPABLE">Swappable</option>
            </select>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
            Create Event
          </button>
        </form>
      )}

      <div>
        {events.length === 0 ? (
          <p>No events yet. Create your first event!</p>
        ) : (
          events.map((event) => (
            <div 
              key={event._id} 
              style={{ 
                padding: '15px', 
                marginBottom: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                backgroundColor: event.status === 'SWAPPABLE' ? '#d4edda' : event.status === 'SWAP_PENDING' ? '#fff3cd' : '#f8f9fa'
              }}
            >
              <h4>{event.title}</h4>
              <p><strong>Start:</strong> {new Date(event.startTime).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(event.endTime).toLocaleString()}</p>
              <p><strong>Status:</strong> <span style={{ 
                padding: '3px 8px', 
                borderRadius: '3px',
                backgroundColor: event.status === 'SWAPPABLE' ? '#28a745' : event.status === 'SWAP_PENDING' ? '#ffc107' : '#6c757d',
                color: 'white',
                fontSize: '12px'
              }}>{event.status}</span></p>
              
              <div style={{ marginTop: '10px' }}>
                {event.status !== 'SWAP_PENDING' && (
                  <>
                    <button 
                      onClick={() => handleToggleSwappable(event)}
                      style={{ 
                        marginRight: '10px', 
                        padding: '5px 10px',
                        backgroundColor: event.status === 'BUSY' ? '#17a2b8' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {event.status === 'BUSY' ? 'Make Swappable' : 'Make Busy'}
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(event._id)}
                      style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </>
                )}
                {event.status === 'SWAP_PENDING' && (
                  <span style={{ color: '#856404' }}>⏳ Swap pending...</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;