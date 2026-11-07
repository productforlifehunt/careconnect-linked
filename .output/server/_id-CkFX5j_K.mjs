import { s as __toESM } from "./_runtime.mjs";
import { i as require_react } from "./_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./_ssr/button-xLpexZsM.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-Cz5iPbNd.mjs";
import { t as Input } from "./_ssr/input-DmTt3-fi.mjs";
import { t as Textarea } from "./_ssr/textarea-DPamDMgK.mjs";
import { n as R } from "./_ssr/wp-schema-Dnlz0TVP.mjs";
import { Zn as ArrowLeft, b as ThumbsUp, cn as Ellipsis, jt as LoaderCircle, ut as Pencil, x as ThumbsDown, y as Trash2 } from "./_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-COszB6Fv.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as fetchForumNames } from "./_ssr/wp-users-C2nRIR2f.mjs";
import { Tt as useDeletePost, _n as usePost, br as useVoteCount, pr as useUpdatePost, qn as useToggleVote } from "./_ssr/use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./_ssr/use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-B2Az5zRn.mjs";
import { n as useAuth } from "./_ssr/AuthContext-BAA6n6xi.mjs";
import { a as useParams$1, i as useNavigate$1, t as Link$1 } from "./_ssr/router-compat-3gk8yjav.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./_ssr/dropdown-menu-BlUTKFl7.mjs";
import { t as CommentsSection } from "./_ssr/CommentsSection--VNfrTrC.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BTLGg-Aw.mjs";
import { t as SiteFeature } from "./_ssr/SiteFeature-CQrN1JWZ.mjs";
import { t as Separator } from "./_ssr/separator-BD-dtN1z.mjs";
import { t as isPostAuthor } from "./_ssr/ownership-Cg5g5zqD.mjs";
import { n as formatDistanceToNow, r as enUS, t as zhCN } from "./_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-CkFX5j_K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PostEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isZh ? "编辑帖子" : "Edit Post" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/CommunityPost.tsx:52:9:857816ba7611c32773fc9e589773689ef3b6dddccca5a21f8e88269e24854f91:1",
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
						rows: 8
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
function CommunityPost() {
	const { id } = useParams$1();
	const navigate = useNavigate$1();
	const { i18n } = useTranslation();
	const { isAuthenticated, user } = useAuth();
	const { toast } = useToast();
	const { data: post, isLoading } = usePost(id || null, "care_community_post");
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
	const { data: forumNames } = useQuery({
		queryKey: ["forumNames", [post?.author_id]],
		queryFn: () => fetchForumNames(post?.author_id ? [post.author_id] : []),
		enabled: !!post?.author_id,
		staleTime: 600 * 1e3
	});
	const authorForumName = post?.author_id ? forumNames?.get(Number(post.author_id)) || "" : "";
	const handleStartEdit = () => {
		if (!post) return;
		setEditTitle(post.title || "");
		setEditContent(post.content || "");
		setEditing(true);
	};
	const handleUpdate = () => {
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
		}, {
			onSuccess: () => {
				setEditing(false);
				toast({ title: isZh ? "修改已保存" : "Post updated" });
			},
			onError: (err) => toast({
				title: isZh ? "更新失败" : "Failed to update",
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const handleDelete = () => {
		if (!post) return;
		deletePost.mutate(post.id, { onSuccess: () => {
			setConfirmDeleteOpen(false);
			toast({ title: isZh ? "已删除" : "Deleted" });
			navigate("/community");
		} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/CommunityPost.tsx:134:5:3f3219a6b19047cae7c85158db6d329e3982da498baf57728c5d1cc7ad1fa9b3:1",
		className: "container max-w-4xl mx-auto py-6 px-4 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostEditorDialog, {
				open: editing,
				onOpenChange: setEditing,
				title: editTitle,
				content: editContent,
				isZh,
				pending: updatePost.isPending,
				onTitleChange: setEditTitle,
				onContentChange: setEditContent,
				onSubmit: handleUpdate
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: confirmDeleteOpen,
				onOpenChange: setConfirmDeleteOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: isZh ? "删除帖子？" : "Delete post?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: isZh ? "这会永久删除该帖子以及下面的讨论回复。" : "This will permanently delete this post and the discussion replies under it." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: isZh ? "取消" : "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: handleDelete,
					children: isZh ? "删除" : "Delete"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/CommunityPost.tsx:164:7:173d795555695e1943a0fd61d3638f7c37b9ec699faf9afb8824b4a4faf7b57a:1",
				className: "flex items-center justify-between gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					asChild: true,
					className: "px-0 hover:bg-transparent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
						to: "/community",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-2" }), isZh ? "返回社区" : "Back to Community"]
					})
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
				className: "py-12 text-center text-muted-foreground",
				children: isZh ? "帖子不存在或已被删除" : "Post not found or deleted"
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/CommunityPost.tsx:194:13:16b268d9aa91b80ed65521ff229307b7d6f34741a166fb34ff25098442df861c:1",
						className: "flex items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/CommunityPost.tsx:195:15:ee6685f7264489ef1574f882ff83280210c75c47962994653c75d2c0a0154319:1",
								className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0",
								children: (authorForumName || post.author?.full_name || "?")[0]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/CommunityPost.tsx:198:15:a104d5461a703c9ef75613cbbdf47223b0ee194f7e6dfabbbfd095be5591983f:1",
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/CommunityPost.tsx:199:17:75e17054c58be119d3723c332e8e15c689ea64d4a53009bab7d97283b001753f:1",
									className: "flex items-center gap-2 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/CommunityPost.tsx:200:19:ad04a4815b3e386cfa6a9de943be7673d3a1372a0974fd7e899ba7778859125b:1",
										className: "font-medium text-sm text-foreground",
										children: authorForumName || post.author?.full_name || (isZh ? "未填姓名" : "No name")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/CommunityPost.tsx:201:19:a5e2ddaacc7fcd2debb2ee814acbdc631c3c8d5c88befdbc115cbdacc68e947b:1",
										className: "text-[11px] text-muted-foreground ml-auto shrink-0",
										children: formatDistanceToNow(new Date(post.created_at), {
											addSuffix: true,
											locale: dateLocale
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									"data-inspector-source": "pages/CommunityPost.tsx:205:17:bcafcadbc501b7853f3d9bf93e2633e1aacc8e8ca38557dc0305c64a8c7beca6:1",
									className: "text-2xl font-semibold mt-2 text-foreground",
									children: post.title
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
									onClick: handleStartEdit,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4 mr-2" }), isZh ? "编辑" : "Edit"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => setConfirmDeleteOpen(true),
									className: "text-destructive focus:text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-2" }), isZh ? "删除" : "Delete"]
								})]
							})] }) : null
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/CommunityPost.tsx:229:13:03251883ae53321221b2432f5d7e2d1babee6b31c86697e7b7873062bc29d85b:1",
							className: "text-base leading-7 text-foreground whitespace-pre-wrap",
							children: post.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/CommunityPost.tsx:231:13:466ff066629120cf95e002ecc0c8e890f3769845036bcafab0572c3d85fa98d8:1",
							className: "flex items-center gap-3 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/CommunityPost.tsx:256:13:ffa5068b2e51f2ff323fc8c1cc14dada55436c2f5011e3d8d64bbf57cc336bbf:1",
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/CommunityPost.tsx:257:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									"data-inspector-source": "pages/CommunityPost.tsx:258:17:911be9bd0354887323616bc49c1ff2eca8d8aace384d29bd104461e01a549462:1",
									className: "text-lg font-semibold text-foreground",
									children: isZh ? "讨论" : "Discussion"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSection, {
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
function RouteCommunityIdPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		name: "community",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommunityPost, {})
	});
}
//#endregion
export { RouteCommunityIdPage as component };
