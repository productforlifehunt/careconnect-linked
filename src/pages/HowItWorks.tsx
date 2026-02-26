import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSite } from "@/contexts/SiteContext";
import { Search, CalendarDays, Users, MapPin, Shield, Star, CheckCircle, Heart } from "lucide-react";

export default function HowItWorks() {
  const navigate = useNavigate();
  const site = useSite();

  const steps = [
    { icon: Search, title: "Search & Discover", desc: "Browse verified caregivers by specialty, location, ratings, and availability. Filter by experience, certifications, languages, and more. No account required to search." },
    { icon: CalendarDays, title: "Book with Confidence", desc: "View real-time availability, read verified reviews, and book care sessions instantly. Set your schedule, specify needs, and get matched with the right caregiver." },
    { icon: Users, title: "Build Your Care Team", desc: "Invite family members, doctors, and caregivers to collaborate. Share updates, assign tasks, and maintain a care journal everyone can access." },
    { icon: MapPin, title: "Track in Real-Time", desc: "Know where your loved ones and caregivers are with GPS tracking. Set geofence alerts, share locations with your care team, and use the SOS feature for emergencies." },
  ];

  const features = [
    { icon: Shield, title: "Background Verified", desc: "All caregivers undergo thorough background checks and identity verification." },
    { icon: Star, title: "Verified Reviews", desc: "Only families who've booked can leave reviews, ensuring authenticity." },
    { icon: CheckCircle, title: "Certified Professionals", desc: "View certifications, licenses, and training for every caregiver." },
    { icon: Heart, title: "Care Matching", desc: "Our algorithm matches you with caregivers best suited to your needs." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{site.howItWorksTitle}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From finding the perfect caregiver to coordinating with your care team — everything you need in one place.</p>
      </div>

      {/* Steps */}
      <div className="space-y-12 mb-20">
        {steps.map((step, i) => (
          <div key={i} className={`flex flex-col md:flex-row gap-8 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
            <div className="w-24 h-24 rounded-3xl hero-gradient flex items-center justify-center shrink-0">
              <step.icon className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <span className="text-sm font-bold text-primary">Step {i + 1}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust features */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Why Families Trust Us</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="border-transparent card-elevated">
              <CardContent className="p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center hero-gradient rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-foreground mb-4">Ready to get started?</h2>
        <p className="text-primary-foreground/80 mb-6">Search caregivers for free — no account required.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="coral" size="lg" onClick={() => navigate("/search")}>{site.ctaButton}</Button>
          <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/auth?mode=signup")}>Create Account</Button>
        </div>
      </div>
    </div>
  );
}
