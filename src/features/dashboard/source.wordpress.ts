import { listWordPressFeature } from "@/features/shared/wordpress-adapter";
import { T } from "@/integrations/wp-schema";
import { appScopeParams, filterAppScope } from "@/features/shared/app-scope";
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
    const tasks = await wordpressCCTFetch("care_task", { params: { _limit: 100 } });
    // a66 = finish status: b55 = not finished, b56 = finished
    pendingTasks = Array.isArray(tasks)
      ? tasks.filter((t: any) => String(t.a66 ?? "b55") !== "b56").length
      : 0;
  } catch { /* */ }

  try {
    const notifs = await wordpressCCTFetch(T.notification.slug, {
      params: { _limit: 100, ...appScopeParams("notification") },
    });
    if (Array.isArray(notifs)) {
      unreadMessages = filterAppScope("notification", notifs).filter(
        (n: any) => String(n[T.notification.f.NOTIFICATION_IS_READ] ?? T.notification.opt.NOTIFICATION_IS_READ.NO)
          !== T.notification.opt.NOTIFICATION_IS_READ.YES,
      ).length;
    }
  } catch {
    // cc_notification CCT may not be registered yet in WordPress — silently ignore 404s
  }

  return { upcomingBookings, careGroups, pendingTasks, unreadMessages };
}
