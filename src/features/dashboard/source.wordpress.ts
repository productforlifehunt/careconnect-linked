import { listWordPressFeature } from "@/features/shared/wordpress-adapter";
import { wordpressCCTFetch, wordpressFetchRaw } from "@/features/shared/wordpress-client";

export interface DashboardStats {
  upcomingBookings: number;
  careGroups: number;
  pendingTasks: number;
  unreadMessages: number;
}

export async function fetchDashboardStatsWordPress(): Promise<DashboardStats> {
  let upcomingBookings = 0;
  let careGroups = 0;
  let pendingTasks = 0;
  let unreadMessages = 0;

  try {
    const orders = await listWordPressFeature<any[]>("bookings", {
      params: { per_page: 100, status: "processing,on-hold,pending" },
    });
    upcomingBookings = Array.isArray(orders) ? orders.length : 0;
  } catch { /* */ }

  try {
    const groups = await wordpressCCTFetch("care_group", { params: { _limit: 100 } });
    careGroups = Array.isArray(groups) ? groups.length : 0;
  } catch { /* */ }

  try {
    const tasks = await wordpressCCTFetch("universal_care_task", { params: { _limit: 100 } });
    pendingTasks = Array.isArray(tasks)
      ? tasks.filter((t: any) => t.status === "pending").length
      : 0;
  } catch { /* */ }

  try {
    const response = await wordpressFetchRaw("cc/v1/notifications");
    const text = await response.text();
    const notifs = text ? JSON.parse(text) : [];
    if (Array.isArray(notifs)) {
      unreadMessages = notifs.filter((n: any) => n.is_read !== true && n.is_read !== "yes").length;
    }
  } catch { /* */ }

  return { upcomingBookings, careGroups, pendingTasks, unreadMessages };
}
