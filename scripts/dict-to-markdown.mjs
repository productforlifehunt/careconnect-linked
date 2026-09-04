// Converts the user's TSV-style data dictionary into Markdown, preserving
// every table column exactly as-is (no reordering, no renaming, no omissions).
//
// Table model of the source file:
//   - A header row is a TAB line containing "Note: Double check".
//   - A data row may span several physical lines (option lists contain raw
//     newlines inside one cell). A row is complete once its accumulated tab
//     count reaches headerColumns-1.
//   - The table ends at: a blank line with no pending buffer, a new header,
//     or a non-tab prose line with no pending buffer.
import fs from "node:fs";

const src = process.argv[2];
const out = process.argv[3];
const lines = fs.readFileSync(src, "utf8").replace(/\r/g, "").replace(/[\u2028\u2029\u000b\u000c\u0085]/g, "\n").split("\n");

const isHeader = (l) => l.includes("\t") && /Note: Double check/.test(l);

const md = [];
let i = 0;

const cellsFrom = (buf, n) => {
  const joined = buf.join("\u0001");
  const cells = joined.split("\t").map((c) =>
    c.split("\u0001").map((x) => x.trim()).filter(Boolean).join("<br>")
  );
  // Never lose content: overflow cells are appended to the last column.
  if (cells.length > n) {
    const tail = cells.slice(n - 1).filter(Boolean).join("<br>");
    cells.length = n - 1;
    cells.push(tail);
  }
  while (cells.length < n) cells.push("");
  return cells.map((c) => (c || " ").replace(/\|/g, "\\|"));
};

while (i < lines.length) {
  const line = lines[i];
  if (!isHeader(line)) {
    md.push(line);
    i++;
    continue;
  }

  const cols = line.split("\t");
  const n = cols.length;
  md.push("| " + cols.map((c) => c.trim() || " ").join(" | ") + " |");
  md.push("|" + cols.map(() => " --- ").join("|") + "|");
  i++;

  let buf = [];
  // The table continues past blank / untabbed lines only when a further
  // TSV data row (not a new header) follows within a short window; otherwise
  // those lines are real prose and the table has ended.
  const headingRe = /^\s*(?:[（(]?(\d+)[）).、]|\(([A-Z])\))\s*(\S.*)?$/;
  const isHeading = (s) => {
    if (!s.trim() || s.includes("\t")) return false;
    const m = headingRe.exec(s);
    if (!m) return false;
    if (m[1] && Number(m[1]) >= 100) return false;
    if (/^\s*\d+\s*[.、]\s*[“"”]/.test(s)) return false;
    return true;
  };
  const tableContinuesAt = (start) => {
    let scanned = 0;
    for (let j = start; j < lines.length && scanned < 15; j++) {
      const s = lines[j];
      if (s.trim() === "") continue;
      scanned++;
      if (isHeader(s)) return -1;
      // A new numbered item heading always ends the table.
      if (isHeading(s)) return -1;
      if (s.includes("\t")) return j;
    }
    return -1;
  };


  while (i < lines.length) {
    const l = lines[i];
    const pending = buf.length > 0;

    if (isHeader(l)) break;
    // A numbered item heading always ends the table, even mid-row.
    if (isHeading(l)) {
      if (pending) { md.push("| " + cellsFrom(buf, n).join(" | ") + " |"); buf = []; }
      break;
    }

    if (!pending && (l.trim() === "" || !l.includes("\t"))) {
      const j = tableContinuesAt(i);
      if (j === -1) { if (l.trim() === "") i++; break; }
      // Untabbed text here is the overflow of the previous row's last cell.
      const carry = lines.slice(i, j).map((x) => x.trim()).filter(Boolean);
      if (carry.length && md.length) {
        const prev = md[md.length - 1];
        if (prev.startsWith("| ")) {
          md[md.length - 1] = prev.replace(/\s*\|$/, "<br>" + carry.join("<br>") + " |");
        }
      }
      i = j;
      continue;
    }




    buf.push(l);
    i++;
    const tabs = buf.join("\n").split("\t").length - 1;
    if (tabs >= n - 1) {
      md.push("| " + cellsFrom(buf, n).join(" | ") + " |");
      buf = [];
    }
  }
  if (buf.length) md.push("| " + cellsFrom(buf, n).join(" | ") + " |");
  md.push("");
}

fs.writeFileSync(out, md.join("\n"));
console.log("lines out:", md.length);

// Second pass: any remaining run of raw TAB lines (small ad-hoc tables without
// a "Note: Double check" header) also becomes a Markdown pipe table.
{
  const src2 = fs.readFileSync(out, "utf8").split("\n");
  const res = [];
  let k = 0;
  while (k < src2.length) {
    if (!src2[k].includes("\t")) { res.push(src2[k]); k++; continue; }
    const run = [];
    while (k < src2.length && src2[k].includes("\t")) { run.push(src2[k]); k++; }
    if (run.length < 2) { res.push(...run); continue; }
    const n = Math.max(...run.map((r) => r.split("\t").length));
    const row = (l) => {
      const c = l.split("\t").map((x) => x.trim());
      while (c.length < n) c.push("");
      return "| " + c.map((x) => (x || " ").replace(/\|/g, "\\|")).join(" | ") + " |";
    };
    res.push(row(run[0]));
    res.push("|" + Array.from({ length: n }, () => " --- ").join("|") + "|");
    for (const r of run.slice(1)) res.push(row(r));
  }
  fs.writeFileSync(out, res.join("\n"));
}
