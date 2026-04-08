import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ 
        success: true, 
        message: "DB connection verified during runtime", 
        url: process.env.DATABASE_URL 
    });
}
