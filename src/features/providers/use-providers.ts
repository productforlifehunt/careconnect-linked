import { useQuery } from "@tanstack/react-query";
import {
  filterProviders,
  type ProviderFilters,
} from "@/features/providers/filter";

export function useProviders(
  filters?: ProviderFilters,
  options?: { enabled?: boolean | undefined },
) {
  return useQuery({
    // Share one directory read; filtering and sorting stay local.
    queryKey: ["providers"],
    queryFn: async () =>
      (
        await import("@/features/providers/source.wordpress")
      ).fetchProviderDirectoryWordPress(),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
    select: (list) => filterProviders(list, filters),
  });
}
