import { sendMessage } from "./actions";

export const metadata = { title: "Contact — Aum Garasia" };

export default function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // Next 15: searchParams is a Promise in RSC hooks
  async function Banner() {
    const sp = await searchParams;
    if (sp.sent)
      return (
        <p className="mb-4 rounded-lg border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-emerald-300">
          Thanks! I’ll get back to you soon.
        </p>
      );
    if (sp.error === "missing")
      return (
        <p className="mb-4 rounded-lg border border-amber-900 bg-amber-950/50 px-3 py-2 text-amber-300">
          Please fill all fields.
        </p>
      );
    if (sp.error === "send")
      return (
        <p className="mb-4 rounded-lg border border-rose-900 bg-rose-950/50 px-3 py-2 text-rose-300">
          Could not send message. Try again later.
        </p>
      );
    return null;
  }

  return (
    <main className="max-w-xl">
      <h1 className="mb-4 text-2xl font-semibold">Contact</h1>
      {/* @ts-expect-error Async Server Component */}
      <Banner />
      <form className="space-y-3" action={sendMessage}>
        {/* honeypot */}
        <input
          type="text"
          name="bot-field"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div>
          <label className="mb-1 block text-sm text-neutral-400" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:ring-1 focus:ring-neutral-600"
            required
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-neutral-400"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:ring-1 focus:ring-neutral-600"
            required
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-neutral-400"
            htmlFor="message"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:ring-1 focus:ring-neutral-600"
            required
          />
        </div>

        <SubmitButton />
      </form>
    </main>
  );
}

// small client button to show pending state
function SubmitButton() {
  return (
    <button
      className="rounded-xl border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
      type="submit"
    >
      Send
    </button>
  );
}
