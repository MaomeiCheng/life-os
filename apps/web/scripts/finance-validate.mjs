import fs from "node:fs";
import path from "node:path";

function die(msg) {
  console.error(`\n[finance:validate] ERROR: ${msg}\n`);
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

const webRoot = process.cwd(); // run inside apps/web
const ssotRel = process.env.SSOT_PATH || "../../ssot";
const ssotAbs = path.resolve(webRoot, ssotRel);

if (!fs.existsSync(ssotAbs)) die(`SSOT_PATH not found: ${ssotAbs}`);
if (!fs.statSync(ssotAbs).isDirectory()) die(`SSOT_PATH is not a directory: ${ssotAbs}`);

const financeDir = path.join(ssotAbs, "data", "finance");

// Try common filenames (supports slight variations)
const candidates = {
  payroll_slips: ["finance_payroll_slips.json", "payroll_slips.json"],
  payroll_items: ["finance_payroll_items.json", "payroll_items.json"],
  withholding: ["finance_withholding_certificates.json", "withholding_certificates.json"],
};

function pickFile(names) {
  for (const n of names) {
    const p = path.join(financeDir, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const slipsPath = pickFile(candidates.payroll_slips);
const itemsPath = pickFile(candidates.payroll_items);
const whPath = pickFile(candidates.withholding);

if (!slipsPath) die(`Missing payroll slips json in ${financeDir}`);
if (!itemsPath) die(`Missing payroll items json in ${financeDir}`);
if (!whPath) die(`Missing withholding certificates json in ${financeDir}`);

const slips = readJson(slipsPath);
const items = readJson(itemsPath);
const withholding = readJson(whPath);

assertArray(slips, path.basename(slipsPath));
assertArray(items, path.basename(itemsPath));
assertArray(withholding, path.basename(whPath));

// Basic shape checks (loose but safe)
for (const [i, s] of slips.entries()) {
  // minimal required fields for slips
  requireKeys(
    s,
    ["slip_id", "pay_date", "gross", "deductions", "net", "source_sheet"],
    `slips[${i}]`
  );
}
for (const [i, it] of items.entries()) {
  requireKeys(
    it,
    ["slip_id", "line_no", "item_name", "amount"],
    `items[${i}]`
  );
}
for (const [i, w] of withholding.entries()) {
  requireKeys(
    w,
    ["year", "issuer", "income_type", "taxable_income", "tax_withheld", "source_sheet"],
    `withholding[${i}]`
  );
}

// Uniqueness
uniqueBy(slips, "slip_id", "slips");

// items uniqueness by slip_id + line_no
{
  const seen = new Set();
  for (const it of items) {
    const k = `${it.slip_id}#${it.line_no}`;
    if (seen.has(k)) die(`items: duplicate (slip_id,line_no) = ${k}`);
    seen.add(k);
  }
}

// Cross reference: items.slip_id must exist in slips.slip_id
const slipIds = new Set(slips.map((s) => s.slip_id));
for (const it of items) {
  if (!slipIds.has(it.slip_id)) die(`items: slip_id "${it.slip_id}" not found in slips`);
}

console.log("[finance:validate] OK");
console.log(`SSOT_PATH: ${ssotAbs}`);
console.log(`slips: ${slips.length}, items: ${items.length}, withholding: ${withholding.length}`);
console.log(`files:`);
console.log(`- ${path.relative(webRoot, slipsPath)}`);
console.log(`- ${path.relative(webRoot, itemsPath)}`);
console.log(`- ${path.relative(webRoot, whPath)}`);
