import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        // 1. Parse incoming body data
        const { username, password } = await request.json();

        // 2. Validate input presence (Email isn't strictly needed for signing in if username is used)
        if (!username || !password) {
            return NextResponse.json({ 
                status: "Error", 
                message: "Username and password are required" 
            }, { status: 400 });
        }

        // 3. Establish Database connection
        await connectDB();

        // 4. Retrieve user records from collection
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ 
                status: "Error", 
                message: "Invalid credentials" 
            }, { status: 401 });
        }

        // 5. Unhash and compare the passwords securely
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ 
                status: "Error", 
                message: "Invalid credentials" 
            }, { status: 401 });
        }

        // 6. Return standard success payload
        return NextResponse.json({
            status: "Success",
            message: "Login successful",
            user: { id: user._id, username: user.username, email: user.email }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            status: "Error", 
            message: "Login failed", 
            error: error.message 
        }, { status: 500 });
    }
}