import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { Dt as MapPin, Ft as Link2, Gt as IdCard, R as ShieldOff, V as Share2, c as Users, hn as Copy, in as Eye, it as Plus, jt as LoaderCircle, rt as QrCode, ut as Pencil, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-jh6xKLyY.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { At as useEmergencyContacts, Fn as useSetInformationCardContacts, Jt as useInformationCards, St as useDeleteInformationCard, cr as useUpdateInformationCard, d as parseCardDate, p as toDatetimeLocal, qt as useInformationCardContactIds, tt as useCreateInformationCard } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { n as SheetLocationTag, r as useInfoSheetKnowledge, t as SheetAIPanel } from "./info-sheet-parts-CWHpZxKR.mjs";
import { t as QRCodeSVG } from "../_libs/qrcode.react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/InformationCardCard-DWjZOYfx.js
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
		"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:176:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:177:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:178:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:179:11:061d90cd2be26b87ed6c31302c4c0ab6b10462d969cf18e1e19cf4ff796eebb4:1",
						className: "text-lg font-bold text-foreground",
						children: Z("被照护者信息卡", "Cared One Information Cards")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:180:11:97fef22395058332b665a3121af148b4fdaab7000acc4b6f3127ff41b9018c7b:1",
						className: "text-xs text-muted-foreground",
						children: Z("可分享给帮忙照看的人，或在走失时给外人看", "Share with someone helping out, or with finders if they go missing")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:188:9:892c9a97a2ac53582dd66d020ffc03410ee0bdb161792abca53f831112bf15f6:1",
				className: "text-center py-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:190:11:68389336633f6f9351a2de87706a6e01dc85f454613348aa907bbc5408cbd32a:1",
					className: "text-muted-foreground",
					children: Z("暂时无法加载信息卡，请稍后再试。", "Information cards could not be loaded. Please try again.")
				})]
			}) : (cards || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:193:9:46119a07a0831a6dbbe6f75edb4540edbf84f4bf35c3a0cf51a944e0aa862c41:1",
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdCard, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:195:11:5e92ab8f3c5ab9d081095ebf717e67dbec42eebadd7f433e94b88c9c51d23d5d:1",
						className: "text-muted-foreground mb-3",
						children: Z("还没有信息卡", "No information cards yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:200:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (cards || []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:204:17:33c7234239d86b27816105c14ba67bd8cdb6479e8617417141face5a52d265d4:1",
							className: "flex justify-between items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:205:19:e05fff7c5dc392cd75f7aba8f0c69bba5b73a321c8356daf9dd2bc7d4f9193af:1",
								type: "button",
								className: "min-w-0 flex-1 text-left group",
								onClick: () => setViewCard(c),
								"aria-label": Z("查看信息卡", "View information card"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:211:21:ef1ddffb4c5df7d044deed3b3ead476a5c17acd1d1f7bc1cab893436e44f4a56:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:212:23:97ac5fd02968e563e50ad27fbf979932ddfbaab6940f4b98c41c5cd74a54188e:1",
												className: "font-medium text-foreground text-sm truncate group-hover:underline",
												children: c.cared_ones_information_card_name || Z("（未命名）", "(Untitled)")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: statusVariant(c.status),
												className: "text-[10px]",
												children: statusLabel(c.status)
											}),
											c.displays_location === "Yes" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												className: "text-[10px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-2.5 w-2.5 mr-1" }), Z("位置", "Location")]
											})
										]
									}),
									c.cared_ones_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:218:43:aa7f57c6d3348bd6845c1f32291e5eeca77760d07399fd1fd27ce9f1d1beed48:1",
										className: "text-xs text-muted-foreground mt-1",
										children: [Z("对象：", "For: "), c.cared_ones_name]
									}),
									c.cared_ones_description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:220:23:86aba4e570f5321a6362f877145aec5cf3bafb0410027b0895e0987d9204a530:1",
										className: "text-xs text-muted-foreground mt-1 line-clamp-2",
										children: c.cared_ones_description
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:223:19:1dbdd1c70aed91702deaed3c279f8d98ae0c474d690ae13401e323bc4d20dc85:1",
								className: "flex gap-1 shrink-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7",
										onClick: () => setViewCard(c),
										title: Z("查看", "View"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7",
										onClick: () => setContactsCardId(String(c.id)),
										title: Z("选择这份须知上显示的紧急联系人", "Choose emergency contacts shown on this sheet"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7",
										onClick: () => openEdit(c),
										title: Z("编辑", "Edit"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
				open: !!deleteCard,
				onOpenChange: (o) => !o && setDeleteCard(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("删除这张信息卡？", "Delete this information card?") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("删除后无法恢复，已分享的链接也会失效。", "This cannot be undone, and any shared link will stop working.") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:246:11:c9530e345a77089abceed9d8011573ce9926831e51629c9f29312541e4d90b63:1",
					className: "flex gap-2 justify-end mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setDeleteCard(null),
						children: Z("取消", "Cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
				open: formOpen,
				onOpenChange: setFormOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editId ? Z("编辑信息卡", "Edit information card") : Z("新建信息卡", "New information card") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("写一张可以直接发给别人的信息卡：要注意什么、这次需要帮什么。", "Write something you can hand to another person: what to watch out for and what help is needed this time.") })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:271:11:2995dfc8cb02ff86e5b949e1f6885e03932586a0dbe7a96a660c24336b94b5e2:1",
							className: "space-y-3 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:272:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
										Z("这份须知的用途", "What this sheet is for"),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:273:63:d8898c33c4280b0974922499415596209f0178ba6e7492d5c827e20fae3d2001:1",
											className: "text-destructive",
											children: "*"
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-1",
										value: form.cared_ones_information_card_name,
										onChange: (e) => setForm((p) => ({
											...p,
											cared_ones_information_card_name: e.target.value
										})),
										placeholder: Z("例如：帮忙照看两小时、走失时给路人看、就诊陪同", "e.g. Cover two hours, Show to a finder, Hospital visit")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:278:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("须知上显示的被照护者姓名", "Name shown on the sheet") }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-1",
											value: form.cared_ones_name,
											onChange: (e) => setForm((p) => ({
												...p,
												cared_ones_name: e.target.value
											})),
											placeholder: caredOneName || Z("可填化名，不必是真名", "Can be a nickname, not necessarily the real name")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:283:15:3fea278966836770959f09fd1e4cfc91d7687421cc152c10e03eeac6c2c3682c:1",
											className: "text-[11px] text-muted-foreground mt-1",
											children: Z("默认使用被照护者的用户名，可改成化名以保护隐私。", "Defaults to the cared one's name; you can change it to a nickname for privacy.")
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:286:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("基本情况", "Background") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										className: "mt-1",
										rows: 3,
										value: form.cared_ones_description,
										onChange: (e) => setForm((p) => ({
											...p,
											cared_ones_description: e.target.value
										})),
										placeholder: Z("基本情况：身体状况、习惯、忌讳、怎么沟通……", "Background: condition, habits, what to avoid, how to communicate…")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:292:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("这次的具体安排", "What's needed this time") }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
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
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:297:15:68d7c33e8e5aabc5eb7208292db55e31acccaea073399d59a6ddaa9935f4140b:1",
											className: "text-[11px] text-muted-foreground mt-1",
											children: Z("只写这一次的安排，长期的护理计划请写在「护理计划」里。", "Only this occasion. Long-term plans belong in the Care Plan.")
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:299:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:300:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("状态", "Status") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.status,
											onValueChange: (v) => setForm((p) => ({
												...p,
												status: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "mt-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Draft",
													children: Z("草稿", "Draft")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Active",
													children: Z("启用", "Active")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Paused",
													children: Z("已暂停", "Paused")
												})
											] })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:311:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("显示位置", "Displays location") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.displays_location,
											onValueChange: (v) => setForm((p) => ({
												...p,
												displays_location: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "mt-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "No",
												children: Z("否", "No")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Yes",
												children: Z("是", "Yes")
											})] })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:323:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("谁可以看", "Who can view") }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: formVisibility,
											onValueChange: setFormVisibility,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "mt-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Visible to public",
													children: Z("所有人可见", "Visible to everyone")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Visible to the care group of the cared one",
													children: Z("仅此被照护者所在护理群组的成员（app 内，需登录）", "Only members of this cared one's care group (in this app, sign-in needed)")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Visible to caregivers of the cared one",
													children: Z("仅此被照护者的护理者（app 内，需登录）", "Only this cared one's caregivers (in this app, sign-in needed)")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Visible to the care group of the cared one and the caregivers of the cared one",
													children: Z("此被照护者的护理群组成员和护理者（app 内，需登录）", "This cared one's care group members and caregivers (in this app, sign-in needed)")
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:334:15:a68e5b55cb468373d15201689ff601bc12cd0bd922213f314efb71cc9021af85:1",
											className: "text-xs text-muted-foreground mt-1",
											children: Z("您自己永远可以看到这张卡。", "You can always see this card yourself.")
										})
									]
								}),
								formVisibility === "Visible to public" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:338:15:3bf29eacb5371bd1fe5e7f7cb8cf173543816c930766a0c6c463db5553ca6543:1",
									className: "space-y-3 rounded-md border p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:339:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "share-start",
												children: Z("公开开始时间", "Public sharing starts")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "share-start",
												type: "datetime-local",
												className: "mt-1",
												value: shareStart,
												onChange: (e) => setShareStart(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:343:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("到时间自动停止公开吗？", "Stop public sharing automatically?") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: shareExpires,
												onValueChange: (v) => setShareExpires(v),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "mt-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "No",
													children: Z("不，一直公开", "No, keep it public")
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Yes",
													children: Z("是，到时间自动停止", "Yes, stop at a set time")
												})] })]
											})]
										}),
										shareExpires === "Yes" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:355:21:d4eddf4b7adb001c689dc9e90c6fadedb39e22d0f66b388acf7e237daf5322c4:1",
												className: "text-xs text-muted-foreground",
												children: Z("建议在事情办完的时候停止公开。停止后，即使别人手里有链接也看不到了，可以保护被护理者的个人信息。", "We suggest stopping when the task is done. After that, people with the link can no longer see it, which protects the cared one's personal information.")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:356:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "share-end",
													children: Z("公开结束时间", "Public sharing ends")
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "share-end",
													type: "datetime-local",
													className: "mt-1",
													value: shareEnd,
													min: shareStart,
													onChange: (e) => setShareEnd(e.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:360:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("结束后谁还能看", "Who can view after it ends") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: afterExpiry,
													onValueChange: setAfterExpiry,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "mt-1",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Visible to the care group of the cared one",
															children: Z("仅护理群组成员", "Only care group members")
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Visible to caregivers of the cared one",
															children: Z("仅护理者", "Only caregivers")
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Visible to the care group of the cared one and the caregivers of the cared one",
															children: Z("护理群组成员和护理者", "Care group members and caregivers")
														})
													] })]
												})]
											})
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:376:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("显示哪些紧急联系人", "Emergency contacts to show") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:378:15:c9b67f904ce66c6d193648238063a91b528565ce8315851c9e874a0ffea8b7fd:1",
										className: "mt-1 space-y-2 max-h-48 overflow-y-auto",
										children: !formContactsReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground mx-auto my-3" }) : (emergencyContacts || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:382:19:18ca5a86b1081d427d82b966037c6a4b5a2d88017277245d3a5d96f0a0190acf:1",
											className: "text-xs text-muted-foreground py-2",
											children: Z("尚无紧急联系人，请先在「紧急联系人」卡片中添加。", "No emergency contacts yet. Add some from the Emergency Contacts card first.")
										}) : (emergencyContacts || []).map((c) => {
											const id = String(c.id);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:387:23:cd03a5cbbf5324a2260692e1e1871e0322a5a603af377ef8d617088457967f61:1",
												className: "flex items-center gap-3 rounded-md border p-2 cursor-pointer hover:bg-accent",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
													checked: formContacts.has(id),
													onCheckedChange: () => toggleFormContact(id)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:389:25:c5ef961e7c671996083509685695e28adf3bf953f4f06f8bf48866d694a6d3b4:1",
													className: "flex-1 min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:390:27:5ba52dc78be9991fbeec5032192570322c665415b24fdb38dae215918a8619eb:1",
														className: "text-sm font-medium truncate",
														children: c.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:391:27:460ce4c2870ab869b3e1725739974ba40570b9c61eaae7084f761b2a99256c71:1",
														className: "text-xs text-muted-foreground truncate",
														children: [c.phone, c.relationship ? ` • ${c.relationship}` : ""]
													})]
												})]
											}, id);
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setFormOpen(false),
							children: Z("取消", "Cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleSubmit,
							disabled: saving || !formContactsReady,
							children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }), editId ? Z("保存修改", "Save changes") : Z("创建", "Create sheet")]
						})] })
					]
				})
			}),
			contactsCardId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactSelectorDialog, {
				cardId: contactsCardId,
				allContacts: emergencyContacts || [],
				onClose: () => setContactsCardId(null)
			}),
			shareCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareCardDialog, {
				card: shareCard,
				onClose: () => setShareCard(null)
			}),
			viewCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: true,
				onOpenChange: (o) => {
					if (!o) setViewCard(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdCard, { className: "h-4 w-4 text-primary" }), viewCard.cared_ones_information_card_name || Z("被照护者信息卡", "Cared one information card")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("可以发给帮忙照看的人，走失时也能给路人看。", "Send it to someone helping out, or show it to a finder if they go missing.") })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:434:13:b264473553b1958ee021c70e050479b2e989c4dfb7fb0314c4d37a6ed996f4b3:1",
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setShareCard(viewCard),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-3 w-3 mr-1" }),
									" ",
									Z("分享", "Share")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:443:13:fc217957b0936f971793d9339d74ac109a1acc1aa32b8677ef382a31b9e9270e:1",
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:444:15:2d9dac4cca637c337f0bc6073f85fbaee37d0c352bea3ee01645ece98649142d:1",
									className: "flex items-center gap-2 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: statusVariant(viewCard.status),
										children: statusLabel(viewCard.status)
									}), viewCard.displays_location === "Yes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetLocationTag, {
										caredOneId,
										caredOneName: viewCard.cared_ones_name || caredOneName || Z("被护理者", "Cared one")
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3 mr-1" }), Z("不显示位置", "Location hidden")]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:455:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:456:17:eff570afa275b7a8108c5cbae1beb85eb62b33d9c1c335927bc9d1ea8b6a7931:1",
										className: "text-xs text-muted-foreground",
										children: Z("卡片上显示的姓名", "Name shown on the card")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:457:17:084e63c4ad8e81a5e3135f75d51f42b3e851542f5ffc866171264b4a0ba182d8:1",
										className: "text-sm text-foreground",
										children: viewCard.cared_ones_name || ""
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:459:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:460:17:9c35640f20a32183e2dffb2085c795036685e5803aa8ca887c379300443cc596:1",
										className: "text-xs text-muted-foreground",
										children: Z("基本情况", "Background")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:461:17:146ebf3c4fbe3da7027783f17d0d21ffdd8da34a53a9ff0ac21191ecac6475ae:1",
										className: "text-sm text-foreground whitespace-pre-wrap",
										children: viewCard.cared_ones_description || ""
									})]
								}),
								viewCard.cared_ones_information_card_description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:464:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:465:19:5d2b01b627f57b2dec6eaa996b17110eb5d1541e7fbf1ea6916cc22aea584faa:1",
										className: "text-xs text-muted-foreground",
										children: Z("这次的具体安排", "What's needed this time")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:466:19:5ebdb09a82d56955470a818f269e98bbed80d2408cf915913c74f59c62744d08:1",
										className: "text-sm text-foreground whitespace-pre-wrap",
										children: viewCard.cared_ones_information_card_description
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetAIPanel, { context: {
									sheetName: viewCard.cared_ones_information_card_name,
									caredOneName: viewCard.cared_ones_name || caredOneName,
									description: viewCard.cared_ones_description,
									situationDetails: viewCard.cared_ones_information_card_description,
									contacts: emergencyContacts || [],
									knowledge
								} })
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
		open: true,
		onOpenChange: (o) => {
			if (!o) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4" }),
						" ",
						Z("分享信息卡", "Share information card")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: title })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:522:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:523:11:3f9900155b9635e4cbcd3bd763bae7c2b90165b4f1b83fed4d27f4715acbdd41:1",
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": Z("卡片链接", "Card link"),
									readOnly: true,
									value: cardUrl,
									className: "text-xs min-w-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "outline",
									onClick: copyLink,
									"aria-label": Z("复制链接", "Copy link"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:528:11:f0a1f4d66c0f9d903669fa48ba6b6cbbc76e4b04469c92899d3ed89bea84404a:1",
							className: "flex flex-col items-center gap-2 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
								value: cardUrl,
								size: 140
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
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
							className: "w-full",
							onClick: nativeShare,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4 mr-2" }), Z("分享", "Share")]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
		open: true,
		onOpenChange: (o) => {
			if (!o) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("显示哪些紧急联系人", "Emergency contacts to show") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("选择在这份须知上显示哪些联系人。默认全部选中。", "Choose which contacts appear on this sheet. All are selected by default.") })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:588:9:c3649d9f11581aa0a7b35fa5279c3be8d7c42963f8507071502757cb3a6970d4:1",
				className: "space-y-2 max-h-[50vh] overflow-y-auto py-2",
				children: allContacts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:590:13:8a07251235ac04822398b7aabf933d64fd23d39d1a43c68514859ac1d08b223e:1",
					className: "text-sm text-muted-foreground text-center py-4",
					children: Z("尚无紧急联系人，请先在「紧急联系人」卡片中添加。", "No emergency contacts yet. Add some from the Emergency Contacts card first.")
				}) : allContacts.map((c) => {
					const id = String(c.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:595:17:a4ffff68ba21c541558936d18d909bd83fea77ed3066dd6c520b28f69489445e:1",
						className: "flex items-center gap-3 rounded-md border p-2 cursor-pointer hover:bg-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: selected.has(id),
							onCheckedChange: () => toggle(id)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:597:19:6c7e01a82bed7b5be9659555d26252fa1b29a459f38ae1c7991bc5c13fe68b12:1",
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:598:21:ce26c0822a643e6c44a60c3a8a51f8cbb451cef09b2b570e3348970eed70fe41:1",
								className: "text-sm font-medium truncate",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/InformationCardCard.tsx:599:21:3a50ff0e14f36b80fea119488a9ab1173232aa309d1c7797567dbaefb4c23a0e:1",
								className: "text-xs text-muted-foreground truncate",
								children: [c.phone, c.relationship ? ` • ${c.relationship}` : ""]
							})]
						})]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: onClose,
				children: Z("取消", "Cancel")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: save,
				disabled: setContacts.isPending,
				children: [setContacts.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }), Z("保存", "Save")]
			})] })
		] })
	});
}
//#endregion
export { InformationCardCard };
