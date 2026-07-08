#!/usr/bin/env node
import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.FLOW_COMPANION_GATEWAY_PORT || 3001);
const PATHNAME = process.env.FLOW_COMPANION_GATEWAY_PATH || "/flow-companion";
const VERSION = "0.2.0";

function cleanId(value, fallback) {
  if (typeof value !== "string") return fallback;
  const clean = value.trim().replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
  return clean || fallback;
}

function buildRuntimeCommands(event) {
  switch (event.type) {
    case "ping":
      return [
        { type: "debug", name: "Pong", payload: { message: "Hola Unity" } },
        { type: "attention", name: "LookAtUser" },
      ];
    case "session.started":
      return [
        { type: "state", name: "Idle" },
        { type: "attention", name: "LookAtUser" },
        { type: "debug", name: "SessionStarted" },
      ];
    case "mouse.move":
      return [{ type: "attention", name: "LookAtScreenPoint", payload: { x: event.x || 0, y: event.y || 0 } }];
    case "mouse.click":
      return [{ type: "reaction", name: "MouseClick" }];
    case "user.speaking":
      return [
        { type: "state", name: "Listening" },
        { type: "reaction", name: "UserSpeaking" },
        { type: "attention", name: "LookAtUser" },
      ];
    case "assistant.thinking":
    case "user.silence":
      return [
        { type: "state", name: "Thinking" },
        { type: "reaction", name: "Thinking" },
        { type: "attention", name: "LookAround" },
      ];
    case "assistant.response.started":
      return [
        { type: "state", name: "Speaking" },
        { type: "reaction", name: "ResponseStarted" },
        { type: "attention", name: "LookAtUser" },
      ];
    case "assistant.response.finished":
      return [
        { type: "reaction", name: "ResponseFinished" },
        { type: "state", name: "Idle" },
      ];
    case "text.message":
      return [
        { type: "state", name: "Thinking" },
        { type: "reaction", name: "Thinking" },
        { type: "speech", name: "Say", payload: { text: `Recibido: ${event.text || "mensaje vacío"}` } },
        { type: "state", name: "Idle" },
      ];
    default:
      return [{ type: "debug", name: "UnknownEvent", payload: { eventType: event.type } }];
  }
}

function createResponse(event = {}) {
  const companionId = cleanId(event.companionId, "flow-companion-dev");
  const userId = cleanId(event.userId, "local-user");
  const sessionId = cleanId(event.sessionId, `flow-session-${Date.now()}`);

  return {
    ok: true,
    version: VERSION,
    generatedAt: new Date().toISOString(),
    sessionId,
    companionId,
    userId,
    eventType: event.type || "ping",
    commands: buildRuntimeCommands({ ...event, companionId, userId, sessionId }),
  };
}

function encodeFrame(text) {
  const payload = Buffer.from(text);
  const length = payload.length;

  if (length < 126) {
    return Buffer.concat([Buffer.from([0x81, length]), payload]);
  }

  if (length < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
    return Buffer.concat([header, payload]);
  }

  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(length), 2);
  return Buffer.concat([header, payload]);
}

function decodeFrames(buffer) {
  const messages = [];
  let offset = 0;

  while (offset + 2 <= buffer.length) {
    const first = buffer[offset++];
    const second = buffer[offset++];
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let length = second & 0x7f;

    if (length === 126) {
      if (offset + 2 > buffer.length) break;
      length = buffer.readUInt16BE(offset);
      offset += 2;
    } else if (length === 127) {
      if (offset + 8 > buffer.length) break;
      length = Number(buffer.readBigUInt64BE(offset));
      offset += 8;
    }

    let mask;
    if (masked) {
      if (offset + 4 > buffer.length) break;
      mask = buffer.subarray(offset, offset + 4);
      offset += 4;
    }

    if (offset + length > buffer.length) break;
    const payload = Buffer.from(buffer.subarray(offset, offset + length));
    offset += length;

    if (masked && mask) {
      for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
    }

    if (opcode === 0x8) messages.push({ type: "close" });
    if (opcode === 0x1) messages.push({ type: "text", text: payload.toString("utf8") });
  }

  return messages;
}

function send(socket, message) {
  socket.write(encodeFrame(JSON.stringify(message)));
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "flow-companion-gateway", version: VERSION }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "Not found" }));
});

server.on("upgrade", (req, socket) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname !== PATHNAME) {
    socket.destroy();
    return;
  }

  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    "",
  ].join("\r\n"));

  const companionId = cleanId(url.searchParams.get("companionId"), "flow-companion-dev");
  const userId = cleanId(url.searchParams.get("userId"), "local-user");
  const sessionId = cleanId(url.searchParams.get("sessionId"), `flow-session-${Date.now()}`);

  send(socket, createResponse({ type: "session.started", companionId, userId, sessionId }));

  socket.on("data", (buffer) => {
    for (const frame of decodeFrames(buffer)) {
      if (frame.type === "close") {
        socket.end();
        return;
      }

      if (frame.type !== "text") continue;

      let event;
      try {
        event = JSON.parse(frame.text);
      } catch {
        event = { type: "text.message", text: frame.text };
      }

      send(socket, createResponse({
        type: event.type || "ping",
        companionId: event.companionId || companionId,
        userId: event.userId || userId,
        sessionId: event.sessionId || sessionId,
        text: event.text,
        x: event.x,
        y: event.y,
        payload: event.payload,
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Flow Companion Gateway] ws://localhost:${PORT}${PATHNAME}`);
  console.log(`[Flow Companion Gateway] health http://localhost:${PORT}/health`);
});
