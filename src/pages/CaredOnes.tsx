import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2, Plus, Pill, ClipboardCheck, HeartPulse, Lightbulb, Target, FileText,
  Phone, MapPin, FolderOpen, Activity, Pencil, Trash2, Check, X, ArrowLeft,
} from "lucide-react";
import {
  useUserCaredOnes,
  useMedicines, useCreateMedicine, useDeleteMedicine, useLogMedicine,
  useCheckinLogs, useCreateCheckinLog,
  useHealthVitals, useCreateHealthVital,
  useCareTips, useCreateCareTip, useDeleteCareTip,
  useCarePlans, useCreateCarePlan, useCarePlanGoals, useCreateCarePlanGoal, useUpdateCarePlanGoal,
  useCareNotes, useCreateCareNote, useDeleteCareNote,
  useEmergencyContacts, useCreateEmergencyContact, useDeleteEmergencyContact,
  useActivityLog, useCreateActivityLog,
  useSafeZones, useCreateSafeZone, useDeleteSafeZone,
  useCaredOneDocuments,
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
  const { data: caredOnes, isLoading } = useUserCaredOnes();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const selectedId = activeTab || (caredOnes && caredOnes.length > 0 ? caredOnes[0].cared_one_id : null);
  const selectedCaredOne = caredOnes?.find((c: any) => c.cared_one_id === selectedId);
  const caredOneName = selectedCaredOne?.cared_one?.full_name || selectedCaredOne?.cared_one?.first_name || "Cared One";

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Cared Ones</h1>
        <p className="text-muted-foreground">Manage and track care for your loved ones</p>
      </div>

      {caredOnes && caredOnes.length > 0 ? (
        <>
          {/* Tabs for each cared one */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {caredOnes.map((co: any) => (
              <button key={co.cared_one_id} onClick={() => { setActiveTab(co.cared_one_id); setOpenCard(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedId === co.cared_one_id ? "bg-card border-primary text-foreground shadow-sm" : "bg-transparent border-border text-muted-foreground hover:bg-accent/50"}`}>
                {co.cared_one?.full_name || co.cared_one?.first_name || "Cared One"}
              </button>
            ))}
          </div>

          {/* If a card is open, show detail view; otherwise show grid */}
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
            <p className="text-sm text-muted-foreground">Add the people you're caring for to track their health, medications, and more.</p>
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

// ─── Feature Detail Router ─────────────────────────────────
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

// ─── MEDICINE TRACKER ───────────────────────────────────────
function MedicineCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: meds, isLoading } = useMedicines(caredOneId);
  const createMed = useCreateMedicine();
  const deleteMed = useDeleteMedicine();
  const logMed = useLogMedicine();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "", time_of_day: "", note: "" });

  const handleAdd = () => {
    if (!form.name) return;
    createMed.mutate({ user_id: caredOneId, ...form }, { onSuccess: () => { setForm({ name: "", dosage: "", frequency: "", time_of_day: "", note: "" }); setAddOpen(false); toast({ title: "Medicine added" }); } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Medicine Tracker</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Medicine</Button>
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Add Medicine</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Lisinopril" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Dosage</Label><Input value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} placeholder="e.g. 10mg" /></div>
                <div><Label>Frequency</Label><Input value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} placeholder="e.g. Once daily" /></div>
              </div>
              <div><Label>Time of Day</Label><Input value={form.time_of_day} onChange={e => setForm(p => ({ ...p, time_of_day: e.target.value }))} placeholder="e.g. Morning" /></div>
              <div><Label>Notes</Label><Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Take with food..." /></div>
              <Button variant="coral" className="w-full" onClick={handleAdd} disabled={createMed.isPending || !form.name}>Add Medicine</Button>
            </div>
          </DialogContent>
      </Dialog>
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" /> : (
        <div className="space-y-3">
          {(meds || []).map((med: any) => (
            <Card key={med.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{med.name}</h3>
                    <p className="text-xs text-muted-foreground">{[med.dosage, med.frequency, med.time_of_day].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-success" onClick={() => logMed.mutate({ medicine_id: med.id, status: "taken" }, { onSuccess: () => toast({ title: "Logged as taken ✓" }) })}><Check className="h-3 w-3 mr-1" /> Taken</Button>
                    <Button size="sm" variant="ghost" className="text-warning" onClick={() => logMed.mutate({ medicine_id: med.id, status: "skipped" }, { onSuccess: () => toast({ title: "Logged as skipped" }) })}>Skip</Button>
                    <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => deleteMed.mutate(med.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {med.note && <p className="text-xs text-muted-foreground">{med.note}</p>}
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
function CheckInCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: logs } = useCheckinLogs(caredOneId);
  const create = useCreateCheckinLog();
  const [form, setForm] = useState({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" });
  const moodEmoji: Record<string, string> = { great: "😊", good: "🙂", okay: "😐", poor: "😟", bad: "😢" };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Daily Check-Ins</h2>
      <Card className="border-transparent card-elevated mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><Label className="text-xs">Mood</Label><Select value={form.mood} onValueChange={v => setForm(p => ({ ...p, mood: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["great","good","okay","poor","bad"].map(m=><SelectItem key={m} value={m}>{moodEmoji[m]} {m}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">Energy (1-10)</Label><Input type="number" min={1} max={10} value={form.energy_level} onChange={e => setForm(p => ({ ...p, energy_level: parseInt(e.target.value)||0 }))} /></div>
            <div><Label className="text-xs">Pain (0-10)</Label><Input type="number" min={0} max={10} value={form.pain_level} onChange={e => setForm(p => ({ ...p, pain_level: parseInt(e.target.value)||0 }))} /></div>
            <div><Label className="text-xs">Sleep (hrs)</Label><Input type="number" min={0} max={24} step={0.5} value={form.sleep_hours} onChange={e => setForm(p => ({ ...p, sleep_hours: parseFloat(e.target.value)||0 }))} /></div>
          </div>
          <Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Any notes..." />
          <Button variant="coral" size="sm" onClick={() => create.mutate({ user_id: caredOneId, ...form }, { onSuccess: () => { setForm({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" }); toast({ title: "Check-in recorded" }); } })} disabled={create.isPending}>Record Check-In</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {(logs||[]).map((l:any) => (
          <Card key={l.id} className="border-transparent card-elevated"><CardContent className="p-3">
            <div className="flex justify-between"><span className="text-sm font-medium">{moodEmoji[l.mood]||"🙂"} {l.mood}</span><span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en",{month:"short",day:"numeric"})}</span></div>
            <div className="flex gap-3 text-xs text-muted-foreground mt-1">{l.energy_level!=null&&<span>Energy: {l.energy_level}</span>}{l.pain_level!=null&&<span>Pain: {l.pain_level}</span>}{l.sleep_hours!=null&&<span>Sleep: {l.sleep_hours}h</span>}</div>
            {l.note&&<p className="text-xs text-muted-foreground mt-1">{l.note}</p>}
          </CardContent></Card>
        ))}
        {(logs||[]).length===0&&<p className="text-center py-8 text-muted-foreground">No check-ins yet</p>}
      </div>
    </div>
  );
}

// ─── HEALTH TRACKING ────────────────────────────────────────
function HealthCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: vitals } = useHealthVitals(caredOneId);
  const create = useCreateHealthVital();
  const [form, setForm] = useState({ vital_type: "blood_pressure", value: "", unit: "", note: "" });
  const types = [{ v: "blood_pressure", l: "Blood Pressure" },{ v: "heart_rate", l: "Heart Rate" },{ v: "blood_sugar", l: "Blood Sugar" },{ v: "weight", l: "Weight" },{ v: "temperature", l: "Temperature" },{ v: "oxygen", l: "O2 Saturation" }];

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Health Tracking</h2>
      <Card className="border-transparent card-elevated mb-4"><CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Vital Type</Label><Select value={form.vital_type} onValueChange={v=>setForm(p=>({...p,vital_type:v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{types.map(t=><SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Value</Label><Input type="number" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} placeholder="120" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Unit</Label><Input value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} placeholder="mmHg, bpm, mg/dL..." /></div>
          <div><Label className="text-xs">Note</Label><Input value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="Optional" /></div>
        </div>
        <Button variant="coral" size="sm" onClick={()=>{if(!form.value)return;create.mutate({user_id:caredOneId,vital_type:form.vital_type,value:parseFloat(form.value),unit:form.unit||undefined,note:form.note||undefined},{onSuccess:()=>{setForm({vital_type:"blood_pressure",value:"",unit:"",note:""});toast({title:"Vital recorded"});}});}} disabled={create.isPending||!form.value}>Log Vital</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(vitals||[]).map((v:any)=>(
          <Card key={v.id} className="border-transparent card-elevated"><CardContent className="p-3 flex items-center justify-between">
            <div><Badge variant="secondary" className="text-xs mr-2">{v.vital_type?.replace(/_/g," ")}</Badge><span className="font-semibold text-foreground">{v.value}{v.unit?` ${v.unit}`:""}</span></div>
            <span className="text-xs text-muted-foreground">{new Date(v.recorded_at).toLocaleDateString("en",{month:"short",day:"numeric"})}</span>
          </CardContent></Card>
        ))}
        {(vitals||[]).length===0&&<p className="text-center py-8 text-muted-foreground">No vitals recorded</p>}
      </div>
    </div>
  );
}

// ─── CARE TIPS ──────────────────────────────────────────────
function TipsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: tips } = useCareTips(caredOneId);
  const create = useCreateCareTip();
  const del = useDeleteCareTip();
  const [form, setForm] = useState({ title: "", content: "", category: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Tips</h2>
      <Card className="border-transparent card-elevated mb-4"><CardContent className="p-4 space-y-3">
        <Input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Tip title" />
        <Textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder="Describe the tip..." rows={2} />
        <Input value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} placeholder="Category (optional)" />
        <Button variant="coral" size="sm" onClick={()=>{if(!form.title||!form.content)return;create.mutate({user_id:caredOneId,title:form.title,content:form.content,category:form.category||undefined},{onSuccess:()=>{setForm({title:"",content:"",category:""});toast({title:"Tip added"});}});}} disabled={create.isPending}>Add Tip</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(tips||[]).map((t:any)=>(
          <Card key={t.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-start">
            <div><h4 className="font-medium text-foreground text-sm">{t.title}</h4><p className="text-xs text-muted-foreground">{t.content}</p>{t.category&&<Badge variant="secondary" className="text-[10px] mt-1">{t.category}</Badge>}</div>
            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={()=>del.mutate(t.id)}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
        {(tips||[]).length===0&&<p className="text-center py-8 text-muted-foreground">No care tips yet</p>}
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
  const [selectedPlan, setSelectedPlan] = useState<string|null>(null);

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Plans</h2>
      <Card className="border-transparent card-elevated mb-4"><CardContent className="p-4 space-y-3">
        <Input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Plan title" />
        <Textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Plan description..." rows={2} />
        <Button variant="coral" size="sm" onClick={()=>{if(!form.title)return;create.mutate({user_id:caredOneId,title:form.title,description:form.description||undefined},{onSuccess:()=>{setForm({title:"",description:""});toast({title:"Plan created"});}});}} disabled={create.isPending}>Create Plan</Button>
      </CardContent></Card>
      {selectedPlan ? (
        <div><Button variant="ghost" size="sm" onClick={()=>setSelectedPlan(null)} className="mb-2"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button><GoalsView planId={selectedPlan} /></div>
      ) : (
        <div className="space-y-2">
          {(plans||[]).map((p:any)=>(
            <Card key={p.id} className="border-transparent card-elevated cursor-pointer hover:border-primary/20" onClick={()=>setSelectedPlan(p.id)}>
              <CardContent className="p-4"><h4 className="font-medium text-foreground">{p.title}</h4>{p.description&&<p className="text-xs text-muted-foreground mt-1">{p.description}</p>}<Badge variant="secondary" className="text-xs mt-2">{p.status||"active"}</Badge></CardContent>
            </Card>
          ))}
          {(plans||[]).length===0&&<p className="text-center py-8 text-muted-foreground">No care plans yet</p>}
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

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">Goals</h3>
      <div className="flex gap-2 mb-4">
        <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add a goal..." />
        <Button size="sm" onClick={()=>{if(!title)return;createGoal.mutate({care_plan_id:planId,title},{onSuccess:()=>{setTitle("");toast({title:"Goal added"});}});}} disabled={createGoal.isPending}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-2">
        {(goals||[]).map((g:any)=>(
          <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border cursor-pointer" onClick={()=>updateGoal.mutate({id:g.id,status:g.status==="completed"?"pending":"completed"})}>
            {g.status==="completed"?<Check className="h-4 w-4 text-success" />:<div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
            <span className={`text-sm ${g.status==="completed"?"line-through text-muted-foreground":"text-foreground"}`}>{g.title}</span>
          </div>
        ))}
        {(goals||[]).length===0&&<p className="text-center py-6 text-muted-foreground text-sm">No goals yet</p>}
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
      <Card className="border-transparent card-elevated mb-4"><CardContent className="p-4 space-y-3">
        <Input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Note title (optional)" />
        <Textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder="Write a note..." rows={3} />
        <Input value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} placeholder="Category (optional)" />
        <Button variant="coral" size="sm" onClick={()=>{if(!form.content)return;create.mutate({user_id:caredOneId,title:form.title||undefined,content:form.content,category:form.category||undefined},{onSuccess:()=>{setForm({title:"",content:"",category:""});toast({title:"Note saved"});}});}} disabled={create.isPending}>Save Note</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(notes||[]).map((n:any)=>(
          <Card key={n.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-start">
            <div>{n.title&&<h4 className="font-medium text-foreground text-sm">{n.title}</h4>}<p className="text-xs text-muted-foreground">{n.content}</p><div className="flex gap-2 mt-1">{n.category&&<Badge variant="secondary" className="text-[10px]">{n.category}</Badge>}<span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span></div></div>
            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={()=>del.mutate(n.id)}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
        {(notes||[]).length===0&&<p className="text-center py-8 text-muted-foreground">No notes yet</p>}
      </div>
    </div>
  );
}

// ─── EMERGENCY CONTACTS ─────────────────────────────────────
function EmergencyCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: contacts } = useEmergencyContacts(caredOneId);
  const create = useCreateEmergencyContact();
  const del = useDeleteEmergencyContact();
  const [form, setForm] = useState({ name: "", phone: "", relationship: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Emergency Contacts</h2>
      <Card className="border-transparent card-elevated mb-4"><CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Contact name" /></div>
          <div><Label className="text-xs">Phone *</Label><Input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+1..." /></div>
        </div>
        <div><Label className="text-xs">Relationship</Label><Input value={form.relationship} onChange={e=>setForm(p=>({...p,relationship:e.target.value}))} placeholder="e.g. Daughter, Doctor" /></div>
        <Button variant="coral" size="sm" onClick={()=>{if(!form.name||!form.phone)return;create.mutate({user_id:caredOneId,name:form.name,phone:form.phone,relationship:form.relationship||undefined},{onSuccess:()=>{setForm({name:"",phone:"",relationship:""});toast({title:"Contact added"});}});}} disabled={create.isPending}>Add Contact</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(contacts||[]).map((c:any)=>(
          <Card key={c.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-center">
            <div><h4 className="font-medium text-foreground text-sm">{c.name}{c.is_primary&&<Badge variant="default" className="ml-2 text-[10px]">Primary</Badge>}</h4><p className="text-xs text-muted-foreground">{c.phone}{c.relationship?` · ${c.relationship}`:""}</p></div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" asChild><a href={`tel:${c.phone}`}><Phone className="h-3 w-3 mr-1" /> Call</a></Button>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={()=>del.mutate(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {(contacts||[]).length===0&&<p className="text-center py-8 text-muted-foreground">No emergency contacts yet</p>}
      </div>
    </div>
  );
}

// ─── LOCATION ───────────────────────────────────────────────
function LocationCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: zones } = useSafeZones(caredOneId);
  const createZone = useCreateSafeZone();
  const deleteZone = useDeleteSafeZone();
  const [form, setForm] = useState({ name: "", radius_meters: "200", zone_type: "safe", latitude: "", longitude: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Location & Safe Zones</h2>
      <Card className="border-transparent card-elevated mb-4"><CardContent className="p-4 space-y-3">
        <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Zone name (e.g. Home, Hospital)" />
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} placeholder="40.7128" /></div>
          <div><Label className="text-xs">Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} placeholder="-74.006" /></div>
          <div><Label className="text-xs">Radius (m)</Label><Input type="number" value={form.radius_meters} onChange={e => setForm(p => ({ ...p, radius_meters: e.target.value }))} /></div>
        </div>
        <Select value={form.zone_type} onValueChange={v => setForm(p => ({ ...p, zone_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="safe">Safe Zone</SelectItem><SelectItem value="danger">Danger Zone</SelectItem></SelectContent>
        </Select>
        <Button variant="coral" size="sm" onClick={() => {
          if (!form.name) return;
          createZone.mutate({
            user_id: caredOneId, name: form.name, radius_meters: parseInt(form.radius_meters) || 200,
            zone_type: form.zone_type,
            latitude: form.latitude ? parseFloat(form.latitude) : undefined,
            longitude: form.longitude ? parseFloat(form.longitude) : undefined,
          }, { onSuccess: () => { setForm({ name: "", radius_meters: "200", zone_type: "safe", latitude: "", longitude: "" }); toast({ title: "Safe zone added" }); } });
        }} disabled={createZone.isPending || !form.name}>Add Zone</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(zones || []).map((z: any) => (
          <Card key={z.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-center">
            <div>
              <h4 className="font-medium text-foreground text-sm">{z.name || "Zone"}</h4>
              <p className="text-xs text-muted-foreground">Radius: {z.radius_meters || 0}m · <Badge variant={z.zone_type === "danger" ? "destructive" : "secondary"} className="text-[10px]">{z.zone_type || "safe"}</Badge></p>
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
function DocumentsCard({ caredOneId }: { caredOneId: string }) {
  const { data: docs } = useCaredOneDocuments(caredOneId);
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Documents</h2>
      <div className="space-y-2">
        {(docs||[]).map((d:any)=>(
          <Card key={d.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-center">
            <div><h4 className="font-medium text-foreground text-sm">{d.title||d.file_name||"Document"}</h4><p className="text-xs text-muted-foreground">{d.document_type||"General"} · {new Date(d.created_at).toLocaleDateString()}</p></div>
            {d.file_url&&<Button variant="outline" size="sm" asChild><a href={d.file_url} target="_blank" rel="noopener">View</a></Button>}
          </CardContent></Card>
        ))}
        {(docs||[]).length===0&&<p className="text-center py-8 text-muted-foreground">No documents uploaded yet</p>}
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
      <Card className="border-transparent card-elevated mb-4"><CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Visit Type</Label><Select value={form.activity_type} onValueChange={v=>setForm(p=>({...p,activity_type:v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in_person">In-Person</SelectItem><SelectItem value="video">Video Call</SelectItem><SelectItem value="phone">Phone Call</SelectItem></SelectContent></Select></div>
          <div><Label className="text-xs">Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={e=>setForm(p=>({...p,duration_minutes:e.target.value}))} placeholder="60" /></div>
        </div>
        <Textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="What happened during the visit..." rows={2} />
        <Button variant="coral" size="sm" onClick={()=>{create.mutate({user_id:caredOneId,activity_type:form.activity_type,description:form.description||undefined,duration_minutes:form.duration_minutes?parseInt(form.duration_minutes):undefined},{onSuccess:()=>{setForm({activity_type:"in_person",description:"",duration_minutes:""});toast({title:"Visit logged"});}});}} disabled={create.isPending}>Log Visit</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(logs||[]).map((l:any)=>(
          <Card key={l.id} className="border-transparent card-elevated"><CardContent className="p-3">
            <div className="flex justify-between"><Badge variant="secondary" className="text-xs">{l.activity_type?.replace(/_/g," ")}</Badge><span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en",{month:"short",day:"numeric"})}</span></div>
            {l.description&&<p className="text-xs text-muted-foreground mt-1">{l.description}</p>}
            {l.duration_minutes&&<p className="text-xs text-muted-foreground">{l.duration_minutes} minutes</p>}
          </CardContent></Card>
        ))}
        {(logs||[]).length===0&&<p className="text-center py-8 text-muted-foreground">No visits logged yet</p>}
      </div>
    </div>
  );
}
