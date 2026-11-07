import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime, d as DialogClose, f as DialogContent, g as DialogTitle, h as DialogPortal, m as DialogOverlay, u as Dialog } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Hn as Bot, Pn as Check, St as MessageSquare, it as Plus, n as X, qt as History, ut as Pencil } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { v as resolveWriteSkill } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as touchAiThread, i as listAiThreads, n as aiBrand, r as createAiThread, t as AICompanionChat } from "./AICompanionChat-TsthtWkF.mjs";
import { t as config_default } from "./config-wade6xrr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AIAssistantContext-D0EXt93v.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ACTIVE_THREAD_KEY = "ai-active-thread";
/**
* The floating assistant — the app's single AI entry point. General chats are
* saved as separate conversations (CCT121, type AI) and managed right here:
* a history list and a new-chat button in the panel header. Task chats
* (check-in, medicine, info cards) stay one-off and unsaved.
*/
function AICompanionChatDialog({ open, onOpenChange, request = {} }) {
	const { i18n } = useTranslation();
	const site = useSite();
	const isZh = i18n.language?.startsWith("zh");
	const threaded = !request.onComplete && !request.starterPrompt && !request.appGuide;
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [activeThread, setActiveThread] = (0, import_react.useState)();
	const [listOpen, setListOpen] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [booted, setBooted] = (0, import_react.useState)(false);
	const refresh = (0, import_react.useCallback)(async () => {
		try {
			const list = await listAiThreads();
			setThreads(list);
			return list;
		} catch {
			return null;
		}
	}, []);
	const pick = (0, import_react.useCallback)((id) => {
		setActiveThread(id);
		setListOpen(false);
		try {
			localStorage.setItem(ACTIVE_THREAD_KEY, id);
		} catch {}
	}, []);
	const newThread = (0, import_react.useCallback)(async () => {
		if (busy) return;
		setBusy(true);
		try {
			const id = await createAiThread();
			await refresh();
			pick(id);
		} catch {} finally {
			setBusy(false);
		}
	}, [
		busy,
		refresh,
		pick
	]);
	(0, import_react.useEffect)(() => {
		if (!open || !threaded) return;
		let alive = true;
		(async () => {
			const list = await refresh();
			if (!alive) return;
			if (list) {
				let saved = null;
				try {
					saved = localStorage.getItem(ACTIVE_THREAD_KEY);
				} catch {}
				if (saved && list.some((t) => t.id === saved)) setActiveThread(saved);
				else if (list[0]) pick(list[0].id);
				else try {
					const id = await createAiThread();
					if (!alive) return;
					await refresh();
					pick(id);
				} catch {}
			}
			if (alive) setBooted(true);
		})();
		return () => {
			alive = false;
		};
	}, [
		open,
		threaded,
		refresh,
		pick
	]);
	const untitled = isZh ? "新对话" : "New conversation";
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)("");
	const saveName = async (id) => {
		const name = draft.trim();
		setEditing(null);
		if (!name) return;
		setThreads((list) => list.map((t) => t.id === id ? {
			...t,
			title: name
		} : t));
		try {
			await touchAiThread(id, name);
			await refresh();
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			"data-inspector-scope": "ai-chat-dialog",
			className: "fixed inset-x-3 top-16 bottom-[4.5rem] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:h-[640px] rounded-2xl z-50 bg-background flex flex-col shadow-2xl overflow-hidden border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:114:11:028afb9cd71bf65fa2a60efb7430a2939fba84dfa9fa1c76e88dd6bf953fe004:1",
					className: "flex items-center justify-between px-4 py-3 border-b",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:115:13:51f24cafefeda8cd9719442a1bea7b0ee6a6312a5b014deb183655adb1ad35d1:1",
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:116:15:003ec940bdd664d582bdfcbc99a909962440362095f56e8fec6b3f5475185d73:1",
							className: "h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-sm font-semibold truncate",
							children: request.title || aiBrand(isZh ? "zh" : "en", site.id)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:123:13:382d694e915e5d2eb7598b2d245b242b93a7b6ffffff80536731febc9cbad4f0:1",
						className: "flex items-center gap-1 shrink-0",
						children: [threaded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:126:19:e05fff7c5dc392cd75f7aba8f0c69bba5b73a321c8356daf9dd2bc7d4f9193af:1",
							type: "button",
							onClick: () => setListOpen((v) => !v),
							className: "flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent text-xs text-muted-foreground",
							"aria-expanded": listOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-4 w-4" }), isZh ? "所有对话" : "All chats"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:135:19:e05fff7c5dc392cd75f7aba8f0c69bba5b73a321c8356daf9dd2bc7d4f9193af:1",
							type: "button",
							onClick: () => void newThread(),
							disabled: busy,
							className: "flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent text-xs text-muted-foreground disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), isZh ? "新建对话" : "New chat"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:147:17:8cebb236826297cff799e410a6fee80f4b145ce23421ae811a090c061d2302f0:1",
								className: "p-1.5 rounded-md hover:bg-accent text-muted-foreground",
								"aria-label": isZh ? "关闭" : "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						})]
					})]
				}),
				threaded && listOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:155:13:bce59999d8e081e0142babcfa0986bb451e5dabbc199d044e8b1dc3f62dd0805:1",
					className: "border-b max-h-44 overflow-y-auto p-2 space-y-1",
					children: [threads.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:157:17:a966a7bf5e77da9bbcc186bd9d7f7acb4c9201aa358455b2505b4116b82c4382:1",
						className: "p-2 text-xs text-muted-foreground",
						children: isZh ? "还没有保存的对话" : "No saved conversations yet"
					}), threads.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:160:17:b769c951546e460f3b91b27eb3ca280297185bcc07a0572b944d08611975ee68:1",
						className: `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${t.id === activeThread ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5 shrink-0" }),
							editing === t.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:166:21:9d02b49668bb7a04e8710917a2fd66f6915aec5803ea1823a08113a84799f59b:1",
								autoFocus: true,
								value: draft,
								onChange: (e) => setDraft(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") saveName(t.id);
									if (e.key === "Escape") setEditing(null);
								},
								className: "flex-1 min-w-0 rounded-sm border bg-background px-1.5 py-0.5 text-sm text-foreground"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:174:21:8f4de97df2090ef73ef3aedc6b6f966fbdd624be13b1c591221098c82e425078:1",
								type: "button",
								onClick: () => pick(t.id),
								className: "flex-1 min-w-0 truncate text-left",
								children: t.title || untitled
							}),
							editing === t.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:179:21:850acc66e9ff9c767b451d10b7c596c1e2e35e451c4a8580b788c08ebdd71af6:1",
								type: "button",
								onClick: () => void saveName(t.id),
								className: "p-1 rounded-sm hover:bg-accent",
								"aria-label": isZh ? "保存名字" : "Save name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-source": "components/ai/AICompanionChatDialog.tsx:183:21:3d3e24387717c61dca8541c311900335f78313cb93c073daada3f7447dab9668:1",
								type: "button",
								onClick: () => {
									setEditing(t.id);
									setDraft(t.title);
								},
								className: "p-1 rounded-sm hover:bg-accent text-muted-foreground",
								"aria-label": isZh ? "改名" : "Rename",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
							})
						]
					}, t.id))]
				}),
				(!threaded || booted) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AICompanionChat, {
					active: open,
					request,
					threadId: threaded ? activeThread : void 0,
					onThreadUpdated: () => void refresh()
				}, threaded ? activeThread ?? "unsaved" : request.id)
			]
		})] })
	});
}
var ctxStore = globalThis;
var AIAssistantContext = ctxStore.__aiAssistantContext ??= (0, import_react.createContext)(null);
function AIAssistantProvider({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [request, setRequest] = (0, import_react.useState)({});
	const openAssistant = (0, import_react.useCallback)((next = {}) => {
		setRequest({
			...next,
			id: next.id || `general-${Date.now()}`
		});
		setOpen(true);
	}, []);
	const closeAssistant = (0, import_react.useCallback)(() => setOpen(false), []);
	const qc = useQueryClient();
	const { toast } = useToast();
	const openWriteAssistant = (0, import_react.useCallback)(({ skill, target, id, contextScope, onWritten }) => {
		const spec = resolveWriteSkill(skill, target, { isChinese: (config_default.language || "").startsWith("zh") });
		openAssistant({
			id: id || `${skill}-${target.recordId || target.caredOneId || "new"}`,
			title: spec.title,
			contextPrompt: spec.contextPrompt,
			contextScope: contextScope || (target.caredOneId ? { caredOneId: target.caredOneId } : void 0),
			starterPrompt: spec.starterPrompt,
			starterFallback: spec.starterFallback,
			completionStatuses: spec.statuses,
			onComplete: async (result) => {
				await spec.write(result);
				spec.invalidateKeys.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
				toast({ title: spec.toastFor(result.status) });
				onWritten?.(result);
			}
		});
	}, [
		openAssistant,
		qc,
		toast
	]);
	const value = (0, import_react.useMemo)(() => ({
		openAssistant,
		openWriteAssistant,
		closeAssistant
	}), [
		openAssistant,
		openWriteAssistant,
		closeAssistant
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AIAssistantContext.Provider, {
		value,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AICompanionChatDialog, {
			open,
			onOpenChange: setOpen,
			request
		})]
	});
}
function useAIAssistant() {
	const value = (0, import_react.useContext)(AIAssistantContext);
	if (!value) throw new Error("useAIAssistant must be used within AIAssistantProvider");
	return value;
}
//#endregion
export { useAIAssistant as n, AIAssistantProvider as t };
