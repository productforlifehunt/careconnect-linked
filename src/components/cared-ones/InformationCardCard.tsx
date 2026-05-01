import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Share2, IdCard, MapPin, Eye, Link2, QrCode, Copy, ShieldOff } from "lucide-react";
import {
  useInformationCards, useCreateInformationCard, useUpdateInformationCard, useDeleteInformationCard,
  useInformationCardContactIds, useSetInformationCardContacts, useEmergencyContacts,
  useEnableInformationCardShare, useRevokeInformationCardShare,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

type Status = "Draft" | "Active" | "Paused";
type DisplaysLocation = "Yes" | "No";

interface FormState {
  cared_ones_information_card_name: string;
  cared_ones_name: string;
  cared_ones_description: string;
  status: Status;
  displays_location: DisplaysLocation;
}

const EMPTY_FORM: FormState = {
  cared_ones_information_card_name: "",
  cared_ones_name: "",
  cared_ones_description: "",
  status: "Draft",
  displays_location: "No",
};

function statusVariant(status?: string): "default" | "secondary" | "outline" {
  if (status === "Active") return "default";
  if (status === "Paused") return "secondary";
  return "outline";
}

function buildShareText(card: any): string {
  const lines = [
    `📇 ${card.cared_ones_information_card_name || "Information Card"}`,
    card.cared_ones_name ? `Name: ${card.cared_ones_name}` : "",
    card.cared_ones_description ? `\n${card.cared_ones_description}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export function InformationCardCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: cards, isLoading } = useInformationCards(caredOneId);
  const create = useCreateInformationCard();
  const update = useUpdateInformationCard();
  const del = useDeleteInformationCard();
  const { data: emergencyContacts } = useEmergencyContacts(caredOneId);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [contactsCardId, setContactsCardId] = useState<string | null>(null);
  const [shareCard, setShareCard] = useState<any | null>(null);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (card: any) => {
    setEditId(String(card.id));
    setForm({
      cared_ones_information_card_name: card.cared_ones_information_card_name || "",
      cared_ones_name: card.cared_ones_name || "",
      cared_ones_description: card.cared_ones_description || "",
      status: (card.status as Status) || "Draft",
      displays_location: (card.displays_location as DisplaysLocation) || "No",
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!form.cared_ones_information_card_name.trim()) {
      toast({ title: "Card name is required", variant: "destructive" });
      return;
    }
    if (editId) {
      update.mutate(
        { id: editId, ...form },
        {
          onSuccess: () => { setFormOpen(false); toast({ title: "Information card updated" }); },
          onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
        },
      );
    } else {
      create.mutate(
        { caredOneUserId: caredOneId, ...form },
        {
          onSuccess: () => { setFormOpen(false); toast({ title: "Information card created" }); },
          onError: (e: any) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
        },
      );
    }
  };

  const handleShare = async (card: any) => {
    const text = buildShareText(card);
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: card.cared_ones_information_card_name || "Information Card", text });
        return;
      }
    } catch {/* fall through to clipboard */}
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Card copied", description: "You can now paste & share it anywhere." });
    } catch {
      toast({ title: "Share unavailable", variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Information Cards</h2>
          <p className="text-xs text-muted-foreground">Shareable profile cards for different contexts</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Card</Button>
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (cards || []).length === 0 ? (
        <div className="text-center py-12">
          <IdCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No information cards yet</p>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Create First Card</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(cards || []).map((c: any) => (
            <Card key={c.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-foreground text-sm truncate">{c.cared_ones_information_card_name || "(Untitled card)"}</h4>
                      <Badge variant={statusVariant(c.status)} className="text-[10px]">{c.status || "Draft"}</Badge>
                      {c.displays_location === "Yes" && (
                        <Badge variant="outline" className="text-[10px]"><MapPin className="h-2.5 w-2.5 mr-1" />Location</Badge>
                      )}
                    </div>
                    {c.cared_ones_name && <p className="text-xs text-muted-foreground mt-1">For: {c.cared_ones_name}</p>}
                    {c.cared_ones_description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.cared_ones_description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setShareCard(c)}><Share2 className="h-3 w-3 mr-1" /> Share</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setContactsCardId(String(c.id))} title="Manage contacts"><Eye className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate(String(c.id))}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Information Card" : "New Information Card"}</DialogTitle>
            <DialogDescription>A reusable shareable profile card for your cared one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Card name <span className="text-destructive">*</span></Label>
              <Input className="mt-1" value={form.cared_ones_information_card_name}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_information_card_name: e.target.value }))}
                placeholder="e.g. Hospital visit, Day care, School" />
            </div>
            <div>
              <Label>Cared one's name</Label>
              <Input className="mt-1" value={form.cared_ones_name}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" rows={3} value={form.cared_ones_description}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_description: e.target.value }))}
                placeholder="Background, conditions, preferences shared on this card…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as Status }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Displays location</Label>
                <Select value={form.displays_location} onValueChange={(v) => setForm((p) => ({ ...p, displays_location: v as DisplaysLocation }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>
              {(create.isPending || update.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? "Save changes" : "Create card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {contactsCardId && (
        <ContactSelectorDialog
          cardId={contactsCardId}
          allContacts={emergencyContacts || []}
          onClose={() => setContactsCardId(null)}
        />
      )}

      {shareCard && (
        <ShareCardDialog card={shareCard} onClose={() => setShareCard(null)} />
      )}
    </div>
  );
}

function ShareCardDialog({ card, onClose }: { card: any; onClose: () => void }) {
  const { toast } = useToast();
  const enable = useEnableInformationCardShare();
  const revoke = useRevokeInformationCardShare();
  const [visibility, setVisibility] = useState<string>(card.share_visibility || "Visible to public");
  const [expiresAt, setExpiresAt] = useState<string>(
    card.share_expires_at ? String(card.share_expires_at).replace(" ", "T").slice(0, 16) : ""
  );
  const [generatedUrl, setGeneratedUrl] = useState<string>(() => {
    if (card.share_token && typeof window !== "undefined") {
      return `${window.location.origin}/share/card/${card.share_token}`;
    }
    return "";
  });

  const buildShareText = () => [
    `📇 ${card.cared_ones_information_card_name || "Information Card"}`,
    card.cared_ones_name ? `Name: ${card.cared_ones_name}` : "",
    generatedUrl ? `\n${generatedUrl}` : "",
  ].filter(Boolean).join("\n");

  const handleEnable = () => {
    enable.mutate(
      {
        cardId: String(card.id),
        visibility: visibility as any,
        expiresAt: expiresAt ? expiresAt.replace("T", " ") + ":00" : null,
        existingToken: card.share_token,
      },
      {
        onSuccess: (res) => {
          setGeneratedUrl(res.url);
          toast({ title: "Share link ready" });
        },
        onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
      }
    );
  };

  const copyLink = async () => {
    if (!generatedUrl) return;
    try { await navigator.clipboard.writeText(generatedUrl); toast({ title: "Link copied" }); }
    catch { toast({ title: "Copy failed", variant: "destructive" }); }
  };

  const nativeShare = async () => {
    if (!generatedUrl) return;
    const text = buildShareText();
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: card.cared_ones_information_card_name || "Information Card", text, url: generatedUrl });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Paste it anywhere to share." });
    } catch {/* canceled */}
  };

  const handleRevoke = () => {
    revoke.mutate(String(card.id), {
      onSuccess: () => { setGeneratedUrl(""); toast({ title: "Sharing revoked" }); onClose(); },
    });
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Share2 className="h-4 w-4" /> Share Information Card</DialogTitle>
          <DialogDescription>Generate a public link or QR code. You can revoke it any time.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Who can view</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Visible to public">Anyone with the link</SelectItem>
                <SelectItem value="Visible to the care group of the cared one">Care group only</SelectItem>
                <SelectItem value="Visible to caregivers of the cared one">Caregivers only</SelectItem>
                <SelectItem value="Visible to author">Only me</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Expires at (optional)</Label>
            <Input type="datetime-local" className="mt-1" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-1">Leave empty for no expiry. After expiry the link stops working.</p>
          </div>

          {generatedUrl ? (
            <div className="rounded-md border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input readOnly value={generatedUrl} className="text-xs h-8" />
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={copyLink}><Copy className="h-3 w-3" /></Button>
              </div>
              <div className="flex flex-col items-center gap-2 py-2">
                <QRCodeSVG value={generatedUrl} size={140} />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1"><QrCode className="h-3 w-3" /> Scan to view</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={nativeShare}><Share2 className="h-3 w-3 mr-1" /> Share…</Button>
                <Button size="sm" variant="outline" onClick={handleEnable} disabled={enable.isPending}>
                  {enable.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />} Update
                </Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={handleEnable} disabled={enable.isPending}>
              {enable.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate share link
            </Button>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {card.share_token && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={handleRevoke} disabled={revoke.isPending}>
              <ShieldOff className="h-3 w-3 mr-1" /> Revoke sharing
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContactSelectorDialog({
  cardId, allContacts, onClose,
}: { cardId: string; allContacts: any[]; onClose: () => void }) {
  const { toast } = useToast();
  const { data: linkedIds, isLoading } = useInformationCardContactIds(cardId);
  const setContacts = useSetInformationCardContacts();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Default = all selected (per spec). If we have prior selections, use those.
  useEffect(() => {
    if (isLoading || initialized) return;
    if (linkedIds && linkedIds.length > 0) {
      setSelected(new Set(linkedIds.map(String)));
    } else {
      setSelected(new Set(allContacts.map((c) => String(c.id))));
    }
    setInitialized(true);
  }, [isLoading, linkedIds, allContacts, initialized]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const save = () => {
    setContacts.mutate(
      { cardId, contactIds: [...selected] },
      {
        onSuccess: () => { toast({ title: "Contacts updated" }); onClose(); },
        onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Visible emergency contacts</DialogTitle>
          <DialogDescription>Choose which contacts appear on this information card. All are selected by default.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto py-2">
          {allContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No emergency contacts yet. Add some from the Emergency Contacts card first.</p>
          ) : (
            allContacts.map((c) => {
              const id = String(c.id);
              return (
                <label key={id} className="flex items-center gap-3 rounded-md border p-2 cursor-pointer hover:bg-accent">
                  <Checkbox checked={selected.has(id)} onCheckedChange={() => toggle(id)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.phone}{c.relationship ? ` • ${c.relationship}` : ""}</div>
                  </div>
                </label>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={setContacts.isPending}>
            {setContacts.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
