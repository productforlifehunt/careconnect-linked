import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrCreateProviderProduct,
  getProviderProduct,
  updateProviderProductStatus,
  syncProviderToVendor,
  type ServiceRateEntry,
} from '@/services/woocommerce-api';
import { useMyProfile } from './use-care-data';

/**
 * Hook to sync provider profile with WooCommerce product (variable with per-service pricing)
 */
export function useSyncProviderToWooCommerce() {
  const qc = useQueryClient();
  const { data: profile } = useMyProfile();

  return useMutation({
    mutationFn: async (providerData: {
      hourlyRate: number;
      bio?: string;
      specialties?: string[];
      certifications?: string[];
      yearsOfExperience?: number;
      location?: string;
      providerIsActive?: boolean;
      serviceRates?: ServiceRateEntry[];
    }) => {
      if (!profile?.id) {
        throw new Error('Profile not found');
      }

      // Sync to WooCommerce product (variable with variations per service type)
      const product = await getOrCreateProviderProduct(profile.id, {
        fullName: profile.full_name || '',
        hourlyRate: providerData.hourlyRate,
        bio: providerData.bio,
        specialties: providerData.specialties,
        certifications: providerData.certifications,
        yearsOfExperience: providerData.yearsOfExperience,
        location: providerData.location,
        serviceRates: providerData.serviceRates,
      });

      // Sync to Dokan vendor (optional)
      const vendor = await syncProviderToVendor(profile.id, {
        fullName: profile.full_name || '',
        email: profile.email || '',
        location: providerData.location,
        bio: providerData.bio,
        phone: profile.phone || '',
      });

      // Update product status based on provider_is_active
      if (product && providerData.providerIsActive !== undefined) {
        await updateProviderProductStatus(profile.id, providerData.providerIsActive);
      }

      return { product, vendor };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-woocommerce-product'] });
    },
  });
}

/**
 * Hook to get provider's WooCommerce product
 */
export function useProviderWooCommerceProduct() {
  const { data: profile } = useMyProfile();

  return useQuery({
    queryKey: ['provider-woocommerce-product', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      return getProviderProduct(profile.id);
    },
    enabled: !!profile?.id,
  });
}

/**
 * Hook to update provider product status (active/inactive)
 */
export function useUpdateProviderProductStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      providerId,
      isActive,
    }: {
      providerId: string;
      isActive: boolean;
    }) => {
      return updateProviderProductStatus(providerId, isActive);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-woocommerce-product'] });
    },
  });
}
