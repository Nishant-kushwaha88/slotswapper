import mongoose, { Schema, Document } from 'mongoose';

// Remove the interface extension, just use Document directly
export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

export default mongoose.model<IUserDocument>('User', UserSchema);