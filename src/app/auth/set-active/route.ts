import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACTIVE_PROFILE_COOKIE, getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthed" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  const allowed = [session.me.id, ...session.managed.map((k) => k.id)];
  if (!allowed.includes(id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const jar = await cookies();
  jar.set(ACTIVE_PROFILE_COOKIE, id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return NextResponse.json({ ok: true, id });
}
