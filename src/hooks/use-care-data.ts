import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoredWPUser, getWPToken } from "@/services/wp-auth";
import { readLastGood, withLastGood } from "@/lib/last-good";
import { currentAppId } from "@/features/shared/app-profile";

// ─── Feature source modules (backend-specific) ─────────────
import { fetchProviderByIdWordPress } from "@/features/providers/source.wordpress";
import { fetchProviderBookingsWordPress, createBookingWordPress, updateBookingStatusWordPress } from "@/features/bookings/source.wordpress";
import { fetchCareGroupMembersWordPress, createCareGroupWordPress } from "@/features/care-groups/source.wordpress";
import { fetchMyProfileWordPress, updateProfileWordPress } from "@/features/profile/source.wordpress";
import { notifySubgroupApproved } from "@/features/notifications/notify-events";
import { fetchCareFacilitiesWordPress, fetchCareFacilityByIdWordPress } from "@/features/facilities/source.wordpress";
import { toCodeList } from "@/lib/facility-options";
export { useProviders } from "@/features/providers/use-providers";

import {
  createCareFacilityWordPress, updateCareFacilityWordPress,
  fetchFacilityMembersWordPress, getMyFacilityPermissionWordPress,
  fetchFacilityReviewSummariesWordPress,
  fetchFacilityClaimsOnlyWordPress, fetchFacilityDisputesWordPress,
  createFacilityOwnershipClaimWordPress, updateFacilityOwnershipClaimWordPress,
  deleteFacilityOwnershipClaimWordPress,
} from "@/features/facilities/source.wordpress-extended";
import {
  fetchCareGroupPostsWordPress, createGroupPostWordPress, updateGroupPostWordPress, deleteGroupPostWordPress,
  updateCareGroupWordPress, deleteCareGroupWordPress,
  inviteToGroupWordPress, fetchGroupInvitationsWordPress, cancelInvitationWordPress,
  fetchMyPendingInvitationsWordPress, acceptInvitationWordPress, declineInvitationWordPress,
  updateMemberRoleWordPress, removeGroupMemberWordPress,
  joinGroupByCodeWordPress, fetchCareGroupGalleryWordPress,
  fetchMemberCategoriesWordPress, createMemberCategoryWordPress, updateMemberCategoryWordPress, deleteMemberCategoryWordPress,
  fetchSubgroupMembersWordPress, fetchSubgroupMemberRecordsWordPress,
  addMemberToSubgroupWordPress, removeMemberFromSubgroupWordPress,
  updateSubgroupMemberRoleWordPress, joinGroupByJoinCodeWordPress, joinGroupByAnyCodeWordPress, previewGroupInviteWordPress,
  fetchGroupLinkStateWordPress, requestToJoinGroupWordPress, fetchJoinRequesterWordPress, answerJoinRequestWordPress,
  type InvitedAs,
  searchProfilesWordPress, addCaredOneToGroupWordPress, leaveGroupWordPress,
  fetchGroupInvitesWordPress, createGroupInviteWordPress, updateGroupInviteWordPress, deleteGroupInviteWordPress,
} from "@/features/care-groups/source.wordpress-extended";
import { setPostVisibility, setTaskVisibility, filterVisiblePosts } from "@/features/care-groups/visibility";
import {
  fetchSafeZonesWordPress, createSafeZoneWordPress, updateSafeZoneWordPress, deleteSafeZoneWordPress,
  fetchSafeZoneAlertsWordPress, acknowledgeAlertWordPress, acknowledgeAllAlertsWordPress,
  fetchCaredOneLocationHistoryWordPress,
  shareMyLocationWordPress, disableMyLocationSharingWordPress,
  fetchLocationRequestsWordPress, sendLocationRequestWordPress, cancelLocationRequestWordPress,
  respondToLocationRequestWordPress, enableEmergencyLocationPermissionWordPress,
  fetchCaredOneLocationSettingsWordPress,
} from "@/features/location/source.wordpress-extended";
import {
  fetchHelpTaskPostersWordPress, fetchHelpTaskRowsWordPress,
  fetchMyHelpTasksWordPress, fetchTaskApplicantsWordPress,
  applyToSharedTaskWordPress, fetchMyTaskApplicationsWordPress, decideTaskApplicantWordPress,
  shareTaskWordPress, unshareTaskWordPress,
} from "@/features/care-tasks/tasks-needing-help";
import {
  fetchPostByIdWordPress, createPostWordPress, updatePostWordPress, deletePostWordPress,
} from "@/features/posts/source.wordpress";
import {
  fetchCommunityPostsWordPress, fetchCommunityPostByIdWordPress,
  createCommunityPostWordPress, updateCommunityPostWordPress, deleteCommunityPostWordPress,
  fetchPostCommentsWordPress, createPostCommentWordPress,
  fetchCommentRepliesWordPress, createCommentReplyWordPress,
  updateCommentCCTWordPress, deleteCommentCCTWordPress,
} from "@/features/community-posts/source.wordpress";
import { createCareTaskWordPress, updateCareTaskWordPress, deleteCareTaskWordPress, updateAssigneeStatusWordPress, linkTaskToCalendarEventWordPress } from "@/features/care-tasks/source.wordpress";
import { createCalendarEventForUserWordPress } from "@/features/calendar/source.wordpress";
import { fetchCategoriesWordPress } from "@/features/categories/source.wordpress";
import { fetchArticlesWordPress } from "@/features/articles/source.wordpress";
import { fetchEntityReviewsWordPress, createReviewWordPress } from "@/features/reviews/source.wordpress";
import { setMyGroupDisplayNameWordPress } from "@/features/care-groups/source.wordpress";
import { fetchDirectMessagesWordPress, sendMessageWordPress, markMessagesReadWordPress, startConversationWordPress, getOrCreateGroupConversationWordPress } from "@/features/conversations/source.wordpress";
import { fetchSavedProvidersWordPress, toggleSavedProviderWordPress } from "@/features/saved-providers/source.wordpress";
import { fetchCommentsWordPress, createCommentWordPress, updateCommentWordPress, deleteCommentWordPress } from "@/features/comments/source.wordpress";
import { fetchVoteSummaries, fetchVoteSummary, toggleVote } from "@/features/votes/source.wordpress";
import { fetchLocationSharesWordPress } from "@/features/location/source.wordpress";


