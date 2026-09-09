import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCareFacility, useCreateCareFacility, useUpdateCareFacility } from "@/hooks/use-care-data";

const FACILITY_TYPES = ["care_home", "nursing_home", "memory_care", "assisted_living"];
const SERVICE_OPTIONS = [
  "memory_care",
  "nursing_care",
  "rehabilitation",
  "respite_care",
  "day_care",
  "dementia_support",
  "family_support",
  "long_term_care",
  "assisted_living",
  "senior_living",
  "daily_support",
  "wellness_programs",
  "residential_care",
  "short_stay",
];

type FacilityFormState = {
  name: string;
  description: string;
  type: string;
  service_category: string[];
  service_type: string[];
  country: string;
  c_province: string;
  c_city: string;
  c_district: string;
  c_town: string;
  c_village: string;
  address: string;
  location: string;
  phone: string;
  phone_number: string;
  email: string;
  website_url: string;
  avatar_url: string;
  image_url: string;
};

const emptyForm: FacilityFormState = {
  name: "",
  description: "",
  type: "",
  service_category: [],
  service_type: [],
  country: "",
  c_province: "",
  c_city: "",
  c_district: "",
  c_town: "",
  c_village: "",
  address: "",
  location: "",
  phone: "",
  phone_number: "",
  email: "",
  website_url: "",
  avatar_url: "",
  image_url: "",
};

function formatToken(value: string) {
  return value.replace(/_/g, " ");
}

