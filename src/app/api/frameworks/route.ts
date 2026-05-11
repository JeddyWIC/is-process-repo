import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { frameworks, riskItems } from "@/lib/schema";
import { asc, eq, sql } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: frameworks.id,
        name: frameworks.name,
        description: frameworks.description,
        sortOrder: frameworks.sortOrder,
        createdAt: frameworks.createdAt,
        updatedAt: frameworks.updatedAt,
        itemCount: sql<number>`count(${riskItems.id})`.as("item_count"),
      })
      .from(frameworks)
      .leftJoin(riskItems, eq(riskItems.frameworkId, frameworks.id))
      .groupBy(frameworks.id)
      .orderBy(asc(frameworks.sortOrder), asc(frameworks.id));
    return NextResponse.json(rows);
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
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const description = body.description?.trim() || null;

    // Append to end
    const existing = await db.select({ id: frameworks.id }).from(frameworks);
    const sortOrder = existing.length;
    const now = new Date().toISOString();

    const [created] = await db
      .insert(frameworks)
      .values({
        name,
        description,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({ ...created, itemCount: 0 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
