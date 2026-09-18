"use strict";

var neon = require("@neondatabase/serverless").neon;

var ALLOWED_ORIGINS = {
  "http://127.0.0.1:8765": true,
  "http://localhost:8765": true,
  "https://mm-archetype-builder.vercel.app": true,
};

function sqlClient() {
  var url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  return neon(url);
}

function allowedOrigin(origin) {
  if (!origin) return "";
  if (ALLOWED_ORIGINS[origin]) return origin;
  if (/^https:\/\/mm-archetype-builder(-[a-z0-9-]+)?-justin-teh\.vercel\.app$/i.test(origin)) return origin;
  return "";
}

function setCors(req, res) {
  var origin = allowedOrigin(req.headers.origin || "");
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readBody(req, maxBytes) {
  maxBytes = maxBytes || 65536;
  return new Promise(function (resolve, reject) {
    var chunks = [];
    var size = 0;
    req.on("data", function (chunk) {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("too_large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", function () {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function queryId(req) {
  var host = req.headers.host || "localhost";
  var url = new URL(req.url, "http://" + host);
  return (url.searchParams.get("id") || "").trim();
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS archetype_presets (
      id text PRIMARY KEY,
      name text NOT NULL,
      medium text NOT NULL DEFAULT 'image',
      kind text NOT NULL DEFAULT 'character',
      prompt text NOT NULL DEFAULT '',
      fields jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

function rowToPreset(row) {
  return {
    id: row.id,
    name: row.name,
    medium: row.medium,
    kind: row.kind,
    prompt: row.prompt || "",
    fields: row.fields || {},
    created_at: row.created_at,
  };
}

async function handlePresets(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (process.env.VERCEL) {
    send(res, 404, { ok: false, error: "Not found." });
    return;
  }

  try {
    var sql = sqlClient();
    await ensureTable(sql);

    if (req.method === "GET") {
      var rows = await sql`
        SELECT id, name, medium, kind, prompt, fields, created_at
        FROM archetype_presets
        ORDER BY created_at DESC
      `;
      send(res, 200, { ok: true, presets: rows.map(rowToPreset) });
      return;
    }

    if (req.method === "POST") {
      var raw = await readBody(req);
      var body;
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch (err) {
        send(res, 400, { ok: false, error: "Bad JSON." });
        return;
      }
      var id = String(body.id || Date.now()).slice(0, 80);
      var name = String(body.name || "").trim().slice(0, 120);
      if (!name) {
        send(res, 400, { ok: false, error: "Name is required." });
        return;
      }
      var medium = String(body.medium || "image");
      var kind = String(body.kind || "character");
      var prompt = String(body.prompt || "").slice(0, 20000);
      var fields = body.fields && typeof body.fields === "object" ? body.fields : {};
      await sql`
        INSERT INTO archetype_presets (id, name, medium, kind, prompt, fields)
        VALUES (${id}, ${name}, ${medium}, ${kind}, ${prompt}, ${JSON.stringify(fields)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          medium = EXCLUDED.medium,
          kind = EXCLUDED.kind,
          prompt = EXCLUDED.prompt,
          fields = EXCLUDED.fields
      `;
      send(res, 200, {
        ok: true,
        preset: { id: id, name: name, medium: medium, kind: kind, prompt: prompt, fields: fields },
      });
      return;
    }

    if (req.method === "DELETE") {
      var deleteId = queryId(req);
      if (!deleteId) {
        send(res, 400, { ok: false, error: "Missing id." });
        return;
      }
      await sql`DELETE FROM archetype_presets WHERE id = ${deleteId}`;
      send(res, 200, { ok: true });
      return;
    }

    send(res, 405, { ok: false, error: "Method not allowed." });
  } catch (err) {
    send(res, err && err.message === "too_large" ? 413 : 500, {
      ok: false,
      error: err && err.message === "too_large" ? "Request too large." : "Request failed.",
    });
  }
}

module.exports = { handlePresets };
