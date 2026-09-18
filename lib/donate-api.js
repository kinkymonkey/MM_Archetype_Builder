"use strict";

var AMOUNTS = { 5: true, 10: true, 20: true };
var USD_TO_PHP_RATE = 62;
var LIVE_ORIGIN = "https://mm-archetype-builder.vercel.app";

function allowedOrigin(origin) {
  if (!origin) return "";
  if (origin === LIVE_ORIGIN) return origin;
  if (origin === "http://127.0.0.1:8765" || origin === "http://localhost:8765") return origin;
  if (/^https:\/\/mm-archetype-builder(-[a-z0-9-]+)?-justin-teh\.vercel\.app$/i.test(origin)) return origin;
  return "";
}

function checkoutOrigin(req) {
  return allowedOrigin(req.headers.origin || "") || LIVE_ORIGIN;
}

function setCors(req, res) {
  var origin = allowedOrigin(req.headers.origin || "");
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readBody(req, maxBytes) {
  maxBytes = maxBytes || 4096;
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

async function handleDonate(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    send(res, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  var secret = process.env.PAYMONGO_SECRET_KEY;
  if (!secret) {
    send(res, 500, { ok: false, error: "Donations are not available." });
    return;
  }
  if ((secret.charAt(0) === '"' && secret.charAt(secret.length - 1) === '"') ||
      (secret.charAt(0) === "'" && secret.charAt(secret.length - 1) === "'")) {
    secret = secret.slice(1, -1);
  }

  var raw;
  try {
    raw = await readBody(req);
  } catch (err) {
    send(res, 413, { ok: false, error: "Request too large." });
    return;
  }
  var body;
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch (err) {
    send(res, 400, { ok: false, error: "Bad JSON." });
    return;
  }
  var usd = Number(body.amount);
  if (!AMOUNTS[usd]) {
    send(res, 400, { ok: false, error: "Pick $5, $10, or $20." });
    return;
  }

  var origin = checkoutOrigin(req);
  var success = origin + "/?donated=1";
  var cancel = origin + "/?donated=0";
  var auth = Buffer.from(secret + ":").toString("base64");

  var response = await fetch("https://api.paymongo.com/v2/checkout_sessions", {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: [
            {
              name: "Midnight Majestic — thank you ($" + usd + ")",
              amount: Math.round(usd * USD_TO_PHP_RATE * 100),
              currency: "PHP",
              quantity: 1,
            },
          ],
          payment_method_types: ["card", "gcash", "qrph"],
          success_url: success,
          cancel_url: cancel,
          description: "Donation to Midnight Majestic",
          send_email_receipt: true,
        },
      },
    }),
  });

  var payload = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) {
    send(res, 502, { ok: false, error: "Checkout failed." });
    return;
  }

  var url = payload.data && payload.data.attributes && payload.data.attributes.checkout_url;
  if (!url) {
    send(res, 502, { ok: false, error: "Checkout failed." });
    return;
  }
  send(res, 200, { ok: true, checkout_url: url });
}

module.exports = { handleDonate };
