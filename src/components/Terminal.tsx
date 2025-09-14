"use client";
import { useEffect, useState } from "react";

type Command = (args: string[]) => string | Promise<string>;

const builtins: Record<string, Command> = {
  help: () =>
    [
      "commands:",
      "  help — show this help",
      "  about — quick bio",
      "  work — jump to projects",
      "  contact — open contact page",
      "  theme <dark|light> — toggle theme",
      "  echo <text> — print text",
    ].join("\n"),
  echo: (args) => args.join(" "),
  about: () =>
    "Aum: creative full‑stack engineering @ scale. Loves art, music, and Soulsborne.",
  work: () => {
    const el = document.querySelector("#work");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    return "→ scrolled to work";
  },
  contact: () => {
    window.location.href = "/contact";
    return "opening /contact…";
  },
  theme: ([mode]) => {
    if (mode === "light") document.documentElement.classList.remove("dark");
    else document.documentElement.classList.add("dark");
    return `theme → ${mode || "dark"}`;
  },
  whoami: () => "garasia",
  ls: () => ["/", "/work", "/about", "/contact"].join(""),
  date: () => new Date().toString(),
  clear: (_, __, set?: any) => {
    if (set) set([]);
    return "";
  },
};

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>(["type `help` to start"]);
  const [cmd, setCmd] = useState("");
  const [cursor, setCursor] = useState(0);

  // Toggle with backtick
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`") setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const seq = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let i = 0;
    const onKonami = (e: KeyboardEvent) => {
      i = e.key === seq[i] ? i + 1 : 0;
      if (i === seq.length) {
        setOpen(true);
        document.documentElement.classList.add("crt");
        i = 0;
      }
    };
    window.addEventListener("keydown", onKonami);
    return () => window.removeEventListener("keydown", onKonami);
  }, []);

  // Simple command history nav with ArrowUp/Down
  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const [name, ...args] = cmd.trim().split(/\s+/);
      const fn = builtins[name] || (() => `command not found: ${name}`);
      const out = await (fn as any)(args, undefined, setHistory);
      setHistory((H) => [...H, `> ${cmd}`, String(out)]);
      setCmd("");
      setCursor(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const cmds = history
        .filter((h) => h.startsWith("> "))
        .map((h) => h.slice(2));
      if (!cmds.length) return;
      const idx = Math.max(0, cmds.length - 1 - cursor);
      setCmd(cmds[idx]);
      setCursor((c) => Math.min(cmds.length - 1, c + 1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const cmds = history
        .filter((h) => h.startsWith("> "))
        .map((h) => h.slice(2));
      if (!cmds.length) return;
      const idx = Math.max(0, cmds.length - 1 - (cursor - 1));
      setCmd(cmds[idx] || "");
      setCursor((c) => Math.max(0, c - 1));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur">
      <div className="mx-auto mt-16 w-[min(900px,92vw)] rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-sm text-neutral-200 shadow-2xl">
        <div className="mb-3 flex items-center justify-between text-neutral-400">
          <span>aum@portfolio:~</span>
          <button
            className="rounded-lg border border-neutral-800 px-2 py-1 hover:bg-neutral-900"
            onClick={() => setOpen(false)}
            aria-label="Close terminal"
          >
            close
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto space-y-1">
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span>&gt;</span>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            className="flex-1 bg-transparent outline-none placeholder-neutral-600"
            placeholder="type a command, e.g., help"
            aria-label="terminal input"
          />
        </div>
      </div>
    </div>
  );
}
