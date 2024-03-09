'use strict';

// Scripted smoke test: boots the real server on a dedicated test port,
// connects two real socket.io-client sockets (one normal, one ghost) over
// an actual WebSocket connection, and asserts:
//   1. the ghost's username never appears in the presence list the normal
//      client receives,
//   2. a chat message from either side reaches both clients,
//   3. a reaction from either side updates the live count for both.
//
// Not wired into `npm install`/CI by default (no test runner dependency,
// just plain Node + assert) -- run manually with `npm test`.

process.env.PORT = process.env.TEST_PORT || '3055';

const assert = require('assert');
const { io: ioClient } = require('socket.io-client');

const PORT = process.env.PORT;
const URL = `http://localhost:${PORT}`;

let exitCode = 0;

async function main() {
  const { server, io } = require('../server.js');

  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.once('listening', resolve);
  });

  const room = `smoke-${Date.now()}`;

  const normal = ioClient(URL, { transports: ['websocket'] });
  const ghost = ioClient(URL, { transports: ['websocket'] });

  const normalPresenceEvents = [];
  const ghostPresenceEvents = [];
  const normalMessages = [];
  const ghostMessages = [];
  const normalReactions = [];
  const ghostReactions = [];

  normal.on('presence-update', (p) => normalPresenceEvents.push(p));
  ghost.on('presence-update', (p) => ghostPresenceEvents.push(p));
  normal.on('chat-message', (m) => normalMessages.push(m));
  ghost.on('chat-message', (m) => ghostMessages.push(m));
  normal.on('reaction-update', (r) => normalReactions.push(r));
  ghost.on('reaction-update', (r) => ghostReactions.push(r));

  await Promise.all([
    waitFor(normal, 'connect'),
    waitFor(ghost, 'connect'),
  ]);

  const normalJoined = waitFor(normal, 'joined');
  normal.emit('join', { username: 'alice', room, ghost: false });
  await normalJoined;

  const ghostJoined = waitFor(ghost, 'joined');
  ghost.emit('join', { username: 'ghosty', room, ghost: true });
  await ghostJoined;

  // Give presence-update broadcasts a moment to land on both clients.
  await waitForCondition(() => normalPresenceEvents.length >= 2, 3000, 'presence updates after ghost join');

  const latestNormalPresence = normalPresenceEvents[normalPresenceEvents.length - 1];
  assert.ok(
    !latestNormalPresence.users.includes('ghosty'),
    `FAIL: ghost leaked into presence list: ${JSON.stringify(latestNormalPresence.users)}`
  );
  assert.ok(
    latestNormalPresence.users.includes('alice'),
    'FAIL: normal user missing from its own presence list'
  );
  console.log('PASS: ghost is absent from broadcast presence list ->', latestNormalPresence.users);

  // --- chat message reaches both sides ---
  const normalGotMsg = waitForCondition(
    () => normalMessages.some((m) => m.text === 'hello from alice' && !m.system),
    3000,
    'normal client receiving chat message'
  );
  const ghostGotMsg = waitForCondition(
    () => ghostMessages.some((m) => m.text === 'hello from alice' && !m.system),
    3000,
    'ghost client receiving chat message'
  );
  normal.emit('chat-message', { text: 'hello from alice' });
  await Promise.all([normalGotMsg, ghostGotMsg]);
  console.log('PASS: chat message delivered to both normal and ghost clients');

  const sentMsg = normalMessages.find((m) => m.text === 'hello from alice' && !m.system);

  // --- reaction from ghost updates both sides ---
  const normalGotReaction = waitForCondition(
    () => normalReactions.some((r) => r.messageId === sentMsg.id && r.reactions['👍'] === 1),
    3000,
    'normal client receiving reaction update'
  );
  const ghostGotReaction = waitForCondition(
    () => ghostReactions.some((r) => r.messageId === sentMsg.id && r.reactions['👍'] === 1),
    3000,
    'ghost client receiving reaction update'
  );
  ghost.emit('react', { messageId: sentMsg.id, emoji: '👍' });
  await Promise.all([normalGotReaction, ghostGotReaction]);
  console.log('PASS: reaction count broadcast live to both clients');

  // --- ghost exits ghost mode and becomes visible ---
  const normalSeesGhostNow = waitForCondition(
    () => normalPresenceEvents[normalPresenceEvents.length - 1].users.includes('ghosty'),
    3000,
    'ghost becoming visible after exit-ghost'
  );
  ghost.emit('exit-ghost');
  await normalSeesGhostNow;
  console.log('PASS: exiting ghost mode makes the user visible live to others');

  normal.close();
  ghost.close();
  await new Promise((resolve) => io.close(resolve));

  console.log('\nAll smoke tests passed.');
}

function waitFor(socket, event, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for "${event}"`)), timeoutMs);
    socket.once(event, (payload) => {
      clearTimeout(t);
      resolve(payload);
    });
  });
}

function waitForCondition(predicate, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (predicate()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error(`timeout waiting for: ${label}`));
      }
    }, 25);
  });
}

main()
  .catch((err) => {
    exitCode = 1;
    console.error('SMOKE TEST FAILED:', err.message);
  })
  .finally(() => {
    process.exit(exitCode);
  });
