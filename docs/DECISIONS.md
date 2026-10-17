# Engineering Decisions — NexTalk

---

## Decision 1 — Ghost mode is enforced on the server

**Context:** A ghost must see the room without appearing in anyone's online list. Hiding them on the client (CSS, a filtered list in the browser) would still send their name to every client, where devtools could reveal it.

**Decision:** The ghost flag lives on the server (`socket.data.isGhost` and the room's user map). `presence-update` is only ever emitted through `broadcastPresence()`, which uses `visiblePresenceList()` to drop ghosts before sending.

**Reason:** A ghost's name never leaves the server, so there's nothing for another client to uncover. The smoke test asserts this against real sockets.

**Tradeoff:** Ghosts still join the Socket.IO room so they receive broadcasts, which means every presence path has to remember to filter. Having exactly one emit function keeps that manageable.

---

## Decision 2 — Reactions as a `Set` of socket ids per emoji

**Context:** Reactions need toggle behaviour (click again to un-react) and must not double-count.

**Decision:** Each message stores `{ '👍': Set, '❤️': Set, '😂': Set }`. `react` adds or removes the socket id, and the broadcast sends `set.size` per emoji.

**Reason:** Toggling and de-duplication come for free, and counts are always derived from the sets, so they can't drift.

**Tradeoff:** Reactions are tied to a socket, not a person. Reconnecting gives you a new id, so you can react again.

---

## Decision 3 — All state in memory, with limits

**Context:** Rooms are meant to be throwaway, and the app should run with no infrastructure.

**Decision:** Plain `Map`s for rooms, users and messages. History is capped at 200 messages per room, and a room is deleted when its last socket leaves.

**Reason:** Zero setup and instant reads and writes. The caps stop a busy or abandoned room from growing memory forever.

**Tradeoff:** A restart or deploy wipes everything, and the app can only run as one instance.

---

## Decision 4 — Render instead of Vercel

**Context:** Every other web app in this portfolio runs on Vercel.

**Decision:** NexTalk runs as a Render web service, and the same Express server serves the landing page at `/`, the chat client at `/chat/` and Socket.IO.

**Reason:** WebSockets need a long-lived process holding open connections. Serverless functions are short-lived and can't keep a socket open or share in-memory room state.

**Tradeoff:** Render's free tier sleeps after 15 minutes idle, so the first visit after a quiet spell takes up to a minute.

---

## Decision 5 — A real-socket smoke test instead of a test framework

**Context:** The core promise (ghosts are invisible, messages and reactions reach everyone) is about network behaviour.

**Decision:** `test/smoke-test.js` boots the real server on a test port, connects a normal and a ghost `socket.io-client`, and checks presence, delivery and reactions with Node's `assert`.

**Reason:** It tests the actual WebSocket path end to end with no extra dependencies. It runs with `npm test` and in CI.

**Tradeoff:** It's one script, not a suite, so failures are reported by assertion message rather than per-test output.

---

## What I'd do differently in v2

- **Redis for state** — rooms would survive restarts, and the Socket.IO Redis adapter would allow more than one instance.
- **Rate limiting** — cap messages per socket per second.
- **Reactions per user, not per socket** — so a reconnect doesn't allow a second reaction.

---

## Explicit non-decisions (deferred to v2)

| Feature | Why deferred |
|---|---|
| Accounts | Throwaway rooms are the point. Accounts add sign-up friction |
| Private rooms | Would need room passwords or invite links |
| Persistent history | Needs a database, and a retention policy |

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
