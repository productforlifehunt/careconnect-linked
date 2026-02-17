import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { User, Bell, Shield, CreditCard, MapPin, Camera, Loader2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");

  // Notification preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone_number || "");
      setAddress(profile.address || "");
      setBio(profile.bio || "");
      setEmailNotifs(profile.email_notification ?? true);
      setPushNotifs(profile.push_notification ?? true);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: name,
        phone_number: phone,
        address,
        bio,
        email_notification: emailNotifs,
        push_notification: pushNotifs,
      });
      toast({ title: "Profile updated successfully" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const displayName = name || user?.full_name || "User";
  const roleLabel = profile?.is_care_provider ? "Care Provider" : "Care Seeker";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>

      <Tabs defaultValue="personal">
        <TabsList className="mb-6">
          <TabsTrigger value="personal" className="gap-2"><User className="h-4 w-4" /> Personal</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2"><Shield className="h-4 w-4" /> Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card className="border-transparent card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-2xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-coral flex items-center justify-center">
                    <Camera className="h-3.5 w-3.5 text-coral-foreground" />
                  </button>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">{email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{roleLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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

          <Button variant="coral" onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email notifications</Label>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Push notifications</Label>
                <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
              </div>
            </CardContent>
          </Card>
          <Button variant="coral" onClick={handleSave} disabled={updateProfile.isPending}>Save Preferences</Button>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">Download My Data</Button>
              <Button variant="destructive" className="w-full">Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
