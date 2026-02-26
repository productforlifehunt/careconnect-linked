import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Lock, Eye, FileCheck, AlertTriangle, Phone, Mail } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";

export default function TrustSafety() {
  const site = useSite();
  const safeguards = [
    {
      icon: FileCheck,
      title: "Comprehensive Background Checks",
      desc: "Every caregiver undergoes a multi-state criminal background check, sex offender registry check, and identity verification before joining our platform.",
      badge: "Required",
    },
    {
      icon: Shield,
      title: "Identity Verification",
      desc: "We verify government-issued IDs, Social Security numbers, and professional licenses for all caregivers. You can see verification badges on every profile.",
      badge: "Verified",
    },
    {
      icon: CheckCircle,
      title: "Credential Validation",
      desc: "All certifications (CNA, RN, CPR, etc.) are validated directly with issuing organizations. Expired certifications are flagged automatically.",
      badge: "Validated",
    },
    {
      icon: Eye,
      title: "Verified Reviews",
      desc: "Only families who have completed a booking can leave reviews. We use fraud detection to ensure all reviews are genuine and helpful.",
      badge: "Authentic",
    },
    {
      icon: Lock,
      title: "Secure Payments",
      desc: "All payments are processed through encrypted, PCI-compliant systems. Your financial information is never shared with caregivers.",
      badge: "Encrypted",
    },
    {
      icon: AlertTriangle,
      title: "Real-Time Safety Alerts",
      desc: "GPS geofencing, SOS button, and automatic alerts keep you informed. If something seems wrong, our safety team responds immediately.",
      badge: "24/7",
    },
  ];

  const stats = [
    { label: "Background Checks Completed", value: "50,000+" },
    { label: "Active Verified Caregivers", value: "12,000+" },
    { label: "Families Served", value: "25,000+" },
    { label: "Safety Incidents Resolved", value: "99.8%" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="mx-auto w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Trust & Safety</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your family's safety is our top priority. Here's how we protect you at every step.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map(s => (
          <Card key={s.label} className="border-transparent card-elevated text-center">
            <CardContent className="p-6">
              <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safeguards */}
      <div className="space-y-6 mb-12">
        {safeguards.map((sg, i) => (
          <Card key={i} className="border-transparent card-elevated">
            <CardContent className="p-6 flex gap-5">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <sg.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-foreground">{sg.title}</h3>
                  <Badge variant="secondary" className="bg-success/10 text-success">{sg.badge}</Badge>
                </div>
                <p className="text-muted-foreground">{sg.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reporting */}
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle>Report a Safety Concern</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you have any safety concerns, please don't hesitate to reach out. Our safety team is available 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="coral" className="gap-2">
              <Phone className="h-4 w-4" /> Call Safety Line: 1-800-CARE-SAFE
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" /> Email: {site.contactEmail}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
