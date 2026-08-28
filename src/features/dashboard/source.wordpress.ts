import { T } from "@/integrations/wp-schema";
import { appScopeParams, filterAppScope } from "@/features/shared/app-scope";
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getMyCustomerOrders } from "@/services/woocommerce-api";


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
    // WooCommerce's /orders collection rejects a customer's bearer token (403),
    // so read the caller's own orders through the scoped server-side helper.
    const orders = await getMyCustomerOrders(100);
    const OPEN = ["processing", "on-hold", "pending"];
    upcomingBookings = Array.isArray(orders)
      ? orders.filter((o: any) => OPEN.includes(String(o?.status))).length
      : 0;
  } catch { /* */ }


  try {
    const groups = await wordpressCCTFetch(T.careGroup.slug, { params: { _limit: 100 } });
    careGroups = Array.isArray(groups) ? groups.length : 0;
  } catch { /* */ }

  try {
    const tasks = await wordpressCCTFetch(T.careTask.slug, { params: { _limit: 100 } });
    const FIN = T.careTask.f.TASK_FINISH_STATUS;
    const FIN_OPT = T.careTask.opt.TASK_FINISH_STATUS;
    pendingTasks = Array.isArray(tasks)
      ? tasks.filter((t: any) => String(t[FIN] ?? FIN_OPT.NOT_FINISHED) !== FIN_OPT.FINISHED).length
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
