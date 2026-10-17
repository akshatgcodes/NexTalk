import type { ReactNode } from "react";

type Message = {
  id: string;
  user: string;
  color: string;
  time: string;
  text: string;
  reactions: { emoji: string; count: number }[];
};

const onlineUsers = [
  { name: "priya", color: "bg-emerald-400" },
  { name: "dev_marcus", color: "bg-sky-400" },
  { name: "quinn", color: "bg-amber-400" },
  { name: "l4ur3n", color: "bg-fuchsia-400" },
];

const messages: Message[] = [
  {
    id: "1",
    user: "priya",
    color: "text-emerald-400",
    time: "9:41 PM",
    text: "ok who's ready to actually ship this feature tonight 👀",
    reactions: [{ emoji: "😂", count: 2 }],
  },
  {
    id: "2",
    user: "dev_marcus",
    color: "text-sky-400",
    time: "9:41 PM",
    text: "I've been in #general since 8, just watching honestly",
    reactions: [{ emoji: "👍", count: 3 }],
  },
  {
    id: "3",
    user: "quinn",
    color: "text-amber-400",
    time: "9:42 PM",
    text: "reacted without saying a word, love that for us",
    reactions: [
      { emoji: "❤️", count: 1 },
      { emoji: "😂", count: 1 },
    ],
  },
  {
    id: "4",
    user: "l4ur3n",
    color: "text-fuchsia-400",
    time: "9:42 PM",
    text: "someone's definitely lurking in here rn, the room count doesn't add up 👻",
    reactions: [],
  },
];

