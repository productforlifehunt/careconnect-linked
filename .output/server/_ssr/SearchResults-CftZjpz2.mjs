import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { Dt as MapPin, G as Search, L as Shield, Mn as ChevronLeft, N as SlidersHorizontal, T as Star, jn as ChevronRight, n as X, zn as Building2 } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-tMv_7nBM.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as careServiceTypeLabel, n as SERVICE_DELIVERY_MODES } from "./source.wordpress-CI9kg3_M.mjs";
import { Lt as useFacilityReviewSummaries, T as useCareFacilities, a as FACILITY_STAGE_OPTIONS, c as facilityLabels, i as FACILITY_ROOM_TYPE_OPTIONS, n as FACILITY_PEOPLE_NUMBER_OPTIONS, o as FACILITY_TYPE_OPTIONS, s as facilityLabel, wn as useProviders } from "./use-care-data-7GR_eJDG.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1, o as useSearchParams, r as useLocation$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as Slider } from "./slider-D5YvUsBT.mjs";
import { t as Skeleton } from "./skeleton-BRV0UAw9.mjs";
import { t as useServiceTypes } from "./use-service-types-BfA6EtiC.mjs";
import { a as SheetTrigger, i as SheetTitle, n as SheetContent, r as SheetHeader, t as Sheet } from "./sheet-pQsROK_m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SearchResults-CftZjpz2.js
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
		"data-inspector-id": "pages/SearchResults/FilterPanel/div/0",
		"data-inspector-source": "pages/SearchResults.tsx:110:5:e8152ec757d91b474394261df6fbd17235cd92293da6049d8573bfc7e827e690:1",
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				"data-inspector-id": "pages/SearchResults/FilterPanel/Label/0",
				"data-inspector-source": "pages/SearchResults.tsx:112:9:9fd7ca72c9b284db4f5bd77b7fe10436beb03a8b44d0eb3202354793840e5cca:1",
				className: "text-sm font-semibold mb-3 block",
				children: t("common.location")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"data-inspector-id": "pages/SearchResults/FilterPanel/Input/f75dbbd71376",
					"data-inspector-source": "pages/SearchResults.tsx:115:11:a8c3e7786c36847a12a3f03629d4916bc14c855dd3b31c517796345e6a8f8be4:1",
					placeholder: isZh ? "省/市/区" : t("home.cityOrZip"),
					value: locationFilter,
					onChange: (e) => {
						setLocationFilter(e.target.value);
						setCurrentPage(1);
					},
					className: "pl-9"
				})]
			})] }),
			isFacilityMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "pages/SearchResults/FilterPanel/Label/1",
					"data-inspector-source": "pages/SearchResults.tsx:121:13:8be13b5faf7c08420517ace74ab41f07c999aadf6adaa3d8006aa868c679a3bb:1",
					className: "text-sm font-semibold mb-3 block",
					children: isZh ? "机构类型" : "Facility type"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/SearchResults/FilterPanel/div/1",
					"data-inspector-source": "pages/SearchResults.tsx:122:13:f9c1fb8b014b7439f593b046611a4212417cd0c614e16b9be7665447ac8a36de:1",
					className: "space-y-2 max-h-44 overflow-auto pr-1",
					children: FACILITY_TYPE_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						"data-inspector-id": "pages/SearchResults/FilterPanel/label/0",
						"data-inspector-source": "pages/SearchResults.tsx:124:17:225161ee089c67d4588024a6790da8c2427a1cce2bdf989cb7d013f5c5eaf2a0:1",
						className: "flex items-center gap-2 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							"data-inspector-id": "pages/SearchResults/FilterPanel/Checkbox/6b73bb699075",
							"data-inspector-source": "pages/SearchResults.tsx:125:19:cd69a70d0798fd0c302e1a0e1db008e1b8e0394aebccf6bd01f38a2e4706f0d7:1",
							"aria-label": `${isZh ? "机构类型" : "Facility type"}: ${isZh ? opt.zh : opt.en}`,
							checked: selectedFacilityTypes.includes(opt.code),
							onCheckedChange: () => toggleFacilityType(opt.code)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/SearchResults/FilterPanel/span/0",
							"data-inspector-source": "pages/SearchResults.tsx:126:19:f7dced4e4732cda1cb79451f71ab170f19f5b76a9a60826887359800668068be:1",
							className: "text-sm",
							children: isZh ? opt.zh : opt.en
						})]
					}, opt.code))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "pages/SearchResults/FilterPanel/Label/2",
					"data-inspector-source": "pages/SearchResults.tsx:132:13:b0f79cfea01883c44593a5fbb8f07a7291bd733a2263719db26775180d572b7e:1",
					className: "text-sm font-semibold mb-3 block",
					children: isZh ? "可照护的失智症阶段" : "Dementia stage"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/SearchResults/FilterPanel/div/2",
					"data-inspector-source": "pages/SearchResults.tsx:133:13:5ca737ca92b381dd61b1bf6e56c19ce4d2db0e06f2d51b3de2f2cce60f2f25b2:1",
					className: "space-y-2",
					children: FACILITY_STAGE_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						"data-inspector-id": "pages/SearchResults/FilterPanel/label/1",
						"data-inspector-source": "pages/SearchResults.tsx:135:17:225161ee089c67d4588024a6790da8c2427a1cce2bdf989cb7d013f5c5eaf2a0:1",
						className: "flex items-center gap-2 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							"data-inspector-id": "pages/SearchResults/FilterPanel/Checkbox/5a224085cea1",
							"data-inspector-source": "pages/SearchResults.tsx:136:19:cd91bae5dd7a6b13e682817c110a56da92ca93a65994cbedc2b38165f85af8d8:1",
							"aria-label": `${isZh ? "失智症阶段" : "Dementia stage"}: ${isZh ? opt.zh : opt.en}`,
							checked: selectedStages.includes(opt.code),
							onCheckedChange: () => toggleStage(opt.code)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/SearchResults/FilterPanel/span/1",
							"data-inspector-source": "pages/SearchResults.tsx:137:19:f7dced4e4732cda1cb79451f71ab170f19f5b76a9a60826887359800668068be:1",
							className: "text-sm",
							children: isZh ? opt.zh : opt.en
						})]
					}, opt.code))
				})] })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "pages/SearchResults/FilterPanel/Label/3",
					"data-inspector-source": "pages/SearchResults.tsx:146:13:527ee7472b2a68ca4d21407c88bd519a250f80db6a2a459650415da1c7a21865:1",
					className: "text-sm font-semibold mb-3 block",
					children: isZh ? "服务方式" : "Delivery"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/SearchResults/FilterPanel/div/3",
					"data-inspector-source": "pages/SearchResults.tsx:147:13:5ca737ca92b381dd61b1bf6e56c19ce4d2db0e06f2d51b3de2f2cce60f2f25b2:1",
					className: "space-y-2",
					children: LOCATION_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						"data-inspector-id": "pages/SearchResults/FilterPanel/label/2",
						"data-inspector-source": "pages/SearchResults.tsx:149:17:12a527623d40d7a75b3dea05c197deee7f8b9a2b012be435271ad376bdace6aa:1",
						className: "flex items-center gap-2 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							"data-inspector-id": "pages/SearchResults/FilterPanel/Checkbox/afae277185e9",
							"data-inspector-source": "pages/SearchResults.tsx:150:19:289109d9db45c722ac8bd37511fdb795af379689293750bb2fa4fac7f48434d4:1",
							"aria-label": `${isZh ? "服务方式" : "Delivery"}: ${isZh ? opt.zh : opt.en}`,
							checked: selectedLocations.includes(opt.slug),
							onCheckedChange: () => {
								toggleLocation(opt.slug);
								setCurrentPage(1);
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/SearchResults/FilterPanel/span/2",
							"data-inspector-source": "pages/SearchResults.tsx:151:19:f7dced4e4732cda1cb79451f71ab170f19f5b76a9a60826887359800668068be:1",
							className: "text-sm",
							children: isZh ? opt.zh : opt.en
						})]
					}, opt.slug))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "pages/SearchResults/FilterPanel/Label/4",
					"data-inspector-source": "pages/SearchResults.tsx:157:13:a0f01bd6988d27f6da1895eabc795c297029fd09e94177fa2e6b26edf791bc10:1",
					className: "text-sm font-semibold mb-3 block",
					children: isZh ? "服务类型" : "Service type"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/SearchResults/FilterPanel/div/4",
					"data-inspector-source": "pages/SearchResults.tsx:158:13:e79e19d26da05c2aa4a71f8b0e043eb6a7ec61e40f3e7534c9e8ef9cda658ba1:1",
					className: "space-y-2 max-h-72 overflow-auto pr-1",
					children: serviceTypes.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						"data-inspector-id": "pages/SearchResults/FilterPanel/label/3",
						"data-inspector-source": "pages/SearchResults.tsx:160:17:0f6ba130bd6fd217ca1f8336cf38f76500f294123ff3ae9cafe8aa915482ad9e:1",
						className: "flex items-center gap-2 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							"data-inspector-id": "pages/SearchResults/FilterPanel/Checkbox/5eb3ac16b739",
							"data-inspector-source": "pages/SearchResults.tsx:161:19:28f78074b8639cd2d6687787e1e0642c49a6ec132d4184e90fba23d5d29575d1:1",
							"aria-label": `${isZh ? "服务类型" : "Service type"}: ${st.name}`,
							checked: selectedServiceTypeSlugs.includes(st.slug),
							onCheckedChange: () => {
								toggleServiceTypeSlug(st.slug);
								setCurrentPage(1);
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/SearchResults/FilterPanel/span/3",
							"data-inspector-source": "pages/SearchResults.tsx:166:19:066ea2128817e96a0cbaba874c12bd94333ddfd11549c7bde776a8782996620a:1",
							className: "text-sm",
							children: st.name
						})]
					}, st.slug))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
					"data-inspector-id": "pages/SearchResults/FilterPanel/Label/5",
					"data-inspector-source": "pages/SearchResults.tsx:172:13:2c7a06c8c3dd13bcada2bad2cde18b3828b6ebb3b449a3e4bca02eeaa4c80461:1",
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
					"data-inspector-id": "pages/SearchResults/FilterPanel/Slider/3389a3a94e2b",
					"data-inspector-source": "pages/SearchResults.tsx:173:13:c95052dc5d796897844e5a2bac9f0117b3a78a4a718cb4da0cc452f0fe4e80e7:1",
					value: priceRange,
					onValueChange: setPriceRange,
					min: 0,
					max: 100,
					step: 5,
					className: "mt-2"
				})] })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				"data-inspector-id": "pages/SearchResults/FilterPanel/Label/6",
				"data-inspector-source": "pages/SearchResults.tsx:178:9:8cc070b70ba225753f87d69c851c7370f9f36c6293d9ebc888c084686918cacd:1",
				className: "text-sm font-semibold mb-3 block",
				children: t("search.minimumRating")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/SearchResults/FilterPanel/div/5",
				"data-inspector-source": "pages/SearchResults.tsx:179:9:071dccf697c1badae00a469af34e1305288e6fbee9447a5b501a11ceff357683:1",
				className: "flex gap-2",
				children: [
					0,
					4,
					4.5,
					4.8
				].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-source": "pages/SearchResults.tsx:181:13:a056fe70b01d7c1d99cae039c56ba828da88368c2d827f03d5dec95676fac1fd:1",
					"data-inspector-id": `pages/SearchResults/FilterPanel/rating-${r}`,
					variant: minRating === r ? "default" : "outline",
					size: "sm",
					onClick: () => setMinRating(r),
					children: r === 0 ? t("search.any") : `${r}+`
				}, r))
			})] }),
			!isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-2 cursor-pointer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					"data-inspector-id": "pages/SearchResults/FilterPanel/Checkbox/f0b32f872a19",
					"data-inspector-source": "pages/SearchResults.tsx:189:11:f58d3323459431762cfee4269f57ec890f25ff59a8a794e543cab9f2c4b87a8a:1",
					"aria-label": t("search.verifiedOnly"),
					checked: verifiedOnly,
					onCheckedChange: (c) => setVerifiedOnly(!!c)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-id": "pages/SearchResults/FilterPanel/span/4",
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
		"data-inspector-id": "pages/SearchResults/SearchResults/div/0",
		"data-inspector-source": "pages/SearchResults.tsx:220:5:95ec94e0415a55dac3ce28ea7bad4dbe7bb08ab03c6227645f6584a4918f7904:1",
		className: "max-w-7xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/SearchResults/SearchResults/div/1",
				"data-inspector-source": "pages/SearchResults.tsx:221:7:897fb9c32b17cca9e80e69b7da470fa7fddfe92777e84e4bdb50b44ff28f0f57:1",
				className: "flex flex-col sm:flex-row gap-2.5 mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"data-inspector-id": "pages/SearchResults/SearchResults/Input/89db1d4b9c0e",
							"data-inspector-source": "pages/SearchResults.tsx:224:11:6fa21ba547757b29775886a768d9d70d17f8b0cffa0274debaea349a89e5e917:1",
							placeholder: isFacilityMode ? isZh ? "搜索养老机构、记忆照护、护理院..." : "Search care facilities, memory care, nursing homes..." : t("search.searchCaregivers"),
							value: query,
							onChange: (e) => setQuery(e.target.value),
							className: "pl-9 h-11"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						"data-inspector-id": "pages/SearchResults/SearchResults/Select/ed65f4abd60f",
						"data-inspector-source": "pages/SearchResults.tsx:226:9:6a38240851943703ca0d87b02ed170883becc22c2c8a24413e5266ac829df9a2:1",
						value: sortBy,
						onValueChange: setSortBy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							"data-inspector-id": "pages/SearchResults/SearchResults/SelectTrigger/0",
							"data-inspector-source": "pages/SearchResults.tsx:227:11:67f151c2ecac05c1dd2f8549a9542eb399e8e48acae5be6d7a1fab02334138c1:1",
							className: "w-[180px] h-11",
							"aria-label": t("search.sortBy"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
								"data-inspector-id": "pages/SearchResults/SearchResults/SelectValue/0",
								"data-inspector-source": "pages/SearchResults.tsx:227:85:67f151c2ecac05c1dd2f8549a9542eb399e8e48acae5be6d7a1fab02334138c1:1",
								placeholder: t("search.sortBy")
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
							"data-inspector-id": "pages/SearchResults/SearchResults/SelectContent/0",
							"data-inspector-source": "pages/SearchResults.tsx:228:11:48459541b0a9fae8ff635dadc1db25558ed9c088f88a441faccd0af9fba4ad65:1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									"data-inspector-id": "pages/SearchResults/SearchResults/SelectItem/0",
									"data-inspector-source": "pages/SearchResults.tsx:229:13:23b366d09b517d09e4f7d7cd54f875e61050dbdf1432d88a7856204ecd11d43f:1",
									value: "rating",
									children: t("search.highestRated")
								}),
								!isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									"data-inspector-id": "pages/SearchResults/SearchResults/SelectItem/1",
									"data-inspector-source": "pages/SearchResults.tsx:230:33:82f403f480b967b1aba6a15a31ef32783e4847ad89860368372f595808b3b802:1",
									value: "price-low",
									children: t("search.priceLowHigh")
								}),
								!isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									"data-inspector-id": "pages/SearchResults/SearchResults/SelectItem/2",
									"data-inspector-source": "pages/SearchResults.tsx:231:33:41c991dd89d3872a72d6911f4e445e5cd2bcd3f584f953deea4473b00a3db897:1",
									value: "price-high",
									children: t("search.priceHighLow")
								}),
								isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									"data-inspector-id": "pages/SearchResults/SearchResults/SelectItem/3",
									"data-inspector-source": "pages/SearchResults.tsx:232:32:caf3d2f6b075e585c569370a9f0770518beecf3c5a84f00514a59be9bb327a6f:1",
									value: "reviews",
									children: t("search.mostReviews")
								}),
								isFacilityMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									"data-inspector-id": "pages/SearchResults/SearchResults/SelectItem/4",
									"data-inspector-source": "pages/SearchResults.tsx:233:32:d4945f66f8e78db2279c612cb0db4e03710d0aa49eaad6ac573cf21c49a87a84:1",
									value: "name",
									children: isZh ? "名称" : "Name"
								})
							]
						})]
					}),
					isFacilityMode && isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/SearchResults/SearchResults/Button/d0cda6559bb3",
						"data-inspector-source": "pages/SearchResults.tsx:237:11:ac0eaeba4d23a3ca76cdddb1292b62c449e72742c79c726654f2e40574bdc3c7:1",
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
						"data-inspector-id": "pages/SearchResults/SearchResults/SheetTrigger/0",
						"data-inspector-source": "pages/SearchResults.tsx:242:11:663c69b36685fcd4a4926a98149322cdf3724f607fc5ada6a6591ab3f62babf4:1",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/SearchResults/SearchResults/Button/0",
							"data-inspector-source": "pages/SearchResults.tsx:243:13:477c8db69c2764c6469c334525f1ca41cd9821c9d3fd16c6f0ca3a70965f9111:1",
							variant: "outline",
							className: "h-11 lg:hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "h-4 w-4 mr-2" }),
								" ",
								t("search.filters")
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
						"data-inspector-id": "pages/SearchResults/SearchResults/SheetTitle/0",
						"data-inspector-source": "pages/SearchResults.tsx:246:26:c8a3cb1091d0f723c5334256656e64ec47604f52a635f05fefe5b5476612ceb2:1",
						children: t("search.filters")
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/SearchResults/SearchResults/div/2",
						"data-inspector-source": "pages/SearchResults.tsx:247:13:d0184c3e0cd75e4bce9d21faba34aa1b34ab06670fef28aabc643623ed0c4da7:1",
						className: "mt-6",
						children: FilterPanel()
					})] })] })
				]
			}),
			!isFacilityMode && (selectedServiceTypeSlugs.length > 0 || selectedLocations.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/SearchResults/SearchResults/div/3",
				"data-inspector-source": "pages/SearchResults.tsx:253:9:a24365185fc1b953a8bc8c6d4d916842ffdb041fac1680dbf9716a60715be1c1:1",
				className: "flex flex-wrap gap-2 mb-4",
				children: [
					selectedLocations.map((slug) => {
						const opt = LOCATION_OPTIONS.find((o) => o.slug === slug);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							"data-inspector-id": "pages/SearchResults/SearchResults/Badge/b77f9c026f56",
							"data-inspector-source": "pages/SearchResults.tsx:257:15:2076258ba16c4b67bd949fd6946d59f940b76e7386b3beb74737e548b191c99c:1",
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
						"data-inspector-id": "pages/SearchResults/SearchResults/Badge/bb048b217a97",
						"data-inspector-source": "pages/SearchResults.tsx:263:13:cb17159e375bed806f9aa7ec6fdb83160fcfd14f7236732aef631f011b7cefa3:1",
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
						"data-inspector-id": "pages/SearchResults/SearchResults/Button/306eb0eb19a6",
						"data-inspector-source": "pages/SearchResults.tsx:265:11:95c1db05012d2003cc865ea68f2d1374020c392ab5864b286e78517fa97d4029:1",
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
				"data-inspector-id": "pages/SearchResults/SearchResults/div/4",
				"data-inspector-source": "pages/SearchResults.tsx:270:9:a24365185fc1b953a8bc8c6d4d916842ffdb041fac1680dbf9716a60715be1c1:1",
				className: "flex flex-wrap gap-2 mb-4",
				children: [
					selectedFacilityTypes.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						"data-inspector-id": "pages/SearchResults/SearchResults/Badge/130a4b7c62eb",
						"data-inspector-source": "pages/SearchResults.tsx:272:13:d9a6073eec1a973f8daac3e9f05b8c702c0dab806a98e38f6c4cae070d7c8c34:1",
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
						"data-inspector-id": "pages/SearchResults/SearchResults/Badge/ff18002519ff",
						"data-inspector-source": "pages/SearchResults.tsx:275:13:31fc8d41960308f014f5b7efed3a8b274e5385e25a84b8902b761e395b1de9cc:1",
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
						"data-inspector-id": "pages/SearchResults/SearchResults/Button/2c0a0d97b990",
						"data-inspector-source": "pages/SearchResults.tsx:277:11:597fd07608dc6269d2632d31136292622ac644a1b751b891e068c9e8dbf80293:1",
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
				className: "flex gap-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden lg:block w-64 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/SearchResults/SearchResults/div/5",
						"data-inspector-source": "pages/SearchResults.tsx:284:11:c2489d252faaf0045b618368fdd61ddb30514f15ff8466473360b08a3bdb1ec9:1",
						className: "sticky top-24 bg-card rounded-xl border p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							"data-inspector-id": "pages/SearchResults/SearchResults/h3/0",
							"data-inspector-source": "pages/SearchResults.tsx:285:13:b028fbe4d6bbecff17032db9dcf80ebf04b1df1fd3e27f4aeff2b229b3cf230d:1",
							className: "font-semibold mb-4",
							children: t("search.filters")
						}), FilterPanel()]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/SearchResults/SearchResults/div/6",
					"data-inspector-source": "pages/SearchResults.tsx:290:9:4e230dc4bab6b172f7fb2ad3b233ebc255b3886f65d7e854ad21956be7e1985a:1",
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/SearchResults/SearchResults/h1/0",
						"data-inspector-source": "pages/SearchResults.tsx:291:11:eb557f50eb28ba617a08116e896ef12391f8ee6e59bbfcf8d985ef32d0a22c18:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4",
						children: isFacilityMode ? isZh ? "养老机构搜索结果" : "Care facility search results" : isZh ? "护理者搜索结果" : "Caregiver search results"
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/SearchResults/SearchResults/div/7",
						"data-inspector-source": "pages/SearchResults.tsx:298:13:fc217957b0936f971793d9339d74ac109a1acc1aa32b8677ef382a31b9e9270e:1",
						className: "space-y-4",
						children: [
							1,
							2,
							3,
							4
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/SearchResults/SearchResults/div/8",
							"data-inspector-source": "pages/SearchResults.tsx:300:17:ac44d49b3109c9db5aec4cc9806d7ec1cf827bcb19b3f76707966642b9461d18:1",
							className: "bg-card rounded-xl border p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "w-20 h-20 rounded-xl shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-56" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-20 rounded-full" })]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-16" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-24 rounded-md" })]
									})
								]
							})
						}, i))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/SearchResults/SearchResults/p/0",
							"data-inspector-source": "pages/SearchResults.tsx:311:15:ff3a5bf975fa03deff2d8a3d9a8de577464527e7f7922026dadb860d55e3a2ee:1",
							className: "text-sm text-muted-foreground mb-4",
							children: isFacilityMode ? isZh ? `找到${allResults.length}家养老机构` : `${allResults.length} care facilities found` : t("search.caregiversFound", { count: allResults.length })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/SearchResults/SearchResults/div/9",
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
									"data-inspector-id": "pages/SearchResults/SearchResults/Card/5c866f122a0e",
									"data-inspector-source": "pages/SearchResults.tsx:327:23:8f35b4ba8e077f987095f1ac582e6f5094b6565f1695655714a8b12cc0cb886e:1",
									className: "card-elevated cursor-pointer border-transparent",
									onClick: () => navigate(`/facility/${facility.id}`),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
										className: "p-5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col sm:flex-row gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/SearchResults/SearchResults/div/10",
												"data-inspector-source": "pages/SearchResults.tsx:330:29:cba76fb89f18773495b3d9d93dd7833166790c803087781eb9e06977f5e43645:1",
												className: "flex-1 min-w-0",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2 mb-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
															"data-inspector-id": "pages/SearchResults/SearchResults/h3/1",
															"data-inspector-source": "pages/SearchResults.tsx:332:33:a8cfd6fa30301030d54422fa52a17770df943483cda0d2274e7c9d980643de78:1",
															className: "font-semibold text-lg text-foreground",
															children: facility.name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-primary" })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-id": "pages/SearchResults/SearchResults/div/11",
														"data-inspector-source": "pages/SearchResults.tsx:335:31:4822a0faaace42b1997c8e4b15f5a9b98858635a1868f102e5da8ad4f64c3b73:1",
														className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															"data-inspector-id": "pages/SearchResults/SearchResults/span/0",
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
															"data-inspector-id": "pages/SearchResults/SearchResults/span/1",
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
														"data-inspector-id": "pages/SearchResults/SearchResults/p/1",
														"data-inspector-source": "pages/SearchResults.tsx:339:56:09e1e306ea7b203ceedda5bcc48adafa3a5667a855be6a0353c074aaeaeeb67a:1",
														className: "text-sm text-muted-foreground line-clamp-2 mb-3",
														children: facility.description
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-id": "pages/SearchResults/SearchResults/div/12",
														"data-inspector-source": "pages/SearchResults.tsx:340:31:5b38d53ae56e5dd942eb1ec065f96bf65b357883475c442cd2822e9441bb38eb:1",
														className: "space-y-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-inspector-id": "pages/SearchResults/SearchResults/div/13",
															"data-inspector-source": "pages/SearchResults.tsx:341:33:519bc4e76265a898d128a988568a259cc56d3e94702b1304f68bc0aa86f7297a:1",
															className: "flex flex-wrap gap-1.5",
															children: [
																typeLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	"data-inspector-id": "pages/SearchResults/SearchResults/Badge/0",
																	"data-inspector-source": "pages/SearchResults.tsx:342:63:d5deb5595f3313978fcd0fb80bb1418e8fa2f28a42e38b60aee79bcc0d4cb173:1",
																	variant: "outline",
																	className: "text-xs",
																	children: label
																}, `type-${label}`)),
																stageLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	"data-inspector-id": "pages/SearchResults/SearchResults/Badge/1",
																	"data-inspector-source": "pages/SearchResults.tsx:343:64:b5dfe719f9657d170eb6eb14e2f56848fe25ef81a413fd2c314bf0f04ccec99d:1",
																	variant: "secondary",
																	className: "bg-primary/10 text-primary text-xs",
																	children: label
																}, `stage-${label}`)),
																roomTypeLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	"data-inspector-id": "pages/SearchResults/SearchResults/Badge/2",
																	"data-inspector-source": "pages/SearchResults.tsx:344:67:c2541bfe3477ced47aa94eaab4b05cc6a3918451d8d65e562a3f9743728393a1:1",
																	variant: "secondary",
																	className: "bg-accent text-accent-foreground text-xs",
																	children: label
																}, `room-${label}`))
															]
														}), peopleNumberLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															"data-inspector-id": "pages/SearchResults/SearchResults/div/14",
															"data-inspector-source": "pages/SearchResults.tsx:347:35:0cf1ee5e89df9e384e7c52ef733d196f7d8ba62717bdb55f9dc41f66d4f8014b:1",
															className: "text-xs text-muted-foreground",
															children: peopleNumberLabel
														})]
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "sm:text-right shrink-0 flex sm:flex-col items-start sm:items-end gap-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													"data-inspector-id": "pages/SearchResults/SearchResults/Button/1",
													"data-inspector-source": "pages/SearchResults.tsx:352:31:bb9b6919cf0f962f2b4b7bb658619fa7c2b689b2f0ff9f64df36da28f567d282:1",
													variant: "coral",
													size: "sm",
													children: isZh ? "查看详情" : "View details"
												})
											})]
										})
									})
								}, facility.id);
							}) : paged.map((cg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								"data-inspector-id": "pages/SearchResults/SearchResults/Card/f96ccacc52b6",
								"data-inspector-source": "pages/SearchResults.tsx:361:21:cbcdf08e3b81d3af4d380cd5e1e969fc361711142fee5cc285c525b2a27e8bfc:1",
								className: "card-elevated cursor-pointer border-transparent",
								onClick: () => navigate(`/caregiver/${cg.id}`),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "p-5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col sm:flex-row gap-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												"data-inspector-id": "pages/SearchResults/SearchResults/img/0",
												"data-inspector-source": "pages/SearchResults.tsx:364:27:0f828f1f382bec454aa6514e8ed14432f167fe05aae529f25a9553d6416cdc2e:1",
												src: cg.avatar_url || "/placeholder.svg",
												alt: cg.full_name || "",
												className: "w-20 h-20 rounded-xl object-cover shrink-0"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/SearchResults/SearchResults/div/15",
												"data-inspector-source": "pages/SearchResults.tsx:365:27:d96c1fedd659b6764e85d558d4558db003be775ec32d874f512966ec8c88ef62:1",
												className: "flex-1 min-w-0",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-id": "pages/SearchResults/SearchResults/div/16",
														"data-inspector-source": "pages/SearchResults.tsx:366:29:0c406493b1096d32257358fdcd253b6191ecedcfe51672231247287bc7c124c9:1",
														className: "flex items-center gap-2 mb-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
															"data-inspector-id": "pages/SearchResults/SearchResults/h3/2",
															"data-inspector-source": "pages/SearchResults.tsx:367:31:a29abde45144d1a7dc619109367bb23c10d4413608f5ff9de38ed2317a2f2126:1",
															className: "font-semibold text-lg text-foreground",
															children: cg.full_name
														}), cg.care_provider_is_background_checked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-primary" })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-id": "pages/SearchResults/SearchResults/div/17",
														"data-inspector-source": "pages/SearchResults.tsx:370:29:e41a231cb4e758b8a8a3711119787dc3e4e769d6bd7be913a2caa0ee3ba74aed:1",
														className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2",
														children: [cg.rating_average != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															"data-inspector-id": "pages/SearchResults/SearchResults/span/2",
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
															"data-inspector-id": "pages/SearchResults/SearchResults/span/3",
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
														"data-inspector-id": "pages/SearchResults/SearchResults/p/2",
														"data-inspector-source": "pages/SearchResults.tsx:374:40:7bc159e6fa035300373488dfad835622b0edecbc197126168c75d04d51b8e243:1",
														className: "text-sm text-muted-foreground line-clamp-2 mb-3",
														children: cg.bio
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-id": "pages/SearchResults/SearchResults/div/18",
														"data-inspector-source": "pages/SearchResults.tsx:375:29:9fcb1791e3e30cd6b5d8040e5933530fe5524386582796cd69becb22fcd08dd4:1",
														className: "flex flex-wrap gap-1.5",
														children: [(cg.service_location_slugs || []).map((slug) => {
															const opt = LOCATION_OPTIONS.find((o) => o.slug === slug);
															return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																"data-inspector-id": "pages/SearchResults/SearchResults/Badge/a97896fcb84a",
																"data-inspector-source": "pages/SearchResults.tsx:380:35:f8df43df2aeffb614f9379744dfff8602f2f19fb496646e4b4a6596fd7b0ba2d:1",
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
																"data-inspector-id": "pages/SearchResults/SearchResults/Badge/d959a7064a8f",
																"data-inspector-source": "pages/SearchResults.tsx:397:35:f8df43df2aeffb614f9379744dfff8602f2f19fb496646e4b4a6596fd7b0ba2d:1",
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
												className: "sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													"data-inspector-id": "pages/SearchResults/SearchResults/div/19",
													"data-inspector-source": "pages/SearchResults.tsx:415:29:976758addb19cabe5c4a88dd9954fc6d5fc0486ef50e0cc49cdd8721cd9d0037:1",
													children: cg.care_provider_starts_hourly_rate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/SearchResults/SearchResults/span/4",
														"data-inspector-source": "pages/SearchResults.tsx:418:35:7300c8d90e77bc5682a0fbd5160befadf7a65cf47878e85d05bca3ca61baa25c:1",
														className: "text-2xl font-bold text-foreground",
														children: [isZh ? "¥" : "$", cg.care_provider_starts_hourly_rate]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-id": "pages/SearchResults/SearchResults/span/5",
														"data-inspector-source": "pages/SearchResults.tsx:419:35:f864d4aa4bf119591400defb1af814f0edb4535b227d4be6cf22860f78e5dc09:1",
														className: "text-sm text-muted-foreground",
														children: t("common.perHour")
													})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-id": "pages/SearchResults/SearchResults/span/6",
														"data-inspector-source": "pages/SearchResults.tsx:422:33:c93d579360ee9df5e2c150a61c08c55d0addc8c4c46f5c5c6fe7c612092b2b2a:1",
														className: "text-sm font-medium text-muted-foreground",
														children: isZh ? "价格待询" : "Rate on request"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													"data-inspector-id": "pages/SearchResults/SearchResults/Button/2",
													"data-inspector-source": "pages/SearchResults.tsx:425:29:8d99541463bc3688d868199022b0ca607331aec0baa342ca461b2fcde758ddb7:1",
													variant: "coral",
													size: "sm",
													children: t("common.bookNow")
												})]
											})
										]
									})
								})
							}, cg.id)), allResults.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center py-16",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/SearchResults/SearchResults/p/3",
									"data-inspector-source": "pages/SearchResults.tsx:434:21:5c0f3049e4ffc2ff2b3c17c1c0519b4604b27a54fab034dddfb055f75f92743a:1",
									className: "text-lg text-muted-foreground",
									children: isFacilityMode ? isZh ? "没有符合条件的养老机构。" : "No facilities matched your filters." : t("search.noMatch")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/SearchResults/SearchResults/Button/ad609520aaac",
									"data-inspector-source": "pages/SearchResults.tsx:435:21:9b4bb300874f6a008adab9aa7be911ee37cc4cf0537e3eccd79d7745581977ce:1",
									variant: "outline",
									className: "mt-4",
									onClick: () => {
										setQuery("");
										setLocationFilter("");
										setSelectedServiceTypeSlugs([]);
										setSelectedFacilityTypes([]);
										setSelectedStages([]);
										setSelectedLocations([]);
										setVerifiedOnly(false);
										setMinRating(0);
										setPriceRange([0, 100]);
										setCurrentPage(1);
									},
									children: t("common.clearFilters")
								})]
							})]
						}),
						totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-2 mt-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/SearchResults/SearchResults/Button/f1bd90f71916",
									"data-inspector-source": "pages/SearchResults.tsx:441:19:b91a6aa266af8fc04863b061f329fc37ed1920f96ca073ac36e244e2f52adff9:1",
									variant: "outline",
									size: "sm",
									disabled: safePage <= 1,
									onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-id": "pages/SearchResults/SearchResults/span/7",
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
									"data-inspector-id": "pages/SearchResults/SearchResults/Button/94e8d4c2be21",
									"data-inspector-source": "pages/SearchResults.tsx:443:19:cc8a5da8673683b4bc615bdfa1a5fb1e2792d092c7f8e3cf8b6881940f84b0a7:1",
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
