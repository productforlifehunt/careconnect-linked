import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { n as R } from "./wp-schema-Dnlz0TVP.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { An as ChevronUp, Nn as ChevronDown, Q as Reply, St as MessageSquare, b as ThumbsUp, jt as LoaderCircle, pn as CornerDownRight, ut as Pencil, x as ThumbsDown, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DHxbK-sS.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as fetchForumNames } from "./wp-users-C2nRIR2f.mjs";
import { H as useComments, Z as useCreateComment, ir as useUpdateComment, qn as useToggleVote, vt as useDeleteComment, xr as useVoteSummary } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BD51KPR_.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CommentsSection-Dr3pAlaO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CommentItem({ comment, relationId, parentId, userId, authorName, deleteComment, createComment, updateComment, voteSummary, toggleVote, depth }) {
	const [replyOpen, setReplyOpen] = (0, import_react.useState)(false);
	const [replyText, setReplyText] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = (0, import_react.useState)(false);
	const [editText, setEditText] = (0, import_react.useState)(comment.content);
	const { i18n } = useTranslation();
	const { toast } = useToast();
	const voteState = voteSummary[comment.id] || {
		score: 0,
		upvotes: 0,
		downvotes: 0,
		userVote: 0
	};
	const isZh = i18n.language?.startsWith("zh");
	const handleReply = () => {
		if (!replyText.trim()) return;
		createComment.mutate({
			relationId,
			parentId,
			content: replyText.trim(),
			replyToCommentId: comment.id
		}, {
			onSuccess: () => {
				setReplyText("");
				setReplyOpen(false);
			},
			onError: (err) => toast({
				title: isZh ? "回复失败" : "Failed to reply",
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const handleUpdate = () => {
		if (!editText.trim()) return;
		updateComment.mutate({
			id: comment.id,
			content: editText.trim()
		}, {
			onSuccess: () => {
				setEditing(false);
				toast({ title: isZh ? "回复已更新" : "Reply updated" });
			},
			onError: (err) => toast({
				title: isZh ? "更新失败" : "Failed to update",
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const handleDelete = () => {
		deleteComment.mutate({ id: comment.id }, {
			onSuccess: () => {
				setConfirmDeleteOpen(false);
				toast({ title: isZh ? "回复已删除" : "Comment deleted" });
			},
			onError: (err) => toast({
				title: isZh ? "删除失败" : "Failed to delete",
				description: err.message,
				variant: "destructive"
			})
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/comments/CommentsSection/CommentItem/div/0",
		"data-inspector-source": "components/comments/CommentsSection.tsx:105:5:9823fc1250f54b914a9bc112f85a6b5681f87af2cb3774932f4d06b2874527de:1",
		className: depth > 0 ? "ml-6 pl-4 border-l border-border/70" : "",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-3 group",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg bg-muted/25 px-3 py-3 transition-colors group-hover:bg-muted/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "components/comments/CommentsSection/CommentItem/div/1",
							"data-inspector-source": "components/comments/CommentsSection.tsx:109:13:9112d59949cb7aca25e15854782efbcc1dadaa6605a4e2fb002c24180e24d971:1",
							className: "w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0 mt-0.5",
							children: (authorName(comment.author_id) || "?")[0]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/comments/CommentsSection/CommentItem/div/2",
									"data-inspector-source": "components/comments/CommentsSection.tsx:113:15:27026d9ee9bc7cde11b400f0fc56b693771082e3d473caa7f40bef7738ce5586:1",
									className: "flex items-center gap-2 mb-1 flex-wrap",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/comments/CommentsSection/CommentItem/span/0",
											"data-inspector-source": "components/comments/CommentsSection.tsx:114:17:7e6fddec5cec2bc5b5247752e7a7989057a6fd128fda48c3ca96e4e847f2e950:1",
											className: "text-xs font-semibold text-foreground",
											children: authorName(comment.author_id) || (isZh ? "未填姓名" : "No name")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/comments/CommentsSection/CommentItem/span/1",
											"data-inspector-source": "components/comments/CommentsSection.tsx:115:17:c5da3bd98ee7db455479ad1007b9270985bda029176308c8e26b8d173e167208:1",
											className: "text-[10px] text-muted-foreground",
											children: formatDate(comment.created_at, i18n.language, {
												month: "short",
												day: "numeric"
											})
										}),
										depth > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-id": "components/comments/CommentsSection/CommentItem/span/2",
											"data-inspector-source": "components/comments/CommentsSection.tsx:119:19:5fc054250b5bc1ea525e61f683d276561cfff5db324a5e8e4a9afb508b52a598:1",
											className: "inline-flex items-center gap-1 text-[10px] text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownRight, { className: "h-3 w-3" }), isZh ? "回复" : "Reply"]
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/comments/CommentsSection/CommentItem/p/0",
									"data-inspector-source": "components/comments/CommentsSection.tsx:125:15:4d1e4c435993a1f26efd241a24f07d8009f8a1e4ab1d810ce17274cfa3232df8:1",
									className: "text-sm leading-6 text-foreground whitespace-pre-wrap",
									children: comment.content
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/comments/CommentsSection/CommentItem/div/3",
									"data-inspector-source": "components/comments/CommentsSection.tsx:126:15:23c4d1f765d6f87cd820f0bdf211a07a1e7f80577ccf39f985cc76178ff1cd8d:1",
									className: "mt-2 flex items-center gap-1.5 flex-wrap",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											"data-inspector-id": "components/comments/CommentsSection/CommentItem/Button/740a2200881c",
											"data-inspector-source": "components/comments/CommentsSection.tsx:127:17:362775feb727622fe4710f06f6065012416fb1cf15d6ec22171ed165da99c91d:1",
											variant: "ghost",
											size: "sm",
											className: `h-7 px-2 text-[11px] ${voteState.userVote === 1 ? "text-primary" : "text-muted-foreground"}`,
											onClick: () => toggleVote.mutate({
												relationId: R.commentVotes,
												parentId: comment.id,
												value: 1
											}, { onError: (err) => toast({
												title: isZh ? "投票失败" : "Vote failed",
												description: err.message,
												variant: "destructive"
											}) }),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "h-3.5 w-3.5 mr-1" }), voteState.upvotes]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											"data-inspector-id": "components/comments/CommentsSection/CommentItem/Button/740a2200881c",
											"data-inspector-source": "components/comments/CommentsSection.tsx:136:17:362775feb727622fe4710f06f6065012416fb1cf15d6ec22171ed165da99c91d:1",
											variant: "ghost",
											size: "sm",
											className: `h-7 px-2 text-[11px] ${voteState.userVote === -1 ? "text-destructive" : "text-muted-foreground"}`,
											onClick: () => toggleVote.mutate({
												relationId: R.commentVotes,
												parentId: comment.id,
												value: -1
											}, { onError: (err) => toast({
												title: isZh ? "投票失败" : "Vote failed",
												description: err.message,
												variant: "destructive"
											}) }),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, { className: "h-3.5 w-3.5 mr-1" }), voteState.downvotes]
										}),
										depth === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											"data-inspector-id": "components/comments/CommentsSection/CommentItem/Button/edfd8f6cc7ee",
											"data-inspector-source": "components/comments/CommentsSection.tsx:146:19:707175856380b8c8585b322c7fe8dc12d5a99f9ad912696b535035d70132558c:1",
											variant: "ghost",
											size: "sm",
											className: "h-7 px-2 text-[11px] text-muted-foreground",
											onClick: () => setReplyOpen(!replyOpen),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "h-3.5 w-3.5 mr-1" }), isZh ? "回复" : "Reply"]
										}),
										comment.author_id === userId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											"data-inspector-id": "components/comments/CommentsSection/CommentItem/Button/14c6337ae8fe",
											"data-inspector-source": "components/comments/CommentsSection.tsx:153:21:30767c6aae6657fe2bd50ec0a7a19193857b64b143e0f73726eab5137a3eb79f:1",
											variant: "ghost",
											size: "sm",
											className: "h-7 px-2 text-[11px] text-muted-foreground",
											onClick: () => setEditing(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5 mr-1" }), isZh ? "编辑" : "Edit"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											"data-inspector-id": "components/comments/CommentsSection/CommentItem/Button/ca46ee90b285",
											"data-inspector-source": "components/comments/CommentsSection.tsx:157:21:f78eb0d3971a8bb1961070c6eb62ce8e6cd943a164ed8f8de3e28a31c77337dc:1",
											variant: "ghost",
											size: "sm",
											className: "h-7 px-2 text-[11px] text-destructive",
											onClick: () => setConfirmDeleteOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5 mr-1" }), isZh ? "删除" : "Delete"]
										})] })
									]
								})
							]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "components/comments/CommentsSection/CommentItem/Dialog/14c6337ae8fe",
				"data-inspector-source": "components/comments/CommentsSection.tsx:174:7:35b241ca755b6178ff97a21fa834ed621d8a0f34767d4101bb76b7f30ea14c35:1",
				open: editing,
				onOpenChange: setEditing,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						"data-inspector-id": "components/comments/CommentsSection/CommentItem/DialogTitle/0",
						"data-inspector-source": "components/comments/CommentsSection.tsx:177:13:60f751a682025fd722bcfd36a8e1ab3e9766a20dba4fd655e0f1e907cc68c83f:1",
						children: isZh ? "编辑回复" : "Edit reply"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							"data-inspector-id": "components/comments/CommentsSection/CommentItem/Textarea/0b0f347a9751",
							"data-inspector-source": "components/comments/CommentsSection.tsx:180:13:6c4429b877263a08254681f3f01ad20a033b28c289e1ca1aa10fd307148bb6a1:1",
							value: editText,
							onChange: (e) => setEditText(e.target.value),
							rows: 4
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/comments/CommentsSection/CommentItem/Button/14c6337ae8fe",
								"data-inspector-source": "components/comments/CommentsSection.tsx:182:15:19e32d6e88a541f9055432b327c64956fd211e624595f315c8e2801d177b13c7:1",
								variant: "outline",
								onClick: () => setEditing(false),
								children: isZh ? "取消" : "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/comments/CommentsSection/CommentItem/Button/f10a6b9d2005",
								"data-inspector-source": "components/comments/CommentsSection.tsx:183:15:e5ffd7bcedb5d7bdb81901d41462649b201b8e8ea96b245f93b80e6588002a5e:1",
								variant: "coral",
								onClick: handleUpdate,
								disabled: !editText.trim() || updateComment.isPending,
								children: updateComment.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : isZh ? "保存" : "Save"
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				"data-inspector-id": "components/comments/CommentsSection/CommentItem/AlertDialog/ca46ee90b285",
				"data-inspector-source": "components/comments/CommentsSection.tsx:191:7:89c5d7f734c64a49a5c0bd383e4fdb9c681784cb9dee8ef838a03cebe5a190a9:1",
				open: confirmDeleteOpen,
				onOpenChange: setConfirmDeleteOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
					"data-inspector-id": "components/comments/CommentsSection/CommentItem/AlertDialogTitle/0",
					"data-inspector-source": "components/comments/CommentsSection.tsx:194:13:0391b32fd1ac54e8d5cce8741ab43b271d944d80f99f52cd980cc0b6e8e3fe42:1",
					children: isZh ? "删除回复？" : "Delete reply?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
					"data-inspector-id": "components/comments/CommentsSection/CommentItem/AlertDialogDescription/0",
					"data-inspector-source": "components/comments/CommentsSection.tsx:195:13:b99be45b64c9426b8ddef071ba59d4059a0bfed7293fb6bf31277e3a3ae3c09d:1",
					children: isZh ? "这会永久删除这条回复以及其下的嵌套回复。" : "This will permanently delete this reply and any nested replies under it."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					"data-inspector-id": "components/comments/CommentsSection/CommentItem/AlertDialogCancel/0",
					"data-inspector-source": "components/comments/CommentsSection.tsx:200:13:37972dbfb162614483b527f4357b7cf2af66ba0164bd9e456f722c68b2f7834c:1",
					children: isZh ? "取消" : "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					"data-inspector-id": "components/comments/CommentsSection/CommentItem/AlertDialogAction/506cd8cc8249",
					"data-inspector-source": "components/comments/CommentsSection.tsx:201:13:45bf949ecd197a776c3284bc868fe43ec6e3b080ac1d8800200c7da516bc0514:1",
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: handleDelete,
					children: isZh ? "删除" : "Delete"
				})] })] })
			}),
			replyOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-4 mb-3 flex gap-2 rounded-lg border bg-background p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					"data-inspector-id": "components/comments/CommentsSection/CommentItem/Textarea/90fc258cb435",
					"data-inspector-source": "components/comments/CommentsSection.tsx:211:11:6bce61462b7b357bf6e6f71bb3b54fa84c288295378af459b220b53ab3b0ffbf:1",
					value: replyText,
					onChange: (e) => setReplyText(e.target.value),
					placeholder: isZh ? "写下回复..." : "Write a reply...",
					rows: 1,
					className: "text-sm min-h-[40px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "components/comments/CommentsSection/CommentItem/Button/a7ea3e918b19",
					"data-inspector-source": "components/comments/CommentsSection.tsx:218:11:13d792f04f9179b803e89aaf949d8b0bd5cba8c16a67e7a7c206d7da480f01f7:1",
					size: "sm",
					variant: "coral",
					onClick: handleReply,
					disabled: !replyText.trim() || createComment.isPending,
					children: createComment.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : isZh ? "回复" : "Reply"
				})]
			}),
			(comment.replies || []).map((reply) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentItem, {
				"data-inspector-id": "components/comments/CommentsSection/CommentItem/CommentItem/0",
				"data-inspector-source": "components/comments/CommentsSection.tsx:226:9:51e5201c8d56a6df6328f08ef2202bf9dd0534790f620e7f1b2cc5b7026a5dfe:1",
				comment: reply,
				relationId,
				parentId,
				userId,
				authorName,
				deleteComment,
				createComment,
				updateComment,
				voteSummary,
				toggleVote,
				depth: 1
			}, reply.id))
		]
	});
}
function CommentsSection({ relationId, parentId, compact, hideComposer, openPostHref }) {
	const { user } = useAuth();
	const { i18n } = useTranslation();
	const { toast } = useToast();
	const { data: comments, isLoading } = useComments(relationId, parentId);
	const createComment = useCreateComment();
	const deleteComment = useDeleteComment();
	const updateComment = useUpdateComment();
	const toggleVote = useToggleVote();
	const [newComment, setNewComment] = (0, import_react.useState)("");
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const isZh = i18n.language?.startsWith("zh");
	const commentIds = (0, import_react.useMemo)(() => {
		const ids = [];
		(comments || []).forEach((c) => {
			ids.push(c.id);
			(c.replies || []).forEach((r) => ids.push(r.id));
		});
		return ids;
	}, [comments]);
	const { data: voteSummary = {} } = useVoteSummary(R.commentVotes, commentIds);
	const authorIds = (0, import_react.useMemo)(() => {
		const ids = /* @__PURE__ */ new Set();
		(comments || []).forEach((c) => {
			if (c.author_id) ids.add(String(c.author_id));
			(c.replies || []).forEach((r) => r.author_id && ids.add(String(r.author_id)));
		});
		return Array.from(ids);
	}, [comments]);
	const { data: forumNames } = useQuery({
		queryKey: ["forumNames", authorIds],
		queryFn: () => fetchForumNames(authorIds),
		enabled: authorIds.length > 0
	});
	const authorName = (authorId) => forumNames?.get(Number(authorId)) || "";
	const myWpId = user?.id ? String(user.id).replace(/^wp-/, "") : void 0;
	const handleSubmit = () => {
		if (!newComment.trim()) return;
		if (!user?.id) {
			toast({
				title: isZh ? "请先登录再评论" : "Please sign in to comment",
				variant: "destructive"
			});
			return;
		}
		createComment.mutate({
			relationId,
			parentId,
			content: newComment.trim()
		}, {
			onSuccess: () => {
				setNewComment("");
				setExpanded(true);
			},
			onError: (err) => toast({
				title: isZh ? "评论失败" : "Failed to comment",
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const commentCount = (comments || []).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
	if (compact && !expanded && commentCount === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/comments/CommentsSection/CommentsSection/div/0",
		"data-inspector-source": "components/comments/CommentsSection.tsx:304:7:dc1658eb2875b036fddc979e4557c89e49521a920f25430ddedcaef8165fa065:1",
		className: "flex items-center gap-2 mt-2 flex-wrap",
		children: [openPostHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
			"data-inspector-id": "components/comments/CommentsSection/CommentsSection/Link/0",
			"data-inspector-source": "components/comments/CommentsSection.tsx:306:11:d7207977f5ea0b5c5ce3e8307594b297b76b9914e357f73b7ebe1f1928acfecd:1",
			to: openPostHref,
			className: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" }), isZh ? "打开讨论" : "Open discussion"]
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			"data-inspector-id": "components/comments/CommentsSection/CommentsSection/button/49ec40d672a4",
			"data-inspector-source": "components/comments/CommentsSection.tsx:311:9:531de094e543e84b931063f332398a1934478c8e89ae2777f66c01dc07111df8:1",
			className: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors",
			onClick: () => setExpanded(true),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" }), isZh ? "回复" : "Reply"]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/comments/CommentsSection/CommentsSection/div/1",
		"data-inspector-source": "components/comments/CommentsSection.tsx:323:5:d884f14bafcf767c6ccb166416fc826c418c508be4920214ff7c3c97fc49b42f:1",
		className: compact ? "mt-2" : "mt-3",
		children: [compact && commentCount > 0 && !expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "components/comments/CommentsSection/CommentsSection/div/2",
			"data-inspector-source": "components/comments/CommentsSection.tsx:326:9:5112f1212f2587180615e0931852f6a5c52ad5d88929160e771169ef630097e9:1",
			className: "flex items-center gap-2 flex-wrap",
			children: [openPostHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
				"data-inspector-id": "components/comments/CommentsSection/CommentsSection/Link/1",
				"data-inspector-source": "components/comments/CommentsSection.tsx:328:13:37dbda16196794d070362de438e7ef3f876d0a7900cae90b371ae7b8abab3152:1",
				to: openPostHref,
				className: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" }), isZh ? "打开讨论" : "Open discussion"]
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				"data-inspector-id": "components/comments/CommentsSection/CommentsSection/button/49ec40d672a4",
				"data-inspector-source": "components/comments/CommentsSection.tsx:333:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
				className: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors",
				onClick: () => setExpanded(true),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" }),
					commentCount,
					" ",
					isZh ? "条回复" : commentCount === 1 ? "reply" : "replies",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3 w-3" })
				]
			})]
		}), (!compact || expanded) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			compact && commentCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				"data-inspector-id": "components/comments/CommentsSection/CommentsSection/button/49ec40d672a4",
				"data-inspector-source": "components/comments/CommentsSection.tsx:347:13:a3b579ee303d0cab98ee81bdba245eb3089583d5c87a311fe484ba754cd07fc0:1",
				className: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors mb-2",
				onClick: () => setExpanded(false),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" }),
					commentCount,
					" ",
					isZh ? "条回复" : commentCount === 1 ? "reply" : "replies",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-3 w-3" })
				]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center py-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/comments/CommentsSection/CommentsSection/div/3",
				"data-inspector-source": "components/comments/CommentsSection.tsx:362:13:16f67f86847ab5533c5e6d54ed6042f772b1e3af77ed438e82802871142ae904:1",
				className: "space-y-1",
				children: (comments || []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentItem, {
					"data-inspector-id": "components/comments/CommentsSection/CommentsSection/CommentItem/0",
					"data-inspector-source": "components/comments/CommentsSection.tsx:364:17:04983a6897cab6a39395a074c08bb076f2a38327eb41399556d1fe1e618c0dd3:1",
					comment: c,
					relationId,
					parentId,
					userId: myWpId,
					authorName,
					deleteComment,
					createComment,
					updateComment,
					voteSummary,
					toggleVote,
					depth: 0
				}, c.id))
			}),
			!hideComposer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 mt-3 rounded-xl border bg-background p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					"data-inspector-id": "components/comments/CommentsSection/CommentsSection/Textarea/6eb099b34898",
					"data-inspector-source": "components/comments/CommentsSection.tsx:385:15:19b1700d5aeef8d6ccabffbbf2bfb02225999faabede6de06f990f03ba28fda8:1",
					value: newComment,
					onChange: (e) => setNewComment(e.target.value),
					placeholder: compact ? isZh ? "写下回复..." : "Write a reply..." : isZh ? "添加评论..." : "Add a comment...",
					rows: 1,
					className: "text-sm min-h-[44px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "components/comments/CommentsSection/CommentsSection/Button/8cdee946b60f",
					"data-inspector-source": "components/comments/CommentsSection.tsx:392:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
					size: "sm",
					variant: "coral",
					onClick: handleSubmit,
					disabled: !newComment.trim() || createComment.isPending,
					className: "shrink-0",
					children: createComment.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3 w-3" })
				})]
			})
		] })]
	});
}
//#endregion
export { CommentsSection as t };
