/**
 * Fixed catalog of marketplace service types.
 *
 * Caregivers can ONLY edit their hourly price for each — they cannot add,
 * rename, or remove entries. The list is intentionally hard-coded here
 * (rather than fetched from the WooCommerce `pa_service-type` attribute)
 * so the marketplace stays consistent across all providers.
 *
 * `slug` is what we persist into WooCommerce product meta `_service_rates`
 * (a JSON map of slug → hourly rate). `name` is the human label and the
 * value passed to `profile.specialty`.
 */
export interface FixedServiceType {
  slug: string;
  name: string;
  /** i18n key, falls back to `name` if missing */
  i18nKey?: string;
  /** Short helper text shown under the row */
  description?: string;
}

export const FIXED_SERVICE_TYPES: FixedServiceType[] = [
  { slug: 'child-care',        name: 'Child Care',          i18nKey: 'serviceTypes.childCare',        description: 'Babysitting, after-school care, watchful supervision.' },
  { slug: 'pet-walking',       name: 'Pet Walking',         i18nKey: 'serviceTypes.petWalking',       description: 'Dog walking, pet sitting, feeding visits.' },
  { slug: 'accompany-local',   name: 'Accompany Local',     i18nKey: 'serviceTypes.accompanyLocal',   description: 'In-person companionship, errands, appointments.' },
  { slug: 'accompany-remote',  name: 'Accompany Remote',    i18nKey: 'serviceTypes.accompanyRemote',  description: 'Virtual companionship via video / phone calls.' },
  { slug: 'senior-care',       name: 'Senior Care',         i18nKey: 'serviceTypes.seniorCare',       description: 'Daily-living support for seniors at home.' },
  { slug: 'dementia-care',     name: 'Dementia Care',       i18nKey: 'serviceTypes.dementiaCare',     description: 'Specialized care and supervision for dementia patients.' },
  { slug: 'house-keeping',     name: 'House Keeping',       i18nKey: 'serviceTypes.houseKeeping',     description: 'Light cleaning, laundry, tidying.' },
  { slug: 'meal-prep',         name: 'Meal Preparation',    i18nKey: 'serviceTypes.mealPrep',         description: 'Cooking, grocery shopping, meal planning.' },
  { slug: 'transportation',    name: 'Transportation',      i18nKey: 'serviceTypes.transportation',   description: 'Driving to appointments, errands, social outings.' },
  { slug: 'tutoring',          name: 'Tutoring',            i18nKey: 'serviceTypes.tutoring',         description: 'Academic help, homework support, exam prep.' },
];

export const FIXED_SERVICE_SLUGS = FIXED_SERVICE_TYPES.map(s => s.slug);
export const FIXED_SERVICE_NAMES = FIXED_SERVICE_TYPES.map(s => s.name);

export function getFixedServiceBySlug(slug: string): FixedServiceType | undefined {
  return FIXED_SERVICE_TYPES.find(s => s.slug === slug);
}

export function getFixedServiceByName(name: string): FixedServiceType | undefined {
  return FIXED_SERVICE_TYPES.find(s => s.name === name);
}
