import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { riskItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Maps existing long titles to scannable short titles + tightened descriptions.
// Lookup also matches the new title (idempotent: safe to re-run).
const SIMPLIFY: {
  match: string[];
  title: string;
  description: string;
}[] = [
  {
    match: [
      "Accurate documentation of existing building systems",
      "Existing Conditions",
    ],
    title: "Existing Conditions",
    description:
      "Scan and verify building conditions — obstructions, dimensions, dwgs.",
  },
  {
    match: [
      "Accurate design of tie-ins to existing systems",
      "Tie-Ins",
    ],
    title: "Tie-Ins",
    description:
      "Field-observe existing systems before designing tie-ins. Avoid surprise materials.",
  },
  {
    match: [
      "Accurate design of headers, drops, & sills",
      "Headers, Drops & Sills",
    ],
    title: "Headers, Drops & Sills",
    description:
      "Get headers, drops, and drop-rod locations right up front — they dictate everything downstream.",
  },
  {
    match: [
      "Catwalk & Handrail shop fabrication",
      "Catwalks & Handrails",
    ],
    title: "Catwalks & Handrails",
    description:
      "Shop drawings must reflect actual field dimensions. Minimize field fabrication.",
  },
  {
    match: ["Proper skilled supervision", "Supervision"],
    title: "Supervision",
    description:
      "Match the right super to the right scope, site, and client.",
  },
  {
    match: ["Proper skilled tradesmen", "Tradesmen"],
    title: "Tradesmen",
    description:
      "Vet crews early. Quality over quantity — remove non-performers fast.",
  },
  {
    match: ["Contract & Change Management", "Contracts & COs"],
    title: "Contracts & COs",
    description:
      "Know the contract. Get formal CO approval before executing changed work.",
  },
  {
    match: ["Specifications"],
    title: "Specifications",
    description:
      "Read and meet every spec. Missed specs cause confusion, delays, and cost.",
  },
  {
    match: [
      "Clear Simple Quality Control Plan",
      "QC Plan",
    ],
    title: "QC Plan",
    description:
      "Simple checklist tied to contract docs. Catch deficiencies before inspection.",
  },
  {
    match: ["ZERO Punch list program", "Punch Lists"],
    title: "Punch Lists",
    description:
      "Finish each system in one sweep. Dedicated rough/detail/final crews.",
  },
  {
    match: ["Effective use of RFIs", "RFIs"],
    title: "RFIs",
    description:
      "Document responsibility, cost impact, and time impact — push it back to the owner.",
  },
  {
    match: [
      "Accurate representation and early communication",
      "Schedule Comms",
    ],
    title: "Schedule Comms",
    description:
      "Forecast honestly. Communicate early. Recover before it becomes a crisis.",
  },
];

export async function POST() {
  try {
    const all = await db.select().from(riskItems);
    let updated = 0;
    for (const item of all) {
      const entry = SIMPLIFY.find((s) => s.match.includes(item.title));
      if (!entry) continue;
      await db
        .update(riskItems)
        .set({
          title: entry.title,
          description: entry.description,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(riskItems.id, item.id));
      updated++;
    }
    return NextResponse.json({
      success: true,
      updated,
      total: all.length,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
