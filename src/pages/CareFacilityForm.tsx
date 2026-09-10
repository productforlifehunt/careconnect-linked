import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCareFacility, useCreateCareFacility, useUpdateCareFacility } from "@/hooks/use-care-data";
import {
  FACILITY_TYPE_OPTIONS,
  FACILITY_STAGE_OPTIONS,
  FACILITY_ROOM_TYPE_OPTIONS,
  FACILITY_ROOM_FACILITY_OPTIONS,
  FACILITY_COMMUNITY_FACILITY_OPTIONS,
  FACILITY_PEOPLE_NUMBER_OPTIONS,
  toCodeList,
  type FacilityOption,
} from "@/lib/facility-options";

type MultiField = "type" | "dementia_stage" | "room_type" | "room_facility" | "community_facility";

type FacilityFormState = {
  name: string;
  description: string;
  type: string[];
  dementia_stage: string[];
  room_type: string[];
  room_facility: string[];
  community_facility: string[];
  people_number: string;
  location: string;
  address: string;
  phone: string;
  email: string;
};

const emptyForm: FacilityFormState = {
  name: "",
  description: "",
  type: [],
  dementia_stage: [],
  room_type: [],
  room_facility: [],
  community_facility: [],
  people_number: "",
  location: "",
  address: "",
  phone: "",
  email: "",
};

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
      type: toCodeList(facility.type),
      dementia_stage: toCodeList(facility.dementia_stage),
      room_type: toCodeList(facility.room_type),
      room_facility: toCodeList(facility.room_facility),
      community_facility: toCodeList(facility.community_facility),
      people_number: String(facility.people_number || ""),
      location: facility.location || "",
      address: facility.address || "",
      phone: facility.phone || "",
      email: facility.email || "",
    });
  }, [facility]);

  const toggleMulti = (field: MultiField, code: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(code) ? prev[field].filter((item) => item !== code) : [...prev[field], code],
    }));
  };

  const CheckboxGroup = ({ label, field, options }: { label: string; field: MultiField; options: FacilityOption[] }) => (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <label key={`${field}-${opt.code}`} className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer">
            <Checkbox
              aria-label={`${label}: ${isZh ? opt.zh : opt.en}`}
              checked={form[field].includes(opt.code)}
              onCheckedChange={() => toggleMulti(field, opt.code)}
            />
            <span className="text-sm">{isZh ? opt.zh : opt.en}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: isZh ? "请填写机构名称" : "Please enter a facility name", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: form.type,
        dementia_stage: form.dementia_stage,
        room_type: form.room_type,
        room_facility: form.room_facility,
        community_facility: form.community_facility,
        people_number: form.people_number || null,
        location: form.location.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
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
          <div>
            <Label>{isZh ? "机构名称" : "Facility name"}</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="mt-1" />
          </div>

          <div>
            <Label>{isZh ? "机构简介" : "Description"}</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={5} className="mt-1" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <CheckboxGroup label={isZh ? "机构类型" : "Facility type"} field="type" options={FACILITY_TYPE_OPTIONS} />
            <CheckboxGroup label={isZh ? "可照护的失智症阶段" : "Dementia stages cared for"} field="dementia_stage" options={FACILITY_STAGE_OPTIONS} />
            <CheckboxGroup label={isZh ? "房型" : "Room types"} field="room_type" options={FACILITY_ROOM_TYPE_OPTIONS} />
            <CheckboxGroup label={isZh ? "房间设施" : "Room facilities"} field="room_facility" options={FACILITY_ROOM_FACILITY_OPTIONS} />
            <CheckboxGroup label={isZh ? "公共设施" : "Community facilities"} field="community_facility" options={FACILITY_COMMUNITY_FACILITY_OPTIONS} />
            <div>
              <Label className="mb-2 block">{isZh ? "入住人数规模" : "Number of residents"}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FACILITY_PEOPLE_NUMBER_OPTIONS.map((opt) => (
                  <label key={opt.code} className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer">
                    <input
                      type="radio"
                      name="people-number"
                      checked={form.people_number === opt.code}
                      onChange={() => setForm((p) => ({ ...p, people_number: opt.code }))}
                    />
                    <span className="text-sm">{isZh ? opt.zh : opt.en}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{isZh ? "所在地区" : "Location"}</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder={isZh ? "如：北京市朝阳区" : "e.g. Central Region"}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{isZh ? "详细地址" : "Address"}</Label>
              <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>{isZh ? "联系电话" : "Phone"}</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>{isZh ? "邮箱" : "Email"}</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="mt-1" />
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
