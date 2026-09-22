/**
 * Generates the ESM survey field/column mapping document from the live
 * questionnaire definitions, so the doc can never drift from the app.
 * Run: bun scripts/gen-esm-columns.ts
 */
import { primaryScreening, otherScreening, hourlyLog, dailyLog } from "../src/features/esm/questionnaires";
import type { Question, Questionnaire } from "../src/features/esm/types";

const pad = (n: number) => (n < 100 ? String(n).padStart(2, "0") : String(n));
const col = (n: number) => `a${pad(n)}`;
const sel = (n: number) => `b${pad(n)}`;

type Row = { code: string; text: string; column: string; type: string; values?: string; note?: string };

function fieldType(q: Question): string {
  switch (q.type) {
    case "text": return "Text";
    case "longtext": return "Textarea";
    case "number": return "Number";
    case "single": return "Radio";
    case "multi": return "Text";
    case "scale": return "Number";
    case "yesno": return "Radio";
  }
}

function values(q: Question): string | undefined {
  if (q.type === "yesno") return `b01 = yes ｜ b02 = no`;
  if (q.type === "single" || q.type === "multi") {
    return (q.options ?? []).map((o, i) => `${sel(i + 1)} = ${o.label}`).join(" ｜ ");
  }
  if (q.type === "scale" && q.scale) {
    return `存数字 ${q.scale.min} … ${q.scale.max}（${q.scale.minLabel} → ${q.scale.maxLabel}）`;
  }
  if (q.type === "number") return q.unit ? `数字，单位：${q.unit}` : "数字";
  return undefined;
}

/** Extra columns injected by hand, keyed by the question id they follow. */
const INJECT_AFTER: Record<string, { text: string; type: string; note: string }[]> = {
  h_when: [
    { text: "选 NOW 时写入的当前时间", type: "Datetime", note: "此处修改：按你的要求单独成列" },
    { text: "选 OTHER TIME 时写入的补记时间", type: "Datetime", note: "此处修改：按你的要求单独成列" },
  ],
};

/** Extra trailing columns per questionnaire id. */
const TRAILING: Record<string, { text: string; type: string; note: string }[]> = {
  daily_log: [
    { text: "日志日期（哪一天的晚间记录）", type: "Date", note: "此处修改：新增，晚间日志必须能按天查，所以单独一列" },
  ],
};

function build(q: Questionnaire, cct: string, startAt = 1) {
  const rows: Row[] = [];
  let n = startAt;
  for (const g of q.groups) {
    rows.push({ code: `§ ${g.code ?? ""} ${g.title}`, text: g.description ?? "", column: "", type: "" });
    for (const question of g.questions) {
      rows.push({
        code: question.code ?? "",
        text: question.text,
        column: col(n++),
        type: fieldType(question),
        values: values(question),
        note: question.type === "multi" ? "多选：前端模拟 checkbox，选中项以英文逗号串成一个 Text 列" : undefined,
      });
      for (const extra of INJECT_AFTER[question.id] ?? []) {
        rows.push({ code: "", text: extra.text, column: col(n++), type: extra.type, note: extra.note });
      }
    }
  }
  for (const extra of TRAILING[q.id] ?? []) {
    rows.push({ code: "", text: extra.text, column: col(n++), type: extra.type, note: extra.note });
  }
  rows.push({
    code: "",
    text: "子 App 标识（固定写 esm_survey）",
    column: col(n++),
    type: "Text",
    note: "此处修改：原来 a01 是 App 标识，你把 a01 给了第一道题，所以 App 标识挪到最后一列",
  });
  return { cct, rows, total: n - 1 };
}

