import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, Plus, Loader2, Home, CalendarDays, Megaphone, Heart,
  ClipboardCheck, MessageSquare, Star, Image, Settings, ListTodo, KeyRound,
} from "lucide-react";
import {
  useCareGroups, useCreateCareGroup, useCareGroupMembers, useCareTasks, useCreateTask, useUpdateTaskStatus,
  useCareGroupPosts, useCreateGroupPost, useUpdateGroupPost, useDeleteGroupPost,
  useCareGroupGallery, useGroupCaredOnes,
  useGroupMessages, useSendMessage,
  useInviteToGroup, useUpdateMemberRole, useRemoveGroupMember,
  useUpdateCareGroup, useDeleteCareGroup, useJoinGroupByCode,
  useGroupInvitations, useCancelInvitation,
  useMemberCategories, useCreateMemberCategory, useDeleteMemberCategory,
  useDeleteTask, useLeaveGroup, useCreateJobPosting,
} from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/hooks/use-toast";

// Sub-components
import { GroupSettingsDialog, EditPostDialog, AddCaredOneDialog } from "@/components/care-circle/GroupDialogs";
import { HomeTab } from "@/components/care-circle/tabs/HomeTab";
import { CalendarTab } from "@/components/care-circle/tabs/CalendarTab";
import { AnnouncementsTab } from "@/components/care-circle/tabs/AnnouncementsTab";
import { TasksTab } from "@/components/care-circle/tabs/TasksTab";
import { CaredOnesTab } from "@/components/care-circle/tabs/CaredOnesTab";
import { CheckInsTab } from "@/components/care-circle/tabs/CheckInsTab";
import { MessagesTab } from "@/components/care-circle/tabs/MessagesTab";
import { WishesTab } from "@/components/care-circle/tabs/WishesTab";
import { MembersTab } from "@/components/care-circle/tabs/MembersTab";
import { GalleryTab } from "@/components/care-circle/tabs/GalleryTab";

