import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { J as Save, Zn as ArrowLeft, jt as LoaderCircle, zn as Building2 } from "../_libs/lucide-react.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { E as useCareFacility, W as useCreateCareFacility, Zn as useUpdateCareFacility, a as FACILITY_STAGE_OPTIONS, f as toCodeList, i as FACILITY_ROOM_TYPE_OPTIONS, n as FACILITY_PEOPLE_NUMBER_OPTIONS, o as FACILITY_TYPE_OPTIONS, r as FACILITY_ROOM_FACILITY_OPTIONS, t as FACILITY_COMMUNITY_FACILITY_OPTIONS } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as useParams$1, i as useNavigate$1 } from "./router-compat-CRbRSfhz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CareFacilityForm-BiKIaBU-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyForm = {
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
	email: ""
};
function CareFacilityForm() {
	const { id } = useParams$1();
	const isEditMode = !!id;
	const navigate = useNavigate$1();
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const { toast } = useToast();
	const { data: facility, isLoading } = useCareFacility(id);
	const createFacility = useCreateCareFacility();
	const updateFacility = useUpdateCareFacility();
	const [form, setForm] = (0, import_react.useState)(emptyForm);
	const [isOwner, setIsOwner] = (0, import_react.useState)(false);
	const [ownerRole, setOwnerRole] = (0, import_react.useState)("");
	const [ownershipClaim, setOwnershipClaim] = (0, import_react.useState)("");
	const [ownershipAttachmentUrls, setOwnershipAttachmentUrls] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
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
			email: facility.email || ""
		});
	}, [facility]);
	const toggleMulti = (field, code) => {
		setForm((prev) => ({
			...prev,
			[field]: prev[field].includes(code) ? prev[field].filter((item) => item !== code) : [...prev[field], code]
		}));
	};
	const CheckboxGroup = ({ label, field, options }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		"data-inspector-id": "pages/CareFacilityForm/CheckboxGroup/Label/0",
		"data-inspector-source": "pages/CareFacilityForm.tsx:99:7:42cff302d66f0914f945664eaf24476260080b303a6c6513d74b8b68336b66e3:1",
		className: "mb-2 block",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/CareFacilityForm/CheckboxGroup/div/0",
		"data-inspector-source": "pages/CareFacilityForm.tsx:100:7:fcf144d64958aa28ae8cd22ba4d598f1f42c5052cbffcc3df6be8f8978cb9707:1",
		className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
		children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			"data-inspector-id": "pages/CareFacilityForm/CheckboxGroup/label/0",
			"data-inspector-source": "pages/CareFacilityForm.tsx:102:11:43cd56db09bbcfe3ed3855dce8670b295baf08291617aa26e3c5547f65c604c9:1",
			className: "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
				"data-inspector-id": "pages/CareFacilityForm/CheckboxGroup/Checkbox/640cfeb00f5d",
				"data-inspector-source": "pages/CareFacilityForm.tsx:103:13:ea6784c175339da68df469c125f19eece8af0df46311191994ae5c111268cb45:1",
				"aria-label": `${label}: ${isZh ? opt.zh : opt.en}`,
				checked: form[field].includes(opt.code),
				onCheckedChange: () => toggleMulti(field, opt.code)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-id": "pages/CareFacilityForm/CheckboxGroup/span/0",
				"data-inspector-source": "pages/CareFacilityForm.tsx:108:13:e07f1dcd3cc450b14cf6965a9c2974cf7e69219648c5e79ae03a3c6c699d9e73:1",
				className: "text-sm",
				children: isZh ? opt.zh : opt.en
			})]
		}, `${field}-${opt.code}`))
	})] });
	const handleSubmit = async () => {
		if (!form.name.trim()) {
			toast({
				title: isZh ? "请填写机构名称" : "Please enter a facility name",
				variant: "destructive"
			});
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
				email: form.email.trim() || null
			};
			if (isEditMode && id) {
				const updated = await updateFacility.mutateAsync({
					id,
					...payload
				});
				toast({ title: isZh ? "机构已更新" : "Facility updated" });
				navigate(`/facility/${updated.id}`);
			} else {
				await createFacility.mutateAsync({
					...payload,
					isOwner,
					ownerRole: ownerRole.trim() || null,
					ownershipClaim: ownershipClaim.trim() || null,
					ownershipAttachmentUrls: ownershipAttachmentUrls.trim() || null
				});
				toast({
					title: isZh ? "已提交，我们会先审核" : "Submitted — we'll check it first",
					description: isZh ? "审核通过后，它就会出现在机构列表里。" : "Once it's approved it will show up in the facility list."
				});
				navigate("/search?service_category=facility");
			}
		} catch (err) {
			toast({
				title: isZh ? "提交失败" : "Save failed",
				description: err.message,
				variant: "destructive"
			});
		}
	};
	if (isEditMode && isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/div/0",
		"data-inspector-source": "pages/CareFacilityForm.tsx:164:7:e0692ac7f381543a560899593283909e91b273104963755d26942297aca8018b:1",
		className: "flex justify-center py-20",
		role: "status",
		"aria-label": isZh ? "正在加载机构" : "Loading facility",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/h1/0",
			"data-inspector-source": "pages/CareFacilityForm.tsx:165:9:089b45f30dafce3f32690d9f181458367688004f9b926b6a81ea965efecda5d5:1",
			className: "sr-only",
			children: isZh ? "编辑养老机构" : "Edit care facility"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-5xl mx-auto px-4 py-5 space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Button/d0cda6559bb3",
			"data-inspector-source": "pages/CareFacilityForm.tsx:173:7:101e733c052346f476f3bb467d8a4741f64b11fb3715471a578a438b83aa1cbf:1",
			variant: "ghost",
			size: "sm",
			className: "gap-1.5 -ml-2",
			onClick: () => navigate(-1),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }),
				" ",
				isZh ? "返回" : "Back"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "border-transparent card-elevated",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/h1/1",
				"data-inspector-source": "pages/CareFacilityForm.tsx:179:11:446610a9aab186ad8120a5448560fe3414e630d90cab4ed6413c74726591e2bd:1",
				className: "flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-primary" }), isEditMode ? isZh ? "编辑养老机构" : "Edit care facility" : isZh ? "提交养老机构" : "Submit care facility"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/CardContent/0",
				"data-inspector-source": "pages/CareFacilityForm.tsx:184:9:d6a6ce075a9392dc8b2e14bc48fbc611d02e2326020d7d4f137126413c4565e9:1",
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/0",
						"data-inspector-source": "pages/CareFacilityForm.tsx:186:13:dd7d858c265a78d13f17a0dbe03ca26f373bb6d6f15d206948821495b65092dc:1",
						children: isZh ? "机构名称" : "Facility name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Input/e2e366b082e3",
						"data-inspector-source": "pages/CareFacilityForm.tsx:187:13:3fcbc8e2c5b426976b02ad42ad2b0f5ff648dae582e1c4c7200a0e6527b9ca57:1",
						value: form.name,
						onChange: (e) => setForm((p) => ({
							...p,
							name: e.target.value
						})),
						className: "mt-1"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/1",
						"data-inspector-source": "pages/CareFacilityForm.tsx:191:13:f97c0b4f74b66866b5b4f2553bc52a45b5f0addf2c3fbcee1a294eea3ce77846:1",
						children: isZh ? "机构简介" : "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Textarea/b46eac0333f8",
						"data-inspector-source": "pages/CareFacilityForm.tsx:192:13:45cc7cf5ae836eb9fe05deefe5b27ca0e67078cd7ad898c74da68d0a736e9249:1",
						value: form.description,
						onChange: (e) => setForm((p) => ({
							...p,
							description: e.target.value
						})),
						rows: 5,
						className: "mt-1"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid lg:grid-cols-2 gap-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/CheckboxGroup/0",
								"data-inspector-source": "pages/CareFacilityForm.tsx:196:13:a56c11c1e0fe292a55bdc4ba0a4ced5d2abf27e784482be3bbbba253e52f131a:1",
								label: isZh ? "机构类型" : "Facility type",
								field: "type",
								options: FACILITY_TYPE_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/CheckboxGroup/1",
								"data-inspector-source": "pages/CareFacilityForm.tsx:197:13:3e0ddacaf92c4206f9af8c7cf85b1dcd8994bb21d7b58bf7331abd6adad4e3d3:1",
								label: isZh ? "可照护的失智症阶段" : "Dementia stages cared for",
								field: "dementia_stage",
								options: FACILITY_STAGE_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/CheckboxGroup/2",
								"data-inspector-source": "pages/CareFacilityForm.tsx:198:13:59b19ef3b57c05a4f65a117d0c2306ad61188bc05598d70313b490aecb79915b:1",
								label: isZh ? "房型" : "Room types",
								field: "room_type",
								options: FACILITY_ROOM_TYPE_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/CheckboxGroup/3",
								"data-inspector-source": "pages/CareFacilityForm.tsx:199:13:670bea056d15fc0954d7dafd0383eb9355b53b679312d4ffb25259ff932e4aae:1",
								label: isZh ? "房间设施" : "Room facilities",
								field: "room_facility",
								options: FACILITY_ROOM_FACILITY_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/CheckboxGroup/4",
								"data-inspector-source": "pages/CareFacilityForm.tsx:200:13:3c67ca736bc2977052b12ea7abb47625196b5626dec4bb76066d924e64014adf:1",
								label: isZh ? "公共设施" : "Community facilities",
								field: "community_facility",
								options: FACILITY_COMMUNITY_FACILITY_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/2",
								"data-inspector-source": "pages/CareFacilityForm.tsx:202:15:9df8ee24ba90bdd40105fb50d56b4cf98c77593ff67f1a58415674eb07adb8b3:1",
								className: "mb-2 block",
								children: isZh ? "入住人数规模" : "Number of residents"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/div/1",
								"data-inspector-source": "pages/CareFacilityForm.tsx:203:15:7ceb979713a600b850f403ebc5131ab6235c1317e091f15bf7ef5a580141cfed:1",
								className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
								children: FACILITY_PEOPLE_NUMBER_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/label/0",
									"data-inspector-source": "pages/CareFacilityForm.tsx:205:19:fc13663bd58745bcbcb71a958fb64b53cc5e7dc407b5c7c2d994ba1e5b6e3260:1",
									className: "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/input/c81e56fc2846",
										"data-inspector-source": "pages/CareFacilityForm.tsx:206:21:9d02b49668bb7a04e8710917a2fd66f6915aec5803ea1823a08113a84799f59b:1",
										type: "radio",
										name: "people-number",
										checked: form.people_number === opt.code,
										onChange: () => setForm((p) => ({
											...p,
											people_number: opt.code
										}))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/span/0",
										"data-inspector-source": "pages/CareFacilityForm.tsx:212:21:10e68a429f861e814d377d25f56483f896a99be92e352eb5f4a295de4b29c614:1",
										className: "text-sm",
										children: isZh ? opt.zh : opt.en
									})]
								}, opt.code))
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/3",
								"data-inspector-source": "pages/CareFacilityForm.tsx:221:15:8901b1368cdc75dd43315b0d40489ab0f040ac31d679d59e1bba308080b9a33f:1",
								children: isZh ? "所在地区" : "Location"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Input/36e70591951f",
								"data-inspector-source": "pages/CareFacilityForm.tsx:222:15:8f0eb9169b503119d96bda2e87c73c9ce55a4f3450055e53b86496e7ade91891:1",
								value: form.location,
								onChange: (e) => setForm((p) => ({
									...p,
									location: e.target.value
								})),
								placeholder: isZh ? "如：北京市朝阳区" : "e.g. Central Region",
								className: "mt-1"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/4",
								"data-inspector-source": "pages/CareFacilityForm.tsx:230:15:e0216125e5e535c4bd4f8a2fcd1d41b3571ec9d4b3c3073811d64433fda216d0:1",
								children: isZh ? "详细地址" : "Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Input/7a8785293c75",
								"data-inspector-source": "pages/CareFacilityForm.tsx:231:15:d4b78c4f7c1e67132266df3d82ce3fe77027aace8c00fb44213924bc9baeee52:1",
								value: form.address,
								onChange: (e) => setForm((p) => ({
									...p,
									address: e.target.value
								})),
								className: "mt-1"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/5",
								"data-inspector-source": "pages/CareFacilityForm.tsx:234:15:e0391154d5e7e3bba779883a86625502170ed7f9a2c0c5e8a3886ed33da8fa24:1",
								children: isZh ? "联系电话" : "Phone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Input/3ca7110f57e3",
								"data-inspector-source": "pages/CareFacilityForm.tsx:235:15:6abe2dff19e8d56f0f4127a83fb1510735f01199c5c40cf194fc742cc1e25ff3:1",
								value: form.phone,
								onChange: (e) => setForm((p) => ({
									...p,
									phone: e.target.value
								})),
								className: "mt-1"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/6",
								"data-inspector-source": "pages/CareFacilityForm.tsx:238:15:8c5750e32b0f67ee113af5f3fd69b89d0669d2b3b6c0bd75093e0eecd048036b:1",
								children: isZh ? "邮箱" : "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Input/78023301915b",
								"data-inspector-source": "pages/CareFacilityForm.tsx:239:15:45c01e564175f80e7b8374922130702a99eba87b70b82e73b7613e0c7d384066:1",
								value: form.email,
								onChange: (e) => setForm((p) => ({
									...p,
									email: e.target.value
								})),
								className: "mt-1"
							})] })
						]
					}),
					!isEditMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "bg-muted/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/CardContent/1",
							"data-inspector-source": "pages/CareFacilityForm.tsx:245:15:6b0b0877fe149ededf6cb5b5d478f997773729a278d571a46138b128fd7e1772:1",
							className: "p-4 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Checkbox/3269e5f84b1c",
									"data-inspector-source": "pages/CareFacilityForm.tsx:247:19:d55bdcff90f569dd3cf4816dc4e17c78d176299349a947cdb4d9daf03a2abb1f:1",
									"aria-label": isZh ? "我是该场所的所有者" : "I am the owner of this facility",
									checked: isOwner,
									onCheckedChange: (checked) => setIsOwner(!!checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/span/1",
									"data-inspector-source": "pages/CareFacilityForm.tsx:248:19:595e102394fb98eeca7ef9c59abf128cfd60b8f5cb4a897d3af96e4ab8ac5f16:1",
									className: "text-sm font-medium",
									children: isZh ? "我是该场所的所有者" : "I am the owner of this facility"
								})]
							}), isOwner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/7",
										"data-inspector-source": "pages/CareFacilityForm.tsx:253:23:7221e0d70e6cd2ea8e249fe1c0c3a9bd8c222f64b3502f458308107452fc0bc4:1",
										children: isZh ? "我的角色" : "My role"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Input/e05c585e7e9a",
										"data-inspector-source": "pages/CareFacilityForm.tsx:254:23:1744a848a62707140abc6a7ace18482774d765b6b93657feaf3b8c3310a02c2f:1",
										value: ownerRole,
										onChange: (e) => setOwnerRole(e.target.value),
										placeholder: isZh ? "例如 CEO、院长、运营负责人" : "e.g. CEO, Director, Operations Lead",
										className: "mt-1"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/8",
										"data-inspector-source": "pages/CareFacilityForm.tsx:257:23:6d81b20e844edd9afd23404a1bc5512a140a8b2a439e00e044a4b8aa0d8e0b48:1",
										children: isZh ? "认领证明" : "Ownership proof"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Textarea/da3c65a7d38b",
										"data-inspector-source": "pages/CareFacilityForm.tsx:258:23:6f20fbb0ee99e86b6bf208a78010ffe16d868d11a04003f21ee7aa13dfdc894c:1",
										value: ownershipClaim,
										onChange: (e) => setOwnershipClaim(e.target.value),
										placeholder: isZh ? "可填写你的身份、公司邮箱、与该场所的关系等；可留空" : "Describe your identity, company email, or relationship to this facility; optional",
										rows: 4,
										className: "mt-1"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Label/9",
										"data-inspector-source": "pages/CareFacilityForm.tsx:267:23:fb26147ff905b545b149faf8bad2635214d855b441e7800e988c25913cf0a597:1",
										children: isZh ? "证明照片链接" : "Links to photos of your proof"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Textarea/dfd4f58528b2",
										"data-inspector-source": "pages/CareFacilityForm.tsx:268:23:6f20fbb0ee99e86b6bf208a78010ffe16d868d11a04003f21ee7aa13dfdc894c:1",
										value: ownershipAttachmentUrls,
										onChange: (e) => setOwnershipAttachmentUrls(e.target.value),
										placeholder: isZh ? "每行一个图片 URL，或用逗号分隔" : "One photo link per line",
										rows: 3,
										className: "mt-1"
									})] })
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/CareFacilityForm/CareFacilityForm/Button/8cdee946b60f",
							"data-inspector-source": "pages/CareFacilityForm.tsx:283:13:aee42e9eb3eb0055908800bcc4a43eaa5f7b29543b4e000015edad37051d3018:1",
							variant: "coral",
							onClick: handleSubmit,
							disabled: createFacility.isPending || updateFacility.isPending,
							children: [createFacility.isPending || updateFacility.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-2" }), isEditMode ? isZh ? "保存修改" : "Save changes" : isZh ? "提交机构" : "Submit facility"]
						})
					})
				]
			})]
		})]
	});
}
//#endregion
export { CareFacilityForm as t };
