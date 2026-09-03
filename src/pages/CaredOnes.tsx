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
  Search, UserPlus, IdCard, Info, ListChecks,
} from "lucide-react";
import {
  useUserCaredOnes, useCreateUserCaredOne, useSearchProfiles,
  useMedicines, useCreateMedicine, useDeleteMedicine, useLogMedicine,
  useCheckinLogs, useCreateCheckinLog,
  useCareTips, useCreateCareTip, useDeleteCareTip,
  useCareNotes, useCreateCareNote, useDeleteCareNote,
  useEmergencyContacts, useCreateEmergencyContact, useDeleteEmergencyContact,
  useCaredOneDocuments, useCreateCaredOneDocument, useDeleteCaredOneDocument,
  useDeleteUserCaredOne,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/contexts/SiteContext";
import LocationCard from "@/components/care/LocationCard";
import { useTranslation } from "react-i18next";
import { getStoredWPUser } from "@/services/wp-auth";

import { MedicineCard } from "@/components/cared-ones/MedicineCard";
import { CheckInCard } from "@/components/cared-ones/CheckInCard";
import { TipsCard } from "@/components/cared-ones/TipsCard";
import { CareTasksCard } from "@/components/cared-ones/CareTasksCard";
import { CarePlanCard } from "@/components/cared-ones/CarePlanCard";
import { NotesCard } from "@/components/cared-ones/NotesCard";
import { EmergencyCard } from "@/components/cared-ones/EmergencyCard";
import { DocumentsCard } from "@/components/cared-ones/DocumentsCard";
import { InformationCardCard } from "@/components/cared-ones/InformationCardCard";

function FeatureDetail({ cardKey, caredOneId, caredOneName }: { cardKey: string; caredOneId: string; caredOneName: string }) {
  switch (cardKey) {
    case "medicine": return <MedicineCard caredOneId={caredOneId} />;
    case "checkin": return <CheckInCard caredOneId={caredOneId} />;
    case "tips": return <TipsCard caredOneId={caredOneId} />;
    case "tasks": return <CareTasksCard caredOneId={caredOneId} />;
    case "plan": return <CarePlanCard caredOneId={caredOneId} />;
    case "notes": return <NotesCard caredOneId={caredOneId} />;
    case "emergency": return <EmergencyCard caredOneId={caredOneId} />;
    case "location": return <LocationCard caredOneId={caredOneId} caredOneName={caredOneName} />;
    case "documents": return <DocumentsCard caredOneId={caredOneId} />;
    case "info-card": return <InformationCardCard caredOneId={caredOneId} caredOneName={caredOneName} />;
    default: return null;
  }
}

export default function CaredOnes() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const site = useSite();
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
  const { data: searchResultsRaw } = useSearchProfiles(searchQuery);
  const [detailCaredOne, setDetailCaredOne] = useState<any>(null);

  // A user is never their own cared one — exclude self and anyone already added.
  const myWpId = String(getStoredWPUser()?.user_id || "");
  const searchResults = useMemo(() => {
    const existing = new Set((caredOnes || []).map((c: any) => String(c.user_id || "").replace(/^wp-/, "")));
    return (searchResultsRaw || []).filter((p: any) => {
      const pid = String(p.id || "").replace(/^wp-/, "");
      return pid !== myWpId && !existing.has(pid);
    });
  }, [searchResultsRaw, caredOnes, myWpId]);

  const selectedId = activeTab || (caredOnes && caredOnes.length > 0 ? caredOnes[0].user_id : null);
  const selectedCaredOne = caredOnes?.find((c: any) => c.user_id === selectedId);
  const caredOneName = selectedCaredOne?.cared_one?.full_name || site.caredOneSingular;

  const featureCards = [
    { key: "medicine", title: t("caredOnes.medicineTracker"), icon: Pill, subtitle: t("caredOnes.trackMedications") },
    { key: "checkin", title: t("caredOnes.checkIns", { defaultValue: "Check-Ins" }), icon: ClipboardCheck, subtitle: t("caredOnes.dailyWellness") },
    { key: "tips", title: t("caredOnes.careTips"), icon: Lightbulb, subtitle: t("caredOnes.helpfulReminders") },
    { key: "tasks", title: t("caredOnes.careTasks", { defaultValue: "Care Tasks" }), icon: ListChecks, subtitle: t("caredOnes.careTasksSubtitle", { defaultValue: "Things to do for this person" }) },
    { key: "plan", title: t("caredOnes.carePlan"), icon: Target, subtitle: t("caredOnes.structuredGoals") },
    { key: "notes", title: t("caredOnes.careNotes"), icon: FileText, subtitle: t("caredOnes.freeFormNotes") },
    { key: "emergency", title: t("caredOnes.emergencyContacts"), icon: Phone, subtitle: t("caredOnes.emergencyList") },
    { key: "location", title: t("caredOnes.locationSafeZones"), icon: MapPin, subtitle: t("caredOnes.gpsSafeZones") },
    { key: "documents", title: t("caredOnes.documents"), icon: FolderOpen, subtitle: t("caredOnes.medicalDocs") },
    { key: "info-card", title: t("caredOnes.careInfoSheets", { defaultValue: "Care Info Sheets" }), icon: IdCard, subtitle: t("caredOnes.careInfoSheetsSubtitle", { defaultValue: "Share what a helper or finder needs to know" }) },
  ];

  const handleAddCaredOne = () => {
    if (!selectedPerson) return;
    createUserCaredOne.mutate({ caredOneId: selectedPerson.id, relationship: relationship || undefined, isPrimary }, {
      onSuccess: () => { setAddOpen(false); setSelectedPerson(null); setSearchQuery(""); setRelationship(""); setIsPrimary(false); toast({ title: t("caredOnes.added", { caredOne: site.caredOneSingular }) }); },
      onError: (err: any) => toast({ title: t("caredOnes.failedToAdd", "Failed"), description: err.message, variant: "destructive" }),
    });
  };

  const handleRemoveCaredOne = (id: string, name: string) => {
    deleteUserCaredOne.mutate(id, {
      onSuccess: () => { setActiveTab(null); setOpenCard(null); toast({ title: t("caredOnes.removed", { name, caredOnes: site.navLabels.caredOnes.toLowerCase() }) }); },
      onError: (err: any) => toast({ title: t("caredOnes.failedToRemove"), description: err.message, variant: "destructive" }),
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{t("nav.myLovedOnes", site.navLabels.caredOnes)}</h1>
          <p className="text-sm text-muted-foreground">{t("caredOnes.manageAndTrack")}</p>
        </div>
        <Button variant="coral" size="sm" className="shrink-0" onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">{t("caredOnes.addCaredOne", { caredOne: site.caredOneSingular })}</span><span className="sm:hidden">{t("common.add", { defaultValue: "Add" })}</span></Button>
      </div>

      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) { setSelectedPerson(null); setSearchQuery(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("caredOnes.addCaredOne", { caredOne: site.caredOneSingular })}</DialogTitle>
            <DialogDescription>{t("caredOnes.searchDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{t("caredOnes.searchByNameEmail")}</Label>
              <div className="relative mt-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSelectedPerson(null); }} placeholder={t("common.minCharsToSearch")} className="pl-9" /></div>
            </div>
            {searchQuery.length >= 2 && !selectedPerson && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {(searchResults || []).length > 0 ? (searchResults || []).map((p: any) => (
                  <button key={p.id} type="button" className="w-full min-h-11 flex items-center gap-3 p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors" onClick={() => setSelectedPerson(p)}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="text-primary text-xs font-medium">{(p.full_name || p.email || "?")[0]}</span>}
                    </div>
                    <div className="min-w-0"><p className="text-sm font-medium text-foreground truncate">{p.full_name || ""}</p><p className="text-xs text-muted-foreground truncate">{p.email || ""}</p></div>
                  </button>
                )) : <p className="p-3 text-sm text-muted-foreground text-center">{t("common.noResults")}</p>}
              </div>
            )}
            {selectedPerson && (
              <div className="rounded-lg border bg-muted/50 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {selectedPerson.avatar_url ? <img src={selectedPerson.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-primary font-medium">{(selectedPerson.full_name || "?")[0]}</span>}
                </div>
                <div className="flex-1 min-w-0"><p className="font-medium text-foreground">{selectedPerson.full_name || ""}</p><p className="text-xs text-muted-foreground">{selectedPerson.email || ""}</p></div>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={t("common.remove")} onClick={() => setSelectedPerson(null)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            )}
            <div>
              <Label>{t("caredOnes.relationship")}</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger><SelectValue placeholder={t("caredOnes.selectRelationship")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">{t("caredOnes.mother")}</SelectItem><SelectItem value="father">{t("caredOnes.father")}</SelectItem>
                  <SelectItem value="grandmother">{t("caredOnes.grandmother")}</SelectItem><SelectItem value="grandfather">{t("caredOnes.grandfather")}</SelectItem>
                  <SelectItem value="spouse">{t("caredOnes.spouse")}</SelectItem><SelectItem value="child">{t("caredOnes.child")}</SelectItem>
                  <SelectItem value="sibling">{t("caredOnes.sibling")}</SelectItem><SelectItem value="other">{t("caredOnes.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="coral" className="w-full" onClick={handleAddCaredOne} disabled={!selectedPerson || createUserCaredOne.isPending}>
              {createUserCaredOne.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HeartPulse className="h-4 w-4 mr-2" />}
              {t("caredOnes.addCaredOne", { caredOne: site.caredOneSingular })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {caredOnes && caredOnes.length > 0 ? (
        <>
          <div className="flex gap-2 mb-5 overflow-x-auto items-center -mx-4 px-4 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {caredOnes.map((co: any) => {
              const name = co.cared_one?.full_name || site.caredOneSingular;
              const isActive = selectedId === co.user_id;
              return (
                <div key={co.user_id} className={`flex items-center rounded-lg border transition-colors ${isActive ? "bg-card border-primary shadow-sm" : "bg-transparent border-border hover:bg-accent/50"}`}>
                  <button type="button" onClick={() => { setActiveTab(co.user_id); setOpenCard(null); }} className="min-h-11 px-4 py-2 text-sm font-medium">
                    {name}{co.relationship && <span className="text-xs text-muted-foreground ml-1">({co.relationship})</span>}
                  </button>
                  <button
                    type="button"
                    aria-label={`${name} — ${t("common.details", { defaultValue: "Details" })}`}
                    onClick={() => setDetailCaredOne(co)}
                    className="min-h-11 min-w-11 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <Dialog open={!!detailCaredOne} onOpenChange={(open) => { if (!open) setDetailCaredOne(null); }}>
            <DialogContent>
              {detailCaredOne && (() => {
                const person = detailCaredOne.cared_one || {};
                const name = person.full_name || site.caredOneSingular;
                return (
                  <>
                    <DialogHeader>
                      <DialogTitle>{name}</DialogTitle>
                      <DialogDescription>{t("caredOnes.manageAndTrack")}</DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {person.avatar_url
                            ? <img src={person.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                            : <span className="text-primary font-medium">{String(name)[0]}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{name}</p>
                          {person.email && <p className="text-xs text-muted-foreground truncate">{person.email}</p>}
                        </div>
                      </div>
                      {detailCaredOne.relationship && (
                        <p className="text-sm text-muted-foreground">
                          {t("caredOnes.relationship")}: {detailCaredOne.relationship}
                        </p>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" /> {t("common.remove")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("common.remove")} {name}?</AlertDialogTitle>
                            <AlertDialogDescription>{t("caredOnes.removed", { name, caredOnes: site.navLabels.caredOnes.toLowerCase() })}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => { handleRemoveCaredOne(detailCaredOne.id, name); setDetailCaredOne(null); }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("common.remove")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>

          {openCard ? (
            <div>
              <Button variant="ghost" size="sm" className="mb-4" onClick={() => setOpenCard(null)}><ArrowLeft className="h-4 w-4 mr-1" /> {t("caredOnes.backToCards")}</Button>
              <FeatureDetail cardKey={openCard} caredOneId={selectedId!} caredOneName={caredOneName} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {featureCards.map((card) => (
                <button key={card.key}
                  onClick={() => setOpenCard(card.key)}
                  className="text-left rounded-xl border border-transparent card-elevated p-3.5 hover:border-primary/30 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center text-primary mb-2">
                    <card.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-foreground text-[13px] leading-tight">{card.title}</h3>
                  
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="border-transparent card-elevated">
          <CardContent className="p-8 text-center">
            <HeartPulse className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">{t("caredOnes.noCaredOnesYet", { caredOnes: site.navLabels.caredOnes.toLowerCase() })}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("caredOnes.addPeopleDesc")}</p>
            <Button variant="coral" onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4 mr-1" /> {t("caredOnes.addFirst", { caredOne: site.caredOneSingular })}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
