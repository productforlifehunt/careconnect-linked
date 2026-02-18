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

// Bookings where current user is the provider (incoming requests)
export function useProviderBookings() {
  return useQuery({
    queryKey: ["provider-bookings"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await careDb
        .from("booking")
        .select("*, client:user_id(id, full_name, avatar_url, email, phone_number)")
        .eq("provider_id", userId)
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["provider-bookings"] });
    },
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
        .select("*")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
        )
        .is("group_id", null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Fetch sender profiles separately (no FK in care_connector schema)
      const senderIds = [...new Set((data || []).map((m: any) => m.sender_id).filter(Boolean))];
      let senderMap: Record<string, any> = {};
      if (senderIds.length > 0) {
        const { data: senders } = await careDb
          .from("profile")
          .select("id, full_name, avatar_url")
          .in("id", senderIds);
        (senders || []).forEach((s: any) => { senderMap[s.id] = s; });
      }
      return (data || []).map((m: any) => ({ ...m, sender: senderMap[m.sender_id] || null }));
    },
    enabled: !!otherUserId,
    refetchInterval: 5000,
  });
}

export function useGroupMessages(groupId: string | null) {
  return useQuery({
    queryKey: ["group-messages", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await careDb
        .from("direct_message")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      // Fetch sender profiles separately (no FK in care_connector schema)
      const senderIds = [...new Set((data || []).map((m: any) => m.sender_id).filter(Boolean))];
      let senderMap: Record<string, any> = {};
      if (senderIds.length > 0) {
        const { data: senders } = await careDb
          .from("profile")
          .select("id, full_name, avatar_url")
          .in("id", senderIds);
        (senders || []).forEach((s: any) => { senderMap[s.id] = s; });
      }
      return (data || []).map((m: any) => ({ ...m, sender: senderMap[m.sender_id] || null }));
    },
    enabled: !!groupId,
    refetchInterval: 5000,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["group-messages"] });
    },
  });
}

// ─── Care Groups ────────────────────────────────────────────
export function useCareGroups() {
  return useQuery({
    queryKey: ["care-groups"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
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

export function useCreateCareGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (group: { name: string; description?: string; is_private?: boolean }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await careDb
        .from("care_group")
        .insert({ ...group, created_by: userId })
        .select()
        .single();
      if (error) throw error;
      // Auto-add creator as owner member
      await careDb.from("care_group_member").insert({
        group_id: data.id,
        user_id: userId,
        is_owner: true,
        is_admin: true,
        invitation_status: "accepted",
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-groups"] }),
  });
}

export function useInviteToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, email }: { groupId: string; email: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("care_group_invitation")
        .insert({ care_group_id: groupId, invited_by_user_id: userId, invitee_email: email, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["care-group-members"] });
      qc.invalidateQueries({ queryKey: ["care-group-invitations"] });
    },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, updates }: { memberId: string; updates: { is_admin?: boolean; is_cared_one?: boolean; is_owner?: boolean } }) => {
      const { error } = await careDb
        .from("care_group_member")
        .update(updates)
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["care-group-members"] });
      qc.invalidateQueries({ queryKey: ["group-cared-ones"] });
    },
  });
}

export function useRemoveGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      // Get the member's group_id before deleting
      const { data: member } = await careDb
        .from("care_group_member")
        .select("group_id")
        .eq("id", memberId)
        .single();
      const { error } = await careDb
        .from("care_group_member")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      // Decrement member_count
      if (member?.group_id) {
        try {
          const { data: g } = await careDb.from("care_group").select("member_count").eq("id", member.group_id).single();
          if (g && (g as any).member_count > 0) {
            await careDb.from("care_group").update({ member_count: (g as any).member_count - 1 }).eq("id", member.group_id);
          }
        } catch (_) { /* ignore */ }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["care-group-members"] });
      qc.invalidateQueries({ queryKey: ["care-groups"] });
    },
  });
}

