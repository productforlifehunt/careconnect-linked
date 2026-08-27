import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { getSpecialtyKey } from "@/lib/specialty-i18n";
import { useServiceTypes } from "@/hooks/use-service-types";
import { useAuth } from "@/contexts/AuthContext";
function normalizeList(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value];
  return [] as string[];
}

function formatFacilityToken(value: string) {
  return value.replace(/_/g, " ");
}

function getFacilityAddress(facility: CareFacility, isZh: boolean) {
  if (isZh) {
    return [facility.country, facility.c_province, facility.c_city, facility.c_district, facility.c_town, facility.c_village, facility.address]
      .filter(Boolean)
      .join(" ");
  }
  return [facility.location, facility.address, facility.country].filter(Boolean).join(", ");
}

export default function SearchResults() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { serviceTypeNames: allServiceTypeNames } = useServiceTypes();
  // Filter out raw kebab-case slug duplicates leaking from the WC taxonomy
  // (e.g. when both "儿童护理" and "child-care" exist as separate terms).
  const specialties = allServiceTypeNames
    .filter(n => !/^[a-z][a-z0-9-]*$/.test(n))
    .slice(0, 8);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialLocation = searchParams.get("location") || "";
  const serviceCategory = searchParams.get("service_category") || "care";
  const isFacilityMode = serviceCategory === "facility";
  const isZh = i18n.language?.startsWith("zh");
  const facilityArea = isZh ? "china" : "global";
  // URL-driven filter pre-selection (e.g. nav links: ?service_location=in-person&service_type=companionship)
  const initialServiceLocations = (searchParams.get("service_location") || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  const initialServiceTypeSlugs = (searchParams.get("service_type") || "")
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
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(initialQuery ? [initialQuery].filter(q => allServiceTypeNames.includes(q)) : []);
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialServiceLocations);
  const [selectedServiceTypeSlugs, setSelectedServiceTypeSlugs] = useState<string[]>(initialServiceTypeSlugs);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data: providers, isLoading: providersLoading } = useProviders({
    query: debouncedQuery || undefined, location: debouncedLocation || undefined,
    specialties: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
    minRate: priceRange[0] > 0 ? priceRange[0] : undefined, maxRate: priceRange[1] < 100 ? priceRange[1] : undefined,
    verifiedOnly, minRating: minRating > 0 ? minRating : undefined, sortBy,
    serviceLocations: selectedLocations.length > 0 ? selectedLocations : undefined,
    serviceTypeSlugs: selectedServiceTypeSlugs.length > 0 ? selectedServiceTypeSlugs : undefined,
  });

  const { data: facilities, isLoading: facilitiesLoading } = useCareFacilities({
    query: debouncedQuery || undefined,
    location: debouncedLocation || undefined,
    sortBy,
    serviceTypes: selectedServiceTypes.length > 0 ? selectedServiceTypes : undefined,
    facilityTypes: selectedFacilityTypes.length > 0 ? selectedFacilityTypes : undefined,
    area: facilityArea,
  });

  const { data: facilityFacets } = useCareFacilities({ area: facilityArea });

  const toggleSpecialty = (s: string) => setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleFacilityType = (s: string) => setSelectedFacilityTypes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleServiceType = (s: string) => setSelectedServiceTypes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleLocation = (s: string) => setSelectedLocations(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // Caregiver delivery-mode options come from the WC pa_service-location attribute terms.
  const LOCATION_OPTIONS: { slug: string; en: string; zh: string }[] = [
    { slug: "in-person", en: "In-Person", zh: "当面" },
    { slug: "remote", en: "Remote", zh: "远程" },
    { slug: "hybrid", en: "Hybrid", zh: "混合" },
  ];

  const facilityTypeOptions = Array.from(new Set((facilityFacets || []).map((item) => item.type).filter(Boolean) as string[]));
  const facilityServiceOptions = Array.from(
    new Set(
      (facilityFacets || []).flatMap((item) => [
        ...normalizeList(item.service_category),
        ...normalizeList(item.service_type),
      ])
    )
  );

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
              {facilityTypeOptions.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={selectedFacilityTypes.includes(s)} onCheckedChange={() => toggleFacilityType(s)} />
                  <span className="text-sm">{formatFacilityToken(s)}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-3 block">{isZh ? "服务分类" : "Services"}</Label>
            <div className="space-y-2 max-h-52 overflow-auto pr-1">
              {facilityServiceOptions.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={selectedServiceTypes.includes(s)} onCheckedChange={() => toggleServiceType(s)} />
                  <span className="text-sm">{formatFacilityToken(s)}</span>
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
                  <Checkbox checked={selectedLocations.includes(opt.slug)} onCheckedChange={() => { toggleLocation(opt.slug); setCurrentPage(1); }} />
                  <span className="text-sm">{isZh ? opt.zh : opt.en}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-3 block">{t("search.specialty")}</Label>
            <div className="space-y-2">
              {specialties.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={selectedSpecialties.includes(s)} onCheckedChange={() => toggleSpecialty(s)} />
                  <span className="text-sm">{t(getSpecialtyKey(s))}</span>
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
          <Checkbox checked={verifiedOnly} onCheckedChange={(c) => setVerifiedOnly(!!c)} />
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
          <SelectTrigger className="w-[180px] h-11"><SelectValue placeholder={t("search.sortBy")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">{t("search.highestRated")}</SelectItem>
            {!isFacilityMode && <SelectItem value="price-low">{t("search.priceLowHigh")}</SelectItem>}
            {!isFacilityMode && <SelectItem value="price-high">{t("search.priceHighLow")}</SelectItem>}
            {!isFacilityMode && <SelectItem value="experience">{t("search.mostExperienced")}</SelectItem>}
            <SelectItem value="reviews">{t("search.mostReviews")}</SelectItem>
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

      {!isFacilityMode && (selectedSpecialties.length > 0 || selectedLocations.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedLocations.map(slug => {
            const opt = LOCATION_OPTIONS.find(o => o.slug === slug);
            return (
              <Badge key={slug} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleLocation(slug)}>
                {opt ? (isZh ? opt.zh : opt.en) : slug} <X className="h-3 w-3" />
              </Badge>
            );
          })}
          {selectedSpecialties.map(s => (
            <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleSpecialty(s)}>{t(getSpecialtyKey(s))} <X className="h-3 w-3" /></Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => { setSelectedSpecialties([]); setSelectedLocations([]); }}>{t("common.clearAll")}</Button>
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
                    const serviceCategories = normalizeList(facility.service_category);
                    const serviceTypes = normalizeList(facility.service_type);
                    const facilityServices = serviceCategories.concat(serviceTypes);
                    const reviewSummary = facilityReviewSummaries?.[facility.id] || { average: null, count: 0 };
                    return (
                      <Card key={facility.id} className="card-elevated cursor-pointer border-transparent" onClick={() => navigate(`/facility/${facility.id}`)}>
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <img src={facility.image_url || facility.avatar_url || "/placeholder.svg"} alt={facility.name || ""} className="w-24 h-24 rounded-xl object-cover shrink-0" />
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
                                  {facility.type && <Badge variant="outline" className="text-xs">{formatFacilityToken(facility.type)}</Badge>}
                                  {serviceCategories.slice(0, 3).map((s) => (<Badge key={s} variant="secondary" className="bg-primary/10 text-primary text-xs">{formatFacilityToken(s)}</Badge>))}
                                  {serviceTypes.slice(0, 3).map((s) => (<Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">{formatFacilityToken(s)}</Badge>))}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {isZh
                                    ? `共 ${facilityServices.length} 项服务标签`
                                    : `${facilityServices.length} service tags`}
                                </div>
                              </div>
                            </div>
                            <div className="sm:text-right shrink-0 flex sm:flex-col items-start sm:items-end gap-3">
                              <div className="text-sm text-muted-foreground flex items-center gap-1"><Globe className="h-4 w-4" /> {facility.country || (isZh ? "中国" : "Global")}</div>
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
                              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning fill-warning" /> {cg.rating_average?.toFixed(1) || t("common.new")} ({cg.rating_count || 0})</span>
                              {cg.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cg.location}</span>}
                              {cg.years_of_experience && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {cg.years_of_experience} {t("common.yearsExp")}</span>}
                            </div>
                            {cg.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cg.bio}</p>}
                            <div className="flex flex-wrap gap-1.5">
                              {(cg.service_location_slugs || []).map(slug => {
                                const opt = LOCATION_OPTIONS.find(o => o.slug === slug);
                                return <Badge key={`loc-${slug}`} variant="outline" className="text-xs border-primary/40 text-primary">{opt ? (isZh ? opt.zh : opt.en) : slug}</Badge>;
                              })}
                              {(cg.specialty || []).map(s => (<Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">{t(getSpecialtyKey(s))}</Badge>))}
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
                    <Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setLocationFilter(""); setSelectedSpecialties([]); setSelectedFacilityTypes([]); setSelectedServiceTypes([]); setSelectedLocations([]); setMinRating(0); setPriceRange([0, 100]); setCurrentPage(1); }}>{t("common.clearFilters")}</Button>
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
