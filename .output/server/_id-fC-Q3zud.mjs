import { s as __toESM } from "./_runtime.mjs";
import { i as require_react } from "./_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./_ssr/button-DgaEzEqC.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-DGU2jav_.mjs";
import { t as Badge } from "./_ssr/badge-B2YCAhUo.mjs";
import { t as Input } from "./_ssr/input-JWLlmFeK.mjs";
import { t as Textarea } from "./_ssr/textarea-ZNemOC_7.mjs";
import { n as R } from "./_ssr/wp-schema-Dnlz0TVP.mjs";
import { Zn as ArrowLeft, b as ThumbsUp, cn as Ellipsis, jt as LoaderCircle, ut as Pencil, x as ThumbsDown, y as Trash2 } from "./_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-DHxbK-sS.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { Mt as useEntityCategoryOptions, Nt as useEntityCustomFieldValues, Tt as useDeletePost, _n as usePost, br as useVoteCount, lt as useCustomFieldTypes, mn as useMyProfile, pr as useUpdatePost, qn as useToggleVote, vn as usePostTypes, z as useCategoryTypes } from "./_ssr/use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./_ssr/use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-BD51KPR_.mjs";
import { n as useAuth } from "./_ssr/AuthContext-BAA6n6xi.mjs";
import { a as useParams$1, i as useNavigate$1, t as Link$1 } from "./_ssr/router-compat-CRbRSfhz.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./_ssr/dropdown-menu-DwzEkV7i.mjs";
import { t as CommentsSection } from "./_ssr/CommentsSection-Dr3pAlaO.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BRV0UAw9.mjs";
import { t as Separator } from "./_ssr/separator-BD-dtN1z.mjs";
import { n as formatDistanceToNow, r as enUS, t as zhCN } from "./_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-fC-Q3zud.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArticleEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		"data-inspector-id": "pages/ArticlePost/ArticleEditorDialog/Dialog/74413d9c17b8",
		"data-inspector-source": "pages/ArticlePost.tsx:25:5:1ccf9e54b65e83e6b93d88e4615c4822c95bb446b111e5596f76ba65c22d896c:1",
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				"data-inspector-id": "pages/ArticlePost/ArticleEditorDialog/DialogTitle/0",
				"data-inspector-source": "pages/ArticlePost.tsx:27:23:8e217b111e72814f66f7cfdd1171d6d4f2c47c1736d779a9460860a24dc4a982:1",
				children: isZh ? "编辑文章" : "Edit Article"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "pages/ArticlePost/ArticleEditorDialog/Input/abdc623501f5",
						"data-inspector-source": "pages/ArticlePost.tsx:29:11:ecf5122734c82236ab9c100a7d39597f09a6c72abd94d2d50009b1098b838419:1",
						placeholder: isZh ? "标题" : "Title",
						value: title,
						onChange: (e) => onTitleChange(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"data-inspector-id": "pages/ArticlePost/ArticleEditorDialog/Textarea/4712a300f7a7",
						"data-inspector-source": "pages/ArticlePost.tsx:30:11:bade0d9f3a68a1efb749ac25a7c9a65b66f27457061244e109ff1c05ec06a7e1:1",
						placeholder: isZh ? "内容..." : "Content...",
						value: content,
						onChange: (e) => onContentChange(e.target.value),
						rows: 12
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/ArticlePost/ArticleEditorDialog/Button/9f73905f7d64",
						"data-inspector-source": "pages/ArticlePost.tsx:31:11:e1313fbd3ea94c30591941691f7e752518bf31ec140606edd57b020cb58f5a0a:1",
						onClick: onSubmit,
						disabled: pending,
						className: "w-full",
						variant: "coral",
						children: [pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null, isZh ? "保存修改" : "Save Changes"]
					})
				]
			})]
		})
	});
}
function ArticlePost() {
	const { id } = useParams$1();
	const navigate = useNavigate$1();
	const { i18n } = useTranslation();
	const { isAuthenticated } = useAuth();
	const { toast } = useToast();
	const { data: profile } = useMyProfile();
	const { data: post, isLoading } = usePost(id || null, "challenged_article");
	const { data: articleSubtypes = [] } = usePostTypes(2);
	const { data: categoryTypes = [] } = useCategoryTypes();
	const { data: entityCategories = [] } = useEntityCategoryOptions(id || null);
	const { data: customFieldTypes = [] } = useCustomFieldTypes();
	const { data: customFieldValues = [] } = useEntityCustomFieldValues(id || null);
	const deletePost = useDeletePost();
	const updatePost = useUpdatePost();
	const toggleVote = useToggleVote();
	const { data: voteState = {
		score: 0,
		upvotes: 0,
		downvotes: 0,
		userVote: 0
	} } = useVoteCount(R.communityPostVotes, id || null);
	const isZh = i18n.language?.startsWith("zh");
	const dateLocale = isZh ? zhCN : enUS;
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = (0, import_react.useState)(false);
	const [editTitle, setEditTitle] = (0, import_react.useState)("");
	const [editContent, setEditContent] = (0, import_react.useState)("");
	const subtype = articleSubtypes.find((item) => item.id === post?.child_post_type_id);
	const categorySummary = entityCategories.map((item) => {
		const type = categoryTypes.find((ct) => ct.id === item.category_type_id);
		return {
			...item,
			typeName: type?.name || type?.key || item.category_type_id
		};
	});
	const customFieldSummary = customFieldValues.map((item) => {
		const type = customFieldTypes.find((ct) => ct.id === item.custom_field_type_id);
		return {
			...item,
			fieldName: type?.name || type?.key || item.custom_field_type_id
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/ArticlePost/ArticlePost/div/0",
		"data-inspector-source": "pages/ArticlePost.tsx:74:5:374281a29d00058afa5108b71086b97c62a480dee2d31e310876e4208a3c7506:1",
		className: "container max-w-5xl mx-auto py-6 px-4 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleEditorDialog, {
				"data-inspector-id": "pages/ArticlePost/ArticlePost/ArticleEditorDialog/e1ed6dcc18a6",
				"data-inspector-source": "pages/ArticlePost.tsx:75:7:73afbec422b80bbc4f08b6c9e32c9b7e095f6e80a381776dc485a235109cc74b:1",
				open: editing,
				onOpenChange: setEditing,
				title: editTitle,
				content: editContent,
				isZh,
				pending: updatePost.isPending,
				onTitleChange: setEditTitle,
				onContentChange: setEditContent,
				onSubmit: () => {
					if (!post || !editTitle.trim() || !editContent.trim()) {
						toast({
							title: isZh ? "请填写标题和内容" : "Please fill in title and content",
							variant: "destructive"
						});
						return;
					}
					updatePost.mutate({
						id: post.id,
						title: editTitle.trim(),
						content: editContent.trim()
					}, { onSuccess: () => setEditing(false) });
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				"data-inspector-id": "pages/ArticlePost/ArticlePost/AlertDialog/ca46ee90b285",
				"data-inspector-source": "pages/ArticlePost.tsx:83:7:89c5d7f734c64a49a5c0bd383e4fdb9c681784cb9dee8ef838a03cebe5a190a9:1",
				open: confirmDeleteOpen,
				onOpenChange: setConfirmDeleteOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
					"data-inspector-id": "pages/ArticlePost/ArticlePost/AlertDialogTitle/0",
					"data-inspector-source": "pages/ArticlePost.tsx:86:13:bd6e2ca91040ef71a061f2239cf355f5afdd0e10ac207c94dbec881584573ebb:1",
					children: isZh ? "删除文章？" : "Delete article?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
					"data-inspector-id": "pages/ArticlePost/ArticlePost/AlertDialogDescription/0",
					"data-inspector-source": "pages/ArticlePost.tsx:87:13:9baccf531c79b9b1c8a5b58c883a5099e6ac1884dd0e5ff9d4c66666eb752b45:1",
					children: isZh ? "这会永久删除该文章以及下面的评论。" : "This will permanently delete this article and its discussion."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					"data-inspector-id": "pages/ArticlePost/ArticlePost/AlertDialogCancel/0",
					"data-inspector-source": "pages/ArticlePost.tsx:90:13:37972dbfb162614483b527f4357b7cf2af66ba0164bd9e456f722c68b2f7834c:1",
					children: isZh ? "取消" : "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					"data-inspector-id": "pages/ArticlePost/ArticlePost/AlertDialogAction/037a7f93594e",
					"data-inspector-source": "pages/ArticlePost.tsx:91:13:5eaad3500bc41fc47795b2333d5c3aa4dc51cc6dca2ae20ea9a2948c2db46eeb:1",
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => post && deletePost.mutate(post.id, { onSuccess: () => navigate("/articles") }),
					children: isZh ? "删除" : "Delete"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "pages/ArticlePost/ArticlePost/Button/0",
				"data-inspector-source": "pages/ArticlePost.tsx:96:7:d99412ef7de99dabb454e946ce56486e1e4b067e72b88333a91dfa0436bdb2fa:1",
				variant: "ghost",
				asChild: true,
				className: "px-0 hover:bg-transparent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					"data-inspector-id": "pages/ArticlePost/ArticlePost/Link/0",
					"data-inspector-source": "pages/ArticlePost.tsx:96:77:d99412ef7de99dabb454e946ce56486e1e4b067e72b88333a91dfa0436bdb2fa:1",
					to: "/articles",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-2" }), isZh ? "返回文章" : "Back to Articles"]
				})
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-2/3" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-5/6" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-4/6" })
				]
			})] }) : !post ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				"data-inspector-id": "pages/ArticlePost/ArticlePost/CardContent/0",
				"data-inspector-source": "pages/ArticlePost.tsx:101:15:b1dc5ae3845fa4b3b25676ff6aff6740a2a8f6dc75b449f2becf9685732ace33:1",
				className: "py-12 text-center text-muted-foreground",
				children: isZh ? "文章不存在或已被删除" : "Article not found or deleted"
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/ArticlePost/ArticlePost/div/1",
						"data-inspector-source": "pages/ArticlePost.tsx:105:13:16b268d9aa91b80ed65521ff229307b7d6f34741a166fb34ff25098442df861c:1",
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/div/2",
								"data-inspector-source": "pages/ArticlePost.tsx:107:17:75e17054c58be119d3723c332e8e15c689ea64d4a53009bab7d97283b001753f:1",
								className: "flex items-center gap-2 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/ArticlePost/ArticlePost/span/0",
										"data-inspector-source": "pages/ArticlePost.tsx:108:19:2872f80aaa12ba42b298bdd6de70ac6642aa9f6a89ad1636f8d96b2b93b89dc7:1",
										className: "font-medium text-sm text-foreground",
										children: post.author?.full_name || (isZh ? "未填姓名" : "No name")
									}),
									subtype ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										"data-inspector-id": "pages/ArticlePost/ArticlePost/Badge/0",
										"data-inspector-source": "pages/ArticlePost.tsx:109:30:ab60eb0ba785e957dc7874dbccdf0ed38de036b28ddd3f36b10454c4ea7c6f8b:1",
										variant: "outline",
										children: subtype.name || subtype.key
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/ArticlePost/ArticlePost/span/1",
										"data-inspector-source": "pages/ArticlePost.tsx:110:19:bf58dee548b9108812896949f8d082f841f80c2d32737e24e5ea8375dfd04c38:1",
										className: "text-[11px] text-muted-foreground ml-auto shrink-0",
										children: formatDistanceToNow(new Date(post.created_at), {
											addSuffix: true,
											locale: dateLocale
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/h1/0",
								"data-inspector-source": "pages/ArticlePost.tsx:112:17:4699db7e21056aa928879856cd50b57d41f1efa716e085678eeae8f91a7a2a8e:1",
								className: "text-3xl font-semibold mt-2 text-foreground",
								children: post.title
							})]
						}), profile?.user_id === post.author_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/Button/1",
								"data-inspector-source": "pages/ArticlePost.tsx:116:48:b106ce7b20159aa6bdc1bc87a6098cd47a11927f383363135cf2136a4b63d395:1",
								variant: "ghost",
								size: "icon",
								className: "min-h-11 min-w-11 shrink-0",
								"aria-label": isZh ? "文章操作" : "Article actions",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/DropdownMenuItem/eb6c45bd4a93",
								"data-inspector-source": "pages/ArticlePost.tsx:118:21:3170675e98509ae17441c5fec3e8f75374d5e42fd91ee3838086c1853ddebb45:1",
								onClick: () => {
									setEditTitle(post.title || "");
									setEditContent(post.content || "");
									setEditing(true);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4 mr-2" }), isZh ? "编辑" : "Edit"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/DropdownMenuItem/ca46ee90b285",
								"data-inspector-source": "pages/ArticlePost.tsx:119:21:d3cf2f9d0095baf6ab80ba66646f16fbbcff01941719a8531502f26fbe86df59:1",
								onClick: () => setConfirmDeleteOpen(true),
								className: "text-destructive focus:text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-2" }), isZh ? "删除" : "Delete"]
							})]
						})] }) : null]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/ArticlePost/ArticlePost/CardContent/1",
					"data-inspector-source": "pages/ArticlePost.tsx:125:11:b8670205a627aeb5a6d66dcb70ea4fbeab6d3f8504bb29520d6933727e5645f1:1",
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/ArticlePost/ArticlePost/div/3",
							"data-inspector-source": "pages/ArticlePost.tsx:126:13:a9200bd8b3d71e200838378d184ffe0dbbf127f7f499fd44c93298a50ea2e84d:1",
							className: "text-base leading-8 text-foreground whitespace-pre-wrap",
							children: post.content
						}),
						categorySummary.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/h2/0",
								"data-inspector-source": "pages/ArticlePost.tsx:127:70:c7f4d7fb76d326aa89e117ad16cf30a100799849b26e84f720f4dc025a3b28c5:1",
								className: "text-sm font-semibold text-foreground",
								children: isZh ? "分类" : "Categories"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/div/4",
								"data-inspector-source": "pages/ArticlePost.tsx:127:157:c7f4d7fb76d326aa89e117ad16cf30a100799849b26e84f720f4dc025a3b28c5:1",
								className: "flex gap-2 flex-wrap",
								children: categorySummary.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									"data-inspector-id": "pages/ArticlePost/ArticlePost/Badge/1",
									"data-inspector-source": "pages/ArticlePost.tsx:127:226:c7f4d7fb76d326aa89e117ad16cf30a100799849b26e84f720f4dc025a3b28c5:1",
									variant: "secondary",
									children: item.typeName
								}, item.id))
							})]
						}) : null,
						customFieldSummary.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/h2/1",
								"data-inspector-source": "pages/ArticlePost.tsx:128:73:6ecb83f17b9742d1fe1219180db4ee4d34594ea2184677d397b2bf4082bb2dfb:1",
								className: "text-sm font-semibold text-foreground",
								children: isZh ? "自定义字段" : "Custom Fields"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/div/5",
								"data-inspector-source": "pages/ArticlePost.tsx:128:166:6ecb83f17b9742d1fe1219180db4ee4d34594ea2184677d397b2bf4082bb2dfb:0",
								className: "grid gap-2",
								children: customFieldSummary.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/ArticlePost/ArticlePost/div/6",
									"data-inspector-source": "pages/ArticlePost.tsx:128:228:6ecb83f17b9742d1fe1219180db4ee4d34594ea2184677d397b2bf4082bb2dfb:0",
									className: "text-sm text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-id": "pages/ArticlePost/ArticlePost/span/2",
										"data-inspector-source": "pages/ArticlePost.tsx:128:289:6ecb83f17b9742d1fe1219180db4ee4d34594ea2184677d397b2bf4082bb2dfb:1",
										className: "font-medium text-foreground mr-2",
										children: [item.fieldName, ":"]
									}), item.value || "-"]
								}, item.id))
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/ArticlePost/ArticlePost/Button/18a04819d85a",
									"data-inspector-source": "pages/ArticlePost.tsx:130:15:f364531afd89f48b87b8235cb88250bbd9425bf8d27373a3eac91c56872bc7a8:1",
									variant: "ghost",
									size: "sm",
									className: `h-8 px-2 ${voteState.userVote === 1 ? "text-primary" : "text-muted-foreground"}`,
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "h-4 w-4 mr-1.5" }), voteState.upvotes]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/ArticlePost/ArticlePost/Button/18a04819d85a",
									"data-inspector-source": "pages/ArticlePost.tsx:131:15:cdff80d74895e9c1e886af0342a13d9624b2a27322a1957d84971fd1a8c1d7ca:1",
									variant: "ghost",
									size: "sm",
									className: `h-8 px-2 ${voteState.userVote === -1 ? "text-destructive" : "text-muted-foreground"}`,
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, { className: "h-4 w-4 mr-1.5" }), voteState.downvotes]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/ArticlePost/ArticlePost/span/3",
									"data-inspector-source": "pages/ArticlePost.tsx:132:15:34aeb23af0e4e237497d6339683842591cb3a9b20c739d381a0431aa11086f80:1",
									className: "text-sm font-medium text-muted-foreground",
									children: isZh ? `总分 ${voteState.score}` : `Score ${voteState.score}`
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/h2/2",
								"data-inspector-source": "pages/ArticlePost.tsx:137:17:b4cce58f5d006ea5e97f6fae2ee9eafe7cd9adb0ebd508a4b93f0aad8e1a780f:1",
								className: "text-lg font-semibold text-foreground",
								children: isZh ? "评论" : "Comments"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/p/0",
								"data-inspector-source": "pages/ArticlePost.tsx:138:17:f404e530c163a46b9e8a49a11afc0d2045e36cc0b064538a0d5e5f63a84c7fe2:1",
								className: "text-sm text-muted-foreground",
								children: isZh ? "文章使用通用 comment/vote 结构。" : "Articles use the shared comment/vote structure."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSection, {
								"data-inspector-id": "pages/ArticlePost/ArticlePost/CommentsSection/0",
								"data-inspector-source": "pages/ArticlePost.tsx:140:15:fdf475120d9b74b41dc7928e148f54cefb477a922809fd228249cfe0d46589c3:1",
								relationId: R.communityPostComments,
								parentId: post.id
							})]
						})
					]
				})]
			})
		]
	});
}
var SplitComponent = ArticlePost;
//#endregion
export { SplitComponent as component };
