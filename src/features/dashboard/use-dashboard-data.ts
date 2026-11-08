import { useQuery } from "@tanstack/react-query";
import { fetchBookingsWordPress } from "@/features/bookings/source.wordpress";
import { fetchCareGroupsWordPress } from "@/features/care-groups/source.wordpress";
import {
  fetchCareTasksWordPress,
  fetchUserAssignedCareTaskIdsWordPress,
} from "@/features/care-tasks/source.wordpress";
import { fetchCaredOneLocationWordPress } from "@/features/location/source.wordpress-extended";
import { fetchUserCaredOnesWordPress } from "@/features/cared-ones/source.wordpress";
import {
  fetchCheckinsWordPress,
  fetchMedicinesWordPress,
  fetchTodayCheckinLogsWordPress,
  fetchTodayMedicineLogsWordPress,
} from "@/features/cared-ones/source.wordpress-extended";
import {
  fetchConversationCountsWordPress,
  fetchConversationsWordPress,
} from "@/features/conversations/source.wordpress";
import { inboxCounts } from "@/features/inbox/counts";
import { currentAppId } from "@/features/shared/app-profile";
import { fetchPostsWordPress } from "@/features/posts/source.wordpress";
import { readLastGood, withLastGood } from "@/lib/last-good";
import { getStoredWPUser, getWPToken } from "@/services/wp-auth";
import type { Booking } from "@/types/care-connector";

function hasWPSession(): boolean {
  return Boolean(getWPToken());
}

export function useBookings(enabled = true) {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: withLastGood("bookings", fetchBookingsWordPress),
    enabled,
    // Show the last known list instantly, refresh it in the background.
    initialData: () => readLastGood<Booking[]>("bookings"),
    initialDataUpdatedAt: 0,
  });
}

export function useConversations(enabled = true) {
  const me = getStoredWPUser();
  const myId = me ? `wp-${me.user_id}` : "";
  return useQuery({
    queryKey: ["conversations", myId],
    queryFn: () => fetchConversationsWordPress(myId),
    enabled: enabled && !!myId,
    refetchInterval: 30000,
  });
}

export function useCareGroups(enabled = true) {
  return useQuery({
    queryKey: ["careGroups"],
    queryFn: () => fetchCareGroupsWordPress(),
    enabled,
  });
}

export function useCareTasks(
  groupId?: string | null | undefined,
  enabled = true,
  includeAssignees = true,
  options: { caredOneOnly?: boolean | undefined; includeAssignmentStatus?: boolean | undefined } = {},
) {
  return useQuery({
    queryKey: [
      "careTasks",
      groupId,
      includeAssignees ? "with-assignees" : "summary",
      options.caredOneOnly ? "cared-one-scope" : "all-scope",
      options.includeAssignmentStatus === false ? "without-assignment-status" : "with-assignment-status",
    ],
    queryFn: async () => {
      return fetchCareTasksWordPress(groupId, {
        includeAssignees,
        visibleToCurrentUser: true,
        caredOneOnly: options.caredOneOnly,
        includeAssignmentStatus: options.includeAssignmentStatus,
      });
    },
    enabled,
  });
}

export function useAssignedCareTaskIds(enabled = true) {
  const userId = getStoredWPUser()?.user_id;
  return useQuery({
    queryKey: ["assignedCareTaskIds", userId],
    queryFn: fetchUserAssignedCareTaskIdsWordPress,
    enabled: enabled && !!userId,
  });
}

export function useNotifications(enabled = true) {
  const me = getStoredWPUser();
  return useQuery({
    queryKey: ["notifications", me?.user_id, currentAppId()],
    queryFn: async () =>
      (await import("@/lib/ai-dynamic-knowledge")).runNotificationSkill(
        "list-notifications",
      ),
    enabled: enabled && hasWPSession(),
    refetchInterval: 30000,
  });
}

export function useInboxCounts(
  enabled = true,
  conversationSource?: {
    data?: Array<{ unread_count?: number | string | null }> | undefined;
    isLoading?: boolean | undefined;
    error?: unknown;
  },
) {
  const notifications = useNotifications(enabled);
  const me = getStoredWPUser();
  const myId = me?.user_id ? `wp-${me.user_id}` : "";
  const conversationCounts = useQuery({
    queryKey: ["conversationCounts", myId, currentAppId()],
    queryFn: () => fetchConversationCountsWordPress(myId),
    enabled: enabled && !!myId && !conversationSource,
    staleTime: 30_000,
    refetchInterval: conversationSource ? false : 30_000,
  });
  const suppliedCounts = conversationSource
    ? inboxCounts([], conversationSource.data || [])
    : null;
  const unreadNotifications = (notifications.data || []).filter(
    (notification) => !notification.is_read,
  ).length;
  const unreadMessages = suppliedCounts?.unreadMessages ?? conversationCounts.data?.unread ?? 0;
  const total =
    (notifications.data || []).length +
    (suppliedCounts?.total ?? conversationCounts.data?.total ?? 0);
  return {
    unreadNotifications,
    unreadMessages,
    unread: unreadNotifications + unreadMessages,
    total,
    read: total - unreadNotifications - unreadMessages,
    isLoading:
      (enabled && notifications.isLoading) ||
      (conversationSource
        ? !!conversationSource.isLoading
        : enabled && conversationCounts.isLoading),
    error:
      notifications.error ||
      conversationSource?.error ||
      conversationCounts.error,
  };
}

export function usePosts(
  postType: string,
  area?: string | undefined,
  childPostType?: string | null | undefined,
  limit = 50,
  enabled = true,
) {
  return useQuery({
    queryKey: ["posts", postType, area, childPostType, limit],
    queryFn: () => fetchPostsWordPress(postType, area, childPostType, limit),
    enabled,
  });
}

export function useUserCaredOnes(enabled = true) {
  return useQuery({
    queryKey: ["userCaredOnes"],
    queryFn: () => fetchUserCaredOnesWordPress(),
    enabled,
  });
}

export function useCheckins(caredOneId: string | null) {
  return useQuery({
    queryKey: ["checkins", caredOneId],
    queryFn: () => fetchCheckinsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useTodayCheckinLogs(caredOneId: string | null) {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["todayCheckinLogs", caredOneId, today],
    queryFn: () => fetchTodayCheckinLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useMedicines(caredOneId: string | null) {
  return useQuery({
    queryKey: ["medicines", caredOneId],
    queryFn: () => fetchMedicinesWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useTodayMedicineLogs(caredOneId: string | null) {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["todayMedicineLogs", caredOneId, today],
    queryFn: () => fetchTodayMedicineLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCaredOneLocation(caredOneId: string | null) {
  return useQuery({
    queryKey: ["caredOneLocation", caredOneId],
    queryFn: () => fetchCaredOneLocationWordPress(caredOneId!),
    enabled: !!caredOneId,
    // A requested location arrives whenever the cared one answers — keep looking.
    refetchInterval: 30_000,
  });
}
