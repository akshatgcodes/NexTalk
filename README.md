# NexTalk

Browser-based real-time chat built with Node.js, Express, and Socket.IO. Join a named room, chat live with everyone in it, see who's online without refreshing the page, and react to messages in real time — plus lurk invisibly with **ghost mode**.

## What it does

- Enter a username and a room name to join (rooms are created on demand, and there can be many of them at once).
- Messages broadcast instantly to everyone in the room over WebSockets.
- A live "online" list shows everyone currently present in the room.
- Click 👍 ❤️ 😂 under any message to react — the count updates live for everyone in the room, not just you.
- Join with `?ghost=true` in the URL to lurk: you see every message and reaction as they happen, but your name never appears in anyone else's online list. One click ("Exit ghost mode") makes you visible mid-session.

## X factor: ghost mode + live reactions

**Ghost mode** is enforced entirely on the server, not hidden client-side with CSS or a UI filter. Here's exactly how the selective broadcasting works (see `server.js`):

1. On `join`, the server stores `isGhost` on the socket (`socket.data.isGhost`) and in that room's in-memory user map (`room.users`). The ghost socket still calls `socket.join(room)` like everyone else, so it's a full member of the Socket.IO room and receives every `chat-message` and `reaction-update` event broadcast `to(room)`.
2. Presence lists are never built from "all sockets in the room." They're built by `visiblePresenceList(room)`, a single function that filters `room.users` down to entries where `isGhost === false` before it's ever put on the wire. Every place the server emits `presence-update`, it calls this function — there is no code path that sends an unfiltered list.
3. Because the filtering happens server-side before the event is emitted, a ghost is *structurally* incapable of leaking into another client's online list — there's no client-side flag to spoof or hide element to un-hide via devtools.
4. `exit-ghost` flips `socket.data.isGhost` (and the matching `room.users` entry) to `false` on the server, then calls the exact same `broadcastPresence(room)` used for normal joins. The next presence event every client in the room receives now includes that user — so they go from invisible to "suddenly there" live, with no reconnect or page reload.

**Live reactions** use an in-memory per-message reaction store, not a database. Each chat message the server creates gets a `reactions` object of `Set<socketId>` per emoji (👍 / ❤️ / 😂). When a client emits `react` with a `messageId` and `emoji`, the server toggles that socket's membership in the corresponding set, recomputes counts from the sets' sizes, and broadcasts `io.to(room).emit('reaction-update', { messageId, reactions })` — every client in the room (ghosts included) updates that message's counts immediately.

## Key concepts demonstrated

- Node.js + Express serving a static frontend and hosting the Socket.IO server on the same HTTP server instance.
- Core Socket.IO primitives: `socket.emit`, `socket.on`, `socket.join(room)`, and `io.to(room).emit(...)` for room-scoped broadcasts.
- Selective event broadcasting — the same event (`presence-update`) is computed differently depending on server-side state (ghost flag), not client-side logic.
- Real-time, in-memory reaction state keyed by message ID, with per-user toggle semantics (click again to un-react).
- User presence tracking per room using an in-memory `Map`, updated on join, on ghost-exit, and on disconnect.
- Room lifecycle: rooms are created lazily on first join and garbage-collected (deleted from memory) once the last socket leaves.

## Project structure

```
NexTalk/
├── server.js          # Express + Socket.IO server, all room/presence/reaction logic
├── public/
│   ├── index.html      # Join screen + chat UI
│   ├── style.css        # Styling
│   └── app.js            # Client-side Socket.IO event handling
├── test/
│   └── smoke-test.js   # Scripted socket.io-client smoke test (ghost + reactions)
├── package.json
└── .gitignore
```

## How to run it

Requires Node.js 18+.

```bash
npm install
node server.js
```

Then open `http://localhost:3000` in a browser. Open a second tab (or an incognito window) to see multi-user presence and chat in action.

To join as a ghost, open:

```
http://localhost:3000/?ghost=true&room=general
```

or just check "Join as ghost" on the join screen.

### Smoke test

`test/smoke-test.js` starts the server in-process, connects two `socket.io-client` sockets (one normal, one ghost) into the same room, and asserts:

- the ghost never appears in the `presence-update` payload the normal client receives,
- a chat message sent by either side reaches both,
- a reaction sent by either side updates the count for both.

Run it with:

```bash
npm test
```
