import { Nav } from "@/components/nav";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  const supabase = await createClient();
  const { count } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <>
      <Nav me={session.me} managed={session.managed} active={session.active} pendingCount={count ?? 0} />
      <main className="flex-1 pb-24 md:pb-12">{children}</main>
    </>
  );
}