import {
  createUserCaredOneWordPress, deleteUserCaredOneWordPress, fetchGroupCaredOnesWordPress,
  createCheckinWordPress, updateCheckinWordPress, deleteCheckinWordPress, fetchCheckinLogsWordPress, logCheckinWordPress,
  createMedicineWordPress, updateMedicineWordPress, deleteMedicineWordPress,
  fetchMedicineLogsWordPress, fetchAllMedicineLogsWordPress, logMedicineWordPress,
  fetchCareTipsWordPress, createCareTipWordPress, updateCareTipWordPress, deleteCareTipWordPress,
  fetchCarePlansWordPress, createCarePlanWordPress, updateCarePlanWordPress, deleteCarePlanWordPress,
  fetchCareNotesWordPress, createCareNoteWordPress, updateCareNoteWordPress, deleteCareNoteWordPress,
  fetchVisitLogWordPress, createVisitLogWordPress, deleteVisitLogWordPress,
  fetchEmergencyContactsWordPress, createEmergencyContactWordPress, updateEmergencyContactWordPress, deleteEmergencyContactWordPress,
  fetchCaredOneDocumentsWordPress, createCaredOneDocumentWordPress, updateCaredOneDocumentWordPress, deleteCaredOneDocumentWordPress,
} from "@/features/cared-ones/source.wordpress-extended";
import {
  fetchInformationCardsWordPress, fetchInformationCardWordPress,
  fetchSharedInformationCardWordPress,
  createInformationCardWordPress, updateInformationCardWordPress, deleteInformationCardWordPress,
  fetchInformationCardContactIdsWordPress, setInformationCardContactsWordPress,
} from "@/features/cared-ones/source.information-cards";
import type {
  Profile, Booking, Review, CareGroup, CareGroupMember,
  CareTask, Notification,
  SavedProvider, CareGroupPost, LocationShare, ServiceCategory, PostType,
  CategoryType, CategoryOption, EntityCategoryOption, CustomFieldType, EntityCustomFieldValue,
  Post, Comment, CareFacility, FacilityMember, FacilityMemberWithProfile, LocationRecord,
  FacilityOwnershipClaim, FacilityOwnershipDispute,
} from "@/types/care-connector";

export {
  useBookings,
  useCareGroups,
  useCareTasks,
  useCheckins,
  useCaredOneLocation,
  useConversations,
  useInboxCounts,
  useMedicines,
  useNotifications,
  usePosts,
  useTodayCheckinLogs,
  useTodayMedicineLogs,
  useUserCaredOnes,
} from "@/features/dashboard/use-dashboard-data";

// ─── Helpers ────────────────────────────────────────────────

export function usePostTypes(_level?: 1 | 2 | 3 | 4 | undefined, _parentId?: string | null | undefined) {
  return useQuery({ queryKey: ["postTypes"], queryFn: async () => [] as any[] });
}

export function useCategoryTypes() {
  return useQuery({ queryKey: ["categoryTypes"], queryFn: async () => [] as any[] });
}

export function useCategoryOptions(_categoryTypeId: string | null) {
  return useQuery({ queryKey: ["categoryOptions", _categoryTypeId], queryFn: async () => [] as any[], enabled: !!_categoryTypeId });
}

export function useEntityCategoryOptions(_postId: string | null) {
  return useQuery({ queryKey: ["entityCategoryOptions", _postId], queryFn: async () => [] as any[], enabled: !!_postId });
}

export function useCustomFieldTypes() {
  return useQuery({ queryKey: ["customFieldTypes"], queryFn: async () => [] as any[] });
}

export function useEntityCustomFieldValues(_postId: string | null) {
  return useQuery({ queryKey: ["entityCustomFieldValues", _postId], queryFn: async () => [] as any[], enabled: !!_postId });
}

function dedupeFacilities(list: CareFacility[]) {
  const map = new Map<string, CareFacility>();
  list.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export function useProvider(id: string | undefined) {
  return useQuery({
    queryKey: ["provider", id],
    queryFn: () => fetchProviderByIdWordPress(id!),
    enabled: !!id,
  });
}

export function useCareFacilities(filters?: {
  query?: string | undefined;
  location?: string | undefined;
  minRating?: number | undefined;
  sortBy?: string | undefined;
  /** CCT 215 a57 option codes */
  facilityTypes?: string[] | undefined;
  /** CCT 215 a58 option codes */
  dementiaStages?: string[] | undefined;
  area?: "china" | "global" | undefined;
}) {
  return useQuery({
    // One read shared by every keystroke/filter; typing only re-filters the already loaded list.
    queryKey: ["facilities"],
    queryFn: fetchCareFacilitiesWordPress,
    staleTime: 60_000,
    select: (raw) => {
      let results = dedupeFacilities(raw as unknown as CareFacility[]);
      if (filters?.query) {
        const q = filters.query.toLowerCase();
        results = results.filter((f) => f.name?.toLowerCase().includes(q) || (f as any).description?.toLowerCase().includes(q));
      }
      if (filters?.location) {
        const loc = filters.location.toLowerCase();
        results = results.filter((f) => (f as any).location?.toLowerCase().includes(loc) || (f as any).address?.toLowerCase().includes(loc));
      }
      if (filters?.facilityTypes?.length) {
        results = results.filter((f) => toCodeList((f as any).type).some((code) => filters.facilityTypes!.includes(code)));
      }
      if (filters?.dementiaStages?.length) {
        results = results.filter((f) => toCodeList((f as any).dementia_stage).some((code) => filters.dementiaStages!.includes(code)));
      }
      return results;
    },
  });
}


export function useCareFacility(id: string | undefined) {
  return useQuery({
    queryKey: ["facility", id],
    queryFn: () => fetchCareFacilityByIdWordPress(id!),
    enabled: !!id,
  });
}

export function useFacilityReviewSummaries(facilityIds: string[]) {
  return useQuery({
    queryKey: ["facilityReviewSummaries", facilityIds],
    queryFn: () => fetchFacilityReviewSummariesWordPress(facilityIds),
    enabled: facilityIds.length > 0,
  });
}

export function useFacilityMembers(facilityId: string | undefined) {
  return useQuery({
    queryKey: ["facilityMembers", facilityId],
    queryFn: () => fetchFacilityMembersWordPress(facilityId!),
    enabled: !!facilityId,
  });
}

export function useMyFacilityPermission(facilityId: string | undefined) {
  return useQuery({
    queryKey: ["myFacilityPermission", facilityId],
    queryFn: () => getMyFacilityPermissionWordPress(facilityId!),
    enabled: !!facilityId,
  });
}

export function useCreateCareFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createCareFacilityWordPress>[0]) => createCareFacilityWordPress(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["facilities"] }); },
  });
}

// ─── Facility ownership claims (CCT 288 + Relation 291) ─────
export function useFacilityOwnershipClaims(facilityId: string | undefined) {
  return useQuery<FacilityOwnershipClaim[]>({
    queryKey: ["facilityOwnershipClaims", facilityId],
    queryFn: () => fetchFacilityClaimsOnlyWordPress(facilityId!) as any,
    enabled: !!facilityId,
  });
}

export function useFacilityOwnershipDisputes(facilityId: string | undefined) {
  return useQuery<FacilityOwnershipDispute[]>({
    queryKey: ["facilityOwnershipDisputes", facilityId],
    queryFn: () => fetchFacilityDisputesWordPress(facilityId!) as any,
    enabled: !!facilityId,
  });
}

export function useCreateFacilityOwnershipClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { facility_id: string; claim?: string | null | undefined; attachment_urls?: string[] | string | null | undefined; is_dispute?: boolean | undefined }) =>
      createFacilityOwnershipClaimWordPress(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facilityOwnershipClaims"] });
      qc.invalidateQueries({ queryKey: ["facilityOwnershipDisputes"] });
    },
  });
}

export function useUpdateFacilityOwnershipClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; status?: "pending" | "approved" | "rejected" | undefined; reply?: string | null | undefined }) =>
      updateFacilityOwnershipClaimWordPress(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facilityOwnershipClaims"] });
      qc.invalidateQueries({ queryKey: ["facilityOwnershipDisputes"] });
    },
  });
}

export function useDeleteFacilityOwnershipClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFacilityOwnershipClaimWordPress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facilityOwnershipClaims"] });
      qc.invalidateQueries({ queryKey: ["facilityOwnershipDisputes"] });
    },
  });
}

export function useUpdateCareFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateCareFacilityWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["facilities"] }); qc.invalidateQueries({ queryKey: ["facility"] }); },
  });
}

export function useEntityReviews(entityId: string | undefined, entityType: string = "provider") {
  return useQuery({
    queryKey: ["entityReviews", entityType, entityId],
    queryFn: () => fetchEntityReviewsWordPress(entityId!, entityType),
    enabled: !!entityId,
  });
}

export function useProviderReviews(providerId: string | undefined) {
  return useEntityReviews(providerId, "provider");
}

export function useFacilityReviews(facilityId: string | undefined) {
  return useEntityReviews(facilityId, "facility");
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (review: { entity_id: string; entity_type: string; rating: number; comment?: string | undefined }) => createReviewWordPress(review),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entityReviews"] });
      qc.invalidateQueries({ queryKey: ["facilityReviewSummaries"] });
      qc.invalidateQueries({ queryKey: ["providerRatingSummary"] });
    },
  });
}

// ─── Bookings ───────────────────────────────────────────────
// Bookings where current user is the provider (incoming requests)
export function useProviderBookings() {
  return useQuery({
    queryKey: ["providerBookings"],
    queryFn: withLastGood("providerBookings", fetchProviderBookingsWordPress),
    initialData: () => readLastGood<any[]>("providerBookings"),
    initialDataUpdatedAt: 0,
  });
}


export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (booking: Partial<Booking>) => createBookingWordPress(booking),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); },
  });
}

// ─── Messages ───────────────────────────────────────────────
/**
 * react-query keeps `isLoading` true for *disabled* queries (status stays
 * "pending" while fetchStatus is "idle"), which makes skeletons hang forever
 * when the query has no id yet. Normalize that once, here.
 */
function withIdleAwareLoading<T extends { isLoading: boolean; fetchStatus: string }>(q: T): T {
  return q.fetchStatus === "idle" && q.isLoading ? ({ ...q, isLoading: false } as T) : q;
}

export function useDirectMessages(otherUserId: string | null) {
  return withIdleAwareLoading(useQuery({
    queryKey: ["messages", otherUserId],
    queryFn: () => fetchDirectMessagesWordPress(otherUserId!),
    enabled: !!otherUserId,
  }));
}

/**
 * Group live chat (per spec: REL 140 care_group → chat_conversation, 1:1).
 * Resolves the group's conversation id, then fetches its messages via REL 143.
 */
export function useGroupMessages(groupId: string | null) {
  return useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const convoId = await getOrCreateGroupConversationWordPress(groupId);
      if (!convoId) return [];
      return fetchDirectMessagesWordPress(convoId);
    },
    enabled: !!groupId,
    // 15 s keeps the chat current without hammering the 2-core WordPress server.
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input:
        | { conversationId: string; content: string; receiverUserId?: string | undefined }
        | { groupId: string; content: string }
    ) => {
      const me = getStoredWPUser();
      const senderId = me ? `wp-${me.user_id}` : "";
      if (!senderId) throw new Error("Not authenticated");
      let convoId: string | null = null;
      if ("groupId" in input && input.groupId) {
        convoId = await getOrCreateGroupConversationWordPress(input.groupId);
      } else if ("conversationId" in input) {
        convoId = input.conversationId;
      }
      if (!convoId) throw new Error("No conversation");
      const receiver = ("receiverUserId" in input && input.receiverUserId) ? input.receiverUserId : "";
      return sendMessageWordPress(convoId, input.content, senderId, receiver);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["groupMessages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ─── Mark Messages Read ─────────────────────────────────────
export function useMarkMessagesRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => markMessagesReadWordPress(conversationId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conversations"] }); },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string | { otherUserId: string }) => {
      const uid = typeof otherUserId === 'string' ? otherUserId : otherUserId.otherUserId;
      const me = getStoredWPUser();
      const myId = me ? `wp-${me.user_id}` : "";
      if (!myId) throw new Error("Not authenticated");
      return startConversationWordPress(uid, myId);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conversations"] }); },
  });
}

// ─── Care Groups ────────────────────────────────────────────
export function useCareGroupMembers(groupId: string | null) {
  return withIdleAwareLoading(useQuery({
    queryKey: ["careGroupMembers", groupId],
    queryFn: () => fetchCareGroupMembersWordPress(groupId!),
    enabled: !!groupId,
  }));
}

export function useCreateCareGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (group: { name: string; description?: string | undefined; is_private?: boolean | undefined; displayName?: string | undefined }) => createCareGroupWordPress(group),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroups"] }); },
  });
}

/** Rel 223 a55 — my display name inside one care group. */
export function useUpdateMyGroupDisplayName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, displayName }: { groupId: string; displayName: string }) =>
      setMyGroupDisplayNameWordPress(groupId, displayName),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupMembers"] }); },
  });
}

export function useInviteToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId, email, invitedAs }: {
      groupId: string;
      userId?: string | undefined;
      email?: string | undefined;
      invitedAs?: InvitedAs | undefined;
    }) => inviteToGroupWordPress(groupId, userId || email || "", invitedAs || "normal group member"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
      qc.invalidateQueries({ queryKey: ["groupInvites"] });
      qc.invalidateQueries({ queryKey: ["groupInvitations"] });
    },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, groupId, role, updates }: { memberId: string; groupId?: string | undefined; role?: string | undefined; updates?: Record<string, any> }) => updateMemberRoleWordPress(memberId, updates ?? role ?? {}, groupId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupMembers"] }); },
  });
}

export function useRemoveGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, groupId }: { memberId: string; groupId?: string | undefined }) => removeGroupMemberWordPress(memberId, groupId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupMembers"] }); },
  });
}

// ─── Care Group Gallery ─────────────────────────────────────
export function useCareGroupGallery(groupId: string | null) {
  return useQuery({
    queryKey: ["careGroupGallery", groupId],
    queryFn: () => fetchCareGroupGalleryWordPress(groupId!),
    enabled: !!groupId,
  });
}

