import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  GripVertical,
  Lightbulb,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSite } from "@/contexts/SiteContext";
import { useUserCaredOnes } from "@/hooks/use-care-data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getStoredWPUser } from "@/services/wp-auth";
import type { ActiveCareTip } from "@/lib/ai-care-tip-context";

type TipReference = { caredOneId: string; tipId: string };
type TipPreferences = { active: TipReference[]; favorites: TipReference[] };

type CaredOneOption = {
  user_id: string;
  invitation_status?: string | undefined;
  cared_one?: { full_name?: string | null | undefined } | undefined;
};

type StoredPreferences = { key: string; value: TipPreferences };
const EMPTY_PREFERENCES: TipPreferences = { active: [], favorites: [] };
let tipSource: Promise<typeof import("@/features/cared-ones/source.wordpress-extended")> | undefined;
function loadTipSource() {
  tipSource ??= import("@/features/cared-ones/source.wordpress-extended").catch((error) => {
    tipSource = undefined;
    throw error;
  });
  return tipSource;
}

function referenceKey(reference: TipReference): string {
  return `${reference.caredOneId}::${reference.tipId}`;
}

function uniqueReferences(values: unknown): TipReference[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  return values.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const row = value as Record<string, unknown>;
    if (
      typeof row["caredOneId"] !== "string" ||
      typeof row["tipId"] !== "string" ||
      !row["caredOneId"] ||
      !row["tipId"]
    )
      return [];
    const reference = { caredOneId: row["caredOneId"], tipId: row["tipId"] };
    const key = referenceKey(reference);
    if (seen.has(key)) return [];
    seen.add(key);
    return [reference];
  });
}

function readPreferences(key: string): TipPreferences {
  if (typeof window === "undefined") return EMPTY_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY_PREFERENCES;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    return {
      active: uniqueReferences(saved["active"]),
      favorites: uniqueReferences(saved["favorites"]),
    };
  } catch {
    return EMPTY_PREFERENCES;
  }
}

function moveReference(
  values: TipReference[],
  fromKey: string,
  toKey: string,
): TipReference[] {
  const from = values.findIndex(
    (reference) => referenceKey(reference) === fromKey,
  );
  const to = values.findIndex((reference) => referenceKey(reference) === toKey);
  if (from < 0 || to < 0 || from === to) return values;
  const next = [...values];
  const [moved] = next.splice(from, 1);
  if (!moved) return values;
  next.splice(to, 0, moved);
  return next;
}

type CareTipContextPickerProps = {
  enabled: boolean;
  initialCaredOneId?: string | undefined;
  sending?: boolean | undefined;
  onActiveTipsChange: (tips: ActiveCareTip[]) => void;
  onSendTips: (tips: ActiveCareTip[]) => Promise<boolean>;
};

/** The WordPress-backed picker mounts after hydration because its source reads browser auth. */
export function CareTipContextPicker(props: CareTipContextPickerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <MountedCareTipContextPicker {...props} /> : null;
}

