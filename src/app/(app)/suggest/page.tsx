import { SuggestForm } from "./suggest-form";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Suggest an activity · Alaska 2026" };

export default async function SuggestPage() {
  const session = await requireSession();
  return (
    <div className="container-prose py-6 md:py-10 max-w-2xl space-y-6">
      <header className="space-y-2">
        <p className="text-coral text-xs font-medium uppercase tracking-widest">New idea</p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold">Suggest an activity</h1>
        <p className="text-ink-muted text-pretty">
          Add it to the pending queue. Anyone in the group can promote it to the main board.
        </p>
      </header>
      <SuggestForm
        activeProfileId={session.active.id}
        activeProfileName={session.active.name}
      />
    </div>
  );
}
