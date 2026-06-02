import {NextResponse} from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { username, email, password } = await request.json();
        await connectDB();

        const user = await User.findOne({ username });
        if (!username || !email || !password) {
            return NextResponse.json({ 
                status: "Error", 
                message: "Invalid credentials" 
            }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ 
                status: "Error", 
                message: "Invalid credentials" 
            }, { status: 401 });
        }
        return NextResponse.json({
            status: "Success",
            message: "Login successfully"
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ 
            status: "Error", 
            message: "Login failed", 
            error: error.message 
        }, { status: 500 });
    }
        }