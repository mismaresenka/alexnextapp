// app/api/customers/route.ts

import { connectToDB } from "../../../utils/database"; // Adjust path if needed
import Customer from "../../models/customer.model"; // Your Customer model
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, PhoneNumber, Address } = body;
    
    console.log("RECEIVED BODY ON SERVER:", body);

    if (!firstName || !lastName || !email || !PhoneNumber || !Address) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 } 
      );
    }

    await connectToDB();

    const newCustomer = new Customer({
      firstName, 
      lastName,  
      email,     
      PhoneNumber,
      Address,
    });

    await newCustomer.save();

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("FAILED TO CREATE CUSTOMER:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { message: "Validation Failed", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}