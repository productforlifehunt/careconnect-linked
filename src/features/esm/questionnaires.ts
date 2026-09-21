/**
 * The four instruments participants actually fill in:
 * primary screening, other-caregiver screening, hourly log, daily log.
 */
import { Question, QuestionGroup, Questionnaire, bipolar, opts, scale } from "./types";
import { adksGroup, dasGroup, mspssGroup, npiqGroup, perseveranceGroup, sscqGroup } from "./scales";

const EDUCATION = opts(
  "Elementary",
  "Middle School",
  "High School",
  "Associate",
  "Bachelor",
  "Master",
  "Doctorate",
);

const RELATIONSHIP_TO_RECIPIENT = opts(
  "Spouse/Partner",
  "Parent",
  "Child",
  "Sibling",
  "Other Relative",
  "Friend/Neighbor",
  "Professional Caregiver",
  "Other",
);

const CARE_DURATION = opts(
  "Less than 6 months",
  "6 months - 1 year",
  "1-2 years",
  "2-5 years",
  "More than 5 years",
);

const DISTANCE = opts(
  "Same home",
  "Same building",
  "Same neighborhood",
  "Same city",
  "Different city",
  "Different province/country",
);

const GENDER = opts("Male", "Female");

const ASSIST_LEVEL = opts("Independent", "Needs help", "Cannot do");

const adlItems = ["Eating", "Bathing", "Dressing", "Toileting", "Moving around"];
const iadlItems = [
  "Managing medications",
  "Handling finances",
  "Shopping",
  "Preparing meals",
  "Housework",
];

/* ------------------------------------------- Section 1: primary caregiver */

