import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Sign in · Alaska 2026" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { next, sent } = await searchParams;

  const { data: adults } = await supabase
    .from("profiles")
    .select("id, name, email, display_color, household")
    .eq("role", "adult")
    .order("household", { ascending: false })
    .order("name");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-serif text-coral text-sm tracking-widest uppercase mb-2">Alaska 2026</p>
          <h1 className="font-serif text-4xl font-semibold text-balance">
            Welcome to the planning board
          </h1>
          <p className="mt-3 text-ink-muted text-pretty">
            June 17 – July 2. Sign in with the email you were invited at.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm adults={adults ?? []} next={next} sent={sent === "1"} />
        </Suspense>
      </div>
    </main>
  );
}
