import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { riskItems } from "@/lib/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(riskItems)
      .orderBy(asc(riskItems.sortOrder), asc(riskItems.id));
    return NextResponse.json(
      items.map((i) => ({
        ...i,
        phases: i.phases ? JSON.parse(i.phases) : [],
        effects: i.effects ? JSON.parse(i.effects) : [],
        tags: i.tags ? JSON.parse(i.tags) : [],
      }))
    );
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function isAuthorized() {
  const cookieStore = await cookies();
  return cookieStore.get("is-auth")?.value === "1";
}

export async function POST(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { type, title, description, effects, phases, tags, notes, sortOrder } = body;
    if (!type || !title || !phases || !Array.isArray(phases) || phases.length === 0) {
      return NextResponse.json(
        { error: "type, title, and at least one phase are required" },
        { status: 400 }
      );
    }
    const now = new Date().toISOString();
    const [created] = await db
      .insert(riskItems)
      .values({
        type,
        title,
        description: description || null,
        effects: effects ? JSON.stringify(effects) : null,
        phases: JSON.stringify(phases),
        tags: tags && Array.isArray(tags) && tags.length > 0 ? JSON.stringify(tags) : null,
        notes: notes || null,
        sortOrder: sortOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return NextResponse.json({
      ...created,
      phases: JSON.parse(created.phases),
      effects: created.effects ? JSON.parse(created.effects) : [],
      tags: created.tags ? JSON.parse(created.tags) : [],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
