import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Building2, Globe, Loader2, Mail, MapPin, Phone, Star, Layers3, MessageSquareText, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useCareFacility,
  useClaimFacilityOwnership,
  useCreateFacilityOwnershipDispute,
  useCreateReview,
  useFacilityMembers,
  useFacilityOwnershipClaims,
  useFacilityOwnershipDisputes,
  useFacilityReviews,
  useMyFacilityPermission,
} from "@/hooks/use-care-data";

function normalizeList(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value];
  return [] as string[];
}

function formatFacilityToken(value: string) {
  return value.replace(/_/g, " ");
}

function getFacilityAddress(facility: any, isZh: boolean) {
  if (isZh) {
    return [facility.country, facility.c_province, facility.c_city, facility.c_district, facility.c_town, facility.c_village, facility.address]
      .filter(Boolean)
      .join(" ");
  }
  return [facility.location, facility.address, facility.country].filter(Boolean).join(", ");
}

export default function CareFacilityProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const isZh = i18n.language?.startsWith("zh");
  const { data: facility, isLoading } = useCareFacility(id);
  const { data: reviews } = useFacilityReviews(id);
  const { data: facilityPermission } = useMyFacilityPermission(id);
  const { data: facilityMembers } = useFacilityMembers(id);
  const { data: ownershipClaims } = useFacilityOwnershipClaims(id);
  const { data: ownershipDisputes } = useFacilityOwnershipDisputes(id);
  const createReview = useCreateReview();
  const claimFacilityOwnership = useClaimFacilityOwnership();
  const createOwnershipDispute = useCreateFacilityOwnershipDispute();

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [claimRole, setClaimRole] = useState("");
  const [claimProof, setClaimProof] = useState("");
  const [claimAttachmentUrls, setClaimAttachmentUrls] = useState("");
  const [disputeProof, setDisputeProof] = useState("");
  const [disputeAttachmentUrls, setDisputeAttachmentUrls] = useState("");

  const services = useMemo(() => {
    if (!facility) return [];
    return [...normalizeList(facility.service_category), ...normalizeList(facility.service_type)];
  }, [facility]);

  const serviceCategories = useMemo(() => normalizeList(facility?.service_category), [facility]);
  const serviceTypes = useMemo(() => normalizeList(facility?.service_type), [facility]);
  const reviewStats = useMemo(() => {
    const list = reviews || [];
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
    list.forEach((review: any) => {
      const key = Math.max(1, Math.min(5, Number(review.rating) || 0));
      if (counts[key] !== undefined) counts[key] += 1;
    });
    return counts;
  }, [reviews]);
  const reviewSummary = useMemo(() => {
    const list = reviews || [];
    if (!list.length) return { average: null as number | null, count: 0 };
    const total = list.reduce((sum, review: any) => sum + (Number(review.rating) || 0), 0);
    return {
      average: Math.round((total / list.length) * 10) / 10,
      count: list.length,
    };
  }, [reviews]);
  const ownerMembers = useMemo(() => (facilityMembers || []).filter((member) => member.is_owner), [facilityMembers]);
  const adminMembers = useMemo(() => (facilityMembers || []).filter((member) => !member.is_owner && member.is_admin), [facilityMembers]);
  const regularMembers = useMemo(() => (facilityMembers || []).filter((member) => !member.is_owner && !member.is_admin), [facilityMembers]);
  const hasOwner = ownerMembers.length > 0;
  const myMembership = facilityPermission?.membership || null;
  const approvedClaim = useMemo(() => (ownershipClaims || []).find((item) => item.status === "approved") || null, [ownershipClaims]);
  const latestDispute = useMemo(() => (ownershipDisputes || [])[0] || null, [ownershipDisputes]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-muted-foreground">{isZh ? "未找到机构" : "Facility not found"}</p>
        <Button variant="outline" onClick={() => navigate("/search?service_category=facility")}>
          {isZh ? "返回机构搜索" : "Back to facility search"}
        </Button>
      </div>
    );
  }

  const fullAddress = getFacilityAddress(facility, isZh);

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Button>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-transparent card-elevated overflow-hidden">
            <div className="h-48 sm:h-56 bg-muted overflow-hidden">
              <img src={facility.image_url || facility.avatar_url || "/placeholder.svg"} alt={facility.name} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{facility.name}</h1>
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning fill-warning" /> {reviewSummary.average?.toFixed(1) || t("common.new")} ({reviewSummary.count} {t("common.reviews")})</span>
                      {fullAddress && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {fullAddress}</span>}
                      <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {facility.country || (isZh ? "中国" : "Global")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {facility.type && <Badge variant="outline">{formatFacilityToken(facility.type)}</Badge>}
                    {services.map((service) => (
                      <Badge key={service} variant="secondary" className="bg-accent text-accent-foreground">{formatFacilityToken(service)}</Badge>
                    ))}
                  </div>

                  {facility.description && (
                    <p className="text-muted-foreground leading-relaxed">{facility.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{isZh ? "综合评分" : "Overall rating"}</div>
                <div className="text-2xl font-bold text-foreground">{reviewSummary.average?.toFixed(1) || "--"}</div>
              </CardContent>
            </Card>
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{isZh ? "评价数量" : "Review count"}</div>
                <div className="text-2xl font-bold text-foreground">{reviewSummary.count}</div>
              </CardContent>
            </Card>
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{isZh ? "机构类型" : "Facility type"}</div>
                <div className="text-base font-semibold text-foreground">{facility.type ? formatFacilityToken(facility.type) : (isZh ? "未填写" : "Not specified")}</div>
              </CardContent>
            </Card>
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{isZh ? "服务标签" : "Service tags"}</div>
                <div className="text-2xl font-bold text-foreground">{services.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-transparent card-elevated">
            <CardHeader>
              <CardTitle>{isZh ? "机构简介与服务" : "About this facility"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              {facility.description && <p className="leading-relaxed">{facility.description}</p>}
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="rounded-xl border p-4">
                  <div className="font-medium text-foreground mb-2">{isZh ? "机构类型" : "Facility type"}</div>
                  <div>{facility.type ? formatFacilityToken(facility.type) : (isZh ? "未填写" : "Not specified")}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-medium text-foreground mb-2 flex items-center gap-2"><Layers3 className="h-4 w-4" />{isZh ? "服务分类" : "Service categories"}</div>
                  <div>{serviceCategories.length > 0 ? serviceCategories.map((item) => formatFacilityToken(item)).join(isZh ? "、" : ", ") : (isZh ? "未填写" : "Not specified")}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-medium text-foreground mb-2">{isZh ? "服务项目" : "Service types"}</div>
                  <div>{serviceTypes.length > 0 ? serviceTypes.map((item) => formatFacilityToken(item)).join(isZh ? "、" : ", ") : (isZh ? "未填写" : "Not specified")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader>
              <CardTitle>{isZh ? "地址与服务范围" : "Location & coverage"}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              {isZh ? (
                <>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium text-foreground mb-2">{isZh ? "国家/地区" : "Country"}</div>
                    <div>{facility.country || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium text-foreground mb-2">{isZh ? "省份" : "Province"}</div>
                    <div>{facility.c_province || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium text-foreground mb-2">{isZh ? "城市" : "City"}</div>
                    <div>{facility.c_city || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium text-foreground mb-2">{isZh ? "区/县" : "District"}</div>
                    <div>{facility.c_district || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium text-foreground mb-2">{isZh ? "镇/街道" : "Town"}</div>
                    <div>{facility.c_town || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium text-foreground mb-2">{isZh ? "村/社区与详细地址" : "Village / address"}</div>
                    <div>{[facility.c_village, facility.address].filter(Boolean).join(" ") || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium text-foreground mb-2">{isZh ? "国家" : "Country"}</div>
                    <div>{facility.country || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium text-foreground mb-2">{isZh ? "地区" : "Region / locality"}</div>
                    <div>{facility.location || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                  <div className="rounded-xl border p-4 sm:col-span-2">
                    <div className="font-medium text-foreground mb-2">{isZh ? "详细地址" : "Address"}</div>
                    <div>{facility.address || (isZh ? "未填写" : "Not specified")}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{isZh ? `评价（${reviews?.length || 0}）` : `Reviews (${reviews?.length || 0})`}</CardTitle>
                <Dialog
                  open={reviewDialogOpen}
                  onOpenChange={(open) => {
                    if (open && !isAuthenticated) {
                      toast({ title: isZh ? "请先登录后评价" : "Please sign in to write a review", variant: "destructive" });
                      navigate("/auth");
                      return;
                    }
                    setReviewDialogOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="coral" size="sm"><Star className="h-3.5 w-3.5 mr-1" />{isZh ? "写评价" : "Write Review"}</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>{isZh ? `评价 ${facility.name}` : `Review ${facility.name}`}</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="mb-2 block">{t("common.rating")}</Label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} type="button" onClick={() => setReviewRating(s)} className="focus:outline-none">
                              <Star className={`h-7 w-7 cursor-pointer transition-colors ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>{isZh ? "评价内容" : "Comment"}</Label>
                        <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder={isZh ? "分享您对机构环境、服务、照护质量的体验..." : "Share your experience with the environment, staff, and care quality..."} rows={4} />
                      </div>
                      <Button
                        variant="coral"
                        className="w-full"
                        disabled={createReview.isPending}
                        onClick={async () => {
                          try {
                            await createReview.mutateAsync({ entity_id: facility.id, rating: reviewRating, comment: reviewComment, entity_type: "facility" });
                            toast({ title: isZh ? "评价已提交" : "Review submitted", description: isZh ? "感谢您的反馈。" : "Thank you for your feedback." });
                            setReviewDialogOpen(false);
                            setReviewRating(5);
                            setReviewComment("");
                          } catch (err: any) {
                            toast({ title: isZh ? "提交评价失败" : "Failed to submit review", description: err.message, variant: "destructive" });
                          }
                        }}
                      >
                        {createReview.isPending ? t("common.loading") : (isZh ? "提交评价" : "Submit Review")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-[220px_1fr] gap-6">
                <div className="rounded-2xl border p-5 bg-muted/20">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{isZh ? "口碑概览" : "Review snapshot"}</div>
                  <div className="text-4xl font-bold text-foreground mb-1">{reviewSummary.average?.toFixed(1) || "--"}</div>
                  <div className="text-sm text-muted-foreground mb-4">{isZh ? `${reviewSummary.count} 条公开评价` : `${reviewSummary.count} published reviews`}</div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((score) => {
                      const total = Math.max(1, reviews?.length || 0);
                      const count = reviewStats[score] || 0;
                      const width = `${(count / total) * 100}%`;
                      return (
                        <div key={score} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-8">{score}★</span>
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width }} />
                          </div>
                          <span className="w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl border p-5 bg-muted/10 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground mb-2 flex items-center gap-2"><MessageSquareText className="h-4 w-4" />{isZh ? "专业评价说明" : "Professional review note"}</div>
                  <p>
                    {isZh
                      ? "当前评价模块严格基于现有字段：总评分、评论内容、发布时间、评价者信息与评论回复。后续如你确认分项评分字段，我们再升级为环境、护理质量、安全、沟通、性价比等专业维度。"
                      : "The current review module is intentionally constrained to confirmed fields only: overall rating, comment text, published time, reviewer profile, and threaded replies. Once you confirm sub-rating fields, I can upgrade this into professional dimensions such as environment, care quality, safety, communication, and value."}
                  </p>
                </div>
              </div>

              {(reviews || []).length > 0 ? (reviews || []).map((review: any) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <span className="font-medium text-sm text-foreground">{review.reviewer?.full_name || t("common.anonymous")}</span>
                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString(isZh ? "zh-CN" : "en", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 text-warning fill-warning" />
                    ))}
                  </div>
                  {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
                  <CommentsSection entityType="review" entityId={review.id} compact />
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">{isZh ? "还没有评价" : "No reviews yet"}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-transparent card-elevated sticky top-24">
            <CardHeader>
              <CardTitle>{isZh ? "联系与信息" : "Contact & information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {fullAddress && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{fullAddress}</span>
                </div>
              )}
              {(facility.phone_number || facility.phone) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{facility.phone_number || facility.phone}</span>
                </div>
              )}
              {facility.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{facility.email}</span>
                </div>
              )}

              {(facility.phone_number || facility.phone) && (
                <Button className="w-full" asChild>
                  <a href={`tel:${facility.phone_number || facility.phone}`}>
                    <Phone className="mr-2 h-4 w-4" /> {isZh ? "拨打电话" : "Call facility"}
                  </a>
                </Button>
              )}
              {facilityPermission?.canEdit && (
                <Button variant="outline" className="w-full" onClick={() => navigate(`/facilities/${facility.id}/edit`)}>
                  <Building2 className="mr-2 h-4 w-4" /> {isZh ? "编辑机构资料" : "Edit facility profile"}
                </Button>
              )}
              {!hasOwner && !myMembership && (
                <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="coral" className="w-full">
                      <ShieldCheck className="mr-2 h-4 w-4" /> {isZh ? "认领为场所所有者" : "Claim ownership"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{isZh ? "认领该护理场所" : "Claim this facility"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>{isZh ? "你的角色" : "Your role"}</Label>
                        <Input value={claimRole} onChange={(e) => setClaimRole(e.target.value)} placeholder={isZh ? "例如 CEO、院长、运营负责人" : "e.g. CEO, Director, Operations Lead"} className="mt-1" />
                      </div>
                      <div>
                        <Label>{isZh ? "认领证明" : "Claim proof"}</Label>
                        <Textarea value={claimProof} onChange={(e) => setClaimProof(e.target.value)} placeholder={isZh ? "可填写身份、公司邮箱、与该机构的关系等；可留空" : "Describe your identity, company email, or relationship to this facility; optional"} rows={4} className="mt-1" />
                      </div>
                      <div>
                        <Label>{isZh ? "证明附件链接" : "Proof attachment URLs"}</Label>
                        <Textarea value={claimAttachmentUrls} onChange={(e) => setClaimAttachmentUrls(e.target.value)} placeholder={isZh ? "每行一个图片 URL，或用逗号分隔" : "One image URL per line, or comma-separated"} rows={3} className="mt-1" />
                      </div>
                      <Button
                        variant="coral"
                        className="w-full"
                        disabled={claimFacilityOwnership.isPending}
                        onClick={async () => {
                          if (!isAuthenticated) {
                            toast({ title: isZh ? "请先登录" : "Please sign in first", variant: "destructive" });
                            navigate("/auth");
                            return;
                          }
                          try {
                            await claimFacilityOwnership.mutateAsync({
                              facilityId: facility.id,
                              evidenceText: [claimRole.trim(), claimProof.trim(), claimAttachmentUrls.trim()].filter(Boolean).join('\n') || undefined,
                            });
                            toast({ title: isZh ? "已自动批准认领" : "Ownership claim approved" });
                            setClaimDialogOpen(false);
                            setClaimRole("");
                            setClaimProof("");
                            setClaimAttachmentUrls("");
                          } catch (err: any) {
                            toast({ title: isZh ? "认领失败" : "Claim failed", description: err.message, variant: "destructive" });
                          }
                        }}
                      >
                        {claimFacilityOwnership.isPending ? t("common.loading") : (isZh ? "提交认领" : "Submit claim")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {hasOwner && !facilityPermission?.canEdit && (
                <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <ShieldCheck className="mr-2 h-4 w-4" /> {isZh ? "提交所有权争议" : "Submit ownership dispute"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{isZh ? "提交场所所有权争议" : "Submit facility ownership dispute"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>{isZh ? "争议说明" : "Dispute details"}</Label>
                        <Textarea value={disputeProof} onChange={(e) => setDisputeProof(e.target.value)} placeholder={isZh ? "请说明你认为当前所有权存在问题的原因，并提供证明" : "Explain why you believe the current ownership is disputed and include your proof"} rows={5} className="mt-1" />
                      </div>
                      <div>
                        <Label>{isZh ? "附件链接" : "Attachment URLs"}</Label>
                        <Textarea value={disputeAttachmentUrls} onChange={(e) => setDisputeAttachmentUrls(e.target.value)} placeholder={isZh ? "每行一个图片 URL，或用逗号分隔" : "One image URL per line, or comma-separated"} rows={3} className="mt-1" />
                      </div>
                      <Button
                        className="w-full"
                        disabled={createOwnershipDispute.isPending}
                        onClick={async () => {
                          if (!isAuthenticated) {
                            toast({ title: isZh ? "请先登录" : "Please sign in first", variant: "destructive" });
                            navigate("/auth");
                            return;
                          }
                          try {
                            await createOwnershipDispute.mutateAsync({
                              facilityId: facility.id,
                              reason: [disputeProof.trim(), disputeAttachmentUrls.trim()].filter(Boolean).join('\n'),
                            });
                            toast({ title: isZh ? "争议已提交，等待站主处理" : "Dispute submitted for manual review" });
                            setDisputeDialogOpen(false);
                            setDisputeProof("");
                            setDisputeAttachmentUrls("");
                          } catch (err: any) {
                            toast({ title: isZh ? "提交争议失败" : "Failed to submit dispute", description: err.message, variant: "destructive" });
                          }
                        }}
                      >
                        {createOwnershipDispute.isPending ? t("common.loading") : (isZh ? "提交争议" : "Submit dispute")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {facility.website_url && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={facility.website_url} target="_blank" rel="noreferrer">
                    <Globe className="mr-2 h-4 w-4" /> {isZh ? "访问网站" : "Visit website"}
                  </a>
                </Button>
              )}
              {fullAddress && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`} target="_blank" rel="noreferrer">
                    <MapPin className="mr-2 h-4 w-4" /> {t("common.directions")}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />{isZh ? "场所成员与所有权" : "Team & ownership"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">{isZh ? "所有者" : "Owners"}</div>
                {ownerMembers.length > 0 ? ownerMembers.map((member) => (
                  <div key={member.id} className="rounded-xl border p-3">
                    <div className="font-medium text-foreground">{member.profile?.full_name || member.profile?.email || member.user_id}</div>
                    <div className="text-muted-foreground">{member.role || (isZh ? "未填写角色" : "No role provided")}</div>
                  </div>
                )) : (
                  <div className="rounded-xl border p-3 text-muted-foreground">{isZh ? "当前还没有 owner，被认领时会自动批准并备案。" : "This facility does not have an owner yet. The first ownership claim is auto-approved and recorded."}</div>
                )}
              </div>

              {adminMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">{isZh ? "管理员" : "Admins"}</div>
                  {adminMembers.map((member) => (
                    <div key={member.id} className="rounded-xl border p-3">
                      <div className="font-medium text-foreground">{member.profile?.full_name || member.profile?.email || member.user_id}</div>
                      <div className="text-muted-foreground">{member.role || (isZh ? "未填写角色" : "No role provided")}</div>
                    </div>
                  ))}
                </div>
              )}

              {regularMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">{isZh ? "团队成员" : "Members"}</div>
                  {regularMembers.map((member) => (
                    <div key={member.id} className="rounded-xl border p-3">
                      <div className="font-medium text-foreground">{member.profile?.full_name || member.profile?.email || member.user_id}</div>
                      <div className="text-muted-foreground">{member.role || (isZh ? "未填写角色" : "No role provided")}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border p-4 bg-muted/20 space-y-2">
                <div className="font-medium text-foreground">{isZh ? "最近一次 owner 备案" : "Latest ownership record"}</div>
                <div className="text-muted-foreground">{approvedClaim ? (approvedClaim.claim || (isZh ? "未填写认领说明" : "No claim text provided")) : (isZh ? "暂无备案记录" : "No ownership record yet")}</div>
                {approvedClaim?.attachment_urls && approvedClaim.attachment_urls.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {approvedClaim.attachment_urls.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="text-primary underline break-all">{url}</a>
                    ))}
                  </div>
                )}
              </div>

              {latestDispute && (
                <div className="rounded-xl border p-4 bg-muted/20 space-y-2">
                  <div className="font-medium text-foreground">{isZh ? "最近一次争议提交" : "Latest dispute submission"}</div>
                  <div className="text-muted-foreground">{latestDispute.claim || (isZh ? "未填写争议说明" : "No dispute details provided")}</div>
                  <div className="text-xs text-muted-foreground">{isZh ? `状态：${latestDispute.status || "pending"}` : `Status: ${latestDispute.status || "pending"}`}</div>
                  {latestDispute.reject_reason && <div className="text-xs text-destructive">{latestDispute.reject_reason}</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
