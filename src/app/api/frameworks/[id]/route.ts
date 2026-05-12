import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { frameworks } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const [fw] = await db
      .select()
      .from(frameworks)
      .where(eq(frameworks.id, numId));
    if (!fw) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(fw);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Risk Roadmaps are open for team collaboration — no auth gate on writes.
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const body = await req.json();
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const description = body.description?.trim() || null;

    const [updated] = await db
      .update(frameworks)
      .set({
        name,
        description,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(frameworks.id, numId))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Risk Roadmaps are open for team collaboration — no auth gate on writes.
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    await db.delete(frameworks).where(eq(frameworks.id, numId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
