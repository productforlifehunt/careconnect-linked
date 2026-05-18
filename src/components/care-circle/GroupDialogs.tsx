import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Search, X, Heart, Trash2, KeyRound } from "lucide-react";
import { useSearchProfiles, useAddCaredOneToGroup, useUpdateCareGroup, useDeleteCareGroup } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

function useZ() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  return (cn: string, en: string) => (isCN ? cn : en);
}

// ─── Settings Dialog ────────────────────────────────────────
export function GroupSettingsDialog({
  open, onOpenChange, activeGroup, activeGroupId, isOwner,
  updateGroup, deleteGroup, onDeleteSuccess, onLeaveGroup,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  activeGroup: any; activeGroupId: string | null;
  isOwner: boolean; updateGroup: any; deleteGroup: any;
  onDeleteSuccess: () => void; onLeaveGroup: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(activeGroup?.name || "");
  const [desc, setDesc] = useState(activeGroup?.description || "");
  const [isPrivate, setIsPrivate] = useState(activeGroup?.is_private || false);

  // Sync when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (o && activeGroup) {
      setName(activeGroup.name);
      setDesc(activeGroup.description || "");
      setIsPrivate(activeGroup.is_private || false);
    }
    onOpenChange(o);
  };

  const handleSave = () => {
    if (!activeGroupId || !name.trim()) return;
    updateGroup.mutate({ id: activeGroupId, updates: { name, description: desc || null, is_private: isPrivate } }, {
      onSuccess: () => { onOpenChange(false); toast({ title: "Group updated!" }); },
    });
  };

  const handleDelete = () => {
    if (!activeGroupId) return;
    deleteGroup.mutate(activeGroupId, {
      onSuccess: () => { onOpenChange(false); onDeleteSuccess(); toast({ title: "Group deleted" }); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Group Settings</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Group Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} /></div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Private Group</Label>
              <p className="text-xs text-muted-foreground">Private groups are hidden and invite-only</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
          {/* Invite links are managed in the Members tab (CCT 160 + Rel 161). */}
          <Button variant="coral" className="w-full" onClick={handleSave} disabled={updateGroup.isPending || !name.trim()}>Save Changes</Button>
          {!isOwner && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Membership</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">Leave Group</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave this care group?</AlertDialogTitle>
                    <AlertDialogDescription>You will lose access to all group content. You can rejoin with a join code or invitation.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onLeaveGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Leave Group</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {isOwner && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full"><Trash2 className="h-4 w-4 mr-2" /> Delete Group</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this care group?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. All group data including posts, tasks, and messages will be permanently deleted.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Group</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Post Dialog ───────────────────────────────────────
export function EditPostDialog({
  post, onClose, updatePost,
}: {
  post: any; onClose: () => void; updatePost: any;
}) {
  const { toast } = useToast();
  const [content, setContent] = useState(post?.content || "");
  const [title, setTitle] = useState(post?.title || "");

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Post</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Optional title" /></div>
          <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} /></div>
          <Button variant="coral" className="w-full" onClick={() => {
            if (!post) return;
            updatePost.mutate({ id: post.id, updates: { content, title: title || null } }, {
              onSuccess: () => { onClose(); toast({ title: "Post updated!" }); },
            });
          }} disabled={updatePost.isPending || !content.trim()}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Cared One Dialog ───────────────────────────────────
export function AddCaredOneDialog({
  open, onOpenChange, activeGroupId,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; activeGroupId: string | null;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [skipInvitation, setSkipInvitation] = useState(false);
  const { data: searchResults } = useSearchProfiles(search);
  const addCaredOne = useAddCaredOneToGroup();

  const handleAdd = () => {
    if (!selectedPerson || !activeGroupId) return;
    addCaredOne.mutate({ groupId: activeGroupId, caredOneId: selectedPerson.id }, {
      onSuccess: () => {
        onOpenChange(false); setSelectedPerson(null); setSearch(""); setSkipInvitation(false);
        toast({ title: "Cared one added to group!" });
      },
      onError: (err: any) => toast({ title: "Failed to add", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setSelectedPerson(null); setSearch(""); setSkipInvitation(false); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Cared One to Group</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Search by name or email</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setSelectedPerson(null); }} placeholder="Type at least 2 characters..." className="pl-9" />
            </div>
          </div>
          {search.length >= 2 && !selectedPerson && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {(searchResults || []).length > 0 ? (searchResults || []).map((p: any) => (
                <button key={p.id} className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors" onClick={() => setSelectedPerson(p)}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="text-primary text-xs font-medium">{(p.full_name || p.email || "?")[0]}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.full_name || p.first_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.email || p.user_name || ""}</p>
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
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
            <Checkbox id="skip-inv" checked={skipInvitation} onCheckedChange={(checked) => setSkipInvitation(checked === true)} className="mt-0.5" />
            <div>
              <Label htmlFor="skip-inv" className="text-sm font-medium cursor-pointer">Skip invitation</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Check this for elderly or children who can't operate a phone. They'll be added as active members immediately.</p>
            </div>
          </div>
          <Button variant="coral" className="w-full" onClick={handleAdd} disabled={!selectedPerson || addCaredOne.isPending}>
            {addCaredOne.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
            Add as Cared One
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
