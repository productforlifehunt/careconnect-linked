import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoredWPUser } from "@/services/wp-auth";
// ─── Feature source modules (backend-specific) ─────────────
import { fetchProvidersWordPress, fetchProviderByIdWordPress } from "@/features/providers/source.wordpress";
import { fetchBookingsWordPress, fetchProviderBookingsWordPress, createBookingWordPress, updateBookingStatusWordPress } from "@/features/bookings/source.wordpress";
import { fetchCareGroupsWordPress, fetchCareGroupMembersWordPress, createCareGroupWordPress } from "@/features/care-groups/source.wordpress";
import { fetchUserCaredOnesWordPress } from "@/features/cared-ones/source.wordpress";
import { fetchMyProfileWordPress, updateProfileWordPress } from "@/features/profile/source.wordpress";
import { fetchDashboardStatsWordPress } from "@/features/dashboard/source.wordpress";
import { fetchNotificationsWordPress, markNotificationReadWordPress, markAllNotificationsReadWordPress } from "@/features/notifications/source.wordpress";
import { fetchCareFacilitiesWordPress, fetchCareFacilityByIdWordPress } from "@/features/facilities/source.wordpress";
import {
  createCareFacilityWordPress, updateCareFacilityWordPress,
  fetchFacilityMembersWordPress, fetchFacilityOwnershipClaimsWordPress,
  claimFacilityOwnershipWordPress, fetchFacilityOwnershipDisputesWordPress,
  createFacilityOwnershipDisputeWordPress, getMyFacilityPermissionWordPress,
  fetchFacilityReviewSummariesWordPress,
} from "@/features/facilities/source.wordpress-extended";
import {
  fetchCareGroupPostsWordPress, createGroupPostWordPress, updateGroupPostWordPress, deleteGroupPostWordPress,
  updateCareGroupWordPress, deleteCareGroupWordPress,
  inviteToGroupWordPress, fetchGroupInvitationsWordPress, cancelInvitationWordPress,
  fetchMyPendingInvitationsWordPress, acceptInvitationWordPress, declineInvitationWordPress,
  updateMemberRoleWordPress, removeGroupMemberWordPress,
  joinGroupByCodeWordPress, fetchCareGroupGalleryWordPress,
  fetchMemberCategoriesWordPress, createMemberCategoryWordPress, deleteMemberCategoryWordPress,
  fetchSubgroupMembersWordPress, fetchSubgroupMemberRecordsWordPress,
  addMemberToSubgroupWordPress, removeMemberFromSubgroupWordPress,
  requestJoinSubgroupWordPress, approveSubgroupMemberWordPress, declineSubgroupMemberWordPress,
  updateSubgroupMemberRoleWordPress,
  fetchSubgroupPendingRequestsWordPress, fetchMyPendingSubgroupRequestsWordPress,
  searchProfilesWordPress, addCaredOneToGroupWordPress, leaveGroupWordPress,
  fetchGroupInvitesWordPress, createGroupInviteWordPress, updateGroupInviteWordPress, deleteGroupInviteWordPress,
} from "@/features/care-groups/source.wordpress-extended";
import { setPostVisibility, setTaskVisibility, filterVisiblePosts, filterVisibleTasks } from "@/features/care-groups/visibility";
import {
  fetchSafeZonesWordPress, createSafeZoneWordPress, updateSafeZoneWordPress, deleteSafeZoneWordPress,
  fetchSafeZoneAlertsWordPress, acknowledgeAlertWordPress, acknowledgeAllAlertsWordPress,
  fetchCaredOneLocationWordPress, fetchCaredOneLocationHistoryWordPress,
  shareMyLocationWordPress, disableMyLocationSharingWordPress,
  fetchLocationRequestsWordPress, sendLocationRequestWordPress, cancelLocationRequestWordPress,
  fetchCaredOneLocationSettingsWordPress,
} from "@/features/location/source.wordpress-extended";
import {
  fetchJobPostingsWordPress, createJobPostingWordPress, fetchJobApplicationsWordPress,
  applyToJobWordPress, fetchMyJobPostingsWordPress, fetchMyJobApplicationsWordPress,
  updateJobApplicationWordPress,
} from "@/features/jobs/source.wordpress";
import {
  fetchPostsWordPress, fetchPostByIdWordPress, createPostWordPress, updatePostWordPress, deletePostWordPress,
} from "@/features/posts/source.wordpress";
import {
  fetchCommunityPostsWordPress, fetchCommunityPostByIdWordPress,
  createCommunityPostWordPress, updateCommunityPostWordPress, deleteCommunityPostWordPress,
  fetchPostCommentsWordPress, createPostCommentWordPress,
  fetchCommentRepliesWordPress, createCommentReplyWordPress,
  updateCommentCCTWordPress, deleteCommentCCTWordPress,
} from "@/features/community-posts/source.wordpress";
import { fetchCareTasksWordPress, createCareTaskWordPress, updateCareTaskWordPress, deleteCareTaskWordPress } from "@/features/care-tasks/source.wordpress";
import { fetchCategoriesWordPress } from "@/features/categories/source.wordpress";
import { fetchArticlesWordPress } from "@/features/articles/source.wordpress";
import { fetchEntityReviewsWordPress, createReviewWordPress } from "@/features/reviews/source.wordpress";
import { fetchConversationsWordPress, fetchDirectMessagesWordPress, sendMessageWordPress, markMessagesReadWordPress, startConversationWordPress, getOrCreateGroupConversationWordPress } from "@/features/conversations/source.wordpress";
import { fetchSavedProvidersWordPress, toggleSavedProviderWordPress } from "@/features/saved-providers/source.wordpress";
import { fetchCommentsWordPress, createCommentWordPress, updateCommentWordPress, deleteCommentWordPress } from "@/features/comments/source.wordpress";
import { fetchVotesWordPress, fetchEntityVoteWordPress, toggleVoteWordPress } from "@/features/votes/source.wordpress";
import { fetchLocationSharesWordPress } from "@/features/location/source.wordpress";
import { listWordPressFeature, createWordPressFeature } from "@/features/shared/wordpress-adapter";
import { getDokanVendorWithdrawals } from "@/services/woocommerce-api";
import {
  createUserCaredOneWordPress, deleteUserCaredOneWordPress, fetchGroupCaredOnesWordPress,
  fetchCheckinsWordPress, createCheckinWordPress, fetchCheckinLogsWordPress, fetchTodayCheckinLogsWordPress, logCheckinWordPress,
  fetchMedicinesWordPress, createMedicineWordPress, updateMedicineWordPress, deleteMedicineWordPress,
  fetchMedicineLogsWordPress, fetchTodayMedicineLogsWordPress, logMedicineWordPress,
  fetchHealthVitalsWordPress, createHealthVitalWordPress,
  fetchCareTipsWordPress, createCareTipWordPress, updateCareTipWordPress, deleteCareTipWordPress,
  fetchCarePlansWordPress, createCarePlanWordPress, updateCarePlanWordPress, deleteCarePlanWordPress,
  fetchCarePlanGoalsWordPress, createCarePlanGoalWordPress, updateCarePlanGoalWordPress,
  fetchCareNotesWordPress, createCareNoteWordPress, updateCareNoteWordPress, deleteCareNoteWordPress,
  fetchEmergencyContactsWordPress, createEmergencyContactWordPress, updateEmergencyContactWordPress, deleteEmergencyContactWordPress,
  fetchActivityLogWordPress, createActivityLogWordPress, deleteActivityLogWordPress,
  fetchCaredOneDocumentsWordPress, createCaredOneDocumentWordPress, updateCaredOneDocumentWordPress, deleteCaredOneDocumentWordPress,
  fetchSymptomLogsWordPress, createSymptomLogWordPress,
  updateDementiaStageWordPress,
} from "@/features/cared-ones/source.wordpress-extended";
import {
  fetchInformationCardsWordPress, fetchInformationCardWordPress,
  fetchInformationCardByShareTokenWordPress,
  createInformationCardWordPress, updateInformationCardWordPress, deleteInformationCardWordPress,
  fetchInformationCardContactIdsWordPress, setInformationCardContactsWordPress,
  enableInformationCardShareWordPress, revokeInformationCardShareWordPress,
} from "@/features/cared-ones/source.information-cards";
import type {
  Profile, Booking, Review, CareGroup, CareGroupMember,
  CareTask, Notification,
  SavedProvider, CareGroupPost, LocationShare, ServiceCategory, PostType,
  CategoryType, CategoryOption, EntityCategoryOption, CustomFieldType, EntityCustomFieldValue,
  Post, Comment, CareFacility, FacilityMember, FacilityMemberWithProfile, LocationRecord,
  FacilityOwnershipClaim, FacilityOwnershipDispute,
} from "@/types/care-connector";

