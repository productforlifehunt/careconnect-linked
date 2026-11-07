import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Card } from "./card-DGU2jav_.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { o as useSearchParams, t as Link$1 } from "./router-compat-DbWBz8c6.mjs";
import { t as decodeSharedNote } from "./shared-note-BCJzvZmG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/note-CQjplpf5.js
var import_jsx_runtime = require_jsx_runtime();
/** Public, read-only view of a study note shared by link. The note text travels inside the link itself. */
function SharedStudyNote() {
	const [params] = useSearchParams();
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const note = decodeSharedNote(params.get("d") || "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/SharedStudyNote/SharedStudyNote/div/6d1daa2f76b5/0",
		"data-inspector-source": "pages/SharedStudyNote.tsx:14:5:6886cc71c858d488300fd4a9c905486b69bafa2673a198ae10926c611af5f0c7:1",
		className: "max-w-2xl mx-auto px-4 py-10",
		children: !note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-id": "pages/SharedStudyNote/SharedStudyNote/p/3c67441cc512/0",
			"data-inspector-source": "pages/SharedStudyNote.tsx:16:9:df2aed0eb9a8f4831fbe2a49504d9ab5c9b95bbce790dae3b01be3956212c63d:1",
			className: "text-center text-muted-foreground",
			children: isZh ? "这个分享链接无效" : "This share link is not valid"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			"data-inspector-id": "pages/SharedStudyNote/SharedStudyNote/Card/6c53b7343c5b/0",
			"data-inspector-source": "pages/SharedStudyNote.tsx:18:9:9b31ce8026650a45cb0513dc1df1858540b2cbaae203af6281fb9a3c72801588:1",
			className: "p-6 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/SharedStudyNote/SharedStudyNote/p/3c67441cc512/1",
					"data-inspector-source": "pages/SharedStudyNote.tsx:19:11:810b19b2fa3b26cbe8e288ea9641f833c33cf610f9832668a560e6fc2d0c7322:1",
					className: "text-xs text-muted-foreground",
					children: isZh ? "分享的学习笔记" : "Shared study note"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-id": "pages/SharedStudyNote/SharedStudyNote/h1/a7fcdc8c57b3/0",
					"data-inspector-source": "pages/SharedStudyNote.tsx:20:11:6220e1a9b2189e9bbea69ac6071cc79bfdc0870a8d5d0771ea687965f93a92b2:1",
					className: "text-2xl font-bold",
					children: note.t
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/SharedStudyNote/SharedStudyNote/p/70603751ea63/0",
					"data-inspector-source": "pages/SharedStudyNote.tsx:21:11:6a6e22bef2099073c264b78b1bca810fb16c219dbc94a49758352e2ba7ccacf4:1",
					className: "whitespace-pre-wrap text-foreground",
					children: note.c
				}),
				note.s && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					"data-inspector-id": "pages/SharedStudyNote/SharedStudyNote/p/d7aa17e6c848/0",
					"data-inspector-source": "pages/SharedStudyNote.tsx:23:13:edcb76e7826666b3e7afa6eafc53149b16afc9d26d46db1da35f9a05a67deb28:1",
					className: "text-sm text-muted-foreground pt-2 border-t",
					children: [isZh ? "来自：" : "From: ", note.p ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						"data-inspector-id": "pages/SharedStudyNote/SharedStudyNote/Link/087a7710d5fe/0",
						"data-inspector-source": "pages/SharedStudyNote.tsx:25:25:6d6660c235f8136f8088e6a8fd34092270791b7efa9177f151a888540afc83fc:1",
						className: "text-primary underline",
						to: note.p,
						children: note.s
					}) : note.s]
				})
			]
		})
	});
}
var SplitComponent = SharedStudyNote;
//#endregion
export { SplitComponent as component };
