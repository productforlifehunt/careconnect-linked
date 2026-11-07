import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { Dt as MapPin, G as Search, L as Shield, Mn as ChevronLeft, N as SlidersHorizontal, T as Star, jn as ChevronRight, n as X, zn as Building2 } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-jh6xKLyY.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as careServiceTypeLabel, n as SERVICE_DELIVERY_MODES } from "./source.wordpress-CI9kg3_M.mjs";
import { Lt as useFacilityReviewSummaries, T as useCareFacilities, a as FACILITY_STAGE_OPTIONS, c as facilityLabels, i as FACILITY_ROOM_TYPE_OPTIONS, n as FACILITY_PEOPLE_NUMBER_OPTIONS, o as FACILITY_TYPE_OPTIONS, s as facilityLabel, wn as useProviders } from "./use-care-data-7GR_eJDG.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1, o as useSearchParams, r as useLocation$1 } from "./router-compat-3gk8yjav.mjs";
import { t as Slider } from "./slider-D5YvUsBT.mjs";
import { t as Skeleton } from "./skeleton-BTLGg-Aw.mjs";
import { t as useServiceTypes } from "./use-service-types-BfA6EtiC.mjs";
import { a as SheetTrigger, i as SheetTitle, n as SheetContent, r as SheetHeader, t as Sheet } from "./sheet-D4w8zsz2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SearchResults-DhVBSfpX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getFacilityAddress(facility, isZh) {
	return [facility.location, facility.address].filter(Boolean).join(isZh ? " " : ", ");
}
function SearchResults() {
	const { t, i18n } = useTranslation();
	const { isAuthenticated } = useAuth();
	const { serviceTypes } = useServiceTypes();
	const navigate = useNavigate$1();
	const [searchParams] = useSearchParams();
	const { pathname } = useLocation$1();
	const preset = {
		"/search-caregiver": { category: "care" },
		"/search-local-caregiver": {
			category: "care",
			location: "in-person",
			type: "companionship"
		},
		"/search-remote-caregiver": {
			category: "care",
			location: "remote",
			type: "companionship"
		},
		"/search-care-facility": { category: "facility" }
	}[pathname] || {};
	const initialQuery = searchParams.get("q") || "";
	const initialLocation = searchParams.get("location") || "";
	const isFacilityMode = (searchParams.get("service_category") || preset.category || "care") === "facility";
	const isZh = i18n.language?.startsWith("zh");
	const facilityArea = isZh ? "china" : "global";
	const initialServiceLocations = (searchParams.get("service_location") || preset.location || "").split(",").map((s) => s.trim()).filter(Boolean);
	const initialServiceTypeSlugs = (searchParams.get("service_type") || preset.type || "").split(",").map((s) => s.trim()).filter(Boolean);
	const [query, setQuery] = (0, import_react.useState)(initialQuery);
	const [debouncedQuery, setDebouncedQuery] = (0, import_react.useState)(initialQuery);
	const [locationFilter, setLocationFilter] = (0, import_react.useState)(initialLocation);
	const [debouncedLocation, setDebouncedLocation] = (0, import_react.useState)(initialLocation);
	const [sortBy, setSortBy] = (0, import_react.useState)("rating");
	const debounceRef = (0, import_react.useRef)(void 0);
	(0, import_react.useEffect)(() => {
		debounceRef.current = setTimeout(() => {
			setDebouncedQuery(query);
			setDebouncedLocation(locationFilter);
			setCurrentPage(1);
		}, 400);
		return () => clearTimeout(debounceRef.current);
	}, [query, locationFilter]);
	const [priceRange, setPriceRange] = (0, import_react.useState)([0, 100]);
	const [selectedFacilityTypes, setSelectedFacilityTypes] = (0, import_react.useState)([]);
	const [selectedStages, setSelectedStages] = (0, import_react.useState)([]);
	const [selectedLocations, setSelectedLocations] = (0, import_react.useState)(initialServiceLocations);
	const [selectedServiceTypeSlugs, setSelectedServiceTypeSlugs] = (0, import_react.useState)(initialServiceTypeSlugs);
	const [verifiedOnly, setVerifiedOnly] = (0, import_react.useState)(false);
	const [minRating, setMinRating] = (0, import_react.useState)(0);
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const PAGE_SIZE = 20;
	const { data: providers, isLoading: providersLoading } = useProviders({
		query: debouncedQuery || void 0,
		location: debouncedLocation || void 0,
		minRate: priceRange[0] > 0 ? priceRange[0] : void 0,
		maxRate: priceRange[1] < 100 ? priceRange[1] : void 0,
		verifiedOnly,
		minRating: minRating > 0 ? minRating : void 0,
		sortBy,
		serviceLocations: selectedLocations.length > 0 ? selectedLocations : void 0,
		serviceTypeSlugs: selectedServiceTypeSlugs.length > 0 ? selectedServiceTypeSlugs : void 0
	});
	const { data: facilities, isLoading: facilitiesLoading } = useCareFacilities({
		query: debouncedQuery || void 0,
		location: debouncedLocation || void 0,
		sortBy,
		dementiaStages: selectedStages.length > 0 ? selectedStages : void 0,
		facilityTypes: selectedFacilityTypes.length > 0 ? selectedFacilityTypes : void 0,
		area: facilityArea
	});
	const toggleFacilityType = (s) => setSelectedFacilityTypes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
	const toggleStage = (s) => setSelectedStages((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
	const toggleLocation = (s) => setSelectedLocations((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
	const toggleServiceTypeSlug = (s) => setSelectedServiceTypeSlugs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
	const LOCATION_OPTIONS = SERVICE_DELIVERY_MODES;
	const FilterPanel = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/SearchResults.tsx:110:5:e8152ec757d91b474394261df6fbd17235cd92293da6049d8573bfc7e827e690:1",
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/SearchResults.tsx:111:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-sm font-semibold mb-3 block",
					children: t("common.location")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/SearchResults.tsx:113:9:36ad4af307838ca8ba9fb312680fecc4ea0e1486dc57b53dcd59dbc1fd0b30bb:1",
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: isZh ? "省/市/区" : t("home.cityOrZip"),
						value: locationFilter,
						onChange: (e) => {
							setLocationFilter(e.target.value);
							setCurrentPage(1);
						},
						className: "pl-9"
					})]
				})]
			}),
			isFacilityMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/SearchResults.tsx:119:9:6ff7d01a53cd2fb53309a7674946f3c1e52ba056c1fd716d88ba5fd5b68f8279:1",
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/SearchResults.tsx:120:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-semibold mb-3 block",
						children: isZh ? "机构类型" : "Facility type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/SearchResults.tsx:122:13:f9c1fb8b014b7439f593b046611a4212417cd0c614e16b9be7665447ac8a36de:1",
						className: "space-y-2 max-h-44 overflow-auto pr-1",
						children: FACILITY_TYPE_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							"data-inspector-source": "pages/SearchResults.tsx:124:17:225161ee089c67d4588024a6790da8c2427a1cce2bdf989cb7d013f5c5eaf2a0:1",
							className: "flex items-center gap-2 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								"aria-label": `${isZh ? "机构类型" : "Facility type"}: ${isZh ? opt.zh : opt.en}`,
								checked: selectedFacilityTypes.includes(opt.code),
								onCheckedChange: () => toggleFacilityType(opt.code)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/SearchResults.tsx:126:19:f7dced4e4732cda1cb79451f71ab170f19f5b76a9a60826887359800668068be:1",
								className: "text-sm",
								children: isZh ? opt.zh : opt.en
							})]
						}, opt.code))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/SearchResults.tsx:131:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-semibold mb-3 block",
						children: isZh ? "可照护的失智症阶段" : "Dementia stage"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/SearchResults.tsx:133:13:5ca737ca92b381dd61b1bf6e56c19ce4d2db0e06f2d51b3de2f2cce60f2f25b2:1",
						className: "space-y-2",
						children: FACILITY_STAGE_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							"data-inspector-source": "pages/SearchResults.tsx:135:17:225161ee089c67d4588024a6790da8c2427a1cce2bdf989cb7d013f5c5eaf2a0:1",
							className: "flex items-center gap-2 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								"aria-label": `${isZh ? "失智症阶段" : "Dementia stage"}: ${isZh ? opt.zh : opt.en}`,
								checked: selectedStages.includes(opt.code),
								onCheckedChange: () => toggleStage(opt.code)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/SearchResults.tsx:137:19:f7dced4e4732cda1cb79451f71ab170f19f5b76a9a60826887359800668068be:1",
								className: "text-sm",
								children: isZh ? opt.zh : opt.en
							})]
						}, opt.code))
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/SearchResults.tsx:145:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-semibold mb-3 block",
						children: isZh ? "服务方式" : "Delivery"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/SearchResults.tsx:147:13:5ca737ca92b381dd61b1bf6e56c19ce4d2db0e06f2d51b3de2f2cce60f2f25b2:1",
						className: "space-y-2",
						children: LOCATION_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							"data-inspector-source": "pages/SearchResults.tsx:149:17:12a527623d40d7a75b3dea05c197deee7f8b9a2b012be435271ad376bdace6aa:1",
							className: "flex items-center gap-2 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								"aria-label": `${isZh ? "服务方式" : "Delivery"}: ${isZh ? opt.zh : opt.en}`,
								checked: selectedLocations.includes(opt.slug),
								onCheckedChange: () => {
									toggleLocation(opt.slug);
									setCurrentPage(1);
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/SearchResults.tsx:151:19:f7dced4e4732cda1cb79451f71ab170f19f5b76a9a60826887359800668068be:1",
								className: "text-sm",
								children: isZh ? opt.zh : opt.en
							})]
						}, opt.slug))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/SearchResults.tsx:156:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-semibold mb-3 block",
						children: isZh ? "服务类型" : "Service type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/SearchResults.tsx:158:13:e79e19d26da05c2aa4a71f8b0e043eb6a7ec61e40f3e7534c9e8ef9cda658ba1:1",
						className: "space-y-2 max-h-72 overflow-auto pr-1",
						children: serviceTypes.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							"data-inspector-source": "pages/SearchResults.tsx:160:17:0f6ba130bd6fd217ca1f8336cf38f76500f294123ff3ae9cafe8aa915482ad9e:1",
							className: "flex items-center gap-2 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								"aria-label": `${isZh ? "服务类型" : "Service type"}: ${st.name}`,
								checked: selectedServiceTypeSlugs.includes(st.slug),
								onCheckedChange: () => {
									toggleServiceTypeSlug(st.slug);
									setCurrentPage(1);
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/SearchResults.tsx:166:19:066ea2128817e96a0cbaba874c12bd94333ddfd11549c7bde776a8782996620a:1",
								className: "text-sm",
								children: st.name
							})]
						}, st.slug))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/SearchResults.tsx:171:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						className: "text-sm font-semibold mb-3 block",
						children: [
							t("search.hourlyRate"),
							": ",
							isZh ? "¥" : "$",
							priceRange[0],
							" - ",
							isZh ? "¥" : "$",
							priceRange[1]
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						value: priceRange,
						onValueChange: setPriceRange,
						min: 0,
						max: 100,
						step: 5,
						className: "mt-2"
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/SearchResults.tsx:177:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-sm font-semibold mb-3 block",
					children: t("search.minimumRating")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/SearchResults.tsx:179:9:071dccf697c1badae00a469af34e1305288e6fbee9447a5b501a11ceff357683:1",
					className: "flex gap-2",
					children: [
						0,
						4,
						4.5,
						4.8
					].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: minRating === r ? "default" : "outline",
						size: "sm",
						onClick: () => setMinRating(r),
						children: r === 0 ? t("search.any") : `${r}+`
					}, r))
				})]
			}),
			!isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				"data-inspector-source": "pages/SearchResults.tsx:188:9:266ee6c58b8715865811fbbd0c9557d3aa3568fdb5e51731caad716a23b904ab:1",
				className: "flex items-center gap-2 cursor-pointer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					"aria-label": t("search.verifiedOnly"),
					checked: verifiedOnly,
					onCheckedChange: (c) => setVerifiedOnly(!!c)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-source": "pages/SearchResults.tsx:190:11:87e6713d05f2673bc687f5facac97b8636e5151c74613242f5a0868d0b29dce6:1",
					className: "text-sm font-medium",
					children: t("search.verifiedOnly")
				})]
			})
		]
	});
	const loading = isFacilityMode ? facilitiesLoading : providersLoading;
	const { data: facilityReviewSummaries } = useFacilityReviewSummaries(isFacilityMode ? (facilities || []).map((facility) => facility.id) : []);
	const facilityResults = isFacilityMode ? [...facilities || []].filter((facility) => {
		const reviewSummary = facilityReviewSummaries?.[facility.id] || {
			average: null,
			count: 0
		};
		if (minRating > 0 && (reviewSummary.average ?? 0) < minRating) return false;
		return true;
	}).sort((a, b) => {
		const aSummary = facilityReviewSummaries?.[a.id] || {
			average: null,
			count: 0
		};
		const bSummary = facilityReviewSummaries?.[b.id] || {
			average: null,
			count: 0
		};
		if (sortBy === "reviews") return bSummary.count - aSummary.count;
		if (sortBy === "rating") return (bSummary.average ?? -1) - (aSummary.average ?? -1);
		return a.name.localeCompare(b.name);
	}) : [];
	const allResults = isFacilityMode ? facilityResults : providers || [];
	const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const paged = allResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/SearchResults.tsx:220:5:95ec94e0415a55dac3ce28ea7bad4dbe7bb08ab03c6227645f6584a4918f7904:1",
		className: "max-w-7xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/SearchResults.tsx:221:7:897fb9c32b17cca9e80e69b7da470fa7fddfe92777e84e4bdb50b44ff28f0f57:1",
				className: "flex flex-col sm:flex-row gap-2.5 mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/SearchResults.tsx:222:9:3c76d7b7ac2bb290da9509133106de031f9f70a8462ca931315b9d91101ed376:1",
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: isFacilityMode ? isZh ? "搜索养老机构、记忆照护、护理院..." : "Search care facilities, memory care, nursing homes..." : t("search.searchCaregivers"),
							value: query,
							onChange: (e) => setQuery(e.target.value),
							className: "pl-9 h-11"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: sortBy,
						onValueChange: setSortBy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-[180px] h-11",
							"aria-label": t("search.sortBy"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: t("search.sortBy") })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "rating",
								children: t("search.highestRated")
							}),
							!isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "price-low",
								children: t("search.priceLowHigh")
							}),
							!isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "price-high",
								children: t("search.priceHighLow")
							}),
							isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "reviews",
								children: t("search.mostReviews")
							}),
							isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "name",
								children: isZh ? "名称" : "Name"
							})
						] })]
					}),
					isFacilityMode && isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "coral",
						className: "h-11",
						onClick: () => navigate("/facilities/new"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 mr-2" }),
							" ",
							isZh ? "提交养老院" : "Submit Facility"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "h-11 lg:hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "h-4 w-4 mr-2" }),
								" ",
								t("search.filters")
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: t("search.filters") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/SearchResults.tsx:247:13:6f68a3b1f6c2e01f55e3f2cb04fce60df3c837994886307116f84d917a04e8f7:1",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPanel, {})
					})] })] })
				]
			}),
			!isFacilityMode && (selectedServiceTypeSlugs.length > 0 || selectedLocations.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/SearchResults.tsx:253:9:a24365185fc1b953a8bc8c6d4d916842ffdb041fac1680dbf9716a60715be1c1:1",
				className: "flex flex-wrap gap-2 mb-4",
				children: [
					selectedLocations.map((slug) => {
						const opt = LOCATION_OPTIONS.find((o) => o.slug === slug);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "gap-1 cursor-pointer",
							onClick: () => toggleLocation(slug),
							children: [
								opt ? isZh ? opt.zh : opt.en : slug,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
							]
						}, slug);
					}),
					selectedServiceTypeSlugs.map((slug) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "gap-1 cursor-pointer",
						onClick: () => toggleServiceTypeSlug(slug),
						children: [
							careServiceTypeLabel(slug, isZh),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
						]
					}, slug)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setSelectedServiceTypeSlugs([]);
							setSelectedLocations([]);
						},
						children: t("common.clearAll")
					})
				]
			}),
			isFacilityMode && (selectedFacilityTypes.length > 0 || selectedStages.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/SearchResults.tsx:270:9:a24365185fc1b953a8bc8c6d4d916842ffdb041fac1680dbf9716a60715be1c1:1",
				className: "flex flex-wrap gap-2 mb-4",
				children: [
					selectedFacilityTypes.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "gap-1 cursor-pointer",
						onClick: () => toggleFacilityType(code),
						children: [
							facilityLabel(FACILITY_TYPE_OPTIONS, code, !!isZh),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
						]
					}, code)),
					selectedStages.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "gap-1 cursor-pointer",
						onClick: () => toggleStage(code),
						children: [
							facilityLabel(FACILITY_STAGE_OPTIONS, code, !!isZh),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
						]
					}, code)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setSelectedFacilityTypes([]);
							setSelectedStages([]);
						},
						children: t("common.clearAll")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/SearchResults.tsx:282:7:9933dcaf9e1a7b7e884794f020d2319e14d2fc3624a846b3abe37d5c65e6300a:1",
				className: "flex gap-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					"data-inspector-source": "pages/SearchResults.tsx:283:9:3f16772c790b76a7dbc2882fb9b74aa9e21e24e459e94fc4fd25554e8185da4f:1",
					className: "hidden lg:block w-64 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/SearchResults.tsx:284:11:c2489d252faaf0045b618368fdd61ddb30514f15ff8466473360b08a3bdb1ec9:1",
						className: "sticky top-24 bg-card rounded-xl border p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							"data-inspector-source": "pages/SearchResults.tsx:285:13:b028fbe4d6bbecff17032db9dcf80ebf04b1df1fd3e27f4aeff2b229b3cf230d:1",
							className: "font-semibold mb-4",
							children: t("search.filters")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPanel, {})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/SearchResults.tsx:290:9:4e230dc4bab6b172f7fb2ad3b233ebc255b3886f65d7e854ad21956be7e1985a:1",
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/SearchResults.tsx:291:11:eb557f50eb28ba617a08116e896ef12391f8ee6e59bbfcf8d985ef32d0a22c18:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4",
						children: isFacilityMode ? isZh ? "养老机构搜索结果" : "Care facility search results" : isZh ? "护理者搜索结果" : "Caregiver search results"
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/SearchResults.tsx:298:13:fc217957b0936f971793d9339d74ac109a1acc1aa32b8677ef382a31b9e9270e:1",
						className: "space-y-4",
						children: [
							1,
							2,
							3,
							4
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/SearchResults.tsx:300:17:ac44d49b3109c9db5aec4cc9806d7ec1cf827bcb19b3f76707966642b9461d18:1",
							className: "bg-card rounded-xl border p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/SearchResults.tsx:301:19:7da0768ca69580cdd9086c3d1de3acf0580af6b04088228f26c8bbc5eadd834a:1",
								className: "flex flex-col sm:flex-row gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "w-20 h-20 rounded-xl shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/SearchResults.tsx:303:21:0df54699dd3437e7e69c023e034db394665318fedf40eee303cb97f44c49ef1f:0",
										className: "flex-1 space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-56" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/SearchResults.tsx:303:156:0df54699dd3437e7e69c023e034db394665318fedf40eee303cb97f44c49ef1f:0",
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-20 rounded-full" })]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/SearchResults.tsx:304:21:8a5cab07e883d2d2f3aca990b8a6f0f38cc63bb47335ee14a35a51ed02abe643:1",
										className: "space-y-2 shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-16" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-24 rounded-md" })]
									})
								]
							})
						}, i))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/SearchResults.tsx:311:15:ff3a5bf975fa03deff2d8a3d9a8de577464527e7f7922026dadb860d55e3a2ee:1",
							className: "text-sm text-muted-foreground mb-4",
							children: isFacilityMode ? isZh ? `找到${allResults.length}家养老机构` : `${allResults.length} care facilities found` : t("search.caregiversFound", { count: allResults.length })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/SearchResults.tsx:316:15:4de8fafcd8663c7fb4b0f22a5e0ce4d69f895513be5060872ea6bb79608f794d:1",
							className: "space-y-4",
							children: [isFacilityMode ? paged.map((facility) => {
								const typeLabels = facilityLabels(FACILITY_TYPE_OPTIONS, facility.type, !!isZh);
								const stageLabels = facilityLabels(FACILITY_STAGE_OPTIONS, facility.dementia_stage, !!isZh);
								const roomTypeLabels = facilityLabels(FACILITY_ROOM_TYPE_OPTIONS, facility.room_type, !!isZh);
								const peopleNumberLabel = facility.people_number ? facilityLabel(FACILITY_PEOPLE_NUMBER_OPTIONS, facility.people_number, !!isZh) : "";
								const reviewSummary = facilityReviewSummaries?.[facility.id] || {
									average: null,
									count: 0
								};
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "card-elevated cursor-pointer border-transparent",
									onClick: () => navigate(`/facility/${facility.id}`),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
										className: "p-5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/SearchResults.tsx:329:27:c26b1c22f5c729c1c0da0c38d0342348cdf85c6740d1b88f9e0bbb5c69e403a9:1",
											className: "flex flex-col sm:flex-row gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/SearchResults.tsx:330:29:cba76fb89f18773495b3d9d93dd7833166790c803087781eb9e06977f5e43645:1",
												className: "flex-1 min-w-0",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-source": "pages/SearchResults.tsx:331:31:2b880ebf9473635a0cdaafbcc70e10d78a910b5909d7ed1df6c7b2306c4c65ac:1",
														className: "flex items-center gap-2 mb-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
															"data-inspector-source": "pages/SearchResults.tsx:332:33:a8cfd6fa30301030d54422fa52a17770df943483cda0d2274e7c9d980643de78:1",
															className: "font-semibold text-lg text-foreground",
															children: facility.name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-primary" })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-source": "pages/SearchResults.tsx:335:31:4822a0faaace42b1997c8e4b15f5a9b98858635a1868f102e5da8ad4f64c3b73:1",
														className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															"data-inspector-source": "pages/SearchResults.tsx:336:33:d23edf0b306fd550e2b7ffcba924bb3a297d5d69f55921d1ed9cf401fd03724a:1",
															className: "flex items-center gap-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 text-warning fill-warning" }),
																" ",
																reviewSummary.average?.toFixed(1) || t("common.new"),
																" (",
																reviewSummary.count,
																")"
															]
														}), getFacilityAddress(facility, isZh) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															"data-inspector-source": "pages/SearchResults.tsx:337:72:08dd8dff3519a6fd8807d3b70b2c82c2cfc81dd013b5bde1d558449f2084d24d:1",
															className: "flex items-center gap-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
																" ",
																getFacilityAddress(facility, isZh)
															]
														})]
													}),
													facility.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														"data-inspector-source": "pages/SearchResults.tsx:339:56:09e1e306ea7b203ceedda5bcc48adafa3a5667a855be6a0353c074aaeaeeb67a:1",
														className: "text-sm text-muted-foreground line-clamp-2 mb-3",
														children: facility.description
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-source": "pages/SearchResults.tsx:340:31:5b38d53ae56e5dd942eb1ec065f96bf65b357883475c442cd2822e9441bb38eb:1",
														className: "space-y-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-inspector-source": "pages/SearchResults.tsx:341:33:519bc4e76265a898d128a988568a259cc56d3e94702b1304f68bc0aa86f7297a:1",
															className: "flex flex-wrap gap-1.5",
															children: [
																typeLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "text-xs",
																	children: label
																}, `type-${label}`)),
																stageLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "secondary",
																	className: "bg-primary/10 text-primary text-xs",
																	children: label
																}, `stage-${label}`)),
																roomTypeLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "secondary",
																	className: "bg-accent text-accent-foreground text-xs",
																	children: label
																}, `room-${label}`))
															]
														}), peopleNumberLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															"data-inspector-source": "pages/SearchResults.tsx:347:35:0cf1ee5e89df9e384e7c52ef733d196f7d8ba62717bdb55f9dc41f66d4f8014b:1",
															className: "text-xs text-muted-foreground",
															children: peopleNumberLabel
														})]
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "pages/SearchResults.tsx:351:29:be72732c464ebf56d4e7c6585467bf0d6d605fc8eb27ddacd268cebaec547e3e:1",
												className: "sm:text-right shrink-0 flex sm:flex-col items-start sm:items-end gap-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "coral",
													size: "sm",
													children: isZh ? "查看详情" : "View details"
												})
											})]
										})
									})
								}, facility.id);
							}) : paged.map((cg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "card-elevated cursor-pointer border-transparent",
								onClick: () => navigate(`/caregiver/${cg.id}`),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "p-5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/SearchResults.tsx:363:25:e496f63443e8476516b70d06c6c112265fa6a3ff4183e27420ef5f9db5403a2e:1",
										className: "flex flex-col sm:flex-row gap-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												"data-inspector-source": "pages/SearchResults.tsx:364:27:0f828f1f382bec454aa6514e8ed14432f167fe05aae529f25a9553d6416cdc2e:1",
												src: cg.avatar_url || "/placeholder.svg",
												alt: cg.full_name || "",
												className: "w-20 h-20 rounded-xl object-cover shrink-0"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/SearchResults.tsx:365:27:d96c1fedd659b6764e85d558d4558db003be775ec32d874f512966ec8c88ef62:1",
												className: "flex-1 min-w-0",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-source": "pages/SearchResults.tsx:366:29:0c406493b1096d32257358fdcd253b6191ecedcfe51672231247287bc7c124c9:1",
														className: "flex items-center gap-2 mb-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
															"data-inspector-source": "pages/SearchResults.tsx:367:31:a29abde45144d1a7dc619109367bb23c10d4413608f5ff9de38ed2317a2f2126:1",
															className: "font-semibold text-lg text-foreground",
															children: cg.full_name
														}), cg.care_provider_is_background_checked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-primary" })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-source": "pages/SearchResults.tsx:370:29:e41a231cb4e758b8a8a3711119787dc3e4e769d6bd7be913a2caa0ee3ba74aed:1",
														className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2",
														children: [cg.rating_average != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															"data-inspector-source": "pages/SearchResults.tsx:371:61:d1c6fc9d4c37022f4b676faa023bbd8c3d2f400290fac08c822c7dc7c2454109:1",
															className: "flex items-center gap-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 text-warning fill-warning" }),
																" ",
																cg.rating_average.toFixed(1),
																" (",
																cg.rating_count || 0,
																")"
															]
														}), cg.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															"data-inspector-source": "pages/SearchResults.tsx:372:47:a45351ff6dcc7647c86d66c24d0a9092a7640ecfd6d7bf887cdb9b1727e43e64:1",
															className: "flex items-center gap-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
																" ",
																cg.location
															]
														})]
													}),
													cg.bio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														"data-inspector-source": "pages/SearchResults.tsx:374:40:7bc159e6fa035300373488dfad835622b0edecbc197126168c75d04d51b8e243:1",
														className: "text-sm text-muted-foreground line-clamp-2 mb-3",
														children: cg.bio
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-source": "pages/SearchResults.tsx:375:29:9fcb1791e3e30cd6b5d8040e5933530fe5524386582796cd69becb22fcd08dd4:1",
														className: "flex flex-wrap gap-1.5",
														children: [(cg.service_location_slugs || []).map((slug) => {
															const opt = LOCATION_OPTIONS.find((o) => o.slug === slug);
															return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																variant: selectedLocations.includes(slug) ? "default" : "outline",
																role: "button",
																tabIndex: 0,
																title: isZh ? "点击筛选同类服务者" : "Tap to see everyone offering this",
																className: "text-xs cursor-pointer border-primary/40 hover:bg-primary hover:text-primary-foreground transition-colors",
																onClick: (e) => {
																	e.stopPropagation();
																	toggleLocation(slug);
																},
																onKeyDown: (e) => {
																	if (e.key === "Enter" || e.key === " ") {
																		e.preventDefault();
																		e.stopPropagation();
																		toggleLocation(slug);
																	}
																},
																children: opt ? isZh ? opt.zh : opt.en : slug
															}, `loc-${slug}`);
														}), (cg.service_type_slugs || []).map((slug) => {
															const active = selectedServiceTypeSlugs.includes(slug);
															return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																variant: active ? "default" : "secondary",
																role: "button",
																tabIndex: 0,
																title: isZh ? "点击筛选同类服务者" : "Tap to see everyone offering this",
																className: `text-xs cursor-pointer transition-colors ${active ? "" : "bg-accent text-accent-foreground"} hover:bg-primary hover:text-primary-foreground`,
																onClick: (e) => {
																	e.stopPropagation();
																	toggleServiceTypeSlug(slug);
																},
																onKeyDown: (e) => {
																	if (e.key === "Enter" || e.key === " ") {
																		e.preventDefault();
																		e.stopPropagation();
																		toggleServiceTypeSlug(slug);
																	}
																},
																children: careServiceTypeLabel(slug, isZh)
															}, slug);
														})]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/SearchResults.tsx:414:27:15840dc2f768b5e88646f548ca89c5ea5621bc4a8a41043f3271e22efbaf9c1d:1",
												className: "sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													"data-inspector-source": "pages/SearchResults.tsx:415:29:976758addb19cabe5c4a88dd9954fc6d5fc0486ef50e0cc49cdd8721cd9d0037:1",
													children: cg.care_provider_starts_hourly_rate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-source": "pages/SearchResults.tsx:418:35:7300c8d90e77bc5682a0fbd5160befadf7a65cf47878e85d05bca3ca61baa25c:1",
														className: "text-2xl font-bold text-foreground",
														children: [isZh ? "¥" : "$", cg.care_provider_starts_hourly_rate]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-source": "pages/SearchResults.tsx:419:35:f864d4aa4bf119591400defb1af814f0edb4535b227d4be6cf22860f78e5dc09:1",
														className: "text-sm text-muted-foreground",
														children: t("common.perHour")
													})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-source": "pages/SearchResults.tsx:422:33:c93d579360ee9df5e2c150a61c08c55d0addc8c4c46f5c5c6fe7c612092b2b2a:1",
														className: "text-sm font-medium text-muted-foreground",
														children: isZh ? "价格待询" : "Rate on request"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "coral",
													size: "sm",
													children: t("common.bookNow")
												})]
											})
										]
									})
								})
							}, cg.id)), allResults.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/SearchResults.tsx:433:19:3a3dfb189b040b8eb11ef06db585ef7468fdd0e86937d6783361ae4d2dcbde0f:1",
								className: "text-center py-16",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/SearchResults.tsx:434:21:5c0f3049e4ffc2ff2b3c17c1c0519b4604b27a54fab034dddfb055f75f92743a:1",
									className: "text-lg text-muted-foreground",
									children: isFacilityMode ? isZh ? "没有符合条件的养老机构。" : "No facilities matched your filters." : t("search.noMatch")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "mt-4",
									onClick: () => {
										setQuery("");
										setLocationFilter("");
										setSelectedServiceTypeSlugs([]);
										setSelectedFacilityTypes([]);
										setSelectedStages([]);
										setSelectedLocations([]);
										setMinRating(0);
										setPriceRange([0, 100]);
										setCurrentPage(1);
									},
									children: t("common.clearFilters")
								})]
							})]
						}),
						totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/SearchResults.tsx:440:17:ae50e38a4003fbeed23b26807343a71f669e32d870c5d227247814b30150b267:1",
							className: "flex items-center justify-center gap-2 mt-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									disabled: safePage <= 1,
									onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "pages/SearchResults.tsx:442:19:f7f4e6678397610700b430f357e77df3bac05f4fe6ca621bfe4a7f200f59b81e:1",
									className: "text-sm text-muted-foreground",
									children: [
										t("common.page"),
										" ",
										safePage,
										" ",
										t("common.of"),
										" ",
										totalPages
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									disabled: safePage >= totalPages,
									onClick: () => setCurrentPage((p) => p + 1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
								})
							]
						})
					] })]
				})]
			})
		]
	});
}
//#endregion
export { SearchResults as t };
