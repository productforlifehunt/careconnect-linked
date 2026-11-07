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
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as fetchForumNames } from "./wp-users-C2nRIR2f.mjs";
import { Tt as useDeletePost, it as useCreatePost, pr as useUpdatePost, qn as useToggleVote, xr as useVoteSummary, yn as usePosts } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BwgHkacp.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Link$1 } from "./router-compat-DbWBz8c6.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BehT_ZHg.mjs";
import { t as CommentsSection } from "./CommentsSection-CZ2uU7W1.mjs";
import { t as SiteFeature } from "./SiteFeature-DJLQlP_2.mjs";
import { t as isPostAuthor } from "./ownership-Cg5g5zqD.mjs";
import { n as formatDistanceToNow, r as enUS, t as zhCN } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/community-Dh9LGEQ6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PostEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		"data-inspector-id": "pages/Community/PostEditorDialog/Dialog/74413d9c17b8/0",
		"data-inspector-source": "pages/Community.tsx:46:5:1ccf9e54b65e83e6b93d88e4615c4822c95bb446b111e5596f76ba65c22d896c:1",
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			"data-inspector-id": "pages/Community/PostEditorDialog/DialogContent/0",
			"data-inspector-source": "pages/Community.tsx:47:7:87354396c2b2fe0505b250e2aade3bcaf4fc96bdd01fb4a787b5d2ba55e64b01:1",
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
				"data-inspector-id": "pages/Community/PostEditorDialog/DialogHeader/0",
				"data-inspector-source": "pages/Community.tsx:48:9:9db98273150bc559dca8500eeb3053480fe8643d6606b91f256a7e3158c9d513:1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					"data-inspector-id": "pages/Community/PostEditorDialog/DialogTitle/3c67441cc512/0",
					"data-inspector-source": "pages/Community.tsx:49:11:1a531fae13682bf830e3244d3478f32f48e1af0feb0fa264e6fd7327d4596700:1",
					children: isZh ? "编辑帖子" : "Edit Post"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Community/PostEditorDialog/div/0",
				"data-inspector-source": "pages/Community.tsx:51:9:857816ba7611c32773fc9e589773689ef3b6dddccca5a21f8e88269e24854f91:1",
				className: "space-y-4 mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "pages/Community/PostEditorDialog/Input/de99cb504414/0",
						"data-inspector-source": "pages/Community.tsx:52:11:d4f7c24aad5a31d525ea65ead1bfb88da0c9e19532555693807d05f3682b7a5f:1",
						placeholder: isZh ? "标题" : "Title",
						value: title,
						onChange: (e) => onTitleChange(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"data-inspector-id": "pages/Community/PostEditorDialog/Textarea/ab5fbbfce129/0",
						"data-inspector-source": "pages/Community.tsx:57:11:6bce61462b7b357bf6e6f71bb3b54fa84c288295378af459b220b53ab3b0ffbf:1",
						placeholder: isZh ? "内容..." : "Content...",
						value: content,
						onChange: (e) => onContentChange(e.target.value),
						rows: 6
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/Community/PostEditorDialog/Button/e7456f92c295/0",
						"data-inspector-source": "pages/Community.tsx:63:11:8d18d21ccce5bf276246aeb4bd9d52fc5ad5b834d24084ee053ef8ca6f8af471:1",
						onClick: onSubmit,
						disabled: pending,
						className: "w-full",
						variant: "coral",
						children: [pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							"data-inspector-id": "pages/Community/PostEditorDialog/Loader2/0",
							"data-inspector-source": "pages/Community.tsx:64:24:12f4fa27f8f51023416c8d3b2f9b5fac4a645ba6e0491fb5b6530c5b05e09459:1",
							className: "h-4 w-4 animate-spin mr-2"
						}) : null, isZh ? "保存修改" : "Save Changes"]
					})
				]
			})]
		})
	});
}
function Community() {
	const { i18n } = useTranslation();
	const { isAuthenticated, user } = useAuth();
	const { toast } = useToast();
	const isZh = i18n.language?.startsWith("zh");
	const area = isZh ? "china" : "global";
	const communityPostType = "care_community_post";
	const dateLocale = isZh ? zhCN : enUS;
	const [postScope, setPostScope] = (0, import_react.useState)("all");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [newTitle, setNewTitle] = (0, import_react.useState)("");
	const [newContent, setNewContent] = (0, import_react.useState)("");
	const [editingPost, setEditingPost] = (0, import_react.useState)(null);
	const [editTitle, setEditTitle] = (0, import_react.useState)("");
	const [editContent, setEditContent] = (0, import_react.useState)("");
	const [pendingDeletePost, setPendingDeletePost] = (0, import_react.useState)(null);
	const { data: posts, isLoading } = usePosts(communityPostType, area);
	const createPost = useCreatePost();
	const deletePost = useDeletePost();
	const updatePost = useUpdatePost();
	const toggleVote = useToggleVote();
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
			postType: communityPostType,
			area
		}, {
			onSuccess: () => {
				setDialogOpen(false);
				setNewTitle("");
				setNewContent("");
				toast({ title: isZh ? "发布成功" : "Post created" });
			},
			onError: (err) => toast({
				title: isZh ? "发布失败" : "Failed",
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const handleDelete = (id) => {
		deletePost.mutate(id, { onSuccess: () => {
			setPendingDeletePost(null);
			toast({ title: isZh ? "已删除" : "Deleted" });
		} });
	};
	const filteredPosts = (posts || []).filter((p) => {
		if (postScope === "mine") return isPostAuthor(p.author_id, user?.user_id);
		return true;
	});
	const postIds = (0, import_react.useMemo)(() => (filteredPosts || []).map((p) => p.id), [filteredPosts]);
	const { data: voteSummary = {} } = useVoteSummary(R.communityPostVotes, postIds);
	const authorIds = (0, import_react.useMemo)(() => Array.from(new Set((filteredPosts || []).map((p) => p.author_id).filter(Boolean))), [filteredPosts]);
	const { data: forumNames } = useQuery({
		queryKey: ["forumNames", authorIds],
		queryFn: () => fetchForumNames(authorIds),
		enabled: authorIds.length > 0,
		staleTime: 600 * 1e3
	});
	const forumName = (authorId) => forumNames?.get(Number(authorId)) || "";
	const handleStartEdit = (post) => {
		setEditingPost(post);
		setEditTitle(post.title || "");
		setEditContent(post.content || "");
	};
	const handleUpdate = () => {
		if (!editingPost || !editTitle.trim() || !editContent.trim()) {
			toast({
				title: isZh ? "请填写标题和内容" : "Please fill in title and content",
				variant: "destructive"
			});
			return;
		}
		updatePost.mutate({
			id: editingPost.id,
			title: editTitle.trim(),
			content: editContent.trim()
		}, {
			onSuccess: () => {
				setEditingPost(null);
				toast({ title: isZh ? "修改已保存" : "Post updated" });
			},
			onError: (err) => toast({
				title: isZh ? "更新失败" : "Failed to update",
				description: err.message,
				variant: "destructive"
			})
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Community/Community/div/9fc8bf7b2ef0/0",
		"data-inspector-source": "pages/Community.tsx:174:5:9bbebbbb7f0bd49f4fd8f1414de43bba88cb9b51050312ee080d25fa9939303b:1",
		className: "container max-w-4xl mx-auto py-5 px-4 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostEditorDialog, {
				"data-inspector-id": "pages/Community/Community/PostEditorDialog/68f39478c3d4/0",
				"data-inspector-source": "pages/Community.tsx:175:7:cfb148fc09224394daa5d8d4a94c3c916117177a450dcd14e773a92447d3639f:1",
				open: !!editingPost,
				onOpenChange: (open) => {
					if (!open) setEditingPost(null);
				},
				title: editTitle,
				content: editContent,
				isZh,
				pending: updatePost.isPending,
				onTitleChange: setEditTitle,
				onContentChange: setEditContent,
				onSubmit: handleUpdate
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				"data-inspector-id": "pages/Community/Community/AlertDialog/f402e7994472/0",
				"data-inspector-source": "pages/Community.tsx:187:7:9f45ab3ab2e7be6b15402dd421fe216fb4c1bd084b1ae8854563432eff8ca183:1",
				open: !!pendingDeletePost,
				onOpenChange: (open) => {
					if (!open) setPendingDeletePost(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
					"data-inspector-id": "pages/Community/Community/AlertDialogContent/0",
					"data-inspector-source": "pages/Community.tsx:188:9:fe882bff82cf92609c5c378a06ff00f5061eae47f7c332a6d6cc383b3bd43648:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, {
						"data-inspector-id": "pages/Community/Community/AlertDialogHeader/0",
						"data-inspector-source": "pages/Community.tsx:189:11:62e07f561da6944a047b4e012eb2391860120be17ea9744e8c36929801480129:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
							"data-inspector-id": "pages/Community/Community/AlertDialogTitle/3c67441cc512/0",
							"data-inspector-source": "pages/Community.tsx:190:13:ba27a453137ba3d5f6a45cadc4ddd328f467168283f86f4400beb66e6ca984ab:1",
							children: isZh ? "删除帖子？" : "Delete post?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
							"data-inspector-id": "pages/Community/Community/AlertDialogDescription/3c67441cc512/0",
							"data-inspector-source": "pages/Community.tsx:191:13:b99be45b64c9426b8ddef071ba59d4059a0bfed7293fb6bf31277e3a3ae3c09d:1",
							children: isZh ? "这会永久删除该帖子以及下面的讨论回复。" : "This will permanently delete this post and the discussion replies under it."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
						"data-inspector-id": "pages/Community/Community/AlertDialogFooter/0",
						"data-inspector-source": "pages/Community.tsx:195:11:cd21762e2df7a9f57cbb6fa1f162d0299e5ad7c25832bc9f66493b677e8736df:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
							"data-inspector-id": "pages/Community/Community/AlertDialogCancel/3c67441cc512/0",
							"data-inspector-source": "pages/Community.tsx:196:13:37972dbfb162614483b527f4357b7cf2af66ba0164bd9e456f722c68b2f7834c:1",
							children: isZh ? "取消" : "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
							"data-inspector-id": "pages/Community/Community/AlertDialogAction/8403252d45ac/0",
							"data-inspector-source": "pages/Community.tsx:197:13:6625212b72eae042afb343d366cfafe8de317f4d630641ad34f85f2864cdb915:1",
							className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
							onClick: () => pendingDeletePost && handleDelete(pendingDeletePost.id),
							children: isZh ? "删除" : "Delete"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Community/Community/div/977b18b06c6a/0",
				"data-inspector-source": "pages/Community.tsx:208:7:a4c3287ad016b94b7df04c1452960d934999af850de29804b7b6200075295f72:1",
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Community/Community/div/0",
					"data-inspector-source": "pages/Community.tsx:209:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/Community/Community/h1/3c67441cc512/0",
						"data-inspector-source": "pages/Community.tsx:210:11:20aa7698bd13183b75a873d07aa6c12eee99fc22ed8c198c2019571f1fa0eea5:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: isZh ? "社区" : "Community"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/Community/Community/p/3c67441cc512/0",
						"data-inspector-source": "pages/Community.tsx:213:11:f85f9aceda2f9f2d438148dd50cc04a864af681208f5cda383462b3e0338e726:1",
						className: "text-sm text-muted-foreground mt-1",
						children: isZh ? "分享经验、获取建议、互相支持" : "Share experiences, get advice, support each other"
					})]
				}), isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					"data-inspector-id": "pages/Community/Community/Dialog/abc9d1d7c715/0",
					"data-inspector-source": "pages/Community.tsx:218:11:34952b6d4b6cec6897519b2f8a6f57a99ba930000698d434a96cdbc168b75c75:1",
					open: dialogOpen,
					onOpenChange: setDialogOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						"data-inspector-id": "pages/Community/Community/DialogTrigger/0",
						"data-inspector-source": "pages/Community.tsx:219:13:32d085b521a93affe14028907d440f2016ff3f115f8eb9f51d1754b84f023c94:1",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Community/Community/Button/3c67441cc512/0",
							"data-inspector-source": "pages/Community.tsx:220:15:1d47bafa28ba24a9a4b8b95c8cd331367d46f9614239170cc4c31e318382c578:1",
							variant: "coral",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								"data-inspector-id": "pages/Community/Community/Plus/0",
								"data-inspector-source": "pages/Community.tsx:221:17:ee10cfd0548ebe648eb32cedc995e6cc9e929ad89705184ddbcded453f542bf8:1",
								className: "h-4 w-4 mr-1"
							}), isZh ? "发帖" : "New Post"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						"data-inspector-id": "pages/Community/Community/DialogContent/0",
						"data-inspector-source": "pages/Community.tsx:225:13:e809184ea6e8d44948b8f5e1701976082c455192533c8a8a80383c968c332126:1",
						className: "sm:max-w-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
							"data-inspector-id": "pages/Community/Community/DialogHeader/0",
							"data-inspector-source": "pages/Community.tsx:226:15:474b0520f695a0bef2f95e320f21695268ea47c1a88270a6f9e089fc9dcfae87:1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								"data-inspector-id": "pages/Community/Community/DialogTitle/3c67441cc512/0",
								"data-inspector-source": "pages/Community.tsx:227:17:b6d6f7e15a458b98c94c61b53ce9f935ce4b7d1ed3fb789e24a1b4849c38c454:1",
								children: isZh ? "发布新帖" : "Create New Post"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Community/Community/div/1",
							"data-inspector-source": "pages/Community.tsx:229:15:e3e85679ac43c228a2f9ca7b9baecd78557a68c82a2504b1c0278cea418b2ee2:1",
							className: "space-y-4 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/Community/Community/Input/c7aac4b17f64/0",
									"data-inspector-source": "pages/Community.tsx:230:17:1b672057fcea09067ce1ce6e6cb5f341eea03edbf9b8a51780a399aa3c5ba37f:1",
									placeholder: isZh ? "标题" : "Title",
									value: newTitle,
									onChange: (e) => setNewTitle(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"data-inspector-id": "pages/Community/Community/Textarea/d7eb91a9b77e/0",
									"data-inspector-source": "pages/Community.tsx:235:17:e36ff1ea2050757d0c64425b92cd396aa2df4cb09a0d775b49ee1d855c548360:1",
									placeholder: isZh ? "内容..." : "Content...",
									value: newContent,
									onChange: (e) => setNewContent(e.target.value),
									rows: 5
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/Community/Community/Button/21c1c7effc0b/0",
									"data-inspector-source": "pages/Community.tsx:241:17:0075f40e0d39fc69d6ff42d624544a9121cce24490a06c80fc380bad7090a81e:1",
									onClick: handleCreate,
									disabled: createPost.isPending,
									className: "w-full",
									variant: "coral",
									children: [createPost.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										"data-inspector-id": "pages/Community/Community/Loader2/0",
										"data-inspector-source": "pages/Community.tsx:242:43:5fa7e9d87ee4ab6843fe76dd038245f24bd0b5056c027c7e499147c9f8ea5fc5:1",
										className: "h-4 w-4 animate-spin mr-2"
									}) : null, isZh ? "发布" : "Publish"]
								})
							]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				"data-inspector-id": "pages/Community/Community/Tabs/35c5ffccf27e/0",
				"data-inspector-source": "pages/Community.tsx:252:7:5d4f64da870923436157181bcf16ff2313389e4f1bbfbbf71534fa39aca73a70:1",
				value: postScope,
				onValueChange: setPostScope,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/Community/Community/div/2",
					"data-inspector-source": "pages/Community.tsx:253:9:ad6f6c893ccdfa6d02c1090a45ada2edc035b23c0a67d53fd465961f03edaa30:1",
					className: "flex items-center gap-3 flex-wrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						"data-inspector-id": "pages/Community/Community/TabsList/0",
						"data-inspector-source": "pages/Community.tsx:254:11:08f37f7ec9e7240598e14c0965a55d274ba6caa2e92604610c44eb1a668c643b:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							"data-inspector-id": "pages/Community/Community/TabsTrigger/3c67441cc512/0",
							"data-inspector-source": "pages/Community.tsx:255:13:be14c3073c4d5c3039ab31b504d930430389bec9bd1fb696c33296dd1bd561c3:1",
							value: "all",
							children: isZh ? "全部帖子" : "All Posts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							"data-inspector-id": "pages/Community/Community/TabsTrigger/3c67441cc512/1",
							"data-inspector-source": "pages/Community.tsx:256:13:b94d6270e671433e48f4d1baaa1086973b9a007c14df0cf3ec823188f8b9bc52:1",
							value: "mine",
							children: isZh ? "我的帖子" : "My Posts"
						})]
					})
				})
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/Community/Community/div/3",
				"data-inspector-source": "pages/Community.tsx:263:9:e8920a082e0574c90d7e6438d828f430b087a1016879ac9151e552e8c5c15f21:1",
				className: "flex justify-center py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					"data-inspector-id": "pages/Community/Community/Loader2/1",
					"data-inspector-source": "pages/Community.tsx:264:11:7deb312a632b3e881a68b06438f676a07056388f659db90fc37ef97e60261010:1",
					className: "h-6 w-6 animate-spin text-muted-foreground"
				})
			}) : filteredPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				"data-inspector-id": "pages/Community/Community/Card/0",
				"data-inspector-source": "pages/Community.tsx:267:9:c72e198e702edeab3b1edd43e511c682a6935a40335055f129c1a5107fef894e:1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/Community/Community/CardContent/853c1c53a2ba/0",
					"data-inspector-source": "pages/Community.tsx:268:11:a01ff1cec6f0d8582f028ee7ab82e6f054acf94a0c7ee79deef7cb8a16a421f1:1",
					className: "py-12 text-center text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, {
							"data-inspector-id": "pages/Community/Community/Newspaper/0",
							"data-inspector-source": "pages/Community.tsx:269:13:dcd50b3e6abdbec9e2b3ad494a5c37ea3eb987dfc1424860e1b425b4245fdb49:1",
							className: "h-10 w-10 mx-auto mb-3 opacity-40"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Community/Community/p/3c67441cc512/1",
							"data-inspector-source": "pages/Community.tsx:270:13:7dae1a5298b3fe7f76f84a63efcb632a9142c2fc97549762e46fc7ea02ecd758:1",
							children: isZh ? "暂无帖子" : "No posts yet"
						}),
						isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Community/Community/Button/91a3c108b863/0",
							"data-inspector-source": "pages/Community.tsx:272:15:c8ce78dd15097b14b83e8230374e3364b4be450f23f319666d325d40ade87587:1",
							variant: "outline",
							className: "mt-3",
							onClick: () => setDialogOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								"data-inspector-id": "pages/Community/Community/Plus/1",
								"data-inspector-source": "pages/Community.tsx:273:17:ee10cfd0548ebe648eb32cedc995e6cc9e929ad89705184ddbcded453f542bf8:1",
								className: "h-4 w-4 mr-1"
							}), isZh ? "成为第一个发帖的人" : "Be the first to post"]
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/Community/Community/div/23d539da96ba/0",
				"data-inspector-source": "pages/Community.tsx:280:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: filteredPosts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					"data-inspector-id": "pages/Community/Community/Card/1",
					"data-inspector-source": "pages/Community.tsx:282:13:62f2677e19fba87f2260275c95e0adc5c56e675392c9f01c1d05e36cf57684df:1",
					className: "overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						"data-inspector-id": "pages/Community/Community/CardHeader/0",
						"data-inspector-source": "pages/Community.tsx:283:15:e3a90233b8050eba2ee42e07630eb683b22ea14a91999094270b858def40b1b0:1",
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Community/Community/div/f2664ff346c8/0",
							"data-inspector-source": "pages/Community.tsx:284:17:73a94edbb588e5b5fcb6bd16b3fe60229888b40146f9c5038f9a4eb1a947d656:1",
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/Community/Community/div/e6a3beb51f8e/0",
									"data-inspector-source": "pages/Community.tsx:285:19:021c6b60b4bf65963def789d84be8da9e815f7bcfd1c1ee81e0b0402ef3462ef:1",
									className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0",
									children: (forumName(post.author_id) || post.author?.full_name || "?")[0]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Community/Community/div/4",
									"data-inspector-source": "pages/Community.tsx:288:19:6c7e01a82bed7b5be9659555d26252fa1b29a459f38ae1c7991bc5c13fe68b12:1",
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Community/Community/div/5",
										"data-inspector-source": "pages/Community.tsx:289:21:ef1ddffb4c5df7d044deed3b3ead476a5c17acd1d1f7bc1cab893436e44f4a56:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Community/Community/span/496030399881/0",
											"data-inspector-source": "pages/Community.tsx:290:23:40d9951d281f7d540fb8d836116b5329acf872257aa0002b14109f0629c00a9a:1",
											className: "font-medium text-sm text-foreground",
											children: forumName(post.author_id) || post.author?.full_name || (isZh ? "未填姓名" : "No name")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Community/Community/span/6d60f7b2c209/0",
											"data-inspector-source": "pages/Community.tsx:293:23:495e838b97e0d9a78fbc4137325a73f4ce4b5125fd2664f3b9f17a2577308b3b:1",
											className: "text-[11px] text-muted-foreground ml-auto shrink-0",
											children: formatDistanceToNow(new Date(post.created_at), {
												addSuffix: true,
												locale: dateLocale
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
										"data-inspector-id": "pages/Community/Community/Link/0",
										"data-inspector-source": "pages/Community.tsx:297:21:4b9881baddbd20eb145cad2ddc19309ef02ee88d44719bebf6d37537f9190c98:1",
										to: `/community/${post.id}`,
										className: "block hover:opacity-90 transition-opacity",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											"data-inspector-id": "pages/Community/Community/h3/3d7762f3ba35/0",
											"data-inspector-source": "pages/Community.tsx:298:23:19e1a9eba3fcaad2ee1c23de55fc03b7808539aa3207c6aca45480d496be94c1:1",
											className: "text-base font-semibold mt-1 text-foreground",
											children: post.title
										})
									})]
								}),
								isPostAuthor(post.author_id, user?.user_id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
									"data-inspector-id": "pages/Community/Community/DropdownMenu/0",
									"data-inspector-source": "pages/Community.tsx:302:21:be9a927f926c295c3871a3b757949f168752915d1e8344cd9c0b49f7c41e360c:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										"data-inspector-id": "pages/Community/Community/DropdownMenuTrigger/0",
										"data-inspector-source": "pages/Community.tsx:303:23:05d0e180a4097e08443b34b6f9e521e497a41ab75b51e32b757d83ff8d14fe9a:1",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "pages/Community/Community/Button/0",
											"data-inspector-source": "pages/Community.tsx:304:25:b303f2c72d581cb661432472fba34bdffa2e927d5fe8dcf84f12f77711d71cb8:1",
											variant: "ghost",
											size: "icon",
											className: "min-h-11 min-w-11 shrink-0",
											"aria-label": isZh ? "帖子操作" : "Post actions",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
												"data-inspector-id": "pages/Community/Community/MoreHorizontal/0",
												"data-inspector-source": "pages/Community.tsx:305:27:d08eb0a2cdc2b1e4723fdae4095548049bce34583676dadb913ddc84da8fa3a0:1",
												className: "h-4 w-4"
											})
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
										"data-inspector-id": "pages/Community/Community/DropdownMenuContent/0",
										"data-inspector-source": "pages/Community.tsx:308:23:d31f864946a5832e6d00d378550c551db26c44e56cc531a9164f424791d85750:1",
										align: "end",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											"data-inspector-id": "pages/Community/Community/DropdownMenuItem/dcc370a97662/0",
											"data-inspector-source": "pages/Community.tsx:309:25:a7f01a74fe2e0cabcfa96846e40fccf2388bd08715ff31dd419ab599dc986a23:1",
											onClick: () => handleStartEdit(post),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
												"data-inspector-id": "pages/Community/Community/Pencil/0",
												"data-inspector-source": "pages/Community.tsx:310:27:68b1f1e5e324a7ab5d6cf3a33761cdef40b13cff800e6e265af425ef31eaa7c9:1",
												className: "h-4 w-4 mr-2"
											}), isZh ? "编辑" : "Edit"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											"data-inspector-id": "pages/Community/Community/DropdownMenuItem/9daaedad889e/0",
											"data-inspector-source": "pages/Community.tsx:313:25:f30d1bfdaeb4a454a4c02bdca43837b1e7ef42d1b702b021629b4a471b1b4363:1",
											onClick: () => setPendingDeletePost(post),
											className: "text-destructive focus:text-destructive",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
												"data-inspector-id": "pages/Community/Community/Trash2/0",
												"data-inspector-source": "pages/Community.tsx:314:27:fe105e1f5634b35dba19009239a5d3aab99f1d26914c2e592ede670ff2836b65:1",
												className: "h-4 w-4 mr-2"
											}), isZh ? "删除" : "Delete"]
										})]
									})]
								}) : null
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						"data-inspector-id": "pages/Community/Community/CardContent/0",
						"data-inspector-source": "pages/Community.tsx:322:15:fd336a9d848574573365dde294bc4d4afd1c7f208278b5447d1e4141c414df0f:1",
						className: "pt-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Community/Community/p/7e4234ca972e/0",
							"data-inspector-source": "pages/Community.tsx:323:17:66cc3eaa772eeb306eb1b3a29bdaa12aeafcc55db98e18dae3aa5463411ad436:1",
							className: "text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed",
							children: post.content
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Community/Community/div/6",
							"data-inspector-source": "pages/Community.tsx:326:17:1f7e063817e559edc3787d84f1dbaca5e30051ddf0befed1f6cfac7a9e8b0f0d:1",
							className: "flex items-center gap-3 mt-4 flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/Community/Community/Button/b4e4495cb4ee/0",
									"data-inspector-source": "pages/Community.tsx:327:19:33c2e35f18b5a30c5e21844064a72a70671b6555a52e84cfba539490e8618e64:1",
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
										"data-inspector-id": "pages/Community/Community/ThumbsUp/0",
										"data-inspector-source": "pages/Community.tsx:334:21:f8373210b80383305be0beecab01ab547deea152b490ddff7b4d77573109248d:1",
										className: "h-4 w-4 mr-1.5"
									}), voteSummary[post.id]?.upvotes || 0]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/Community/Community/Button/ad5a6ac41798/0",
									"data-inspector-source": "pages/Community.tsx:337:19:33c2e35f18b5a30c5e21844064a72a70671b6555a52e84cfba539490e8618e64:1",
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
										"data-inspector-id": "pages/Community/Community/ThumbsDown/0",
										"data-inspector-source": "pages/Community.tsx:344:21:9ae009103a667b6654b5b6d2d602bab068ac57659f0a657ca7b02d4828dfcf78:1",
										className: "h-4 w-4 mr-1.5"
									}), voteSummary[post.id]?.downvotes || 0]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSection, {
									"data-inspector-id": "pages/Community/Community/CommentsSection/0",
									"data-inspector-source": "pages/Community.tsx:347:19:330a7604e22f4352b4d536eba7a3399189fb78beecc9903d07a2b4c93fa03313:1",
									relationId: R.communityPostComments,
									parentId: post.id,
									compact: true,
									hideComposer: true,
									openPostHref: `/community/${post.id}`
								})
							]
						})]
					})]
				}, post.id))
			})
		]
	});
}
function RouteCommunityPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		"data-inspector-id": "routes/community/index/RouteCommunityPage/SiteFeature/0",
		"data-inspector-source": "routes/community/index.tsx:4:10:59c33cb1d3135bafaab14f5286b1b4910503bc6905eab628d7d46412dffb35ec:1",
		name: "community",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Community, {
			"data-inspector-id": "routes/community/index/RouteCommunityPage/Community/0",
			"data-inspector-source": "routes/community/index.tsx:4:40:59c33cb1d3135bafaab14f5286b1b4910503bc6905eab628d7d46412dffb35ec:1"
		})
	});
}
//#endregion
export { RouteCommunityPage as component };