// ─── Care Tasks ─────────────────────────────────────────────
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: { group_id?: string | undefined; care_group_id?: string | undefined; title: string; description?: string | undefined; assigned_to?: string | string[] | undefined; due_date?: string | undefined; task_date?: string | undefined; start_time?: string | undefined; end_time?: string | undefined; location?: string | undefined; task_types?: string[] | undefined; people_needed?: number | undefined; help_status?: string | undefined; subgroupIds?: number[] | undefined; visibilityUserIds?: number[] | undefined }) => {
      const { subgroupIds, visibilityUserIds, ...payload } = task;
      const newId = await createCareTaskWordPress(payload);
      if (newId && ((subgroupIds?.length ?? 0) > 0 || (visibilityUserIds?.length ?? 0) > 0)) {
        await setTaskVisibility(newId, subgroupIds || [], visibilityUserIds || []);
      }
      // Per data model: task creation must materialize a calendar event for the group.
      // Write event for creator + every assignee (REL 129 binds owner per row),
      // and link each event back to the task via REL 131.
      try {
        const groupId = task.group_id || task.care_group_id;
        const stored = getStoredWPUser();
        const creatorId = stored?.user_id ? String(stored.user_id) : null;
        const assignees = Array.isArray(task.assigned_to) ? task.assigned_to : task.assigned_to ? [task.assigned_to] : [];
        const ownerIds = Array.from(new Set(
          [creatorId, ...assignees.map((a) => String(a).replace(/^wp-/, ""))].filter(Boolean) as string[]
        ));
        const startAt = task.start_time || task.task_date || task.due_date || "";
        const endAt = task.end_time || startAt;
        await Promise.all(ownerIds.map(async (uid) => {
          const ev = await createCalendarEventForUserWordPress(uid, {
            title: task.title,
            description: task.description || "",
            location: task.location || "",
            start_at: startAt,
            end_at: endAt,
            event_type: "task" as any,
            status: "confirmed" as any,
            show_as: "busy" as any,
          }).catch(() => null);
          if (newId && ev?.id) await linkTaskToCalendarEventWordPress(newId, ev.id).catch(() => null);
        }));
        if (groupId) qc.invalidateQueries({ queryKey: ["calendarEvents"] });
      } catch { /* non-fatal */ }
      return newId;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careTasks"] }); },
  });
}

export function useUpdateAssigneeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, userId, status }: { taskId: string; userId: string; status: "pending" | "accepted" | "rejected" }) =>
      updateAssigneeStatusWordPress(taskId, userId, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careTasks"] }); },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, updates }: { id: string; status?: string | undefined; updates?: Record<string, any> }) => updateCareTaskWordPress(id, updates ?? { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careTasks"] }); },
  });
}

// ─── Notifications ──────────────────────────────────────────
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await import("@/lib/ai-dynamic-knowledge")).runNotificationSkill("mark-notification-read", { id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await import("@/lib/ai-dynamic-knowledge")).runNotificationSkill("mark-all-notifications-read"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}

// ─── Favorites / Saved Providers ────────────────────────────
export function useSavedProviders() {
  return useQuery({
    queryKey: ["savedProviders"],
    queryFn: () => fetchSavedProvidersWordPress(),
  });
}

export function useToggleSavedProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (providerId: string) => toggleSavedProviderWordPress(providerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["savedProviders"] }); },
  });
}

// ─── Profile ────────────────────────────────────────────────

/**
 * True when a WordPress session token is present. Private CCT reads are gated on
 * this so anonymous visitors on public pages never fire 401 background polls.
 */
export function hasWPSession(): boolean {
  return Boolean(getWPToken());
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: () => fetchMyProfileWordPress(),
    enabled: hasWPSession(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<Profile>) => updateProfileWordPress(updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["myProfile"] }); },
  });
}

// ─── Become Provider ────────────────────────────────────────
export function useSubmitProviderApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      return updateProfileWordPress({
        is_care_provider: true,
        provider_is_active: true,
        service_type_slugs: input.service_type_slugs || [],
        care_provider_starts_hourly_rate: input.hourlyRate || input.care_provider_starts_hourly_rate || 0,
        bio: input.bio || '',
        location: input.location || '',
        phone: input.phone || input.phone_number || undefined,

      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["myProfile"] }); },
  });
}

// ─── Care Group Posts ───────────────────────────────────────
export function useCareGroupPosts(groupId: string | null, type?: string | undefined) {
  // One shared query per group (all types), filtered locally per caller.
  // Prevents the same relation + CCT round-trip firing once per post type.
  return withIdleAwareLoading(useQuery({
    queryKey: ["careGroupPosts", groupId],
    queryFn: async () => {
      const posts = await fetchCareGroupPostsWordPress(groupId!);
      return await filterVisiblePosts(posts);
    },
    enabled: !!groupId,
    select: (posts: any[]) => (type ? posts.filter((p) => p?.type === type) : posts),
  }));
}


export function useCreateGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: { group_id: string; content: string; type?: string | undefined; title?: string | undefined; scheduled_at?: string | null | undefined; subgroupIds?: number[] | undefined; visibilityUserIds?: number[] | undefined; hiddenSubgroupIds?: number[] | undefined; hiddenUserIds?: number[] | undefined }) => {
      const { subgroupIds, visibilityUserIds, hiddenSubgroupIds, hiddenUserIds, ...payload } = post;
      const newId = await createGroupPostWordPress(payload);
      const hasVisibility =
        (subgroupIds?.length ?? 0) > 0 || (visibilityUserIds?.length ?? 0) > 0 ||
        (hiddenSubgroupIds?.length ?? 0) > 0 || (hiddenUserIds?.length ?? 0) > 0;
      if (newId && hasVisibility) {
        await setPostVisibility(newId, subgroupIds || [], visibilityUserIds || [], hiddenSubgroupIds || [], hiddenUserIds || []);
      }
      return newId;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupPosts"] }); },
  });
}

export function useUpdateGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, subgroupIds, visibilityUserIds, hiddenSubgroupIds, hiddenUserIds, ...updates }: { id: string; content?: string | undefined; title?: string | undefined; is_pinned?: boolean | undefined; scheduled_at?: string | null | undefined; subgroupIds?: number[] | undefined; visibilityUserIds?: number[] | undefined; hiddenSubgroupIds?: number[] | undefined; hiddenUserIds?: number[] | undefined }) => {
      await updateGroupPostWordPress(id, updates);
      if (subgroupIds || visibilityUserIds || hiddenSubgroupIds || hiddenUserIds) {
        await setPostVisibility(id, subgroupIds || [], visibilityUserIds || [], hiddenSubgroupIds || [], hiddenUserIds || []);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupPosts"] }); },
  });
}

export function useDeleteGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGroupPostWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupPosts"] }); },
  });
}

// ─── Group Settings (update & delete) ───────────────────────
export function useUpdateCareGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; name?: string | undefined; description?: string | undefined; is_private?: boolean | undefined; join_code?: string | undefined; is_active?: boolean | undefined }) => updateCareGroupWordPress(id, updates),
    // Patch the cached list first so a rename shows instantly, then refetch.
    onSuccess: (_d, vars: any) => {
      qc.setQueryData(["careGroups"], (prev: any) =>
        Array.isArray(prev)
          ? prev.map((g: any) => (String(g.id) === String(vars.id)
              ? {
                  ...g,
                  ...(vars.name !== undefined ? { name: vars.name } : {}),
                  ...(vars.description !== undefined ? { description: vars.description } : {}),
                  ...(vars.is_private !== undefined ? { is_private: vars.is_private, group_type: vars.is_private ? "private" : "public" } : {}),
                }
              : g))
          : prev);
      qc.invalidateQueries({ queryKey: ["careGroups"] });
    },
  });
}

