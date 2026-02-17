import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Bell, Shield, CreditCard, MapPin, Camera } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState("(555) 123-4567");
  const [address, setAddress] = useState("123 Oak Street, Brooklyn, NY 11201");
  const [bio, setBio] = useState("Caring for my mother who has early-stage dementia. Looking for reliable, compassionate caregivers who can help with daily activities.");
  const [emergencyName, setEmergencyName] = useState("David Smith");
  const [emergencyPhone, setEmergencyPhone] = useState("(555) 987-6543");
  const [emergencyRelation, setEmergencyRelation] = useState("Brother");

  // Notification preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [careUpdates, setCareUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy
  const [profileVisible, setProfileVisible] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  const handleSave = () => {
    toast({ title: "Profile updated successfully" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>

      <Tabs defaultValue="personal">
        <TabsList className="mb-6">
          <TabsTrigger value="personal" className="gap-2"><User className="h-4 w-4" /> Personal</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2"><Shield className="h-4 w-4" /> Privacy</TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><CreditCard className="h-4 w-4" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          {/* Avatar */}
          <Card className="border-transparent card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-2xl font-bold">{name.charAt(0).toUpperCase()}</span>
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-coral flex items-center justify-center">
                    <Camera className="h-3.5 w-3.5 text-coral-foreground" />
                  </button>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{name}</h2>
                  <p className="text-sm text-muted-foreground">{email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Member since Feb 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={email} disabled className="opacity-60" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select defaultValue={user?.role || "care-seeker"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="care-seeker">Care Seeker</SelectItem>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={address} onChange={e => setAddress(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div>
                <Label>About Me</Label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={emergencyName} onChange={e => setEmergencyName(e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="coral" onClick={handleSave}>Save Changes</Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Notification Channels</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Email notifications", value: emailNotifs, set: setEmailNotifs },
                { label: "SMS notifications", value: smsNotifs, set: setSmsNotifs },
                { label: "Push notifications", value: pushNotifs, set: setPushNotifs },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <Label>{item.label}</Label>
                  <Switch checked={item.value} onCheckedChange={item.set} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Notification Types</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Booking reminders", desc: "Get reminded before upcoming bookings", value: bookingReminders, set: setBookingReminders },
                { label: "Care circle updates", desc: "Journal entries, task updates from your care circle", value: careUpdates, set: setCareUpdates },
                { label: "Marketing & tips", desc: "Care tips, platform updates, and promotions", value: marketingEmails, set: setMarketingEmails },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <Label>{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={item.set} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Button variant="coral" onClick={handleSave}>Save Preferences</Button>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Profile visible to caregivers", desc: "Let caregivers see your profile when you contact them", value: profileVisible, set: setProfileVisible },
                { label: "Share location with care circle", desc: "Allow care circle members to see your location", value: shareLocation, set: setShareLocation },
                { label: "Show online status", desc: "Let others see when you're online", value: showOnlineStatus, set: setShowOnlineStatus },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <Label>{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={item.set} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">Download My Data</Button>
              <Button variant="destructive" className="w-full">Delete Account</Button>
            </CardContent>
          </Card>
          <Button variant="coral" onClick={handleSave}>Save Privacy Settings</Button>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">VISA</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/28</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <Button variant="outline" size="sm">+ Add Payment Method</Button>
            </CardContent>
          </Card>
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Billing History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "Feb 18, 2026", desc: "Sarah Johnson - Wound Care Follow-up", amount: "$84.00" },
                  { date: "Feb 10, 2026", desc: "Sarah Johnson - Elder Care (4hrs)", amount: "$112.00" },
                  { date: "Jan 28, 2026", desc: "Aisha Williams - Child Care (3hrs)", amount: "$75.00" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.desc}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className="font-medium text-foreground">{item.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
