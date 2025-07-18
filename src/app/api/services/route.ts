import { connectToDB } from "../../../utils/database";
import Service, { ServiceName } from "../../models/services.model";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceName, hourlyRate } = body;

    if (!serviceName || hourlyRate === undefined) {
      return NextResponse.json(
        { message: "Service name and hourly rate are required." },
        { status: 400 }
      );
    }

    if (typeof hourlyRate !== "number" || hourlyRate < 0) {
      return NextResponse.json(
        { message: "Hourly rate must be a non-negative number." },
        { status: 400 }
      );
    }

    await connectToDB();

    const existingService = await Service.findOne({ serviceName });

    if (existingService) {
      existingService.hourlyRate = hourlyRate;
      const updatedService = await existingService.save();
      
      return NextResponse.json(updatedService, { status: 200 });

    } else {
      const newService = new Service({
        serviceName,
        hourlyRate,
      });
      await newService.save();
      
      return NextResponse.json(newService, { status: 201 });
    }

  } catch (error) {
    console.error("Failed to create or update service:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
