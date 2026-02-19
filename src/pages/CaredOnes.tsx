import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
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
  useCaredOneDocuments, useCreateCaredOneDocument, useDeleteCaredOneDocument,
  useDeleteUserCaredOne,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import LocationCard from "@/components/care/LocationCard";

// Feature card definitions
import { MedicineCard } from "@/components/cared-ones/MedicineCard";
import { CheckInCard } from "@/components/cared-ones/CheckInCard";
import { HealthCard } from "@/components/cared-ones/HealthCard";
import { TipsCard } from "@/components/cared-ones/TipsCard";
import { CarePlanCard } from "@/components/cared-ones/CarePlanCard";
import { NotesCard } from "@/components/cared-ones/NotesCard";
import { EmergencyCard } from "@/components/cared-ones/EmergencyCard";
import { DocumentsCard } from "@/components/cared-ones/DocumentsCard";
import { VisitLogCard } from "@/components/cared-ones/VisitLogCard";

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
    case "location": return <LocationCard caredOneId={caredOneId} caredOneName={caredOneName} />;
    case "documents": return <DocumentsCard caredOneId={caredOneId} />;
    case "visits": return <VisitLogCard caredOneId={caredOneId} />;
    default: return null;
  }
}

export default function CaredOnes() {
  const { toast } = useToast();
  const { data: caredOnes, isLoading } = useUserCaredOnes();
  const createUserCaredOne = useCreateUserCaredOne();
  const deleteUserCaredOne = useDeleteUserCaredOne();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);

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
      onSuccess: () => { setActiveTab(null); setOpenCard(null); toast({ title: `${name} removed from your cared ones` }); },
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
                  <SelectItem value="mother">Mother</SelectItem><SelectItem value="father">Father</SelectItem>
                  <SelectItem value="grandmother">Grandmother</SelectItem><SelectItem value="grandfather">Grandfather</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem><SelectItem value="child">Child</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem><SelectItem value="other">Other</SelectItem>
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
                    {name}{co.relationship && <span className="text-xs text-muted-foreground ml-1">({co.relationship})</span>}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="pr-2 pl-0 py-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {name}?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove {name} from your cared ones list. Their data will not be deleted.</AlertDialogDescription>
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
              <Button variant="ghost" size="sm" className="mb-4" onClick={() => setOpenCard(null)}><ArrowLeft className="h-4 w-4 mr-1" /> Back to cards</Button>
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
            <Button variant="coral" onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4 mr-1" /> Add Your First Cared One</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
