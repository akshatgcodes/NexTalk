# NexTalk — Architecture

---

## 1. Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 18+ |
| Server | Express 4 serving static files · Socket.IO 4 on the same HTTP server |
| Client | Vanilla JS (`public/app.js`) · Socket.IO client from `/socket.io/socket.io.js` |
| State | In-memory `Map`s per process |
| Landing page | Next.js 16 static export (`landing/out`) · Tailwind CSS 4 |
| Tests | `test/smoke-test.js`: plain Node + `assert` + `socket.io-client` |
| Hosting | Render web service (free tier, Singapore) |

---

## 2. Components

```
server.js          Express + Socket.IO: rooms, presence, messages, reactions, ghost mode
public/            chat client: index.html (join + chat UI), app.js (socket events), style.css
landing/           Next.js landing page, exported to landing/out at build time
test/smoke-test.js boots the server and drives two real sockets (normal + ghost)
render.yaml        Render service definition
```

### HTTP layer

```js
app.use('/chat', express.static('public'));        // chat client
app.use(express.static('landing/out'));            // landing page at "/"
```

Socket.IO attaches to the same `http.Server`, so `/socket.io/*` is served alongside both.

### Room state

```
rooms: Map<roomName, {
  users:    Map<socketId, { username, isGhost }>,
  messages: Map<messageId, { id, username, text, timestamp,
                             reactions: { '👍': Set<socketId>, '❤️': Set, '😂': Set } }>
}>
```

`getOrCreateRoom()` creates a room on first join. On disconnect, a room with no users left is deleted. `trimHistory()` keeps the newest 200 messages.

### Presence

`visiblePresenceList(room)` returns the usernames where `isGhost === false`. `broadcastPresence(room)` is the only place `presence-update` is emitted, and it always uses that list.

---

## 3. Events

| Direction | Event | Payload | Notes |
|---|---|---|---|
| client → server | `join` | `{ username, room, ghost }` | Name ≤ 30, room ≤ 40 chars |
| server → client | `joined` | `{ room, username, isGhost, users, history }` | Only to the joiner |
| server → client | `join-error` | `{ message }` | Missing name or room |
| client → server | `chat-message` | `{ text }` | Trimmed, ≤ 1,000 chars |
| server → room | `chat-message` | serialized message | Also used for system messages |
| client → server | `react` | `{ messageId, emoji }` | Emoji must be 👍 ❤️ or 😂 |
| server → room | `reaction-update` | `{ messageId, reactions }` | Counts per emoji |
| server → room | `presence-update` | `{ room, users }` | Ghosts filtered out |
| client → server | `exit-ghost` | — | Becomes visible |
| server → client | `ghost-exited` | — | Confirms to the user |

---

## 4. Data Flow

```
[Tab A] join {alice, launch}           --> users: alice
                                        --> room: "alice joined" + presence [alice]
[Tab B] join {bob, launch, ghost:true} --> users: alice, bob(ghost)
                                        --> bob gets history; nobody else is told
[Tab A] chat-message "hi"              --> room (A and B both receive it)
[Tab B] react 😂 on "hi"               --> 😂 set {B} --> room: reaction-update
[Tab B] exit-ghost                     --> bob visible --> presence [alice, bob]
```

---

## 5. Security

- **XSS:** message text, usernames and room names are rendered with `textContent`. The only `innerHTML` use writes a server-validated emoji and a numeric count.
- **Input limits:** names, rooms and messages are length-capped on the server, and reactions are checked against an allow-list.
- **Ghost mode:** invisibility is decided on the server, so a ghost's name is never sent to other clients.
- **Secrets:** none. `PORT` is the only env var.
- **Known gaps:** no rate limiting, no auth, and anyone can join any room by name.

---

## 6. Error Handling & Reliability

| Failure | Behaviour |
|---|---|
| Missing name or room | `join-error` to that client only |
| Unknown message id or emoji in `react` | Ignored |
| Client disconnects | Removed from the room; presence rebroadcast; empty room deleted |
| Server restart | All rooms and history are lost (in-memory by design) |
| Render instance asleep | First request wakes it, which takes up to a minute |

---

## 7. Deployment

1. Render web service `nextalk` (free, Singapore), connected to `akshatgcodes/NexTalk`, auto-deploys on push to `master`.
2. Build: `npm ci && cd landing && npm ci && npm run build`, which produces `landing/out`.
3. Start: `npm start` (`node server.js`), listening on Render's `PORT`.

Full steps are in [DEPLOY.md](DEPLOY.md).

---

## 8. Explicit Scope Cuts

- **Database** — state is in memory.
- **Multiple instances** — would need the Socket.IO Redis adapter.
- **Auth and private rooms** — open rooms by design.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
