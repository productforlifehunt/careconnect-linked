import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { Dt as MapPin, L as Shield, T as Star, Yt as Heart, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as careServiceTypeLabel } from "./source.wordpress-CI9kg3_M.mjs";
import { Kn as useToggleSavedProvider, jn as useSavedProviders } from "./use-care-data-7GR_eJDG.mjs";
import { i as useNavigate$1 } from "./router-compat-DbWBz8c6.mjs";
import { t as RequireAuth } from "./RequireAuth-C-F4CYYW.mjs";
import { t as SiteFeature } from "./SiteFeature-DJLQlP_2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/favorite-caregiver-D5T4KY4T.js
var import_jsx_runtime = require_jsx_runtime();
function Favorites() {
	const navigate = useNavigate$1();
	const { data: savedProviders, isLoading } = useSavedProviders();
	const toggleSaved = useToggleSavedProvider();
	const { t, i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const removeFavorite = (providerId) => {
		toggleSaved.mutate(providerId);
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/Favorites/Favorites/div/0",
		"data-inspector-source": "pages/Favorites.tsx:23:12:931bb606ad09dd79e0793a816a4f30106b10954d0e914b5de9507f02e36808af:1",
		className: "flex justify-center py-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			"data-inspector-id": "pages/Favorites/Favorites/Loader2/0",
			"data-inspector-source": "pages/Favorites.tsx:23:55:931bb606ad09dd79e0793a816a4f30106b10954d0e914b5de9507f02e36808af:1",
			className: "h-8 w-8 animate-spin text-muted-foreground"
		})
	});
	const favorites = savedProviders || [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Favorites/Favorites/div/e485649d6b35/0",
		"data-inspector-source": "pages/Favorites.tsx:29:5:a8ef67586a96fb1558e64689a87f5c0e5c1993b379d27b4d72224515f1b1e4df:1",
		className: "max-w-4xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-id": "pages/Favorites/Favorites/h1/e3b98a4da31a/0",
				"data-inspector-source": "pages/Favorites.tsx:30:7:de0951deaee627ecf2edb27fd817f8aa37c5f8fc2c9f5971da511d3518c723c1:1",
				className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
				children: t("favorites.favorites")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "pages/Favorites/Favorites/p/e3b98a4da31a/0",
				"data-inspector-source": "pages/Favorites.tsx:31:7:a6124251a8179d5cc417bc4fa93f4a33b045bf9523ed7bcf243c5f5304e9181a:1",
				className: "text-sm text-muted-foreground mt-0.5 mb-1",
				children: t("favorites.caregiversSaved")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "pages/Favorites/Favorites/p/3c67441cc512/0",
				"data-inspector-source": "pages/Favorites.tsx:32:7:e9487f9d823bdc708d49b11034a7cb6c4f793bae277d1427c036365ebc65485b:1",
				className: "text-xs text-muted-foreground mb-5",
				children: isZh ? "这份名单只存在你现在用的这台设备上，换手机看不到。" : "This list is kept on the device you are using now, so it will not show up on another phone."
			}),
			favorites.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/Favorites/Favorites/div/bf9e363c90fe/0",
				"data-inspector-source": "pages/Favorites.tsx:36:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: favorites.map((sp) => {
					const cg = sp.provider;
					if (!cg) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						"data-inspector-id": "pages/Favorites/Favorites/Card/0",
						"data-inspector-source": "pages/Favorites.tsx:41:15:e6000c831029bebb3730375311bbb57d246acdc7ff7339be2e1a37d1a5bd828c:1",
						className: "card-elevated border-transparent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							"data-inspector-id": "pages/Favorites/Favorites/CardContent/0",
							"data-inspector-source": "pages/Favorites.tsx:42:17:44679f89661a015fe5e4b1b03b67373193f42485bd38810c772db01fe2a63dc3:1",
							className: "p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Favorites/Favorites/div/1",
								"data-inspector-source": "pages/Favorites.tsx:43:19:bfa626d019483e93cab0b9e1e9128fb89e41f80f4716dfca96cb3c789d073ee6:1",
								className: "flex gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										"data-inspector-id": "pages/Favorites/Favorites/img/f96ccacc52b6/0",
										"data-inspector-source": "pages/Favorites.tsx:44:21:be321b0f6fd542da3c6cac98e0ee8f693261a09ac84eeb2c960aeb6413417430:1",
										src: cg.avatar_url || "/placeholder.svg",
										alt: cg.full_name || "",
										className: "w-16 h-16 rounded-xl object-cover cursor-pointer",
										onClick: () => navigate(`/caregiver/${cg.id}`)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Favorites/Favorites/div/2",
										"data-inspector-source": "pages/Favorites.tsx:45:21:1ddf41f097c600aa190b08df66369d0d7867c50ff28cfed2574919f319344215:1",
										className: "flex-1 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/Favorites/Favorites/div/3887fea177ff/0",
												"data-inspector-source": "pages/Favorites.tsx:46:23:9c74adccab2762420a8519a705cca954d512d2abcde47618634ae6d6ae68a8b0:1",
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													"data-inspector-id": "pages/Favorites/Favorites/h3/f248080d5006/0",
													"data-inspector-source": "pages/Favorites.tsx:47:25:7f97698ae0d4449e6cf761686891b8689113256b2b406d1115da1bc56694d1fa:1",
													className: "font-semibold text-foreground",
													children: cg.full_name
												}), cg.care_provider_is_background_checked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
													"data-inspector-id": "pages/Favorites/Favorites/Shield/0",
													"data-inspector-source": "pages/Favorites.tsx:48:68:e5069beea63d4ffa49535bd15688696f93e62b76cab743080d6f114524662648:1",
													className: "h-4 w-4 text-primary"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/Favorites/Favorites/div/701f944cd754/0",
												"data-inspector-source": "pages/Favorites.tsx:50:23:9857a9e4508ad49811cee2c0db9a157fa6f98c21fb74b665d950d7725741e1f2:1",
												className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1",
												children: [
													cg.rating_average != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/Favorites/Favorites/span/6287b6d4022b/0",
														"data-inspector-source": "pages/Favorites.tsx:51:55:57845884b07fba447f3c1e81953dce9384c41bdf5fcf506942437d95b7c04b92:1",
														className: "flex items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
																"data-inspector-id": "pages/Favorites/Favorites/Star/0",
																"data-inspector-source": "pages/Favorites.tsx:51:97:57845884b07fba447f3c1e81953dce9384c41bdf5fcf506942437d95b7c04b92:1",
																className: "h-3 w-3 text-warning fill-warning"
															}),
															" ",
															cg.rating_average.toFixed(1),
															" (",
															cg.rating_count || 0,
															")"
														]
													}),
													cg.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/Favorites/Favorites/span/9086719eaddd/0",
														"data-inspector-source": "pages/Favorites.tsx:52:41:b423a1d82d11a021d7b1e94e30aa34505f20e39f71668dd24b8d941f7fba5489:1",
														className: "flex items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
																"data-inspector-id": "pages/Favorites/Favorites/MapPin/0",
																"data-inspector-source": "pages/Favorites.tsx:52:83:b423a1d82d11a021d7b1e94e30aa34505f20e39f71668dd24b8d941f7fba5489:1",
																className: "h-3 w-3"
															}),
															" ",
															cg.location
														]
													}),
													cg.care_provider_starts_hourly_rate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/Favorites/Favorites/span/3b4558c4f93a/0",
														"data-inspector-source": "pages/Favorites.tsx:54:29:ce1a4f6c75db13d28458768019591ea494141f1759c2c03ead0e43142ae401ea:1",
														children: [
															isZh ? "¥" : "$",
															cg.care_provider_starts_hourly_rate,
															t("common.perHour")
														]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-id": "pages/Favorites/Favorites/span/3c67441cc512/0",
														"data-inspector-source": "pages/Favorites.tsx:55:29:1d92bee30955e967a3f08c6aff4e0c395620bf44ecab2b56dc1048d654b7d842:1",
														children: isZh ? "价格待询" : "Rate on request"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/Favorites/Favorites/div/fd12eccc11dd/0",
												"data-inspector-source": "pages/Favorites.tsx:57:23:af64b5f547bc3359eaca9a97b65682eb6f3b7440273ba1aaa5a3e442d446d7ea:1",
												className: "flex flex-wrap gap-1 mt-2",
												children: (cg.service_type_slugs || []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													"data-inspector-id": "pages/Favorites/Favorites/Badge/1fd929ffba98/0",
													"data-inspector-source": "pages/Favorites.tsx:58:75:cea96fd450ac7f58f50356ba194b2664f875341d5c7bd7695cc02a3c99d28099:1",
													variant: "secondary",
													className: "bg-accent text-accent-foreground text-xs",
													children: careServiceTypeLabel(s, !!isZh)
												}, s))
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Favorites/Favorites/div/3",
										"data-inspector-source": "pages/Favorites.tsx:63:21:cd8946b98eb3d937ee5764560572c122be29d1dd440901435d5b7726cb13bff7:1",
										className: "flex flex-col gap-2 shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "pages/Favorites/Favorites/Button/88bb741e581e/0",
											"data-inspector-source": "pages/Favorites.tsx:64:23:6520bccb53f0909823970c54048dd19e25ff485e710dd188397614553e3380a6:1",
											variant: "coral",
											size: "sm",
											onClick: () => navigate(`/caregiver/${cg.id}`),
											children: t("common.book")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "pages/Favorites/Favorites/Button/c1151806fdea/0",
											"data-inspector-source": "pages/Favorites.tsx:65:23:bff2d7fd747be65565caa8fd24d5ae6b78b1b978c475cbcbc7b67bc0fb578a4f:1",
											variant: "ghost",
											size: "icon",
											className: "min-h-11 min-w-11",
											"aria-label": isZh ? "取消收藏" : "Remove from favorites",
											onClick: () => removeFavorite(sp.provider_id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
												"data-inspector-id": "pages/Favorites/Favorites/Heart/0",
												"data-inspector-source": "pages/Favorites.tsx:66:25:534d226536adcc3147bd7857d7eb0e5a1e53a352eae1fcbe987969a2d48576e5:1",
												className: "h-4 w-4 fill-coral text-coral"
											})
										})]
									})
								]
							})
						})
					}, sp.id);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Favorites/Favorites/div/4",
				"data-inspector-source": "pages/Favorites.tsx:76:9:c6e5915fcb7853696a0307ee0ef8ca8836db4173406d9645881d03dc35e56e82:1",
				className: "text-center py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
						"data-inspector-id": "pages/Favorites/Favorites/Heart/1",
						"data-inspector-source": "pages/Favorites.tsx:77:11:1a31f204e9224ef7b8192eb1733749ed507297358ccc5ad98c5ddb171ea0037f:1",
						className: "h-12 w-12 text-muted-foreground/30 mx-auto mb-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/Favorites/Favorites/p/e3b98a4da31a/1",
						"data-inspector-source": "pages/Favorites.tsx:78:11:6fdd74d94a83f7b70a8eb2ca3a2622f1768f441ccea1d3401eaf1fb14a318565:1",
						className: "text-muted-foreground",
						children: t("favorites.noFavorites")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "pages/Favorites/Favorites/Button/64da27f77818/0",
						"data-inspector-source": "pages/Favorites.tsx:79:11:89fdbf8279c30515b1fcab444d811ebc18ca1af2e00ff49de65a7021bc44d1c7:1",
						variant: "coral",
						className: "mt-4",
						onClick: () => navigate("/search"),
						children: t("favorites.browseCaregivers")
					})
				]
			})
		]
	});
}
function RouteFavoriteCaregiverPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		"data-inspector-id": "routes/favorite-caregiver/RouteFavoriteCaregiverPage/SiteFeature/0",
		"data-inspector-source": "routes/favorite-caregiver.tsx:5:10:dea20b326dd43a5708f141e3dcfb711ae54d05435bd93509d3a071be745e6c84:1",
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
			"data-inspector-id": "routes/favorite-caregiver/RouteFavoriteCaregiverPage/RequireAuth/0",
			"data-inspector-source": "routes/favorite-caregiver.tsx:5:45:dea20b326dd43a5708f141e3dcfb711ae54d05435bd93509d3a071be745e6c84:1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Favorites, {
				"data-inspector-id": "routes/favorite-caregiver/RouteFavoriteCaregiverPage/Favorites/0",
				"data-inspector-source": "routes/favorite-caregiver.tsx:5:58:dea20b326dd43a5708f141e3dcfb711ae54d05435bd93509d3a071be745e6c84:1"
			})
		})
	});
}
//#endregion
export { RouteFavoriteCaregiverPage as component };
