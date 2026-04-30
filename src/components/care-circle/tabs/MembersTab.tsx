import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, Mail, Clock, X, Tag, Plus, Shield, Heart, Crown, MoreVertical, Trash2, Link2, Copy, Ban, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubgroupCard } from "../SubgroupCard";
import { useGroupInvites, useCreateGroupInvite, useUpdateGroupInvite, useDeleteGroupInvite } from "@/hooks/use-care-data";

interface MembersTabProps {
  members: any[];
  activeGroup: any;
  activeGroupId: string | null;
  userId: string | undefined;
  isAdmin: boolean;
  isOwner: boolean;
  currentMember: any;
  pendingInvitations: any[];
  memberCategories: any[];
  inviteToGroup: any;
  updateRole: any;
  removeMember: any;
  cancelInvitation: any;
  createCategory: any;
  deleteCategory: any;
}

function formatDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MembersTab({
  members, activeGroup, activeGroupId, userId, isAdmin, isOwner, currentMember,
  pendingInvitations, memberCategories,
  inviteToGroup, updateRole, removeMember, cancelInvitation, createCategory, deleteCategory,
}: MembersTabProps) {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("");

  // Invite-link state
  const { data: inviteLinks = [] } = useGroupInvites(activeGroupId);
  const createInvite = useCreateGroupInvite();
  const updateInvite = useUpdateGroupInvite();
  const deleteInvite = useDeleteGroupInvite();
  const [createInviteOpen, setCreateInviteOpen] = useState(false);
  const [editInvite, setEditInvite] = useState<any>(null);
  const [linkName, setLinkName] = useState("");
  const [linkToken, setLinkToken] = useState("");
  const [linkExpires, setLinkExpires] = useState("");
  const [linkMaxUses, setLinkMaxUses] = useState("0");

  const handleInvite = () => {
    if (!inviteEmail.trim() || !activeGroupId) return;
    inviteToGroup.mutate({ groupId: activeGroupId, userId: inviteEmail }, {
      onSuccess: () => { setInviteEmail(""); toast({ title: "Invitation sent!" }); },
      onError: (err: any) => toast({ title: "Failed to invite", description: err.message, variant: "destructive" }),
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !activeGroupId) return;
    createCategory.mutate({ groupId: activeGroupId, name: newCategoryName, description: newCategoryDesc || undefined, color: newCategoryColor || undefined }, {
      onSuccess: () => {
        setNewCategoryName(""); setNewCategoryDesc(""); setNewCategoryColor(""); setAddCategoryOpen(false);
        toast({ title: "Category created!" });
      },
    });
  };

  const openCreateInvite = () => {
    setEditInvite(null);
    setLinkName("");
    setLinkToken("");
    setLinkExpires("");
    setLinkMaxUses("0");
    setCreateInviteOpen(true);
  };

  const openEditInvite = (inv: any) => {
    setEditInvite(inv);
    setLinkName(inv.name || "");
    setLinkToken(inv.token || "");
    setLinkExpires(formatDateTimeLocal(inv.expires_at));
    setLinkMaxUses(String(inv.max_uses ?? 0));
    setCreateInviteOpen(true);
  };

  const handleSaveInvite = () => {
    if (!activeGroupId || !linkName.trim()) return;
    const expiresAt = linkExpires ? new Date(linkExpires).toISOString() : null;
    const maxUses = Math.max(0, Number(linkMaxUses) || 0);
    if (editInvite) {
      updateInvite.mutate(
        { id: editInvite.id, groupId: activeGroupId, name: linkName.trim(), token: linkToken.trim() || undefined, expiresAt, maxUses },
        {
          onSuccess: () => { setCreateInviteOpen(false); toast({ title: "Invite link updated" }); },
          onError: (err: any) => toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
        }
      );
    } else {
      createInvite.mutate(
        { groupId: activeGroupId, name: linkName.trim(), token: linkToken.trim() || undefined, expiresAt, maxUses },
        {
          onSuccess: () => { setCreateInviteOpen(false); toast({ title: "Invite link created" }); },
          onError: (err: any) => toast({ title: "Failed to create", description: err.message, variant: "destructive" }),
        }
      );
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/join/${token}`;
    navigator.clipboard?.writeText(link);
    toast({ title: "Invite link copied!" });
  };

  const toggleRevoke = (inv: any) => {
    updateInvite.mutate({ id: inv.id, isRevoked: !inv.is_revoked }, {
      onSuccess: () => toast({ title: inv.is_revoked ? "Invite link reactivated" : "Invite link revoked" }),
    });
  };

  const handleDeleteInvite = (inv: any) => {
    deleteInvite.mutate({ id: inv.id }, { onSuccess: () => toast({ title: "Invite link deleted" }) });
  };

  return (
    <div>
      {isAdmin && (
        <Card className="border-transparent card-elevated mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Invite Members</CardTitle></CardHeader>
          <CardContent className="pt-2 space-y-4">
            <div className="flex gap-2">
              <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Enter email address to invite..." className="flex-1" />
              <Button variant="coral" onClick={handleInvite} disabled={!inviteEmail.trim() || inviteToGroup.isPending}><Mail className="h-4 w-4 mr-1" /> Invite</Button>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Link2 className="h-4 w-4" /> Invite Links</h4>
                <Button size="sm" variant="outline" onClick={openCreateInvite}><Plus className="h-3.5 w-3.5 mr-1" /> New link</Button>
              </div>
              {inviteLinks.length === 0 ? (
                <p className="text-xs text-muted-foreground">No invite links yet. Create one to share a join URL with family or care staff.</p>
              ) : (
                <div className="space-y-2">
                  {inviteLinks.map((inv: any) => {
                    const link = `${window.location.origin}/join/${inv.token}`;
                    const status = inv.is_revoked ? "Revoked" : inv.is_expired ? "Expired" : inv.is_exhausted ? "Used up" : "Active";
                    return (
                      <div key={inv.id} className="rounded-lg border p-3 space-y-2 bg-muted/30">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-foreground truncate">{inv.name || "Invite link"}</p>
                              <Badge variant={inv.is_active ? "default" : "outline"} className="text-[10px] h-4">{status}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {inv.expires_at ? `Expires ${new Date(inv.expires_at).toLocaleString()}` : "Never expires"}
                              {" · "}
                              {inv.max_uses > 0 ? `${inv.use_count}/${inv.max_uses} uses` : `${inv.use_count} uses (unlimited)`}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditInvite(inv)}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleRevoke(inv)}><Ban className="h-3.5 w-3.5 mr-2" /> {inv.is_revoked ? "Reactivate" : "Revoke"}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInvite(inv)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input readOnly value={link} className="flex-1 font-mono text-xs h-8" onFocus={(e) => e.currentTarget.select()} />
                          <Button type="button" size="sm" variant="outline" onClick={() => copyLink(inv.token)}>
                            <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Dialog open={createInviteOpen} onOpenChange={setCreateInviteOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>{editInvite ? "Edit invite link" : "Create invite link"}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Name *</Label>
                    <Input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="e.g. Family link, Night nurses" />
                    <p className="text-xs text-muted-foreground mt-1">A label so you can tell links apart.</p>
                  </div>
                  <div>
                    <Label>Custom code</Label>
                    <Input value={linkToken} onChange={e => setLinkToken(e.target.value.replace(/\s+/g, ""))} placeholder="Leave blank to auto-generate" />
                    <p className="text-xs text-muted-foreground mt-1">Optional — make it memorable, e.g. <code>moms-team-2026</code>.</p>
                  </div>
                  <div>
                    <Label>Expires at</Label>
                    <Input type="datetime-local" value={linkExpires} onChange={e => setLinkExpires(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">Leave blank for no expiry.</p>
                  </div>
                  <div>
                    <Label>Max uses</Label>
                    <Input type="number" min={0} value={linkMaxUses} onChange={e => setLinkMaxUses(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">Use 0 for unlimited.</p>
                  </div>
                  <Button variant="coral" className="w-full" onClick={handleSaveInvite}
                    disabled={!linkName.trim() || createInvite.isPending || updateInvite.isPending}>
                    {editInvite ? "Save changes" : "Create link"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {isAdmin && (pendingInvitations || []).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /> Pending Invitations ({(pendingInvitations || []).length})</h3>
          <div className="space-y-2">
            {(pendingInvitations || []).map((inv: any) => (
              <Card key={inv.id} className="border-transparent card-elevated border-l-4 border-l-warning">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.invitee_email || inv.invited_email || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">Invited {new Date(inv.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => cancelInvitation.mutate(inv.id)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Tag className="h-4 w-4" /> Member Categories</h3>
            <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Member Category</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Name *</Label><Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Medical Team, Night Shift" /></div>
                  <div><Label>Description</Label><Input value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} placeholder="Optional description" /></div>
                  <div><Label>Color</Label>
                    <Select value={newCategoryColor} onValueChange={setNewCategoryColor}>
                      <SelectTrigger><SelectValue placeholder="Choose a color" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem><SelectItem value="green">Green</SelectItem>
                        <SelectItem value="red">Red</SelectItem><SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem><SelectItem value="teal">Teal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="coral" className="w-full" onClick={handleAddCategory} disabled={!newCategoryName.trim() || createCategory.isPending}>Create Category</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {(memberCategories || []).length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-2">
              {(memberCategories || []).map((cat: any) => (
                <SubgroupCard
                  key={cat.id}
                  subgroup={cat}
                  members={members || []}
                  isAdmin={isAdmin}
                  onDelete={() => deleteCategory.mutate(cat.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No sub-groups yet. Create groups like "Family", "Medical Team", or "Night Shift" — posts and tasks can then be limited to specific sub-groups.</p>
          )}
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Active Members ({(members || []).length})</h3>
        <div className="space-y-2">
          {(members || []).map((m: any) => (
            <Card key={m.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {m.profile?.avatar_url ? <img src={m.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-primary font-medium">{(m.profile?.full_name || "?")[0]}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.display_name || m.profile?.full_name || "Member"}</p>
                      <p className="text-xs text-muted-foreground">{m.profile?.email || ""}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {m.is_owner && <Badge variant="default" className="text-[10px] h-4 gap-0.5"><Crown className="h-2.5 w-2.5" /> Owner</Badge>}
                        {m.is_admin && !m.is_owner && <Badge variant="secondary" className="text-[10px] h-4 gap-0.5"><Shield className="h-2.5 w-2.5" /> Admin</Badge>}
                        {m.is_cared_one && <Badge className="text-[10px] h-4 bg-accent text-accent-foreground"><Heart className="h-2.5 w-2.5 mr-0.5" /> Cared One</Badge>}
                        {!m.is_owner && !m.is_admin && !m.is_cared_one && <Badge variant="outline" className="text-[10px] h-4">Member</Badge>}
                      </div>
                    </div>
                  </div>
                  {isAdmin && m.user_id !== userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateRole.mutate({ memberId: m.id, groupId: activeGroupId, updates: { is_cared_one: !m.is_cared_one } })}>
                          <Heart className="h-3.5 w-3.5 mr-2" /> {m.is_cared_one ? "Remove Cared One" : "Mark as Cared One"}
                        </DropdownMenuItem>
                        {!m.is_owner && (
                          <DropdownMenuItem onClick={() => updateRole.mutate({ memberId: m.id, groupId: activeGroupId, updates: { is_admin: !m.is_admin } })}>
                            <Shield className="h-3.5 w-3.5 mr-2" /> {m.is_admin ? "Remove Admin" : "Make Admin"}
                          </DropdownMenuItem>
                        )}
                        {isOwner && !m.is_owner && (
                          <DropdownMenuItem onClick={() => {
                            if (currentMember) {
                              updateRole.mutate({ memberId: currentMember.id, groupId: activeGroupId, updates: { is_owner: false } }, {
                                onSuccess: () => {
                                  updateRole.mutate({ memberId: m.id, groupId: activeGroupId, updates: { is_owner: true, is_admin: true } }, {
                                    onSuccess: () => toast({ title: "Ownership transferred!" }),
                                  });
                                },
                              });
                            }
                          }}>
                            <Crown className="h-3.5 w-3.5 mr-2" /> Transfer Ownership
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {!m.is_owner && (
                          <DropdownMenuItem className="text-destructive" onClick={() => removeMember.mutate({ memberId: m.id, groupId: activeGroupId }, { onSuccess: () => toast({ title: "Member removed" }) })}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove from Group
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {m.user_id === userId && <Badge variant="outline" className="text-[10px]">You</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
