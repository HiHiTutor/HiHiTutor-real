import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IStudentCase extends Document {
  id: number;
  subject: string;
  location: string;
  budget: string;
  mode: string;
  requirement: string;
  category: string;
  subCategory: string;
  region: string;
  subRegions?: string[];
  priceRange: string;
  featured: boolean;
  createdAt: Date;
}

const StudentCaseSchema = new Schema<IStudentCase>({
  id: { type: Number, required: true, unique: true },
  subject: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: String, required: true },
  mode: { type: String, required: true },
  requirement: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  region: { type: String, required: true },
  priceRange: { type: String, required: true },
  featured: { type: Boolean, required: true },
  createdAt: { type: Date, required: true }
});

export default models.StudentCase || model<IStudentCase>('StudentCase', StudentCaseSchema); 