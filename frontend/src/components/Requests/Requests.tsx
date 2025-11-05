import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { swapAPI } from '../../services/api';
import type { SwapRequest } from '../../types';

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [incomingResponse, outgoingResponse] = await Promise.all([
        swapAPI.getIncomingRequests(),
        swapAPI.getOutgoingRequests()
      ]);
      setIncomingRequests(incomingResponse.data.requests);
      setOutgoingRequests(outgoingResponse.data.requests);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    try {
      await swapAPI.respondToSwapRequest(requestId, accept);
      alert(accept ? 'Swap request accepted!' : 'Swap request rejected');
      fetchRequests();
      // Optionally navigate to dashboard to see updated events
      if (accept) {
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to respond to request');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Swap Requests</h2>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px', padding: '8px 15px' }}>
            Dashboard
          </button>
          <button onClick={() => navigate('/marketplace')} style={{ padding: '8px 15px' }}>
            Marketplace
          </button>
        </div>
      </div>

      {/* Incoming Requests */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Incoming Requests (Others want to swap with you)</h3>
        {incomingRequests.length === 0 ? (
          <p>No incoming requests.</p>
        ) : (
          incomingRequests.map((request) => {
            const requester = typeof request.requesterId === 'object' ? request.requesterId : null;
            return (
              <div
                key={request._id}
                style={{
                  padding: '15px',
                  marginBottom: '15px',
                  border: '2px solid #007bff',
                  borderRadius: '5px',
                  backgroundColor: '#e7f3ff'
                }}
              >
                <p><strong>From:</strong> {requester?.name || 'Unknown'} ({requester?.email || 'N/A'})</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '15px 0' }}>
                  <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '5px' }}>
                    <h4 style={{ marginTop: 0 }}>They offer:</h4>
                    <p><strong>{request.requesterSlotId.title}</strong></p>
                    <p style={{ fontSize: '14px' }}>
                      {new Date(request.requesterSlotId.startTime).toLocaleString()}<br />
                      to<br />
                      {new Date(request.requesterSlotId.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '5px' }}>
                    <h4 style={{ marginTop: 0 }}>For your:</h4>
                    <p><strong>{request.targetSlotId.title}</strong></p>
                    <p style={{ fontSize: '14px' }}>
                      {new Date(request.targetSlotId.startTime).toLocaleString()}<br />
                      to<br />
                      {new Date(request.targetSlotId.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleRespond(request._id, true)}
                    style={{
                      marginRight: '10px',
                      padding: '8px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => handleRespond(request._id, false)}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Outgoing Requests */}
      <div>
        <h3>Outgoing Requests (You requested these swaps)</h3>
        {outgoingRequests.length === 0 ? (
          <p>No outgoing requests.</p>
        ) : (
          outgoingRequests.map((request) => {
            const target = typeof request.targetUserId === 'object' ? request.targetUserId : null;
            return (
              <div
                key={request._id}
                style={{
                  padding: '15px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: request.status === 'PENDING' ? '#fff3cd' : request.status === 'ACCEPTED' ? '#d4edda' : '#f8d7da'
                }}
              >
                <p><strong>To:</strong> {target?.name || 'Unknown'} ({target?.email || 'N/A'})</p>
                <p><strong>Status:</strong> <span style={{
                  padding: '3px 8px',
                  borderRadius: '3px',
                  backgroundColor: request.status === 'PENDING' ? '#ffc107' : request.status === 'ACCEPTED' ? '#28a745' : '#dc3545',
                  color: 'white',
                  fontSize: '12px'
                }}>{request.status}</span></p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '15px 0' }}>
                  <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '5px' }}>
                    <h4 style={{ marginTop: 0 }}>You offered:</h4>
                    <p><strong>{request.requesterSlotId.title}</strong></p>
                    <p style={{ fontSize: '14px' }}>
                      {new Date(request.requesterSlotId.startTime).toLocaleString()}<br />
                      to<br />
                      {new Date(request.requesterSlotId.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '5px' }}>
                    <h4 style={{ marginTop: 0 }}>You wanted:</h4>
                    <p><strong>{request.targetSlotId.title}</strong></p>
                    <p style={{ fontSize: '14px' }}>
                      {new Date(request.targetSlotId.startTime).toLocaleString()}<br />
                      to<br />
                      {new Date(request.targetSlotId.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {request.status === 'PENDING' && (
                  <p style={{ color: '#856404', fontSize: '14px' }}>⏳ Waiting for response...</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Requests;