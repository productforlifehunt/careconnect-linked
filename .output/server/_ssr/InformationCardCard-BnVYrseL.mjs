import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { Dt as MapPin, Ft as Link2, Gt as IdCard, R as ShieldOff, V as Share2, c as Users, hn as Copy, in as Eye, it as Plus, jt as LoaderCircle, rt as QrCode, ut as Pencil, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-DHxbK-sS.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-tMv_7nBM.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { At as useEmergencyContacts, Fn as useSetInformationCardContacts, Jt as useInformationCards, St as useDeleteInformationCard, cr as useUpdateInformationCard, d as parseCardDate, p as toDatetimeLocal, qt as useInformationCardContactIds, tt as useCreateInformationCard } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { n as SheetLocationTag, r as useInfoSheetKnowledge, t as SheetAIPanel } from "./info-sheet-parts-Dx2cuYtD.mjs";
import { t as QRCodeSVG } from "../_libs/qrcode.react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/InformationCardCard-BnVYrseL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_FORM = {
	cared_ones_information_card_name: "",
	cared_ones_name: "",
	cared_ones_description: "",
	cared_ones_information_card_description: "",
	status: "Draft",
	displays_location: "No"
};
function statusVariant(status) {
	if (status === "Active") return "default";
	if (status === "Paused") return "secondary";
	return "outline";
}
function InformationCardCard({ caredOneId, caredOneName }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const statusLabel = (s) => s === "Active" ? Z("启用", "Active") : s === "Paused" ? Z("已暂停", "Paused") : Z("草稿", "Draft");
	const { data: cards, isLoading, isError } = useInformationCards(caredOneId);
	const create = useCreateInformationCard();
	const update = useUpdateInformationCard();
	const del = useDeleteInformationCard();
	const setCardContacts = useSetInformationCardContacts();
	const { data: emergencyContacts } = useEmergencyContacts(caredOneId);
	const knowledge = useInfoSheetKnowledge(caredOneId);
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [formVisibility, setFormVisibility] = (0, import_react.useState)("Visible to caregivers of the cared one");
	const [shareStart, setShareStart] = (0, import_react.useState)(toDatetimeLocal());
	const [shareExpires, setShareExpires] = (0, import_react.useState)("No");
	const [shareEnd, setShareEnd] = (0, import_react.useState)("");
	const [afterExpiry, setAfterExpiry] = (0, import_react.useState)("Visible to the care group of the cared one and the caregivers of the cared one");
	const [formContacts, setFormContacts] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [formContactsReady, setFormContactsReady] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const { data: editLinkedIds, isLoading: editLinkedLoading } = useInformationCardContactIds(editId);
	const [contactsCardId, setContactsCardId] = (0, import_react.useState)(null);
	const [shareCard, setShareCard] = (0, import_react.useState)(null);
	const [viewCard, setViewCard] = (0, import_react.useState)(null);
	const [deleteCard, setDeleteCard] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!formOpen || !editId || formContactsReady || editLinkedLoading || editLinkedIds === void 0) return;
		setFormContacts(new Set((editLinkedIds || []).map(String)));
		setFormContactsReady(true);
	}, [
		formOpen,
		editId,
		formContactsReady,
		editLinkedLoading,
		editLinkedIds
	]);
	const toggleFormContact = (id) => {
		setFormContacts((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const openCreate = () => {
		setEditId(null);
		setForm({
			...EMPTY_FORM,
			cared_ones_name: caredOneName || ""
		});
		setFormVisibility("Visible to caregivers of the cared one");
		setShareStart(toDatetimeLocal());
		setShareExpires("No");
		setShareEnd("");
		setAfterExpiry("Visible to the care group of the cared one and the caregivers of the cared one");
		setFormContacts(new Set((emergencyContacts || []).map((c) => String(c.id))));
		setFormContactsReady(true);
		setFormOpen(true);
	};
	const openEdit = (card) => {
		setEditId(String(card.id));
		setForm({
			cared_ones_information_card_name: card.cared_ones_information_card_name || "",
			cared_ones_name: card.cared_ones_name || "",
			cared_ones_description: card.cared_ones_description || "",
			cared_ones_information_card_description: card.cared_ones_information_card_description || "",
			status: card.status || "Draft",
			displays_location: card.displays_location || "No"
		});
		setFormVisibility(card.share_visibility || "Visible to caregivers of the cared one");
		setShareStart(card.public_share_starts_at || toDatetimeLocal());
		setShareExpires(card.public_share_expires === "Yes" ? "Yes" : "No");
		setShareEnd(card.public_share_expires_at || "");
		setAfterExpiry(card.share_visibility_after_expiry || "Visible to the care group of the cared one and the caregivers of the cared one");
		setFormContacts(/* @__PURE__ */ new Set());
		setFormContactsReady(false);
		setFormOpen(true);
	};
	const handleSubmit = async () => {
		if (!form.cared_ones_information_card_name.trim()) {
			toast({
				title: Z("请先写这份须知的用途", "Please say what this sheet is for"),
				variant: "destructive"
			});
			return;
		}
		const isPublic = formVisibility === "Visible to public";
		const expiring = isPublic && shareExpires === "Yes";
		if (expiring && !parseCardDate(shareEnd)) {
			toast({
				title: Z("请填写公开分享的结束时间", "Please choose when public sharing ends"),
				variant: "destructive"
			});
			return;
		}
		if (expiring && (parseCardDate(shareEnd) ?? 0) <= (parseCardDate(shareStart) ?? 0)) {
			toast({
				title: Z("结束时间要晚于开始时间", "The end time must be after the start time"),
				variant: "destructive"
			});
			return;
		}
		const sharing = {
			share_visibility: formVisibility,
			public_share_starts_at: isPublic ? shareStart || toDatetimeLocal() : "",
			public_share_expires: expiring ? "Yes" : "No",
			public_share_expires_at: expiring ? shareEnd : "",
			share_visibility_after_expiry: expiring ? afterExpiry : ""
		};
		setSaving(true);
		try {
			let cardId = editId;
			if (editId) await update.mutateAsync({
				id: editId,
				...form,
				...sharing
			});
			else {
				const created = await create.mutateAsync({
					caredOneUserId: caredOneId,
					...form,
					...sharing
				});
				cardId = String(created.id);
			}
			if (cardId) await setCardContacts.mutateAsync({
				cardId,
				contactIds: [...formContacts]
			});
			setFormOpen(false);
			toast({ title: editId ? Z("信息卡已更新", "Information card updated") : Z("信息卡已创建", "Information card created") });
		} catch (e) {
			toast({
				title: editId ? Z("更新失败", "Update failed") : Z("创建失败", "Create failed"),
				description: e?.message,
				variant: "destructive"
			});
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/0",
		"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:176:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/h2/0",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:179:11:061d90cd2be26b87ed6c31302c4c0ab6b10462d969cf18e1e19cf4ff796eebb4:1",
					className: "text-lg font-bold text-foreground",
					children: Z("被照护者信息卡", "Cared One Information Cards")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/0",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:180:11:97fef22395058332b665a3121af148b4fdaab7000acc4b6f3127ff41b9018c7b:1",
					className: "text-xs text-muted-foreground",
					children: Z("可分享给帮忙照看的人，或在走失时给外人看", "Share with someone helping out, or with finders if they go missing")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/eb3f49152805",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:182:9:f0dd1aa8922802f74b9d44e1acb25e5edfc98f2546fd5f152c3b61a8c6a3ef9e:1",
					size: "sm",
					onClick: openCreate,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
						" ",
						Z("新建一张", "New card")
					]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" }) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/1",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:190:11:68389336633f6f9351a2de87706a6e01dc85f454613348aa907bbc5408cbd32a:1",
					className: "text-muted-foreground",
					children: Z("暂时无法加载信息卡，请稍后再试。", "Information cards could not be loaded. Please try again.")
				})]
			}) : (cards || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdCard, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/2",
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:195:11:5e92ab8f3c5ab9d081095ebf717e67dbec42eebadd7f433e94b88c9c51d23d5d:1",
						className: "text-muted-foreground mb-3",
						children: Z("还没有信息卡", "No information cards yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/eb3f49152805",
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:196:11:b8c9c8f50647b2a55e485f56140ea14fc134b8daaaec3ab6c3c0e37886b20fa1:1",
						size: "sm",
						onClick: openCreate,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
							" ",
							Z("创建第一张", "Create first card")
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/1",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:200:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (cards || []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Card/0",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:202:13:56bac33e74e80ec2ae9539bc9d5fe5a33321158deec172f462f599f05a7dff03:1",
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/button/be6861127257",
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:205:19:e05fff7c5dc392cd75f7aba8f0c69bba5b73a321c8356daf9dd2bc7d4f9193af:1",
								type: "button",
								className: "min-w-0 flex-1 text-left group",
								onClick: () => setViewCard(c),
								"aria-label": Z("查看信息卡", "View information card"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/2",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:211:21:ef1ddffb4c5df7d044deed3b3ead476a5c17acd1d1f7bc1cab893436e44f4a56:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/h4/0",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:212:23:97ac5fd02968e563e50ad27fbf979932ddfbaab6940f4b98c41c5cd74a54188e:1",
												className: "font-medium text-foreground text-sm truncate group-hover:underline",
												children: c.cared_ones_information_card_name || Z("（未命名）", "(Untitled)")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Badge/0",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:213:23:1b997b80c1295cb7e0ee9d6e266d70c29e0def0b91ff213edf341420d4c6b697:1",
												variant: statusVariant(c.status),
												className: "text-[10px]",
												children: statusLabel(c.status)
											}),
											c.displays_location === "Yes" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Badge/1",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:215:25:c5db38eccc01170d0003452f7896066d9daf18b1aef42b3c9c4d6f0cb0a0f324:1",
												variant: "outline",
												className: "text-[10px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-2.5 w-2.5 mr-1" }), Z("位置", "Location")]
											})
										]
									}),
									c.cared_ones_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/3",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:218:43:aa7f57c6d3348bd6845c1f32291e5eeca77760d07399fd1fd27ce9f1d1beed48:1",
										className: "text-xs text-muted-foreground mt-1",
										children: [Z("对象：", "For: "), c.cared_ones_name]
									}),
									c.cared_ones_description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/4",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:220:23:86aba4e570f5321a6362f877145aec5cf3bafb0410027b0895e0987d9204a530:1",
										className: "text-xs text-muted-foreground mt-1 line-clamp-2",
										children: c.cared_ones_description
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1 shrink-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/e6245368c886",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:224:21:2780e40812b18e8bdf6e9bb01c2437992cf67d378d1b75c15fe277ebd2dc2305:1",
										variant: "outline",
										size: "sm",
										onClick: () => setShareCard(c),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-3 w-3 mr-1" }),
											" ",
											Z("分享", "Share")
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/f314c6cddce4",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:225:21:a2435df33b72b00621a605698965c15a515d5189f9da76bcfee844b9b7d69b1e:1",
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7",
										onClick: () => setViewCard(c),
										title: Z("查看", "View"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/ad3a468a747d",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:226:21:16ad998dbe4b305c9022dc7daef21610814444d5f2d4a306317d636be20baf15:1",
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7",
										onClick: () => setContactsCardId(String(c.id)),
										title: Z("选择这份须知上显示的紧急联系人", "Choose emergency contacts shown on this sheet"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/dbaa6ff79849",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:227:21:3ba970491965935fa54b4a4f5e637c61e8e410481d0985ca3b25b4be3280a65f:1",
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7",
										onClick: () => openEdit(c),
										title: Z("编辑", "Edit"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/1fa8a2583abe",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:228:21:85a05d8c9b12a51240ebed5e043cbf78457f733403522ece14dcbb38a9c4c8a4:1",
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7 text-destructive",
										onClick: () => setDeleteCard(c),
										title: Z("删除", "Delete"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
									})
								]
							})]
						})
					})
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Dialog/e56fd0cc59c9",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:238:7:7d58ae741c8561d9d34cc7bcb128091730f1e82ede8ef22767bbaeb671a67221:1",
				open: !!deleteCard,
				onOpenChange: (o) => !o && setDeleteCard(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/DialogTitle/0",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:241:13:ef7c931fd4c4827ce440971b002cbfbe277773684182a8436d1b004fffee30dd:1",
					children: Z("删除这张信息卡？", "Delete this information card?")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/DialogDescription/0",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:242:13:51b58bd6f771492fe8f328f8b6b32808a35fbee191088e76e53a5f41905e432b:1",
					children: Z("删除后无法恢复，已分享的链接也会失效。", "This cannot be undone, and any shared link will stop working.")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 justify-end mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/eb8322953b4d",
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:247:13:68d0d1c76bdcb405d40f81ce3abac20ca2a559da1d30ac1fd0f9aee7b17cd5be:1",
						variant: "ghost",
						onClick: () => setDeleteCard(null),
						children: Z("取消", "Cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/53482e3cf32b",
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:248:13:60054442b94c42177db5b21fb03d894a904d65d6c0a0f642d1b4d56fb66f23b7:1",
						variant: "destructive",
						disabled: del.isPending,
						onClick: () => del.mutate(String(deleteCard.id), {
							onSuccess: () => {
								setDeleteCard(null);
								toast({ title: Z("信息卡已删除", "Information card deleted") });
							},
							onError: (e) => toast({
								title: Z("没能删除", "Couldn't delete"),
								description: e?.message,
								variant: "destructive"
							})
						}),
						children: [del.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-1" }), Z("确认删除", "Yes, delete")]
					})]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Dialog/40b0d82474c9",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:265:7:e2545ca517bad746c731af699a636d57dd82f79cd87f541e9dd746f1d2e5db21:1",
				open: formOpen,
				onOpenChange: setFormOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/DialogTitle/1",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:268:13:122461ab05e062ee985edb98bd912438ddb1f9a752027a117ee7fdedae94e1b3:1",
							children: editId ? Z("编辑信息卡", "Edit information card") : Z("新建信息卡", "New information card")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/DialogDescription/1",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:269:13:f54d51aca1c6908f029a2df89929bf1c73d4ac7cb7fa70eab2f81d7287f7f0ef:1",
							children: Z("写一张可以直接发给别人的信息卡：要注意什么、这次需要帮什么。", "Write something you can hand to another person: what to watch out for and what help is needed this time.")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/3",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:271:11:2995dfc8cb02ff86e5b949e1f6885e03932586a0dbe7a96a660c24336b94b5e2:1",
							className: "space-y-3 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/0",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:273:15:d8898c33c4280b0974922499415596209f0178ba6e7492d5c827e20fae3d2001:1",
									children: [
										Z("这份须知的用途", "What this sheet is for"),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Input/2b8c416c01b2",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:274:15:5eff4998b44568a709e389ce5738d57d48841ebda3994f245f551660cf32c696:1",
									className: "mt-1",
									value: form.cared_ones_information_card_name,
									onChange: (e) => setForm((p) => ({
										...p,
										cared_ones_information_card_name: e.target.value
									})),
									placeholder: Z("例如：帮忙照看两小时、走失时给路人看、就诊陪同", "e.g. Cover two hours, Show to a finder, Hospital visit")
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/1",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:279:15:5f640dbcf5341d8e8f91e861bcb3beac288194c339a7d41c5a86b3e07aee7225:1",
										children: Z("须知上显示的被照护者姓名", "Name shown on the sheet")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Input/e015802f6731",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:280:15:72a477b5d9196039811ea69ee321f54897bcd247484208b3e1e28feac092b3b8:1",
										className: "mt-1",
										value: form.cared_ones_name,
										onChange: (e) => setForm((p) => ({
											...p,
											cared_ones_name: e.target.value
										})),
										placeholder: caredOneName || Z("可填化名，不必是真名", "Can be a nickname, not necessarily the real name")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/5",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:283:15:3fea278966836770959f09fd1e4cfc91d7687421cc152c10e03eeac6c2c3682c:1",
										className: "text-[11px] text-muted-foreground mt-1",
										children: Z("默认使用被照护者的用户名，可改成化名以保护隐私。", "Defaults to the cared one's name; you can change it to a nickname for privacy.")
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/2",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:287:15:dc792255334ee0d6d450da58c7c167c80f6c8b7aeda1ab73e5b8f5be6b6920de:1",
									children: Z("基本情况", "Background")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Textarea/bd135b3bae65",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:288:15:9121151f1a10320a87addc43a1d2486b81b91ae8ddbf51ccf06db331e2afd3be:1",
									className: "mt-1",
									rows: 3,
									value: form.cared_ones_description,
									onChange: (e) => setForm((p) => ({
										...p,
										cared_ones_description: e.target.value
									})),
									placeholder: Z("基本情况：身体状况、习惯、忌讳、怎么沟通……", "Background: condition, habits, what to avoid, how to communicate…")
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/3",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:293:15:e3d554a103c10aff914d24fb6ebec85812263b002dbbfce220b2d21b6fe4f6f2:1",
										children: Z("这次的具体安排", "What's needed this time")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Textarea/24099974257b",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:294:15:c1f042a3553065487976d7e7c101e91de78bba16c20ce516fd55a45307c4db19:1",
										className: "mt-1",
										rows: 3,
										value: form.cared_ones_information_card_description,
										onChange: (e) => setForm((p) => ({
											...p,
											cared_ones_information_card_description: e.target.value
										})),
										placeholder: Z("例如：请早上七点到九点帮忙照看两个小时，八点提醒吃药。", "e.g. Please stay 7–9am and remind about the 8am pill.")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/6",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:297:15:68d7c33e8e5aabc5eb7208292db55e31acccaea073399d59a6ddaa9935f4140b:1",
										className: "text-[11px] text-muted-foreground mt-1",
										children: Z("只写这一次的安排，长期的护理计划请写在「护理计划」里。", "Only this occasion. Long-term plans belong in the Care Plan.")
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/4",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:301:17:52c29f9261ca05b3dd9a209a37b1d260b141010605eac3c54138fc9647ec5440:1",
										children: Z("状态", "Status")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Select/85f6321426a1",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:302:17:efe029d4ff16f91abac001616ac26ea62c199fc693fca04ee70a2c1e14927a47:1",
										value: form.status,
										onValueChange: (v) => setForm((p) => ({
											...p,
											status: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectTrigger/0",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:303:19:26ac750eab92aba030b1d9f1f3792b599419c4e6d70f50cf8a976c27218847b2:1",
											className: "mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/0",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:305:21:f84898a568d956679bbd86c1785b84c7b2131bbc095ff0c519e699582f509065:1",
												value: "Draft",
												children: Z("草稿", "Draft")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/1",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:306:21:535a560945528c021bde61aa9aae2617f534a617abf84e5f1f91b2adfda944a6:1",
												value: "Active",
												children: Z("启用", "Active")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/2",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:307:21:af13bf0e49c05c8d3e7ec36c1cc611fa7f49fb7183a702cffc66326d11ae9476:1",
												value: "Paused",
												children: Z("已暂停", "Paused")
											})
										] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/5",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:312:17:d847778447734058da1720fce4ff2f2b6c50dc636c2ee2553f55a1b4ece8c2d3:1",
										children: Z("显示位置", "Displays location")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Select/3f80f76b0d0d",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:313:17:5724310fa9d2115520c4878368001185955edb223561164dc54b9d57bdfd7c65:1",
										value: form.displays_location,
										onValueChange: (v) => setForm((p) => ({
											...p,
											displays_location: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectTrigger/1",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:314:19:26ac750eab92aba030b1d9f1f3792b599419c4e6d70f50cf8a976c27218847b2:1",
											className: "mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/3",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:316:21:3c0428428ed9fb0b042fc006b8bcb52f5791c35163525e5c7733eb05909f64f5:1",
											value: "No",
											children: Z("否", "No")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/4",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:317:21:41db1d4ccb4f6577254c7a7587ed29e98cf574f498298fcb17b0a6258003dafe:1",
											value: "Yes",
											children: Z("是", "Yes")
										})] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/6",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:324:15:2f8f2d606a93349b1fc17dfebea2d162d391949d5d60839ca32733238fc4beb5:1",
										children: Z("谁可以看", "Who can view")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Select/c841db783077",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:325:15:cd9333f4a426b439588e0d5f930e37384697af9a43f3b1e7290f2d295b90801e:1",
										value: formVisibility,
										onValueChange: setFormVisibility,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectTrigger/2",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:326:17:875905f3500d4cf5e4ac18d1b201563009fa76a9e7fd33b22ae9ceca1305cfed:1",
											className: "mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/5",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:328:19:09b30e22078202edc46d69f9a9762a9f873b91f2b10d5cfe0f54f57b8848cdf8:1",
												value: "Visible to public",
												children: Z("所有人可见", "Visible to everyone")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/6",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:329:19:cfa0c513639574fcebfae1dfbfd0470a5a02b6e4230eed17938f9dc1998b4346:1",
												value: "Visible to the care group of the cared one",
												children: Z("仅此被照护者所在护理群组的成员（app 内，需登录）", "Only members of this cared one's care group (in this app, sign-in needed)")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/7",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:330:19:aa129618926743c65134a1ea706551a56fafcc601582f897bbcf53a3c728ebda:1",
												value: "Visible to caregivers of the cared one",
												children: Z("仅此被照护者的护理者（app 内，需登录）", "Only this cared one's caregivers (in this app, sign-in needed)")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/8",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:331:19:db1e65ef09243cfe0837e1c3763683a5ccc332061ea376172a8e881ea5d6e337:1",
												value: "Visible to the care group of the cared one and the caregivers of the cared one",
												children: Z("此被照护者的护理群组成员和护理者（app 内，需登录）", "This cared one's care group members and caregivers (in this app, sign-in needed)")
											})
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/7",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:334:15:a68e5b55cb468373d15201689ff601bc12cd0bd922213f314efb71cc9021af85:1",
										className: "text-xs text-muted-foreground mt-1",
										children: Z("您自己永远可以看到这张卡。", "You can always see this card yourself.")
									})
								] }),
								formVisibility === "Visible to public" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/4",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:338:15:3bf29eacb5371bd1fe5e7f7cb8cf173543816c930766a0c6c463db5553ca6543:1",
									className: "space-y-3 rounded-md border p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/7",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:340:19:03a56f01a7e89f38c2460e08af75fe576ac7ff7536100b29b6a8e4aad3680b88:1",
											htmlFor: "share-start",
											children: Z("公开开始时间", "Public sharing starts")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Input/4ae410e6680d",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:341:19:1e25bffa16da5450f52e1cb2d873424a31979ae67b371a13e915b352c0029b17:1",
											id: "share-start",
											type: "datetime-local",
											className: "mt-1",
											value: shareStart,
											onChange: (e) => setShareStart(e.target.value)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/8",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:344:19:35488d14ad842c6f079a08db953e7a9f165aad703616e67f701b8e91a22d5f9c:1",
											children: Z("到时间自动停止公开吗？", "Stop public sharing automatically?")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Select/b177ad4eba03",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:345:19:ff7c173d47974e5ca6d51551b53c91fee8ffa1864a818ee4acced3f860fc2016:1",
											value: shareExpires,
											onValueChange: (v) => setShareExpires(v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectTrigger/3",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:346:21:5a4de87bd0c773664425dbc1367c8c17e00fb95acad8833a5bb974b34e4aaf9f:1",
												className: "mt-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/9",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:348:23:c13f947c4415c996b421cd5c07e0c9141b6b38b77afdb91891bbc85fb9b8f8d3:1",
												value: "No",
												children: Z("不，一直公开", "No, keep it public")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/10",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:349:23:e9dc488a52bcb8d5f97a47312d86d125439bde3e7df28837548f4de8f26bc5b0:1",
												value: "Yes",
												children: Z("是，到时间自动停止", "Yes, stop at a set time")
											})] })]
										})] }),
										shareExpires === "Yes" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/8",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:355:21:d4eddf4b7adb001c689dc9e90c6fadedb39e22d0f66b388acf7e237daf5322c4:1",
												className: "text-xs text-muted-foreground",
												children: Z("建议在事情办完的时候停止公开。停止后，即使别人手里有链接也看不到了，可以保护被护理者的个人信息。", "We suggest stopping when the task is done. After that, people with the link can no longer see it, which protects the cared one's personal information.")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/9",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:357:23:47b074a559911b5cf39f54d1bdcdefaf3716b763691c9b8b006450634819937d:1",
												htmlFor: "share-end",
												children: Z("公开结束时间", "Public sharing ends")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Input/9b88a65101d4",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:358:23:62748535cf743f676eca78ba99a02a9dca1322f9d7c6302587bb13f0cb999dd9:1",
												id: "share-end",
												type: "datetime-local",
												className: "mt-1",
												value: shareEnd,
												min: shareStart,
												onChange: (e) => setShareEnd(e.target.value)
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/10",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:361:23:4ec90a6715d9673679f2f218b7dc96726aa9781faa371795db46f3bbed38e66a:1",
												children: Z("结束后谁还能看", "Who can view after it ends")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Select/80c1166eaca7",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:362:23:a369e8f631f44bb1095348055d51888263170a8811658a16b85bd100df643b7f:1",
												value: afterExpiry,
												onValueChange: setAfterExpiry,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectTrigger/4",
													"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:363:25:0bd7e24793d1d952b313948b05fdb171289e1a3d8e5b3be1058d3fe09d65d839:1",
													className: "mt-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/11",
														"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:365:27:7dae1e5c2b807fa409bfcb86d39ed5b4d6892b950911b64f0785915f9a46afb8:1",
														value: "Visible to the care group of the cared one",
														children: Z("仅护理群组成员", "Only care group members")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/12",
														"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:366:27:f633438de44f450debac18ece43b0a6bb1076c9c62dff2293d995a0bbb56f58b:1",
														value: "Visible to caregivers of the cared one",
														children: Z("仅护理者", "Only caregivers")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SelectItem/13",
														"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:367:27:5b657525ecc58060b2435dd0e03d1cd6e86f2f5b2e138c553bbe5deb619d0629:1",
														value: "Visible to the care group of the cared one and the caregivers of the cared one",
														children: Z("护理群组成员和护理者", "Care group members and caregivers")
													})
												] })]
											})] })
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Label/11",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:377:15:767084f8fe396e6e962bd1082f774a79f03725addaa288e8196136795a38ccc9:1",
									children: Z("显示哪些紧急联系人", "Emergency contacts to show")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/5",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:378:15:c9b67f904ce66c6d193648238063a91b528565ce8315851c9e874a0ffea8b7fd:1",
									className: "mt-1 space-y-2 max-h-48 overflow-y-auto",
									children: !formContactsReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground mx-auto my-3" }) : (emergencyContacts || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/9",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:382:19:18ca5a86b1081d427d82b966037c6a4b5a2d88017277245d3a5d96f0a0190acf:1",
										className: "text-xs text-muted-foreground py-2",
										children: Z("尚无紧急联系人，请先在「紧急联系人」卡片中添加。", "No emergency contacts yet. Add some from the Emergency Contacts card first.")
									}) : (emergencyContacts || []).map((c) => {
										const id = String(c.id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/label/0",
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:387:23:cd03a5cbbf5324a2260692e1e1871e0322a5a603af377ef8d617088457967f61:1",
											className: "flex items-center gap-3 rounded-md border p-2 cursor-pointer hover:bg-accent",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Checkbox/a8412628de18",
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:388:25:7d2ea4a9df4800ea5de9f522e51664ef655edea64afa8ccede43512746946067:1",
												checked: formContacts.has(id),
												onCheckedChange: () => toggleFormContact(id)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/6",
													"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:390:27:5ba52dc78be9991fbeec5032192570322c665415b24fdb38dae215918a8619eb:1",
													className: "text-sm font-medium truncate",
													children: c.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/7",
													"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:391:27:460ce4c2870ab869b3e1725739974ba40570b9c61eaae7084f761b2a99256c71:1",
													className: "text-xs text-muted-foreground truncate",
													children: [c.phone, c.relationship ? ` • ${c.relationship}` : ""]
												})]
											})]
										}, id);
									})
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/40b0d82474c9",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:401:13:e5457035883995f9c3237853a033893b97362ed016a78ef21102199f60ec6757:1",
							variant: "ghost",
							onClick: () => setFormOpen(false),
							children: Z("取消", "Cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/8cdee946b60f",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:402:13:bfa773888f0a5a48f568230b576386aeb6af942d79568c33e4ccdeb958264810:1",
							onClick: handleSubmit,
							disabled: saving || !formContactsReady,
							children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }), editId ? Z("保存修改", "Save changes") : Z("创建", "Create sheet")]
						})] })
					]
				})
			}),
			contactsCardId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactSelectorDialog, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/ContactSelectorDialog/b389354467d5",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:411:9:e5acaefc3cd7d9686a6a957b731daa34148d2b822458057dee5f919a3afd1c21:1",
				cardId: contactsCardId,
				allContacts: emergencyContacts || [],
				onClose: () => setContactsCardId(null)
			}),
			shareCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareCardDialog, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/ShareCardDialog/8ab3b5aaaa78",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:419:9:73aff29ecdc4ff3afd7f3b4598500adbd2e628e4a02d38eeb20809bad7468e10:1",
				card: shareCard,
				onClose: () => setShareCard(null)
			}),
			viewCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Dialog/7800c512df6e",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:423:9:4ff4627f853d265e357a9f6be8f598b94dec67984377e5b7eec908a5baee7664:1",
				open: true,
				onOpenChange: (o) => {
					if (!o) setViewCard(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/DialogTitle/2",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:426:15:ce4668c7a35d30c69fb2833b02dad7f49ec3576d099eed2fb93be8b77f74bb1e:1",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdCard, { className: "h-4 w-4 text-primary" }), viewCard.cared_ones_information_card_name || Z("被照护者信息卡", "Cared one information card")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/DialogDescription/2",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:430:15:99e716b2f64efd8f33c3e46988ff60009c03e162da51a5b42dd76ce9aa5b265d:1",
							children: Z("可以发给帮忙照看的人，走失时也能给路人看。", "Send it to someone helping out, or show it to a finder if they go missing.")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/55dc48cb7d40",
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:435:15:d4f564549424659c1945374101627bface35095f70f12bd2ddc4496226d86bd4:1",
								variant: "outline",
								size: "sm",
								onClick: () => setShareCard(viewCard),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-3 w-3 mr-1" }),
									" ",
									Z("分享", "Share")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Button/898d577f45de",
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:438:15:2ea84255662ef372b86ad1f33dec8f3d02f7b03480449c66624d5aed587bf836:1",
								variant: "outline",
								size: "sm",
								onClick: () => {
									setViewCard(null);
									openEdit(viewCard);
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3 mr-1" }),
									" ",
									Z("编辑", "Edit")
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/8",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:443:13:fc217957b0936f971793d9339d74ac109a1acc1aa32b8677ef382a31b9e9270e:1",
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/div/9",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:444:15:2d9dac4cca637c337f0bc6073f85fbaee37d0c352bea3ee01645ece98649142d:1",
									className: "flex items-center gap-2 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Badge/2",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:445:17:6c0c991e62b012fcc1303982c02dd860230994909d6de12752929b77ea2f60c1:1",
										variant: statusVariant(viewCard.status),
										children: statusLabel(viewCard.status)
									}), viewCard.displays_location === "Yes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetLocationTag, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SheetLocationTag/0",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:447:19:babf0bbfd25e982fd825c110dc6776568eec05890d8d2661d10935953c37abd5:1",
										caredOneId,
										caredOneName: viewCard.cared_ones_name || caredOneName || Z("被护理者", "Cared one")
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/Badge/3",
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:449:19:c5e73d59f4fa75f08abced0a389447e2643ca8ddc04e8a84319deef4e4e75461:1",
										variant: "outline",
										className: "text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3 mr-1" }), Z("不显示位置", "Location hidden")]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/10",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:456:17:eff570afa275b7a8108c5cbae1beb85eb62b33d9c1c335927bc9d1ea8b6a7931:1",
									className: "text-xs text-muted-foreground",
									children: Z("卡片上显示的姓名", "Name shown on the card")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/11",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:457:17:084e63c4ad8e81a5e3135f75d51f42b3e851542f5ffc866171264b4a0ba182d8:1",
									className: "text-sm text-foreground",
									children: viewCard.cared_ones_name || ""
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/12",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:460:17:9c35640f20a32183e2dffb2085c795036685e5803aa8ca887c379300443cc596:1",
									className: "text-xs text-muted-foreground",
									children: Z("基本情况", "Background")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/13",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:461:17:146ebf3c4fbe3da7027783f17d0d21ffdd8da34a53a9ff0ac21191ecac6475ae:1",
									className: "text-sm text-foreground whitespace-pre-wrap",
									children: viewCard.cared_ones_description || ""
								})] }),
								viewCard.cared_ones_information_card_description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/14",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:465:19:5d2b01b627f57b2dec6eaa996b17110eb5d1541e7fbf1ea6916cc22aea584faa:1",
									className: "text-xs text-muted-foreground",
									children: Z("这次的具体安排", "What's needed this time")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/p/15",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:466:19:5ebdb09a82d56955470a818f269e98bbed80d2408cf915913c74f59c62744d08:1",
									className: "text-sm text-foreground whitespace-pre-wrap",
									children: viewCard.cared_ones_information_card_description
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetAIPanel, {
									"data-inspector-id": "components/cared-ones/InformationCardCard/InformationCardCard/SheetAIPanel/0",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:470:15:0f882279edafffa5241c838895110b1093c0c70e171a3eb6f85ad3ec5458bff4:1",
									context: {
										sheetName: viewCard.cared_ones_information_card_name,
										caredOneName: viewCard.cared_ones_name || caredOneName,
										description: viewCard.cared_ones_description,
										situationDetails: viewCard.cared_ones_information_card_description,
										contacts: emergencyContacts || [],
										knowledge
									}
								})
							]
						})
					]
				})
			})
		]
	});
}
function ShareCardDialog({ card, onClose }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const site = useSite();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const url = new URL(`/share/card/${card.id}`, window.location.origin);
	url.searchParams.set("__site", site.release.slug);
	url.searchParams.set("lng", isCN ? "zh" : "en");
	const cardUrl = url.toString();
	const title = card.cared_ones_information_card_name || Z("被护理者信息卡", "Cared one information card");
	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(cardUrl);
			toast({ title: Z("链接已复制", "Link copied") });
		} catch {
			toast({
				title: Z("复制失败", "Copy failed"),
				variant: "destructive"
			});
		}
	};
	const nativeShare = async () => {
		if (!navigator.share) {
			await copyLink();
			return;
		}
		try {
			await navigator.share({
				title,
				url: cardUrl
			});
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") return;
			toast({
				title: Z("分享失败，请复制链接重试", "Sharing failed. Please copy the link."),
				variant: "destructive"
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/Dialog/7849406041c9",
		"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:516:5:0355fb072a48163e447fb0a3986c135a754a6c53f228c101a7408c67c0fa1a01:1",
		open: true,
		onOpenChange: (o) => {
			if (!o) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/DialogTitle/0",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:519:11:2d0f7e53b87c8dc767cbe5cde45a724bbc339bc71a67bf169184938f60325856:1",
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4" }),
						" ",
						Z("分享信息卡", "Share information card")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/DialogDescription/0",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:520:11:60086dfe0b32efaacaea05373659e2020d0ddf4d3ac24b0e7327f6d8dda8456f:1",
					children: title
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/Input/0",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:525:13:5bcb99035696d4ccd4264761c43150e679fb8e80a0d2720b345dbc0cc1cd7b17:1",
									"aria-label": Z("卡片链接", "Card link"),
									readOnly: true,
									value: cardUrl,
									className: "text-xs min-w-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/Button/2576c5b7c19a",
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:526:13:0766be9a3e33b71fe84f31881b78e583bb8292f926bd6c15e8481d0fe3229f0d:1",
									size: "icon",
									variant: "outline",
									onClick: copyLink,
									"aria-label": Z("复制链接", "Copy link"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-2 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
								"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/QRCodeSVG/0",
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:529:13:69501657df147feb946886d7f29a3a832d36712150f177d6d2dba637e9f85cac:1",
								value: cardUrl,
								size: 140
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/p/0",
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:530:13:1d8e064cfb63b8baa0ce8ba9904b9dd7060a83dc4402689a25cd95a1d09c6539:1",
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "h-3 w-3" }),
									" ",
									Z("扫码查看", "Scan to view")
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/Button/e0ac8922dc7d",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:532:11:ecfec2d1e1c4bca938a16719585accabb86dcb5caee04529ba152a7f71eb1ce6:1",
							className: "w-full",
							onClick: nativeShare,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4 mr-2" }), Z("分享", "Share")]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "components/cared-ones/InformationCardCard/ShareCardDialog/Button/626565b7c266",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:534:23:284c731ab500cd2edccdd488daf31c108bc01707a463fbb8767ca534460d80da:1",
					variant: "ghost",
					onClick: onClose,
					children: Z("关闭", "Close")
				}) })
			]
		})
	});
}
function ContactSelectorDialog({ cardId, allContacts, onClose }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { data: linkedIds, isLoading } = useInformationCardContactIds(cardId);
	const setContacts = useSetInformationCardContacts();
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [initialized, setInitialized] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (isLoading || initialized) return;
		if (linkedIds && linkedIds.length > 0) setSelected(new Set(linkedIds.map(String)));
		else setSelected(new Set(allContacts.map((c) => String(c.id))));
		setInitialized(true);
	}, [
		isLoading,
		linkedIds,
		allContacts,
		initialized
	]);
	const toggle = (id) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const save = () => {
		setContacts.mutate({
			cardId,
			contactIds: [...selected]
		}, {
			onSuccess: () => {
				toast({ title: Z("联系人已更新", "Contacts updated") });
				onClose();
			},
			onError: (e) => toast({
				title: Z("更新失败", "Update failed"),
				description: e.message,
				variant: "destructive"
			})
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/Dialog/7849406041c9",
		"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:582:5:0355fb072a48163e447fb0a3986c135a754a6c53f228c101a7408c67c0fa1a01:1",
		open: true,
		onOpenChange: (o) => {
			if (!o) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/DialogTitle/0",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:585:11:a03ffff501c86505adf50736f93a9136bb2544e9bd90990528732194ee8f9737:1",
				children: Z("显示哪些紧急联系人", "Emergency contacts to show")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/DialogDescription/0",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:586:11:f2c4a3c4ef6f8e2a2dab1d6f03f6806ad6a46052162bffe04413192596c7f08e:1",
				children: Z("选择在这份须知上显示哪些联系人。默认全部选中。", "Choose which contacts appear on this sheet. All are selected by default.")
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/div/0",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:588:9:c3649d9f11581aa0a7b35fa5279c3be8d7c42963f8507071502757cb3a6970d4:1",
				className: "space-y-2 max-h-[50vh] overflow-y-auto py-2",
				children: allContacts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/p/0",
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:590:13:8a07251235ac04822398b7aabf933d64fd23d39d1a43c68514859ac1d08b223e:1",
					className: "text-sm text-muted-foreground text-center py-4",
					children: Z("尚无紧急联系人，请先在「紧急联系人」卡片中添加。", "No emergency contacts yet. Add some from the Emergency Contacts card first.")
				}) : allContacts.map((c) => {
					const id = String(c.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/label/0",
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:595:17:a4ffff68ba21c541558936d18d909bd83fea77ed3066dd6c520b28f69489445e:1",
						className: "flex items-center gap-3 rounded-md border p-2 cursor-pointer hover:bg-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/Checkbox/23808efdc7dd",
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:596:19:08ad12ae4382cb25aa6daeec25f95c150c9e0349c4f114b5379d2871b1da502c:1",
							checked: selected.has(id),
							onCheckedChange: () => toggle(id)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/div/1",
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:598:21:ce26c0822a643e6c44a60c3a8a51f8cbb451cef09b2b570e3348970eed70fe41:1",
								className: "text-sm font-medium truncate",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/div/2",
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:599:21:3a50ff0e14f36b80fea119488a9ab1173232aa309d1c7797567dbaefb4c23a0e:1",
								className: "text-xs text-muted-foreground truncate",
								children: [c.phone, c.relationship ? ` • ${c.relationship}` : ""]
							})]
						})]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/Button/626565b7c266",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:607:11:e637f2c4e699e9f44ca7e8c8faf9f5aab47882f338e01e46495d867bc79870f4:1",
				variant: "ghost",
				onClick: onClose,
				children: Z("取消", "Cancel")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				"data-inspector-id": "components/cared-ones/InformationCardCard/ContactSelectorDialog/Button/157dca92e425",
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:608:11:6db4a603ffb8da1e05f6bd6638915d7230257859c83ce34cda8f2da7d1284f25:1",
				onClick: save,
				disabled: setContacts.isPending,
				children: [setContacts.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }), Z("保存", "Save")]
			})] })
		] })
	});
}
//#endregion
export { InformationCardCard };