const INTERVIEW_PRIMARY = [
  "What is your relationship to the patient, and how long have you been providing care?",
  "What is the patient's current condition and main care needs?",
  "What does a typical day of caregiving look like for you?",
  "What difficulties do you face in your daily caregiving?",
  "What support do you need from others to help care for the patient?",
  "Who else helps care for the patient? How close are you to these people, and what does each person do?",
  "Under what circumstances do you ask others for support?",
  "Do you experience difficulties asking for support? What are the difficulties?",
  "Is there anyone you could ask for help but haven't? What's stopping you?",
  "Has your care network changed over time?",
  "What would your ideal care network look like?",
  "Looking at your network, how satisfied are you overall, from 0 to 100?",
  "When someone else helps care for the patient, what information do they ask for? What do you think they need to know?",
  "How do you communicate with other caregivers? What methods or technology do you use?",
  "Are there barriers you face when sharing information about the patient with others?",
  "When the patient's condition changes, how do you keep others informed? Are there barriers?",
  "Has the patient ever wandered, been difficult to find, or refused to return home? Do you ask other caregivers for help when this happens? How do you coordinate, and what barriers do you face?",
  "How familiar are you with using a smartphone or computer?",
  "What current tools do you use to learn more about dementia and caregiving? Where do you seek information or support? What barriers or concerns? What tools do you wish existed? What features would be helpful?",
  "What current tools do you use to communicate or coordinate with other caregivers? What worked, what did not? What barriers or concerns? What tools do you wish existed? What features would be helpful?",
  "If you could design an ideal digital service to help with caregiving, what features would you want? What concerns do you have about using digital tools?",
  "Is there anything else you'd like to share about your experience?",
];

const INTERVIEW_OTHER = [
  "What is your relationship to the patient and the primary caregiver?",
  "How did you become involved in providing care?",
  "What kind of support do you provide? How often?",
  "Is the support you provide accepted, needed, and appreciated?",
  "What information do you need to know about the patient before you can help? How is it communicated to you? Any barriers?",
  "Do you experience difficulties when providing support? What makes it difficult?",
  "Are there times you wanted to help but couldn't? What stopped you?",
  "How do you communicate with the primary caregiver and other caregivers? When the patient's condition changes, how do you find out? Are there barriers?",
  "Would you like to provide more or less support? If more, what is preventing you?",
  "Has the patient ever wandered, been difficult to find, or refused to return home? Have you ever helped? How? Any barriers?",
  "What would help you provide better support to the patient and the primary caregiver?",
  "How familiar are you with using a smartphone or computer?",
  "What current tools do you use to learn more about dementia and caregiving? Where do you seek information or support? What barriers or concerns? What tools do you wish existed? What features would be helpful?",
  "What current tools do you use to communicate or coordinate with other caregivers? What worked, what did not? What barriers or concerns? What tools do you wish existed? What features would be helpful?",
  "If you could design an ideal digital service to help with caregiving, what features would you want? What concerns do you have about using digital tools?",
  "Is there anything else you'd like to share about your experience?",
];

function interviewBlock(title: string, cct: string, items: string[], codePrefix: string) {
  const rows: Row[] = [{ code: `§ ${codePrefix} ${title}`, text: "每题一列，存访谈逐字稿/要点，可语音转录后回填", column: "", type: "" }];
  let n = 1;
  items.forEach((text, i) => {
    const isScore = /from 0 to 100/.test(text);
    rows.push({
      code: `${codePrefix}.${i + 1}`,
      text,
      column: col(n++),
      type: isScore ? "Number" : "Textarea",
      values: isScore ? "存数字 0 … 100" : undefined,
      note: isScore ? "此处修改：满意度 0–100 单独存数字列，便于统计" : undefined,
    });
  });
  rows.push({
    code: "",
    text: "子 App 标识（固定写 esm_survey）",
    column: col(n++),
    type: "Text",
    note: "此处修改：新增 App 标识列",
  });
  return { cct, rows, total: n - 1 };
}

