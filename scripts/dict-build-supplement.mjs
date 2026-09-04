// Builds the supplemented data dictionary:
//   每一项 -> 《1》目的：（补充的内容）
//            《2》数据结构：（原文，表格列完全不变）
// Usage: bun scripts/dict-build-supplement.mjs <dict.md> <purposes.json> <out.md>
import fs from "node:fs";

const [, , dictPath, purposePath, outPath] = process.argv;
const lines = fs.readFileSync(dictPath, "utf8").split("\n");
const purposes = JSON.parse(fs.readFileSync(purposePath, "utf8"));

const headingIdx = Object.keys(purposes).map(Number).sort((a, b) => a - b);
const out = [];

// 前言（第一个条目之前的内容原样保留）
const first = headingIdx[0];
out.push(...lines.slice(0, first - 1));

for (let k = 0; k < headingIdx.length; k++) {
  const start = headingIdx[k];
  const end = k + 1 < headingIdx.length ? headingIdx[k + 1] - 1 : lines.length;
  const title = lines[start - 1].trim();
  const body = lines.slice(start, end).join("\n").replace(/^\n+/, "").replace(/\n+$/, "");
  out.push("");
  out.push(title);
  out.push("");
  out.push("《1》目的：");
  out.push("");
  out.push(purposes[String(start)] || "（待补充）");
  out.push("");
  out.push("《2》数据结构：");
  out.push("");
  out.push(body);
  out.push("");
}

fs.writeFileSync(outPath, out.join("\n"));
const filled = headingIdx.filter((i) => purposes[String(i)] && purposes[String(i)] !== "（待补充）").length;
console.log(`items: ${headingIdx.length}, 目的 filled: ${filled}`);
