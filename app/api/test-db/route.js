import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    // Attempt to invoke the database utility connection
    await connectDB();
    return NextResponse.json({ 
      status: "Success", 
      message: "Connected to MongoDB Atlas successfully!" 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      status: "Error", 
      message: "Database connection failed", 
      error: error.message 
    }, { status: 500 });
  }
}