import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { Pn as Check, c as Users, ct as Phone, it as Plus, jt as LoaderCircle, n as X } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-DHxbK-sS.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CCayJGqJ.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { At as useEmergencyContacts, Q as useCreateEmergencyContact, ar as useUpdateEmergencyContact, yt as useDeleteEmergencyContact } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-B2oGg1MM.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-4j2qP3NS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmergencyCard-CPQ4Qyz5.js
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
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:82:11:3511bea2c02d2e65955a674933106e8b3ccfc60e1556e491258b90f66ca496af:1",
					children: [
						Z("姓名", "Name"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive",
							children: "*"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Input/b32b496c3bac",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:83:11:b1e930d8e87526a9be14524b6c1eba334b8212a067c3ac16d388e69e18346114:1",
					className: "mt-1",
					value: f.name,
					onChange: (e) => set({ name: e.target.value }),
					placeholder: Z("联系人姓名", "Contact name")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/1",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:86:11:ce96346e64259c425d59f05d24c8bcb2aeba8e628164c0eb4dfbf8b2e4c00fce:1",
					children: [
						Z("电话", "Phone"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive",
							children: "*"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Input/c6f18ccd6c98",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:87:11:416072f90118f40115e83810927e0aec05f3840e36678ca221d6eddd98cfc4b9:1",
					className: "mt-1",
					type: "tel",
					value: f.phone,
					onChange: (e) => set({ phone: e.target.value }),
					placeholder: "+86 138 0000 0000"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/2",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:91:9:ac4c4f5c9523aff24f0eada26610001a3545c2fdc8626a0febd3dc860e336eb3:1",
				children: Z("关系", "Relationship")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Select/4bbc47b81275",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:92:9:1cc23578661e101940164b9e99dc08a4dd5ffb83b9fc3f9a31e630eb0275bc50:1",
				value: f.relationship,
				onValueChange: (v) => set({ relationship: v }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "mt-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/fields/SelectContent/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:94:11:79ac92afd1a512e8c5935b1e4a000a9a4edd2221b9024d043b3e4385fbd33e04:1",
					children: RELATIONSHIP_VALUES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/fields/SelectItem/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:94:58:79ac92afd1a512e8c5935b1e4a000a9a4edd2221b9024d043b3e4385fbd33e04:1",
						value: r,
						children: relLabel(r)
					}, r))
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/3",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:98:9:3be5faf64e2b89968c5031cdbc6ede06339cdaccb51876d7be9e38a2dbadbf90:1",
				children: Z("详细信息", "Detail")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Input/8ac05a97d0e7",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:99:9:396a518bcccf3d533e47f8806384dddecadbadf1dddf7f44e9baeb16ef35ef0b:1",
				className: "mt-1",
				value: f.content,
				onChange: (e) => set({ content: e.target.value }),
				placeholder: Z("微信、邮箱、备用号码或其他说明", "WeChat, email, second number, or other details")
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/4",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:102:9:cdc9f27321a73af9250c11931274009d7eb5eb66d746a883fa22bab59f0b720e:1",
				children: Z("地址", "Address")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Input/9c06e27598af",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:103:9:ec6222c6ceb1efee0263b8c56a37f3e80e5ab15fc85d7993a497115170460561:1",
				className: "mt-1",
				value: f.address,
				onChange: (e) => set({ address: e.target.value }),
				placeholder: Z("住址或工作地点", "Home or work address")
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Label/5",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:106:9:2b70970a7c220a6e0e3ddd36ffeb5306a7efe569cbacc81da1cad392cac08ec8:1",
				children: Z("备注", "Note")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/fields/Textarea/647b6d804e6c",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:107:9:d107583ae588901917df71b2e787d829817ec2f7073b2a96355a869bdbbdf0fa:1",
				className: "mt-1",
				rows: 2,
				value: f.note,
				onChange: (e) => set({ note: e.target.value }),
				placeholder: Z("什么时候找这位联系人最合适……", "When it's best to reach this person…")
			})] })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/0",
		"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:113:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/h2/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:115:9:65121c4ba07e82d05f8b0812b25970fdfda44873cbdca30b173d6dc24454c7a6:1",
					className: "text-lg font-bold text-foreground",
					children: Z("紧急联系人", "Emergency Contacts")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/98512c5a1f68",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:116:9:0cc17c211e83f06cde4e8236ac9c5e5f9e315993ee5d924d96f00ee0b99351be:1",
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
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Dialog/98512c5a1f68",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:119:7:0948f33fe93c407a8c4efe07c67f4b5b473c27ae9abaf58d027354e93eacabeb:1",
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/DialogTitle/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:122:13:0e6d652c5828a529738c4280d671419c60fa75a92ae76977c18bbaf7f262b541:1",
					children: Z("添加紧急联系人", "Add Emergency Contact")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/DialogDescription/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:123:13:710ec83bd526934557268a313a082bb2fd5165e1ad0cab0ccad964eb4aa92574:1",
					children: Z("为紧急情况添加一位重要联系人", "Add an important contact for emergencies")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/1",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:125:11:1a8cad0af56d0213ea0b08a5c2db635e4633efd24350baf4aea81f992888456b:1",
					className: "mt-2 space-y-4",
					children: [fields(form, (u) => setForm((p) => ({
						...p,
						...u
					}))), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/b537fb954dc1",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:127:13:8a7c2a7696251ab8e59a414b4430320e3710bae1202afa7d881c7501b3dd0448:1",
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
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/p/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:139:11:67b2bbb19ca265f218c3d7e75dc6ff5f03a1883a19dafe463f22dd4512af4f6f:1",
						className: "text-muted-foreground mb-3",
						children: Z("暂无紧急联系人", "No emergency contacts yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/98512c5a1f68",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:140:11:04ef7aa074b8b8a65eb345a246dfc5fead6303647911f04f2809c659aeeaced5:1",
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
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/2",
				"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:143:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (contacts || []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Card/0",
					"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:145:13:56bac33e74e80ec2ae9539bc9d5fe5a33321158deec172f462f599f05a7dff03:1",
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/CardContent/0",
						"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:146:15:28db4c9a96e8d75b48cbafc894d97da998a5485519267eabecbea2eb58e81599:1",
						className: "p-4",
						children: editId === c.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/div/3",
							"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:148:19:975fcfade5b808495ca81a18cf144b76aa234f03b157b3749a8ad47825c035e3:1",
							className: "space-y-3",
							children: [fields(editForm, (u) => setEditForm((p) => ({
								...p,
								...u
							}))), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 justify-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/817c69c1a25a",
									"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:151:23:11830e72714551f45bdf25deab185d0b2c743b5a54e66f2a6c3fd0875e29379f:1",
									variant: "ghost",
									size: "sm",
									onClick: cancelEdit,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 mr-1" }),
										" ",
										Z("取消", "Cancel")
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Button/bbb0c0e8996a",
									"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:152:23:aa3c740f38236ac98f26a0811e0e8d7717d361be979f79a993a531a7ac0c9b9e:1",
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
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/button/361a429286d2",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:156:59:8965a0e4db84f123fe50f2942d33133d5ff8fc9d9db191d12fb9b19131ecb4e1:1",
								type: "button",
								className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
								onClick: () => setOpenId(String(c.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/span/0",
										"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:158:23:8ca5d3c4b3551a6ac0471166938c66696119c05fc5579303dab058c2ed077e14:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/span/1",
											"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:159:25:60439b6ba28b01f2fc391a10a6f3fb0aa49db71556d2c9be444fde39d9234ce2:1",
											className: "font-medium text-foreground text-sm",
											children: c.name
										}), c.relationship && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/Badge/0",
											"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:160:44:7f4368d5b5f0cde45eace9a622909b4b744b8f017f4ce4d188cf50440eee91fc:1",
											variant: "secondary",
											className: "text-[10px]",
											children: relLabel(c.relationship)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/span/2",
										"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:162:23:712c6afcd667b5e3272c2cd3133362a3c756fb1399b70adf6b665930e2d2c77d:1",
										className: "block text-xs text-muted-foreground mt-0.5",
										children: c.phone
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
								"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/RowActions/894b9a3e2dd6",
								"data-inspector-source": "components/cared-ones/EmergencyCard.tsx:164:28:6c008705c7cef4be04e98d3343decc3b114d0886ad2fe0aef68d35acb8ba534c:1",
								onEdit: () => startEdit(c),
								onDelete: () => del.mutateAsync(c.id)
							})]
						})
					})
				}, c.id))
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/RecordDetailDialog/288082ddbbcd",
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
						"data-inspector-id": "components/cared-ones/EmergencyCard/EmergencyCard/a/0",
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
