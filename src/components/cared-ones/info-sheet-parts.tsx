/**
 * Pieces shared by the in-app information card popup and the public shared page.
 *
 * - SheetLocationTag: a tag next to the status. Collapsed by default; click to
 *   reveal the person's last known location (current_location CCT).
 * - SheetAIPanel: collapsed by default. Once opened it greets the reader with
 *   what is needed this time and answers questions about the person, using the
 *   care plan / tips / medicines / notes already stored for them.
 *   Nothing is written to the chat tables — whoever reads a shared card is
 *   usually not an app user.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, MapPin, Navigation, Bot } from "lucide-react";
import { fetchCurrentLocation } from "@/features/location/source.wordpress";
import { fetchSafeZonesWordPress } from "@/features/location/source.wordpress-extended";
import { isDangerZone, isSafeZone, isCustomZone, zoneTypeLabel } from "@/features/location/zone-types";
import { fetchCareTipsWordPress, fetchCarePlansWordPress, fetchCareNotesWordPress } from "@/features/cared-ones/source.wordpress-extended";
import { fetchMedicinesWordPress } from "@/features/medicine/source.medicine";
import type { InfoSheetAIContext } from "@/components/cared-ones/InfoSheetAIDialog";
import { buildInfoSheetContext, buildInfoSheetIntroduction } from "@/lib/ai-dynamic-knowledge";
import { AICompanionChat } from "@/components/ai/AICompanionChat";

// Leaflet stylesheet, loaded once (same source as the main location hub).
if (typeof document !== "undefined" && !document.getElementById("leaflet-css")) {
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

let LEAFLET: any = null;
async function getLeaflet() {
  if (LEAFLET) return LEAFLET;
  LEAFLET = await import("leaflet");
  delete (LEAFLET.Icon.Default.prototype as any)._getIconUrl;
  LEAFLET.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  return LEAFLET;
}

function zoneColour(code: string, stored?: string | null): string {
  if (isCustomZone(code) && typeof stored === "string" && /^#[0-9a-fA-F]{6}$/.test(stored)) return stored;
  if (isDangerZone(code)) return "#EF4444";
  if (isSafeZone(code)) return "#10B981";
  if (isCustomZone(code)) return "#3B82F6";
  return "#6B7280";
}

/** Small read-only map: the person's last position plus the places set for them. */
function SheetMiniMap({ lat, lng, zones, isCN }: { lat: number; lng: number; zones: any[]; isCN: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = await getLeaflet();
      if (cancelled || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView([lat, lng], 15);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      L.marker([lat, lng]).addTo(map);
      (zones || []).forEach((z: any) => {
        const colour = zoneColour(String(z.zone_type), z.color);
        const label = zoneTypeLabel(String(z.zone_type), z.zone_name, isCN);
        if (z.shape_type === "polygon" && Array.isArray(z.polygon_points) && z.polygon_points.length >= 3) {
          L.polygon(z.polygon_points, { color: colour, fillColor: colour, fillOpacity: 0.15, weight: 2 }).addTo(map).bindTooltip(label);
        } else if (z.latitude != null && z.longitude != null) {
          L.circle([Number(z.latitude), Number(z.longitude)], {
            radius: Number(z.radius_meters) || 200,
            color: colour, fillColor: colour, fillOpacity: 0.15, weight: 2,
          }).addTo(map).bindTooltip(label);
        }
      });
      setTimeout(() => map.invalidateSize(), 60);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [lat, lng, zones, isCN]);

  return <div ref={ref} className="h-56 w-full rounded-md border overflow-hidden bg-muted" />;
}


/* ─────────────── Location tag ─────────────── */

export function SheetLocationTag({ caredOneId }: { caredOneId?: string | null }) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [open, setOpen] = useState(false);

  const { data: location, isLoading } = useQuery({
    queryKey: ["infoSheetLocation", caredOneId],
    queryFn: () => fetchCurrentLocation(String(caredOneId)),
    enabled: open && !!caredOneId,
  });

  const { data: zones } = useQuery({
    queryKey: ["infoSheetZones", caredOneId],
    queryFn: () => fetchSafeZonesWordPress(String(caredOneId)),
    enabled: open && !!caredOneId,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="w-full">
      <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex">
        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
          <MapPin className="h-3 w-3 mr-1" />
          {Z("查看位置", "Cared one's location")}
          <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
        </Badge>
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> {Z("正在获取位置…", "Getting location…")}</div>
          ) : location?.latitude != null && location?.longitude != null ? (
            <>
              <SheetMiniMap
                lat={Number(location.latitude)}
                lng={Number(location.longitude)}
                zones={zones || []}
                isCN={!!isCN}
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition"
              >
                <Navigation className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {location.address_text || `${Number(location.latitude).toFixed(5)}, ${Number(location.longitude).toFixed(5)}`}
                  </div>
                  {location.captured_at && (
                    <div className="text-xs text-muted-foreground truncate">
                      {new Date(String(location.captured_at).replace(" ", "T")).toLocaleString()}
                    </div>
                  )}
                </div>
              </a>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{Z("暂无位置记录。", "No location record yet.")}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────── Knowledge about the person ─────────────── */

export function useInfoSheetKnowledge(caredOneId?: string | null, enabled = true) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");

  const { data } = useQuery({
    queryKey: ["infoSheetKnowledge", caredOneId],
    enabled: enabled && !!caredOneId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const id = String(caredOneId);
      const [tips, plans, notes, medicines] = await Promise.all([
        fetchCareTipsWordPress(id).catch(() => []),
        fetchCarePlansWordPress(id).catch(() => []),
        fetchCareNotesWordPress(id).catch(() => []),
        fetchMedicinesWordPress(id).catch(() => []),
      ]);
      return { tips, plans, notes, medicines };
    },
  });

  return useMemo(() => {
    if (!data) return "";
    const L = (cn: string, en: string) => (isCN ? cn : en);
    const list = (rows: any[], keys: string[]) =>
      (rows || []).slice(0, 12)
        .map((r: any) => keys.map((k) => r?.[k]).filter(Boolean).join(" — "))
        .filter(Boolean)
        .join("\n");

    const blocks = [
      list(data.plans, ["title", "name", "content", "description"]) && `${L("护理计划", "Care plan")}:\n${list(data.plans, ["title", "name", "content", "description"])}`,
      list(data.tips, ["title", "name", "content", "description"]) && `${L("照护要点与喜好", "Care tips and preferences")}:\n${list(data.tips, ["title", "name", "content", "description"])}`,
      list(data.medicines, ["name", "medicine_name", "dosage", "frequency", "note"]) && `${L("用药", "Medicines")}:\n${list(data.medicines, ["name", "medicine_name", "dosage", "frequency", "note"])}`,
      list(data.notes, ["title", "content"]) && `${L("护理笔记", "Care notes")}:\n${list(data.notes, ["title", "content"])}`,
    ].filter(Boolean);

    return blocks.join("\n\n");
  }, [data, isCN]);
}

/* ─────────────── Inline AI panel ─────────────── */

export function SheetAIPanel({ context }: { context: InfoSheetAIContext }) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [open, setOpen] = useState(false);

  const task = context.situationDetails?.trim();
  const request = useMemo(
    () => ({
      id: `information-card-${context.caredOneName || "shared"}`,
      title: Z("信息卡助手", "Information card assistant"),
      contextPrompt: buildInfoSheetContext(context, !!isCN),
      starterPrompt: task
        ? buildInfoSheetIntroduction(task, context.caredOneName, !!isCN)
        : Z("请先简单介绍你能根据这张信息卡回答什么。", "Briefly explain what you can answer from this information card."),
      starterFallback: Z("我只根据这张信息卡上的内容回答。有什么想问的？", "I answer only from this information card. What would you like to know?"),
    }),
    [context, isCN, task],
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-accent transition"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Bot className="h-4 w-4 text-primary" />
          {Z("有问题？直接问助手", "Have a question? Ask the assistant")}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="border-t">
          <AICompanionChat active={open} request={request} className="flex h-[380px] flex-col" />
        </div>
      )}
    </div>
  );
}