// ─── Care Group Gallery ─────────────────────────────────────
export function useCareGroupGallery(groupId: string | null) {
  return useQuery({
    queryKey: ["care-group-gallery", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await careDb
        .from("care_group_gallery")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) {
        // Table may not exist yet
        console.warn("Gallery table not available:", error.message);
        return [];
      }
      const uploaderIds = [...new Set((data || []).map((g: any) => g.uploaded_by).filter(Boolean))];
      let uploaderMap: Record<string, any> = {};
      if (uploaderIds.length > 0) {
        const { data: uploaders } = await careDb
          .from("profile")
          .select("id, full_name, avatar_url")
          .in("id", uploaderIds);
        (uploaders || []).forEach((u: any) => { uploaderMap[u.id] = u; });
      }
      return (data || []).map((g: any) => ({ ...g, uploader: uploaderMap[g.uploaded_by] || null }));
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
        .update({ status, ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}) })
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
          provider_is_active: false,
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
    mutationFn: async (post: { group_id: string; content: string; type?: string; title?: string; visibility?: string; visible_to_member_category_id?: string[] }) => {
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

export function useUpdateGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { content?: string; title?: string; is_pinned?: boolean } }) => {
      const { error } = await careDb
        .from("care_group_post")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-group-posts"] }),
  });
}

export function useDeleteGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb
        .from("care_group_post")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-group-posts"] }),
  });
}

// ─── Group Settings (update & delete) ───────────────────────
export function useUpdateCareGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; description?: string; is_private?: boolean } }) => {
      const { error } = await careDb
        .from("care_group")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-groups"] }),
  });
}

export function useDeleteCareGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb
        .from("care_group")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-groups"] }),
  });
}

// ─── Join by Code ───────────────────────────────────────────
export function useJoinGroupByCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (joinCode: string) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      // Find group with this join code
      const { data: group, error: gErr } = await careDb
        .from("care_group")
        .select("id")
        .eq("join_code", joinCode.trim().toUpperCase())
        .single();
      if (gErr || !group) throw new Error("Invalid join code");
      // Check if already a member
      const { data: existing } = await careDb
        .from("care_group_member")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (existing) throw new Error("You're already a member of this group");
      const { error } = await careDb
        .from("care_group_member")
        .insert({ group_id: group.id, user_id: userId, invitation_status: "accepted" });
      if (error) throw error;
      // Increment member_count
      try {
        const { data: grp } = await careDb.from("care_group").select("member_count").eq("id", group.id).single();
        await careDb.from("care_group").update({ member_count: ((grp as any)?.member_count || 0) + 1 }).eq("id", group.id);
      } catch (_) { /* ignore */ }
      return group;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-groups"] }),
  });
}

// ─── Pending Invitations ────────────────────────────────────
export function useGroupInvitations(groupId: string | null) {
  return useQuery({
    queryKey: ["care-group-invitations", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await careDb
        .from("care_group_invitation")
        .select("*")
        .eq("care_group_id", groupId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Failed to fetch invitations:", error.message);
        return [];
      }
      return (data || []) as any[];
    },
    enabled: !!groupId,
  });
}

export function useCancelInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await careDb
        .from("care_group_invitation")
        .delete()
        .eq("id", invitationId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-group-invitations"] }),
  });
}

