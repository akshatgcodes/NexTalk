# NexTalk — Product Requirements Document

**Status:** Final (v1 shipped)
**Owner:** Akshat Gupta
**One-liner:** Real-time room chat with live presence, live reactions and a server-enforced ghost mode for lurking invisibly.

---

## 1. Problem

Quick group chats, like a study group for an evening or a launch-night channel, shouldn't need accounts, invites or an app install. Sometimes you also want to watch a room without announcing yourself. Most chat tools either always show you, or "hide" you on the client in a way anyone can undo.

---

## 2. Goals (v1)

1. Join any room with just a username and a room name. No accounts.
2. Deliver messages to everyone in the room instantly over WebSockets.
3. Keep a live online list per room.
4. Let users toggle 👍 ❤️ 😂 on any message, with counts updated live for everyone.
5. Ghost mode: a ghost receives everything but never appears in another user's online list, enforced on the server. A ghost can become visible mid-session.
6. Live demo at [nextalk.akshatgcodes.in](https://nextalk.akshatgcodes.in).

---

## 3. Non-Goals (explicit scope cuts)

- **Persistence** — no database. A restart clears rooms and history.
- **Accounts / auth** — usernames aren't reserved or verified.
- **Private rooms** — anyone who knows the room name can join.
- **Moderation** — no kick, mute or message deletion.
- **Horizontal scaling** — one process holds all state.

---

## 4. Users

**Primary:** Small groups who want a throwaway chat room by sharing a link.

**Secondary:** Recruiters and engineers trying the demo in two tabs, including ghost mode.

---

## 5. User Stories

1. *As a user,* I enter a name and a room so that I'm chatting immediately.
2. *As a user,* I see who's online update as people join and leave so that I know who's reading.
3. *As a user,* I react 😂 to a message and click again to un-react so that my reaction is a toggle, not a counter.
4. *As a lurker,* I join with `?ghost=true` so that I can read along without appearing online.
5. *As a lurker,* I click **Exit ghost mode** so that I appear in everyone's online list right away.
6. *As a late joiner,* I see the room's recent messages so that I have context.

---

## 6. Functional Requirements

### 6.1 Joining

- `join` requires a username (trimmed, max 30 chars) and a room (trimmed, max 40 chars), otherwise `join-error`.
- The joiner gets `joined` with the room, their name, ghost status, visible users and recent history.
- Non-ghost joins post a system message ("<name> joined the room.") and broadcast presence.

### 6.2 Messages

- `chat-message` text is trimmed and capped at 1,000 characters. Empty messages are ignored.
- Each message gets a unique id, the sender's name, a timestamp and empty reaction sets.
- Each room keeps at most 200 messages. The oldest are dropped first.

### 6.3 Reactions

- `react` with `messageId` and an emoji from 👍 ❤️ 😂 toggles that socket in the emoji's set.
- The server broadcasts `reaction-update` with the new counts to the whole room, ghosts included.

### 6.4 Ghost mode

- Presence lists are always built by `visiblePresenceList()`, which filters out ghosts.
- `exit-ghost` sets the user visible, broadcasts presence and posts "<name> is now visible."
- A ghost who disconnects leaves no trace for others.

### 6.5 Leaving

- On disconnect, the user is removed and presence is broadcast. When the last socket leaves, the room is deleted from memory.

---

## 7. Non-Functional Requirements

- **Latency:** one WebSocket hop from sender to every receiver.
- **Safety:** messages are rendered with `textContent`, never as HTML. Inputs are length-capped on the server.
- **Memory:** history is capped at 200 messages per room, and empty rooms are deleted.
- **Cost:** a free Render web service. No database.

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Ghost invisibility | The smoke test asserts a ghost never appears in another client's presence list |
| Live updates | Messages and reaction counts appear in a second tab with no refresh |
| Demo | Landing → chatting in a room in two clicks |

---

## 9. Risks & Open Questions

- **Cold starts** — Render's free tier sleeps after 15 minutes, so the first visit can take up to a minute.
- **Restarts clear state** — every deploy or restart empties all rooms.
- **Impersonation** — nothing stops two people using the same name.
- **Spam** — there's no rate limit on messages.

---

## 10. v2 Candidates

- Redis for room state, with the Socket.IO Redis adapter for multiple instances.
- Per-socket message rate limiting.
- Optional room passwords.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
