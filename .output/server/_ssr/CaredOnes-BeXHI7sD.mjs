import { s as __toESM } from "../_runtime.mjs";
import { r as maskEmail } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { Dt as MapPin, G as Search, Gt as IdCard, It as Lightbulb, Jn as AudioLines, Pt as ListChecks, S as Target, Xt as HeartPulse, Zn as ArrowLeft, ct as Phone, d as UserPlus, jt as LoaderCircle, n as X, nn as FileText, st as Pill, tn as FolderOpen, ut as Pencil, xn as ClipboardCheck, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C88F3k7U.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { In as useSetLocationSharingFlags, Mn as useSearchProfiles, N as useCareTasks, Ot as useDeleteUserCaredOne, ct as useCreateUserCaredOne, nn as useLocationSharingFlags, yr as useUserCaredOnes } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BwgHkacp.mjs";
import { n as pendingCareTasks } from "./pending-Cmgt3sc7.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { a as useParams$1, i as useNavigate$1, o as useSearchParams } from "./router-compat-DbWBz8c6.mjs";
import { t as lazyRetry } from "./lazy-retry-gN02cENW.mjs";
import { t as Skeleton } from "./skeleton-BRV0UAw9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CaredOnes-BeXHI7sD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/PageSkeleton/PageSkeleton/div/0",
		"data-inspector-source": "components/PageSkeleton.tsx:5:5:8f16d97f7795446dd587f06bda5a7fe7d5961f638babe0bda341dc4aa0191b5f:1",
		className: "max-w-6xl mx-auto px-4 py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/PageSkeleton/PageSkeleton/div/1",
				"data-inspector-source": "components/PageSkeleton.tsx:6:7:293654f1b55fbd0f45154f2452fafc5ae095e31fc8cfd19257d608f7f96df07e:1",
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
					"data-inspector-id": "components/PageSkeleton/PageSkeleton/Skeleton/0",
					"data-inspector-source": "components/PageSkeleton.tsx:7:9:6c048c5b6134e472ad2f6d6ae124f4a8a4694e5d4d006d5a282f543f5e09f47a:1",
					className: "h-8 w-48"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
					"data-inspector-id": "components/PageSkeleton/PageSkeleton/Skeleton/1",
					"data-inspector-source": "components/PageSkeleton.tsx:8:9:a39b574b6f6a46e8a1edf0014845ab4366b013c5f0e344c38cbed3ac7cac0ad8:1",
					className: "h-4 w-72"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/PageSkeleton/PageSkeleton/div/2de0a02f9b7d/0",
				"data-inspector-source": "components/PageSkeleton.tsx:10:7:d645f7fdcb4de9445553ab8c7d25f97a129690817ca902a2e58e9d74e7cf985f:1",
				className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					1,
					2,
					3,
					4
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
					"data-inspector-id": "components/PageSkeleton/PageSkeleton/Skeleton/2",
					"data-inspector-source": "components/PageSkeleton.tsx:12:11:4db481e5bb2fa5b80172d7fad6961c71f6d57aca85e1e617b2dec992be9e56ea:1",
					className: "h-24 rounded-xl"
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/PageSkeleton/PageSkeleton/div/2de0a02f9b7d/1",
				"data-inspector-source": "components/PageSkeleton.tsx:15:7:a379f87ffe9b47bc9bb70cb1bf6388f46a3f27ca5184597168d9af48c5ae229f:1",
				className: "space-y-4",
				children: [
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
					"data-inspector-id": "components/PageSkeleton/PageSkeleton/Skeleton/3",
					"data-inspector-source": "components/PageSkeleton.tsx:17:11:987af9f3e412ba7bff14852c6b9a0c848644a06117b9d4ad60cf029949c36533:1",
					className: "h-32 rounded-xl"
				}, i))
			})
		]
	});
}
/** CCT 258 a55 — whether emergency location sharing is allowed for this cared one (b55 = yes). */
function EmergencyShareSetting({ caredOneId }) {
	const { i18n } = useTranslation();
	const zh = i18n.language?.startsWith("zh");
	const { toast } = useToast();
	const { data: flags, isLoading } = useLocationSharingFlags(caredOneId || null);
	const setFlags = useSetLocationSharingFlags();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		"data-inspector-id": "components/cared-ones/EmergencyShareSetting/EmergencyShareSetting/label/0",
		"data-inspector-source": "components/cared-ones/EmergencyShareSetting.tsx:14:5:51b0dab352379e7ca47021c0b572792336c1658ab3a05737bd60050a54c6177b:1",
		className: "flex items-center justify-between gap-3 rounded-lg border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			"data-inspector-id": "components/cared-ones/EmergencyShareSetting/EmergencyShareSetting/span/0",
			"data-inspector-source": "components/cared-ones/EmergencyShareSetting.tsx:15:7:4999f35e77fba34b9708feea50a423fee42f2bd31f088bfa02fc77f47496d3a1:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-id": "components/cared-ones/EmergencyShareSetting/EmergencyShareSetting/span/60cae1d01739/0",
				"data-inspector-source": "components/cared-ones/EmergencyShareSetting.tsx:16:9:4178d18f9393f9984be7178936f1d5f3c8857e5ea1a0f9dddead951843fdbcc9:1",
				className: "block text-sm font-medium",
				children: zh ? "允许紧急定位分享" : "Allow emergency location sharing"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-id": "components/cared-ones/EmergencyShareSetting/EmergencyShareSetting/span/60cae1d01739/1",
				"data-inspector-source": "components/cared-ones/EmergencyShareSetting.tsx:17:9:a45814158160acb7f7989f728151650794602f6555ad3043efb5fec3f4e53cdb:1",
				className: "block text-xs text-muted-foreground",
				children: zh ? "开启后，紧急时护理者无需对方确认即可获取位置。" : "In an emergency, caregivers can get the location without asking first."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			"data-inspector-id": "components/cared-ones/EmergencyShareSetting/EmergencyShareSetting/Switch/b5efdea4c10d/0",
			"data-inspector-source": "components/cared-ones/EmergencyShareSetting.tsx:21:7:a56678349c33f50e3eb3725d3da12bbd62d06fe1c7c704ccc2ceacf23f40aa57:1",
			checked: !!flags?.emergencyAllowed,
			disabled: isLoading || setFlags.isPending,
			onCheckedChange: (v) => setFlags.mutate({
				userId: caredOneId,
				emergencyAllowed: v
			}, {
				onSuccess: () => toast({ title: zh ? "已保存" : "Saved" }),
				onError: (e) => toast({
					title: zh ? "保存失败" : "Could not save",
					description: e?.message,
					variant: "destructive"
				})
			})
		})]
	});
}
var MedicineCard = lazyRetry(() => import("./MedicineCard-rl5Zt7AU.mjs").then((m) => ({ default: m.MedicineCard })), "MedicineCard");
var CheckInCard = lazyRetry(() => import("./CheckInCard-aYp06fZn.mjs").then((m) => ({ default: m.CheckInCard })), "CheckInCard");
var TipsCard = lazyRetry(() => import("./TipsCard-C3o9J8Ja.mjs").then((m) => ({ default: m.TipsCard })), "TipsCard");
var CareTasksCard = lazyRetry(() => import("./CareTasksCard-CttoZdSI.mjs").then((m) => ({ default: m.CareTasksCard })), "CareTasksCard");
var CarePlanCard = lazyRetry(() => import("./CarePlanCard-CHwFz4uM.mjs").then((m) => ({ default: m.CarePlanCard })), "CarePlanCard");
var NotesCard = lazyRetry(() => import("./NotesCard-DR4mMKr_.mjs").then((m) => ({ default: m.NotesCard })), "NotesCard");
var EmergencyCard = lazyRetry(() => import("./EmergencyCard-C5VtTk38.mjs").then((m) => ({ default: m.EmergencyCard })), "EmergencyCard");
var DocumentsCard = lazyRetry(() => import("./DocumentsCard-Brl7lkA-.mjs").then((m) => ({ default: m.DocumentsCard })), "DocumentsCard");
var InformationCardCard = lazyRetry(() => import("./InformationCardCard-xPskVQc-.mjs").then((m) => ({ default: m.InformationCardCard })), "InformationCardCard");
var FamilyVoiceCard = lazyRetry(() => import("./FamilyVoiceCard-XoS6gb5i.mjs").then((m) => ({ default: m.FamilyVoiceCard })), "FamilyVoiceCard");
var LocationCard = lazyRetry(() => import("../_libs/_30.mjs").then((n) => n.n), "LocationCard");
function FeatureDetail(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		"data-inspector-source": "pages/CaredOnes.tsx:54:10:d41c2dec3bff4a8c37a9f76c155e6949ddd57f832c24b0f23f4169d3f7cdf42e:1",
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {
			"data-inspector-id": "pages/CaredOnes/FeatureDetail/PageSkeleton/0",
			"data-inspector-source": "pages/CaredOnes.tsx:54:30:d41c2dec3bff4a8c37a9f76c155e6949ddd57f832c24b0f23f4169d3f7cdf42e:1"
		}),
		children: featureContent(props)
	});
}
function featureContent({ cardKey, caredOneId, caredOneName }) {
	switch (cardKey) {
		case "medicine": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicineCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/MedicineCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:59:29:fb4d68ada11f9ac616459dc566c31b783c06e4847ff1ca9fb2cabcc75d2e72bc:1",
			caredOneId
		});
		case "checkin":
		case "check-in":
		case "check_in":
		case "check-ins": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckInCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/CheckInCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:63:30:f81fe1ff748abc8a0c8d5318337ec259be282e1830f8bd1df0b21d59736cb588:1",
			caredOneId
		});
		case "tips": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TipsCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/TipsCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:64:25:4498d84f551d755db823c76642e1700fcb12a28f86de698fa889be70bc9b3a27:1",
			caredOneId
		});
		case "tasks": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareTasksCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/CareTasksCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:65:26:0de9bb8f24e778a4583fa080d6333eb0fd719628b862029b6983731a057678e7:1",
			caredOneId
		});
		case "plan": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarePlanCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/CarePlanCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:66:25:bfac5827f85d4ff9f787bae869661808ea1452d586053120149a05a4e222da75:1",
			caredOneId
		});
		case "notes": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/NotesCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:67:26:04d426725e5abc9d1974296cc6e37352a12fda30133d539a6ef5fffc5849dbca:1",
			caredOneId
		});
		case "emergency": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmergencyCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/EmergencyCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:68:30:50c101f7dea66e5e02dc99e94ee4eb7cddf55f5cc09024b25c5a742adab1d4f6:1",
			caredOneId
		});
		case "location": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/LocationCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:69:29:8fc32fb5a2aaf166b164b1e4e2ce699e4d60b1e471588ee69536ad7998ecc2fd:1",
			caredOneId,
			caredOneName
		});
		case "documents": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentsCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/DocumentsCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:70:30:9448037555e374b7ef99232e56e0439d0e2cccc5e71dce9a97d2e5763bcb83bc:1",
			caredOneId
		});
		case "info-card": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InformationCardCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/InformationCardCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:71:30:8d2e4761edab732ffc5ad745ad54c73317b7238e5df3bf91d34cd46ee069645b:1",
			caredOneId,
			caredOneName
		});
		case "family-voice": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilyVoiceCard, {
			"data-inspector-id": "pages/CaredOnes/featureContent/FamilyVoiceCard/0",
			"data-inspector-source": "pages/CaredOnes.tsx:72:33:b3b0ad601e9e09ba8b1dd3e0192c8154d7649226a1b664ef904400a992e71c55:1",
			caredOneId,
			caredOneName
		});
		default: return null;
	}
}
function CaredOnes() {
	const { t, i18n } = useTranslation();
	const { toast } = useToast();
	const site = useSite();
	const { data: caredOnes, isLoading } = useUserCaredOnes();
	const { data: careTasks, isLoading: tasksLoading, error: tasksError } = useCareTasks();
	const createUserCaredOne = useCreateUserCaredOne();
	const deleteUserCaredOne = useDeleteUserCaredOne();
	const [searchParams] = useSearchParams();
	const { personId, card: cardParam } = useParams$1();
	const navigate = useNavigate$1();
	const activeTab = personId || searchParams.get("person") || null;
	const openCard = cardParam || searchParams.get("card") || null;
	const setActiveTab = (id) => navigate(id ? `/cared-ones/${String(id).replace(/^wp-/, "")}${openCard ? `/${openCard}` : ""}` : "/cared-ones");
	const setOpenCard = (key) => {
		const person = String(activeTab || selectedId || "").replace(/^wp-/, "");
		if (!person) return navigate("/cared-ones");
		navigate(key ? `/cared-ones/${person}/${key}` : `/cared-ones/${person}`);
	};
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [selectedPerson, setSelectedPerson] = (0, import_react.useState)(null);
	const { data: searchResultsRaw } = useSearchProfiles(searchQuery);
	const [detailCaredOne, setDetailCaredOne] = (0, import_react.useState)(null);
	const myWpId = String(getStoredWPUser()?.user_id || "");
	const searchResults = (0, import_react.useMemo)(() => {
		const existing = new Set((caredOnes || []).map((c) => String(c.user_id || "").replace(/^wp-/, "")));
		return (searchResultsRaw || []).filter((p) => {
			const pid = String(p.id || "").replace(/^wp-/, "");
			return pid !== myWpId && !existing.has(pid);
		});
	}, [
		searchResultsRaw,
		caredOnes,
		myWpId
	]);
	const bare = (v) => String(v ?? "").replace(/^wp-/, "");
	const selectedId = (caredOnes?.find((c) => activeTab && bare(c.user_id) === bare(activeTab)))?.user_id || activeTab || (caredOnes && caredOnes.length > 0 ? caredOnes[0].user_id : null);
	const caredOneName = (caredOnes?.find((c) => bare(c.user_id) === bare(selectedId)))?.cared_one?.full_name || site.caredOneSingular;
	const selectedPendingCount = pendingCareTasks(careTasks, [selectedId]).length;
	const featureCards = [
		{
			key: "medicine",
			title: t("caredOnes.medicineTracker"),
			icon: Pill,
			subtitle: t("caredOnes.trackMedications")
		},
		{
			key: "checkin",
			title: t("caredOnes.checkIns", { defaultValue: "Check-Ins" }),
			icon: ClipboardCheck,
			subtitle: t("caredOnes.dailyWellness")
		},
		{
			key: "tips",
			title: t("caredOnes.careTips"),
			icon: Lightbulb,
			subtitle: t("caredOnes.helpfulReminders")
		},
		{
			key: "tasks",
			title: i18n.language?.startsWith("zh") ? "护理任务" : "Care Tasks",
			icon: ListChecks,
			subtitle: t("caredOnes.careTasksSubtitle", { defaultValue: "Things to do for this person" })
		},
		{
			key: "plan",
			title: t("caredOnes.carePlan"),
			icon: Target,
			subtitle: t("caredOnes.structuredGoals")
		},
		{
			key: "notes",
			title: t("caredOnes.careNotes"),
			icon: FileText,
			subtitle: t("caredOnes.freeFormNotes")
		},
		{
			key: "emergency",
			title: t("caredOnes.emergencyContacts"),
			icon: Phone,
			subtitle: t("caredOnes.emergencyList")
		},
		{
			key: "location",
			title: t("caredOnes.locationSafeZones"),
			icon: MapPin,
			subtitle: t("caredOnes.gpsSafeZones")
		},
		{
			key: "documents",
			title: t("caredOnes.documents"),
			icon: FolderOpen,
			subtitle: t("caredOnes.medicalDocs")
		},
		{
			key: "info-card",
			title: t("caredOnes.careInfoSheets", { defaultValue: "Cared One Information Cards" }),
			icon: IdCard,
			subtitle: t("caredOnes.careInfoSheetsSubtitle", { defaultValue: "Share what a helper or finder needs to know" })
		},
		{
			key: "family-voice",
			title: i18n.language?.startsWith("zh") ? "录制亲友声音" : "Family Voices",
			icon: AudioLines,
			subtitle: ""
		}
	];
	const handleAddCaredOne = () => {
		if (!selectedPerson) return;
		createUserCaredOne.mutate({ caredOneId: selectedPerson.id }, {
			onSuccess: () => {
				setAddOpen(false);
				setSelectedPerson(null);
				setSearchQuery("");
				toast({ title: t("caredOnes.added", { caredOne: site.caredOneSingular }) });
			},
			onError: (err) => toast({
				title: t("caredOnes.failedToAdd", "Failed"),
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const handleRemoveCaredOne = (id, name) => {
		deleteUserCaredOne.mutate(id, {
			onSuccess: () => {
				setActiveTab(null);
				toast({ title: t("caredOnes.removed", {
					name,
					caredOnes: site.navLabels.caredOnes.toLowerCase()
				}) });
			},
			onError: (err) => toast({
				title: t("caredOnes.failedToRemove"),
				description: err.message,
				variant: "destructive"
			})
		});
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {
		"data-inspector-id": "pages/CaredOnes/CaredOnes/PageSkeleton/0",
		"data-inspector-source": "pages/CaredOnes.tsx:153:25:006347e6041fe914d2f7a6abedb647d3c83720ffc1fecddc4fed70d74285f2fb:1"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/CaredOnes/CaredOnes/div/d2a3e51ef7b6/0",
		"data-inspector-source": "pages/CaredOnes.tsx:156:5:760d76f1baed8b7f5f0c0bd853cce735a3a3f58ed517ba7550f379b6e00499c6:1",
		className: "max-w-5xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/CaredOnes/CaredOnes/div/0",
				"data-inspector-source": "pages/CaredOnes.tsx:157:7:694784c9129920132cc8a23863300ce0c6597afe1209f73f14121d09804fae9c:1",
				className: "flex items-start justify-between gap-3 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/CaredOnes/CaredOnes/div/1",
					"data-inspector-source": "pages/CaredOnes.tsx:158:9:ad6704f0e73e2aaf5297b25ad967181462ad8d1550149ddfe9e7f973738162c1:1",
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/CaredOnes/CaredOnes/h1/8790c19ca850/0",
						"data-inspector-source": "pages/CaredOnes.tsx:159:11:fd8a9d028684e8a80f9eaa4332358174c55d731699c595bed886c8968ebae479:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: t("nav.myLovedOnes", site.navLabels.caredOnes)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/CaredOnes/CaredOnes/p/e3b98a4da31a/0",
						"data-inspector-source": "pages/CaredOnes.tsx:160:11:c4d43b2b33b6eb77465714445306ce73824e8515ae40405b4c1aadd9fc87ec06:1",
						className: "text-sm text-muted-foreground",
						children: t("caredOnes.manageAndTrack")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/98512c5a1f68/0",
					"data-inspector-source": "pages/CaredOnes.tsx:162:9:62e6568641ec21d0c021d09a97bdbe14fbe68eb9f239c75124ab6e8ba9248944:1",
					variant: "coral",
					size: "sm",
					className: "shrink-0",
					onClick: () => setAddOpen(true),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/UserPlus/0",
							"data-inspector-source": "pages/CaredOnes.tsx:162:97:62e6568641ec21d0c021d09a97bdbe14fbe68eb9f239c75124ab6e8ba9248944:1",
							className: "h-4 w-4 mr-1"
						}),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/span/c823fb1480d6/0",
							"data-inspector-source": "pages/CaredOnes.tsx:162:135:62e6568641ec21d0c021d09a97bdbe14fbe68eb9f239c75124ab6e8ba9248944:0",
							className: "hidden sm:inline",
							children: t("caredOnes.addCaredOne", { caredOne: site.caredOneSingular })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/span/c79871f9d7ef/0",
							"data-inspector-source": "pages/CaredOnes.tsx:162:242:62e6568641ec21d0c021d09a97bdbe14fbe68eb9f239c75124ab6e8ba9248944:0",
							className: "sm:hidden",
							children: t("common.add", { defaultValue: "Add" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "pages/CaredOnes/CaredOnes/Dialog/6d866dda10fb/0",
				"data-inspector-source": "pages/CaredOnes.tsx:165:7:3a6d488019181d059e1d33407ba379df70c7199443fbdeb9ad9a481898b7b326:1",
				open: addOpen,
				onOpenChange: (open) => {
					setAddOpen(open);
					if (!open) {
						setSelectedPerson(null);
						setSearchQuery("");
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "pages/CaredOnes/CaredOnes/DialogContent/0",
					"data-inspector-source": "pages/CaredOnes.tsx:166:9:a1db9351f2bc97608c8aaec7c954792a0a22e6a3d66d076f63a06f6c1dd1b96a:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						"data-inspector-id": "pages/CaredOnes/CaredOnes/DialogHeader/0",
						"data-inspector-source": "pages/CaredOnes.tsx:167:11:f3baf1571d8ce48392ac850c82c313f167b22021224d9cc9f1db77c5581f7169:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/DialogTitle/c823fb1480d6/0",
							"data-inspector-source": "pages/CaredOnes.tsx:168:13:8f789862b7f5914f8dddd8bf1e2eb045d72212c6837777ae65157ec508750919:1",
							children: t("caredOnes.addCaredOne", { caredOne: site.caredOneSingular })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/DialogDescription/e3b98a4da31a/0",
							"data-inspector-source": "pages/CaredOnes.tsx:169:13:b20bb597d263a1071110187e48b9a1e910fc88fd9c1de6baaeef42c5c732c137:1",
							children: t("caredOnes.searchDesc")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/CaredOnes/CaredOnes/div/6266924e7f7c/0",
						"data-inspector-source": "pages/CaredOnes.tsx:171:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
						className: "space-y-4 mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/div/2",
								"data-inspector-source": "pages/CaredOnes.tsx:172:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/Label/e3b98a4da31a/0",
									"data-inspector-source": "pages/CaredOnes.tsx:173:15:c53a106279314f0896d99b53725a753d92b94237af07ab8d4ab6e06db564de74:1",
									children: t("caredOnes.searchByNameEmail")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/div/3",
									"data-inspector-source": "pages/CaredOnes.tsx:174:15:2ee6db76384fcb6a78cda5ce234f623dfafa724aa124f7883f76edcdd6bf11f8:1",
									className: "relative mt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/Search/0",
										"data-inspector-source": "pages/CaredOnes.tsx:174:46:2ee6db76384fcb6a78cda5ce234f623dfafa724aa124f7883f76edcdd6bf11f8:1",
										className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/Input/ec62087ddafc/0",
										"data-inspector-source": "pages/CaredOnes.tsx:174:139:2ee6db76384fcb6a78cda5ce234f623dfafa724aa124f7883f76edcdd6bf11f8:1",
										value: searchQuery,
										onChange: (e) => {
											setSearchQuery(e.target.value);
											setSelectedPerson(null);
										},
										placeholder: t("common.minCharsToSearch"),
										className: "pl-9"
									})]
								})]
							}),
							searchQuery.length >= 2 && !selectedPerson && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/div/853d0e696b11/0",
								"data-inspector-source": "pages/CaredOnes.tsx:177:15:a7421d053ab15927c6d24e7c4539b01c5a6ebc908cb282a650732bf89521f434:1",
								className: "border rounded-lg max-h-48 overflow-y-auto",
								children: (searchResults || []).length > 0 ? (searchResults || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/button/5bb20a0dce53/0",
									"data-inspector-source": "pages/CaredOnes.tsx:179:19:8bf583955d79b2beb630819e8ef8013ce73ce650d821997d630128de5b2e60ac:1",
									type: "button",
									className: "w-full min-h-11 flex items-center gap-3 p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors",
									onClick: () => setSelectedPerson(p),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/div/2bd3066c6c82/0",
										"data-inspector-source": "pages/CaredOnes.tsx:180:21:0f89f508c62e5fc96ebb9b7fad2635679a9bbede90f7494b854058bc7121e48b:1",
										className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
										children: p.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/img/0",
											"data-inspector-source": "pages/CaredOnes.tsx:181:39:232d5a66e56f51f2ec9038160ef282f2bc0ee1ffd06b7c8b2b7d957136c322cf:1",
											src: p.avatar_url,
											alt: "",
											className: "w-8 h-8 rounded-full object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/span/4171eef0947c/0",
											"data-inspector-source": "pages/CaredOnes.tsx:181:121:232d5a66e56f51f2ec9038160ef282f2bc0ee1ffd06b7c8b2b7d957136c322cf:1",
											className: "text-primary text-xs font-medium",
											children: (p.full_name || p.email || "?")[0]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/div/4",
										"data-inspector-source": "pages/CaredOnes.tsx:183:21:2d6596645d040de6fac4961b6804c6c1c4b6060ca1208b6a85bef1ba00ba445e:1",
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/p/110f55c1c1dd/0",
											"data-inspector-source": "pages/CaredOnes.tsx:183:46:2d6596645d040de6fac4961b6804c6c1c4b6060ca1208b6a85bef1ba00ba445e:0",
											className: "text-sm font-medium text-foreground truncate",
											children: p.full_name || ""
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/p/002f5d5517ef/0",
											"data-inspector-source": "pages/CaredOnes.tsx:183:129:2d6596645d040de6fac4961b6804c6c1c4b6060ca1208b6a85bef1ba00ba445e:0",
											className: "text-xs text-muted-foreground truncate",
											children: maskEmail(p.email)
										})]
									})]
								}, p.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/p/e3b98a4da31a/1",
									"data-inspector-source": "pages/CaredOnes.tsx:185:22:9c34fcf8942f34f35c60cfe04063b3addb95f321794591ae04ae11ca2a96011b:1",
									className: "p-3 text-sm text-muted-foreground text-center",
									children: t("common.noResults")
								})
							}),
							selectedPerson && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/div/5",
								"data-inspector-source": "pages/CaredOnes.tsx:189:15:b2b1979547382fae22743dbc2cf20385d5dc3028c395515678a3acd05ee81913:1",
								className: "rounded-lg border bg-muted/50 p-3 flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/div/da6c3fe208b1/0",
										"data-inspector-source": "pages/CaredOnes.tsx:190:17:13a20d118e8a75d9055d45061a4d72fbfb0d23dc214e1af20c735ee8ba2786ea:1",
										className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
										children: selectedPerson.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/img/1",
											"data-inspector-source": "pages/CaredOnes.tsx:191:48:91d08ad9adeb5199923d3c7a4b44903c910f2c13b5207033ebd7732dd872ff34:1",
											src: selectedPerson.avatar_url,
											alt: "",
											className: "w-10 h-10 rounded-full object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/span/9996ded9b77f/0",
											"data-inspector-source": "pages/CaredOnes.tsx:191:145:91d08ad9adeb5199923d3c7a4b44903c910f2c13b5207033ebd7732dd872ff34:1",
											className: "text-primary font-medium",
											children: (selectedPerson.full_name || "?")[0]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/div/6",
										"data-inspector-source": "pages/CaredOnes.tsx:193:17:d47c5dd7a33387761b5c6696442504f8473b851be3ede3cf674f5cb1d5647797:1",
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/p/9996ded9b77f/0",
											"data-inspector-source": "pages/CaredOnes.tsx:193:49:d47c5dd7a33387761b5c6696442504f8473b851be3ede3cf674f5cb1d5647797:0",
											className: "font-medium text-foreground",
											children: selectedPerson.full_name || ""
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/p/e2d412c2f184/0",
											"data-inspector-source": "pages/CaredOnes.tsx:193:128:d47c5dd7a33387761b5c6696442504f8473b851be3ede3cf674f5cb1d5647797:0",
											className: "text-xs text-muted-foreground",
											children: maskEmail(selectedPerson.email)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/39b22b8b0601/0",
										"data-inspector-source": "pages/CaredOnes.tsx:194:17:27ff3ad22d94a1ab9e384fc6346027526f9632360e4b2fc43235ad9e0a2f220e:1",
										variant: "ghost",
										size: "icon",
										className: "min-h-11 min-w-11",
										"aria-label": t("common.remove"),
										onClick: () => setSelectedPerson(null),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/X/0",
											"data-inspector-source": "pages/CaredOnes.tsx:194:155:27ff3ad22d94a1ab9e384fc6346027526f9632360e4b2fc43235ad9e0a2f220e:1",
											className: "h-3.5 w-3.5"
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/6c2d79d95eb0/0",
								"data-inspector-source": "pages/CaredOnes.tsx:197:13:29f8d524c804ab07a19a6635578a2f127c4dc4a8a1fa4530ad906faf1b458e7e:1",
								variant: "coral",
								className: "w-full",
								onClick: handleAddCaredOne,
								disabled: !selectedPerson || createUserCaredOne.isPending,
								children: [createUserCaredOne.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/Loader2/0",
									"data-inspector-source": "pages/CaredOnes.tsx:198:47:6dc2ce931f6e5dbfa570af7ec5d18ad351551460c62d1bb255da8f2e82aa8769:1",
									className: "h-4 w-4 animate-spin mr-2"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/HeartPulse/0",
									"data-inspector-source": "pages/CaredOnes.tsx:198:99:6dc2ce931f6e5dbfa570af7ec5d18ad351551460c62d1bb255da8f2e82aa8769:1",
									className: "h-4 w-4 mr-2"
								}), t("caredOnes.addCaredOne", { caredOne: site.caredOneSingular })]
							})
						]
					})]
				})
			}),
			caredOnes && caredOnes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/CaredOnes/CaredOnes/div/f6f5a506afab/0",
					"data-inspector-source": "pages/CaredOnes.tsx:207:11:b04ca630610d3ffb0c8c56884aaae7ea4184fc5b031929d910ccb60e658f71f3:1",
					className: "flex gap-2 mb-5 overflow-x-auto items-center -mx-4 px-4 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
					children: caredOnes.map((co) => {
						const name = co.cared_one?.full_name || site.caredOneSingular;
						const isActive = bare(selectedId) === bare(co.user_id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/div/7",
							"data-inspector-source": "pages/CaredOnes.tsx:212:17:e241832e3032b4cd70c5bcf2483213672be21b7523ebe00d4e8d6360f9ae4f36:1",
							className: `flex shrink-0 items-center rounded-lg border transition-colors ${isActive ? "bg-card border-primary shadow-xs" : "bg-transparent border-border hover:bg-accent/50"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/c2637f10cc28/0",
								"data-inspector-source": "pages/CaredOnes.tsx:213:19:569304f26a7bcf40611c09a0d863ff328068ca2602bfcfcc468189f79a2f480f:1",
								variant: "ghost",
								type: "button",
								"aria-pressed": isActive,
								onClick: () => setActiveTab(co.user_id),
								className: "min-h-11 h-auto px-4 py-2 text-sm font-medium flex items-center gap-2",
								children: [
									name,
									!tasksLoading && !tasksError && pendingCareTasks(careTasks, [co.user_id]).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/Badge/b844972d7a57/0",
										"data-inspector-source": "pages/CaredOnes.tsx:216:23:45d8dd7e22e3eba68c656f50596bbe0aa550c0798026601584d7ffc7a470c08b:1",
										variant: "secondary",
										className: "shrink-0",
										"aria-label": i18n.language?.startsWith("zh") ? `${pendingCareTasks(careTasks, [co.user_id]).length} 项待处理任务` : `${pendingCareTasks(careTasks, [co.user_id]).length} pending tasks`,
										children: pendingCareTasks(careTasks, [co.user_id]).length
									}),
									co.invitation_status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/span/c79871f9d7ef/1",
										"data-inspector-source": "pages/CaredOnes.tsx:221:23:c5e2535c182653ec86763c36d3e965745b2812e174d4f5cccd298a379be01aed:1",
										className: "rounded-full bg-muted px-2 py-0.5 text-[11px] font-normal text-muted-foreground",
										children: t("caredOnes.awaitingConsent", { defaultValue: "Waiting for consent" })
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/583202f62520/0",
								"data-inspector-source": "pages/CaredOnes.tsx:226:19:33c2e35f18b5a30c5e21844064a72a70671b6555a52e84cfba539490e8618e64:1",
								variant: "ghost",
								type: "button",
								"aria-label": `${name} — ${t("common.edit", { defaultValue: "Edit" })}`,
								onClick: () => setDetailCaredOne(co),
								className: "min-h-11 h-auto px-3 text-muted-foreground hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/Pencil/0",
									"data-inspector-source": "pages/CaredOnes.tsx:233:21:95e42db38d82ccbebe5207723225252c40b5b2f8ac1e494a36bb8976082bbf12:1",
									className: "h-4 w-4"
								}), t("common.edit", { defaultValue: "Edit" })]
							})]
						}, co.user_id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					"data-inspector-id": "pages/CaredOnes/CaredOnes/Dialog/64b5534c8fc1/0",
					"data-inspector-source": "pages/CaredOnes.tsx:241:11:84fafff08c6f325d382f1f912bb6cf9b40ba9bf1399d8d06b357cd4bf7c82f1d:1",
					open: !!detailCaredOne,
					onOpenChange: (open) => {
						if (!open) setDetailCaredOne(null);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						"data-inspector-id": "pages/CaredOnes/CaredOnes/DialogContent/c827d970585b/0",
						"data-inspector-source": "pages/CaredOnes.tsx:242:13:9ff7b7a8bb306a8be7b16c77f895fb191b1a9f0d20254cc4acf44ab821fdc562:1",
						children: detailCaredOne && (() => {
							const person = detailCaredOne.cared_one || {};
							const name = person.full_name || site.caredOneSingular;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/DialogHeader/1",
								"data-inspector-source": "pages/CaredOnes.tsx:248:21:109e9a5a3c77052f2ae2a70d8ff97c9b020f3b23b2b8ef48b0eb98cf11c1b462:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/DialogTitle/82a3537ff0db/0",
									"data-inspector-source": "pages/CaredOnes.tsx:249:23:95c16ba02ab9bfa44250dbc9cf7b7b38da41672e700136470e687c79083c614f:1",
									children: name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/DialogDescription/e3b98a4da31a/1",
									"data-inspector-source": "pages/CaredOnes.tsx:250:23:83f4e116089668d09ac6ffa24fe30317caee7267e583b158730793fd0a334298:1",
									children: t("caredOnes.manageAndTrack")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/div/8",
								"data-inspector-source": "pages/CaredOnes.tsx:252:21:21943a274ccac650f7a5e94af797b2ed4b0b7b22951c84f621b1a8cb600f66ba:1",
								className: "mt-2 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/div/9",
										"data-inspector-source": "pages/CaredOnes.tsx:253:23:bcb4a6fb9ca8b164cc1c4c31d4ea9f40539996ba009178338dbc1ab7bada44a6:1",
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/div/b7e940848789/0",
											"data-inspector-source": "pages/CaredOnes.tsx:254:25:00e7516776bdaf81ec059fd7644f2104cdd1f1f7680e7d51110b7edf8e43c4bc:1",
											className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
											children: person.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												"data-inspector-id": "pages/CaredOnes/CaredOnes/img/2",
												"data-inspector-source": "pages/CaredOnes.tsx:256:31:bab36e1431bbf3ded64c10ce63f3c3bc0112f1ab519bd2b120fd187f6402c2f3:1",
												src: person.avatar_url,
												alt: "",
												className: "w-12 h-12 rounded-full object-cover"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-id": "pages/CaredOnes/CaredOnes/span/b2988fc6de76/0",
												"data-inspector-source": "pages/CaredOnes.tsx:257:31:95d8e07630674fb011f085812e2861b9a0f782affcbcad09e7dfbb096554529c:1",
												className: "text-primary font-medium",
												children: String(name)[0]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/div/6630a08dfd46/0",
											"data-inspector-source": "pages/CaredOnes.tsx:259:25:5bf1ccd01fa4c7dc3b779aedf1df759a3d14612cae57086bda852f768aca7043:1",
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/CaredOnes/CaredOnes/p/82a3537ff0db/0",
												"data-inspector-source": "pages/CaredOnes.tsx:260:27:e403eb2eef0f59ef337022294dc16ffdac418b8673a81303f5a60d27c8f59231:1",
												className: "font-medium text-foreground truncate",
												children: name
											}), person.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/CaredOnes/CaredOnes/p/7d09182dbccc/0",
												"data-inspector-source": "pages/CaredOnes.tsx:261:44:f49aa9897df95f1fb60226a6215b6a280bf55641a93b9db28c4c89505f27d58e:1",
												className: "text-xs text-muted-foreground truncate",
												children: maskEmail(person.email)
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmergencyShareSetting, {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/EmergencyShareSetting/0",
										"data-inspector-source": "pages/CaredOnes.tsx:264:23:e0ad2a6e45411454045e2ad14e4a2701bd6fb9f4d1342fe61c345b07514207bc:1",
										caredOneId: bare(detailCaredOne.user_id)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, {
										"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialog/0",
										"data-inspector-source": "pages/CaredOnes.tsx:265:23:b129eacc858940e47e0aa1b55b219115fced2dbd69afa82564aa6d8c26b895b2:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialogTrigger/0",
											"data-inspector-source": "pages/CaredOnes.tsx:266:25:2988f125088e038d729858ac3e530132fff30f79c4d04f770d3935a0a88f0d48:1",
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/e3b98a4da31a/0",
												"data-inspector-source": "pages/CaredOnes.tsx:267:27:d1709c7876fe4cbbdb7445ce8533725d4c7812faa05982832501c9b7cf42d8e0:1",
												variant: "outline",
												className: "w-full text-destructive hover:text-destructive",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
														"data-inspector-id": "pages/CaredOnes/CaredOnes/Trash2/0",
														"data-inspector-source": "pages/CaredOnes.tsx:268:29:ae8d1d719db524420f82a0f8df03f1242c5e99a5acfd05ba6ac751f7fe0fcb3f:1",
														className: "h-4 w-4 mr-1"
													}),
													" ",
													t("common.remove")
												]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
											"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialogContent/0",
											"data-inspector-source": "pages/CaredOnes.tsx:271:25:ba3f2d8bc5221345922fb5315a0cbe5cae0144b3b9786842468ac527bd331eeb:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, {
												"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialogHeader/0",
												"data-inspector-source": "pages/CaredOnes.tsx:272:27:2f2e347fca5380eca89ddc58a4f395fe34d178a96db96e7a588d649f7ca36ae8:1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, {
													"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialogTitle/3a73492d6b64/0",
													"data-inspector-source": "pages/CaredOnes.tsx:273:29:6a0b334932620dd6f77e5f8b3d1cadb5cffef79ba7d932502f41f5ca8d39e591:1",
													children: [
														t("common.remove"),
														" ",
														name,
														"?"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
													"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialogDescription/05c1ac521a4d/0",
													"data-inspector-source": "pages/CaredOnes.tsx:274:29:750907cde82f81ccf792a644c184587fdafa2cb4e0e18e5a2b67e236e2d4f419:1",
													children: t("caredOnes.removed", {
														name,
														caredOnes: site.navLabels.caredOnes.toLowerCase()
													})
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
												"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialogFooter/0",
												"data-inspector-source": "pages/CaredOnes.tsx:276:27:a0a89ae2385e2c6cc9eaa7a80079e0fde8ef0b512271af65f3088453a5d30561:1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
													"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialogCancel/e3b98a4da31a/0",
													"data-inspector-source": "pages/CaredOnes.tsx:277:29:514e3c25eb725dd602eea49c7d94ea716060347e31c9491850a97a10bf339b12:1",
													children: t("common.cancel")
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
													"data-inspector-id": "pages/CaredOnes/CaredOnes/AlertDialogAction/03f0d06069f3/0",
													"data-inspector-source": "pages/CaredOnes.tsx:278:29:ec514e88ad5fba1042cb284bb3504c70a8613e67f93ba1274adce0613f085733:1",
													onClick: () => {
														handleRemoveCaredOne(detailCaredOne.id, name);
														setDetailCaredOne(null);
													},
													className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
													children: t("common.remove")
												})]
											})]
										})]
									})
								]
							})] });
						})()
					})
				}),
				openCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/CaredOnes/CaredOnes/div/ddfba6b7e5bc/0",
					"data-inspector-source": "pages/CaredOnes.tsx:295:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/38a058c2caf4/0",
						"data-inspector-source": "pages/CaredOnes.tsx:296:15:72979dae27e46c2a3456dac558c79a26a5b56c6c9d5d42056931b8de798b0b71:1",
						variant: "ghost",
						size: "sm",
						className: "mb-4",
						onClick: () => setOpenCard(null),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/ArrowLeft/0",
								"data-inspector-source": "pages/CaredOnes.tsx:296:100:72979dae27e46c2a3456dac558c79a26a5b56c6c9d5d42056931b8de798b0b71:1",
								className: "h-4 w-4 mr-1"
							}),
							" ",
							t("caredOnes.backToCards")
						]
					}), selectedId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureDetail, {
						"data-inspector-id": "pages/CaredOnes/CaredOnes/FeatureDetail/0",
						"data-inspector-source": "pages/CaredOnes.tsx:297:30:a36c9ac843d2f2eec171231e82b55a54f2ab9a9abb8ecb5a93211ec52d03f99f:1",
						cardKey: openCard,
						caredOneId: selectedId,
						caredOneName
					}, `${bare(selectedId)}:${openCard}`)]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/CaredOnes/CaredOnes/div/5e2eb7f74cbc/0",
					"data-inspector-source": "pages/CaredOnes.tsx:300:13:35a8afa0133a07fba3a42c3440bdc58ec1b659410d86d6398aa5dbfbefce1082:1",
					className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5",
					children: featureCards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/38fa87e0fb68/0",
						"data-inspector-source": "pages/CaredOnes.tsx:302:17:8e6548c9c45435916a5d369b76634f3bbd9c1b5451a40e70cd8163267718df87:1",
						variant: "ghost",
						onClick: () => setOpenCard(card.key),
						className: "h-auto block whitespace-normal text-left rounded-xl border border-transparent card-elevated p-3.5 hover:border-primary/30 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/div/10",
							"data-inspector-source": "pages/CaredOnes.tsx:305:19:1496553f4d1bb6081812d951d082b797712b901731427e021209786d61f65e2f:1",
							className: "h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center text-primary mb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(card.icon, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/h3/89ad2e9486e8/0",
							"data-inspector-source": "pages/CaredOnes.tsx:308:19:d773500c6da32dae198d00c8ca439ca12521fc152da93150eb1e8fd332acb234:1",
							className: "font-semibold text-foreground text-[13px] leading-tight flex items-center gap-2",
							children: [card.title, card.key === "tasks" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								"data-inspector-id": "pages/CaredOnes/CaredOnes/Badge/567f471019a6/0",
								"data-inspector-source": "pages/CaredOnes.tsx:308:152:d773500c6da32dae198d00c8ca439ca12521fc152da93150eb1e8fd332acb234:1",
								variant: "secondary",
								className: "shrink-0",
								children: tasksLoading || tasksError ? "—" : selectedPendingCount
							})]
						})]
					}, card.key))
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				"data-inspector-id": "pages/CaredOnes/CaredOnes/Card/0",
				"data-inspector-source": "pages/CaredOnes.tsx:316:9:9df5ed3d9553ae45a773e3ae764b4589d00585c17b92b1196958a4188342c189:1",
				className: "border-transparent card-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/CaredOnes/CaredOnes/CardContent/0",
					"data-inspector-source": "pages/CaredOnes.tsx:317:11:1f0cb0e990a5b49b426257cd654c407189a79c7ea5b3e9f759061309c302c6ef:1",
					className: "p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/HeartPulse/1",
							"data-inspector-source": "pages/CaredOnes.tsx:318:13:c49f462c983be6b983c6fd38d0cdbe916346b31f2976527dc969209a5f5c881f:1",
							className: "h-12 w-12 text-muted-foreground mx-auto mb-3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/h3/f9f8272e1dfd/0",
							"data-inspector-source": "pages/CaredOnes.tsx:319:13:ac450ae100caab9e9d2f442efd2c2d2f02969548a1104dd4bfe50d0985916953:1",
							className: "font-semibold text-foreground mb-1",
							children: t("caredOnes.noCaredOnesYet", { caredOnes: site.navLabels.caredOnes.toLowerCase() })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/p/e3b98a4da31a/2",
							"data-inspector-source": "pages/CaredOnes.tsx:320:13:5a48b775db5ddc6fbd867d3062714919051c2ba850b223122d87280e6bada4f0:1",
							className: "text-sm text-muted-foreground mb-4",
							children: t("caredOnes.addPeopleDesc")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/CaredOnes/CaredOnes/Button/a8ea79c4d38a/0",
							"data-inspector-source": "pages/CaredOnes.tsx:321:13:6c101572d3399bb221d421a7573a21a0a02b427ba8b23c41bab4f0e89c1bf1e2:1",
							variant: "coral",
							onClick: () => setAddOpen(true),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {
									"data-inspector-id": "pages/CaredOnes/CaredOnes/UserPlus/1",
									"data-inspector-source": "pages/CaredOnes.tsx:321:70:6c101572d3399bb221d421a7573a21a0a02b427ba8b23c41bab4f0e89c1bf1e2:1",
									className: "h-4 w-4 mr-1"
								}),
								" ",
								t("caredOnes.addFirst", { caredOne: site.caredOneSingular })
							]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { CaredOnes as t };
