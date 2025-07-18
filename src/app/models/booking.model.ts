import mongoose, { Schema, Document, Model } from "mongoose";
import { IService } from "./services.model"; 
import { ICustomer } from "./customer.model"; 

export interface IBookedService {
  serviceId: mongoose.Types.ObjectId | IService; 
  numberOfHours: number;
}

export interface IBooking extends Document {
  client: mongoose.Types.ObjectId | ICustomer; 
  bookingDate: Date;
  services: IBookedService[];
  totalAmount: number;
  status: "Scheduled" | "Completed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const BookedServiceSchema: Schema<IBookedService> = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  numberOfHours: {
    type: Number,
    required: [true, "Number of hours is required."],
    min: [0.5, "Minimum of half an hour is required."],
  },
}, { _id: false }); 

const BookingSchema: Schema<IBooking> = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "Customer", 
      required: true,
    },
    bookingDate: {
      type: Date,
      required: [true, "A booking date is required."],
    },
    services: {
      type: [BookedServiceSchema], 
      validate: [ (val: any) => val.length > 0, 'At least one service is required.']
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;