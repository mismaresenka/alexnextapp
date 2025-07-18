// models/service.model.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export type ServiceName = "Plumbing" | "Electrical" | "Masonry" | "Carpentry Works" | "Others";

export interface IService extends Document {
  _id: string;
  serviceName: ServiceName; 
  hourlyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema<IService> = new Schema(
  {
    serviceName: {
      type: String,
      required: [true, "Service name is required."],
      enum: {
        values: ["Plumbing", "Electrical", "Masonry", "Carpentry Works", "Others"],
        message: "{VALUE} is not a supported service.",
      },
      trim: true,
    },
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required for the service."],
      min: [0, "Hourly rate cannot be negative."],
    },
  },
  {
    collection: "services",
    timestamps: true,      
  }
);
const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;