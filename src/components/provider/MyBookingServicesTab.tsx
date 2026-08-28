import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Shield, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-care-data";
import { CARE_SERVICE_TYPES, SERVICE_DELIVERY_MODES } from "@/lib/care-service-types";
import { useToast } from "@/hooks/use-toast";

/**
 * Provider Dashboard → "My Care Services" tab.
 *
 * Everything on this screen is stored in the JetEngine CCT 258 record only:
 *   a65 delivery modes · a68 care service types ·
 *   a66 in-person $/hr · a67 remote $/hr · a69 remote check-in · a70 remote
 *   medication reminder · a63 cancellation policy.
 *
 * No WooCommerce/Dokan call happens here. A Woo product is created just in
 * time when a client adds one of these services to their cart.
 */

export default function MyBookingServicesTab() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [delivery, setDelivery] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [rateInPerson, setRateInPerson] = useState("");
  const [rateRemote, setRateRemote] = useState("");
  const [rateCheckin, setRateCheckin] = useState("");
  const [rateMedicine, setRateMedicine] = useState("");
  const [cancellation, setCancellation] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profile || loaded) return;
    setDelivery(profile.service_location_slugs || []);
    setServices(profile.service_type_slugs || []);
    setRateInPerson(profile.care_provider_hourly_rate_in_person?.toString() || "");
    setRateRemote(profile.care_provider_hourly_rate_remote?.toString() || "");
    setRateCheckin(profile.care_provider_rate_remote_checkin?.toString() || "");
    setRateMedicine(profile.care_provider_rate_remote_medicine?.toString() || "");
    setCancellation(profile.care_provider_cancellation_policy || "");
    setLoaded(true);
  }, [profile, loaded]);

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);

  const num = (v: string) => (v.trim() === "" ? null : parseFloat(v));

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        service_location_slugs: delivery,
        service_type_slugs: services,
        care_provider_hourly_rate_in_person: num(rateInPerson),
        care_provider_hourly_rate_remote: num(rateRemote),
        care_provider_rate_remote_checkin: num(rateCheckin),
        care_provider_rate_remote_medicine: num(rateMedicine),
        care_provider_cancellation_policy: cancellation,
      });
      toast({
        title: isZh ? "服务与价格已保存" : "Services and rates saved",
        description: isZh
          ? "客户现在可以在搜索中看到这些服务和价格。"
          : "Clients can now see these services and rates in search.",
      });
    } catch (e: any) {
      toast({
        title: isZh ? "保存失败" : "Save failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rateFields: { label: string; value: string; set: (v: string) => void; suffix: string }[] = [
    {
      label: isZh ? "上门服务（每小时）" : "In-person care (per hour)",
      value: rateInPerson, set: setRateInPerson, suffix: isZh ? "/小时" : "/hr",
    },
    {
      label: isZh ? "远程服务（每小时）" : "Remote care (per hour)",
      value: rateRemote, set: setRateRemote, suffix: isZh ? "/小时" : "/hr",
    },
    {
      label: isZh ? "远程签到（每次）" : "Remote check-in (each)",
      value: rateCheckin, set: setRateCheckin, suffix: isZh ? "/次" : "/each",
    },
    {
      label: isZh ? "远程用药提醒（每次）" : "Remote medication reminder (each)",
      value: rateMedicine, set: setRateMedicine, suffix: isZh ? "/次" : "/each",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> {isZh ? "我提供的服务" : "Services I offer"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              {isZh ? "服务方式" : "How you deliver care"}
            </Label>
            <div className="flex flex-wrap gap-4">
              {SERVICE_DELIVERY_MODES.map(mode => (
                <label key={mode.slug} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={delivery.includes(mode.slug)}
                    onCheckedChange={() => toggle(delivery, mode.slug, setDelivery)}
                  />
                  <span className="text-sm">{isZh ? mode.zh : mode.en}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">
              {isZh ? "服务类型" : "Care service types"}
            </Label>
            <div className="grid sm:grid-cols-2 gap-2">
              {CARE_SERVICE_TYPES.map(st => (
                <label key={st.slug} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={services.includes(st.slug)}
                    onCheckedChange={() => toggle(services, st.slug, setServices)}
                  />
                  <span className="text-sm">{isZh ? st.zh : st.en}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> {isZh ? "我的价格" : "My rates"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isZh
              ? "只填写您真正提供的服务价格，留空的项目不会显示给客户。客户也可以在聊天中与您商定其他价格。"
              : "Fill in only the rates you actually offer — anything left blank stays hidden from clients. Clients can also agree a different price with you in chat."}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {rateFields.map(f => (
              <div key={f.label}>
                <Label className="mb-1.5 block text-sm">{f.label}</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-sm">{isZh ? "¥" : "$"}</span>
                  <Input
                    type="number" min="0" step="5"
                    className="h-9 text-right"
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    placeholder="50"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{f.suffix}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">
              {isZh ? "取消政策" : "Cancellation policy"}
            </Label>
            <Textarea
              rows={3}
              value={cancellation}
              onChange={e => setCancellation(e.target.value)}
              placeholder={isZh
                ? "例如：提前 24 小时取消可全额退款。"
                : "For example: full refund if cancelled at least 24 hours ahead."}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        variant="coral"
        className="w-full"
        onClick={handleSave}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending
          ? (isZh ? "保存中…" : "Saving…")
          : (isZh ? "保存服务与价格" : "Save services and rates")}
      </Button>
    </div>
  );
}
