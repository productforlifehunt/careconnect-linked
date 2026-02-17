import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, MapPin, Shield, Clock, Search, SlidersHorizontal, X } from "lucide-react";
import { caregivers } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

const specialties = ["Elder Care", "Child Care", "Special Needs", "Nursing Care", "Companionship", "Respite Care", "Physical Therapy", "Dementia Care"];

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("rating");
  const [priceRange, setPriceRange] = useState([0, 60]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialQuery ? [initialQuery].filter(q => specialties.includes(q)) : []
  );
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(() => {
    let results = [...caregivers];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.specialty.some(s => s.toLowerCase().includes(q)) ||
        c.location.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q)
      );
    }

    if (selectedSpecialties.length > 0) {
      results = results.filter(c => c.specialty.some(s => selectedSpecialties.includes(s)));
    }

    results = results.filter(c => c.hourlyRate >= priceRange[0] && c.hourlyRate <= priceRange[1]);
    if (verifiedOnly) results = results.filter(c => c.verified);
    if (minRating > 0) results = results.filter(c => c.rating >= minRating);

    results.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return a.hourlyRate - b.hourlyRate;
      if (sortBy === "price-high") return b.hourlyRate - a.hourlyRate;
      if (sortBy === "experience") return b.experience - a.experience;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return 0;
    });

    return results;
  }, [query, sortBy, priceRange, selectedSpecialties, verifiedOnly, minRating]);

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
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
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={60} step={5} className="mt-2" />
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
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} caregivers found</p>
          <div className="space-y-4">
            {filtered.map(cg => (
              <Card key={cg.id} className="card-elevated cursor-pointer border-transparent" onClick={() => navigate(`/caregiver/${cg.id}`)}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img src={cg.avatar} alt={cg.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-foreground">{cg.name}</h3>
                        {cg.verified && <Shield className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-warning" /> {cg.rating} ({cg.reviewCount})
                        </span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cg.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {cg.experience} yrs exp</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cg.bio}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cg.specialty.map(s => (
                          <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
                      <div>
                        <span className="text-2xl font-bold text-foreground">${cg.hourlyRate}</span>
                        <span className="text-sm text-muted-foreground">/hr</span>
                      </div>
                      <Button variant="coral" size="sm">Book Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No caregivers match your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setSelectedSpecialties([]); setMinRating(0); setPriceRange([0, 60]); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
