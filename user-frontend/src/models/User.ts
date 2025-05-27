import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: 'student' | 'organization' | 'tutor';
  role: 'user' | 'admin';
  status: 'active' | 'pending';
  // 組織用戶特有欄位
  organizationDocuments?: {
    businessRegistration: string; // 商業登記證
    addressProof: string;        // 地址證明
  };
  // 導師用戶特有欄位
  tutorProfile?: {
    education: string;
    experience: string;
    specialties: string[];
    documents: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    enum: ['student', 'organization', 'tutor'],
    default: 'student'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'pending'
  },
  organizationDocuments: {
    businessRegistration: String,
    addressProof: String
  },
  tutorProfile: {
    education: String,
    experience: String,
    specialties: [String],
    documents: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新 updatedAt 時間戳
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 