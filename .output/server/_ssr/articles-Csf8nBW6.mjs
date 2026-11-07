import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { n as R } from "./wp-schema-Dnlz0TVP.mjs";
import { b as ThumbsUp, cn as Ellipsis, ht as Newspaper, it as Plus, jt as LoaderCircle, ut as Pencil, x as ThumbsDown, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-DHxbK-sS.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { Tt as useDeletePost, it as useCreatePost, mn as useMyProfile, pr as useUpdatePost, qn as useToggleVote, xr as useVoteSummary, yn as usePosts } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BD51KPR_.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-DwzEkV7i.mjs";
import { n as formatDistanceToNow, r as enUS, t as zhCN } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles-Csf8nBW6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArticleEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		"data-inspector-id": "pages/Articles/ArticleEditorDialog/Dialog/74413d9c17b8",
		"data-inspector-source": "pages/Articles.tsx:43:5:1ccf9e54b65e83e6b93d88e4615c4822c95bb446b111e5596f76ba65c22d896c:1",
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				"data-inspector-id": "pages/Articles/ArticleEditorDialog/DialogTitle/0",
				"data-inspector-source": "pages/Articles.tsx:46:11:6c824cd692a20d38593dabc2caf94b7e18bef0e37898b2c571565e16e2a29f0b:1",
				children: isZh ? "编辑文章" : "Edit Article"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "pages/Articles/ArticleEditorDialog/Input/abdc623501f5",
						"data-inspector-source": "pages/Articles.tsx:49:11:ecf5122734c82236ab9c100a7d39597f09a6c72abd94d2d50009b1098b838419:1",
						placeholder: isZh ? "标题" : "Title",
						value: title,
						onChange: (e) => onTitleChange(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"data-inspector-id": "pages/Articles/ArticleEditorDialog/Textarea/4712a300f7a7",
						"data-inspector-source": "pages/Articles.tsx:50:11:e408a9c465e7b5fdaca7fbe2df4128f431810d580fc3e3f3417ac949561486d5:1",
						placeholder: isZh ? "内容..." : "Content...",
						value: content,
						onChange: (e) => onContentChange(e.target.value),
						rows: 10
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/Articles/ArticleEditorDialog/Button/9f73905f7d64",
						"data-inspector-source": "pages/Articles.tsx:51:11:8d18d21ccce5bf276246aeb4bd9d52fc5ad5b834d24084ee053ef8ca6f8af471:1",
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
		"data-inspector-id": "pages/Articles/Articles/div/0",
		"data-inspector-source": "pages/Articles.tsx:108:5:199d257b696fe3431c7effdcebbe20951935e64a32e2ed5437fae2147ef18ab8:1",
		className: "container max-w-5xl mx-auto py-5 px-4 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleEditorDialog, {
				"data-inspector-id": "pages/Articles/Articles/ArticleEditorDialog/f6c12cf22f61",
				"data-inspector-source": "pages/Articles.tsx:109:7:094fc197b55e480b86945d71ee68b65e0859d2bc2e2a4c31ca450a1180abe951:1",
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
				"data-inspector-id": "pages/Articles/Articles/AlertDialog/645844879d0e",
				"data-inspector-source": "pages/Articles.tsx:124:7:ba83609df75df73b8c87c7517627303b4fc3a8b56f14dcb433bd89f0628372cb:1",
				open: !!pendingDeleteArticle,
				onOpenChange: (open) => {
					if (!open) setPendingDeleteArticle(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
					"data-inspector-id": "pages/Articles/Articles/AlertDialogTitle/0",
					"data-inspector-source": "pages/Articles.tsx:127:13:bd6e2ca91040ef71a061f2239cf355f5afdd0e10ac207c94dbec881584573ebb:1",
					children: isZh ? "删除文章？" : "Delete article?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
					"data-inspector-id": "pages/Articles/Articles/AlertDialogDescription/0",
					"data-inspector-source": "pages/Articles.tsx:128:13:c257b20ca3b1445516114ac8f88a22f83dfc48cec2b93cd239c64619666ce68f:1",
					children: isZh ? "这会永久删除该文章。" : "This will permanently delete this article."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					"data-inspector-id": "pages/Articles/Articles/AlertDialogCancel/0",
					"data-inspector-source": "pages/Articles.tsx:131:13:37972dbfb162614483b527f4357b7cf2af66ba0164bd9e456f722c68b2f7834c:1",
					children: isZh ? "取消" : "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					"data-inspector-id": "pages/Articles/Articles/AlertDialogAction/fcfba08ea4f4",
					"data-inspector-source": "pages/Articles.tsx:132:13:c0e7d20bd2b35d359601280c550b6133fbcb2ff4d7b915c600abe2a2cf5f37f2:1",
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => pendingDeleteArticle && deletePost.mutate(pendingDeleteArticle.id, { onSuccess: () => setPendingDeleteArticle(null) }),
					children: isZh ? "删除" : "Delete"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Articles/Articles/div/1",
				"data-inspector-source": "pages/Articles.tsx:137:7:df0c7e465ba7b170ccd1257a28d09e3bc69a65156fbe936226d3e5dad31076ea:1",
				className: "flex items-center justify-between gap-4 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-id": "pages/Articles/Articles/h1/0",
					"data-inspector-source": "pages/Articles.tsx:139:11:b78b0421f75cf8da3fefc706f3877198fd297e8927588c153868fe8afe4e7e4f:1",
					className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
					children: isZh ? "文章" : "Articles"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/Articles/Articles/p/0",
					"data-inspector-source": "pages/Articles.tsx:140:11:9cc4298e2bef7680194920a2942b7513b28085c2173317371aab1fb310680532:1",
					className: "text-sm text-muted-foreground mt-1",
					children: isZh ? "按类型沉淀经验、专业知识与官方内容" : "Publish user stories, expert insights, and official updates"
				})] }), isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					"data-inspector-id": "pages/Articles/Articles/Dialog/abc9d1d7c715",
					"data-inspector-source": "pages/Articles.tsx:143:11:34952b6d4b6cec6897519b2f8a6f57a99ba930000698d434a96cdbc168b75c75:1",
					open: dialogOpen,
					onOpenChange: setDialogOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						"data-inspector-id": "pages/Articles/Articles/DialogTrigger/0",
						"data-inspector-source": "pages/Articles.tsx:144:13:32d085b521a93affe14028907d440f2016ff3f115f8eb9f51d1754b84f023c94:1",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Articles/Articles/Button/0",
							"data-inspector-source": "pages/Articles.tsx:145:15:c35662e3e7e48be1ea73edc3c9a87e376b9761c224074260edb5dab8a4aa0a6c:1",
							variant: "coral",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), isZh ? "写文章" : "New Article"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "sm:max-w-2xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							"data-inspector-id": "pages/Articles/Articles/DialogTitle/0",
							"data-inspector-source": "pages/Articles.tsx:148:29:c7d200b7877bd7d6f45390ab2038e5c77e8d22bba41a56c054f9f30f09f0c166:1",
							children: isZh ? "发布新文章" : "Create New Article"
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/Articles/Articles/Input/42b126f80009",
									"data-inspector-source": "pages/Articles.tsx:150:17:b1e667cc8a00defb1a9ec9d3a6e9897b2170a249bd69acafb2e3c39037d02b9c:1",
									placeholder: isZh ? "标题" : "Title",
									value: newTitle,
									onChange: (e) => setNewTitle(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"data-inspector-id": "pages/Articles/Articles/Textarea/2dc699e06054",
									"data-inspector-source": "pages/Articles.tsx:151:17:49fa8c2c328ac070933e2c158f5542b3bacb3bfd330c84b9a5fea7eb909df4a6:1",
									placeholder: isZh ? "内容..." : "Content...",
									value: newContent,
									onChange: (e) => setNewContent(e.target.value),
									rows: 10
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/Articles/Articles/Button/5a58d0863a63",
									"data-inspector-source": "pages/Articles.tsx:152:17:882bee7d4163db67b7714735dc29d25af6fa582e09e2fff598828498e164fdaa:1",
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
				"data-inspector-id": "pages/Articles/Articles/Tabs/929b4a596bba",
				"data-inspector-source": "pages/Articles.tsx:159:7:1997a788074a1dfdac236e19fd4c023c57c058c29607b03299767cf84f2d68b0:1",
				value: articleScope,
				onValueChange: setArticleScope,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					"data-inspector-id": "pages/Articles/Articles/TabsTrigger/0",
					"data-inspector-source": "pages/Articles.tsx:161:11:e75998de49c59a22c79f33206c9a9e04aa3b9404bef8ac5525152d77f27de7d7:1",
					value: "all",
					children: isZh ? "全部文章" : "All Articles"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					"data-inspector-id": "pages/Articles/Articles/TabsTrigger/1",
					"data-inspector-source": "pages/Articles.tsx:162:11:65430f534ee1da32aa6e0207e3ddfdebbe1f2ef466844c423a933140f90ec1ab:1",
					value: "mine",
					children: isZh ? "我的文章" : "My Articles"
				})] })
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
			}) : filteredPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-12 text-center text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/Articles/Articles/p/1",
					"data-inspector-source": "pages/Articles.tsx:169:139:00dc98879652e9fe87eb882a267892118318629e25034634d5d1a5317ab7bca4:1",
					children: isZh ? "暂无文章" : "No articles yet"
				})]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/Articles/Articles/div/2",
				"data-inspector-source": "pages/Articles.tsx:171:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: filteredPosts.map((post) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						"data-inspector-id": "pages/Articles/Articles/Card/0",
						"data-inspector-source": "pages/Articles.tsx:175:15:a235c436eb5e6b20f7ac142a5624e3cfcf6f85962cc4cbf13f2cfac787299b22:1",
						className: "overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Articles/Articles/div/3",
								"data-inspector-source": "pages/Articles.tsx:177:19:6ba8686ac29b37ed5fb183b7a572c64fb38f60072e8baf9e68383ec954cf55eb:1",
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Articles/Articles/span/0",
											"data-inspector-source": "pages/Articles.tsx:180:25:c3426d71db6a80a2880022683bf5b850b148d835c020d512bc1b5016b2435e07:1",
											className: "font-medium text-sm text-foreground",
											children: post.author?.full_name || (isZh ? "未填姓名" : "No name")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Articles/Articles/span/1",
											"data-inspector-source": "pages/Articles.tsx:181:25:d64c0a2032a1ce532dc78450f72f916efddd1ca6084b6c234d8e5f7da901b40c:1",
											className: "text-[11px] text-muted-foreground ml-auto shrink-0",
											children: formatDistanceToNow(new Date(post.created_at), {
												addSuffix: true,
												locale: dateLocale
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
										"data-inspector-id": "pages/Articles/Articles/Link/0",
										"data-inspector-source": "pages/Articles.tsx:183:23:9ace0791fadee6c7212988bf162554541ab485676be370f3404004a952859591:1",
										to: `/articles/${post.id}`,
										className: "block hover:opacity-90 transition-opacity",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											"data-inspector-id": "pages/Articles/Articles/h3/0",
											"data-inspector-source": "pages/Articles.tsx:183:111:9ace0791fadee6c7212988bf162554541ab485676be370f3404004a952859591:1",
											className: "text-lg font-semibold mt-1 text-foreground",
											children: post.title
										})
									})]
								}), profile?.user_id === post.author_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									"data-inspector-id": "pages/Articles/Articles/DropdownMenuTrigger/0",
									"data-inspector-source": "pages/Articles.tsx:187:25:6c22cf73ba6f4ccbe8b47bc7bbfcf22d0b4d9af3b373939021a74ed9e37eed98:1",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "pages/Articles/Articles/Button/1",
										"data-inspector-source": "pages/Articles.tsx:187:54:6c22cf73ba6f4ccbe8b47bc7bbfcf22d0b4d9af3b373939021a74ed9e37eed98:1",
										variant: "ghost",
										size: "icon",
										className: "min-h-11 min-w-11 shrink-0",
										"aria-label": isZh ? "文章操作" : "Article actions",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/Articles/Articles/DropdownMenuItem/2e716756968b",
										"data-inspector-source": "pages/Articles.tsx:189:27:a351117d11c25d69ed2499ef76f4481fbb3249a5a1931ba9b1efbd6355855ea1:1",
										onClick: () => {
											setEditingArticle(post);
											setEditTitle(post.title || "");
											setEditContent(post.content || "");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4 mr-2" }), isZh ? "编辑" : "Edit"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/Articles/Articles/DropdownMenuItem/d3db33367aa6",
										"data-inspector-source": "pages/Articles.tsx:190:27:a4b5219fe489208e91dff1fb6b5b515f9e8c7b0c5b5ef60d32e178cf9f702677:1",
										onClick: () => setPendingDeleteArticle(post),
										className: "text-destructive focus:text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-2" }), isZh ? "删除" : "Delete"]
									})]
								})] }) : null]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "pt-0 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Articles/Articles/p/2",
								"data-inspector-source": "pages/Articles.tsx:197:19:1c1beb9ca4d9599439b6ce8351a28100a4e467ca9885ede6065b17f9bc529ce0:1",
								className: "text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-4",
								children: post.content
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "pages/Articles/Articles/Button/18a04819d85a",
										"data-inspector-source": "pages/Articles.tsx:199:21:7183e797b366356f634053117074a80529b5a40d3ee15aeee1838230571e9da1:1",
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
										"data-inspector-id": "pages/Articles/Articles/Button/18a04819d85a",
										"data-inspector-source": "pages/Articles.tsx:200:21:f5b75f30c49830f1a5d52a1f32754a76603fc66137a3c38eb1360b762a63fcd7:1",
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
										"data-inspector-id": "pages/Articles/Articles/span/2",
										"data-inspector-source": "pages/Articles.tsx:201:21:ad676c4eb59c25f7420605bd260ef635ddc5ce79602db9088517655656273fa9:1",
										className: "text-xs font-medium text-muted-foreground",
										children: isZh ? `总分 ${voteSummary[post.id]?.score || 0}` : `Score ${voteSummary[post.id]?.score || 0}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
										"data-inspector-id": "pages/Articles/Articles/Link/1",
										"data-inspector-source": "pages/Articles.tsx:202:21:8b8f1068252e3f8def01bdbb8ab41bb331d94128fc93547e9159c63a1470119d:1",
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
