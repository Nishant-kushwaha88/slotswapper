export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Event {
  _id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  createdAt?: string;
}

export interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

export interface SwappableSlot {
  _id: string;
  userId: PopulatedUser;  // Changed to PopulatedUser
  title: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  createdAt?: string;
}

export interface SwapRequest {
  _id: string;
  requesterId: string | PopulatedUser;
  requesterSlotId: Event;
  targetUserId: string | PopulatedUser;
  targetSlotId: Event;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}