export function useDeleteCareGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCareGroupWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroups"] }); },
  });
}

// ─── Join by Token ──────────────────────────────────────────
export function useJoinGroupByCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: string | { token: string; displayName?: string | undefined }) =>
      typeof input === "string"
        ? joinGroupByCodeWordPress(input)
        : joinGroupByCodeWordPress(input.token, input.displayName),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroups"] }); },
  });
}

// ─── Group Invites (CCT 160 + Rel 161) ──────────────────────
export function useGroupInvites(groupId: string | null) {
  return useQuery({
    queryKey: ["groupInvites", groupId],
    queryFn: () => fetchGroupInvitesWordPress(groupId!),
    enabled: !!groupId,
  });
}

export function useCreateGroupInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { groupId: string; name: string; note?: string | undefined; expiresAt?: string | null | undefined; maxUses?: number | undefined; token?: string | undefined; invitedAs?: InvitedAs | undefined; source?: "custom" | "app native generated" | undefined }) =>
      createGroupInviteWordPress(input),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ["groupInvites", vars.groupId] }); },
  });
}

export function useUpdateGroupInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; groupId?: string | undefined; name?: string | undefined; note?: string | undefined; token?: string | undefined; expiresAt?: string | null | undefined; maxUses?: number | undefined; isRevoked?: boolean | undefined; invitedAs?: InvitedAs | undefined }) =>
      updateGroupInviteWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groupInvites"] }); },
  });
}

export function useDeleteGroupInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; groupId?: string | undefined }) => deleteGroupInviteWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groupInvites"] }); },
  });
}

// ─── Pending Invitations ────────────────────────────────────
export function useGroupInvitations(groupId: string | null) {
  return useQuery({
    queryKey: ["groupInvitations", groupId],
    queryFn: () => fetchGroupInvitationsWordPress(groupId!),
    enabled: !!groupId,
  });
}

export function useCancelInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => cancelInvitationWordPress(invitationId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groupInvitations"] }); },
  });
}

// ─── Search Profiles ────────────────────────────────────────
export function useSearchProfiles(query: string) {
  return useQuery({
    queryKey: ["searchProfiles", query],
    queryFn: () => searchProfilesWordPress(query),
    enabled: query.length >= 2,
  });
}

// ─── Add Cared One to Group ─────────────────────────────────
export function useAddCaredOneToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, caredOneId }: { groupId: string; caredOneId: string }) => addCaredOneToGroupWordPress(groupId, caredOneId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["careGroupMembers", vars.groupId] });
      qc.invalidateQueries({ queryKey: ["groupCaredOnes", vars.groupId] });
    },
  });
}

// ─── Create Personal Cared One (user_cared_one) ─────────────
export function useCreateUserCaredOne() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (caredOne: { caredOneId: string }) => createUserCaredOneWordPress(caredOne),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["userCaredOnes"] }); },
  });
}

// ─── My Pending Group Invitations ───────────────────────────
export function useMyPendingInvitations() {
  return useQuery({
    queryKey: ["myPendingInvitations"],
    queryFn: () => fetchMyPendingInvitationsWordPress(),
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: string | { id: string; displayName?: string | undefined }) =>
      typeof input === "string" ? acceptInvitationWordPress(input) : acceptInvitationWordPress(input.id, input.displayName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPendingInvitations"] });
      qc.invalidateQueries({ queryKey: ["careGroups"] });
      qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
      qc.invalidateQueries({ queryKey: ["groupLinkState"] });
    },
  });
}

export function useDeclineInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => declineInvitationWordPress(invitationId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["myPendingInvitations"] }); qc.invalidateQueries({ queryKey: ["groupLinkState"] }); },
  });
}

// ─── Member Categories ──────────────────────────────────────
export function useMemberCategories(groupId: string | null) {
  return useQuery({
    queryKey: ["memberCategories", groupId],
    queryFn: () => fetchMemberCategoriesWordPress(groupId!),
    enabled: !!groupId,
  });
}

export function useCreateMemberCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, name, color, description }: { groupId: string; name: string; color?: string | undefined; description?: string | undefined }) => createMemberCategoryWordPress(groupId, name, color, description),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memberCategories"] }); },
  });
}

export function useUpdateMemberCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, ...updates }: { categoryId: string; name?: string | undefined; description?: string | undefined; color?: string | undefined }) =>
      updateMemberCategoryWordPress(categoryId, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memberCategories"] }); },
  });
}

export function useDeleteMemberCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deleteMemberCategoryWordPress(categoryId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memberCategories"] }); },
  });
}

// ─── Sub-group Members (REL 75) ─────────────────────────────
export function useSubgroupMembers(subgroupId: string | null) {
  return useQuery({
    queryKey: ["subgroupMembers", subgroupId],
    queryFn: () => fetchSubgroupMembersWordPress(subgroupId!),
    enabled: !!subgroupId,
  });
}

export function useAddMemberToSubgroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subgroupId, userId, types }: { subgroupId: string; userId: string | number; types?: string[] | undefined }) =>
      addMemberToSubgroupWordPress(subgroupId, userId, { types }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["subgroupMembers"] });
      qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
      qc.invalidateQueries({ queryKey: ["subgroupPending"] });
      qc.invalidateQueries({ queryKey: ["mySubgroupPending"] });
      qc.invalidateQueries({ queryKey: ["careGroupPosts"] });
      qc.invalidateQueries({ queryKey: ["careTasks"] });
      // Tell the person they are in — this message was written but never sent.
      void notifySubgroupApproved(vars.userId, vars.subgroupId);
    },
  });
}

export function useRemoveMemberFromSubgroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subgroupId, userId }: { subgroupId: string; userId: string | number }) => removeMemberFromSubgroupWordPress(subgroupId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subgroupMembers"] });
      qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
      qc.invalidateQueries({ queryKey: ["subgroupPending"] });
      qc.invalidateQueries({ queryKey: ["mySubgroupPending"] });
      qc.invalidateQueries({ queryKey: ["careGroupPosts"] });
      qc.invalidateQueries({ queryKey: ["careTasks"] });
    },
  });
}

// Full member records (including pending) — admin views
export function useSubgroupMemberRecords(subgroupId: string | null) {
  return useQuery({
    queryKey: ["subgroupMemberRecords", subgroupId],
    queryFn: () => fetchSubgroupMemberRecordsWordPress(subgroupId!),
    enabled: !!subgroupId,
  });
}

/** Preview an invite link before joining: which group, invited as what. */
export function useGroupInvitePreview(token: string | null) {
  return useQuery({
    queryKey: ["groupInvitePreview", token],
    queryFn: () => previewGroupInviteWordPress(token!),
    enabled: !!token,
    retry: false,
  });
}

/** One code box: accepts an invite-link code or a group's own join code. */
export function useJoinGroupByAnyCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, displayName }: { code: string; displayName?: string | undefined }) =>
      joinGroupByAnyCodeWordPress(code, displayName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["careGroups"] });
      qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
    },
  });
}

