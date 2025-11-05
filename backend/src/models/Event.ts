import mongoose, { Schema, Document } from 'mongoose';

export interface IEventDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
}

const EventSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
    default: 'BUSY'
  }
}, {
  timestamps: true
});

export default mongoose.model<IEventDocument>('Event', EventSchema);