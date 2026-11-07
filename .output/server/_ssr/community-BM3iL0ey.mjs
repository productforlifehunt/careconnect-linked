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
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as fetchForumNames } from "./wp-users-C2nRIR2f.mjs";
import { Tt as useDeletePost, it as useCreatePost, pr as useUpdatePost, qn as useToggleVote, xr as useVoteSummary, yn as usePosts } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-B2Az5zRn.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Link$1 } from "./router-compat-3gk8yjav.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BlUTKFl7.mjs";
import { t as CommentsSection } from "./CommentsSection--VNfrTrC.mjs";
import { t as SiteFeature } from "./SiteFeature-CQrN1JWZ.mjs";
import { t as isPostAuthor } from "./ownership-Cg5g5zqD.mjs";
import { n as formatDistanceToNow, r as enUS, t as zhCN } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/community-BM3iL0ey.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PostEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isZh ? "编辑帖子" : "Edit Post" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/Community.tsx:51:9:857816ba7611c32773fc9e589773689ef3b6dddccca5a21f8e88269e24854f91:1",
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
						rows: 6
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
		"data-inspector-source": "pages/Community.tsx:174:5:9bbebbbb7f0bd49f4fd8f1414de43bba88cb9b51050312ee080d25fa9939303b:1",
		className: "container max-w-4xl mx-auto py-5 px-4 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostEditorDialog, {
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
				open: !!pendingDeletePost,
				onOpenChange: (open) => {
					if (!open) setPendingDeletePost(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: isZh ? "删除帖子？" : "Delete post?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: isZh ? "这会永久删除该帖子以及下面的讨论回复。" : "This will permanently delete this post and the discussion replies under it." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: isZh ? "取消" : "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => pendingDeletePost && handleDelete(pendingDeletePost.id),
					children: isZh ? "删除" : "Delete"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/Community.tsx:208:7:a4c3287ad016b94b7df04c1452960d934999af850de29804b7b6200075295f72:1",
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/Community.tsx:209:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/Community.tsx:210:11:20aa7698bd13183b75a873d07aa6c12eee99fc22ed8c198c2019571f1fa0eea5:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: isZh ? "社区" : "Community"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Community.tsx:213:11:f85f9aceda2f9f2d438148dd50cc04a864af681208f5cda383462b3e0338e726:1",
						className: "text-sm text-muted-foreground mt-1",
						children: isZh ? "分享经验、获取建议、互相支持" : "Share experiences, get advice, support each other"
					})]
				}), isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open: dialogOpen,
					onOpenChange: setDialogOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "coral",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), isZh ? "发帖" : "New Post"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "sm:max-w-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isZh ? "发布新帖" : "Create New Post" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Community.tsx:229:15:e3e85679ac43c228a2f9ca7b9baecd78557a68c82a2504b1c0278cea418b2ee2:1",
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
									rows: 5
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
				value: postScope,
				onValueChange: setPostScope,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/Community.tsx:253:9:ad6f6c893ccdfa6d02c1090a45ada2edc035b23c0a67d53fd465961f03edaa30:1",
					className: "flex items-center gap-3 flex-wrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "all",
						children: isZh ? "全部帖子" : "All Posts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "mine",
						children: isZh ? "我的帖子" : "My Posts"
					})] })
				})
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/Community.tsx:263:9:e8920a082e0574c90d7e6438d828f430b087a1016879ac9151e552e8c5c15f21:1",
				className: "flex justify-center py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
			}) : filteredPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-12 text-center text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Community.tsx:270:13:7dae1a5298b3fe7f76f84a63efcb632a9142c2fc97549762e46fc7ea02ecd758:1",
						children: isZh ? "暂无帖子" : "No posts yet"
					}),
					isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "mt-3",
						onClick: () => setDialogOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), isZh ? "成为第一个发帖的人" : "Be the first to post"]
					})
				]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/Community.tsx:280:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: filteredPosts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Community.tsx:284:17:73a94edbb588e5b5fcb6bd16b3fe60229888b40146f9c5038f9a4eb1a947d656:1",
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "pages/Community.tsx:285:19:021c6b60b4bf65963def789d84be8da9e815f7bcfd1c1ee81e0b0402ef3462ef:1",
									className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0",
									children: (forumName(post.author_id) || post.author?.full_name || "?")[0]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/Community.tsx:288:19:6c7e01a82bed7b5be9659555d26252fa1b29a459f38ae1c7991bc5c13fe68b12:1",
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Community.tsx:289:21:ef1ddffb4c5df7d044deed3b3ead476a5c17acd1d1f7bc1cab893436e44f4a56:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/Community.tsx:290:23:40d9951d281f7d540fb8d836116b5329acf872257aa0002b14109f0629c00a9a:1",
											className: "font-medium text-sm text-foreground",
											children: forumName(post.author_id) || post.author?.full_name || (isZh ? "未填姓名" : "No name")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/Community.tsx:293:23:495e838b97e0d9a78fbc4137325a73f4ce4b5125fd2664f3b9f17a2577308b3b:1",
											className: "text-[11px] text-muted-foreground ml-auto shrink-0",
											children: formatDistanceToNow(new Date(post.created_at), {
												addSuffix: true,
												locale: dateLocale
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
										to: `/community/${post.id}`,
										className: "block hover:opacity-90 transition-opacity",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											"data-inspector-source": "pages/Community.tsx:298:23:19e1a9eba3fcaad2ee1c23de55fc03b7808539aa3207c6aca45480d496be94c1:1",
											className: "text-base font-semibold mt-1 text-foreground",
											children: post.title
										})
									})]
								}),
								isPostAuthor(post.author_id, user?.user_id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "min-h-11 min-w-11 shrink-0",
										"aria-label": isZh ? "帖子操作" : "Post actions",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => handleStartEdit(post),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4 mr-2" }), isZh ? "编辑" : "Edit"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => setPendingDeletePost(post),
										className: "text-destructive focus:text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-2" }), isZh ? "删除" : "Delete"]
									})]
								})] }) : null
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "pt-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/Community.tsx:323:17:66cc3eaa772eeb306eb1b3a29bdaa12aeafcc55db98e18dae3aa5463411ad436:1",
							className: "text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed",
							children: post.content
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Community.tsx:326:17:1f7e063817e559edc3787d84f1dbaca5e30051ddf0befed1f6cfac7a9e8b0f0d:1",
							className: "flex items-center gap-3 mt-4 flex-wrap",
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSection, {
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
		name: "community",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Community, {})
	});
}
//#endregion
export { RouteCommunityPage as component };
