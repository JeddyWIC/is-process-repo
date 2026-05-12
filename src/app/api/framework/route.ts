import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { riskItems } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const frameworkIdParam = url.searchParams.get("frameworkId");
    const frameworkId = frameworkIdParam ? parseInt(frameworkIdParam, 10) : null;

    const items = frameworkId
      ? await db
          .select()
          .from(riskItems)
          .where(eq(riskItems.frameworkId, frameworkId))
          .orderBy(asc(riskItems.sortOrder), asc(riskItems.id))
      : await db
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

export async function POST(req: Request) {
  // Risk Roadmaps are open for team collaboration — no auth gate on writes.
  try {
    const body = await req.json();
    const { type, title, description, effects, phases, tags, notes, sortOrder, frameworkId } = body;
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
        frameworkId: frameworkId ?? null,
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
