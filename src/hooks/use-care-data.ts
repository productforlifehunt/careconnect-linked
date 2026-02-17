import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { careDb, careAuth } from "@/integrations/supabase/external-client";
import type {
  Profile, Booking, Review, CareGroup, CareGroupMember,
  CareTask, DirectMessage, Conversation, Notification,
  SavedProvider, CareGroupPost, LocationShare, ServiceCategory,
} from "@/types/care-connector";

// ─── Helpers ────────────────────────────────────────────────
async function getCurrentUserId(): Promise<string | null> {
  const { data } = await careAuth.auth.getSession();
  return data.session?.user?.id ?? null;
}

// ─── Providers ──────────────────────────────────────────────
export function useProviders(filters?: {
  query?: string;
  specialties?: string[];
  minRate?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
  minRating?: number;
  sortBy?: string;
}) {
  return useQuery({
    queryKey: ["providers", filters],
    queryFn: async () => {
      let q = careDb
        .from("profile")
        .select("*")
        .eq("is_care_provider", true)
        .eq("provider_is_active", true);

      if (filters?.query) {
        q = q.or(
          `full_name.ilike.%${filters.query}%,bio.ilike.%${filters.query}%,location.ilike.%${filters.query}%`
        );
      }
      if (filters?.specialties && filters.specialties.length > 0) {
        q = q.overlaps("specialty", filters.specialties);
      }
      if (filters?.minRate != null) q = q.gte("hourly_rate", filters.minRate);
      if (filters?.maxRate != null) q = q.lte("hourly_rate", filters.maxRate);
      if (filters?.verifiedOnly) q = q.eq("background_check_status", "passed");
      if (filters?.minRating) q = q.gte("rating_average", filters.minRating);

      if (filters?.sortBy === "rating") q = q.order("rating_average", { ascending: false, nullsFirst: false });
      else if (filters?.sortBy === "price-low") q = q.order("hourly_rate", { ascending: true });
      else if (filters?.sortBy === "price-high") q = q.order("hourly_rate", { ascending: false });
      else if (filters?.sortBy === "experience") q = q.order("years_of_experience", { ascending: false, nullsFirst: false });
      else if (filters?.sortBy === "reviews") q = q.order("rating_count", { ascending: false, nullsFirst: false });
      else q = q.order("rating_average", { ascending: false, nullsFirst: false });

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Profile[];
    },
  });
}

export function useProvider(id: string | undefined) {
  return useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await careDb
        .from("profile")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!id,
  });
}

export function useProviderReviews(providerId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const { data, error } = await careDb
        .from("review")
        .select("*")
        .eq("entity_id", providerId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      // Fetch reviewer profiles separately
      const reviewerIds = [...new Set((data || []).map((r: any) => r.reviewer_id).filter(Boolean))];
      let reviewerMap: Record<string, any> = {};
      if (reviewerIds.length > 0) {
        const { data: reviewers } = await careDb
          .from("profile")
          .select("id, full_name, avatar_url")
          .in("id", reviewerIds);
        (reviewers || []).forEach((r: any) => { reviewerMap[r.id] = r; });
      }
      return (data || []).map((r: any) => ({ ...r, reviewer: reviewerMap[r.reviewer_id] || null }));
    },
    enabled: !!providerId,
  });
}

