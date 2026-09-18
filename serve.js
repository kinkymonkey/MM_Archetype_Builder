"use strict";

var fs = require("fs");
var http = require("http");
var path = require("path");
var { handlePresets } = require("./lib/preset-api");
var { handleDonate } = require("./lib/donate-api");

var ROOT = __dirname;
var PORT = Number(process.env.PORT || 8765);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed || trimmed.charAt(0) === "#") return;
      var eq = trimmed.indexOf("=");
      if (eq < 1) return;
      var key = trimmed.slice(0, eq).trim();
      var value = trimmed.slice(eq + 1).trim();
      if ((value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
          (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'")) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    });
}

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, "..", "..", "MajesticHQ-Dashboard", ".env.local"));

var TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

function safeFile(urlPath) {
  var clean = decodeURIComponent((urlPath || "/").split("?")[0]);
  if (clean === "/") clean = "/index.html";
  var resolved = path.normalize(path.join(ROOT, clean));
  if (path.basename(resolved).indexOf(".env") === 0) return null;
  if (!resolved.startsWith(ROOT)) return null;
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) return null;
  return resolved;
}

var server = http.createServer(function (req, res) {
  var urlPath = (req.url || "/").split("?")[0];
  if (urlPath === "/api/presets") {
    handlePresets(req, res).catch(function (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: err.message || "Server error." }));
    });
    return;
  }
  if (urlPath === "/api/donate") {
    handleDonate(req, res).catch(function (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: err.message || "Server error." }));
    });
    return;
  }

  var file = safeFile(urlPath);
  if (!file) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }
  var ext = path.extname(file).toLowerCase();
  res.statusCode = 200;
  res.setHeader("Content-Type", TYPES[ext] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, "127.0.0.1", function () {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Add it to Projects/Prompt Maker/.env.local");
    process.exit(1);
  }
  console.log("Prompt Maker http://127.0.0.1:" + PORT + "/");
});
