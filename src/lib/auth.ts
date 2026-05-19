import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRow } from "@/lib/types";

export const ACTIVE_PROFILE_COOKIE = "active_profile_id";

export interface SessionContext {
  authUserId: string;
  me: UserRow;
  managed: UserRow[];
  active: UserRow;
}

export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: me } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!me) return null;

  const { data: kids } = await supabase
    .from("profiles")
    .select("*")
    .eq("managed_by_id", me.id);

  const all: UserRow[] = [me as UserRow, ...((kids ?? []) as UserRow[])];

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value ?? me.id;
  const active = all.find((p) => p.id === activeId) ?? (me as UserRow);

  return {
    authUserId: user.id,
    me: me as UserRow,
    managed: (kids ?? []) as UserRow[],
    active,
  };
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
