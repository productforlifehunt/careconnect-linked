/**
 * Standardised instruments used by the study, item by item.
 *
 * NOTE FOR THE RESEARCH TEAM: item wording below follows the published English
 * versions (NPI-Q, SSCQ, MSPSS, ADKS, DAS). Check the wording against your
 * licensed copy before data collection starts; edit only the `text` strings and
 * never the `id` values, which are the stored answer keys.
 */
import { Question, QuestionGroup, likert7, opts, scale } from "./types";

/* ------------------------------------------------------------------ NPI-Q */

const NPIQ_DOMAINS: { id: string; name: string; text: string }[] = [
  { id: "delusions", name: "Delusions", text: "Does the patient believe that others are stealing from him or her, or planning to harm him or her in some way?" },
  { id: "hallucinations", name: "Hallucinations", text: "Does the patient act as if he or she hears voices, or talk to people who are not there?" },
  { id: "agitation", name: "Agitation / Aggression", text: "Is the patient resistant to help from others, or hard to handle?" },
  { id: "depression", name: "Depression / Dysphoria", text: "Does the patient act as if he or she is sad or in low spirits, or cry?" },
  { id: "anxiety", name: "Anxiety", text: "Does the patient become upset when separated from you, or show signs of nervousness such as shortness of breath, sighing or feeling unable to relax?" },
  { id: "elation", name: "Elation / Euphoria", text: "Does the patient appear to feel too good or act excessively happy?" },
  { id: "apathy", name: "Apathy / Indifference", text: "Does the patient seem less interested in his or her usual activities, or in the activities and plans of others?" },
  { id: "disinhibition", name: "Disinhibition", text: "Does the patient act impulsively, for example talking to strangers as if he or she knows them, or saying things that may hurt people's feelings?" },
  { id: "irritability", name: "Irritability / Lability", text: "Is the patient impatient and cranky, or does he or she have difficulty coping with delays or waiting for planned activities?" },
  { id: "motor", name: "Motor disturbance", text: "Does the patient engage in repetitive activities such as pacing around the house, handling buttons, wrapping string or doing other things repeatedly?" },
  { id: "night", name: "Nighttime behaviours", text: "Does the patient wake you up at night, rise too early in the morning, or take excessive naps during the day?" },
  { id: "appetite", name: "Appetite / Eating", text: "Has the patient lost or gained weight, or had a change in the food he or she likes?" },
];

export const npiqGroup: QuestionGroup = {
  id: "npiq",
  code: "1.3",
  title: "Neuropsychiatric Inventory Questionnaire (NPI-Q)",
  description:
    "For each behaviour, say whether it has been present in the past month. If it has, rate how severe it is and how much it distresses you.",
  questions: NPIQ_DOMAINS.flatMap<Question>((d) => [
    {
      id: `npiq_${d.id}_present`,
      code: d.name,
      text: d.text,
      type: "yesno",
    },
    {
      id: `npiq_${d.id}_severity`,
      text: `${d.name} — severity`,
      type: "scale",
      scale: scale(1, 3, "Mild", "Severe", { 1: "Mild", 2: "Moderate", 3: "Severe" }),
      showIf: { id: `npiq_${d.id}_present`, equals: ["yes"] },
    },
    {
      id: `npiq_${d.id}_distress`,
      text: `${d.name} — how much does this distress you?`,
      type: "scale",
      scale: scale(0, 5, "Not at all", "Extremely", {
        0: "Not distressing at all",
        1: "Minimal",
        2: "Mild",
        3: "Moderate",
        4: "Severe",
        5: "Extreme",
      }),
      showIf: { id: `npiq_${d.id}_present`, equals: ["yes"] },
    },
  ]),
};

/* ------------------------------------------------------------------- SSCQ */

