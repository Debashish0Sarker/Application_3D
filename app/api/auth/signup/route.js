import {NextResponse} from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        await connectDB();
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ 
                status: "Error", 
                message: "All fields are required" 
            }, { status: 400 });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ 
                status: "Error", 
                message: "Username already exists" 
            }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        return NextResponse.json({ 
            status: "Success", 
            message: "User registered successfully" 
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ 
            status: "Error", 
            message: "Registration failed", 
            error: error.message 
        }, { status: 500 });
    }
}