const primaryPersonal: QuestionGroup = {
  id: "primary_personal",
  code: "1.1",
  title: "About you",
  questions: [
    { id: "p_full_name", code: "1.1.1", text: "Full name", type: "text" },
    { id: "p_age", code: "1.1.2", text: "Age", type: "number", unit: "years" },
    { id: "p_gender", code: "1.1.3", text: "Gender", type: "single", options: GENDER },
    { id: "p_education", code: "1.1.4", text: "Education level", type: "single", options: EDUCATION },
    {
      id: "p_employment",
      code: "1.1.5",
      text: "Employment status",
      type: "single",
      options: opts(
        "Employed full-time",
        "Employed part-time",
        "Self-employed",
        "Unemployed",
        "Retired",
        "Student",
      ),
    },
    {
      id: "p_marital",
      code: "1.1.6",
      text: "Marital status",
      type: "single",
      options: opts("Single", "Married", "Divorced", "Widowed"),
    },
    {
      id: "p_self_health",
      code: "1.1.7",
      text: "How would you rate your own health?",
      type: "scale",
      scale: scale(1, 5, "Poor", "Excellent", { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very good", 5: "Excellent" }),
    },
    {
      id: "p_relationship",
      code: "1.1.8",
      text: "Your relationship to the care recipient",
      type: "single",
      options: RELATIONSHIP_TO_RECIPIENT,
    },
    { id: "p_care_duration", code: "1.1.9", text: "How long have you been providing care?", type: "single", options: CARE_DURATION },
    { id: "p_hours_week", code: "1.1.10", text: "Hours of care per week", type: "number", unit: "hours" },
    { id: "p_distance", code: "1.1.11", text: "How far do you live from the care recipient?", type: "single", options: DISTANCE },
  ],
};

const recipientInfo: QuestionGroup = {
  id: "recipient_info",
  code: "1.2",
  title: "About the person you care for",
  questions: [
    { id: "r_age", code: "1.2.1", text: "Care recipient age", type: "number", unit: "years" },
    { id: "r_gender", code: "1.2.2", text: "Care recipient gender", type: "single", options: GENDER },
    {
      id: "r_dementia_type",
      code: "1.2.3",
      text: "Type of dementia",
      type: "single",
      options: opts(
        "Alzheimer's Disease",
        "Vascular Dementia",
        "Lewy Body Dementia",
        "Frontotemporal Dementia",
        "Mixed Dementia",
        "Unknown/Not Diagnosed",
        "Other",
      ),
    },
    { id: "r_years_since_diagnosis", code: "1.2.4", text: "Years since diagnosis", type: "number", unit: "years" },
    {
      id: "r_cdr",
      code: "1.2.5",
      text: "Dementia stage (Clinical Dementia Rating)",
      type: "single",
      options: opts(
        "CDR 0 - Normal",
        "CDR 0.5 - Very Mild Dementia",
        "CDR 1 - Mild Dementia",
        "CDR 2 - Moderate Dementia",
        "CDR 3 - Severe Dementia",
      ),
    },
    { id: "r_education", code: "1.2.6", text: "Care recipient education level", type: "single", options: EDUCATION },
  ],
};

const adlGroup: QuestionGroup = {
  id: "adl",
  code: "1.2.7",
  title: "Activities of daily living (ADL)",
  description: "For each activity, how much help does the care recipient need?",
  questions: adlItems.map<Question>((item) => ({
    id: `adl_${item.toLowerCase().replace(/\s+/g, "_")}`,
    code: item,
    text: item,
    type: "single",
    options: ASSIST_LEVEL,
  })),
};

const iadlGroup: QuestionGroup = {
  id: "iadl",
  code: "1.2.8",
  title: "Instrumental activities of daily living (IADL)",
  description: "For each activity, how much help does the care recipient need?",
  questions: iadlItems.map<Question>((item) => ({
    id: `iadl_${item.toLowerCase().replace(/\s+/g, "_")}`,
    code: item,
    text: item,
    type: "single",
    options: ASSIST_LEVEL,
  })),
};

export const primaryScreening: Questionnaire = {
  id: "primary_screening",
  title: "Primary caregiver screening",
  intro:
    "This is the one-time entry survey for the main caregiver. You can answer any question by speaking — tap the microphone next to it.",
  groups: [
    primaryPersonal,
    recipientInfo,
    adlGroup,
    iadlGroup,
    npiqGroup,
    sscqGroup,
    mspssGroup,
    perseveranceGroup,
    adksGroup("1.7.1"),
    dasGroup("1.7.2"),
  ],
};

/* --------------------------------------------- Section 2: other caregiver */

const otherPersonal: QuestionGroup = {
  id: "other_personal",
  code: "2.1",
  title: "About you",
  questions: [
    { id: "o_age", code: "2.1.1", text: "Age", type: "number", unit: "years" },
    { id: "o_gender", code: "2.1.2", text: "Gender", type: "single", options: GENDER },
    { id: "o_education", code: "2.1.2b", text: "Education level", type: "single", options: EDUCATION },
    {
      id: "o_relationship_primary",
      code: "2.1.3",
      text: "Your relationship to the primary caregiver",
      type: "single",
      options: opts(
        "Spouse/Partner",
        "Child",
        "Sibling",
        "Other Relative",
        "Friend/Neighbor",
        "Professional Caregiver",
        "Other",
      ),
    },
    {
      id: "o_relationship_recipient",
      code: "2.1.4",
      text: "Your relationship to the care recipient",
      type: "single",
      options: RELATIONSHIP_TO_RECIPIENT,
    },
    { id: "o_care_duration", code: "2.1.5", text: "How long have you been providing care?", type: "single", options: CARE_DURATION },
    { id: "o_hours_week", code: "2.1.6", text: "Hours of care per week", type: "number", unit: "hours" },
    { id: "o_distance", code: "2.1.7", text: "How far do you live from the care recipient?", type: "single", options: DISTANCE },
    {
      id: "o_contact_frequency",
      code: "2.1.8",
      text: "How often are you in contact with the care recipient?",
      type: "single",
      options: opts(
        "Daily",
        "Several times a week",
        "Weekly",
        "Several times a month",
        "Monthly",
        "Less than monthly",
      ),
    },
  ],
};

export const otherScreening: Questionnaire = {
  id: "other_screening",
  title: "Other caregiver screening",
  intro:
    "This is the one-time entry survey for everyone else who helps with care. You can answer any question by speaking.",
  groups: [otherPersonal, adksGroup("2.2.1"), dasGroup("2.2.2")],
};

/* ------------------------------------------------ Section 3: hourly log */

/**
 * Activity categories. The "ADL"/"IADL" prefixes are study bookkeeping and are
 * never shown to participants — `label` is what they read, `family` is kept for
 * analysis.
 */
export const ACTIVITY_CATEGORIES: { value: string; label: string; family: string }[] = [
  { value: "adl_clinical", family: "ADL-Clinical", label: "Medication and medical tasks" },
  { value: "adl_functional", family: "ADL-Functional", label: "Feeding, bathing, dressing, grooming, toileting, moving around" },
  { value: "adl_cognitive", family: "ADL-Cognitive", label: "Orientation, conversation, answering questions" },
  { value: "iadl_decision", family: "IADL-Decision", label: "Medical, financial and other decisions" },
  { value: "iadl_housekeeping", family: "IADL-Housekeeping", label: "Preparing meals, cleaning, shopping" },
  { value: "iadl_info", family: "IADL-Info Management", label: "Coordinating care, communicating with the care team, managing finances" },
  { value: "iadl_logistics", family: "IADL-Logistics", label: "Scheduling appointments, reminding, making sure necessities arrive" },
  { value: "iadl_transport", family: "IADL-Transport", label: "Driving, arranging rides, going along to appointments" },
  { value: "companionship", family: "Companionship", label: "Social interaction, conversation, games, music, walks, outings" },
  { value: "caregiver_support", family: "Caregiver Support", label: "Emotional support for other caregivers, respite" },
  { value: "vigilance", family: "Vigilance", label: "Supervision, safety monitoring, preventing wandering" },
  { value: "pet_care", family: "Pet Care", label: "Walking pets, feeding, vet visits" },
  { value: "skill_development", family: "Skill Development", label: "Attending classes, reading, learning about dementia" },
  { value: "other", family: "Other", label: "Something else (please describe)" },
];

const activityTab: QuestionGroup = {
  id: "hourly_activity",
  code: "3.1",
  title: "Activity",
  questions: [
    {
      id: "h_when",
      code: "3.1.1",
      text: "When did it happen?",
      type: "single",
      options: [
        { value: "now", label: "Now — happening now or just happened", aliases: ["now"] },
        { value: "other_time", label: "Another time — something I did not record earlier today", aliases: ["other", "earlier"] },
        { value: "not_tied", label: "Not tied to a specific time — a challenge, need or idea", aliases: ["not tied", "no time", "general"] },
      ],
    },
    {
      id: "h_categories",
      code: "3.1.2",
      text: "What did this involve? Choose everything that applies.",
      type: "multi",
      options: ACTIVITY_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
    },
    {
      id: "h_other_category",
      text: "Describe the other activity",
      type: "text",
      optional: true,
    },
    {
      id: "h_event_stress",
      code: "3.1.3",
      text: "How did this event feel?",
      type: "scale",
      scale: bipolar("Very unpleasant", "Very pleasant"),
    },
    {
      id: "h_description",
      code: "3.1.4",
      text: "Describe what happened",
      type: "longtext",
      help: "Speak freely — the recording is turned into text for you.",
    },
    {
      id: "h_mbp_memory",
      code: "3.1.5.a",
      text: "Were there memory problems? For example repeating things, losing things, not finishing a task, not remembering events or people, trouble concentrating.",
      type: "yesno",
    },
    {
      id: "h_mbp_behaviour",
      code: "3.1.5.b",
      text: "Were there behaviour problems? For example breaking things on purpose, verbal aggression, threats to harm others, wandering at night, opposition or provocation.",
      type: "yesno",
    },
    {
      id: "h_mbp_depressive",
      code: "3.1.5.c",
      text: "Were there depressive symptoms? For example sadness, hopelessness, threats of self-harm, talking about dying, loneliness, feeling useless or worthless.",
      type: "yesno",
    },
    {
      id: "h_mbp_distress",
      code: "3.1.6",
      text: "During this event, how much did their memory or behaviour problems disturb or upset you?",
      type: "scale",
      scale: scale(0, 4, "Not at all", "Extremely"),
    },
    {
      id: "h_unfulfilled_needs",
      code: "3.1.7",
      text: "Was there any care need you could not meet? (optional)",
      type: "longtext",
      optional: true,
    },
    {
      id: "h_ideas",
      code: "3.1.8",
      text: "Any ideas or suggestions? (optional)",
      type: "longtext",
      optional: true,
    },
    { id: "h_minutes", code: "3.1.9", text: "How long did it take?", type: "number", unit: "minutes" },
    ...["Cheerful", "Relaxed", "Enthusiastic", "Satisfied"].map<Question>((item, i) => ({
      id: `h_pa_${item.toLowerCase()}`,
      code: i === 0 ? "3.1.10" : undefined,
      text: `Right now I feel ${item.toLowerCase()}`,
      type: "scale",
      scale: scale(1, 7, "Not at all", "Very much"),
    })),
    ...["Insecure", "Lonely", "Anxious", "Irritated", "Down", "Desperate", "Tensed"].map<Question>((item, i) => ({
      id: `h_na_${item.toLowerCase()}`,
      code: i === 0 ? "3.1.11" : undefined,
      text: `Right now I feel ${item.toLowerCase()}`,
      type: "scale",
      scale: scale(1, 7, "Not at all", "Very much"),
    })),
  ],
};

const peopleTab: QuestionGroup = {
  id: "hourly_people",
  code: "3.2",
  title: "People",
  questions: [
    {
      id: "h_network",
      code: "3.2.1",
      text: "Who was involved from your care network?",
      type: "multi",
      options: [{ value: "just_me", label: "Just me" }],
    },
    { id: "h_people_involved", code: "3.2.2", text: "Who else was involved?", type: "longtext", optional: true },
    { id: "h_wish_help", code: "3.2.3", text: "Who else do you wish could help?", type: "longtext", optional: true },
    {
      id: "h_wish_help_challenges",
      code: "3.2.4",
      text: "What makes it hard to reach the people you wish could help?",
      type: "longtext",
      optional: true,
    },
  ],
};

const challengesTab: QuestionGroup = {
  id: "hourly_challenges",
  code: "3.3",
  title: "Challenges & resources",
  questions: [
    {
      id: "h_challenge_level",
      code: "3.3.1",
      text: "How challenging was this task?",
      type: "scale",
      scale: bipolar("No challenges", "Extreme challenges"),
    },
    {
      id: "h_challenge_types",
      code: "3.3.2",
      text: "What kind of challenges? Choose everything that applies.",
      type: "multi",
      options: opts(
        "Handle symptoms",
        "Condition",
        "Updates",
        "Coordination",
        "Time",
        "Emotional",
        "Physical",
        "Communication",
        "Safety",
        "Privacy",
        "Other",
      ),
    },
    { id: "h_challenges_faced", code: "3.3.3", text: "Describe the challenges you faced", type: "longtext", optional: true },
    {
      id: "h_resources_using",
      code: "3.3.4",
      text: "What resources are you using, and what is difficult about them?",
      type: "longtext",
      optional: true,
    },
    {
      id: "h_resources_wished",
      code: "3.3.5",
      text: "What resources do you wish existed, or wish were better?",
      type: "longtext",
      optional: true,
    },
  ],
};

export const hourlyLog: Questionnaire = {
  id: "hourly_log",
  title: "Hourly log",
  intro: "One entry for what just happened. Three short tabs — every answer can be spoken.",
  groups: [activityTab, peopleTab, challengesTab],
};

/* ------------------------------------------------- Section 4: daily log */

export const dailyLog: Questionnaire = {
  id: "daily_log",
  title: "End-of-day log",
  intro: "Look back at the whole day. Add anything you did not record, then rate the day.",
  groups: [
    {
      id: "daily_supplement",
      code: "4.1",
      title: "Anything you did not record today",
      description:
        "Review the day and add care activities you did not log during the hourly reminders. You can also add them as full hourly entries from the home screen.",
      questions: [
        {
          id: "d_supplement",
          text: "What else happened today that you did not log?",
          type: "longtext",
          optional: true,
        },
      ],
    },
    {
      id: "daily_competence",
      code: "4.2",
      title: "Today's sense of competence",
      questions: [
        { id: "d_sscq_stress", code: "4.2.1", text: "Today I felt stressed due to my care responsibilities", type: "scale", scale: scale(1, 7, "Strongly disagree", "Strongly agree") },
        { id: "d_sscq_privacy", code: "4.2.2", text: "Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked", type: "scale", scale: scale(1, 7, "Strongly disagree", "Strongly agree") },
        { id: "d_sscq_strain", code: "4.2.3", text: "Today I felt strained in the interactions with my care recipient", type: "scale", scale: scale(1, 7, "Strongly disagree", "Strongly agree") },
      ],
    },
    {
      id: "daily_burden",
      code: "4.3",
      title: "Today's burden",
      questions: [
        {
          id: "d_burden",
          text: "Looking back at today as a whole, how would you rate your overall caregiving burden today?",
          type: "scale",
          scale: bipolar("Very light", "Very heavy"),
        },
      ],
    },
  ],
};

export const QUESTIONNAIRES = { primaryScreening, otherScreening, hourlyLog, dailyLog };
