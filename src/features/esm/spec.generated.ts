/**
 * ESM study item bank — generated from the study's requirement document.
 *
 * Every entry names the exact JetEngine CCT column its answer is written to,
 * so answer keys and storage stay in lock-step. Do not hand-edit: regenerate.
 *
 * Tables: esm_screening (CCT318, 146 fields), esm_hourly_log (CCT319, 34),
 * esm_daily_log (CCT317, 5), esm_log_person (CCT320, 4).
 */

export type SpecType = "text" | "longtext" | "number" | "scale" | "single" | "multi" | "datetime" | "date";

export interface SpecItem {
  /** Answer key, always `c<cct>_<column>`. */
  id: string;
  cct: string;
  slug: string;
  column: string;
  code: string;
  group: string;
  block: string;
  label: string;
  type: SpecType;
  help?: string | undefined;
  options?: { value: string; label: string }[] | undefined;
  scale?: { min: number; max: number; labels: string } | undefined;
  /** This item holds the free-text detail for another item's "Other" choice. */
  otherFor?: string | undefined;
}

export const ESM_SPEC: SpecItem[] = [
  {
    "id": "c318_a01",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a01",
    "code": "1.1.1",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Full Name",
    "type": "text"
  },
  {
    "id": "c318_a02",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a02",
    "code": "1.1.2",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Age",
    "type": "number"
  },
  {
    "id": "c318_a03",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a03",
    "code": "1.1.3",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Gender",
    "type": "single",
    "help": "Options: Male, Female",
    "options": [
      {
        "value": "b01",
        "label": "Male"
      },
      {
        "value": "b02",
        "label": "Female"
      }
    ]
  },
  {
    "id": "c318_a04",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a04",
    "code": "1.1.4",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Education Level",
    "type": "single",
    "help": "Options: Elementary, Middle School, High School, Associate, Bachelor, Master, Doctorate",
    "options": [
      {
        "value": "b01",
        "label": "Elementary"
      },
      {
        "value": "b02",
        "label": "Middle School"
      },
      {
        "value": "b03",
        "label": "High School"
      },
      {
        "value": "b04",
        "label": "Associate"
      },
      {
        "value": "b05",
        "label": "Bachelor"
      },
      {
        "value": "b06",
        "label": "Master"
      },
      {
        "value": "b07",
        "label": "Doctorate"
      }
    ]
  },
  {
    "id": "c318_a05",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a05",
    "code": "1.1.5",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Employment Status",
    "type": "single",
    "help": "Options: Employed full-time, Employed part-time, Self-employed, Unemployed, Retired, Student",
    "options": [
      {
        "value": "b01",
        "label": "Employed full-time"
      },
      {
        "value": "b02",
        "label": "Employed part-time"
      },
      {
        "value": "b03",
        "label": "Self-employed"
      },
      {
        "value": "b04",
        "label": "Unemployed"
      },
      {
        "value": "b05",
        "label": "Retired"
      },
      {
        "value": "b06",
        "label": "Student"
      }
    ]
  },
  {
    "id": "c318_a06",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a06",
    "code": "1.1.6",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Marital Status",
    "type": "single",
    "help": "Options: Single, Married, Divorced, Widowed",
    "options": [
      {
        "value": "b01",
        "label": "Single"
      },
      {
        "value": "b02",
        "label": "Married"
      },
      {
        "value": "b03",
        "label": "Divorced"
      },
      {
        "value": "b04",
        "label": "Widowed"
      }
    ]
  },
  {
    "id": "c318_a07",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a07",
    "code": "1.1.7",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Self-Rated Health",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": "1=Poor, 5=Excellent"
    }
  },
  {
    "id": "c318_a08",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a08",
    "code": "1.1.8",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Relationship to Care Recipient",
    "type": "single",
    "help": "Options: Spouse/Partner, Parent, Child, Sibling, Other Relative, Friend/Neighbor, Professional Caregiver, Other",
    "options": [
      {
        "value": "b01",
        "label": "Spouse/Partner"
      },
      {
        "value": "b02",
        "label": "Parent"
      },
      {
        "value": "b03",
        "label": "Child"
      },
      {
        "value": "b04",
        "label": "Sibling"
      },
      {
        "value": "b05",
        "label": "Other Relative"
      },
      {
        "value": "b06",
        "label": "Friend/Neighbor"
      },
      {
        "value": "b07",
        "label": "Professional Caregiver"
      },
      {
        "value": "b08",
        "label": "Other"
      }
    ]
  },
  {
    "id": "c318_a081",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a081",
    "code": "1.1.8",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Other detail",
    "type": "text",
    "otherFor": "c318_a08"
  },
  {
    "id": "c318_a09",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a09",
    "code": "1.1.9",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Duration of Caregiving",
    "type": "single",
    "help": "Options: Less than 6 months, 6 months - 1 year, 1-2 years, 2-5 years",
    "options": [
      {
        "value": "b01",
        "label": "Less than 6 months"
      },
      {
        "value": "b02",
        "label": "6 months - 1 year"
      },
      {
        "value": "b03",
        "label": "1-2 years"
      },
      {
        "value": "b04",
        "label": "2-5 years"
      },
      {
        "value": "b05",
        "label": "More than 5 years"
      }
    ]
  },
  {
    "id": "c318_a10",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a10",
    "code": "1.1.10",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Hours of Care Per Week",
    "type": "number"
  },
  {
    "id": "c318_a11",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a11",
    "code": "1.1.11",
    "group": "1.1 CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Distance from Care Recipient",
    "type": "single",
    "help": "Options: Same home, Same building, Same neighborhood, Same city, Different city, Different province/country",
    "options": [
      {
        "value": "b01",
        "label": "Same home"
      },
      {
        "value": "b02",
        "label": "Same building"
      },
      {
        "value": "b03",
        "label": "Same neighborhood"
      },
      {
        "value": "b04",
        "label": "Same city"
      },
      {
        "value": "b05",
        "label": "Different city"
      },
      {
        "value": "b06",
        "label": "Different province/country"
      }
    ]
  },
  {
    "id": "c318_a12",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a12",
    "code": "1.2.1",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "",
    "label": "Care Recipient Age",
    "type": "number",
    "help": "Format: Numeric input"
  },
  {
    "id": "c318_a13",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a13",
    "code": "1.2.2",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "",
    "label": "Care Recipient Gender",
    "type": "single",
    "help": "Options: Male, Female",
    "options": [
      {
        "value": "b01",
        "label": "Male"
      },
      {
        "value": "b02",
        "label": "Female"
      }
    ]
  },
  {
    "id": "c318_a14",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a14",
    "code": "1.2.3",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "",
    "label": "Type of Dementia",
    "type": "single",
    "help": "Options: Alzheimer's Disease, Vascular Dementia, Lewy Body Dementia, Frontotemporal Dementia, Mixed Dementia, Unknown/Not Diagnosed, Other",
    "options": [
      {
        "value": "b01",
        "label": "Alzheimer's Disease"
      },
      {
        "value": "b02",
        "label": "Vascular Dementia"
      },
      {
        "value": "b03",
        "label": "Lewy Body Dementia"
      },
      {
        "value": "b04",
        "label": "Frontotemporal Dementia"
      },
      {
        "value": "b05",
        "label": "Mixed Dementia"
      },
      {
        "value": "b06",
        "label": "Unknown/Not Diagnosed"
      },
      {
        "value": "b07",
        "label": "Other"
      }
    ]
  },
  {
    "id": "c318_a141",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a141",
    "code": "1.2.3",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "",
    "label": "Other detail",
    "type": "text",
    "otherFor": "c318_a14"
  },
  {
    "id": "c318_a15",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a15",
    "code": "1.2.4",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "",
    "label": "Years Since Diagnosis",
    "type": "number",
    "help": "Options: Numeric input"
  },
  {
    "id": "c318_a16",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a16",
    "code": "1.2.5",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "",
    "label": "Dementia Stage (Clinical Dementia Rating)",
    "type": "single",
    "help": "Options: CDR 0 - Normal, CDR 0.5 - Very Mild Dementia, CDR 1 - Mild Dementia",
    "options": [
      {
        "value": "b01",
        "label": "CDR 0 - Normal"
      },
      {
        "value": "b02",
        "label": "CDR 0.5 - Very Mild Dementia"
      },
      {
        "value": "b03",
        "label": "CDR 1 - Mild Dementia"
      },
      {
        "value": "b04",
        "label": "CDR 2 - Moderate Dementia"
      },
      {
        "value": "b05",
        "label": "CDR 3 - Severe Dementia"
      }
    ]
  },
  {
    "id": "c318_a17",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a17",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "",
    "label": "Care Recipient Education Level",
    "type": "single",
    "help": "Options: Elementary, Middle School, High School, Associate, Bachelor, Master, Doctorate",
    "options": [
      {
        "value": "b01",
        "label": "Elementary"
      },
      {
        "value": "b02",
        "label": "Middle School"
      },
      {
        "value": "b03",
        "label": "High School"
      },
      {
        "value": "b04",
        "label": "Associate"
      },
      {
        "value": "b05",
        "label": "Bachelor"
      },
      {
        "value": "b06",
        "label": "Master"
      },
      {
        "value": "b07",
        "label": "Doctorate"
      }
    ]
  },
  {
    "id": "c318_a18",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a18",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
    "label": "Eating",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a19",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a19",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
    "label": "Bathing",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a20",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a20",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
    "label": "Dressing",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a21",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a21",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
    "label": "Toileting",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a22",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a22",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
    "label": "Moving around",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a23",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a23",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
    "label": "Managing medications",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a24",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a24",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
    "label": "Handling finances",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a25",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a25",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
    "label": "Shopping",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a26",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a26",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
    "label": "Preparing meals",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a27",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a27",
    "code": "1.2.6",
    "group": "1.2 CARE RECIPIENT INFORMATION",
    "block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
    "label": "Housework",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Independent"
      },
      {
        "value": "b02",
        "label": "Needs help"
      },
      {
        "value": "b03",
        "label": "Cannot do"
      }
    ]
  },
  {
    "id": "c318_a28",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a28",
    "code": "1.3.1",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Delusions present: Does the patient believe that others are stealing from him or her, or planning to harm him or her in some way?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a29",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a29",
    "code": "1.3.1",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Delusions severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a30",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a30",
    "code": "1.3.1",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Delusions caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a31",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a31",
    "code": "1.3.2",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Hallucinations present: Does the patient act as if he or she hears voices, or talk to people who are not there?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a32",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a32",
    "code": "1.3.2",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Hallucinations severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a33",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a33",
    "code": "1.3.2",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Hallucinations caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a34",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a34",
    "code": "1.3.3",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Agitation / Aggression present: Is the patient resistant to help from others, or hard to handle?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a35",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a35",
    "code": "1.3.3",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Agitation / Aggression severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a36",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a36",
    "code": "1.3.3",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Agitation / Aggression caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a37",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a37",
    "code": "1.3.4",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Depression / Dysphoria present: Does the patient act as if he or she is sad or in low spirits, or cry?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a38",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a38",
    "code": "1.3.4",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Depression / Dysphoria severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a39",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a39",
    "code": "1.3.4",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Depression / Dysphoria caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a40",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a40",
    "code": "1.3.5",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Anxiety present: Does the patient become upset when separated from you, or show signs of nervousness such as shortness of breath, sighing or feeling unable to relax?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a41",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a41",
    "code": "1.3.5",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Anxiety severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a42",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a42",
    "code": "1.3.5",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Anxiety caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a43",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a43",
    "code": "1.3.6",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Elation / Euphoria present: Does the patient appear to feel too good or act excessively happy?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a44",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a44",
    "code": "1.3.6",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Elation / Euphoria severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a45",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a45",
    "code": "1.3.6",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Elation / Euphoria caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a46",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a46",
    "code": "1.3.7",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Apathy / Indifference present: Does the patient seem less interested in his or her usual activities, or in the activities and plans of others?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a47",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a47",
    "code": "1.3.7",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Apathy / Indifference severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a48",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a48",
    "code": "1.3.7",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Apathy / Indifference caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a49",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a49",
    "code": "1.3.8",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Disinhibition present: Does the patient act impulsively, for example talking to strangers as if he or she knows them, or saying things that may hurt people's feelings?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a50",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a50",
    "code": "1.3.8",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Disinhibition severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a51",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a51",
    "code": "1.3.8",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Disinhibition caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a52",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a52",
    "code": "1.3.9",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Irritability / Lability present: Is the patient impatient and cranky, or does he or she have difficulty coping with delays or waiting for planned activities?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a53",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a53",
    "code": "1.3.9",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Irritability / Lability severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a54",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a54",
    "code": "1.3.9",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Irritability / Lability caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a55",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a55",
    "code": "1.3.10",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Motor disturbance present: Does the patient engage in repetitive activities such as pacing around the house, handling buttons, wrapping string or doing other things repeatedly?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a56",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a56",
    "code": "1.3.10",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Motor disturbance severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a57",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a57",
    "code": "1.3.10",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Motor disturbance caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a58",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a58",
    "code": "1.3.11",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Nighttime behaviours present: Does the patient wake you up at night, rise too early in the morning, or take excessive naps during the day?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a59",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a59",
    "code": "1.3.11",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Nighttime behaviours severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a60",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a60",
    "code": "1.3.11",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Nighttime behaviours caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a61",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a61",
    "code": "1.3.12",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Appetite / Eating present: Has the patient lost or gained weight, or had a change in the food he or she likes?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c318_a62",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a62",
    "code": "1.3.12",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Appetite / Eating severity",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 3,
      "labels": "1=Mild, 2=Moderate, 3=Severe"
    }
  },
  {
    "id": "c318_a63",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a63",
    "code": "1.3.12",
    "group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
    "block": "",
    "label": "Appetite / Eating caregiver distress",
    "type": "scale",
    "scale": {
      "min": 0,
      "max": 5,
      "labels": "0=Not distressing at all, 5=Extreme"
    }
  },
  {
    "id": "c318_a64",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a64",
    "code": "1.4.1",
    "group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
    "block": "",
    "label": "\"I feel my care recipient asks for more help than he or she needs.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a65",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a65",
    "code": "1.4.2",
    "group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
    "block": "",
    "label": "\"I feel I do not have enough time for myself because of the time I spend with my care recipient.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a66",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a66",
    "code": "1.4.3",
    "group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
    "block": "",
    "label": "\"I feel stressed between caring for my care recipient and meeting other responsibilities.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a67",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a67",
    "code": "1.4.4",
    "group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
    "block": "",
    "label": "\"I feel embarrassed by my care recipient's behaviour.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a68",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a68",
    "code": "1.4.5",
    "group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
    "block": "",
    "label": "\"I feel angry when I am with my care recipient.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a69",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a69",
    "code": "1.4.6",
    "group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
    "block": "",
    "label": "\"I feel my care recipient's present situation does not allow me as much privacy as I would like.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a70",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a70",
    "code": "1.4.7",
    "group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
    "block": "",
    "label": "\"I feel strained in the interactions with my care recipient.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 5,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a71",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a71",
    "code": "1.5.1",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Significant Other: \"There is a special person who is around when I am in need.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a72",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a72",
    "code": "1.5.2",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Significant Other: \"There is a special person with whom I can share my joys and sorrows.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a73",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a73",
    "code": "1.5.3",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Family: \"My family really tries to help me.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a74",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a74",
    "code": "1.5.4",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Family: \"I get the emotional help and support I need from my family.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a75",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a75",
    "code": "1.5.5",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Significant Other: \"I have a special person who is a real source of comfort to me.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a76",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a76",
    "code": "1.5.6",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Friends: \"My friends really try to help me.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a77",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a77",
    "code": "1.5.7",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Friends: \"I can count on my friends when things go wrong.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a78",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a78",
    "code": "1.5.8",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Family: \"I can talk about my problems with my family.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a79",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a79",
    "code": "1.5.9",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Friends: \"I have friends with whom I can share my joys and sorrows.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a80",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a80",
    "code": "1.5.10",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Significant Other: \"There is a special person in my life who cares about my feelings.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a81",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a81",
    "code": "1.5.11",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Family: \"My family is willing to help me make decisions.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a82",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a82",
    "code": "1.5.12",
    "group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
    "block": "",
    "label": "Friends: \"I can talk about my problems with my friends.\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a83",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a83",
    "code": "1.6",
    "group": "1.6 PERSEVERANCE TIME",
    "block": "",
    "label": "How much longer do you think you can continue providing care for your care recipient given the current situation?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Less than 1 week"
      },
      {
        "value": "b02",
        "label": "More than 1 week but less than 1 month"
      },
      {
        "value": "b03",
        "label": "More than 1 month but less than 6 months"
      },
      {
        "value": "b04",
        "label": "More than 6 months but less than 1 year"
      },
      {
        "value": "b05",
        "label": "More than 1 year but less than 2 years"
      },
      {
        "value": "b06",
        "label": "More than 2 years"
      }
    ]
  },
  {
    "id": "c318_a84",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a84",
    "code": "1.7.1.1",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "People with Alzheimer's disease are particularly prone to depression.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a85",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a85",
    "code": "1.7.1.2",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "It has been scientifically proven that mental exercise can prevent a person from getting Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a86",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a86",
    "code": "1.7.1.3",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "After symptoms of Alzheimer's disease appear, the average life expectancy is six to twelve years.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a87",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a87",
    "code": "1.7.1.4",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "When a person with Alzheimer's disease becomes agitated, a medical examination may reveal other health problems that caused the agitation.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a88",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a88",
    "code": "1.7.1.5",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "People with Alzheimer's disease do best with simple written reminders.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a89",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a89",
    "code": "1.7.1.6",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "People whose Alzheimer's disease is not yet severe can benefit from psychotherapy for depression and anxiety.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a90",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a90",
    "code": "1.7.1.7",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "If a person with Alzheimer's disease becomes alert and agitated in the late afternoon and early evening, that person may be experiencing 'sundowning'.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a91",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a91",
    "code": "1.7.1.8",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "When people with Alzheimer's disease begin to have difficulty taking care of themselves, caregivers should take over right away.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a92",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a92",
    "code": "1.7.1.9",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "If trouble with memory and confused thinking appears suddenly, it is likely due to Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a93",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a93",
    "code": "1.7.1.10",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Most people with Alzheimer's disease live in nursing homes.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a94",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a94",
    "code": "1.7.1.11",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Poor nutrition can make the symptoms of Alzheimer's disease worse.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a95",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a95",
    "code": "1.7.1.12",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "People in the early stages of Alzheimer's disease are usually good candidates for behavioural therapies.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a96",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a96",
    "code": "1.7.1.13",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Once people have Alzheimer's disease, they are no longer capable of making informed decisions about their own care.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a97",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a97",
    "code": "1.7.1.14",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Eventually, a person with Alzheimer's disease will need 24-hour supervision.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a98",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a98",
    "code": "1.7.1.15",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Having high cholesterol may increase a person's risk of developing Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a99",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a99",
    "code": "1.7.1.16",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Tremor or shaking of the hands or arms is a common symptom in people with Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a100",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a100",
    "code": "1.7.1.17",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Symptoms of severe depression can be mistaken for symptoms of Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a101",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a101",
    "code": "1.7.1.18",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Alzheimer's disease is one type of dementia.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a102",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a102",
    "code": "1.7.1.19",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Trouble handling money or paying bills is a common early symptom of Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a103",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a103",
    "code": "1.7.1.20",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "One symptom that can occur with Alzheimer's disease is believing that other people are stealing one's things.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a104",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a104",
    "code": "1.7.1.21",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "When a person has Alzheimer's disease, using reminder notes is a crutch that can contribute to decline.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a105",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a105",
    "code": "1.7.1.22",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Prescription drugs that prevent Alzheimer's disease are available.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a106",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a106",
    "code": "1.7.1.23",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Having high blood pressure may increase a person's risk of developing Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a107",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a107",
    "code": "1.7.1.24",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Genes can only partially account for the development of Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a108",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a108",
    "code": "1.7.1.25",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "It is safe for people with Alzheimer's disease to drive, as long as they have a companion in the car at all times.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a109",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a109",
    "code": "1.7.1.26",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Alzheimer's disease cannot be cured.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a110",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a110",
    "code": "1.7.1.27",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Most people with Alzheimer's disease remember recent events better than things that happened in the past.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a111",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a111",
    "code": "1.7.1.28",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "In rare cases, people have recovered from Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a112",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a112",
    "code": "1.7.1.29",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "People with Alzheimer's disease are especially prone to falls and other accidents.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a113",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a113",
    "code": "1.7.1.30",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
    "label": "Difficulty with the ability to walk is common in people who are in the later stages of Alzheimer's disease.",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "True"
      },
      {
        "value": "b02",
        "label": "False"
      }
    ]
  },
  {
    "id": "c318_a114",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a114",
    "code": "1.7.2.1",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "It is rewarding to work with people who have dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a115",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a115",
    "code": "1.7.2.2",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I am afraid of people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a116",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a116",
    "code": "1.7.2.3",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "People with dementia can be creative.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a117",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a117",
    "code": "1.7.2.4",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I feel confident around people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a118",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a118",
    "code": "1.7.2.5",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I am afraid of people with dementia because of the way they might behave.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a119",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a119",
    "code": "1.7.2.6",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "Every person with dementia has different needs.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a120",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a120",
    "code": "1.7.2.7",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I am not very familiar with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a121",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a121",
    "code": "1.7.2.8",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I feel relaxed around people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a122",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a122",
    "code": "1.7.2.9",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "People with dementia like having familiar things nearby.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a123",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a123",
    "code": "1.7.2.10",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I feel uncomfortable being around people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a124",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a124",
    "code": "1.7.2.11",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "It is important to know the past history of people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a125",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a125",
    "code": "1.7.2.12",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "It is possible to enjoy interacting with people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a126",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a126",
    "code": "1.7.2.13",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I feel frustrated because I do not know how to help people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a127",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a127",
    "code": "1.7.2.14",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I cannot imagine taking care of someone with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a128",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a128",
    "code": "1.7.2.15",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I admire the coping skills of people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a129",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a129",
    "code": "1.7.2.16",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "We can do a lot now to improve the lives of people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a130",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a130",
    "code": "1.7.2.17",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "Difficult behaviours may be a form of communication for people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a131",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a131",
    "code": "1.7.2.18",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I am comfortable touching people with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a132",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a132",
    "code": "1.7.2.19",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I would avoid an agitated person with dementia.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a133",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a133",
    "code": "1.7.2.20",
    "group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
    "block": "1.7.2 Dementia Attitudes Scale (DAS)",
    "label": "I would like to get to know people with dementia better.",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c318_a134",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a134",
    "code": "2.1.1",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Age",
    "type": "number",
    "help": "Format: Numeric input"
  },
  {
    "id": "c318_a135",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a135",
    "code": "2.1.2",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Gender",
    "type": "single",
    "help": "Options: Male, Female",
    "options": [
      {
        "value": "b01",
        "label": "Male"
      },
      {
        "value": "b02",
        "label": "Female"
      }
    ]
  },
  {
    "id": "c318_a136",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a136",
    "code": "2.1.2",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Education Level",
    "type": "single",
    "help": "Options: Elementary, Middle School, High School, Associate, Bachelor, Master, Doctorate",
    "options": [
      {
        "value": "b01",
        "label": "Elementary"
      },
      {
        "value": "b02",
        "label": "Middle School"
      },
      {
        "value": "b03",
        "label": "High School"
      },
      {
        "value": "b04",
        "label": "Associate"
      },
      {
        "value": "b05",
        "label": "Bachelor"
      },
      {
        "value": "b06",
        "label": "Master"
      },
      {
        "value": "b07",
        "label": "Doctorate"
      }
    ]
  },
  {
    "id": "c318_a137",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a137",
    "code": "2.1.3",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Relationship to Primary Caregiver",
    "type": "single",
    "help": "Options: Spouse/Partner, Child, Sibling, Other Relative, Friend/Neighbor, Professional Caregiver, Other",
    "options": [
      {
        "value": "b01",
        "label": "Spouse/Partner"
      },
      {
        "value": "b02",
        "label": "Child"
      },
      {
        "value": "b03",
        "label": "Sibling"
      },
      {
        "value": "b04",
        "label": "Other Relative"
      },
      {
        "value": "b05",
        "label": "Friend/Neighbor"
      },
      {
        "value": "b06",
        "label": "Professional Caregiver"
      },
      {
        "value": "b07",
        "label": "Other"
      }
    ]
  },
  {
    "id": "c318_a1371",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a1371",
    "code": "2.1.3",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Other detail",
    "type": "text",
    "otherFor": "c318_a137"
  },
  {
    "id": "c318_a138",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a138",
    "code": "2.1.4",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Relationship to Care Recipient",
    "type": "single",
    "help": "Options: Spouse/Partner, Parent, Child, Sibling, Other Relative, Friend/Neighbor, Professional Caregiver, Other",
    "options": [
      {
        "value": "b01",
        "label": "Spouse/Partner"
      },
      {
        "value": "b02",
        "label": "Parent"
      },
      {
        "value": "b03",
        "label": "Child"
      },
      {
        "value": "b04",
        "label": "Sibling"
      },
      {
        "value": "b05",
        "label": "Other Relative"
      },
      {
        "value": "b06",
        "label": "Friend/Neighbor"
      },
      {
        "value": "b07",
        "label": "Professional Caregiver"
      },
      {
        "value": "b08",
        "label": "Other"
      }
    ]
  },
  {
    "id": "c318_a1381",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a1381",
    "code": "2.1.4",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Other detail",
    "type": "text",
    "otherFor": "c318_a138"
  },
  {
    "id": "c318_a139",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a139",
    "code": "2.1.5",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Duration of Caregiving",
    "type": "single",
    "help": "Options: Less than 6 months, 6 months - 1 year, 1-2 years, 2-5 years, More than 5 years",
    "options": [
      {
        "value": "b01",
        "label": "Less than 6 months"
      },
      {
        "value": "b02",
        "label": "6 months - 1 year"
      },
      {
        "value": "b03",
        "label": "1-2 years"
      },
      {
        "value": "b04",
        "label": "2-5 years"
      },
      {
        "value": "b05",
        "label": "More than 5 years"
      }
    ]
  },
  {
    "id": "c318_a140",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a140",
    "code": "2.1.6",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Hours of Care Per Week",
    "type": "number",
    "help": "Format: Numeric input"
  },
  {
    "id": "c318_a142",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a142",
    "code": "2.1.7",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Distance from Care Recipient",
    "type": "single",
    "help": "Options: Same home, Same building, Same neighborhood, Same city, Different city, Different province/country",
    "options": [
      {
        "value": "b01",
        "label": "Same home"
      },
      {
        "value": "b02",
        "label": "Same building"
      },
      {
        "value": "b03",
        "label": "Same neighborhood"
      },
      {
        "value": "b04",
        "label": "Same city"
      },
      {
        "value": "b05",
        "label": "Different city"
      },
      {
        "value": "b06",
        "label": "Different province/country"
      }
    ]
  },
  {
    "id": "c318_a143",
    "cct": "318",
    "slug": "esm_screening",
    "column": "a143",
    "code": "2.1.8",
    "group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
    "block": "",
    "label": "Contact Frequency",
    "type": "single",
    "help": "Options: Daily, Several times a week, Weekly, Several times a month, Monthly, Less than monthly",
    "options": [
      {
        "value": "b01",
        "label": "Daily"
      },
      {
        "value": "b02",
        "label": "Several times a week"
      },
      {
        "value": "b03",
        "label": "Weekly"
      },
      {
        "value": "b04",
        "label": "Several times a month"
      },
      {
        "value": "b05",
        "label": "Monthly"
      },
      {
        "value": "b06",
        "label": "Less than monthly"
      }
    ]
  },
  {
    "id": "c319_a01",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a01",
    "code": "3.1.1",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "When did it happen?",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "NOW: Record care activities happening now or just occurred"
      },
      {
        "value": "b02",
        "label": "OTHER TIME: Supplement activities not recorded during the day"
      },
      {
        "value": "b03",
        "label": "NOT TIED TO SPECIFIC TIME: Record challenges, needs, or ideas not tied to specific events"
      }
    ]
  },
  {
    "id": "c319_a02",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a02",
    "code": "3.1.1",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Time of the event",
    "type": "datetime"
  },
  {
    "id": "c319_a03",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a03",
    "code": "3.1.1",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Other time",
    "type": "datetime",
    "otherFor": "c319_a02"
  },
  {
    "id": "c319_a04",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a04",
    "code": "3.1.2",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Activity Category",
    "type": "multi",
    "options": [
      {
        "value": "b01",
        "label": "Clinical: medication, medical tasks"
      },
      {
        "value": "b02",
        "label": "Functional: feeding, bathing, dressing, grooming, toileting, ambulation"
      },
      {
        "value": "b03",
        "label": "Cognitive: orientation, conversation, answering questions"
      },
      {
        "value": "b04",
        "label": "Decision: medical decisions, financial decisions, non-medical decisions"
      },
      {
        "value": "b05",
        "label": "Housekeeping: preparing meals, cleaning, shopping"
      },
      {
        "value": "b06",
        "label": "Info Management: coordinating care, communicating with care team, managing finances"
      },
      {
        "value": "b07",
        "label": "Logistics: scheduling appointments, reminding, ensuring delivery of necessities"
      },
      {
        "value": "b08",
        "label": "Transport: driving, arranging rides, accompanying to appointments"
      },
      {
        "value": "b09",
        "label": "Companionship: social interaction, conversation, games, music, walks, outings"
      },
      {
        "value": "b10",
        "label": "Caregiver Support: emotional support for other caregivers, respite"
      },
      {
        "value": "b11",
        "label": "Vigilance: supervision, safety monitoring, preventing wandering"
      },
      {
        "value": "b12",
        "label": "Pet Care: walking pets, feeding, vet visits"
      },
      {
        "value": "b13",
        "label": "Skill Development: attending classes, reading, learning about dementia"
      },
      {
        "value": "b14",
        "label": "Other (please describe)"
      }
    ]
  },
  {
    "id": "c319_a05",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a05",
    "code": "3.1.2",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Other",
    "type": "text",
    "help": "The prefix \"ADL\" and \"IADL\" which not appear on the actual survey question handled to participants",
    "otherFor": "c319_a04"
  },
  {
    "id": "c319_a06",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a06",
    "code": "3.1.3",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Event Stress Rating",
    "type": "scale",
    "scale": {
      "min": -3,
      "max": 3,
      "labels": "Very Unpleasant to Very Pleasant"
    }
  },
  {
    "id": "c319_a07",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a07",
    "code": "3.1.4",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Activity Description",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support AI support is on the frontend to offer voice transcription, AI enhance support, etc, but the AI can’t click on form submission, it will only help to fill the form on the frontend, the user can then adjust, let the AI offer a better draft/enhance, which AI will show in the dropdown support chatbot with a copy to form button, only clicking on it will the enhanced answer be copied to the form"
  },
  {
    "id": "c319_a08",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a08",
    "code": "3.1.4",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Memory problems (e.g., repeating things, losing things, not completing a task, not remembering events or persons, concentration difficulties) (Yes/No",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c319_a09",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a09",
    "code": "3.1.4",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Behavior problems (e.g., breaking things on purpose, verbal aggression, threats to harm others, night wandering, opposition or provocation) (Yes/No",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c319_a10",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a10",
    "code": "3.1.4",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Depressive symptoms (e.g., sadness, hopelessness, threats of self-harm, speaking of dying, suffering from loneliness, uselessness or worthlessness) (Yes/No",
    "type": "single",
    "options": [
      {
        "value": "b01",
        "label": "Yes"
      },
      {
        "value": "b02",
        "label": "No"
      }
    ]
  },
  {
    "id": "c319_a11",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a11",
    "code": "3.1.6",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Caregiver MBP-Related Distress",
    "type": "scale",
    "help": "During this event, how much did their memory/behavioral problems disturb or upset you?",
    "scale": {
      "min": 0,
      "max": 4,
      "labels": "Not at all to Extremely"
    }
  },
  {
    "id": "c319_a12",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a12",
    "code": "3.1.7",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Unfulfilled Care Needs (Optional)",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support"
  },
  {
    "id": "c319_a13",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a13",
    "code": "3.1.8",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Ideas or Suggestions (Optional)",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support"
  },
  {
    "id": "c319_a14",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a14",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Time Spent (minutes)",
    "type": "number",
    "help": "Format: Numeric input"
  },
  {
    "id": "c319_a15",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a15",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Cheerful",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a16",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a16",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Relaxed",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a17",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a17",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Enthusiastic",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a18",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a18",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Satisfied",
    "type": "scale",
    "help": "Items: Insecure, Lonely, Anxious, Irritated, Down, Desperate, Tensed",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a19",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a19",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Insecure",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a20",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a20",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Lonely",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a21",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a21",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Anxious",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a22",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a22",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Irritated",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a23",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a23",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Down",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a24",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a24",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Desperate",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a25",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a25",
    "code": "3.1.9",
    "group": "3.1 ACTIVITY TAB",
    "block": "",
    "label": "Tensed",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": ""
    }
  },
  {
    "id": "c319_a26",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a26",
    "code": "3.2.1",
    "group": "3.2 PEOPLE TAB",
    "block": "",
    "label": "People involved (from your care network)",
    "type": "text",
    "help": "Options: Pre-populated network members or \"Just Me\"",
    "options": [
      {
        "value": "b01",
        "label": "Just Me"
      }
    ]
  },
  {
    "id": "c319_a28",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a28",
    "code": "3.2.3",
    "group": "3.2 PEOPLE TAB",
    "block": "",
    "label": "Who Else Do You Wish Could Help",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support"
  },
  {
    "id": "c319_a29",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a29",
    "code": "3.2.4",
    "group": "3.2 PEOPLE TAB",
    "block": "",
    "label": "Challenges in Reaching People You Wish Could Help",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support"
  },
  {
    "id": "c319_a30",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a30",
    "code": "3.3.1",
    "group": "3.3 CHALLENGES & RESOURCES TAB",
    "block": "",
    "label": "Challenges in Undertaking This Task",
    "type": "scale",
    "scale": {
      "min": -3,
      "max": 3,
      "labels": "No challenges to Extreme challenges"
    }
  },
  {
    "id": "c319_a31",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a31",
    "code": "3.3.2",
    "group": "3.3 CHALLENGES & RESOURCES TAB",
    "block": "",
    "label": "Challenge Types",
    "type": "multi",
    "help": "Options: Handle symptoms, Condition, Updates, Coordination, Time, Emotional, Physical, Communication, Safety, Privacy, Other （multiple select）",
    "options": [
      {
        "value": "b01",
        "label": "Handle symptoms"
      },
      {
        "value": "b02",
        "label": "Condition"
      },
      {
        "value": "b03",
        "label": "Updates"
      },
      {
        "value": "b04",
        "label": "Coordination"
      },
      {
        "value": "b05",
        "label": "Time"
      },
      {
        "value": "b06",
        "label": "Emotional"
      },
      {
        "value": "b07",
        "label": "Physical"
      },
      {
        "value": "b08",
        "label": "Communication"
      },
      {
        "value": "b09",
        "label": "Safety"
      },
      {
        "value": "b10",
        "label": "Privacy"
      },
      {
        "value": "b11",
        "label": "Other"
      }
    ]
  },
  {
    "id": "c319_a311",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a311",
    "code": "3.3.2",
    "group": "3.3 CHALLENGES & RESOURCES TAB",
    "block": "",
    "label": "Other detail",
    "type": "text",
    "otherFor": "c319_a31"
  },
  {
    "id": "c319_a32",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a32",
    "code": "3.3.3",
    "group": "3.3 CHALLENGES & RESOURCES TAB",
    "block": "",
    "label": "Challenges Faced (Description)",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support"
  },
  {
    "id": "c319_a33",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a33",
    "code": "3.3.4",
    "group": "3.3 CHALLENGES & RESOURCES TAB",
    "block": "",
    "label": "Resources Currently Using & Challenges",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support"
  },
  {
    "id": "c319_a34",
    "cct": "319",
    "slug": "esm_hourly_log",
    "column": "a34",
    "code": "3.3.5",
    "group": "3.3 CHALLENGES & RESOURCES TAB",
    "block": "",
    "label": "Resources You Wish Existed or Improved",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support"
  },
  {
    "id": "c317_a01",
    "cct": "317",
    "slug": "esm_daily_log",
    "column": "a01",
    "code": "4.1.1",
    "group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
    "block": "",
    "label": "What else happened today that you did not log?",
    "type": "longtext",
    "help": "Format: Free text with Voice Input and AI Support"
  },
  {
    "id": "c317_a02",
    "cct": "317",
    "slug": "esm_daily_log",
    "column": "a02",
    "code": "4.2.1",
    "group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
    "block": "",
    "label": "\"Today I felt stressed due to my care responsibilities\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c317_a03",
    "cct": "317",
    "slug": "esm_daily_log",
    "column": "a03",
    "code": "4.2.2",
    "group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
    "block": "",
    "label": "\"Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c317_a04",
    "cct": "317",
    "slug": "esm_daily_log",
    "column": "a04",
    "code": "4.2.3",
    "group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
    "block": "",
    "label": "\"Today I felt strained in the interactions with my care recipient\"",
    "type": "scale",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": "Strongly disagree to Strongly agree"
    }
  },
  {
    "id": "c317_a05",
    "cct": "317",
    "slug": "esm_daily_log",
    "column": "a05",
    "code": "4.2.3",
    "group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
    "block": "",
    "label": "Looking back at today as a whole, how would you rate your overall caregiving burden today?",
    "type": "scale",
    "help": "people, and what does each person do?",
    "scale": {
      "min": -3,
      "max": 3,
      "labels": "Very Light to Very Heavy"
    }
  }
];
