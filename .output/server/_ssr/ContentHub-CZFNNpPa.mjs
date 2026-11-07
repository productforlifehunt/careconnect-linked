import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { G as Search, Un as BookOpen, jn as ChevronRight, vn as Clock } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as HUB_ARTICLES } from "./hub-articles-Bsut6TCc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ContentHub-CZFNNpPa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContentHub({ category, brandName, brandNameZh, title, titleZh, subtitle, subtitleZh, icon, accentColor, subcategories, basePath }) {
	const { i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	const [activeSubcategory, setActiveSubcategory] = (0, import_react.useState)("all");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const subLabel = (k) => {
		const sc = subcategories.find((x) => x.key === k);
		return sc ? isChinese ? sc.labelZh : sc.label : k;
	};
	const filtered = (HUB_ARTICLES.filter((x) => x.hub === category && (activeSubcategory === "all" || x.sub === activeSubcategory)).map((x) => ({
		id: x.key,
		title: isChinese ? x.title.zh : x.title.en,
		excerpt: (isChinese ? x.body.zh : x.body.en)[0],
		subcategory: subLabel(x.sub),
		reading_time: isChinese ? `${x.minutes}分钟` : `${x.minutes} min read`
	})) || []).filter((a) => {
		if (!searchQuery) return true;
		const q = searchQuery.toLowerCase();
		return a.title?.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q);
	});
	const displayTitle = isChinese ? titleZh : title;
	const displaySubtitle = isChinese ? subtitleZh : subtitle;
	const displayBrand = isChinese ? brandNameZh : brandName;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/0",
		"data-inspector-source": "components/challenged/ContentHub.tsx:80:5:846dd61817740bc6ba8b1ce14183a1f44c506623273f9638549d1b29df92915c:1",
		className: "min-h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-id": "components/challenged/ContentHub/ContentHub/section/0",
				"data-inspector-source": "components/challenged/ContentHub.tsx:82:7:f1236063f32d6c500498f6d056107b6f5a94ddb472fc3a389dede0709e77d730:1",
				className: `relative bg-gradient-to-br ${accentColor} py-12 md:py-16`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/1",
					"data-inspector-source": "components/challenged/ContentHub.tsx:83:9:fb9bfdbcf8ee5be4f99f7e086e7cc15ce3e29646beeca04002f3aac77087cee4:1",
					className: "max-w-6xl mx-auto px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/2",
							"data-inspector-source": "components/challenged/ContentHub.tsx:84:11:3607b3780a70d0dfeb5682fe16f2d96884538a488ca0c91b1d5a00e14e8b2dee:1",
							className: "flex items-center gap-3 mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/3",
								"data-inspector-source": "components/challenged/ContentHub.tsx:85:13:c76f3710f00e1cc9ba77e3dbae8896d7385032f8cfbc43f5d6e4d2245e93eea0:1",
								className: "p-3 bg-white/20 rounded-xl backdrop-blur-sm",
								children: icon
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								"data-inspector-id": "components/challenged/ContentHub/ContentHub/Badge/0",
								"data-inspector-source": "components/challenged/ContentHub.tsx:88:13:7e9193f285c001864da281b12f89d7e31367280b572f706daf412adc27538b4e:1",
								variant: "secondary",
								className: "bg-white/20 text-white border-0 text-sm font-bold backdrop-blur-sm",
								children: displayBrand
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/h1/0",
							"data-inspector-source": "components/challenged/ContentHub.tsx:92:11:2a81c415825a49fe45a54f0e4e44d45ca29a3d2fcb82e5527ed3702f400e6de6:1",
							className: "text-3xl md:text-4xl font-bold text-white mb-3",
							children: displayTitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/p/0",
							"data-inspector-source": "components/challenged/ContentHub.tsx:95:11:646ae3b8aa06d0214c7d36b92235111e13dfd7240835971770c61e0c19ea15c0:1",
							className: "text-white/90 text-lg max-w-2xl mb-6",
							children: displaySubtitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/4",
							"data-inspector-source": "components/challenged/ContentHub.tsx:100:11:d2cec7c49517ed5fe81645c58d9cca59e13ac1c0a9b9f3c860e51cd70c307796:1",
							className: "relative max-w-md",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								"data-inspector-id": "components/challenged/ContentHub/ContentHub/Search/0",
								"data-inspector-source": "components/challenged/ContentHub.tsx:101:13:ee62c4dafa218eea55a8e58c4011d6308aafaf430ca2035ef70f79069eab7b84:1",
								className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "components/challenged/ContentHub/ContentHub/Input/0",
								"data-inspector-source": "components/challenged/ContentHub.tsx:102:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
								placeholder: isChinese ? "搜索文章..." : "Search articles...",
								value: searchQuery,
								onChange: (e) => setSearchQuery(e.target.value),
								className: "pl-9 bg-white/95 border-0 h-11 text-foreground"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/5",
				"data-inspector-source": "components/challenged/ContentHub.tsx:113:7:2aa2776b32edab47b536a6dc56e31d03bcad4a3e2aa6ea6dae0f3e80b2d52b14:1",
				className: "border-b bg-card sticky top-16 z-30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/6",
					"data-inspector-source": "components/challenged/ContentHub.tsx:114:9:fb9bfdbcf8ee5be4f99f7e086e7cc15ce3e29646beeca04002f3aac77087cee4:1",
					className: "max-w-6xl mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/7",
						"data-inspector-source": "components/challenged/ContentHub.tsx:115:11:38e43525f669cb98371c864153a9ea3f613959a87f630f3bd65b41ce35bf2ff6:1",
						className: "flex gap-1 overflow-x-auto py-2 scrollbar-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/button/0",
							"data-inspector-source": "components/challenged/ContentHub.tsx:116:13:a3b579ee303d0cab98ee81bdba245eb3089583d5c87a311fe484ba754cd07fc0:1",
							onClick: () => setActiveSubcategory("all"),
							className: `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeSubcategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
							children: isChinese ? "全部" : "All"
						}), subcategories.map((sub) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/button/1",
							"data-inspector-source": "components/challenged/ContentHub.tsx:127:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
							onClick: () => setActiveSubcategory(sub.key),
							className: `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeSubcategory === sub.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
							children: isChinese ? sub.labelZh : sub.label
						}, sub.key))]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/8",
				"data-inspector-source": "components/challenged/ContentHub.tsx:144:7:2b17cada00459815fc04941b75c6de8a339954481dd4d5549350d7e35d5aff70:1",
				className: "max-w-6xl mx-auto px-4 py-8",
				children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/10",
					"data-inspector-source": "components/challenged/ContentHub.tsx:159:11:9425e0efe938ba25bfc8acdc2c631b1c81327f504247d4fce9574292a041a2f9:1",
					className: "text-center py-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/BookOpen/0",
							"data-inspector-source": "components/challenged/ContentHub.tsx:160:13:976a94ba68e2a176a53972ed112f95f10720fe15d4c4d9bb90c90682599cea35:1",
							className: "h-12 w-12 text-muted-foreground mx-auto mb-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/h3/0",
							"data-inspector-source": "components/challenged/ContentHub.tsx:161:13:235a578f0fe1fa35944f200173f61e1b1e777bb4ea586e5607dd37f27ea34c9c:1",
							className: "text-lg font-semibold mb-2",
							children: isChinese ? "暂无内容" : "No articles yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/challenged/ContentHub/ContentHub/p/1",
							"data-inspector-source": "components/challenged/ContentHub.tsx:164:13:b17b70294584998bcb4485bf1b073c64584c456bda95027af635095745ca5055:1",
							className: "text-muted-foreground",
							children: isChinese ? "我们正在编写更多内容，请稍后再来查看。" : "We're working on adding more content. Check back soon."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "components/challenged/ContentHub/ContentHub/div/11",
					"data-inspector-source": "components/challenged/ContentHub.tsx:171:11:da840decf2553852ab346bb285329bf019e9381899b0630e5901bed12ee7f0f3:1",
					className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
					children: filtered.map((article) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentCard, {
						"data-inspector-id": "components/challenged/ContentHub/ContentHub/ContentCard/0",
						"data-inspector-source": "components/challenged/ContentHub.tsx:173:15:850c1f53b7e42eb7c3e487cde63eb600a70df1eaa0a783581c918ab772f3b364:1",
						article,
						basePath,
						isChinese
					}, article.id))
				})
			})
		]
	});
}
function ContentCard({ article, basePath, isChinese }) {
	const excerpt = article.excerpt;
	const readTime = article.reading_time || (isChinese ? "3分钟" : "3 min read");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
		"data-inspector-id": "components/challenged/ContentHub/ContentCard/Link/0",
		"data-inspector-source": "components/challenged/ContentHub.tsx:201:5:93bf125b38d3999252df5b86da74c442ec7d03e70759520a17c6852c9ab802b0:1",
		to: `${basePath}/${article.id}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			"data-inspector-id": "components/challenged/ContentHub/ContentCard/Card/0",
			"data-inspector-source": "components/challenged/ContentHub.tsx:202:7:107a0700d5fc24f1f4c3555eba9d590e646dd7fb1f19a0096ec8d033a7690f76:1",
			className: "group h-full hover:shadow-lg transition-all duration-300 overflow-hidden border hover:border-primary/30",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				"data-inspector-id": "components/challenged/ContentHub/ContentCard/CardContent/0",
				"data-inspector-source": "components/challenged/ContentHub.tsx:203:9:02cbd0fdbf988448b7e38d9b284324a1c9f395a4ca672687934db30937fbe22c:1",
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/challenged/ContentHub/ContentCard/div/0",
						"data-inspector-source": "components/challenged/ContentHub.tsx:204:11:b86625f81e9ec32319060e6fa1397e62306beb45f48843744f29405faf46a532:1",
						className: "flex items-center gap-2 mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							"data-inspector-id": "components/challenged/ContentHub/ContentCard/Badge/0",
							"data-inspector-source": "components/challenged/ContentHub.tsx:205:13:6b32fd1b065e66533f76337bb01e947cd467154af1c4988137622aa0322eddb9:1",
							variant: "outline",
							className: "text-xs capitalize",
							children: article.subcategory
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-id": "components/challenged/ContentHub/ContentCard/span/0",
							"data-inspector-source": "components/challenged/ContentHub.tsx:208:13:6ace76e4c0b6c3ca11a0bc2f60856505f2f845c1bb031679d81474174f610c90:1",
							className: "text-xs text-muted-foreground flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
								"data-inspector-id": "components/challenged/ContentHub/ContentCard/Clock/0",
								"data-inspector-source": "components/challenged/ContentHub.tsx:209:15:675a8cd36c3b6ce2be6df5a64aa3fe6726fc4148c98c6e6e42d134e6624ba921:1",
								className: "h-3 w-3"
							}), readTime]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						"data-inspector-id": "components/challenged/ContentHub/ContentCard/h3/0",
						"data-inspector-source": "components/challenged/ContentHub.tsx:213:11:0e64d5721ebd2582c2a5e4253a4fc07ef72b730ce95beb85655c030b93649d17:1",
						className: "font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors",
						children: article.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/challenged/ContentHub/ContentCard/p/0",
						"data-inspector-source": "components/challenged/ContentHub.tsx:216:11:f18ffcebbf25b0e495077fd86521cd25c6cc1a92e81401397e0ab910155ca3ca:1",
						className: "text-sm text-muted-foreground line-clamp-3 mb-3",
						children: excerpt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-id": "components/challenged/ContentHub/ContentCard/span/1",
						"data-inspector-source": "components/challenged/ContentHub.tsx:219:11:59b57453c95573e4cf79c7994f1066a1a6744fb91d2c4aba53920fbd7c6fc318:1",
						className: "text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all",
						children: [isChinese ? "阅读更多" : "Read more", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							"data-inspector-id": "components/challenged/ContentHub/ContentCard/ChevronRight/0",
							"data-inspector-source": "components/challenged/ContentHub.tsx:221:13:ed2789bad0c9ff008a70cba0373525b1ba2b7e4f6c22a8e7bb926ddc39a78ddb:1",
							className: "h-4 w-4"
						})]
					})
				]
			})
		})
	});
}
//#endregion
export { ContentHub as t };
