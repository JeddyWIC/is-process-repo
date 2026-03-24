import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachments } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// Download attachment
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, parseInt(id)));

    if (!attachment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = Buffer.from(attachment.data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `attachment; filename="${attachment.filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Delete attachment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.delete(attachments).where(eq(attachments.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
