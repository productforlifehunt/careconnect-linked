import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { J as Save, Zn as ArrowLeft, jt as LoaderCircle, zn as Building2 } from "../_libs/lucide-react.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { E as useCareFacility, W as useCreateCareFacility, Zn as useUpdateCareFacility, a as FACILITY_STAGE_OPTIONS, f as toCodeList, i as FACILITY_ROOM_TYPE_OPTIONS, n as FACILITY_PEOPLE_NUMBER_OPTIONS, o as FACILITY_TYPE_OPTIONS, r as FACILITY_ROOM_FACILITY_OPTIONS, t as FACILITY_COMMUNITY_FACILITY_OPTIONS } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as useParams$1, i as useNavigate$1 } from "./router-compat-3gk8yjav.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CareFacilityForm-rVG4aang.js
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
	const CheckboxGroup = ({ label, field, options }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/CareFacilityForm.tsx:98:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "mb-2 block",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "pages/CareFacilityForm.tsx:100:7:fcf144d64958aa28ae8cd22ba4d598f1f42c5052cbffcc3df6be8f8978cb9707:1",
			className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
			children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				"data-inspector-source": "pages/CareFacilityForm.tsx:102:11:43cd56db09bbcfe3ed3855dce8670b295baf08291617aa26e3c5547f65c604c9:1",
				className: "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					"aria-label": `${label}: ${isZh ? opt.zh : opt.en}`,
					checked: form[field].includes(opt.code),
					onCheckedChange: () => toggleMulti(field, opt.code)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-source": "pages/CareFacilityForm.tsx:108:13:e07f1dcd3cc450b14cf6965a9c2974cf7e69219648c5e79ae03a3c6c699d9e73:1",
					className: "text-sm",
					children: isZh ? opt.zh : opt.en
				})]
			}, `${field}-${opt.code}`))
		})]
	});
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
		"data-inspector-source": "pages/CareFacilityForm.tsx:164:7:e0692ac7f381543a560899593283909e91b273104963755d26942297aca8018b:1",
		className: "flex justify-center py-20",
		role: "status",
		"aria-label": isZh ? "正在加载机构" : "Loading facility",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-source": "pages/CareFacilityForm.tsx:165:9:089b45f30dafce3f32690d9f181458367688004f9b926b6a81ea965efecda5d5:1",
			className: "sr-only",
			children: isZh ? "编辑养老机构" : "Edit care facility"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/CareFacilityForm.tsx:172:5:24dee25884a578a52adfb1c716d011f63f54012f356f215180c3d1a98ff8403b:1",
		className: "max-w-5xl mx-auto px-4 py-5 space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
				"data-inspector-source": "pages/CareFacilityForm.tsx:179:11:446610a9aab186ad8120a5448560fe3414e630d90cab4ed6413c74726591e2bd:1",
				className: "flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-primary" }), isEditMode ? isZh ? "编辑养老机构" : "Edit care facility" : isZh ? "提交养老机构" : "Submit care facility"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/CareFacilityForm.tsx:185:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "机构名称" : "Facility name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.name,
							onChange: (e) => setForm((p) => ({
								...p,
								name: e.target.value
							})),
							className: "mt-1"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/CareFacilityForm.tsx:190:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "机构简介" : "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.description,
							onChange: (e) => setForm((p) => ({
								...p,
								description: e.target.value
							})),
							rows: 5,
							className: "mt-1"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/CareFacilityForm.tsx:195:11:829f074fdc378d9ca8422244d5a859aa1389767d8811749451d9cce4429aa629:1",
						className: "grid lg:grid-cols-2 gap-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								label: isZh ? "机构类型" : "Facility type",
								field: "type",
								options: FACILITY_TYPE_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								label: isZh ? "可照护的失智症阶段" : "Dementia stages cared for",
								field: "dementia_stage",
								options: FACILITY_STAGE_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								label: isZh ? "房型" : "Room types",
								field: "room_type",
								options: FACILITY_ROOM_TYPE_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								label: isZh ? "房间设施" : "Room facilities",
								field: "room_facility",
								options: FACILITY_ROOM_FACILITY_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxGroup, {
								label: isZh ? "公共设施" : "Community facilities",
								field: "community_facility",
								options: FACILITY_COMMUNITY_FACILITY_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityForm.tsx:201:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-2 block",
									children: isZh ? "入住人数规模" : "Number of residents"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "pages/CareFacilityForm.tsx:203:15:7ceb979713a600b850f403ebc5131ab6235c1317e091f15bf7ef5a580141cfed:1",
									className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
									children: FACILITY_PEOPLE_NUMBER_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										"data-inspector-source": "pages/CareFacilityForm.tsx:205:19:fc13663bd58745bcbcb71a958fb64b53cc5e7dc407b5c7c2d994ba1e5b6e3260:1",
										className: "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											"data-inspector-source": "pages/CareFacilityForm.tsx:206:21:9d02b49668bb7a04e8710917a2fd66f6915aec5803ea1823a08113a84799f59b:1",
											type: "radio",
											name: "people-number",
											checked: form.people_number === opt.code,
											onChange: () => setForm((p) => ({
												...p,
												people_number: opt.code
											}))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/CareFacilityForm.tsx:212:21:10e68a429f861e814d377d25f56483f896a99be92e352eb5f4a295de4b29c614:1",
											className: "text-sm",
											children: isZh ? opt.zh : opt.en
										})]
									}, opt.code))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/CareFacilityForm.tsx:219:11:86c67b105020c3450aa900952984ef2c3a0c372b34b5995c9884b3d47525568b:1",
						className: "grid md:grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityForm.tsx:220:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "所在地区" : "Location" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.location,
									onChange: (e) => setForm((p) => ({
										...p,
										location: e.target.value
									})),
									placeholder: isZh ? "如：北京市朝阳区" : "e.g. Central Region",
									className: "mt-1"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityForm.tsx:229:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "详细地址" : "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.address,
									onChange: (e) => setForm((p) => ({
										...p,
										address: e.target.value
									})),
									className: "mt-1"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityForm.tsx:233:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "联系电话" : "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.phone,
									onChange: (e) => setForm((p) => ({
										...p,
										phone: e.target.value
									})),
									className: "mt-1"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityForm.tsx:237:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "邮箱" : "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.email,
									onChange: (e) => setForm((p) => ({
										...p,
										email: e.target.value
									})),
									className: "mt-1"
								})]
							})
						]
					}),
					!isEditMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "bg-muted/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-source": "pages/CareFacilityForm.tsx:246:17:94d08559658da120ce5888fc9e4cebd7a32ee61a883ba2e3d36b5e1779e7d61f:1",
								className: "flex items-center gap-2 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									"aria-label": isZh ? "我是该场所的所有者" : "I am the owner of this facility",
									checked: isOwner,
									onCheckedChange: (checked) => setIsOwner(!!checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "pages/CareFacilityForm.tsx:248:19:595e102394fb98eeca7ef9c59abf128cfd60b8f5cb4a897d3af96e4ab8ac5f16:1",
									className: "text-sm font-medium",
									children: isZh ? "我是该场所的所有者" : "I am the owner of this facility"
								})]
							}), isOwner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CareFacilityForm.tsx:251:19:73c5a9a443bee0653df6fb35802744c241344ac387d9361b71b98d3f5a563633:1",
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityForm.tsx:252:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "我的角色" : "My role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: ownerRole,
											onChange: (e) => setOwnerRole(e.target.value),
											placeholder: isZh ? "例如 CEO、院长、运营负责人" : "e.g. CEO, Director, Operations Lead",
											className: "mt-1"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityForm.tsx:256:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "认领证明" : "Ownership proof" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											value: ownershipClaim,
											onChange: (e) => setOwnershipClaim(e.target.value),
											placeholder: isZh ? "可填写你的身份、公司邮箱、与该场所的关系等；可留空" : "Describe your identity, company email, or relationship to this facility; optional",
											rows: 4,
											className: "mt-1"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/CareFacilityForm.tsx:266:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "证明照片链接" : "Links to photos of your proof" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											value: ownershipAttachmentUrls,
											onChange: (e) => setOwnershipAttachmentUrls(e.target.value),
											placeholder: isZh ? "每行一个图片 URL，或用逗号分隔" : "One photo link per line",
											rows: 3,
											className: "mt-1"
										})]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/CareFacilityForm.tsx:282:11:c3d82718aab4aea793789df73f093175468bf14a21e0de477f82a6e65e7506b7:1",
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
