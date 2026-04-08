import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("DB migration via API is disabled. Using Prisma for migrations.");
    return NextResponse.json({ success: true, message: "Use 'npx prisma db push' or 'npx prisma migrate' instead." });
}