/** Join a care group with its join code (CCT 199 a58). */
export function useJoinGroupByJoinCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, code, displayName }: { groupId: string; code: string; displayName?: string | undefined }) =>
      joinGroupByJoinCodeWordPress(groupId, code, displayName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["careGroups"] });
      qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
      qc.invalidateQueries({ queryKey: ["groupLinkState"] });
    },
  });
}

/** The one group page (/group/<id>): the group plus the viewer's place in it. */
export function useGroupLinkState(groupId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["groupLinkState", groupId],
    queryFn: () => fetchGroupLinkStateWordPress(groupId!),
    enabled: !!groupId && enabled,
    retry: false,
  });
}

export function useRequestToJoinGroup() {
  return useMutation({ mutationFn: (groupId: string) => requestToJoinGroupWordPress(groupId) });
}

export function useJoinRequester(groupId: string | null, requesterId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["joinRequester", groupId, requesterId],
    queryFn: () => fetchJoinRequesterWordPress(groupId!, requesterId!),
    enabled: !!groupId && !!requesterId && enabled,
    retry: false,
  });
}

export function useAnswerJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, requesterId, approve }: { groupId: string; requesterId: string; approve: boolean }) =>
      answerJoinRequestWordPress(groupId, requesterId, approve),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["joinRequester"] });
      qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
    },
  });
}

export function useUpdateSubgroupMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subgroupId, userId, role }: { subgroupId: string; userId: string | number; role: "owner" | "admin" | "nothing special" }) =>
      updateSubgroupMemberRoleWordPress(subgroupId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
      qc.invalidateQueries({ queryKey: ["subgroupMembers"] });
    },
  });
}

// ─── Shared Posts (SupaPress community usage) ──────────────
export function usePost(id: string | null, postType?: string | undefined) {
  return useQuery({
    queryKey: ["post", id, postType],
    queryFn: () => fetchPostByIdWordPress(id!, postType),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: { title: string; content?: string | undefined; post_type?: string | undefined; postType?: string | undefined; status?: string | undefined; area?: string | undefined; language?: string | undefined }) => createPostWordPress(post),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; title?: string | undefined; content?: string | undefined; status?: string | undefined }) => updatePostWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); qc.invalidateQueries({ queryKey: ["post"] }); },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePostWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); },
  });
}

// ─── Location Shares (scoped to care circle members) ────────
export function useLocationShares(refetchIntervalMs = 15000, scope: "cared-ones" | "group" = "cared-ones") {
  return useQuery({
    queryKey: ["locationShares", scope],
    queryFn: () => fetchLocationSharesWordPress(scope),
    enabled: hasWPSession(),
    refetchInterval: refetchIntervalMs,
    refetchIntervalInBackground: false,
  });
}

// ─── Service Categories ─────────────────────────────────────
export function useServiceCategories() {
  return useQuery({
    queryKey: ["serviceCategories"],
    queryFn: () => fetchCategoriesWordPress("product_cat"),
  });
}

// ─── Cared Ones (user_cared_one junction) ───────────────────
// ─── Group Cared Ones (members with is_cared_one = true) ────
export function useGroupCaredOnes(groupId: string | null) {
  return useQuery({
    queryKey: ["groupCaredOnes", groupId],
    queryFn: () => fetchGroupCaredOnesWordPress(groupId!),
    enabled: !!groupId,
  });
}

// ─── Check-Ins (schedule) ────────────────────────────────────
export function useCheckinLogs(caredOneId: string | null) {
  return useQuery({
    queryKey: ["checkinLogs", caredOneId],
    queryFn: () => fetchCheckinLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checkin: Parameters<typeof createCheckinWordPress>[0]) => createCheckinWordPress(checkin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkins"] });
      qc.invalidateQueries({ queryKey: ["checkinLogs"] });
      qc.invalidateQueries({ queryKey: ["todayCheckinLogs"] });
    },
  });
}

export function useLogCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: Parameters<typeof logCheckinWordPress>[0]) => logCheckinWordPress(log),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkinLogs"] });
      qc.invalidateQueries({ queryKey: ["todayCheckinLogs"] });
    },
  });
}

export function useCreateCheckinLog() {
  return useCreateCheckin();
}

export function useUpdateCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateCheckinWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["checkins"] }); },
  });
}

export function useDeleteCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCheckinWordPress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkins"] });
      qc.invalidateQueries({ queryKey: ["checkinLogs"] });
      qc.invalidateQueries({ queryKey: ["todayCheckinLogs"] });
    },
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (med: Parameters<typeof createMedicineWordPress>[0]) => createMedicineWordPress(med),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicines"] }); },
  });
}

export function useDeleteMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMedicineWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicines"] }); },
  });
}

export function useMedicineLogs(medicineId: string | null) {
  return useQuery({
    queryKey: ["medicineLogs", medicineId],
    queryFn: () => fetchMedicineLogsWordPress(medicineId!),
    enabled: !!medicineId,
  });
}

export function useAllMedicineLogs(caredOneId: string | null) {
  return useQuery({
    queryKey: ["allMedicineLogs", caredOneId],
    queryFn: () => fetchAllMedicineLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useLogMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: Parameters<typeof logMedicineWordPress>[0]) => logMedicineWordPress(log),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicineLogs"] }); qc.invalidateQueries({ queryKey: ["todayMedicineLogs"] }); qc.invalidateQueries({ queryKey: ["allMedicineLogs"] }); },
  });
}

export function useUpdateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateMedicineWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicines"] }); },
  });
}

export function useCareTips(caredOneId: string | null) {
  return useQuery({
    queryKey: ["careTips", caredOneId],
    queryFn: () => fetchCareTipsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateCareTip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tip: { user_id: string; title?: string | undefined; content: string; category?: string | undefined }) => createCareTipWordPress(tip),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careTips"] }); },
  });
}

export function useUpdateCareTip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateCareTipWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careTips"] }); },
  });
}

export function useDeleteCareTip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCareTipWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careTips"] }); },
  });
}

export function useCarePlans(caredOneId: string | null) {
  return useQuery({
    queryKey: ["carePlans", caredOneId],
    queryFn: () => fetchCarePlansWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateCarePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: { user_id: string; title: string; description?: string | undefined }) => createCarePlanWordPress(plan),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carePlans"] }); },
  });
}

export function useUpdateCarePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateCarePlanWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carePlans"] }); },
  });
}

export function useDeleteCarePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCarePlanWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carePlans"] }); },
  });
}

export function useCareNotes(caredOneId: string | null) {
  return useQuery({
    queryKey: ["careNotes", caredOneId],
    queryFn: () => fetchCareNotesWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateCareNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: { user_id: string; title?: string | undefined; content: string }) => createCareNoteWordPress(note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careNotes"] }); },
  });
}

export function useUpdateCareNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateCareNoteWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careNotes"] }); },
  });
}

export function useDeleteCareNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCareNoteWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careNotes"] }); },
  });
}

