import { connectToDB } from '../../../utils/database'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        await connectToDB();
        return NextResponse.json(
            { message: "Successfully connected to MongoDB." },
            { status: 200 }
        );
    } catch (error) {
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error("Failed to connect to the database:", error);
        return NextResponse.json(
            { message: "Failed to connect to MongoDB.", error: errorMessage },
            { status: 500 }
        );
    }
}