// ─── Bookings ───────────────────────────────────────────────
export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await careDb
        .from("booking")
        .select("*, provider:provider_id(id, full_name, avatar_url, hourly_rate)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Partial<Booking>) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await careDb
        .from("booking")
        .insert({ ...booking, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await careDb
        .from("booking")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

// ─── Messages ───────────────────────────────────────────────
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await careDb
        .from("conversation")
        .select(`
          *,
          participant_1:participant_1_id(id, full_name, avatar_url),
          participant_2:participant_2_id(id, full_name, avatar_url)
        `)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useDirectMessages(otherUserId: string | null) {
  return useQuery({
    queryKey: ["messages", otherUserId],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId || !otherUserId) return [];
      const { data, error } = await careDb
        .from("direct_message")
        .select("*, sender:sender_id(id, full_name, avatar_url)")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
        )
        .is("group_id", null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!otherUserId,
    refetchInterval: 5000, // poll every 5s as fallback
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ receiverId, content, groupId }: { receiverId?: string; content: string; groupId?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("direct_message")
        .insert({
          sender_id: userId,
          receiver_id: receiverId || null,
          group_id: groupId || null,
          message_content: content,
          message_type: "text",
        });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

// ─── Care Groups ────────────────────────────────────────────
export function useCareGroups() {
  return useQuery({
    queryKey: ["care-groups"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      // Get groups where user is a member
      const { data: memberships, error: mErr } = await careDb
        .from("care_group_member")
        .select("group_id")
        .eq("user_id", userId)
        .eq("invitation_status", "accepted");
      if (mErr) throw mErr;
      const groupIds = (memberships || []).map((m: any) => m.group_id);
      if (groupIds.length === 0) return [];
      const { data, error } = await careDb
        .from("care_group")
        .select("*")
        .in("id", groupIds);
      if (error) throw error;
      return (data || []) as CareGroup[];
    },
  });
}

export function useCareGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: ["care-group-members", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await careDb
        .from("care_group_member")
        .select("*, profile:user_id(id, full_name, avatar_url, email)")
        .eq("group_id", groupId)
        .eq("invitation_status", "accepted");
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!groupId,
  });
}

// ─── Care Tasks ─────────────────────────────────────────────
export function useCareTasks(groupId?: string | null) {
  return useQuery({
    queryKey: ["care-tasks", groupId],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      let q = careDb
        .from("care_task")
        .select("*, assignee_profile:assigned_to(id, full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (groupId) {
        q = q.eq("group_id", groupId);
      } else {
        q = q.or(`created_by.eq.${userId},assigned_to.eq.${userId}`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: Partial<CareTask>) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("care_task")
        .insert({ ...task, created_by: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-tasks"] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await careDb
        .from("care_task")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-tasks"] }),
  });
}

// ─── Notifications ──────────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await careDb
        .from("notification")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as Notification[];
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb
        .from("notification")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      const { error } = await careDb
        .from("notification")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── Favorites / Saved Providers ────────────────────────────
export function useSavedProviders() {
  return useQuery({
    queryKey: ["saved-providers"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await careDb
        .from("saved_provider")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      const providerIds = [...new Set((data || []).map((s: any) => s.provider_id).filter(Boolean))];
      let providerMap: Record<string, any> = {};
      if (providerIds.length > 0) {
        const { data: providers } = await careDb
          .from("profile")
          .select("id, full_name, avatar_url, hourly_rate, specialty, rating_average, rating_count, location, background_check_status, years_of_experience")
          .in("id", providerIds);
        (providers || []).forEach((p: any) => { providerMap[p.id] = p; });
      }
      return (data || []).map((s: any) => ({ ...s, provider: providerMap[s.provider_id] || null }));
    },
  });
}

export function useToggleSavedProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ providerId, isSaved }: { providerId: string; isSaved: boolean }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      if (isSaved) {
        const { error } = await careDb
          .from("saved_provider")
          .delete()
          .eq("user_id", userId)
          .eq("provider_id", providerId);
        if (error) throw error;
      } else {
        const { error } = await careDb
          .from("saved_provider")
          .insert({ user_id: userId, provider_id: providerId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-providers"] }),
  });
}

// ─── Profile ────────────────────────────────────────────────
export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return null;
      const { data, error } = await careDb
        .from("profile")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("profile")
        .update(updates)
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });
}

// ─── Become Provider ────────────────────────────────────────
export function useSubmitProviderApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bio?: string;
      specialty?: string[];
      certification?: string[];
      years_of_experience?: number;
      hourly_rate?: number;
      service_area?: string[];
      phone_number?: string;
      location?: string;
    }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("profile")
        .update({
          ...data,
          is_care_provider: true,
          provider_is_active: false, // awaiting admin approval
        })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });
}

// ─── Care Group Posts ───────────────────────────────────────
export function useCareGroupPosts(groupId: string | null, type?: string) {
  return useQuery({
    queryKey: ["care-group-posts", groupId, type],
    queryFn: async () => {
      if (!groupId) return [];
      let q = careDb
        .from("care_group_post")
        .select("*, author:author_id(id, full_name, avatar_url)")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (type) q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!groupId,
  });
}

export function useCreateGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: { group_id: string; content: string; type?: string; title?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("care_group_post")
        .insert({ ...post, author_id: userId, type: post.type || "discussion" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-group-posts"] }),
  });
}

// ─── Location Shares ────────────────────────────────────────
export function useLocationShares() {
  return useQuery({
    queryKey: ["location-shares"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      // Get all location shares from user's care circle
      const { data, error } = await careDb
        .from("location_share")
        .select("*, profile:user_id(id, full_name, avatar_url)")
        .eq("is_sharing", true)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// ─── Service Categories ─────────────────────────────────────
export function useServiceCategories() {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await careDb
        .from("service_category")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []) as ServiceCategory[];
    },
  });
}

// ─── Cared Ones (user_cared_one junction) ───────────────────
export function useUserCaredOnes() {
  return useQuery({
    queryKey: ["user-cared-ones"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await careDb
        .from("user_cared_one")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      // Fetch cared one profiles
      const caredOneIds = [...new Set((data || []).map((r: any) => r.cared_one_id).filter(Boolean))];
      if (caredOneIds.length === 0) return [];
      const { data: profiles } = await careDb
        .from("profile")
        .select("id, full_name, first_name, last_name, avatar_url")
        .in("id", caredOneIds);
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
      return (data || []).map((r: any) => ({ ...r, cared_one: profileMap[r.cared_one_id] || null }));
    },
  });
}

// ─── Dashboard Stats ────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return { upcomingBookings: 0, unreadMessages: 0, pendingTasks: 0, careGroups: 0 };

      const [bookingsRes, msgsRes, tasksRes, groupsRes] = await Promise.all([
        careDb.from("booking").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["confirmed", "pending"]),
        careDb.from("direct_message").select("id", { count: "exact", head: true }).eq("receiver_id", userId).is("read_at", null),
        careDb.from("care_task").select("id", { count: "exact", head: true }).or(`created_by.eq.${userId},assigned_to.eq.${userId}`).neq("status", "completed"),
        careDb.from("care_group_member").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("invitation_status", "accepted"),
      ]);

      return {
        upcomingBookings: bookingsRes.count || 0,
        unreadMessages: msgsRes.count || 0,
        pendingTasks: tasksRes.count || 0,
        careGroups: groupsRes.count || 0,
      };
    },
  });
}
