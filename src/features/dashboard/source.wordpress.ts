import { listWordPressFeature } from "@/features/shared/wordpress-adapter";
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

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
    const tasks = await wordpressCCTFetch("care_task_real", { params: { _limit: 100 } });
    // l = finish status: "1" = not finished, "2" = finished
    pendingTasks = Array.isArray(tasks)
      ? tasks.filter((t: any) => String(t.l ?? "1") !== "2").length
      : 0;
  } catch { /* */ }

  try {
    const notifs = await wordpressCCTFetch("cc_notification", { params: { _limit: 100 } });
    if (Array.isArray(notifs)) {
      unreadMessages = notifs.filter((n: any) => n.is_read !== true && n.is_read !== "yes").length;
    }
  } catch {
    // cc_notification CCT may not be registered yet in WordPress — silently ignore 404s
  }

  return { upcomingBookings, careGroups, pendingTasks, unreadMessages };
}
