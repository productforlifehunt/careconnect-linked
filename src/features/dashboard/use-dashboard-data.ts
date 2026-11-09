import { useQuery } from "@tanstack/react-query";
import { inboxCounts } from "@/features/inbox/counts";
import { currentAppId } from "@/features/shared/app-profile";
import { readLastGood, withLastGood } from "@/lib/last-good";
import { getStoredWPUser, getWPToken } from "@/services/wp-auth";
import type { Booking, CareGroup } from "@/types/care-connector";

function hasWPSession(): boolean {
  return Boolean(getWPToken());
}

export function useBookings(enabled = true) {
  const appId = currentAppId();
  const userId = getStoredWPUser()?.user_id;
  const cacheKey = `bookings:${appId}:${userId ?? "anonymous"}`;
  return useQuery({
    queryKey: ["bookings", appId, userId],
    queryFn: withLastGood(cacheKey, async () =>
      (
        await import("@/features/bookings/source.wordpress")
      ).fetchBookingsWordPress(),
    ),
    enabled,
    // Show the last known list instantly, refresh it in the background.
    initialData: () => readLastGood<Booking[]>(cacheKey),
    initialDataUpdatedAt: 0,
  });
}

export function useConversations(enabled = true) {
  const me = getStoredWPUser();
  const myId = me ? `wp-${me.user_id}` : "";
  return useQuery({
    queryKey: ["conversations", myId, currentAppId()],
    queryFn: async () =>
      (
        await import("@/features/conversations/source.wordpress")
      ).fetchConversationsWordPress(myId),
    enabled: enabled && !!myId,
    refetchInterval: 30000,
  });
}

export function useCareGroups(enabled = true) {
  const appId = currentAppId();
  const userId = getStoredWPUser()?.user_id;
  const cacheKey = `careGroups:${appId}:${userId ?? "anonymous"}`;
  return useQuery({
    queryKey: ["careGroups", appId, userId],
    queryFn: withLastGood(cacheKey, async () =>
      (
        await import("@/features/care-groups/source.wordpress")
      ).fetchCareGroupsWordPress(),
    ),
    enabled,
    refetchOnMount: true,
    initialData: () => readLastGood<CareGroup[]>(cacheKey),
    initialDataUpdatedAt: 0,
  });
}

export function useCareTasks(
  groupId?: string | null | undefined,
  enabled = true,
  includeAssignees = true,
  options: {
    caredOneOnly?: boolean | undefined;
    includeAssignmentStatus?: boolean | undefined;
  } = {},
) {
  const userId = getStoredWPUser()?.user_id;
  const appId = currentAppId();
  const queryKey = [
    "careTasks",
    groupId,
    includeAssignees ? "with-assignees" : "summary",
    options.caredOneOnly ? "cared-one-scope" : "all-scope",
    options.includeAssignmentStatus === false
      ? "without-assignment-status"
      : "with-assignment-status",
    appId,
    userId,
  ];
  // Scope the browser snapshot by every input that changes the visible task
  // set, including both the current brand and account.
  const cacheKey = `careTasks:${JSON.stringify(queryKey.slice(1))}`;
  return useQuery({
    queryKey,
    queryFn: withLastGood(cacheKey, async () => {
      const { fetchCareTasksWordPress } =
        await import("@/features/care-tasks/source.wordpress");
      return fetchCareTasksWordPress(groupId, {
        includeAssignees,
        visibleToCurrentUser: true,
        caredOneOnly: options.caredOneOnly,
        includeAssignmentStatus: options.includeAssignmentStatus,
      });
    }),
    enabled,
    refetchOnMount: true,
    initialData: () =>
      readLastGood<
        Awaited<
          ReturnType<
            typeof import("@/features/care-tasks/source.wordpress").fetchCareTasksWordPress
          >
        >
      >(cacheKey),
    initialDataUpdatedAt: 0,
  });
}

export function useAssignedCareTaskIds(enabled = true) {
  const userId = getStoredWPUser()?.user_id;
  return useQuery({
    queryKey: ["assignedCareTaskIds", userId, currentAppId()],
    queryFn: async () =>
      (
        await import("@/features/care-tasks/source.wordpress")
      ).fetchUserAssignedCareTaskIdsWordPress(),
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
    queryFn: async () =>
      (
        await import("@/features/conversations/source.wordpress")
      ).fetchConversationCountsWordPress(myId),
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
  const unreadMessages =
    suppliedCounts?.unreadMessages ?? conversationCounts.data?.unread ?? 0;
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
  language?: string | undefined,
) {
  return useQuery({
    queryKey: ["posts", postType, area, childPostType, limit, currentAppId(), language],
    queryFn: async () =>
      (await import("@/features/posts/source.wordpress")).fetchPostsWordPress(
        postType,
        area,
        childPostType,
        limit,
        language,
      ),
    enabled,
  });
}

export function useUserCaredOnes(enabled = true) {
  const appId = currentAppId();
  const userId = getStoredWPUser()?.user_id;
  const cacheKey = `userCaredOnes:${appId}:${userId ?? "anonymous"}`;
  return useQuery({
    queryKey: ["userCaredOnes", appId, userId],
    queryFn: withLastGood(cacheKey, async () =>
      (
        await import("@/features/cared-ones/source.wordpress")
      ).fetchUserCaredOnesWordPress(),
    ),
    enabled,
    refetchOnMount: true,
    initialData: () =>
      readLastGood<
        Awaited<
          ReturnType<
            typeof import("@/features/cared-ones/source.wordpress").fetchUserCaredOnesWordPress
          >
        >
      >(cacheKey),
    initialDataUpdatedAt: 0,
  });
}

export function useCheckins(caredOneId: string | null) {
  return useQuery({
    queryKey: ["checkins", caredOneId, currentAppId()],
    queryFn: async () =>
      (
        await import("@/features/cared-ones/source.wordpress-extended")
      ).fetchCheckinsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useTodayCheckinLogs(caredOneId: string | null) {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["todayCheckinLogs", caredOneId, today, currentAppId()],
    queryFn: async () =>
      (
        await import("@/features/cared-ones/source.wordpress-extended")
      ).fetchTodayCheckinLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useMedicines(caredOneId: string | null) {
  return useQuery({
    queryKey: ["medicines", caredOneId, currentAppId()],
    queryFn: async () =>
      (
        await import("@/features/cared-ones/source.wordpress-extended")
      ).fetchMedicinesWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useTodayMedicineLogs(caredOneId: string | null) {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["todayMedicineLogs", caredOneId, today, currentAppId()],
    queryFn: async () =>
      (
        await import("@/features/cared-ones/source.wordpress-extended")
      ).fetchTodayMedicineLogsWordPress(caredOneId!),
    enabled: !!caredOneId,
  });
}

export function useCaredOneLocation(caredOneId: string | null) {
  return useQuery({
    queryKey: ["caredOneLocation", caredOneId, currentAppId()],
    queryFn: async () =>
      (
        await import("@/features/location/source.wordpress-extended")
      ).fetchCaredOneLocationWordPress(caredOneId!),
    enabled: !!caredOneId,
    // A requested location arrives whenever the cared one answers — keep looking.
    refetchInterval: 30_000,
  });
}
