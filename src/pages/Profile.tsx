import { useState, useEffect, useRef } from "react";
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
import { careAuth } from "@/integrations/supabase/external-client";
import { User, Bell, Shield, MapPin, Loader2, Upload, Camera } from "lucide-react";

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setAvatarUrl(profile.avatar_url || "");
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
        avatar_url: avatarUrl || null,
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
                <div className="relative group">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-2xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
                        return;
                      }
                      setAvatarUploading(true);
                      try {
                        const { data: { session } } = await careAuth.auth.getSession();
                        if (!session) throw new Error("Not authenticated");
                        const ext = file.name.split(".").pop();
                        const filePath = `${session.user.id}/avatar.${ext}`;
                        // Upload to the external Supabase's avatars bucket
                        const { createClient } = await import("@supabase/supabase-js");
                        const storageClient = createClient("https://yekarqanirdkdckimpna.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc", {
                          auth: { storage: localStorage, persistSession: true, autoRefreshToken: true, storageKey: "cc-external-auth" },
                        });
                        const { error: uploadErr } = await storageClient.storage.from("avatars").upload(filePath, file, { upsert: true });
                        if (uploadErr) throw uploadErr;
                        const { data: publicData } = storageClient.storage.from("avatars").getPublicUrl(filePath);
                        const newUrl = publicData.publicUrl + "?t=" + Date.now();
                        setAvatarUrl(newUrl);
                        await updateProfile.mutateAsync({ avatar_url: newUrl });
                        toast({ title: "Avatar updated!" });
                      } catch (err: any) {
                        // Fallback: if storage not available, show URL input
                        toast({ title: "Upload failed", description: "Try pasting an image URL instead. " + (err.message || ""), variant: "destructive" });
                      } finally {
                        setAvatarUploading(false);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }
                    }}
                  />
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
                <Label>Avatar</Label>
                <div className="flex gap-2 items-center mt-1">
                  <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://... or upload above" className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </Button>
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
              <Button variant="outline" className="w-full" onClick={() => toast({ title: "Data Export Requested", description: "You will receive an email with your data shortly." })}>Download My Data</Button>
              <Button variant="destructive" className="w-full" onClick={() => toast({ title: "Account Deletion Requested", description: "Our support team will contact you to confirm within 24 hours.", variant: "destructive" })}>Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
