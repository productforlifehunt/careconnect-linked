import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { Pn as Check, c as Users, ct as Phone, it as Plus, jt as LoaderCircle, n as X } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-jh6xKLyY.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { At as useEmergencyContacts, Q as useCreateEmergencyContact, ar as useUpdateEmergencyContact, yt as useDeleteEmergencyContact } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-BGuzjdk0.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-DdZS-7aZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmergencyCard-C5Ei80SE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RELATIONSHIP_VALUES = [
	"Spouse",
	"Parent",
	"Child",
	"Sibling",
	"Doctor",
	"Nurse",
	"Caregiver",
	"Neighbor",
	"Friend",
	"Other"
];
var REL_ZH = {
	Spouse: "配偶",
	Parent: "父母",
	Child: "子女",
	Sibling: "兄弟姐妹",
	Doctor: "医生",
	Nurse: "护士",
	Caregiver: "护理者",
	Neighbor: "邻居",
	Friend: "朋友",
	Other: "其他"
};
var EMPTY = {
	name: "",
	phone: "",
	relationship: "Other",
	content: "",
	address: "",
	note: ""
};
function EmergencyCard({ caredOneId }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const relLabel = (r) => isCN ? REL_ZH[r] || r : r;
	const { data: contacts, isLoading } = useEmergencyContacts(caredOneId);
	const create = useCreateEmergencyContact();
	const update = useUpdateEmergencyContact();
	const del = useDeleteEmergencyContact();
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(EMPTY);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [editForm, setEditForm] = (0, import_react.useState)(EMPTY);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const open = (contacts || []).find((c) => String(c.id) === String(openId));
	const startEdit = (c) => {
		setOpenId(null);
		setEditId(c.id);
		setEditForm({
			name: c.name || "",
			phone: c.phone || "",
			relationship: c.relationship || "Other",
			content: c.content || "",
			address: c.address || "",
			note: c.note || ""
		});
	};
	const cancelEdit = () => setEditId(null);
	const saveEdit = () => {
		if (!editId || !editForm.name || !editForm.phone) return;
		update.mutate({
			id: editId,
			...editForm
		}, {
			onSuccess: () => {
				setEditId(null);
				toast({ title: Z("联系人已更新", "Contact updated") });
			},
			onError: (e) => toast({
				title: Z("保存失败", "Couldn't save"),
				description: e.message,
				variant: "destructive"
			})
		});
	};
	const handleAdd = () => {
		if (!form.name || !form.phone) return;
		create.mutate({
			user_id: caredOneId,
			...form
		}, {
			onSuccess: () => {
				setForm(EMPTY);
				setAddOpen(false);
				toast({ title: Z("联系人已添加", "Contact added") });
			},
			onError: (e) => toast({
				title: Z("添加失败", "Couldn't add"),
				description: e.message,
				variant: "destructive"
			})
		});
	};
	const fields = (f, set) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:79:5:2b69ab864b367220d20e2579d6d6e037a90e8f50bc30ed5d9cfd4ac43c641459:1",
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:80:7:e3cb4af1b0c3d283422c3b18adf86f811a9b80703ebe2d7d25f3127073548ac1:1",
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:81:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
						Z("姓名", "Name"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:82:36:3511bea2c02d2e65955a674933106e8b3ccfc60e1556e491258b90f66ca496af:1",
							className: "text-destructive",
							children: "*"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1",
						value: f.name,
						onChange: (e) => set({ name: e.target.value }),
						placeholder: Z("联系人姓名", "Contact name")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:85:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
						Z("电话", "Phone"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:86:37:ce96346e64259c425d59f05d24c8bcb2aeba8e628164c0eb4dfbf8b2e4c00fce:1",
							className: "text-destructive",
							children: "*"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1",
						type: "tel",
						value: f.phone,
						onChange: (e) => set({ phone: e.target.value }),
						placeholder: "+86 138 0000 0000"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:90:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("关系", "Relationship") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: f.relationship,
					onValueChange: (v) => set({ relationship: v }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "mt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: RELATIONSHIP_VALUES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: r,
						children: relLabel(r)
					}, r)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:97:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("详细信息", "Detail") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1",
					value: f.content,
					onChange: (e) => set({ content: e.target.value }),
					placeholder: Z("微信、邮箱、备用号码或其他说明", "WeChat, email, second number, or other details")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:101:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("地址", "Address") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1",
					value: f.address,
					onChange: (e) => set({ address: e.target.value }),
					placeholder: Z("住址或工作地点", "Home or work address")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:105:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("备注", "Note") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "mt-1",
					rows: 2,
					value: f.note,
					onChange: (e) => set({ note: e.target.value }),
					placeholder: Z("什么时候找这位联系人最合适……", "When it's best to reach this person…")
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:113:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:114:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:115:9:65121c4ba07e82d05f8b0812b25970fdfda44873cbdca30b173d6dc24454c7a6:1",
					className: "text-lg font-bold text-foreground",
					children: Z("紧急联系人", "Emergency Contacts")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setAddOpen(true),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
						" ",
						Z("添加", "Add")
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("添加紧急联系人", "Add Emergency Contact") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("为紧急情况添加一位重要联系人", "Add an important contact for emergencies") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:125:11:1a8cad0af56d0213ea0b08a5c2db635e4633efd24350baf4aea81f992888456b:1",
					className: "mt-2 space-y-4",
					children: [fields(form, (u) => setForm((p) => ({
						...p,
						...u
					}))), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "coral",
						className: "w-full",
						onClick: handleAdd,
						disabled: create.isPending || !form.name || !form.phone,
						children: [
							create.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }),
							" ",
							Z("添加联系人", "Add Contact")
						]
					})]
				})] })
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" }) : (contacts || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:137:9:46119a07a0831a6dbbe6f75edb4540edbf84f4bf35c3a0cf51a944e0aa862c41:1",
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:139:11:67b2bbb19ca265f218c3d7e75dc6ff5f03a1883a19dafe463f22dd4512af4f6f:1",
						className: "text-muted-foreground mb-3",
						children: Z("暂无紧急联系人", "No emergency contacts yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "coral",
						size: "sm",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
							" ",
							Z("添加第一位联系人", "Add First Contact")
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:143:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (contacts || []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: editId === c.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:148:19:975fcfade5b808495ca81a18cf144b76aa234f03b157b3749a8ad47825c035e3:1",
							className: "space-y-3",
							children: [fields(editForm, (u) => setEditForm((p) => ({
								...p,
								...u
							}))), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:150:21:d654e7fb763fab829be3ac025e8dbe710285a46495b0b3cef817f1037abfcb51:1",
								className: "flex gap-2 justify-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: cancelEdit,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 mr-1" }),
										" ",
										Z("取消", "Cancel")
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "coral",
									size: "sm",
									onClick: saveEdit,
									disabled: update.isPending,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 mr-1" }),
										" ",
										Z("保存", "Save")
									]
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:156:19:8965a0e4db84f123fe50f2942d33133d5ff8fc9d9db191d12fb9b19131ecb4e1:1",
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:156:59:8965a0e4db84f123fe50f2942d33133d5ff8fc9d9db191d12fb9b19131ecb4e1:1",
								type: "button",
								className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
								onClick: () => setOpenId(String(c.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:157:21:16c60377f1a55d3776405362999179f692149984f59bb23dbca2ffd2d854ba06:1",
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:158:23:8ca5d3c4b3551a6ac0471166938c66696119c05fc5579303dab058c2ed077e14:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:159:25:60439b6ba28b01f2fc391a10a6f3fb0aa49db71556d2c9be444fde39d9234ce2:1",
											className: "font-medium text-foreground text-sm",
											children: c.name
										}), c.relationship && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-[10px]",
											children: relLabel(c.relationship)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:162:23:712c6afcd667b5e3272c2cd3133362a3c756fb1399b70adf6b665930e2d2c77d:1",
										className: "block text-xs text-muted-foreground mt-0.5",
										children: c.phone
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
								onEdit: () => startEdit(c),
								onDelete: () => del.mutateAsync(c.id)
							})]
						})
					})
				}, c.id))
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				open: !!openId,
				onOpenChange: (v) => !v && setOpenId(null),
				title: open.name,
				rows: [
					{
						label: Z("关系", "Relationship"),
						value: open.relationship ? relLabel(open.relationship) : void 0
					},
					{
						label: Z("电话", "Phone"),
						value: open.phone
					},
					{
						label: Z("详细信息", "Detail"),
						value: open.content
					},
					{
						label: Z("地址", "Address"),
						value: open.address
					},
					{
						label: Z("备注", "Note"),
						value: open.note
					}
				],
				actions: open.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:186:15:6c7aef26af6fe45b3d180f645f52923c698e11fea879db6f44a75219f5b9ab82:1",
						href: `tel:${open.phone}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5 mr-1" }),
							" ",
							Z("拨打", "Call")
						]
					})
				}) : void 0,
				onEdit: () => startEdit(open),
				onDelete: () => del.mutate(open.id, {
					onSuccess: () => {
						setOpenId(null);
						toast({ title: Z("联系人已删除", "Contact deleted") });
					},
					onError: (e) => toast({
						title: Z("没能删除", "Couldn't delete"),
						description: e?.message,
						variant: "destructive"
					})
				}),
				isDeleting: del.isPending
			})
		]
	});
}
//#endregion
export { EmergencyCard };
