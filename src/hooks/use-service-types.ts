/**
 * Unified Service Type hook — single source of truth from WooCommerce Product Attribute "Service Type"
 * Taxonomy: pa_service-type
 * All service type dropdowns, filters, badges, and selectors MUST use this hook.
 */

import { useQuery } from '@tanstack/react-query';
import { buildWPUrl, buildWPHeaders } from '@/lib/wp-url';
import { getWPToken } from '@/services/wp-auth';

export interface ServiceTypeTerm {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

interface WCAttribute {
  id: number;
  name: string;
  slug: string;
}

async function fetchWithAuth(endpoint: string) {
  const token = getWPToken();
  const url = buildWPUrl(`wc/v3/${endpoint}`);
  const res = await fetch(url, { headers: buildWPHeaders(token, 'application/json') });
  if (!res.ok) throw new Error(`WC API ${res.status}`);
  return res.json();
}

/** Discover the WooCommerce attribute ID for "service-type" by listing all attributes */
async function getServiceTypeAttributeId(): Promise<number> {
  const attrs: WCAttribute[] = await fetchWithAuth('products/attributes');
  const match = attrs.find(a => a.slug === 'service-type' || a.slug === 'pa_service-type');
  if (!match) throw new Error('Service Type attribute not found in WooCommerce');
  return match.id;
}

/** Fetch all service type terms from WooCommerce */
async function fetchServiceTypeTerms(): Promise<ServiceTypeTerm[]> {
  const attrId = await getServiceTypeAttributeId();
  const terms: ServiceTypeTerm[] = await fetchWithAuth(`products/attributes/${attrId}/terms?per_page=100`);
  return terms.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Hook: returns all service type terms from WooCommerce Product Attribute.
 * Use `serviceTypes` for dropdowns, `serviceTypeMap` for slug→name lookups.
 */
export function useServiceTypes() {
  const query = useQuery({
    queryKey: ['wc-service-types'],
    queryFn: fetchServiceTypeTerms,
    staleTime: 1000 * 60 * 30, // cache 30 min — these rarely change
    gcTime: 1000 * 60 * 60,
  });

  const serviceTypeMap = new Map<string, string>();
  const serviceTypeBySlug = new Map<string, ServiceTypeTerm>();
  (query.data || []).forEach(t => {
    serviceTypeMap.set(t.slug, t.name);
    serviceTypeMap.set(t.name, t.name); // also map name→name for direct lookups
    serviceTypeBySlug.set(t.slug, t);
  });

  return {
    serviceTypes: query.data || [],
    serviceTypeNames: (query.data || []).map(t => t.name),
    serviceTypeMap,
    serviceTypeBySlug,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/** Export the raw fetcher for use outside React (e.g., in woocommerce-api.ts) */
export { fetchServiceTypeTerms, getServiceTypeAttributeId };
