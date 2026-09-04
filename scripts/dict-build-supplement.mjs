// Builds the supplemented data dictionary:
//   每一项 -> 《1》目的：（补充的内容）
//            《2》数据结构：（原文，表格列完全不变）
// Headings are detected in the converted Markdown; purposes.json is keyed by the
// heading's line number in the reference build and consumed IN ORDER, so the
// two lists must have the same length (asserted below).
// Usage: bun scripts/dict-build-supplement.mjs <dict.md> <purposes.json> <out.md>
import fs from "node:fs";

const [, , dictPath, purposePath, outPath] = process.argv;
const lines = fs.readFileSync(dictPath, "utf8").split("\n");
const purposes = JSON.parse(fs.readFileSync(purposePath, "utf8"));
const purposeList = Object.keys(purposes)
  .map(Number)
  .sort((a, b) => a - b)
  .map((k) => purposes[String(k)]);

const headingRe = /^\s*(?:[（(]?(\d+)[）).、]|\(([A-Z])\))\s*(\S.*)?$/;
const isHeading = (l) => {
  if (l.startsWith("|") || !l.trim()) return false;
  const m = headingRe.exec(l);
  if (!m) return false;
  if (m[1] && Number(m[1]) >= 100) return false;      // "171. ..." is prose
  if (/^\s*\d+\s*[.、]\s*[“"”]/.test(l)) return false; // option list line
  if (/^\s*\(0\)/.test(l)) return false;               // section banner
  return true;
};

const headingIdx = [];
lines.forEach((l, i) => { if (isHeading(l)) headingIdx.push(i + 1); });

if (headingIdx.length !== purposeList.length) {
  console.error(`headings=${headingIdx.length} purposes=${purposeList.length}`);
  headingIdx.forEach((n, k) => console.error(k, n, lines[n - 1].slice(0, 60)));
  process.exit(1);
}

const out = [];
out.push(...lines.slice(0, headingIdx[0] - 1));

for (let k = 0; k < headingIdx.length; k++) {
  const start = headingIdx[k];
  const end = k + 1 < headingIdx.length ? headingIdx[k + 1] - 1 : lines.length;
  const title = lines[start - 1].trim();
  const body = lines.slice(start, end)
    .filter((l) => !/^\s*《[12]》\s*(目的|数据结构)\s*[：:]?\s*$/.test(l))
    .join("\n").replace(/^\n+/, "").replace(/\n+$/, "");
  out.push("");
  out.push(title);
  out.push("");
  out.push("《1》目的：");
  out.push("");
  out.push(purposeList[k] || "（待补充）");
  out.push("");
  out.push("《2》数据结构：");
  out.push("");
  out.push(body);
  out.push("");
}

fs.writeFileSync(outPath, out.join("\n"));
console.log(`items: ${headingIdx.length}, 目的 filled: ${purposeList.filter(Boolean).length}`);
