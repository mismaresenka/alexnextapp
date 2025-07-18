
import { connectToDB } from "../../../utils/database";
import Booking from "../../models/booking.model";
import Service from "../../models/services.model";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from 'date-fns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client, bookingDate, services } = body;

    // --- 1. Basic Validation ---
    if (!client || !bookingDate || !services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ message: "Client, booking date, and at least one service are required." }, { status: 400 });
    }

    await connectToDB();

    // --- 2. Schedule Conflict Validation ---
    const date = new Date(bookingDate);
    const start = startOfDay(date);
    const end = endOfDay(date);

    const existingBooking = await Booking.findOne({ 
      bookingDate: { $gte: start, $lte: end },
      status: { $ne: 'Cancelled' } // Don't count cancelled bookings
    });

    if (existingBooking) {
      return NextResponse.json({ message: `A booking already exists for this date. Please choose another.` }, { status: 409 }); // 409 Conflict
    }

    let calculatedTotal = 0;
    const serviceIds = services.map((s: any) => s.serviceId);
    
    const serviceDocs = await Service.find({ '_id': { $in: serviceIds } });
    
    const rateMap = new Map(serviceDocs.map(s => [s._id.toString(), s.hourlyRate]));

    for (const s of services) {
      const rate = rateMap.get(s.serviceId);
      if (!rate) {
        throw new Error(`Service with ID ${s.serviceId} not found or has no rate.`);
      }
      calculatedTotal += rate * s.numberOfHours;
    }

    const newBooking = new Booking({
      client,
      bookingDate: date,
      services,
      totalAmount: calculatedTotal,
      status: 'Scheduled'
    });

    await newBooking.save();

    return NextResponse.json(newBooking, { status: 201 });

  } catch (error) {
    console.error("Failed to create booking:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}