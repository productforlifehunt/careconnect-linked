import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as getCurrentUserIdNumber } from "./current-user-CV-pp6xq.mjs";
import { i as WP, n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { V as Share2, Wn as BookOpenCheck, it as Plus, ut as Pencil, y as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { r as useLocation$1, t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as Skeleton } from "./skeleton-BRV0UAw9.mjs";
import { n as encodeSharedNote } from "./shared-note-BCJzvZmG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StudyNotesPanel-QYQVP0ev.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Study notes & lesson-completion tracking.
* Data dictionary (the only source of truth):
*   CCT 218 `study_notes` — a55 Title, a56 Content
*   REL 256: 217. Challenged App Content → 218. User's study notes (1:M, no meta)
*   REL 255: Users → 217. Challenged App Content (1:M)
*            meta a55 = "User has finished learning this lesson" { b55 Yes | b56 No }
*/
var SLUG = T.studyNote.slug;
var F = {
	title: T.studyNote.f.TITLE,
	content: T.studyNote.f.CONTENT
};
var REL_ARTICLE_NOTES = R.contentStudyNotes;
var REL_USER_FINISHED = R.userFinishedContent;
var REL255 = WP.rel["255"];
var FINISHED_FIELD = REL255.f["USER_HAS_FINISHED_LEARNING_THIS_LESSON"];
var FINISHED_YES = REL255.opt["USER_HAS_FINISHED_LEARNING_THIS_LESSON"]["YES"];
function normalizeArticleId(id) {
	return Number(String(id).replace(/^wp-/, ""));
}
async function fetchStudyNotesForArticle(articleId) {
	const aid = normalizeArticleId(articleId);
	const userId = getCurrentUserIdNumber();
	if (!aid) throw new Error("Invalid article ID");
	const rels = await wordpressFetch(`jet-rel/${REL_ARTICLE_NOTES}/children/${aid}`);
	const noteIds = (Array.isArray(rels) ? rels : []).map((r) => Number(r.child_object_id)).filter(Boolean);
	if (noteIds.length === 0) return [];
	return (await Promise.all(noteIds.map((nid) => wordpressCCTFetch(SLUG, { id: nid })))).filter((n) => !userId || Number(n.author_id) === userId).map((n) => ({
		id: String(n.id ?? n._ID),
		title: n[F.title] ?? "",
		content: n[F.content] ?? "",
		article_id: String(articleId),
		created_at: n.created_at ?? null,
		updated_at: n.updated_at ?? null
	}));
}
async function createStudyNote(input) {
	const aid = normalizeArticleId(input.article_id);
	if (!aid) throw new Error("Invalid article ID");
	const created = await wordpressCCTFetch(SLUG, {
		method: "POST",
		body: {
			[F.title]: input.title,
			[F.content]: input.content
		}
	});
	const newId = Number(created?.item_id ?? created?._ID ?? created?.id ?? 0);
	if (!newId) throw new Error("Study note was created without an item ID");
	await wordpressFetch(`jet-rel/${REL_ARTICLE_NOTES}`, {
		method: "POST",
		body: {
			parent_id: aid,
			child_id: newId,
			context: "child",
			store_items_type: "update"
		}
	});
	return {
		id: String(newId),
		title: input.title,
		content: input.content,
		article_id: String(input.article_id)
	};
}
async function updateStudyNote(id, patch) {
	const body = {};
	if (patch.title !== void 0) body[F.title] = patch.title;
	if (patch.content !== void 0) body[F.content] = patch.content;
	await wordpressCCTFetch(SLUG, {
		id,
		method: "PUT",
		body
	});
}
async function deleteStudyNote(id) {
	await wordpressCCTFetch(SLUG, {
		id,
		method: "DELETE"
	});
}
async function isLessonFinished(articleId) {
	const userId = getCurrentUserIdNumber();
	const aid = normalizeArticleId(articleId);
	if (!userId || !aid) return false;
	const rels = await wordpressFetch(`jet-rel/${REL_USER_FINISHED}/children/${userId}`);
	return (Array.isArray(rels) ? rels : []).some((r) => {
		if (Number(r.child_object_id) !== aid) return false;
		const v = r?.meta?.[FINISHED_FIELD] ?? r?.[FINISHED_FIELD];
		return String(v) === FINISHED_YES;
	});
}
async function markLessonFinished(articleId, finished = true) {
	const userId = getCurrentUserIdNumber();
	const aid = normalizeArticleId(articleId);
	if (!userId || !aid) throw new Error("Authentication and a valid article ID are required");
	if (finished) await wordpressFetch(`jet-rel/${REL_USER_FINISHED}`, {
		method: "POST",
		body: {
			parent_id: userId,
			child_id: aid,
			context: "child",
			store_items_type: "update",
			meta: { [FINISHED_FIELD]: FINISHED_YES }
		}
	});
	else await wordpressFetch(`jet-rel/${REL_USER_FINISHED}`, {
		method: "POST",
		body: {
			parent_id: userId,
			child_id: aid,
			context: "child",
			store_items_type: "disconnect"
		}
	});
}
function StudyNotesPanel(props) {
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	if (getCurrentUserIdNumber() == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesPanel/Card/0",
		"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:37:7:39aed7dc85d75658a799645c9a4dc3d280bf5bd7cf7228593c5af2eb2c52e71b:1",
		className: "p-4 text-sm text-muted-foreground",
		children: [
			isZh ? "登录后可以在这里写学习笔记。" : "Sign in to write study notes here.",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesPanel/Link/0",
				"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:39:9:d4fcea2eb9b8969afb7da8388632fc7f93e0e2fd32fdea831d49956212614855:1",
				to: "/auth",
				className: "text-primary underline",
				children: isZh ? "登录" : "Sign in"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudyNotesInner, { ...props });
}
function StudyNotesInner({ articleId, showFinishedToggle = false, sourceTitle }) {
	const location = useLocation$1();
	const { i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	const qc = useQueryClient();
	const { toast } = useToast();
	const [draftTitle, setDraftTitle] = (0, import_react.useState)("");
	const [draftContent, setDraftContent] = (0, import_react.useState)("");
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [editTitle, setEditTitle] = (0, import_react.useState)("");
	const [editContent, setEditContent] = (0, import_react.useState)("");
	const notesQuery = useQuery({
		queryKey: ["study-notes", String(articleId)],
		queryFn: () => fetchStudyNotesForArticle(articleId)
	});
	const finishedQuery = useQuery({
		queryKey: ["lesson-finished", String(articleId)],
		queryFn: () => isLessonFinished(articleId),
		enabled: showFinishedToggle
	});
	const createMut = useMutation({
		mutationFn: () => createStudyNote({
			article_id: articleId,
			title: draftTitle,
			content: draftContent
		}),
		onSuccess: () => {
			setDraftTitle("");
			setDraftContent("");
			qc.invalidateQueries({ queryKey: ["study-notes", String(articleId)] });
			toast({ title: isChinese ? "笔记已保存" : "Note saved" });
		},
		onError: () => toast({
			title: isChinese ? "保存失败" : "Save failed",
			variant: "destructive"
		})
	});
	const updateMut = useMutation({
		mutationFn: ({ id }) => updateStudyNote(id, {
			title: editTitle,
			content: editContent
		}),
		onSuccess: () => {
			setEditingId(null);
			qc.invalidateQueries({ queryKey: ["study-notes", String(articleId)] });
			toast({ title: isChinese ? "已更新" : "Updated" });
		}
	});
	const deleteMut = useMutation({
		mutationFn: (id) => deleteStudyNote(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["study-notes", String(articleId)] });
			toast({ title: isChinese ? "笔记已删除" : "Note deleted" });
		}
	});
	const finishedMut = useMutation({
		mutationFn: (next) => markLessonFinished(articleId, next),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["lesson-finished", String(articleId)] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/section/0",
		"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:103:5:b6cb1579fe7895661d838b718ee315634b3d836c77c16216d5ece39caa03a14d:1",
		className: "space-y-4",
		children: [
			showFinishedToggle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpenCheck, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 cursor-pointer flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Checkbox/cb193fd1eea8",
						"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:108:13:ea6784c175339da68df469c125f19eece8af0df46311191994ae5c111268cb45:1",
						checked: !!finishedQuery.data,
						onCheckedChange: (v) => finishedMut.mutate(!!v),
						disabled: finishedMut.isPending
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/span/0",
						"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:113:13:99b875d58e06d54c0e940b0b8b17217bab267d2149fba45f1033bb6d656a311e:1",
						className: "text-sm font-medium",
						children: isChinese ? "标记此课程为已完成" : "Mark this lesson as finished"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/h3/0",
						"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:121:9:2bb45534f00d4d99f0d7ba65893163925bc6a470763a6acf8405785688723eea:1",
						className: "text-base font-semibold flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
							" ",
							isChinese ? "添加笔记" : "Add a note"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Input/84199a4efda6",
						"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:124:9:12d33f233c87d2ed7edc4b3471275a87c090a2b572175dae28f0a4c3fdac3fe3:1",
						placeholder: isChinese ? "标题" : "Title",
						value: draftTitle,
						onChange: (e) => setDraftTitle(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Textarea/bcd6bbfc2f3d",
						"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:129:9:84ced9259b486668d0379b9a8457cf0879a2a9b5e8c912c24ed11174507806fe:1",
						placeholder: isChinese ? "你的想法..." : "Your thoughts…",
						value: draftContent,
						onChange: (e) => setDraftContent(e.target.value),
						rows: 3
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Button/3a5b570459c0",
						"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:135:9:2cbf2afe1b54a91992d854285721d994fd9ad62c98cef20b40ccfc2ba0f045a3:1",
						size: "sm",
						onClick: () => createMut.mutate(),
						disabled: !draftTitle.trim() || !draftContent.trim() || createMut.isPending,
						children: createMut.isPending ? isChinese ? "保存中…" : "Saving…" : isChinese ? "保存笔记" : "Save note"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/div/0",
				"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:144:7:0d786102428466c4a7ee6474fcde99f39d32b75cf98669fb34f9957faeb77500:1",
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/h3/1",
					"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:145:9:e3fbb59208128308421b174041cbde80e8cf355d59f06eacfdd0958adb59a62c:1",
					className: "text-base font-semibold",
					children: isChinese ? "我的笔记" : "My notes"
				}), notesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" }) : notesQuery.data && notesQuery.data.length > 0 ? notesQuery.data.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Card/0",
					"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:150:13:cf21d252e983b6fc6b86db7dd9c666e9b82c494c7d03dd19d466190a117f1a00:1",
					className: "p-4",
					children: editingId === n.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Input/c6d25ec14515",
								"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:153:19:7d509c5ef101142a690cf98414b9e0362be1718b8cc0a8c3b297b2f452c1452b:1",
								value: editTitle,
								onChange: (e) => setEditTitle(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Textarea/6fd5ba0d1c2e",
								"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:154:19:756b3d653aa4b0fdd44d4790e4e6f7a69605259efb45da6f198055832f89a10b:1",
								value: editContent,
								onChange: (e) => setEditContent(e.target.value),
								rows: 3
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Button/059d0d7ed844",
									"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:156:21:66b2ab803de313cca118b961c2c5af5b3e0ba8e4e5fe1bbde36172d18f366b97:1",
									size: "sm",
									onClick: () => updateMut.mutate({ id: n.id }),
									disabled: updateMut.isPending,
									children: isChinese ? "保存" : "Save"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Button/a492e4620da1",
									"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:159:21:7cb47464019444f7a4b69efcd4bd1de9b2c550a8de8d7195a07cbe51bdb7214d:1",
									size: "sm",
									variant: "outline",
									onClick: () => setEditingId(null),
									children: isChinese ? "取消" : "Cancel"
								})]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/h4/0",
							"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:167:21:e3bb7dde800b3d3dba003fb67961217ebe01da2e8609dccfefe0863dea88c495:1",
							className: "font-medium",
							children: n.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Button/aa7488155e7e",
									"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:169:23:ed1cc1d1ab0faf88c6fccfa77d8e07017cd70cf20c8121a98702a61308a3b953:1",
									size: "icon",
									variant: "ghost",
									"aria-label": isChinese ? "分享笔记" : "Share note",
									onClick: async () => {
										const url = encodeSharedNote({
											t: n.title,
											c: n.content,
											s: sourceTitle,
											p: location.pathname
										});
										try {
											await navigator.clipboard.writeText(url);
										} catch {}
										toast({
											title: isChinese ? "分享链接已复制" : "Share link copied",
											description: url.slice(0, 80) + "…"
										});
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Button/c9564946157f",
									"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:176:23:6fe51c619d9f686c1e5d69787159874422b73eb801803f0d0f2c30a4245a7859:1",
									size: "icon",
									variant: "ghost",
									"aria-label": isChinese ? "编辑笔记" : "Edit note",
									onClick: () => {
										setEditingId(n.id);
										setEditTitle(n.title);
										setEditContent(n.content);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/Button/23d3dbfd8906",
									"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:181:23:e977b6a0b1c7c81b29d0a6ebac4ced85e403ea9ae6b69117e7255ffb7b50a0b1:1",
									size: "icon",
									variant: "ghost",
									"aria-label": isChinese ? "删除笔记" : "Delete note",
									onClick: () => deleteMut.mutate(n.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/p/0",
						"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:186:19:d13971029586251456059410f153c84a8b27743cef00146c5079d264fd432d6e:1",
						className: "text-sm text-muted-foreground whitespace-pre-wrap",
						children: n.content
					})] })
				}, n.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/challenged/StudyNotesPanel/StudyNotesInner/p/1",
					"data-inspector-source": "components/challenged/StudyNotesPanel.tsx:192:11:e08bc0e72a9b8ebab0b80a261611e7176c27317cfdfb45aaa019e378b1611cc3:1",
					className: "text-sm text-muted-foreground text-center py-4",
					children: isChinese ? "还没有笔记" : "No notes yet"
				})]
			})
		]
	});
}
//#endregion
export { StudyNotesPanel as t };
