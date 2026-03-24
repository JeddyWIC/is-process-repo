import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { images } from "@/lib/schema";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const processId = formData.get("processId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    if (processId) {
      const [image] = await db
        .insert(images)
        .values({
          processId: parseInt(processId),
          filename: file.name,
          data: dataUrl,
        })
        .returning();
      return NextResponse.json(image, { status: 201 });
    }

    // Return base64 data URL for inline editor use (before process is saved)
    return NextResponse.json({ url: dataUrl, filename: file.name });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
