import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Loader2, Plus, Pill, ClipboardCheck, HeartPulse, Lightbulb, Target, FileText,
  Phone, MapPin, FolderOpen, Activity, Trash2, Check, X, ArrowLeft, Clock, SkipForward,
  Search, UserPlus,
} from "lucide-react";
import {
  useUserCaredOnes, useCreateUserCaredOne, useSearchProfiles,
  useMedicines, useCreateMedicine, useDeleteMedicine, useLogMedicine,
  useCheckinLogs, useCreateCheckinLog,
  useHealthVitals, useCreateHealthVital,
  useCareTips, useCreateCareTip, useDeleteCareTip,
  useCarePlans, useCreateCarePlan, useCarePlanGoals, useCreateCarePlanGoal, useUpdateCarePlanGoal,
  useCareNotes, useCreateCareNote, useDeleteCareNote,
  useEmergencyContacts, useCreateEmergencyContact, useDeleteEmergencyContact,
  useActivityLog, useCreateActivityLog,
  useSafeZones, useCreateSafeZone, useDeleteSafeZone,
  useCaredOneDocuments, useCreateCaredOneDocument, useDeleteCaredOneDocument,
  useDeleteUserCaredOne,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

const featureCards = [
  { key: "medicine", title: "Medicine Tracker", icon: Pill, color: "text-primary" },
  { key: "checkin", title: "Daily Check-Ins", icon: ClipboardCheck, color: "text-primary" },
  { key: "health", title: "Health Tracking", icon: HeartPulse, color: "text-primary" },
  { key: "tips", title: "Care Tips", icon: Lightbulb, color: "text-primary" },
  { key: "plan", title: "Care Plan", icon: Target, color: "text-primary" },
  { key: "notes", title: "Care Notes", icon: FileText, color: "text-primary" },
  { key: "emergency", title: "Emergency Contacts", icon: Phone, color: "text-primary" },
  { key: "location", title: "Location & Safe Zones", icon: MapPin, color: "text-primary" },
  { key: "documents", title: "Documents", icon: FolderOpen, color: "text-primary" },
  { key: "visits", title: "Visit Log", icon: Activity, color: "text-primary" },
];

export default function CaredOnes() {
  const { toast } = useToast();
  const { data: caredOnes, isLoading } = useUserCaredOnes();
  const createUserCaredOne = useCreateUserCaredOne();
  const deleteUserCaredOne = useDeleteUserCaredOne();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);

  // Add Cared One modal
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [relationship, setRelationship] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const { data: searchResults } = useSearchProfiles(searchQuery);

  const selectedId = activeTab || (caredOnes && caredOnes.length > 0 ? caredOnes[0].cared_one_id : null);
  const selectedCaredOne = caredOnes?.find((c: any) => c.cared_one_id === selectedId);
  const caredOneName = selectedCaredOne?.cared_one?.full_name || selectedCaredOne?.cared_one?.first_name || "Cared One";

  const handleAddCaredOne = () => {
    if (!selectedPerson) return;
    createUserCaredOne.mutate({ caredOneId: selectedPerson.id, relationship: relationship || undefined, isPrimary }, {
      onSuccess: () => {
        setAddOpen(false); setSelectedPerson(null); setSearchQuery(""); setRelationship(""); setIsPrimary(false);
        toast({ title: "Cared one added!" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleRemoveCaredOne = (id: string, name: string) => {
    deleteUserCaredOne.mutate(id, {
      onSuccess: () => {
        setActiveTab(null);
        setOpenCard(null);
        toast({ title: `${name} removed from your cared ones` });
      },
      onError: (err: any) => toast({ title: "Failed to remove", description: err.message, variant: "destructive" }),
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cared Ones</h1>
          <p className="text-muted-foreground">Manage and track care for your loved ones</p>
        </div>
        <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> Add Cared One
        </Button>
      </div>

      {/* Add Cared One Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) { setSelectedPerson(null); setSearchQuery(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Cared One</DialogTitle>
            <DialogDescription>Search for someone to add as a person you care for</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Search by name or email</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSelectedPerson(null); }} placeholder="Type at least 2 characters..." className="pl-9" />
              </div>
            </div>
            {searchQuery.length >= 2 && !selectedPerson && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {(searchResults || []).length > 0 ? (searchResults || []).map((p: any) => (
                  <button key={p.id} className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors" onClick={() => setSelectedPerson(p)}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="text-primary text-xs font-medium">{(p.full_name || p.email || "?")[0]}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.full_name || p.first_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.email || ""}</p>
                    </div>
                  </button>
                )) : <p className="p-3 text-sm text-muted-foreground text-center">No results found</p>}
              </div>
            )}
            {selectedPerson && (
              <div className="rounded-lg border bg-muted/50 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {selectedPerson.avatar_url ? <img src={selectedPerson.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-primary font-medium">{(selectedPerson.full_name || "?")[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{selectedPerson.full_name || "No name"}</p>
                  <p className="text-xs text-muted-foreground">{selectedPerson.email || ""}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedPerson(null)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            )}
            <div>
              <Label>Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="grandmother">Grandmother</SelectItem>
                  <SelectItem value="grandfather">Grandfather</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="coral" className="w-full" onClick={handleAddCaredOne} disabled={!selectedPerson || createUserCaredOne.isPending}>
              {createUserCaredOne.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HeartPulse className="h-4 w-4 mr-2" />}
              Add as Cared One
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {caredOnes && caredOnes.length > 0 ? (
        <>
          <div className="flex gap-2 mb-6 flex-wrap items-center">
            {caredOnes.map((co: any) => {
              const name = co.cared_one?.full_name || co.cared_one?.first_name || "Cared One";
              return (
                <div key={co.cared_one_id} className={`group relative flex items-center gap-1 rounded-lg border transition-colors ${selectedId === co.cared_one_id ? "bg-card border-primary shadow-sm" : "bg-transparent border-border hover:bg-accent/50"}`}>
                  <button onClick={() => { setActiveTab(co.cared_one_id); setOpenCard(null); }} className="px-4 py-2 text-sm font-medium">
                    {name}
                    {co.relationship && <span className="text-xs text-muted-foreground ml-1">({co.relationship})</span>}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="pr-2 pl-0 py-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {name}?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove {name} from your cared ones list. Their data will not be deleted, and you can add them again later.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveCaredOne(co.id, name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
          {openCard ? (
            <div>
              <Button variant="ghost" size="sm" className="mb-4" onClick={() => setOpenCard(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to cards
              </Button>
              <FeatureDetail cardKey={openCard} caredOneId={selectedId!} caredOneName={caredOneName} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {featureCards.map((card) => (
                <Card key={card.key} className="border-transparent card-elevated cursor-pointer hover:border-primary/20 transition-all" onClick={() => setOpenCard(card.key)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={card.color}><card.icon className="h-5 w-5" /></div>
                      <div><h3 className="font-semibold text-foreground text-sm">{card.title}</h3><p className="text-xs text-muted-foreground">{getSubtitle(card.key)}</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="border-transparent card-elevated">
          <CardContent className="p-8 text-center">
            <HeartPulse className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No cared ones yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add the people you're caring for to track their health, medications, and more.</p>
            <Button variant="coral" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1" /> Add Your First Cared One
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getSubtitle(key: string): string {
  const map: Record<string, string> = {
    medicine: "Track medications & doses", checkin: "Daily wellness monitoring", health: "Vitals & health records",
    tips: "Helpful care reminders", plan: "Structured care goals", notes: "Free-form care notes",
    emergency: "Emergency contact list", location: "GPS & safe zones", documents: "Medical records & docs", visits: "Caregiver visit history",
  };
  return map[key] || "";
}

function FeatureDetail({ cardKey, caredOneId, caredOneName }: { cardKey: string; caredOneId: string; caredOneName: string }) {
  switch (cardKey) {
    case "medicine": return <MedicineCard caredOneId={caredOneId} />;
    case "checkin": return <CheckInCard caredOneId={caredOneId} />;
    case "health": return <HealthCard caredOneId={caredOneId} />;
    case "tips": return <TipsCard caredOneId={caredOneId} />;
    case "plan": return <CarePlanCard caredOneId={caredOneId} />;
    case "notes": return <NotesCard caredOneId={caredOneId} />;
    case "emergency": return <EmergencyCard caredOneId={caredOneId} />;
    case "location": return <LocationCard caredOneId={caredOneId} />;
    case "documents": return <DocumentsCard caredOneId={caredOneId} />;
    case "visits": return <VisitLogCard caredOneId={caredOneId} />;
    default: return null;
  }
}

// ─── Time slots for 24h timeline (8am-7am next day) ─────────
const TIMELINE_HOURS = [
  "08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00",
  "00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00",
];

const SCHEDULE_TIMES = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "23:00", label: "11:00 PM" },
];

const FREQUENCIES = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_daily", label: "Three times daily" },
  { value: "four_daily", label: "Four times daily" },
  { value: "every_other_day", label: "Every other day" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed" },
];

function formatHour(h: string): string {
  const hour = parseInt(h.split(":")[0]);
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

// ─── MEDICINE TRACKER ───────────────────────────────────────
function MedicineCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: meds, isLoading } = useMedicines(caredOneId);
  const createMed = useCreateMedicine();
  const deleteMed = useDeleteMedicine();
  const logMed = useLogMedicine();
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"timeline" | "list">("timeline");
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "once_daily", time_slots: ["08:00"] as string[], note: "" });

  const addTimeSlot = () => setForm(p => ({ ...p, time_slots: [...p.time_slots, "12:00"] }));
  const removeTimeSlot = (idx: number) => setForm(p => ({ ...p, time_slots: p.time_slots.filter((_, i) => i !== idx) }));
  const updateTimeSlot = (idx: number, val: string) => setForm(p => ({ ...p, time_slots: p.time_slots.map((t, i) => i === idx ? val : t) }));

  const handleAdd = () => {
    if (!form.name.trim()) return;
    createMed.mutate(
      { user_id: caredOneId, name: form.name.trim(), dosage: form.dosage || undefined, frequency: FREQUENCIES.find(f => f.value === form.frequency)?.label || form.frequency, time_slot: form.time_slots.length > 0 ? form.time_slots : ["08:00"], note: form.note || undefined },
      {
        onSuccess: () => {
          setForm({ name: "", dosage: "", frequency: "once_daily", time_slots: ["08:00"], note: "" });
          setAddOpen(false);
          toast({ title: "Medicine added" });
        },
        onError: (err) => toast({ title: "Failed to add", description: String(err.message), variant: "destructive" }),
      }
    );
  };

  // Group medicines by their scheduled time_slot array for the timeline
  const timelineMeds = useMemo(() => {
    if (!meds) return {};
    const grouped: Record<string, any[]> = {};
    (meds as any[]).forEach((med) => {
      const slots = med.time_slot || [];
      if (slots.length === 0) {
        // Fallback: put in 08:00
        if (!grouped["08:00"]) grouped["08:00"] = [];
        grouped["08:00"].push(med);
      } else {
        slots.forEach((slot: string) => {
          const normalizedTime = slot.includes(":") ? slot.substring(0, 5) : "08:00";
          if (!grouped[normalizedTime]) grouped[normalizedTime] = [];
          grouped[normalizedTime].push(med);
        });
      }
    });
    return grouped;
  }, [meds]);

  const hasScheduledMeds = Object.keys(timelineMeds).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Medicine Tracker</h2>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setView("timeline")} className={`px-3 py-1.5 text-xs font-medium ${view === "timeline" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>Timeline</button>
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>List</button>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
      </div>

      {/* Add Medicine Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medicine</DialogTitle>
            <DialogDescription>Add a medication to the daily schedule</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Medicine Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Lisinopril, Aspirin" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dosage</Label>
                <Input value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} placeholder="e.g. 10mg, 2 tablets" className="mt-1" />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Scheduled Times</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addTimeSlot} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" /> Add Time</Button>
              </div>
              <div className="space-y-2 mt-1">
                {form.time_slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select value={slot} onValueChange={v => updateTimeSlot(idx, v)}>
                      <SelectTrigger><Clock className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                      <SelectContent>{SCHEDULE_TIMES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {form.time_slots.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeTimeSlot(idx)}><X className="h-3 w-3" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Take with food, before meals..." className="mt-1" />
            </div>
            <Button className="w-full" variant="coral" onClick={handleAdd} disabled={createMed.isPending || !form.name.trim()}>
              {createMed.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Medicine
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" /> : view === "timeline" ? (
        /* ─── 24h Timeline View ─── */
        <div className="space-y-0">
          {!hasScheduledMeds ? (
            <div className="text-center py-12">
              <Pill className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No medications scheduled yet</p>
              <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add First Medicine</Button>
            </div>
          ) : (
            TIMELINE_HOURS.map((hour) => {
              const medsAtTime = timelineMeds[hour];
              const isCurrentHour = new Date().getHours() === parseInt(hour.split(":")[0]);
              return (
                <div key={hour} className={`flex border-b border-border/50 ${isCurrentHour ? "bg-primary/5" : ""}`}>
                  {/* Time column */}
                  <div className={`w-20 shrink-0 py-3 px-2 text-xs font-medium ${isCurrentHour ? "text-primary" : "text-muted-foreground"} ${medsAtTime ? "" : "opacity-40"}`}>
                    {isCurrentHour && <div className="w-2 h-2 rounded-full bg-primary inline-block mr-1" />}
                    {formatHour(hour)}
                  </div>
                  {/* Meds column */}
                  <div className="flex-1 py-2 px-2">
                    {medsAtTime ? (
                      <div className="space-y-2">
                        {medsAtTime.map((med: any) => (
                          <div key={med.id} className="flex items-center justify-between bg-card rounded-lg border p-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Pill className="h-4 w-4 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">{med.name}</p>
                                <p className="text-xs text-muted-foreground">{[med.dosage, med.frequency].filter(Boolean).join(" · ")}</p>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0 ml-2">
                              <Button size="sm" variant="outline" className="h-8 text-xs border-success/30 text-success hover:bg-success/10"
                                onClick={() => logMed.mutate({ medicine_id: med.id, status: "taken", user_id: caredOneId }, { onSuccess: () => toast({ title: `${med.name} marked as taken ✓` }) })}>
                                <Check className="h-3 w-3 mr-1" /> Taken
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs text-warning hover:bg-warning/10"
                                onClick={() => logMed.mutate({ medicine_id: med.id, status: "skipped", user_id: caredOneId }, { onSuccess: () => toast({ title: `${med.name} skipped` }) })}>
                                <SkipForward className="h-3 w-3 mr-1" /> Skip
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ─── List View ─── */
        <div className="space-y-3">
          {(meds || []).map((med: any) => (
            <Card key={med.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{med.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[med.dosage, med.frequency, ...(med.time_slot || []).map((t: string) => SCHEDULE_TIMES.find(s => s.value === t)?.label || t)].filter(Boolean).join(" · ")}
                    </p>
                    {med.note && <p className="text-xs text-muted-foreground mt-1 italic">{med.note}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="border-success/30 text-success hover:bg-success/10" onClick={() => logMed.mutate({ medicine_id: med.id, status: "taken", user_id: caredOneId }, { onSuccess: () => toast({ title: "Taken ✓" }) })}>
                      <Check className="h-3 w-3 mr-1" /> Taken
                    </Button>
                    <Button size="sm" variant="ghost" className="text-warning hover:bg-warning/10" onClick={() => logMed.mutate({ medicine_id: med.id, status: "skipped", user_id: caredOneId }, { onSuccess: () => toast({ title: "Skipped" }) })}>Skip</Button>
                    <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => deleteMed.mutate(med.id, { onSuccess: () => toast({ title: `${med.name} deleted` }) })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(meds || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No medications added yet</p>}
        </div>
      )}
    </div>
  );
}

// ─── CHECK-IN CARD ──────────────────────────────────────────
const MOODS = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "poor", emoji: "😟", label: "Poor" },
  { value: "bad", emoji: "😢", label: "Bad" },
];

function CheckInCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: logs } = useCheckinLogs(caredOneId);
  const create = useCreateCheckinLog();
  const [form, setForm] = useState({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" });

  const handleSubmit = () => {
    create.mutate(
      { user_id: caredOneId, ...form },
      { onSuccess: () => { setForm({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" }); toast({ title: "Check-in recorded ✓" }); } }
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Daily Check-In</h2>
      <Card className="border-transparent card-elevated mb-6">
        <CardContent className="p-5 space-y-5">
          {/* Mood selector as emoji buttons */}
          <div>
            <Label className="text-sm font-medium mb-2 block">How are they feeling?</Label>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button key={m.value} onClick={() => setForm(p => ({ ...p, mood: m.value }))}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all ${form.mood === m.value ? "border-primary bg-primary/10" : "border-transparent bg-accent/50 hover:bg-accent"}`}>
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Sliders row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Energy Level</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="range" min={1} max={10} value={form.energy_level} onChange={e => setForm(p => ({ ...p, energy_level: parseInt(e.target.value) }))} className="flex-1 accent-primary" />
                <span className="text-sm font-semibold text-foreground w-5 text-center">{form.energy_level}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Pain Level</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="range" min={0} max={10} value={form.pain_level} onChange={e => setForm(p => ({ ...p, pain_level: parseInt(e.target.value) }))} className="flex-1 accent-destructive" />
                <span className="text-sm font-semibold text-foreground w-5 text-center">{form.pain_level}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Sleep (hrs)</Label>
              <Input type="number" min={0} max={24} step={0.5} value={form.sleep_hours} onChange={e => setForm(p => ({ ...p, sleep_hours: parseFloat(e.target.value) || 0 }))} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Any observations, symptoms, or changes..." rows={2} className="mt-1" />
          </div>
          <Button variant="coral" className="w-full" onClick={handleSubmit} disabled={create.isPending}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />}
            Record Check-In
          </Button>
        </CardContent>
      </Card>
      {/* History */}
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Recent Check-Ins</h3>
      <div className="space-y-2">
        {(logs || []).map((l: any) => (
          <Card key={l.id} className="border-transparent card-elevated"><CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">{MOODS.find(m => m.value === l.mood)?.emoji || "🙂"}</span>
                <div>
                  <span className="text-sm font-medium text-foreground capitalize">{l.mood}</span>
                  <div className="flex gap-3 text-xs text-muted-foreground">{l.energy_level != null && <span>⚡ {l.energy_level}/10</span>}{l.pain_level != null && l.pain_level > 0 && <span>🩹 {l.pain_level}/10</span>}{l.sleep_hours != null && <span>😴 {l.sleep_hours}h</span>}</div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            {l.note && <p className="text-xs text-muted-foreground mt-1 pl-9">{l.note}</p>}
          </CardContent></Card>
        ))}
        {(logs || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No check-ins yet. Record the first one above.</p>}
      </div>
    </div>
  );
}

// ─── HEALTH TRACKING ────────────────────────────────────────
const VITAL_TYPES = [
  { value: "blood_pressure", label: "Blood Pressure", unit: "mmHg", placeholder: "120/80" },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm", placeholder: "72" },
  { value: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", placeholder: "100" },
  { value: "weight", label: "Weight", unit: "lbs", placeholder: "150" },
  { value: "temperature", label: "Temperature", unit: "°F", placeholder: "98.6" },
  { value: "oxygen", label: "O2 Saturation", unit: "%", placeholder: "98" },
];

function HealthCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: vitals } = useHealthVitals(caredOneId);
  const create = useCreateHealthVital();
  const [form, setForm] = useState({ vital_type: "blood_pressure", value: "", note: "" });

  const selectedType = VITAL_TYPES.find(t => t.value === form.vital_type)!;

  const handleSubmit = () => {
    if (!form.value) return;
    // For blood pressure, store the full text in note; for others parse as number
    const numericValue = form.vital_type === "blood_pressure" ? 0 : parseFloat(form.value);
    const noteWithBP = form.vital_type === "blood_pressure"
      ? [form.value, form.note].filter(Boolean).join(" - ")
      : form.note || undefined;
    create.mutate(
      { user_id: caredOneId, vital_type: form.vital_type, value: numericValue, unit: selectedType.unit, note: noteWithBP },
      { onSuccess: () => { setForm({ vital_type: "blood_pressure", value: "", note: "" }); toast({ title: "Vital recorded ✓" }); } }
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Health Tracking</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Vital Type</Label>
            <Select value={form.vital_type} onValueChange={v => setForm(p => ({ ...p, vital_type: v, value: "" }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{VITAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Value ({selectedType.unit})</Label>
            <Input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={selectedType.placeholder} className="mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Note <span className="text-muted-foreground">(optional)</span></Label>
          <Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="After meal, resting, etc." className="mt-1" />
        </div>
        <Button variant="coral" className="w-full" onClick={handleSubmit} disabled={create.isPending || !form.value}>
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HeartPulse className="h-4 w-4 mr-2" />}
          Log Vital
        </Button>
      </CardContent></Card>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">History</h3>
      <div className="space-y-2">
        {(vitals || []).map((v: any) => (
          <Card key={v.id} className="border-transparent card-elevated"><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{VITAL_TYPES.find(t => t.value === v.vital_type)?.label || v.vital_type}</Badge>
              <span className="font-semibold text-foreground">{v.value}{v.unit ? ` ${v.unit}` : ""}</span>
              {v.note && <span className="text-xs text-muted-foreground">· {v.note}</span>}
            </div>
            <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
          </CardContent></Card>
        ))}
        {(vitals || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No vitals recorded yet</p>}
      </div>
    </div>
  );
}

// ─── CARE TIPS ──────────────────────────────────────────────
const TIP_CATEGORIES = ["Nutrition", "Exercise", "Mental Health", "Sleep", "Hygiene", "Social", "Safety", "General"];

function TipsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: tips } = useCareTips(caredOneId);
  const create = useCreateCareTip();
  const del = useDeleteCareTip();
  const [form, setForm] = useState({ title: "", content: "", category: "General" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Tips</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Tip title" />
        <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Describe the care tip or reminder..." rows={2} />
        <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{TIP_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.title || !form.content) return;
          create.mutate({ user_id: caredOneId, title: form.title, content: form.content, category: form.category }, {
            onSuccess: () => { setForm({ title: "", content: "", category: "General" }); toast({ title: "Tip added" }); }
          });
        }} disabled={create.isPending || !form.title || !form.content}>Add Tip</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(tips || []).map((t: any) => (
          <Card key={t.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground text-sm">{t.title}</h4>
                {t.category && <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{t.content}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7 shrink-0" onClick={() => del.mutate(t.id)}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
        {(tips || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No care tips yet</p>}
      </div>
    </div>
  );
}

// ─── CARE PLAN ──────────────────────────────────────────────
function CarePlanCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: plans } = useCarePlans(caredOneId);
  const create = useCreateCarePlan();
  const [form, setForm] = useState({ title: "", description: "" });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Plans</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Plan title (e.g. Recovery Plan, Daily Routine)" />
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the plan goals and approach..." rows={2} />
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.title) return;
          create.mutate({ user_id: caredOneId, title: form.title, description: form.description || undefined }, {
            onSuccess: () => { setForm({ title: "", description: "" }); toast({ title: "Plan created" }); }
          });
        }} disabled={create.isPending || !form.title}>Create Plan</Button>
      </CardContent></Card>
      {selectedPlan ? (
        <div><Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)} className="mb-2"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button><GoalsView planId={selectedPlan} /></div>
      ) : (
        <div className="space-y-2">
          {(plans || []).map((p: any) => (
            <Card key={p.id} className="border-transparent card-elevated cursor-pointer hover:border-primary/20" onClick={() => setSelectedPlan(p.id)}>
              <CardContent className="p-4"><h4 className="font-medium text-foreground">{p.title}</h4>{p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}<Badge variant="secondary" className="text-xs mt-2">{p.status || "active"}</Badge></CardContent>
            </Card>
          ))}
          {(plans || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No care plans yet</p>}
        </div>
      )}
    </div>
  );
}

function GoalsView({ planId }: { planId: string }) {
  const { toast } = useToast();
  const { data: goals } = useCarePlanGoals(planId);
  const createGoal = useCreateCarePlanGoal();
  const updateGoal = useUpdateCarePlanGoal();
  const [title, setTitle] = useState("");

  const completed = (goals || []).filter((g: any) => g.status === "completed").length;
  const total = (goals || []).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Goals</h3>
        {total > 0 && <span className="text-xs text-muted-foreground">{completed}/{total} completed</span>}
      </div>
      {total > 0 && (
        <div className="w-full bg-accent rounded-full h-2 mb-4">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
        </div>
      )}
      <div className="flex gap-2 mb-4">
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Add a goal..." onKeyDown={e => { if (e.key === "Enter" && title.trim()) { createGoal.mutate({ care_plan_id: planId, title: title.trim() }, { onSuccess: () => { setTitle(""); toast({ title: "Goal added" }); } }); } }} />
        <Button size="sm" onClick={() => { if (!title.trim()) return; createGoal.mutate({ care_plan_id: planId, title: title.trim() }, { onSuccess: () => { setTitle(""); toast({ title: "Goal added" }); } }); }} disabled={createGoal.isPending}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-2">
        {(goals || []).map((g: any) => (
          <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => updateGoal.mutate({ id: g.id, status: g.status === "completed" ? "pending" : "completed" })}>
            {g.status === "completed" ? <Check className="h-4 w-4 text-success" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
            <span className={`text-sm ${g.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{g.title}</span>
          </div>
        ))}
        {total === 0 && <p className="text-center py-6 text-muted-foreground text-sm">No goals yet. Add one above.</p>}
      </div>
    </div>
  );
}

// ─── CARE NOTES ─────────────────────────────────────────────
function NotesCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: notes } = useCareNotes(caredOneId);
  const create = useCreateCareNote();
  const del = useDeleteCareNote();
  const [form, setForm] = useState({ title: "", content: "", category: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Notes</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title (optional)" />
        <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write observations, instructions, or anything relevant..." rows={3} />
        <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Category (optional)" />
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.content) return;
          create.mutate({ user_id: caredOneId, title: form.title || undefined, content: form.content, category: form.category || undefined }, {
            onSuccess: () => { setForm({ title: "", content: "", category: "" }); toast({ title: "Note saved ✓" }); }
          });
        }} disabled={create.isPending || !form.content}>Save Note</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(notes || []).map((n: any) => (
          <Card key={n.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-start">
            <div className="min-w-0">
              {n.title && <h4 className="font-medium text-foreground text-sm">{n.title}</h4>}
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{n.content}</p>
              <div className="flex gap-2 mt-1">
                {n.category && <Badge variant="secondary" className="text-[10px]">{n.category}</Badge>}
                <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7 shrink-0" onClick={() => del.mutate(n.id)}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
        {(notes || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No notes yet</p>}
      </div>
    </div>
  );
}

// ─── EMERGENCY CONTACTS ─────────────────────────────────────
const RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Doctor", "Nurse", "Caregiver", "Neighbor", "Friend", "Other"];

function EmergencyCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: contacts } = useEmergencyContacts(caredOneId);
  const create = useCreateEmergencyContact();
  const del = useDeleteEmergencyContact();
  const [form, setForm] = useState({ name: "", phone: "", relationship: "Other" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Emergency Contacts</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Contact name" className="mt-1" /></div>
          <div><Label className="text-xs">Phone <span className="text-destructive">*</span></Label><Input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="mt-1" /></div>
        </div>
        <div>
          <Label className="text-xs">Relationship</Label>
          <Select value={form.relationship} onValueChange={v => setForm(p => ({ ...p, relationship: v }))}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.name || !form.phone) return;
          create.mutate({ user_id: caredOneId, name: form.name, phone: form.phone, relationship: form.relationship }, {
            onSuccess: () => { setForm({ name: "", phone: "", relationship: "Other" }); toast({ title: "Contact added" }); }
          });
        }} disabled={create.isPending || !form.name || !form.phone}>Add Contact</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(contacts || []).map((c: any) => (
          <Card key={c.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground text-sm">{c.name}</h4>
                {c.is_primary && <Badge className="text-[10px]">Primary</Badge>}
                {c.relationship && <Badge variant="secondary" className="text-[10px]">{c.relationship}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{c.phone}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" asChild><a href={`tel:${c.phone}`}><Phone className="h-3 w-3 mr-1" /> Call</a></Button>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => del.mutate(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {(contacts || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No emergency contacts yet</p>}
      </div>
    </div>
  );
}

// ─── LOCATION & SAFE ZONES ──────────────────────────────────
function LocationCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: zones } = useSafeZones(caredOneId);
  const createZone = useCreateSafeZone();
  const deleteZone = useDeleteSafeZone();
  const [form, setForm] = useState({ name: "", radius_meters: "200", zone_type: "safe", latitude: "", longitude: "" });
  const [useGPS, setUseGPS] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { toast({ title: "Geolocation not supported", variant: "destructive" }); return; }
    setUseGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setForm(p => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })); setUseGPS(false); },
      () => { toast({ title: "Could not get location", variant: "destructive" }); setUseGPS(false); }
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Location & Safe Zones</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Zone name (e.g. Home, Hospital, Park)" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGetLocation} disabled={useGPS}>
            {useGPS ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
            Use Current Location
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} placeholder="40.7128" className="mt-1" /></div>
          <div><Label className="text-xs">Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} placeholder="-74.006" className="mt-1" /></div>
          <div><Label className="text-xs">Radius (m)</Label><Input type="number" value={form.radius_meters} onChange={e => setForm(p => ({ ...p, radius_meters: e.target.value }))} className="mt-1" /></div>
        </div>
        <Select value={form.zone_type} onValueChange={v => setForm(p => ({ ...p, zone_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="safe">✅ Safe Zone</SelectItem><SelectItem value="danger">⚠️ Danger Zone</SelectItem></SelectContent>
        </Select>
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.name) return;
          createZone.mutate({
            user_id: caredOneId, name: form.name, radius_meters: parseInt(form.radius_meters) || 200,
            zone_type: form.zone_type,
            latitude: form.latitude ? parseFloat(form.latitude) : undefined,
            longitude: form.longitude ? parseFloat(form.longitude) : undefined,
          }, { onSuccess: () => { setForm({ name: "", radius_meters: "200", zone_type: "safe", latitude: "", longitude: "" }); toast({ title: "Zone added" }); } });
        }} disabled={createZone.isPending || !form.name}>Add Zone</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(zones || []).map((z: any) => (
          <Card key={z.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span>{z.zone_type === "danger" ? "⚠️" : "✅"}</span>
                <h4 className="font-medium text-foreground text-sm">{z.name || "Zone"}</h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Radius: {z.radius_meters || 0}m{z.latitude ? ` · ${parseFloat(z.latitude).toFixed(4)}, ${parseFloat(z.longitude).toFixed(4)}` : ""}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => deleteZone.mutate(z.id)}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
        {(zones || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No safe zones configured yet</p>}
      </div>
    </div>
  );
}

// ─── DOCUMENTS ──────────────────────────────────────────────
const DOC_TYPES = ["Medical Record", "Insurance", "Prescription", "Lab Result", "Legal", "ID", "Emergency Plan", "Other"];

function DocumentsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: docs } = useCaredOneDocuments(caredOneId);
  const create = useCreateCaredOneDocument();
  const del = useDeleteCaredOneDocument();
  const [form, setForm] = useState({ title: "", document_type: "Medical Record", file_url: "", notes: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Documents</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Document title (e.g. Blood Test Results)" />
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.document_type} onValueChange={v => setForm(p => ({ ...p, document_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))} placeholder="Link URL (optional)" />
        </div>
        <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" />
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.title) return;
          create.mutate({ user_id: caredOneId, title: form.title, document_type: form.document_type, file_url: form.file_url || "", notes: form.notes || undefined }, {
            onSuccess: () => { setForm({ title: "", document_type: "Medical Record", file_url: "", notes: "" }); toast({ title: "Document added" }); }
          });
        }} disabled={create.isPending || !form.title}>Add Document</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(docs || []).map((d: any) => (
          <Card key={d.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-center">
            <div className="min-w-0">
              <h4 className="font-medium text-foreground text-sm">{d.title || d.file_name || "Document"}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px]">{d.document_type || "General"}</Badge>
                <span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
              </div>
              {d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}
            </div>
            <div className="flex gap-1 shrink-0 ml-2">
              {d.file_url && <Button variant="outline" size="sm" asChild><a href={d.file_url} target="_blank" rel="noopener">View</a></Button>}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => del.mutate(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {(docs || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No documents added yet</p>}
      </div>
    </div>
  );
}

// ─── VISIT LOG ──────────────────────────────────────────────
function VisitLogCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: logs } = useActivityLog(caredOneId);
  const create = useCreateActivityLog();
  const [form, setForm] = useState({ activity_type: "in_person", description: "", duration_minutes: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Visit Log</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Visit Type</Label>
            <Select value={form.activity_type} onValueChange={v => setForm(p => ({ ...p, activity_type: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">🏠 In-Person Visit</SelectItem>
                <SelectItem value="video">📹 Video Call</SelectItem>
                <SelectItem value="phone">📞 Phone Call</SelectItem>
                <SelectItem value="errand">🛒 Errand / Outing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Duration (minutes)</Label>
            <Input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} placeholder="60" className="mt-1" />
          </div>
        </div>
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What happened during the visit? Any observations or concerns..." rows={3} />
        <Button variant="coral" className="w-full" onClick={() => {
          create.mutate(
            { cared_one_id: caredOneId, activity_type: form.activity_type, description: form.description || undefined, duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : undefined },
            { onSuccess: () => { setForm({ activity_type: "in_person", description: "", duration_minutes: "" }); toast({ title: "Visit logged ✓" }); } }
          );
        }} disabled={create.isPending}>Log Visit</Button>
      </CardContent></Card>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">History</h3>
      <div className="space-y-2">
        {(logs || []).map((l: any) => (
          <Card key={l.id} className="border-transparent card-elevated"><CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{l.activity_type === "video" ? "📹" : l.activity_type === "phone" ? "📞" : l.activity_type === "errand" ? "🛒" : "🏠"}</span>
                <Badge variant="secondary" className="text-xs capitalize">{l.activity_type?.replace(/_/g, " ")}</Badge>
                {l.duration_minutes && <span className="text-xs text-muted-foreground">{l.duration_minutes} min</span>}
              </div>
              <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            {l.description && <p className="text-xs text-muted-foreground mt-1 pl-7">{l.description}</p>}
          </CardContent></Card>
        ))}
        {(logs || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No visits logged yet</p>}
      </div>
    </div>
  );
}
