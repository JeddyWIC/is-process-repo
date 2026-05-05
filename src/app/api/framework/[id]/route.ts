import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { riskItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

async function isAuthorized() {
  const cookieStore = await cookies();
  return cookieStore.get("is-auth")?.value === "1";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const [item] = await db
      .select()
      .from(riskItems)
      .where(eq(riskItems.id, numId));
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...item,
      phases: item.phases ? JSON.parse(item.phases) : [],
      effects: item.effects ? JSON.parse(item.effects) : [],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const body = await req.json();
    const { type, title, description, effects, phases, notes, sortOrder } = body;
    if (!type || !title || !phases || !Array.isArray(phases) || phases.length === 0) {
      return NextResponse.json(
        { error: "type, title, and at least one phase are required" },
        { status: 400 }
      );
    }
    const [updated] = await db
      .update(riskItems)
      .set({
        type,
        title,
        description: description || null,
        effects: effects ? JSON.stringify(effects) : null,
        phases: JSON.stringify(phases),
        notes: notes || null,
        sortOrder: sortOrder ?? 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(riskItems.id, numId))
      .returning();
    return NextResponse.json({
      ...updated,
      phases: JSON.parse(updated.phases),
      effects: updated.effects ? JSON.parse(updated.effects) : [],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    await db.delete(riskItems).where(eq(riskItems.id, numId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
