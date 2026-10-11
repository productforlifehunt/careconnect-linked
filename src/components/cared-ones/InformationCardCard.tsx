import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Share2, IdCard, MapPin, Eye, Link2, QrCode, Copy, ShieldOff, Users } from "lucide-react";
import {
  useInformationCards, useCreateInformationCard, useUpdateInformationCard, useDeleteInformationCard,
  useInformationCardContactIds, useSetInformationCardContacts, useEmergencyContacts,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/contexts/SiteContext";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { SheetAIPanel, SheetLocationTag, useInfoSheetKnowledge } from "@/components/cared-ones/info-sheet-parts";

type Status = "Draft" | "Active" | "Paused";
type DisplaysLocation = "Yes" | "No";

interface FormState {
  cared_ones_information_card_name: string;
  cared_ones_name: string;
  cared_ones_description: string;
  cared_ones_information_card_description: string;
  status: Status;
  displays_location: DisplaysLocation;
}

const EMPTY_FORM: FormState = {
  cared_ones_information_card_name: "",
  cared_ones_name: "",
  cared_ones_description: "",
  cared_ones_information_card_description: "",
  status: "Draft",
  displays_location: "No",
};

function statusVariant(status?: string | undefined): "default" | "secondary" | "outline" {
  if (status === "Active") return "default";
  if (status === "Paused") return "secondary";
  return "outline";
}

export function InformationCardCard({ caredOneId, caredOneName }: { caredOneId: string; caredOneName?: string | undefined }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const statusLabel = (s?: string | undefined) =>
    s === "Active" ? Z("启用", "Active")
      : s === "Paused" ? Z("已暂停", "Paused")
      : Z("草稿", "Draft");

  const { data: cards, isLoading, isError } = useInformationCards(caredOneId);
  const create = useCreateInformationCard();
  const update = useUpdateInformationCard();
  const del = useDeleteInformationCard();
  const setCardContacts = useSetInformationCardContacts();
  const { data: emergencyContacts } = useEmergencyContacts(caredOneId);
  const knowledge = useInfoSheetKnowledge(caredOneId);


  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formVisibility, setFormVisibility] = useState<string>("Visible to caregivers of the cared one");
  const [formContacts, setFormContacts] = useState<Set<string>>(new Set());
  const [formContactsReady, setFormContactsReady] = useState(true);
  const [saving, setSaving] = useState(false);
  const { data: editLinkedIds, isLoading: editLinkedLoading } = useInformationCardContactIds(editId);
  const [contactsCardId, setContactsCardId] = useState<string | null>(null);
  const [shareCard, setShareCard] = useState<any | null>(null);
  const [viewCard, setViewCard] = useState<any | null>(null);
  const [deleteCard, setDeleteCard] = useState<any | null>(null);

  // When editing, pre-tick the contacts already linked to this sheet (REL 221).
  useEffect(() => {
    if (!formOpen || !editId || formContactsReady || editLinkedLoading || editLinkedIds === undefined) return;
    setFormContacts(new Set((editLinkedIds || []).map(String)));
    setFormContactsReady(true);
  }, [formOpen, editId, formContactsReady, editLinkedLoading, editLinkedIds]);

  const toggleFormContact = (id: string) => {
    setFormContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, cared_ones_name: caredOneName || "" });
    setFormVisibility("Visible to caregivers of the cared one");
    // New sheet: all emergency contacts ticked by default.
    setFormContacts(new Set((emergencyContacts || []).map((c: any) => String(c.id))));
    setFormContactsReady(true);
    setFormOpen(true);
  };


  const openEdit = (card: any) => {
    setEditId(String(card.id));
    setForm({
      cared_ones_information_card_name: card.cared_ones_information_card_name || "",
      cared_ones_name: card.cared_ones_name || "",
      cared_ones_description: card.cared_ones_description || "",
      cared_ones_information_card_description: card.cared_ones_information_card_description || "",
      status: (card.status as Status) || "Draft",
      displays_location: (card.displays_location as DisplaysLocation) || "No",
    });
    setFormVisibility(card.share_visibility || "Visible to caregivers of the cared one");
    setFormContacts(new Set());
    setFormContactsReady(false);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.cared_ones_information_card_name.trim()) {
      toast({ title: Z("请先写这份须知的用途", "Please say what this sheet is for"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let cardId = editId;
      if (editId) {
        await update.mutateAsync({ id: editId, ...form, share_visibility: formVisibility });
      } else {
        const created = await create.mutateAsync({ caredOneUserId: caredOneId, ...form, share_visibility: formVisibility as any });
        cardId = String(created.id);
      }
      if (cardId) await setCardContacts.mutateAsync({ cardId, contactIds: [...formContacts] });
      setFormOpen(false);
      toast({ title: editId ? Z("信息卡已更新", "Information card updated") : Z("信息卡已创建", "Information card created") });
    } catch (e: any) {
      toast({ title: editId ? Z("更新失败", "Update failed") : Z("创建失败", "Create failed"), description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{Z("被照护者信息卡", "Cared One Information Cards")}</h2>
          <p className="text-xs text-muted-foreground">{Z("可分享给帮忙照看的人，或在走失时给外人看", "Share with someone helping out, or with finders if they go missing")}</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> {Z("新建一张", "New card")}</Button>
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : isError ? (
        <div className="text-center py-10">
          <ShieldOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{Z("暂时无法加载信息卡，请稍后再试。", "Information cards could not be loaded. Please try again.")}</p>
        </div>
      ) : (cards || []).length === 0 ? (
        <div className="text-center py-12">
          <IdCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("还没有信息卡", "No information cards yet")}</p>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> {Z("创建第一张", "Create first card")}</Button>
        </div>
      ) : (

        <div className="space-y-2">
          {(cards || []).map((c: any) => (
            <Card key={c.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left group"
                    onClick={() => setViewCard(c)}
                    aria-label={Z("查看信息卡", "View information card")}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-foreground text-sm truncate group-hover:underline">{c.cared_ones_information_card_name || Z("（未命名）", "(Untitled)")}</h4>
                      <Badge variant={statusVariant(c.status)} className="text-[10px]">{statusLabel(c.status)}</Badge>
                      {c.displays_location === "Yes" && (
                        <Badge variant="outline" className="text-[10px]"><MapPin className="h-2.5 w-2.5 mr-1" />{Z("位置", "Location")}</Badge>
                      )}
                    </div>
                    {c.cared_ones_name && <p className="text-xs text-muted-foreground mt-1">{Z("对象：", "For: ")}{c.cared_ones_name}</p>}
                    {c.cared_ones_description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.cared_ones_description}</p>
                    )}
                  </button>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setShareCard(c)}><Share2 className="h-3 w-3 mr-1" /> {Z("分享", "Share")}</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewCard(c)} title={Z("查看", "View")}><Eye className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setContactsCardId(String(c.id))} title={Z("选择这份须知上显示的紧急联系人", "Choose emergency contacts shown on this sheet")}><Users className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)} title={Z("编辑", "Edit")}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteCard(c)} title={Z("删除", "Delete")}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteCard} onOpenChange={(o) => !o && setDeleteCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("删除这张信息卡？", "Delete this information card?")}</DialogTitle>
            <DialogDescription>
              {Z("删除后无法恢复，已分享的链接也会失效。", "This cannot be undone, and any shared link will stop working.")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" onClick={() => setDeleteCard(null)}>{Z("取消", "Cancel")}</Button>
            <Button
              variant="destructive"
              disabled={del.isPending}
              onClick={() => del.mutate(String(deleteCard.id), {
                onSuccess: () => { setDeleteCard(null); toast({ title: Z("信息卡已删除", "Information card deleted") }); },
                onError: (e: any) => toast({ title: Z("没能删除", "Couldn't delete"), description: e?.message, variant: "destructive" }),
              })}
            >
              {del.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              {Z("确认删除", "Yes, delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? Z("编辑信息卡", "Edit information card") : Z("新建信息卡", "New information card")}</DialogTitle>
            <DialogDescription>{Z("写一张可以直接发给别人的信息卡：要注意什么、这次需要帮什么。", "Write something you can hand to another person: what to watch out for and what help is needed this time.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>{Z("这份须知的用途", "What this sheet is for")} <span className="text-destructive">*</span></Label>
              <Input className="mt-1" value={form.cared_ones_information_card_name}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_information_card_name: e.target.value }))}
                placeholder={Z("例如：帮忙照看两小时、走失时给路人看、就诊陪同", "e.g. Cover two hours, Show to a finder, Hospital visit")} />
            </div>
            <div>
              <Label>{Z("须知上显示的被照护者姓名", "Name shown on the sheet")}</Label>
              <Input className="mt-1" value={form.cared_ones_name}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_name: e.target.value }))}
                placeholder={caredOneName || Z("可填化名，不必是真名", "Can be a nickname, not necessarily the real name")} />
              <p className="text-[11px] text-muted-foreground mt-1">{Z("默认使用被照护者的用户名，可改成化名以保护隐私。", "Defaults to the cared one's name; you can change it to a nickname for privacy.")}</p>
            </div>

            <div>
              <Label>{Z("基本情况", "Background")}</Label>
              <Textarea className="mt-1" rows={3} value={form.cared_ones_description}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_description: e.target.value }))}
                placeholder={Z("基本情况：身体状况、习惯、忌讳、怎么沟通……", "Background: condition, habits, what to avoid, how to communicate…")} />
            </div>
            <div>
              <Label>{Z("这次的具体安排", "What's needed this time")}</Label>
              <Textarea className="mt-1" rows={3} value={form.cared_ones_information_card_description}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_information_card_description: e.target.value }))}
                placeholder={Z("例如：请早上七点到九点帮忙照看两个小时，八点提醒吃药。", "e.g. Please stay 7–9am and remind about the 8am pill.")} />
              <p className="text-[11px] text-muted-foreground mt-1">{Z("只写这一次的安排，长期的护理计划请写在「护理计划」里。", "Only this occasion. Long-term plans belong in the Care Plan.")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{Z("状态", "Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as Status }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">{Z("草稿", "Draft")}</SelectItem>
                    <SelectItem value="Active">{Z("启用", "Active")}</SelectItem>
                    <SelectItem value="Paused">{Z("已暂停", "Paused")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{Z("显示位置", "Displays location")}</Label>
                <Select value={form.displays_location} onValueChange={(v) => setForm((p) => ({ ...p, displays_location: v as DisplaysLocation }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">{Z("否", "No")}</SelectItem>
                    <SelectItem value="Yes">{Z("是", "Yes")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{Z("谁可以看", "Who can view")}</Label>
              <Select value={formVisibility} onValueChange={setFormVisibility}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visible to public">{Z("所有人可见", "Visible to everyone")}</SelectItem>
                  <SelectItem value="Visible to the care group of the cared one">{Z("仅此被照护者所在护理群组的成员（app 内，需登录）", "Only members of this cared one's care group (in this app, sign-in needed)")}</SelectItem>
                  <SelectItem value="Visible to caregivers of the cared one">{Z("仅此被照护者的护理者（app 内，需登录）", "Only this cared one's caregivers (in this app, sign-in needed)")}</SelectItem>
                  <SelectItem value="Visible to the care group of the cared one and the caregivers of the cared one">{Z("此被照护者的护理群组成员和护理者（app 内，需登录）", "This cared one's care group members and caregivers (in this app, sign-in needed)")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{Z("显示哪些紧急联系人", "Emergency contacts to show")}</Label>
              <div className="mt-1 space-y-2 max-h-48 overflow-y-auto">
                {!formContactsReady ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto my-3" />
                ) : (emergencyContacts || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">{Z("尚无紧急联系人，请先在「紧急联系人」卡片中添加。", "No emergency contacts yet. Add some from the Emergency Contacts card first.")}</p>
                ) : (
                  (emergencyContacts || []).map((c: any) => {
                    const id = String(c.id);
                    return (
                      <label key={id} className="flex items-center gap-3 rounded-md border p-2 cursor-pointer hover:bg-accent">
                        <Checkbox checked={formContacts.has(id)} onCheckedChange={() => toggleFormContact(id)} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{c.phone}{c.relationship ? ` • ${c.relationship}` : ""}</div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>{Z("取消", "Cancel")}</Button>
            <Button onClick={handleSubmit} disabled={saving || !formContactsReady}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? Z("保存修改", "Save changes") : Z("创建", "Create sheet")}
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

      {viewCard && (
        <Dialog open onOpenChange={(o) => { if (!o) setViewCard(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-primary" />
                {viewCard.cared_ones_information_card_name || Z("被照护者信息卡", "Cared one information card")}
              </DialogTitle>
              <DialogDescription>{Z("可以发给帮忙照看的人，走失时也能给路人看。", "Send it to someone helping out, or show it to a finder if they go missing.")}</DialogDescription>
            </DialogHeader>

            {/* Actions sit right under the title */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShareCard(viewCard)}>
                <Share2 className="h-3 w-3 mr-1" /> {Z("分享", "Share")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setViewCard(null); openEdit(viewCard); }}>
                <Pencil className="h-3 w-3 mr-1" /> {Z("编辑", "Edit")}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusVariant(viewCard.status)}>{statusLabel(viewCard.status)}</Badge>
                {viewCard.displays_location === "Yes" ? (
                  <SheetLocationTag caredOneId={caredOneId} />
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />{Z("不显示位置", "Location hidden")}
                  </Badge>
                )}

              </div>
              <div>
                <p className="text-xs text-muted-foreground">{Z("卡片上显示的姓名", "Name shown on the card")}</p>
                <p className="text-sm text-foreground">{viewCard.cared_ones_name || ""}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{Z("基本情况", "Background")}</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{viewCard.cared_ones_description || ""}</p>
              </div>
              {viewCard.cared_ones_information_card_description && (
                <div>
                  <p className="text-xs text-muted-foreground">{Z("这次的具体安排", "What's needed this time")}</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{viewCard.cared_ones_information_card_description}</p>
                </div>
              )}

              <SheetAIPanel
                context={{
                  sheetName: viewCard.cared_ones_information_card_name,
                  caredOneName: viewCard.cared_ones_name || caredOneName,
                  description: viewCard.cared_ones_description,
                  situationDetails: viewCard.cared_ones_information_card_description,
                  contacts: emergencyContacts || [],
                  knowledge,
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}


    </div>
  );
}

function ShareCardDialog({ card, onClose }: { card: any; onClose: () => void }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const site = useSite();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const url = new URL(`/share/card/${card.id}`, window.location.origin);
  url.searchParams.set("__site", site.release.slug);
  url.searchParams.set("lng", isCN ? "zh" : "en");
  const cardUrl = url.toString();
  const title = card.cared_ones_information_card_name || Z("被护理者信息卡", "Cared one information card");
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      toast({ title: Z("链接已复制", "Link copied") });
    } catch { toast({ title: Z("复制失败", "Copy failed"), variant: "destructive" }); }
  };
  const nativeShare = async () => {
    if (!navigator.share) { await copyLink(); return; }
    try { await navigator.share({ title, url: cardUrl }); }
    catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      toast({ title: Z("分享失败，请复制链接重试", "Sharing failed. Please copy the link."), variant: "destructive" });
    }
  };
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Share2 className="h-4 w-4" /> {Z("分享信息卡", "Share information card")}</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input aria-label={Z("卡片链接", "Card link")} readOnly value={cardUrl} className="text-xs min-w-0" />
            <Button size="icon" variant="outline" onClick={copyLink} aria-label={Z("复制链接", "Copy link")}><Copy className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-col items-center gap-2 py-2">
            <QRCodeSVG value={cardUrl} size={140} />
            <p className="text-xs text-muted-foreground flex items-center gap-1"><QrCode className="h-3 w-3" /> {Z("扫码查看", "Scan to view")}</p>
          </div>
          <Button className="w-full" onClick={nativeShare}><Share2 className="h-4 w-4 mr-2" />{Z("分享", "Share")}</Button>
        </div>
        <DialogFooter><Button variant="ghost" onClick={onClose}>{Z("关闭", "Close")}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContactSelectorDialog({
  cardId, allContacts, onClose,
}: { cardId: string; allContacts: any[]; onClose: () => void }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
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
        onSuccess: () => { toast({ title: Z("联系人已更新", "Contacts updated") }); onClose(); },
        onError: (e: any) => toast({ title: Z("更新失败", "Update failed"), description: e.message, variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{Z("显示哪些紧急联系人", "Emergency contacts to show")}</DialogTitle>
          <DialogDescription>{Z("选择在这份须知上显示哪些联系人。默认全部选中。", "Choose which contacts appear on this sheet. All are selected by default.")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto py-2">
          {allContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{Z("尚无紧急联系人，请先在「紧急联系人」卡片中添加。", "No emergency contacts yet. Add some from the Emergency Contacts card first.")}</p>
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
          <Button variant="ghost" onClick={onClose}>{Z("取消", "Cancel")}</Button>
          <Button onClick={save} disabled={setContacts.isPending}>
            {setContacts.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {Z("保存", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
