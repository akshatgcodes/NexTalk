# Local Setup — NexTalk

> **Just want to try it?** Use the live demo at [nextalk.akshatgcodes.in](https://nextalk.akshatgcodes.in). No setup needed.
> This guide is for running NexTalk locally or self-hosting it.

---

## Prerequisites

- Node.js 18+

---

## 1. Clone and install

```bash
git clone https://github.com/akshatgcodes/NexTalk
cd NexTalk
npm install
```

---

## 2. Environment variables

| Variable | Where to get it |
|---|---|
| `PORT` | Optional. Port to listen on, default `3000` |

---

## 3. Run locally

```bash
npm start
```

Open `http://localhost:3000/chat/` and join a room. Open a second tab or an incognito window to see presence and live reactions.

To join as a ghost:

```
http://localhost:3000/chat/?ghost=true&room=general
```

or tick **Join as ghost** on the join screen.

`/` shows the landing page only after it's been built:

```bash
cd landing && npm install && npm run build && cd ..   # writes landing/out
npm start                                              # now / is the landing page
```

---

## 4. Run the tests

```bash
npm test
```

`test/smoke-test.js` boots the server on port 3055 (or `TEST_PORT`), connects a normal and a ghost client to the same room, and checks:

- the ghost never appears in the normal client's presence list,
- a chat message from either side reaches both,
- a reaction from either side updates the count for both,
- exiting ghost mode makes the user visible to the other client.

---

## 5. Deploy to production

See [DEPLOY.md](DEPLOY.md) for production deployment, custom domain and rollback steps.

---

## Known local-only limitations

- Without `landing/out`, `/` returns 404. The chat at `/chat/` always works.
- Stopping the server clears every room and message.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