// ─── Helpers ────────────────────────────────────────────────

export function usePostTypes(_level?: 1 | 2 | 3 | 4, _parentId?: string | null) {
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

export function useProviders(filters?: {
  query?: string;
  specialties?: string[];
  minRate?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
  minRating?: number;
  sortBy?: string;
  location?: string;
  serviceLocations?: string[];
  serviceTypeSlugs?: string[];
}) {
  return useQuery({
    queryKey: ["providers", filters],
    queryFn: () => fetchProvidersWordPress(filters),
  });
}

export function useProvider(id: string | undefined) {
  return useQuery({
    queryKey: ["provider", id],
    queryFn: () => fetchProviderByIdWordPress(id!),
    enabled: !!id,
  });
}

export function useCareFacilities(filters?: {
  query?: string;
  location?: string;
  minRating?: number;
  sortBy?: string;
  serviceTypes?: string[];
  facilityTypes?: string[];
  area?: "china" | "global";
}) {
  return useQuery({
    queryKey: ["facilities", filters],
    queryFn: async () => {
      const raw = await fetchCareFacilitiesWordPress();
      let results = dedupeFacilities(raw as unknown as CareFacility[]);
      if (filters?.query) {
        const q = filters.query.toLowerCase();
        results = results.filter((f) => f.name?.toLowerCase().includes(q) || (f as any).description?.toLowerCase().includes(q));
      }
      if (filters?.location) {
        const loc = filters.location.toLowerCase();
        results = results.filter((f) => (f as any).location?.toLowerCase().includes(loc) || (f as any).address?.toLowerCase().includes(loc));
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

export function useFacilityOwnershipClaims(facilityId: string | undefined) {
  return useQuery({
    queryKey: ["facilityOwnershipClaims", facilityId],
    queryFn: () => fetchFacilityOwnershipClaimsWordPress(facilityId!),
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
    mutationFn: (input: { title: string; content?: string; address?: string; location?: string; phone?: string; email?: string; website?: string }) => createCareFacilityWordPress(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["facilities"] }); },
  });
}

export function useClaimFacilityOwnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ facilityId, evidenceText }: { facilityId: string; evidenceText?: string }) => claimFacilityOwnershipWordPress(facilityId, evidenceText),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["facilityOwnershipClaims"] }); },
  });
}

export function useCreateFacilityOwnershipDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ facilityId, reason }: { facilityId: string; reason: string }) => createFacilityOwnershipDisputeWordPress(facilityId, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["facilityOwnershipDisputes"] }); },
  });
}

export function useFacilityOwnershipDisputes(facilityId: string | undefined) {
  return useQuery({
    queryKey: ["facilityOwnershipDisputes", facilityId],
    queryFn: () => fetchFacilityOwnershipDisputesWordPress(facilityId!),
    enabled: !!facilityId,
  });
}

export function useUpdateCareFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateCareFacilityWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["facilities"] }); qc.invalidateQueries({ queryKey: ["facility"] }); },
  });
}

export function useEntityReviews(entityId: string | undefined) {
  return useQuery({
    queryKey: ["entityReviews", entityId],
    queryFn: () => fetchEntityReviewsWordPress(entityId!),
    enabled: !!entityId,
  });
}

export function useProviderReviews(providerId: string | undefined) {
  return useEntityReviews(providerId);
}

export function useFacilityReviews(facilityId: string | undefined) {
  return useEntityReviews(facilityId);
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (review: { entity_id: string; entity_type: string; rating: number; comment?: string }) => createReviewWordPress(review),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["entityReviews"] }); },
  });
}

// ─── Bookings ───────────────────────────────────────────────
export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => fetchBookingsWordPress(),
  });
}

// Bookings where current user is the provider (incoming requests)
export function useProviderBookings() {
  return useQuery({
    queryKey: ["providerBookings"],
    queryFn: () => fetchProviderBookingsWordPress(),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (booking: Partial<Booking>) => createBookingWordPress(booking),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); },
  });
}

