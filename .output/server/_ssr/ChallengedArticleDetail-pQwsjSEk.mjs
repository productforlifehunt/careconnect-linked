import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { V as Share2, Zn as ArrowLeft, vn as Clock } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { a as useParams$1, i as useNavigate$1, r as useLocation$1, t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as StudyNotesPanel } from "./StudyNotesPanel-QYQVP0ev.mjs";
import { n as HUB_ARTICLE_CONTENT_IDS, r as getHubArticle } from "./hub-articles-Bsut6TCc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ChallengedArticleDetail-pQwsjSEk.js
var import_jsx_runtime = require_jsx_runtime();
var CATEGORY_ROUTES = {
	aware: "/awared",
	care: "/cared",
	cope: "/coped",
	safe: "/safed",
	accompany: "/accompanied"
};
var CATEGORY_NAMES = {
	aware: {
		en: "AwareD",
		zh: "认知篇"
	},
	care: {
		en: "CareD",
		zh: "护理篇"
	},
	cope: {
		en: "CopeD",
		zh: "应对篇"
	},
	safe: {
		en: "SafeD",
		zh: "安全篇"
	},
	accompany: {
		en: "AccompanieD",
		zh: "陪伴篇"
	}
};
function ChallengedArticleDetail() {
	const { id } = useParams$1();
	const navigate = useNavigate$1();
	const location = useLocation$1();
	const { i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	const article = id ? getHubArticle(id) : void 0;
	const fallbackRoute = "/" + (location.pathname.split("/")[1] || "awared");
	if (!article) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl mx-auto px-4 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/h2/0",
			"data-inspector-source": "pages/ChallengedArticleDetail.tsx:37:9:e8b2c4564b46b48d915d1cd483808ac18ebe2227cb0490690a5537866df86a40:1",
			className: "text-xl font-semibold mb-2",
			children: isChinese ? "文章未找到" : "Article not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/Button/90d08072ea3b",
			"data-inspector-source": "pages/ChallengedArticleDetail.tsx:38:9:69bf5c03436bda9f68c342eb11ab11794500993eb129460ab65d3ab591ccce9c:1",
			variant: "outline",
			onClick: () => navigate(fallbackRoute),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-2" }), isChinese ? "返回" : "Go Back"]
		})]
	});
	const route = CATEGORY_ROUTES[article.hub];
	const name = CATEGORY_NAMES[article.hub];
	const title = isChinese ? article.title.zh : article.title.en;
	const body = isChinese ? article.body.zh : article.body.en;
	const anchorId = HUB_ARTICLE_CONTENT_IDS[article.key];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/article/0",
		"data-inspector-source": "pages/ChallengedArticleDetail.tsx:53:5:90f67462bfb110dc690ea8fa4aaa06d3a079f78b056fb5380e92a517fab95f96:1",
		className: "max-w-3xl mx-auto px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex items-center gap-2 text-sm text-muted-foreground mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/Link/0",
						"data-inspector-source": "pages/ChallengedArticleDetail.tsx:55:9:b5e22fc18db33c9eaeb389138325d58c56448ce850ab372462c3c5b22ba4a00d:1",
						to: route,
						className: "hover:text-primary transition-colors",
						children: isChinese ? name.zh : name.en
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/span/0",
						"data-inspector-source": "pages/ChallengedArticleDetail.tsx:57:9:94c175e830574dac9288afedc886939172d760ad0450874f09e66f50615af09a:1",
						className: "text-foreground truncate",
						children: title
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/Badge/0",
						"data-inspector-source": "pages/ChallengedArticleDetail.tsx:62:11:5aa9a54b59236efc700828430f34d4687ad02964f15dd7b4602d43b83024d110:1",
						variant: "outline",
						children: isChinese ? name.zh : name.en
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/span/1",
						"data-inspector-source": "pages/ChallengedArticleDetail.tsx:63:11:6c755801659cccf07e1bad0545f2255ce48af7a0b24437a0e3ab4d127921b2e9:1",
						className: "text-sm text-muted-foreground flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), isChinese ? `${article.minutes}分钟` : `${article.minutes} min read`]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/h1/0",
					"data-inspector-source": "pages/ChallengedArticleDetail.tsx:68:9:f5b3597b24bbfc50e0c8f4640a7a14ed333d32d15b654e7e11bf8c44e0aa4235:1",
					className: "text-3xl md:text-4xl font-bold leading-tight",
					children: title
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/div/0",
				"data-inspector-source": "pages/ChallengedArticleDetail.tsx:71:7:7981d4a8cb1becf65c6d2f36fb3bd033c41cf04af9722f9dc3dd5713a1881df3:1",
				className: "space-y-4 text-base leading-relaxed text-foreground mb-12",
				children: body.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/p/0",
					"data-inspector-source": "pages/ChallengedArticleDetail.tsx:72:29:ed4b879f44760add6242b5d55b6eb93f5e4db3a88930b0d9e67fc450e15a7629:1",
					children: p
				}, i))
			}),
			anchorId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudyNotesPanel, {
					"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/StudyNotesPanel/0",
					"data-inspector-source": "pages/ChallengedArticleDetail.tsx:77:11:eaaad9001ddc64eb49b9ac4d87f27a5018f64243387ce38bbd74397c3fe7e079:1",
					articleId: anchorId,
					sourceTitle: title
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-t pt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/Button/b3378575a237",
					"data-inspector-source": "pages/ChallengedArticleDetail.tsx:82:9:24488b5c41d1e059e7d9b615c90a21a5845905d1102ba823355a6c903ffec955:1",
					variant: "outline",
					onClick: () => navigate(route),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-2" }), isChinese ? "返回列表" : "Back to list"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "pages/ChallengedArticleDetail/ChallengedArticleDetail/Button/b548ef787bc2",
					"data-inspector-source": "pages/ChallengedArticleDetail.tsx:86:9:2cbf2afe1b54a91992d854285721d994fd9ad62c98cef20b40ccfc2ba0f045a3:1",
					variant: "ghost",
					onClick: () => {
						if (navigator.share) navigator.share({
							title,
							url: window.location.href
						}).catch(() => {});
						else navigator.clipboard.writeText(window.location.href);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4 mr-2" }), isChinese ? "分享" : "Share"]
				})]
			})
		]
	});
}
//#endregion
export { ChallengedArticleDetail as t };
