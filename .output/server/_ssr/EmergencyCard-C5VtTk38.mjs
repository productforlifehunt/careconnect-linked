import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { Pn as Check, c as Users, ct as Phone, it as Plus, jt as LoaderCircle, n as X } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C88F3k7U.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-SAioInf-.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { At as useEmergencyContacts, Q as useCreateEmergencyContact, ar as useUpdateEmergencyContact, yt as useDeleteEmergencyContact } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-BNn5o7zD.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-K5s-49X1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmergencyCard-C5VtTk38.js
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
		"data-inspector-id": "components/cared-ones/EmergencyCard/fields/div/0",
		"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:79:5:2b69ab864b367220d20e2579d6d6e037a90e8f50bc30ed5d9cfd4ac43c641459:1",
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/div/1",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:80:7:e3cb4af1b0c3d283422c3b18adf86f811a9b80703ebe2d7d25f3127073548ac1:1",
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/div/2",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:81:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/bbeebd879e1d/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:82:11:3511bea2c02d2e65955a674933106e8b3ccfc60e1556e491258b90f66ca496af:1",
						children: [
							Z("姓名", "Name"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "components/cared-ones/EmergencyCard/fields/span/0",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:82:36:3511bea2c02d2e65955a674933106e8b3ccfc60e1556e491258b90f66ca496af:1",
								className: "text-destructive",
								children: "*"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Input/7105f3783828/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:83:11:b1e930d8e87526a9be14524b6c1eba334b8212a067c3ac16d388e69e18346114:1",
						className: "mt-1",
						value: f.name,
						onChange: (e) => set({ name: e.target.value }),
						placeholder: Z("联系人姓名", "Contact name")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/div/3",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:85:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/bbeebd879e1d/1",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:86:11:ce96346e64259c425d59f05d24c8bcb2aeba8e628164c0eb4dfbf8b2e4c00fce:1",
						children: [
							Z("电话", "Phone"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "components/cared-ones/EmergencyCard/fields/span/1",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:86:37:ce96346e64259c425d59f05d24c8bcb2aeba8e628164c0eb4dfbf8b2e4c00fce:1",
								className: "text-destructive",
								children: "*"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Input/e43ded7cebdf/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:87:11:416072f90118f40115e83810927e0aec05f3840e36678ca221d6eddd98cfc4b9:1",
						className: "mt-1",
						type: "tel",
						value: f.phone,
						onChange: (e) => set({ phone: e.target.value }),
						placeholder: "+86 138 0000 0000"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/div/4",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:90:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/bbeebd879e1d/2",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:91:9:ac4c4f5c9523aff24f0eada26610001a3545c2fdc8626a0febd3dc860e336eb3:1",
					children: Z("关系", "Relationship")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Select/189b10c57b62/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:92:9:1cc23578661e101940164b9e99dc08a4dd5ffb83b9fc3f9a31e630eb0275bc50:1",
					value: f.relationship,
					onValueChange: (v) => set({ relationship: v }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/fields/SelectTrigger/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:93:11:e0e52aa4fc6416dcfa07a80da534d7d4699d3fc0db95c6f7f50b718a8962ccfa:1",
						className: "mt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
							"data-inspector-id": "components/cared-ones/EmergencyCard/fields/SelectValue/0",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:93:43:e0e52aa4fc6416dcfa07a80da534d7d4699d3fc0db95c6f7f50b718a8962ccfa:1"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/fields/SelectContent/c66f0b3c54e5/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:94:11:79ac92afd1a512e8c5935b1e4a000a9a4edd2221b9024d043b3e4385fbd33e04:1",
						children: RELATIONSHIP_VALUES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							"data-inspector-id": "components/cared-ones/EmergencyCard/fields/SelectItem/e07502761e38/0",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:94:58:79ac92afd1a512e8c5935b1e4a000a9a4edd2221b9024d043b3e4385fbd33e04:1",
							value: r,
							children: relLabel(r)
						}, r))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/div/5",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:97:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/bbeebd879e1d/3",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:98:9:3be5faf64e2b89968c5031cdbc6ede06339cdaccb51876d7be9e38a2dbadbf90:1",
					children: Z("详细信息", "Detail")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Input/21cce83bec13/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:99:9:396a518bcccf3d533e47f8806384dddecadbadf1dddf7f44e9baeb16ef35ef0b:1",
					className: "mt-1",
					value: f.content,
					onChange: (e) => set({ content: e.target.value }),
					placeholder: Z("微信、邮箱、备用号码或其他说明", "WeChat, email, second number, or other details")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/div/6",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:101:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/bbeebd879e1d/4",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:102:9:cdc9f27321a73af9250c11931274009d7eb5eb66d746a883fa22bab59f0b720e:1",
					children: Z("地址", "Address")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Input/f5d06d681a66/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:103:9:ec6222c6ceb1efee0263b8c56a37f3e80e5ab15fc85d7993a497115170460561:1",
					className: "mt-1",
					value: f.address,
					onChange: (e) => set({ address: e.target.value }),
					placeholder: Z("住址或工作地点", "Home or work address")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/div/7",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:105:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/bbeebd879e1d/5",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:106:9:2b70970a7c220a6e0e3ddd36ffeb5306a7efe569cbacc81da1cad392cac08ec8:1",
					children: Z("备注", "Note")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Textarea/367671d09dc7/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:107:9:d107583ae588901917df71b2e787d829817ec2f7073b2a96355a869bdbbdf0fa:1",
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
		"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/3f6bee3305fa/0",
		"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:113:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/0",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:114:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/h2/bbeebd879e1d/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:115:9:65121c4ba07e82d05f8b0812b25970fdfda44873cbdca30b173d6dc24454c7a6:1",
					className: "text-lg font-bold text-foreground",
					children: Z("紧急联系人", "Emergency Contacts")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/e0f310957d36/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:116:9:0cc17c211e83f06cde4e8236ac9c5e5f9e315993ee5d924d96f00ee0b99351be:1",
					size: "sm",
					onClick: () => setAddOpen(true),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Plus/0",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:116:60:0cc17c211e83f06cde4e8236ac9c5e5f9e315993ee5d924d96f00ee0b99351be:1",
							className: "h-4 w-4 mr-1"
						}),
						" ",
						Z("添加", "Add")
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Dialog/98512c5a1f68/0",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:119:7:0948f33fe93c407a8c4efe07c67f4b5b473c27ae9abaf58d027354e93eacabeb:1",
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/DialogContent/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:120:9:a1db9351f2bc97608c8aaec7c954792a0a22e6a3d66d076f63a06f6c1dd1b96a:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/DialogHeader/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:121:11:f3baf1571d8ce48392ac850c82c313f167b22021224d9cc9f1db77c5581f7169:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/DialogTitle/bbeebd879e1d/0",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:122:13:0e6d652c5828a529738c4280d671419c60fa75a92ae76977c18bbaf7f262b541:1",
							children: Z("添加紧急联系人", "Add Emergency Contact")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/DialogDescription/bbeebd879e1d/0",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:123:13:710ec83bd526934557268a313a082bb2fd5165e1ad0cab0ccad964eb4aa92574:1",
							children: Z("为紧急情况添加一位重要联系人", "Add an important contact for emergencies")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/b51a3d102614/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:125:11:1a8cad0af56d0213ea0b08a5c2db635e4633efd24350baf4aea81f992888456b:1",
						className: "mt-2 space-y-4",
						children: [fields(form, (u) => setForm((p) => ({
							...p,
							...u
						}))), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/8e0e64015c2b/0",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:127:13:8a7c2a7696251ab8e59a414b4430320e3710bae1202afa7d881c7501b3dd0448:1",
							variant: "coral",
							className: "w-full",
							onClick: handleAdd,
							disabled: create.isPending || !form.name || !form.phone,
							children: [
								create.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Loader2/0",
									"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:128:35:097ff98f915d2b61556486f694a232456d13889c96182c124de33fea620027c4:1",
									className: "h-4 w-4 animate-spin mr-2"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
									"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Plus/1",
									"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:128:87:097ff98f915d2b61556486f694a232456d13889c96182c124de33fea620027c4:1",
									className: "h-4 w-4 mr-2"
								}),
								" ",
								Z("添加联系人", "Add Contact")
							]
						})]
					})]
				})
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Loader2/1",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:135:9:3c324e02de3ae8d7471508da6dc430b5030dbe7929c67152035d56bf77ee3b70:1",
				className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8"
			}) : (contacts || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/1",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:137:9:46119a07a0831a6dbbe6f75edb4540edbf84f4bf35c3a0cf51a944e0aa862c41:1",
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Users/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:138:11:79be503bab0b39ccb83e68ae24aab62f1da4cbb8d2e72d12b2a17c3b89313bd4:1",
						className: "h-10 w-10 text-muted-foreground mx-auto mb-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/p/bbeebd879e1d/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:139:11:67b2bbb19ca265f218c3d7e75dc6ff5f03a1883a19dafe463f22dd4512af4f6f:1",
						className: "text-muted-foreground mb-3",
						children: Z("暂无紧急联系人", "No emergency contacts yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/e0f310957d36/1",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:140:11:04ef7aa074b8b8a65eb345a246dfc5fead6303647911f04f2809c659aeeaced5:1",
						variant: "coral",
						size: "sm",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Plus/2",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:140:78:04ef7aa074b8b8a65eb345a246dfc5fead6303647911f04f2809c659aeeaced5:1",
								className: "h-4 w-4 mr-1"
							}),
							" ",
							Z("添加第一位联系人", "Add First Contact")
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/d78d3455c99c/0",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:143:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (contacts || []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Card/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:145:13:56bac33e74e80ec2ae9539bc9d5fe5a33321158deec172f462f599f05a7dff03:1",
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/CardContent/cebd2434f33c/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:146:15:28db4c9a96e8d75b48cbafc894d97da998a5485519267eabecbea2eb58e81599:1",
						className: "p-4",
						children: editId === c.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/5c06160356fa/0",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:148:19:975fcfade5b808495ca81a18cf144b76aa234f03b157b3749a8ad47825c035e3:1",
							className: "space-y-3",
							children: [fields(editForm, (u) => setEditForm((p) => ({
								...p,
								...u
							}))), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/2",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:150:21:d654e7fb763fab829be3ac025e8dbe710285a46495b0b3cef817f1037abfcb51:1",
								className: "flex gap-2 justify-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/0dce898fb139/0",
									"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:151:23:11830e72714551f45bdf25deab185d0b2c743b5a54e66f2a6c3fd0875e29379f:1",
									variant: "ghost",
									size: "sm",
									onClick: cancelEdit,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
											"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/X/0",
											"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:151:78:11830e72714551f45bdf25deab185d0b2c743b5a54e66f2a6c3fd0875e29379f:1",
											className: "h-3.5 w-3.5 mr-1"
										}),
										" ",
										Z("取消", "Cancel")
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/f0de9cd02282/0",
									"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:152:23:aa3c740f38236ac98f26a0811e0e8d7717d361be979f79a993a531a7ac0c9b9e:1",
									variant: "coral",
									size: "sm",
									onClick: saveEdit,
									disabled: update.isPending,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Check/0",
											"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:152:104:aa3c740f38236ac98f26a0811e0e8d7717d361be979f79a993a531a7ac0c9b9e:1",
											className: "h-3.5 w-3.5 mr-1"
										}),
										" ",
										Z("保存", "Save")
									]
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/3",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:156:19:8965a0e4db84f123fe50f2942d33133d5ff8fc9d9db191d12fb9b19131ecb4e1:1",
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/button/cd10d554c51e/0",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:156:59:8965a0e4db84f123fe50f2942d33133d5ff8fc9d9db191d12fb9b19131ecb4e1:1",
								type: "button",
								className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
								onClick: () => setOpenId(String(c.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/span/0",
									"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:157:21:16c60377f1a55d3776405362999179f692149984f59bb23dbca2ffd2d854ba06:1",
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/span/a1c190df8fba/0",
										"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:158:23:8ca5d3c4b3551a6ac0471166938c66696119c05fc5579303dab058c2ed077e14:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/span/fc4fa82af124/0",
											"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:159:25:60439b6ba28b01f2fc391a10a6f3fb0aa49db71556d2c9be444fde39d9234ce2:1",
											className: "font-medium text-foreground text-sm",
											children: c.name
										}), c.relationship && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Badge/787fdd682b59/0",
											"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:160:44:7f4368d5b5f0cde45eace9a622909b4b744b8f017f4ce4d188cf50440eee91fc:1",
											variant: "secondary",
											className: "text-[10px]",
											children: relLabel(c.relationship)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/span/e6e1b5591c26/0",
										"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:162:23:712c6afcd667b5e3272c2cd3133362a3c756fb1399b70adf6b665930e2d2c77d:1",
										className: "block text-xs text-muted-foreground mt-0.5",
										children: c.phone
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
								"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/RowActions/894b9a3e2dd6/0",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:164:28:6c008705c7cef4be04e98d3343decc3b114d0886ad2fe0aef68d35acb8ba534c:1",
								onEdit: () => startEdit(c),
								onDelete: () => del.mutateAsync(c.id)
							})]
						})
					})
				}, c.id))
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/RecordDetailDialog/288082ddbbcd/0",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:173:9:c8f3633af12767a744af92f278dcdfe4ce9bcb908a2caeab3f2637c57a9782a6:1",
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
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:185:13:c146a8cc86b111ffb004b4a3e71880edbcd9ccd20d4ad9dce9d9992454260dc1:1",
					variant: "outline",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/a/bbeebd879e1d/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:186:15:6c7aef26af6fe45b3d180f645f52923c698e11fea879db6f44a75219f5b9ab82:1",
						href: `tel:${open.phone}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {
								"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Phone/0",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:186:45:6c7aef26af6fe45b3d180f645f52923c698e11fea879db6f44a75219f5b9ab82:1",
								className: "h-3.5 w-3.5 mr-1"
							}),
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
