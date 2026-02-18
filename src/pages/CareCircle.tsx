import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users, Plus, CheckCircle, Circle, Clock, UserPlus, ListTodo, Loader2,
  Home, CalendarDays, Megaphone, Heart, ClipboardCheck, MessageSquare, Star,
  Image, Settings, Send, Pin, Trash2, Shield, Edit, MoreVertical, X, KeyRound, Mail, Crown,
  Search, Tag, Eye,
} from "lucide-react";
import {
  useCareGroups, useCreateCareGroup, useCareGroupMembers, useCareTasks, useCreateTask, useUpdateTaskStatus,
  useCareGroupPosts, useCreateGroupPost, useUpdateGroupPost, useDeleteGroupPost,
  useCareGroupGallery, useGroupCaredOnes,
  useCheckinLogs, useCreateCheckinLog, useGroupMessages, useSendMessage,
  useInviteToGroup, useUpdateMemberRole, useRemoveGroupMember,
  useUpdateCareGroup, useDeleteCareGroup, useJoinGroupByCode,
  useGroupInvitations, useCancelInvitation,
  useSearchProfiles, useAddCaredOneToGroup,
  useMemberCategories, useCreateMemberCategory, useDeleteMemberCategory,
  useDeleteTask, useLeaveGroup,
} from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CareCircle() {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: groups, isLoading: groupsLoading } = useCareGroups();
  const createGroup = useCreateCareGroup();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinCodeOpen, setJoinCodeOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const joinGroupByCode = useJoinGroupByCode();

  const activeGroupId = selectedGroupId || (groups && groups.length > 0 ? groups[0].id : null);
  const activeGroup = (groups || []).find((g: any) => g.id === activeGroupId);

  const { data: members } = useCareGroupMembers(activeGroupId);
  const { data: tasks, isLoading: tasksLoading } = useCareTasks(activeGroupId);
  const { data: allPosts } = useCareGroupPosts(activeGroupId);
  const { data: announcements } = useCareGroupPosts(activeGroupId, "announcement");
  const { data: wishes } = useCareGroupPosts(activeGroupId, "wish");
  const { data: gallery } = useCareGroupGallery(activeGroupId);
  const { data: groupCaredOnes } = useGroupCaredOnes(activeGroupId);
  const { data: groupMessages } = useGroupMessages(activeGroupId);
  const { data: pendingInvitations } = useGroupInvitations(activeGroupId);
  const { data: memberCategories } = useMemberCategories(activeGroupId);
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const createPost = useCreateGroupPost();
  const updatePost = useUpdateGroupPost();
  const deletePost = useDeleteGroupPost();
  const sendMessage = useSendMessage();
  const inviteToGroup = useInviteToGroup();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveGroupMember();
  const updateGroup = useUpdateCareGroup();
  const deleteGroup = useDeleteCareGroup();
  const cancelInvitation = useCancelInvitation();
  const addCaredOneToGroup = useAddCaredOneToGroup();
  const createCategory = useCreateMemberCategory();
  const deleteCategory = useDeleteMemberCategory();
  const leaveGroup = useLeaveGroup();

  // Local state
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignee: "", priority: "medium", category: "Daily Living", due_date: "", visibility: "group" });
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState("discussion");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [postVisibility, setPostVisibility] = useState("group");
  const [chatMessage, setChatMessage] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [wishContent, setWishContent] = useState("");
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostTitle, setEditPostTitle] = useState("");

  // Settings form state
  const [settingsName, setSettingsName] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [settingsPrivate, setSettingsPrivate] = useState(false);

  // Add Cared One modal
  const [addCaredOneOpen, setAddCaredOneOpen] = useState(false);
  const [caredOneSearch, setCaredOneSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [skipInvitation, setSkipInvitation] = useState(false);
  const { data: searchResults } = useSearchProfiles(caredOneSearch);

  // Member category modal
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("");

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroup.mutate({ name: newGroupName, description: newGroupDesc || undefined }, {
      onSuccess: () => {
        setNewGroupName(""); setNewGroupDesc(""); setCreateGroupOpen(false);
        toast({ title: "Care group created!" });
      },
    });
  };

  const handleJoinByCode = () => {
    if (!joinCode.trim()) return;
    joinGroupByCode.mutate(joinCode, {
      onSuccess: () => {
        setJoinCode(""); setJoinCodeOpen(false);
        toast({ title: "Joined group successfully!" });
      },
      onError: (err: any) => {
        toast({ title: "Failed to join", description: err.message, variant: "destructive" });
      },
    });
  };

  const openSettings = () => {
    if (activeGroup) {
      setSettingsName(activeGroup.name);
      setSettingsDesc(activeGroup.description || "");
      setSettingsPrivate(activeGroup.is_private || false);
      setSettingsOpen(true);
    }
  };

  const handleSaveSettings = () => {
    if (!activeGroupId || !settingsName.trim()) return;
    updateGroup.mutate({ id: activeGroupId, updates: { name: settingsName, description: settingsDesc || null, is_private: settingsPrivate } }, {
      onSuccess: () => { setSettingsOpen(false); toast({ title: "Group updated!" }); },
    });
  };

  const handleDeleteGroup = () => {
    if (!activeGroupId) return;
    deleteGroup.mutate(activeGroupId, {
      onSuccess: () => { setSettingsOpen(false); setSelectedGroupId(null); toast({ title: "Group deleted" }); },
    });
  };

  const toggleTask = (id: string, currentStatus: string) => {
    updateTaskStatus.mutate({ id, status: currentStatus === "completed" ? "pending" : "completed" });
  };

  const addTask = () => {
    if (!newTask.title || !activeGroupId) return;
    createTask.mutate({
      title: newTask.title,
      description: newTask.description || undefined,
      group_id: activeGroupId,
      assigned_to: newTask.assignee || undefined,
      priority: newTask.priority,
      category: newTask.category,
      due_date: newTask.due_date || undefined,
      status: "pending",
      visibility: newTask.visibility,
    } as any, {
      onSuccess: () => {
        setNewTask({ title: "", description: "", assignee: "", priority: "medium", category: "Daily Living", due_date: "", visibility: "group" });
        setAddTaskOpen(false);
        toast({ title: "Task added" });
      },
    });
  };

  const handleLeaveGroup = () => {
    if (!activeGroupId || !user?.id) return;
    leaveGroup.mutate({ groupId: activeGroupId, userId: user.id }, {
      onSuccess: () => { setSelectedGroupId(null); toast({ title: "Left group" }); },
      onError: (err: any) => toast({ title: "Cannot leave", description: err.message, variant: "destructive" }),
    });
  };

  const addPost = () => {
    if (!newPostContent.trim() || !activeGroupId) return;
    createPost.mutate({ group_id: activeGroupId, content: newPostContent, type: newPostType, title: newPostTitle || undefined, visibility: postVisibility }, {
      onSuccess: () => { setNewPostContent(""); setNewPostTitle(""); setPostVisibility("group"); toast({ title: "Posted!" }); },
    });
  };

  const handleSendChat = () => {
    if (!chatMessage.trim() || !activeGroupId) return;
    sendMessage.mutate({ content: chatMessage, groupId: activeGroupId }, {
      onSuccess: () => setChatMessage(""),
    });
  };

  const handleInvite = () => {
    if (!inviteEmail.trim() || !activeGroupId) return;
    inviteToGroup.mutate({ groupId: activeGroupId, email: inviteEmail }, {
      onSuccess: () => { setInviteEmail(""); toast({ title: "Invitation sent!" }); },
      onError: (err: any) => { toast({ title: "Failed to invite", description: err.message, variant: "destructive" }); },
    });
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditPostContent(post.content || "");
    setEditPostTitle(post.title || "");
  };

  const handleSaveEditPost = () => {
    if (!editingPost) return;
    updatePost.mutate({ id: editingPost.id, updates: { content: editPostContent, title: editPostTitle || null } }, {
      onSuccess: () => { setEditingPost(null); toast({ title: "Post updated!" }); },
    });
  };

  const handleTogglePin = (post: any) => {
    updatePost.mutate({ id: post.id, updates: { is_pinned: !post.is_pinned } }, {
      onSuccess: () => toast({ title: post.is_pinned ? "Unpinned" : "Pinned!" }),
    });
  };

  const handleDeletePost = (postId: string) => {
    deletePost.mutate(postId, {
      onSuccess: () => toast({ title: "Post deleted" }),
    });
  };

  const handleAddCaredOne = () => {
    if (!selectedPerson || !activeGroupId) return;
    addCaredOneToGroup.mutate({ groupId: activeGroupId, userId: selectedPerson.id, skipInvitation }, {
      onSuccess: () => {
        setAddCaredOneOpen(false);
        setSelectedPerson(null);
        setCaredOneSearch("");
        setSkipInvitation(false);
        toast({ title: "Cared one added to group!" });
      },
      onError: (err: any) => toast({ title: "Failed to add", description: err.message, variant: "destructive" }),
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

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive", urgent: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground",
  };

  const currentMember = (members || []).find((m: any) => m.user_id === user?.id);
  const isAdmin = currentMember?.is_owner || currentMember?.is_admin;
  const isOwner = currentMember?.is_owner;

  if (groupsLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (!groups || groups.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">No Care Groups Yet</h1>
        <p className="text-muted-foreground mb-6">Create a care group or join one with a code.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild><Button variant="coral"><Plus className="h-4 w-4 mr-2" /> Create Care Group</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Care Group</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Group Name *</Label><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Mom's Care Team" /></div>
                <div><Label>Description</Label><Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="What is this group for?" /></div>
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
            <DialogTrigger asChild><Button variant="outline"><KeyRound className="h-4 w-4 mr-2" /> Join with Code</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Join Care Group</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Join Code</Label><Input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter group code (e.g. ABC123)" className="uppercase" /></div>
                <Button variant="coral" className="w-full" onClick={handleJoinByCode} disabled={joinGroupByCode.isPending || !joinCode.trim()}>Join Group</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const pendingTasks = (tasks || []).filter((t: any) => t.status !== "completed");
  const completedTasks = (tasks || []).filter((t: any) => t.status === "completed");

  const tasksByDate: Record<string, any[]> = {};
  (tasks || []).filter((t: any) => t.due_date).forEach((t: any) => {
    const d = t.due_date.split("T")[0];
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });
  const sortedDates = Object.keys(tasksByDate).sort();

  // Post action menu
  const PostActions = ({ post }: { post: any }) => {
    const canEdit = post.author_id === user?.id;
    const canPin = isAdmin && post.type === "announcement";
    const canDelete = post.author_id === user?.id || isAdmin;
    if (!canEdit && !canPin && !canDelete) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && <DropdownMenuItem onClick={() => handleEditPost(post)}><Edit className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>}
          {canPin && <DropdownMenuItem onClick={() => handleTogglePin(post)}><Pin className="h-3.5 w-3.5 mr-2" /> {post.is_pinned ? "Unpin" : "Pin"}</DropdownMenuItem>}
          {canDelete && <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Visibility selector component
  const VisibilitySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-36">
        <Eye className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="group">All Members</SelectItem>
        <SelectItem value="admins">Admins Only</SelectItem>
        {(memberCategories || []).length > 0 && <SelectItem value="categories">By Category</SelectItem>}
      </SelectContent>
    </Select>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Care Circle</h1>
          <p className="text-sm text-muted-foreground">Coordinate care with your team</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={openSettings} title="Group Settings"><Settings className="h-4 w-4" /></Button>
          )}
          <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><KeyRound className="h-4 w-4 mr-1" /> Join</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Join Care Group</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Join Code</Label><Input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter group code (e.g. ABC123)" className="uppercase" /></div>
                <Button variant="coral" className="w-full" onClick={handleJoinByCode} disabled={joinGroupByCode.isPending || !joinCode.trim()}>Join Group</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> New Group</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Care Group</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Group Name *</Label><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Mom's Care Team" /></div>
                <div><Label>Description</Label><Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="What is this group for?" /></div>
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Group Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Group Settings</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Group Name</Label><Input value={settingsName} onChange={e => setSettingsName(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={settingsDesc} onChange={e => setSettingsDesc(e.target.value)} rows={3} /></div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Private Group</Label>
                <p className="text-xs text-muted-foreground">Private groups are hidden and invite-only</p>
              </div>
              <Switch checked={settingsPrivate} onCheckedChange={setSettingsPrivate} />
            </div>
            {activeGroup?.join_code && (
              <div className="rounded-lg bg-muted p-3">
                <Label className="text-xs">Join Code</Label>
                <p className="text-lg font-mono font-bold text-foreground tracking-widest">{activeGroup.join_code}</p>
                <p className="text-xs text-muted-foreground">Share this code so others can join</p>
              </div>
            )}
            <Button variant="coral" className="w-full" onClick={handleSaveSettings} disabled={updateGroup.isPending || !settingsName.trim()}>Save Changes</Button>
            {/* Leave Group (non-owners) */}
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
                      <AlertDialogAction onClick={handleLeaveGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Leave Group</AlertDialogAction>
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
                      <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Group</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Post</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Title</Label><Input value={editPostTitle} onChange={e => setEditPostTitle(e.target.value)} placeholder="Optional title" /></div>
            <div><Label>Content</Label><Textarea value={editPostContent} onChange={e => setEditPostContent(e.target.value)} rows={4} /></div>
            <Button variant="coral" className="w-full" onClick={handleSaveEditPost} disabled={updatePost.isPending || !editPostContent.trim()}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Cared One Dialog */}
      <Dialog open={addCaredOneOpen} onOpenChange={(open) => { setAddCaredOneOpen(open); if (!open) { setSelectedPerson(null); setCaredOneSearch(""); setSkipInvitation(false); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Cared One to Group</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Search by name or email</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={caredOneSearch} onChange={e => { setCaredOneSearch(e.target.value); setSelectedPerson(null); }} placeholder="Type at least 2 characters..." className="pl-9" />
              </div>
            </div>
            {/* Search results */}
            {caredOneSearch.length >= 2 && !selectedPerson && (
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
            {/* Selected person */}
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
            {/* Skip invitation checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Checkbox id="skip-inv" checked={skipInvitation} onCheckedChange={(checked) => setSkipInvitation(checked === true)} className="mt-0.5" />
              <div>
                <Label htmlFor="skip-inv" className="text-sm font-medium cursor-pointer">Skip invitation</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Check this for elderly or children who can't operate a phone. They'll be added as active members immediately.</p>
              </div>
            </div>
            <Button variant="coral" className="w-full" onClick={handleAddCaredOne} disabled={!selectedPerson || addCaredOneToGroup.isPending}>
              {addCaredOneToGroup.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
              Add as Cared One
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group selector */}
      {groups.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {groups.map(g => (
            <Badge key={g.id} variant={activeGroupId === g.id ? "default" : "outline"} className="cursor-pointer whitespace-nowrap" onClick={() => setSelectedGroupId(g.id)}>{g.name}</Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="home" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="flex w-max gap-1 mb-1">
            <TabsTrigger value="home" className="gap-1.5 text-xs"><Home className="h-3.5 w-3.5" /> Home</TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5 text-xs"><CalendarDays className="h-3.5 w-3.5" /> Calendar</TabsTrigger>
            <TabsTrigger value="announcements" className="gap-1.5 text-xs"><Megaphone className="h-3.5 w-3.5" /> Announcements</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5 text-xs"><ListTodo className="h-3.5 w-3.5" /> Tasks</TabsTrigger>
            <TabsTrigger value="cared-ones" className="gap-1.5 text-xs"><Heart className="h-3.5 w-3.5" /> Cared Ones</TabsTrigger>
            <TabsTrigger value="checkins" className="gap-1.5 text-xs"><ClipboardCheck className="h-3.5 w-3.5" /> Check-Ins</TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" /> Messages</TabsTrigger>
            <TabsTrigger value="wishes" className="gap-1.5 text-xs"><Star className="h-3.5 w-3.5" /> Well Wishes</TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Members</TabsTrigger>
            <TabsTrigger value="gallery" className="gap-1.5 text-xs"><Image className="h-3.5 w-3.5" /> Gallery</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* ═══ HOME ═══ */}
        <TabsContent value="home" className="mt-4">
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Pending Tasks", value: pendingTasks.length, icon: ListTodo },
              { label: "Members", value: (members || []).length, icon: Users },
              { label: "Cared Ones", value: (groupCaredOnes || []).length, icon: Heart },
            ].map(s => (
              <Card key={s.label} className="border-transparent card-elevated">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className="h-5 w-5 text-primary" />
                  <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Quick post with visibility */}
          <Card className="border-transparent card-elevated mb-6">
            <CardContent className="p-4">
              <Textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Share an update with your care team..." className="mb-3" rows={2} />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2">
                  <Select value={newPostType} onValueChange={setNewPostType}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="wish">Well Wish</SelectItem>
                    </SelectContent>
                  </Select>
                  <VisibilitySelect value={postVisibility} onChange={setPostVisibility} />
                </div>
                <Button variant="coral" size="sm" onClick={addPost} disabled={!newPostContent.trim() || createPost.isPending}>Post</Button>
              </div>
            </CardContent>
          </Card>
          {/* Recent posts */}
          <div className="space-y-3">
            {(allPosts || []).slice(0, 5).map((p: any) => (
              <Card key={p.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{(p.author?.full_name || "?")[0]}</div>
                    <span className="text-sm font-medium text-foreground">{p.author?.full_name || "Member"}</span>
                    <Badge variant="outline" className="text-xs ml-auto">{p.type}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                    <PostActions post={p} />
                  </div>
                  {p.title && <p className="font-medium text-sm text-foreground mb-1">{p.title}</p>}
                  <p className="text-sm text-muted-foreground">{p.content}</p>
                </CardContent>
              </Card>
            ))}
            {(allPosts || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No posts yet. Share an update above!</p>}
          </div>
        </TabsContent>

        {/* ═══ CALENDAR ═══ */}
        <TabsContent value="calendar" className="mt-4">
          {sortedDates.length > 0 ? sortedDates.map(date => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">{new Date(date + "T00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</h3>
              <div className="space-y-2">
                {tasksByDate[date].map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                    {t.status === "completed" ? <CheckCircle className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.assignee_profile?.full_name || "Unassigned"}</p>
                    </div>
                    <Badge variant="outline" className={priorityColors[t.priority] || ""}>{t.priority}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )) : <p className="text-center py-12 text-muted-foreground">No scheduled tasks. Add due dates to tasks to see them here.</p>}
        </TabsContent>

        {/* ═══ ANNOUNCEMENTS ═══ */}
        <TabsContent value="announcements" className="mt-4">
          {isAdmin && (
            <Card className="border-transparent card-elevated mb-4">
              <CardContent className="p-4">
                <Input value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} placeholder="Announcement title..." className="mb-2" />
                <Textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Write an announcement..." className="mb-3" rows={2} />
                <div className="flex items-center justify-between gap-2">
                  <VisibilitySelect value={postVisibility} onChange={setPostVisibility} />
                  <Button variant="coral" size="sm" onClick={() => {
                    if (!newPostContent.trim() || !activeGroupId) return;
                    createPost.mutate({ group_id: activeGroupId, content: newPostContent, type: "announcement", title: newPostTitle || undefined, visibility: postVisibility }, {
                      onSuccess: () => { setNewPostContent(""); setNewPostTitle(""); setPostVisibility("group"); toast({ title: "Announcement posted!" }); },
                    });
                  }} disabled={!newPostContent.trim() || createPost.isPending}>
                    <Megaphone className="h-3.5 w-3.5 mr-1" /> Post Announcement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            {(announcements || []).filter((a: any) => a.is_pinned).map((a: any) => (
              <Card key={a.id} className="border-transparent card-elevated border-l-4 border-l-primary bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Pin className="h-3 w-3 text-primary" />
                      <span className="font-medium text-sm text-foreground">{a.author?.full_name || "Admin"}</span>
                      <Badge variant="secondary" className="text-[10px]">Pinned</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                      <PostActions post={a} />
                    </div>
                  </div>
                  {a.title && <h4 className="font-semibold text-foreground mb-1">{a.title}</h4>}
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                </CardContent>
              </Card>
            ))}
            {(announcements || []).filter((a: any) => !a.is_pinned).map((a: any) => (
              <Card key={a.id} className="border-transparent card-elevated border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground">{a.author?.full_name || "Admin"}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                      <PostActions post={a} />
                    </div>
                  </div>
                  {a.title && <h4 className="font-semibold text-foreground mb-1">{a.title}</h4>}
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                </CardContent>
              </Card>
            ))}
            {(announcements || []).length === 0 && <p className="text-center py-12 text-muted-foreground">No announcements yet</p>}
          </div>
        </TabsContent>

        {/* ═══ TASKS ═══ */}
        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">{pendingTasks.length} pending · {completedTasks.length} completed</p>
            <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Task</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Care Task</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Task Title *</Label><Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="What needs to be done?" /></div>
                  <div><Label>Description</Label><Textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Add details..." rows={2} /></div>
                  <div><Label>Assign to</Label>
                    <Select value={newTask.assignee} onValueChange={v => setNewTask(p => ({ ...p, assignee: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select member (optional)" /></SelectTrigger>
                      <SelectContent>{(members || []).map((m: any) => <SelectItem key={m.user_id} value={m.user_id}>{m.profile?.full_name || "Member"}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Priority</Label>
                      <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Category</Label>
                      <Select value={newTask.category} onValueChange={v => setNewTask(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Medical">Medical</SelectItem><SelectItem value="Daily Living">Daily Living</SelectItem><SelectItem value="Administrative">Administrative</SelectItem><SelectItem value="meal_prep">Meal Prep</SelectItem><SelectItem value="transportation">Transportation</SelectItem><SelectItem value="medication">Medication</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Due Date</Label><Input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} /></div>
                    <div><Label>Visibility</Label><VisibilitySelect value={newTask.visibility} onChange={v => setNewTask(p => ({ ...p, visibility: v }))} /></div>
                  </div>
                  <Button variant="coral" className="w-full" onClick={addTask} disabled={createTask.isPending || !newTask.title.trim()}>Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {tasksLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
            <div className="space-y-2">
              {pendingTasks.map((t: any) => (
                <div key={t.id} className="group flex items-center gap-3 p-3 rounded-lg bg-card border hover:border-primary/30 transition-colors">
                  <button onClick={() => toggleTask(t.id, t.status)} className="shrink-0">
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(t.id, t.status)}>
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.assignee_profile?.full_name || "Unassigned"}
                      {t.due_date && ` · Due ${new Date(t.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}`}
                      {t.description && ` · ${t.description.substring(0, 50)}${t.description.length > 50 ? "…" : ""}`}
                    </p>
                  </div>
                  <Badge variant="outline" className={priorityColors[t.priority] || ""}>{t.priority}</Badge>
                  {t.category && <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{t.category}</Badge>}
                  {(isAdmin || t.created_by === user?.id) && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteTask.mutate(t.id, { onSuccess: () => toast({ title: "Task deleted" }) }); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {completedTasks.length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground pt-3 pb-1">Completed ({completedTasks.length})</p>
                  {completedTasks.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-transparent opacity-60 hover:opacity-80">
                      <button onClick={() => toggleTask(t.id, t.status)} className="shrink-0">
                        <CheckCircle className="h-5 w-5 text-success" />
                      </button>
                      <p className="text-sm line-through text-muted-foreground flex-1 cursor-pointer" onClick={() => toggleTask(t.id, t.status)}>{t.title}</p>
                      {(isAdmin || t.created_by === user?.id) && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => deleteTask.mutate(t.id, { onSuccess: () => toast({ title: "Task deleted" }) })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </>
              )}
              {(tasks || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No tasks yet. Click "Add Task" to create one.</p>}
            </div>
          )}
        </TabsContent>

        {/* ═══ CARED ONES ═══ */}
        <TabsContent value="cared-ones" className="mt-4">
          {isAdmin && (
            <div className="mb-4">
              <Button variant="coral" size="sm" onClick={() => setAddCaredOneOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Cared One
              </Button>
            </div>
          )}
          {(groupCaredOnes || []).length > 0 ? (
            <div className="space-y-4">
              {(groupCaredOnes || []).map((co: any) => (
                <Card key={co.id} className="border-transparent card-elevated">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {co.profile?.avatar_url ? <img src={co.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-primary font-medium">{(co.profile?.full_name || "?")[0]}</span>}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{co.profile?.full_name || "Cared One"}</h3>
                        <p className="text-xs text-muted-foreground">{co.relationship || "Cared One"}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">View their health cards, medications, and care plans from the Cared Ones page.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No cared ones in this group yet.</p>
              {isAdmin ? (
                <Button variant="coral" size="sm" onClick={() => setAddCaredOneOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Cared One
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Ask a group admin to add a cared one.</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ═══ CHECK-INS ═══ */}
        <TabsContent value="checkins" className="mt-4">
          <CheckInsTab groupCaredOnes={groupCaredOnes || []} activeGroupId={activeGroupId} />
        </TabsContent>

        {/* ═══ MESSAGES ═══ */}
        <TabsContent value="messages" className="mt-4">
          <Card className="border-transparent card-elevated">
            <CardContent className="p-0">
              <div className="h-[400px] flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {(groupMessages || []).map((msg: any) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {!isMine && <p className="text-xs font-medium mb-0.5">{msg.sender?.full_name || "Member"}</p>}
                            <p className="text-sm">{msg.message_content}</p>
                            <p className={`text-[10px] mt-0.5 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{new Date(msg.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      );
                    })}
                    {(groupMessages || []).length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No messages yet. Start the conversation!</p>}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 p-3 border-t">
                  <Input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === "Enter" && handleSendChat()} />
                  <Button size="icon" onClick={handleSendChat} disabled={!chatMessage.trim() || sendMessage.isPending}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ WELL WISHES ═══ */}
        <TabsContent value="wishes" className="mt-4">
          <Card className="border-transparent card-elevated mb-4">
            <CardContent className="p-4">
              <Textarea value={wishContent} onChange={e => setWishContent(e.target.value)} placeholder="Send words of encouragement..." rows={2} className="mb-3" />
              <Button variant="coral" size="sm" onClick={() => {
                if (!wishContent.trim() || !activeGroupId) return;
                createPost.mutate({ group_id: activeGroupId, content: wishContent, type: "wish" }, {
                  onSuccess: () => { setWishContent(""); toast({ title: "Wish sent! 💛" }); },
                });
              }} disabled={!wishContent.trim() || createPost.isPending}><Star className="h-3.5 w-3.5 mr-1" /> Send Wish</Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {(wishes || []).map((w: any) => (
              <Card key={w.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-warning" />
                    <span className="font-medium text-sm text-foreground">{w.author?.full_name || "Someone"}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(w.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                    <PostActions post={w} />
                  </div>
                  <p className="text-sm text-muted-foreground">{w.content}</p>
                </CardContent>
              </Card>
            ))}
            {(wishes || []).length === 0 && <p className="text-center py-12 text-muted-foreground">No well wishes yet. Be the first!</p>}
          </div>
        </TabsContent>

        {/* ═══ MEMBERS ═══ */}
        <TabsContent value="members" className="mt-4">
          {/* Invite section (admin only) */}
          {isAdmin && (
            <Card className="border-transparent card-elevated mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Invite Members</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex gap-2">
                  <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Enter email address to invite..." className="flex-1" />
                  <Button variant="coral" onClick={handleInvite} disabled={!inviteEmail.trim() || inviteToGroup.isPending}>
                    <Mail className="h-4 w-4 mr-1" /> Invite
                  </Button>
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

          {/* Pending Invitations */}
          {isAdmin && (pendingInvitations || []).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" /> Pending Invitations ({(pendingInvitations || []).length})
              </h3>
              <div className="space-y-2">
                {(pendingInvitations || []).map((inv: any) => (
                  <Card key={inv.id} className="border-transparent card-elevated border-l-4 border-l-warning">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{inv.invitee_email || inv.invited_email || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">Invited {new Date(inv.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => cancelInvitation.mutate(inv.id)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Member Categories (admin only) */}
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
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="teal">Teal</SelectItem>
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
                      <Tag className="h-3 w-3" />
                      {cat.name}
                      <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => deleteCategory.mutate(cat.id)}>
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No categories yet. Create sub-groups like "Medical Team" or "Night Shift" to organize members.</p>
              )}
            </div>
          )}

          {/* Active Members */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Active Members ({(members || []).length})
            </h3>
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
                      {isAdmin && m.user_id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
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
                              <DropdownMenuItem className="text-destructive" onClick={() => {
                                removeMember.mutate(m.id, { onSuccess: () => toast({ title: "Member removed" }) });
                              }}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove from Group
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {m.user_id === user?.id && <Badge variant="outline" className="text-[10px]">You</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ═══ GALLERY ═══ */}
        <TabsContent value="gallery" className="mt-4">
          {/* Upload form */}
          <Card className="border-transparent card-elevated mb-4">
            <CardContent className="p-4">
              <GalleryUploadForm groupId={activeGroupId!} />
            </CardContent>
          </Card>
          {(gallery || []).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(gallery || []).map((img: any) => (
                <Card key={img.id} className="border-transparent card-elevated overflow-hidden group relative">
                  <img src={img.image_url} alt={img.caption || ""} className="w-full aspect-square object-cover" />
                  <button
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={async () => {
                      try {
                        const { careDb: db } = await import("@/integrations/supabase/external-client");
                        await db.from("care_group_gallery").delete().eq("id", img.id);
                        toast({ title: "Photo removed" });
                        qc.invalidateQueries({ queryKey: ["care-group-gallery"] });
                      } catch (e: any) {
                        toast({ title: "Failed to remove", description: e.message, variant: "destructive" });
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {img.caption && <CardContent className="p-2"><p className="text-xs text-muted-foreground truncate">{img.caption}</p></CardContent>}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No photos yet. Add an image URL above!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Check-Ins Sub-component ────────────────────────────────
function CheckInsTab({ groupCaredOnes, activeGroupId }: { groupCaredOnes: any[]; activeGroupId: string | null }) {
  const { toast } = useToast();
  const [selectedCaredOne, setSelectedCaredOne] = useState<string | null>(null);
  const activeCOId = selectedCaredOne || (groupCaredOnes.length > 0 ? groupCaredOnes[0].user_id : null);
  const { data: logs } = useCheckinLogs(activeCOId);
  const createCheckin = useCreateCheckinLog();
  const [form, setForm] = useState({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" });

  const handleSubmit = () => {
    if (!activeCOId) return;
    createCheckin.mutate({ user_id: activeCOId, ...form, energy_level: Number(form.energy_level), pain_level: Number(form.pain_level), sleep_hours: Number(form.sleep_hours) }, {
      onSuccess: () => { setForm({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" }); toast({ title: "Check-in recorded" }); },
    });
  };

  if (groupCaredOnes.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground mb-2">No cared ones to check in on.</p>
        <p className="text-sm text-muted-foreground">Go to the <strong>Cared Ones</strong> tab and add one first.</p>
      </div>
    );
  }

  const moodEmoji: Record<string, string> = { great: "😊", good: "🙂", okay: "😐", poor: "😟", bad: "😢" };

  return (
    <div>
      {groupCaredOnes.length > 1 && (
        <div className="flex gap-2 mb-4">
          {groupCaredOnes.map((co: any) => (
            <Badge key={co.user_id} variant={activeCOId === co.user_id ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCaredOne(co.user_id)}>{co.profile?.full_name || "Cared One"}</Badge>
          ))}
        </div>
      )}
      <Card className="border-transparent card-elevated mb-4">
        <CardHeader><CardTitle className="text-base">New Check-In for {groupCaredOnes.find((co: any) => co.user_id === activeCOId)?.profile?.full_name || "Cared One"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><Label className="text-xs">Mood</Label>
              <Select value={form.mood} onValueChange={v => setForm(p => ({ ...p, mood: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["great", "good", "okay", "poor", "bad"].map(m => <SelectItem key={m} value={m}>{moodEmoji[m]} {m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Energy (1-10)</Label><Input type="number" min={1} max={10} value={form.energy_level} onChange={e => setForm(p => ({ ...p, energy_level: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label className="text-xs">Pain (0-10)</Label><Input type="number" min={0} max={10} value={form.pain_level} onChange={e => setForm(p => ({ ...p, pain_level: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label className="text-xs">Sleep (hrs)</Label><Input type="number" min={0} max={24} step={0.5} value={form.sleep_hours} onChange={e => setForm(p => ({ ...p, sleep_hours: parseFloat(e.target.value) || 0 }))} /></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Any observations..." /></div>
          <Button variant="coral" size="sm" onClick={handleSubmit} disabled={createCheckin.isPending}>Record Check-In</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {(logs || []).map((l: any) => (
          <Card key={l.id} className="border-transparent card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{moodEmoji[l.mood] || "🙂"} {l.mood || "Check-in"}</span>
                <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {l.energy_level != null && <span>Energy: {l.energy_level}/10</span>}
                {l.pain_level != null && <span>Pain: {l.pain_level}/10</span>}
                {l.sleep_hours != null && <span>Sleep: {l.sleep_hours}h</span>}
              </div>
              {l.note && <p className="text-sm text-muted-foreground mt-1">{l.note}</p>}
              {l.reporter && <p className="text-xs text-muted-foreground mt-1">by {l.reporter.full_name}</p>}
            </CardContent>
          </Card>
        ))}
        {(logs || []).length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No check-ins yet</p>}
      </div>
    </div>
  );
}

// ─── Gallery Upload Form ─────────────────────────────────────
function GalleryUploadForm({ groupId }: { groupId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!url.trim() || !groupId || !user?.id) return;
    setSaving(true);
    try {
      const { careDb } = await import("@/integrations/supabase/external-client");
      const { error } = await careDb.from("care_group_gallery").insert({
        group_id: groupId,
        image_url: url.trim(),
        caption: caption.trim() || null,
        uploaded_by: user.id,
      });
      if (error) throw error;
      setUrl(""); setCaption("");
      toast({ title: "Photo added!" });
      qc.invalidateQueries({ queryKey: ["care-group-gallery"] });
    } catch (e: any) {
      toast({ title: "Failed to add photo", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Add a Photo</p>
      <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Image URL (e.g. https://...)" />
      <div className="flex gap-2">
        <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" className="flex-1" />
        <Button size="sm" variant="coral" onClick={handleAdd} disabled={saving || !url.trim()}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
        </Button>
      </div>
    </div>
  );
}