const SSCQ_ITEMS = [
  "I feel my care recipient asks for more help than he or she needs.",
  "I feel I do not have enough time for myself because of the time I spend with my care recipient.",
  "I feel stressed between caring for my care recipient and meeting other responsibilities.",
  "I feel embarrassed by my care recipient's behaviour.",
  "I feel angry when I am with my care recipient.",
  "I feel my care recipient's present situation does not allow me as much privacy as I would like.",
  "I feel strained in the interactions with my care recipient.",
];

export const sscqGroup: QuestionGroup = {
  id: "sscq",
  code: "1.4",
  title: "Short Sense of Competence Questionnaire (SSCQ)",
  description: "How much do you agree with each statement about your caregiving situation?",
  questions: SSCQ_ITEMS.map<Question>((text, i) => ({
    id: `sscq_${i + 1}`,
    code: `${i + 1}`,
    text,
    type: "scale",
    scale: scale(1, 5, "Strongly disagree", "Strongly agree"),
  })),
};

/* ------------------------------------------------------------------ MSPSS */

const MSPSS_ITEMS: { text: string; sub: string }[] = [
  { text: "There is a special person who is around when I am in need.", sub: "Significant Other" },
  { text: "There is a special person with whom I can share my joys and sorrows.", sub: "Significant Other" },
  { text: "My family really tries to help me.", sub: "Family" },
  { text: "I get the emotional help and support I need from my family.", sub: "Family" },
  { text: "I have a special person who is a real source of comfort to me.", sub: "Significant Other" },
  { text: "My friends really try to help me.", sub: "Friends" },
  { text: "I can count on my friends when things go wrong.", sub: "Friends" },
  { text: "I can talk about my problems with my family.", sub: "Family" },
  { text: "I have friends with whom I can share my joys and sorrows.", sub: "Friends" },
  { text: "There is a special person in my life who cares about my feelings.", sub: "Significant Other" },
  { text: "My family is willing to help me make decisions.", sub: "Family" },
  { text: "I can talk about my problems with my friends.", sub: "Friends" },
];

export const mspssGroup: QuestionGroup = {
  id: "mspss",
  code: "1.5",
  title: "Multidimensional Scale of Perceived Social Support (MSPSS)",
  description: "Rate how strongly you agree with each statement.",
  questions: MSPSS_ITEMS.map<Question>((item, i) => ({
    id: `mspss_${i + 1}`,
    code: `${i + 1} · ${item.sub}`,
    text: item.text,
    type: "scale",
    scale: likert7,
  })),
};

/* ------------------------------------------------- Perseverance time */

export const perseveranceGroup: QuestionGroup = {
  id: "perseverance",
  code: "1.6",
  title: "Perseverance time",
  questions: [
    {
      id: "perseverance_time",
      text: "How much longer do you think you can continue providing care for your care recipient given the current situation?",
      type: "single",
      options: opts(
        "Less than 1 week",
        "More than 1 week but less than 1 month",
        "More than 1 month but less than 6 months",
        "More than 6 months but less than 1 year",
        "More than 1 year but less than 2 years",
        "More than 2 years",
      ),
    },
  ],
};

/* ------------------------------------------------------------------- ADKS */