// ─── Messages ───────────────────────────────────────────────@@
export function useConversations() {
  const me = getStoredWPUser();
  const myId = me ? `wp-${me.user_id}` : "";
  return useQuery({
    queryKey: ["conversations", myId],
    queryFn: () => fetchConversationsWordPress(myId),
    enabled: !!myId,
  });
}

export function useDirectMessages(otherUserId: string | null) {
  return useQuery({
    queryKey: ["messages", otherUserId],
    queryFn: () => fetchDirectMessagesWordPress(otherUserId!),
    enabled: !!otherUserId,
  });
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
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input:
        | { conversationId: string; content: string; receiverUserId?: string }
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
export function useCareGroups() {
  return useQuery({
    queryKey: ["careGroups"],
    queryFn: () => fetchCareGroupsWordPress(),
  });
}

export function useCareGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: ["careGroupMembers", groupId],
    queryFn: () => fetchCareGroupMembersWordPress(groupId!),
    enabled: !!groupId,
  });
}

export function useCreateCareGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (group: { name: string; description?: string; is_private?: boolean }) => createCareGroupWordPress(group),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroups"] }); },
  });
}

export function useInviteToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId, email, role }: { groupId: string; userId?: string; email?: string; role?: string }) => inviteToGroupWordPress(groupId, userId || email || "", role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupMembers"] }); qc.invalidateQueries({ queryKey: ["groupInvitations"] }); },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, groupId, role, updates }: { memberId: string; groupId?: string; role?: string; updates?: Record<string, any> }) => updateMemberRoleWordPress(memberId, updates ?? role ?? {}, groupId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupMembers"] }); },
  });
}

export function useRemoveGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, groupId }: { memberId: string; groupId?: string }) => removeGroupMemberWordPress(memberId, groupId),
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
export function useCareTasks(groupId?: string | null) {
  return useQuery({
    queryKey: ["careTasks", groupId],
    queryFn: async () => {
      const tasks = await fetchCareTasksWordPress(groupId);
      return await filterVisibleTasks(tasks);
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: { group_id?: string; care_group_id?: string; title: string; description?: string; assigned_to?: string | string[]; due_date?: string; subgroupIds?: number[]; visibilityUserIds?: number[] }) => {
      const { subgroupIds, visibilityUserIds, ...payload } = task;
      const newId = await createCareTaskWordPress(payload);
      if (newId && ((subgroupIds?.length ?? 0) > 0 || (visibilityUserIds?.length ?? 0) > 0)) {
        await setTaskVisibility(newId, subgroupIds || [], visibilityUserIds || []);
      }
      return newId;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careTasks"] }); },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, updates }: { id: string; status?: string; updates?: Record<string, any> }) => updateCareTaskWordPress(id, updates ?? { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careTasks"] }); },
  });
}

// ─── Notifications ──────────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotificationsWordPress(),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationReadWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsReadWordPress(),
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
export function useMyProfile() {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: () => fetchMyProfileWordPress(),
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
        specialty: input.specialties || input.specialty || [],
        certifications: input.certifications || [],
        care_provider_starts_hourly_rate: input.hourlyRate || input.care_provider_starts_hourly_rate || 0,
        bio: input.bio || '',
        location: input.location || '',
        years_of_experience: input.yearsOfExperience || input.years_of_experience || 0,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["myProfile"] }); },
  });
}

// ─── Care Group Posts ───────────────────────────────────────
export function useCareGroupPosts(groupId: string | null, type?: string) {
  return useQuery({
    queryKey: ["careGroupPosts", groupId, type],
    queryFn: async () => {
      const posts = await fetchCareGroupPostsWordPress(groupId!, type);
      return await filterVisiblePosts(posts);
    },
    enabled: !!groupId,
  });
}

export function useCreateGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: { group_id: string; content: string; type?: string; title?: string; subgroupIds?: number[]; visibilityUserIds?: number[] }) => {
      const { subgroupIds, visibilityUserIds, ...payload } = post;
      const newId = await createGroupPostWordPress(payload);
      if (newId && ((subgroupIds?.length ?? 0) > 0 || (visibilityUserIds?.length ?? 0) > 0)) {
        await setPostVisibility(newId, subgroupIds || [], visibilityUserIds || []);
      }
      return newId;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroupPosts"] }); },
  });
}

