import { s as __toESM } from "./_runtime.mjs";
import { i as require_react } from "./_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./_ssr/button-DgaEzEqC.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-DGU2jav_.mjs";
import { t as Input } from "./_ssr/input-4rcasKp7.mjs";
import { t as Textarea } from "./_ssr/textarea-ZNemOC_7.mjs";
import { n as R } from "./_ssr/wp-schema-Dnlz0TVP.mjs";
import { Zn as ArrowLeft, b as ThumbsUp, cn as Ellipsis, jt as LoaderCircle, ut as Pencil, x as ThumbsDown, y as Trash2 } from "./_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-C88F3k7U.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as fetchForumNames } from "./_ssr/wp-users-C2nRIR2f.mjs";
import { Tt as useDeletePost, _n as usePost, br as useVoteCount, pr as useUpdatePost, qn as useToggleVote } from "./_ssr/use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./_ssr/use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-BwgHkacp.mjs";
import { n as useAuth } from "./_ssr/AuthContext-BAA6n6xi.mjs";
import { a as useParams$1, i as useNavigate$1, t as Link$1 } from "./_ssr/router-compat-CRbRSfhz.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./_ssr/dropdown-menu-BehT_ZHg.mjs";
import { t as CommentsSection } from "./_ssr/CommentsSection-Cq72L4gD.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BRV0UAw9.mjs";
import { t as Separator } from "./_ssr/separator-BD-dtN1z.mjs";
import { t as SiteFeature } from "./_ssr/SiteFeature-Diz6swln.mjs";
import { t as isPostAuthor } from "./_ssr/ownership-Cg5g5zqD.mjs";
import { n as formatDistanceToNow, r as enUS, t as zhCN } from "./_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BBU2nDiC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PostEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		"data-inspector-id": "pages/CommunityPost/PostEditorDialog/Dialog/0",
		"data-inspector-source": "pages/CommunityPost.tsx:47:5:1ccf9e54b65e83e6b93d88e4615c4822c95bb446b111e5596f76ba65c22d896c:1",
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			"data-inspector-id": "pages/CommunityPost/PostEditorDialog/DialogContent/0",
			"data-inspector-source": "pages/CommunityPost.tsx:48:7:87354396c2b2fe0505b250e2aade3bcaf4fc96bdd01fb4a787b5d2ba55e64b01:1",
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
				"data-inspector-id": "pages/CommunityPost/PostEditorDialog/DialogHeader/0",
				"data-inspector-source": "pages/CommunityPost.tsx:49:9:9db98273150bc559dca8500eeb3053480fe8643d6606b91f256a7e3158c9d513:1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					"data-inspector-id": "pages/CommunityPost/PostEditorDialog/DialogTitle/0",
					"data-inspector-source": "pages/CommunityPost.tsx:50:11:1a531fae13682bf830e3244d3478f32f48e1af0feb0fa264e6fd7327d4596700:1",
					children: isZh ? "编辑帖子" : "Edit Post"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/CommunityPost/PostEditorDialog/div/0",
				"data-inspector-source": "pages/CommunityPost.tsx:52:9:857816ba7611c32773fc9e589773689ef3b6dddccca5a21f8e88269e24854f91:1",
				className: "space-y-4 mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "pages/CommunityPost/PostEditorDialog/Input/0",
						"data-inspector-source": "pages/CommunityPost.tsx:53:11:ecf5122734c82236ab9c100a7d39597f09a6c72abd94d2d50009b1098b838419:1",
						placeholder: isZh ? "标题" : "Title",
						value: title,
						onChange: (e) => onTitleChange(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"data-inspector-id": "pages/CommunityPost/PostEditorDialog/Textarea/0",
						"data-inspector-source": "pages/CommunityPost.tsx:54:11:14f81c2b3d81df960c3b6c9995c955037a7e109b161c114d74becdce6b0c2a9d:1",
						placeholder: isZh ? "内容..." : "Content...",
						value: content,
						onChange: (e) => onContentChange(e.target.value),
						rows: 8
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/CommunityPost/PostEditorDialog/Button/0",
						"data-inspector-source": "pages/CommunityPost.tsx:55:11:8d18d21ccce5bf276246aeb4bd9d52fc5ad5b834d24084ee053ef8ca6f8af471:1",
						onClick: onSubmit,
						disabled: pending,
						className: "w-full",
						variant: "coral",
						children: [pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							"data-inspector-id": "pages/CommunityPost/PostEditorDialog/Loader2/0",
							"data-inspector-source": "pages/CommunityPost.tsx:56:24:7dd0ad264e4eeae27af02068155422616fb558b66d8b43cb8a29cba379b16791:1",
							className: "mr-2 h-4 w-4 animate-spin"
						}) : null, isZh ? "保存修改" : "Save Changes"]
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
		"data-inspector-id": "pages/CommunityPost/CommunityPost/div/0",
		"data-inspector-source": "pages/CommunityPost.tsx:134:5:3f3219a6b19047cae7c85158db6d329e3982da498baf57728c5d1cc7ad1fa9b3:1",
		className: "container max-w-4xl mx-auto py-6 px-4 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostEditorDialog, {
				"data-inspector-id": "pages/CommunityPost/CommunityPost/PostEditorDialog/0",
				"data-inspector-source": "pages/CommunityPost.tsx:135:7:cfb148fc09224394daa5d8d4a94c3c916117177a450dcd14e773a92447d3639f:1",
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
				"data-inspector-id": "pages/CommunityPost/CommunityPost/AlertDialog/0",
				"data-inspector-source": "pages/CommunityPost.tsx:147:7:89c5d7f734c64a49a5c0bd383e4fdb9c681784cb9dee8ef838a03cebe5a190a9:1",
				open: confirmDeleteOpen,
				onOpenChange: setConfirmDeleteOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
					"data-inspector-id": "pages/CommunityPost/CommunityPost/AlertDialogContent/0",
					"data-inspector-source": "pages/CommunityPost.tsx:148:9:fe882bff82cf92609c5c378a06ff00f5061eae47f7c332a6d6cc383b3bd43648:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, {
						"data-inspector-id": "pages/CommunityPost/CommunityPost/AlertDialogHeader/0",
						"data-inspector-source": "pages/CommunityPost.tsx:149:11:62e07f561da6944a047b4e012eb2391860120be17ea9744e8c36929801480129:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/AlertDialogTitle/0",
							"data-inspector-source": "pages/CommunityPost.tsx:150:13:ba27a453137ba3d5f6a45cadc4ddd328f467168283f86f4400beb66e6ca984ab:1",
							children: isZh ? "删除帖子？" : "Delete post?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/AlertDialogDescription/0",
							"data-inspector-source": "pages/CommunityPost.tsx:151:13:b99be45b64c9426b8ddef071ba59d4059a0bfed7293fb6bf31277e3a3ae3c09d:1",
							children: isZh ? "这会永久删除该帖子以及下面的讨论回复。" : "This will permanently delete this post and the discussion replies under it."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
						"data-inspector-id": "pages/CommunityPost/CommunityPost/AlertDialogFooter/0",
						"data-inspector-source": "pages/CommunityPost.tsx:155:11:cd21762e2df7a9f57cbb6fa1f162d0299e5ad7c25832bc9f66493b677e8736df:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/AlertDialogCancel/0",
							"data-inspector-source": "pages/CommunityPost.tsx:156:13:37972dbfb162614483b527f4357b7cf2af66ba0164bd9e456f722c68b2f7834c:1",
							children: isZh ? "取消" : "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/AlertDialogAction/0",
							"data-inspector-source": "pages/CommunityPost.tsx:157:13:45bf949ecd197a776c3284bc868fe43ec6e3b080ac1d8800200c7da516bc0514:1",
							className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
							onClick: handleDelete,
							children: isZh ? "删除" : "Delete"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/CommunityPost/CommunityPost/div/1",
				"data-inspector-source": "pages/CommunityPost.tsx:164:7:173d795555695e1943a0fd61d3638f7c37b9ec699faf9afb8824b4a4faf7b57a:1",
				className: "flex items-center justify-between gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "pages/CommunityPost/CommunityPost/Button/0",
					"data-inspector-source": "pages/CommunityPost.tsx:165:9:3a027c8836b3a964e30356475e5121ebfdb84127a14a76f17a4d1f20a99601b3:1",
					variant: "ghost",
					asChild: true,
					className: "px-0 hover:bg-transparent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
						"data-inspector-id": "pages/CommunityPost/CommunityPost/Link/0",
						"data-inspector-source": "pages/CommunityPost.tsx:166:11:6ab9e2095cb511b5b7e84f8893271224823d7ca5f09c15bed11e24c563fddd6d:1",
						to: "/community",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/ArrowLeft/0",
							"data-inspector-source": "pages/CommunityPost.tsx:167:13:cce7781f94ac539c1478c66dc4d6521d96165e36d8f1a1c662930a31950676a1:1",
							className: "h-4 w-4 mr-2"
						}), isZh ? "返回社区" : "Back to Community"]
					})
				})
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				"data-inspector-id": "pages/CommunityPost/CommunityPost/Card/0",
				"data-inspector-source": "pages/CommunityPost.tsx:174:9:c72e198e702edeab3b1edd43e511c682a6935a40335055f129c1a5107fef894e:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					"data-inspector-id": "pages/CommunityPost/CommunityPost/CardHeader/0",
					"data-inspector-source": "pages/CommunityPost.tsx:175:11:f2fa15adcba1aae3c8902effc98228b8ce8998e75b01cdd283db8d4e4713dd04:1",
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
						"data-inspector-id": "pages/CommunityPost/CommunityPost/Skeleton/0",
						"data-inspector-source": "pages/CommunityPost.tsx:176:13:903b34de540d32783764ba82062cea95cb99ef9208c58d27dacef5a5a87cd3dd:1",
						className: "h-4 w-24"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
						"data-inspector-id": "pages/CommunityPost/CommunityPost/Skeleton/1",
						"data-inspector-source": "pages/CommunityPost.tsx:177:13:87b4a63baa6043b6d2893a7575548c13a8e0f3ced23542d9d1c624192925a308:1",
						className: "h-8 w-2/3"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/CommunityPost/CommunityPost/CardContent/0",
					"data-inspector-source": "pages/CommunityPost.tsx:179:11:495b3cc8f9278bb3ba019df05908e17fbeebd395036208d3b1394ad6282e5b5f:1",
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/Skeleton/2",
							"data-inspector-source": "pages/CommunityPost.tsx:180:13:c401af5a2018e1cdb38fb14c1fb7fb88bd34b24f866fbed9f3f6b36c15f4c506:1",
							className: "h-4 w-full"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/Skeleton/3",
							"data-inspector-source": "pages/CommunityPost.tsx:181:13:5c6dd13aa1a9a942c6aee85e015b4414b34f3bc36a9b8ca0afbbc057fbe556c8:1",
							className: "h-4 w-5/6"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/Skeleton/4",
							"data-inspector-source": "pages/CommunityPost.tsx:182:13:ca55b9347a5b2881636ea6a6c36c5708fc553493c2bf435e1490c367add94101:1",
							className: "h-4 w-4/6"
						})
					]
				})]
			}) : !post ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				"data-inspector-id": "pages/CommunityPost/CommunityPost/Card/1",
				"data-inspector-source": "pages/CommunityPost.tsx:186:9:c72e198e702edeab3b1edd43e511c682a6935a40335055f129c1a5107fef894e:1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					"data-inspector-id": "pages/CommunityPost/CommunityPost/CardContent/1",
					"data-inspector-source": "pages/CommunityPost.tsx:187:11:a01ff1cec6f0d8582f028ee7ab82e6f054acf94a0c7ee79deef7cb8a16a421f1:1",
					className: "py-12 text-center text-muted-foreground",
					children: isZh ? "帖子不存在或已被删除" : "Post not found or deleted"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				"data-inspector-id": "pages/CommunityPost/CommunityPost/Card/2",
				"data-inspector-source": "pages/CommunityPost.tsx:192:9:8967b8c9059a8497fd398515476ce9a2d57e12390ea1b798cbc97f5feba658cb:1",
				className: "overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					"data-inspector-id": "pages/CommunityPost/CommunityPost/CardHeader/1",
					"data-inspector-source": "pages/CommunityPost.tsx:193:11:65e5065383b953efc3999854bdbbd629277245e0337611188892e468ec8d9d7e:1",
					className: "pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/CommunityPost/CommunityPost/div/2",
						"data-inspector-source": "pages/CommunityPost.tsx:194:13:16b268d9aa91b80ed65521ff229307b7d6f34741a166fb34ff25098442df861c:1",
						className: "flex items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/CommunityPost/CommunityPost/div/3",
								"data-inspector-source": "pages/CommunityPost.tsx:195:15:ee6685f7264489ef1574f882ff83280210c75c47962994653c75d2c0a0154319:1",
								className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0",
								children: (authorForumName || post.author?.full_name || "?")[0]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/CommunityPost/CommunityPost/div/4",
								"data-inspector-source": "pages/CommunityPost.tsx:198:15:a104d5461a703c9ef75613cbbdf47223b0ee194f7e6dfabbbfd095be5591983f:1",
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/CommunityPost/CommunityPost/div/5",
									"data-inspector-source": "pages/CommunityPost.tsx:199:17:75e17054c58be119d3723c332e8e15c689ea64d4a53009bab7d97283b001753f:1",
									className: "flex items-center gap-2 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/CommunityPost/CommunityPost/span/0",
										"data-inspector-source": "pages/CommunityPost.tsx:200:19:ad04a4815b3e386cfa6a9de943be7673d3a1372a0974fd7e899ba7778859125b:1",
										className: "font-medium text-sm text-foreground",
										children: authorForumName || post.author?.full_name || (isZh ? "未填姓名" : "No name")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/CommunityPost/CommunityPost/span/1",
										"data-inspector-source": "pages/CommunityPost.tsx:201:19:a5e2ddaacc7fcd2debb2ee814acbdc631c3c8d5c88befdbc115cbdacc68e947b:1",
										className: "text-[11px] text-muted-foreground ml-auto shrink-0",
										children: formatDistanceToNow(new Date(post.created_at), {
											addSuffix: true,
											locale: dateLocale
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									"data-inspector-id": "pages/CommunityPost/CommunityPost/h1/0",
									"data-inspector-source": "pages/CommunityPost.tsx:205:17:bcafcadbc501b7853f3d9bf93e2633e1aacc8e8ca38557dc0305c64a8c7beca6:1",
									className: "text-2xl font-semibold mt-2 text-foreground",
									children: post.title
								})]
							}),
							isPostAuthor(post.author_id, user?.user_id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
								"data-inspector-id": "pages/CommunityPost/CommunityPost/DropdownMenu/0",
								"data-inspector-source": "pages/CommunityPost.tsx:208:17:5974572a4d5add0c6be91174e3e919956cf06a56f9df8ba8df0fdc6a22a0a133:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									"data-inspector-id": "pages/CommunityPost/CommunityPost/DropdownMenuTrigger/0",
									"data-inspector-source": "pages/CommunityPost.tsx:209:19:807ab07cc9b9a6737304198464a5fae6d1fb04511359b23b42b2486840393a94:1",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "pages/CommunityPost/CommunityPost/Button/1",
										"data-inspector-source": "pages/CommunityPost.tsx:210:21:b69f5232f82b1e057c4a44f50c0867ac8bae97847652bf149493e974a6ea97ca:1",
										variant: "ghost",
										size: "icon",
										className: "min-h-11 min-w-11 shrink-0",
										"aria-label": isZh ? "帖子操作" : "Post actions",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
											"data-inspector-id": "pages/CommunityPost/CommunityPost/MoreHorizontal/0",
											"data-inspector-source": "pages/CommunityPost.tsx:211:23:7f86d733734a0e03dd597b51709beecf43f55f24ab52c70a838e53cb82a0451f:1",
											className: "h-4 w-4"
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									"data-inspector-id": "pages/CommunityPost/CommunityPost/DropdownMenuContent/0",
									"data-inspector-source": "pages/CommunityPost.tsx:214:19:ae3a37e3624d6e5654ae9ba476bd8f551529689baa4369b9eddd2b6acf1ab0a6:1",
									align: "end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/CommunityPost/CommunityPost/DropdownMenuItem/0",
										"data-inspector-source": "pages/CommunityPost.tsx:215:21:d140da79e147166c758f47d3392ae222c374e1686264d7af771b9940a8b10549:1",
										onClick: handleStartEdit,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
											"data-inspector-id": "pages/CommunityPost/CommunityPost/Pencil/0",
											"data-inspector-source": "pages/CommunityPost.tsx:216:23:25c03d9bc68181655db46f52bd5ec6b412646f350282858ab1b0dc6ba07c31be:1",
											className: "h-4 w-4 mr-2"
										}), isZh ? "编辑" : "Edit"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/CommunityPost/CommunityPost/DropdownMenuItem/1",
										"data-inspector-source": "pages/CommunityPost.tsx:219:21:0b53d77e21b88b8a6b6c3d91bcf08f38bcbc1e49a0cc3be09c609b638976e69e:1",
										onClick: () => setConfirmDeleteOpen(true),
										className: "text-destructive focus:text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
											"data-inspector-id": "pages/CommunityPost/CommunityPost/Trash2/0",
											"data-inspector-source": "pages/CommunityPost.tsx:220:23:dca4717388ef3947b271321bae0d85df7f84f4fe64b93258826b74123bc79344:1",
											className: "h-4 w-4 mr-2"
										}), isZh ? "删除" : "Delete"]
									})]
								})]
							}) : null
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/CommunityPost/CommunityPost/CardContent/2",
					"data-inspector-source": "pages/CommunityPost.tsx:228:11:b8670205a627aeb5a6d66dcb70ea4fbeab6d3f8504bb29520d6933727e5645f1:1",
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/div/6",
							"data-inspector-source": "pages/CommunityPost.tsx:229:13:03251883ae53321221b2432f5d7e2d1babee6b31c86697e7b7873062bc29d85b:1",
							className: "text-base leading-7 text-foreground whitespace-pre-wrap",
							children: post.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/div/7",
							"data-inspector-source": "pages/CommunityPost.tsx:231:13:466ff066629120cf95e002ecc0c8e890f3769845036bcafab0572c3d85fa98d8:1",
							className: "flex items-center gap-3 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/CommunityPost/CommunityPost/Button/2",
								"data-inspector-source": "pages/CommunityPost.tsx:232:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, {
									"data-inspector-id": "pages/CommunityPost/CommunityPost/ThumbsUp/0",
									"data-inspector-source": "pages/CommunityPost.tsx:239:17:15f5a0b591245a527c565008de675d800a20f83e4d5374c0af80276820ef13ae:1",
									className: "h-4 w-4 mr-1.5"
								}), voteState.upvotes]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/CommunityPost/CommunityPost/Button/3",
								"data-inspector-source": "pages/CommunityPost.tsx:242:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, {
									"data-inspector-id": "pages/CommunityPost/CommunityPost/ThumbsDown/0",
									"data-inspector-source": "pages/CommunityPost.tsx:249:17:2caa0cb7b2b027aee4c7a88d6daa45b7781acc394e65d8fd3ae47fcbf5b456d4:1",
									className: "h-4 w-4 mr-1.5"
								}), voteState.downvotes]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/Separator/0",
							"data-inspector-source": "pages/CommunityPost.tsx:254:13:9b4efd2911b20d6b53af2aff8cfd56218a4712cd402b53f711881d2eb5ebff84:1"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/CommunityPost/CommunityPost/div/8",
							"data-inspector-source": "pages/CommunityPost.tsx:256:13:ffa5068b2e51f2ff323fc8c1cc14dada55436c2f5011e3d8d64bbf57cc336bbf:1",
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/CommunityPost/CommunityPost/div/9",
								"data-inspector-source": "pages/CommunityPost.tsx:257:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									"data-inspector-id": "pages/CommunityPost/CommunityPost/h2/0",
									"data-inspector-source": "pages/CommunityPost.tsx:258:17:911be9bd0354887323616bc49c1ff2eca8d8aace384d29bd104461e01a549462:1",
									className: "text-lg font-semibold text-foreground",
									children: isZh ? "讨论" : "Discussion"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSection, {
								"data-inspector-id": "pages/CommunityPost/CommunityPost/CommentsSection/0",
								"data-inspector-source": "pages/CommunityPost.tsx:260:15:fdf475120d9b74b41dc7928e148f54cefb477a922809fd228249cfe0d46589c3:1",
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
		"data-inspector-id": "routes/community/$id/RouteCommunityIdPage/SiteFeature/0",
		"data-inspector-source": "routes/community/$id.tsx:4:10:9b7624da8e8acabb3139b369fae4490e1b47b9bc6c440afa2bd81220833afc4f:1",
		name: "community",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommunityPost, {
			"data-inspector-id": "routes/community/$id/RouteCommunityIdPage/CommunityPost/0",
			"data-inspector-source": "routes/community/$id.tsx:4:40:9b7624da8e8acabb3139b369fae4490e1b47b9bc6c440afa2bd81220833afc4f:1"
		})
	});
}
//#endregion
export { RouteCommunityIdPage as component };