export function useEmergencyContacts(caredOneId: string | null) {
  return useQuery({
    queryKey: ["emergencyContacts", caredOneId],
    queryFn: () => fetchEmergencyContactsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contact: { user_id: string; name: string; phone?: string | undefined; email?: string | undefined; relationship?: string | undefined; content?: string | undefined; address?: string | undefined; note?: string | undefined }) => createEmergencyContactWordPress(contact),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["emergencyContacts"] }); },
  });
}

export function useUpdateEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateEmergencyContactWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["emergencyContacts"] }); },
  });
}

export function useDeleteEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmergencyContactWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["emergencyContacts"] }); },
  });
}

export function useSafeZones(caredOneId: string | null) {
  return useQuery({
    queryKey: ["safeZones", caredOneId],
    queryFn: () => fetchSafeZonesWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateSafeZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (zone: { user_id: string; zone_type: string; latitude: number; longitude: number; radius_meters?: number | undefined; [key: string]: any }) => createSafeZoneWordPress(zone),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safeZones"] }); },
  });
}

export function useUpdateSafeZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateSafeZoneWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safeZones"] }); },
  });
}

export function useDeleteSafeZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSafeZoneWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safeZones"] }); },
  });
}

export function useCaredOneDocuments(caredOneId: string | null) {
  return useQuery({
    queryKey: ["caredOneDocuments", caredOneId],
    queryFn: () => fetchCaredOneDocumentsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateCaredOneDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (doc: { user_id: string; title: string; description?: string | undefined; attachment_ids?: Array<number | string> | undefined }) => createCaredOneDocumentWordPress(doc),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["caredOneDocuments"] }); },
  });
}

export function useUpdateCaredOneDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateCaredOneDocumentWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["caredOneDocuments"] }); },
  });
}

export function useDeleteCaredOneDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCaredOneDocumentWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["caredOneDocuments"] }); },
  });
}

// ─── Dementia Stage ─────────────────────────────────────────
export function useComments(relationId: number, parentId: string | null) {
  return useQuery({
    queryKey: ["comments", relationId, parentId],
    queryFn: () => fetchCommentsWordPress(relationId, parentId!),
    enabled: !!parentId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ relationId, parentId, content, replyToCommentId }: { relationId: number; parentId: string; content: string; replyToCommentId?: string | undefined }) =>
      createCommentWordPress({ relationId, parentId, content, replyToCommentId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["comments"] }); },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateCommentWordPress(id, content),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["comments"] }); },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCommentWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["comments"] }); },
  });
}

// ─── Votes (CCT 30 via REL 166 post→vote / REL 167 comment→vote) ──
export function useVoteSummary(relationId: number, parentIds: string[]) {
  return useQuery({
    queryKey: ["voteSummary", relationId, parentIds],
    queryFn: () => fetchVoteSummaries(relationId, parentIds),
    enabled: parentIds.length > 0,
  });
}

export function useVoteCount(relationId: number, parentId: string | null) {
  return useQuery({
    queryKey: ["voteSummary", relationId, [parentId]],
    queryFn: () => fetchVoteSummary(relationId, parentId!),
    enabled: !!parentId,
  });
}

export function useToggleVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ relationId, parentId, value }: { relationId: number; parentId: string; value: -1 | 1 }) => toggleVote(relationId, parentId, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["voteSummary"] }); },
  });
}

// ─── Dashboard Stats ─────────────────────────────────────────
// ─── Task / Cared-One / Booking mutations ────────────────────
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCareTaskWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["care-tasks"] }); },
  });
}

export function useDeleteUserCaredOne() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUserCaredOneWordPress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userCaredOnes"] });
      qc.invalidateQueries({ queryKey: ["groupCaredOnes"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBookingStatusWordPress(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["providerBookings"] });
    },
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const profile = await fetchMyProfileWordPress();
      const userId = profile?.id;
      if (!userId) throw new Error("Not logged in");
      return leaveGroupWordPress(groupId, userId);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroups"] }); qc.invalidateQueries({ queryKey: ["careGroupMembers"] }); },
  });
}

// ─── Provider Availability (JetEngine CCT 187 user's calendar event) ───────
export function useProviderAvailability(providerId: string | null) {
  return useQuery({
    queryKey: ["providerAvailability", providerId],
    queryFn: async () => {
      const { getProviderCalendarAvailability } = await import("@/features/calendar/booking-availability");
      return getProviderCalendarAvailability(providerId!);
    },
    enabled: !!providerId,
  });
}

export function useUpsertProviderAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { providerId: string; slots: any[] }) => {
      // One write path: the "set-provider-availability" skill.
      const { runSettingSkill } = await import("@/lib/ai-dynamic-knowledge");
      return runSettingSkill("set-provider-availability", { providerId: data.providerId, slots: data.slots });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["providerAvailability"] }); },
  });
}

// useProviderPayouts removed — platform does not process payments.


// ─── Shared care tasks (the task IS the job) ─────────────────
type SharedHelpTaskRows = Awaited<
  ReturnType<typeof fetchHelpTaskRowsWordPress>
>;

export function useHelpTasks(filters?: {
  paid?: boolean | undefined;
  status?: "open" | "filled" | undefined;
}) {
  const appId = currentAppId();
  const cacheKey = `tasksNeedingHelp:${appId}:${filters?.paid ?? "all"}:${filters?.status ?? "all"}`;
  return useQuery({
    queryKey: ["tasksNeedingHelp", appId, filters],
    queryFn: withLastGood(cacheKey, () => fetchHelpTaskRowsWordPress(filters)),
    initialData: () => readLastGood<SharedHelpTaskRows>(cacheKey),
    initialDataUpdatedAt: 0,
    refetchOnMount: "always",
  });
}

export function useHelpTaskPosters(tasks: Array<{ posted_by?: unknown }> = []) {
  const appId = currentAppId();
  const ids = Array.from(
    new Set(
      tasks
        .map((task) => Number(String(task.posted_by ?? "").replace(/^wp-/, "")))
        .filter((id) => Number.isFinite(id) && id > 0),
    ),
  ).sort((a, b) => a - b);
  return useQuery({
    queryKey: ["helpTaskPosters", appId, ids],
    queryFn: () => fetchHelpTaskPostersWordPress(ids),
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMyHelpTasks(enabled = true) {
  const userId = getStoredWPUser()?.user_id ?? null;
  return useQuery({
    queryKey: ["myHelpTasks", currentAppId(), userId],
    queryFn: () => fetchMyHelpTasksWordPress(),
    enabled: enabled && !!userId,
  });
}

export function useMyTaskApplications() {
  const userId = getStoredWPUser()?.user_id ?? null;
  return useQuery({
    queryKey: ["myTaskApplications", currentAppId(), userId],
    queryFn: () => fetchMyTaskApplicationsWordPress(),
    enabled: !!userId,
  });
}

export function useTaskApplicants(taskId: string | null) {
  const appId = currentAppId();
  return useQuery({
    queryKey: ["taskApplicants", appId, taskId],
    queryFn: () => fetchTaskApplicantsWordPress(taskId!),
    enabled: !!taskId,
  });
}

export function useApplyToSharedTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, message }: { taskId: string; message?: string | undefined }) => applyToSharedTaskWordPress(taskId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasksNeedingHelp"] });
      qc.invalidateQueries({ queryKey: ["myTaskApplications"] });
      qc.invalidateQueries({ queryKey: ["taskApplicants"] });
    },
  });
}

