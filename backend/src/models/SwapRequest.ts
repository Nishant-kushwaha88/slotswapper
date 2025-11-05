import mongoose, { Schema, Document } from 'mongoose';

export interface ISwapRequestDocument extends Document {
  requesterId: mongoose.Types.ObjectId;
  requesterSlotId: mongoose.Types.ObjectId;
  targetUserId: mongoose.Types.ObjectId;
  targetSlotId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

const SwapRequestSchema: Schema = new Schema({
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterSlotId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  targetUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetSlotId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

export default mongoose.model<ISwapRequestDocument>('SwapRequest', SwapRequestSchema);