export default function CareFacilityForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const { data: facility, isLoading } = useCareFacility(id);
  const createFacility = useCreateCareFacility();
  const updateFacility = useUpdateCareFacility();
  const [form, setForm] = useState<FacilityFormState>(emptyForm);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerRole, setOwnerRole] = useState("");
  const [ownershipClaim, setOwnershipClaim] = useState("");
  const [ownershipAttachmentUrls, setOwnershipAttachmentUrls] = useState("");

  useEffect(() => {
    if (!facility) return;
    setForm({
      name: facility.name || "",
      description: facility.description || "",
      type: facility.type || "",
      service_category: Array.isArray(facility.service_category) ? facility.service_category : facility.service_category ? [facility.service_category] : [],
      service_type: Array.isArray(facility.service_type) ? facility.service_type : facility.service_type ? [facility.service_type] : [],
      country: facility.country || "",
      c_province: facility.c_province || "",
      c_city: facility.c_city || "",
      c_district: facility.c_district || "",
      c_town: facility.c_town || "",
      c_village: facility.c_village || "",
      address: facility.address || "",
      location: facility.location || "",
      phone: facility.phone || "",
      phone_number: facility.phone_number || "",
      email: facility.email || "",
      website_url: facility.website_url || "",
      avatar_url: facility.avatar_url || "",
      image_url: facility.image_url || "",
    });
  }, [facility]);

  const isChinaMode = useMemo(() => {
    return form.country.includes("中国") || isZh;
  }, [form.country, isZh]);

  const toggleMulti = (field: "service_category" | "service_type", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: isZh ? "请填写机构名称" : "Please enter a facility name", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: form.type || null,
        service_category: form.service_category.length ? form.service_category : null,
        service_type: form.service_type.length ? form.service_type : null,
        country: form.country.trim() || null,
        c_province: form.c_province.trim() || null,
        c_city: form.c_city.trim() || null,
        c_district: form.c_district.trim() || null,
        c_town: form.c_town.trim() || null,
        c_village: form.c_village.trim() || null,
        address: form.address.trim() || null,
        location: form.location.trim() || null,
        phone: form.phone.trim() || null,
        phone_number: form.phone_number.trim() || null,
        email: form.email.trim() || null,
        website_url: form.website_url.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        image_url: form.image_url.trim() || null,
      };

      if (isEditMode && id) {
        const updated = await updateFacility.mutateAsync({ id, ...payload });
        toast({ title: isZh ? "机构已更新" : "Facility updated" });
        navigate(`/facility/${updated.id}`);
      } else {
        await createFacility.mutateAsync({
          ...(payload as any),
          isOwner,
          ownerRole: ownerRole.trim() || null,
          ownershipClaim: ownershipClaim.trim() || null,
          ownershipAttachmentUrls: ownershipAttachmentUrls.trim() || null,
        });
        // A new listing is checked by our team before it goes public, so we
        // land the person back on the facility list with a plain explanation
        // instead of an empty "not found" page.
        toast({
          title: isZh ? "已提交，我们会先审核" : "Submitted — we'll check it first",
          description: isZh
            ? "审核通过后，它就会出现在机构列表里。"
            : "Once it's approved it will show up in the facility list.",
        });
        navigate("/search?service_category=facility");
      }
    } catch (err: any) {
      toast({ title: isZh ? "提交失败" : "Save failed", description: err.message, variant: "destructive" });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label={isZh ? "正在加载机构" : "Loading facility"}>
        <h1 className="sr-only">{isZh ? "编辑养老机构" : "Edit care facility"}</h1>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> {isZh ? "返回" : "Back"}
      </Button>

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <h1 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
            <Building2 className="h-5 w-5 text-primary" />
            {isEditMode ? (isZh ? "编辑养老机构" : "Edit care facility") : (isZh ? "提交养老机构" : "Submit care facility")}
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{isZh ? "机构名称" : "Facility name"}</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>{isZh ? "机构类型" : "Facility type"}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {FACILITY_TYPES.map((item) => (
                  <label key={item} className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer">
                    <input type="radio" name="facility-type" checked={form.type === item} onChange={() => setForm((p) => ({ ...p, type: item }))} />
                    <span className="text-sm">{formatToken(item)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>{isZh ? "机构简介" : "Description"}</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={5} className="mt-1" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <Label className="mb-3 block">{isZh ? "服务分类" : "Service categories"}</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_OPTIONS.map((item) => (
                  <label key={`category-${item}`} className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer">
                    <Checkbox aria-label={`${isZh ? "服务分类" : "Service category"}: ${formatToken(item)}`} checked={form.service_category.includes(item)} onCheckedChange={() => toggleMulti("service_category", item)} />
                    <span className="text-sm">{formatToken(item)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-3 block">{isZh ? "服务项目" : "Service types"}</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_OPTIONS.map((item) => (
                  <label key={`type-${item}`} className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer">
                    <Checkbox aria-label={`${isZh ? "服务项目" : "Service type"}: ${formatToken(item)}`} checked={form.service_type.includes(item)} onCheckedChange={() => toggleMulti("service_type", item)} />
                    <span className="text-sm">{formatToken(item)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Card className="bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{isZh ? "国家/地区" : "Country / region"}</Label>
                  <Input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder={isZh ? "如：中国、新加坡" : "e.g. China, Singapore"} className="mt-1" />
                </div>
                <div>
                  <Label>{isZh ? "国际地区字段" : "Global locality field"}</Label>
                  <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder={isZh ? "如：Beijing / Central Region" : "e.g. Central Region"} className="mt-1" />
                </div>
              </div>

              {isChinaMode && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>{isZh ? "省份" : "Province"}</Label>
                    <Input value={form.c_province} onChange={(e) => setForm((p) => ({ ...p, c_province: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>{isZh ? "城市" : "City"}</Label>
                    <Input value={form.c_city} onChange={(e) => setForm((p) => ({ ...p, c_city: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>{isZh ? "区/县" : "District"}</Label>
                    <Input value={form.c_district} onChange={(e) => setForm((p) => ({ ...p, c_district: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>{isZh ? "镇/街道" : "Town"}</Label>
                    <Input value={form.c_town} onChange={(e) => setForm((p) => ({ ...p, c_town: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>{isZh ? "村/社区" : "Village / community"}</Label>
                    <Input value={form.c_village} onChange={(e) => setForm((p) => ({ ...p, c_village: e.target.value }))} className="mt-1" />
                  </div>
                </div>
              )}

              <div>
                <Label>{isZh ? "详细地址" : "Address"}</Label>
                <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{isZh ? "联系电话" : "Phone"}</Label>
              <Input value={form.phone_number} onChange={(e) => setForm((p) => ({ ...p, phone_number: e.target.value, phone: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>{isZh ? "邮箱" : "Email"}</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>{isZh ? "官网网址" : "Website address"}</Label>
              <Input value={form.website_url} onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>{isZh ? "封面照片链接" : "Cover photo link"}</Label>
              <Input value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label>{isZh ? "小图片（头像）链接" : "Small photo link"}</Label>
              <Input value={form.avatar_url} onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))} className="mt-1" />
            </div>
          </div>

          {!isEditMode && (
            <Card className="bg-muted/20">
              <CardContent className="p-4 space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox aria-label={isZh ? "我是该场所的所有者" : "I am the owner of this facility"} checked={isOwner} onCheckedChange={(checked) => setIsOwner(!!checked)} />
                  <span className="text-sm font-medium">{isZh ? "我是该场所的所有者" : "I am the owner of this facility"}</span>
                </label>
                {isOwner && (
                  <div className="space-y-4">
                    <div>
                      <Label>{isZh ? "我的角色" : "My role"}</Label>
                      <Input value={ownerRole} onChange={(e) => setOwnerRole(e.target.value)} placeholder={isZh ? "例如 CEO、院长、运营负责人" : "e.g. CEO, Director, Operations Lead"} className="mt-1" />
                    </div>
                    <div>
                      <Label>{isZh ? "认领证明" : "Ownership proof"}</Label>
                      <Textarea
                        value={ownershipClaim}
                        onChange={(e) => setOwnershipClaim(e.target.value)}
                        placeholder={isZh ? "可填写你的身份、公司邮箱、与该场所的关系等；可留空" : "Describe your identity, company email, or relationship to this facility; optional"}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{isZh ? "证明照片链接" : "Links to photos of your proof"}</Label>
                      <Textarea
                        value={ownershipAttachmentUrls}
                        onChange={(e) => setOwnershipAttachmentUrls(e.target.value)}
                        placeholder={isZh ? "每行一个图片 URL，或用逗号分隔" : "One photo link per line"}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="coral" onClick={handleSubmit} disabled={createFacility.isPending || updateFacility.isPending}>
              {(createFacility.isPending || updateFacility.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isEditMode ? (isZh ? "保存修改" : "Save changes") : (isZh ? "提交机构" : "Submit facility")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
