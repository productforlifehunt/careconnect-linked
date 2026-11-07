import { useQuery } from "@tanstack/react-query";
import { fetchBookingsWordPress } from "@/features/bookings/source.wordpress";
import { fetchCareGroupsWordPress } from "@/features/care-groups/source.wordpress";
import { filterVisibleTasks } from "@/features/care-groups/visibility";
import { fetchCareTasksWordPress } from "@/features/care-tasks/source.wordpress";
import { fetchCaredOneLocationWordPress } from "@/features/location/source.wordpress-extended";
import { fetchUserCaredOnesWordPress } from "@/features/cared-ones/source.wordpress";
import {
  fetchCheckinsWordPress,
  fetchMedicinesWordPress,
  fetchTodayCheckinLogsWordPress,
  fetchTodayMedicineLogsWordPress,
} from "@/features/cared-ones/source.wordpress-extended";
import { fetchConversationsWordPress } from "@/features/conversations/source.wordpress";
import { inboxCounts } from "@/features/inbox/counts";
import { currentAppId } from "@/features/shared/app-profile";
import { fetchPostsWordPress } from "@/features/posts/source.wordpress";
import { readLastGood, withLastGood } from "@/lib/last-good";
import { getStoredWPUser, getWPToken } from "@/services/wp-auth";
import type { Booking } from "@/types/care-connector";

function hasWPSession(): boolean {
  return Boolean(getWPToken());
}

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: withLastGood("bookings", fetchBookingsWordPress),
    // Show the last known list instantly, refresh it in the background.
    initialData: () => readLastGood<Booking[]>("bookings"),
    initialDataUpdatedAt: 0,
  });
}

export function useConversations() {
  const me = getStoredWPUser();
  const myId = me ? `wp-${me.user_id}` : "";
  return useQuery({
    queryKey: ["conversations", myId],
    queryFn: () => fetchConversationsWordPress(myId),
    enabled: !!myId,
    refetchInterval: 30000,
  });
}

export function useCareGroups() {
  return useQuery({
    queryKey: ["careGroups"],
    queryFn: () => fetchCareGroupsWordPress(),
  });
}

export function useCareTasks(groupId?: string | null | undefined) {
  return useQuery({
    queryKey: ["careTasks", groupId],
    queryFn: async () => {
      const tasks = await fetchCareTasksWordPress(groupId);
      return await filterVisibleTasks(tasks);
    },
  });
}

export function useNotifications() {
  const me = getStoredWPUser();
  return useQuery({
    queryKey: ["notifications", me?.user_id, currentAppId()],
    queryFn: async () =>
      (await import("@/lib/ai-dynamic-knowledge")).runNotificationSkill(
        "list-notifications",
      ),
    enabled: hasWPSession(),
    refetchInterval: 30000,
  });
}

export function useInboxCounts() {
  const notifications = useNotifications();
  const conversations = useConversations();
  return {
    ...inboxCounts(notifications.data || [], conversations.data || []),
    isLoading: notifications.isLoading || conversations.isLoading,
    error: notifications.error || conversations.error,
  };
}

export function usePosts(
  postType: string,
  area?: string | undefined,
  childPostType?: string | null | undefined,
) {
  return useQuery({
    queryKey: ["posts", postType, area, childPostType],
    queryFn: () => fetchPostsWordPress(postType, area, childPostType),
  });
}

export function useUserCaredOnes() {
  return useQuery({
    queryKey: ["userCaredOnes"],
    queryFn: () => fetchUserCaredOnesWordPress(),
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
