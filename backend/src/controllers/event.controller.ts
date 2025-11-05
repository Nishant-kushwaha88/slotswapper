import { Response } from 'express';
import Event from '../models/Event';
import { AuthRequest } from '../types';

// Get all events for the logged-in user
export const getMyEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const events = await Event.find({ userId }).sort({ startTime: 1 });

    res.status(200).json({
      message: 'Events retrieved successfully',
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new event
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, startTime, endTime, status } = req.body;

    // Validation
    if (!title || !startTime || !endTime) {
      res.status(400).json({ message: 'Please provide title, startTime, and endTime' });
      return;
    }

    // Check if endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      res.status(400).json({ message: 'End time must be after start time' });
      return;
    }

    // Create event
    const event = await Event.create({
      userId,
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: status || 'BUSY'
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an event
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { title, startTime, endTime, status } = req.body;

    // Find event
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Check ownership
    if (event.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to update this event' });
      return;
    }

    // Check if event is in SWAP_PENDING status
    if (event.status === 'SWAP_PENDING') {
      res.status(400).json({ message: 'Cannot update event with pending swap request' });
      return;
    }

    // Update fields
    if (title) event.title = title;
    if (startTime) event.startTime = new Date(startTime);
    if (endTime) event.endTime = new Date(endTime);
    if (status) event.status = status;

    // Validate times if both are provided
    if (event.endTime <= event.startTime) {
      res.status(400).json({ message: 'End time must be after start time' });
      return;
    }

    await event.save();

    res.status(200).json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an event
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    // Find event
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Check ownership
    if (event.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this event' });
      return;
    }

    // Check if event is in SWAP_PENDING status
    if (event.status === 'SWAP_PENDING') {
      res.status(400).json({ message: 'Cannot delete event with pending swap request' });
      return;
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};