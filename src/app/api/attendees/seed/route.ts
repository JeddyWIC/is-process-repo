import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendeeList } from "@/lib/schema";

const SEED: { name: string; isOptional: boolean }[] = [
  { name: "Ahlgrim", isOptional: false },
  { name: "Benett", isOptional: true },
  { name: "Carlson", isOptional: false },
  { name: "Dumbauld", isOptional: false },
  { name: "Holiday", isOptional: false },
  { name: "Kittles", isOptional: true },
  { name: "Kopel", isOptional: false },
  { name: "Montgomery", isOptional: false },
  { name: "Mueller", isOptional: false },
  { name: "Nau", isOptional: false },
  { name: "Reynolds", isOptional: false },
  { name: "Sar", isOptional: false },
  { name: "Sargent", isOptional: true },
  { name: "Wells", isOptional: false },
  { name: "Williams", isOptional: false },
];

export async function POST() {
  try {
    const existing = await db.select().from(attendeeList);
    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Attendee list already populated. Skipping.",
        existing: existing.length,
      });
    }
    const now = new Date().toISOString();
    const rows = SEED.map((item, idx) => ({
      name: item.name,
      isOptional: item.isOptional,
      sortOrder: idx,
      createdAt: now,
    }));
    await db.insert(attendeeList).values(rows);
    return NextResponse.json({ success: true, count: rows.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
