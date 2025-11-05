import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { swapAPI } from '../../services/api';
import type { SwappableSlot, Event } from '../../types';

const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState<SwappableSlot[]>([]);
  const [mySwappableSlots, setMySwappableSlots] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsResponse, mySlotsResponse] = await Promise.all([
        swapAPI.getSwappableSlots(),
        swapAPI.getMySwappableSlots()
      ]);
      setSwappableSlots(slotsResponse.data.slots);
      setMySwappableSlots(mySlotsResponse.data.slots);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot: SwappableSlot) => {
    if (mySwappableSlots.length === 0) {
      alert('You need to have at least one swappable slot to request a swap!');
      return;
    }
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleConfirmSwap = async (mySlotId: string) => {
    if (!selectedSlot) return;

    try {
      await swapAPI.createSwapRequest(mySlotId, selectedSlot._id);
      alert('Swap request sent successfully!');
      setShowModal(false);
      setSelectedSlot(null);
      navigate('/requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create swap request');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Marketplace - Available Slots</h2>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px', padding: '8px 15px' }}>
            Dashboard
          </button>
          <button onClick={() => navigate('/requests')} style={{ padding: '8px 15px' }}>
            Requests
          </button>
        </div>
      </div>

      {swappableSlots.length === 0 ? (
        <p>No swappable slots available at the moment.</p>
      ) : (
        <div>
          {swappableSlots.map((slot) => (
            <div 
              key={slot._id}
              style={{
                padding: '15px',
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f8f9fa'
              }}
            >
              <h4>{slot.title}</h4>
              <p><strong>Owner:</strong> {slot.userId.name} ({slot.userId.email})</p>
              <p><strong>Start:</strong> {new Date(slot.startTime).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(slot.endTime).toLocaleString()}</p>
              
              <button
                onClick={() => handleRequestSwap(slot)}
                style={{
                  marginTop: '10px',
                  padding: '8px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '3px'
                }}
              >
                Request Swap
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for selecting which slot to offer */}
      {showModal && selectedSlot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>Select Your Slot to Offer</h3>
            <p>You want: <strong>{selectedSlot.title}</strong></p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              {new Date(selectedSlot.startTime).toLocaleString()} - {new Date(selectedSlot.endTime).toLocaleString()}
            </p>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginBottom: '20px' }}>
              <h4>Choose one of your swappable slots:</h4>
              {mySwappableSlots.length === 0 ? (
                <p style={{ color: 'red' }}>You have no swappable slots available.</p>
              ) : (
                mySwappableSlots.map((slot) => (
                  <div
                    key={slot._id}
                    style={{
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      backgroundColor: '#f8f9fa'
                    }}
                    onClick={() => handleConfirmSwap(slot._id)}
                  >
                    <strong>{slot.title}</strong>
                    <p style={{ fontSize: '12px', margin: '5px 0' }}>
                      {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedSlot(null);
                setError('');
              }}
              style={{
                padding: '8px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;