<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"
       fill="none" stroke="#34d399" stroke-width="1.5"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
  </svg>
</p>

<h1 align="center">NexTalk</h1>

<p align="center">
  <strong>Real-time room chat with live presence, live reactions and a server-enforced ghost mode for lurking invisibly.</strong>
</p>

<p align="center">
  <a href="https://nextalk.akshatgcodes.in">
    <img src="https://img.shields.io/badge/live_demo-34d399-34d399?style=flat-square" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white" alt="Socket.IO">
  <img src="https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/license-GPL--3.0-34d399?style=flat-square" alt="License">
</p>

---

## What is NexTalk?

NexTalk is browser chat over WebSockets. Pick a name and a room, and you're talking live with everyone in it, with an online list that updates without a refresh and 👍 ❤️ 😂 reactions whose counts change for everyone at once. Its twist is ghost mode: join with `?ghost=true` and you see everything without ever appearing in anyone's online list. That's enforced on the server, so no devtools trick can reveal you.

> **Live demo →** [nextalk.akshatgcodes.in](https://nextalk.akshatgcodes.in)
> Click **Try it live**, then open a second tab to chat with yourself. The free host sleeps when idle, so the first load can take up to a minute.

---

## What you get

- **Rooms on demand** — any room name works; rooms are created on first join and removed when the last person leaves.
- **Live presence** — the online list updates on join, leave and ghost exit.
- **Live reactions** — toggle 👍 ❤️ 😂 on any message, and counts update for everyone in the room.
- **Ghost mode** — receive every message and reaction while invisible. One click makes you visible mid-session.
- **Recent history** — new joiners get up to the last 200 messages of the room.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla JS + HTML + CSS (`public/`) · Next.js 16 static landing page |
| Backend | Node.js · Express 4 · Socket.IO 4 |
| State | In-memory `Map`s, no database |
| Infra | Render (Node web service) · GoDaddy DNS |

---

## Engineering Decisions

**Why enforce ghost mode on the server?**
Every `presence-update` goes through one function, `visiblePresenceList()`, which drops ghosts before anything is sent. There's no client flag to spoof and no hidden element to un-hide.

**Why reactions as a `Set` of socket ids per emoji?**
Toggling is just add or delete, a user can't double-count, and the count is simply `set.size`.

**Why Render instead of Vercel?**
Socket.IO needs a long-lived server holding open connections, and serverless functions can't do that. One Render service serves the landing page, the chat client and the WebSocket server.

**What would you do differently in v2?**
Move room state to Redis so it survives restarts and can scale past one instance. Right now a restart clears every room.

---

## Docs

| Document | Description |
|---|---|
| [PRD](docs/PRD.md) | Product requirements — goals, user stories, non-goals |
| [Architecture](docs/ARCHITECTURE.md) | System design, events, data flow |
| [Decisions](docs/DECISIONS.md) | Every major technical decision and why |
| [Setup](docs/SETUP.md) | Local dev setup and tests |
| [Deploy](docs/DEPLOY.md) | Production deployment, domains, rollback |
| [Contributing](CONTRIBUTING.md) | How to propose changes |
| [Changelog](CHANGELOG.md) | What changed in each release |
| [Security](SECURITY.md) | How to report a vulnerability |

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
