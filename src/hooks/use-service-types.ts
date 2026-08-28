/**
 * Unified Service Type hook — single source of truth is the data dictionary
 * (CCT 258 a68 "Care provider offers care service type").
 *
 * Browsing / filtering / badges MUST NOT touch WooCommerce: per the dictionary,
 * WooCommerce only enters the picture at "add to cart". This hook therefore
 * serves the fixed Bible catalogue synchronously — no network call, no
 * pa_service-type taxonomy, no duplicate-term cleanup needed.
 */

import { useMemo } from 'react';
import i18next from 'i18next';
import { CARE_SERVICE_TYPES } from '@/lib/care-service-types';

export interface ServiceTypeTerm {
  /** Dictionary option id (b55…b68). */
  id: string;
  name: string;
  slug: string;
  /** Delivery mode implied by the option, when the dictionary label states it. */
  delivery?: 'in-person' | 'remote';
}

/**
 * Hook: returns all care service types from the dictionary.
 * Use `serviceTypes` for dropdowns, `serviceTypeMap` for slug→name lookups.
 */
export function useServiceTypes() {
  const zh = i18next.language?.startsWith('zh');

  return useMemo(() => {
    const serviceTypes: ServiceTypeTerm[] = CARE_SERVICE_TYPES.map((s) => ({
      id: s.id,
      name: zh ? s.zh : s.en,
      slug: s.slug,
      delivery: s.delivery,
    }));

    const serviceTypeMap = new Map<string, string>();
    const serviceTypeBySlug = new Map<string, ServiceTypeTerm>();
    serviceTypes.forEach((t) => {
      serviceTypeMap.set(t.slug, t.name);
      serviceTypeMap.set(t.name, t.name);
      serviceTypeMap.set(t.id, t.name);
      serviceTypeBySlug.set(t.slug, t);
    });

    return {
      serviceTypes,
      serviceTypeNames: serviceTypes.map((t) => t.name),
      serviceTypeMap,
      serviceTypeBySlug,
      isLoading: false,
      error: null as unknown,
    };
  }, [zh]);
}
