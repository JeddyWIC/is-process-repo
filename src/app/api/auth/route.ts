import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (verifyPassword(password)) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("is_process_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
}

export async function GET() {
  const { isAuthenticated } = await import("@/lib/auth");
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("is_process_auth", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
