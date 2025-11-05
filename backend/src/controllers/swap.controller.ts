import { Response } from 'express';
import Event from '../models/Event';
import SwapRequest from '../models/SwapRequest';
import { AuthRequest } from '../types';

// Get all swappable slots (excluding current user's slots)
export const getSwappableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: userId }
    })
      .populate('userId', 'name email')
      .sort({ startTime: 1 });

    res.status(200).json({
      message: 'Swappable slots retrieved successfully',
      slots: swappableSlots
    });
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's swappable slots (for selecting which slot to offer)
export const getMySwappableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const mySwappableSlots = await Event.find({
      userId,
      status: 'SWAPPABLE'
    }).sort({ startTime: 1 });

    res.status(200).json({
      message: 'Your swappable slots retrieved successfully',
      slots: mySwappableSlots
    });
  } catch (error) {
    console.error('Get my swappable slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a swap request (WITHOUT TRANSACTION)
export const createSwapRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { mySlotId, theirSlotId } = req.body;

    // Validation
    if (!mySlotId || !theirSlotId) {
      res.status(400).json({ message: 'Please provide both mySlotId and theirSlotId' });
      return;
    }

    // Find both slots
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    // Check if both slots exist
    if (!mySlot || !theirSlot) {
      res.status(404).json({ message: 'One or both slots not found' });
      return;
    }

    // Verify mySlot belongs to current user
    if (mySlot.userId.toString() !== userId) {
      res.status(403).json({ message: 'You do not own the first slot' });
      return;
    }

    // Verify theirSlot does NOT belong to current user
    if (theirSlot.userId.toString() === userId) {
      res.status(400).json({ message: 'Cannot swap with your own slot' });
      return;
    }

    // Check if both slots are SWAPPABLE
    if (mySlot.status !== 'SWAPPABLE') {
      res.status(400).json({ message: 'Your slot must be SWAPPABLE' });
      return;
    }

    if (theirSlot.status !== 'SWAPPABLE') {
      res.status(400).json({ message: 'The target slot must be SWAPPABLE' });
      return;
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      requesterId: userId,
      requesterSlotId: mySlotId,
      targetUserId: theirSlot.userId,
      targetSlotId: theirSlotId,
      status: 'PENDING'
    });

    // Update both slots to SWAP_PENDING
    await Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' });
    await Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' });

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get incoming swap requests (requests for current user)
export const getIncomingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const incomingRequests = await SwapRequest.find({
      targetUserId: userId,
      status: 'PENDING'
    })
      .populate('requesterId', 'name email')
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Incoming requests retrieved successfully',
      requests: incomingRequests
    });
  } catch (error) {
    console.error('Get incoming requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get outgoing swap requests (requests made by current user)
export const getOutgoingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const outgoingRequests = await SwapRequest.find({
      requesterId: userId
    })
      .populate('targetUserId', 'name email')
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Outgoing requests retrieved successfully',
      requests: outgoingRequests
    });
  } catch (error) {
    console.error('Get outgoing requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to a swap request (WITHOUT TRANSACTION)
export const respondToSwapRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { requestId } = req.params;
    const { accept } = req.body;

    if (typeof accept !== 'boolean') {
      res.status(400).json({ message: 'Please provide accept as true or false' });
      return;
    }

    // Find swap request
    const swapRequest = await SwapRequest.findById(requestId);

    if (!swapRequest) {
      res.status(404).json({ message: 'Swap request not found' });
      return;
    }

    // Verify the current user is the target user
    if (swapRequest.targetUserId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to respond to this request' });
      return;
    }

    // Check if request is still pending
    if (swapRequest.status !== 'PENDING') {
      res.status(400).json({ message: 'This request has already been processed' });
      return;
    }

    if (accept) {
      // ACCEPT: Swap the owners
      const requesterSlot = await Event.findById(swapRequest.requesterSlotId);
      const targetSlot = await Event.findById(swapRequest.targetSlotId);

      if (!requesterSlot || !targetSlot) {
        res.status(404).json({ message: 'One or both slots not found' });
        return;
      }

      // Swap the userIds
      const tempUserId = requesterSlot.userId;
      requesterSlot.userId = targetSlot.userId;
      targetSlot.userId = tempUserId;

      // Set both slots back to BUSY
      requesterSlot.status = 'BUSY';
      targetSlot.status = 'BUSY';

      await requesterSlot.save();
      await targetSlot.save();

      // Update swap request status
      swapRequest.status = 'ACCEPTED';
      await swapRequest.save();

      res.status(200).json({
        message: 'Swap request accepted successfully',
        swapRequest
      });
    } else {
      // REJECT: Set slots back to SWAPPABLE
      await Event.findByIdAndUpdate(swapRequest.requesterSlotId, { status: 'SWAPPABLE' });
      await Event.findByIdAndUpdate(swapRequest.targetSlotId, { status: 'SWAPPABLE' });

      // Update swap request status
      swapRequest.status = 'REJECTED';
      await swapRequest.save();

      res.status(200).json({
        message: 'Swap request rejected',
        swapRequest
      });
    }
  } catch (error) {
    console.error('Respond to swap request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};