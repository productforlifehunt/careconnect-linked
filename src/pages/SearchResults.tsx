import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, MapPin, Shield, Clock, Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Building2, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useCareFacilities, useFacilityReviewSummaries, useProviders } from "@/hooks/use-care-data";
import type { CareFacility, Profile } from "@/types/care-connector";
import { useTranslation } from "react-i18next";
import { useServiceTypes } from "@/hooks/use-service-types";
import { SERVICE_DELIVERY_MODES, careServiceTypeLabel } from "@/lib/care-service-types";
import { useAuth } from "@/contexts/AuthContext";
import {
  FACILITY_TYPE_OPTIONS,
  FACILITY_STAGE_OPTIONS,
  FACILITY_ROOM_TYPE_OPTIONS,
  FACILITY_PEOPLE_NUMBER_OPTIONS,
  facilityLabel,
  facilityLabels,
} from "@/lib/facility-options";
function getFacilityAddress(facility: CareFacility, isZh: boolean) {
  return [facility.location, facility.address].filter(Boolean).join(isZh ? " " : ", ");
}

export default function SearchResults() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  // Care service catalogue = CCT 258 a68 (14 dictionary options). No WooCommerce.
  const { serviceTypes } = useServiceTypes();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  // Each search entry has its own clean address; the path decides the preset filters.
  const PRESETS: Record<string, { category?: string; location?: string; type?: string }> = {
    "/search-caregiver": { category: "care" },
    "/search-local-caregiver": { category: "care", location: "in-person", type: "companionship" },
    "/search-remote-caregiver": { category: "care", location: "remote", type: "companionship" },
    "/search-care-facility": { category: "facility" },
  };
  const preset = PRESETS[pathname] || {};
  const initialQuery = searchParams.get("q") || "";
  const initialLocation = searchParams.get("location") || "";
  const serviceCategory = searchParams.get("service_category") || preset.category || "care";
  const isFacilityMode = serviceCategory === "facility";
  const isZh = i18n.language?.startsWith("zh");
  const facilityArea = isZh ? "china" : "global";
  // Filter pre-selection from the path preset, overridable by query params.
  const initialServiceLocations = (searchParams.get("service_location") || preset.location || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  const initialServiceTypeSlugs = (searchParams.get("service_type") || preset.type || "")
    .split(",").map(s => s.trim()).filter(Boolean);

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [debouncedLocation, setDebouncedLocation] = useState(initialLocation);
  const [sortBy, setSortBy] = useState("rating");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    debounceRef.current = setTimeout(() => { setDebouncedQuery(query); setDebouncedLocation(locationFilter); setCurrentPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, locationFilter]);

  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialServiceLocations);
  const [selectedServiceTypeSlugs, setSelectedServiceTypeSlugs] = useState<string[]>(initialServiceTypeSlugs);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data: providers, isLoading: providersLoading } = useProviders({
    query: debouncedQuery || undefined, location: debouncedLocation || undefined,
    minRate: priceRange[0] > 0 ? priceRange[0] : undefined, maxRate: priceRange[1] < 100 ? priceRange[1] : undefined,
    verifiedOnly, minRating: minRating > 0 ? minRating : undefined, sortBy,
    serviceLocations: selectedLocations.length > 0 ? selectedLocations : undefined,
    serviceTypeSlugs: selectedServiceTypeSlugs.length > 0 ? selectedServiceTypeSlugs : undefined,
  });

  const { data: facilities, isLoading: facilitiesLoading } = useCareFacilities({
    query: debouncedQuery || undefined,
    location: debouncedLocation || undefined,
    sortBy,
    dementiaStages: selectedStages.length > 0 ? selectedStages : undefined,
    facilityTypes: selectedFacilityTypes.length > 0 ? selectedFacilityTypes : undefined,
    area: facilityArea,
  });

  const { data: facilityFacets } = useCareFacilities({ area: facilityArea });

  const toggleFacilityType = (s: string) => setSelectedFacilityTypes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleStage = (s: string) => setSelectedStages(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleLocation = (s: string) => setSelectedLocations(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleServiceTypeSlug = (s: string) => setSelectedServiceTypeSlugs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // Delivery-mode options = CCT 258 a65 (b55 In person / b56 Remote).
  const LOCATION_OPTIONS = SERVICE_DELIVERY_MODES;


  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold mb-3 block">{t("common.location")}</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={isZh ? "省/市/区" : t("home.cityOrZip")} value={locationFilter} onChange={e => { setLocationFilter(e.target.value); setCurrentPage(1); }} className="pl-9" />
        </div>
      </div>
      {isFacilityMode ? (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold mb-3 block">{isZh ? "机构类型" : "Facility type"}</Label>
            <div className="space-y-2 max-h-44 overflow-auto pr-1">
              {FACILITY_TYPE_OPTIONS.map(opt => (
                <label key={opt.code} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox aria-label={`${isZh ? "机构类型" : "Facility type"}: ${isZh ? opt.zh : opt.en}`} checked={selectedFacilityTypes.includes(opt.code)} onCheckedChange={() => toggleFacilityType(opt.code)} />
                  <span className="text-sm">{isZh ? opt.zh : opt.en}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-3 block">{isZh ? "可照护的失智症阶段" : "Dementia stage"}</Label>
            <div className="space-y-2">
              {FACILITY_STAGE_OPTIONS.map(opt => (
                <label key={opt.code} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox aria-label={`${isZh ? "失智症阶段" : "Dementia stage"}: ${isZh ? opt.zh : opt.en}`} checked={selectedStages.includes(opt.code)} onCheckedChange={() => toggleStage(opt.code)} />
                  <span className="text-sm">{isZh ? opt.zh : opt.en}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <Label className="text-sm font-semibold mb-3 block">{isZh ? "服务方式" : "Delivery"}</Label>
            <div className="space-y-2">
              {LOCATION_OPTIONS.map(opt => (
                <label key={opt.slug} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox aria-label={`${isZh ? "服务方式" : "Delivery"}: ${isZh ? opt.zh : opt.en}`} checked={selectedLocations.includes(opt.slug)} onCheckedChange={() => { toggleLocation(opt.slug); setCurrentPage(1); }} />
                  <span className="text-sm">{isZh ? opt.zh : opt.en}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-3 block">{isZh ? "服务类型" : "Service type"}</Label>
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {serviceTypes.map(st => (
                <label key={st.slug} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    aria-label={`${isZh ? "服务类型" : "Service type"}: ${st.name}`}
                    checked={selectedServiceTypeSlugs.includes(st.slug)}
                    onCheckedChange={() => { toggleServiceTypeSlug(st.slug); setCurrentPage(1); }}
                  />
                  <span className="text-sm">{st.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-3 block">{t("search.hourlyRate")}: {isZh ? "¥" : "$"}{priceRange[0]} - {isZh ? "¥" : "$"}{priceRange[1]}</Label>
            <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={100} step={5} className="mt-2" />
          </div>
        </>
      )}
      <div>
        <Label className="text-sm font-semibold mb-3 block">{t("search.minimumRating")}</Label>
        <div className="flex gap-2">
          {[0, 4, 4.5, 4.8].map(r => (
            <Button key={r} variant={minRating === r ? "default" : "outline"} size="sm" onClick={() => setMinRating(r)}>
              {r === 0 ? t("search.any") : `${r}+`}
            </Button>
          ))}
        </div>
      </div>
      {!isFacilityMode && (
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox aria-label={t("search.verifiedOnly")} checked={verifiedOnly} onCheckedChange={(c) => setVerifiedOnly(!!c)} />
          <span className="text-sm font-medium">{t("search.verifiedOnly")}</span>
        </label>
      )}
    </div>
  );

  const loading = isFacilityMode ? facilitiesLoading : providersLoading;
  const facilityIds = isFacilityMode ? (facilities || []).map((facility) => facility.id) : [];
  const { data: facilityReviewSummaries } = useFacilityReviewSummaries(facilityIds);
  const facilityResults = isFacilityMode
    ? [...(facilities || [])]
        .filter((facility) => {
          const reviewSummary = facilityReviewSummaries?.[facility.id] || { average: null, count: 0 };
          if (minRating > 0 && ((reviewSummary.average ?? 0) < minRating)) return false;
          return true;
        })
        .sort((a, b) => {
          const aSummary = facilityReviewSummaries?.[a.id] || { average: null, count: 0 };
          const bSummary = facilityReviewSummaries?.[b.id] || { average: null, count: 0 };
          if (sortBy === "reviews") return bSummary.count - aSummary.count;
          if (sortBy === "rating") return (bSummary.average ?? -1) - (aSummary.average ?? -1);
          return a.name.localeCompare(b.name);
        })
    : [];
  const allResults = isFacilityMode ? facilityResults : (providers || []);
  const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = allResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={isFacilityMode ? (isZh ? "搜索养老机构、记忆照护、护理院..." : "Search care facilities, memory care, nursing homes...") : t("search.searchCaregivers")} value={query} onChange={e => setQuery(e.target.value)} className="pl-9 h-11" />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] h-11" aria-label={t("search.sortBy")}><SelectValue placeholder={t("search.sortBy")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">{t("search.highestRated")}</SelectItem>
            {!isFacilityMode && <SelectItem value="price-low">{t("search.priceLowHigh")}</SelectItem>}
            {!isFacilityMode && <SelectItem value="price-high">{t("search.priceHighLow")}</SelectItem>}
            {isFacilityMode && <SelectItem value="reviews">{t("search.mostReviews")}</SelectItem>}
            {isFacilityMode && <SelectItem value="name">{isZh ? "名称" : "Name"}</SelectItem>}
          </SelectContent>
        </Select>
        {isFacilityMode && isAuthenticated && (
          <Button variant="coral" className="h-11" onClick={() => navigate("/facilities/new")}>
            <Building2 className="h-4 w-4 mr-2" /> {isZh ? "提交养老院" : "Submit Facility"}
          </Button>
        )}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 lg:hidden"><SlidersHorizontal className="h-4 w-4 mr-2" /> {t("search.filters")}</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>{t("search.filters")}</SheetTitle></SheetHeader>
            <div className="mt-6"><FilterPanel /></div>
          </SheetContent>
        </Sheet>
      </div>

      {!isFacilityMode && (selectedServiceTypeSlugs.length > 0 || selectedLocations.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedLocations.map(slug => {
            const opt = LOCATION_OPTIONS.find(o => o.slug === slug);
            return (
              <Badge key={slug} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleLocation(slug)}>
                {opt ? (isZh ? opt.zh : opt.en) : slug} <X className="h-3 w-3" />
              </Badge>
            );
          })}
          {selectedServiceTypeSlugs.map(slug => (
            <Badge key={slug} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleServiceTypeSlug(slug)}>{careServiceTypeLabel(slug, isZh)} <X className="h-3 w-3" /></Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => { setSelectedServiceTypeSlugs([]); setSelectedLocations([]); }}>{t("common.clearAll")}</Button>
        </div>
      )}

      {isFacilityMode && selectedFacilityTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedFacilityTypes.map(s => (
            <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleFacilityType(s)}>{formatFacilityToken(s)} <X className="h-3 w-3" /></Badge>
          ))}
          {selectedServiceTypes.map(s => (
            <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleServiceType(s)}>{formatFacilityToken(s)} <X className="h-3 w-3" /></Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setSelectedFacilityTypes([])}>{t("common.clearAll")}</Button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-4">{t("search.filters")}</h3>
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {isFacilityMode
              ? (isZh ? "养老机构搜索结果" : "Care facility search results")
              : (isZh ? "护理者搜索结果" : "Caregiver search results")}
          </h1>
          {loading ? (

            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-card rounded-xl border p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-56" /><Skeleton className="h-3 w-full" /><div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div></div>
                    <div className="space-y-2 shrink-0"><Skeleton className="h-8 w-16" /><Skeleton className="h-9 w-24 rounded-md" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {isFacilityMode
                  ? (isZh ? `找到${allResults.length}家养老机构` : `${allResults.length} care facilities found`)
                  : t("search.caregiversFound", { count: allResults.length })}
              </p>
              <div className="space-y-4">
                {isFacilityMode ? (
                  (paged as CareFacility[]).map((facility) => {
                    const typeLabels = facilityLabels(FACILITY_TYPE_OPTIONS, (facility as any).type, !!isZh);
                    const stageLabels = facilityLabels(FACILITY_STAGE_OPTIONS, (facility as any).dementia_stage, !!isZh);
                    const roomTypeLabels = facilityLabels(FACILITY_ROOM_TYPE_OPTIONS, (facility as any).room_type, !!isZh);
                    const peopleNumberLabel = (facility as any).people_number
                      ? facilityLabel(FACILITY_PEOPLE_NUMBER_OPTIONS, (facility as any).people_number, !!isZh)
                      : "";
                    const reviewSummary = facilityReviewSummaries?.[facility.id] || { average: null, count: 0 };
                    return (
                      <Card key={facility.id} className="card-elevated cursor-pointer border-transparent" onClick={() => navigate(`/facility/${facility.id}`)}>
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{facility.name}</h3>
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning fill-warning" /> {reviewSummary.average?.toFixed(1) || t("common.new")} ({reviewSummary.count})</span>
                                {getFacilityAddress(facility, isZh) && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {getFacilityAddress(facility, isZh)}</span>}
                              </div>
                              {facility.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{facility.description}</p>}
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {typeLabels.map((label) => (<Badge key={`type-${label}`} variant="outline" className="text-xs">{label}</Badge>))}
                                  {stageLabels.map((label) => (<Badge key={`stage-${label}`} variant="secondary" className="bg-primary/10 text-primary text-xs">{label}</Badge>))}
                                  {roomTypeLabels.map((label) => (<Badge key={`room-${label}`} variant="secondary" className="bg-accent text-accent-foreground text-xs">{label}</Badge>))}
                                </div>
                                {peopleNumberLabel && (
                                  <div className="text-xs text-muted-foreground">{peopleNumberLabel}</div>
                                )}
                              </div>
                            </div>
                            <div className="sm:text-right shrink-0 flex sm:flex-col items-start sm:items-end gap-3">
                              <Button variant="coral" size="sm">{isZh ? "查看详情" : "View details"}</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  (paged as Profile[]).map((cg) => (
                    <Card key={cg.id} className="card-elevated cursor-pointer border-transparent" onClick={() => navigate(`/caregiver/${cg.id}`)}>
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img src={cg.avatar_url || "/placeholder.svg"} alt={cg.full_name || ""} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{cg.full_name}</h3>
                              {cg.care_provider_is_background_checked && <Shield className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                              {cg.rating_average != null && <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning fill-warning" /> {cg.rating_average.toFixed(1)} ({cg.rating_count || 0})</span>}
                              {cg.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cg.location}</span>}
                            </div>
                            {cg.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cg.bio}</p>}
                            <div className="flex flex-wrap gap-1.5">
                              {(cg.service_location_slugs || []).map(slug => {
                                const opt = LOCATION_OPTIONS.find(o => o.slug === slug);
                                const active = selectedLocations.includes(slug);
                                return (
                                  <Badge
                                    key={`loc-${slug}`}
                                    variant={active ? "default" : "outline"}
                                    role="button"
                                    tabIndex={0}
                                    title={isZh ? "点击筛选同类服务者" : "Tap to see everyone offering this"}
                                    className="text-xs cursor-pointer border-primary/40 hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={(e) => { e.stopPropagation(); toggleLocation(slug); }}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); toggleLocation(slug); } }}
                                  >
                                    {opt ? (isZh ? opt.zh : opt.en) : slug}
                                  </Badge>
                                );
                              })}
                              {(cg.service_type_slugs || []).map(slug => {
                                const active = selectedServiceTypeSlugs.includes(slug);
                                return (
                                  <Badge
                                    key={slug}
                                    variant={active ? "default" : "secondary"}
                                    role="button"
                                    tabIndex={0}
                                    title={isZh ? "点击筛选同类服务者" : "Tap to see everyone offering this"}
                                    className={`text-xs cursor-pointer transition-colors ${active ? "" : "bg-accent text-accent-foreground"} hover:bg-primary hover:text-primary-foreground`}
                                    onClick={(e) => { e.stopPropagation(); toggleServiceTypeSlug(slug); }}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); toggleServiceTypeSlug(slug); } }}
                                  >
                                    {careServiceTypeLabel(slug, isZh)}
                                  </Badge>
                                );
                              })}
                            </div>

                          </div>
                          <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
                            <div>
                              {cg.care_provider_starts_hourly_rate ? (
                                <>
                                  <span className="text-2xl font-bold text-foreground">{isZh ? "¥" : "$"}{cg.care_provider_starts_hourly_rate}</span>
                                  <span className="text-sm text-muted-foreground">{t("common.perHour")}</span>
                                </>
                              ) : (
                                <span className="text-sm font-medium text-muted-foreground">{isZh ? "价格待询" : "Rate on request"}</span>
                              )}
                            </div>
                            <Button variant="coral" size="sm">{t("common.bookNow")}</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                {allResults.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">{isFacilityMode ? (isZh ? "没有符合条件的养老机构。" : "No facilities matched your filters.") : t("search.noMatch")}</p>
                    <Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setLocationFilter(""); setSelectedServiceTypeSlugs([]); setSelectedFacilityTypes([]); setSelectedServiceTypes([]); setSelectedLocations([]); setMinRating(0); setPriceRange([0, 100]); setCurrentPage(1); }}>{t("common.clearFilters")}</Button>
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm text-muted-foreground">{t("common.page")} {safePage} {t("common.of")} {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
