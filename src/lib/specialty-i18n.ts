/**
 * Maps database specialty/certification string values to i18n translation keys.
 * DB stores English values; UI displays via t() for localization.
 */

const SPECIALTY_KEY_MAP: Record<string, string> = {
  "Elder Care": "specialties.elderCare",
  "Child Care": "specialties.childCare",
  "Special Needs": "specialties.specialNeeds",
  "Nursing Care": "specialties.nursingCare",
  "Companionship": "specialties.companionship",
  "Respite Care": "specialties.respiteCare",
  "Physical Therapy": "specialties.physicalTherapy",
  "Dementia Care": "specialties.dementiaCare",
  "Palliative Support": "specialties.palliativeSupport",
  "Post-Surgery Care": "specialties.postSurgeryCare",
  "Meal Preparation": "specialties.mealPreparation",
  "Transportation": "specialties.transportation",
  "Medication Management": "specialties.medicationManagement",
  "Wound Care": "specialties.woundCare",
  "Mobility Support": "specialties.mobilitySupport",
  "Tutoring": "specialties.tutoring",
  "Overnight Care": "specialties.overnightCare",
  // Service categories from DB
  "Household": "specialties.household",
  "Memory Care": "specialties.memoryCare",
  "Nursing": "specialties.nursing",
  "Occupational Therapy": "specialties.occupationalTherapy",
  "Personal Care": "specialties.personalCare",
  "Home Health": "specialties.homeHealth",
  "Speech Therapy": "specialties.speechTherapy",
  "Behavioral Support": "specialties.behavioralSupport",
};

const CERTIFICATION_KEY_MAP: Record<string, string> = {
  "CNA": "certifications.CNA",
  "RN": "certifications.RN",
  "LPN": "certifications.LPN",
  "CPR": "certifications.CPR",
  "First Aid": "certifications.firstAid",
  "Home Health Aide": "certifications.homeHealthAide",
  "Child Development Associate": "certifications.childDevAssociate",
  "Special Ed Certificate": "certifications.specialEdCert",
  "PTA License": "certifications.PTALicense",
  "BSN": "certifications.BSN",
  "IV Certification": "certifications.IVCertification",
  "Wound Care": "certifications.woundCare",
  "Alzheimer's Care": "certifications.alzheimersCare",
  "Hospice Care": "certifications.hospiceCare",
  "Food Safety": "certifications.foodSafety",
};

/** @deprecated Use useServiceTypes() hook instead — service types come from WooCommerce pa_service-type */
export const ALL_SPECIALTIES = Object.keys(SPECIALTY_KEY_MAP);

/** All certification DB values */
export const ALL_CERTIFICATIONS = Object.keys(CERTIFICATION_KEY_MAP);

/** Get the i18n key for a specialty DB value; returns the raw value if not found */
export function getSpecialtyKey(dbValue: string): string {
  return SPECIALTY_KEY_MAP[dbValue] || dbValue;
}

/** Get the i18n key for a certification DB value */
export function getCertificationKey(dbValue: string): string {
  return CERTIFICATION_KEY_MAP[dbValue] || dbValue;
}
