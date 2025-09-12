export const metadata = { title: "Contact — Aum Garasia" };

export default function ContactPage() {
  return (
    <main className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Contact</h1>
      <p className="text-neutral-400 mb-6">
        Got a project or a question? Send a note.
      </p>
      {/**
       * NOTE: This is a Server Component (default in /app). Do NOT attach onSubmit/onChange/etc here.
       * We'll wire a real Server Action in Step 4. For now, keep it static to avoid the error.
       */}
      <form className="space-y-3" action="#">
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
            placeholder="Tell me about your idea…"
          />
        </div>
        {/* Keep this a simple link-style button for now to avoid form POST navigation */}
        <button
          className="rounded-xl border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
          type="button"
        >
          Send (mock)
        </button>
      </form>
      <p className="mt-6 text-sm text-neutral-500">
        We’ll hook this to a Server Action (Resend) in Step 4.
      </p>
    </main>
  );
}