const techBadges = [
  "Node.js",
  "Express",
  "Socket.IO",
  "WebSockets",
  "Selective Broadcasting",
  "In-memory Reaction State",
  "Presence Tracking",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <XFactor />
        <ChatMockup />
        <TechStack />
        <RunIt />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 text-sm font-bold text-zinc-950">
            NT
          </span>
          <span className="text-lg font-semibold tracking-tight">
            NexTalk
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
          <a href="#x-factor" className="transition hover:text-zinc-100">
            X Factor
          </a>
          <a href="#preview" className="transition hover:text-zinc-100">
            Preview
          </a>
          <a href="#run-it" className="transition hover:text-zinc-100">
            Run it
          </a>
        </nav>
        <a
          href="/chat/"
          className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
        >
          Open the chat
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(52,211,153,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.16), transparent 45%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            Real-time · rooms · reactions · one toggle to disappear
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
            Chat live. React live.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
              Or don&apos;t exist at all.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            NexTalk is a browser-based real-time chat app. Pick a username,
            drop into a room, and talk instantly — multiple rooms, multiple
            people, zero setup. Built on Node.js and Socket.IO, with a
            presence system that knows exactly who to tell what.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/chat/"
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
            >
              Try it live
            </a>
            <a
              href="#x-factor"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/5"
            >
              See the X Factor
            </a>
            <a
              href="#run-it"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/5"
            >
              Run it locally
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function XFactor() {
  return (
    <section id="x-factor" className="border-b border-white/5 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            The X Factor
          </h2>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Two people can read the same room. Only one of them is really
            there.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <FeatureCard
            icon="👻"
            title="Ghost mode"
            accent="from-fuchsia-500/20 to-transparent"
          >
            <p>
              Append <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-fuchsia-300">?ghost=true</code>{" "}
              to a room URL and you join as a silent observer. You see every
              message live, as it happens — but you never show up in the
              online-users list, and no one gets a &ldquo;joined the
              room&rdquo; notice for you.
            </p>
            <p className="mt-4">
              This isn&apos;t a client-side trick. The server tracks each
              socket&apos;s presence flag independently and only broadcasts
              presence events — join, leave, user list updates — to sockets
              that should see them. Ghosts still receive every{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-fuchsia-300">
                chat message
              </code>{" "}
              event; they&apos;re simply excluded from the{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-fuchsia-300">
                user list
              </code>{" "}
              broadcast. One toggle flips you back to visible, and the room
              immediately knows you&apos;re there.
            </p>
          </FeatureCard>

          <FeatureCard
            icon="⚡"
            title="Live reactions"
            accent="from-sky-500/20 to-transparent"
          >
            <p>
              Every message can be reacted to with 👍 ❤️ or 😂. Counts update
              for everyone in the room in real time, no page refresh, no
              polling — a reaction event fires, the server updates its
              in-memory count for that message, and rebroadcasts the new
              total to the whole room instantly.
            </p>
            <p className="mt-4">
              It turns a chat log into something closer to a shared, living
              surface — you can feel a room agree, laugh, or go quiet in real
              time, the same way you&apos;d feel it in person.
            </p>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  accent,
  children,
}: {
  icon: string;
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${accent} blur-2xl`}
      />
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">
          {icon}
        </div>
        <h3 className="mt-5 text-xl font-semibold text-zinc-50">{title}</h3>
        <div className="mt-3 text-[15px] leading-7 text-zinc-400">
          {children}
        </div>
      </div>
    </div>
  );
}

function ChatMockup() {
  return (
    <section id="preview" className="border-b border-white/5">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Preview
          </h2>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Inside room #launch-night
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-zinc-900/80 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-amber-500/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
            <span className="ml-3 font-mono text-xs text-zinc-500">
              localhost:3000/room/launch-night
            </span>
          </div>

          {/* online users pill bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/5 bg-zinc-900/60 px-5 py-3">
            <span className="text-xs font-medium text-zinc-500">
              Online — 4
            </span>
            {onlineUsers.map((u) => (
              <span
                key={u.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${u.color}`} />
                {u.name}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-fuchsia-400/30 bg-fuchsia-400/5 px-2.5 py-1 text-xs text-fuchsia-300/70">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400/40" />
              1 lurking · not shown
            </span>
          </div>

          {/* messages */}
          <div className="flex flex-col gap-5 px-5 py-6">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold ${m.color}`}>
                    {m.user}
                  </span>
                  <span className="text-[11px] text-zinc-600">{m.time}</span>
                </div>
                <p className="max-w-lg rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-2.5 text-[15px] leading-6 text-zinc-200">
                  {m.text}
                </p>
                {m.reactions.length > 0 && (
                  <div className="flex gap-1.5">
                    {m.reactions.map((r) => (
                      <span
                        key={r.emoji}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-300"
                      >
                        <span>{r.emoji}</span>
                        <span className="text-zinc-500">{r.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1 text-xs text-fuchsia-300/60">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400/50 animate-pulse-dot" />
              someone is reading this room right now, invisibly
            </div>
          </div>

          {/* composer */}
          <div className="flex items-center gap-3 border-t border-white/5 bg-zinc-900/80 px-5 py-4">
            <div className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-500">
              Message #launch-night
            </div>
            <span className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950">
              Send
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="border-b border-white/5 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Under the hood
          </h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
            Small stack, deliberate mechanics
          </p>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {techBadges.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function RunIt() {
  return (
    <section id="run-it" className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Run it
            </h2>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
              Two commands. That&apos;s the whole setup.
            </p>
            <p className="mt-5 text-[15px] leading-7 text-zinc-400">
              NexTalk runs on plain Node.js with Express serving the client
              and Socket.IO handling every real-time event — no build step,
              no database, no config. Clone it, install, and it&apos;s live
              on your machine in under a minute.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-400">
              <li className="flex gap-2.5">
                <span className="text-emerald-400">→</span>
                Open{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-zinc-200">
                  localhost:3000
                </code>
                , enter a username and room name
              </li>
              <li className="flex gap-2.5">
                <span className="text-emerald-400">→</span>
                Chat live, react to messages, watch presence update instantly
              </li>
              <li className="flex gap-2.5">
                <span className="text-emerald-400">→</span>
                Add{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-zinc-200">
                  ?ghost=true
                </code>{" "}
                to the room URL to lurk invisibly
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/30">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 font-mono text-xs text-zinc-500">
                terminal
              </span>
            </div>
            <pre className="overflow-x-auto px-5 py-6 font-mono text-[13px] leading-7 text-zinc-300">
              <code>
                <span className="text-zinc-600"># clone &amp; enter the project</span>
                {"\n"}
                <span className="text-emerald-400">git</span> clone
                https://github.com/akshatgcodes/NexTalk.git{"\n"}
                <span className="text-emerald-400">cd</span> NexTalk{"\n\n"}
                <span className="text-zinc-600"># install dependencies</span>
                {"\n"}
                <span className="text-emerald-400">npm</span> install{"\n\n"}
                <span className="text-zinc-600"># start the server</span>
                {"\n"}
                <span className="text-emerald-400">node</span> server.js
                {"\n\n"}
                <span className="text-zinc-600"># → listening on http://localhost:3000</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-sky-500 text-[10px] font-bold text-zinc-950">
            NT
          </span>
          <span>NexTalk — real-time chat, with ghosts.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Licensed under GPLv3</span>
          <span className="text-zinc-700">·</span>
          <span>Node.js + Express + Socket.IO</span>
        </div>
      </div>
    </footer>
  );
}