export function useUpdateGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; content?: string; title?: string; is_pinned?: boolean }) => updateGroupPostWordPress(id, updates),
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
    mutationFn: ({ id, ...updates }: { id: string; name?: string; description?: string; is_private?: boolean }) => updateCareGroupWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careGroups"] }); },
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
    mutationFn: (token: string) => joinGroupByCodeWordPress(token),
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
    mutationFn: (input: { groupId: string; name: string; expiresAt?: string | null; maxUses?: number; token?: string }) =>
      createGroupInviteWordPress(input),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ["groupInvites", vars.groupId] }); },
  });
}

export function useUpdateGroupInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; groupId?: string; name?: string; token?: string; expiresAt?: string | null; maxUses?: number; isRevoked?: boolean }) =>
      updateGroupInviteWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groupInvites"] }); },
  });
}

export function useDeleteGroupInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; groupId?: string }) => deleteGroupInviteWordPress(id),
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
    mutationFn: (caredOne: { caredOneId: string; relationship?: string; isPrimary?: boolean }) => createUserCaredOneWordPress(caredOne),
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
    mutationFn: (invitationId: string) => acceptInvitationWordPress(invitationId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["myPendingInvitations"] }); qc.invalidateQueries({ queryKey: ["careGroups"] }); },
  });
}

export function useDeclineInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => declineInvitationWordPress(invitationId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["myPendingInvitations"] }); },
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
    mutationFn: ({ groupId, name, color, description }: { groupId: string; name: string; color?: string; description?: string }) => createMemberCategoryWordPress(groupId, name, color, description),
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
    mutationFn: ({ subgroupId, userId, status, types }: { subgroupId: string; userId: string | number; status?: "accepted" | "pending"; types?: string[] }) =>
      addMemberToSubgroupWordPress(subgroupId, userId, { status, types }),
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

export function useSubgroupPendingRequests(subgroupId: string | null) {
  return useQuery({
    queryKey: ["subgroupPending", subgroupId],
    queryFn: () => fetchSubgroupPendingRequestsWordPress(subgroupId!),
    enabled: !!subgroupId,
  });
}

export function useMyPendingSubgroupRequests() {
  return useQuery({
    queryKey: ["mySubgroupPending"],
    queryFn: () => fetchMyPendingSubgroupRequestsWordPress(),
  });
}

export function useRequestJoinSubgroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subgroupId }: { subgroupId: string }) => requestJoinSubgroupWordPress(subgroupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subgroupPending"] });
      qc.invalidateQueries({ queryKey: ["mySubgroupPending"] });
      qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
    },
  });
}

export function useApproveSubgroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subgroupId, userId }: { subgroupId: string; userId: string | number }) => approveSubgroupMemberWordPress(subgroupId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subgroupMembers"] });
      qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
      qc.invalidateQueries({ queryKey: ["subgroupPending"] });
      qc.invalidateQueries({ queryKey: ["mySubgroupPending"] });
    },
  });
}

