/**
 * The four instruments participants fill in, built straight from the study's
 * item bank (`spec.generated.ts`) so every question keeps its exact wording,
 * order, options and storage column.
 *
 * Answer keys are the storage keys: `c318_a01` is written to column a01 of the
 * screening table, and nothing in between needs a translation table.
 */
import { ESM_SPEC, SpecItem } from "./spec.generated";
import type { Question, QuestionGroup, Questionnaire, ScaleSpec } from "./types";

const TITLE_CASE = (heading: string) =>
  heading
    .replace(/^(\d+(?:\.\d+)*)\s+/, "")
    .replace(/\b([A-Z]{2,})\b(?![a-z])/g, (word) =>
      // Keep instrument acronyms, sentence-case the rest.
      word.length <= 5 && /^(NPI|ADKS|DAS|SSCQ|MSPSS|ADL|IADL|MBP|CDR|Q)$/.test(word)
        ? word
        : word.charAt(0) + word.slice(1).toLowerCase(),
    );

function scaleOf(item: SpecItem): ScaleSpec | undefined {
  if (!item.scale) return undefined;
  const [minLabel, maxLabel] = (item.scale.labels || "")
    .replace(/^\s*|\s*$/g, "")
    .split(/\s+to\s+/i);
  return {
    min: item.scale.min,
    max: item.scale.max,
    minLabel: minLabel?.trim() || String(item.scale.min),
    maxLabel: maxLabel?.replace(/\).*$/s, "").trim() || String(item.scale.max),
  };
}

/** Options whose label starts with "Other" — used to reveal the detail box. */
const otherValues = (parent: SpecItem | undefined): string[] =>
  (parent?.options ?? []).filter((o) => /^other/i.test(o.label)).map((o) => o.value);

const byId = new Map(ESM_SPEC.map((item) => [item.id, item]));

function toQuestion(item: SpecItem): Question {
  const type: Question["type"] =
    item.type === "datetime"
      ? "datetime"
      : item.type === "date"
        ? "text"
        : (item.type as Question["type"]);

  const question: Question = {
    id: item.id,
    code: item.code || undefined,
    text: item.label,
    help: item.help,
    type,
    options: item.options,
    scale: scaleOf(item),
  };

  if (/\(optional\)/i.test(item.label) || item.otherFor) question.optional = true;
  if (item.id === "c319_a26") {
    question.custom = "people";
    question.optional = true;
    question.text = "Who was involved?";
    question.help =
      "Add the people who took part. Each person is saved once and can be picked again in later entries.";
  }
  if (item.id === "c319_a03") {
    question.showIf = { id: "c319_a01", equals: ["b02"] };
    question.optional = true;
  }
  if (/^c318_a(?:29|30|32|33|35|36|38|39|41|42|44|45|47|48|50|51|53|54|56|57|59|60|62|63)$/.test(item.id)) {
    const column = Number(item.column.slice(1));
    const presenceColumn = column - ((column - 28) % 3);
    question.showIf = { id: `c318_a${String(presenceColumn).padStart(2, "0")}`, equals: ["b01"] };
  }
  if (item.otherFor) {
    const values = otherValues(byId.get(item.otherFor));
    if (values.length) question.showIf = { id: item.otherFor, equals: values };
  }
  return question;
}

/** Groups the given items into survey pages, keeping the document's order. */
function groupsOf(items: SpecItem[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  for (const item of items) {
    const heading = item.block || item.group;
    const code = (heading.match(/^\d+(?:\.\d+)*/) || [""])[0];
    const last = groups[groups.length - 1];
    if (!last || last.id !== heading) {
      groups.push({ id: heading, code, title: TITLE_CASE(heading), questions: [] });
    }
    groups[groups.length - 1].questions.push(toQuestion(item));
  }
  return groups;
}

const startsWith = (item: SpecItem, prefix: string) => item.code.startsWith(prefix);

/** Columns a02–a05 of the hourly table are filled in by the app, not typed. */
const HIDDEN = new Set(["c319_a02"]);

const screeningItems = ESM_SPEC.filter((i) => i.cct === "318");
const sharedInstrumentItems = screeningItems.filter((i) => startsWith(i, "1.7"));

export const primaryScreening: Questionnaire = {
  id: "esm_primary_screening",
  title: "Primary caregiver entry survey",
  intro:
    "This one-time survey sets the baseline for your week. Every question can be answered by voice — tap the microphone.",
  groups: groupsOf(screeningItems.filter((i) => startsWith(i, "1."))),
};

export const otherScreening: Questionnaire = {
  id: "esm_other_screening",
  title: "Secondary caregiver entry survey",
  intro:
    "This one-time survey is for secondary caregivers who help alongside the primary caregiver. Every question can be answered by voice.",
  groups: groupsOf([
    ...screeningItems.filter((i) => startsWith(i, "2.")),
    ...sharedInstrumentItems,
  ]),
};

export const hourlyLog: Questionnaire = {
  id: "esm_hourly_log",
  title: "Hourly log",
  intro: "Tell us about this hour: what happened, who was involved, what was hard.",
  groups: groupsOf(ESM_SPEC.filter((i) => i.cct === "319" && !HIDDEN.has(i.id))),
};

export const dailyLog: Questionnaire = {
  id: "esm_daily_log",
  title: "End-of-day log",
  intro: "Close the day: anything you did not log, and how today felt overall.",
  groups: groupsOf(ESM_SPEC.filter((i) => i.cct === "317")),
};

export const QUESTIONNAIRES = { primaryScreening, otherScreening, hourlyLog, dailyLog };

/**
 * Optional details about a person named in an hourly log: the 2.1 questions
 * (CCT318 a134–a143), saved into a new CCT318 row linked to the person by REL321.
 */
export const personDetailQuestions: Question[] = screeningItems
  .filter((i) => startsWith(i, "2.1"))
  .map((i) => ({ ...toQuestion(i), optional: true }));

/** The activity families, still exported for the entry list summaries. */
export const ACTIVITY_CATEGORIES =
  byId.get("c319_a04")?.options?.map((o) => ({ value: o.value, label: o.label })) ?? [];
