import { useQuery } from "@tanstack/react-query";
import {
  fetchProviderDirectoryWordPress,
  filterProviders,
  type ProviderFilters,
} from "@/features/providers/source.wordpress";

export function useProviders(
  filters?: ProviderFilters,
  options?: { enabled?: boolean | undefined },
) {
  return useQuery({
    // Share one directory read; filtering and sorting stay local.
    queryKey: ["providers"],
    queryFn: fetchProviderDirectoryWordPress,
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
    select: (list) => filterProviders(list, filters),
  });
}