export function useDeclineSubgroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subgroupId, userId }: { subgroupId: string; userId: string | number }) => declineSubgroupMemberWordPress(subgroupId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
      qc.invalidateQueries({ queryKey: ["subgroupPending"] });
      qc.invalidateQueries({ queryKey: ["mySubgroupPending"] });
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
export function usePosts(postType: string, area?: string, childPostType?: string | null) {
  return useQuery({
    queryKey: ["posts", postType, area, childPostType],
    queryFn: () => fetchPostsWordPress(postType, area, childPostType),
  });
}

export function usePost(id: string | null, postType?: string) {
  return useQuery({
    queryKey: ["post", id, postType],
    queryFn: () => fetchPostByIdWordPress(id!, postType),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: { title: string; content?: string; post_type?: string; postType?: string; status?: string; area?: string }) => createPostWordPress(post),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; title?: string; content?: string; status?: string }) => updatePostWordPress(id, updates),
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
export function useLocationShares(refetchIntervalMs = 15000) {
  return useQuery({
    queryKey: ["locationShares"],
    queryFn: () => fetchLocationSharesWordPress(),
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
export function useUserCaredOnes() {
  return useQuery({
    queryKey: ["userCaredOnes"],
    queryFn: () => fetchUserCaredOnesWordPress(),
  });
}

// ─── Group Cared Ones (members with is_cared_one = true) ────
export function useGroupCaredOnes(groupId: string | null) {
  return useQuery({
    queryKey: ["groupCaredOnes", groupId],
    queryFn: () => fetchGroupCaredOnesWordPress(groupId!),
    enabled: !!groupId,
  });
}

// ─── Check-Ins (schedule) ────────────────────────────────────
export function useCheckins(caredOneId: string | null) {
  return useQuery({
    queryKey: ["checkins", caredOneId],
    queryFn: () => fetchCheckinsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCheckinLogs(caredOneId: string | null) {
  return useQuery({
    queryKey: ["checkinLogs", caredOneId],
    queryFn: () => fetchCheckinLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useTodayCheckinLogs(caredOneId: string | null) {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ["todayCheckinLogs", caredOneId, today],
    queryFn: () => fetchTodayCheckinLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checkin: { user_id: string; name: string; frequency?: string; time_slot?: string[]; note?: string }) => createCheckinWordPress(checkin),
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
    mutationFn: (log: { medicine_id: string; status?: string; note?: string }) => logCheckinWordPress(log),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkinLogs"] });
      qc.invalidateQueries({ queryKey: ["todayCheckinLogs"] });
    },
  });
}

export function useCreateCheckinLog() {
  return useCreateCheckin();
}

export function useMedicines(caredOneId: string | null) {
  return useQuery({
    queryKey: ["medicines", caredOneId],
    queryFn: () => fetchMedicinesWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (med: { user_id: string; name: string; dosage?: string; frequency?: string; time_slot?: string[]; note?: string }) => createMedicineWordPress(med),
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

export function useTodayMedicineLogs(caredOneId: string | null) {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ["todayMedicineLogs", caredOneId, today],
    queryFn: () => fetchTodayMedicineLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useLogMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: { medicine_id: string; status?: string; note?: string; user_id?: string }) => logMedicineWordPress(log),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicineLogs"] }); qc.invalidateQueries({ queryKey: ["todayMedicineLogs"] }); },
  });
}

export function useUpdateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateMedicineWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicines"] }); },
  });
}

export function useHealthVitals(caredOneId: string | null) {
  return useQuery({
    queryKey: ["healthVitals", caredOneId],
    queryFn: () => fetchHealthVitalsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateHealthVital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vital: { user_id: string; vital_type: string; value: number; unit?: string; notes?: string }) => createHealthVitalWordPress(vital),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["healthVitals"] }); },
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
    mutationFn: (tip: { user_id: string; title?: string; content: string; category?: string }) => createCareTipWordPress(tip),
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
    mutationFn: (plan: { user_id: string; title: string; description?: string }) => createCarePlanWordPress(plan),
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

export function useCarePlanGoals(planId: string | null) {
  return useQuery({
    queryKey: ["carePlanGoals", planId],
    queryFn: () => fetchCarePlanGoalsWordPress(planId!),
    enabled: !!planId,
  });
}

export function useCreateCarePlanGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goal: { care_plan_id: string; title: string; description?: string }) => createCarePlanGoalWordPress(goal),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carePlanGoals"] }); },
  });
}

export function useUpdateCarePlanGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => updateCarePlanGoalWordPress(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carePlanGoals"] }); },
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
    mutationFn: (note: { user_id: string; title?: string; content: string; category?: string }) => createCareNoteWordPress(note),
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
    mutationFn: (contact: { user_id: string; name: string; phone?: string; email?: string; relationship?: string }) => createEmergencyContactWordPress(contact),
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

export function useActivityLog(caredOneId: string | null) {
  return useQuery({
    queryKey: ["activityLog", caredOneId],
    queryFn: () => fetchActivityLogWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCreateActivityLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: { user_id: string; activity_type?: string; description?: string }) => createActivityLogWordPress(log),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["activityLog"] }); },
  });
}

export function useDeleteActivityLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteActivityLogWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["activityLog"] }); },
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
    mutationFn: (zone: { user_id: string; name: string; latitude: number; longitude: number; radius_meters?: number }) => createSafeZoneWordPress(zone),
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
    mutationFn: (doc: { user_id: string; title: string; description?: string; file_url?: string; document_type?: string }) => createCaredOneDocumentWordPress(doc),
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

