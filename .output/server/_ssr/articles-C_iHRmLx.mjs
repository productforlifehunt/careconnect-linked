import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { n as R } from "./wp-schema-Dnlz0TVP.mjs";
import { b as ThumbsUp, cn as Ellipsis, ht as Newspaper, it as Plus, jt as LoaderCircle, ut as Pencil, x as ThumbsDown, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { Tt as useDeletePost, it as useCreatePost, mn as useMyProfile, pr as useUpdatePost, qn as useToggleVote, xr as useVoteSummary, yn as usePosts } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-B2Az5zRn.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Link$1 } from "./router-compat-3gk8yjav.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BlUTKFl7.mjs";
import { n as formatDistanceToNow, r as enUS, t as zhCN } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles-C_iHRmLx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArticleEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isZh ? "编辑文章" : "Edit Article" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/Articles.tsx:48:9:857816ba7611c32773fc9e589773689ef3b6dddccca5a21f8e88269e24854f91:1",
				className: "space-y-4 mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: isZh ? "标题" : "Title",
						value: title,
						onChange: (e) => onTitleChange(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						placeholder: isZh ? "内容..." : "Content...",
						value: content,
						onChange: (e) => onContentChange(e.target.value),
						rows: 10
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onSubmit,
						disabled: pending,
						className: "w-full",
						variant: "coral",
						children: [pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null, isZh ? "保存修改" : "Save Changes"]
					})
				]
			})]
		})
	});
}
function Articles() {
	const { i18n } = useTranslation();
	const { isAuthenticated } = useAuth();
	const { toast } = useToast();
	const { data: profile } = useMyProfile();
	const isZh = i18n.language?.startsWith("zh");
	const area = isZh ? "china" : "global";
	const articlePostType = "challenged_article";
	const [articleScope, setArticleScope] = (0, import_react.useState)("all");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [newTitle, setNewTitle] = (0, import_react.useState)("");
	const [newContent, setNewContent] = (0, import_react.useState)("");
	const [editingArticle, setEditingArticle] = (0, import_react.useState)(null);
	const [editTitle, setEditTitle] = (0, import_react.useState)("");
	const [editContent, setEditContent] = (0, import_react.useState)("");
	const [pendingDeleteArticle, setPendingDeleteArticle] = (0, import_react.useState)(null);
	const { data: posts, isLoading } = usePosts(articlePostType, area);
	const createPost = useCreatePost();
	const deletePost = useDeletePost();
	const updatePost = useUpdatePost();
	const toggleVote = useToggleVote();
	const dateLocale = isZh ? zhCN : enUS;
	const filteredPosts = (posts || []).filter((p) => articleScope === "mine" ? p.author_id === profile?.user_id : true);
	const postIds = (0, import_react.useMemo)(() => filteredPosts.map((p) => p.id), [filteredPosts]);
	const { data: voteSummary = {} } = useVoteSummary(R.communityPostVotes, postIds);
	const handleCreate = () => {
		if (!newTitle.trim() || !newContent.trim()) {
			toast({
				title: isZh ? "请填写标题和内容" : "Please fill in title and content",
				variant: "destructive"
			});
			return;
		}
		createPost.mutate({
			title: newTitle.trim(),
			content: newContent.trim(),
			postType: articlePostType,
			area,
			language: i18n.language
		}, {
			onSuccess: () => {
				setDialogOpen(false);
				setNewTitle("");
				setNewContent("");
				toast({ title: isZh ? "文章已发布" : "Article created" });
			},
			onError: (err) => toast({
				title: isZh ? "发布失败" : "Failed",
				description: err.message,
				variant: "destructive"
			})
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/Articles.tsx:108:5:199d257b696fe3431c7effdcebbe20951935e64a32e2ed5437fae2147ef18ab8:1",
		className: "container max-w-5xl mx-auto py-5 px-4 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleEditorDialog, {
				open: !!editingArticle,
				onOpenChange: (open) => {
					if (!open) setEditingArticle(null);
				},
				title: editTitle,
				content: editContent,
				isZh,
				pending: updatePost.isPending,
				onTitleChange: setEditTitle,
				onContentChange: setEditContent,
				onSubmit: () => {
					if (!editingArticle || !editTitle.trim() || !editContent.trim()) return;
					updatePost.mutate({
						id: editingArticle.id,
						title: editTitle.trim(),
						content: editContent.trim()
					}, { onSuccess: () => setEditingArticle(null) });
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!pendingDeleteArticle,
				onOpenChange: (open) => {
					if (!open) setPendingDeleteArticle(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: isZh ? "删除文章？" : "Delete article?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: isZh ? "这会永久删除该文章。" : "This will permanently delete this article." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: isZh ? "取消" : "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => pendingDeleteArticle && deletePost.mutate(pendingDeleteArticle.id, { onSuccess: () => setPendingDeleteArticle(null) }),
					children: isZh ? "删除" : "Delete"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/Articles.tsx:137:7:df0c7e465ba7b170ccd1257a28d09e3bc69a65156fbe936226d3e5dad31076ea:1",
				className: "flex items-center justify-between gap-4 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/Articles.tsx:138:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/Articles.tsx:139:11:b78b0421f75cf8da3fefc706f3877198fd297e8927588c153868fe8afe4e7e4f:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: isZh ? "文章" : "Articles"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Articles.tsx:140:11:9cc4298e2bef7680194920a2942b7513b28085c2173317371aab1fb310680532:1",
						className: "text-sm text-muted-foreground mt-1",
						children: isZh ? "按类型沉淀经验、专业知识与官方内容" : "Publish user stories, expert insights, and official updates"
					})]
				}), isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open: dialogOpen,
					onOpenChange: setDialogOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "coral",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), isZh ? "写文章" : "New Article"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "sm:max-w-2xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isZh ? "发布新文章" : "Create New Article" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Articles.tsx:149:15:e3e85679ac43c228a2f9ca7b9baecd78557a68c82a2504b1c0278cea418b2ee2:1",
							className: "space-y-4 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: isZh ? "标题" : "Title",
									value: newTitle,
									onChange: (e) => setNewTitle(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: isZh ? "内容..." : "Content...",
									value: newContent,
									onChange: (e) => setNewContent(e.target.value),
									rows: 10
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleCreate,
									disabled: createPost.isPending,
									className: "w-full",
									variant: "coral",
									children: [createPost.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null, isZh ? "发布" : "Publish"]
								})
							]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: articleScope,
				onValueChange: setArticleScope,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "all",
					children: isZh ? "全部文章" : "All Articles"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "mine",
					children: isZh ? "我的文章" : "My Articles"
				})] })
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/Articles.tsx:167:9:7a77f199e068492d79fb7be04e3c369c3896be82bf0ee8570e7bd5e770f6c19a:1",
				className: "flex justify-center py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
			}) : filteredPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-12 text-center text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/Articles.tsx:169:139:00dc98879652e9fe87eb882a267892118318629e25034634d5d1a5317ab7bca4:1",
					children: isZh ? "暂无文章" : "No articles yet"
				})]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/Articles.tsx:171:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: filteredPosts.map((post) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Articles.tsx:177:19:6ba8686ac29b37ed5fb183b7a572c64fb38f60072e8baf9e68383ec954cf55eb:1",
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/Articles.tsx:178:21:1ddf41f097c600aa190b08df66369d0d7867c50ff28cfed2574919f319344215:1",
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Articles.tsx:179:23:ceb3983b3cad51cd46d2b2a78568c0508da0ed0ce78e896d2d15e76e55a9c57a:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/Articles.tsx:180:25:c3426d71db6a80a2880022683bf5b850b148d835c020d512bc1b5016b2435e07:1",
											className: "font-medium text-sm text-foreground",
											children: post.author?.full_name || (isZh ? "未填姓名" : "No name")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/Articles.tsx:181:25:d64c0a2032a1ce532dc78450f72f916efddd1ca6084b6c234d8e5f7da901b40c:1",
											className: "text-[11px] text-muted-foreground ml-auto shrink-0",
											children: formatDistanceToNow(new Date(post.created_at), {
												addSuffix: true,
												locale: dateLocale
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
										to: `/articles/${post.id}`,
										className: "block hover:opacity-90 transition-opacity",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											"data-inspector-source": "pages/Articles.tsx:183:111:9ace0791fadee6c7212988bf162554541ab485676be370f3404004a952859591:1",
											className: "text-lg font-semibold mt-1 text-foreground",
											children: post.title
										})
									})]
								}), profile?.user_id === post.author_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "min-h-11 min-w-11 shrink-0",
										"aria-label": isZh ? "文章操作" : "Article actions",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => {
											setEditingArticle(post);
											setEditTitle(post.title || "");
											setEditContent(post.content || "");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4 mr-2" }), isZh ? "编辑" : "Edit"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => setPendingDeleteArticle(post),
										className: "text-destructive focus:text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-2" }), isZh ? "删除" : "Delete"]
									})]
								})] }) : null]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "pt-0 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/Articles.tsx:197:19:1c1beb9ca4d9599439b6ce8351a28100a4e467ca9885ede6065b17f9bc529ce0:1",
								className: "text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-4",
								children: post.content
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Articles.tsx:198:19:f88d175109737b2ef5180061f1c9ce4d911324f37e1437dc9cd67a8bbd32af5a:1",
								className: "flex items-center gap-3 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "sm",
										className: `h-8 rounded-full px-3 ${voteSummary[post.id]?.userVote === 1 ? "text-primary" : "text-muted-foreground"}`,
										disabled: !isAuthenticated || toggleVote.isPending,
										onClick: () => toggleVote.mutate({
											relationId: R.communityPostVotes,
											parentId: post.id,
											value: 1
										}, { onError: (err) => toast({
											title: isZh ? "投票失败" : "Vote failed",
											description: err.message,
											variant: "destructive"
										}) }),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "h-4 w-4 mr-1.5" }), voteSummary[post.id]?.upvotes || 0]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "sm",
										className: `h-8 rounded-full px-3 ${voteSummary[post.id]?.userVote === -1 ? "text-destructive" : "text-muted-foreground"}`,
										disabled: !isAuthenticated || toggleVote.isPending,
										onClick: () => toggleVote.mutate({
											relationId: R.communityPostVotes,
											parentId: post.id,
											value: -1
										}, { onError: (err) => toast({
											title: isZh ? "投票失败" : "Vote failed",
											description: err.message,
											variant: "destructive"
										}) }),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, { className: "h-4 w-4 mr-1.5" }), voteSummary[post.id]?.downvotes || 0]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/Articles.tsx:201:21:ad676c4eb59c25f7420605bd260ef635ddc5ce79602db9088517655656273fa9:1",
										className: "text-xs font-medium text-muted-foreground",
										children: isZh ? `总分 ${voteSummary[post.id]?.score || 0}` : `Score ${voteSummary[post.id]?.score || 0}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
										to: `/articles/${post.id}`,
										className: "inline-flex h-8 items-center rounded-full border px-3 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20",
										children: isZh ? "阅读全文" : "Read article"
									})
								]
							})]
						})]
					}, post.id);
				})
			})
		]
	});
}
var SplitComponent = Articles;
//#endregion
export { SplitComponent as component };
