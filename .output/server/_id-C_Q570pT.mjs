import { s as __toESM } from "./_runtime.mjs";
import { i as require_react } from "./_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./_ssr/button-xLpexZsM.mjs";
import { t as Label } from "./_ssr/label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-Cz5iPbNd.mjs";
import { t as Badge } from "./_ssr/badge-Dn-oRli-.mjs";
import { t as Textarea } from "./_ssr/textarea-DPamDMgK.mjs";
import { n as R } from "./_ssr/wp-schema-Dnlz0TVP.mjs";
import { t as formatDate } from "./_ssr/locale-DKwjQju2.mjs";
import { Ct as MessageSquareText, Dt as MapPin, Ot as Mail, T as Star, Zn as ArrowLeft, c as Users, ct as Phone, jt as LoaderCircle, zn as Building2, zt as Layers } from "./_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-COszB6Fv.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { $ as useCreateFacilityOwnershipClaim, E as useCareFacility, Ft as useFacilityOwnershipClaims, It as useFacilityOwnershipDisputes, Pt as useFacilityMembers, Rt as useFacilityReviews, a as FACILITY_STAGE_OPTIONS, at as useCreateReview, c as facilityLabels, dn as useMyFacilityPermission, i as FACILITY_ROOM_TYPE_OPTIONS, n as FACILITY_PEOPLE_NUMBER_OPTIONS, o as FACILITY_TYPE_OPTIONS, r as FACILITY_ROOM_FACILITY_OPTIONS, s as facilityLabel, t as FACILITY_COMMUNITY_FACILITY_OPTIONS } from "./_ssr/use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./_ssr/use-toast-D8d_MLWg.mjs";
import { a as useParams$1, i as useNavigate$1 } from "./_ssr/router-compat-3gk8yjav.mjs";
import { t as CommentsSection } from "./_ssr/CommentsSection--VNfrTrC.mjs";
import { t as SiteFeature } from "./_ssr/SiteFeature-CQrN1JWZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-C_Q570pT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getFacilityAddress(facility, isZh) {
	return [facility.location, facility.address].filter(Boolean).join(isZh ? " " : ", ");
}
function CareFacilityProfile() {
	const { id } = useParams$1();
	const navigate = useNavigate$1();
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
	const [claimDialogOpen, setClaimDialogOpen] = (0, import_react.useState)(false);
	const [claimIsDispute, setClaimIsDispute] = (0, import_react.useState)(false);
	const [claimText, setClaimText] = (0, import_react.useState)("");
	const [claimProof, setClaimProof] = (0, import_react.useState)("");
	const claimStatusLabel = (status) => isZh ? status === "approved" ? "已通过" : status === "rejected" ? "已驳回" : "待审核" : status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending";
	const submitClaim = async () => {
		if (!id) return;
		try {
			await createClaim.mutateAsync({
				facility_id: id,
				claim: claimText.trim() || null,
				attachment_urls: claimProof.trim() || null,
				is_dispute: claimIsDispute
			});
			setClaimDialogOpen(false);
			setClaimText("");
			setClaimProof("");
			toast({ title: isZh ? "已提交，等待审核" : "Submitted for review" });
		} catch (err) {
			toast({
				title: isZh ? "提交失败" : "Submit failed",
				description: err.message,
				variant: "destructive"
			});
		}
	};
	const [reviewDialogOpen, setReviewDialogOpen] = (0, import_react.useState)(false);
	const [reviewRating, setReviewRating] = (0, import_react.useState)(5);
	const [reviewComment, setReviewComment] = (0, import_react.useState)("");
	const typeLabels = (0, import_react.useMemo)(() => facilityLabels(FACILITY_TYPE_OPTIONS, facility?.type, !!isZh), [facility, isZh]);
	const stageLabels = (0, import_react.useMemo)(() => facilityLabels(FACILITY_STAGE_OPTIONS, facility?.dementia_stage, !!isZh), [facility, isZh]);
	const roomTypeLabels = (0, import_react.useMemo)(() => facilityLabels(FACILITY_ROOM_TYPE_OPTIONS, facility?.room_type, !!isZh), [facility, isZh]);
	const roomFacilityLabels = (0, import_react.useMemo)(() => facilityLabels(FACILITY_ROOM_FACILITY_OPTIONS, facility?.room_facility, !!isZh), [facility, isZh]);
	const communityFacilityLabels = (0, import_react.useMemo)(() => facilityLabels(FACILITY_COMMUNITY_FACILITY_OPTIONS, facility?.community_facility, !!isZh), [facility, isZh]);
	const peopleNumberLabel = facility?.people_number ? facilityLabel(FACILITY_PEOPLE_NUMBER_OPTIONS, facility.people_number, !!isZh) : "";
	(0, import_react.useMemo)(() => [...typeLabels, ...stageLabels], [typeLabels, stageLabels]);
	const reviewStats = (0, import_react.useMemo)(() => {
		const list = reviews || [];
		const counts = {
			5: 0,
			4: 0,
			3: 0,
			2: 0,
			1: 0
		};
		list.forEach((review) => {
			const key = Math.max(1, Math.min(5, Number(review.rating) || 0));
			if (counts[key] !== void 0) counts[key] += 1;
		});
		return counts;
	}, [reviews]);
	const reviewSummary = (0, import_react.useMemo)(() => {
		const list = reviews || [];
		if (!list.length) return {
			average: null,
			count: 0
		};
		const total = list.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
		return {
			average: Math.round(total / list.length * 10) / 10,
			count: list.length
		};
	}, [reviews]);
	const ownerMembers = (0, import_react.useMemo)(() => (facilityMembers || []).filter((member) => member.is_owner), [facilityMembers]);
	const adminMembers = (0, import_react.useMemo)(() => (facilityMembers || []).filter((member) => !member.is_owner && member.is_admin), [facilityMembers]);
	const regularMembers = (0, import_react.useMemo)(() => (facilityMembers || []).filter((member) => !member.is_owner && !member.is_admin), [facilityMembers]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/CareFacilityProfile.tsx:122:7:e0692ac7f381543a560899593283909e91b273104963755d26942297aca8018b:1",
		className: "flex justify-center py-20",
		role: "status",
		"aria-label": isZh ? "正在加载机构" : "Loading facility",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-source": "pages/CareFacilityProfile.tsx:123:9:a34d923115594d7e11d41f441b8099f2d16fbf3309a1bdee72152f9439cd4413:1",
			className: "sr-only",
			children: isZh ? "养老机构资料" : "Care facility profile"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })]
	});
	if (!facility) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/CareFacilityProfile.tsx:131:7:13b58303d0bf9097999d68cfbba134dc4aabd1f9819ac7dea56178b3d143b8fc:1",
		className: "flex flex-col items-center justify-center min-h-[50vh] gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-source": "pages/CareFacilityProfile.tsx:132:9:0b124c0abc6b411719797214e687962f827ba9e2a80b8ecc7e8c31eea701d297:1",
			className: "text-lg font-semibold text-foreground",
			children: isZh ? "未找到机构" : "Facility not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: () => navigate("/search-care-facility"),
			children: isZh ? "返回机构搜索" : "Back to facility search"
		})]
	});
	const fullAddress = getFacilityAddress(facility, isZh);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/CareFacilityProfile.tsx:143:5:047f97546b6b623a830d42bd874d784b00605b835008974c0947012e076edd18:1",
		className: "max-w-6xl mx-auto px-4 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "sm",
			className: "mb-3 gap-1.5 -ml-2",
			onClick: () => navigate(-1),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }),
				" ",
				t("common.back")
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "pages/CareFacilityProfile.tsx:148:7:b1001510db93e15f1e5632ae18edd8e567da78798143f0968e1b4558fb3ce24d:1",
			className: "grid lg:grid-cols-3 gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/CareFacilityProfile.tsx:149:9:043dc412d27399f5b74b43112f3e50468d5cae2120bb4eed56091478c1e5797a:1",
				className: "lg:col-span-2 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-transparent card-elevated overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:152:15:7617ae3a0759c85c88c1e00a6ae0a26a27292f41bde35449131552c8a1b5564f:1",
								className: "flex items-start justify-between gap-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:153:17:ca379650ce953d2786a4d8b82ad537fa246ba2edc67778d23783bbc59531d792:1",
									className: "space-y-4 flex-1 min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:154:19:1bc93ee7afa00675b5eaacf65fb77591ecc6a1e0b98a66b196f925023f85861e:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/CareFacilityProfile.tsx:155:21:0f7139fe4eaa2bd6c797211195ca9db39db25dcc8aabfc6de4fb3eab4b91f859:1",
												className: "flex items-center gap-2 mb-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
													"data-inspector-source": "pages/CareFacilityProfile.tsx:156:23:f696b26f1ac3724354c664776d3a099bc37eb882c9e8416dc5a533bde421e9a7:1",
													className: "text-2xl sm:text-3xl font-bold tracking-tight text-foreground",
													children: facility.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-primary" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/CareFacilityProfile.tsx:159:21:0fc2602f2836e2496712d31919b36531781da1e7bb936c2dcd0b907c2a5bbc43:1",
												className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													"data-inspector-source": "pages/CareFacilityProfile.tsx:160:23:e4c2a71b66272d13a6ed730610e1d9caa636ab7529d347126440ae435f6ce61b:1",
													className: "flex items-center gap-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 text-warning fill-warning" }),
														" ",
														reviewSummary.average?.toFixed(1) || t("common.new"),
														" (",
														reviewSummary.count,
														" ",
														t("common.reviews"),
														")"
													]
												}), fullAddress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													"data-inspector-source": "pages/CareFacilityProfile.tsx:161:39:caf23a4f430c969fb810f9af78f2a30702bd33f2564925b1e2adf4edb13ee500:1",
													className: "flex items-center gap-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }),
														" ",
														fullAddress
													]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:165:19:f29c9e1de0f5ebcc00fc831b98084a43c17e8e9aa829ac9f945ba9e6e3f64d72:1",
											className: "flex flex-wrap gap-2",
											children: [typeLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												children: label
											}, `type-${label}`)), stageLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "bg-accent text-accent-foreground",
												children: label
											}, `stage-${label}`))]
										}),
										facility.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:175:21:5cb48358f446405f1d555a27d936426f2b5d6b73439bb1d1584dc5c9f05ef8f9:1",
											className: "text-muted-foreground leading-relaxed",
											children: facility.description
										})
									]
								})
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/CareFacilityProfile.tsx:182:11:9a05654761eecd26d6bc8ff3843efddc3ff9fa3bf85201d1d55461d7544512e4:1",
						className: "grid sm:grid-cols-2 xl:grid-cols-4 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-transparent card-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:185:17:0c2cfb85410f33fb87b481d0983ec121897e249c895fd9f9f4baaa46ec53742f:1",
										className: "text-xs text-muted-foreground mb-1",
										children: isZh ? "综合评分" : "Overall rating"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:186:17:7e6113b2d454c4feedd98e8e63f3a5b648775bf72e8a2cf8c4590182d8d03d83:1",
										className: "text-2xl font-bold text-foreground",
										children: reviewSummary.average?.toFixed(1) || "--"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-transparent card-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:191:17:fd0bae513442a5437fe0a9aaf5c61368381647def6322f1869606878849ef6e6:1",
										className: "text-xs text-muted-foreground mb-1",
										children: isZh ? "评价数量" : "Review count"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:192:17:93c7b11879e5f85921589849cad339822c65b6fe47a1dd532f44e3d22c1785b4:1",
										className: "text-2xl font-bold text-foreground",
										children: reviewSummary.count
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-transparent card-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:197:17:1ffe3f3ecd6bf653657ec8de5650df91139e636b03c0f3eda1db5041bf49a09b:1",
										className: "text-xs text-muted-foreground mb-1",
										children: isZh ? "机构类型" : "Facility type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:198:17:2b403653a8c7ee741ae3c919e7e91674a2dcc429f0268b8449bd96bc1195378b:1",
										className: "text-base font-semibold text-foreground",
										children: typeLabels.length ? typeLabels.join(isZh ? "、" : ", ") : isZh ? "未填写" : "Not specified"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-transparent card-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:203:17:58196b10e56f7538908781c85911b584d7b74606f815d8c1fedb8d22b68e2df9:1",
										className: "text-xs text-muted-foreground mb-1",
										children: isZh ? "入住人数规模" : "Residents"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:204:17:3c395045e3a303f9e63ea55aa54b578ee568ae95525ecdeeb6648917b5eebbf1:1",
										className: "text-base font-semibold text-foreground",
										children: peopleNumberLabel || (isZh ? "未填写" : "Not specified")
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-transparent card-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: isZh ? "机构简介与服务" : "About this facility" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-4 text-sm text-muted-foreground",
							children: [facility.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:214:40:d5a45b58330629e887fa4386d68612d4ea33fe98199369a72097e79515ada2db:1",
								className: "leading-relaxed",
								children: facility.description
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:215:15:6a6d127e4bebb3554dd760b69d8b7330a2619ab19fc7c6c43d10a8aa7cb56d66:1",
								className: "grid sm:grid-cols-2 xl:grid-cols-3 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:216:17:47ecf1917144cb441e069a02ddf45f04b7a7010783e816b643370952fa66eae1:1",
										className: "rounded-xl border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:217:19:68ff189086a894dc5c6d50279903cfb28046c75d7b0d962f598d84b6c9567832:1",
											className: "font-medium text-foreground mb-2",
											children: isZh ? "机构类型" : "Facility type"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:218:19:de70dd9d2ec32eebe9dd375a46f32199d53a40b728060be4cbe737d4ac20cb0a:1",
											children: typeLabels.length ? typeLabels.join(isZh ? "、" : ", ") : isZh ? "未填写" : "Not specified"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:220:17:47ecf1917144cb441e069a02ddf45f04b7a7010783e816b643370952fa66eae1:1",
										className: "rounded-xl border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:221:19:230c7bfac0274a9bf170d91d3cb3ebff4e7ec24a99975de43fea55019cdc5d99:1",
											className: "font-medium text-foreground mb-2 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4" }), isZh ? "可照护的失智症阶段" : "Dementia stages cared for"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:222:19:96cfac351bfdea12a86568f5192b53a0c6a68c3ec33682ef7d9b3c28acadc65e:1",
											children: stageLabels.length ? stageLabels.join(isZh ? "、" : ", ") : isZh ? "未填写" : "Not specified"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:224:17:47ecf1917144cb441e069a02ddf45f04b7a7010783e816b643370952fa66eae1:1",
										className: "rounded-xl border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:225:19:aab4bb49a37a1fbe367f4b84f57671fcc8b2778c8bc0ef398b449a8261a621ab:1",
											className: "font-medium text-foreground mb-2",
											children: isZh ? "房型" : "Room types"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:226:19:95228f67e13548de1a7908455a3f36edcb88c633d892a2dd01f149a049a67065:1",
											children: roomTypeLabels.length ? roomTypeLabels.join(isZh ? "、" : ", ") : isZh ? "未填写" : "Not specified"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:228:17:47ecf1917144cb441e069a02ddf45f04b7a7010783e816b643370952fa66eae1:1",
										className: "rounded-xl border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:229:19:322a6aaa0c5b395f77f8d24bab999c1285d569ca359f75bd48f371a783bb465e:1",
											className: "font-medium text-foreground mb-2",
											children: isZh ? "房间设施" : "Room facilities"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:230:19:17d5feeaa83bbbe914be1dc14ab0e599281654cc5596a11763d4599f5eec61a8:1",
											children: roomFacilityLabels.length ? roomFacilityLabels.join(isZh ? "、" : ", ") : isZh ? "未填写" : "Not specified"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:232:17:47ecf1917144cb441e069a02ddf45f04b7a7010783e816b643370952fa66eae1:1",
										className: "rounded-xl border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:233:19:4849045f93aaf4e1f6d23e328e0d8937c089511eb4fdd658e3503274127b8d25:1",
											className: "font-medium text-foreground mb-2",
											children: isZh ? "公共设施" : "Community facilities"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:234:19:0536febafedcb8fc21b2e292696a1c61dea364bf774008d899304fd112927dbf:1",
											children: communityFacilityLabels.length ? communityFacilityLabels.join(isZh ? "、" : ", ") : isZh ? "未填写" : "Not specified"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:236:17:47ecf1917144cb441e069a02ddf45f04b7a7010783e816b643370952fa66eae1:1",
										className: "rounded-xl border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:237:19:97af36d53b13ed588c5fd8689028f26d38870ca25c8ae7e080d3f43fc8356608:1",
											className: "font-medium text-foreground mb-2",
											children: isZh ? "入住人数规模" : "Number of residents"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:238:19:16ecd78891b93b55a5557d6af8f849d3dd249306930b731eaf97a536b0620351:1",
											children: peopleNumberLabel || (isZh ? "未填写" : "Not specified")
										})]
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-transparent card-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: isZh ? "地址" : "Location" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:249:15:88f9ce91b41b6933a885e931456d2aeddccc87e4cfd7b4f190dce55fca40b7e7:1",
								className: "rounded-xl border p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:250:17:2a08c63b94524ecea218cc03ff9cd7c7ba9ef6b09fdd86ac9b4a3bd712a8affe:1",
									className: "font-medium text-foreground mb-2",
									children: isZh ? "所在地区" : "Region / locality"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:251:17:e8e5db1ef3137e304ccde02f32906041fba38dc826fa8df913824b87c1a536c6:1",
									children: facility.location || (isZh ? "未填写" : "Not specified")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:253:15:88f9ce91b41b6933a885e931456d2aeddccc87e4cfd7b4f190dce55fca40b7e7:1",
								className: "rounded-xl border p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:254:17:d798f2df3f98d551877407a26aa1a62779065a0f53b14001ad965227744e02da:1",
									className: "font-medium text-foreground mb-2",
									children: isZh ? "详细地址" : "Address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:255:17:a813e96f629d5682ef4fe3d74781d6053159a33d1046f79f4affef501c3b2579:1",
									children: facility.address || (isZh ? "未填写" : "Not specified")
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-transparent card-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/CareFacilityProfile.tsx:263:15:352a0098704bb34d5b3dee414e24e56cdd210a8ae4c881d8c24e4a86c341327d:1",
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: isZh ? `评价（${reviews?.length || 0}）` : `Reviews (${reviews?.length || 0})` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
								open: reviewDialogOpen,
								onOpenChange: setReviewDialogOpen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										children: isZh ? "写评价" : "Write a review"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isZh ? "评价这家护理机构" : "Review this care facility" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:276:21:c156abc27c6f41267ae357af5b3cbe85ce475a3e74eae0d132144eb7bd3bcf92:1",
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:277:23:d14754f96e852e8d56eadac4faa40ceeee3677f5bfc8967503e68d9ff1211335:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "mb-2 block",
												children: isZh ? "评分" : "Rating"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "pages/CareFacilityProfile.tsx:279:25:b46fd2ce921bbf5a2ca1462bed105a485872328d7810a83b43bc99e10562ca95:1",
												className: "flex gap-1",
												children: [
													1,
													2,
													3,
													4,
													5
												].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													"data-inspector-source": "pages/CareFacilityProfile.tsx:281:29:4fef886f33068cb58cfaea4a858d111361bfeac4d3c5f0c49e03aaac9aa3b47b:1",
													type: "button",
													"aria-label": isZh ? `${s} 星` : `${s} stars`,
													"aria-pressed": s === reviewRating,
													onClick: () => setReviewRating(s),
													className: "min-h-11 min-w-11 flex items-center justify-center rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-7 w-7 transition-colors ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground/30"}` })
												}, s))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:294:23:d14754f96e852e8d56eadac4faa40ceeee3677f5bfc8967503e68d9ff1211335:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "评论" : "Comment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: reviewComment,
												onChange: (e) => setReviewComment(e.target.value),
												placeholder: isZh ? "分享您的体验…" : "Share your experience...",
												rows: 4
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											className: "w-full",
											disabled: createReview.isPending || !id,
											onClick: async () => {
												try {
													if (!id) return;
													await createReview.mutateAsync({
														entity_id: id,
														entity_type: "facility",
														rating: reviewRating,
														comment: reviewComment
													});
													toast({ title: isZh ? "评价已提交！" : "Review submitted!" });
													setReviewDialogOpen(false);
													setReviewRating(5);
													setReviewComment("");
												} catch (err) {
													toast({
														title: isZh ? "提交评价失败" : "Failed to submit review",
														description: err.message,
														variant: "destructive"
													});
												}
											},
											children: createReview.isPending ? isZh ? "提交中…" : "Submitting..." : isZh ? "提交评价" : "Submit Review"
										})
									]
								})] })]
							})]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:329:15:16053971f1538e46ef0d31d0c576cd1b622366d86b9f39bb440cecf68677fa71:1",
								className: "grid lg:grid-cols-[220px_1fr] gap-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:330:17:a214dba00503993689c8948252fd05808708a53247ad2df8bf8f8b3cab842287:1",
									className: "rounded-2xl border p-5 bg-muted/20",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:331:19:db3da538e2907f6e474cb47acd45b5e31941c80b238f7dfab1a0cdf93dc816fe:1",
											className: "text-xs uppercase tracking-wide text-muted-foreground mb-2",
											children: isZh ? "口碑概览" : "Ratings at a glance"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:332:19:cc15b45e8954d837158828c336f006875ef9269d032e3cdfeeddf39b72445d05:1",
											className: "text-4xl font-bold text-foreground mb-1",
											children: reviewSummary.average?.toFixed(1) || "--"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:333:19:3aaa561e4449a87f956fb88a7c1e1416a00f1edbfc6d87138c992bc7821698f9:1",
											className: "text-sm text-muted-foreground mb-4",
											children: isZh ? `${reviewSummary.count} 条公开评价` : `${reviewSummary.count} published reviews`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:334:19:439b6f9b43d94c6ccd7c220cd8528c328eb752b546b04255c1754d6c16590ed1:1",
											className: "space-y-2",
											children: [
												5,
												4,
												3,
												2,
												1
											].map((score) => {
												const total = Math.max(1, reviews?.length || 0);
												const count = reviewStats[score] || 0;
												const width = `${count / total * 100}%`;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "pages/CareFacilityProfile.tsx:340:25:ec7b7763ae08a103940c5b03318177b2e6aa0bd1e78758fa75d0f4d1f8ce448e:1",
													className: "flex items-center gap-2 text-xs text-muted-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															"data-inspector-source": "pages/CareFacilityProfile.tsx:341:27:3236254e846146f3429b60b75e17e631a32f512d5b505c0e4121168d3c96e106:1",
															className: "w-8",
															children: [score, "★"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															"data-inspector-source": "pages/CareFacilityProfile.tsx:342:27:13d7ac37803a3efc0508ffb9bece68c1061ef0e60a3e4a74089b5211f9cfcc94:1",
															className: "h-2 flex-1 rounded-full bg-muted overflow-hidden",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																"data-inspector-source": "pages/CareFacilityProfile.tsx:343:29:b09c4e292a5a3a9be7e5f17697910231639f29ceffe74aad3845edaf8dfb2118:1",
																className: "h-full rounded-full bg-primary",
																style: { width }
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															"data-inspector-source": "pages/CareFacilityProfile.tsx:345:27:30c4df2a9855a28bdee4ce570a5e04da3772c229c9d8ff9c8821e098adbd50a2:1",
															className: "w-8 text-right",
															children: count
														})
													]
												}, score);
											})
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:351:17:d6c229fe3db548476adc86a367401d0478f1b3828920744d2b4a9fb6ec620fec:1",
									className: "rounded-2xl border p-5 bg-muted/10 text-sm text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:352:19:3b8617b58beb4d1b4f8fdb29daa21da7fb0e55cec8a665e521022e7cf172365d:1",
										className: "font-medium text-foreground mb-2 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareText, { className: "h-4 w-4" }), isZh ? "专业评价说明" : "Professional review note"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:353:19:9b4083ce9c14619797b89361b4c2a5c989721e429405d0b50622a0ab15751ce3:1",
										children: isZh ? "评价目前只显示总评分、评价内容、发布时间、评价人和回复。" : "Reviews here show the overall rating, what people wrote, when they wrote it, who wrote it, and any replies."
									})]
								})]
							}), (reviews || []).length > 0 ? (reviews || []).map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:362:17:30aeaf1d8209746ac2b4a4498eda458d866b4aa34645d236f5a831f3871444fb:1",
								className: "border-b last:border-0 pb-4 last:pb-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:363:19:40443c590e44ae81ade49648bc37f227b444463af3e673be1a81f22d72661d32:1",
										className: "flex items-center justify-between mb-1 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:364:21:6a204a948885d4a41b78d97460dc4d0a60ff57cd35cefb141824f44d32adc730:1",
											className: "font-medium text-sm text-foreground",
											children: review.reviewer?.full_name || t("common.anonymous")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:365:21:b8d88b71de3500201576282e8ef6387a729890775bb98a8eb1182f0450674d2a:1",
											className: "text-xs text-muted-foreground",
											children: formatDate(review.created_at, isZh ? "zh-CN" : "en", {
												month: "short",
												day: "numeric",
												year: "numeric"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:367:19:ac4169197a7f6e0dacbe9eecf2c540c4234df5a9eeb3e9ba37175705313994ad:1",
										className: "flex gap-0.5 mb-2",
										children: Array.from({ length: review.rating }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3 text-warning fill-warning" }, j))
									}),
									review.content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:372:38:c7968e8ecf8e321c3782b2e62e1d51ece4d8fac36c720d5d309721e8c63ce5c4:1",
										className: "text-sm text-muted-foreground",
										children: review.content
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSection, {
										relationId: R.reviewComments,
										parentId: review.id,
										compact: true
									})
								]
							}, review.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:376:17:ce3de0ccca67f6265eb23a9568435239f434afd306a764f5745700cba5464f83:1",
								className: "text-sm text-muted-foreground text-center py-4",
								children: isZh ? "还没有评价" : "No reviews yet"
							})]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/CareFacilityProfile.tsx:382:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-transparent card-elevated sticky top-24",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: isZh ? "联系与信息" : "Contact & information" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-3 text-sm",
							children: [
								fullAddress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:389:17:59711393a6250726899603ccb16e0450749e7a3f424c7febe122961f8b2d2696:1",
									className: "flex items-start gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:391:19:ccc2c2adfa0fa64a9c671dd071f9124f86132cf2b602cab7e07d5fc9cc3352be:1",
										children: fullAddress
									})]
								}),
								facility.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:395:17:84f542bd0dff394a174ba231dfafdee713ce7e761690dfbd4f7356febff374ff:1",
									className: "flex items-center gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:397:19:80785b0f19cda28aa61b74f3adf29d109abd9838203dd68a273272553f97d3ba:1",
										children: facility.phone
									})]
								}),
								facility.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:401:17:84f542bd0dff394a174ba231dfafdee713ce7e761690dfbd4f7356febff374ff:1",
									className: "flex items-center gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:403:19:c8285d0876f31e8a5467f0aa611331979ecf84aa91809f4f30aee0b9692d3e14:1",
										children: facility.email
									})]
								}),
								facility.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "w-full",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:409:19:1e76a21ad4dc225c0c2ddd3e750b11d833ebd6176b91fac3a6a56d835fde89b8:1",
										href: `tel:${facility.phone}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "mr-2 h-4 w-4" }),
											" ",
											isZh ? "拨打电话" : "Call facility"
										]
									})
								}),
								facilityPermission?.canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: "w-full",
									onClick: () => navigate(`/facilities/${facility.id}/edit`),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "mr-2 h-4 w-4" }),
										" ",
										isZh ? "编辑机构资料" : "Edit facility profile"
									]
								}),
								fullAddress && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "w-full",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:422:19:96942fd3b4a542fd3fc7308924865120a78937eda0cc5646b544d098996b4ef9:1",
										href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
										target: "_blank",
										rel: "noreferrer",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mr-2 h-4 w-4" }),
											" ",
											t("common.directions")
										]
									})
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-transparent card-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-primary" }), isZh ? "场所成员与所有权" : "Team & ownership"]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:435:15:f2363fb736e34fe278c1c6a79637c03e43712bbc8d8966ca7c71f14a06b8fc5b:1",
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:436:17:6391ff6b0213de8962e9afacf90d4080c2a64dc7cdbec48e70591a14c21817f8:1",
										className: "text-xs text-muted-foreground",
										children: isZh ? "所有者" : "Owners"
									}), ownerMembers.length > 0 ? ownerMembers.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:438:19:429dfcc6ba59873bcc5c9b09c17a51b0db1a57ecd647d7fa2ccd746319c73d7f:1",
										className: "rounded-xl border p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:439:21:bd10f305c7e040a78c19c29e139ca3ce852c23b4c415558f808c5f6bc8d3470b:1",
											className: "font-medium text-foreground",
											children: member.profile?.full_name || member.profile?.email || member.user_id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:440:21:3b6bc64398d1be0efded3423ee4cb3f6adf39aa2b0f88f676492ed3b5ccf8f83:1",
											className: "text-muted-foreground",
											children: member.role_label || (isZh ? "未填写角色" : "Role not listed")
										})]
									}, member.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:443:19:66091b860f4c60afc38e2aecf856b8629b92e3058865e694b6fc6d4ddbbef131:1",
										className: "rounded-xl border p-3 text-muted-foreground",
										children: isZh ? "当前没有所有者成员。" : "This facility has no owner member."
									})]
								}),
								adminMembers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:448:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:449:19:e1083a21313080822c506f8a3e4a2f6d62c6efd23ae3f04c6bbcda4ed9e30265:1",
										className: "text-xs text-muted-foreground",
										children: isZh ? "管理员" : "Admins"
									}), adminMembers.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:451:21:2a4934301d833fc5113f2e6b33dadd99f59e5b304d09d194f9c086d62f3531d9:1",
										className: "rounded-xl border p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:452:23:1a7b66a32da7e3f868c1c2a873f3ad897b3601f6898c88ec2c55a6e00c693b13:1",
											className: "font-medium text-foreground",
											children: member.profile?.full_name || member.profile?.email || member.user_id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:453:23:1124212ef421971daa8b3786403d992cf5b1418467722c05ce923bd1451fd2b7:1",
											className: "text-muted-foreground",
											children: member.role_label || (isZh ? "未填写角色" : "Role not listed")
										})]
									}, member.id))]
								}),
								regularMembers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:460:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:461:19:12c3e0d9455de02896cbba2a3361c00fcca8773e2ea9a4bb77c14c70641e681c:1",
										className: "text-xs text-muted-foreground",
										children: isZh ? "团队成员" : "Members"
									}), regularMembers.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:463:21:2a4934301d833fc5113f2e6b33dadd99f59e5b304d09d194f9c086d62f3531d9:1",
										className: "rounded-xl border p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:464:23:1a7b66a32da7e3f868c1c2a873f3ad897b3601f6898c88ec2c55a6e00c693b13:1",
											className: "font-medium text-foreground",
											children: member.profile?.full_name || member.profile?.email || member.user_id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:465:23:1124212ef421971daa8b3786403d992cf5b1418467722c05ce923bd1451fd2b7:1",
											className: "text-muted-foreground",
											children: member.role_label || (isZh ? "未填写角色" : "Role not listed")
										})]
									}, member.id))]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-transparent card-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-primary" }), isZh ? "所有权认领与异议" : "Ownership claims & disputes"]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-3 text-sm",
							children: [[...ownershipClaims || [], ...ownershipDisputes || []].length > 0 ? [...ownershipClaims || [], ...ownershipDisputes || []].map((claim) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:484:19:e1e4b91b078abf8180e853acfd36adb13d2d835c2a8cac54724831a7e70176d0:1",
								className: "rounded-xl border p-3 space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:485:21:e8167701a27888fef8e691718d1cb2739411f129b622e5b6bf6825c16bf75cf0:1",
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: claim.status === "approved" ? "default" : "secondary",
											children: claimStatusLabel(claim.status)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:489:23:dfb13e9855441b770cab6894c6df4f4ae542d735e4fc6b4df371cdf46b67eb1e:1",
											className: "text-xs text-muted-foreground",
											children: claim.is_dispute ? isZh ? "异议" : "Dispute" : isZh ? "认领" : "Claim"
										})]
									}),
									claim.claim && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:493:37:b8900bb89e70f8a67da33040b1aff3b3c658fde09b3a9ae9c0304cd4075c49db:1",
										className: "text-muted-foreground",
										children: claim.claim
									}),
									(claim.attachment_urls || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:495:23:841fc52624404597773b74b739592d26037095478706eb0b4e54458d94e2e280:1",
										className: "flex flex-wrap gap-2",
										children: claim.attachment_urls.map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:497:27:7ae83c56c98c004a71299bef1afee1d852590b6a2228da459f632dfab5bc1e6a:1",
											href: url,
											target: "_blank",
											rel: "noreferrer",
											className: "text-xs text-primary underline",
											children: isZh ? "证明附件" : "Proof"
										}, url))
									}),
									claim.reply && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										"data-inspector-source": "pages/CareFacilityProfile.tsx:503:37:2e762bea65edde72fcb0532b4b679293cafd46f1dfc66ce6e589ec1e060745fd:1",
										className: "text-xs text-muted-foreground",
										children: [isZh ? "审核回复：" : "Reply: ", claim.reply]
									})
								]
							}, claim.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/CareFacilityProfile.tsx:507:17:93e7ecd8a84748ece30e16d713ce08d1799bb5cf10e820c557e35993635663a7:1",
								className: "text-muted-foreground",
								children: isZh ? "还没有认领记录。" : "No ownership records yet."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
								open: claimDialogOpen,
								onOpenChange: setClaimDialogOpen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										className: "w-full",
										onClick: () => setClaimIsDispute(ownerMembers.length > 0),
										children: ownerMembers.length > 0 ? isZh ? "对所有权提出异议" : "Dispute ownership" : isZh ? "认领该机构" : "Claim this facility"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: claimIsDispute ? isZh ? "提出所有权异议" : "Dispute ownership" : isZh ? "认领机构所有权" : "Claim facility ownership" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CareFacilityProfile.tsx:524:19:73c5a9a443bee0653df6fb35802744c241344ac387d9361b71b98d3f5a563633:1",
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:525:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "说明" : "Statement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: claimText,
												onChange: (e) => setClaimText(e.target.value),
												rows: 4,
												className: "mt-1"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/CareFacilityProfile.tsx:529:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "证明附件链接" : "Links to photos of your proof" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: claimProof,
												onChange: (e) => setClaimProof(e.target.value),
												rows: 3,
												className: "mt-1",
												placeholder: isZh ? "每行一个链接，或用逗号分隔" : "One URL per line, or comma-separated"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											className: "w-full",
											onClick: submitClaim,
											disabled: createClaim.isPending,
											children: [createClaim.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null, isZh ? "提交" : "Submit"]
										})
									]
								})] })]
							})]
						})]
					})
				]
			})]
		})]
	});
}
function RouteFacilityIdPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		name: "facilities",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareFacilityProfile, {})
	});
}
//#endregion
export { RouteFacilityIdPage as component };