export default function CareCircle() {
  const { toast } = useToast();
  const site = useSite();
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
  const [editingPost, setEditingPost] = useState<any>(null);
  const [addCaredOneOpen, setAddCaredOneOpen] = useState(false);

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
  const createCategory = useCreateMemberCategory();
  const deleteCategory = useDeleteMemberCategory();
  const leaveGroup = useLeaveGroup();
  const createJob = useCreateJobPosting();

  const currentMember = (members || []).find((m: any) => m.user_id === user?.id);
  const isAdmin = currentMember?.is_owner || currentMember?.is_admin;
  const isOwner = currentMember?.is_owner;

  const pendingTasks = (tasks || []).filter((t: any) => t.status !== "completed");

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroup.mutate({ name: newGroupName, description: newGroupDesc || undefined }, {
      onSuccess: () => { setNewGroupName(""); setNewGroupDesc(""); setCreateGroupOpen(false); toast({ title: `${site.careGroupSingular} created!` }); },
    });
  };

  const handleJoinByCode = () => {
    if (!joinCode.trim()) return;
    joinGroupByCode.mutate(joinCode, {
      onSuccess: () => { setJoinCode(""); setJoinCodeOpen(false); toast({ title: "Joined group successfully!" }); },
      onError: (err: any) => toast({ title: "Failed to join", description: err.message, variant: "destructive" }),
    });
  };

  const handleLeaveGroup = () => {
    if (!activeGroupId || !user?.id) return;
    leaveGroup.mutate({ groupId: activeGroupId, userId: user.id }, {
      onSuccess: () => { setSelectedGroupId(null); toast({ title: "Left group" }); },
      onError: (err: any) => toast({ title: "Cannot leave", description: err.message, variant: "destructive" }),
    });
  };

  const handleTogglePin = (post: any) => {
    updatePost.mutate({ id: post.id, updates: { is_pinned: !post.is_pinned } }, {
      onSuccess: () => toast({ title: post.is_pinned ? "Unpinned" : "Pinned!" }),
    });
  };

  const handleDeletePost = (postId: string) => {
    deletePost.mutate(postId, { onSuccess: () => toast({ title: "Post deleted" }) });
  };

  if (groupsLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  // Empty state
  if (!groups || groups.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">No {site.navLabels.careGroups} Yet</h1>
        <p className="text-muted-foreground mb-6">Create a {site.careGroupSingular.toLowerCase()} or join one with a code.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild><Button variant="coral"><Plus className="h-4 w-4 mr-2" /> Create {site.careGroupSingular}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create {site.careGroupSingular}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Group Name *</Label><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder={site.id === "challenged" ? "e.g. Dad's Dementia Team" : "e.g. Mom's Care Team"} /></div>
                <div><Label>Description</Label><Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="What is this group for?" /></div>
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
            <DialogTrigger asChild><Button variant="outline"><KeyRound className="h-4 w-4 mr-2" /> Join with Code</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Join {site.careGroupSingular}</DialogTitle></DialogHeader>
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{site.navLabels.careGroups}</h1>
          <p className="text-sm text-muted-foreground">Coordinate care with your team</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} title="Group Settings"><Settings className="h-4 w-4" /></Button>
          )}
          <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><KeyRound className="h-4 w-4 mr-1" /> Join</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Join {site.careGroupSingular}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Join Code</Label><Input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter group code (e.g. ABC123)" className="uppercase" /></div>
                <Button variant="coral" className="w-full" onClick={handleJoinByCode} disabled={joinGroupByCode.isPending || !joinCode.trim()}>Join Group</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> New Group</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create {site.careGroupSingular}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Group Name *</Label><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder={site.id === "challenged" ? "e.g. Dad's Dementia Team" : "e.g. Mom's Care Team"} /></div>
                <div><Label>Description</Label><Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="What is this group for?" /></div>
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dialogs */}
      <GroupSettingsDialog
        open={settingsOpen} onOpenChange={setSettingsOpen}
        activeGroup={activeGroup} activeGroupId={activeGroupId}
        isOwner={!!isOwner} updateGroup={updateGroup} deleteGroup={deleteGroup}
        onDeleteSuccess={() => setSelectedGroupId(null)} onLeaveGroup={handleLeaveGroup}
      />
      <EditPostDialog post={editingPost} onClose={() => setEditingPost(null)} updatePost={updatePost} />
      <AddCaredOneDialog open={addCaredOneOpen} onOpenChange={setAddCaredOneOpen} activeGroupId={activeGroupId} />

      {/* Group selector */}
      {groups.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {groups.map((g: any) => (
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
            <TabsTrigger value="cared-ones" className="gap-1.5 text-xs"><Heart className="h-3.5 w-3.5" /> {site.navLabels.caredOnes}</TabsTrigger>
            <TabsTrigger value="checkins" className="gap-1.5 text-xs"><ClipboardCheck className="h-3.5 w-3.5" /> Check-Ins</TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" /> Messages</TabsTrigger>
            <TabsTrigger value="wishes" className="gap-1.5 text-xs"><Star className="h-3.5 w-3.5" /> Well Wishes</TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Members</TabsTrigger>
            <TabsTrigger value="gallery" className="gap-1.5 text-xs"><Image className="h-3.5 w-3.5" /> Gallery</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="home" className="mt-4">
          <HomeTab
            pendingTasksCount={pendingTasks.length} membersCount={(members || []).length} caredOnesCount={(groupCaredOnes || []).length}
            allPosts={allPosts || []} activeGroupId={activeGroupId} userId={user?.id} isAdmin={!!isAdmin}
            memberCategories={memberCategories || []} createPost={createPost}
            onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <CalendarTab tasks={tasks || []} />
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <AnnouncementsTab
            announcements={announcements || []} activeGroupId={activeGroupId} userId={user?.id} isAdmin={!!isAdmin}
            memberCategories={memberCategories || []} createPost={createPost}
            onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost}
          />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <TasksTab
            tasks={tasks || []} tasksLoading={tasksLoading} members={members || []}
            activeGroupId={activeGroupId} userId={user?.id} isAdmin={!!isAdmin}
            memberCategories={memberCategories || []} createTask={createTask}
            updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} createJob={createJob}
          />
        </TabsContent>

        <TabsContent value="cared-ones" className="mt-4">
          <CaredOnesTab groupCaredOnes={groupCaredOnes || []} isAdmin={!!isAdmin} onAddCaredOne={() => setAddCaredOneOpen(true)} />
        </TabsContent>

        <TabsContent value="checkins" className="mt-4">
          <CheckInsTab groupCaredOnes={groupCaredOnes || []} activeGroupId={activeGroupId} />
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <MessagesTab groupMessages={groupMessages || []} userId={user?.id} activeGroupId={activeGroupId} sendMessage={sendMessage} />
        </TabsContent>

        <TabsContent value="wishes" className="mt-4">
          <WishesTab
            wishes={wishes || []} activeGroupId={activeGroupId} userId={user?.id} isAdmin={!!isAdmin}
            createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MembersTab
            members={members || []} activeGroup={activeGroup} activeGroupId={activeGroupId}
            userId={user?.id} isAdmin={!!isAdmin} isOwner={!!isOwner} currentMember={currentMember}
            pendingInvitations={pendingInvitations || []} memberCategories={memberCategories || []}
            inviteToGroup={inviteToGroup} updateRole={updateRole} removeMember={removeMember}
            cancelInvitation={cancelInvitation} createCategory={createCategory} deleteCategory={deleteCategory}
          />
        </TabsContent>

        <TabsContent value="gallery" className="mt-4">
          <GalleryTab gallery={gallery || []} activeGroupId={activeGroupId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
