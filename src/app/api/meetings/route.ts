import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meetings } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const results = await db
      .select()
      .from(meetings)
      .orderBy(desc(meetings.date))
      .limit(50);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, time, location, facilitator, attendees, content } = body;

    if (!date || !content) {
      return NextResponse.json({ error: "Date and content are required" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const [meeting] = await db
      .insert(meetings)
      .values({
        date,
        time: time || null,
        location: location || null,
        facilitator: facilitator || null,
        attendees: attendees ? JSON.stringify(attendees) : null,
        content,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
