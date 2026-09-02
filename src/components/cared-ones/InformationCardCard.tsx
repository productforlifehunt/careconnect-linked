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
import { Loader2, Plus, Pencil, Trash2, Share2, IdCard, MapPin, Eye, Link2, QrCode, Copy, ShieldOff, Users } from "lucide-react";
import {
  useInformationCards, useCreateInformationCard, useUpdateInformationCard, useDeleteInformationCard,
  useInformationCardContactIds, useSetInformationCardContacts, useEmergencyContacts,
  useEnableInformationCardShare, useRevokeInformationCardShare,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";

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

export function InformationCardCard({ caredOneId, caredOneName }: { caredOneId: string; caredOneName?: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const statusLabel = (s?: string) =>
    s === "Active" ? Z("启用", "Active")
      : s === "Paused" ? Z("已暂停", "Paused")
      : Z("草稿", "Draft");

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
  const [viewCard, setViewCard] = useState<any | null>(null);


  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, cared_ones_name: caredOneName || "" });
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
      toast({ title: Z("请填写卡片名称", "Card name is required"), variant: "destructive" });
      return;
    }
    if (editId) {
      update.mutate(
        { id: editId, ...form },
        {
          onSuccess: () => { setFormOpen(false); toast({ title: Z("信息卡已更新", "Information card updated") }); },
          onError: (e: any) => toast({ title: Z("更新失败", "Update failed"), description: e.message, variant: "destructive" }),
        },
      );
    } else {
      create.mutate(
        { caredOneUserId: caredOneId, ...form },
        {
          onSuccess: () => { setFormOpen(false); toast({ title: Z("信息卡已创建", "Information card created") }); },
          onError: (e: any) => toast({ title: Z("创建失败", "Create failed"), description: e.message, variant: "destructive" }),
        },
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{Z("信息卡", "Information Cards")}</h2>
          <p className="text-xs text-muted-foreground">{Z("可在不同场景分享的资料卡", "Shareable profile cards for different contexts")}</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> {Z("新建卡片", "New Card")}</Button>
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (cards || []).length === 0 ? (
        <div className="text-center py-12">
          <IdCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("暂无信息卡", "No information cards yet")}</p>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> {Z("创建第一张卡片", "Create First Card")}</Button>
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
                      <h4 className="font-medium text-foreground text-sm truncate group-hover:underline">{c.cared_ones_information_card_name || Z("（未命名卡片）", "(Untitled card)")}</h4>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewCard(c)} title={Z("查看卡片", "View card")}><Eye className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setContactsCardId(String(c.id))} title={Z("选择卡片上显示的紧急联系人", "Choose emergency contacts on this card")}><Users className="h-3 w-3" /></Button>
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
            <DialogTitle>{editId ? Z("编辑信息卡", "Edit Information Card") : Z("新建信息卡", "New Information Card")}</DialogTitle>
            <DialogDescription>{Z("为被照护者制作一张可重复使用的分享卡片。", "A reusable shareable profile card for your cared one.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>{Z("卡片名称", "Card name")} <span className="text-destructive">*</span></Label>
              <Input className="mt-1" value={form.cared_ones_information_card_name}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_information_card_name: e.target.value }))}
                placeholder={Z("例如：就诊、日间照料、学校", "e.g. Hospital visit, Day care, School")} />
            </div>
            <div>
              <Label>{Z("被照护者姓名", "Cared one's name")}</Label>
              <Input className="mt-1" value={form.cared_ones_name}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_name: e.target.value }))} />
            </div>
            <div>
              <Label>{Z("说明", "Description")}</Label>
              <Textarea className="mt-1" rows={3} value={form.cared_ones_description}
                onChange={(e) => setForm((p) => ({ ...p, cared_ones_description: e.target.value }))}
                placeholder={Z("背景、病史、偏好等需要在卡片上展示的信息……", "Background, conditions, preferences shared on this card…")} />
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
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>{Z("取消", "Cancel")}</Button>
            <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>
              {(create.isPending || update.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? Z("保存修改", "Save changes") : Z("创建卡片", "Create card")}
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
                {viewCard.cared_ones_information_card_name || Z("信息卡", "Information card")}
              </DialogTitle>
              <DialogDescription>{Z("走失时可分享给 app 外人员查看的资料卡。", "The profile card you can share with people outside the app if the cared one goes missing.")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusVariant(viewCard.status)}>{statusLabel(viewCard.status)}</Badge>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {viewCard.displays_location === "Yes" ? Z("显示最近位置", "Shows last known location") : Z("不显示位置", "Location hidden")}
                </Badge>
                {viewCard.share_token
                  ? <Badge variant="outline" className="text-xs">{Z("分享中", "Sharing on")}</Badge>
                  : <Badge variant="outline" className="text-xs">{Z("未分享", "Not shared")}</Badge>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{Z("卡片上显示的姓名", "Name shown on the card")}</p>
                <p className="text-sm text-foreground">{viewCard.cared_ones_name || ""}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{Z("说明", "Description")}</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{viewCard.cared_ones_description || ""}</p>
              </div>
              {viewCard.share_expires_at && (
                <div>
                  <p className="text-xs text-muted-foreground">{Z("分享链接过期时间", "Share link expires at")}</p>
                  <p className="text-sm text-foreground">{String(viewCard.share_expires_at)}</p>
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setViewCard(null); setShareCard(viewCard); }}>
                  <Share2 className="h-3 w-3 mr-1" /> {Z("分享", "Share")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setViewCard(null); openEdit(viewCard); }}>
                  <Pencil className="h-3 w-3 mr-1" /> {Z("编辑", "Edit")}
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setViewCard(null)}>{Z("关闭", "Close")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

function ShareCardDialog({ card, onClose }: { card: any; onClose: () => void }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
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
    `📇 ${card.cared_ones_information_card_name || Z("信息卡", "Information Card")}`,
    card.cared_ones_name ? `${Z("姓名", "Name")}: ${card.cared_ones_name}` : "",
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
          toast({ title: Z("分享链接已就绪", "Share link ready") });
        },
        onError: (e: any) => toast({ title: Z("操作失败", "Failed"), description: e.message, variant: "destructive" }),
      }
    );
  };

  const copyLink = async () => {
    if (!generatedUrl) return;
    try { await navigator.clipboard.writeText(generatedUrl); toast({ title: Z("链接已复制", "Link copied") }); }
    catch { toast({ title: Z("复制失败", "Copy failed"), variant: "destructive" }); }
  };

  const nativeShare = async () => {
    if (!generatedUrl) return;
    const text = buildShareText();
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: card.cared_ones_information_card_name || Z("信息卡", "Information Card"), text, url: generatedUrl });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast({ title: Z("已复制", "Copied"), description: Z("可粘贴到任意位置进行分享。", "Paste it anywhere to share.") });
    } catch {/* canceled */}
  };

  const handleRevoke = () => {
    revoke.mutate(String(card.id), {
      onSuccess: () => { setGeneratedUrl(""); toast({ title: Z("已停止分享", "Sharing revoked") }); onClose(); },
    });
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Share2 className="h-4 w-4" /> {Z("分享信息卡", "Share Information Card")}</DialogTitle>
          <DialogDescription>{Z("生成公开链接或二维码，可随时撤销。", "Generate a public link or QR code. You can revoke it any time.")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>{Z("可见对象", "Who can view")}</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Visible to public">{Z("任何持有链接的人", "Anyone with the link")}</SelectItem>
                <SelectItem value="Visible to the care group of the cared one">{Z("仅护理小组", "Care group only")}</SelectItem>
                <SelectItem value="Visible to caregivers of the cared one">{Z("仅护理者", "Caregivers only")}</SelectItem>
                <SelectItem value="Visible to author">{Z("仅自己", "Only me")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{Z("过期时间（可选）", "Expires at (optional)")}</Label>
            <Input type="datetime-local" className="mt-1" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-1">{Z("留空则永不过期。过期后链接将失效。", "Leave empty for no expiry. After expiry the link stops working.")}</p>
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
                <p className="text-[11px] text-muted-foreground flex items-center gap-1"><QrCode className="h-3 w-3" /> {Z("扫码查看", "Scan to view")}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={nativeShare}><Share2 className="h-3 w-3 mr-1" /> {Z("分享…", "Share…")}</Button>
                <Button size="sm" variant="outline" onClick={handleEnable} disabled={enable.isPending}>
                  {enable.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />} {Z("更新", "Update")}
                </Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={handleEnable} disabled={enable.isPending}>
              {enable.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {Z("生成分享链接", "Generate share link")}
            </Button>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {card.share_token && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={handleRevoke} disabled={revoke.isPending}>
              <ShieldOff className="h-3 w-3 mr-1" /> {Z("停止分享", "Revoke sharing")}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>{Z("关闭", "Close")}</Button>
        </DialogFooter>
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
          <DialogTitle>{Z("可见的紧急联系人", "Visible emergency contacts")}</DialogTitle>
          <DialogDescription>{Z("选择在此信息卡上显示哪些联系人。默认全部选中。", "Choose which contacts appear on this information card. All are selected by default.")}</DialogDescription>
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
