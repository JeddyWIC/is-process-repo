import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { riskItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Maps existing seeded titles to suggested tag sets so that the
// previously-loaded 12 items get tagged without manual editing.
const TAG_MAP: Record<string, string[]> = {
  "Accurate documentation of existing building systems": [
    "site survey",
    "scanning",
    "drawings",
    "dimensions",
    "obstructions",
    "field observation",
    "existing conditions",
  ],
  "Accurate design of tie-ins to existing systems": [
    "tie-ins",
    "field observation",
    "materials",
    "coordination",
    "existing systems",
  ],
  "Accurate design of headers, drops, & sills": [
    "drawings",
    "headers",
    "drops",
    "sills",
    "drop rods",
    "field changes",
    "installation",
    "fabrication",
  ],
  "Catwalk & Handrail shop fabrication": [
    "shop drawings",
    "catwalks",
    "handrails",
    "fabrication",
    "field dimensions",
  ],
  "Proper skilled supervision": [
    "supervision",
    "personnel",
    "staffing",
    "leadership",
    "project assignment",
    "team",
  ],
  "Proper skilled tradesmen": [
    "crew",
    "tradesmen",
    "personnel",
    "productivity",
    "staffing",
    "labor",
  ],
  "Contract & Change Management": [
    "contracts",
    "change orders",
    "COs",
    "approvals",
    "scope",
    "specifications",
    "drawings",
  ],
  "Specifications": [
    "specs",
    "drawings",
    "contract documents",
    "design",
    "compliance",
  ],
  "Clear Simple Quality Control Plan": [
    "quality control",
    "QC",
    "checklists",
    "inspections",
    "deficiencies",
    "punch list prevention",
  ],
  "ZERO Punch list program": [
    "punch list",
    "completion",
    "workflow",
    "rough installation",
    "detailing",
    "final completion",
    "quality",
  ],
  "Effective use of RFIs": [
    "RFIs",
    "documentation",
    "owner responsibility",
    "delegation",
    "schedule extension",
    "additional cost",
  ],
  "Accurate representation and early communication": [
    "scheduling",
    "schedule",
    "forecasting",
    "communication",
    "recovery",
    "trust",
  ],
};

export async function POST() {
  try {
    const all = await db.select().from(riskItems);
    let updated = 0;
    for (const item of all) {
      const tags = TAG_MAP[item.title];
      if (tags) {
        await db
          .update(riskItems)
          .set({
            tags: JSON.stringify(tags),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(riskItems.id, item.id));
        updated++;
      }
    }
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
