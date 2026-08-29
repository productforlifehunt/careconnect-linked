import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCareGroupsWordPress, fetchCareGroupMembersWordPress } from "@/features/care-groups/source.wordpress";
import { fetchCurrentLocation, type LocationSnapshot } from "@/features/location/source.wordpress";
import { fetchSafeZonesWordPress } from "@/features/location/source.wordpress-extended";
import { getCurrentUserId } from "@/features/shared/current-user";
import { hasWPSession } from "@/hooks/use-care-data";

export interface SafetyMember {
  userId: string;          // raw wp id, no prefix
  name: string;
  avatar: string | null;
  isSelf: boolean;
  isCaredOne: boolean;
  role: string;
  snapshot: LocationSnapshot | null;
}

const LS_CIRCLE_KEY = "notchsafety:circle";

/** Live circle state for the NotchSafety front (Life360-style). */
export function useSafetyCircle(pollMs = 15_000) {
  const selfId = getCurrentUserId()?.replace(/^wp-/, "") || null;

  const circlesQ = useQuery({
    queryKey: ["safety", "circles"],
    queryFn: fetchCareGroupsWordPress,
    enabled: hasWPSession(),
  });

  const circles = circlesQ.data || [];
  const [circleId, setCircleId] = useState<string | null>(
    () => (typeof window !== "undefined" ? window.localStorage.getItem(LS_CIRCLE_KEY) : null)
  );

  // Default to the first circle once loaded / keep selection valid.
  useEffect(() => {
    if (!circles.length) return;
    const valid = circleId && circles.some((c: any) => String(c.id) === String(circleId));
    if (!valid) setCircleId(String((circles[0] as any).id));
  }, [circles.length, circleId]);

  useEffect(() => {
    if (circleId) window.localStorage.setItem(LS_CIRCLE_KEY, circleId);
  }, [circleId]);

  const rosterQ = useQuery({
    queryKey: ["safety", "roster", circleId],
    queryFn: () => fetchCareGroupMembersWordPress(String(circleId)),
    enabled: !!circleId,
  });

  const roster = rosterQ.data || [];
  const rosterKey = roster.map((m: any) => m.id).join(",");

  const locationsQ = useQuery({
    queryKey: ["safety", "locations", rosterKey, selfId],
    queryFn: async () => {
      const ids = new Set<string>(roster.map((m: any) => String(m.id)));
      if (selfId) ids.add(selfId);
      const entries = await Promise.all(
        Array.from(ids).map(async (id) => {
          try {
            return [id, await fetchCurrentLocation(id)] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );
      return Object.fromEntries(entries) as Record<string, LocationSnapshot | null>;
    },
    enabled: hasWPSession(),
    refetchInterval: pollMs,
    refetchIntervalInBackground: false,
  });

  const zonesQ = useQuery({
    queryKey: ["safety", "zones", selfId],
    queryFn: () => fetchSafeZonesWordPress(String(selfId)),
    enabled: !!selfId,
  });

  const members: SafetyMember[] = useMemo(() => {
    const locations = locationsQ.data || {};
    const list: SafetyMember[] = roster.map((m: any) => ({
      userId: String(m.id),
      name: m.display_name || m.profile?.full_name || "Member",
      avatar: m.profile?.avatar_url || null,
      isSelf: !!selfId && String(m.id) === String(selfId),
      isCaredOne: !!m.is_cared_one,
      role: m.role || "member",
      snapshot: locations[String(m.id)] || null,
    }));
    if (selfId && !list.some((m) => m.isSelf)) {
      list.unshift({
        userId: selfId,
        name: "You",
        avatar: null,
        isSelf: true,
        isCaredOne: false,
        role: "owner",
        snapshot: locations[selfId] || null,
      });
    }
    // Self first, then members with a live position.
    return list.sort((a, b) => Number(b.isSelf) - Number(a.isSelf) || Number(!!b.snapshot) - Number(!!a.snapshot));
  }, [rosterKey, locationsQ.data, selfId]);

  return {
    selfId,
    circles,
    circleId,
    setCircleId,
    members,
    zones: (zonesQ.data || []) as any[],
    loading: circlesQ.isLoading || rosterQ.isLoading || locationsQ.isLoading,
    refresh: async () => {
      await Promise.all([locationsQ.refetch(), rosterQ.refetch(), zonesQ.refetch()]);
    },
    refreshZones: () => zonesQ.refetch(),
  };
}

/** Human "2 min ago" style helper shared by the safety screens. */
export function timeAgo(value: string | number | null | undefined, isCN = false): string {
  if (!value) return isCN ? "无数据" : "No data";
  const ms = typeof value === "number" ? (value < 1e12 ? value * 1000 : value) : Date.parse(value);
  if (!Number.isFinite(ms)) return isCN ? "无数据" : "No data";
  const diff = Math.max(0, Date.now() - ms);
  const min = Math.floor(diff / 60000);
  if (min < 1) return isCN ? "刚刚" : "Just now";
  if (min < 60) return isCN ? `${min} 分钟前` : `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return isCN ? `${hr} 小时前` : `${hr} h ago`;
  const day = Math.floor(hr / 24);
  return isCN ? `${day} 天前` : `${day} d ago`;
}
