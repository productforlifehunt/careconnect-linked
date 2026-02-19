import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, MapPin, Star, Shield, Clock, Heart,
  Users, Stethoscope, Baby, Moon, ArrowRight, CheckCircle, Loader2
} from "lucide-react";
import { useProviders, useServiceCategories } from "@/hooks/use-care-data";
import heroImage from "@/assets/hero-image.jpg";
import type { Profile } from "@/types/care-connector";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const { data: topProviders, isLoading } = useProviders({ sortBy: "rating" });
  const { data: categories } = useServiceCategories();
  const featuredProviders = (topProviders || []).slice(0, 3);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (locationQuery) params.set("location", locationQuery);
    navigate(`/search?${params.toString()}`);
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    "Elder Care": <Heart className="h-6 w-6" />,
    "Child Care": <Baby className="h-6 w-6" />,
    "Special Needs": <Users className="h-6 w-6" />,
    "Nursing Care": <Stethoscope className="h-6 w-6" />,
    "Companionship": <Users className="h-6 w-6" />,
    "Respite Care": <Moon className="h-6 w-6" />,
  };

  const displayCategories = (categories || []).slice(0, 6).map(c => ({ name: c.name, count: 0 }));

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Compassionate caregiving" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in">
              Find Trusted Care,{" "}
              <span className="text-coral">Stay Connected</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Search caregivers, book appointments, coordinate with your care team, and track care in real-time — all in one place.
            </p>

            <div className="bg-card rounded-xl p-2 shadow-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="What type of care do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-0 bg-muted/50 h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="City or ZIP code"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-9 border-0 bg-muted/50 h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button variant="coral" size="lg" className="h-12 px-8" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {["Background Checked", "Verified Reviews", "GPS Tracking"].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Browse by Category</h2>
        <p className="text-muted-foreground mb-8">Find the right type of care for your needs</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat) => (
            <Card
              key={cat.name}
              className="card-elevated cursor-pointer group border-transparent"
              onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
            >
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {categoryIcons[cat.name] || <Heart className="h-6 w-6" />}
                </div>
                <h3 className="font-semibold text-sm text-foreground">{cat.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Caregivers */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Top-Rated Caregivers</h2>
              <p className="text-muted-foreground mt-1">Trusted professionals near you</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/search")} className="hidden sm:flex">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProviders.map((cg: Profile) => (
                <Card
                  key={cg.id}
                  className="card-elevated cursor-pointer border-transparent overflow-hidden"
                  onClick={() => navigate(`/caregiver/${cg.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <img src={cg.avatar_url || "/placeholder.svg"} alt={cg.full_name || ""} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{cg.full_name}</h3>
                            {cg.background_check_status === "passed" && <Shield className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            <span className="text-sm font-medium">{cg.rating_average?.toFixed(1) || "New"}</span>
                            <span className="text-xs text-muted-foreground">({cg.rating_count || 0})</span>
                          </div>
                          {cg.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {cg.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(cg.specialty || []).slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {cg.response_time_minute ? `Under ${cg.response_time_minute < 60 ? cg.response_time_minute + " min" : Math.ceil(cg.response_time_minute / 60) + " hrs"}` : ""}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-foreground">${cg.hourly_rate || 0}</span>
                          <span className="text-sm text-muted-foreground">/hr</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate("/search")}>
              View All Caregivers <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">How Care·Connected Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Search & Compare", desc: "Browse verified caregivers by specialty, location, ratings, and availability. No account needed to search." },
            { step: "2", title: "Book & Manage", desc: "Book care sessions, manage schedules, and coordinate with your care team all in one place." },
            { step: "3", title: "Track & Connect", desc: "Use GPS tracking, care journals, and team coordination to stay connected and informed." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center mb-4">
                <span className="text-primary-foreground font-bold text-xl">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">Ready to find the perfect caregiver?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of families who trust Care·Connected for their caregiving needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="coral" size="lg" onClick={() => navigate("/search")}>
              Find Caregivers
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/auth?mode=signup")}>
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">C·C</span>
                </div>
                <span className="font-bold text-foreground">Care·Connected</span>
              </div>
              <p className="text-sm text-muted-foreground">Connecting families with trusted caregivers since 2024.</p>
            </div>
            {[
              { title: "For Families", links: [
                { label: "Find Caregivers", href: "/search" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Trust & Safety", href: "/trust-safety" },
                { label: "Care Circle", href: "/care-circle" },
              ] },
              { title: "For Caregivers", links: [
                { label: "Join as Caregiver", href: "/become-caregiver" },
                { label: "Jobs Board", href: "/jobs" },
                { label: "Provider Dashboard", href: "/provider-dashboard" },
                { label: "Trust & Safety", href: "/trust-safety" },
              ] },
              { title: "Company", links: [
                { label: "How It Works", href: "/how-it-works" },
                { label: "Trust & Safety", href: "/trust-safety" },
                { label: "Sign Up", href: "/auth?mode=signup" },
                { label: "Sign In", href: "/auth" },
              ] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-foreground mb-3 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2026 Care·Connected. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
