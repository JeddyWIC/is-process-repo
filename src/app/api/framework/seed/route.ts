import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { riskItems } from "@/lib/schema";

const SEED = [
  {
    type: "Engineering",
    title: "Accurate documentation of existing building systems",
    description:
      "Scanning and confirming scan of building conditions, including obstructions and drawing dimensions. Unplanned and unaccounted for issues can cause major delays, and stop work.",
    effects: ["Delays", "Efficiency", "Rework", "Material"],
    phases: ["BID", "PRECON"],
  },
  {
    type: "Engineering",
    title: "Accurate design of tie-ins to existing systems",
    description:
      "Field observation of existing systems ensure proper tie-ins are accounted for and do not cause major delays for unaccounted for materials required.",
    effects: ["Delays", "Efficiency", "Rework", "Material"],
    phases: ["PRECON"],
  },
  {
    type: "Engineering",
    title: "Accurate design of headers, drops, & sills",
    description:
      "Field teams are efficient when they can work the drawings as planned. Field changes to design take additional time, reduce efficiency and create confusion. Headers and drops dictate the rest of the installation, conflicts for drop rods impeding access cause rework and slow progress.",
    effects: ["Delays", "Efficiency", "Rework", "Material"],
    phases: ["PRECON"],
  },
  {
    type: "Engineering",
    title: "Catwalk & Handrail shop fabrication",
    description:
      "Accurate shop drawings accounting for field dimensions create proper fabrication of materials in the shop and reduce field fabrication.",
    effects: ["Delays", "Efficiency", "Rework", "Material"],
    phases: ["PRECON"],
  },
  {
    type: "Supervision",
    title: "Proper skilled supervision",
    description:
      "Teaming the right personnel with the right project scope, site and client is essential to a successful project.",
    effects: ["Efficiency", "Time", "Cost"],
    phases: ["BID", "PRECON", "CONSTRUCTION"],
  },
  {
    type: "Tradesmen",
    title: "Proper skilled tradesmen",
    description:
      "Early understanding of the crews ability to perform is essential to project success. Catching and removing troublesome tradesmen is often beneficial to the project even with smaller numbers. It is not always better to have more workers IF some are impeding productivity.",
    effects: ["Delays", "Efficiency", "Time", "Cost"],
    phases: ["CONSTRUCTION"],
  },
  {
    type: "Project Management",
    title: "Contract & Change Management",
    description:
      "Full understanding of the contract terms, specifications and drawings. Staying ahead of potential change orders and receiving formal approval before change work is executed.",
    effects: ["Cost"],
    phases: ["BID", "PRECON", "CONSTRUCTION", "COMMISSIONING"],
  },
  {
    type: "PM / Engineering",
    title: "Specifications",
    description:
      "Proper understanding of required specifications per the project documents, ensure proper design and create efficiency in the field. Missed spec components cause confusion, delays and cost.",
    effects: ["Delays", "Cost", "Rework"],
    phases: ["BID", "PRECON"],
  },
  {
    type: "Quality Control",
    title: "Clear Simple Quality Control Plan",
    description:
      "Simple checklist encompassing contract document (specs, dwgs, contract) requirements; competent personnel responsible for accurately recording completion AND/OR marking deficiencies for correction BEFORE scheduled inspections to reduce punch lists.",
    effects: ["Efficiency", "Cost", "Time"],
    phases: ["PRECON", "CONSTRUCTION", "COMMISSIONING"],
  },
  {
    type: "Punch List Management",
    title: "ZERO Punch list program",
    description:
      "Completion of all work required on a single system before moving away from work area. Specific workflow teams (Rough Installation, Detailing, Final Completion). Dedicated, competent personnel with the ability to communicate with the installation team on incomplete work. Active checklist of incomplete items IF area of work CANNOT be completed in one sweep and return for completion is required.",
    effects: ["Efficiency", "Cost", "Time"],
    phases: ["CONSTRUCTION", "COMMISSIONING"],
  },
  {
    type: "RFI Management",
    title: "Effective use of RFIs",
    description:
      "Utilizing RFIs is probably the best method for delegation of responsibility to the owner and away from WIC. This accurately documents the construction process, potential additional costs as well as extended time.",
    effects: ["Risk", "Cost", "Time"],
    phases: ["PRECON", "CONSTRUCTION"],
  },
  {
    type: "Schedule Management",
    title: "Accurate representation and early communication",
    description:
      'Proper forecasting and clear communication creates trust AND allows early detection of recovery in lieu of "knee jerk response" potentially adding unnecessary costs to the project and reduced profits.',
    effects: ["Risk", "Cost", "Time"],
    phases: ["BID", "PRECON", "CONSTRUCTION", "COMMISSIONING"],
  },
];

export async function POST() {
  try {
    const now = new Date().toISOString();
    const rows = SEED.map((item, idx) => ({
      type: item.type,
      title: item.title,
      description: item.description,
      effects: JSON.stringify(item.effects),
      phases: JSON.stringify(item.phases),
      notes: null,
      sortOrder: idx,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(riskItems).values(rows);
    return NextResponse.json({ success: true, count: rows.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
