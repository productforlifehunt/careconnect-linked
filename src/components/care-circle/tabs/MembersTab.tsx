import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, Mail, KeyRound, Clock, X, Tag, Plus, Shield, Heart, Crown, MoreVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleInvite = () => {
    if (!inviteEmail.trim() || !activeGroupId) return;
    inviteToGroup.mutate({ groupId: activeGroupId, email: inviteEmail }, {
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

  return (
    <div>
      {isAdmin && (
        <Card className="border-transparent card-elevated mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Invite Members</CardTitle></CardHeader>
          <CardContent className="pt-2">
            <div className="flex gap-2">
              <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Enter email address to invite..." className="flex-1" />
              <Button variant="coral" onClick={handleInvite} disabled={!inviteEmail.trim() || inviteToGroup.isPending}><Mail className="h-4 w-4 mr-1" /> Invite</Button>
            </div>
            {activeGroup?.join_code && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" />
                <span>Or share join code: <strong className="font-mono text-foreground">{activeGroup.join_code}</strong></span>
              </div>
            )}
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
            <div className="flex flex-wrap gap-2">
              {(memberCategories || []).map((cat: any) => (
                <Badge key={cat.id} variant="secondary" className="gap-1.5 pr-1">
                  <Tag className="h-3 w-3" />{cat.name}
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => deleteCategory.mutate(cat.id)}><X className="h-2.5 w-2.5" /></Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No categories yet. Create sub-groups like "Medical Team" or "Night Shift" to organize members.</p>
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
                      <p className="text-sm font-medium text-foreground">{m.profile?.full_name || "Member"}</p>
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
                        <DropdownMenuItem onClick={() => updateRole.mutate({ memberId: m.id, updates: { is_cared_one: !m.is_cared_one } })}>
                          <Heart className="h-3.5 w-3.5 mr-2" /> {m.is_cared_one ? "Remove Cared One" : "Mark as Cared One"}
                        </DropdownMenuItem>
                        {!m.is_owner && (
                          <DropdownMenuItem onClick={() => updateRole.mutate({ memberId: m.id, updates: { is_admin: !m.is_admin } })}>
                            <Shield className="h-3.5 w-3.5 mr-2" /> {m.is_admin ? "Remove Admin" : "Make Admin"}
                          </DropdownMenuItem>
                        )}
                        {isOwner && !m.is_owner && (
                          <DropdownMenuItem onClick={() => {
                            if (currentMember) {
                              updateRole.mutate({ memberId: currentMember.id, updates: { is_owner: false } }, {
                                onSuccess: () => {
                                  updateRole.mutate({ memberId: m.id, updates: { is_owner: true, is_admin: true } }, {
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
