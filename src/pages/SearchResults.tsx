import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, MapPin, Shield, Clock, Search, SlidersHorizontal, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useProviders } from "@/hooks/use-care-data";
import type { Profile } from "@/types/care-connector";

const specialties = ["Elder Care", "Child Care", "Special Needs", "Nursing Care", "Companionship", "Respite Care", "Physical Therapy", "Dementia Care"];

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialLocation = searchParams.get("location") || "";

  const [query, setQuery] = useState(initialQuery);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [sortBy, setSortBy] = useState("rating");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialQuery ? [initialQuery].filter(q => specialties.includes(q)) : []
  );
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data: providers, isLoading } = useProviders({
    query: query || undefined,
    location: locationFilter || undefined,
    specialties: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
    minRate: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxRate: priceRange[1] < 100 ? priceRange[1] : undefined,
    verifiedOnly,
    minRating: minRating > 0 ? minRating : undefined,
    sortBy,
  });

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const getResponseTime = (minutes: number | null) => {
    if (!minutes) return "";
    if (minutes < 60) return `Under ${minutes} min`;
    return `Under ${Math.ceil(minutes / 60)} hour${minutes > 60 ? "s" : ""}`;
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="City or ZIP..." value={locationFilter} onChange={e => { setLocationFilter(e.target.value); setCurrentPage(1); }} className="pl-9" />
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold mb-3 block">Specialty</Label>
        <div className="space-y-2">
          {specialties.map(s => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selectedSpecialties.includes(s)} onCheckedChange={() => toggleSpecialty(s)} />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold mb-3 block">Hourly Rate: ${priceRange[0]} - ${priceRange[1]}</Label>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={100} step={5} className="mt-2" />
      </div>
      <div>
        <Label className="text-sm font-semibold mb-3 block">Minimum Rating</Label>
        <div className="flex gap-2">
          {[0, 4, 4.5, 4.8].map(r => (
            <Button key={r} variant={minRating === r ? "default" : "outline"} size="sm" onClick={() => setMinRating(r)}>
              {r === 0 ? "Any" : `${r}+`}
            </Button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox checked={verifiedOnly} onCheckedChange={(c) => setVerifiedOnly(!!c)} />
        <span className="text-sm font-medium">Verified Only</span>
      </label>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search caregivers..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 h-11" />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] h-11">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-6"><FilterPanel /></div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters */}
      {selectedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSpecialties.map(s => (
            <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleSpecialty(s)}>
              {s} <X className="h-3 w-3" />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setSelectedSpecialties([])}>Clear all</Button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Filters</h3>
            <FilterPanel />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-card rounded-xl border p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-3 w-full" />
                      <div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
                    </div>
                    <div className="space-y-2 shrink-0">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (() => {
            const allResults = providers || [];
            const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));
            const safePage = Math.min(currentPage, totalPages);
            const paged = allResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
            return (
              <>
                <p className="text-sm text-muted-foreground mb-4">{allResults.length} caregivers found</p>
                <div className="space-y-4">
                  {paged.map((cg: Profile) => (
                    <Card key={cg.id} className="card-elevated cursor-pointer border-transparent" onClick={() => navigate(`/caregiver/${cg.id}`)}>
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img src={cg.avatar_url || "/placeholder.svg"} alt={cg.full_name || ""} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{cg.full_name}</h3>
                              {cg.background_check_status === "passed" && <Shield className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-warning" /> {cg.rating_average?.toFixed(1) || "New"} ({cg.rating_count || 0})
                              </span>
                              {cg.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cg.location}</span>}
                              {cg.years_of_experience && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {cg.years_of_experience} yrs exp</span>}
                            </div>
                            {cg.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cg.bio}</p>}
                            <div className="flex flex-wrap gap-1.5">
                              {(cg.specialty || []).map(s => (
                                <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
                            <div>
                              <span className="text-2xl font-bold text-foreground">${cg.hourly_rate || 0}</span>
                              <span className="text-sm text-muted-foreground">/hr</span>
                            </div>
                            <Button variant="coral" size="sm">Book Now</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {allResults.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-lg text-muted-foreground">No caregivers match your criteria.</p>
                      <Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setLocationFilter(""); setSelectedSpecialties([]); setMinRating(0); setPriceRange([0, 100]); setCurrentPage(1); }}>
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {safePage} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