/** Shared care-tip context controls for the text, read-aloud, live-talk, and call modes. */
function MountedCareTipContextPicker({
  enabled,
  initialCaredOneId,
  sending,
  onActiveTipsChange,
  onSendTips,
}: CareTipContextPickerProps) {
  const { i18n } = useTranslation();
  const site = useSite();
  const queryClient = useQueryClient();
  const isChinese = i18n.language?.startsWith("zh");
  const Z = (zh: string, en: string) => (isChinese ? zh : en);
  const userId = String(getStoredWPUser()?.user_id || "anonymous");
  const storageKey = `ai-care-tip-context:${site.id}:${userId}`;
  const [stored, setStored] = useState<StoredPreferences>(() => ({
    key: storageKey,
    value: readPreferences(storageKey),
  }));
  const preferences =
    stored.key === storageKey ? stored.value : readPreferences(storageKey);
  const [open, setOpen] = useState(false);
  const [selectedCaredOneId, setSelectedCaredOneId] = useState<string | null>(
    null,
  );
  const [draftSelection, setDraftSelection] = useState<TipReference[]>([]);
  const [pendingSelection, setPendingSelection] = useState<TipReference[]>([]);
  const [draggingFavorite, setDraggingFavorite] = useState<string | null>(null);
  const draggingFavoriteRef = useRef<string | null>(null);

  useEffect(() => {
    setStored({ key: storageKey, value: readPreferences(storageKey) });
    setDraftSelection([]);
    setPendingSelection([]);
  }, [storageKey]);

  useEffect(() => {
    if (stored.key !== storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(stored.value));
    } catch {
      // The controls remain usable for this session when browser storage is unavailable.
    }
  }, [storageKey, stored]);

  const updatePreferences = (
    update: (current: TipPreferences) => TipPreferences,
  ) => {
    setStored((current) => {
      const currentValue =
        current.key === storageKey
          ? current.value
          : readPreferences(storageKey);
      return { key: storageKey, value: update(currentValue) };
    });
  };

  const peopleQuery = useUserCaredOnes(enabled);
  const people = useMemo(
    () =>
      ((peopleQuery.data || []) as CaredOneOption[])
        .filter(
          (person) => person.invitation_status !== "pending" && person.user_id,
        )
        .map((person) => ({
          id: String(person.user_id),
          name: String(person.cared_one?.full_name || "").trim(),
        })),
    [peopleQuery.data],
  );

  const tipQueries = useQueries({
    queries: people.map((person) => ({
      queryKey: ["careTips", person.id, site.id, userId],
      queryFn: async () => {
        const { fetchCareTipsWordPress } =
          await loadTipSource();
        return fetchCareTipsWordPress(person.id);
      },
      enabled,
    })),
  });

  useEffect(() => {
    if (people.length === 0) {
      setSelectedCaredOneId(null);
      return;
    }
    if (
      selectedCaredOneId &&
      people.some((person) => person.id === selectedCaredOneId)
    )
      return;
    const initial = initialCaredOneId?.replace(/^wp-/, "");
    const preferred = initial
      ? people.find((person) => person.id.replace(/^wp-/, "") === initial)
      : undefined;
    setSelectedCaredOneId(preferred?.id || people[0]?.id || null);
  }, [people, selectedCaredOneId, initialCaredOneId]);

  const availableTips = useMemo(
    () =>
      people.flatMap((person, index) => {
        const query = tipQueries[index];
        const rows = (query?.data || []) as Array<Record<string, unknown>>;
        return rows
          .map((row) => ({
            reference: {
              caredOneId: person.id,
              tipId: String(row["id"] || ""),
            },
            caredOneName:
              person.name || (isChinese ? "姓名尚未设置" : "Name not set"),
            title: String(row["title"] || "").trim(),
            content: String(row["content"] || "").trim(),
            category: String(row["category"] || "").toLowerCase(),
          }))
          .filter((tip) => tip.reference.tipId);
      }),
    [people, tipQueries, isChinese],
  );

  const tipsByKey = useMemo(
    () =>
      new Map(availableTips.map((tip) => [referenceKey(tip.reference), tip])),
    [availableTips],
  );
  const activeTips = useMemo(
    () =>
      preferences.active
        .map((reference) => tipsByKey.get(referenceKey(reference)))
        .filter(
          (tip): tip is NonNullable<typeof tip> => !!tip && !!tip.content,
        ),
    [preferences.active, tipsByKey],
  );
  const favoriteTips = useMemo(
    () =>
      preferences.favorites
        .map((reference) => tipsByKey.get(referenceKey(reference)))
        .filter((tip): tip is NonNullable<typeof tip> => !!tip),
    [preferences.favorites, tipsByKey],
  );
  const pendingTips = useMemo(
    () =>
      pendingSelection
        .map((reference) => tipsByKey.get(referenceKey(reference)))
        .filter((tip): tip is NonNullable<typeof tip> => !!tip),
    [pendingSelection, tipsByKey],
  );

  useEffect(() => {
    onActiveTipsChange(
      activeTips.map(
        ({ reference, caredOneName, title, content, category }) => ({
          caredOneId: reference.caredOneId,
          caredOneName,
          title,
          content,
          category,
        }),
      ),
    );
  }, [activeTips, onActiveTipsChange]);

  const isActive = (reference: TipReference) =>
    preferences.active.some(
      (item) => referenceKey(item) === referenceKey(reference),
    );
  const isFavorite = (reference: TipReference) =>
    preferences.favorites.some(
      (item) => referenceKey(item) === referenceKey(reference),
    );
  const isDraftSelected = (reference: TipReference) =>
    draftSelection.some(
      (item) => referenceKey(item) === referenceKey(reference),
    );
  const isPending = (reference: TipReference) =>
    pendingSelection.some(
      (item) => referenceKey(item) === referenceKey(reference),
    );

  const toggleActive = (reference: TipReference) => {
    const wasActive = isActive(reference);
    updatePreferences((current) => ({
      ...current,
      active: wasActive
        ? current.active.filter(
            (item) => referenceKey(item) !== referenceKey(reference),
          )
        : [...current.active, reference],
    }));
  };

  const toggleDraftSelection = (reference: TipReference) => {
    setDraftSelection((current) =>
      current.some((item) => referenceKey(item) === referenceKey(reference))
        ? current.filter(
            (item) => referenceKey(item) !== referenceKey(reference),
          )
        : [...current, reference],
    );
  };

  const removePendingReference = (reference: TipReference) => {
    setPendingSelection((current) =>
      current.filter((item) => referenceKey(item) !== referenceKey(reference)),
    );
  };

  const activatePendingReference = (reference: TipReference) => {
    if (!isActive(reference)) {
      updatePreferences((current) => ({
        ...current,
        active: [...current.active, reference],
      }));
    }
    removePendingReference(reference);
  };

  const favoritePendingReference = (reference: TipReference) => {
    if (!isFavorite(reference)) {
      updatePreferences((current) => ({
        ...current,
        favorites: [...current.favorites, reference],
      }));
    }
    removePendingReference(reference);
  };

  const sendDraftSelection = async () => {
    const selected = draftSelection
      .map((reference) => tipsByKey.get(referenceKey(reference)))
      .filter((tip): tip is NonNullable<typeof tip> => !!tip && !!tip.content);
    if (selected.length === 0 || sending) return;
    const sent = await onSendTips(
      selected.map(({ reference, caredOneName, title, content, category }) => ({
        caredOneId: reference.caredOneId,
        caredOneName,
        title,
        content,
        category,
      })),
    );
    if (!sent) return;
    setPendingSelection((current) =>
      uniqueReferences([...current, ...selected.map((tip) => tip.reference)]),
    );
    setDraftSelection((current) =>
      current.filter(
        (reference) =>
          !selected.some(
            (tip) => referenceKey(tip.reference) === referenceKey(reference),
          ),
      ),
    );
    setOpen(false);
  };

  const toggleFavorite = (reference: TipReference) => {
    updatePreferences((current) => ({
      ...current,
      favorites: isFavorite(reference)
        ? current.favorites.filter(
            (item) => referenceKey(item) !== referenceKey(reference),
          )
        : [...current.favorites, reference],
    }));
  };

  const moveFavorite = (fromKey: string, toKey: string) => {
    updatePreferences((current) => ({
      ...current,
      favorites: moveReference(current.favorites, fromKey, toKey),
    }));
  };

  const moveFavoriteBy = (key: string, offset: number) => {
    const index = preferences.favorites.findIndex(
      (reference) => referenceKey(reference) === key,
    );
    const target = preferences.favorites[index + offset];
    if (target) moveFavorite(key, referenceKey(target));
  };

  const selectedIndex = people.findIndex(
    (person) => person.id === selectedCaredOneId,
  );
  const currentPerson = selectedIndex >= 0 ? people[selectedIndex] : undefined;
  const currentTipQuery =
    selectedIndex >= 0 ? tipQueries[selectedIndex] : undefined;
  const currentTips = currentTipQuery?.data as
    Array<Record<string, unknown>> | undefined;
  const activeCount = activeTips.length;

  return (
    <div
      className="space-y-1.5"
      data-inspector-id="components/ai/AICompanionChat/care-tip-context"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={!enabled || peopleQuery.isPending}
            className="h-9 w-full justify-between rounded-lg px-3 text-xs"
            aria-label={Z("选择护理小贴士", "Choose care tips")}
            data-inspector-id="components/ai/AICompanionChat/care-tip-picker"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-medium">
                {Z("护理小贴士", "Care tips")}
              </span>
              <span className="truncate text-muted-foreground">
                {peopleQuery.isPending
                  ? Z("正在加载被护理者…", "Loading people…")
                  : activeCount
                    ? `${activeCount} ${Z("条正在使用", "in use")}`
                    : Z(
                        "选择被护理者并勾选要使用的贴士",
                        "Choose a person and select tips to use",
                      )}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-[min(36rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-3"
        >
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {Z("选择被护理者", "Choose a person")}
              </p>
              {peopleQuery.isError ? (
                <div className="flex items-center justify-between gap-2 rounded-md bg-destructive/5 p-2 text-xs text-destructive">
                  <span>
                    {Z("暂时无法读取被护理者。", "Couldn't load cared ones.")}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => void peopleQuery.refetch()}
                  >
                    {Z("重试", "Retry")}
                  </Button>
                </div>
              ) : peopleQuery.isFetching && people.length === 0 ? (
                <p className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {Z("正在加载…", "Loading…")}
                </p>
              ) : people.length === 0 ? (
                <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                  {Z(
                    "当前账号还没有可选的被护理者。",
                    "No cared ones are linked to this account yet.",
                  )}
                </p>
              ) : (
                <div
                  role="tablist"
                  aria-label={Z("被护理者", "Cared ones")}
                  className="flex gap-1 overflow-x-auto border-b pb-2"
                >
                  {people.map((person) => {
                    const index = people.findIndex(
                      (item) => item.id === person.id,
                    );
                    const count = (
                      (tipQueries[index]?.data || []) as Array<
                        Record<string, unknown>
                      >
                    ).length;
                    const selected = selectedCaredOneId === person.id;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setSelectedCaredOneId(person.id)}
                        className={`max-w-48 shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                        data-inspector-id="components/ai/AICompanionChat/care-tip-person-tab"
                      >
                        <span className="block truncate">
                          {person.name || Z("姓名尚未设置", "Name not set")}
                        </span>
                        {tipQueries[index]?.isSuccess && (
                          <span className="text-[10px] text-muted-foreground">
                            {count} {Z("条", "tips")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {currentPerson &&
              (currentTipQuery?.isPending ? (
                <p className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {Z("正在读取护理小贴士…", "Loading care tips…")}
                </p>
              ) : currentTipQuery?.isError ? (
                <div className="flex items-center justify-between gap-2 rounded-md bg-destructive/5 p-2 text-xs text-destructive">
                  <span>
                    {Z(
                      "暂时无法读取这位家人的护理小贴士。",
                      "Couldn't load this person's care tips.",
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() =>
                      void queryClient.invalidateQueries({
                        queryKey: ["careTips", currentPerson.id],
                      })
                    }
                  >
                    {Z("重试", "Retry")}
                  </Button>
                </div>
              ) : (currentTips || []).length === 0 ? (
                <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                  {Z(
                    "这位家人还没有护理小贴士。",
                    "This person has no care tips yet.",
                  )}
                </p>
              ) : (
                <div
                  className="max-h-56 space-y-1 overflow-y-auto pr-1"
                  role="group"
                  aria-label={Z("护理小贴士", "Care tips")}
                >
                  {(currentTips || []).map((row) => {
                    const reference = {
                      caredOneId: currentPerson.id,
                      tipId: String(row["id"] || ""),
                    };
                    const title =
                      String(row["title"] || "").trim() ||
                      Z("未命名小贴士", "Untitled care tip");
                    const active = isActive(reference);
                    const favorite = isFavorite(reference);
                    const checked = isDraftSelected(reference);
                    const pending = isPending(reference);
                    return (
                      <div
                        key={referenceKey(reference)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/60"
                      >
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={`${checked ? Z("取消发送", "Remove from send selection") : Z("选择发送给 AI", "Select to send to AI")}: ${title}`}
                          disabled={pending || !!sending}
                          onClick={() => toggleDraftSelection(reference)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}`}
                          data-inspector-id="components/ai/AICompanionChat/care-tip-send-select"
                        >
                          {checked && <Check className="h-3.5 w-3.5" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium">
                            {title}
                          </span>
                          <span className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                            {active && (
                              <span className="text-primary">
                                {Z("正在使用", "In use")}
                              </span>
                            )}
                            {favorite && <span>{Z("常用", "Favorite")}</span>}
                            {pending && (
                              <span>{Z("已发送给 AI", "Sent to AI")}</span>
                            )}
                            {!active && !favorite && !pending && (
                              <span>
                                {row["category"] === "avoid"
                                  ? Z("避免", "Avoid")
                                  : Z("建议", "Tip")}
                              </span>
                            )}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant={active ? "secondary" : "ghost"}
                          size="sm"
                          disabled={pending}
                          aria-pressed={active}
                          onClick={() => toggleActive(reference)}
                          className="h-7 shrink-0 px-2 text-[10px]"
                          data-inspector-id="components/ai/AICompanionChat/care-tip-use-toggle"
                        >
                          {active ? Z("停止使用", "Stop") : Z("使用", "Use")}
                        </Button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(reference)}
                          aria-label={
                            favorite
                              ? Z(
                                  `从常用栏移出：${title}`,
                                  `Remove from favorites: ${title}`,
                                )
                              : Z(
                                  `加入常用栏：${title}`,
                                  `Add to favorites: ${title}`,
                                )
                          }
                          aria-pressed={favorite}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${favorite ? "text-primary" : "text-muted-foreground"}`}
                          data-inspector-id="components/ai/AICompanionChat/care-tip-favorite-toggle"
                        >
                          <Star
                            className={`h-4 w-4 ${favorite ? "fill-current" : ""}`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            {draftSelection.length > 0 && (
              <div className="flex items-center justify-between gap-3 border-t pt-2">
                <p className="text-[11px] text-muted-foreground">
                  {Z(
                    `${draftSelection.length} 条已选`,
                    `${draftSelection.length} selected`,
                  )}
                </p>
                <Button
                  type="button"
                  size="sm"
                  disabled={!!sending}
                  onClick={() => void sendDraftSelection()}
                  className="h-8 px-3 text-xs"
                  data-inspector-id="components/ai/AICompanionChat/care-tip-send"
                >
                  {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {Z("发送给 AI", "Send to AI")}
                </Button>
              </div>
            )}
            <p className="border-t pt-2 text-[11px] leading-4 text-muted-foreground">
              {Z(
                "可以多选。发送后，AI 会询问是否在对话中使用或加入常用；这里只显示标题，不显示贴士正文。",
                "Select one or more tips, then send them. The AI will ask whether to use them in the chat or add them to favorites. Only titles appear here; the full text stays out of the chat.",
              )}
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {pendingTips.length > 0 && (
        <div
          className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-2"
          role="group"
          aria-label={Z(
            "选择护理小贴士的使用方式",
            "Choose how to use the sent tips",
          )}
          data-inspector-id="components/ai/AICompanionChat/care-tip-sent-actions"
        >
          <p className="px-1 text-[11px] font-medium text-muted-foreground">
            {Z(
              "已发送给 AI · 选择后续处理方式",
              "Sent to AI · choose what happens next",
            )}
          </p>
          {pendingTips.map((tip) => {
            const active = isActive(tip.reference);
            const favorite = isFavorite(tip.reference);
            return (
              <div
                key={referenceKey(tip.reference)}
                className="flex flex-wrap items-center gap-1.5 rounded-md bg-background/70 px-2 py-1.5"
              >
                <span
                  className="min-w-24 flex-1 truncate text-[11px]"
                  title={`${tip.caredOneName}: ${tip.title}`}
                >
                  {tip.caredOneName} ·{" "}
                  {tip.title || Z("护理小贴士", "Care tip")}
                </span>
                <Button
                  type="button"
                  variant={active ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-[10px]"
                  disabled={active}
                  onClick={() => activatePendingReference(tip.reference)}
                >
                  {active
                    ? Z("正在使用", "In use")
                    : Z("开始使用", "Use in chat")}
                </Button>
                <Button
                  type="button"
                  variant={favorite ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-[10px]"
                  disabled={favorite}
                  onClick={() => favoritePendingReference(tip.reference)}
                >
                  {favorite
                    ? Z("已在常用", "Favorited")
                    : Z("加入常用", "Add favorite")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={Z("关闭这条选择", "Dismiss this selection")}
                  onClick={() => removePendingReference(tip.reference)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {favoriteTips.length > 0 && (
        <div
          className="flex justify-end"
          data-inspector-id="components/ai/AICompanionChat/care-tip-favorites"
        >
          <div className="max-h-28 max-w-full overflow-y-auto rounded-lg border bg-muted/20 p-1.5 sm:max-w-[70%]">
            <div className="mb-1 flex items-center justify-between gap-3 px-1">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Star className="h-3 w-3 text-primary" />
                {Z("常用小贴士", "Favorite tips")}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {Z("拖动可排序", "Drag to reorder")}
              </span>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {favoriteTips.map((tip, index) => {
                const key = referenceKey(tip.reference);
                const checked = isActive(tip.reference);
                return (
                  <div
                    key={key}
                    draggable
                    onDragStart={(event) => {
                      draggingFavoriteRef.current = key;
                      setDraggingFavorite(key);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", key);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const fromKey =
                        draggingFavoriteRef.current ||
                        event.dataTransfer.getData("text/plain");
                      if (fromKey) moveFavorite(fromKey, key);
                      draggingFavoriteRef.current = null;
                      setDraggingFavorite(null);
                    }}
                    onDragEnd={() => {
                      draggingFavoriteRef.current = null;
                      setDraggingFavorite(null);
                    }}
                    className={`group flex max-w-full items-center gap-0.5 rounded-md border bg-background pl-1 ${draggingFavorite === key ? "opacity-50" : ""}`}
                    data-inspector-id="components/ai/AICompanionChat/care-tip-favorite-item"
                  >
                    <GripVertical
                      className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground opacity-60"
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => toggleActive(tip.reference)}
                      aria-pressed={checked}
                      aria-label={`${checked ? Z("停止使用", "Stop using") : Z("开始使用", "Use")}: ${tip.title || Z("护理小贴士", "Care tip")}`}
                      title={
                        checked
                          ? Z("正在使用 · 点击停止", "In use · click to stop")
                          : Z("点击开始使用", "Click to use")
                      }
                      className="flex min-w-0 items-center gap-1.5 rounded px-1.5 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-inspector-id="components/ai/AICompanionChat/care-tip-favorite-use"
                    >
                      <span className="max-w-40 truncate text-[11px]">
                        {tip.title || Z("未命名小贴士", "Untitled tip")}
                      </span>
                      <span
                        className={`shrink-0 rounded px-1 py-0.5 text-[9px] ${checked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                      >
                        {checked ? Z("正在使用", "In use") : Z("使用", "Use")}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label={Z("上移常用贴士", "Move favorite up")}
                        disabled={index === 0}
                        onClick={() => moveFavoriteBy(key, -1)}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label={Z("下移常用贴士", "Move favorite down")}
                        disabled={index === favoriteTips.length - 1}
                        onClick={() => moveFavoriteBy(key, 1)}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        aria-label={Z(
                          `从常用栏移出：${tip.title || "护理小贴士"}`,
                          `Remove from favorites: ${tip.title || "Care tip"}`,
                        )}
                        onClick={() => toggleFavorite(tip.reference)}
                        data-inspector-id="components/ai/AICompanionChat/care-tip-favorite-remove"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