export function useDecideTaskApplicant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "accepted" | "rejected" }) => decideTaskApplicantWordPress(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["taskApplicants"] });
      qc.invalidateQueries({ queryKey: ["tasksNeedingHelp"] });
      qc.invalidateQueries({ queryKey: ["myHelpTasks"] });
    },
  });
}

export function useShareTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, needs_payment, price }: { taskId: string; needs_payment?: boolean | undefined; price?: string | undefined }) =>
      shareTaskWordPress(taskId, { needs_payment, price }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasksNeedingHelp"] });
      qc.invalidateQueries({ queryKey: ["myHelpTasks"] });
      qc.invalidateQueries({ queryKey: ["careTasks"] });
    },
  });
}

export function useUnshareTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => unshareTaskWordPress(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasksNeedingHelp"] });
      qc.invalidateQueries({ queryKey: ["myHelpTasks"] });
      qc.invalidateQueries({ queryKey: ["careTasks"] });
    },
  });
}

// ─── Location: cared-one location, history, settings, sharing ─
export function useCaredOneLocationHistory(caredOneId: string | null) {
  return useQuery({
    queryKey: ["caredOneLocationHistory", caredOneId],
    queryFn: () => fetchCaredOneLocationHistoryWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCaredOneLocationSettings(caredOneId: string | null) {
  return useQuery({
    queryKey: ["caredOneLocationSettings", caredOneId],
    queryFn: () => fetchCaredOneLocationSettingsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useShareMyLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { latitude: number; longitude: number; accuracy?: number | null | undefined; batteryLevel?: number | null | undefined; addressText?: string | null | undefined; isEmergency?: boolean | undefined; enabled?: boolean | undefined }) =>
      shareMyLocationWordPress(data.latitude, data.longitude, { accuracy: data.accuracy, batteryLevel: data.batteryLevel, addressText: data.addressText, isEmergency: data.isEmergency, enabled: data.enabled }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["caredOneLocation"] }); qc.invalidateQueries({ queryKey: ["locationHistory"] }); },
  });
}

export function useDisableMyLocationSharing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => disableMyLocationSharingWordPress(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["caredOneLocation"] }); qc.invalidateQueries({ queryKey: ["caredOneLocationSettings"] }); },
  });
}

export function useSafeZoneAlerts(caredOneId: string | null) {
  return useQuery({
    queryKey: ["safeZoneAlerts", caredOneId],
    queryFn: () => fetchSafeZoneAlertsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => acknowledgeAlertWordPress(alertId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safeZoneAlerts"] }); },
  });
}

export function useAcknowledgeAllAlerts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (caredOneId: string) => acknowledgeAllAlertsWordPress(caredOneId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["safeZoneAlerts"] }); },
  });
}

export function useLocationRequests(caredOneId: string | null) {
  return useQuery({
    queryKey: ["locationRequests", caredOneId],
    queryFn: () => fetchLocationRequestsWordPress(caredOneId!),
    enabled: !!caredOneId,
    refetchInterval: 30_000,
  });
}

export function useSendLocationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: string | { caredOneId: string; message?: string | undefined; isEmergency?: boolean | undefined }) => {
      const normalized = typeof input === "string" ? { caredOneId: input } : input;
      return sendLocationRequestWordPress(normalized);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["locationRequests"] }); },
  });
}

export function useCancelLocationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { requestId: string; caredOneId: string }) => cancelLocationRequestWordPress(input.requestId, input.caredOneId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["locationRequests"] }); },
  });
}

export function useLocationSharingFlags(userId: string | null) {
  return useQuery({
    queryKey: [
      "locationSharingFlags",
      Number(String(userId || "").replace(/^wp-/, "")) || null,
    ],
    queryFn: async () => (await import("@/features/location/sharing-flags")).fetchLocationSharingFlags(userId!),
    enabled: !!userId,
    refetchInterval: 60_000,
  });
}

export function useSetLocationSharingFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: string; shareOn?: boolean | undefined; emergencyAllowed?: boolean | undefined }) =>
      (await import("@/features/location/sharing-flags")).setLocationSharingFlags(input.userId, { shareOn: input.shareOn, emergencyAllowed: input.emergencyAllowed }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["locationSharingFlags"] }); },
  });
}

export function useEnableEmergencyLocationPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (caredOneId: string) => enableEmergencyLocationPermissionWordPress(caredOneId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["locationSharingFlags"] }); },
  });
}

export function useRespondToLocationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: respondToLocationRequestWordPress,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["caredOneLocation"] }); qc.invalidateQueries({ queryKey: ["locationSharingFlags"] }); },
  });
}

// ─── Information Cards (Cared one's information card CCT) ───
export function useInformationCards(caredOneId: string | null) {
  return useQuery({
    queryKey: ["informationCards", caredOneId],
    queryFn: () => fetchInformationCardsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useInformationCard(cardId: string | null) {
  return useQuery({
    queryKey: ["informationCard", cardId],
    queryFn: () => fetchInformationCardWordPress(cardId!),
    enabled: !!cardId,
  });
}

export function useCreateInformationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createInformationCardWordPress>[0]) => createInformationCardWordPress(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["informationCards"] }); },
  });
}

export function useUpdateInformationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [k: string]: any }) => updateInformationCardWordPress(id, updates),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["informationCards"] });
      qc.invalidateQueries({ queryKey: ["informationCard", vars.id] });
      qc.invalidateQueries({ queryKey: ["sharedInformationCard", vars.id] });
    },
  });
}

export function useDeleteInformationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInformationCardWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["informationCards"] }); },
  });
}

export function useInformationCardContactIds(cardId: string | null) {
  return useQuery({
    queryKey: ["informationCardContacts", cardId],
    queryFn: () => fetchInformationCardContactIdsWordPress(cardId!),
    enabled: !!cardId,
  });
}

export function useSetInformationCardContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, contactIds }: { cardId: string; contactIds: string[] }) =>
      setInformationCardContactsWordPress(cardId, contactIds),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ["informationCardContacts", vars.cardId] }); },
  });
}

export function useSharedInformationCard(cardId: string | null) {
  return useQuery({
    queryKey: ["sharedInformationCard", cardId],
    queryFn: () => cardId ? fetchSharedInformationCardWordPress(cardId) : Promise.resolve(null),
    enabled: !!cardId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: 30000,
    retry: false,
  });
}

// ─── Visit Log (completed care tasks of type "Visits", CCT 204) ───
export function useVisitLog(caredOneId: string | null) {
  return useQuery({
    queryKey: ["visitLog", caredOneId],
    queryFn: () => fetchVisitLogWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateVisitLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visit: { user_id: string; description?: string | undefined }) => createVisitLogWordPress(visit),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitLog"] }); qc.invalidateQueries({ queryKey: ["careTasks"] }); },
  });
}

export function useDeleteVisitLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVisitLogWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitLog"] }); qc.invalidateQueries({ queryKey: ["careTasks"] }); },
  });
}
