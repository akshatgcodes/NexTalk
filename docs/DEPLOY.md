# Deploying NexTalk

> **Live:** [nextalk.akshatgcodes.in](https://nextalk.akshatgcodes.in) · **Host:** Render · **Auto-deploy:** on push to `master`

For local development, see [SETUP.md](SETUP.md).

---

## 1. Architecture in production

| Piece | Runs on | Notes |
|---|---|---|
| Landing page | Render (same service) | `landing/out`, built during deploy, served at `/` by Express |
| Chat client | Render (same service) | `public/`, served at `/chat/` |
| Socket.IO server | Render web service `nextalk` | Free tier, Singapore; sleeps after 15 min idle |
| DNS | GoDaddy | `nextalk.akshatgcodes.in` → CNAME to `nextalk-6a52.onrender.com` |

---

## 2. Environment variables

| Variable | Required | Where it's set |
|---|---|---|
| `PORT` | ✅ (automatic) | Set by Render. Don't override it |

There are no secrets.

---

## 3. First-time deploy

1. [dashboard.render.com](https://dashboard.render.com) → New → **Web Service** → connect `akshatgcodes/NexTalk`
2. Build command: `npm ci && cd landing && npm ci && npm run build`
3. Start command: `npm start`
4. Plan: Free · Region: Singapore. Deploy.

The same settings are in [`render.yaml`](../render.yaml) for a Blueprint deploy.

---

## 4. Database migrations

None. State is in memory.

---

## 5. Custom domain

`nextalk.akshatgcodes.in` is set up with the setup toolkit:

```powershell
.\scripts\setup-subdomain.ps1 -Subdomain "nextalk" -Platform Render -RenderHost "nextalk-6a52.onrender.com"
```

Manual fallback: add the domain in Render → Service → Settings → Custom Domains, then create a GoDaddy CNAME `nextalk` → `nextalk-6a52.onrender.com`. HTTPS certificates are issued automatically once DNS resolves (2–10 min).

---

## 6. Verify a deploy

- [ ] `https://nextalk.akshatgcodes.in` loads the landing page
- [ ] **Try it live** opens `/chat/`, and joining a room works
- [ ] A message from one tab appears in a second tab
- [ ] A ghost tab doesn't appear in the first tab's online list until **Exit ghost mode**

---

## 7. Rollback

| Host | How |
|---|---|
| Render | Service → Events → last good deploy → **Rollback** |

After rolling back, note it in a commit or PR so the next push doesn't silently re-ship the broken version. A rollback or redeploy also clears every room, because state is in memory.

---

## 8. Monitoring & logs

- **Logs:** Render → Service `nextalk` → Logs
- **Errors:** none yet beyond Render's logs
- **Uptime:** none yet
- **Dependencies:** Dependabot opens weekly update PRs and a maintenance report is emailed every week (see `.github/workflows/`)

---

## Known production limitations

- The free instance sleeps after 15 minutes idle, so the first request can take up to a minute.
- Every deploy or restart empties all rooms.
- One instance only. Scaling out would need the Socket.IO Redis adapter.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