const blocks = [
  { heading: "SECTION 1 · 主护理者初筛　CCT302 `esm_screening`（现有，需按下表补列）", ...build(primaryScreening, "CCT302") },
  { heading: "SECTION 2 · 其他护理者初筛　新建 CCT `esm_other_screening`（尚未创建）", ...build(otherScreening, "CCT-新1") },
  { heading: "SECTION 3 · 每小时日志　CCT303 `esm_hourly_log`（现有，需按下表补列）", ...build(hourlyLog, "CCT303") },
  { heading: "SECTION 4 · 每日晚间日志　CCT304 `esm_daily_log`（现有，需按下表补列）", ...build(dailyLog, "CCT304") },
  { heading: "SECTION 5 · 主护理者访谈（22 题）　新建 CCT `esm_interview_primary`（尚未创建）", ...interviewBlock("主护理者访谈", "CCT-新2", INTERVIEW_PRIMARY, "5") },
  { heading: "SECTION 6 · 其他护理者访谈（16 题）　新建 CCT `esm_interview_other`（尚未创建）", ...interviewBlock("其他护理者访谈", "CCT-新3", INTERVIEW_OTHER, "6") },
];

const out: string[] = [];
out.push("# ESM 问卷 · 逐题 Column 映射表 v1");
out.push("");
out.push("A Week in the Life of Dementia Caregivers Study（esm_survey 子 App）");
out.push("");
out.push("规则（按你的格式）：每一道题一个独立 column，不再往一个大 JSON 里塞；");
out.push("column ID 在每张 CCT 内从 a01 开始重新编号；selector 取值在每个 column 内从 b01 开始重新编号；");
out.push("多选题用一个 Text 列存英文逗号分隔的取值，checkbox 由前端模拟。");
out.push("");
out.push("此文档仅为设计稿，WordPress 里还没有动手创建；你确认后我再用后台 GUI 一个一个点出来。");
out.push("");
out.push("## CCT / Relation 一览");
out.push("");
out.push("| CCT | slug | 状态 | 列数 | Relation |");
out.push("| --- | --- | --- | --- | --- |");
out.push("| CCT302 | esm_screening | 已存在（当前只有 5 列，要扩到下表列数） | " + blocks[0].total + " | REL305 One User can have many related esm screening entries |");
out.push("| 新建 1 | esm_other_screening | 待创建 | " + blocks[1].total + " | 新建：One User can have many related esm other caregiver screening entries |");
out.push("| CCT303 | esm_hourly_log | 已存在（当前 6 列） | " + blocks[2].total + " | REL306 One User can have many related esm hourly log entries |");
out.push("| CCT304 | esm_daily_log | 已存在（当前 5 列） | " + blocks[3].total + " | REL307 One User can have many related esm daily log entries |");
out.push("| 新建 2 | esm_interview_primary | 待创建 | " + blocks[4].total + " | 新建：One User can have many related esm primary caregiver interview entries |");
out.push("| 新建 3 | esm_interview_other | 待创建 | " + blocks[5].total + " | 新建：One User can have many related esm other caregiver interview entries |");
out.push("");
out.push("此处修改：原设计把答案塞进 a04 answers JSON、a05 voice JSON，现在全部拆成单列，两个 JSON 列作废。");
out.push("此处修改：Section 2 的其他护理者初筛原来和主护理者共用一张表（靠 role 列区分），现在单独一张 CCT，role 列取消。");
out.push("此处修改：Section 5、6 的访谈原来不进数据库，现在各建一张 CCT。");
out.push("");

for (const b of blocks) {
  out.push("---");
  out.push("");
  out.push(`## ${b.heading}`);
  out.push("");
  out.push("| 题号 | 题目 | column ID | type | 取值 / selector | 备注 |");
  out.push("| --- | --- | --- | --- | --- | --- |");
  for (const r of b.rows) {
    const esc = (s: string) => (s || "").replace(/\|/g, "｜").replace(/\n/g, "<br>");
    if (!r.column) {
      out.push(`| **${esc(r.code)}** | ${esc(r.text)} |  |  |  |  |`);
    } else {
      out.push(`| ${esc(r.code)} | ${esc(r.text)} | **${r.column}** | ${r.type} | ${esc(r.values ?? "")} | ${esc(r.note ?? "")} |`);
    }
  }
  out.push("");
  out.push(`合计 ${b.total} 列（含最后一列子 App 标识）。`);
  out.push("");
}

out.push("完");
out.push("");

await Bun.write("/mnt/documents/记录-ESM问卷逐题Column映射-v1.md", out.join("\n"));
console.log("written", out.length, "lines");
