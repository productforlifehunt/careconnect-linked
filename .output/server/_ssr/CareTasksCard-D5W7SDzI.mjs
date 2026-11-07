import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { Dn as CircleCheckBig, Dt as MapPin, Sn as Circle, Z as RotateCcw, it as Plus, jt as LoaderCircle, vn as Clock } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { Dt as useDeleteTask, N as useCareTasks, _r as useUpdateTaskStatus, st as useCreateTask } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-BGuzjdk0.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-DdZS-7aZ.mjs";
import { n as TabsContent, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as pendingCareTasks } from "./pending-Cmgt3sc7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CareTasksCard-D5W7SDzI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var numId = (v) => String(v ?? "").replace(/^wp-/, "");
var EMPTY = {
	title: "",
	description: "",
	task_date: "",
	start_time: "",
	location: ""
};
function CareTasksCard({ caredOneId }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { data: allTasks, isLoading, error, refetch } = useCareTasks();
	const createTask = useCreateTask();
	const updateTask = useUpdateTaskStatus();
	const del = useDeleteTask();
	const [tab, setTab] = (0, import_react.useState)("view");
	const [form, setForm] = (0, import_react.useState)({ ...EMPTY });
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [editForm, setEditForm] = (0, import_react.useState)({ ...EMPTY });
	const tasks = (0, import_react.useMemo)(() => (allTasks || []).filter((t) => numId(t.cared_one_id) && numId(t.cared_one_id) === numId(caredOneId)), [allTasks, caredOneId]);
	const pending = pendingCareTasks(tasks, [caredOneId]);
	const done = tasks.filter((t) => String(t.finish_status) === "b56");
	const open = tasks.find((t) => String(t.id) === String(openId));
	const setStatus = (t, next) => {
		updateTask.mutate({
			id: t.id,
			updates: {
				finish_status: next,
				completed_at: next === "b56" ? (/* @__PURE__ */ new Date()).toISOString() : ""
			}
		}, {
			onSuccess: () => toast({ title: next === "b56" ? Z("已标记完成", "Marked as done") : Z("已改回未完成", "Marked as not done") }),
			onError: () => toast({
				title: Z("没能更新这个任务，请再试一次。", "Couldn't update that task. Please try again."),
				variant: "destructive"
			})
		});
	};
	const startEdit = (t) => {
		setEditId(String(t.id));
		setEditForm({
			title: t.title || "",
			description: t.description || "",
			task_date: t.task_date ? String(t.task_date).slice(0, 10) : "",
			start_time: t.start_time ? String(t.start_time).slice(0, 5) : "",
			location: t.location || ""
		});
		setOpenId(null);
	};
	const saveEdit = () => {
		if (!editId || !editForm.title) return;
		updateTask.mutate({
			id: editId,
			updates: {
				title: editForm.title,
				description: editForm.description,
				task_date: editForm.task_date,
				start_time: editForm.start_time,
				location: editForm.location
			}
		}, {
			onSuccess: () => {
				setEditId(null);
				toast({ title: Z("任务已更新", "Task updated") });
			},
			onError: () => toast({
				title: Z("没能保存修改，请再试一次。", "Couldn't save the changes. Please try again."),
				variant: "destructive"
			})
		});
	};
	const submit = () => {
		if (!form.title) return;
		createTask.mutate({
			title: form.title,
			description: form.description || void 0,
			task_date: form.task_date || void 0,
			start_time: form.start_time || void 0,
			location: form.location || void 0,
			cared_one_id: caredOneId
		}, {
			onSuccess: () => {
				setForm({ ...EMPTY });
				setTab("view");
				toast({ title: Z("任务已添加", "Task added") });
			},
			onError: () => toast({
				title: Z("没能添加这个任务，请再试一次。", "Couldn't add that task. Please try again."),
				variant: "destructive"
			})
		});
	};
	const editFields = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:103:5:2b69ab864b367220d20e2579d6d6e037a90e8f50bc30ed5d9cfd4ac43c641459:1",
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: editForm.title,
				onChange: (e) => setEditForm((p) => ({
					...p,
					title: e.target.value
				})),
				placeholder: Z("任务名称", "Task name")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: editForm.description,
				onChange: (e) => setEditForm((p) => ({
					...p,
					description: e.target.value
				})),
				rows: 2,
				placeholder: Z("需要做什么？", "What needs to be done?")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:106:7:e3cb4af1b0c3d283422c3b18adf86f811a9b80703ebe2d7d25f3127073548ac1:1",
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: editForm.task_date,
					onChange: (e) => setEditForm((p) => ({
						...p,
						task_date: e.target.value
					}))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "time",
					value: editForm.start_time,
					onChange: (e) => setEditForm((p) => ({
						...p,
						start_time: e.target.value
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: editForm.location,
				onChange: (e) => setEditForm((p) => ({
					...p,
					location: e.target.value
				})),
				placeholder: Z("地点（可留空）", "Place (optional)")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:111:7:fb4b459ab0374a08201024c9389907c0dd3fc1cb8efa3c882da23324f3bbeed2:1",
				className: "flex gap-2 justify-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => setEditId(null),
					children: Z("取消", "Cancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "coral",
					size: "sm",
					onClick: saveEdit,
					disabled: updateTask.isPending || !editForm.title,
					children: Z("保存", "Save")
				})]
			})
		]
	});
	const row = (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-transparent card-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-4",
			children: editId === String(t.id) ? editFields : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:122:11:0fbb41e22c4a0142ef9b0a182019c1deadf2de0d46327ef07bc54843e724fbc4:1",
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:123:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
					type: "button",
					className: "min-w-0 flex-1 text-left flex items-start gap-3",
					onClick: () => setOpenId(String(t.id)),
					"aria-label": Z(`打开任务 ${t.title}`, `Open task ${t.title}`),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:129:13:7b08a3e85fb4d5c97cabe88db39b2ff41d809a5123d672eb2a22420e5420dc5d:1",
						className: "mt-0.5 shrink-0",
						children: String(t.finish_status) === "b56" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-5 w-5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-5 w-5 text-muted-foreground" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:134:13:1a88adf4bad3c6d02e76712c554cfb11accc85a0c9c577937015e46010cdedd0:1",
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:135:15:a17d477771f7d697609f28663e5b89db3bc4fad48f90f11af13378f119f7a126:1",
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:136:17:10317a9193194f21ea76998fc781243ae266cb6fa76efceb66fd45aa92204baa:1",
									className: `font-medium text-sm ${String(t.finish_status) === "b56" ? "line-through text-muted-foreground" : "text-foreground"}`,
									children: t.title
								}), t.help_status_label && String(t.help_status) !== "b55" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "text-[10px]",
									children: t.help_status_label
								})]
							}),
							t.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:141:33:1e0918c7e817f8e4c3ebde9d8dfb7a898365c79d8db367a8358787c0ab339045:1",
								className: "block text-xs text-muted-foreground mt-1 line-clamp-2",
								children: t.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:142:15:453d27ef6356daf2966dd250bdf22c9a8233e242f0b739bc0dec55619662d121:1",
								className: "flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap",
								children: [t.task_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:143:33:4578f946cd0b7e7d428e23ca1a00bf7bfe057ccc4dd665eea9a595c33086dd51:1",
									className: "flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
										" ",
										formatDate(t.task_date),
										t.start_time ? ` · ${String(t.start_time).slice(0, 5)}` : ""
									]
								}), t.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:144:32:104a9360c26621c2b96ee43d015feddc3a076940f1da1bc541d5ed4f2929016a:1",
									className: "flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
										" ",
										t.location
									]
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
					onEdit: () => startEdit(t),
					onDelete: () => del.mutateAsync(t.id)
				})]
			})
		})
	}, t.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:156:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:157:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:158:9:eead34ee18afe4a1b3729103c54e4377f6387011b220e301b561ecf0e272d1b2:1",
					className: "text-lg font-bold text-foreground",
					children: [
						Z("护理任务", "Care Tasks"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: isLoading || error ? "—" : pending.length
						})
					]
				}), tab === "add" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => setTab("view"),
					children: Z("取消", "Cancel")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setTab("add"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
						" ",
						Z("添加", "Add")
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: tab,
				onValueChange: setTab,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "view",
					children: error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:165:20:a21bdac037b3f0b366c3a6bce362e28816b0d58498a8bb49bacddd7568eb146b:1",
						role: "alert",
						className: "space-y-2 py-8 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:165:77:a21bdac037b3f0b366c3a6bce362e28816b0d58498a8bb49bacddd7568eb146b:1",
							className: "text-destructive",
							children: Z("任务读取失败", "Tasks could not be loaded")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => void refetch(),
							children: Z("重试", "Retry")
						})]
					}) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:166:13:6c2ed2738767e153b2d25c34a349ac2a810520373a2fef456be6f8719096a90f:1",
						className: "flex justify-center py-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
					}) : tasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:168:13:f98dc6975de5633d501c7ef6164d95c9c07953506c6ac4a495d1b81a584b96ee:1",
						className: "text-center py-8 text-muted-foreground",
						children: Z("没有待处理任务", "No pending tasks")
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:170:13:fc217957b0936f971793d9339d74ac109a1acc1aa32b8677ef382a31b9e9270e:1",
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:171:15:b31f751fac8bede244c376b661da0e1f525e31b5e19d3a2c9f4fac56761b09e7:1",
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:171:42:b31f751fac8bede244c376b661da0e1f525e31b5e19d3a2c9f4fac56761b09e7:0",
								className: "text-xs font-medium text-muted-foreground",
								children: Z(`待处理（${pending.length}）`, `Pending (${pending.length})`)
							}), pending.length > 0 ? pending.map(row) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:171:204:b31f751fac8bede244c376b661da0e1f525e31b5e19d3a2c9f4fac56761b09e7:0",
								className: "text-sm text-muted-foreground",
								children: Z("没有待处理任务", "No pending tasks")
							})]
						}), done.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:173:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:174:19:61ec198df19c4f53fdc05aae97aae1a66c0bd355fe2a8dbc65adbe4c80583849:1",
								className: "text-xs font-medium text-muted-foreground",
								children: Z(`已完成（${done.length}）`, `Completed (${done.length})`)
							}), done.map(row)]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "add",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.title,
									onChange: (e) => setForm((p) => ({
										...p,
										title: e.target.value
									})),
									placeholder: Z("任务名称，例如「陪同看医生」", "Task name, e.g. Take to the doctor")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: form.description,
									onChange: (e) => setForm((p) => ({
										...p,
										description: e.target.value
									})),
									rows: 2,
									placeholder: Z("需要做什么？", "What needs to be done?")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CareTasksCard.tsx:185:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.task_date,
										onChange: (e) => setForm((p) => ({
											...p,
											task_date: e.target.value
										}))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "time",
										value: form.start_time,
										onChange: (e) => setForm((p) => ({
											...p,
											start_time: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.location,
									onChange: (e) => setForm((p) => ({
										...p,
										location: e.target.value
									})),
									placeholder: Z("地点（可留空）", "Place (optional)")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "coral",
									className: "w-full",
									onClick: submit,
									disabled: createTask.isPending || !form.title,
									children: [createTask.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null, Z("添加任务", "Add Task")]
								})
							]
						})
					})
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				open: !!openId,
				onOpenChange: (v) => !v && setOpenId(null),
				title: open.title,
				rows: [
					{
						label: Z("状态", "Status"),
						value: String(open.finish_status) === "b56" ? Z("已完成", "Done") : Z("未完成", "Not done")
					},
					{
						label: Z("说明", "Details"),
						value: open.description
					},
					{
						label: Z("日期", "Date"),
						value: open.task_date ? formatDate(open.task_date) : void 0
					},
					{
						label: Z("时间", "Time"),
						value: open.start_time ? String(open.start_time).slice(0, 5) : void 0
					},
					{
						label: Z("地点", "Place"),
						value: open.location
					},
					{
						label: Z("协助状态", "Help status"),
						value: String(open.help_status) !== "b55" ? open.help_status_label : void 0
					}
				],
				actions: String(open.finish_status) === "b56" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						setStatus(open, "b55");
						setOpenId(null);
					},
					disabled: updateTask.isPending,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5 mr-1" }),
						" ",
						Z("改回未完成", "Mark as not done")
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "coral",
					size: "sm",
					onClick: () => {
						setStatus(open, "b56");
						setOpenId(null);
					},
					disabled: updateTask.isPending,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
						" ",
						Z("标记完成", "Mark as done")
					]
				}),
				onEdit: () => startEdit(open),
				onDelete: () => del.mutate(open.id, {
					onSuccess: () => {
						setOpenId(null);
						toast({ title: Z("任务已删除", "Task deleted") });
					},
					onError: () => toast({
						title: Z("没能删除这个任务", "Couldn't delete that task"),
						variant: "destructive"
					})
				}),
				isDeleting: del.isPending
			})
		]
	});
}
//#endregion
export { CareTasksCard };
