import fs from "node:fs";
import path from "node:path";

function die(msg) {
  console.error(`\n[ssot:validate] ERROR: ${msg}\n`);
  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) die(`Missing file: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    die(`Invalid JSON: ${filePath}\n${e?.message || e}`);
  }
}

function assertArray(data, name) {
  if (!Array.isArray(data)) die(`${name} must be an array`);
}

function requireKeys(obj, keys, ctx) {
  for (const k of keys) {
    if (!(k in obj)) die(`Missing key "${k}" in ${ctx}`);
  }
}

function uniqueBy(arr, key, name) {
  const seen = new Set();
  for (const x of arr) {
    const v = x?.[key];
    if (v == null || v === "") die(`${name}: "${key}" is empty`);
    if (seen.has(v)) die(`${name}: duplicate ${key}="${v}"`);
    seen.add(v);
  }
}

const webRoot = process.cwd(); // when running inside apps/web
const ssotRel = process.env.SSOT_PATH || "../../ssot";
const ssotAbs = path.resolve(webRoot, ssotRel);

if (!fs.existsSync(ssotAbs)) die(`SSOT_PATH not found: ${ssotAbs}`);
if (!fs.statSync(ssotAbs).isDirectory()) die(`SSOT_PATH is not a directory: ${ssotAbs}`);

const musicDir = path.join(ssotAbs, "data", "music");
const eventsPath = path.join(musicDir, "music_events.json");
const itemsPath = path.join(musicDir, "music_crown_items.json");
const pendingPath = path.join(musicDir, "music_pending_list.json");

const events = readJson(eventsPath);
const items = readJson(itemsPath);
const pending = readJson(pendingPath);

assertArray(events, "music_events.json");
assertArray(items, "music_crown_items.json");
assertArray(pending, "music_pending_list.json");

// Basic shape checks
for (const [i, e] of events.entries()) {
  requireKeys(e, ["event_id", "event_date", "planned_count", "decided_count", "status", "note"], `events[${i}]`);
}
for (const [i, it] of items.entries()) {
  requireKeys(it, ["timeline_index", "event_id", "crown_date", "title", "card_received_date", "note"], `items[${i}]`);
}
for (const [i, p] of pending.entries()) {
  requireKeys(p, ["temp_code", "title", "reason"], `pending[]`);
}

// Uniqueness checks
uniqueBy(events, "event_id", "events");
uniqueBy(items, "timeline_index", "items");
uniqueBy(pending, "temp_code", "pending");

// Cross reference: items.event_id must exist in events.event_id
const eventIds = new Set(events.map((e) => e.event_id));
for (const it of items) {
  if (!eventIds.has(it.event_id)) die(`items: event_id "${it.event_id}" not found in events`);
}

console.log("[ssot:validate] OK");
console.log(`SSOT_PATH: ${ssotAbs}`);
console.log(`events: ${events.length}, items: ${items.length}, pending: ${pending.length}`);
