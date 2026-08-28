import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Shield, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMyProfile } from "@/hooks/use-care-data";
import { useSyncProviderToWooCommerce, useProviderWooCommerceProduct } from "@/hooks/use-woocommerce";
import { useServiceTypes } from "@/hooks/use-service-types";
import { useToast } from "@/hooks/use-toast";

/**
 * Provider Dashboard → "My Booking Services" tab.
 *
 * Single source of truth for the provider's WC Bookings product + the per-
 * package pricing rows (pa_service-type + pa_service-location + hourly rate).
 *
 * State machine:
 *   1. No WC product yet  → show a single "Publish my care service" CTA that
 *      creates a `type=booking` product under the vendor's Dokan store.
 *   2. Product exists, no packages → show the empty editor with an Add button.
 *   3. Product + packages → show the editor populated from `_service_packages`.
 */

interface ServiceResourceRow {
  serviceTypeSlug: string;
  locationSlug: string;
  ratePerHour: string;
}

const LOCATION_OPTIONS = [
  { slug: "in-person", label: "In-Person" },
  { slug: "remote",    label: "Remote" },
];

export default function MyBookingServicesTab() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const { data: wcProduct, isLoading: wcLoading } = useProviderWooCommerceProduct();
  const syncToWooCommerce = useSyncProviderToWooCommerce();
  const { serviceTypes, serviceTypeBySlug } = useServiceTypes();

  const [rows, setRows] = useState<ServiceResourceRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Hydrate rows from the WC product's `_service_packages` meta.
  useEffect(() => {
    if (loaded) return;
    if (!wcProduct) return;
    try {
      const meta = (wcProduct as any).meta_data || [];
      const raw = meta.find?.((m: any) => m.key === "_service_packages")?.value;
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        setRows((Array.isArray(parsed) ? parsed : []).map((p: any) => ({
          serviceTypeSlug: String(p.serviceTypeSlug || ""),
          locationSlug: String(p.locationSlug || "in-person"),
          ratePerHour: String(p.ratePerHour ?? ""),
        })));
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, [wcProduct, loaded]);

  const composeName = (typeSlug: string, locSlug: string) => {
    const name = serviceTypeBySlug.get(typeSlug)?.name || typeSlug || "";
    const loc = LOCATION_OPTIONS.find(l => l.slug === locSlug)?.label || "";
    if (!name) return "";
    return loc ? `${name} · ${loc}` : name;
  };

  const valid = useMemo(
    () => rows.filter(r => r.serviceTypeSlug && r.ratePerHour),
    [rows],
  );

  const updateRow = (i: number, patch: Partial<ServiceResourceRow>) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addRow = () =>
    setRows(prev => [...prev, { serviceTypeSlug: "", locationSlug: "in-person", ratePerHour: "" }]);
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

  const handlePublishService = async () => {
    try {
      // First "publish" creates the WC Bookings product under the vendor's
      // Dokan store with zero packages — the editor below will then become
      // active so the provider can add their first package.
      await syncToWooCommerce.mutateAsync({
        hourlyRate: Number(profile?.care_provider_starts_hourly_rate) || 0,
        bio: profile?.bio || "",
        specialties: [],
        certifications: profile?.certifications || [],
        yearsOfExperience: Number(profile?.years_of_experience) || 0,
        location: profile?.location || "",
        providerIsActive: profile?.provider_is_active ?? true,
        serviceResources: [],
      });
      toast({ title: isZh ? "护理服务已发布" : "Care service published" });
    } catch (e: any) {
      toast({ title: isZh ? "发布失败" : "Failed to publish", description: e.message, variant: "destructive" });
    }
  };

  const handleSavePackages = async () => {
    try {
      const cleaned = valid.map(r => ({
        name: composeName(r.serviceTypeSlug, r.locationSlug),
        serviceTypeSlug: r.serviceTypeSlug,
        locationSlug: r.locationSlug || "in-person",
        ratePerHour: parseFloat(r.ratePerHour) || 0,
      })).filter(r => r.name);

      const firstRate = cleaned[0]?.ratePerHour
        || Number(profile?.care_provider_starts_hourly_rate)
        || 0;

      await syncToWooCommerce.mutateAsync({
        hourlyRate: firstRate,
        bio: profile?.bio || "",
        specialties: cleaned.map(r => r.name),
        certifications: profile?.certifications || [],
        yearsOfExperience: Number(profile?.years_of_experience) || 0,
        location: profile?.location || "",
        providerIsActive: profile?.provider_is_active ?? true,
        serviceResources: cleaned,
      });
      toast({
        title: isZh ? "服务套餐已保存" : "Service packages saved",
        description: isZh ? "已同步到 WooCommerce Bookings" : "Synced to WooCommerce Bookings",
      });
    } catch (e: any) {
      toast({ title: isZh ? "保存失败" : "Save failed", description: e.message, variant: "destructive" });
    }
  };

  if (wcLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── State 1: No product yet → big "Publish my care service" CTA ───────
  if (!wcProduct) {
    return (
      <Card className="border-transparent card-elevated">
        <CardContent className="p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isZh ? "发布您的护理服务" : "Publish your care service"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            {isZh
              ? "一键创建您的护理服务，自动同步到平台市场。之后您可以添加不同的服务类型和价格。"
              : "One click creates your bookable service on the marketplace. After that you can add service packages with different categories and prices."}
          </p>
          <Button
            variant="coral"
            size="lg"
            onClick={handlePublishService}
            disabled={syncToWooCommerce.isPending}
          >
            {syncToWooCommerce.isPending
              ? (isZh ? "创建中…" : "Creating…")
              : <><Plus className="h-4 w-4 mr-1.5" /> {isZh ? "发布我的护理服务" : "Publish my care service"}</>}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── State 2/3: Product exists → show the package editor ───────────────
  return (
    <div className="space-y-6">
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> {isZh ? "服务套餐" : "Service Packages"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isZh
              ? "为每个套餐选择服务类型、提供方式（上门 / 远程 / 两者皆可）和小时价格。客户结算时按 价格 × 小时 计算。"
              : <>For each package, pick the <span className="font-medium">service category</span>, where you deliver it (<span className="font-medium">In-Person</span>, <span className="font-medium">Remote</span>, or <span className="font-medium">Both</span>), and your hourly rate. Total = rate × hours booked.</>}
          </p>

          {rows.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {isZh ? "暂无套餐。" : "No packages yet."}
              </p>
              <Button variant="coral" size="sm" onClick={addRow}>
                <Plus className="h-3.5 w-3.5 mr-1" /> {isZh ? "添加套餐" : "Add package"}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border bg-card">
                    <Select value={row.serviceTypeSlug} onValueChange={v => updateRow(idx, { serviceTypeSlug: v })}>
                      <SelectTrigger className="col-span-5 h-9">
                        <SelectValue placeholder={isZh ? "服务类型" : "Service type"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {serviceTypes.map(st => (
                          <SelectItem key={st.slug} value={st.slug}>{st.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={row.locationSlug || "in-person"} onValueChange={v => updateRow(idx, { locationSlug: v })}>
                      <SelectTrigger className="col-span-3 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map(l => (
                          <SelectItem key={l.slug} value={l.slug}>
                            {l.slug === "in-person" ? (isZh ? "上门" : "In-Person")
                              : l.slug === "remote" ? (isZh ? "远程" : "Remote")
                              : (isZh ? "两者皆可" : "Both")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="col-span-3 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <Input
                        type="number" min="0" step="5"
                        className="h-9 text-sm text-right"
                        value={row.ratePerHour}
                        onChange={e => updateRow(idx, { ratePerHour: e.target.value })}
                        placeholder="50"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">/hr</span>
                    </div>

                    <Button
                      variant="ghost" size="icon"
                      className="col-span-1 h-8 w-8 text-muted-foreground hover:text-destructive justify-self-end"
                      onClick={() => removeRow(idx)}
                      aria-label={isZh ? "删除套餐" : "Remove package"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addRow} className="w-full">
                <Plus className="h-3.5 w-3.5 mr-1" /> {isZh ? "添加另一个套餐" : "Add another package"}
              </Button>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            {isZh
              ? "提示：客户也可在聊天中协商自定义价格——不需要在此列出。"
              : "Tip: clients can also negotiate a custom price in chat — those don't need to be listed here."}
          </p>

          {rows.length > 0 && (
            <Button
              variant="coral"
              className="w-full"
              onClick={handleSavePackages}
              disabled={syncToWooCommerce.isPending}
            >
              {syncToWooCommerce.isPending
                ? (isZh ? "保存中…" : "Saving…")
                : (isZh ? "保存服务套餐" : "Save Service Packages")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}