// ─── Search Profiles ────────────────────────────────────────
export function useSearchProfiles(query: string) {
  return useQuery({
    queryKey: ["search-profiles", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const { data, error } = await careDb
        .from("profile")
        .select("id, full_name, first_name, last_name, avatar_url, email, user_name")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,user_name.ilike.%${query}%`)
        .limit(10);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: query.length >= 2,
  });
}

// ─── Add Cared One to Group ─────────────────────────────────
export function useAddCaredOneToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, userId, skipInvitation }: { groupId: string; userId: string; skipInvitation: boolean }) => {
      // Check if already a member
      const { data: existing } = await careDb
        .from("care_group_member")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .maybeSingle();
      if (existing) {
        // Just update their is_cared_one flag
        const { error } = await careDb
          .from("care_group_member")
          .update({ is_cared_one: true })
          .eq("id", existing.id);
        if (error) throw error;
        return;
      }
      const { error } = await careDb
        .from("care_group_member")
        .insert({
          group_id: groupId,
          user_id: userId,
          is_cared_one: true,
          invitation_status: skipInvitation ? "accepted" : "pending",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["care-group-members"] });
      qc.invalidateQueries({ queryKey: ["group-cared-ones"] });
    },
  });
}

// ─── Create Personal Cared One (user_cared_one) ─────────────
export function useCreateUserCaredOne() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ caredOneId, relationship, isPrimary }: { caredOneId: string; relationship?: string; isPrimary?: boolean }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("user_cared_one")
        .insert({ user_id: userId, cared_one_id: caredOneId, relationship: relationship || null, is_primary: isPrimary || false });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-cared-ones"] }),
  });
}

// ─── My Pending Group Invitations ───────────────────────────
// ─── My Pending Group Invitations ───────────────────────────
// Covers both: (a) email invitations from care_group_invitation table
//              (b) direct membership rows with invitation_status='pending' (cared ones added without skip)
export function useMyPendingInvitations() {
  return useQuery({
    queryKey: ["my-pending-invitations"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];

      // (a) Email invitations
      const { data: profile } = await careDb.from("profile").select("email").eq("id", userId).single();
      const emailInvitations: any[] = [];
      if (profile?.email) {
        const { data, error } = await careDb
          .from("care_group_invitation")
          .select("*")
          .eq("invitee_email", profile.email)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        if (!error && data) emailInvitations.push(...data);
      }

      // (b) Direct pending member rows (e.g. cared ones added without skip)
      const { data: pendingMemberships, error: mErr } = await careDb
        .from("care_group_member")
        .select("id, group_id, created_at")
        .eq("user_id", userId)
        .eq("invitation_status", "pending");

      const allGroupIds = [
        ...emailInvitations.map((i: any) => i.care_group_id),
        ...((pendingMemberships || []).map((m: any) => m.group_id)),
      ].filter(Boolean);

      let groupMap: Record<string, any> = {};
      if (allGroupIds.length > 0) {
        const uniqueIds = [...new Set(allGroupIds)];
        const { data: groups } = await careDb.from("care_group").select("id, name, description").in("id", uniqueIds);
        (groups || []).forEach((g: any) => { groupMap[g.id] = g; });
      }

      const emailInvRows = emailInvitations.map((i: any) => ({
        id: i.id,
        care_group_id: i.care_group_id,
        created_at: i.created_at,
        source: "invitation" as const,
        group: groupMap[i.care_group_id] || null,
      }));

      const memberRows = (pendingMemberships || []).map((m: any) => ({
        id: m.id,
        care_group_id: m.group_id,
        created_at: m.created_at,
        source: "membership" as const,
        group: groupMap[m.group_id] || null,
      }));

      return [...emailInvRows, ...memberRows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitation: { id: string; care_group_id: string; source?: "invitation" | "membership" }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      if (invitation.source === "membership") {
        // Just update the membership row to accepted
        const { error } = await careDb
          .from("care_group_member")
          .update({ invitation_status: "accepted" })
          .eq("id", invitation.id);
        if (error) throw error;
      } else {
        // Update invitation status
        const { error: invErr } = await careDb
          .from("care_group_invitation")
          .update({ status: "accepted" })
          .eq("id", invitation.id);
        if (invErr) throw invErr;
        // Create member row if not exists
        const { data: existing } = await careDb
          .from("care_group_member")
          .select("id")
          .eq("group_id", invitation.care_group_id)
          .eq("user_id", userId)
          .maybeSingle();
        if (!existing) {
          const { error: memErr } = await careDb
            .from("care_group_member")
            .insert({ group_id: invitation.care_group_id, user_id: userId, invitation_status: "accepted" });
          if (memErr) throw memErr;
        }
      }
      // Increment member_count
      try {
        const { data: grp } = await careDb.from("care_group").select("member_count").eq("id", invitation.care_group_id).single();
        await careDb.from("care_group").update({ member_count: ((grp as any)?.member_count || 0) + 1 }).eq("id", invitation.care_group_id);
      } catch (_) { /* ignore */ }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-pending-invitations"] });
      qc.invalidateQueries({ queryKey: ["care-groups"] });
      qc.invalidateQueries({ queryKey: ["care-group-members"] });
    },
  });
}

export function useDeclineInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, source }: { id: string; source?: "invitation" | "membership" }) => {
      if (source === "membership") {
        // Delete the pending member row (they don't want to join)
        const { error } = await careDb.from("care_group_member").delete().eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await careDb
          .from("care_group_invitation")
          .update({ status: "declined" })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-pending-invitations"] }),
  });
}

// ─── Member Categories ──────────────────────────────────────
export function useMemberCategories(groupId: string | null) {
  return useQuery({
    queryKey: ["member-categories", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await careDb
        .from("care_group_member_category")
        .select("*")
        .eq("group_id", groupId)
        .order("name");
      if (error) {
        console.warn("Failed to fetch member categories:", error.message);
        return [];
      }
      return (data || []) as any[];
    },
    enabled: !!groupId,
  });
}

export function useCreateMemberCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, name, description, color }: { groupId: string; name: string; description?: string; color?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("care_group_member_category")
        .insert({ group_id: groupId, name, description: description || null, color: color || null, created_by: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member-categories"] }),
  });
}

export function useDeleteMemberCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await careDb
        .from("care_group_member_category")
        .delete()
        .eq("id", categoryId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member-categories"] }),
  });
}


// ─── Location Shares ────────────────────────────────────────
export function useLocationShares() {
  return useQuery({
    queryKey: ["location-shares"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
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

// ─── Group Cared Ones (members with is_cared_one = true) ────
export function useGroupCaredOnes(groupId: string | null) {
  return useQuery({
    queryKey: ["group-cared-ones", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await careDb
        .from("care_group_member")
        .select("*, profile:user_id(id, full_name, first_name, last_name, avatar_url)")
        .eq("group_id", groupId)
        .eq("is_cared_one", true)
        .eq("invitation_status", "accepted");
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!groupId,
  });
}

// ─── Check-In Logs ──────────────────────────────────────────
export function useCheckinLogs(caredOneId: string | null) {
  return useQuery({
    queryKey: ["checkin-logs", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("checkin_log")
        .select("*, reporter:reported_by(id, full_name, avatar_url)")
        .eq("user_id", caredOneId)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateCheckinLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: { user_id: string; mood?: string; energy_level?: number; pain_level?: number; sleep_hours?: number; note?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("checkin_log")
        .insert({ ...log, reported_by: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checkin-logs"] }),
  });
}

// ─── Medicines ──────────────────────────────────────────────
export function useMedicines(caredOneId: string | null) {
  return useQuery({
    queryKey: ["medicines", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("medicine")
        .select("*")
        .eq("user_id", caredOneId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (med: { user_id: string; name: string; dosage?: string; frequency?: string; time_slot?: string[]; note?: string; form?: string; category?: string }) => {
      const { error } = await careDb
        .from("medicine")
        .insert(med);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medicines"] }),
  });
}

export function useDeleteMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb.from("medicine").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medicines"] }),
  });
}

export function useMedicineLogs(medicineId: string | null) {
  return useQuery({
    queryKey: ["medicine-logs", medicineId],
    queryFn: async () => {
      if (!medicineId) return [];
      const { data, error } = await careDb
        .from("medicine_log")
        .select("*")
        .eq("medicine_id", medicineId)
        .order("logged_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!medicineId,
  });
}

export function useLogMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: { medicine_id: string; status: string; note?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("medicine_log")
        .insert({ ...log, logged_by: userId, logged_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medicine-logs"] }),
  });
}

// ─── Health Vitals ──────────────────────────────────────────
export function useHealthVitals(caredOneId: string | null) {
  return useQuery({
    queryKey: ["health-vitals", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("health_vital")
        .select("*")
        .eq("user_id", caredOneId)
        .order("recorded_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateHealthVital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vital: { user_id: string; vital_type: string; value: number; unit?: string; note?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("health_vital")
        .insert({ ...vital, recorded_by: userId, recorded_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health-vitals"] }),
  });
}

// ─── Care Tips ──────────────────────────────────────────────
export function useCareTips(caredOneId: string | null) {
  return useQuery({
    queryKey: ["care-tips", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("care_tip")
        .select("*")
        .eq("user_id", caredOneId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateCareTip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tip: { user_id: string; title: string; content: string; category?: string; is_pinned?: boolean }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("care_tip")
        .insert({ ...tip, created_by: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-tips"] }),
  });
}

export function useDeleteCareTip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb.from("care_tip").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-tips"] }),
  });
}

// ─── Care Plans ─────────────────────────────────────────────
export function useCarePlans(caredOneId: string | null) {
  return useQuery({
    queryKey: ["care-plans", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("care_plan")
        .select("*")
        .eq("user_id", caredOneId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateCarePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: { user_id: string; title: string; description?: string; status?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("care_plan")
        .insert({ ...plan, created_by: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-plans"] }),
  });
}

export function useCarePlanGoals(planId: string | null) {
  return useQuery({
    queryKey: ["care-plan-goals", planId],
    queryFn: async () => {
      if (!planId) return [];
      const { data, error } = await careDb
        .from("care_plan_goal")
        .select("*")
        .eq("care_plan_id", planId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!planId,
  });
}

export function useCreateCarePlanGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goal: { care_plan_id: string; title: string; description?: string; status?: string }) => {
      const { error } = await careDb
        .from("care_plan_goal")
        .insert(goal);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-plan-goals"] }),
  });
}

export function useUpdateCarePlanGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await careDb
        .from("care_plan_goal")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-plan-goals"] }),
  });
}

// ─── Care Notes ─────────────────────────────────────────────
export function useCareNotes(caredOneId: string | null) {
  return useQuery({
    queryKey: ["care-notes", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("care_note")
        .select("*")
        .eq("user_id", caredOneId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateCareNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: { user_id: string; title?: string; content: string; category?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("care_note")
        .insert({ ...note, created_by: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-notes"] }),
  });
}

export function useDeleteCareNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb.from("care_note").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-notes"] }),
  });
}

// ─── Emergency Contacts ─────────────────────────────────────
export function useEmergencyContacts(caredOneId: string | null) {
  return useQuery({
    queryKey: ["emergency-contacts", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("emergency_contact")
        .select("*")
        .eq("user_id", caredOneId)
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: { user_id: string; name: string; phone: string; relationship?: string; is_primary?: boolean }) => {
      const { error } = await careDb
        .from("emergency_contact")
        .insert(contact);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergency-contacts"] }),
  });
}

export function useDeleteEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb.from("emergency_contact").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergency-contacts"] }),
  });
}

// ─── Activity / Visit Log ───────────────────────────────────
export function useActivityLog(caredOneId: string | null) {
  return useQuery({
    queryKey: ["activity-log", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("activity_log")
        .select("*")
        .eq("cared_one_id", caredOneId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateActivityLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: { cared_one_id: string; activity_type: string; description?: string; duration_minutes?: number }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("activity_log")
        .insert({ ...log, logged_by: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity-log"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb.from("care_task").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["care-tasks"] }),
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const { data: member } = await careDb
        .from("care_group_member")
        .select("id, is_owner")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();
      if (!member) throw new Error("Not a member");
      if (member.is_owner) throw new Error("Owners cannot leave. Transfer ownership first.");
      const { error } = await careDb.from("care_group_member").delete().eq("id", member.id);
      if (error) throw error;
      try {
        const { data: g } = await careDb.from("care_group").select("member_count").eq("id", groupId).single();
        if (g && (g as any).member_count > 0) {
          await careDb.from("care_group").update({ member_count: (g as any).member_count - 1 }).eq("id", groupId);
        }
      } catch (_) { /* ignore */ }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["care-groups"] });
      qc.invalidateQueries({ queryKey: ["care-group-members"] });
    },
  });
}

// ─── Job Board ──────────────────────────────────────────────
export function useJobPostings(filters?: { source?: string; status?: string }) {
  return useQuery({
    queryKey: ["job-postings", filters],
    queryFn: async () => {
      let q = careDb
        .from("job_posting")
        .select("*")
        .eq("status", filters?.status || "open")
        .order("created_at", { ascending: false });
      if (filters?.source) q = q.eq("job_source_type", filters.source);
      const { data, error } = await q;
      if (error) throw error;
      // Fetch poster profiles
      const posterIds = [...new Set((data || []).map((j: any) => j.posted_by).filter(Boolean))];
      let posterMap: Record<string, any> = {};
      if (posterIds.length > 0) {
        const { data: posters } = await careDb
          .from("profile")
          .select("id, full_name, avatar_url, location")
          .in("id", posterIds);
        (posters || []).forEach((p: any) => { posterMap[p.id] = p; });
      }
      return (data || []).map((j: any) => ({ ...j, poster: posterMap[j.posted_by] || null }));
    },
  });
}

export function useCreateJobPosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: { title: string; description: string; job_source_type?: string; service_type?: string; hourly_rate?: number; location?: string; care_recipient_id?: string; linked_task_id?: string; linked_group_id?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("job_posting")
        .insert({ ...job, posted_by: userId, status: "open", job_source_type: job.job_source_type || "general" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-postings"] }),
  });
}

export function useJobApplications(jobId: string | null) {
  return useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await careDb
        .from("job_application")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const applicantIds = [...new Set((data || []).map((a: any) => a.applicant_id).filter(Boolean))];
      let applicantMap: Record<string, any> = {};
      if (applicantIds.length > 0) {
        const { data: applicants } = await careDb
          .from("profile")
          .select("id, full_name, avatar_url, hourly_rate, rating_average, years_of_experience")
          .in("id", applicantIds);
        (applicants || []).forEach((a: any) => { applicantMap[a.id] = a; });
      }
      return (data || []).map((a: any) => ({ ...a, applicant: applicantMap[a.applicant_id] || null }));
    },
    enabled: !!jobId,
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: string; coverLetter: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("job_application")
        .insert({ job_id: jobId, applicant_id: userId, cover_letter: coverLetter, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-applications"] }),
  });
}

export function useMyJobApplications() {
  return useQuery({
    queryKey: ["my-job-applications"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await careDb
        .from("job_application")
        .select("*")
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const jobIds = [...new Set((data || []).map((a: any) => a.job_id).filter(Boolean))];
      let jobMap: Record<string, any> = {};
      if (jobIds.length > 0) {
        const { data: jobs } = await careDb
          .from("job_posting")
          .select("id, title, status, service_type, hourly_rate, location")
          .in("id", jobIds);
        (jobs || []).forEach((j: any) => { jobMap[j.id] = j; });
      }
      return (data || []).map((a: any) => ({ ...a, job: jobMap[a.job_id] || null }));
    },
  });
}

// ─── Provider Availability ──────────────────────────────────
export function useProviderAvailability(providerId: string | null) {
  return useQuery({
    queryKey: ["provider-availability", providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const { data, error } = await careDb
        .from("provider_availability")
        .select("*")
        .eq("provider_id", providerId)
        .order("day_of_week", { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!providerId,
  });
}

export function useUpsertProviderAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slots: { provider_id: string; day_of_week: number; start_time: string; end_time: string; is_available: boolean; specific_date?: string | null }[]) => {
      // Delete existing weekly patterns for this provider, then re-insert
      const providerId = slots[0]?.provider_id;
      if (!providerId) throw new Error("No provider ID");
      // Delete only weekly patterns (specific_date is null)
      await careDb
        .from("provider_availability")
        .delete()
        .eq("provider_id", providerId)
        .is("specific_date", null);
      // Insert new slots
      const { error } = await careDb
        .from("provider_availability")
        .insert(slots);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["provider-availability"] }),
  });
}

export function useProviderAvailabilitySetting(providerId: string | null) {
  return useQuery({
    queryKey: ["provider-availability-setting", providerId],
    queryFn: async () => {
      if (!providerId) return null;
      const { data, error } = await careDb
        .from("provider_availability_setting")
        .select("*")
        .eq("provider_id", providerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
}

export function useUpdateProviderAvailabilitySetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ providerId, settings }: { providerId: string; settings: Record<string, any> }) => {
      // Upsert
      const { data: existing } = await careDb
        .from("provider_availability_setting")
        .select("id")
        .eq("provider_id", providerId)
        .maybeSingle();
      if (existing) {
        const { error } = await careDb
          .from("provider_availability_setting")
          .update(settings)
          .eq("provider_id", providerId);
        if (error) throw error;
      } else {
        const { error } = await careDb
          .from("provider_availability_setting")
          .insert({ provider_id: providerId, ...settings });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["provider-availability-setting"] }),
  });
}

// ─── Provider Earnings ──────────────────────────────────────
export function useProviderPayouts() {
  return useQuery({
    queryKey: ["provider-payouts"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await careDb
        .from("provider_payout")
        .select("*")
        .eq("provider_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as any[];
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

// ─── Safe Zones ─────────────────────────────────────────────
export function useSafeZones(caredOneId: string | null) {
  return useQuery({
    queryKey: ["safe-zones", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("safe_zone")
        .select("*")
        .eq("user_id", caredOneId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateSafeZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (zone: { user_id: string; name: string; latitude?: number; longitude?: number; radius_meters?: number; zone_type?: string }) => {
      const { error } = await careDb
        .from("safe_zone")
        .insert(zone);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["safe-zones"] }),
  });
}

export function useDeleteSafeZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb.from("safe_zone").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["safe-zones"] }),
  });
}

// ─── Cared One Documents ────────────────────────────────────
export function useCaredOneDocuments(caredOneId: string | null) {
  return useQuery({
    queryKey: ["cared-one-documents", caredOneId],
    queryFn: async () => {
      if (!caredOneId) return [];
      const { data, error } = await careDb
        .from("cared_one_document")
        .select("*")
        .eq("user_id", caredOneId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!caredOneId,
  });
}

export function useCreateCaredOneDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: { user_id: string; title: string; document_type?: string; file_url?: string; notes?: string }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await careDb
        .from("cared_one_document")
        .insert({ ...doc, uploaded_by: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cared-one-documents"] }),
  });
}

export function useDeleteCaredOneDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb.from("cared_one_document").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cared-one-documents"] }),
  });
}

// ─── Delete User Cared One relationship ─────────────────────
export function useDeleteUserCaredOne() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await careDb.from("user_cared_one").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-cared-ones"] }),
  });
}

// ─── Start or get conversation ──────────────────────────────
export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      // Check if conversation already exists
      const { data: existing } = await careDb
        .from("conversation")
        .select("id")
        .or(
          `and(participant_1_id.eq.${userId},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${userId})`
        )
        .maybeSingle();
      if (existing) return existing.id;
      const { data, error } = await careDb
        .from("conversation")
        .insert({ participant_1_id: userId, participant_2_id: otherUserId })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}
