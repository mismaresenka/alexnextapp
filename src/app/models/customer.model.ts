// models/customer.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  PhoneNumber: string;
  Address: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema<ICustomer> = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Customer name is required."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Customer name is required."],
      trim: true,
    },
    PhoneNumber: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
    },
    Address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true, // Emails should be unique to a client
      trim: true,
      lowercase: true, // Store emails consistently
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email."],
    },

  },
  {
    timestamps: true,

    collection: "customers",
  }
);

const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
  