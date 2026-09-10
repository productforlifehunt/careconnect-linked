import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Building2, Globe, Loader2, Mail, MapPin, Phone, Star, Layers3, MessageSquareText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";
import {
  useCareFacility,
  useCreateReview,
  useFacilityMembers,
  useFacilityReviews,
  useMyFacilityPermission,
  useFacilityOwnershipClaims,
  useFacilityOwnershipDisputes,
  useCreateFacilityOwnershipClaim,
  useUpdateFacilityOwnershipClaim,
} from "@/hooks/use-care-data";
import {
  FACILITY_TYPE_OPTIONS,
  FACILITY_STAGE_OPTIONS,
  FACILITY_ROOM_TYPE_OPTIONS,
  FACILITY_ROOM_FACILITY_OPTIONS,
  FACILITY_COMMUNITY_FACILITY_OPTIONS,
  FACILITY_PEOPLE_NUMBER_OPTIONS,
  facilityLabel,
  facilityLabels,
} from "@/lib/facility-options";

function getFacilityAddress(facility: any, isZh: boolean) {
  return [facility.location, facility.address].filter(Boolean).join(isZh ? " " : ", ");
}



export default function CareFacilityProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isZh = i18n.language?.startsWith("zh");
  const { data: facility, isLoading } = useCareFacility(id);
  const { data: reviews } = useFacilityReviews(id);
  const { data: facilityPermission } = useMyFacilityPermission(id);
  const { data: facilityMembers } = useFacilityMembers(id);
  const createReview = useCreateReview();
  const { data: ownershipClaims } = useFacilityOwnershipClaims(id);
  const { data: ownershipDisputes } = useFacilityOwnershipDisputes(id);
  const createClaim = useCreateFacilityOwnershipClaim();
  const decideClaim = useUpdateFacilityOwnershipClaim();

  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimIsDispute, setClaimIsDispute] = useState(false);
  const [claimText, setClaimText] = useState("");
  const [claimProof, setClaimProof] = useState("");

  const claimStatusLabel = (status: string) =>
    isZh
      ? status === "approved" ? "已通过" : status === "rejected" ? "已驳回" : "待审核"
      : status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending";

  const submitClaim = async () => {
    if (!id) return;
    try {
      await createClaim.mutateAsync({
        facility_id: id,
        claim: claimText.trim() || null,
        attachment_urls: claimProof.trim() || null,
        is_dispute: claimIsDispute,
      });
      setClaimDialogOpen(false);
      setClaimText("");
      setClaimProof("");
      toast({ title: isZh ? "已提交，等待审核" : "Submitted for review" });
    } catch (err: any) {
      toast({ title: isZh ? "提交失败" : "Submit failed", description: err.message, variant: "destructive" });
    }
  };

  const decide = async (claimId: string, status: "approved" | "rejected") => {
    try {
      await decideClaim.mutateAsync({ id: claimId, status });
      toast({ title: isZh ? "已更新" : "Updated" });
    } catch (err: any) {
      toast({ title: isZh ? "操作失败" : "Action failed", description: err.message, variant: "destructive" });
    }
  };

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const typeLabels = useMemo(() => facilityLabels(FACILITY_TYPE_OPTIONS, facility?.type, !!isZh), [facility, isZh]);
  const stageLabels = useMemo(() => facilityLabels(FACILITY_STAGE_OPTIONS, facility?.dementia_stage, !!isZh), [facility, isZh]);
  const roomTypeLabels = useMemo(() => facilityLabels(FACILITY_ROOM_TYPE_OPTIONS, facility?.room_type, !!isZh), [facility, isZh]);
  const roomFacilityLabels = useMemo(() => facilityLabels(FACILITY_ROOM_FACILITY_OPTIONS, facility?.room_facility, !!isZh), [facility, isZh]);
  const communityFacilityLabels = useMemo(() => facilityLabels(FACILITY_COMMUNITY_FACILITY_OPTIONS, facility?.community_facility, !!isZh), [facility, isZh]);
  const peopleNumberLabel = facility?.people_number ? facilityLabel(FACILITY_PEOPLE_NUMBER_OPTIONS, facility.people_number, !!isZh) : "";
  const services = useMemo(() => [...typeLabels, ...stageLabels], [typeLabels, stageLabels]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label={isZh ? "正在加载机构" : "Loading facility"}>
        <h1 className="sr-only">{isZh ? "养老机构资料" : "Care facility profile"}</h1>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-lg font-semibold text-foreground">{isZh ? "未找到机构" : "Facility not found"}</h1>
        <Button variant="outline" onClick={() => navigate("/search-care-facility")}>
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
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {typeLabels.map((label) => (
                      <Badge key={`type-${label}`} variant="outline">{label}</Badge>
                    ))}
                    {stageLabels.map((label) => (
                      <Badge key={`stage-${label}`} variant="secondary" className="bg-accent text-accent-foreground">{label}</Badge>
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
                <div className="text-base font-semibold text-foreground">{typeLabels.length ? typeLabels.join(isZh ? "、" : ", ") : (isZh ? "未填写" : "Not specified")}</div>
              </CardContent>
            </Card>
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{isZh ? "入住人数规模" : "Residents"}</div>
                <div className="text-base font-semibold text-foreground">{peopleNumberLabel || (isZh ? "未填写" : "Not specified")}</div>
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
                  <div>{typeLabels.length ? typeLabels.join(isZh ? "、" : ", ") : (isZh ? "未填写" : "Not specified")}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-medium text-foreground mb-2 flex items-center gap-2"><Layers3 className="h-4 w-4" />{isZh ? "可照护的失智症阶段" : "Dementia stages cared for"}</div>
                  <div>{stageLabels.length ? stageLabels.join(isZh ? "、" : ", ") : (isZh ? "未填写" : "Not specified")}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-medium text-foreground mb-2">{isZh ? "房型" : "Room types"}</div>
                  <div>{roomTypeLabels.length ? roomTypeLabels.join(isZh ? "、" : ", ") : (isZh ? "未填写" : "Not specified")}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-medium text-foreground mb-2">{isZh ? "房间设施" : "Room facilities"}</div>
                  <div>{roomFacilityLabels.length ? roomFacilityLabels.join(isZh ? "、" : ", ") : (isZh ? "未填写" : "Not specified")}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-medium text-foreground mb-2">{isZh ? "公共设施" : "Community facilities"}</div>
                  <div>{communityFacilityLabels.length ? communityFacilityLabels.join(isZh ? "、" : ", ") : (isZh ? "未填写" : "Not specified")}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-medium text-foreground mb-2">{isZh ? "入住人数规模" : "Number of residents"}</div>
                  <div>{peopleNumberLabel || (isZh ? "未填写" : "Not specified")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader>
              <CardTitle>{isZh ? "地址" : "Location"}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="rounded-xl border p-4">
                <div className="font-medium text-foreground mb-2">{isZh ? "所在地区" : "Region / locality"}</div>
                <div>{facility.location || (isZh ? "未填写" : "Not specified")}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-medium text-foreground mb-2">{isZh ? "详细地址" : "Address"}</div>
                <div>{facility.address || (isZh ? "未填写" : "Not specified")}</div>
              </div>
            </CardContent>
          </Card>


          <Card className="border-transparent card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{isZh ? `评价（${reviews?.length || 0}）` : `Reviews (${reviews?.length || 0})`}</CardTitle>
                {/* Facility reviews: CCT 31 Review via JetEngine Relation 294. */}
                <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      {isZh ? "写评价" : "Write a review"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isZh ? "评价这家护理机构" : "Review this care facility"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">{isZh ? "评分" : "Rating"}</Label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              aria-label={isZh ? `${s} 星` : `${s} stars`}
                              aria-pressed={s === reviewRating}
                              onClick={() => setReviewRating(s)}
                              className="min-h-11 min-w-11 flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Star className={`h-7 w-7 transition-colors ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>{isZh ? "评论" : "Comment"}</Label>
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={isZh ? "分享您的体验…" : "Share your experience..."}
                          rows={4}
                        />
                      </div>
                      <Button
                        className="w-full"
                        disabled={createReview.isPending || !id}
                        onClick={async () => {
                          try {
                            await createReview.mutateAsync({ entity_id: id!, entity_type: "facility", rating: reviewRating, comment: reviewComment });
                            toast({ title: isZh ? "评价已提交！" : "Review submitted!" });
                            setReviewDialogOpen(false);
                            setReviewRating(5);
                            setReviewComment("");
                          } catch (err: any) {
                            toast({ title: isZh ? "提交评价失败" : "Failed to submit review", description: err.message, variant: "destructive" });
                          }
                        }}
                      >
                        {createReview.isPending ? (isZh ? "提交中…" : "Submitting...") : (isZh ? "提交评价" : "Submit Review")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>


              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-[220px_1fr] gap-6">
                <div className="rounded-2xl border p-5 bg-muted/20">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{isZh ? "口碑概览" : "Ratings at a glance"}</div>
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
                      ? "评价目前只显示总评分、评价内容、发布时间、评价人和回复。"
                      : "Reviews here show the overall rating, what people wrote, when they wrote it, who wrote it, and any replies."}
                  </p>
                </div>
              </div>

              {(reviews || []).length > 0 ? (reviews || []).map((review: any) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <span className="font-medium text-sm text-foreground">{review.reviewer?.full_name || t("common.anonymous")}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at, isZh ? "zh-CN" : "en", { month: "short", day: "numeric", year: "numeric" })}</span>
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
                    <div className="text-muted-foreground">{member.role || (isZh ? "未填写角色" : "Role not listed")}</div>
                  </div>
                )) : (
                  <div className="rounded-xl border p-3 text-muted-foreground">{isZh ? "当前没有所有者成员。" : "This facility has no owner member."}</div>
                )}
              </div>

              {adminMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">{isZh ? "管理员" : "Admins"}</div>
                  {adminMembers.map((member) => (
                    <div key={member.id} className="rounded-xl border p-3">
                      <div className="font-medium text-foreground">{member.profile?.full_name || member.profile?.email || member.user_id}</div>
                      <div className="text-muted-foreground">{member.role || (isZh ? "未填写角色" : "Role not listed")}</div>
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
                      <div className="text-muted-foreground">{member.role || (isZh ? "未填写角色" : "Role not listed")}</div>
                    </div>
                  ))}
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {isZh ? "所有权认领与异议" : "Ownership claims & disputes"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[...(ownershipClaims || []), ...(ownershipDisputes || [])].length > 0 ? (
                [...(ownershipClaims || []), ...(ownershipDisputes || [])].map((claim: any) => (
                  <div key={claim.id} className="rounded-xl border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={claim.status === "approved" ? "default" : "secondary"}>
                        {claimStatusLabel(claim.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {claim.is_dispute ? (isZh ? "异议" : "Dispute") : (isZh ? "认领" : "Claim")}
                      </span>
                    </div>
                    {claim.claim && <p className="text-muted-foreground">{claim.claim}</p>}
                    {(claim.attachment_urls || []).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {claim.attachment_urls.map((url: string) => (
                          <a key={url} href={url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                            {isZh ? "证明附件" : "Proof"}
                          </a>
                        ))}
                      </div>
                    )}
                    {claim.reply && <p className="text-xs text-muted-foreground">{isZh ? "审核回复：" : "Reply: "}{claim.reply}</p>}
                    {facilityPermission?.canEdit && claim.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => decide(claim.id, "approved")} disabled={decideClaim.isPending}>
                          {isZh ? "通过" : "Approve"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => decide(claim.id, "rejected")} disabled={decideClaim.isPending}>
                          {isZh ? "驳回" : "Reject"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">{isZh ? "还没有认领记录。" : "No ownership records yet."}</p>
              )}

              <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" onClick={() => setClaimIsDispute(ownerMembers.length > 0)}>
                    {ownerMembers.length > 0
                      ? (isZh ? "对所有权提出异议" : "Dispute ownership")
                      : (isZh ? "认领该机构" : "Claim this facility")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {claimIsDispute ? (isZh ? "提出所有权异议" : "Dispute ownership") : (isZh ? "认领机构所有权" : "Claim facility ownership")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{isZh ? "说明" : "Statement"}</Label>
                      <Textarea value={claimText} onChange={(e) => setClaimText(e.target.value)} rows={4} className="mt-1" />
                    </div>
                    <div>
                      <Label>{isZh ? "证明附件链接" : "Links to photos of your proof"}</Label>
                      <Textarea
                        value={claimProof}
                        onChange={(e) => setClaimProof(e.target.value)}
                        rows={3}
                        className="mt-1"
                        placeholder={isZh ? "每行一个链接，或用逗号分隔" : "One URL per line, or comma-separated"}
                      />
                    </div>
                    <Button className="w-full" onClick={submitClaim} disabled={createClaim.isPending}>
                      {createClaim.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {isZh ? "提交" : "Submit"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
