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
import { Input } from "@/components/ui/input";
import { ChevronDown, Loader2, MapPin, Navigation, Bot, Send } from "lucide-react";
import { fetchCurrentLocation } from "@/features/location/source.wordpress";
import { fetchSafeZonesWordPress } from "@/features/location/source.wordpress-extended";
import { isDangerZone, isSafeZone, isCustomZone, zoneTypeLabel } from "@/features/location/zone-types";
import { fetchCareTipsWordPress, fetchCarePlansWordPress, fetchCareNotesWordPress } from "@/features/cared-ones/source.wordpress-extended";
import { fetchMedicinesWordPress } from "@/features/medicine/source.medicine";
import { invokeAI, type AIChatMessage } from "@/lib/ai-service";
import { trimMessagesToCharLimit } from "@/lib/ai-memory";
import { buildInfoSheetSystemPrompt, type InfoSheetAIContext } from "@/components/cared-ones/InfoSheetAIDialog";

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
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  // First open: the assistant explains the task in its own words.
  useEffect(() => {
    if (!open || started.current) return;
    started.current = true;
    const task = context.situationDetails?.trim();
    if (!task) {
      setMessages([{
        role: "assistant",
        content: Z(
          "你好，我了解这位家人的情况。有什么想问的，直接问我。",
          "Hi — I know this person's details. Ask me anything you're unsure about.",
        ),
      }]);
      return;
    }
    void (async () => {
      setSending(true);
      try {
        const reply = await invokeAI(
          "care_info_sheet",
          Z(
            `${context.caredOneName || "这位家人"}的家人正在请人帮个忙。请用两三句温和、感谢的话，像跟邻居或朋友说话一样，说明这次是帮什么：${task}。不要用命令句（不要说"你需要"、"你必须"），可以说"想请你…"、"如果方便的话…"。最后一句请对方有不清楚的地方随时问你。`,
            `A family is asking a neighbour or friend for a favour. In two or three warm, appreciative sentences — as you'd speak to a friend, never as an order — describe what the favour is this time: ${task}. Avoid "you need to" or "you must"; prefer "would you be able to…", "if it works for you…". End by warmly inviting them to ask you anything they're unsure about.`,
          ),
          { contextPrompt: buildInfoSheetSystemPrompt(context, !!isCN), persist: false },
        );
        setMessages([{ role: "assistant", content: reply }]);
      } catch {
        setMessages([{
          role: "assistant",
          content: Z(
            `谢谢你帮忙。这次想请你：${task}\n\n有不清楚的地方随时问我。`,
            `Thank you for helping out. The favour this time: ${task}\n\nAsk me anything you're unsure about.`,
          ),
        }]);

      } finally {
        setSending(false);
      }
    })();
  }, [open, context, isCN]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || sending) return;
    setInput("");
    setError(null);
    const next: AIChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setSending(true);
    try {
      const reply = await invokeAI("care_info_sheet", question, {
        messages: trimMessagesToCharLimit(next),
        contextPrompt: buildInfoSheetSystemPrompt(context, !!isCN),
        persist: false,
      });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setError(Z("现在问不通，请稍后再试，或直接打电话给上面的联系人。", "Can't get an answer right now. Please try again later, or call one of the contacts above."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-accent transition"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Bot className="h-4 w-4 text-primary" />
          {Z("有问题？直接问助手", "Have a question? Ask the assistant")}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t p-3 space-y-3">
          <div ref={scrollRef} className="space-y-3 max-h-[40vh] overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div className={`inline-block text-sm rounded-lg px-3 py-2 max-w-[90%] whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {Z("正在思考…", "Thinking…")}
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={Z("输入你的问题…", "Type your question…")}
              aria-label={Z("你的问题", "Your question")}
            />
            <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label={Z("发送", "Send")}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground">
            {Z("回答基于这张信息卡上的内容，不是医疗建议；对话不会被保存。", "Answers come from this card's information. Not medical advice; this chat isn't saved.")}
          </p>
        </div>
      )}
    </div>
  );
}