export function useCreateSymptomLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: { user_id: string; symptom: string; severity?: number; notes?: string }) => createSymptomLogWordPress(log),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["symptomLogs"] }); },
  });
}

export function useCreateCaregiverWellnessLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: any) => {
      const { wordpressCCTFetch } = await import("@/features/shared/wordpress-client");
      await wordpressCCTFetch("caregiver_wellness_log", {
        method: "POST",
        body: {
          mood: log.mood || "",
          stress_level: log.stress_level ?? 0,
          notes: log.notes || "",
          logged_at: new Date().toISOString(),
        },
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["caregiverWellnessLogs"] }); },
  });
}

// ─── Dementia Stage ─────────────────────────────────────────
export function useUpdateDementiaStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caredOneId, stage }: { caredOneId: string; stage: string }) => updateDementiaStageWordPress(caredOneId, stage),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["userCaredOnes"] }); },
  });
}

// ─── Unified Comments ───────────────────────────────────────

export function useComments(entityType: string, entityId: string | null) {
  return useQuery({
    queryKey: ["comments", entityType, entityId],
    queryFn: () => fetchCommentsWordPress(entityType, entityId!),
    enabled: !!entityId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, entityId, content, parentId }: { entityType: string; entityId: string; content: string; parentId?: string }) => createCommentWordPress({ entity_type: entityType, entity_id: entityId, content, parent_id: parentId }),
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
    mutationFn: (id: string) => deleteCommentWordPress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["comments"] }); },
  });
}

// ─── Unified Votes ──────────────────────────────────────────

function normalizeVoteValue(value: string | null | undefined) {
  if (value === "downvote") return -1;
  if (value === "upvote") return 1;
  return 0;
}

export function useVoteSummary(entityType: string, entityIds: string[]) {
  return useQuery({
    queryKey: ["voteSummary", entityType, entityIds],
    queryFn: () => fetchVotesWordPress(entityType, entityIds),
    enabled: entityIds.length > 0,
  });
}

export function useVoteCount(entityType: string, entityId: string | null) {
  return useQuery({
    queryKey: ["voteCount", entityType, entityId],
    queryFn: async () => {
      const vote = await fetchEntityVoteWordPress(entityType, entityId!);
      return vote;
    },
    enabled: !!entityId,
  });
}

export function useToggleVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, entityId, value }: { entityType: string; entityId: string; value: -1 | 1 }) => toggleVoteWordPress(entityType, entityId, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["voteSummary"] }); qc.invalidateQueries({ queryKey: ["voteCount"] }); },
  });
}

// ─── Dashboard Stats ─────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchDashboardStatsWordPress(),
  });
}

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

// ─── Provider Availability (WooCommerce product meta) ───────
export function useProviderAvailability(providerId: string | null) {
  return useQuery({
    queryKey: ["providerAvailability", providerId],
    queryFn: async () => {
      const { getProviderAvailability } = await import("@/services/woocommerce-api");
      return getProviderAvailability(providerId!);
    },
    enabled: !!providerId,
  });
}

export function useUpsertProviderAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { providerId: string; slots: any[] }) => {
      const { upsertProviderAvailability } = await import("@/services/woocommerce-api");
      return upsertProviderAvailability(data.providerId, data.slots);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["providerAvailability"] }); },
  });
}

export function useProviderAvailabilitySetting(providerId: string | null) {
  return useQuery({
    queryKey: ["providerAvailabilitySetting", providerId],
    queryFn: async () => {
      const { getProviderAvailabilitySetting } = await import("@/services/woocommerce-api");
      return getProviderAvailabilitySetting(providerId!);
    },
    enabled: !!providerId,
  });
}

export function useUpdateProviderAvailabilitySetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { providerId: string; setting: any }) => {
      const { updateProviderAvailabilitySetting } = await import("@/services/woocommerce-api");
      return updateProviderAvailabilitySetting(data.providerId, data.setting);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["providerAvailabilitySetting"] }); },
  });
}

export function useProviderPayouts() {
  return useQuery({
    queryKey: ["providerPayouts"],
    queryFn: () => getDokanVendorWithdrawals(),
  });
}

