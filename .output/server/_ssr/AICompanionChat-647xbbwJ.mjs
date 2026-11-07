import { s as __toESM } from "../_runtime.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { o as isInAppScope, t as appScopeBody } from "./app-scope-Cq6C10CZ.mjs";
import { $n as ArrowDown, E as Square, Nn as ChevronDown, P as SkipForward, Pn as Check, St as MessageSquare, a as Volume2, jt as LoaderCircle, lt as PhoneCall, mn as CornerDownLeft, n as X, nt as Radio, xt as Mic } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { g as resolveAssistantContext } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { a as playBase64Mp3, i as onFamilyVoicesChanged, r as loadSavedFamilyVoices, s as savedVoiceAudio } from "./family-voices-LNsGCNMy.mjs";
import { n as FAMILY_VOICE_STATE } from "./schema-C7za4mA0.mjs";
import { a as streamChatTextOnly, c as trimMessagesToCharLimit, i as speakTextStreaming, o as streamChatWithVoice, r as parseAIJson, s as transcribeAudio, t as VoiceRecorder } from "./ai-CfmTn5iV.mjs";
import { n as MessageContent, r as MessageResponse, t as Message } from "./message-CMaqMwb8.mjs";
import { n as useStickToBottomContext, t as StickToBottom } from "../_libs/use-stick-to-bottom.mjs";
import { t as nanoid } from "../_libs/nanoid.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AICompanionChat-647xbbwJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PERSONAS = {
	challenged: {
		zh: "AI助手小忆",
		en: "ChallengeD AI Assistant",
		roleZh: "你主要帮助用户照护失智症家人，或帮助失智症本人。",
		roleEn: "You mainly help the user care for a person with dementia, or help the person with dementia directly."
	},
	"challenged-v1": {
		zh: "AI助手小忆",
		en: "ChallengeD AI Assistant",
		roleZh: "你主要帮助用户照护失智症家人，或帮助失智症本人。",
		roleEn: "You mainly help the user care for a person with dementia, or help the person with dementia directly."
	},
	carecnc: {
		zh: "护畅AI助手",
		en: "CareCNC AI Assistant",
		roleZh: "你主要帮助用户照护被护理的家人。",
		roleEn: "You mainly help the user care for their cared ones."
	},
	notchsafety: {
		zh: "诺驰安全AI助手",
		en: "Notch Safety AI Assistant",
		roleZh: "你主要帮助用户和家人处理位置与安全问题。",
		roleEn: "You mainly help the user and their cared ones with location safety."
	}
};
function isZhLang(language) {
	return String(language || "auto").toLowerCase().startsWith("zh");
}
function persona(site) {
	return PERSONAS[site] || PERSONAS.challenged;
}
/** The assistant's display name for a language + sub-app. */
function aiBrand(language, site) {
	const p = persona(site);
	return isZhLang(language) ? p.zh : p.en;
}
function aiGreeting(isChinese, site) {
	const p = persona(site);
	return isChinese ? `你好，我是${p.zh}。想聊什么都可以。` : `Hi, I'm ${p.en}. Ask me anything, or just chat.`;
}
/**
* Saved AI assistant threads.
* Thread = CCT121 row (type AI, app-scoped). Owner = REL137 (conversation → user).
* Messages = CCT126 rows linked by REL138 (conversation → message).
* One-off AI uses (info cards, check-in, briefings) never come through here.
*/
var CONV = T.chatConversation.slug;
var CF = T.chatConversation.f;
var CT = T.chatConversation.opt.CHAT_TYPE;
var MSG = T.chatMessage.slug;
var MF = T.chatMessage.f;
var MT = T.chatMessage.opt.CHAT_MESSAGE_TYPE;
var REL_MEMBER = R.conversationMembers;
var REL_MESSAGE = R.conversationMessages;
var now = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
var rowId = (r) => String(r?.item_id ?? r?._ID ?? r?.id ?? "");
function me() {
	const id = Number(getStoredWPUser()?.user_id);
	if (!id) throw new Error("Not signed in");
	return id;
}
async function listAiThreads() {
	const rels = await wordpressFetch(`jet-rel/${REL_MEMBER}/parents/${me()}`);
	if (!Array.isArray(rels)) throw new Error("Could not load conversations");
	const ids = [...new Set(rels.map((r) => String(r.parent_object_id)).filter(Boolean))];
	return (await Promise.all(ids.map((id) => wordpressCCTFetch(CONV, { id }).catch(() => null)))).filter((c) => c && c[CF.CHAT_TYPE] === CT.AI && isInAppScope("chatConversation", c)).map((c) => ({
		id: rowId(c),
		title: c[CF.CHAT_NAME] || "",
		updatedAt: c[CF.LAST_MESSAGE_AT] || c.cct_modified || ""
	})).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
async function createAiThread(title = "") {
	const id = rowId(await wordpressCCTFetch(CONV, {
		method: "POST",
		body: {
			[CF.CHAT_TYPE]: CT.AI,
			[CF.CHAT_NAME]: title,
			[CF.LAST_MESSAGE_AT]: now(),
			...appScopeBody("chatConversation")
		}
	}));
	if (!id) throw new Error("Could not create conversation");
	await wordpressFetch(`jet-rel/${REL_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: Number(id),
			child_id: me(),
			context: "child",
			store_items_type: "update",
			meta: { [T_JOINED]: now() }
		}
	});
	return id;
}
var T_JOINED = "a55";
async function loadAiThreadMessages(id) {
	const rels = await wordpressFetch(`jet-rel/${REL_MESSAGE}/children/${Number(id)}`);
	if (!Array.isArray(rels) || rels.length === 0) return [];
	return (await Promise.all(rels.map((r) => wordpressCCTFetch(MSG, { id: String(r.child_object_id) }).catch(() => null)))).filter(Boolean).sort((a, b) => Number(rowId(a)) - Number(rowId(b))).map((m) => ({
		role: m[MF.CHAT_MESSAGE_TYPE] === MT.AI ? "assistant" : "user",
		content: m[MF.CHAT_MESSAGE_CONTENT] || ""
	}));
}
async function appendAiMessage(threadId, role, content) {
	const res = await wordpressCCTFetch(MSG, {
		method: "POST",
		body: {
			[MF.CHAT_MESSAGE_CONTENT]: content,
			[MF.CHAT_MESSAGE_TYPE]: role === "assistant" ? MT.AI : MT.TEXT
		}
	});
	const mid = Number(rowId(res));
	if (!mid) throw new Error("Message not saved");
	await wordpressFetch(`jet-rel/${REL_MESSAGE}`, {
		method: "POST",
		body: {
			parent_id: Number(threadId),
			child_id: mid,
			context: "child",
			store_items_type: "update"
		}
	});
}
async function touchAiThread(threadId, title) {
	await wordpressCCTFetch(CONV, {
		id: threadId,
		method: "PUT",
		body: {
			[CF.LAST_MESSAGE_AT]: now(),
			...title ? { [CF.CHAT_NAME]: title } : {}
		}
	});
}
var Conversation = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickToBottom, {
	className: cn("relative flex-1 overflow-y-hidden", className),
	initial: "smooth",
	resize: "smooth",
	role: "log",
	...props
});
var ConversationContent = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickToBottom.Content, {
	className: cn("flex flex-col gap-8 p-4", className),
	...props
});
var ConversationScrollButton = ({ className, ...props }) => {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();
	const handleScrollToBottom = (0, import_react.useCallback)(() => {
		scrollToBottom();
	}, [scrollToBottom]);
	return !isAtBottom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted", className),
		onClick: handleScrollToBottom,
		size: "icon",
		type: "button",
		variant: "outline",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
	});
};
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "components/ui/input-group.tsx:13:5:87864ea657de9b8df04eee17f170dc074229b35a52d6b8e6ccf42a09e690dd2b:1",
		"data-slot": "input-group",
		role: "group",
		className: cn("group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-hidden transition-[color,box-shadow]", "h-9 has-[>textarea]:h-auto", "has-[>[data-align=inline-start]]:[&>input]:pl-2", "has-[>[data-align=inline-end]]:[&>input]:pr-2", "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3", "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3", "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1", "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40", className),
		...props
	});
}
var inputGroupAddonVariants = cva("text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
		"inline-end": "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
		"block-start": "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
		"block-end": "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5"
	} },
	defaultVariants: { align: "inline-start" }
});
function InputGroupAddon({ className, align = "inline-start", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "components/ui/input-group.tsx:66:5:87864ea657de9b8df04eee17f170dc074229b35a52d6b8e6ccf42a09e690dd2b:1",
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": align,
		className: cn(inputGroupAddonVariants({ align }), className),
		onClick: (e) => {
			if (e.target.closest("button")) return;
			e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...props
	});
}
var inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type,
		"data-size": size,
		variant,
		className: cn(inputGroupButtonVariants({ size }), className),
		...props
	});
}
function InputGroupTextarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
		"data-slot": "input-group-control",
		className: cn("flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent", className),
		...props
	});
}
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
var convertBlobUrlToDataUrl = async (url) => {
	try {
		const blob = await (await fetch(url)).blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
};
var PromptInputController = (0, import_react.createContext)(null);
var ProviderAttachmentsContext = (0, import_react.createContext)(null);
var useOptionalPromptInputController = () => (0, import_react.useContext)(PromptInputController);
var useOptionalProviderAttachments = () => (0, import_react.useContext)(ProviderAttachmentsContext);
var LocalAttachmentsContext = (0, import_react.createContext)(null);
var usePromptInputAttachments = () => {
	const provider = useOptionalProviderAttachments();
	const context = (0, import_react.useContext)(LocalAttachmentsContext) ?? provider;
	if (!context) throw new Error("usePromptInputAttachments must be used within a PromptInput or PromptInputProvider");
	return context;
};
var LocalReferencedSourcesContext = (0, import_react.createContext)(null);
var PromptInput = ({ className, accept, multiple, globalDrop, syncHiddenInput, maxFiles, maxFileSize, onError, onSubmit, children, ...props }) => {
	const controller = useOptionalPromptInputController();
	const usingProvider = !!controller;
	const inputRef = (0, import_react.useRef)(null);
	const formRef = (0, import_react.useRef)(null);
	const [items, setItems] = (0, import_react.useState)([]);
	const files = usingProvider ? controller.attachments.files : items;
	const [referencedSources, setReferencedSources] = (0, import_react.useState)([]);
	const filesRef = (0, import_react.useRef)(files);
	(0, import_react.useEffect)(() => {
		filesRef.current = files;
	}, [files]);
	const openFileDialogLocal = (0, import_react.useCallback)(() => {
		inputRef.current?.click();
	}, []);
	const matchesAccept = (0, import_react.useCallback)((f) => {
		if (!accept || accept.trim() === "") return true;
		return accept.split(",").map((s) => s.trim()).filter(Boolean).some((pattern) => {
			if (pattern.endsWith("/*")) {
				const prefix = pattern.slice(0, -1);
				return f.type.startsWith(prefix);
			}
			return f.type === pattern;
		});
	}, [accept]);
	const addLocal = (0, import_react.useCallback)((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		setItems((prev) => {
			const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - prev.length) : void 0;
			const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
			if (typeof capacity === "number" && sized.length > capacity) onError?.({
				code: "max_files",
				message: "Too many files. Some were not added."
			});
			const next = [];
			for (const file of capped) next.push({
				filename: file.name,
				id: nanoid(),
				mediaType: file.type,
				type: "file",
				url: URL.createObjectURL(file)
			});
			return [...prev, ...next];
		});
	}, [
		matchesAccept,
		maxFiles,
		maxFileSize,
		onError
	]);
	const removeLocal = (0, import_react.useCallback)((id) => setItems((prev) => {
		const found = prev.find((file) => file.id === id);
		if (found?.url) URL.revokeObjectURL(found.url);
		return prev.filter((file) => file.id !== id);
	}), []);
	const addWithProviderValidation = (0, import_react.useCallback)((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		const currentCount = files.length;
		const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : void 0;
		const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
		if (typeof capacity === "number" && sized.length > capacity) onError?.({
			code: "max_files",
			message: "Too many files. Some were not added."
		});
		if (capped.length > 0) controller?.attachments.add(capped);
	}, [
		matchesAccept,
		maxFileSize,
		maxFiles,
		onError,
		files.length,
		controller
	]);
	const clearAttachments = (0, import_react.useCallback)(() => usingProvider ? controller?.attachments.clear() : setItems((prev) => {
		for (const file of prev) if (file.url) URL.revokeObjectURL(file.url);
		return [];
	}), [usingProvider, controller]);
	const clearReferencedSources = (0, import_react.useCallback)(() => setReferencedSources([]), []);
	const add = usingProvider ? addWithProviderValidation : addLocal;
	const remove = usingProvider ? controller.attachments.remove : removeLocal;
	const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;
	const clear = (0, import_react.useCallback)(() => {
		clearAttachments();
		clearReferencedSources();
	}, [clearAttachments, clearReferencedSources]);
	(0, import_react.useEffect)(() => {
		if (!usingProvider) return;
		controller.__registerFileInput(inputRef, () => inputRef.current?.click());
	}, [usingProvider, controller]);
	(0, import_react.useEffect)(() => {
		if (syncHiddenInput && inputRef.current && files.length === 0) inputRef.current.value = "";
	}, [files, syncHiddenInput]);
	(0, import_react.useEffect)(() => {
		const form = formRef.current;
		if (!form) return;
		if (globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		form.addEventListener("dragover", onDragOver);
		form.addEventListener("drop", onDrop);
		return () => {
			form.removeEventListener("dragover", onDragOver);
			form.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	(0, import_react.useEffect)(() => {
		if (!globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	(0, import_react.useEffect)(() => () => {
		if (!usingProvider) {
			for (const f of filesRef.current) if (f.url) URL.revokeObjectURL(f.url);
		}
	}, [usingProvider]);
	const handleChange = (0, import_react.useCallback)((event) => {
		if (event.currentTarget.files) add(event.currentTarget.files);
		event.currentTarget.value = "";
	}, [add]);
	const attachmentsCtx = (0, import_react.useMemo)(() => ({
		add,
		clear: clearAttachments,
		fileInputRef: inputRef,
		files: files.map((item) => ({
			...item,
			id: item.id
		})),
		openFileDialog,
		remove
	}), [
		files,
		add,
		remove,
		clearAttachments,
		openFileDialog
	]);
	const refsCtx = (0, import_react.useMemo)(() => ({
		add: (incoming) => {
			const array = Array.isArray(incoming) ? incoming : [incoming];
			setReferencedSources((prev) => [...prev, ...array.map((s) => ({
				...s,
				id: nanoid()
			}))]);
		},
		clear: clearReferencedSources,
		remove: (id) => {
			setReferencedSources((prev) => prev.filter((s) => s.id !== id));
		},
		sources: referencedSources
	}), [referencedSources, clearReferencedSources]);
	const handleSubmit = (0, import_react.useCallback)(async (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const text = usingProvider ? controller.textInput.value : (() => {
			return new FormData(form).get("message") || "";
		})();
		if (!usingProvider) form.reset();
		try {
			const result = onSubmit({
				files: await Promise.all(files.map(async ({ id: _id, ...item }) => {
					if (item.url?.startsWith("blob:")) {
						const dataUrl = await convertBlobUrlToDataUrl(item.url);
						return {
							...item,
							url: dataUrl ?? item.url
						};
					}
					return item;
				})),
				text
			}, event);
			if (result instanceof Promise) try {
				await result;
				clear();
				if (usingProvider) controller.textInput.clear();
			} catch {}
			else {
				clear();
				if (usingProvider) controller.textInput.clear();
			}
		} catch {}
	}, [
		usingProvider,
		controller,
		files,
		onSubmit,
		clear
	]);
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		"data-inspector-source": "components/ai-elements/prompt-input.tsx:908:7:45d120ecc57c929d22196f6f1415f1d19eda1bb92081cf8489845578b143cd2b:1",
		accept,
		"aria-label": "Upload files",
		className: "hidden",
		multiple,
		onChange: handleChange,
		ref: inputRef,
		title: "Upload files",
		type: "file"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		"data-inspector-source": "components/ai-elements/prompt-input.tsx:918:7:68d7c877078fdaf1a9fe01a800a995597edc07ca4003ae73f5ca54db8da96987:1",
		className: cn("w-full", className),
		onSubmit: handleSubmit,
		ref: formRef,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroup, {
			className: "overflow-hidden",
			children
		})
	})] });
	const withReferencedSources = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalReferencedSourcesContext.Provider, {
		value: refsCtx,
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalAttachmentsContext.Provider, {
		value: attachmentsCtx,
		children: withReferencedSources
	});
};
var PromptInputBody = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-inspector-source": "components/ai-elements/prompt-input.tsx:949:3:2e25de72fe6a4a56715c6e479c701b2c07b0971dc9879c2a0ad4e20e76cd52f1:1",
	className: cn("contents", className),
	...props
});
var PromptInputTextarea = ({ onChange, onKeyDown, className, placeholder = "What would you like to know?", ...props }) => {
	const controller = useOptionalPromptInputController();
	const attachments = usePromptInputAttachments();
	const [isComposing, setIsComposing] = (0, import_react.useState)(false);
	const handleKeyDown = (0, import_react.useCallback)((e) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key === "Enter") {
			if (isComposing || e.nativeEvent.isComposing) return;
			if (e.shiftKey) return;
			e.preventDefault();
			const { form } = e.currentTarget;
			if ((form?.querySelector("button[type=\"submit\"]"))?.disabled) return;
			form?.requestSubmit();
		}
		if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
			e.preventDefault();
			const lastAttachment = attachments.files.at(-1);
			if (lastAttachment) attachments.remove(lastAttachment.id);
		}
	}, [
		onKeyDown,
		isComposing,
		attachments
	]);
	const handlePaste = (0, import_react.useCallback)((event) => {
		const items = event.clipboardData?.items;
		if (!items) return;
		const files = [];
		for (const item of items) if (item.kind === "file") {
			const file = item.getAsFile();
			if (file) files.push(file);
		}
		if (files.length > 0) {
			event.preventDefault();
			attachments.add(files);
		}
	}, [attachments]);
	const handleCompositionEnd = (0, import_react.useCallback)(() => setIsComposing(false), []);
	const handleCompositionStart = (0, import_react.useCallback)(() => setIsComposing(true), []);
	const controlledProps = controller ? {
		onChange: (e) => {
			controller.textInput.setInput(e.currentTarget.value);
			onChange?.(e);
		},
		value: controller.textInput.value
	} : { onChange };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupTextarea, {
		className: cn("field-sizing-content max-h-48 min-h-16", className),
		name: "message",
		onCompositionEnd: handleCompositionEnd,
		onCompositionStart: handleCompositionStart,
		onKeyDown: handleKeyDown,
		onPaste: handlePaste,
		placeholder,
		...props,
		...controlledProps
	});
};
var PromptInputFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
	align: "block-end",
	className: cn("justify-between gap-1", className),
	...props
});
var PromptInputSubmit = ({ className, variant = "default", size = "icon-sm", status, onStop, onClick, children, ...props }) => {
	const isGenerating = status === "submitted" || status === "streaming";
	let Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownLeft, { className: "size-4" });
	if (status === "submitted") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {});
	else if (status === "streaming") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" });
	else if (status === "error") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" });
	const handleClick = (0, import_react.useCallback)((e) => {
		if (isGenerating && onStop) {
			e.preventDefault();
			onStop();
			return;
		}
		onClick?.(e);
	}, [
		isGenerating,
		onStop,
		onClick
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupButton, {
		"aria-label": isGenerating ? "Stop" : "Submit",
		className: cn(className),
		onClick: handleClick,
		size,
		type: isGenerating && onStop ? "button" : "submit",
		variant,
		...props,
		children: children ?? Icon
	});
};
var motionComponentCache = /* @__PURE__ */ new Map();
var getMotionComponent = (element) => {
	let component = motionComponentCache.get(element);
	if (!component) {
		component = motion.create(element);
		motionComponentCache.set(element, component);
	}
	return component;
};
var ShimmerComponent = ({ children, as: Component = "p", className, duration = 2, spread = 2 }) => {
	const MotionComponent = getMotionComponent(Component);
	const dynamicSpread = (0, import_react.useMemo)(() => (children?.length ?? 0) * spread, [children, spread]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionComponent, {
		animate: { backgroundPosition: "0% center" },
		className: cn("relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent", "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]", className),
		initial: { backgroundPosition: "100% center" },
		style: {
			"--spread": `${dynamicSpread}px`,
			backgroundImage: "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))"
		},
		transition: {
			duration,
			ease: "linear",
			repeat: Number.POSITIVE_INFINITY
		},
		children
	});
};
var Shimmer = (0, import_react.memo)(ShimmerComponent);
var GUIDE_SHARED = [
	{
		q: {
			zh: "怎么给家人或护理者发消息？",
			en: "How do I message my family or caregiver?"
		},
		a: {
			zh: "1. 点底部的“收件箱”。\n2. 上方选“消息”。\n3. 点开一个人的名字，在下面输入框打字，按发送。\n如果还没有人，先在“圈子/护理群组”里把家人加进来，或在“寻找”里联系一位护理者。",
			en: "1. Tap Inbox in the bottom bar.\n2. Choose Messages at the top.\n3. Tap a person's name, type in the box at the bottom and send.\nNo one there yet? Add family in your care circle first, or contact a caregiver from Find."
		}
	},
	{
		q: {
			zh: "提醒和通知在哪里看？",
			en: "Where do I see reminders and alerts?"
		},
		a: {
			zh: "所有提醒、预约变化和安全提醒都在底部的“收件箱”里。上方选“通知”只看提醒；点一条就会跳到相关的页面。红色数字表示还没读的条数。",
			en: "Every reminder, booking update and safety alert lands in Inbox. Pick Notifications at the top to see only alerts; tap one and it opens the right page. The red number is how many you haven't read."
		}
	},
	{
		q: {
			zh: "怎么切换中文或英文？",
			en: "How do I change the language?"
		},
		a: {
			zh: "点右上角的头像 → 设置 → 语言，选“中文”或“English”，马上生效。",
			en: "Tap your avatar at the top right → Settings → Language, then pick English or 中文. It changes right away."
		}
	},
	{
		q: {
			zh: "怎么放大字？",
			en: "How do I make the text bigger?"
		},
		a: {
			zh: "可以在“设置”里调整字的大小，也可以使用手机系统里的“显示与字体大小”设置。",
			en: "You can adjust text size in Settings or use your phone's display and text-size settings."
		}
	},
	{
		q: {
			zh: "我的资料和账号在哪里改？",
			en: "Where do I edit my profile and account?"
		},
		a: {
			zh: "点右上角头像 → 设置。里面可以改姓名、联系方式、所在城市、通知方式和隐私选项，改完记得点保存。",
			en: "Tap your avatar → Settings. There you can change your name, contact details, city, notification choices and privacy options. Remember to save."
		}
	},
	{
		q: {
			zh: "AI 助手能帮我做什么？",
			en: "What can the AI assistant do?"
		},
		a: {
			zh: "点右下角的机器人按钮，可以直接问照护上的问题、让它帮你记用药、记签到，或总结今天的情况。它不给医疗和用药诊断建议，紧急情况请打急救电话。",
			en: "Tap the robot button at the bottom right. You can ask care questions, have it log a medicine dose or a check-in for you, or summarise the day. It never gives medical or financial advice — in an emergency, call emergency services."
		}
	},
	{
		q: {
			zh: "回复可以读出来吗？",
			en: "Can the answers be read aloud?"
		},
		a: {
			zh: "可以。打开下面的“自动朗读回复”开关，之后每条回复都会读出来；也可以点某条回复下面的“朗读”单独听。",
			en: "Yes. Turn on “Read replies aloud” below and every reply is spoken; or tap Listen under any single reply."
		}
	}
];
var GUIDE_BY_FAMILY = {
	challenged: [
		{
			q: {
				zh: "怎么建立护理群组，把家人加进来？",
				en: "How do I set up a care team and add family?"
			},
			a: {
				zh: "1. 底部点“护理群组”。\n2. 点“新建群组”，写个名字（比如“妈妈的照护”）。\n3. 在成员里点“邀请”，输入对方姓名或邮箱。\n对方在自己的收件箱里点“接受”后就进来了。",
				en: "1. Tap Care Teams in the bottom bar.\n2. Tap New team and give it a name (e.g. “Mum's care”).\n3. In Members, tap Invite and enter their name or email.\nThey accept from their own Inbox and then they're in."
			}
		},
		{
			q: {
				zh: "怎么添加我照顾的人？",
				en: "How do I add the person I care for?"
			},
			a: {
				zh: "在“护理群组”里选“我照顾的人”，点“添加”，填姓名、年龄和病情阶段（早期/中期/晚期）。填好后，用药、签到、日常安排和照护须知都会按这个人来记录。",
				en: "In Care Teams, open the people you care for, tap Add, and fill in their name, age and stage (early / middle / late). After that, medicines, check-ins, routines and the care sheet are all kept under that person."
			}
		},
		{
			q: {
				zh: "怎么记录吃药和每天签到？",
				en: "How do I log medicines and daily check-ins?"
			},
			a: {
				zh: "在被照顾者的页面上有“用药”和“签到”两张卡。点“已服用”就记下这一次；点卡上的助手按钮，也可以用说话的方式让 AI 帮你记。",
				en: "On the cared-for person's page there are Medicines and Check-in cards. Tap Taken to log a dose; or tap the assistant button on the card and just tell the AI, and it records it for you."
			}
		},
		{
			q: {
				zh: "怎么找并预约一位护理者？",
				en: "How do I find and book a caregiver?"
			},
			a: {
				zh: "1. 底部点“寻找” → 找护理者。\n2. 用城市、服务类型和价格筛选。\n3. 点开一位护理者看评价，点“预约”。\n4. 选日期、时长，提交。对方确认后，你会在收件箱收到通知。",
				en: "1. Tap Find → Hire Caregivers.\n2. Filter by city, service type and price.\n3. Open a caregiver, read the reviews, tap Book.\n4. Pick a date and length and submit. When they confirm, you get a notice in Inbox."
			}
		},
		{
			q: {
				zh: "怎么知道家人走出安全范围？",
				en: "How do I know if my family member leaves a safe area?"
			},
			a: {
				zh: "底部点“定位”。地图上能看到当前位置；切到“地点”可以画出安全范围（家、小区、医院）。他离开或回到范围时，你会收到提醒。需要对方在自己手机上打开位置共享。",
				en: "Tap the locator tab. The map shows where they are; switch to Places to draw safe areas (home, the block, the clinic). You get an alert when they leave or come back. They need location sharing switched on their own phone."
			}
		},
		{
			q: {
				zh: "任务、日历和预约有什么区别？",
				en: "What's the difference between tasks, calendar and bookings?"
			},
			a: {
				zh: "“任务”是家里人互相分工的事情（买菜、陪诊）；“日历”是所有安排的总览；“预约”是你花钱请护理者上门的服务记录。",
				en: "Tasks are jobs your family shares between each other (shopping, hospital trips). Calendar shows everything on one timeline. Bookings are the paid visits you arranged with a caregiver."
			}
		},
		{
			q: {
				zh: "照护须知是什么，怎么用？",
				en: "What is the care sheet for?"
			},
			a: {
				zh: "照护须知是一页写清楚这个人怎么照顾的说明：习惯、忌口、常用药、紧急联系人。临时请人帮忙时，把这一页给他看就够了；页面上还能直接问 AI 上面的内容。",
				en: "The care sheet is one page that says how this person should be looked after: habits, foods to avoid, medicines, emergency contacts. Hand it to anyone standing in for you — and you can ask the AI questions about what's on it right there."
			}
		},
		{
			q: {
				zh: "在哪里看照护知识文章？",
				en: "Where can I read care articles?"
			},
			a: {
				zh: "底部“工具”里有“资源与帮助”，按主题分成护理篇、安全篇、应对篇、认知篇和陪伴篇；“社区”里可以看别人的经验和提问。",
				en: "Open More → Resources & Help; articles are grouped by topic (care, safety, coping, understanding, companionship). Community is where other families share and ask."
			}
		}
	],
	carecnc: [
		{
			q: {
				zh: "怎么找到合适的护理者？",
				en: "How do I find the right caregiver?"
			},
			a: {
				zh: "1. 底部点“寻找”。\n2. 输入城市，选服务类型和时间。\n3. 按评分和价格看，点开看资历和评价。\n觉得合适可以先发消息问清楚再预约。",
				en: "1. Tap Find.\n2. Enter your city and choose service type and timing.\n3. Compare by rating and price, open a profile for experience and reviews.\nYou can message them first, then book."
			}
		},
		{
			q: {
				zh: "怎么下单预约上门服务？",
				en: "How do I book a visit?"
			},
			a: {
				zh: "在护理者页面点“预约”，选日期、开始时间和时长，写清楚要做什么，提交。对方确认后你会收到通知，完成后可以给评价。",
				en: "On a caregiver's page tap Book, pick the date, start time and length, say what's needed and submit. You'll be notified when they confirm, and you can review them once it's done."
			}
		},
		{
			q: {
				zh: "可以取消或退款吗？",
				en: "Can I cancel or get a refund?"
			},
			a: {
				zh: "打开“预约”，找到那一条，点“取消”或“申请退款”，写一句原因。护理者和平台处理后，结果会发到你的收件箱。",
				en: "Open Bookings, find the visit, tap Cancel or Request refund and add a short reason. The outcome arrives in your Inbox once it's handled."
			}
		},
		{
			q: {
				zh: "怎么收藏我喜欢的护理者？",
				en: "How do I save a caregiver I like?"
			},
			a: {
				zh: "在护理者卡片或页面上点心形图标，之后从头像菜单里的“收藏的护理者”就能直接找到他。",
				en: "Tap the heart on a caregiver's card or page. Find them again any time under Saved caregivers in your account menu."
			}
		},
		{
			q: {
				zh: "我自己想接单，怎么成为护理者？",
				en: "How do I sign up as a caregiver?"
			},
			a: {
				zh: "底部“工具” → 成为护理者，填服务项目、服务区域、价格和可预约时间，提交等审核。通过后用“护理者设置”管理请求、排班和收入。",
				en: "More → Become Caregiver: list your services, area, rates and availability, then submit for review. Once approved, use Caregiver Settings to handle requests, your schedule and earnings."
			}
		},
		{
			q: {
				zh: "怎么找需要帮手的活？",
				en: "Where do I find work?"
			},
			a: {
				zh: "底部“工具” → “需要帮手的任务”，可以看家庭发布的需求并报名；被选中后会在收件箱通知你。",
				en: "More → Tasks Needing Help shows what families have posted; apply there and you'll hear back in your Inbox."
			}
		},
		{
			q: {
				zh: "怎么提交一家养老机构？",
				en: "How do I submit a care facility?"
			},
			a: {
				zh: "在“寻找”里切到“养老机构”，点“提交机构”，填名称、地址、联系方式和服务。提交后需要我们审核，通过后才会出现在搜索里。",
				en: "In Find, switch to Facilities and tap Submit a facility. Fill in the name, address, contact and services. We review it first — it appears in search once approved."
			}
		}
	],
	notchsafety: [
		{
			q: {
				zh: "怎么看到家人现在在哪里？",
				en: "How do I see where my family is right now?"
			},
			a: {
				zh: "打开“地图”，头像就是每个人的位置，下面的名单里写着地址和更新时间。看不到某个人，说明他还没在自己手机上打开位置共享。",
				en: "Open Map — each avatar is a person, and the list below shows their address and when it updated. If someone is missing, they haven't turned on location sharing on their own phone yet."
			}
		},
		{
			q: {
				zh: "怎么把家人加进圈子？",
				en: "How do I add someone to my circle?"
			},
			a: {
				zh: "点底部“圈子”，点“邀请”，输入对方姓名或邮箱。对方在自己的收件箱里接受后，就会出现在地图上。",
				en: "Tap Circle, then Invite, and enter their name or email. Once they accept from their Inbox, they show up on the map."
			}
		},
		{
			q: {
				zh: "怎么设置一个地点提醒（到家/离开）？",
				en: "How do I get alerts when someone arrives or leaves?"
			},
			a: {
				zh: "点“地点” → 添加地点，在地图上选位置、拉大小、起个名字（家、学校、公司），打开到达和离开提醒。之后有人进出，你会在收件箱收到提醒。",
				en: "Tap Places → Add place, drop it on the map, size the circle and name it (Home, School, Work), then switch on arrive and leave alerts. You'll be notified in Inbox each time."
			}
		},
		{
			q: {
				zh: "SOS 按钮是做什么的？",
				en: "What does the SOS button do?"
			},
			a: {
				zh: "地图上的红色 SOS 按钮一按，就把你现在的位置和求助信息发给圈子里的所有人。误按了可以马上取消。它不会自动打给警察或救护车，紧急情况请另外打电话。",
				en: "One press on the red SOS button on the map sends your current location and a help message to everyone in your circle. Pressed by mistake? Cancel right away. It does not call the police or an ambulance — do that separately in a real emergency."
			}
		},
		{
			q: {
				zh: "能看到走过的路线和手机电量吗？",
				en: "Can I see their route and phone battery?"
			},
			a: {
				zh: "可以。在“地图”下面点开一个人，就能看到最近的位置记录、电量、是否在充电和移动方式（走路/开车）。这些要他手机允许后台定位才会持续更新。",
				en: "Yes. Open a person from the list under Map to see recent location points, battery, whether it's charging, and how they're moving (walking/driving). It keeps updating only if their phone allows background location."
			}
		},
		{
			q: {
				zh: "为什么某个人的位置一直是旧的？",
				en: "Why is someone's location out of date?"
			},
			a: {
				zh: "常见原因：他关了位置共享、手机没电、没网络，或系统限制了后台定位。请他打开应用、允许“始终”定位，并关掉省电模式。",
				en: "Usual reasons: they turned sharing off, the phone is dead or offline, or the system blocked background location. Ask them to open the app, allow location “always”, and switch off battery saver."
			}
		},
		{
			q: {
				zh: "我不想被看到位置怎么办？",
				en: "How do I stop sharing my own location?"
			},
			a: {
				zh: "去“我的”里关掉位置共享，圈子里的人就看不到你的实时位置了；随时可以再打开。",
				en: "Open your own tab and switch location sharing off — your circle stops seeing your live position. Turn it back on whenever you like."
			}
		}
	]
};
function guideEntries(family) {
	return [...GUIDE_BY_FAMILY[family === "carecnc" || family === "notchsafety" ? family : "challenged"], ...GUIDE_SHARED];
}
/** Reply mode: text only / read aloud / live back-and-forth talk. Remembered. */
var READ_ALOUD_KEY = "ai-read-aloud";
var MODE_KEY = "ai-reply-mode";
/** Simulated family call setup (who to play + what to say). Saved in this browser. */
var CALL_KEY = "ai-family-call";
/**
* Live mode instruction. Kept here (not in the shared persona prompt) so the
* few extra words are only paid for while the user is actually talking.
*/
var LIVE_STYLE = {
	zh: "现在是即时语音对话：每次只回 1–2 句短话，像面对面聊天一样自然，不要列清单、不要长段落。对方情绪不好、怀疑东西被偷或想出门时，先安抚，再自然地把话题引到轻松的事情上（老照片、以前的工作、爱吃的饭菜、天气），陪着聊下去。",
	en: "This is a live spoken conversation: reply with 1–2 short sentences at a time, like talking face to face — no lists, no long paragraphs. If they are upset, believe something was stolen, or want to leave, reassure them first and then gently move on to something easy (old photos, their old job, favourite food, the weather) and keep the chat going."
};
var READ_ALOUD_VOICE = "nova";
/** gpt-audio-mini (via OpenRouter); falls back to the built-in voice server-side. */
var READ_ALOUD_ENGINE = "openai";
/**
* The one and only chat body. Every AI surface in the app (floating assistant,
* information-card dropdown, check-in, medicine reminder) renders this and calls
* the same edge function through streamChatTextOnly.
*/
function AICompanionChat({ active, request = {}, className, threadId, onThreadUpdated }) {
	const { i18n } = useTranslation();
	const site = useSite();
	const isZh = i18n.language?.startsWith("zh");
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const abortRef = (0, import_react.useRef)(null);
	const activeRequestId = (0, import_react.useRef)(void 0);
	const guide = guideEntries(site.family);
	const [guideOpen, setGuideOpen] = (0, import_react.useState)(true);
	const [guideShowAll, setGuideShowAll] = (0, import_react.useState)(false);
	const [hideConfirm, setHideConfirm] = (0, import_react.useState)(false);
	const visibleGuide = guideShowAll ? guide : guide.slice(0, 4);
	const answerFromGuide = (entry) => {
		const answer = isZh ? entry.a.zh : entry.a.en;
		setMessages((prev) => {
			const next = [
				...prev,
				{
					role: "user",
					content: isZh ? entry.q.zh : entry.q.en
				},
				{
					role: "assistant",
					content: answer
				}
			];
			if (readAloudRef.current) speak(answer, next.length - 1);
			return next;
		});
	};
	const [mode, setMode] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem(MODE_KEY);
			if (saved === "text" || saved === "read" || saved === "live" || saved === "call") return saved;
			return localStorage.getItem(READ_ALOUD_KEY) === "1" ? "read" : "text";
		} catch {
			return "text";
		}
	});
	const readAloud = mode === "read";
	const liveMode = mode === "live" || mode === "call";
	const liveRef = (0, import_react.useRef)(liveMode);
	liveRef.current = liveMode;
	const modeRef = (0, import_react.useRef)(mode);
	modeRef.current = mode;
	const [callCfg, setCallCfg] = (0, import_react.useState)(() => {
		try {
			return {
				name: "",
				prompt: "",
				...JSON.parse(localStorage.getItem(CALL_KEY) || "{}")
			};
		} catch {
			return {
				name: "",
				prompt: ""
			};
		}
	});
	const callRef = (0, import_react.useRef)(callCfg);
	callRef.current = callCfg;
	const saveCall = (next) => {
		setCallCfg(next);
		try {
			localStorage.setItem(CALL_KEY, JSON.stringify(next));
		} catch {}
	};
	/** Extra instruction for spoken modes; the family-call role is added only in call mode. */
	const voiceStyle = () => {
		if (!liveRef.current) return "";
		const base = isZh ? LIVE_STYLE.zh : LIVE_STYLE.en;
		if (modeRef.current !== "call") return base;
		const { name, prompt } = callRef.current;
		const who = name.trim() || (isZh ? "一位家人" : "a family member");
		return `${base}\n${isZh ? `现在是模拟家属来电：你扮演“${who}”给对方打电话，用这位家人的口吻和称呼说话，不提自己是 AI 助手。${prompt.trim() ? `家属的设定和要说的话：${prompt.trim()}` : ""}` : `This is a simulated family phone call: you play "${who}" calling them, speaking in that family member's voice and terms of address, without mentioning being an AI assistant. ${prompt.trim() ? `The family member's setup and what to say: ${prompt.trim()}` : ""}`}`;
	};
	const [familyVoices, setFamilyVoices] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		let alive = true;
		setFamilyVoices([]);
		const load = () => {
			loadSavedFamilyVoices(request.contextScope?.caredOneId?.replace(/^wp-/, "")).then((rows) => {
				if (alive) setFamilyVoices(rows.filter((v) => v.state === FAMILY_VOICE_STATE.ready));
			}).catch(() => {
				if (alive) setFamilyVoices([]);
			});
		};
		load();
		const off = onFamilyVoicesChanged(load);
		return () => {
			alive = false;
			off();
		};
	}, [active, request.contextScope?.caredOneId]);
	const clonedAudioRef = (0, import_react.useRef)(null);
	/** Speaks a call reply in the chosen cloned family voice. */
	const speakCloned = async (text, index, voiceId) => {
		const clean = text.replace(/^✅\s*/, "").trim().slice(0, 1900);
		if (!clean) return;
		setSpeakingIndex(index);
		try {
			const voice = familyVoices.find((v) => v.voiceId === voiceId);
			if (!voice) throw new Error("Selected family voice is unavailable");
			const { audioBase64 } = await savedVoiceAudio(voice, clean);
			clonedAudioRef.current?.pause();
			const a = playBase64Mp3(audioBase64);
			clonedAudioRef.current = a;
			a.onended = () => setSpeakingIndex(null);
			a.onerror = () => setSpeakingIndex(null);
		} catch (e) {
			console.error("Cloned voice failed:", e);
			setMicError(isZh ? "亲友声音合成失败，请稍后再试。" : "Family voice failed — try again.");
			setSpeakingIndex(null);
		}
	};
	const [speakingIndex, setSpeakingIndex] = (0, import_react.useState)(null);
	const voiceRef = (0, import_react.useRef)(null);
	const readAloudRef = (0, import_react.useRef)(readAloud);
	readAloudRef.current = readAloud;
	const stopSpeaking = () => {
		clonedAudioRef.current?.pause();
		clonedAudioRef.current = null;
		voiceRef.current?.stop();
		voiceRef.current = null;
		setSpeakingIndex(null);
	};
	const speak = (text, index) => {
		stopSpeaking();
		const clean = text.replace(/^✅\s*/, "").trim();
		if (!clean) return;
		setSpeakingIndex(index);
		voiceRef.current = speakTextStreaming(clean, READ_ALOUD_VOICE, {
			engine: READ_ALOUD_ENGINE,
			onAllAudioEnd: () => setSpeakingIndex(null),
			onError: (e) => {
				console.error("Read aloud failed:", e);
				setSpeakingIndex(null);
			}
		});
	};
	const changeMode = (next) => {
		setMode(next);
		try {
			localStorage.setItem(MODE_KEY, next);
			localStorage.setItem(READ_ALOUD_KEY, next === "text" ? "0" : "1");
		} catch {}
		if (next === "text") stopSpeaking();
	};
	const recorderRef = (0, import_react.useRef)(null);
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [transcribing, setTranscribing] = (0, import_react.useState)(false);
	const [micError, setMicError] = (0, import_react.useState)(null);
	const startRecording = async () => {
		if (recording || transcribing || loading) return;
		stopSpeaking();
		setMicError(null);
		const rec = new VoiceRecorder();
		try {
			await rec.start();
			recorderRef.current = rec;
			setRecording(true);
		} catch {
			setMicError(isZh ? "打不开麦克风，请在系统里允许使用麦克风。" : "Can't reach the microphone — allow microphone access and try again.");
		}
	};
	const finishRecording = async (send_ = true) => {
		const rec = recorderRef.current;
		recorderRef.current = null;
		setRecording(false);
		if (!rec) return;
		const blob = await rec.stop();
		if (!send_) return;
		if (!blob) {
			setMicError(isZh ? "没有录到声音，请再说一次。" : "Nothing was recorded — please try again.");
			return;
		}
		setTranscribing(true);
		try {
			const text = await transcribeAudio(blob, isZh ? "zh" : "en");
			if (!text) {
				setMicError(isZh ? "没听清，请再说一次。" : "Didn't catch that — please try again.");
				return;
			}
			if (liveRef.current) await send(text);
			else setInput((prev) => prev ? `${prev} ${text}` : text);
		} catch (e) {
			console.error("Transcription failed:", e);
			setMicError(isZh ? "语音识别暂时不可用，请打字。" : "Voice input isn't available right now — please type.");
		} finally {
			setTranscribing(false);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!active) {
			stopSpeaking();
			recorderRef.current?.cancel();
			recorderRef.current = null;
			setRecording(false);
		}
	}, [active]);
	(0, import_react.useEffect)(() => () => {
		stopSpeaking();
		recorderRef.current?.cancel();
	}, []);
	/**
	* On-demand context: the static snippets that match this question plus only
	* the permitted dynamic facts it needs. See src/lib/ai-dynamic-knowledge.ts.
	*/
	const buildContext = async (question) => {
		const scope = request.contextScope ?? (request.contextPrompt ? void 0 : { topics: ["app-basics", "care-tips"] });
		if (!scope) {
			const liveOnly = voiceStyle();
			return [request.contextPrompt, liveOnly].filter(Boolean).join("\n\n") || void 0;
		}
		let resolved = "";
		try {
			resolved = await resolveAssistantContext({
				question,
				isChinese: !!isZh,
				caredOneId: scope.caredOneId,
				groupId: scope.groupId,
				groupName: scope.groupName,
				topics: scope.topics,
				sharedCard: scope.sharedCard
			});
		} catch (e) {
			console.warn("AI context resolution failed, continuing without facts:", e);
		}
		const live = voiceStyle();
		return [
			request.contextPrompt,
			resolved,
			live
		].filter(Boolean).join("\n\n") || void 0;
	};
	const [saveError, setSaveError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!threadId) return;
		let alive = true;
		loadAiThreadMessages(threadId).then((rows) => {
			if (!alive) return;
			setMessages((prev) => prev.some((m) => m.role === "user") ? prev : rows.length ? rows : [{
				role: "assistant",
				content: aiGreeting(!!isZh, site.id)
			}]);
		}).catch(() => {
			if (alive) setSaveError(isZh ? "无法读取这段对话。" : "Couldn't load this conversation.");
		});
		return () => {
			alive = false;
		};
	}, [threadId]);
	const persistTurn = async (userText, reply, firstTurn) => {
		if (!threadId || !reply.trim()) return;
		try {
			await appendAiMessage(threadId, "user", userText);
			await appendAiMessage(threadId, "assistant", reply);
			await touchAiThread(threadId, firstTurn ? userText.slice(0, 40) : void 0);
			setSaveError(null);
			onThreadUpdated?.();
		} catch (e) {
			console.error("Saving AI thread failed:", e);
			setSaveError(isZh ? "这条对话没能保存。" : "This message couldn't be saved.");
		}
	};
	(0, import_react.useEffect)(() => {
		if (threadId) return;
		if (!active || activeRequestId.current === request.id) return;
		activeRequestId.current = request.id;
		setInput("");
		const starter = request.starterPrompt?.trim();
		if (request.appGuide) {
			setMessages([]);
			setGuideOpen(true);
			setGuideShowAll(false);
			setHideConfirm(false);
			return;
		}
		if (!starter) {
			setMessages([{
				role: "assistant",
				content: aiGreeting(!!isZh, site.id)
			}]);
			return;
		}
		setMessages([{
			role: "assistant",
			content: ""
		}]);
		setLoading(true);
		buildContext(starter).then((contextPrompt) => {
			const { abort, result } = streamChatTextOnly([{
				role: "user",
				content: starter
			}], {
				language: isZh ? "zh" : "en",
				contextPrompt,
				onTextDelta: (_delta, full) => setMessages([{
					role: "assistant",
					content: full
				}]),
				onError: () => setMessages([{
					role: "assistant",
					content: request.starterFallback || aiGreeting(!!isZh, site.id)
				}])
			});
			abortRef.current = { abort };
			result.then((full) => {
				if (readAloudRef.current && full.trim()) speak(full, 0);
			}).catch(() => void 0).finally(() => {
				setLoading(false);
				abortRef.current = null;
			});
		});
	}, [
		active,
		request,
		isZh
	]);
	(0, import_react.useEffect)(() => {
		if (!active && abortRef.current) {
			abortRef.current.abort();
			abortRef.current = null;
			setLoading(false);
		}
	}, [active]);
	const send = async (submittedText) => {
		const text = (submittedText ?? input).trim();
		if (!text || loading) return;
		setInput("");
		const next = [
			...messages,
			{
				role: "user",
				content: text
			},
			{
				role: "assistant",
				content: ""
			}
		];
		setMessages(next);
		setLoading(true);
		try {
			const history = trimMessagesToCharLimit(next.slice(0, -1).map((m) => ({
				role: m.role,
				content: m.content
			})));
			const contextPrompt = await buildContext(text);
			const onDelta = (full) => setMessages((prev) => {
				const copy = [...prev];
				copy[copy.length - 1] = {
					role: "assistant",
					content: full
				};
				return copy;
			});
			let reply = "";
			const clonedVoice = modeRef.current === "call" ? callRef.current.voiceId : void 0;
			if (clonedVoice) {
				stopSpeaking();
				const { abort, result } = streamChatTextOnly(history, {
					language: isZh ? "zh" : "en",
					contextPrompt,
					onTextDelta: (_d, full) => onDelta(full),
					onError: (e) => console.error("AI call chat error:", e)
				});
				abortRef.current = { abort };
				reply = await result;
				if (reply.trim()) speakCloned(reply, next.length - 1, clonedVoice);
			} else if (liveRef.current) {
				stopSpeaking();
				const { controls, result } = streamChatWithVoice(history, READ_ALOUD_VOICE, {
					engine: READ_ALOUD_ENGINE,
					language: isZh ? "zh" : "en",
					contextPrompt,
					onTextDelta: (_d, full) => onDelta(full),
					onAudioStart: () => setSpeakingIndex(next.length - 1),
					onAllAudioEnd: () => setSpeakingIndex(null),
					onError: (e) => console.error("AI live chat error:", e)
				});
				voiceRef.current = controls;
				abortRef.current = { abort: () => controls.stop() };
				reply = await result;
			} else {
				const { abort, result } = streamChatTextOnly(history, {
					language: isZh ? "zh" : "en",
					contextPrompt,
					onTextDelta: (_d, full) => onDelta(full),
					onError: (e) => console.error("AI chat error:", e)
				});
				abortRef.current = { abort };
				reply = await result;
				if (readAloudRef.current && reply.trim()) speak(reply, next.length - 1);
			}
			await persistTurn(text, reply, !messages.some((m) => m.role === "user"));
			const parsed = parseAIJson(reply);
			if (parsed?.done && parsed.summary && request.onComplete) {
				const allowed = request.completionStatuses || [];
				if (!parsed.status || allowed.length === 0 || allowed.includes(parsed.status)) {
					setMessages((prev) => {
						const copy = [...prev];
						copy[copy.length - 1] = {
							role: "assistant",
							content: `✅ ${parsed.summary}`
						};
						return copy;
					});
					await request.onComplete({
						status: parsed.status,
						summary: parsed.summary
					});
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
			abortRef.current = null;
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/ai/AICompanionChat.tsx:583:5:babd6d07455295ca5ed18ec0c8bc7baadc1997aa632f1800d3a4ab64c20ab24d:1",
		className: className ?? "flex min-h-0 flex-1 flex-col",
		children: [
			request.appGuide && guideOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/ai/AICompanionChat.tsx:585:9:c4259b2a1b0fdd17bb71122fb46b07486064d7c62168204337090e10f411634d:1",
				className: "mx-4 mt-3 rounded-2xl border bg-muted/40 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:586:11:7ee9ffd8cac3fe70896e485a2cf87442741f8254b3bb141dcae6322395b77a6b:1",
						className: "text-sm font-semibold text-foreground",
						children: isZh ? "你想了解哪一项？" : "What would you like help with?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:589:11:5f95686008c3f90901f9d5a37269a51a1dbd0bdab7d69907b7d3888c1236a3dc:1",
						className: "mt-1 text-xs text-muted-foreground",
						children: isZh ? "点一个问题，或者用自己的话问。下面这些答案直接来自应用本身，点了马上就有。" : "Choose a question or ask in your own words. Answers to these come straight from the app — no waiting."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:594:11:0f09b333e509d3716c19c48e97a9f62df1a3b8b21eec75b1d5e0c6b7cbf9217c:1",
						className: "mt-3 space-y-2",
						children: visibleGuide.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"data-inspector-source": "components/ai/AICompanionChat.tsx:596:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
							type: "button",
							onClick: () => answerFromGuide(entry),
							className: "w-full rounded-xl bg-background px-3 py-2.5 text-left text-sm text-foreground shadow-xs transition-colors hover:bg-accent",
							children: isZh ? entry.q.zh : entry.q.en
						}, entry.q.en))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:606:11:2d3696edb2f603dcb138886f35e9b0e82caec16bc6438b3366bad575785a50e5:1",
						className: "mt-3 flex items-center justify-between gap-2",
						children: [guide.length > 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-source": "components/ai/AICompanionChat.tsx:608:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
							type: "button",
							onClick: () => setGuideShowAll((v) => !v),
							className: "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${guideShowAll ? "rotate-180" : ""}` }), guideShowAll ? isZh ? "收起" : "Show less" : isZh ? "更多问题" : "Show more"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-inspector-source": "components/ai/AICompanionChat.tsx:616:17:1a50fe58d2721e71984619cb97eaaadbd088c74514e5925ad6c0ea4f065da9c9:1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-source": "components/ai/AICompanionChat.tsx:617:13:a3b579ee303d0cab98ee81bdba245eb3089583d5c87a311fe484ba754cd07fc0:1",
							type: "button",
							onClick: () => request.onHideGuide ? setHideConfirm((v) => !v) : setGuideOpen(false),
							className: "inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground",
							children: [isZh ? "隐藏使用帮助" : "Hide app guide", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${hideConfirm ? "rotate-180" : ""}` })]
						})]
					}),
					hideConfirm && request.onHideGuide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:627:13:5d5dc186abd3a342c5629ab598e7944fb8d206ec538e6d4da313baacd8bdacee:1",
						className: "mt-2 rounded-xl border bg-background p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: async () => {
								setHideConfirm(false);
								setGuideOpen(false);
								await request.onHideGuide?.();
							},
							children: isZh ? "隐藏帮助按钮" : "Hide the help button"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/ai/AICompanionChat.tsx:638:15:16b65e65441f8deb820f7d2a90a58c0ff3da61a71f8f768d2d88ee09af064a7c:1",
							className: "mt-2 text-xs text-muted-foreground",
							children: isZh ? "以后想再看到它，在“设置”里随时可以重新打开。" : "You can turn the app guide back on any time in your settings."
						})]
					})
				]
			}),
			saveError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/ai/AICompanionChat.tsx:645:21:772dd7d5dc4bfeca89e19878130c9af2b0d08a0bb50a40f862fb717d1bc0af39:1",
				role: "alert",
				className: "mx-4 mt-2 text-sm text-destructive",
				children: saveError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Conversation, {
				className: "min-h-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationContent, {
					className: "gap-4 px-4 py-4",
					children: messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:650:13:dd382bd4f21c29a083abb509592a42b38cce57176250f3792308d41ad4762461:1",
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Message, {
							from: m.role,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContent, { children: m.content ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageResponse, { children: m.content }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { children: isZh ? "正在思考…" : "Thinking…" }) })
						}), m.role === "assistant" && m.content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"data-inspector-source": "components/ai/AICompanionChat.tsx:657:17:ca904882b6631c4b370d8cd02a036b03f523c6fcaa909d06b9d5911eb6cf0c5e:1",
							type: "button",
							onClick: () => speakingIndex === i ? stopSpeaking() : speak(m.content, i),
							className: "ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
							"aria-label": speakingIndex === i ? isZh ? "停止朗读" : "Stop reading" : isZh ? "朗读这段" : "Read this aloud",
							children: speakingIndex === i ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "h-3 w-3" }), isZh ? "停止" : "Stop"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-3 w-3" }), isZh ? "朗读" : "Listen"] })
						})]
					}, `${m.role}-${i}`))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationScrollButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/ai/AICompanionChat.tsx:674:7:7d1d0530157d3abf8193239e8d95421fd9f14b61ac900eca0b9c619af5563444:1",
				className: "border-t p-3 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:675:9:d66f223edb7d4e1b764d3800932bebcaa642ba3e5a77c494d8efbb8788631590:1",
						className: "flex items-center gap-1 rounded-xl bg-muted p-1",
						role: "group",
						"aria-label": isZh ? "回复方式" : "Reply mode",
						children: [
							{
								id: "text",
								icon: MessageSquare,
								zh: "文字",
								en: "Text"
							},
							{
								id: "read",
								icon: Volume2,
								zh: "朗读",
								en: "Read aloud"
							},
							{
								id: "live",
								icon: Radio,
								zh: "即时对话",
								en: "Live talk"
							},
							{
								id: "call",
								icon: PhoneCall,
								zh: "来电",
								en: "Family call"
							}
						].map((opt) => {
							const Icon = opt.icon;
							const on = mode === opt.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"data-inspector-source": "components/ai/AICompanionChat.tsx:685:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
								type: "button",
								"aria-pressed": on,
								onClick: () => changeMode(opt.id),
								className: `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${on ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" }), isZh ? opt.zh : opt.en]
							}, opt.id);
						})
					}),
					mode === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:699:11:888266f5d953d8463cf44438dce0a6b3330f689e4683e9b52beb34cf1d864ca6:1",
						className: "text-xs text-muted-foreground",
						children: isZh ? "按住麦克风说话，松手就会马上回答，一句一句读出来。" : "Hold the microphone and talk — the reply comes back spoken, sentence by sentence."
					}),
					mode === "call" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:704:11:754f103a680ecc53cf0374403626b74bda671dd515161344470c95b94c82777c:1",
						className: "space-y-1.5 rounded-xl border p-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/ai/AICompanionChat.tsx:705:13:7092a605bb0ee468f54cfd5cd2af559f4d0717ca74addc443319cf46d0cfdc7a:1",
								className: "text-xs text-muted-foreground",
								children: isZh ? "模拟家属来电（不是真实来电）。写下扮演谁、怎么说话、要说的话；按住麦克风对话。可以选一个已录制的亲友声音。" : "Simulated family call (not a real call). Describe who to play, how they talk and what to say; hold the mic to talk. You can pick a recorded family voice."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"data-inspector-source": "components/ai/AICompanionChat.tsx:710:13:1fd0104f2da6092c02c65374f1184cb82fbe0b012e22762589ada0bc58023f1f:1",
								value: callCfg.voiceId || "",
								onChange: (e) => saveCall({
									...callCfg,
									voiceId: e.target.value || void 0
								}),
								className: "w-full rounded-md border bg-background px-2 py-1 text-xs",
								"aria-label": isZh ? "用谁的声音" : "Which voice",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									"data-inspector-source": "components/ai/AICompanionChat.tsx:716:15:6d8b5eb60ee6011ac97504e61b13c250fe7348a57fcf903b7df76fc9d63932d9:1",
									value: "",
									children: isZh ? "默认 AI 声音" : "Default AI voice"
								}), familyVoices.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									"data-inspector-source": "components/ai/AICompanionChat.tsx:718:17:d73295611e58a8846428c02a4987c311287f8be103811ef746b7ed407936804c:1",
									value: v.voiceId,
									children: [
										v.label,
										" · ",
										v.caredOneName
									]
								}, v.id))]
							}),
							familyVoices.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/ai/AICompanionChat.tsx:722:15:6cf628eb073770b2f319e53c4cbe3e68634ef231833b89755e97682879d768ef:1",
								className: "text-[11px] text-muted-foreground",
								children: isZh ? "在“被护理人 → 录制亲友声音”里录一段，就能在这里选。" : "Record one under Cared Ones → Family Voices to pick it here."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"data-inspector-source": "components/ai/AICompanionChat.tsx:724:13:67724f4e252e3e96fef4180dc1b9db5f6e6f39d49ce92ad37512a928fcc35ed5:1",
								value: callCfg.name,
								onChange: (e) => saveCall({
									...callCfg,
									name: e.target.value
								}),
								placeholder: isZh ? "扮演谁，例如：女儿小红" : "Who calls, e.g. daughter Amy",
								className: "w-full rounded-md border bg-background px-2 py-1 text-xs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								"data-inspector-source": "components/ai/AICompanionChat.tsx:730:13:c188e6ab3510e4db6a4955bbe237aed12252915b79c251f7b4f4fa28842e697a:1",
								value: callCfg.prompt,
								onChange: (e) => saveCall({
									...callCfg,
									prompt: e.target.value
								}),
								rows: 3,
								placeholder: isZh ? "例如：叫他爸，语气轻松。告诉他今天来的阿姨是我们请来帮忙的，不要赶她走。" : "e.g. Call him Dad, keep it light. Tell him the helper today is someone we asked to come — please let her stay.",
								className: "w-full resize-none rounded-md border bg-background px-2 py-1 text-xs"
							})
						]
					}),
					micError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:739:22:939aa9d7e10b6d50cef93a4c0e6ace3a756d071a94e60d10bd002dc120425358:1",
						className: "text-xs text-destructive",
						children: micError
					}),
					request.onComplete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/ai/AICompanionChat.tsx:741:11:d4ac14e4d4d8a2ceb6423b3d972edc894752a01d4f1489d623a789254bc9b51b:1",
						className: "flex justify-end gap-2",
						children: [(request.completionStatuses || []).includes("skipped") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => request.onComplete?.({
								status: "skipped",
								summary: isZh ? "用户选择跳过。" : "User chose to skip."
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-3.5 w-3.5 mr-1" }), isZh ? "跳过" : "Skip"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => request.onComplete?.({
								status: request.completionStatuses?.[0],
								summary: messages.map((m) => `${m.role}: ${m.content}`).join("\n").slice(0, 1500)
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 mr-1" }), isZh ? "完成并保存" : "Finish & save"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInput, {
						onSubmit: ({ text }) => send(text),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputBody, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputTextarea, {
							value: input,
							onChange: (e) => setInput(e.target.value),
							placeholder: isZh ? "说点什么…" : "Type a message…"
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInputFooter, {
							className: "justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: recording ? "destructive" : "outline",
								disabled: transcribing || loading,
								"aria-label": recording ? isZh ? "停止说话并发送" : "Stop talking and send" : isZh ? "按住说话" : "Hold to talk",
								onPointerDown: (e) => {
									e.preventDefault();
									startRecording();
								},
								onPointerUp: (e) => {
									e.preventDefault();
									finishRecording(true);
								},
								onPointerLeave: () => {
									if (recording) finishRecording(true);
								},
								children: transcribing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }), isZh ? "识别中…" : "Transcribing…"] }) : recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "mr-1 h-3.5 w-3.5" }), isZh ? "松手发送" : "Release to send"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "mr-1 h-3.5 w-3.5" }), isZh ? "按住说话" : "Hold to talk"] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputSubmit, {
								status: loading ? "streaming" : "ready",
								disabled: loading || !input.trim(),
								onStop: () => abortRef.current?.abort()
							})]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { touchAiThread as a, listAiThreads as i, aiBrand as n, createAiThread as r, AICompanionChat as t };
