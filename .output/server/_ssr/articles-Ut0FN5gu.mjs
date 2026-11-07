import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { n as R } from "./wp-schema-Dnlz0TVP.mjs";
import { b as ThumbsUp, cn as Ellipsis, ht as Newspaper, it as Plus, jt as LoaderCircle, ut as Pencil, x as ThumbsDown, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-C88F3k7U.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { Tt as useDeletePost, it as useCreatePost, mn as useMyProfile, pr as useUpdatePost, qn as useToggleVote, xr as useVoteSummary, yn as usePosts } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BwgHkacp.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BehT_ZHg.mjs";
import { n as formatDistanceToNow, r as enUS, t as zhCN } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles-Ut0FN5gu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArticleEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		"data-inspector-id": "pages/Articles/ArticleEditorDialog/Dialog/0",
		"data-inspector-source": "pages/Articles.tsx:43:5:1ccf9e54b65e83e6b93d88e4615c4822c95bb446b111e5596f76ba65c22d896c:1",
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			"data-inspector-id": "pages/Articles/ArticleEditorDialog/DialogContent/0",
			"data-inspector-source": "pages/Articles.tsx:44:7:005aa25c467b06c277bd21acddc068b4436a2925e5d7a9072b49226a521bb31c:1",
			className: "sm:max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
				"data-inspector-id": "pages/Articles/ArticleEditorDialog/DialogHeader/0",
				"data-inspector-source": "pages/Articles.tsx:45:9:9db98273150bc559dca8500eeb3053480fe8643d6606b91f256a7e3158c9d513:1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					"data-inspector-id": "pages/Articles/ArticleEditorDialog/DialogTitle/0",
					"data-inspector-source": "pages/Articles.tsx:46:11:6c824cd692a20d38593dabc2caf94b7e18bef0e37898b2c571565e16e2a29f0b:1",
					children: isZh ? "编辑文章" : "Edit Article"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Articles/ArticleEditorDialog/div/0",
				"data-inspector-source": "pages/Articles.tsx:48:9:857816ba7611c32773fc9e589773689ef3b6dddccca5a21f8e88269e24854f91:1",
				className: "space-y-4 mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "pages/Articles/ArticleEditorDialog/Input/0",
						"data-inspector-source": "pages/Articles.tsx:49:11:ecf5122734c82236ab9c100a7d39597f09a6c72abd94d2d50009b1098b838419:1",
						placeholder: isZh ? "标题" : "Title",
						value: title,
						onChange: (e) => onTitleChange(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"data-inspector-id": "pages/Articles/ArticleEditorDialog/Textarea/0",
						"data-inspector-source": "pages/Articles.tsx:50:11:e408a9c465e7b5fdaca7fbe2df4128f431810d580fc3e3f3417ac949561486d5:1",
						placeholder: isZh ? "内容..." : "Content...",
						value: content,
						onChange: (e) => onContentChange(e.target.value),
						rows: 10
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/Articles/ArticleEditorDialog/Button/0",
						"data-inspector-source": "pages/Articles.tsx:51:11:8d18d21ccce5bf276246aeb4bd9d52fc5ad5b834d24084ee053ef8ca6f8af471:1",
						onClick: onSubmit,
						disabled: pending,
						className: "w-full",
						variant: "coral",
						children: [pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							"data-inspector-id": "pages/Articles/ArticleEditorDialog/Loader2/0",
							"data-inspector-source": "pages/Articles.tsx:52:24:12f4fa27f8f51023416c8d3b2f9b5fac4a645ba6e0491fb5b6530c5b05e09459:1",
							className: "h-4 w-4 animate-spin mr-2"
						}) : null, isZh ? "保存修改" : "Save Changes"]
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
				"data-inspector-id": "pages/Articles/Articles/ArticleEditorDialog/0",
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
				"data-inspector-id": "pages/Articles/Articles/AlertDialog/0",
				"data-inspector-source": "pages/Articles.tsx:124:7:ba83609df75df73b8c87c7517627303b4fc3a8b56f14dcb433bd89f0628372cb:1",
				open: !!pendingDeleteArticle,
				onOpenChange: (open) => {
					if (!open) setPendingDeleteArticle(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
					"data-inspector-id": "pages/Articles/Articles/AlertDialogContent/0",
					"data-inspector-source": "pages/Articles.tsx:125:9:fe882bff82cf92609c5c378a06ff00f5061eae47f7c332a6d6cc383b3bd43648:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, {
						"data-inspector-id": "pages/Articles/Articles/AlertDialogHeader/0",
						"data-inspector-source": "pages/Articles.tsx:126:11:62e07f561da6944a047b4e012eb2391860120be17ea9744e8c36929801480129:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
							"data-inspector-id": "pages/Articles/Articles/AlertDialogTitle/0",
							"data-inspector-source": "pages/Articles.tsx:127:13:bd6e2ca91040ef71a061f2239cf355f5afdd0e10ac207c94dbec881584573ebb:1",
							children: isZh ? "删除文章？" : "Delete article?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
							"data-inspector-id": "pages/Articles/Articles/AlertDialogDescription/0",
							"data-inspector-source": "pages/Articles.tsx:128:13:c257b20ca3b1445516114ac8f88a22f83dfc48cec2b93cd239c64619666ce68f:1",
							children: isZh ? "这会永久删除该文章。" : "This will permanently delete this article."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
						"data-inspector-id": "pages/Articles/Articles/AlertDialogFooter/0",
						"data-inspector-source": "pages/Articles.tsx:130:11:cd21762e2df7a9f57cbb6fa1f162d0299e5ad7c25832bc9f66493b677e8736df:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
							"data-inspector-id": "pages/Articles/Articles/AlertDialogCancel/0",
							"data-inspector-source": "pages/Articles.tsx:131:13:37972dbfb162614483b527f4357b7cf2af66ba0164bd9e456f722c68b2f7834c:1",
							children: isZh ? "取消" : "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
							"data-inspector-id": "pages/Articles/Articles/AlertDialogAction/0",
							"data-inspector-source": "pages/Articles.tsx:132:13:c0e7d20bd2b35d359601280c550b6133fbcb2ff4d7b915c600abe2a2cf5f37f2:1",
							className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
							onClick: () => pendingDeleteArticle && deletePost.mutate(pendingDeleteArticle.id, { onSuccess: () => setPendingDeleteArticle(null) }),
							children: isZh ? "删除" : "Delete"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Articles/Articles/div/1",
				"data-inspector-source": "pages/Articles.tsx:137:7:df0c7e465ba7b170ccd1257a28d09e3bc69a65156fbe936226d3e5dad31076ea:1",
				className: "flex items-center justify-between gap-4 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Articles/Articles/div/2",
					"data-inspector-source": "pages/Articles.tsx:138:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/Articles/Articles/h1/0",
						"data-inspector-source": "pages/Articles.tsx:139:11:b78b0421f75cf8da3fefc706f3877198fd297e8927588c153868fe8afe4e7e4f:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: isZh ? "文章" : "Articles"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/Articles/Articles/p/0",
						"data-inspector-source": "pages/Articles.tsx:140:11:9cc4298e2bef7680194920a2942b7513b28085c2173317371aab1fb310680532:1",
						className: "text-sm text-muted-foreground mt-1",
						children: isZh ? "按类型沉淀经验、专业知识与官方内容" : "Publish user stories, expert insights, and official updates"
					})]
				}), isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					"data-inspector-id": "pages/Articles/Articles/Dialog/0",
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								"data-inspector-id": "pages/Articles/Articles/Plus/0",
								"data-inspector-source": "pages/Articles.tsx:145:39:c35662e3e7e48be1ea73edc3c9a87e376b9761c224074260edb5dab8a4aa0a6c:1",
								className: "h-4 w-4 mr-1"
							}), isZh ? "写文章" : "New Article"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						"data-inspector-id": "pages/Articles/Articles/DialogContent/0",
						"data-inspector-source": "pages/Articles.tsx:147:13:62b79d0d933a823270e737a73c6982f6de91258c36a04f875c3349b3717ba1f9:1",
						className: "sm:max-w-2xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
							"data-inspector-id": "pages/Articles/Articles/DialogHeader/0",
							"data-inspector-source": "pages/Articles.tsx:148:15:c7d200b7877bd7d6f45390ab2038e5c77e8d22bba41a56c054f9f30f09f0c166:1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								"data-inspector-id": "pages/Articles/Articles/DialogTitle/0",
								"data-inspector-source": "pages/Articles.tsx:148:29:c7d200b7877bd7d6f45390ab2038e5c77e8d22bba41a56c054f9f30f09f0c166:1",
								children: isZh ? "发布新文章" : "Create New Article"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Articles/Articles/div/3",
							"data-inspector-source": "pages/Articles.tsx:149:15:e3e85679ac43c228a2f9ca7b9baecd78557a68c82a2504b1c0278cea418b2ee2:1",
							className: "space-y-4 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/Articles/Articles/Input/0",
									"data-inspector-source": "pages/Articles.tsx:150:17:b1e667cc8a00defb1a9ec9d3a6e9897b2170a249bd69acafb2e3c39037d02b9c:1",
									placeholder: isZh ? "标题" : "Title",
									value: newTitle,
									onChange: (e) => setNewTitle(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"data-inspector-id": "pages/Articles/Articles/Textarea/0",
									"data-inspector-source": "pages/Articles.tsx:151:17:49fa8c2c328ac070933e2c158f5542b3bacb3bfd330c84b9a5fea7eb909df4a6:1",
									placeholder: isZh ? "内容..." : "Content...",
									value: newContent,
									onChange: (e) => setNewContent(e.target.value),
									rows: 10
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/Articles/Articles/Button/1",
									"data-inspector-source": "pages/Articles.tsx:152:17:882bee7d4163db67b7714735dc29d25af6fa582e09e2fff598828498e164fdaa:1",
									onClick: handleCreate,
									disabled: createPost.isPending,
									className: "w-full",
									variant: "coral",
									children: [createPost.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										"data-inspector-id": "pages/Articles/Articles/Loader2/0",
										"data-inspector-source": "pages/Articles.tsx:152:139:882bee7d4163db67b7714735dc29d25af6fa582e09e2fff598828498e164fdaa:1",
										className: "h-4 w-4 animate-spin mr-2"
									}) : null, isZh ? "发布" : "Publish"]
								})
							]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				"data-inspector-id": "pages/Articles/Articles/Tabs/0",
				"data-inspector-source": "pages/Articles.tsx:159:7:1997a788074a1dfdac236e19fd4c023c57c058c29607b03299767cf84f2d68b0:1",
				value: articleScope,
				onValueChange: setArticleScope,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					"data-inspector-id": "pages/Articles/Articles/TabsList/0",
					"data-inspector-source": "pages/Articles.tsx:160:9:4b05dc84f0cdcbdff176b1e2f9c69a11169a1c8c095e9713d91cf612dabd54c4:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						"data-inspector-id": "pages/Articles/Articles/TabsTrigger/0",
						"data-inspector-source": "pages/Articles.tsx:161:11:e75998de49c59a22c79f33206c9a9e04aa3b9404bef8ac5525152d77f27de7d7:1",
						value: "all",
						children: isZh ? "全部文章" : "All Articles"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						"data-inspector-id": "pages/Articles/Articles/TabsTrigger/1",
						"data-inspector-source": "pages/Articles.tsx:162:11:65430f534ee1da32aa6e0207e3ddfdebbe1f2ef466844c423a933140f90ec1ab:1",
						value: "mine",
						children: isZh ? "我的文章" : "My Articles"
					})]
				})
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/Articles/Articles/div/4",
				"data-inspector-source": "pages/Articles.tsx:167:9:7a77f199e068492d79fb7be04e3c369c3896be82bf0ee8570e7bd5e770f6c19a:1",
				className: "flex justify-center py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					"data-inspector-id": "pages/Articles/Articles/Loader2/1",
					"data-inspector-source": "pages/Articles.tsx:167:52:7a77f199e068492d79fb7be04e3c369c3896be82bf0ee8570e7bd5e770f6c19a:1",
					className: "h-6 w-6 animate-spin text-muted-foreground"
				})
			}) : filteredPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				"data-inspector-id": "pages/Articles/Articles/Card/0",
				"data-inspector-source": "pages/Articles.tsx:169:9:00dc98879652e9fe87eb882a267892118318629e25034634d5d1a5317ab7bca4:1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/Articles/Articles/CardContent/0",
					"data-inspector-source": "pages/Articles.tsx:169:15:00dc98879652e9fe87eb882a267892118318629e25034634d5d1a5317ab7bca4:1",
					className: "py-12 text-center text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, {
						"data-inspector-id": "pages/Articles/Articles/Newspaper/0",
						"data-inspector-source": "pages/Articles.tsx:169:80:00dc98879652e9fe87eb882a267892118318629e25034634d5d1a5317ab7bca4:1",
						className: "h-10 w-10 mx-auto mb-3 opacity-40"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/Articles/Articles/p/1",
						"data-inspector-source": "pages/Articles.tsx:169:139:00dc98879652e9fe87eb882a267892118318629e25034634d5d1a5317ab7bca4:1",
						children: isZh ? "暂无文章" : "No articles yet"
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/Articles/Articles/div/5",
				"data-inspector-source": "pages/Articles.tsx:171:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: filteredPosts.map((post) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						"data-inspector-id": "pages/Articles/Articles/Card/1",
						"data-inspector-source": "pages/Articles.tsx:175:15:a235c436eb5e6b20f7ac142a5624e3cfcf6f85962cc4cbf13f2cfac787299b22:1",
						className: "overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							"data-inspector-id": "pages/Articles/Articles/CardHeader/0",
							"data-inspector-source": "pages/Articles.tsx:176:17:a3a082b55eb906a85c8da94c5bb4963ce036a949a15ec5dc06068cb95f89ae01:1",
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Articles/Articles/div/6",
								"data-inspector-source": "pages/Articles.tsx:177:19:6ba8686ac29b37ed5fb183b7a572c64fb38f60072e8baf9e68383ec954cf55eb:1",
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Articles/Articles/div/7",
									"data-inspector-source": "pages/Articles.tsx:178:21:1ddf41f097c600aa190b08df66369d0d7867c50ff28cfed2574919f319344215:1",
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Articles/Articles/div/8",
										"data-inspector-source": "pages/Articles.tsx:179:23:ceb3983b3cad51cd46d2b2a78568c0508da0ed0ce78e896d2d15e76e55a9c57a:1",
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
								}), profile?.user_id === post.author_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
									"data-inspector-id": "pages/Articles/Articles/DropdownMenu/0",
									"data-inspector-source": "pages/Articles.tsx:186:23:df1d8b4686a402eb3cef0789a891738c5a362b229e8694baa24dcea652802c38:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										"data-inspector-id": "pages/Articles/Articles/DropdownMenuTrigger/0",
										"data-inspector-source": "pages/Articles.tsx:187:25:6c22cf73ba6f4ccbe8b47bc7bbfcf22d0b4d9af3b373939021a74ed9e37eed98:1",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "pages/Articles/Articles/Button/2",
											"data-inspector-source": "pages/Articles.tsx:187:54:6c22cf73ba6f4ccbe8b47bc7bbfcf22d0b4d9af3b373939021a74ed9e37eed98:1",
											variant: "ghost",
											size: "icon",
											className: "min-h-11 min-w-11 shrink-0",
											"aria-label": isZh ? "文章操作" : "Article actions",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
												"data-inspector-id": "pages/Articles/Articles/MoreHorizontal/0",
												"data-inspector-source": "pages/Articles.tsx:187:176:6c22cf73ba6f4ccbe8b47bc7bbfcf22d0b4d9af3b373939021a74ed9e37eed98:1",
												className: "h-4 w-4"
											})
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
										"data-inspector-id": "pages/Articles/Articles/DropdownMenuContent/0",
										"data-inspector-source": "pages/Articles.tsx:188:25:0f45d75bf20bc65b8a4baa4978b6441b377fdcb611e52b5420e37d45c80ad790:1",
										align: "end",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											"data-inspector-id": "pages/Articles/Articles/DropdownMenuItem/0",
											"data-inspector-source": "pages/Articles.tsx:189:27:a351117d11c25d69ed2499ef76f4481fbb3249a5a1931ba9b1efbd6355855ea1:1",
											onClick: () => {
												setEditingArticle(post);
												setEditTitle(post.title || "");
												setEditContent(post.content || "");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
												"data-inspector-id": "pages/Articles/Articles/Pencil/0",
												"data-inspector-source": "pages/Articles.tsx:189:158:a351117d11c25d69ed2499ef76f4481fbb3249a5a1931ba9b1efbd6355855ea1:1",
												className: "h-4 w-4 mr-2"
											}), isZh ? "编辑" : "Edit"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											"data-inspector-id": "pages/Articles/Articles/DropdownMenuItem/1",
											"data-inspector-source": "pages/Articles.tsx:190:27:a4b5219fe489208e91dff1fb6b5b515f9e8c7b0c5b5ef60d32e178cf9f702677:1",
											onClick: () => setPendingDeleteArticle(post),
											className: "text-destructive focus:text-destructive",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
												"data-inspector-id": "pages/Articles/Articles/Trash2/0",
												"data-inspector-source": "pages/Articles.tsx:190:143:a4b5219fe489208e91dff1fb6b5b515f9e8c7b0c5b5ef60d32e178cf9f702677:1",
												className: "h-4 w-4 mr-2"
											}), isZh ? "删除" : "Delete"]
										})]
									})]
								}) : null]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							"data-inspector-id": "pages/Articles/Articles/CardContent/1",
							"data-inspector-source": "pages/Articles.tsx:196:17:6f9cecb67eebf7d4568514ba0f899d8764dd37b0e19e981e3101a9a757362bc0:1",
							className: "pt-0 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Articles/Articles/p/2",
								"data-inspector-source": "pages/Articles.tsx:197:19:1c1beb9ca4d9599439b6ce8351a28100a4e467ca9885ede6065b17f9bc529ce0:1",
								className: "text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-4",
								children: post.content
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Articles/Articles/div/9",
								"data-inspector-source": "pages/Articles.tsx:198:19:f88d175109737b2ef5180061f1c9ce4d911324f37e1437dc9cd67a8bbd32af5a:1",
								className: "flex items-center gap-3 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "pages/Articles/Articles/Button/3",
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
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, {
											"data-inspector-id": "pages/Articles/Articles/ThumbsUp/0",
											"data-inspector-source": "pages/Articles.tsx:199:453:7183e797b366356f634053117074a80529b5a40d3ee15aeee1838230571e9da1:1",
											className: "h-4 w-4 mr-1.5"
										}), voteSummary[post.id]?.upvotes || 0]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "pages/Articles/Articles/Button/4",
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
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, {
											"data-inspector-id": "pages/Articles/Articles/ThumbsDown/0",
											"data-inspector-source": "pages/Articles.tsx:200:459:f5b75f30c49830f1a5d52a1f32754a76603fc66137a3c38eb1360b762a63fcd7:1",
											className: "h-4 w-4 mr-1.5"
										}), voteSummary[post.id]?.downvotes || 0]
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
