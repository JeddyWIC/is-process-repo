import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { attendeeList } from "@/lib/schema";
import { eq } from "drizzle-orm";

async function isAuthorized() {
  const cookieStore = await cookies();
  return cookieStore.get("is-auth")?.value === "1";
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
    await db.delete(attendeeList).where(eq(attendeeList.id, numId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
