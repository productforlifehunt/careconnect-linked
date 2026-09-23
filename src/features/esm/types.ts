/**
 * ESM Survey — "A Week in the Life of Dementia Caregivers"
 *
 * Every question in the study is described as data, so one renderer can draw it
 * and every answer can be given by voice.
 */

export type AnswerValue = string | number | string[] | boolean | null;

export type QuestionType =
  | "text"
  | "longtext"
  | "number"
  | "single"
  | "multi"
  | "scale"
  | "datetime"
  | "yesno";

export interface QuestionOption {
  value: string;
  label: string;
  /** Extra words the voice matcher accepts for this option. */
  aliases?: string[];
}

export interface ScaleSpec {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  /** Optional label per point, keyed by the numeric value. */
  pointLabels?: Record<number, string>;
}

export interface Question {
  /** Stable answer key. Never change once data exists. */
  id: string;
  /** Number shown to the participant, e.g. "1.1.4". */
  code?: string;
  text: string;
  help?: string;
  type: QuestionType;
  options?: QuestionOption[];
  scale?: ScaleSpec;
  unit?: string;
  optional?: boolean;
  /** Only show when this other question has one of these values. */
  showIf?: { id: string; equals: AnswerValue[] };
  /** Rendered by a purpose-built editor instead of a plain field. */
  custom?: "people";
}

export interface QuestionGroup {
  id: string;
  code?: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Questionnaire {
  id: string;
  title: string;
  intro?: string;
  groups: QuestionGroup[];
}

export type AnswerMap = Record<string, AnswerValue>;

/** Helpers used by the item banks. */
export const opts = (...labels: string[]): QuestionOption[] =>
  labels.map((label) => ({ value: label, label }));

export const scale = (
  min: number,
  max: number,
  minLabel: string,
  maxLabel: string,
  pointLabels?: Record<number, string>,
): ScaleSpec => ({ min, max, minLabel, maxLabel, pointLabels });

export const likert7 = scale(1, 7, "Strongly disagree", "Strongly agree");
export const bipolar = (minLabel: string, maxLabel: string) => scale(-3, 3, minLabel, maxLabel);
