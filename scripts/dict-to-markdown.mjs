// Converts the user's TSV-style data dictionary into Markdown, preserving
// every table column exactly as-is (no reordering, no renaming, no omissions).
import fs from "node:fs";

const src = process.argv[2];
const out = process.argv[3];
const lines = fs.readFileSync(src, "utf8").replace(/\r/g, "").split("\n");

const isHeader = (l) => l.includes("\t") && /Note: Double check/.test(l);
const hardStop = (l) => /^Jet Engine (CCT|Relation) /.test(l) && !l.includes("\t");

const md = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  if (isHeader(line)) {
    const cols = line.split("\t");
    const n = cols.length;
    md.push("| " + cols.map((c) => c.trim() || " ").join(" | ") + " |");
    md.push("|" + cols.map(() => " --- ").join("|") + "|");
    i++;
    // rows
    let buf = [];
    while (i < lines.length) {
      const l = lines[i];
      if (buf.length === 0 && l.trim() === "") { i++; break; }
      if (buf.length === 0 && (isHeader(l) || hardStop(l))) break;
      if (buf.length > 0 && (isHeader(l) || hardStop(l))) { flush(); break; }
      buf.push(l);
      const tabs = buf.join("\n").split("\t").length - 1;
      if (tabs >= n - 1) { flush(); }
      i++;
      continue;
    }
    function flush() {
      const joined = buf.join("\u0001");
      const cells = joined.split("\t").map((c) => c.split("\u0001").map((x) => x.trim()).filter(Boolean).join("<br>"));
      while (cells.length < n) cells.push("");
      md.push("| " + cells.slice(0, n).map((c) => (c || " ").replace(/\|/g, "\\|")).join(" | ") + " |");
      buf = [];
    }
    if (buf.length) {
      const joined = buf.join("\u0001");
      const cells = joined.split("\t").map((c) => c.split("\u0001").map((x) => x.trim()).filter(Boolean).join("<br>"));
      while (cells.length < n) cells.push("");
      md.push("| " + cells.slice(0, n).map((c) => (c || " ").replace(/\|/g, "\\|")).join(" | ") + " |");
    }
    md.push("");
    continue;
  }
  md.push(line);
  i++;
}

fs.writeFileSync(out, md.join("\n"));
console.log("lines out:", md.length);
