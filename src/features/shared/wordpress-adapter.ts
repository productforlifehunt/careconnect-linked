import { wordpressFetch } from "@/features/shared/wordpress-client";
import {
  wordpressSchema,
  type WordPressFeatureKey,
} from "@/features/shared/wordpress-schema";

function assertFeatureReady(_feature: WordPressFeatureKey): void {
  // All registered features are confirmed native WP/Woo/Dokan endpoints.
}

function resolveEndpoint(feature: WordPressFeatureKey, args?: Record<string, any>): string {
  const entry = wordpressSchema[feature];
  return typeof entry.endpoint === "function" ? entry.endpoint(args) : entry.endpoint;
}

function mergeParams(feature: WordPressFeatureKey, params?: Record<string, any>) {
  const entry = wordpressSchema[feature];
  return {
    ...(entry.defaultParams || {}),
    ...(params || {}),
  };
}

function castResult<T>(value: unknown): T {
  return value as T;
}

export async function listWordPressFeature<T = any>(
  feature: WordPressFeatureKey,
  args?: {
    endpointArgs?: Record<string, any>;
    params?: Record<string, any>;
  },
): Promise<T> {
  assertFeatureReady(feature);
  const entry = wordpressSchema[feature];
  const endpoint = resolveEndpoint(feature, args?.endpointArgs);
  const response = await wordpressFetch(endpoint, {
    params: mergeParams(feature, args?.params),
  });
  return castResult<T>(entry.mapList ? entry.mapList(response, args?.endpointArgs) : response);
}

export async function getWordPressFeature<T = any>(
  feature: WordPressFeatureKey,
  args?: {
    endpointArgs?: Record<string, any>;
    params?: Record<string, any>;
  },
): Promise<T> {
  assertFeatureReady(feature);
  const entry = wordpressSchema[feature];
  const endpoint = resolveEndpoint(feature, args?.endpointArgs);
  const response = await wordpressFetch(endpoint, {
    params: mergeParams(feature, args?.params),
  });
  return castResult<T>(entry.mapDetail ? entry.mapDetail(response, args?.endpointArgs) : response);
}

export async function createWordPressFeature<T = any>(
  feature: WordPressFeatureKey,
  input: any,
  args?: {
    endpointArgs?: Record<string, any>;
    params?: Record<string, any>;
  },
): Promise<T> {
  assertFeatureReady(feature);
  const entry = wordpressSchema[feature];
  const endpoint = resolveEndpoint(feature, args?.endpointArgs);
  const body = entry.buildCreateBody ? entry.buildCreateBody(input, args?.endpointArgs) : input;
  const response = await wordpressFetch(endpoint, {
    method: "POST",
    params: args?.params,
    body,
  });
  return castResult<T>(entry.mapDetail ? entry.mapDetail(response, args?.endpointArgs) : response);
}

export async function updateWordPressFeature<T = any>(
  feature: WordPressFeatureKey,
  input: any,
  args?: {
    endpointArgs?: Record<string, any>;
    params?: Record<string, any>;
    method?: string;
  },
): Promise<T> {
  assertFeatureReady(feature);
  const entry = wordpressSchema[feature];
  const endpoint = resolveEndpoint(feature, args?.endpointArgs);
  const body = entry.buildUpdateBody ? entry.buildUpdateBody(input, args?.endpointArgs) : input;
  const response = await wordpressFetch(endpoint, {
    method: args?.method || "POST",
    params: args?.params,
    body,
  });
  return castResult<T>(entry.mapDetail ? entry.mapDetail(response, args?.endpointArgs) : response);
}

export async function deleteWordPressFeature(
  feature: WordPressFeatureKey,
  args?: {
    endpointArgs?: Record<string, any>;
    params?: Record<string, any>;
  },
): Promise<void> {
  assertFeatureReady(feature);
  const endpoint = resolveEndpoint(feature, args?.endpointArgs);
  await wordpressFetch(endpoint, {
    method: "DELETE",
    params: args?.params,
  });
}

