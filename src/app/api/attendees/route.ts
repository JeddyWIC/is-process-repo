import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendeeList } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(attendeeList)
      .orderBy(asc(attendeeList.sortOrder), asc(attendeeList.name));
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const isOptional = !!body.isOptional;
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    // Determine sort order: append to end
    const existing = await db.select().from(attendeeList);
    const sortOrder = existing.length;
    const [created] = await db
      .insert(attendeeList)
      .values({
        name,
        isOptional,
        sortOrder,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return NextResponse.json(created);
  } catch (error) {
    const msg = String(error);
    if (msg.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "That name is already on the list" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