/** Alzheimer's Disease Knowledge Scale — 30 True/False statements. */
const ADKS_ITEMS = [
  "People with Alzheimer's disease are particularly prone to depression.",
  "It has been scientifically proven that mental exercise can prevent a person from getting Alzheimer's disease.",
  "After symptoms of Alzheimer's disease appear, the average life expectancy is six to twelve years.",
  "When a person with Alzheimer's disease becomes agitated, a medical examination may reveal other health problems that caused the agitation.",
  "People with Alzheimer's disease do best with simple written reminders.",
  "People whose Alzheimer's disease is not yet severe can benefit from psychotherapy for depression and anxiety.",
  "If a person with Alzheimer's disease becomes alert and agitated in the late afternoon and early evening, that person may be experiencing 'sundowning'.",
  "When people with Alzheimer's disease begin to have difficulty taking care of themselves, caregivers should take over right away.",
  "If trouble with memory and confused thinking appears suddenly, it is likely due to Alzheimer's disease.",
  "Most people with Alzheimer's disease live in nursing homes.",
  "Poor nutrition can make the symptoms of Alzheimer's disease worse.",
  "People in the early stages of Alzheimer's disease are usually good candidates for behavioural therapies.",
  "Once people have Alzheimer's disease, they are no longer capable of making informed decisions about their own care.",
  "Eventually, a person with Alzheimer's disease will need 24-hour supervision.",
  "Having high cholesterol may increase a person's risk of developing Alzheimer's disease.",
  "Tremor or shaking of the hands or arms is a common symptom in people with Alzheimer's disease.",
  "Symptoms of severe depression can be mistaken for symptoms of Alzheimer's disease.",
  "Alzheimer's disease is one type of dementia.",
  "Trouble handling money or paying bills is a common early symptom of Alzheimer's disease.",
  "One symptom that can occur with Alzheimer's disease is believing that other people are stealing one's things.",
  "When a person has Alzheimer's disease, using reminder notes is a crutch that can contribute to decline.",
  "Prescription drugs that prevent Alzheimer's disease are available.",
  "Having high blood pressure may increase a person's risk of developing Alzheimer's disease.",
  "Genes can only partially account for the development of Alzheimer's disease.",
  "It is safe for people with Alzheimer's disease to drive, as long as they have a companion in the car at all times.",
  "Alzheimer's disease cannot be cured.",
  "Most people with Alzheimer's disease remember recent events better than things that happened in the past.",
  "In rare cases, people have recovered from Alzheimer's disease.",
  "People with Alzheimer's disease are especially prone to falls and other accidents.",
  "Difficulty with the ability to walk is common in people who are in the later stages of Alzheimer's disease.",
];

export function adksGroup(code: string): QuestionGroup {
  return {
    id: "adks",
    code,
    title: "Alzheimer's Disease Knowledge Scale (ADKS)",
    description: "Say whether each statement is true or false. It is fine to be unsure — give your best answer.",
    questions: ADKS_ITEMS.map<Question>((text, i) => ({
      id: `adks_${i + 1}`,
      code: `${i + 1}`,
      text,
      type: "single",
      options: [
        { value: "True", label: "True", aliases: ["yes", "correct", "right"] },
        { value: "False", label: "False", aliases: ["no", "wrong", "incorrect"] },
      ],
    })),
  };
}

/* -------------------------------------------------------------------- DAS */

/** Dementia Attitudes Scale — 20 items, 1–7 agreement. */
const DAS_ITEMS = [
  "It is rewarding to work with people who have dementia.",
  "I am afraid of people with dementia.",
  "People with dementia can be creative.",
  "I feel confident around people with dementia.",
  "I am afraid of people with dementia because of the way they might behave.",
  "Every person with dementia has different needs.",
  "I am not very familiar with dementia.",
  "I feel relaxed around people with dementia.",
  "People with dementia like having familiar things nearby.",
  "I feel uncomfortable being around people with dementia.",
  "It is important to know the past history of people with dementia.",
  "It is possible to enjoy interacting with people with dementia.",
  "I feel frustrated because I do not know how to help people with dementia.",
  "I cannot imagine taking care of someone with dementia.",
  "I admire the coping skills of people with dementia.",
  "We can do a lot now to improve the lives of people with dementia.",
  "Difficult behaviours may be a form of communication for people with dementia.",
  "I am comfortable touching people with dementia.",
  "I would avoid an agitated person with dementia.",
  "I would like to get to know people with dementia better.",
];

export function dasGroup(code: string): QuestionGroup {
  return {
    id: "das",
    code,
    title: "Dementia Attitudes Scale (DAS)",
    description: "Rate how strongly you agree with each statement.",
    questions: DAS_ITEMS.map<Question>((text, i) => ({
      id: `das_${i + 1}`,
      code: `${i + 1}`,
      text,
      type: "scale",
      scale: likert7,
    })),
  };
}
