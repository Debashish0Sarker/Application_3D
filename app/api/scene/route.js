import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Scene from '@/models/Scene';

// 🟢 1. GET: Fetch either a single named profile or a list of all profiles for a user
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const profileName = searchParams.get('profileName');

    if (!email) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 });
    }

    // If a specific profile name is supplied, return its elements
    if (profileName) {
      const savedScene = await Scene.findOne({ userEmail: email, profileName });
      return NextResponse.json({ sceneItems: savedScene ? savedScene.sceneItems : [] }, { status: 200 });
    }

    // Otherwise, find and return a list of all profile documents owned by this user
    const userProfiles = await Scene.find({ userEmail: email }).select('profileName updatedAt').sort({ updatedAt: -1 });
    return NextResponse.json({ profiles: userProfiles }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error fetching layout contexts' }, { status: 500 });
  }
}

// 🟢 2. POST: Create or Update a specific named profile
export async function POST(request) {
  try {
    await dbConnect();
    const { email, profileName, sceneItems } = await request.json();

    if (!email || !profileName) {
      return NextResponse.json({ error: 'Missing email or profile identifier name' }, { status: 400 });
    }

    const updatedScene = await Scene.findOneAndUpdate(
      { userEmail: email, profileName: profileName.trim() },
      { $set: { sceneItems, updatedAt: Date.now() } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, profile: updatedScene }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed persisting custom scene configuration' }, { status: 500 });
  }
}

// 🟢 3. DELETE: Clear an unwanted profile configuration layout
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const profileName = searchParams.get('profileName');

    if (!email || !profileName) {
      return NextResponse.json({ error: 'Required parameters missing' }, { status: 400 });
    }

    // Fixed key structure mapping to use userEmail field matching schema models
    const result = await Scene.findOneAndDelete({ userEmail: email, profileName: profileName });
    
    if (!result) {
      return NextResponse.json({ error: 'Target profile configuration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Profile deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed deleting requested record' }, { status: 500 });
  }
}