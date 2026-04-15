/**
 * WordPress Server Registry
 * 
 * Add/remove backup servers here. The app reads the active server from localStorage.
 * To add a new server, just add an entry to WP_SERVERS below.
 */

export interface WPServer {
  id: string;
  label: string;
  /** Full base URL, e.g. "https://app.challenged-dementia.com" */
  baseUrl: string;
  /** Site path for dev proxy rewrite (empty string if root) */
  sitePath: string;
  /** Whether this is the primary/default server */
  isPrimary?: boolean;
}

export const WP_SERVERS: WPServer[] = [
  {
    id: "main",
    label: "Main Server (app.challenged-dementia.com)",
    baseUrl: "https://app.challenged-dementia.com/careconnected",
    sitePath: "careconnected",
    isPrimary: true,
  },
  {
    id: "backup-ewp",
    label: "Backup Server (EWP Live)",
    baseUrl: "https://afresh-1202589.ingress-erytho.ewp.live",
    sitePath: "",
    isPrimary: false,
  },
];

const STORAGE_KEY = "cc_active_wp_server";

export function getActiveServer(): WPServer {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const found = WP_SERVERS.find((s) => s.id === stored);
    if (found) return found;
  }
  return WP_SERVERS.find((s) => s.isPrimary) || WP_SERVERS[0];
}

export function setActiveServer(serverId: string): void {
  localStorage.setItem(STORAGE_KEY, serverId);
  // Force reload so all cached URLs update
  window.location.reload();
}

export function getActiveServerId(): string {
  return getActiveServer().id;
}