// ─── Jobs ────────────────────────────────────────────────────
export function useJobPostings(filters?: { source?: string; status?: string }) {
  return useQuery({
    queryKey: ["jobPostings", filters],
    queryFn: () => fetchJobPostingsWordPress(filters),
  });
}

export function useCreateJobPosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (job: { title: string; description: string; location?: string; start_date?: string }) => createJobPostingWordPress(job),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobPostings"] });
      qc.invalidateQueries({ queryKey: ["myJobPostings"] });
    },
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, coverLetter }: { jobId: string; coverLetter?: string }) => applyToJobWordPress(jobId, coverLetter),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobApplications"] }); qc.invalidateQueries({ queryKey: ["myJobApplications"] }); },
  });
}

export function useMyJobApplications() {
  return useQuery({
    queryKey: ["myJobApplications"],
    queryFn: () => fetchMyJobApplicationsWordPress(),
  });
}

export function useMyJobPostings() {
  return useQuery({
    queryKey: ["myJobPostings"],
    queryFn: () => fetchMyJobPostingsWordPress(),
  });
}

export function useJobApplications(jobId: string | null) {
  return useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => fetchJobApplicationsWordPress(jobId!),
    enabled: !!jobId,
  });
}

export function useUpdateJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateJobApplicationWordPress(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobApplications"] }); },
  });
}

export function useCreateExternalTestJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: { title: string; description: string; location?: string }) => {
      await createJobPostingWordPress({ ...job, start_date: new Date().toISOString() });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobPostings"] }); },
  });
}

// ─── Caregiver Wellness & Symptom Logs (queries) ─────────────
export function useCaregiverWellnessLogs() {
  return useQuery({
    queryKey: ["caregiverWellnessLogs"],
    queryFn: async () => {
      const { wordpressCCTFetch } = await import("@/features/shared/wordpress-client");
      const logs = await wordpressCCTFetch("caregiver_wellness_log", { params: { _limit: 100 } });
      if (!Array.isArray(logs)) return [];
      return logs.map((l: any) => ({
        id: l.id,
        mood: l.mood || null,
        stress_level: l.stress_level ?? null,
        notes: l.notes || null,
        logged_at: l.logged_at || l.created_at,
        created_at: l.created_at,
      }));
    },
  });
}

export function useSymptomLogs(caredOneId: string | null) {
  return useQuery({
    queryKey: ["symptomLogs", caredOneId],
    queryFn: () => fetchSymptomLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

// ─── Location: cared-one location, history, settings, sharing ─
export function useCaredOneLocation(caredOneId: string | null) {
  return useQuery({
    queryKey: ["caredOneLocation", caredOneId],
    queryFn: () => fetchCaredOneLocationWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

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
    mutationFn: (data: { latitude: number; longitude: number; accuracy?: number | null; batteryLevel?: number | null; addressText?: string | null; isEmergency?: boolean; enabled?: boolean }) =>
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
  });
}

export function useSendLocationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: string | { caredOneId: string; message?: string; isEmergency?: boolean }) => {
      const normalized = typeof input === "string" ? { caredOneId: input } : input;
      return sendLocationRequestWordPress(normalized);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["locationRequests"] }); },
  });
}

export function useCancelLocationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => cancelLocationRequestWordPress(requestId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["locationRequests"] }); },
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

export function useEnableInformationCardShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, ...opts }: { cardId: string; visibility: any; expiresAt?: string | null; existingToken?: string }) =>
      enableInformationCardShareWordPress(cardId, opts),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["informationCards"] });
      qc.invalidateQueries({ queryKey: ["informationCard", vars.cardId] });
    },
  });
}

export function useRevokeInformationCardShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => revokeInformationCardShareWordPress(cardId),
    onSuccess: (_d, cardId) => {
      qc.invalidateQueries({ queryKey: ["informationCards"] });
      qc.invalidateQueries({ queryKey: ["informationCard", cardId] });
    },
  });
}

export function useInformationCardByToken(token: string | null) {
  return useQuery({
    queryKey: ["informationCardByToken", token],
    queryFn: () => fetchInformationCardByShareTokenWordPress(token!),
    enabled: !!token,
  });
}
