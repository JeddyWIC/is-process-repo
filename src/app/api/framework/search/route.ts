import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { riskItems, processes, processTags, tags as tagsTable } from "@/lib/schema";
import { like, or, eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) {
      return NextResponse.json({ frameworkItems: [], processes: [] });
    }
    const pattern = `%${q}%`;

    // Framework items: search title, description, type, tags, notes
    const frameworkRows = await db
      .select()
      .from(riskItems)
      .where(
        or(
          like(riskItems.title, pattern),
          like(riskItems.description, pattern),
          like(riskItems.type, pattern),
          like(riskItems.tags, pattern),
          like(riskItems.notes, pattern)
        )
      );
    const frameworkItems = frameworkRows.map((i) => ({
      ...i,
      phases: i.phases ? JSON.parse(i.phases) : [],
      effects: i.effects ? JSON.parse(i.effects) : [],
      tags: i.tags ? JSON.parse(i.tags) : [],
    }));

    // SOPs: title, content, author. Limit to top 20 most recently updated.
    const processRows = await db
      .select({
        id: processes.id,
        title: processes.title,
        author: processes.author,
        category: processes.category,
        updatedAt: processes.updatedAt,
      })
      .from(processes)
      .where(
        or(
          like(processes.title, pattern),
          like(processes.content, pattern),
          like(processes.author, pattern)
        )
      )
      .orderBy(desc(processes.updatedAt))
      .limit(20);

    // Also include processes that match by tag name
    const tagMatches = await db
      .select({
        id: processes.id,
        title: processes.title,
        author: processes.author,
        category: processes.category,
        updatedAt: processes.updatedAt,
      })
      .from(processes)
      .innerJoin(processTags, eq(processTags.processId, processes.id))
      .innerJoin(tagsTable, eq(tagsTable.id, processTags.tagId))
      .where(like(tagsTable.name, pattern))
      .limit(20);

    const seen = new Set(processRows.map((p) => p.id));
    const merged = [...processRows];
    for (const m of tagMatches) {
      if (!seen.has(m.id)) {
        merged.push(m);
        seen.add(m.id);
      }
    }

    return NextResponse.json({
      frameworkItems,
      processes: merged.slice(0, 20),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
